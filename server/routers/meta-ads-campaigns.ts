import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { instagramAccounts } from "../../drizzle/schema";

export const metaAdsCampaignsRouter = router({
  /**
   * Listar campanhas ativas
   */
  listActiveCampaigns: protectedProcedure
    .input(
      z.object({
        status: z.enum(["active", "paused", "all"]).default("active"),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { campaigns: [] };

        // Obter conta Feminnita
        const account = await db
          .select()
          .from(instagramAccounts)
          .where(eq(instagramAccounts.accountType, "feminnita"))
          .limit(1);

        if (!account || account.length === 0) {
          return { campaigns: [] };
        }

        // Retornar campanhas vazias por enquanto
        // As campanhas reais virão de importarCampanhasReais
        return {
          campaigns: [],
          message: "Use importarCampanhasReais para sincronizar campanhas",
        };
      } catch (error) {
        console.error("[Meta Ads Campaigns] Erro ao listar campanhas:", error);
        return { campaigns: [] };
      }
    }),

  /**
   * Importar campanhas reais do Meta Ads
   */
  importarCampanhasReais: protectedProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return { campanhas: [] };

      // Obter conta Feminnita
      const account = await db
        .select()
        .from(instagramAccounts)
        .where(eq(instagramAccounts.accountType, "feminnita"))
        .limit(1);

      if (!account || account.length === 0) {
        throw new Error("Conta Feminnita não encontrada");
      }

      const igAccount = account[0];

      // Buscar campanhas usando Meta Graph API
      const adAccountId = process.env.META_AD_ACCOUNT_ID;
      if (!adAccountId) {
        throw new Error("META_AD_ACCOUNT_ID não configurado");
      }

      const campaignsResponse = await fetch(
        `https://graph.instagram.com/v18.0/${adAccountId}/campaigns?fields=id,name,status,objective,created_time,updated_time,spend,impressions,clicks,actions&access_token=${igAccount.accessToken}`
      );

      if (!campaignsResponse.ok) {
        const error = await campaignsResponse.json();
        throw new Error(`Meta API Error: ${error.error?.message || "Unknown error"}`);
      }

      const data = await campaignsResponse.json();

      if (!data.data) {
        return { campanhas: [] };
      }

      // Filtrar apenas campanhas ativas
      const activeCampaigns = data.data
        .filter((campaign: any) => campaign.status === "ACTIVE")
        .map((campaign: any) => ({
          id: campaign.id,
          name: campaign.name,
          status: campaign.status,
          objective: campaign.objective,
          createdTime: campaign.created_time,
          updatedTime: campaign.updated_time,
          spend: parseFloat(campaign.spend || "0"),
          impressions: campaign.impressions || 0,
          clicks: campaign.clicks || 0,
          actions: campaign.actions || [],
        }));

      console.log(
        `[Meta Ads Campaigns] ${activeCampaigns.length} campanhas ativas importadas`
      );

      return {
        campanhas: activeCampaigns,
        totalCampaigns: activeCampaigns.length,
        message: `${activeCampaigns.length} campanhas ativas sincronizadas`,
      };
    } catch (error) {
      console.error("[Meta Ads Campaigns] Erro ao importar campanhas:", error);
      return {
        campanhas: [],
        error: (error as Error).message,
      };
    }
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
      try {
        const db = await getDb();
        if (!db) return null;

        // Obter conta Feminnita
        const account = await db
          .select()
          .from(instagramAccounts)
          .where(eq(instagramAccounts.accountType, "feminnita"))
          .limit(1);

        if (!account || account.length === 0) {
          throw new Error("Conta Feminnita não encontrada");
        }

        const igAccount = account[0];

        // Buscar métricas da campanha
        const metricsResponse = await fetch(
          `https://graph.instagram.com/v18.0/${input.campaignId}/insights?fields=spend,impressions,clicks,actions,action_values,cost_per_action_type,cpc,cpm,cpp&access_token=${igAccount.accessToken}`
        );

        if (!metricsResponse.ok) {
          const error = await metricsResponse.json();
          throw new Error(`Meta API Error: ${error.error?.message || "Unknown error"}`);
        }

        const data = await metricsResponse.json();

        if (!data.data) {
          return null;
        }

        // Processar métricas
        const metricsMap: Record<string, any> = {};
        data.data.forEach((metric: any) => {
          metricsMap[metric.name] = metric.values?.[0]?.value || 0;
        });

        const spend = parseFloat(metricsMap.spend || "0");
        const impressions = metricsMap.impressions || 0;
        const clicks = metricsMap.clicks || 0;
        const actions = metricsMap.actions || 0;
        const actionValues = parseFloat(metricsMap.action_values || "0");

        // Calcular métricas derivadas
        const ctr = impressions > 0 ? (clicks / impressions) * 100 : 0;
        const conversionRate = clicks > 0 ? (actions / clicks) * 100 : 0;
        const roi = spend > 0 ? ((actionValues - spend) / spend) * 100 : 0;

        return {
          campaignId: input.campaignId,
          spend,
          impressions,
          clicks,
          cpc: parseFloat(metricsMap.cpc || "0"),
          cpm: parseFloat(metricsMap.cpm || "0"),
          cpp: parseFloat(metricsMap.cpp || "0"),
          actions,
          actionValues,
          ctr,
          conversionRate,
          roi,
        };
      } catch (error) {
        console.error("[Meta Ads Campaigns] Erro ao obter métricas:", error);
        return null;
      }
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
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Obter conta Feminnita
        const account = await db
          .select()
          .from(instagramAccounts)
          .where(eq(instagramAccounts.accountType, "feminnita"))
          .limit(1);

        if (!account || account.length === 0) {
          throw new Error("Conta Feminnita não encontrada");
        }

        const igAccount = account[0];

        // Pausar campanha via Meta API
        const pauseResponse = await fetch(
          `https://graph.instagram.com/v18.0/${input.campaignId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              status: "PAUSED",
              access_token: igAccount.accessToken,
            }),
          }
        );

        if (!pauseResponse.ok) {
          const error = await pauseResponse.json();
          throw new Error(`Meta API Error: ${error.error?.message || "Unknown error"}`);
        }

        console.log(`[Meta Ads Campaigns] Campanha ${input.campaignId} pausada`);

        return {
          success: true,
          message: "Campanha pausada com sucesso",
        };
      } catch (error) {
        console.error("[Meta Ads Campaigns] Erro ao pausar campanha:", error);
        throw error;
      }
    }),
});
