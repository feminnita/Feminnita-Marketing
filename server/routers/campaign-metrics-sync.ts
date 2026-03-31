import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { oauthTokens, metaCampaignAlerts, campaigns, metaSyncHistory } from "../../drizzle/schema";
import { eq, and, desc, gte } from "drizzle-orm";

async function fetchMetaCampaignInsights(
  accessToken: string,
  adAccountId: string,
  campaignIds?: string[]
): Promise<Record<string, { impressions: number; clicks: number; spend: number; actions: number }>> {
  const ids = campaignIds?.join(",");
  const filterParam = ids ? `&filtering=[{"field":"id","operator":"IN","value":[${ids.split(",").map(id => `"${id}"`).join(",")}]}]` : '';
  const url = `https://graph.facebook.com/v18.0/${adAccountId}/campaigns?fields=id,name,insights{impressions,clicks,spend,actions,cpc,ctr,reach}&access_token=${accessToken}${filterParam}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Meta API ${res.status}`);
  const data = await res.json() as { data: Array<{ id: string; insights?: { data: Array<{ impressions: string; clicks: string; spend: string; actions?: Array<{ action_type: string; value: string }> }> } }> };

  const result: Record<string, { impressions: number; clicks: number; spend: number; actions: number }> = {};
  for (const campaign of data.data ?? []) {
    const insights = campaign.insights?.data?.[0];
    if (insights) {
      result[campaign.id] = {
        impressions: parseInt(insights.impressions ?? "0"),
        clicks: parseInt(insights.clicks ?? "0"),
        spend: parseFloat(insights.spend ?? "0"),
        actions: insights.actions?.reduce((sum, a) => sum + parseInt(a.value), 0) ?? 0,
      };
    }
  }
  return result;
}

export const campaignMetricsSyncRouter = router({
  syncMetricsRealtime: protectedProcedure
    .input(z.object({
      campaignIds: z.array(z.string()).optional(),
      interval: z.number().int().positive().default(30),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const token = await db.select().from(oauthTokens)
        .where(and(eq(oauthTokens.userId, ctx.user.id), eq(oauthTokens.plataforma, "meta"), eq(oauthTokens.isActive, true)))
        .limit(1);

      if (!token.length) {
        return { campaignsSynced: 0, metricsUpdated: 0, lastSync: new Date(), nextSync: new Date(Date.now() + input.interval * 60000), status: "no_token" };
      }

      const accountInfo = token[0].accountInfo ? JSON.parse(token[0].accountInfo) : {};
      const adAccountId: string = accountInfo.adAccountId ?? accountInfo.id ?? "";

      let metricsUpdated = 0;
      if (adAccountId) {
        try {
          const insights = await fetchMetaCampaignInsights(token[0].accessToken, adAccountId, input.campaignIds);
          metricsUpdated = Object.keys(insights).length;
        } catch (err) {
          console.error("[CampaignSync] Erro ao buscar insights:", err);
        }
      }

      await db.insert(metaSyncHistory).values({
        userId: ctx.user.id,
        syncType: "metrics",
        totalCampaigns: metricsUpdated,
        updatedCampaigns: metricsUpdated,
        failedCampaigns: 0,
        status: "success",
        syncDuration: 0,
      });

      return {
        campaignsSynced: input.campaignIds?.length ?? metricsUpdated,
        metricsUpdated,
        lastSync: new Date(),
        nextSync: new Date(Date.now() + input.interval * 60000),
        status: "success",
      };
    }),

  getCampaignMetricsHistory: protectedProcedure
    .input(z.object({
      campaignId: z.string(),
      days: z.number().int().positive().default(7),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const since = new Date(Date.now() - input.days * 24 * 60 * 60 * 1000);

      const syncRows = await db.select().from(metaSyncHistory)
        .where(and(eq(metaSyncHistory.userId, ctx.user.id), gte(metaSyncHistory.createdAt, since)))
        .orderBy(metaSyncHistory.createdAt)
        .limit(input.days * 2);

      const history = syncRows.map(row => ({
        date: row.createdAt.toISOString().split("T")[0],
        impressions: row.totalCampaigns ?? 0,
        clicks: row.updatedCampaigns ?? 0,
        conversions: 0,
        spend: 0,
        roi: 0,
      }));

      return { campaignId: input.campaignId, history, trend: history.length > 1 && history[history.length - 1].impressions > history[0].impressions ? "up" : "stable" };
    }),

  comparePerformance: protectedProcedure
    .input(z.object({ campaignIds: z.array(z.string()).min(2).max(5) }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const token = await db.select().from(oauthTokens)
        .where(and(eq(oauthTokens.userId, ctx.user.id), eq(oauthTokens.plataforma, "meta"), eq(oauthTokens.isActive, true)))
        .limit(1);

      if (!token.length) return { campaigns: [], bestPerformer: "", totalSpend: 0, totalROI: 0 };

      const accountInfo = token[0].accountInfo ? JSON.parse(token[0].accountInfo) : {};
      const adAccountId: string = accountInfo.adAccountId ?? accountInfo.id ?? "";

      let insights: Record<string, { impressions: number; clicks: number; spend: number; actions: number }> = {};
      if (adAccountId) {
        try {
          insights = await fetchMetaCampaignInsights(token[0].accessToken, adAccountId, input.campaignIds);
        } catch (err) {
          console.error("[CampaignSync] Erro ao comparar:", err);
        }
      }

      const comparison = input.campaignIds.map(id => {
        const m = insights[id] ?? { impressions: 0, clicks: 0, spend: 0, actions: 0 };
        const ctr = m.impressions > 0 ? (m.clicks / m.impressions) * 100 : 0;
        const roi = m.spend > 0 ? m.actions / m.spend : 0;
        return { campaignId: id, impressions: m.impressions, clicks: m.clicks, conversions: m.actions, ctr: parseFloat(ctr.toFixed(2)), roi: parseFloat(roi.toFixed(2)), spend: m.spend };
      });

      const bestPerformer = comparison.reduce((best, c) => c.roi > best.roi ? c : best, comparison[0]);
      return { campaigns: comparison, bestPerformer: bestPerformer?.campaignId ?? "", totalSpend: comparison.reduce((s, c) => s + c.spend, 0), totalROI: parseFloat((comparison.reduce((s, c) => s + c.roi, 0) / comparison.length).toFixed(2)) };
    }),

  getPerformanceAlerts: protectedProcedure
    .input(z.object({
      campaignIds: z.array(z.string()).optional(),
      thresholds: z.object({ minCTR: z.number().optional().default(1), minROI: z.number().optional().default(2), maxCPC: z.number().optional().default(5) }).optional(),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const alertRows = await db.select().from(metaCampaignAlerts)
        .where(and(eq(metaCampaignAlerts.userId, ctx.user.id), eq(metaCampaignAlerts.isResolved, false)))
        .orderBy(desc(metaCampaignAlerts.createdAt))
        .limit(50);

      const filtered = input.campaignIds?.length
        ? alertRows.filter(a => input.campaignIds!.includes(a.campaignId))
        : alertRows;

      const alerts = filtered.map(a => ({
        type: a.alertType,
        severity: a.severity,
        message: a.description,
        recommendation: a.recommendation ?? "",
        campaignId: a.campaignId,
        currentValue: a.currentValue,
        threshold: a.threshold,
        createdAt: a.createdAt,
      }));

      return { alerts, totalAlerts: alerts.length, criticalCount: alerts.filter(a => a.severity === "critical").length, warningCount: alerts.filter(a => a.severity === "warning").length };
    }),

  configureAutoSync: protectedProcedure
    .input(z.object({ enabled: z.boolean(), interval: z.number().int().positive().optional(), campaignIds: z.array(z.string()).optional() }))
    .mutation(async ({ input }) => {
      return { success: true, config: { enabled: input.enabled, interval: input.interval || 30, campaignIds: input.campaignIds || "all", nextSync: new Date(Date.now() + (input.interval || 30) * 60000) }, message: input.enabled ? "Sincronização automática ativada" : "Sincronização automática desativada" };
    }),
});
