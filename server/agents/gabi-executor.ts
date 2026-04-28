/**
 * Gabi Executor — Execução de ações na API Mercado Livre
 * Suporta Conta A (Feminnita) e Conta B (FNT Confecções)
 */

const ML_BASE = "https://api.mercadolibre.com";

function getMLToken(account = "feminnita"): string {
  return account === "fnt"
    ? (process.env.ML_ACCESS_TOKEN_2 || "")
    : (process.env.ML_ACCESS_TOKEN_1 || "");
}

function getUserId(account = "feminnita"): string {
  return account === "fnt"
    ? (process.env.ML_USER_ID_2 || "")
    : (process.env.ML_USER_ID_1 || "");
}

async function mlGet(path: string, token: string): Promise<any> {
  const res = await fetch(`${ML_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json() as any;
  if (data.error) throw new Error(`ML API: ${data.message || data.error}`);
  return data;
}

async function mlPut(path: string, body: Record<string, any>, token: string): Promise<any> {
  const res = await fetch(`${ML_BASE}${path}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json() as any;
  if (data.error) throw new Error(`ML API: ${data.message || data.error}`);
  return data;
}

export async function listMLItems(account = "feminnita"): Promise<string> {
  const token = getMLToken(account);
  const userId = getUserId(account);
  const label = account === "fnt" ? "Conta B (FNT)" : "Conta A (Feminnita)";
  console.log(`[GabiML] listMLItems — account=${account} userId=${userId} tokenLen=${token.length}`);
  if (!token || !userId) return "Erro: tokens ML não configurados no servidor.";

  try {
    // Busca todos os itens sem filtro de status
    const search = await mlGet(`/users/${userId}/items/search?limit=50`, token);
    const allIds: string[] = search.results || [];
    const total: number = search.paging?.total || allIds.length;

    console.log(`[GabiML] listMLItems total=${total} ids=${allIds.length} userId=${userId}`);

    if (allIds.length === 0) return `Nenhum anúncio encontrado em ${label}. Total na conta: ${total}.`;

    const top20 = allIds.slice(0, 20);
    const details = await mlGet(
      `/items?ids=${top20.join(",")}&attributes=id,title,status,price,available_quantity`,
      token
    );

    const lines = (details as any[]).map((item: any) => {
      const d = item.body;
      if (!d || d.error) return null;
      const stock = d.available_quantity != null ? d.available_quantity : "?";
      return `• ID: ${d.id} | "${(d.title || "").slice(0, 55)}" | ${d.status} | R$${d.price} | Estoque: ${stock}`;
    }).filter(Boolean);

    return `ANÚNCIOS ${label} (${total} total — exibindo ${top20.length}):\n${lines.join("\n")}`;
  } catch (e: any) {
    return `Erro ao listar anúncios: ${e.message}`;
  }
}

export async function pauseMLItem(itemId: string, account = "feminnita"): Promise<string> {
  const token = getMLToken(account);
  if (!token) throw new Error("ML_ACCESS_TOKEN não configurado no servidor");
  console.log(`[GabiML] pauseMLItem — ${itemId} (${account})`);
  await mlPut(`/items/${itemId}`, { status: "paused" }, token);
  return `Anúncio ${itemId} pausado com sucesso.`;
}

export async function activateMLItem(itemId: string, account = "feminnita"): Promise<string> {
  const token = getMLToken(account);
  if (!token) throw new Error("ML_ACCESS_TOKEN não configurado no servidor");
  console.log(`[GabiML] activateMLItem — ${itemId} (${account})`);
  await mlPut(`/items/${itemId}`, { status: "active" }, token);
  return `Anúncio ${itemId} reativado com sucesso.`;
}

export async function updateMLPrice(itemId: string, price: number, account = "feminnita"): Promise<string> {
  const token = getMLToken(account);
  if (!token) throw new Error("ML_ACCESS_TOKEN não configurado no servidor");
  console.log(`[GabiML] updateMLPrice — ${itemId} R$${price} (${account})`);
  await mlPut(`/items/${itemId}`, { price }, token);
  return `Preço do anúncio ${itemId} atualizado para R$${price} com sucesso.`;
}

export async function updateMLStock(itemId: string, quantity: number, account = "feminnita"): Promise<string> {
  const token = getMLToken(account);
  if (!token) throw new Error("ML_ACCESS_TOKEN não configurado no servidor");
  console.log(`[GabiML] updateMLStock — ${itemId} qty=${quantity} (${account})`);
  await mlPut(`/items/${itemId}`, { available_quantity: quantity }, token);
  return `Estoque do anúncio ${itemId} atualizado para ${quantity} unidades.`;
}

export async function getMLItemDetails(itemId: string, account = "feminnita"): Promise<string> {
  const token = getMLToken(account);
  if (!token) throw new Error("ML_ACCESS_TOKEN não configurado no servidor");
  console.log(`[GabiML] getMLItemDetails — ${itemId} (${account})`);

  const [item, description] = await Promise.all([
    mlGet(`/items/${itemId}`, token),
    mlGet(`/items/${itemId}/description`, token).catch(() => null),
  ]);

  const attrs = (item.attributes || []).map((a: any) =>
    `  • ${a.name}: ${Array.isArray(a.values) ? a.values.map((v: any) => v.name).join(", ") : (a.value_name || "—")}`
  ).join("\n");

  const missing = (item.attributes || []).filter((a: any) =>
    (!a.values || a.values.length === 0) && (!a.value_name)
  ).map((a: any) => a.name);

  return [
    `ANÚNCIO: ${itemId}`,
    `Título: ${item.title}`,
    `Status: ${item.status} | Tipo: ${item.listing_type_id}`,
    `Preço: R$${item.price} | Estoque: ${item.available_quantity}`,
    `Categoria: ${item.category_id}`,
    `Health: ${item.health ?? "N/A"}`,
    ``,
    `ATRIBUTOS PREENCHIDOS (${(item.attributes || []).length}):`,
    attrs || "  Nenhum",
    ``,
    missing.length > 0 ? `⚠️ ATRIBUTOS VAZIOS (${missing.length}): ${missing.join(", ")}` : "✅ Todos os atributos preenchidos",
    description?.plain_text ? `\nDESCRIÇÃO: ${description.plain_text.slice(0, 300)}...` : "",
  ].join("\n");
}

export async function getMLCategoryAttributes(categoryId: string, account = "feminnita"): Promise<string> {
  const token = getMLToken(account);
  if (!token) throw new Error("ML_ACCESS_TOKEN não configurado no servidor");
  console.log(`[GabiML] getMLCategoryAttributes — ${categoryId}`);

  const data = await mlGet(`/categories/${categoryId}/attributes`, token);
  const required = (data as any[]).filter((a: any) => a.tags?.required);
  const recommended = (data as any[]).filter((a: any) => !a.tags?.required && a.tags?.catalog_required);

  const fmt = (attrs: any[]) => attrs.map((a: any) => {
    const values = a.values?.map((v: any) => v.name).slice(0, 5).join(", ");
    return `  • ${a.name} (${a.id})${values ? ` → opções: ${values}` : ""}`;
  }).join("\n");

  return [
    `CATEGORIA: ${categoryId}`,
    ``,
    `OBRIGATÓRIOS (${required.length}):`,
    fmt(required) || "  Nenhum",
    ``,
    `RECOMENDADOS CATÁLOGO (${recommended.length}):`,
    fmt(recommended) || "  Nenhum",
  ].join("\n");
}

export async function updateMLItemAttributes(
  itemId: string,
  attributes: Array<{ id: string; value_name: string }>,
  account = "feminnita"
): Promise<string> {
  const token = getMLToken(account);
  if (!token) throw new Error("ML_ACCESS_TOKEN não configurado no servidor");
  console.log(`[GabiML] updateMLItemAttributes — ${itemId} attrs=${attributes.length} (${account})`);
  await mlPut(`/items/${itemId}`, { attributes }, token);
  const names = attributes.map(a => `${a.id}="${a.value_name}"`).join(", ");
  return `Atributos de ${itemId} atualizados: ${names}`;
}
