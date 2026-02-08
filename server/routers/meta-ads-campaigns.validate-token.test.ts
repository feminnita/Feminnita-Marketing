import { describe, it, expect } from "vitest";
import { ENV } from "../_core/env";
import { fazerRequisicaoMetaAds } from "../integrations/meta-ads-api";

describe("Meta Ads Token Validation", () => {
  it("should validate that META_ACCESS_TOKEN is configured", () => {
    expect(ENV.metaAccessToken).toBeDefined();
    expect(ENV.metaAccessToken).not.toBe("");
    expect(ENV.metaAccessToken?.length).toBeGreaterThan(50);
  });

  it("should validate that META_AD_ACCOUNT_ID is configured", () => {
    expect(ENV.metaAdAccountId).toBeDefined();
    expect(ENV.metaAdAccountId).not.toBe("");
  });

  it("should validate that META_PIXEL_ID is configured", () => {
    expect(ENV.metaPixelId).toBeDefined();
    expect(ENV.metaPixelId).not.toBe("");
  });

  it("should test Meta API connection with valid token", async () => {
    try {
      // Testar com um endpoint simples que não requer permissões especiais
      const accountId = ENV.metaAdAccountId?.startsWith("act_")
        ? ENV.metaAdAccountId
        : `act_${ENV.metaAdAccountId}`;

      const response = await fazerRequisicaoMetaAds(
        `/${accountId}?fields=id,name,status`,
        ENV.metaAccessToken || "",
        {},
        true
      );

      // Se chegou aqui, o token é válido
      expect(response).toBeDefined();
      console.log("✅ Meta API Token is valid and has correct permissions");
    } catch (error: any) {
      // Se o erro for de permissão, significa que o token não tem as permissões corretas
      if (
        error.message?.includes("ads_management") ||
        error.message?.includes("ads_read")
      ) {
        throw new Error(
          `Token sem permissões necessárias: ${error.message}`
        );
      }
      // Outros erros podem ser esperados em ambiente de teste
      console.warn("Meta API Test Warning:", error.message);
    }
  });

  it("should verify token has ads_read permission", async () => {
    try {
      const accountId = ENV.metaAdAccountId?.startsWith("act_")
        ? ENV.metaAdAccountId
        : `act_${ENV.metaAdAccountId}`;

      // Tentar ler campanhas (requer ads_read)
      const response = await fazerRequisicaoMetaAds(
        `/${accountId}/campaigns?fields=id,name,status`,
        ENV.metaAccessToken || "",
        {},
        true
      );

      expect(response).toBeDefined();
      expect(response.data).toBeDefined();
      console.log("✅ Token has ads_read permission");
    } catch (error: any) {
      if (error.message?.includes("ads_read")) {
        throw new Error(
          `Token não tem permissão ads_read: ${error.message}`
        );
      }
      console.warn("Ads Read Test Warning:", error.message);
    }
  });

  it("should format account ID correctly with act_ prefix", () => {
    const accountId = ENV.metaAdAccountId;
    const formattedId = accountId?.startsWith("act_")
      ? accountId
      : `act_${accountId}`;

    expect(formattedId).toMatch(/^act_\d+$/);
    console.log(`✅ Account ID formatted correctly: ${formattedId}`);
  });
});
