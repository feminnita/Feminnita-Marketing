import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { shopeeAdsEvaluations, shopeeAdsEvaluationMessages } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  runShopeeAdsEvaluation,
  chatWithShopeeAgent,
  collectShopeeAdsData,
  updateShopeeKnowledge,
} from "../agents/shopee-ads-agent";

export const shopeeAdsManagerRouter = router({
  /**
   * Dispara nova avaliação Shopee Ads.
   */
  triggerEvaluation: protectedProcedure
    .input(z.object({ account: z.enum(["feminnita", "fnt"]).default("feminnita") }).optional())
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");
      const account = input?.account ?? "feminnita";
      const shopId = (account === "fnt" ? process.env.SHOPEE_SHOP_ID_2 : process.env.SHOPEE_SHOP_ID) || null;

      const result = await db.insert(shopeeAdsEvaluations).values({
        userId: ctx.user.id,
        account,
        shopId: shopId ?? undefined,
        status: "pending",
        triggeredAt: new Date(),
        createdAt: new Date(),
      });

      const evaluationId = Array.isArray(result) ? result[0].insertId : (result as any).insertId;

      runShopeeAdsEvaluation(evaluationId, account).catch((err) =>
        console.error("[ShopeeAdsManager] Erro em runShopeeAdsEvaluation:", err)
      );

      return { evaluationId, status: "pending" };
    }),

  /**
   * Busca estado de uma avaliação (polling).
   */
  getEvaluation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const rows = await db
        .select()
        .from(shopeeAdsEvaluations)
        .where(and(eq(shopeeAdsEvaluations.id, input.id), eq(shopeeAdsEvaluations.userId, ctx.user.id)));

      if (!rows.length) throw new Error("Avaliação não encontrada");

      const ev = rows[0];
      return {
        ...ev,
        rawMetrics: ev.rawMetrics ? JSON.parse(ev.rawMetrics) : null,
        recommendations: ev.recommendations ? JSON.parse(ev.recommendations) : [],
      };
    }),

  /**
   * Lista todas as avaliações do usuário.
   */
  listEvaluations: protectedProcedure
    .input(z.object({ account: z.enum(["feminnita", "fnt"]).default("feminnita") }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const account = input?.account ?? "feminnita";

      return db
        .select({
          id: shopeeAdsEvaluations.id,
          status: shopeeAdsEvaluations.status,
          summary: shopeeAdsEvaluations.summary,
          errorMessage: shopeeAdsEvaluations.errorMessage,
          triggeredAt: shopeeAdsEvaluations.triggeredAt,
          completedAt: shopeeAdsEvaluations.completedAt,
        })
        .from(shopeeAdsEvaluations)
        .where(and(eq(shopeeAdsEvaluations.userId, ctx.user.id), eq(shopeeAdsEvaluations.account, account)))
        .orderBy(desc(shopeeAdsEvaluations.triggeredAt))
        .limit(20);
    }),

  /**
   * Anúncios ao vivo da Shopee API.
   */
  listAds: protectedProcedure.query(async () => {
    const shopId = process.env.SHOPEE_SHOP_ID;
    if (!shopId) throw new Error("Conta Shopee não conectada");
    return collectShopeeAdsData();
  }),

  /**
   * Envia mensagem de follow-up para o agente Shopee.
   */
  sendMessage: protectedProcedure
    .input(z.object({
      evaluationId: z.number(),
      message: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const ev = await db
        .select()
        .from(shopeeAdsEvaluations)
        .where(and(eq(shopeeAdsEvaluations.id, input.evaluationId), eq(shopeeAdsEvaluations.userId, ctx.user.id)));

      if (!ev.length || ev[0].status !== "done") {
        throw new Error("Avaliação não encontrada ou ainda não concluída");
      }

      await db.insert(shopeeAdsEvaluationMessages).values({
        evaluationId: input.evaluationId,
        userId: ctx.user.id,
        role: "user",
        content: input.message,
        createdAt: new Date(),
      });

      const history = await db
        .select()
        .from(shopeeAdsEvaluationMessages)
        .where(eq(shopeeAdsEvaluationMessages.evaluationId, input.evaluationId))
        .orderBy(shopeeAdsEvaluationMessages.createdAt);

      const reply = await chatWithShopeeAgent(
        history.map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content })),
        ev[0].rawMetrics || "[]"
      );

      await db.insert(shopeeAdsEvaluationMessages).values({
        evaluationId: input.evaluationId,
        userId: ctx.user.id,
        role: "assistant",
        content: reply,
        createdAt: new Date(),
      });

      return { reply };
    }),

  /**
   * Lista mensagens de uma conversa.
   */
  getMessages: protectedProcedure
    .input(z.object({ evaluationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const ev = await db
        .select({ id: shopeeAdsEvaluations.id })
        .from(shopeeAdsEvaluations)
        .where(and(eq(shopeeAdsEvaluations.id, input.evaluationId), eq(shopeeAdsEvaluations.userId, ctx.user.id)));

      if (!ev.length) return [];

      return db
        .select()
        .from(shopeeAdsEvaluationMessages)
        .where(eq(shopeeAdsEvaluationMessages.evaluationId, input.evaluationId))
        .orderBy(shopeeAdsEvaluationMessages.createdAt);
    }),

  /**
   * Status da conexão Shopee OAuth.
   */
  getAuthStatus: protectedProcedure.query(() => {
    const shopId = process.env.SHOPEE_SHOP_ID;
    const accessToken = process.env.SHOPEE_ACCESS_TOKEN;
    const connected = !!(shopId && accessToken);
    return { connected, shopId: shopId || undefined };
  }),

  updateKnowledge: protectedProcedure.mutation(async () => {
    const summary = await updateShopeeKnowledge();
    return { ok: true, summary };
  }),
});
