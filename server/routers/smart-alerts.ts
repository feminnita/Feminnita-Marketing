import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

export const smartAlertsRouter = router({
  /**
   * Criar alerta inteligente para campanha
   */
  createAlert: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
        type: z.enum(["low_ctr", "low_roi", "high_cpc", "low_conversions", "budget_exhausted"]),
        threshold: z.number().positive(),
        action: z.enum(["pause", "optimize", "notify", "reduce_budget"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("Criando alerta inteligente:", input);

      return {
        success: true,
        alertId: `alert_${Date.now()}`,
        campaign: input.campaignId,
        type: input.type,
        threshold: input.threshold,
        action: input.action || "notify",
        createdAt: new Date(),
      };
    }),

  /**
   * Listar alertas ativos
   */
  listActiveAlerts: protectedProcedure
    .input(
      z.object({
        campaignIds: z.array(z.string()).optional(),
        severity: z.enum(["critical", "warning", "info"]).optional(),
      })
    )
    .query(async ({ input }) => {
      // Simular alertas ativos
      const alerts = [
        {
          id: "alert_1",
          campaignId: input.campaignIds?.[0] || "campaign_1",
          type: "low_ctr",
          severity: "warning",
          message: "CTR abaixo de 1%",
          currentValue: 0.8,
          threshold: 1,
          suggestedAction: "Revisar público-alvo",
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          id: "alert_2",
          campaignId: input.campaignIds?.[1] || "campaign_2",
          type: "low_roi",
          severity: "critical",
          message: "ROI abaixo de 2x",
          currentValue: 1.5,
          threshold: 2,
          suggestedAction: "Reduzir orçamento ou otimizar segmentação",
          createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
        {
          id: "alert_3",
          campaignId: input.campaignIds?.[0] || "campaign_1",
          type: "high_cpc",
          severity: "warning",
          message: "CPC acima de R$ 5",
          currentValue: 6.5,
          threshold: 5,
          suggestedAction: "Aumentar orçamento ou melhorar qualidade do anúncio",
          createdAt: new Date(Date.now() - 30 * 60 * 1000),
        },
      ];

      // Filtrar por severity se fornecido
      const filtered = input.severity
        ? alerts.filter((a) => a.severity === input.severity)
        : alerts;

      return {
        alerts: filtered,
        totalAlerts: filtered.length,
        criticalCount: filtered.filter((a) => a.severity === "critical").length,
        warningCount: filtered.filter((a) => a.severity === "warning").length,
        infoCount: filtered.filter((a) => a.severity === "info").length,
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
    .mutation(async ({ input }) => {
      console.log("Executando ação para alerta:", input);

      const actionMessages = {
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
      console.log("Configurando regras de alertas:", input);

      return {
        success: true,
        rulesConfigured: input.rules.length,
        rules: input.rules,
        message: "Regras de alertas configuradas com sucesso",
      };
    }),

  /**
   * Obter recomendações de otimização baseadas em alertas
   */
  getOptimizationRecommendations: protectedProcedure
    .input(
      z.object({
        campaignId: z.string(),
      })
    )
    .query(async ({ input }) => {
      // Simular recomendações
      const recommendations = [
        {
          id: "rec_1",
          priority: "high",
          title: "Revisar público-alvo",
          description: "O CTR está abaixo da média. Considere ajustar a segmentação demográfica.",
          estimatedImpact: "Aumento de 15-20% no CTR",
          effort: "low",
        },
        {
          id: "rec_2",
          priority: "high",
          title: "Testar novo criativo",
          description: "Crie variações de anúncios para testar diferentes mensagens.",
          estimatedImpact: "Aumento de 10-25% no engajamento",
          effort: "medium",
        },
        {
          id: "rec_3",
          priority: "medium",
          title: "Ajustar horários de publicação",
          description: "Publique anúncios nos horários de pico de atividade do seu público.",
          estimatedImpact: "Aumento de 5-10% no ROI",
          effort: "low",
        },
        {
          id: "rec_4",
          priority: "medium",
          title: "Implementar retargeting",
          description: "Crie campanhas de retargeting para usuários que visitaram seu site.",
          estimatedImpact: "Aumento de 20-30% nas conversões",
          effort: "high",
        },
      ];

      return {
        campaignId: input.campaignId,
        recommendations,
        totalRecommendations: recommendations.length,
        highPriority: recommendations.filter((r) => r.priority === "high").length,
      };
    }),

  /**
   * Dismissar alerta
   */
  dismissAlert: protectedProcedure
    .input(
      z.object({
        alertId: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      console.log("Dismissando alerta:", input);

      return {
        success: true,
        alertId: input.alertId,
        dismissedAt: new Date(),
        reason: input.reason || "Usuário dismissou",
      };
    }),
});
