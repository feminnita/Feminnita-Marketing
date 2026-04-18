/**
 * Ads Manager Agent — Gestor de Tráfego Meta Ads
 *
 * Responsabilidade: buscar dados reais da Meta Ads API, analisar com LLM
 * especializado em tráfego para atacado de moda, e gerar relatório de avaliação.
 *
 * NÃO executa ações na conta. Apenas avalia e recomenda.
 */

import { getDb } from "../db";
import { adsEvaluations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || "act_231648936319132";
const META_TOKEN = process.env.META_ACCESS_TOKEN || "";
const GRAPH_BASE = "https://graph.facebook.com/v19.0";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface CampaignRaw {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
  created_time?: string;
}

interface InsightRaw {
  impressions?: string;
  reach?: string;
  clicks?: string;
  spend?: string;
  cpc?: string;
  ctr?: string;
  cpp?: string;
  actions?: Array<{ action_type: string; value: string }>;
  date_start?: string;
  date_stop?: string;
}

interface CampaignData {
  id: string;
  name: string;
  status: string;
  objective: string;
  dailyBudget: number;
  insights: {
    period: string;
    impressions: number;
    reach: number;
    clicks: number;
    spend: number;
    cpc: number;
    ctr: number;
    cpp: number;
    purchases: number;
    costPerPurchase: number;
    roas: number;
  } | null;
}

export interface AdsEvaluationResult {
  adAccountId: string;
  fetchedAt: string;
  campaigns: CampaignData[];
  analysis: string;
  recommendations: Array<{
    priority: "alta" | "media" | "baixa";
    campanha: string;
    titulo: string;
    descricao: string;
    acao: string;
  }>;
  summary: string;
}

// ─── Fetch Meta API ───────────────────────────────────────────────────────────

async function fetchCampaigns(): Promise<CampaignRaw[]> {
  const url =
    `${GRAPH_BASE}/${AD_ACCOUNT_ID}/campaigns` +
    `?fields=id,name,status,objective,daily_budget,lifetime_budget,created_time` +
    `&limit=50` +
    `&access_token=${META_TOKEN}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Meta API HTTP ${res.status}`);
  }

  return data.data || [];
}

async function fetchInsights(campaignId: string): Promise<InsightRaw | null> {
  const url =
    `${GRAPH_BASE}/${campaignId}/insights` +
    `?fields=impressions,reach,clicks,spend,cpc,ctr,cpp,actions` +
    `&date_preset=last_7d` +
    `&access_token=${META_TOKEN}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || data.error) {
    console.warn(`[AdsManager] Insights indisponíveis para campanha ${campaignId}: ${data.error?.message}`);
    return null;
  }

  return data.data?.[0] || null;
}

function parseInsights(raw: InsightRaw | null): CampaignData["insights"] {
  if (!raw) return null;

  const impressions = parseInt(raw.impressions || "0");
  const reach = parseInt(raw.reach || "0");
  const clicks = parseInt(raw.clicks || "0");
  const spend = parseFloat(raw.spend || "0");
  const cpc = parseFloat(raw.cpc || "0");
  const ctr = parseFloat(raw.ctr || "0");
  const cpp = parseFloat(raw.cpp || "0");

  const purchases = (raw.actions || [])
    .filter((a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase")
    .reduce((sum, a) => sum + parseFloat(a.value || "0"), 0);

  const costPerPurchase = purchases > 0 ? spend / purchases : 0;

  // ROAS estimado: sem receita real da API — retorna 0 (precisa de dados de Bling)
  const roas = 0;

  const period = raw.date_start && raw.date_stop
    ? `${raw.date_start} a ${raw.date_stop}`
    : "últimos 7 dias";

  return { period, impressions, reach, clicks, spend, cpc, ctr, cpp, purchases, costPerPurchase, roas };
}

// ─── Coleta completa ──────────────────────────────────────────────────────────

export async function collectAdsData(): Promise<{ campaigns: CampaignData[]; adAccountId: string }> {
  const rawCampaigns = await fetchCampaigns();

  const campaigns: CampaignData[] = [];

  for (const c of rawCampaigns) {
    const rawInsights = await fetchInsights(c.id);
    campaigns.push({
      id: c.id,
      name: c.name,
      status: c.status,
      objective: c.objective,
      dailyBudget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : 0,
      insights: parseInsights(rawInsights),
    });
  }

  return { campaigns, adAccountId: AD_ACCOUNT_ID };
}

// ─── Análise LLM ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é um gestor de tráfego especialista em Meta Ads para empresas de atacado de moda brasileiras.

Contexto específico desta conta (Feminnita Pijamas):
- Produto: pijamas de atacado para revendedoras
- Público-alvo: revendedoras nas regiões Sul e Sudeste do Brasil
- Estratégia comprovada: banners estáticos performam MELHOR que vídeos nesta conta (testado por meses)
- Objetivo de conversão: evento "Purchase" via API de Conversões (Pixel 1167582397593975)
- Orçamento atual: R$ 25/dia por campanha
- Campanhas ativas: Remarketing (visitantes 60d sem compra) + Revenda Sul+Sudeste

Ao analisar os dados:
1. Seja direto e prático — o dono da empresa é quem lê
2. Use benchmarks reais de Meta Ads para e-commerce de moda no Brasil
3. CTR bom para este nicho: 1.5%–3.5% | CPM saudável: R$ 15–40 | Custo por compra aceitável: até R$ 80
4. Priorize sempre o que impacta resultado em vendas
5. Quando não houver dados suficientes (campanha nova, em revisão), diga claramente
6. NÃO recomende ações que você não executaria — seja conservador com orçamento

Formato de resposta: JSON com os campos "analysis" (texto corrido em português) e "recommendations" (array de objetos com priority, campanha, titulo, descricao, acao) e "summary" (1 frase resumindo o estado da conta).`;

export async function analyzeWithLLM(
  campaigns: CampaignData[]
): Promise<Pick<AdsEvaluationResult, "analysis" | "recommendations" | "summary">> {
  const dataStr = JSON.stringify(campaigns, null, 2);

  const result = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Avalie o estado atual da conta Meta Ads com os dados abaixo e gere o relatório completo.\n\nDados das campanhas:\n${dataStr}`,
      },
    ],
    outputSchema: {
      name: "ads_evaluation",
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

  // Extrai JSON mesmo se vier dentro de ```json ... ```
  const stripped = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

  try {
    return JSON.parse(stripped);
  } catch {
    // Tenta extrair objeto JSON de qualquer posição no texto
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]); } catch {}
    }
    // Fallback limpo — sem expor JSON cru
    return {
      analysis: stripped.replace(/^```[\w]*\n?/gm, "").replace(/```$/gm, "").trim(),
      summary: "Avaliação concluída — veja a análise completa abaixo.",
      recommendations: [],
    };
  }
}

// ─── Chat follow-up ───────────────────────────────────────────────────────────

export async function chatWithAgent(
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  rawMetrics: string
): Promise<string> {
  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          SYSTEM_PROMPT +
          `\n\nDados da avaliação que você acabou de fazer:\n${rawMetrics}\n\nIMPORTANTE: Responda SEMPRE em texto corrido, em português brasileiro, de forma direta e prática. NUNCA use JSON, markdown, blocos de código ou listas técnicas. Fale como uma gestora de tráfego experiente conversando com o dono da empresa.`,
      },
      ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
    ],
    maxTokens: 1024,
  });

  const content = result.choices[0]?.message?.content;
  return typeof content === "string" ? content : "Não consegui processar a resposta. Tente novamente.";
}

// ─── Execução principal (chamada pelo router) ─────────────────────────────────

export async function runAdsEvaluation(evaluationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");

  try {
    await db
      .update(adsEvaluations)
      .set({ status: "running" })
      .where(eq(adsEvaluations.id, evaluationId));

    if (!META_TOKEN) {
      await db
        .update(adsEvaluations)
        .set({
          status: "error",
          errorMessage: "META_ACCESS_TOKEN não configurado no servidor",
          completedAt: new Date(),
        })
        .where(eq(adsEvaluations.id, evaluationId));
      return;
    }

    const { campaigns, adAccountId } = await collectAdsData();
    const llmResult = await analyzeWithLLM(campaigns);

    await db
      .update(adsEvaluations)
      .set({
        status: "done",
        adAccountId,
        rawMetrics: JSON.stringify(campaigns),
        analysis: llmResult.analysis,
        recommendations: JSON.stringify(llmResult.recommendations),
        summary: llmResult.summary,
        completedAt: new Date(),
      })
      .where(eq(adsEvaluations.id, evaluationId));

    console.log(`[AdsManager] Avaliação ${evaluationId} concluída — ${campaigns.length} campanhas analisadas`);
  } catch (err: any) {
    console.error(`[AdsManager] Erro na avaliação ${evaluationId}:`, err);
    await db
      .update(adsEvaluations)
      .set({
        status: "error",
        errorMessage: err.message?.slice(0, 499) || "Erro desconhecido",
        completedAt: new Date(),
      })
      .where(eq(adsEvaluations.id, evaluationId));
  }
}
