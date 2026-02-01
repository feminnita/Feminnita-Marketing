/**
 * Testes Vitest para API Bling
 */

import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  fazerRequisicaoBling,
  sincronizarProdutosBling,
  sincronizarPedidosBling,
  sincronizarContatosBling,
  sincronizarEstoqueBling,
  BlingAPIError,
  formatarErroBling,
} from "./bling-api";

describe("Bling API", () => {
  const mockAccessToken = "test-access-token";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("fazerRequisicaoBling", () => {
    it("deve fazer requisição com headers de autorização corretos", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      global.fetch = mockFetch;

      await fazerRequisicaoBling("/products", mockAccessToken);

      expect(mockFetch).toHaveBeenCalledWith(
        "https://www.bling.com.br/api/v3/products",
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: `Bearer ${mockAccessToken}`,
            "Content-Type": "application/json",
          }),
        })
      );
    });

    it("deve lançar BlingAPIError se resposta não for ok", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          message: "Unauthorized",
          error: "invalid_token",
        }),
      });

      global.fetch = mockFetch;

      await expect(fazerRequisicaoBling("/products", mockAccessToken)).rejects.toThrow(
        BlingAPIError
      );
    });

    it("deve retornar dados se resposta for ok", async () => {
      const mockData = { data: [{ id: 1, name: "Produto 1" }] };

      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      });

      global.fetch = mockFetch;

      const resultado = await fazerRequisicaoBling("/products", mockAccessToken);

      expect(resultado).toEqual(mockData);
    });
  });

  describe("sincronizarProdutosBling", () => {
    it("deve fazer requisição com parâmetros de paginação", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      global.fetch = mockFetch;

      await sincronizarProdutosBling(mockAccessToken, 2, 50);

      const urlChamada = mockFetch.mock.calls[0][0];
      expect(urlChamada).toContain("page=2");
      expect(urlChamada).toContain("pageSize=50");
    });

    it("deve usar valores padrão de paginação", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      global.fetch = mockFetch;

      await sincronizarProdutosBling(mockAccessToken);

      const urlChamada = mockFetch.mock.calls[0][0];
      expect(urlChamada).toContain("page=1");
      expect(urlChamada).toContain("pageSize=100");
    });
  });

  describe("sincronizarPedidosBling", () => {
    it("deve incluir filtros de data se fornecidos", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      global.fetch = mockFetch;

      await sincronizarPedidosBling(
        mockAccessToken,
        1,
        100,
        "2024-01-01",
        "2024-12-31"
      );

      const urlChamada = mockFetch.mock.calls[0][0];
      expect(urlChamada).toContain("createdSince=2024-01-01");
      expect(urlChamada).toContain("createdUntil=2024-12-31");
    });

    it("deve fazer requisição sem filtros de data se não fornecidos", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      global.fetch = mockFetch;

      await sincronizarPedidosBling(mockAccessToken);

      const urlChamada = mockFetch.mock.calls[0][0];
      expect(urlChamada).not.toContain("createdSince");
      expect(urlChamada).not.toContain("createdUntil");
    });
  });

  describe("sincronizarContatosBling", () => {
    it("deve fazer requisição ao endpoint correto", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      global.fetch = mockFetch;

      await sincronizarContatosBling(mockAccessToken);

      const urlChamada = mockFetch.mock.calls[0][0];
      expect(urlChamada).toContain("/contacts");
    });
  });

  describe("sincronizarEstoqueBling", () => {
    it("deve fazer requisição ao endpoint correto", async () => {
      const mockFetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

      global.fetch = mockFetch;

      await sincronizarEstoqueBling(mockAccessToken);

      const urlChamada = mockFetch.mock.calls[0][0];
      expect(urlChamada).toContain("/stocks");
    });
  });

  describe("formatarErroBling", () => {
    it("deve formatar erro 401 como não autorizado", () => {
      const erro = new BlingAPIError(401, {}, "Unauthorized");
      const mensagem = formatarErroBling(erro);

      expect(mensagem).toBe("Não autorizado - Token inválido ou expirado");
    });

    it("deve formatar erro 404 como recurso não encontrado", () => {
      const erro = new BlingAPIError(404, {}, "Not Found");
      const mensagem = formatarErroBling(erro);

      expect(mensagem).toBe("Recurso não encontrado");
    });

    it("deve formatar erro 429 como muitas requisições", () => {
      const erro = new BlingAPIError(429, {}, "Too Many Requests");
      const mensagem = formatarErroBling(erro);

      expect(mensagem).toBe("Muitas requisições - Aguarde antes de tentar novamente");
    });

    it("deve usar mensagem genérica para erro desconhecido", () => {
      const erro = new BlingAPIError(999, {}, "Unknown Error");
      const mensagem = formatarErroBling(erro);

      expect(mensagem).toContain("Erro 999");
    });
  });
});
