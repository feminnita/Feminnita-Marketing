import { describe, it, expect, beforeAll } from "vitest";

describe("Melhor Envio Router", () => {
  it("should have MELHOR_ENVIO_TOKEN configured", () => {
    const token = process.env.MELHOR_ENVIO_TOKEN;
    expect(token).toBeDefined();
    expect(token).toBeTruthy();
    expect(token?.length).toBeGreaterThan(100); // JWT tokens are long
  });

  it("should validate token format (JWT)", () => {
    const token = process.env.MELHOR_ENVIO_TOKEN;
    expect(token).toMatch(/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/);
  });

  it("should have valid JWT structure", () => {
    const token = process.env.MELHOR_ENVIO_TOKEN;
    if (!token) return;

    const parts = token.split(".");
    expect(parts).toHaveLength(3);

    // Decode header
    const header = JSON.parse(Buffer.from(parts[0], "base64").toString());
    expect(header.typ).toBe("JWT");
    expect(header.alg).toBe("RS256");

    // Decode payload
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
    expect(payload.scopes).toBeDefined();
    expect(Array.isArray(payload.scopes)).toBe(true);
    expect(payload.scopes).toContain("shipping-tracking");
  });

  it("should have required scopes for tracking", () => {
    const token = process.env.MELHOR_ENVIO_TOKEN;
    if (!token) return;

    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

    const requiredScopes = ["shipping-tracking", "orders-read"];
    const hasRequiredScopes = requiredScopes.every((scope) =>
      payload.scopes.includes(scope)
    );

    expect(hasRequiredScopes).toBe(true);
  });

  it("should not be expired", () => {
    const token = process.env.MELHOR_ENVIO_TOKEN;
    if (!token) return;

    const parts = token.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

    const expirationTime = payload.exp * 1000; // Convert to milliseconds
    const currentTime = Date.now();

    expect(expirationTime).toBeGreaterThan(currentTime);
  });
});
