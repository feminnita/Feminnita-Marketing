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
import { buildMemoryContext, saveMemory } from "../services/agentMemory";

const AGENT_NAME = "shopee";

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

// ─── Helpers ─────────────────────────────────────────────────────────────────

function toShopeeDate(d: Date): string {
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}-${mm}-${d.getFullYear()}`;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// ─── Fetch: Campanhas de Ads ──────────────────────────────────────────────────

async function fetchAdsCampaigns(): Promise<ShopeePerformanceData["items"]> {
  try {
    const campaignList = await shopeeGet("/api/v2/ads/get_product_level_campaign_id_list", {
      page_size: "100",
      page: "1",
    });
    const idList: Array<{ ad_type: string; campaign_id: number }> =
      campaignList?.response?.campaign_list || [];

    console.log(`[ShopeeAgent] ${idList.length} campanhas encontradas`);
    if (!idList.length) return [];

    // Performance dos últimos 7 dias por campanha (batches de 20)
    const endDate = toShopeeDate(new Date());
    const startDate = toShopeeDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));

    type CampPerf = { name: string; placement: string; clicks: number; impressions: number; expense: number; orders: number; gmv: number };
    const perfMap: Record<number, CampPerf> = {};
    for (const batch of chunk(idList.map((c) => c.campaign_id), 20)) {
      try {
        const perf = await shopeeGet("/api/v2/ads/get_product_campaign_daily_performance", {
          campaign_id_list: batch.join(","),
          start_date: startDate,
          end_date: endDate,
        });
        // Estrutura real: response.campaign_list[].{ campaign_id, ad_name, campaign_placement, metrics_list[] }
        for (const camp of (perf?.response?.campaign_list || [])) {
          const id: number = camp.campaign_id;
          if (!perfMap[id]) perfMap[id] = { name: camp.ad_name || "", placement: camp.campaign_placement || "", clicks: 0, impressions: 0, expense: 0, orders: 0, gmv: 0 };
          const d = perfMap[id];
          for (const m of (camp.metrics_list || [])) {
            d.clicks     += m.clicks     || 0;
            d.impressions += m.impression || 0;
            d.expense    += m.expense    || 0;
            d.orders     += m.broad_order || 0;
            d.gmv        += m.broad_gmv  || 0;
          }
        }
      } catch (err) {
        console.warn("[ShopeeAgent] Erro ao buscar performance por campanha:", err);
      }
    }

    return idList.map((c) => {
      const p = perfMap[c.campaign_id];
      const roas = p && p.expense > 0 ? p.gmv / p.expense : 0;
      const cpc  = p && p.clicks  > 0 ? p.expense / p.clicks : 0;
      const placement = p?.placement ? ` · ${p.placement}` : "";
      const adName = p?.name ? `${p.name}${placement}` : `${c.campaign_id}`;
      return {
        id: c.campaign_id,
        name: `${adName} [${c.ad_type}]`,
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
    const data = await shopeeGet("/api/v2/ads/get_all_cpc_ads_daily_performance", {
      start_date: toShopeeDate(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)),
      end_date: toShopeeDate(new Date()),
    });

    // response é um array direto (não response.daily_performance)
    const rows: any[] = Array.isArray(data?.response) ? data.response : [];
    return rows.reduce(
      (acc, r) => ({
        clicks:      acc.clicks      + (r.clicks      || 0),
        impressions: acc.impressions + (r.impression  || 0),
        expense:     acc.expense     + (r.expense     || 0),
        orders:      acc.orders      + (r.broad_order || 0),
        gmv:         acc.gmv         + (r.broad_gmv   || 0),
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

export async function collectShopeeAdsData(account = "feminnita"): Promise<ShopeePerformanceData> {
  const shopId = (account === "fnt" ? process.env.SHOPEE_SHOP_ID_2 : process.env.SHOPEE_SHOP_ID) || "";
  if (!shopId) throw new Error(`SHOPEE_SHOP_ID${account === "fnt" ? "_2" : ""} não configurado.`);


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

async function buildShopeePrompt(): Promise<string> {
  const memoryContext = await buildMemoryContext(AGENT_NAME);
  return buildStaticShopeePrompt() + (memoryContext ? `\n\n---\n${memoryContext}\n---` : "");
}

function buildStaticShopeePrompt(): string {
  return `Você é um especialista em Shopee Ads e performance de vendas na Shopee para marcas de moda no Brasil. Você domina: campanhas CPC, boost de produto, Flash Sale, análise de ROAS, otimização de fichas e estratégia de preço no marketplace.

Contexto específico (Feminnita Pijamas):
- Produto: pijamas de SUEDE — na Shopee a venda é B2C, por peça (consumidor final)
- Público-alvo: mulheres adultas em todo o Brasil (conforto, autoestima, presente)
- Ticket médio REAL na Shopee: ~R$76 por pedido (verificado 08/07/2026)
- Objetivo: aumentar GMV e pedidos via Shopee

Benchmarks Shopee Ads Brasil (moda):
- ROAS meta: > 3x (excelente: 5x+)
- CTR saudável: 0,5–2%
- CPC médio moda: R$0,30–1,50
- Taxa de conversão: meta > 1,5%
- Score da loja: manter > 4,5

Ao analisar sempre verificar:
1. Campanhas com ROAS abaixo de 2x → pausar ou ajustar lance
2. Produtos sem vendas em 30 dias com estoque → problema de ficha/preço
3. Produtos campeões → aumentar budget de ads
4. Saldo disponível → alertar se < R$50
5. Oportunidades de Flash Sale e campanhas do marketplace
6. Fichas de produto com baixa CTR → título ou foto precisa melhorar

═══════════════════════════════════════════════════════
REFERÊNCIAS E METODOLOGIA (2024–2025)
═══════════════════════════════════════════════════════
- **Dave Nguyen** — especialista em Shopee Ads no mercado Asia-Pacífico. Metodologia: entender o algoritmo de filtragem por conteúdo da Shopee (relevância de título + imagem + preço competitivo como base para ads performarem). Keyword bidding estratégico: broad match para descoberta, exact match para conversão.
- **Split Dragon** — referência em otimização de marketplace Southeast Asia. Framework: produto precisa ter reviews, fotos e preço competitivo ANTES de ligar ads — ads amplificam o que já funciona orgânico, não consertam produto ruim.
- **Shopee Brands Summit 2025** — ferramentas IA da Shopee para targeting por comportamento de compra, integração com Shopee Live Ads e boosting automatizado de Flash Sale com orçamento dinâmico.`;
}


// ─── Avaliação com LLM ────────────────────────────────────────────────────────

export async function runShopeeAdsEvaluation(evaluationId: number, account = "feminnita"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");

  try {
    await db
      .update(shopeeAdsEvaluations)
      .set({ status: "running" })
      .where(eq(shopeeAdsEvaluations.id, evaluationId));

    const data = await collectShopeeAdsData(account);
    const rawMetrics = JSON.stringify(data);

    const systemPrompt = await buildShopeePrompt();
    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
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

    const period = new Date().toISOString().slice(0, 10);
    await saveMemory(AGENT_NAME, "daily_analysis", period, { summary, highlights: recommendations.slice(0, 3).map((r: any) => r.titulo), alerts: [] });
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
  const systemPrompt = await buildShopeePrompt();
  const metricsContext = rawMetrics ? `\n\nDados da loja analisada:\n${rawMetrics}` : "";

  const result = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt + metricsContext },
      ...history,
    ],
    maxTokens: 2000,
  });

  return String(
    result.choices[0]?.message?.content || "Não consegui processar sua pergunta."
  );
}

export async function updateShopeeKnowledge(): Promise<string> {
  const systemPrompt = await buildShopeePrompt();
  const result = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Gere um resumo semanal sobre Shopee Ads para a Feminnita. O que está funcionando em campanhas Shopee para moda, benchmarks atuais de ROAS e CPC, tendências do marketplace e recomendações de ação para esta semana." },
    ],
    maxTokens: 1500,
  });
  const summary = String(result.choices[0]?.message?.content || "");
  const period = new Date().toISOString().slice(0, 10);
  await saveMemory(AGENT_NAME, "weekly_summary", period, { summary });
  return summary;
}
