/**
 * Agent Actions Router — Fluxo de confirmação de ações dos agentes IA
 *
 * O usuário vê as ações pendentes e pode aprovar, rejeitar ou marcar como concluída.
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { agentActions, AgentAction } from "../../drizzle/schema";
import { eq, and, desc, inArray } from "drizzle-orm";

export const agentActionsRouter = router({
  // ── Listar ações pendentes ─────────────────────────────────────────────────
  listPending: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      return db
        .select()
        .from(agentActions)
        .where(eq(agentActions.status, "pending"))
        .orderBy(desc(agentActions.createdAt))
        .limit(input?.limit ?? 50);
    }),

  // ── Listar por status ──────────────────────────────────────────────────────
  listByStatus: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "approved", "rejected", "executing", "done"]).optional(),
        agentName: z.string().optional(),
        date: z.string().optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];
      if (input.status) conditions.push(eq(agentActions.status, input.status));
      if (input.agentName) conditions.push(eq(agentActions.agentName, input.agentName));
      if (input.date) conditions.push(eq(agentActions.date, input.date));

      const query = db
        .select()
        .from(agentActions)
        .orderBy(desc(agentActions.createdAt))
        .limit(input.limit);

      if (conditions.length > 0) {
        return query.where(and(...conditions));
      }
      return query;
    }),

  // ── Contar ações por status ────────────────────────────────────────────────
  countByStatus: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { pending: 0, approved: 0, rejected: 0, done: 0 };

    const all = await db.select().from(agentActions);
    return {
      pending: all.filter((a: AgentAction) => a.status === "pending").length,
      approved: all.filter((a: AgentAction) => a.status === "approved").length,
      rejected: all.filter((a: AgentAction) => a.status === "rejected").length,
      done: all.filter((a: AgentAction) => a.status === "done").length,
    };
  }),

  // ── Aprovar ação ──────────────────────────────────────────────────────────
  approve: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        userNote: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      await db
        .update(agentActions)
        .set({ status: "approved", userNote: input.userNote })
        .where(eq(agentActions.id, input.id));

      return { success: true };
    }),

  // ── Rejeitar ação ─────────────────────────────────────────────────────────
  reject: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        userNote: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      await db
        .update(agentActions)
        .set({ status: "rejected", userNote: input.userNote })
        .where(eq(agentActions.id, input.id));

      return { success: true };
    }),

  // ── Marcar como concluída ─────────────────────────────────────────────────
  markDone: protectedProcedure
    .input(z.object({ id: z.number(), userNote: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      await db
        .update(agentActions)
        .set({ status: "done", userNote: input.userNote })
        .where(eq(agentActions.id, input.id));

      return { success: true };
    }),

  // ── Aprovar múltiplas de uma vez ──────────────────────────────────────────
  approveMany: protectedProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      if (input.ids.length === 0) return { success: true, count: 0 };

      await db
        .update(agentActions)
        .set({ status: "approved" })
        .where(inArray(agentActions.id, input.ids));

      return { success: true, count: input.ids.length };
    }),

  // ── Rejeitar múltiplas de uma vez ─────────────────────────────────────────
  rejectMany: protectedProcedure
    .input(z.object({ ids: z.array(z.number()), userNote: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      if (input.ids.length === 0) return { success: true, count: 0 };

      await db
        .update(agentActions)
        .set({ status: "rejected", userNote: input.userNote })
        .where(inArray(agentActions.id, input.ids));

      return { success: true, count: input.ids.length };
    }),
});
