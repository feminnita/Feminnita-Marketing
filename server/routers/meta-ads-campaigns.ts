import { router, protectedProcedure } from "../_core/trpc";
import { getDb } from "../db";

export const metaAdsCampaignsRouter = router({
  /**
   * Listar campanhas ativas
   */
  listActiveCampaigns: protectedProcedure.query(async () => {
    try {
      const metaAccessToken = process.env.META_ACCESS_TOKEN;
      const adAccountId = process.env.META_AD_ACCOUNT_ID;

      if (!metaAccessToken || !adAccountId) {
        return { campaigns: [], error: "META_ACCESS_TOKEN ou META_AD_ACCOUNT_ID não configurados" };
      }

      const response = await fetch(
        `https://graph.facebook.com/v18.0/${adAccountId}/campaigns?fields=id,name,status,objective,created_time,updated_time,daily_budget,lifetime_budget,spend,impressions,clicks&access_token=${metaAccessToken}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Erro ao buscar campanhas");
      }

      const data = await response.json();
      const campaigns = (data.data || [])
        .filter((c: any) => c.status === "ACTIVE")
        .map((c: any) => ({
          id: c.id,
          name: c.name,
          status: c.status,
          objective: c.objective,
          createdTime: c.created_time,
          updatedTime: c.updated_time,
          dailyBudget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : 0,
          lifetimeBudget: c.lifetime_budget ? parseFloat(c.lifetime_budget) / 100 : 0,
          spend: c.spend ? parseFloat(c.spend) : 0,
          impressions: parseInt(c.impressions || "0"),
          clicks: parseInt(c.clicks || "0"),
          ctr: c.impressions && c.clicks ? ((parseInt(c.clicks) / parseInt(c.impressions)) * 100).toFixed(2) : "0.00",
        }));

      return { campaigns, total: campaigns.length };
    } catch (error) {
      console.error("[Meta Ads Campaigns] Erro em listActiveCampaigns:", error);
      return { campaigns: [], error: (error as Error).message };
    }
  }),

  /**
   * Importar campanhas reais do Meta Ads
   */
  importarCampanhasReais: protectedProcedure.query(async () => {
    try {
      // Usar token de Meta Ads (nao Instagram)
      const metaAccessToken = process.env.META_ACCESS_TOKEN;
      const adAccountId = process.env.META_AD_ACCOUNT_ID;

      if (!metaAccessToken) {
        console.error("[Meta Ads Campaigns] META_ACCESS_TOKEN nao configurado");
        return { campanhas: [], error: "Token de Meta Ads nao configurado" };
      }

      if (!adAccountId) {
        console.error("[Meta Ads Campaigns] META_AD_ACCOUNT_ID nao configurado");
        return { campanhas: [], error: "ID da conta de anuncios nao configurado" };
      }

      console.log(`[Meta Ads Campaigns] Buscando campanhas para account ${adAccountId}`);

      // Usar endpoint correto: Meta Ads API (nao Instagram API)
      const campaignsResponse = await fetch(
        `https://graph.facebook.com/v18.0/${adAccountId}/campaigns?fields=id,name,status,objective,created_time,updated_time,daily_budget,lifetime_budget,spend,impressions,clicks,actions&access_token=${metaAccessToken}`
      );

      console.log(`[Meta Ads Campaigns] Status da resposta: ${campaignsResponse.status}`);

      if (!campaignsResponse.ok) {
        const errorData = await campaignsResponse.json();
        const errorMsg = errorData.error?.message || "Erro desconhecido";
        console.error(`[Meta Ads Campaigns] Erro na API: ${errorMsg}`);
        throw new Error(`Meta API Error: ${errorMsg}`);
      }

      const data = await campaignsResponse.json();
      console.log(`[Meta Ads Campaigns] Resposta da API:`, JSON.stringify(data).substring(0, 200));

      if (!data.data || data.data.length === 0) {
        console.log("[Meta Ads Campaigns] Nenhuma campanha encontrada");
        return { campanhas: [], message: "Nenhuma campanha encontrada" };
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
          dailyBudget: campaign.daily_budget ? parseFloat(campaign.daily_budget) : 0,
          lifetimeBudget: campaign.lifetime_budget ? parseFloat(campaign.lifetime_budget) : 0,
          spend: campaign.spend ? parseFloat(campaign.spend) : 0,
          impressions: campaign.impressions || 0,
          clicks: campaign.clicks || 0,
          actions: campaign.actions || [],
          roi: 0,
          ctr: 0,
          conversionRate: 0,
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
});
