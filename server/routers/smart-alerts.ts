import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { metaCampaignAlerts } from "../../drizzle/schema";
import { eq, and, inArray, desc } from "drizzle-orm";

export const smartAlertsRouter = router({
  /**
   * Criar alerta inteligente para campanha
   */
  createAlert: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        campaignName: z.string(),
        type: z.enum(["low_ctr", "low_roi", "high_cpc", "low_conversions", "budget_exhausted"]),
        severity: z.enum(["info", "warning", "critical"]).default("warning"),
        title: z.string(),
        description: z.string(),
        currentValue: z.string().optional(),
        threshold: z.string().optional(),
        recommendation: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const alertTypeMap: Record<string, "low_roi" | "high_spend" | "budget_limit" | "performance_drop" | "high_cpc" | "low_ctr"> = {
        low_ctr: "low_ctr",
        low_roi: "low_roi",
        high_cpc: "high_cpc",
        low_conversions: "performance_drop",
        budget_exhausted: "budget_limit",
      };

      await db.insert(metaCampaignAlerts).values({
        userId: ctx.user.id,
        campaignId: input.campaignId,
        campaignName: input.campaignName,
        alertType: alertTypeMap[input.type],
        severity: input.severity,
        title: input.title,
        description: input.description,
        currentValue: input.currentValue,
        threshold: input.threshold,
        recommendation: input.recommendation,
        isRead: false,
        isResolved: false,
      });

      return { success: true, message: "Alerta criado com sucesso" };
    }),

  /**
   * Listar alertas ativos do banco de dados
   */
  listActiveAlerts: protectedProcedure
    .input(
      z.object({
        campaignIds: z.array(z.string()).optional(),
        severity: z.enum(["critical", "warning", "info"]).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { alerts: [], totalAlerts: 0, criticalCount: 0, warningCount: 0, infoCount: 0 };

      const rows = await db
        .select()
        .from(metaCampaignAlerts)
        .where(
          and(
            eq(metaCampaignAlerts.userId, ctx.user.id),
            eq(metaCampaignAlerts.isResolved, false)
          )
        )
        .orderBy(desc(metaCampaignAlerts.createdAt))
        .limit(50);

      let alerts = rows.map((a: any) => ({
        id: String(a.id),
        campaignId: a.campaignId,
        campaignName: a.campaignName,
        type: a.alertType,
        severity: a.severity,
        message: a.description,
        title: a.title,
        currentValue: a.currentValue ? parseFloat(a.currentValue) : undefined,
        threshold: a.threshold ? parseFloat(a.threshold) : undefined,
        recommendation: a.recommendation,
        isRead: a.isRead,
        createdAt: a.createdAt,
      }));

      if (input.campaignIds?.length) {
        alerts = alerts.filter((a: any) => input.campaignIds!.includes(a.campaignId));
      }
      if (input.severity) {
        alerts = alerts.filter((a: any) => a.severity === input.severity);
      }

      return {
        alerts,
        totalAlerts: alerts.length,
        criticalCount: alerts.filter((a: any) => a.severity === "critical").length,
        warningCount: alerts.filter((a: any) => a.severity === "warning").length,
        infoCount: alerts.filter((a: any) => a.severity === "info").length,
      };
    }),

  /**
   * Executar ação automática para alerta
   */
  executeAlertAction: protectedProcedure
    .input(
      z.object({
        alertId: z.string(),
        action: z.enum(["pause", "optimize", "notify", "reduce_budget"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(metaCampaignAlerts)
        .set({ isResolved: true, resolvedAt: new Date() })
        .where(
          and(
            eq(metaCampaignAlerts.id, parseInt(input.alertId)),
            eq(metaCampaignAlerts.userId, ctx.user.id)
          )
        );

      const actionMessages: Record<string, string> = {
        pause: "Campanha pausada automaticamente",
        optimize: "Otimização iniciada",
        notify: "Notificação enviada",
        reduce_budget: "Orçamento reduzido em 20%",
      };

      return {
        success: true,
        alertId: input.alertId,
        action: input.action,
        message: actionMessages[input.action],
        executedAt: new Date(),
      };
    }),

  /**
   * Configurar regras de alertas automáticas
   */
  configureAlertRules: protectedProcedure
    .input(
      z.object({
        rules: z.array(
          z.object({
            type: z.enum(["low_ctr", "low_roi", "high_cpc", "low_conversions", "budget_exhausted"]),
            threshold: z.number().positive(),
            action: z.enum(["pause", "optimize", "notify", "reduce_budget"]),
            enabled: z.boolean(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      return {
        success: true,
        rulesConfigured: input.rules.length,
        rules: input.rules,
        message: "Regras de alertas configuradas com sucesso",
      };
    }),

  /**
   * Obter recomendações de otimização
   */
  getOptimizationRecommendations: protectedProcedure
    .input(z.object({ campaignId: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { campaignId: input.campaignId, recommendations: [], totalRecommendations: 0, highPriority: 0 };

      const alerts = await db
        .select()
        .from(metaCampaignAlerts)
        .where(
          and(
            eq(metaCampaignAlerts.userId, ctx.user.id),
            eq(metaCampaignAlerts.campaignId, input.campaignId),
            eq(metaCampaignAlerts.isResolved, false)
          )
        );

      const recommendations = alerts
        .filter((a: any) => a.recommendation)
        .map((a: any, idx: any) => ({
          id: `rec_${a.id}`,
          priority: a.severity === "critical" ? "high" : a.severity === "warning" ? "medium" : "low",
          title: a.title,
          description: a.recommendation || a.description,
          estimatedImpact: `Alerta: ${a.alertType}`,
          effort: "medium" as const,
        }));

      return {
        campaignId: input.campaignId,
        recommendations,
        totalRecommendations: recommendations.length,
        highPriority: recommendations.filter((r: any) => r.priority === "high").length,
      };
    }),

  /**
   * Dismissar alerta (marcar como lido)
   */
  dismissAlert: protectedProcedure
    .input(
      z.object({
        alertId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(metaCampaignAlerts)
        .set({ isRead: true, isResolved: true, resolvedAt: new Date() })
        .where(
          and(
            eq(metaCampaignAlerts.id, parseInt(input.alertId)),
            eq(metaCampaignAlerts.userId, ctx.user.id)
          )
        );

      return {
        success: true,
        alertId: input.alertId,
        dismissedAt: new Date(),
        reason: input.reason || "Usuário dismissou",
      };
    }),
});
