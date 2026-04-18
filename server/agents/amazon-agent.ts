/**
 * Amazon SP-API Agent — Especialista Amazon para Feminnita
 *
 * Usa Amazon Selling Partner API:
 * - Pedidos recentes (últimos 30 dias)
 * - Catálogo de produtos ativos
 * - Inventário FBA/FBM
 *
 * Requer AMAZON_AWS_ACCESS_KEY + AMAZON_AWS_SECRET_KEY para SigV4.
 * Sem elas, funciona em modo planejamento com dados estruturais.
 */

import { getDb } from "../db";
import { amazonEvaluations, amazonEvaluationMessages } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { spApiGet, isConnected, hasAwsCredentials, MARKETPLACE_ID } from "../services/amazonSpApi";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface AmazonOrder {
  id: string;
  status: string;
  amount: number;
  currency: string;
  date: string;
  items?: number;
}

export interface AmazonProduct {
  asin: string;
  title: string;
  price?: number;
  status?: string;
}

export interface AmazonPerformanceData {
  orders: AmazonOrder[];
  products: AmazonProduct[];
  sellerId: string;
  period: string;
  connected: boolean;
  hasAwsCreds: boolean;
  summary: {
    totalOrders30d: number;
    totalRevenue30d: number;
    avgOrderValue: number;
    totalProducts: number;
  };
}

// ─── Fetch: Pedidos ────────────────────────────────────────────────────────────

async function fetchOrders(): Promise<AmazonOrder[]> {
  try {
    const createdAfter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const data = await spApiGet("/orders/v0/orders", {
      MarketplaceIds: MARKETPLACE_ID,
      CreatedAfter: createdAfter,
      OrderStatuses: "Shipped,Delivered",
      MaxResultsPerPage: "50",
    });

    const orders: any[] = data?.payload?.Orders || [];
    return orders.map((o: any) => ({
      id: o.AmazonOrderId,
      status: o.OrderStatus,
      amount: parseFloat(o.OrderTotal?.Amount || "0"),
      currency: o.OrderTotal?.CurrencyCode || "BRL",
      date: new Date(o.PurchaseDate).toLocaleDateString("pt-BR"),
      items: o.NumberOfItemsShipped || 0,
    }));
  } catch (err) {
    console.warn("[AmazonAgent] Erro ao buscar pedidos:", err);
    return [];
  }
}

// ─── Fetch: Catálogo ───────────────────────────────────────────────────────────

async function fetchProducts(): Promise<AmazonProduct[]> {
  try {
    const data = await spApiGet("/catalog/2022-04-01/items", {
      marketplaceIds: MARKETPLACE_ID,
      keywords: "pijama",
      includedData: "summaries,attributes",
    });

    const items: any[] = data?.items || [];
    return items.slice(0, 20).map((item: any) => ({
      asin: item.asin,
      title: item.summaries?.[0]?.itemName || item.asin,
      price: undefined,
      status: item.summaries?.[0]?.status,
    }));
  } catch (err) {
    console.warn("[AmazonAgent] Erro ao buscar catálogo:", err);
    return [];
  }
}

// ─── Coleta completa ──────────────────────────────────────────────────────────

export async function collectAmazonData(): Promise<AmazonPerformanceData> {
  const connected = isConnected();
  const awsCreds = hasAwsCredentials();
  const sellerId = process.env.AMAZON_SELLER_ID || "";

  let orders: AmazonOrder[] = [];
  let products: AmazonProduct[] = [];

  if (connected && awsCreds) {
    [orders, products] = await Promise.all([fetchOrders(), fetchProducts()]);
  }

  const totalRevenue30d = orders.reduce((acc, o) => acc + o.amount, 0);
  const avgOrderValue = orders.length ? totalRevenue30d / orders.length : 0;
  const period = `${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")} — ${new Date().toLocaleDateString("pt-BR")} (30 dias)`;

  return {
    orders,
    products,
    sellerId,
    period,
    connected,
    hasAwsCreds: awsCreds,
    summary: {
      totalOrders30d: orders.length,
      totalRevenue30d,
      avgOrderValue,
      totalProducts: products.length,
    },
  };
}

// ─── Sistema de prompt ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é um especialista em performance de vendas na Amazon para empresas de atacado de moda brasileiras.

Contexto específico desta conta (Feminnita Pijamas):
- Produto: pijamas de atacado para revendedoras
- Público-alvo: revendedoras e consumidores finais no Brasil
- Ticket médio varejo: R$80-150 por peça / atacado R$400 por pedido
- Objetivo: expandir para Amazon Brasil como canal adicional de vendas
- Marketplace: Amazon.com.br (A2Q3Y263D00KWC)

Ao analisar:
1. Estratégia de entrada no marketplace (FBM vs FBA)
2. Precificação competitiva vs ML e Shopee
3. Otimização de títulos e bullet points para SEO Amazon
4. Oportunidades de Amazon Ads (Sponsored Products)
5. Buy Box e competitividade
6. Avaliações e reputação da conta

Responda em português do Brasil. Seja direto com números.`;

// ─── Avaliação com LLM ────────────────────────────────────────────────────────

export async function runAmazonEvaluation(evaluationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");

  try {
    await db
      .update(amazonEvaluations)
      .set({ status: "running" })
      .where(eq(amazonEvaluations.id, evaluationId));

    const data = await collectAmazonData();
    const rawMetrics = JSON.stringify(data);

    const needsSetup = !data.hasAwsCreds;
    const setupNote = needsSetup ? `
**IMPORTANTE:** As credenciais AWS IAM (AMAZON_AWS_ACCESS_KEY + AMAZON_AWS_SECRET_KEY) ainda não foram configuradas.
O app SP-API está autorizado (refresh token disponível), mas é necessário criar um usuário IAM na AWS e vincular ao app.
Forneça:
1. Estratégia completa de entrada na Amazon Brasil para atacadistas de pijamas
2. Checklist de configuração do SP-API (passos para criar IAM role/user na AWS)
3. Melhores práticas de listing para pijamas no Amazon.com.br
4. Estrutura de campanha Sponsored Products recomendada
5. Comparativo Amazon vs ML vs Shopee para o segmento` : "";

    const result = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Avalie a performance e estratégia da Feminnita na Amazon Brasil.

**Período:** ${data.period}
**Seller ID:** ${data.sellerId || "Pendente configuração"}
**Status API:** ${data.hasAwsCreds ? "Conectada com dados reais" : "Modo planejamento (sem credenciais AWS IAM)"}

**Resumo (30 dias):**
- Pedidos: ${data.summary.totalOrders30d}
- Receita: R$${data.summary.totalRevenue30d.toFixed(2)}
- Ticket médio: R$${data.summary.avgOrderValue.toFixed(2)}
- Produtos no catálogo: ${data.summary.totalProducts}
${setupNote}

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
    const jsonRaw = jsonMatch ? jsonMatch[1] : content.trim().startsWith("{") ? content.trim() : null;
    if (jsonRaw) {
      try {
        const parsed = JSON.parse(jsonRaw);
        summary = parsed.summary || summary;
        analysis = parsed.analysis || content.replace(/```json[\s\S]*?```/g, "").trim();
        recommendations = parsed.recommendations || [];
      } catch {}
    }

    await db
      .update(amazonEvaluations)
      .set({
        status: "done",
        rawMetrics,
        analysis,
        recommendations: JSON.stringify(recommendations),
        summary,
        completedAt: new Date(),
      })
      .where(eq(amazonEvaluations.id, evaluationId));

    console.log(`[AmazonAgent] Avaliação ${evaluationId} concluída`);
  } catch (err: any) {
    console.error(`[AmazonAgent] Erro:`, err);
    await db
      .update(amazonEvaluations)
      .set({
        status: "error",
        errorMessage: String(err?.message || err).slice(0, 500),
        completedAt: new Date(),
      })
      .where(eq(amazonEvaluations.id, evaluationId));
    throw err;
  }
}

// ─── Chat com especialista ────────────────────────────────────────────────────

export async function chatWithAmazonAgent(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  rawMetrics: string
): Promise<string> {
  const metricsContext = rawMetrics ? `\n\nDados da conta Amazon:\n${rawMetrics}` : "";

  const result = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT + metricsContext },
      ...history,
    ],
    maxTokens: 2000,
  });

  return String(result.choices[0]?.message?.content || "Não consegui processar sua pergunta.");
}
