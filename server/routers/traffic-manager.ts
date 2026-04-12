/**
 * Traffic Manager Router — tRPC procedures para o Especialista em Tráfego
 *
 * Expõe:
 * - chat: envia mensagem ao agente e recebe resposta + ações propostas
 * - getDailyBriefing: retorna briefing do dia (gerado sob demanda ou cacheado)
 * - listConversations: lista conversas anteriores do usuário
 * - approveAction: aprova ou rejeita uma ação proposta pelo agente
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";
import {
  trafficConversations,
  trafficMessages,
  trafficActions,
  trafficDailyBriefings,
} from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  chatWithAgent,
  generateDailyBriefing,
} from "../agents/traffic-manager-agent";
import {
  fetchMetaAdsData,
  pauseCampaign,
  resumeCampaign,
  pauseAdset,
  resumeAdset,
  updateCampaignBudget,
  updateAdsetBudget,
} from "../services/meta-ads-service";

// ─── Router ───────────────────────────────────────────────────────────────────

export const trafficManagerRouter = router({
  // ── Chat com o agente ──────────────────────────────────────────────────────
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1).max(50000),
        conversationId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "DB unavailable",
        });

      // Buscar ou criar conversa
      let convId = input.conversationId;
      if (!convId) {
        // Título automático a partir das primeiras palavras da mensagem
        const autoTitle =
          input.message.slice(0, 60) + (input.message.length > 60 ? "…" : "");
        await db.insert(trafficConversations).values({
          userId: ctx.user.id,
          title: autoTitle,
        });
        const [created] = await db
          .select()
          .from(trafficConversations)
          .where(eq(trafficConversations.userId, ctx.user.id))
          .orderBy(desc(trafficConversations.createdAt))
          .limit(1);
        convId = created.id;
      } else {
        // Verificar que a conversa pertence ao usuário
        const [conv] = await db
          .select()
          .from(trafficConversations)
          .where(
            and(
              eq(trafficConversations.id, convId),
              eq(trafficConversations.userId, ctx.user.id)
            )
          )
          .limit(1);
        if (!conv)
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Conversa não encontrada",
          });
      }

      // Buscar histórico da conversa (últimas 20 mensagens para contexto)
      const history = await db
        .select()
        .from(trafficMessages)
        .where(eq(trafficMessages.conversationId, convId!))
        .orderBy(desc(trafficMessages.createdAt))
        .limit(20);

      const conversationHistory = history
        .reverse()
        .map((m: { role: string; content: string }) => ({ role: m.role as "user" | "assistant", content: m.content }));

      // Salvar mensagem do usuário
      await db.insert(trafficMessages).values({
        conversationId: convId!,
        role: "user",
        content: input.message,
      });

      // Chamar o agente
      const agentResponse = await chatWithAgent(
        input.message,
        conversationHistory
      );

      // Salvar resposta do agente
      await db.insert(trafficMessages).values({
        conversationId: convId!,
        role: "assistant",
        content: agentResponse.message,
      });

      // Atualizar timestamp da conversa
      await db
        .update(trafficConversations)
        .set({ updatedAt: new Date() })
        .where(eq(trafficConversations.id, convId!));

      // Persistir ações propostas
      const savedActions = [];
      for (const action of agentResponse.proposedActions) {
        await db.insert(trafficActions).values({
          conversationId: convId,
          actionType: action.action,
          payload: JSON.stringify(action),
          status: "pending",
        });
        const [saved] = await db
          .select()
          .from(trafficActions)
          .where(eq(trafficActions.conversationId, convId!))
          .orderBy(desc(trafficActions.createdAt))
          .limit(1);
        savedActions.push(saved);
      }

      return {
        conversationId: convId,
        message: agentResponse.message,
        proposedActions: savedActions,
      };
    }),

  // ── Briefing do dia ────────────────────────────────────────────────────────
  getDailyBriefing: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "DB unavailable",
      });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Verificar se já existe briefing do dia
    const [existing] = await db
      .select()
      .from(trafficDailyBriefings)
      .where(
        and(
          eq(trafficDailyBriefings.userId, ctx.user.id),
          eq(trafficDailyBriefings.date, today)
        )
      )
      .limit(1);

    if (existing) {
      return {
        ...existing,
        data: JSON.parse(existing.data),
      };
    }

    // Buscar dados reais da Meta Ads
    const metaData = await fetchMetaAdsData();

    // Gerar novo briefing com dados reais
    const briefingData = await generateDailyBriefing(
      metaData.campaigns.length > 0 ? {
        adAccountId: process.env.META_AD_ACCOUNT_ID,
        spendToday: metaData.spendToday,
        spendMonth: metaData.spendMonth,
        campaigns: metaData.campaigns.map(c => ({
          name: c.name,
          spend: c.spend,
          roas: c.roas,
          cpm: c.cpm,
          ctr: c.ctr,
          status: c.status,
        })),
      } : undefined
    );

    await db.insert(trafficDailyBriefings).values({
      userId: ctx.user.id,
      date: today,
      data: JSON.stringify(briefingData),
    });

    const [saved] = await db
      .select()
      .from(trafficDailyBriefings)
      .where(eq(trafficDailyBriefings.userId, ctx.user.id))
      .orderBy(desc(trafficDailyBriefings.createdAt))
      .limit(1);

    return {
      ...saved,
      data: briefingData,
    };
  }),

  // ── Forçar regeneração do briefing ────────────────────────────────────────
  regenerateBriefing: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "DB unavailable",
      });

    const briefingData = await generateDailyBriefing();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Upsert: deletar e reinserir
    const existing = await db
      .select({ id: trafficDailyBriefings.id })
      .from(trafficDailyBriefings)
      .where(
        and(
          eq(trafficDailyBriefings.userId, ctx.user.id),
          eq(trafficDailyBriefings.date, today)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(trafficDailyBriefings)
        .set({ data: JSON.stringify(briefingData), updatedAt: new Date() })
        .where(eq(trafficDailyBriefings.id, existing[0].id));
    } else {
      await db.insert(trafficDailyBriefings).values({
        userId: ctx.user.id,
        date: today,
        data: JSON.stringify(briefingData),
      });
    }

    return { success: true, data: briefingData };
  }),

  // ── Listar conversas ───────────────────────────────────────────────────────
  listConversations: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "DB unavailable",
        });

      return db
        .select()
        .from(trafficConversations)
        .where(eq(trafficConversations.userId, ctx.user.id))
        .orderBy(desc(trafficConversations.updatedAt))
        .limit(input.limit);
    }),

  // ── Buscar mensagens de uma conversa ──────────────────────────────────────
  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "DB unavailable",
        });

      // Verificar ownership
      const [conv] = await db
        .select()
        .from(trafficConversations)
        .where(
          and(
            eq(trafficConversations.id, input.conversationId),
            eq(trafficConversations.userId, ctx.user.id)
          )
        )
        .limit(1);
      if (!conv)
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Conversa não encontrada",
        });

      return db
        .select()
        .from(trafficMessages)
        .where(eq(trafficMessages.conversationId, input.conversationId))
        .orderBy(trafficMessages.createdAt);
    }),

  // ── Ações pendentes de aprovação ──────────────────────────────────────────
  getPendingActions: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db)
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "DB unavailable",
      });

    // Join via conversas do usuário
    const userConvs = await db
      .select({ id: trafficConversations.id })
      .from(trafficConversations)
      .where(eq(trafficConversations.userId, ctx.user.id));

    if (userConvs.length === 0) return [];

    const convIds = userConvs.map((c: { id: number }) => c.id);

    const actions = await db
      .select()
      .from(trafficActions)
      .where(eq(trafficActions.status, "pending"))
      .orderBy(desc(trafficActions.createdAt))
      .limit(50);

    // Filtrar apenas ações das conversas do usuário
    return actions.filter((a: { conversationId: number }) => convIds.includes(a.conversationId));
  }),

  // ── Aprovar ou rejeitar ação ───────────────────────────────────────────────
  approveAction: protectedProcedure
    .input(
      z.object({
        actionId: z.number(),
        approved: z.boolean(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db)
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "DB unavailable",
        });

      // Verificar que a ação pertence ao usuário
      const [action] = await db
        .select()
        .from(trafficActions)
        .where(eq(trafficActions.id, input.actionId))
        .limit(1);
      if (!action)
        throw new TRPCError({ code: "NOT_FOUND", message: "Ação não encontrada" });

      const [conv] = await db
        .select()
        .from(trafficConversations)
        .where(
          and(
            eq(trafficConversations.id, action.conversationId),
            eq(trafficConversations.userId, ctx.user.id)
          )
        )
        .limit(1);
      if (!conv)
        throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });

      const payload = JSON.parse(action.payload ?? "{}") as Record<string, unknown>;
      let executionResult: string | null = null;
      let executionError: string | null = null;

      // Executar a ação na Meta Ads API quando aprovada
      if (input.approved) {
        const targetId = payload.target_id as string | undefined;
        const actionType = action.actionType;
        try {
          if (actionType === "pause_campaign" && targetId) {
            await pauseCampaign(targetId);
            executionResult = `Campanha pausada com sucesso na Meta Ads API`;
          } else if (actionType === "resume_campaign" && targetId) {
            await resumeCampaign(targetId);
            executionResult = `Campanha reativada com sucesso na Meta Ads API`;
          } else if (actionType === "pause_adset" && targetId) {
            await pauseAdset(targetId);
            executionResult = `Conjunto pausado com sucesso na Meta Ads API`;
          } else if (actionType === "resume_adset" && targetId) {
            await resumeAdset(targetId);
            executionResult = `Conjunto reativado com sucesso na Meta Ads API`;
          } else if ((actionType === "increase_budget" || actionType === "decrease_budget") && targetId) {
            const newBudget = payload.new_daily_budget as number | undefined;
            if (newBudget) {
              // Detectar se é campanha ou adset pelo prefixo do ID (adsets têm IDs diferentes)
              const isCampaign = payload.target_type === "campaign";
              if (isCampaign) {
                await updateCampaignBudget(targetId, Math.round(newBudget * 100));
              } else {
                await updateAdsetBudget(targetId, Math.round(newBudget * 100));
              }
              executionResult = `Budget atualizado para R$${newBudget}/dia na Meta Ads API`;
            } else {
              executionResult = `Ação aprovada — execute o ajuste de budget manualmente no Gerenciador de Anúncios (novo valor não especificado)`;
            }
          } else {
            // Ações que não têm execução automática (change_creative, review_creative, custom, etc.)
            executionResult = null; // apenas registra aprovação
          }
        } catch (err: any) {
          console.error("[approveAction] Erro ao executar na Meta API:", err.message);
          executionError = err.message;
        }
      }

      const newStatus = input.approved
        ? (executionError ? "approved" : "executed")
        : "rejected";

      await db
        .update(trafficActions)
        .set({ status: newStatus, updatedAt: new Date() })
        .where(eq(trafficActions.id, input.actionId));

      // Registrar a decisão como mensagem de contexto na conversa
      let decisionNote: string;
      if (!input.approved) {
        decisionNote = `[Ação REJEITADA] ${payload.target_name ?? action.actionType}${input.notes ? ` — Motivo: ${input.notes}` : ""}`;
      } else if (executionError) {
        decisionNote = `[Ação APROVADA - Erro na execução] ${payload.target_name ?? action.actionType} — Erro: ${executionError}${input.notes ? ` — Nota: ${input.notes}` : ""}`;
      } else if (executionResult) {
        decisionNote = `[Ação EXECUTADA] ${payload.target_name ?? action.actionType} — ${executionResult}${input.notes ? ` — Nota: ${input.notes}` : ""}`;
      } else {
        decisionNote = `[Ação APROVADA] ${payload.target_name ?? action.actionType}${input.notes ? ` — Nota: ${input.notes}` : ""}`;
      }

      await db.insert(trafficMessages).values({
        conversationId: action.conversationId,
        role: "user",
        content: decisionNote,
      });

      return {
        success: true,
        status: newStatus,
        executionResult,
        executionError,
      };
    }),
});
