// Produtos AO VIVO do site Armmis para a Lia: preco, promocao vigente, cores,
// tamanhos e link. Assim ela nunca fala preco ou estoque desatualizado.
const API = process.env.ARMMIS_API_URL || "https://api.armmis.com.br";
const SITE = "https://www.armmis.com.br";
const reais = (v: number) => "R$ " + v.toFixed(2).replace(".", ",");

export async function buscarProdutosSite(termo: string, limite = 3): Promise<string> {
  try {
    const r = await fetch(`${API}/api/store/products?q=${encodeURIComponent(termo)}&limit=${limite}`);
    if (!r.ok) return "";
    const lista: any[] = await r.json();
    return lista.filter((p) => p.active !== false).slice(0, limite).map((p) => {
      const preco = Number(p.price);
      const promo = p.salePrice && (!p.saleEnd || new Date(p.saleEnd) > new Date()) ? Number(p.salePrice) : null;
      const valor = promo && promo < preco ? `de ${reais(preco)} por ${reais(promo)}` : reais(preco);
      return [`- ${p.name} (${p.code}): ${valor}`,
        `  Cores: ${(p.availableColors ?? []).join(", ")}`,
        `  Tamanhos: ${(p.availableSizes ?? []).join(", ")}`,
        `  Link: ${SITE}/produto/${p.slug}`].join("\n");
    }).join("\n");
  } catch {
    return "";
  }
}
