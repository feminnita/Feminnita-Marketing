import { describe, it, expect, vi, afterEach } from "vitest";
import { buscarProdutosSite } from "./lia-site";

afterEach(() => vi.restoreAllMocks());

describe("buscarProdutosSite", () => {
  it("formata produto com preco promocional vigente e link", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([{
      name: "Short Doll Bia", code: "24400", slug: "short-doll-bia-24", price: "59.99", salePrice: "31.99",
      saleEnd: "2099-01-01T00:00:00.000Z", availableColors: ["Nude", "Marinho"], availableSizes: ["M", "G", "GG"], active: true,
    }])));
    const t = await buscarProdutosSite("bia");
    expect(t).toContain("Short Doll Bia (24400)");
    expect(t).toContain("de R$ 59,99 por R$ 31,99");
    expect(t).toContain("Tamanhos: M, G, GG");
    expect(t).toContain("https://www.armmis.com.br/produto/short-doll-bia-24");
  });
  it("promocao vencida mostra so o preco cheio", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify([{
      name: "Pijama X", code: "1", slug: "pijama-x", price: "79.99", salePrice: "39.99",
      saleEnd: "2020-01-01T00:00:00.000Z", availableColors: [], availableSizes: [], active: true,
    }])));
    const t = await buscarProdutosSite("pijama");
    expect(t).toContain("R$ 79,99");
    expect(t).not.toContain("39,99");
  });
  it("sem resultado", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("[]"));
    expect(await buscarProdutosSite("xyz")).toBe("");
  });
  it("erro de rede nao derruba a Lia", async () => {
    vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("offline"));
    expect(await buscarProdutosSite("bia")).toBe("");
  });
});
