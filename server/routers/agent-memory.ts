/**
 * Agent Memory Router — tRPC procedures para o sistema de memória da Fernanda
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import {
  getRecentMemories,
  getMemoriesByType,
  saveMemory,
} from "../services/agentMemory";
import { runDailyAnalysis } from "../agents/fernanda-daily-agent";

export const agentMemoryRouter = router({
  // ── Últimas 30 análises da Fernanda ───────────────────────────────────────
  getRecentAnalyses: protectedProcedure
    .input(z.object({ limit: z.number().default(30) }).optional())
    .query(async ({ input }) => {
      return getMemoriesByType("fernanda", "daily_analysis", input?.limit ?? 30);
    }),

  // ── Análise mais recente ──────────────────────────────────────────────────
  getLatestAnalysis: protectedProcedure.query(async () => {
    const entries = await getMemoriesByType("fernanda", "daily_analysis", 1);
    if (entries.length === 0) return null;
    const entry = entries[0];
    try {
      return { ...entry, contentParsed: JSON.parse(entry.content) };
    } catch {
      return { ...entry, contentParsed: null };
    }
  }),

  // ── Últimos 4 resumos semanais ────────────────────────────────────────────
  getWeeklySummaries: protectedProcedure
    .input(z.object({ limit: z.number().default(4) }).optional())
    .query(async ({ input }) => {
      return getMemoriesByType("fernanda", "weekly_summary", input?.limit ?? 4);
    }),

  // ── Disparar análise manualmente ─────────────────────────────────────────
  triggerDailyAnalysis: protectedProcedure.mutation(async () => {
    try {
      const result = await runDailyAnalysis();
      return { success: true, analysis: result };
    } catch (err: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: err.message || "Erro ao rodar análise diária",
      });
    }
  }),

  // ── Salvar metas customizadas ─────────────────────────────────────────────
  saveGoals: protectedProcedure
    .input(
      z.object({
        goals: z.record(z.string(), z.unknown()),
      })
    )
    .mutation(async ({ input }) => {
      const today = new Date().toISOString().slice(0, 10);
      await saveMemory("fernanda", "business_goals", today, input.goals);
      return { success: true };
    }),

  // ── Salvar aprendizado ────────────────────────────────────────────────────
  saveLearning: protectedProcedure
    .input(z.object({ insight: z.string().min(1).max(2000) }))
    .mutation(async ({ input }) => {
      const today = new Date().toISOString().slice(0, 10);
      // Período único para cada learning: inclui timestamp para não colidir
      const period = `${today}-${Date.now()}`;
      await saveMemory("fernanda", "learning", period, { insight: input.insight });
      return { success: true };
    }),

  // ── Todas as memórias recentes ────────────────────────────────────────────
  getAll: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }).optional())
    .query(async ({ input }) => {
      return getRecentMemories("fernanda", input?.limit ?? 50);
    }),
});
