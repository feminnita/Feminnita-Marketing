import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { videoPlans, imageJobs } from "../../drizzle/schema";
import { eq, and, gte, count } from "drizzle-orm";

const MINIMAX_BASE = "https://api.minimax.io/v1";

// ── Quota helpers ─────────────────────────────────────────────────────────────
async function getOrCreatePlan(userId: number, db: any) {
  const rows = await db.select().from(videoPlans).where(eq(videoPlans.userId, userId)).limit(1);
  if (rows.length > 0) return rows[0];
  await db.insert(videoPlans).values({
    userId,
    livreMonthlyLimit: 30,
    runningUpMonthlyLimit: 30,
    imageMonthlyLimit: 50,
    livreExtraCredits: 0,
    runningUpExtraCredits: 0,
    imageExtraCredits: 0,
  });
  const newRows = await db.select().from(videoPlans).where(eq(videoPlans.userId, userId)).limit(1);
  return newRows[0];
}

async function getImageMonthCount(userId: number, db: any): Promise<number> {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const rows = await db.select({ cnt: count() }).from(imageJobs).where(
    and(eq(imageJobs.userId, userId), gte(imageJobs.createdAt, monthStart))
  );
  return Number(rows[0]?.cnt ?? 0);
}

async function assertImageQuota(userId: number, db: any) {
  const plan = await getOrCreatePlan(userId, db);
  const used = await getImageMonthCount(userId, db);
  const limit = plan.imageMonthlyLimit + plan.imageExtraCredits;
  if (used >= limit) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Quota de imagens esgotada: ${used}/${limit} este mês. Adquira créditos adicionais.`,
    });
  }
}

// Faz upload de uma imagem base64 para a MiniMax Files API e retorna o file_id
async function uploadReferenceImage(apiKey: string, base64: string, mimeType: string): Promise<string> {
  const buffer = Buffer.from(base64, "base64");
  const ext = mimeType.split("/")[1] || "jpg";
  const blob = new Blob([buffer], { type: mimeType });
  const form = new FormData();
  form.append("purpose", "retrieval");
  form.append("file", blob, `reference.${ext}`);

  const res = await fetch(`${MINIMAX_BASE}/files/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal: AbortSignal.timeout(30000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Falha ao fazer upload da imagem de referência: ${text.slice(0, 200)}`);
  }

  const data = await res.json() as any;
  const fileId = data.file?.file_id;
  if (!fileId) throw new Error("MiniMax não retornou file_id após upload.");
  return fileId;
}

export const hailuoImageRouter = router({
  generate: protectedProcedure
    .input(z.object({
      prompt: z.string().min(1).max(1500),
      aspectRatio: z.enum(["1:1", "16:9", "9:16", "4:3", "3:4", "3:2", "2:3", "21:9"]).default("1:1"),
      n: z.number().min(1).max(4).default(1),
      quality: z.enum(["1024", "2048", "4096"]).default("1024"),
      referenceImage: z.object({
        base64: z.string(),
        mimeType: z.string(),
      }).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (db) await assertImageQuota(ctx.user.id, db);

      const apiKey = process.env.MINIMAX_API_KEY;
      if (!apiKey) throw new Error("MINIMAX_API_KEY não configurado no servidor. Adicione a chave em Configurações → Integrações.");

      let subjectReference: any[] | undefined;
      if (input.referenceImage) {
        const fileId = await uploadReferenceImage(apiKey, input.referenceImage.base64, input.referenceImage.mimeType);
        subjectReference = [{ type: "character", image_file: { file_id: fileId } }];
      }

      const res = await fetch(`${MINIMAX_BASE}/image_generation`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "image-01",
          prompt: input.prompt,
          aspect_ratio: input.aspectRatio,
          response_format: "url",
          n: input.n,
          prompt_optimizer: true,
          resolution: input.quality,
          ...(subjectReference ? { subject_reference: subjectReference } : {}),
        }),
        signal: AbortSignal.timeout(90000),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Hailuo API erro ${res.status}: ${text.slice(0, 200)}`);
      }

      const data = await res.json() as any;

      if (data.base_resp?.status_code !== 0) {
        const msg = data.base_resp?.status_msg || "Erro desconhecido";
        if (data.base_resp?.status_code === 1008) throw new Error("Saldo insuficiente na conta Hailuo/MiniMax.");
        if (data.base_resp?.status_code === 1002) throw new Error("Rate limit atingido. Tente novamente em instantes.");
        throw new Error(`Hailuo: ${msg}`);
      }

      const images: string[] = (data.data || []).map((img: any) => img.url as string).filter(Boolean);

      if (db && images.length > 0) {
        await db.insert(imageJobs).values({
          userId: ctx.user.id,
          jobId: `img-${Date.now()}`,
          status: "completed",
          createdAt: new Date(),
        }).catch(() => null);
      }

      return { images };
    }),

  checkKey: protectedProcedure.query(() => {
    return { configured: !!process.env.MINIMAX_API_KEY };
  }),

  getQuota: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { used: 0, limit: 50, extra: 0 };
    const plan = await getOrCreatePlan(ctx.user.id, db);
    const used = await getImageMonthCount(ctx.user.id, db);
    return {
      used,
      limit: plan.imageMonthlyLimit,
      extra: plan.imageExtraCredits,
    };
  }),

  adminAddCredits: protectedProcedure
    .input(z.object({
      userId: z.number().int(),
      credits: z.number().int().min(1).max(10000),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new Error("DB não disponível");
      const plan = await getOrCreatePlan(input.userId, db);
      await db.update(videoPlans)
        .set({ imageExtraCredits: plan.imageExtraCredits + input.credits })
        .where(eq(videoPlans.userId, input.userId));
      return { ok: true };
    }),
});
