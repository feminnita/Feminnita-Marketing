import { describe, it, expect } from "vitest";

/**
 * Teste para validar as credenciais da Meta
 * Verifica se o token de acesso é válido fazendo uma chamada leve à API da Meta
 */
describe("Meta API Credentials", () => {
  it("should validate Meta Access Token by fetching account info", async () => {
    const token = process.env.META_ACCESS_TOKEN;
    const pageId = process.env.META_PAGE_ID;

    expect(token).toBeDefined();
    expect(pageId).toBeDefined();

    if (!token || !pageId) {
      throw new Error("Meta credentials not found");
    }

    try {
      // Fazer uma chamada leve à API da Meta para validar o token
      const response = await fetch(
        `https://graph.facebook.com/v18.0/me?fields=id,name&access_token=${token}`
      );

      const data = await response.json();

      if (response.status !== 200) {
        console.error("❌ Meta API Error:", data);
        throw new Error(`Meta API returned ${response.status}: ${JSON.stringify(data)}`);
      }

      expect(response.status).toBe(200);
      expect(data).toHaveProperty("id");

      console.log("✅ Meta Access Token is valid");
      console.log(`✅ User ID: ${data.id}`);
      console.log(`✅ User Name: ${data.name}`);
    } catch (error) {
      console.error("❌ Failed to validate Meta credentials:", error);
      throw error;
    }
  });

  it("should have all required Meta environment variables", () => {
    expect(process.env.META_ACCESS_TOKEN).toBeDefined();
    expect(process.env.META_PAGE_ID).toBeDefined();
    expect(process.env.META_AD_ACCOUNT_ID).toBeDefined();

    // Validar formato básico
    expect(process.env.META_ACCESS_TOKEN).toMatch(/^EA[A-Za-z0-9_-]+$/);
    expect(process.env.META_PAGE_ID).toMatch(/^\d+$/);
    expect(process.env.META_AD_ACCOUNT_ID).toMatch(/^\d+$/);
  });
});
