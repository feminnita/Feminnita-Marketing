import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { adCreatives } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { requestCreative, requestCreativeVariants, listDriveReferenceFiles, chatWithBeatriz } from "../agents/creative-agent";
import { executeMetaAction } from "../agents/fernanda-executor";
import { isDriveConfigured } from "../services/googleDrive";

export const creativeAdsRouter = router({
  // Fernanda (ou usuário) solicita um novo criativo
  request: protectedProcedure
    .input(z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      campaignType: z.string().optional(),
      targetAudience: z.string().optional(),
      product: z.string().optional(),
      colorPalette: z.string().optional(),
      textOverlay: z.string().optional(),
      referenceFileId: z.string().optional(),
      campaignId: z.string().optional(),
      adSetId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const result = await requestCreative(ctx.user.id, input);
      return result;
    }),

  // Usuário envia foto → Fernanda decide campanha + briefia → Beatriz gera 3 variantes
  requestFromImage: protectedProcedure
    .input(z.object({
      imageBase64: z.string().min(1),
      notes: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const date = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
      const title = `Criativo — ${date}`;

      // fire-and-forget: Fernanda decide a campanha no brief estratégico
      requestCreativeVariants(ctx.user.id, {
        title,
        description: input.notes ?? "",
        campaignType: "prospeccao", // default; Fernanda sobrescreve no brief
        targetAudience: "revendedoras autônomas — mulheres que querem renda extra de casa, sem estoque",
        product: "Pijama Suede Feminnita",
        imageBase64Input: input.imageBase64,
      }).catch((err: any) => console.error("[requestFromImage] falhou:", err.message));

      return { success: true };
    }),

  // Listar todos os criativos do usuário
  list: protectedProcedure
    .input(z.object({
      status: z.enum([
        "pending_generation", "generated", "pending_approval",
        "approved", "rejected", "uploading", "executed", "failed",
      ]).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions = [eq(adCreatives.userId, ctx.user.id)];
      if (input?.status) conditions.push(eq(adCreatives.status, input.status));
      return db.select({
        id: adCreatives.id,
        briefTitle: adCreatives.briefTitle,
        campaignType: adCreatives.campaignType,
        product: adCreatives.product,
        textOverlay: adCreatives.textOverlay,
        generatedHeadline: adCreatives.generatedHeadline,
        generatedBody: adCreatives.generatedBody,
        canvaCopy: adCreatives.canvaCopy,
        status: adCreatives.status,
        imageUrl: adCreatives.imageUrl,
        imageHash: adCreatives.imageHash,
        metaAdId: adCreatives.metaAdId,
        rejectionReason: adCreatives.rejectionReason,
        errorMessage: adCreatives.errorMessage,
        createdAt: adCreatives.createdAt,
        updatedAt: adCreatives.updatedAt,
      }).from(adCreatives)
        .where(and(...conditions))
        .orderBy(desc(adCreatives.createdAt))
        .limit(50);
    }),

  // Buscar um criativo completo (inclui imageBase64)
  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;
      const rows = await db.select().from(adCreatives)
        .where(and(eq(adCreatives.id, input.id), eq(adCreatives.userId, ctx.user.id)))
        .limit(1);
      return rows[0] ?? null;
    }),

  // Usuário aprova o criativo
  approve: protectedProcedure
    .input(z.object({
      id: z.number(),
      campaignId: z.string().optional(),
      adSetId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");

      const rows = await db.select().from(adCreatives)
        .where(and(eq(adCreatives.id, input.id), eq(adCreatives.userId, ctx.user.id)))
        .limit(1);
      if (!rows[0]) throw new Error("Criativo não encontrado");

      const creative = rows[0];
      const updates: Partial<typeof adCreatives.$inferInsert> = {
        status: "approved",
        updatedAt: new Date(),
      };
      if (input.campaignId) updates.campaignId = input.campaignId;
      if (input.adSetId) updates.adSetId = input.adSetId;

      await db.update(adCreatives).set(updates).where(eq(adCreatives.id, input.id));
      return { success: true, message: "Criativo aprovado! Clique em Executar para criar o anúncio no Meta." };
    }),

  // Usuário deleta o criativo
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");
      await db.delete(adCreatives)
        .where(and(eq(adCreatives.id, input.id), eq(adCreatives.userId, ctx.user.id)));
      return { success: true };
    }),

  // Usuário rejeita o criativo
  reject: protectedProcedure
    .input(z.object({
      id: z.number(),
      reason: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");

      await db.update(adCreatives).set({
        status: "rejected",
        rejectionReason: input.reason,
        updatedAt: new Date(),
      }).where(and(eq(adCreatives.id, input.id), eq(adCreatives.userId, ctx.user.id)));

      return { success: true };
    }),

  // Executa criativo aprovado: faz upload da imagem → Meta e cria o anúncio
  execute: protectedProcedure
    .input(z.object({
      id: z.number(),
      linkUrl: z.string().optional(),
      callToAction: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database não disponível");

      const rows = await db.select().from(adCreatives)
        .where(and(eq(adCreatives.id, input.id), eq(adCreatives.userId, ctx.user.id)))
        .limit(1);
      if (!rows[0]) throw new Error("Criativo não encontrado");

      const creative = rows[0];
      if (creative.status !== "approved") throw new Error("Criativo precisa estar aprovado antes de executar");
      if (!creative.imageBase64) throw new Error("Criativo não tem imagem gerada");
      if (!creative.campaignId || !creative.adSetId) {
        throw new Error("Defina campaignId e adSetId antes de executar");
      }

      await db.update(adCreatives).set({ status: "uploading", updatedAt: new Date() })
        .where(eq(adCreatives.id, input.id));

      try {
        // Monta uma data URL para o executor baixar e fazer upload
        const imageDataUrl = `data:image/png;base64,${creative.imageBase64}`;

        // Cria anúncio completo na Meta via Fernanda Executor
        const resultMsg = await executeMetaAction("meta_create_full_ad", {
          campaignId: creative.campaignId,
          adSetId: creative.adSetId,
          adName: creative.briefTitle,
          imageUrl: imageDataUrl,  // executor converte base64 → upload
          title: creative.generatedHeadline || creative.briefTitle,
          body: creative.generatedBody || creative.briefDescription,
          linkUrl: input.linkUrl || "https://www.feminnita.com.br",
          callToAction: input.callToAction || "SHOP_NOW",
        });

        // Extrai o Ad ID da mensagem de retorno
        const adIdMatch = resultMsg.match(/ID:\s*(\d+)/);
        const metaAdId = adIdMatch?.[1];

        await db.update(adCreatives).set({
          status: "executed",
          metaAdId: metaAdId,
          updatedAt: new Date(),
        }).where(eq(adCreatives.id, input.id));

        return { success: true, message: resultMsg, metaAdId };
      } catch (err: any) {
        await db.update(adCreatives).set({
          status: "failed",
          errorMessage: err.message,
          updatedAt: new Date(),
        }).where(eq(adCreatives.id, input.id));
        throw new Error(`Falha ao executar criativo: ${err.message}`);
      }
    }),

  // Listar arquivos de referência disponíveis no Drive
  listDriveFiles: protectedProcedure.query(async () => {
    return listDriveReferenceFiles();
  }),

  // Status da integração Drive + Meta
  status: protectedProcedure.query(async () => {
    const metaToken = process.env.META_SYSTEM_USER_TOKEN || process.env.META_ACCESS_TOKEN;
    return {
      driveConnected: isDriveConfigured(),
      metaSystemUserToken: !!process.env.META_SYSTEM_USER_TOKEN,
      metaToken: !!metaToken,
      artesFolder: process.env.GOOGLE_DRIVE_ARTES_FOLDER || "17-n_9HAqa69yqF7EOKOJ9wTptHfJn47D",
      referenceFolder: process.env.GOOGLE_DRIVE_REFERENCE_FOLDER || null,
    };
  }),

  // Verifica permissões do token Meta atual
  checkMetaPermissions: protectedProcedure.query(async () => {
    const token = process.env.META_SYSTEM_USER_TOKEN || process.env.META_ACCESS_TOKEN;
    if (!token) return { ok: false, permissions: [], missing: ["token não configurado"] };

    try {
      const res = await fetch(
        `https://graph.facebook.com/v20.0/me/permissions?access_token=${token}`,
      );
      const data = await res.json() as any;
      if (data.error) {
        return { ok: false, permissions: [], missing: [], error: data.error.message };
      }

      const granted = (data.data as any[])
        .filter(p => p.status === "granted")
        .map(p => p.permission as string);

      const required = ["ads_management", "ads_read", "pages_manage_ads", "pages_read_engagement"];
      const missing = required.filter(r => !granted.includes(r));

      return {
        ok: missing.length === 0,
        permissions: granted,
        missing,
        usingSystemUserToken: !!process.env.META_SYSTEM_USER_TOKEN,
        hint: missing.length > 0
          ? "Para acesso total: crie um System User Admin no Meta Business Manager, adicione à conta de anúncios como Advertiser, e gere um token com ads_management + ads_read."
          : "Token com todas as permissões necessárias!",
      };
    } catch (err: any) {
      return { ok: false, permissions: [], missing: [], error: err.message };
    }
  }),

  // Chat direto com a Beatriz
  chat: protectedProcedure
    .input(z.object({
      messages: z.array(z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })).min(1).max(50),
    }))
    .mutation(async ({ ctx, input }) => {
      const reply = await chatWithBeatriz(input.messages, ctx.user?.name ?? undefined);
      return { reply };
    }),
});
