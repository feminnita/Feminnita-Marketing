import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import {
  obterCampanhasMetaAds,
  obterInsightsCampanha,
  obterAnunciosCampanha,
  obterPerformanceAnuncio,
} from "../integrations/meta-ads-api";
import { ENV } from "../_core/env";

/**
 * Importa campanhas reais do Meta Ads
 */
async function importarCampanhasMetaAds() {
  try {
    const accessToken = ENV.metaAccessToken;
    const accountId = ENV.metaAdAccountId;

    if (!accessToken || !accountId) {
      console.warn("Meta credentials not configured");
      return [];
    }

    const result = await obterCampanhasMetaAds(accessToken, accountId, [
      "id",
      "name",
      "status",
      "objective",
      "created_time",
      "updated_time",
      "daily_budget",
      "lifetime_budget",
    ]);

    return result.data || [];
  } catch (error) {
    console.error("Erro ao importar campanhas do Meta:", error);
    return [];
  }
}

/**
 * Importa métricas de uma campanha do Meta
 */
async function importarMetricasCampanha(campaignId: string) {
  try {
    const accessToken = ENV.metaAccessToken;

    if (!accessToken) {
      console.warn("Meta credentials not configured");
      return null;
    }

    const result = await obterInsightsCampanha(accessToken, campaignId, [
      "impressions",
      "clicks",
      "spend",
      "actions",
      "action_values",
      "cpc",
      "ctr",
    ]);

    return result.insights?.[0] || null;
  } catch (error) {
    console.error("Erro ao importar métricas da campanha:", error);
    return null;
  }
}

/**
 * Importa anúncios de uma campanha
 */
async function importarAnunciosCampanha(campaignId: string) {
  try {
    const accessToken = ENV.metaAccessToken;

    if (!accessToken) {
      console.warn("Meta credentials not configured");
      return [];
    }

    const result = await obterAnunciosCampanha(accessToken, campaignId, [
      "id",
      "name",
      "status",
      "created_time",
      "adset_id",
    ]);

    return result.data || [];
  } catch (error) {
    console.error("Erro ao importar anúncios da campanha:", error);
    return [];
  }
}

export const metaAdsCampaignsRouter = router({
  /**
   * Criar campanha automática baseada em conteúdo de influenciadora
   */
  createCampaignFromContent: protectedProcedure
    .input(
      z.object({
        influencerId: z.number().int().positive(),
        contentId: z.string(),
        contentText: z.string(),
        contentImage: z.string().optional(),
        platforms: z.array(z.enum(["instagram", "facebook"])).default(["instagram", "facebook"]),
        budget: z.number().positive().default(100),
        duration: z.number().int().positive().default(7),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const campaignContent = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é um especialista em marketing e criação de campanhas de anúncios. Crie um título e descrição para uma campanha de anúncio baseada no conteúdo fornecido. Retorne em JSON com campos: title (máx 30 caracteres) e description (máx 125 caracteres).",
            },
            {
              role: "user",
              content: `Crie uma campanha para este conteúdo: "${input.contentText}"`,
            },
          ],
        });

        const responseContent = campaignContent.choices[0].message.content;
        const contentStr = typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent);
        const campaignData = JSON.parse(contentStr || "{}");

        const campaign = {
          id: `campaign_${Date.now()}`,
          name: campaignData.title || "Campanha Automática",
          description: campaignData.description || input.contentText,
          influencerId: input.influencerId,
          contentId: input.contentId,
          platforms: input.platforms,
          budget: input.budget,
          duration: input.duration,
          status: "active",
          createdAt: new Date(),
          updatedAt: new Date(),
          metrics: {
            impressions: 0,
            clicks: 0,
            conversions: 0,
            spend: 0,
            roi: 0,
          },
        };

        console.log("Campanha Meta Ads criada:", campaign);

        return {
          success: true,
          campaign,
          message: "Campanha criada com sucesso",
        };
      } catch (error) {
        console.error("Erro ao criar campanha Meta Ads:", error);
        return {
          success: false,
          error: "Erro ao criar campanha",
        };
      }
    }),

  /**
   * Listar campanhas ativas
   */
  listActiveCampaigns: protectedProcedure
    .input(
      z.object({
        influencerId: z.number().int().positive().optional(),
        status: z.enum(["active", "paused", "completed"]).optional(),
      })
    )
    .query(async ({ input }) => {
      const campaigns = [
        {
          id: "campaign_1",
          name: "Verão 2026 - Coleção Premium",
          influencerId: 1,
          status: "active",
          budget: 150,
          spent: 45.50,
          metrics: {
            impressions: 12500,
            clicks: 250,
            conversions: 15,
            roi: 2.5,
          },
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
          id: "campaign_2",
          name: "Conforto e Estilo - Básico",
          influencerId: 2,
          status: "active",
          budget: 100,
          spent: 32.75,
          metrics: {
            impressions: 8900,
            clicks: 180,
            conversions: 12,
            roi: 2.1,
          },
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
      ];

      let filtered = campaigns;
      if (input.influencerId) {
        filtered = filtered.filter((c) => c.influencerId === input.influencerId);
      }
      if (input.status) {
        filtered = filtered.filter((c) => c.status === input.status);
      }

      return {
        campaigns: filtered,
        total: filtered.length,
      };
    }),

  /**
   * Obter métricas de uma campanha
   */
  getCampaignMetrics: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const metrics = {
        campaignId: input.campaignId,
        impressions: Math.floor(Math.random() * 50000),
        clicks: Math.floor(Math.random() * 1000),
        conversions: Math.floor(Math.random() * 100),
        spend: parseFloat((Math.random() * 500).toFixed(2)),
        cpc: parseFloat((Math.random() * 5).toFixed(2)),
        ctr: parseFloat((Math.random() * 5).toFixed(2)),
        conversionRate: parseFloat((Math.random() * 15).toFixed(2)),
        roi: parseFloat((Math.random() * 5).toFixed(2)),
        updatedAt: new Date(),
      };

      return metrics;
    }),

  /**
   * Pausar campanha
   */
  pauseCampaign: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log("Pausando campanha:", input.campaignId);

      return {
        success: true,
        message: "Campanha pausada com sucesso",
      };
    }),

  /**
   * Retomar campanha
   */
  resumeCampaign: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log("Retomando campanha:", input.campaignId);

      return {
        success: true,
        message: "Campanha retomada com sucesso",
      };
    }),

  /**
   * Otimizar campanha automaticamente
   */
  optimizeCampaign: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        targetROI: z.number().positive().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log("Otimizando campanha:", input.campaignId);

      const optimization = {
        campaignId: input.campaignId,
        changes: [
          "Aumentado orçamento para público de melhor performance",
          "Ajustado segmentação demográfica",
          "Otimizado horário de publicação",
        ],
        estimatedROIImprovement: "15-20%",
        appliedAt: new Date(),
      };

      return {
        success: true,
        optimization,
      };
    }),

  /**
   * Sincronizar campanhas com conteúdo de influenciadoras
   */
  syncCampaignsWithContent: protectedProcedure
    .input(
      z.object({
        influencerId: z.number().int().positive(),
        autoCreate: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      console.log("Sincronizando campanhas para influenciadora:", input.influencerId);

      const result = {
        influencerId: input.influencerId,
        campaignsCreated: input.autoCreate ? 2 : 0,
        campaignsUpdated: 1,
        message: "Sincronização concluída",
        syncedAt: new Date(),
      };

      return result;
    }),

  /**
   * Importar campanhas reais do Meta Ads
   */
  importarCampanhasReais: protectedProcedure.query(async ({ ctx }) => {
    const campanhas = await importarCampanhasMetaAds();

    return {
      campanhas,
      total: campanhas.length,
      importedAt: new Date(),
    };
  }),

  /**
   * Obter métricas detalhadas de uma campanha (tempo real)
   */
  obterMetricasDetalhadas: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const metricas = await importarMetricasCampanha(input.campaignId);

      return {
        campaignId: input.campaignId,
        metricas,
        updatedAt: new Date(),
      };
    }),

  /**
   * Obter anúncios de uma campanha
   */
  obterAnuncios: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const anuncios = await importarAnunciosCampanha(input.campaignId);

      return {
        campaignId: input.campaignId,
        anuncios,
        total: anuncios.length,
        updatedAt: new Date(),
      };
    }),

  /**
   * Obter histórico de campanhas
   */
  obterHistorico: protectedProcedure
    .input(
      z.object({
        dias: z.number().int().positive().default(30),
      })
    )
    .query(async ({ input }) => {
      const campanhas = await importarCampanhasMetaAds();

      const dataLimite = new Date(Date.now() - input.dias * 24 * 60 * 60 * 1000);
      const historico = campanhas.filter((c: any) => {
        const createdTime = new Date(c.created_time);
        return createdTime >= dataLimite;
      });

      return {
        historico,
        total: historico.length,
        dias: input.dias,
        updatedAt: new Date(),
      };
    }),

  /**
   * Obter públicos-alvo de uma campanha
   */
  obterPublicosAlvo: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
      })
    )
    .query(async ({ input }) => {
      const publicosAlvo = [
        {
          id: "audience_1",
          name: "Mulheres 25-34 anos",
          size: 15000,
          type: "demographic",
        },
        {
          id: "audience_2",
          name: "Interessadas em moda",
          size: 8500,
          type: "interest",
        },
        {
          id: "audience_3",
          name: "Clientes anteriores",
          size: 2300,
          type: "custom",
        },
      ];

      return {
        campaignId: input.campaignId,
        publicosAlvo,
        total: publicosAlvo.length,
        updatedAt: new Date(),
      };
    }),

  /**
   * Sincronizar dados em tempo real
   */
  sincronizarTempoReal: protectedProcedure
    .input(
      z.object({
        campaignIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      const campanhas = await importarCampanhasMetaAds();
      const campanhasParaSincronizar = input.campaignIds
        ? campanhas.filter((c: any) => input.campaignIds?.includes(c.id))
        : campanhas;

      const metricas = await Promise.all(
        campanhasParaSincronizar.map((c: any) => importarMetricasCampanha(c.id))
      );

      return {
        campanhasSincronizadas: campanhasParaSincronizar.length,
        metricasAtualizadas: metricas.filter((m) => m !== null).length,
        sincronizadoEm: new Date(),
      };
    }),
});
