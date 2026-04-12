/**
 * Fernanda Daily Agent — análise diária automática das campanhas Meta Ads
 *
 * Responsabilidade:
 * 1. Buscar dados reais da Meta Ads API (últimos 2 dias)
 * 2. Carregar contexto histórico da memória da Fernanda
 * 3. Chamar LLM especializado para análise
 * 4. Persistir resultado como daily_analysis
 * 5. Aos domingos, gerar weekly_summary consolidando a semana
 */

import { invokeLLM } from "../_core/llm";
import { buildMemoryContext, saveMemory } from "../services/agentMemory";

const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || "act_231648936319132";
const GRAPH_BASE = "https://graph.facebook.com/v19.0";

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface MetaCampaignInsight {
  campaign_id: string;
  campaign_name: string;
  impressions: string;
  clicks: string;
  spend: string;
  ctr: string;
  cpc: string;
  actions?: Array<{ action_type: string; value: string }>;
  date_start: string;
  date_stop: string;
}

export interface DailyAnalysisResult {
  summary: string;
  highlights: string[];
  alerts: string[];
  recommendations: string[];
  roas: number;
  spend: number;
  revenue: number;
}

// ─── Fetch Meta Ads ───────────────────────────────────────────────────────────

async function fetchCampaignInsights(): Promise<MetaCampaignInsight[]> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    console.warn("[FernandaDaily] META_ACCESS_TOKEN não configurado");
    return [];
  }

  const params = new URLSearchParams({
    fields: "campaign_id,campaign_name,impressions,clicks,spend,ctr,cpc,actions",
    date_preset: "last_2d",
    level: "campaign",
    limit: "50",
    access_token: token,
  });

  const url = `${GRAPH_BASE}/${AD_ACCOUNT_ID}/insights?${params.toString()}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("[FernandaDaily] Erro Meta API:", data.error?.message ?? `HTTP ${res.status}`);
      return [];
    }

    return (data.data as MetaCampaignInsight[]) || [];
  } catch (err: any) {
    console.error("[FernandaDaily] Falha ao buscar insights:", err.message);
    return [];
  }
}

// ─── Análise LLM diária ───────────────────────────────────────────────────────

const SYSTEM_PROMPT_DAILY = `Você é a Fernanda Leal — especialista sênior em tráfego pago Meta Ads, focada em atacado de moda/pijamas no Brasil.

Sua tarefa: analisar os dados diários das campanhas e gerar um relatório objetivo.

CONTEXTO FEMINNITA:
- Pijamas atacado para revendedoras | Ticket médio: R$400
- ROAS mínimo aceitável: 4x | Alvo: 6x+ | CPA máximo: R$80
- Campanhas: Remarketing (visitantes 60d) + Revenda Sul+Sudeste
- Orçamento: R$25/dia por campanha (R$1.500/mês total)
- Banners estáticos performam MELHOR que vídeos (testado)

Retorne APENAS JSON válido neste formato:
{
  "summary": "string — resumo em 2-3 frases do estado atual",
  "highlights": ["ponto positivo 1", "ponto positivo 2"],
  "alerts": ["alerta ou ponto de atenção 1"],
  "recommendations": ["ação recomendada 1", "ação recomendada 2"],
  "roas": 0.0,
  "spend": 0.0,
  "revenue": 0.0
}

Quando não houver dados suficientes, roas/spend/revenue = 0 e explique no summary.`;

async function analyzeWithLLM(
  insightsRaw: MetaCampaignInsight[],
  memoryContext: string,
  today: string
): Promise<DailyAnalysisResult> {
  const totalSpend = insightsRaw.reduce((s, r) => s + parseFloat(r.spend || "0"), 0);
  const totalPurchases = insightsRaw.reduce((s, r) => {
    const p = (r.actions || []).find(
      (a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase"
    );
    return s + parseFloat(p?.value || "0");
  }, 0);

  const estimatedRevenue = totalPurchases * 400; // ticket médio R$400
  const roas = totalSpend > 0 ? estimatedRevenue / totalSpend : 0;

  const dataStr =
    insightsRaw.length > 0
      ? JSON.stringify(insightsRaw, null, 2)
      : "Nenhum dado retornado pela API Meta Ads — token pode estar expirado ou sem campanhas ativas.";

  const userPrompt = `Data: ${today}
Dados das campanhas Meta Ads (últimos 2 dias):
${dataStr}

Contexto histórico:
${memoryContext}

Analise os dados e gere o relatório diário em JSON conforme instruído.`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT_DAILY },
        { role: "user", content: userPrompt },
      ],
      outputSchema: {
        name: "daily_analysis",
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            highlights: { type: "array", items: { type: "string" } },
            alerts: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            roas: { type: "number" },
            spend: { type: "number" },
            revenue: { type: "number" },
          },
          required: ["summary", "highlights", "alerts", "recommendations", "roas", "spend", "revenue"],
        },
      },
    });

    const content = result.choices[0]?.message?.content;
    if (typeof content !== "string") throw new Error("LLM retornou resposta inválida");

    const parsed = JSON.parse(content) as DailyAnalysisResult;
    // Enriquecer com valores calculados se o LLM retornou 0
    if (parsed.spend === 0 && totalSpend > 0) parsed.spend = totalSpend;
    if (parsed.roas === 0 && roas > 0) parsed.roas = Math.round(roas * 100) / 100;
    if (parsed.revenue === 0 && estimatedRevenue > 0) parsed.revenue = estimatedRevenue;

    return parsed;
  } catch (err: any) {
    console.error("[FernandaDaily] Erro LLM:", err.message);
    return {
      summary: `Análise do dia ${today} — erro ao processar dados: ${err.message}`,
      highlights: [],
      alerts: ["Erro ao gerar análise automática — verificar logs"],
      recommendations: [],
      roas,
      spend: totalSpend,
      revenue: estimatedRevenue,
    };
  }
}

// ─── Resumo semanal ───────────────────────────────────────────────────────────

async function generateWeeklySummary(weekPeriod: string): Promise<void> {
  const { getMemoriesByType } = await import("../services/agentMemory");

  const dailyAnalyses = await getMemoriesByType("fernanda", "daily_analysis", 7);
  if (dailyAnalyses.length === 0) {
    console.log("[FernandaDaily] Sem análises diárias para consolidar no resumo semanal");
    return;
  }

  const summariesText = dailyAnalyses
    .map((entry: { period: string; content: string }) => {
      try {
        const data = JSON.parse(entry.content) as DailyAnalysisResult;
        return `[${entry.period}] Spend: R$${data.spend} | ROAS: ${data.roas}x\n${data.summary}`;
      } catch {
        return `[${entry.period}] ${entry.content.slice(0, 200)}`;
      }
    })
    .join("\n\n");

  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é a Fernanda Leal, especialista em tráfego Meta Ads para atacado de moda.
Consolide as análises diárias da semana em um resumo executivo.
Retorne JSON: { "summary": "resumo em 3-5 frases", "totalSpend": number, "avgRoas": number, "keyLearnings": ["..."], "weekPriorities": ["..."] }`,
      },
      {
        role: "user",
        content: `Semana ${weekPeriod} — análises diárias:\n\n${summariesText}\n\nGere o resumo semanal consolidado.`,
      },
    ],
  });

  const content = result.choices[0]?.message?.content;
  if (typeof content === "string") {
    try {
      const parsed = JSON.parse(content);
      await saveMemory("fernanda", "weekly_summary", weekPeriod, parsed);
      console.log(`[FernandaDaily] Resumo semanal ${weekPeriod} salvo`);
    } catch {
      await saveMemory("fernanda", "weekly_summary", weekPeriod, { summary: content });
    }
  }
}

// ─── Execução principal ───────────────────────────────────────────────────────

export async function runDailyAnalysis(): Promise<DailyAnalysisResult> {
  const today = new Date().toISOString().slice(0, 10); // "2026-04-12"

  console.log(`[FernandaDaily] Iniciando análise diária — ${today}`);

  // 1. Carregar contexto histórico
  const memoryContext = await buildMemoryContext("fernanda");

  // 2. Buscar dados reais Meta Ads
  const insights = await fetchCampaignInsights();
  console.log(`[FernandaDaily] ${insights.length} campanhas com dados`);

  // 3. Analisar com LLM
  const analysis = await analyzeWithLLM(insights, memoryContext, today);

  // 4. Persistir no banco
  await saveMemory("fernanda", "daily_analysis", today, analysis);
  console.log(`[FernandaDaily] Análise do dia ${today} salva — ROAS: ${analysis.roas}x | Spend: R$${analysis.spend}`);

  // 5. Se domingo (0), gerar resumo semanal
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 0) {
    const weekNumber = getISOWeek(new Date());
    const year = new Date().getFullYear();
    const weekPeriod = `${year}-W${String(weekNumber).padStart(2, "0")}`;
    console.log(`[FernandaDaily] Domingo — gerando resumo semanal ${weekPeriod}`);
    await generateWeeklySummary(weekPeriod);
  }

  return analysis;
}

// Utilitário: número da semana ISO
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
