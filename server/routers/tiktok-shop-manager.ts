import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { tiktokShopEvaluations, tiktokShopEvaluationMessages } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  runTiktokShopEvaluation,
  chatWithTiktokShopAgent,
  collectTiktokShopData,
} from "../agents/tiktok-shop-agent";

export const tiktokShopManagerRouter = router({
  triggerEvaluation: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Banco indisponível");

    const shopId = process.env.TIKTOK_SHOP_ID || null;

    const result = await db.insert(tiktokShopEvaluations).values({
      userId: ctx.user.id,
      shopId: shopId ?? undefined,
      status: "pending",
      triggeredAt: new Date(),
      createdAt: new Date(),
    });

    const evaluationId = Array.isArray(result) ? result[0].insertId : (result as any).insertId;

    runTiktokShopEvaluation(evaluationId).catch((err) =>
      console.error("[TikTokShopManager] Erro:", err)
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
        .from(tiktokShopEvaluations)
        .where(and(eq(tiktokShopEvaluations.id, input.id), eq(tiktokShopEvaluations.userId, ctx.user.id)));

      if (!rows.length) throw new Error("Avaliação não encontrada");

      const ev = rows[0];
      return {
        ...ev,
        rawMetrics: ev.rawMetrics ? JSON.parse(ev.rawMetrics) : null,
        recommendations: ev.recommendations ? JSON.parse(ev.recommendations) : [],
      };
    }),

  listEvaluations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return db
      .select({
        id: tiktokShopEvaluations.id,
        status: tiktokShopEvaluations.status,
        summary: tiktokShopEvaluations.summary,
        errorMessage: tiktokShopEvaluations.errorMessage,
        triggeredAt: tiktokShopEvaluations.triggeredAt,
        completedAt: tiktokShopEvaluations.completedAt,
      })
      .from(tiktokShopEvaluations)
      .where(eq(tiktokShopEvaluations.userId, ctx.user.id))
      .orderBy(desc(tiktokShopEvaluations.triggeredAt))
      .limit(20);
  }),

  listProducts: protectedProcedure.query(async () => {
    return collectTiktokShopData();
  }),

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
        .from(tiktokShopEvaluations)
        .where(and(eq(tiktokShopEvaluations.id, input.evaluationId), eq(tiktokShopEvaluations.userId, ctx.user.id)));

      if (!ev.length || ev[0].status !== "done") {
        throw new Error("Avaliação não encontrada ou ainda não concluída");
      }

      await db.insert(tiktokShopEvaluationMessages).values({
        evaluationId: input.evaluationId,
        userId: ctx.user.id,
        role: "user",
        content: input.message,
        createdAt: new Date(),
      });

      const history = await db
        .select()
        .from(tiktokShopEvaluationMessages)
        .where(eq(tiktokShopEvaluationMessages.evaluationId, input.evaluationId))
        .orderBy(tiktokShopEvaluationMessages.createdAt);

      const reply = await chatWithTiktokShopAgent(
        history.map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content })),
        ev[0].rawMetrics || "[]"
      );

      await db.insert(tiktokShopEvaluationMessages).values({
        evaluationId: input.evaluationId,
        userId: ctx.user.id,
        role: "assistant",
        content: reply,
        createdAt: new Date(),
      });

      return { reply };
    }),

  getMessages: protectedProcedure
    .input(z.object({ evaluationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const ev = await db
        .select({ id: tiktokShopEvaluations.id })
        .from(tiktokShopEvaluations)
        .where(and(eq(tiktokShopEvaluations.id, input.evaluationId), eq(tiktokShopEvaluations.userId, ctx.user.id)));

      if (!ev.length) return [];

      return db
        .select()
        .from(tiktokShopEvaluationMessages)
        .where(eq(tiktokShopEvaluationMessages.evaluationId, input.evaluationId))
        .orderBy(tiktokShopEvaluationMessages.createdAt);
    }),

  getAuthStatus: protectedProcedure.query(() => {
    const shopId = process.env.TIKTOK_SHOP_ID;
    const accessToken = process.env.TIKTOK_SHOP_ACCESS_TOKEN;
    const connected = !!(accessToken);
    return { connected, shopId: shopId || undefined };
  }),
});
