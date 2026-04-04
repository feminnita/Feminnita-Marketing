import { describe, it, expect } from "vitest";
import { ENV } from "./_core/env";

const token = ENV.metaAccessToken;
const HAS_REAL_META = !!(token && token.startsWith("EA"));

describe("Meta API Credentials", () => {
  it("should have META_ACCESS_TOKEN configured", () => {
    expect(token).toBeDefined();
  });

  it.skipIf(!HAS_REAL_META)("should have valid Meta token format", () => {
    expect(token).toMatch(/^EA[A-Za-z0-9_-]+$/);
  });

  it.skipIf(!HAS_REAL_META)("should validate Meta Access Token by fetching account info", async () => {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${token}`
    );
    const data = await response.json();
    expect(response.status).toBe(200);
    expect(data.id).toBeDefined();
  });

  it.skipIf(!HAS_REAL_META)("should have all required Meta environment variables", () => {
    expect(ENV.metaAdAccountId).toBeTruthy();
    expect(ENV.metaPixelId).toBeTruthy();
    expect(ENV.metaPageId).toBeTruthy();
  });
});
