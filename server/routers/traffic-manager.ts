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
  adCreatives,
} from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  chatWithAgent,
  generateDailyBriefing,
} from "../agents/traffic-manager-agent";
import {
  fetchMetaAdsData,
  fetchMetaAdsets,
  pauseCampaign,
  resumeCampaign,
  pauseAdset,
  resumeAdset,
  updateCampaignBudget,
  updateAdsetBudget,
  getValidMetaCredentials,
  getMetaConnectionStatus,
  setMetaAdAccountId,
} from "../services/meta-ads-service";
import { executeMetaAction } from "../agents/fernanda-executor";
import { textToSpeech } from "../services/tts";

function parseCreativeBlock(json: string): Record<string, string> {
  try { return JSON.parse(json.trim()); } catch { return {}; }
}

// ─── Router ───────────────────────────────────────────────────────────────────

export const trafficManagerRouter = router({
  // ── Chat com o agente ──────────────────────────────────────────────────────
  chat: protectedProcedure
    .input(
      z.object({
        message: z.string().min(1).max(50000),
        conversationId: z.number().optional(),
        imageBase64: z.string().optional(),
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

      // Se mensagem curta afirmativa, injetar creative pendente no contexto para Fernanda não fazer loop
      let messageForAgent = input.message;
      const isPublishTrigger = /^\s*(pode|sim|ok|autorizado|publica|publ[ií]ca|confirmo|vai|manda|certo|isso|exato|perfeito|pode publicar|pode subir|sobe|vai lá)\s*[!.]?\s*$/i.test(input.message.trim());
      if (isPublishTrigger) {
        const [pendingCreative] = await db
          .select({ id: adCreatives.id, briefTitle: adCreatives.briefTitle, headline: adCreatives.generatedHeadline })
          .from(adCreatives)
          .where(and(eq(adCreatives.status, "pending_approval"), eq(adCreatives.userId, ctx.user.id)))
          .orderBy(desc(adCreatives.createdAt))
          .limit(1);
        if (pendingCreative) {
          messageForAgent = `[SISTEMA: Creative ID ${pendingCreative.id} — "${pendingCreative.briefTitle}" — aguardando publicação. O usuário acabou de autorizar a publicação agora.]\n\n${input.message}`;
        }
      }

      // Chamar o agente
      const agentResponse = await chatWithAgent(
        messageForAgent,
        conversationHistory,
        { imageBase64: input.imageBase64, userId: ctx.user.id }
      );

      // Parse creative block and save to DB if image was sent
      let creativeId: number | undefined;
      let cleanMessage = agentResponse.message;
      const creativePattern = /<<<CREATIVE_START>>>([\s\S]*?)<<<CREATIVE_END>>>/;
      const creativeMatch = agentResponse.message.match(creativePattern);

      if (creativeMatch && input.imageBase64) {
        const fields = parseCreativeBlock(creativeMatch[1]);
        if (fields.headline || fields.body) {
          try {
            const rawBase64 = input.imageBase64.replace(/^data:image\/\w+;base64,/, "");
            await db.insert(adCreatives).values({
              userId: ctx.user.id,
              briefTitle: fields.titulo ? `Anúncio — ${fields.titulo}` : "Criativo via Fernanda",
              briefDescription: fields.angle || "prospeccao",
              campaignType: fields.angle || "prospeccao",
              product: "Pijama Suede Feminnita",
              targetAudience: "",
              generatedHeadline: fields.headline || "",
              generatedBody: fields.body || "",
              canvaCopy: { titulo: fields.titulo || "", preco: fields.preco || "", subtitulo: fields.subtitulo || "", cta: fields.cta || "", rodape: fields.rodape || "" } as any,
              imageBase64: rawBase64 || null,
              status: "pending_approval",
            });
            const [created] = await db.select({ id: adCreatives.id })
              .from(adCreatives)
              .where(eq(adCreatives.userId, ctx.user.id))
              .orderBy(desc(adCreatives.createdAt))
              .limit(1);
            creativeId = created?.id;
          } catch (err: any) {
            console.error("[chat] Erro ao salvar criativo:", err.message);
          }
        }
        // Remove the structured block from the message shown to user
        cleanMessage = agentResponse.message.replace(creativePattern, "").trim();
      }

      // Auto-executar ação publish_creative se Fernanda a propôs
      const publishAction = agentResponse.proposedActions.find(a => a.action === "publish_creative");
      if (publishAction && publishAction.creative_id && publishAction.adset_id) {
        try {
          const [creative] = await db.select().from(adCreatives)
            .where(and(eq(adCreatives.id, publishAction.creative_id), eq(adCreatives.userId, ctx.user.id)))
            .limit(1);
          if (!creative) {
            cleanMessage = "Não encontrei o criativo para publicação. Envie a arte novamente.";
          } else if (!creative.imageBase64) {
            cleanMessage = "O criativo não possui imagem armazenada. Envie a arte novamente para que eu possa publicar.";
          } else if (creative && creative.imageBase64) {
            await db.update(adCreatives).set({ status: "uploading", campaignId: publishAction.campaign_id, adSetId: publishAction.adset_id, updatedAt: new Date() })
              .where(eq(adCreatives.id, publishAction.creative_id));
            const { executeMetaAction } = await import("../agents/fernanda-executor");
            const resultMsg = await executeMetaAction("meta_create_full_ad", {
              campaignId: publishAction.campaign_id || "",
              adSetId: publishAction.adset_id,
              adName: creative.briefTitle,
              imageUrl: `data:image/png;base64,${creative.imageBase64}`,
              title: creative.generatedHeadline || creative.briefTitle,
              body: creative.generatedBody || creative.briefTitle,
              linkUrl: "https://www.feminnita.com.br",
              callToAction: "SHOP_NOW",
            });
            const metaAdId = resultMsg.match(/ID:\s*(\d+)/)?.[1];
            await db.update(adCreatives).set({ status: "executed", metaAdId, updatedAt: new Date() })
              .where(eq(adCreatives.id, publishAction.creative_id));
            const adsetName = publishAction.target_name || publishAction.adset_id;
            cleanMessage = `Anúncio publicado com sucesso no conjunto "${adsetName}".${metaAdId ? ` ID Meta: ${metaAdId}.` : ""} O criativo já está ativo na conta.`;
          }
        } catch (err: any) {
          await db.update(adCreatives).set({ status: "failed", errorMessage: err.message, updatedAt: new Date() })
            .where(eq(adCreatives.id, publishAction.creative_id!));
          cleanMessage = `Erro ao publicar o anúncio: ${err.message}. Verifique as credenciais da Meta ou tente novamente.`;
        }
      }

      // Salvar resposta do agente
      await db.insert(trafficMessages).values({
        conversationId: convId!,
        role: "assistant",
        content: cleanMessage,
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
        message: cleanMessage,
        proposedActions: savedActions,
        creativeId,
      };
    }),

  // ── Status da conexão Meta do usuário ────────────────────────────────────
  metaStatus: protectedProcedure.query(async ({ ctx }) => {
    return getMetaConnectionStatus(ctx.user.id);
  }),

  // ── Salvar adAccountId do usuário ─────────────────────────────────────────
  setAdAccountId: protectedProcedure
    .input(z.object({ adAccountId: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await setMetaAdAccountId(ctx.user.id, input.adAccountId);
      return { success: true };
    }),

  // ── Listar adsets para seleção de publicação ──────────────────────────────
  listAdsets: protectedProcedure.query(async ({ ctx }) => {
    const creds = await getValidMetaCredentials(ctx.user.id) ?? undefined;
    const adsets = await fetchMetaAdsets(undefined, creds);
    return adsets.map((a: any) => ({
      id: a.id,
      name: a.name,
      campaignName: a.campaignName,
      status: a.status,
    }));
  }),

  // ── Publicar criativo salvo no Meta ───────────────────────────────────────
  publishCreative: protectedProcedure
    .input(z.object({
      creativeId: z.number(),
      campaignId: z.string(),
      adSetId: z.string(),
      linkUrl: z.string().optional(),
      callToAction: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const [creative] = await db.select().from(adCreatives)
        .where(and(eq(adCreatives.id, input.creativeId), eq(adCreatives.userId, ctx.user.id)))
        .limit(1);
      if (!creative) throw new TRPCError({ code: "NOT_FOUND", message: "Criativo não encontrado" });
      if (!creative.imageBase64) throw new TRPCError({ code: "BAD_REQUEST", message: "Imagem não encontrada no criativo" });

      await db.update(adCreatives).set({
        status: "uploading",
        campaignId: input.campaignId,
        adSetId: input.adSetId,
        updatedAt: new Date(),
      }).where(eq(adCreatives.id, input.creativeId));

      try {
        const resultMsg = await executeMetaAction("meta_create_full_ad", {
          campaignId: input.campaignId,
          adSetId: input.adSetId,
          adName: creative.briefTitle,
          imageUrl: `data:image/png;base64,${creative.imageBase64}`,
          title: creative.generatedHeadline || creative.briefTitle,
          body: creative.generatedBody || creative.briefTitle,
          linkUrl: input.linkUrl || "https://www.feminnita.com.br",
          callToAction: input.callToAction || "SHOP_NOW",
        });

        const metaAdId = resultMsg.match(/ID:\s*(\d+)/)?.[1];
        await db.update(adCreatives).set({ status: "executed", metaAdId, updatedAt: new Date() })
          .where(eq(adCreatives.id, input.creativeId));

        return { success: true, message: resultMsg, metaAdId };
      } catch (err: any) {
        await db.update(adCreatives).set({ status: "failed", errorMessage: err.message, updatedAt: new Date() })
          .where(eq(adCreatives.id, input.creativeId));
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: err.message });
      }
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

    // Verificar se já existe briefing do dia em cache
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
        generating: false,
      };
    }

    // Nenhum briefing em cache — disparar geração em background e retornar placeholder
    // Isso evita o 504 causado pelo bloqueio de Meta API + Claude na carga da página
    const userId = ctx.user.id;
    (async () => {
      try {
        const creds = await getValidMetaCredentials(userId) ?? undefined;
        const metaData = await fetchMetaAdsData(creds);
        const briefingData = await generateDailyBriefing(
          metaData.campaigns.length > 0
            ? {
                adAccountId: creds?.accountId,
                spendToday: metaData.spendToday,
                spendMonth: metaData.spendMonth,
                campaigns: metaData.campaigns.map((c) => ({
                  name: c.name,
                  spend: c.spend,
                  roas: c.roas,
                  cpm: c.cpm,
                  ctr: c.ctr,
                  status: c.status,
                })),
              }
            : undefined
        );
        // Inserir apenas se ainda não existe (evitar corrida)
        const dbInner = await getDb();
        if (!dbInner) return;
        const [check] = await dbInner
          .select({ id: trafficDailyBriefings.id })
          .from(trafficDailyBriefings)
          .where(
            and(
              eq(trafficDailyBriefings.userId, userId),
              eq(trafficDailyBriefings.date, today)
            )
          )
          .limit(1);
        if (!check) {
          await dbInner.insert(trafficDailyBriefings).values({
            userId,
            date: today,
            data: JSON.stringify(briefingData),
          });
        }
      } catch (err: any) {
        console.error("[getDailyBriefing] Erro em background:", err.message);
      }
    })();

    // Retorna placeholder imediatamente — cliente faz polling via regenerateBriefing
    return {
      id: null,
      userId,
      date: today,
      data: {
        date: today.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }),
        spendToday: "Carregando…",
        spendMonth: "Carregando…",
        topCampaigns: [],
        alerts: [{ level: "info" as const, message: "Briefing sendo gerado, aguarde alguns segundos e atualize." }],
        recommendations: [],
        summary: "Gerando briefing com dados reais da Meta Ads…",
      },
      generating: true,
      createdAt: new Date(),
      updatedAt: new Date(),
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

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const userId = ctx.user.id;

    // Disparar geração em background e retornar imediatamente
    (async () => {
      try {
        const creds = await getValidMetaCredentials(userId) ?? undefined;
        const metaData = await fetchMetaAdsData(creds);
        const briefingData = await generateDailyBriefing(
          metaData.campaigns.length > 0
            ? {
                adAccountId: creds?.accountId,
                spendToday: metaData.spendToday,
                spendMonth: metaData.spendMonth,
                campaigns: metaData.campaigns.map((c) => ({
                  name: c.name,
                  spend: c.spend,
                  roas: c.roas,
                  cpm: c.cpm,
                  ctr: c.ctr,
                  status: c.status,
                })),
              }
            : undefined
        );
        const dbInner = await getDb();
        if (!dbInner) return;
        const existing = await dbInner
          .select({ id: trafficDailyBriefings.id })
          .from(trafficDailyBriefings)
          .where(
            and(
              eq(trafficDailyBriefings.userId, userId),
              eq(trafficDailyBriefings.date, today)
            )
          )
          .limit(1);
        if (existing.length > 0) {
          await dbInner
            .update(trafficDailyBriefings)
            .set({ data: JSON.stringify(briefingData), updatedAt: new Date() })
            .where(eq(trafficDailyBriefings.id, existing[0].id));
        } else {
          await dbInner.insert(trafficDailyBriefings).values({
            userId,
            date: today,
            data: JSON.stringify(briefingData),
          });
        }
        console.log("[regenerateBriefing] Briefing gerado em background com sucesso");
      } catch (err: any) {
        console.error("[regenerateBriefing] Erro em background:", err.message);
      }
    })();

    return { success: true, generating: true };
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
        const creds = await getValidMetaCredentials(ctx.user.id) ?? undefined;
        try {
          if (actionType === "pause_campaign" && targetId) {
            await pauseCampaign(targetId, creds);
            executionResult = `Campanha pausada com sucesso na Meta Ads API`;
          } else if (actionType === "resume_campaign" && targetId) {
            await resumeCampaign(targetId, creds);
            executionResult = `Campanha reativada com sucesso na Meta Ads API`;
          } else if (actionType === "pause_adset" && targetId) {
            await pauseAdset(targetId, creds);
            executionResult = `Conjunto pausado com sucesso na Meta Ads API`;
          } else if (actionType === "resume_adset" && targetId) {
            await resumeAdset(targetId, creds);
            executionResult = `Conjunto reativado com sucesso na Meta Ads API`;
          } else if ((actionType === "increase_budget" || actionType === "decrease_budget") && targetId) {
            const newBudget = payload.new_daily_budget as number | undefined;
            if (newBudget) {
              // Detectar se é campanha ou adset pelo prefixo do ID (adsets têm IDs diferentes)
              const isCampaign = payload.target_type === "campaign";
              if (isCampaign) {
                await updateCampaignBudget(targetId, Math.round(newBudget * 100), creds);
              } else {
                await updateAdsetBudget(targetId, Math.round(newBudget * 100), undefined, creds);
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

  speak: protectedProcedure
    .input(z.object({ text: z.string().max(10000) }))
    .mutation(async ({ input }) => {
      const truncated = input.text.length > 4000 ? input.text.slice(0, 4000) + "…" : input.text;
      const audioBuffer = await textToSpeech(truncated, "fernanda");
      return { audioBase64: audioBuffer.toString("base64") };
    }),
});
