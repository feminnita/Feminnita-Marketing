/**
 * ML Ads Agent — Especialista em Mercado Livre Ads
 *
 * Responsabilidade: buscar dados reais da ML Ads API v2, analisar com LLM
 * especializado em tráfego para atacado de moda, e gerar relatório de avaliação.
 *
 * NÃO executa ações na conta. Apenas avalia e recomenda.
 */

import { getDb } from "../db";
import { mlAdsEvaluations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

const ML_BASE = "https://api.mercadolibre.com";

function getMLToken(): string {
  return process.env.ML_ACCESS_TOKEN_1 || "";
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface MLCampaign {
  id: string;
  name: string;
  status: string;
  type: string;
  daily_budget?: number;
  clicks?: number;
  impressions?: number;
  ctr?: number;
  cpc?: number;
  sales?: number;
}

interface MLStatsRaw {
  date_from?: string;
  date_to?: string;
  clicks?: number;
  impressions?: number;
  spend?: number;
  sales?: number;
  [key: string]: unknown;
}

export interface MLAdsData {
  campaigns: MLCampaign[];
  adAccountId: string;
  stats: MLStatsRaw | null;
}

// ─── Fetch ML API ─────────────────────────────────────────────────────────────

async function fetchMLCampaigns(): Promise<MLCampaign[]> {
  const token = getMLToken();
  const url = `${ML_BASE}/advertising/product_ads/campaigns?app_version=v2`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.message || data.error || `ML API HTTP ${res.status}`);
  }

  return (data.results || data || []) as MLCampaign[];
}

async function fetchMLStats(): Promise<MLStatsRaw | null> {
  const token = getMLToken();
  const now = new Date();
  const dateTo = now.toISOString().slice(0, 10);
  const dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const url =
    `${ML_BASE}/advertising/product_ads/stats` +
    `?date_from=${dateFrom}&date_to=${dateTo}&app_version=v2`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    console.warn(`[MLAds] Stats indisponíveis: HTTP ${res.status}`);
    return null;
  }

  return res.json();
}

// ─── Coleta completa ──────────────────────────────────────────────────────────

export async function collectMLAdsData(): Promise<MLAdsData> {
  const userId = process.env.ML_USER_ID_1 || "";
  const [campaigns, stats] = await Promise.all([
    fetchMLCampaigns(),
    fetchMLStats().catch(() => null),
  ]);

  return { campaigns, adAccountId: userId, stats };
}

// ─── Análise LLM ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é um especialista em Mercado Livre Ads para empresas de atacado de moda brasileiras.

Contexto específico desta conta (Feminnita Pijamas):
- Produto: pijamas de atacado para revendedoras
- Público-alvo: revendedoras nas regiões do Brasil
- Objetivo: gerar pedidos de atacado via Mercado Livre

Benchmarks de referência para este nicho no ML:
- CPC bom: < R$ 0,80
- CTR bom: > 0,5%
- ACOS bom: < 15%

Ao analisar os dados:
1. Seja direto e prático — o dono da empresa é quem lê
2. Use benchmarks reais de ML Ads para moda no Brasil
3. Priorize sempre o que impacta resultado em vendas
4. Quando não houver dados suficientes, diga claramente
5. NÃO recomende ações que você não executaria — seja conservador

Formato de resposta: JSON com os campos "analysis" (texto corrido em português), "recommendations" (array de objetos com priority, campanha, titulo, descricao, acao) e "summary" (1 frase resumindo o estado da conta).`;

async function analyzeWithLLM(
  data: MLAdsData
): Promise<{ analysis: string; recommendations: Array<{
  priority: "alta" | "media" | "baixa";
  campanha: string;
  titulo: string;
  descricao: string;
  acao: string;
}>; summary: string }> {
  const dataStr = JSON.stringify(data, null, 2);

  const result = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Avalie o estado atual da conta Mercado Livre Ads com os dados abaixo e gere o relatório completo.\n\nDados:\n${dataStr}`,
      },
    ],
    outputSchema: {
      name: "ml_ads_evaluation",
      schema: {
        type: "object",
        properties: {
          analysis: { type: "string" },
          summary: { type: "string" },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                priority: { type: "string", enum: ["alta", "media", "baixa"] },
                campanha: { type: "string" },
                titulo: { type: "string" },
                descricao: { type: "string" },
                acao: { type: "string" },
              },
              required: ["priority", "campanha", "titulo", "descricao", "acao"],
            },
          },
        },
        required: ["analysis", "summary", "recommendations"],
      },
    },
  });

  const content = result.choices[0]?.message?.content;
  if (typeof content !== "string") throw new Error("LLM retornou resposta inválida");

  try {
    return JSON.parse(content);
  } catch {
    return {
      analysis: content,
      summary: "Avaliação concluída — veja a análise completa abaixo.",
      recommendations: [],
    };
  }
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
          `\n\nDados da avaliação que você acabou de fazer:\n${rawMetrics}\n\nResponda as dúvidas do usuário sobre as campanhas ML Ads de forma direta e prática.`,
      },
      ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
    ],
    maxTokens: 1024,
  });

  const content = result.choices[0]?.message?.content;
  return typeof content === "string" ? content : "Não consegui processar a resposta. Tente novamente.";
}

// ─── Execução principal ───────────────────────────────────────────────────────

export async function runMLAdsEvaluation(evaluationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");

  try {
    await db
      .update(mlAdsEvaluations)
      .set({ status: "running" })
      .where(eq(mlAdsEvaluations.id, evaluationId));

    if (!getMLToken()) {
      await db
        .update(mlAdsEvaluations)
        .set({
          status: "error",
          errorMessage: "ML_ACCESS_TOKEN_1 não configurado no servidor",
          completedAt: new Date(),
        })
        .where(eq(mlAdsEvaluations.id, evaluationId));
      return;
    }

    const mlData = await collectMLAdsData();
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

    console.log(`[MLAds] Avaliação ${evaluationId} concluída — ${mlData.campaigns.length} campanhas analisadas`);
  } catch (err: any) {
    console.error(`[MLAds] Erro na avaliação ${evaluationId}:`, err);
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
