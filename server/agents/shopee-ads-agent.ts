/**
 * Shopee Performance Agent — Especialista em Shopee para Feminnita
 *
 * Usa dados disponíveis via Shopee Open API:
 * - Produtos ativos (listagens, preços, estoque, vendas)
 * - Pedidos recentes (últimos 30 dias)
 *
 * A API de Shopee Ads requer permissões especiais não disponíveis ainda.
 * Enquanto aguarda, analisa performance orgânica como proxy.
 */

import { getDb } from "../db";
import { shopeeAdsEvaluations, shopeeAdsEvaluationMessages } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { shopeeGet } from "../services/shopeeApi";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ShopeeItem {
  item_id: number;
  item_name: string;
  item_status: string;
  price_info?: Array<{ current_price: number; original_price: number }>;
  stock_info_v2?: { summary_info?: { total_reserved_stock: number; total_available_stock: number } };
  sales?: number;
}

interface ShopeeOrder {
  order_sn: string;
  order_status: string;
  total_amount: number;
  create_time: number;
  item_list?: Array<{ item_id: number; item_name: string; model_quantity_purchased: number; model_discounted_price: number }>;
}

export interface ShopeePerformanceData {
  items: Array<{
    id: number;
    name: string;
    status: string;
    price: number;
    stock: number;
  }>;
  ads: Array<{ // alias de items para compatibilidade com frontend
    id: number;
    name: string;
    status: string;
    price: number;
    stock: number;
  }>;
  orders: Array<{
    sn: string;
    status: string;
    amount: number;
    date: string;
  }>;
  shopId: string;
  period: string;
  summary: {
    totalActiveItems: number;
    totalOrders30d: number;
    totalRevenue30d: number;
    avgOrderValue: number;
  };
}

// ─── Fetch: Campanhas de Ads ──────────────────────────────────────────────────

async function fetchAdsCampaigns(): Promise<ShopeePerformanceData["items"]> {
  try {
    const campaignList = await shopeeGet("/api/v2/ads/get_product_level_campaign_id_list", {
      page_size: "100",
      page: "1",
    });
    const campaigns: Array<{ ad_type: string; campaign_id: number }> =
      campaignList?.response?.campaign_list || [];

    console.log(`[ShopeeAgent] ${campaigns.length} campanhas encontradas`);

    // Busca performance dos últimos 7 dias por campanha (top 20)
    const now = new Date();
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = now.toISOString().slice(0, 10);
    const startDate = from.toISOString().slice(0, 10);

    const perfMap: Record<number, any> = {};
    const batchIds = campaigns.slice(0, 20).map((c) => c.campaign_id);

    try {
      const perf = await shopeeGet("/api/v2/ads/get_product_campaign_daily_performance", {
        campaign_id_list: batchIds.join(","),
        start_date: startDate,
        end_date: endDate,
      });
      const perfList: any[] = perf?.response?.campaign_performance_list || [];
      for (const p of perfList) {
        if (!perfMap[p.campaign_id]) perfMap[p.campaign_id] = { clicks: 0, impressions: 0, expense: 0, orders: 0, gmv: 0 };
        const d = perfMap[p.campaign_id];
        d.clicks += p.click || 0;
        d.impressions += p.impression || 0;
        d.expense += p.expense || 0;
        d.orders += p.order || 0;
        d.gmv += p.gmv || 0;
      }
    } catch (err) {
      console.warn("[ShopeeAgent] Erro ao buscar performance por campanha:", err);
    }

    return campaigns.slice(0, 50).map((c) => {
      const p = perfMap[c.campaign_id];
      const roas = p && p.expense > 0 ? p.gmv / p.expense : 0;
      const cpc = p && p.clicks > 0 ? p.expense / p.clicks : 0;
      return {
        id: c.campaign_id,
        name: `Campanha ${c.campaign_id} (${c.ad_type})`,
        status: "ACTIVE",
        price: cpc,
        stock: p?.clicks || 0,
        clicks: p?.clicks || 0,
        impressions: p?.impressions || 0,
        expense: p?.expense || 0,
        orders: p?.orders || 0,
        roas,
        cpc,
      } as any;
    });
  } catch (err) {
    console.warn("[ShopeeAgent] Erro ao buscar campanhas:", err);
    return [];
  }
}

// ─── Fetch: Performance CPC diária ────────────────────────────────────────────

async function fetchAdsPerformance(): Promise<{ clicks: number; impressions: number; expense: number; orders: number; gmv: number }> {
  try {
    const now = new Date();
    const from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const endDate = now.toISOString().slice(0, 10);
    const startDate = from.toISOString().slice(0, 10);

    const data = await shopeeGet("/api/v2/ads/get_all_cpc_ads_daily_performance", {
      start_date: startDate,
      end_date: endDate,
    });

    const rows: any[] = data?.response?.daily_performance || [];
    return rows.reduce(
      (acc, r) => ({
        clicks: acc.clicks + (r.click || 0),
        impressions: acc.impressions + (r.impression || 0),
        expense: acc.expense + (r.expense || 0),
        orders: acc.orders + (r.order || 0),
        gmv: acc.gmv + (r.gmv || 0),
      }),
      { clicks: 0, impressions: 0, expense: 0, orders: 0, gmv: 0 }
    );
  } catch (err) {
    console.warn("[ShopeeAgent] Erro ao buscar performance:", err);
    return { clicks: 0, impressions: 0, expense: 0, orders: 0, gmv: 0 };
  }
}

// ─── Fetch: Saldo de Ads ──────────────────────────────────────────────────────

async function fetchAdsBalance(): Promise<number> {
  try {
    const data = await shopeeGet("/api/v2/ads/get_total_balance");
    return data?.response?.balance || 0;
  } catch {
    return 0;
  }
}

// ─── Fetch: Pedidos recentes ───────────────────────────────────────────────────

async function fetchOrders(): Promise<ShopeePerformanceData["orders"]> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const from = now - 30 * 24 * 60 * 60;

    const data = await shopeeGet("/api/v2/order/get_order_list", {
      time_range_field: "create_time",
      time_from: String(from),
      time_to: String(now),
      page_size: "50",
      order_status: "COMPLETED",
    });

    const orders: ShopeeOrder[] = data?.response?.order_list || [];
    return orders.map((o) => ({
      sn: o.order_sn,
      status: o.order_status,
      amount: o.total_amount || 0,
      date: new Date(o.create_time * 1000).toLocaleDateString("pt-BR"),
    }));
  } catch (err) {
    console.warn("[ShopeeAgent] Erro ao buscar pedidos:", err);
    return [];
  }
}

// ─── Coleta completa ──────────────────────────────────────────────────────────

export async function collectShopeeAdsData(): Promise<ShopeePerformanceData> {
  const shopId = process.env.SHOPEE_SHOP_ID || "";
  if (!shopId) throw new Error("SHOPEE_SHOP_ID não configurado.");


  const [campaigns, performance, balance, orders] = await Promise.all([
    fetchAdsCampaigns(),
    fetchAdsPerformance(),
    fetchAdsBalance(),
    fetchOrders(),
  ]);

  const totalRevenue30d = orders.reduce((acc, o) => acc + o.amount, 0);
  const avgOrderValue = orders.length ? totalRevenue30d / orders.length : 0;
  const roas = performance.expense > 0 ? performance.gmv / performance.expense : 0;
  const ctr = performance.impressions > 0 ? (performance.clicks / performance.impressions) * 100 : 0;
  const cpc = performance.clicks > 0 ? performance.expense / performance.clicks : 0;

  const period = `${new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")} — ${new Date().toLocaleDateString("pt-BR")} (7 dias Ads / 30 dias pedidos)`;

  return {
    items: campaigns,
    ads: campaigns,
    orders: orders.slice(0, 20),
    shopId,
    period,
    adsPerformance: { ...performance, roas, ctr, cpc, balance },
    summary: {
      totalActiveItems: campaigns.length,
      totalOrders30d: orders.length,
      totalRevenue30d,
      avgOrderValue,
    },
  } as any;
}

// ─── Sistema de prompt ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é um especialista em performance de vendas na Shopee para empresas de atacado de moda brasileiras.

Contexto específico desta conta (Feminnita Pijamas):
- Produto: pijamas de atacado para revendedoras
- Público-alvo: revendedoras em todo o Brasil
- Ticket médio: R$400 por pedido
- Objetivo: aumentar pedidos de atacado via Shopee

Benchmarks de referência:
- ROAS: meta > 3x
- Taxa de conversão: meta > 1%
- Produtos com estoque > 0 e sem vendas em 30 dias = problema

Ao analisar:
1. Produtos com estoque mas sem vendas — identificar causas
2. Produtos campeões para escalar
3. Oportunidades de sazonalidade (inverno = alta para pijamas)
4. Preços e posicionamento vs. concorrência
5. Gaps de estoque nos produtos mais vendidos

Responda em português do Brasil. Seja direto com números.`;

// ─── Avaliação com LLM ────────────────────────────────────────────────────────

export async function runShopeeAdsEvaluation(evaluationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");

  try {
    await db
      .update(shopeeAdsEvaluations)
      .set({ status: "running" })
      .where(eq(shopeeAdsEvaluations.id, evaluationId));

    const data = await collectShopeeAdsData();
    const rawMetrics = JSON.stringify(data);

    const result = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Avalie a performance da conta Feminnita na Shopee com os dados abaixo.

**Período:** ${data.period}
**Shop ID:** ${data.shopId}

**Métricas de Ads (7 dias):**
- Campanhas ativas: ${data.summary.totalActiveItems}
- Cliques: ${(data as any).adsPerformance?.clicks || 0}
- Impressões: ${(data as any).adsPerformance?.impressions || 0}
- Gasto: R$${((data as any).adsPerformance?.expense || 0).toFixed(2)}
- Pedidos via Ads: ${(data as any).adsPerformance?.orders || 0}
- GMV via Ads: R$${((data as any).adsPerformance?.gmv || 0).toFixed(2)}
- ROAS: ${((data as any).adsPerformance?.roas || 0).toFixed(2)}x
- CTR: ${((data as any).adsPerformance?.ctr || 0).toFixed(2)}%
- CPC: R$${((data as any).adsPerformance?.cpc || 0).toFixed(2)}
- Saldo disponível: R$${((data as any).adsPerformance?.balance || 0).toFixed(2)}

**Pedidos orgânicos (30d):**
- Total: ${data.summary.totalOrders30d}
- Receita: R$${data.summary.totalRevenue30d.toFixed(2)}
- Ticket médio: R$${data.summary.avgOrderValue.toFixed(2)}

**Campanhas:**
${JSON.stringify(data.items.slice(0, 20), null, 2)}

Forneça análise completa e ao final retorne JSON:
\`\`\`json
{
  "summary": "resumo em 1 frase",
  "analysis": "análise completa em texto",
  "recommendations": [
    {
      "priority": "alta",
      "titulo": "título",
      "descricao": "descrição",
      "acao": "ação concreta"
    }
  ]
}
\`\`\``,
        },
      ],
      maxTokens: 4000,
    });

    const content = String(result.choices[0]?.message?.content || "");

    let summary = "Avaliação concluída";
    let analysis = content;
    let recommendations: any[] = [];

    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        summary = parsed.summary || summary;
        analysis = parsed.analysis || content.replace(/```json[\s\S]*?```/g, "").trim();
        recommendations = parsed.recommendations || [];
      } catch {}
    }

    await db
      .update(shopeeAdsEvaluations)
      .set({
        status: "done",
        rawMetrics,
        analysis,
        recommendations: JSON.stringify(recommendations),
        summary,
        completedAt: new Date(),
      })
      .where(eq(shopeeAdsEvaluations.id, evaluationId));

    console.log(`[ShopeeAgent] Avaliação ${evaluationId} concluída`);
  } catch (err: any) {
    console.error(`[ShopeeAgent] Erro:`, err);
    await db
      .update(shopeeAdsEvaluations)
      .set({
        status: "error",
        errorMessage: String(err?.message || err).slice(0, 500),
        completedAt: new Date(),
      })
      .where(eq(shopeeAdsEvaluations.id, evaluationId));
    throw err;
  }
}

// ─── Chat com especialista ────────────────────────────────────────────────────

export async function chatWithShopeeAgent(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  rawMetrics: string
): Promise<string> {
  const metricsContext = rawMetrics ? `\n\nDados da loja analisada:\n${rawMetrics}` : "";

  const result = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT + metricsContext },
      ...history,
    ],
    maxTokens: 2000,
  });

  return String(
    result.choices[0]?.message?.content || "Não consegui processar sua pergunta."
  );
}
