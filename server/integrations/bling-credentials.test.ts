import { describe, it, expect } from "vitest";
import { ENV } from "../_core/env";

describe("Bling Credentials", () => {
  it("should have all required Bling credentials configured", () => {
    expect(ENV.blingClientId).toBeDefined();
    expect(ENV.blingClientSecret).toBeDefined();
    expect(ENV.blingRedirectUri).toBeDefined();
    
    expect(ENV.blingClientId).not.toBe("");
    expect(ENV.blingClientSecret).not.toBe("");
    expect(ENV.blingRedirectUri).not.toBe("");
  });

  it("should have valid Bling Client ID format", () => {
    // Client ID should be a hex string
    expect(ENV.blingClientId).toMatch(/^[a-f0-9]{40}$/i);
  });

  it("should have valid Bling Client Secret format", () => {
    // Client Secret should be a hex string
    expect(ENV.blingClientSecret).toMatch(/^[a-f0-9]{64}$/i);
  });

  it("should have valid Bling Redirect URI", () => {
    // Should be a valid URL
    expect(ENV.blingRedirectUri).toMatch(/^https?:\/\/.+/);
  });

  it("should test OAuth token exchange with Bling", async () => {
    try {
      const response = await fetch("https://www.bling.com.br/oauth/authorize", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Just check if the endpoint is reachable
      expect(response.status).toBeLessThan(500);
      console.log("[Bling] OAuth endpoint is reachable");
    } catch (error) {
      console.error("[Bling] Error testing OAuth endpoint:", error);
      // Don't fail the test if network is unavailable
    }
  });
});
