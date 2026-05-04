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
import { eq, and, desc, inArray, gte } from "drizzle-orm";
import {
  pauseMLAdsCampaign,
  activateMLAdsCampaign,
  updateMLAdsBudget,
  pauseMLItem,
  activateMLItem,
  updateMLPrice,
  updateMLStock,
} from "../agents/gabi-executor";

// Payload JSON guardado em description para ações de marketplace
interface MarketplacePayload {
  marketplace: "ml" | "shopee";
  account: "feminnita" | "fnt";
  targetId: string;
  targetName?: string;
  currentValue?: string;
  proposedValue?: string;
}

async function executeMarketplaceAction(actionType: string, payload: MarketplacePayload): Promise<string> {
  const { marketplace, account, targetId } = payload;
  const proposed = payload.proposedValue ?? "";

  if (marketplace === "ml") {
    switch (actionType) {
      case "ml_pause_campaign":    return pauseMLAdsCampaign(targetId, account);
      case "ml_activate_campaign": return activateMLAdsCampaign(targetId, account);
      case "ml_update_budget":     return updateMLAdsBudget(targetId, Number(proposed), account);
      case "ml_pause_item":        return pauseMLItem(targetId, account);
      case "ml_activate_item":     return activateMLItem(targetId, account);
      case "ml_update_price":      return updateMLPrice(targetId, Number(proposed), account);
      case "ml_update_stock":      return updateMLStock(targetId, Number(proposed), account);
      default: throw new Error(`Tipo de ação ML desconhecido: ${actionType}`);
    }
  }

  if (marketplace === "shopee") {
    // Shopee executor — chamadas via Open Platform API
    const { shopeeRequest } = await import("../services/shopeeApi");
    switch (actionType) {
      case "shopee_pause_campaign":
        await shopeeRequest("POST", "/api/v2/ads/pause_campaign", { campaign_id_list: [Number(targetId)] }, account);
        return `Campanha Shopee ${targetId} pausada.`;
      case "shopee_activate_campaign":
        await shopeeRequest("POST", "/api/v2/ads/enable_campaign", { campaign_id_list: [Number(targetId)] }, account);
        return `Campanha Shopee ${targetId} reativada.`;
      case "shopee_update_budget":
        await shopeeRequest("POST", "/api/v2/ads/update_campaign_budget", { campaign_id: Number(targetId), budget: Number(proposed) }, account);
        return `Budget da campanha Shopee ${targetId} atualizado para R$${proposed}.`;
      case "shopee_update_roas":
        await shopeeRequest("POST", "/api/v2/ads/update_campaign_roas", { campaign_id: Number(targetId), target_roas: Number(proposed) }, account);
        return `ROAS alvo da campanha Shopee ${targetId} atualizado para ${proposed}x.`;
      default: throw new Error(`Tipo de ação Shopee desconhecido: ${actionType}`);
    }
  }

  throw new Error(`Marketplace desconhecido: ${marketplace}`);
}

export const agentActionsRouter = router({
  // ── Listar ações pendentes ─────────────────────────────────────────────────
  listPending: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }).optional())
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];

      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);

      return db
        .select()
        .from(agentActions)
        .where(and(eq(agentActions.status, "pending"), gte(agentActions.createdAt, startOfToday)))
        .orderBy(desc(agentActions.createdAt))
        .limit(input?.limit ?? 20);
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

  // ── Propor ações (chamado pelos agentes IA) ───────────────────────────────
  propose: protectedProcedure
    .input(
      z.object({
        actions: z.array(
          z.object({
            agentName: z.string(),
            title: z.string(),
            description: z.string(), // JSON stringificado com MarketplacePayload
            actionType: z.string(),
            priority: z.enum(["alta", "media", "baixa"]).default("media"),
            estimatedImpact: z.string().optional(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      const today = new Date().toISOString().slice(0, 10);
      const rows = input.actions.map((a) => ({
        agentName: a.agentName,
        date: today,
        title: a.title,
        description: a.description,
        actionType: a.actionType,
        priority: a.priority,
        estimatedImpact: a.estimatedImpact ?? null,
        status: "pending" as const,
      }));

      await db.insert(agentActions).values(rows);
      return { success: true, count: rows.length };
    }),

  // ── Executar ação aprovada ────────────────────────────────────────────────
  execute: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      const [action] = await db.select().from(agentActions).where(eq(agentActions.id, input.id)).limit(1);
      if (!action) throw new TRPCError({ code: "NOT_FOUND", message: "Ação não encontrada" });
      if (action.status !== "approved") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Apenas ações aprovadas podem ser executadas" });
      }

      // Marcar como executando
      await db.update(agentActions).set({ status: "executing" }).where(eq(agentActions.id, input.id));

      try {
        let payload: MarketplacePayload;
        try {
          payload = JSON.parse(action.description);
        } catch {
          throw new Error("Payload inválido — description não é JSON válido");
        }

        const result = await executeMarketplaceAction(action.actionType, payload);

        await db.update(agentActions)
          .set({ status: "done", userNote: result })
          .where(eq(agentActions.id, input.id));

        return { success: true, result };
      } catch (e: any) {
        await db.update(agentActions)
          .set({ status: "approved", userNote: `Erro: ${e.message}` })
          .where(eq(agentActions.id, input.id));
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: e.message });
      }
    }),

  // ── Executar todas as aprovadas ───────────────────────────────────────────
  executeAllApproved: protectedProcedure
    .input(z.object({ agentName: z.string().optional() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Banco indisponível" });

      const conditions = [eq(agentActions.status, "approved")];
      if (input.agentName) conditions.push(eq(agentActions.agentName, input.agentName));

      const approved = await db.select().from(agentActions).where(and(...conditions));
      const results: { id: number; success: boolean; message: string }[] = [];

      for (const action of approved) {
        try {
          let payload: MarketplacePayload;
          try { payload = JSON.parse(action.description); } catch {
            results.push({ id: action.id, success: false, message: "Payload inválido" });
            continue;
          }

          await db.update(agentActions).set({ status: "executing" }).where(eq(agentActions.id, action.id));
          const result = await executeMarketplaceAction(action.actionType, payload);
          await db.update(agentActions).set({ status: "done", userNote: result }).where(eq(agentActions.id, action.id));
          results.push({ id: action.id, success: true, message: result });
        } catch (e: any) {
          await db.update(agentActions).set({ status: "approved", userNote: `Erro: ${e.message}` }).where(eq(agentActions.id, action.id));
          results.push({ id: action.id, success: false, message: e.message });
        }
      }

      return { total: approved.length, executed: results.filter(r => r.success).length, results };
    }),
});
