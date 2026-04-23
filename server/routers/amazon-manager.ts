import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { amazonEvaluations, amazonEvaluationMessages } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  runAmazonEvaluation,
  chatWithAmazonAgent,
  collectAmazonData,
} from "../agents/amazon-agent";
import { isConnected, hasAwsCredentials } from "../services/amazonSpApi";

export const amazonManagerRouter = router({
  triggerEvaluation: protectedProcedure
    .input(z.object({ account: z.enum(["feminnita", "fnt"]).default("feminnita") }).optional())
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");
      const account = input?.account ?? "feminnita";
      const sellerId = (account === "fnt" ? process.env.AMAZON_SELLER_ID_2 : process.env.AMAZON_SELLER_ID) ?? undefined;

      const result = await db.insert(amazonEvaluations).values({
        userId: ctx.user.id,
        account,
        sellerId,
        status: "pending",
        triggeredAt: new Date(),
        createdAt: new Date(),
      });

      const evaluationId = Array.isArray(result) ? result[0].insertId : (result as any).insertId;

      runAmazonEvaluation(evaluationId, account).catch((err) =>
        console.error("[AmazonManager] Erro:", err)
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
        .from(amazonEvaluations)
        .where(and(eq(amazonEvaluations.id, input.id), eq(amazonEvaluations.userId, ctx.user.id)));

      if (!rows.length) throw new Error("Avaliação não encontrada");
      const ev = rows[0];
      return {
        ...ev,
        rawMetrics: ev.rawMetrics ? JSON.parse(ev.rawMetrics) : null,
        recommendations: ev.recommendations ? JSON.parse(ev.recommendations) : [],
      };
    }),

  listEvaluations: protectedProcedure
    .input(z.object({ account: z.enum(["feminnita", "fnt"]).default("feminnita") }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const account = input?.account ?? "feminnita";

      return db
        .select({
          id: amazonEvaluations.id,
          status: amazonEvaluations.status,
          summary: amazonEvaluations.summary,
          errorMessage: amazonEvaluations.errorMessage,
          triggeredAt: amazonEvaluations.triggeredAt,
          completedAt: amazonEvaluations.completedAt,
        })
        .from(amazonEvaluations)
        .where(and(eq(amazonEvaluations.userId, ctx.user.id), eq(amazonEvaluations.account, account)))
        .orderBy(desc(amazonEvaluations.triggeredAt))
        .limit(20);
    }),

  getData: protectedProcedure.query(async () => {
    return collectAmazonData();
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
        .from(amazonEvaluations)
        .where(and(eq(amazonEvaluations.id, input.evaluationId), eq(amazonEvaluations.userId, ctx.user.id)));

      if (!ev.length || ev[0].status !== "done") {
        throw new Error("Avaliação não encontrada ou ainda não concluída");
      }

      await db.insert(amazonEvaluationMessages).values({
        evaluationId: input.evaluationId,
        userId: ctx.user.id,
        role: "user",
        content: input.message,
        createdAt: new Date(),
      });

      const history = await db
        .select()
        .from(amazonEvaluationMessages)
        .where(eq(amazonEvaluationMessages.evaluationId, input.evaluationId))
        .orderBy(amazonEvaluationMessages.createdAt);

      const reply = await chatWithAmazonAgent(
        history.map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content })),
        ev[0].rawMetrics || "{}"
      );

      await db.insert(amazonEvaluationMessages).values({
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
        .select({ id: amazonEvaluations.id })
        .from(amazonEvaluations)
        .where(and(eq(amazonEvaluations.id, input.evaluationId), eq(amazonEvaluations.userId, ctx.user.id)));

      if (!ev.length) return [];

      return db
        .select()
        .from(amazonEvaluationMessages)
        .where(eq(amazonEvaluationMessages.evaluationId, input.evaluationId))
        .orderBy(amazonEvaluationMessages.createdAt);
    }),

  getAuthStatus: protectedProcedure.query(() => {
    return {
      connected: isConnected(),
      hasAwsCreds: hasAwsCredentials(),
      sellerId: process.env.AMAZON_SELLER_ID || undefined,
    };
  }),
});
