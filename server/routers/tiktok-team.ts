import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { tiktokTeamEvaluations, tiktokTeamMessages, tiktokVideos } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { runLunaEvaluation, chatWithLuna } from "../agents/tiktok-luna-agent";
import { runMayaEvaluation, chatWithMaya } from "../agents/tiktok-maya-agent";
import { runZaraEvaluation, chatWithZara } from "../agents/tiktok-zara-agent";
import { runNinaEvaluation, chatWithNina } from "../agents/tiktok-nina-agent";
import { runMarcelaEvaluation, chatWithMarcela } from "../agents/tiktok-marcela-agent";

const AGENT_TYPE = z.enum(["luna", "maya", "zara", "nina", "marcela"]);
const ACCOUNT_TYPE = z.enum(["feminnita", "fnt"]);
type AgentType = z.infer<typeof AGENT_TYPE>;
type AccountType = z.infer<typeof ACCOUNT_TYPE>;

async function runEvaluation(agentType: AgentType, evaluationId: number, account: AccountType): Promise<void> {
  switch (agentType) {
    case "luna": return runLunaEvaluation(evaluationId, account);
    case "maya": return runMayaEvaluation(evaluationId, account);
    case "zara": return runZaraEvaluation(evaluationId, account);
    case "nina": return runNinaEvaluation(evaluationId, account);
    case "marcela": return runMarcelaEvaluation(evaluationId, account);
  }
}

async function chatWithAgent(agentType: AgentType, history: Array<{ role: "user" | "assistant"; content: string }>): Promise<string> {
  switch (agentType) {
    case "luna": return chatWithLuna(history);
    case "maya": return chatWithMaya(history);
    case "zara": return chatWithZara(history);
    case "nina": return chatWithNina(history);
    case "marcela": return chatWithMarcela(history);
  }
}

export const tiktokTeamRouter = router({
  triggerEvaluation: protectedProcedure
    .input(z.object({ agentType: AGENT_TYPE, account: ACCOUNT_TYPE.default("feminnita") }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const result = await db.insert(tiktokTeamEvaluations).values({
        userId: ctx.user.id,
        account: input.account,
        agentType: input.agentType,
        status: "pending",
        triggeredAt: new Date(),
        createdAt: new Date(),
      });

      const evaluationId = (result as any).insertId;

      runEvaluation(input.agentType, evaluationId, input.account).catch((err) =>
        console.error(`[TikTokTeam:${input.agentType}] Erro:`, err)
      );

      return { evaluationId, status: "pending" };
    }),

  getEvaluation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const rows = await db
        .select()
        .from(tiktokTeamEvaluations)
        .where(and(eq(tiktokTeamEvaluations.id, input.id), eq(tiktokTeamEvaluations.userId, ctx.user.id)));

      if (!rows.length) throw new Error("Avaliação não encontrada");

      const ev = rows[0];
      return {
        ...ev,
        recommendations: ev.recommendations ? JSON.parse(ev.recommendations) : [],
        creativeBriefs: ev.creativeBriefs ? JSON.parse(ev.creativeBriefs) : [],
      };
    }),

  listEvaluations: protectedProcedure
    .input(z.object({ agentType: AGENT_TYPE, account: ACCOUNT_TYPE.default("feminnita") }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      return db
        .select({
          id: tiktokTeamEvaluations.id,
          agentType: tiktokTeamEvaluations.agentType,
          account: tiktokTeamEvaluations.account,
          status: tiktokTeamEvaluations.status,
          summary: tiktokTeamEvaluations.summary,
          triggeredAt: tiktokTeamEvaluations.triggeredAt,
          completedAt: tiktokTeamEvaluations.completedAt,
        })
        .from(tiktokTeamEvaluations)
        .where(and(
          eq(tiktokTeamEvaluations.userId, ctx.user.id),
          eq(tiktokTeamEvaluations.agentType, input.agentType),
          eq(tiktokTeamEvaluations.account, input.account)
        ))
        .orderBy(desc(tiktokTeamEvaluations.triggeredAt))
        .limit(5);
    }),

  sendMessage: protectedProcedure
    .input(z.object({ evaluationId: z.number(), message: z.string().min(1).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const evRows = await db
        .select()
        .from(tiktokTeamEvaluations)
        .where(and(eq(tiktokTeamEvaluations.id, input.evaluationId), eq(tiktokTeamEvaluations.userId, ctx.user.id)));

      if (!evRows.length) throw new Error("Avaliação não encontrada");

      await db.insert(tiktokTeamMessages).values({
        evaluationId: input.evaluationId,
        userId: ctx.user.id,
        role: "user",
        content: input.message,
        createdAt: new Date(),
      });

      const allMessages = await db
        .select()
        .from(tiktokTeamMessages)
        .where(eq(tiktokTeamMessages.evaluationId, input.evaluationId))
        .orderBy(tiktokTeamMessages.createdAt);

      const history = allMessages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
      const reply = await chatWithAgent(evRows[0].agentType as AgentType, history);

      await db.insert(tiktokTeamMessages).values({
        evaluationId: input.evaluationId,
        userId: ctx.user.id,
        role: "assistant",
        content: reply,
        createdAt: new Date(),
      });

      return { ok: true };
    }),

  getMessages: protectedProcedure
    .input(z.object({ evaluationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      return db
        .select()
        .from(tiktokTeamMessages)
        .where(eq(tiktokTeamMessages.evaluationId, input.evaluationId))
        .orderBy(tiktokTeamMessages.createdAt);
    }),

  // ── Vídeos ──────────────────────────────────────────────────────────────────

  listVideos: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(tiktokVideos)
      .where(eq(tiktokVideos.userId, ctx.user.id))
      .orderBy(desc(tiktokVideos.createdAt))
      .limit(50);
  }),

  saveVideo: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(300),
      description: z.string().max(2000).optional(),
      filePath: z.string().max(500),
      thumbnailPath: z.string().max(500).optional(),
      fileSize: z.number().optional(),
      durationSeconds: z.number().optional(),
      tags: z.string().max(500).optional(),
      source: z.enum(["uploaded", "generated"]).default("uploaded"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const result = await db.insert(tiktokVideos).values({
        userId: ctx.user.id,
        title: input.title,
        description: input.description,
        filePath: input.filePath,
        thumbnailPath: input.thumbnailPath,
        fileSize: input.fileSize,
        durationSeconds: input.durationSeconds,
        tags: input.tags,
        source: input.source,
        status: "ready",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      return { id: (result as any).insertId };
    }),

  deleteVideo: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      await db
        .delete(tiktokVideos)
        .where(and(eq(tiktokVideos.id, input.id), eq(tiktokVideos.userId, ctx.user.id)));

      return { ok: true };
    }),

  updateVideoStatus: protectedProcedure
    .input(z.object({ id: z.number(), status: z.enum(["draft", "ready", "scheduled", "published"]), scheduledAt: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      await db
        .update(tiktokVideos)
        .set({
          status: input.status,
          scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : undefined,
          updatedAt: new Date(),
        })
        .where(and(eq(tiktokVideos.id, input.id), eq(tiktokVideos.userId, ctx.user.id)));

      return { ok: true };
    }),

  generateVideo: protectedProcedure
    .input(z.object({
      title: z.string().min(1).max(300),
      imageUrls: z.array(z.string()).min(1).max(5),
      hookText: z.string().max(80).default(""),
      ctaText: z.string().max(80).default(""),
      durationPerImage: z.number().int().min(2).max(8).default(4),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const result = await db.insert(tiktokVideos).values({
        userId: ctx.user.id,
        title: input.title,
        source: "generated",
        status: "processing",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const videoId = (result as any).insertId;

      (async () => {
        try {
          const { generateVideoFromImages } = await import("../agents/video-generator");
          const url = await generateVideoFromImages({
            imageUrls: input.imageUrls,
            hookText: input.hookText,
            ctaText: input.ctaText,
            durationPerImage: input.durationPerImage,
          });

          await db.update(tiktokVideos).set({
            filePath: url,
            status: "ready",
            durationSeconds: input.imageUrls.length * input.durationPerImage,
            updatedAt: new Date(),
          }).where(eq(tiktokVideos.id, videoId));
        } catch (err: any) {
          console.error("[VideoGen] Erro:", err);
          await db.update(tiktokVideos).set({
            status: "error",
            description: String(err?.message || "Erro desconhecido").slice(0, 500),
            updatedAt: new Date(),
          }).where(eq(tiktokVideos.id, videoId));
        }
      })().catch(console.error);

      return { videoId, status: "processing" };
    }),
});
