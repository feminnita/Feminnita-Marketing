import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const campaignMetricsSyncRouter = router({
  /**
   * Sincronizar métricas de campanhas em tempo real
   */
  syncMetricsRealtime: protectedProcedure
    .input(
      z.object({
        campaignIds: z.array(z.string()).optional(),
        interval: z.number().int().positive().default(30), // minutos
      })
    )
    .mutation(async ({ input }) => {
      console.log("Sincronizando métricas em tempo real para campanhas:", input.campaignIds);

      // Simular sincronização com Meta Ads API
      const syncResult = {
        campaignsSynced: input.campaignIds?.length || 0,
        metricsUpdated: Math.floor(Math.random() * 50) + 10,
        lastSync: new Date(),
        nextSync: new Date(Date.now() + input.interval * 60 * 1000),
        status: "success",
      };

      return syncResult;
    }),

  /**
   * Obter histórico de métricas de uma campanha
   */
  getCampaignMetricsHistory: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        days: z.number().int().positive().default(7),
      })
    )
    .query(async ({ input }) => {
      // Simular histórico de métricas
      const history = [];
      for (let i = input.days; i >= 0; i--) {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        history.push({
          date: date.toISOString().split("T")[0],
          impressions: Math.floor(Math.random() * 10000) + 1000,
          clicks: Math.floor(Math.random() * 500) + 50,
          conversions: Math.floor(Math.random() * 50) + 5,
          spend: parseFloat((Math.random() * 200 + 50).toFixed(2)),
          roi: parseFloat((Math.random() * 5 + 1).toFixed(2)),
        });
      }

      return {
        campaignId: input.campaignId,
        history,
        trend: "up", // up, down, stable
      };
    }),

  /**
   * Comparar performance de múltiplas campanhas
   */
  comparePerformance: protectedProcedure
    .input(
      z.object({
        campaignIds: z.array(z.string()).min(2).max(5),
      })
    )
    .query(async ({ input }) => {
      // Simular comparação de performance
      const comparison = input.campaignIds.map((id) => ({
        campaignId: id,
        impressions: Math.floor(Math.random() * 50000) + 5000,
        clicks: Math.floor(Math.random() * 1000) + 100,
        conversions: Math.floor(Math.random() * 100) + 10,
        ctr: parseFloat((Math.random() * 5 + 0.5).toFixed(2)),
        roi: parseFloat((Math.random() * 5 + 1).toFixed(2)),
        spend: parseFloat((Math.random() * 1000 + 100).toFixed(2)),
      }));

      // Encontrar melhor performance
      const bestPerformer = comparison.reduce((best, current) =>
        current.roi > best.roi ? current : best
      );

      return {
        campaigns: comparison,
        bestPerformer: bestPerformer.campaignId,
        totalSpend: comparison.reduce((sum, c) => sum + c.spend, 0),
        totalROI: parseFloat(
          (comparison.reduce((sum, c) => sum + c.roi, 0) / comparison.length).toFixed(2)
        ),
      };
    }),

  /**
   * Obter alertas de performance
   */
  getPerformanceAlerts: protectedProcedure
    .input(
      z.object({
        campaignIds: z.array(z.string()).optional(),
        thresholds: z
          .object({
            minCTR: z.number().optional().default(1),
            minROI: z.number().optional().default(2),
            maxCPC: z.number().optional().default(5),
          })
          .optional(),
      })
    )
    .query(async ({ input }) => {
      // Simular alertas de performance
      const alerts = [];

      // Simular campanhas com problemas
      if (Math.random() > 0.5) {
        alerts.push({
          type: "low_ctr",
          severity: "warning",
          message: "CTR abaixo do esperado (0.8%)",
          recommendation: "Considere revisar o público-alvo ou criativo do anúncio",
          campaignId: input.campaignIds?.[0] || "campaign_1",
        });
      }

      if (Math.random() > 0.6) {
        alerts.push({
          type: "low_roi",
          severity: "critical",
          message: "ROI abaixo da meta (1.5x)",
          recommendation: "Reduza o orçamento ou otimize a segmentação",
          campaignId: input.campaignIds?.[1] || "campaign_2",
        });
      }

      if (Math.random() > 0.7) {
        alerts.push({
          type: "high_cpc",
          severity: "warning",
          message: "CPC acima do esperado (R$ 6.50)",
          recommendation: "Aumente o orçamento ou melhore a qualidade do anúncio",
          campaignId: input.campaignIds?.[0] || "campaign_1",
        });
      }

      return {
        alerts,
        totalAlerts: alerts.length,
        criticalCount: alerts.filter((a) => a.severity === "critical").length,
        warningCount: alerts.filter((a) => a.severity === "warning").length,
      };
    }),

  /**
   * Configurar sincronização automática
   */
  configureAutoSync: protectedProcedure
    .input(
      z.object({
        enabled: z.boolean(),
        interval: z.number().int().positive().optional(), // minutos
        campaignIds: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("Configurando sincronização automática:", input);

      return {
        success: true,
        config: {
          enabled: input.enabled,
          interval: input.interval || 30,
          campaignIds: input.campaignIds || "all",
          nextSync: new Date(Date.now() + (input.interval || 30) * 60 * 1000),
        },
        message: input.enabled ? "Sincronização automática ativada" : "Sincronização automática desativada",
      };
    }),
});
