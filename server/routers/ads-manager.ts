import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { adsEvaluations, adsEvaluationMessages, agentActions } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { textToSpeech } from "../services/tts";
import { runAdsEvaluation, chatWithAgent, collectAdsData } from "../agents/ads-manager-agent";
import { executeMetaAction } from "../agents/fernanda-executor";

export const adsManagerRouter = router({
  /**
   * Dispara uma nova avaliação da conta Meta Ads.
   * Cria o registro com status "pending" e roda o agente em background.
   */
  triggerEvaluation: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Banco indisponível");

    const result = await db.insert(adsEvaluations).values({
      userId: ctx.user.id,
      adAccountId: process.env.META_AD_ACCOUNT_ID || "act_231648936319132",
      status: "pending",
      triggeredAt: new Date(),
      createdAt: new Date(),
    });

    const evaluationId = Array.isArray(result) ? result[0].insertId : (result as any).insertId;

    // Roda em background — não bloqueia a resposta
    runAdsEvaluation(evaluationId).catch((err) =>
      console.error("[AdsManager] Erro em runAdsEvaluation:", err)
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
        .from(adsEvaluations)
        .where(and(eq(adsEvaluations.id, input.id), eq(adsEvaluations.userId, ctx.user.id)));

      if (!rows.length) throw new Error("Avaliação não encontrada");

      const ev = rows[0];
      return {
        ...ev,
        rawMetrics: ev.rawMetrics ? JSON.parse(ev.rawMetrics) : null,
        recommendations: ev.recommendations ? JSON.parse(ev.recommendations) : [],
      };
    }),

  /**
   * Lista todas as avaliações do usuário (histórico).
   */
  listEvaluations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select({
        id: adsEvaluations.id,
        status: adsEvaluations.status,
        summary: adsEvaluations.summary,
        errorMessage: adsEvaluations.errorMessage,
        triggeredAt: adsEvaluations.triggeredAt,
        completedAt: adsEvaluations.completedAt,
      })
      .from(adsEvaluations)
      .where(eq(adsEvaluations.userId, ctx.user.id))
      .orderBy(desc(adsEvaluations.triggeredAt))
      .limit(20);

    return rows;
  }),

  /**
   * Envia uma mensagem de follow-up para o agente sobre uma avaliação específica.
   */
  sendMessage: protectedProcedure
    .input(z.object({
      evaluationId: z.number(),
      message: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      // Verifica ownership
      const ev = await db
        .select()
        .from(adsEvaluations)
        .where(and(eq(adsEvaluations.id, input.evaluationId), eq(adsEvaluations.userId, ctx.user.id)));

      if (!ev.length || ev[0].status !== "done") {
        throw new Error("Avaliação não encontrada ou ainda não concluída");
      }

      // Salva mensagem do usuário
      await db.insert(adsEvaluationMessages).values({
        evaluationId: input.evaluationId,
        userId: ctx.user.id,
        role: "user",
        content: input.message,
        createdAt: new Date(),
      });

      // Busca histórico da conversa
      const history = await db
        .select()
        .from(adsEvaluationMessages)
        .where(eq(adsEvaluationMessages.evaluationId, input.evaluationId))
        .orderBy(adsEvaluationMessages.createdAt);

      // Chama o agente
      const reply = await chatWithAgent(
        history.map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content })),
        ev[0].rawMetrics || "[]"
      );

      // Salva resposta do agente
      await db.insert(adsEvaluationMessages).values({
        evaluationId: input.evaluationId,
        userId: ctx.user.id,
        role: "assistant",
        content: reply,
        createdAt: new Date(),
      });

      return { reply };
    }),

  /**
   * Busca campanhas ao vivo diretamente da Meta Ads API (sem criar avaliação).
   * Retorna dados brutos de campanhas + insights dos últimos 7 dias.
   */
  listCampaigns: protectedProcedure.query(async () => {
    if (!process.env.META_ACCESS_TOKEN) throw new Error("META_ACCESS_TOKEN não configurado");
    return collectAdsData();
  }),

  /**
   * Lista mensagens de uma conversa.
   */
  getMessages: protectedProcedure
    .input(z.object({ evaluationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      // Verifica ownership
      const ev = await db
        .select({ id: adsEvaluations.id })
        .from(adsEvaluations)
        .where(and(eq(adsEvaluations.id, input.evaluationId), eq(adsEvaluations.userId, ctx.user.id)));

      if (!ev.length) return [];

      return db
        .select()
        .from(adsEvaluationMessages)
        .where(eq(adsEvaluationMessages.evaluationId, input.evaluationId))
        .orderBy(adsEvaluationMessages.createdAt);
    }),

  /**
   * Converte texto em áudio MP3 via ElevenLabs (voz da Fernanda).
   * Retorna o áudio como base64 para o frontend tocar diretamente.
   */
  speak: protectedProcedure
    .input(z.object({ text: z.string().max(2500), agentName: z.string().optional() }))
    .mutation(async ({ input }) => {
      const audioBuffer = await textToSpeech(input.text, input.agentName ?? "fernanda");
      return { audioBase64: audioBuffer.toString("base64") };
    }),

  /**
   * Propõe uma ação Meta Ads para aprovação do usuário.
   * Fernanda usa isso para registrar o que quer fazer antes de executar.
   */
  proposeAction: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string(), // JSON com payload da ação
      actionType: z.enum(["meta_pause_campaign", "meta_resume_campaign", "meta_update_budget", "meta_create_campaign", "meta_duplicate_campaign"]),
      priority: z.enum(["alta", "media", "baixa"]).default("media"),
      estimatedImpact: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");
      const today = new Date().toISOString().slice(0, 10);
      await db.insert(agentActions).values({
        agentName: "fernanda",
        date: today,
        title: input.title,
        description: input.description,
        actionType: input.actionType,
        priority: input.priority,
        estimatedImpact: input.estimatedImpact || "",
        status: "pending",
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return { ok: true };
    }),

  /**
   * Executa uma ação Meta Ads aprovada pelo usuário.
   * Chama a Meta Marketing API com permissão ads_management.
   */
  executeAction: protectedProcedure
    .input(z.object({ actionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const [action] = await db.select().from(agentActions)
        .where(eq(agentActions.id, input.actionId)).limit(1);

      if (!action) throw new Error("Ação não encontrada");
      if (action.status !== "approved") throw new Error("Ação precisa estar aprovada antes de executar");

      // Marca como executando
      await db.update(agentActions).set({ status: "executing", updatedAt: new Date() })
        .where(eq(agentActions.id, input.actionId));

      try {
        const payload = JSON.parse(action.description);
        const resultMsg = await executeMetaAction(action.actionType, payload);

        await db.update(agentActions)
          .set({ status: "done", userNote: resultMsg, updatedAt: new Date() })
          .where(eq(agentActions.id, input.actionId));

        return { ok: true, message: resultMsg };
      } catch (err: any) {
        await db.update(agentActions)
          .set({ status: "pending", userNote: `Erro: ${err.message}`, updatedAt: new Date() })
          .where(eq(agentActions.id, input.actionId));
        throw new Error(err.message);
      }
    }),

  /**
   * Lista ações pendentes/aprovadas da Fernanda (fila de execução Meta Ads).
   */
  listFernandaActions: protectedProcedure
    .input(z.object({ status: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const rows = await db.select().from(agentActions)
        .where(and(
          eq(agentActions.agentName, "fernanda"),
          input.status ? eq(agentActions.status, input.status as any) : undefined as any,
        ))
        .orderBy(desc(agentActions.createdAt))
        .limit(20);
      return rows.filter(Boolean);
    }),
});
