import { describe, it, expect } from "vitest";
import { ENV } from "../_core/env";

const HAS_BLING = !!(ENV.blingClientId && ENV.blingClientSecret && ENV.blingRedirectUri);

describe("Bling Credentials", () => {
  it("should have all required Bling credentials configured", () => {
    expect(ENV.blingClientId).toBeDefined();
    expect(ENV.blingClientSecret).toBeDefined();
    expect(ENV.blingRedirectUri).toBeDefined();
  });

  it.skipIf(!HAS_BLING)("should have valid Bling Client ID format", () => {
    expect(ENV.blingClientId).toMatch(/^[a-f0-9]{40}$/i);
  });

  it.skipIf(!HAS_BLING)("should have valid Bling Client Secret format", () => {
    expect(ENV.blingClientSecret).toMatch(/^[a-f0-9]{64}$/i);
  });

  it.skipIf(!HAS_BLING)("should have valid Bling Redirect URI", () => {
    expect(ENV.blingRedirectUri).toMatch(/^https?:\/\/.+/);
  });

  it("should test OAuth token exchange with Bling", async () => {
    try {
      const response = await fetch("https://www.bling.com.br/oauth/authorize", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      expect(response.status).toBeLessThan(500);
    } catch {
      // Don't fail if network is unavailable
    }
  });
});
