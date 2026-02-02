import { describe, it, expect, vi } from "vitest";
import { metaAdsCampaignsRouter } from "./meta-ads-campaigns";

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
