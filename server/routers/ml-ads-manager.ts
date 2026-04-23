import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { mlAdsEvaluations, mlAdsEvaluationMessages } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  runMLAdsEvaluation,
  chatWithMLAgent,
  collectMLAdsData,
} from "../agents/ml-ads-agent";

export const mlAdsManagerRouter = router({
  /**
   * Retorna se a conta ML está conectada (token presente).
   */
  getAuthStatus: protectedProcedure
    .input(z.object({ account: z.enum(["feminnita", "fnt"]).default("feminnita") }).optional())
    .query(({ input }) => {
      const acc = input?.account ?? "feminnita";
      const token = acc === "fnt" ? process.env.ML_ACCESS_TOKEN_2 : process.env.ML_ACCESS_TOKEN_1;
      const userId = acc === "fnt" ? process.env.ML_USER_ID_2 : process.env.ML_USER_ID_1;
      return { connected: Boolean(token), userId: userId || undefined };
    }),

  /**
   * Dispara uma nova avaliação da conta ML Ads.
   */
  triggerEvaluation: protectedProcedure
    .input(z.object({ account: z.enum(["feminnita", "fnt"]).default("feminnita") }).optional())
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");
      const account = input?.account ?? "feminnita";

      const result = await db.insert(mlAdsEvaluations).values({
        userId: ctx.user.id,
        account,
        status: "pending",
        triggeredAt: new Date(),
        createdAt: new Date(),
      });

      const evaluationId =
        Array.isArray(result) ? result[0].insertId : (result as any).insertId;

      runMLAdsEvaluation(evaluationId, account).catch((err) =>
        console.error("[MLAdsManager] Erro em runMLAdsEvaluation:", err)
      );

      return { evaluationId, status: "pending" };
    }),

  /**
   * Busca o estado atual de uma avaliação específica (polling).
   */
  getEvaluation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const rows = await db
        .select()
        .from(mlAdsEvaluations)
        .where(
          and(
            eq(mlAdsEvaluations.id, input.id),
            eq(mlAdsEvaluations.userId, ctx.user.id)
          )
        );

      if (!rows.length) throw new Error("Avaliação não encontrada");

      const ev = rows[0];
      return {
        ...ev,
        rawMetrics: ev.rawMetrics ? JSON.parse(ev.rawMetrics) : null,
        recommendations: ev.recommendations
          ? JSON.parse(ev.recommendations)
          : [],
      };
    }),

  /**
   * Lista todas as avaliações do usuário (histórico).
   */
  listEvaluations: protectedProcedure
    .input(z.object({ account: z.enum(["feminnita", "fnt"]).default("feminnita") }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const account = input?.account ?? "feminnita";

      return db
        .select({
          id: mlAdsEvaluations.id,
          account: mlAdsEvaluations.account,
          status: mlAdsEvaluations.status,
          summary: mlAdsEvaluations.summary,
          errorMessage: mlAdsEvaluations.errorMessage,
          triggeredAt: mlAdsEvaluations.triggeredAt,
          completedAt: mlAdsEvaluations.completedAt,
        })
        .from(mlAdsEvaluations)
        .where(and(eq(mlAdsEvaluations.userId, ctx.user.id), eq(mlAdsEvaluations.account, account)))
        .orderBy(desc(mlAdsEvaluations.triggeredAt))
        .limit(10);
    }),

  /**
   * Busca campanhas ao vivo da ML Ads API.
   */
  listCampaigns: protectedProcedure.query(async () => {
    if (!process.env.ML_ACCESS_TOKEN_1)
      throw new Error("ML_ACCESS_TOKEN_1 não configurado");
    return collectMLAdsData();
  }),

  /**
   * Envia uma mensagem de follow-up para o agente ML.
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        evaluationId: z.number(),
        message: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const ev = await db
        .select()
        .from(mlAdsEvaluations)
        .where(
          and(
            eq(mlAdsEvaluations.id, input.evaluationId),
            eq(mlAdsEvaluations.userId, ctx.user.id)
          )
        );

      if (!ev.length || ev[0].status !== "done") {
        throw new Error("Avaliação não encontrada ou ainda não concluída");
      }

      await db.insert(mlAdsEvaluationMessages).values({
        evaluationId: input.evaluationId,
        userId: ctx.user.id,
        role: "user",
        content: input.message,
        createdAt: new Date(),
      });

      const history = await db
        .select()
        .from(mlAdsEvaluationMessages)
        .where(eq(mlAdsEvaluationMessages.evaluationId, input.evaluationId))
        .orderBy(mlAdsEvaluationMessages.createdAt);

      const reply = await chatWithMLAgent(
        history.map((m: { role: "user" | "assistant"; content: string }) => ({
          role: m.role,
          content: m.content,
        })),
        ev[0].rawMetrics || "[]"
      );

      await db.insert(mlAdsEvaluationMessages).values({
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
        .select({ id: mlAdsEvaluations.id })
        .from(mlAdsEvaluations)
        .where(
          and(
            eq(mlAdsEvaluations.id, input.evaluationId),
            eq(mlAdsEvaluations.userId, ctx.user.id)
          )
        );

      if (!ev.length) return [];

      return db
        .select()
        .from(mlAdsEvaluationMessages)
        .where(eq(mlAdsEvaluationMessages.evaluationId, input.evaluationId))
        .orderBy(mlAdsEvaluationMessages.createdAt);
    }),
});
