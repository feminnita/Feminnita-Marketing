/**
 * ML Performance Agent — Especialista em Mercado Livre para Feminnita
 *
 * Usa dados disponíveis via API pública do ML:
 * - Listagens ativas (itens, preços, estoque, vendas)
 * - Pedidos recentes (últimos 30 dias)
 * - Métricas de desempenho orgânico
 *
 * A API de Product Ads requer aprovação separada da ML.
 * Enquanto aguarda, analisa performance orgânica como proxy.
 */

import { getDb } from "../db";
import { mlAdsEvaluations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

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

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface MLItem {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  sold_quantity: number;
  status: string;
  permalink?: string;
  thumbnail?: string;
  category_id?: string;
  listing_type_id?: string;
  health?: number;
}

export interface MLOrder {
  id: number;
  total_amount: number;
  status: string;
  date_created: string;
  items: Array<{ item: { id: string; title: string }; quantity: number; unit_price: number }>;
}

export interface MLPerformanceData {
  items: MLItem[];
  campaigns: MLItem[]; // alias de items para compatibilidade com frontend
  recentOrders: MLOrder[];
  sellerId: string;
  period: string;
  summary: {
    totalActiveItems: number;
    totalSoldLast30d: number;
    totalRevenueLast30d: number;
    avgOrderValue: number;
    topSellingIds: string[];
    zeroSalesIds: string[];
  };
}

// Alias para compatibilidade com o router existente
export type MLAdsData = MLPerformanceData;
export type MLCampaign = MLItem;

// ─── Fetch: Listagens ativas ─────────────────────────────────────────────────

async function fetchActiveItems(account = "feminnita"): Promise<MLItem[]> {
  const token = getMLToken(account);
  const userId = getUserId(account);
  if (!token || !userId) return [];

  // Busca IDs dos itens ativos
  const searchRes = await fetch(
    `${ML_BASE}/users/${userId}/items/search?status=active&limit=50`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!searchRes.ok) {
    console.warn(`[MLAgent] items/search HTTP ${searchRes.status}`);
    return [];
  }
  const searchData = await searchRes.json();
  const ids: string[] = searchData.results || [];
  if (!ids.length) return [];

  // Busca detalhes em lote (máx 20 por chamada)
  const items: MLItem[] = [];
  for (let i = 0; i < ids.length; i += 20) {
    const batch = ids.slice(i, i + 20).join(",");
    const detailRes = await fetch(`${ML_BASE}/items?ids=${batch}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!detailRes.ok) continue;
    const details = await detailRes.json();
    for (const entry of details) {
      if (entry.code === 200 && entry.body) {
        const b = entry.body;
        items.push({
          id: b.id,
          title: b.title,
          price: b.price,
          available_quantity: b.available_quantity,
          sold_quantity: b.sold_quantity,
          status: b.status,
          permalink: b.permalink,
          thumbnail: b.thumbnail,
          category_id: b.category_id,
          listing_type_id: b.listing_type_id,
          health: b.health,
        });
      }
    }
  }
  return items;
}

// ─── Fetch: Pedidos recentes (30 dias) ───────────────────────────────────────

async function fetchRecentOrders(account = "feminnita"): Promise<MLOrder[]> {
  const token = getMLToken(account);
  const userId = getUserId(account);
  if (!token || !userId) return [];

  const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const res = await fetch(
    `${ML_BASE}/orders/search?seller=${userId}&order.status=paid&sort=date_desc&limit=50&order.date_created.from=${dateFrom}T00:00:00.000-00:00`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) {
    console.warn(`[MLAgent] orders/search HTTP ${res.status}`);
    return [];
  }
  const data = await res.json();
  return (data.results || []) as MLOrder[];
}

// ─── Coleta completa ──────────────────────────────────────────────────────────

export async function collectMLAdsData(account = "feminnita"): Promise<MLPerformanceData> {
  const userId = getUserId(account);
  const [items, recentOrders] = await Promise.all([
    fetchActiveItems(account),
    fetchRecentOrders(account),
  ]);

  // Calcular métricas
  const totalSoldLast30d = recentOrders.reduce(
    (acc, o) => acc + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
  const totalRevenueLast30d = recentOrders.reduce((acc, o) => acc + o.total_amount, 0);
  const avgOrderValue = recentOrders.length ? totalRevenueLast30d / recentOrders.length : 0;

  // Contagem de vendas por item
  const salesByItem: Record<string, number> = {};
  for (const order of recentOrders) {
    for (const oi of order.items) {
      salesByItem[oi.item.id] = (salesByItem[oi.item.id] || 0) + oi.quantity;
    }
  }
  const topSellingIds = Object.entries(salesByItem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);
  const zeroSalesIds = items
    .filter((i) => !salesByItem[i.id] && i.sold_quantity === 0)
    .map((i) => i.id)
    .slice(0, 10);

  const period = `${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")} — ${new Date().toLocaleDateString("pt-BR")} (30 dias)`;

  return {
    items,
    campaigns: items, // alias para compatibilidade com frontend
    recentOrders: recentOrders.slice(0, 20), // limita payload
    sellerId: userId,
    period,
    summary: {
      totalActiveItems: items.length,
      totalSoldLast30d,
      totalRevenueLast30d,
      avgOrderValue,
      topSellingIds,
      zeroSalesIds,
    },
  };
}

// ─── Sistema de prompt ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é um especialista em performance de vendas no Mercado Livre para empresas de atacado de moda brasileiras.

Contexto específico desta conta (Feminnita Pijamas):
- Produto: pijamas de atacado para revendedoras
- Público-alvo: revendedoras em todo o Brasil
- Ticket médio: R$400 por pedido (atacado)
- Objetivo: aumentar pedidos de atacado via Mercado Livre
- Situação: API de Product Ads não disponível ainda — análise baseada em performance orgânica

Ao analisar os dados de listagens e pedidos:
1. Identifique produtos com alto potencial não explorado (preço competitivo + estoque + sem vendas)
2. Aponte produtos campeões de vendas para impulsionar
3. Verifique saúde dos anúncios (listing_type_id, health score)
4. Calcule taxa de conversão implícita (vendas / estimativa de visitas por sold_quantity histórico)
5. Recomende ajustes de preço, título ou categoria
6. Identifique oportunidades de escala e produtos para pausar

Seja direto e específico com números. Responda em português do Brasil.`;

// ─── Análise LLM ─────────────────────────────────────────────────────────────

async function analyzeWithLLM(data: MLPerformanceData): Promise<{
  analysis: string;
  recommendations: Array<{
    priority: "alta" | "media" | "baixa";
    campanha: string;
    titulo: string;
    descricao: string;
    acao: string;
  }>;
  summary: string;
}> {
  // Prepara resumo compacto para não sobrecarregar o LLM
  const compactItems = data.items.map((i) => ({
    id: i.id,
    title: i.title.slice(0, 60),
    price: i.price,
    stock: i.available_quantity,
    sold_total: i.sold_quantity,
    listing_type: i.listing_type_id,
    health: i.health,
  }));

  const result = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Avalie a performance da conta Feminnita no Mercado Livre com os dados abaixo e gere o relatório completo.

**Período:** ${data.period}
**Vendedor:** ${data.sellerId}

**Resumo do período:**
- Anúncios ativos: ${data.summary.totalActiveItems}
- Unidades vendidas (30d): ${data.summary.totalSoldLast30d}
- Receita (30d): R$${data.summary.totalRevenueLast30d.toFixed(2)}
- Ticket médio: R$${data.summary.avgOrderValue.toFixed(2)}
- Top produtos (IDs): ${data.summary.topSellingIds.join(", ") || "nenhum"}
- Sem vendas (IDs): ${data.summary.zeroSalesIds.join(", ") || "nenhum"}

**Listagens ativas:**
${JSON.stringify(compactItems, null, 2)}

Forneça:
1. Resumo executivo (2-3 frases)
2. Análise detalhada por produto/grupo
3. Alertas críticos
4. Recomendações priorizadas

Ao final, retorne JSON EXATO:
\`\`\`json
{
  "summary": "resumo em 1 frase",
  "analysis": "análise completa em texto corrido",
  "recommendations": [
    {
      "priority": "alta",
      "campanha": "nome/id do produto",
      "titulo": "título da recomendação",
      "descricao": "descrição detalhada",
      "acao": "ação específica a tomar"
    }
  ]
}
\`\`\``,
      },
    ],
    maxTokens: 4000,
  });

  const content = String(result.choices[0]?.message?.content || "");

  // Extrai JSON do bloco markdown
  const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.analysis) return parsed;
    } catch {}
  }

  // Tenta parse direto
  try {
    const parsed = JSON.parse(content);
    if (parsed.analysis) return parsed;
  } catch {}

  return {
    analysis: content,
    summary: "Avaliação concluída — veja a análise completa abaixo.",
    recommendations: [],
  };
}

// ─── Chat follow-up ───────────────────────────────────────────────────────────

export async function chatWithMLAgent(
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  rawMetrics: string
): Promise<string> {
  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          SYSTEM_PROMPT +
          `\n\nDados da avaliação:\n${rawMetrics}\n\nResponda as dúvidas sobre a performance ML de forma direta e prática.`,
      },
      ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
    ],
    maxTokens: 1024,
  });

  const content = result.choices[0]?.message?.content;
  return typeof content === "string"
    ? content
    : "Não consegui processar. Tente novamente.";
}

// ─── Execução principal ───────────────────────────────────────────────────────

export async function runMLAdsEvaluation(evaluationId: number, account = "feminnita"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");

  try {
    await db
      .update(mlAdsEvaluations)
      .set({ status: "running" })
      .where(eq(mlAdsEvaluations.id, evaluationId));

    if (!getMLToken(account)) {
      await db
        .update(mlAdsEvaluations)
        .set({
          status: "error",
          errorMessage: `Token ML não configurado para conta ${account}`,
          completedAt: new Date(),
        })
        .where(eq(mlAdsEvaluations.id, evaluationId));
      return;
    }

    const mlData = await collectMLAdsData(account);
    const llmResult = await analyzeWithLLM(mlData);

    await db
      .update(mlAdsEvaluations)
      .set({
        status: "done",
        rawMetrics: JSON.stringify(mlData),
        analysis: llmResult.analysis,
        recommendations: JSON.stringify(llmResult.recommendations),
        summary: llmResult.summary,
        completedAt: new Date(),
      })
      .where(eq(mlAdsEvaluations.id, evaluationId));

    console.log(
      `[MLAgent] Avaliação ${evaluationId} concluída — ${mlData.items.length} itens, ${mlData.recentOrders.length} pedidos analisados`
    );
  } catch (err: any) {
    console.error(`[MLAgent] Erro na avaliação ${evaluationId}:`, err);
    await db
      .update(mlAdsEvaluations)
      .set({
        status: "error",
        errorMessage: err.message?.slice(0, 499) || "Erro desconhecido",
        completedAt: new Date(),
      })
      .where(eq(mlAdsEvaluations.id, evaluationId));
  }
}
