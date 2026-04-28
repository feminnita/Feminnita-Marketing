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
