import { describe, it, expect } from "vitest";
import { metaAdsCampaignsRouter } from "./meta-ads-campaigns";
import { ENV } from "../_core/env";

const token = ENV.metaAccessToken;
const HAS_REAL_META = !!(token && token.startsWith("EA"));

const mockContext = {
  req: {} as any,
  res: {} as any,
  user: { id: 1, email: "test@test.com", role: "user" as const },
};

describe("Meta Ads Campaigns Router", () => {
  it("deve retornar objeto com campanhas ao chamar listActiveCampaigns", async () => {
    const caller = metaAdsCampaignsRouter.createCaller(mockContext);
    const result = await caller.listActiveCampaigns();
    expect(result).toHaveProperty("campaigns");
    expect(Array.isArray(result.campaigns)).toBe(true);
  });

  it.skipIf(!HAS_REAL_META)("deve listar campanhas ativas com credenciais reais", async () => {
    const caller = metaAdsCampaignsRouter.createCaller(mockContext);
    const result = await caller.listActiveCampaigns();
    expect(result.campaigns).toBeDefined();
    expect(Array.isArray(result.campaigns)).toBe(true);
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it("deve retornar objeto com campanhas ao chamar importarCampanhasReais", async () => {
    const caller = metaAdsCampaignsRouter.createCaller(mockContext);
    const result = await caller.importarCampanhasReais();
    expect(result).toBeDefined();
    expect(result).toHaveProperty("campanhas");
    expect(Array.isArray(result.campanhas)).toBe(true);
  });

  it.skipIf(!HAS_REAL_META)("deve importar campanhas reais do Meta", async () => {
    const caller = metaAdsCampaignsRouter.createCaller(mockContext);
    const result = await caller.importarCampanhasReais();
    expect(result.campanhas).toBeDefined();
    expect(Array.isArray(result.campanhas)).toBe(true);
  });
});

describe("Meta Ads Credentials", () => {
  it("should have META_ACCESS_TOKEN configured", () => {
    expect(ENV.metaAccessToken).toBeDefined();
  });

  it.skipIf(!HAS_REAL_META)("should have valid token format", () => {
    expect(token).toMatch(/^EA[A-Za-z0-9_-]+$/);
  });

  it.skipIf(!HAS_REAL_META)("should have META_AD_ACCOUNT_ID configured", () => {
    expect(ENV.metaAdAccountId).toBeTruthy();
  });

  it.skipIf(!HAS_REAL_META)("should have META_PIXEL_ID configured", () => {
    expect(ENV.metaPixelId).toBeTruthy();
  });
});
