import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { adsEvaluations, adsEvaluationMessages } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { textToSpeech } from "../services/tts";
import { runAdsEvaluation, chatWithAgent, collectAdsData } from "../agents/ads-manager-agent";

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
    .input(z.object({ text: z.string().max(2500) }))
    .mutation(async ({ input }) => {
      const audioBuffer = await textToSpeech(input.text);
      return { audioBase64: audioBuffer.toString("base64") };
    }),
});
