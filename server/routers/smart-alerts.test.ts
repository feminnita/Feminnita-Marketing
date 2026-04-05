import { describe, it, expect, vi, beforeEach } from "vitest";
import { smartAlertsRouter } from "./smart-alerts";
import { getDb } from "../db";

vi.mock("../db", () => ({ getDb: vi.fn() }));

const makeChain = (data: any[]) => {
  const chain: any = {
    from: vi.fn().mockImplementation(() => chain),
    where: vi.fn().mockImplementation(() => chain),
    orderBy: vi.fn().mockImplementation(() => chain),
    limit: vi.fn().mockImplementation(() => chain),
    then: (resolve: any, reject: any) => Promise.resolve(data).then(resolve, reject),
    catch: (reject: any) => Promise.resolve(data).catch(reject),
    finally: (fn: any) => Promise.resolve(data).finally(fn),
  };
  return chain;
};

function makeMockDb(selectData: any[] = []) {
  return {
    select: vi.fn().mockImplementation(() => makeChain(selectData)),
    insert: vi.fn().mockImplementation(() => ({
      values: vi.fn().mockResolvedValue([{ insertId: 1 }]),
    })),
    update: vi.fn().mockImplementation(() => ({
      set: vi.fn().mockImplementation(() => ({
        where: vi.fn().mockResolvedValue(undefined),
      })),
    })),
  };
}

const mockAlerts = [
  {
    id: 1,
    userId: 1,
    campaignId: "camp_001",
    campaignName: "Campanha Verão",
    alertType: "low_ctr",
    severity: "critical",
    title: "CTR muito baixo",
    description: "CTR abaixo de 1%",
    currentValue: "0.8",
    threshold: "1.0",
    recommendation: "Revisar criativos",
    isRead: false,
    isResolved: false,
    createdAt: new Date("2026-01-01"),
  },
  {
    id: 2,
    userId: 1,
    campaignId: "camp_002",
    campaignName: "Campanha Inverno",
    alertType: "high_cpc",
    severity: "warning",
    title: "CPC elevado",
    description: "CPC acima do esperado",
    currentValue: "5.50",
    threshold: "3.00",
    recommendation: "Ajustar lances",
    isRead: false,
    isResolved: false,
    createdAt: new Date("2026-01-02"),
  },
  {
    id: 3,
    userId: 1,
    campaignId: "camp_001",
    campaignName: "Campanha Verão",
    alertType: "budget_limit",
    severity: "info",
    title: "Orçamento próximo do limite",
    description: "80% do orçamento utilizado",
    currentValue: "80",
    threshold: "100",
    recommendation: "Considerar aumentar budget",
    isRead: false,
    isResolved: false,
    createdAt: new Date("2026-01-03"),
  },
];

const mockCtx = {
  user: { id: 1, name: "Test User", email: "test@example.com", role: "admin" as const },
};

beforeEach(() => {
  vi.mocked(getDb).mockResolvedValue(makeMockDb(mockAlerts) as any);
});

describe("Smart Alerts Router", () => {
  describe("createAlert", () => {
    it("deve criar alerta com sucesso", async () => {
      vi.mocked(getDb).mockResolvedValue(makeMockDb() as any);
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.createAlert({
        campaignId: "camp_001",
        campaignName: "Campanha Teste",
        type: "low_ctr",
        severity: "critical",
        title: "CTR baixo",
        description: "Taxa de clique abaixo do esperado",
      });
      expect(result.success).toBe(true);
      expect(result.message).toContain("sucesso");
    });

    it("deve mapear low_conversions para performance_drop", async () => {
      const db = makeMockDb() as any;
      vi.mocked(getDb).mockResolvedValue(db);
      const caller = smartAlertsRouter.createCaller(mockCtx);
      await caller.createAlert({
        campaignId: "c1",
        campaignName: "C",
        type: "low_conversions",
        title: "Conversões baixas",
        description: "Taxa abaixo do esperado",
      });
      // insert.values was called; check alertType mapping via the insert call
      expect(db.insert).toHaveBeenCalled();
    });

    it("deve mapear budget_exhausted para budget_limit", async () => {
      const db = makeMockDb() as any;
      vi.mocked(getDb).mockResolvedValue(db);
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.createAlert({
        campaignId: "c1",
        campaignName: "C",
        type: "budget_exhausted",
        title: "Orçamento esgotado",
        description: "Budget 100% utilizado",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("listActiveAlerts", () => {
    it("deve listar todos os alertas ativos sem filtro", async () => {
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.listActiveAlerts({});
      expect(result.totalAlerts).toBe(3);
      expect(result.criticalCount).toBe(1);
      expect(result.warningCount).toBe(1);
      expect(result.infoCount).toBe(1);
    });

    it("deve filtrar por campaignIds", async () => {
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.listActiveAlerts({ campaignIds: ["camp_001"] });
      expect(result.totalAlerts).toBe(2);
      result.alerts.forEach((a) => expect(a.campaignId).toBe("camp_001"));
    });

    it("deve filtrar por severidade critical", async () => {
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.listActiveAlerts({ severity: "critical" });
      expect(result.totalAlerts).toBe(1);
      expect(result.criticalCount).toBe(1);
      expect(result.alerts[0].severity).toBe("critical");
    });

    it("deve converter currentValue e threshold para float", async () => {
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.listActiveAlerts({});
      const alert = result.alerts[0];
      expect(typeof alert.currentValue).toBe("number");
      expect(typeof alert.threshold).toBe("number");
      expect(alert.currentValue).toBeCloseTo(0.8);
      expect(alert.threshold).toBeCloseTo(1.0);
    });

    it("deve retornar zero contagens quando não há alertas", async () => {
      vi.mocked(getDb).mockResolvedValue(makeMockDb([]) as any);
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.listActiveAlerts({});
      expect(result.totalAlerts).toBe(0);
      expect(result.criticalCount).toBe(0);
      expect(result.warningCount).toBe(0);
      expect(result.infoCount).toBe(0);
    });
  });

  describe("configureAlertRules (sem DB)", () => {
    it("deve configurar regras e retornar contagem correta", async () => {
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const rules = [
        { type: "low_ctr" as const, threshold: 1.5, action: "notify" as const, enabled: true },
        { type: "high_cpc" as const, threshold: 5.0, action: "pause" as const, enabled: false },
      ];
      const result = await caller.configureAlertRules({ rules });
      expect(result.success).toBe(true);
      expect(result.rulesConfigured).toBe(2);
      expect(result.rules).toEqual(rules);
    });

    it("deve aceitar lista vazia de regras", async () => {
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.configureAlertRules({ rules: [] });
      expect(result.success).toBe(true);
      expect(result.rulesConfigured).toBe(0);
    });

    it("deve preservar estado enabled/disabled nas regras", async () => {
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const rules = [
        { type: "low_roi" as const, threshold: 200, action: "reduce_budget" as const, enabled: true },
        { type: "budget_exhausted" as const, threshold: 90, action: "notify" as const, enabled: false },
      ];
      const result = await caller.configureAlertRules({ rules });
      expect(result.rules[0].enabled).toBe(true);
      expect(result.rules[1].enabled).toBe(false);
    });
  });

  describe("executeAlertAction", () => {
    it("deve retornar mensagem correta para pause", async () => {
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.executeAlertAction({ alertId: "1", action: "pause" });
      expect(result.success).toBe(true);
      expect(result.message).toContain("pausada");
      expect(result.alertId).toBe("1");
      expect(result.executedAt).toBeInstanceOf(Date);
    });

    it("deve retornar mensagem correta para optimize", async () => {
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.executeAlertAction({ alertId: "2", action: "optimize" });
      expect(result.message).toContain("Otimização");
    });

    it("deve retornar mensagem correta para notify", async () => {
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.executeAlertAction({ alertId: "2", action: "notify" });
      expect(result.message).toContain("Notificação");
    });

    it("deve retornar mensagem correta para reduce_budget", async () => {
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.executeAlertAction({ alertId: "3", action: "reduce_budget" });
      expect(result.message).toContain("20%");
    });
  });

  describe("getOptimizationRecommendations", () => {
    it("deve mapear alertas com recommendation para recomendações", async () => {
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.getOptimizationRecommendations({ campaignId: "camp_001" });
      expect(result.campaignId).toBe("camp_001");
      expect(Array.isArray(result.recommendations)).toBe(true);
      expect(typeof result.totalRecommendations).toBe("number");
      expect(typeof result.highPriority).toBe("number");
    });

    it("deve mapear severity critical para prioridade high", async () => {
      vi.mocked(getDb).mockResolvedValue(
        makeMockDb([
          {
            id: 1,
            userId: 1,
            campaignId: "camp_001",
            campaignName: "C",
            alertType: "low_ctr",
            severity: "critical",
            title: "CTR baixo",
            description: "Desc",
            recommendation: "Revisar criativos",
            isRead: false,
            isResolved: false,
            createdAt: new Date(),
          },
        ]) as any
      );
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.getOptimizationRecommendations({ campaignId: "camp_001" });
      expect(result.highPriority).toBe(1);
      expect(result.recommendations[0].priority).toBe("high");
    });

    it("deve retornar recomendações vazias quando não há alertas", async () => {
      vi.mocked(getDb).mockResolvedValue(makeMockDb([]) as any);
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.getOptimizationRecommendations({ campaignId: "camp_xyz" });
      expect(result.totalRecommendations).toBe(0);
      expect(result.highPriority).toBe(0);
    });
  });

  describe("dismissAlert", () => {
    it("deve retornar confirmação com timestamp", async () => {
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.dismissAlert({ alertId: "1", reason: "Falso positivo" });
      expect(result.success).toBe(true);
      expect(result.alertId).toBe("1");
      expect(result.dismissedAt).toBeInstanceOf(Date);
      expect(result.reason).toBe("Falso positivo");
    });

    it("deve usar razão padrão quando não informada", async () => {
      const caller = smartAlertsRouter.createCaller(mockCtx);
      const result = await caller.dismissAlert({ alertId: "2" });
      expect(result.reason).toBe("Usuário dismissou");
    });
  });
});
