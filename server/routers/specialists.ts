import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { specialistPlatformEvaluations as specialistEvaluations, specialistPlatformMessages as specialistMessages } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import {
  runSpecialistEvaluation,
  chatWithSpecialist,
  listSpecialistEvaluations,
  type SpecialistType,
} from "../agents/specialists-agent";

const SPECIALIST_TYPE = z.enum(["shopee_eds", "shopee_promo", "ml_eds", "shopee_live", "instagram_live", "tiktok_live"]);
const ACCOUNT_TYPE = z.enum(["feminnita", "fnt"]);

export const specialistsRouter = router({
  triggerEvaluation: protectedProcedure
    .input(z.object({
      specialistType: SPECIALIST_TYPE,
      account: ACCOUNT_TYPE.default("feminnita"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const result = await db.insert(specialistEvaluations).values({
        userId: ctx.user.id,
        specialistType: input.specialistType,
        account: input.account,
        status: "pending",
        triggeredAt: new Date(),
        createdAt: new Date(),
      });

      const evaluationId = Array.isArray(result) ? result[0].insertId : (result as any).insertId;

      runSpecialistEvaluation(evaluationId, input.specialistType as SpecialistType, input.account).catch((err) =>
        console.error("[Specialists] Erro:", err)
      );

      return { evaluationId, status: "pending" };
    }),

  getEvaluation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const rows = await db.select().from(specialistEvaluations)
        .where(and(eq(specialistEvaluations.id, input.id), eq(specialistEvaluations.userId, ctx.user.id)));

      if (!rows.length) throw new Error("Avaliação não encontrada");
      const ev = rows[0];
      return {
        ...ev,
        recommendations: ev.recommendations ? JSON.parse(ev.recommendations) : [],
      };
    }),

  listEvaluations: protectedProcedure
    .input(z.object({
      specialistType: SPECIALIST_TYPE,
      account: ACCOUNT_TYPE.default("feminnita"),
    }))
    .query(async ({ ctx, input }) => {
      return listSpecialistEvaluations(ctx.user.id, input.specialistType as SpecialistType, input.account);
    }),

  sendMessage: protectedProcedure
    .input(z.object({
      evaluationId: z.number(),
      message: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const ev = await db.select().from(specialistEvaluations)
        .where(and(eq(specialistEvaluations.id, input.evaluationId), eq(specialistEvaluations.userId, ctx.user.id)));

      if (!ev.length || ev[0].status !== "done") {
        throw new Error("Avaliação não encontrada ou ainda não concluída");
      }

      await db.insert(specialistMessages).values({
        evaluationId: input.evaluationId,
        userId: ctx.user.id,
        role: "user",
        content: input.message,
        createdAt: new Date(),
      });

      const history = await db.select().from(specialistMessages)
        .where(eq(specialistMessages.evaluationId, input.evaluationId))
        .orderBy(specialistMessages.createdAt);

      const reply = await chatWithSpecialist(
        ev[0].specialistType as SpecialistType,
        ev[0].account,
        history.map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content }))
      );

      await db.insert(specialistMessages).values({
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

      const ev = await db.select({ id: specialistEvaluations.id })
        .from(specialistEvaluations)
        .where(and(eq(specialistEvaluations.id, input.evaluationId), eq(specialistEvaluations.userId, ctx.user.id)));

      if (!ev.length) return [];

      return db.select().from(specialistMessages)
        .where(eq(specialistMessages.evaluationId, input.evaluationId))
        .orderBy(specialistMessages.createdAt);
    }),
});
