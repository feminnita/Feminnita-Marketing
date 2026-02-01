/**
 * Testes Vitest para autenticação OAuth Bling
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  gerarUrlAutorizacao,
  trocarCodigoPorToken,
  renovarAccessToken,
  tokenExpirado,
} from "./bling-oauth";

describe("Bling OAuth", () => {
  beforeEach(() => {
    // Configurar variáveis de ambiente para testes
    process.env.BLING_CLIENT_ID = "test-client-id";
    process.env.BLING_CLIENT_SECRET = "test-client-secret";
    process.env.BLING_REDIRECT_URI = "http://localhost:3000/callback";
  });

  describe("gerarUrlAutorizacao", () => {
    it("deve gerar URL de autorização com parâmetros corretos", () => {
      const url = gerarUrlAutorizacao("test-state");

      expect(url).toContain("https://www.bling.com.br/oauth/authorize");
      expect(url).toContain("client_id=test-client-id");
      expect(url).toContain("redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fcallback");
      expect(url).toContain("response_type=code");
      expect(url).toContain("state=test-state");
    });

    it("deve lançar erro se BLING_CLIENT_ID não estiver configurado", () => {
      delete process.env.BLING_CLIENT_ID;

      expect(() => gerarUrlAutorizacao()).toThrow(
        "BLING_CLIENT_ID e BLING_REDIRECT_URI não configurados"
      );
    });

    it("deve incluir escopos corretos na URL", () => {
      const url = gerarUrlAutorizacao();

      expect(url).toContain("scope=");
      expect(url).toContain("products%3Aread");
      expect(url).toContain("orders%3Aread");
    });
  });

  describe("tokenExpirado", () => {
    it("deve retornar false se token não está expirado", () => {
      const futuro = new Date(Date.now() + 3600000); // 1 hora no futuro
      expect(tokenExpirado(futuro)).toBe(false);
    });

    it("deve retornar true se token está expirado", () => {
      const passado = new Date(Date.now() - 3600000); // 1 hora no passado
      expect(tokenExpirado(passado)).toBe(true);
    });

    it("deve considerar buffer de 60 segundos", () => {
      // Token expira em 30 segundos (dentro do buffer)
      const proximoExpiracao = new Date(Date.now() + 30000);
      expect(tokenExpirado(proximoExpiracao)).toBe(true);
    });

    it("deve retornar false se token expira em mais de 60 segundos", () => {
      // Token expira em 120 segundos (fora do buffer)
      const proximoExpiracao = new Date(Date.now() + 120000);
      expect(tokenExpirado(proximoExpiracao)).toBe(false);
    });
  });

  describe("trocarCodigoPorToken", () => {
    it("deve lançar erro se credenciais não estão configuradas", async () => {
      delete process.env.BLING_CLIENT_SECRET;

      await expect(trocarCodigoPorToken("test-code")).rejects.toThrow(
        "Credenciais Bling não configuradas"
      );
    });

    it("deve fazer requisição POST com parâmetros corretos", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "test-token",
          token_type: "Bearer",
          expires_in: 3600,
          scope: "products:read orders:read",
        }),
      });

      global.fetch = mockFetch;

      const resultado = await trocarCodigoPorToken("test-code");

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.bling.com.br/oauth/token",
        expect.objectContaining({
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        })
      );

      expect(resultado.access_token).toBe("test-token");
      expect(resultado.expires_in).toBe(3600);
    });

    it("deve lançar erro se a resposta não for ok", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: "invalid_code",
          error_description: "Código inválido",
        }),
      });

      global.fetch = mockFetch;

      await expect(trocarCodigoPorToken("invalid-code")).rejects.toThrow();
    });
  });

  describe("renovarAccessToken", () => {
    it("deve lançar erro se credenciais não estão configuradas", async () => {
      delete process.env.BLING_CLIENT_ID;

      await expect(renovarAccessToken("test-refresh-token")).rejects.toThrow(
        "Credenciais Bling não configuradas"
      );
    });

    it("deve fazer requisição com grant_type refresh_token", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "new-token",
          token_type: "Bearer",
          expires_in: 3600,
          scope: "products:read orders:read",
        }),
      });

      global.fetch = mockFetch;

      const resultado = await renovarAccessToken("test-refresh-token");

      const callArgs = mockFetch.mock.calls[0];
      const body = callArgs[1].body;

      expect(body).toContain("grant_type=refresh_token");
      expect(body).toContain("refresh_token=test-refresh-token");
      expect(resultado.access_token).toBe("new-token");
    });
  });
});
