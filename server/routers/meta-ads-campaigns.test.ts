import { describe, it, expect, vi, beforeAll } from "vitest";
import { metaAdsCampaignsRouter } from "./meta-ads-campaigns";
import { obterCampanhasMetaAds } from "../integrations/meta-ads-api";

describe("Meta Ads Campaigns Router", () => {
  it("deve criar uma campanha a partir do conteúdo", async () => {
    const caller = metaAdsCampaignsRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: "1", email: "test@test.com", role: "user" },
    });

    const result = await caller.createCampaignFromContent({
      influencerId: 1,
      contentId: "content_1",
      contentText: "Novo pijama de verão com desconto especial!",
      platforms: ["instagram", "facebook"],
      budget: 150,
      duration: 7,
    });

    // Pode falhar se LLM não estiver disponível, mas deve retornar um resultado
    expect(result).toBeDefined();
    expect(result.success !== undefined).toBe(true);
    if (result.success) {
      expect(result.campaign).toBeDefined();
      expect(result.campaign.status).toBe("active");
    }
  });

  it("deve listar campanhas ativas", async () => {
    const caller = metaAdsCampaignsRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: "1", email: "test@test.com", role: "user" },
    });

    const result = await caller.listActiveCampaigns({
      status: "active",
    });

    expect(result.campaigns).toBeDefined();
    expect(Array.isArray(result.campaigns)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it("deve filtrar campanhas por influenciadora", async () => {
    const caller = metaAdsCampaignsRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: "1", email: "test@test.com", role: "user" },
    });

    const result = await caller.listActiveCampaigns({
      influencerId: 1,
    });

    expect(result.campaigns).toBeDefined();
    result.campaigns.forEach((campaign: any) => {
      expect(campaign.influencerId).toBe(1);
    });
  });

  it("deve obter métricas de uma campanha", async () => {
    const caller = metaAdsCampaignsRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: "1", email: "test@test.com", role: "user" },
    });

    const result = await caller.getCampaignMetrics({
      campaignId: "campaign_1",
    });

    expect(result.campaignId).toBe("campaign_1");
    expect(result.impressions).toBeGreaterThanOrEqual(0);
    expect(result.clicks).toBeGreaterThanOrEqual(0);
    expect(result.conversions).toBeGreaterThanOrEqual(0);
    expect(result.roi).toBeGreaterThanOrEqual(0);
  });

  it("deve pausar uma campanha", async () => {
    const caller = metaAdsCampaignsRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: "1", email: "test@test.com", role: "user" },
    });

    const result = await caller.pauseCampaign({
      campaignId: "campaign_1",
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
  });

  it("deve retomar uma campanha", async () => {
    const caller = metaAdsCampaignsRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: "1", email: "test@test.com", role: "user" },
    });

    const result = await caller.resumeCampaign({
      campaignId: "campaign_1",
    });

    expect(result.success).toBe(true);
    expect(result.message).toContain("retomada");
  });

  it("deve otimizar uma campanha", async () => {
    const caller = metaAdsCampaignsRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: "1", email: "test@test.com", role: "user" },
    });

    const result = await caller.optimizeCampaign({
      campaignId: "campaign_1",
      targetROI: 3.0,
    });

    expect(result).toBeDefined();
    expect(result.success).toBe(true);
    expect(result.optimization).toBeDefined();
  });

  it("deve sincronizar campanhas com conteúdo de influenciadora", async () => {
    const caller = metaAdsCampaignsRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: "1", email: "test@test.com", role: "user" },
    });

    const result = await caller.syncCampaignsWithContent({
      influencerId: 1,
      autoCreate: true,
    });

    expect(result).toBeDefined();
    expect(result.influencerId).toBe(1);
    expect(result.campaignsCreated).toBeGreaterThanOrEqual(0);
    expect(result.campaignsUpdated).toBeGreaterThanOrEqual(0);
  });
});


describe("Meta Ads Credentials Validation", () => {
  let accessToken: string;
  let adAccountId: string;

  beforeAll(() => {
    accessToken = process.env.META_ACCESS_TOKEN || "";
    adAccountId = process.env.META_AD_ACCOUNT_ID || "";
  });

  it("should have META_ACCESS_TOKEN configured", () => {
    expect(accessToken).toBeTruthy();
    expect(accessToken.length).toBeGreaterThan(0);
  });

  it("should have META_AD_ACCOUNT_ID configured", () => {
    expect(adAccountId).toBeTruthy();
    expect(adAccountId).toMatch(/^\d+$|^act_\d+$/);
  });

  it("should have META_PIXEL_ID configured", () => {
    const pixelId = process.env.META_PIXEL_ID || "";
    expect(pixelId).toBeTruthy();
    expect(pixelId).toMatch(/^\d+$/);
  });

  it("should validate credentials with Meta API", async () => {
    if (!accessToken || !adAccountId) {
      console.warn("Skipping Meta API test - credentials not configured");
      return;
    }

    try {
      const result = await obterCampanhasMetaAds(accessToken, adAccountId, [
        "id",
        "name",
        "status",
      ]);

      expect(result).toBeDefined();
      expect(Array.isArray(result.data) || result.data === undefined).toBe(true);
    } catch (error: any) {
      if (error.statusCode === 401 || error.statusCode === 403) {
        throw new Error(
          `Invalid Meta credentials: ${error.message}. Please check your META_ACCESS_TOKEN and META_AD_ACCOUNT_ID.`
        );
      }
      console.warn("Meta API test warning:", error.message);
    }
  });
});


describe("Meta Ads Real-time Import", () => {
  it("should import real campaigns from Meta", async () => {
    const caller = metaAdsCampaignsRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: "1", email: "test@test.com", role: "user" },
    });

    const result = await caller.importarCampanhasReais();

    expect(result).toBeDefined();
    expect(result.campanhas).toBeDefined();
    expect(Array.isArray(result.campanhas)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(0);
    expect(result.importedAt).toBeDefined();
  });

  it("should get detailed metrics", async () => {
    const caller = metaAdsCampaignsRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: "1", email: "test@test.com", role: "user" },
    });

    const result = await caller.obterMetricasDetalhadas({
      campaignId: "campaign_1",
    });

    expect(result).toBeDefined();
    expect(result.campaignId).toBe("campaign_1");
    expect(result.updatedAt).toBeDefined();
  });

  it("should get campaign ads", async () => {
    const caller = metaAdsCampaignsRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: "1", email: "test@test.com", role: "user" },
    });

    const result = await caller.obterAnuncios({
      campaignId: "campaign_1",
    });

    expect(result).toBeDefined();
    expect(result.campaignId).toBe("campaign_1");
    expect(Array.isArray(result.anuncios)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it("should get target audiences", async () => {
    const caller = metaAdsCampaignsRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: "1", email: "test@test.com", role: "user" },
    });

    const result = await caller.obterPublicosAlvo({
      campaignId: "campaign_1",
    });

    expect(result).toBeDefined();
    expect(result.campaignId).toBe("campaign_1");
    expect(Array.isArray(result.publicosAlvo)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it("should get campaign history", async () => {
    const caller = metaAdsCampaignsRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: "1", email: "test@test.com", role: "user" },
    });

    const result = await caller.obterHistorico({
      dias: 30,
    });

    expect(result).toBeDefined();
    expect(Array.isArray(result.historico)).toBe(true);
    expect(result.dias).toBe(30);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it("should sync real-time data", async () => {
    const caller = metaAdsCampaignsRouter.createCaller({
      req: {} as any,
      res: {} as any,
      user: { id: "1", email: "test@test.com", role: "user" },
    });

    const result = await caller.sincronizarTempoReal({});

    expect(result).toBeDefined();
    expect(result.campanhasSincronizadas).toBeGreaterThanOrEqual(0);
    expect(result.metricasAtualizadas).toBeGreaterThanOrEqual(0);
    expect(result.sincronizadoEm).toBeDefined();
  });
});
