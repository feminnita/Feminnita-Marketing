/**
 * TikTok Shop Agent — Especialista em TikTok Shop para Feminnita
 *
 * Usa dados via TikTok Shop Open API:
 * - Produtos ativos (listagens, preços, estoque)
 * - Pedidos recentes (últimos 30 dias)
 * - Métricas de desempenho da loja
 */

import { getDb } from "../db";
import { tiktokShopEvaluations, tiktokShopEvaluationMessages } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { tiktokShopGet } from "../services/tiktokShopApi";
import { getLatestKnowledge } from "./knowledge-updater";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface TiktokShopProduct {
  id: string;
  title: string;
  status: string;
  price: number;
  stock: number;
  sales?: number;
}

export interface TiktokShopOrder {
  id: string;
  status: string;
  amount: number;
  date: string;
}

export interface TiktokShopPerformanceData {
  products: TiktokShopProduct[];
  orders: TiktokShopOrder[];
  shopId: string;
  period: string;
  summary: {
    totalActiveProducts: number;
    totalOrders30d: number;
    totalRevenue30d: number;
    avgOrderValue: number;
  };
}

// ─── Fetch: Produtos ──────────────────────────────────────────────────────────

async function fetchProducts(): Promise<TiktokShopProduct[]> {
  try {
    const data = await tiktokShopGet("/api/products/202309/products", {
      page_size: "50",
      status: "4", // ACTIVATE
    });

    const products: any[] = data?.data?.products || [];
    return products.map((p: any) => ({
      id: p.id,
      title: p.title || `Produto ${p.id}`,
      status: p.status || "ACTIVE",
      price: p.skus?.[0]?.price?.sale_price || 0,
      stock: p.skus?.reduce((acc: number, s: any) => acc + (s.stock?.available_stock || 0), 0) || 0,
    }));
  } catch (err) {
    console.warn("[TikTokShopAgent] Erro ao buscar produtos:", err);
    return [];
  }
}

// ─── Fetch: Pedidos ────────────────────────────────────────────────────────────

async function fetchOrders(): Promise<TiktokShopOrder[]> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const from = now - 30 * 24 * 60 * 60;

    const data = await tiktokShopGet("/api/orders/202309/orders", {
      page_size: "50",
      create_time_from: String(from),
      create_time_to: String(now),
      status: "COMPLETED",
    });

    const orders: any[] = data?.data?.orders || [];
    return orders.map((o: any) => ({
      id: o.id,
      status: o.status,
      amount: o.payment?.total_amount || 0,
      date: new Date((o.create_time || 0) * 1000).toLocaleDateString("pt-BR"),
    }));
  } catch (err) {
    console.warn("[TikTokShopAgent] Erro ao buscar pedidos:", err);
    return [];
  }
}

// ─── Coleta completa ──────────────────────────────────────────────────────────

export async function collectTiktokShopData(): Promise<TiktokShopPerformanceData> {
  const shopId = process.env.TIKTOK_SHOP_ID || process.env.TIKTOK_ADS_APP_ID || "";

  const [products, orders] = await Promise.all([
    fetchProducts(),
    fetchOrders(),
  ]);

  const totalRevenue30d = orders.reduce((acc, o) => acc + o.amount, 0);
  const avgOrderValue = orders.length ? totalRevenue30d / orders.length : 0;

  const period = `${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")} — ${new Date().toLocaleDateString("pt-BR")} (30 dias)`;

  return {
    products,
    orders: orders.slice(0, 20),
    shopId,
    period,
    summary: {
      totalActiveProducts: products.length,
      totalOrders30d: orders.length,
      totalRevenue30d,
      avgOrderValue,
    },
  };
}

// ─── Sistema de prompt ────────────────────────────────────────────────────────

async function buildSystemPrompt(): Promise<string> {
  const [marketplaceKnowledge, fashionKnowledge] = await Promise.all([
    getLatestKnowledge("knowledge_marketplaces"),
    getLatestKnowledge("knowledge_fashion"),
  ]);

  const knowledgeBlock = [
    marketplaceKnowledge
      ? `## Inteligência atual — Marketplaces\n${marketplaceKnowledge.summary}\nTendências: ${marketplaceKnowledge.trends.join(" | ")}\nAlertas: ${marketplaceKnowledge.warnings.join(" | ")}`
      : "",
    fashionKnowledge
      ? `## Inteligência atual — Moda/Produto\n${fashionKnowledge.summary}\nTendências: ${fashionKnowledge.trends.join(" | ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return `Você é Valentina Cruz, especialista sênior em TikTok Shop e social commerce com 11 anos de experiência em e-commerce de moda na América Latina.

**Formação e credenciais:**
- MBA em Digital Commerce pela FGV-SP
- Certificada em TikTok Shop Academy e TikTok for Business (Partner certificada)
- Ex-head de marketplace da Renner Digital e consultora sênior da Infracommerce
- Construiu do zero operações de TikTok Shop para 3 marcas brasileiras que chegaram a 5.000 pedidos/mês

**Especialidades:**
- TikTok Shop Open API: integração técnica, gestão de SKUs, fulfillment, disputes
- Programa de afiliados TikTok: recrutamento, comissionamento, gestão de criadores
- TikTok LIVE Commerce: produção, escalada de vendas ao vivo, re-streaming
- SEO interno TikTok Shop: títulos, atributos, categorias, review velocity
- Algoritmo TikTok Shop: como o "shop tab" ranqueia, fatores de confiança do vendedor

**Metodologia:**
- Framework RSVP: Reach → Shop → Verify → Purchase (funil específico TikTok)
- Análise por cohort de afiliados (top 20% geram 80% das vendas)
- Estratégia "Anchor + Long tail": 1 produto âncora viral + 10-15 SKUs complementares

**Benchmarks que usa:**
- Taxa de conversão shop tab: 3-6% saudável para moda atacado
- GMV/afiliado ativo: R$2.000-8.000/mês para nicho pijamas
- CTR vídeo→shop: 5%+ é excelente, <2% precisa retrabalho de criativo
- LIVEs de moda: pico de vendas nos primeiros 20min e nos últimos 10min

${knowledgeBlock ? `---\n${knowledgeBlock}\n---` : ""}

Responda em português do Brasil. Seja direto com números concretos. Priorize ações com maior ROI imediato.`;
}

// ─── Avaliação com LLM ────────────────────────────────────────────────────────

export async function runTiktokShopEvaluation(evaluationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");

  try {
    await db
      .update(tiktokShopEvaluations)
      .set({ status: "running" })
      .where(eq(tiktokShopEvaluations.id, evaluationId));

    const data = await collectTiktokShopData();
    const rawMetrics = JSON.stringify(data);

    const connected = !!(process.env.TIKTOK_SHOP_ACCESS_TOKEN);
    const productsList = connected
      ? JSON.stringify(data.products.slice(0, 20), null, 2)
      : "API ainda não autorizada — aguardando aprovação do app TikTok Shop";

    const systemPrompt = await buildSystemPrompt();

    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Avalie a performance da conta Feminnita no TikTok Shop com os dados abaixo.

**Período:** ${data.period}
**Shop ID:** ${data.shopId || "Pendente de autorização OAuth"}

**Resumo (30 dias):**
- Produtos ativos: ${data.summary.totalActiveProducts}
- Pedidos concluídos: ${data.summary.totalOrders30d}
- Receita: R$${data.summary.totalRevenue30d.toFixed(2)}
- Ticket médio: R$${data.summary.avgOrderValue.toFixed(2)}

**Produtos:**
${productsList}

${!connected ? `
**NOTA IMPORTANTE:** O aplicativo TikTok Shop da Feminnita ainda está em processo de aprovação de segurança pelo TikTok. Enquanto aguarda, forneça:
1. Estratégia de lançamento recomendada para quando o app for aprovado
2. Melhores práticas de TikTok Shop para atacadistas de moda
3. Como estruturar as primeiras campanhas de afiliados TikTok
4. Checklist de preparação de produtos para o TikTok Shop
` : ""}

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
      .update(tiktokShopEvaluations)
      .set({
        status: "done",
        rawMetrics,
        analysis,
        recommendations: JSON.stringify(recommendations),
        summary,
        completedAt: new Date(),
      })
      .where(eq(tiktokShopEvaluations.id, evaluationId));

    console.log(`[TikTokShopAgent] Avaliação ${evaluationId} concluída`);
  } catch (err: any) {
    console.error(`[TikTokShopAgent] Erro:`, err);
    await db
      .update(tiktokShopEvaluations)
      .set({
        status: "error",
        errorMessage: String(err?.message || err).slice(0, 500),
        completedAt: new Date(),
      })
      .where(eq(tiktokShopEvaluations.id, evaluationId));
    throw err;
  }
}

// ─── Chat com especialista ────────────────────────────────────────────────────

export async function chatWithTiktokShopAgent(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  rawMetrics: string
): Promise<string> {
  const systemPrompt = await buildSystemPrompt();
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
