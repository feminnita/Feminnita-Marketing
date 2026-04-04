import { describe, it, expect } from "vitest";

const token = process.env.MELHOR_ENVIO_TOKEN;
const HAS_TOKEN = !!(token && token.length > 100);

describe("Melhor Envio Router", () => {
  it("should have MELHOR_ENVIO_TOKEN configured", () => {
    expect(token).toBeDefined();
    expect(token).toBeTruthy();
  });

  it.skipIf(!HAS_TOKEN)("should validate token format (JWT)", () => {
    expect(token).toMatch(/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it.skipIf(!HAS_TOKEN)("should have valid JWT structure", () => {
    const parts = token!.split(".");
    expect(parts).toHaveLength(3);
    const header = JSON.parse(Buffer.from(parts[0], "base64").toString());
    expect(header.typ).toBe("JWT");
    expect(header.alg).toBe("RS256");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    expect(payload.scopes).toBeDefined();
    expect(Array.isArray(payload.scopes)).toBe(true);
    expect(payload.scopes).toContain("shipping-tracking");
  });

  it.skipIf(!HAS_TOKEN)("should have required scopes for tracking", () => {
    const parts = token!.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    const requiredScopes = ["shipping-tracking", "orders-read"];
    expect(requiredScopes.every((s) => payload.scopes.includes(s))).toBe(true);
  });

  it.skipIf(!HAS_TOKEN)("should not be expired", () => {
    const parts = token!.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    expect(payload.exp * 1000).toBeGreaterThan(Date.now());
  });
});
