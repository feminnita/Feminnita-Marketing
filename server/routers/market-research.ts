import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { marketingResearchReports, competitorData, contentBriefs } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

export const marketResearchRouter = router({
  /**
   * Busca o último relatório de pesquisa de mercado do usuário logado
   */
  getLatestReport: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const rows = await db
      .select()
      .from(marketingResearchReports)
      .where(eq(marketingResearchReports.userId, ctx.user.id))
      .orderBy(desc(marketingResearchReports.createdAt))
      .limit(1);

    return rows[0] ?? null;
  }),

  /**
   * Lista os últimos 30 relatórios com data e resumo
   */
  listReports: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select({
        id: marketingResearchReports.id,
        reportDate: marketingResearchReports.reportDate,
        weeklyStrategy: marketingResearchReports.weeklyStrategy,
        createdAt: marketingResearchReports.createdAt,
      })
      .from(marketingResearchReports)
      .where(eq(marketingResearchReports.userId, ctx.user.id))
      .orderBy(desc(marketingResearchReports.createdAt))
      .limit(30);

    return rows;
  }),

  /**
   * Busca relatório por id
   */
  getReport: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const rows = await db
        .select()
        .from(marketingResearchReports)
        .where(
          and(
            eq(marketingResearchReports.id, input.id),
            eq(marketingResearchReports.userId, ctx.user.id)
          )
        )
        .limit(1);

      return rows[0] ?? null;
    }),

  /**
   * Lista competitor_data do usuário, ordenado por detectedAt desc, limit 50
   */
  listCompetitors: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const rows = await db
      .select()
      .from(competitorData)
      .where(eq(competitorData.userId, ctx.user.id))
      .orderBy(desc(competitorData.detectedAt))
      .limit(50);

    return rows;
  }),

  /**
   * Dispara pesquisa de mercado imediatamente via LLM e salva o resultado para o usuário logado
   */
  generateNow: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const today = new Date().toISOString().slice(0, 10);

    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em marketing digital para moda feminina e varejo de atacado brasileiro. Você analisa o mercado de pijamas femininos, tendências de consumo e estratégias de concorrentes no Instagram e TikTok.",
        },
        {
          role: "user",
          content: `Faça uma análise completa de mercado para Feminnita Pijamas para a data ${today}. Inclua: 1) Análise de 5 concorrentes do segmento (marcas de pijamas femininos no Brasil como Lua Cheia, Mafra, Liganete, Finou, Daluf), 2) Hashtags trending para o nicho, 3) Tipos de conteúdo com melhor performance no momento, 4) Oportunidades identificadas, 5) Estratégia recomendada para a semana. Retorne JSON.`,
        },
      ],
      outputSchema: {
        name: "market_research",
        schema: {
          type: "object",
          properties: {
            competitors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  strategy: { type: "string" },
                  topContent: { type: "string" },
                  strengths: { type: "string" },
                },
                required: ["name", "strategy", "topContent", "strengths"],
              },
            },
            trendingHashtags: { type: "array", items: { type: "string" } },
            contentOpportunities: { type: "array", items: { type: "string" } },
            audienceInsights: { type: "string" },
            weeklyStrategy: { type: "string" },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "string", enum: ["alta", "media", "baixa"] },
                  action: { type: "string" },
                  rationale: { type: "string" },
                },
                required: ["priority", "action", "rationale"],
              },
            },
          },
          required: [
            "competitors",
            "trendingHashtags",
            "contentOpportunities",
            "audienceInsights",
            "weeklyStrategy",
            "recommendations",
          ],
          additionalProperties: false,
        },
        strict: true,
      },
    });

    const raw = result.choices?.[0]?.message?.content;
    if (!raw) throw new Error("LLM retornou resposta vazia");

    const research = typeof raw === "string" ? JSON.parse(raw) : raw;

    const inserted = await db
      .insert(marketingResearchReports)
      .values({
        userId: ctx.user.id,
        reportDate: today,
        competitorInsights: {
          competitors: research.competitors,
          gaps: [],
          opportunities: research.contentOpportunities,
        },
        trendingHashtags: research.trendingHashtags,
        contentOpportunities: research.contentOpportunities,
        audienceInsights: research.audienceInsights,
        weeklyStrategy: research.weeklyStrategy,
        recommendations: research.recommendations,
        rawAnalysis: JSON.stringify(research),
      });

    return {
      success: true,
      reportDate: today,
      competitorCount: research.competitors.length,
      hashtagCount: research.trendingHashtags.length,
      recommendationCount: research.recommendations.length,
    };
  }),

  /**
   * Lista content_briefs do usuário com filtro opcional de status e briefType
   */
  listContentBriefs: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "generated", "approved", "published"]).optional(),
        briefType: z.enum(["carousel", "reel", "story", "post", "feed"]).optional(),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [eq(contentBriefs.userId, ctx.user.id)];
      if (input?.status) conditions.push(eq(contentBriefs.status, input.status));
      if (input?.briefType) conditions.push(eq(contentBriefs.briefType, input.briefType));

      const rows = await db
        .select()
        .from(contentBriefs)
        .where(and(...conditions))
        .orderBy(desc(contentBriefs.createdAt));

      return rows;
    }),

  /**
   * Busca brief por id
   */
  getContentBrief: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return null;

      const rows = await db
        .select()
        .from(contentBriefs)
        .where(
          and(
            eq(contentBriefs.id, input.id),
            eq(contentBriefs.userId, ctx.user.id)
          )
        )
        .limit(1);

      return rows[0] ?? null;
    }),

  /**
   * Atualiza status do brief
   */
  updateBriefStatus: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["pending", "generated", "approved", "published"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(contentBriefs)
        .set({ status: input.status })
        .where(
          and(
            eq(contentBriefs.id, input.id),
            eq(contentBriefs.userId, ctx.user.id)
          )
        );

      return { success: true, id: input.id, status: input.status };
    }),

  /**
   * Cria um novo content_brief manualmente
   */
  createBrief: protectedProcedure
    .input(
      z.object({
        briefType: z.enum(["carousel", "reel", "story", "post", "feed"]),
        topic: z.string().min(1),
        influencerId: z.number().optional(),
        targetAudience: z.string().optional(),
        keyMessages: z.array(z.string()).optional(),
        callToAction: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db.insert(contentBriefs).values({
        userId: ctx.user.id,
        briefType: input.briefType,
        topic: input.topic,
        influencerId: input.influencerId ?? null,
        targetAudience: input.targetAudience ?? null,
        keyMessages: input.keyMessages ?? [],
        callToAction: input.callToAction ?? null,
        status: "pending",
      });

      return { success: true, message: "Brief criado com sucesso" };
    }),
});
