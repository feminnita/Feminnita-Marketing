/**
 * Morning Briefing Router — tRPC procedures para o briefing diário
 */

import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getMemoriesByType } from "../services/agentMemory";
import { runMorningBriefing } from "../agents/morning-briefing-agent";
import type { MorningBriefingResult } from "../agents/morning-briefing-agent";

export const morningBriefingRouter = router({
  // ── Obter briefing de hoje (do banco, sem rodar agentes) ──────────────────
  getToday: protectedProcedure.query(async () => {
    const today = new Date().toISOString().slice(0, 10);
    const entries = await getMemoriesByType("sistema", "daily_analysis", 1);

    if (entries.length === 0) return null;

    const entry = entries[0];
    if (entry.period !== today) return null; // briefing de dia anterior — não exibir

    try {
      return JSON.parse(entry.content) as MorningBriefingResult;
    } catch {
      return null;
    }
  }),

  // ── Obter briefing de qualquer data recente ────────────────────────────────
  getRecent: protectedProcedure.query(async () => {
    const entries = await getMemoriesByType("sistema", "daily_analysis", 7);
    return entries.map((e: { period: string; content: string }) => {
      try {
        return { period: e.period, data: JSON.parse(e.content) as MorningBriefingResult };
      } catch {
        return { period: e.period, data: null };
      }
    });
  }),

  // ── Disparar briefing manualmente ─────────────────────────────────────────
  triggerBriefing: protectedProcedure.mutation(async () => {
    try {
      const result = await runMorningBriefing();
      return { success: true, briefing: result };
    } catch (err: any) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: err.message || "Erro ao gerar briefing matinal",
      });
    }
  }),

  // ── Análise de um agente específico ───────────────────────────────────────
  getAgentLatest: protectedProcedure
    .input((input: unknown) => {
      if (typeof input !== "object" || input === null) throw new Error("Input inválido");
      const { agentName } = input as { agentName: string };
      if (!["fernanda", "sofia", "beatriz", "clara", "mariana"].includes(agentName)) {
        throw new Error("Agente inválido");
      }
      return { agentName };
    })
    .query(async ({ input }) => {
      const entries = await getMemoriesByType(input.agentName, "daily_analysis", 1);
      if (entries.length === 0) return null;
      try {
        return { period: entries[0].period, data: JSON.parse(entries[0].content) };
      } catch {
        return null;
      }
    }),
});
