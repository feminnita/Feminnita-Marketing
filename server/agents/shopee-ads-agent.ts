/**
 * Shopee Ads Agent — Especialista em Campanhas Shopee para Feminnita Pijamas
 *
 * Busca dados reais da Shopee Ads API, analisa com LLM especializado
 * em atacado de moda brasileiro. NÃO executa ações na conta.
 */

import { getDb } from "../db";
import { shopeeAdsEvaluations, shopeeAdsEvaluationMessages } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { shopeeGet } from "../services/shopeeApi";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ShopeeAd {
  adid?: number;
  ad_name?: string;
  ad_status?: string;
  ad_type?: string;
  cpc_bid?: number;
  daily_budget?: number;
}

interface ShopeeAdReport {
  adid?: number;
  impression?: number;
  click?: number;
  order?: number;
  gmv?: number;
  expense?: number;
  cpc?: number;
  ctr?: number;
  roas?: number;
  acos?: number;
}

interface ShopeeAdData {
  adid: number;
  name: string;
  status: string;
  type: string;
  cpcBid: number;
  clicks: number;
  impressions: number;
  orders: number;
  gmv: number;
  expense: number;
  cpc: number;
  ctr: number;
  roas: number;
  acos: number;
}

// ─── Benchmarks Feminnita (atacado moda) ──────────────────────────────────────

const SYSTEM_PROMPT = `Você é um especialista em Shopee Ads para atacado de moda brasileiro.

Contexto: Feminnita Pijamas — atacado para revendedoras, ticket médio R$400, público alvo: revendedoras e lojistas que compram pijamas para revenda.

Benchmarks de referência:
- ROAS: meta > 3x (excelente > 5x)
- CPC: meta < R$0,50
- CTR: meta > 0,3%
- ACOS: meta < 20%
- Taxa conversão: meta > 1%

Ao analisar, foque em:
1. Campanhas com ROAS abaixo de 3x — precisam de intervenção urgente
2. Palavras-chave ou anúncios com CPC alto e baixa conversão
3. Orçamento mal alocado entre campanhas
4. Oportunidades de escala em campanhas de alta performance
5. Sazonalidade e datas importantes para pijamas (inverno, dia das mães, natal)

Responda sempre em português do Brasil. Seja direto e específico com números.`;

// ─── Coleta de dados ──────────────────────────────────────────────────────────

export async function collectShopeeAdsData(): Promise<{
  ads: ShopeeAdData[];
  shopId: string;
  period: string;
}> {
  const shopId = process.env.SHOPEE_SHOP_ID || "";
  if (!shopId) throw new Error("SHOPEE_SHOP_ID não configurado. Conecte sua conta Shopee primeiro.");

  const accessToken = process.env.SHOPEE_ACCESS_TOKEN || "";
  if (!accessToken) throw new Error("SHOPEE_ACCESS_TOKEN não configurado.");

  // Busca lista de anúncios
  let adsRaw: ShopeeAd[] = [];
  try {
    const adsResponse = await shopeeGet("/api/v2/ads/get_ads_list");
    adsRaw = adsResponse?.response?.ads || adsResponse?.ads || [];
  } catch (err) {
    console.warn("[ShopeeAds] Erro ao buscar lista de anúncios:", err);
  }

  // Busca relatório de performance (últimos 7 dias)
  const endDate = Math.floor(Date.now() / 1000);
  const startDate = endDate - 7 * 24 * 60 * 60;

  let reportsRaw: ShopeeAdReport[] = [];
  try {
    const reportsResponse = await shopeeGet("/api/v2/ads/get_reports_list", {
      start_time: String(startDate),
      end_time: String(endDate),
    });
    reportsRaw = reportsResponse?.response?.reports || reportsResponse?.reports || [];
  } catch (err) {
    console.warn("[ShopeeAds] Erro ao buscar relatórios:", err);
  }

  // Mescla anúncios com métricas
  const reportsMap = new Map<number, ShopeeAdReport>();
  for (const r of reportsRaw) {
    if (r.adid) reportsMap.set(r.adid, r);
  }

  const ads: ShopeeAdData[] = adsRaw.map((ad) => {
    const report = ad.adid ? reportsMap.get(ad.adid) : undefined;
    return {
      adid: ad.adid || 0,
      name: ad.ad_name || "Anúncio sem nome",
      status: ad.ad_status || "unknown",
      type: ad.ad_type || "unknown",
      cpcBid: ad.cpc_bid || 0,
      clicks: report?.click || 0,
      impressions: report?.impression || 0,
      orders: report?.order || 0,
      gmv: report?.gmv || 0,
      expense: report?.expense || 0,
      cpc: report?.cpc || 0,
      ctr: report?.ctr || 0,
      roas: report?.roas || 0,
      acos: report?.acos || 0,
    };
  });

  const now = new Date();
  const period = `${now.toLocaleDateString("pt-BR")} — últimos 7 dias`;

  return { ads, shopId, period };
}

// ─── Avaliação com LLM ────────────────────────────────────────────────────────

export async function runShopeeAdsEvaluation(evaluationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");

  try {
    // Atualiza status para "running"
    await db
      .update(shopeeAdsEvaluations)
      .set({ status: "running" })
      .where(eq(shopeeAdsEvaluations.id, evaluationId));

    const { ads, shopId, period } = await collectShopeeAdsData();

    const rawMetrics = JSON.stringify({ ads, shopId, period });

    const prompt = `Analise os seguintes dados de campanhas Shopee Ads da Feminnita Pijamas:

**Período:** ${period}
**Shop ID:** ${shopId}
**Total de anúncios:** ${ads.length}

**Dados dos anúncios:**
${JSON.stringify(ads, null, 2)}

**Benchmarks:** ROAS > 3x | CPC < R$0,50 | CTR > 0,3% | ACOS < 20%

Por favor, forneça:
1. **Resumo executivo** (2-3 frases)
2. **Análise detalhada** por campanha/anúncio
3. **Alertas críticos** (o que precisa de ação imediata)
4. **Recomendações priorizadas** (alta/média/baixa prioridade)

Ao final, retorne um JSON com este formato EXATO (após sua análise em texto):
\`\`\`json
{
  "summary": "resumo em 1 frase",
  "recommendations": [
    {
      "priority": "alta",
      "titulo": "título da recomendação",
      "descricao": "descrição detalhada",
      "acao": "ação específica a tomar"
    }
  ]
}
\`\`\``;

    const result = await invokeLLM({
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
      maxTokens: 4000,
    });

    const fullText = result.content || "";

    // Extrai JSON das recomendações
    let summary = "Análise concluída";
    let recommendations: any[] = [];

    const jsonMatch = fullText.match(/```json\s*([\s\S]*?)```/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        summary = parsed.summary || summary;
        recommendations = parsed.recommendations || [];
      } catch {
        // ignora erro de parse
      }
    }

    // Extrai análise (texto antes do bloco JSON)
    const analysis = fullText.replace(/```json[\s\S]*?```/g, "").trim();

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
  } catch (err: any) {
    console.error("[ShopeeAdsAgent] Erro:", err);
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
  const metricsContext = rawMetrics
    ? `\n\nDados das campanhas analisadas:\n${rawMetrics}`
    : "";

  const result = await invokeLLM({
    system: SYSTEM_PROMPT + metricsContext,
    messages: history,
    maxTokens: 2000,
  });

  return result.content || "Desculpe, não consegui processar sua pergunta.";
}
