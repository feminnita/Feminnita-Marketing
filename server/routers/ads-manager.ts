import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { adsEvaluations, adsEvaluationMessages, agentActions, adCreatives, assetLibrary } from "../../drizzle/schema";
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
        creativeBriefs: ev.creativeBriefs ? JSON.parse(ev.creativeBriefs) : [],
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
      message: z.string().max(2000).default(""),
      imageBase64: z.string().optional(),
      imageMimeType: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      console.log("[AdsManager] sendMessage iniciado — evaluationId:", input.evaluationId, "hasImage:", !!input.imageBase64);
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      let ev: any[];
      try {
        ev = await db
          .select()
          .from(adsEvaluations)
          .where(and(eq(adsEvaluations.id, input.evaluationId), eq(adsEvaluations.userId, ctx.user.id)));
      } catch (err: any) {
        console.error("[AdsManager] Erro ao buscar avaliação:", err?.message);
        throw new Error(`Erro ao buscar avaliação: ${err?.message}`);
      }

      if (!ev.length || ev[0].status !== "done") {
        console.error("[AdsManager] Avaliação não encontrada ou não concluída:", ev[0]?.status);
        throw new Error("Avaliação não encontrada ou ainda não concluída");
      }

      const userContent = input.message || (input.imageBase64 ? "[imagem enviada]" : "");
      if (!userContent) throw new Error("Mensagem ou imagem obrigatória");

      await db.insert(adsEvaluationMessages).values({
        evaluationId: input.evaluationId,
        userId: ctx.user.id,
        role: "user",
        content: userContent,
        createdAt: new Date(),
      });

      const history = await db
        .select()
        .from(adsEvaluationMessages)
        .where(eq(adsEvaluationMessages.evaluationId, input.evaluationId))
        .orderBy(adsEvaluationMessages.createdAt);

      let reply: string;
      try {
        reply = await chatWithAgent(
          history.map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content })),
          ev[0].rawMetrics || "[]",
          input.imageBase64,
          input.imageMimeType,
          ctx.user?.name ?? undefined,
          ctx.user?.id,
        );
      } catch (err: any) {
        console.error("[AdsManager] Erro em chatWithAgent:", err?.message, err?.status, JSON.stringify(err?.error ?? {}));
        throw new Error(`Erro ao processar resposta: ${err?.message ?? "desconhecido"}`);
      }

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
    .input(z.object({ text: z.string().max(10000), agentName: z.string().optional() }))
    .mutation(async ({ input }) => {
      const truncated = input.text.length > 4000 ? input.text.slice(0, 4000) + "…" : input.text;
      const audioBuffer = await textToSpeech(truncated, input.agentName ?? "fernanda");
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

  // ── Listar ativos da biblioteca para o picker de criativos ───────────────
  listLibraryAssets: protectedProcedure
    .input(z.object({ category: z.string().optional() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      const conditions: any[] = [eq(assetLibrary.userId, ctx.user.id), eq(assetLibrary.isActive, true)];
      if (input.category) conditions.push(eq(assetLibrary.category, input.category as any));
      return db.select({
        id: assetLibrary.id,
        name: assetLibrary.name,
        url: assetLibrary.url,
        category: assetLibrary.category,
        aiAnalysis: assetLibrary.aiAnalysis,
      }).from(assetLibrary).where(and(...conditions)).orderBy(desc(assetLibrary.createdAt)).limit(50);
    }),

  // ── Solicitar criativo a partir de ativos da biblioteca ───────────────────
  requestCreativeFromLibrary: protectedProcedure
    .input(z.object({
      assetIds: z.array(z.number()).min(1).max(5),
      campaignType: z.string().optional(),
      targetAudience: z.string().optional(),
      textOverlay: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");
      const { inArray } = await import("drizzle-orm");
      const fs = await import("fs/promises");
      const path = await import("path");

      const assets = await db.select().from(assetLibrary)
        .where(and(eq(assetLibrary.userId, ctx.user.id), inArray(assetLibrary.id, input.assetIds)));
      if (!assets.length) throw new Error("Nenhum ativo encontrado");

      const { requestCreative } = await import("../agents/creative-agent");
      const results = [];

      for (const asset of assets) {
        // Lê o arquivo do disco — URL é relativa ex: /uploads/foto.jpg
        const filePath = path.resolve(process.cwd(), asset.url.replace(/^\//, ""));
        let imageBase64: string;
        try {
          const buf = await fs.readFile(filePath);
          imageBase64 = buf.toString("base64");
        } catch {
          // Fallback: tenta buscar via HTTP se for URL externa
          const res = await fetch(asset.url.startsWith("http") ? asset.url : `http://localhost:${process.env.PORT || 3000}${asset.url}`);
          const buf = await res.arrayBuffer();
          imageBase64 = Buffer.from(buf).toString("base64");
        }

        const result = await requestCreative(ctx.user.id, {
          title: asset.name,
          description: asset.aiAnalysis || asset.name,
          imageBase64Input: imageBase64,
          campaignType: input.campaignType || "prospeccao",
          targetAudience: input.targetAudience || "revendedoras",
          product: asset.name,
          textOverlay: input.textOverlay,
        });
        results.push(result);
      }

      return { count: results.length, creatives: results };
    }),

  // ── Solicitar criativo com imagem do usuário → Beatriz gera copy ──────────
  requestCreative: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      imageBase64: z.string(),
      campaignType: z.string().optional(),
      targetAudience: z.string().optional(),
      product: z.string().optional(),
      textOverlay: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { requestCreative } = await import("../agents/creative-agent");
      return requestCreative(ctx.user.id, {
        title: input.title,
        description: input.description || `Criativo enviado em ${new Date().toLocaleDateString("pt-BR")}`,
        imageBase64Input: input.imageBase64,
        campaignType: input.campaignType,
        targetAudience: input.targetAudience,
        product: input.product,
        textOverlay: input.textOverlay,
      });
    }),

  // ── Listar criativos aguardando aprovação ─────────────────────────────────
  listPendingCreatives: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(adCreatives)
      .where(and(eq(adCreatives.userId, ctx.user.id), eq(adCreatives.status, "pending_approval")))
      .orderBy(desc(adCreatives.createdAt))
      .limit(20);
  }),

  // ── Aprovar criativo e subir na Meta Ads (se campaignId + adSetId fornecidos) ─
  approveCreative: protectedProcedure
    .input(z.object({
      id: z.number(),
      headline: z.string().optional(),
      body: z.string().optional(),
      campaignId: z.string().optional(),
      adSetId: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const [creative] = await db.select().from(adCreatives)
        .where(and(eq(adCreatives.id, input.id), eq(adCreatives.userId, ctx.user.id)))
        .limit(1);
      if (!creative) throw new Error("Criativo não encontrado");

      const headline = input.headline || creative.generatedHeadline || "";
      const body = input.body || creative.generatedBody || "";
      const campaignId = input.campaignId || creative.campaignId || "";
      const adSetId = input.adSetId || creative.adSetId || "";

      // Se tem campanha + conjunto → sobe na Meta Ads agora
      if (campaignId && adSetId && creative.imageBase64) {
        await db.update(adCreatives)
          .set({ status: "uploading", updatedAt: new Date() })
          .where(eq(adCreatives.id, input.id));

        try {
          const { createFullAd } = await import("../agents/fernanda-executor");
          const result = await createFullAd({
            campaignId,
            adSetId,
            adName: creative.briefTitle,
            imageUrl: `data:image/jpeg;base64,${creative.imageBase64}`,
            title: headline,
            body,
            linkUrl: "https://www.feminnita.com.br",
          });

          await db.update(adCreatives)
            .set({
              status: "executed",
              metaAdId: result.adId,
              imageHash: result.imageHash,
              campaignId,
              adSetId,
              updatedAt: new Date(),
            })
            .where(eq(adCreatives.id, input.id));

          return { success: true, executed: true, adId: result.adId };
        } catch (err: any) {
          await db.update(adCreatives)
            .set({ status: "failed", errorMessage: err.message, updatedAt: new Date() })
            .where(eq(adCreatives.id, input.id));
          throw new Error("Falha ao subir na Meta Ads: " + err.message);
        }
      }

      // Sem campanha/conjunto — apenas aprova para execução posterior
      await db.update(adCreatives)
        .set({
          status: "approved",
          ...(headline ? { generatedHeadline: headline } : {}),
          ...(body ? { generatedBody: body } : {}),
          updatedAt: new Date(),
        })
        .where(eq(adCreatives.id, input.id));

      return { success: true, executed: false };
    }),

  // ── Rejeitar criativo ─────────────────────────────────────────────────────
  rejectCreative: protectedProcedure
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");
      await db.update(adCreatives)
        .set({ status: "rejected", rejectionReason: input.reason ?? null, updatedAt: new Date() })
        .where(and(eq(adCreatives.id, input.id), eq(adCreatives.userId, ctx.user.id)));
      return { success: true };
    }),
});
