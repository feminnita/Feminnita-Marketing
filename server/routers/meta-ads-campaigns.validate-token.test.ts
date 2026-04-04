import { describe, it, expect } from "vitest";
import { ENV } from "../_core/env";

const token = ENV.metaAccessToken;
const adAccountId = ENV.metaAdAccountId;
const HAS_REAL_META = !!(token && token.startsWith("EA") && adAccountId);

describe("Meta Ads Token Validation", () => {
  it("should have META_ACCESS_TOKEN configured", () => {
    expect(ENV.metaAccessToken).toBeDefined();
  });

  it.skipIf(!HAS_REAL_META)("should validate that META_ACCESS_TOKEN is configured", () => {
    expect(token).toBeDefined();
    expect(token).not.toBe("");
    expect(token?.length).toBeGreaterThan(50);
  });

  it.skipIf(!HAS_REAL_META)("should validate that META_AD_ACCOUNT_ID is configured", () => {
    expect(adAccountId).toBeDefined();
    expect(adAccountId).not.toBe("");
  });

  it.skipIf(!HAS_REAL_META)("should validate that META_PIXEL_ID is configured", () => {
    expect(ENV.metaPixelId).toBeDefined();
    expect(ENV.metaPixelId).not.toBe("");
  });

  it.skipIf(!HAS_REAL_META)("should format account ID correctly with act_ prefix", () => {
    const formattedId = adAccountId?.startsWith("act_")
      ? adAccountId
      : `act_${adAccountId}`;

    expect(formattedId).toMatch(/^act_\d+$/);
  });
});
