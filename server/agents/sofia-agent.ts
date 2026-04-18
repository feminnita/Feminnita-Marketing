/**
 * Sofia Oliveira — Especialista em Crescimento Instagram
 *
 * Responsabilidades diárias:
 * 1. Analisar métricas orgânicas do Instagram da Feminnita
 * 2. Buscar tendências de conteúdo de moda/pijamas na internet
 * 3. Identificar horários e formatos de melhor engajamento
 * 4. Propor ações concretas para crescimento de seguidores e alcance
 */

import { invokeLLM } from "../_core/llm";
import { buildMemoryContext, saveMemory } from "../services/agentMemory";
import { searchWeb, formatSearchResults } from "../services/webSearch";
import { getDb } from "../db";
import { agentActions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const INSTAGRAM_ACCOUNT_ID = "59536615191";
const GRAPH_BASE = "https://graph.facebook.com/v19.0";

const SYSTEM_PROMPT = `Você é a Sofia Oliveira — especialista sênior em crescimento orgânico no Instagram para marcas de moda/vestuário no Brasil.

CONTEXTO FEMINNITA:
- Feminnita Pijamas Atacado para revendedoras | Foco: Sul e Sudeste do Brasil
- Meta de seguidores: crescer 30% ao mês | Meta de engajamento: >3%
- Público-alvo: mulheres 28-45 anos que revendem roupas/pijamas
- Conteúdo que funciona: unboxing de peças, look do dia em pijama, stories de bastidor
- Tom de voz: feminino, caloroso, próximo — "mulher para mulher"
- Meta de vendas via Instagram: R$30.000/mês (parte dos R$100.000 totais)

Sua análise deve focar em:
1. Crescimento de seguidores (alcance orgânico)
2. Engajamento (curtidas, comentários, salvamentos, compartilhamentos)
3. Tendências de conteúdo relevantes para o nicho
4. Horários ideais de publicação
5. Uso de Reels vs Stories vs Feed para diferentes objetivos

Retorne APENAS JSON válido:
{
  "summary": "string — situação atual em 2-3 frases",
  "highlights": ["ponto positivo 1", "ponto positivo 2"],
  "alerts": ["alerta 1"],
  "recommendations": ["ação concreta 1", "ação concreta 2", "ação concreta 3"],
  "trendingTopics": ["tendência relevante 1", "tendência relevante 2"],
  "proposedActions": [
    {
      "title": "Título da ação",
      "description": "O que fazer especificamente",
      "type": "post" | "story" | "reel" | "campaign" | "hashtag",
      "priority": "alta" | "media" | "baixa",
      "estimatedImpact": "impacto esperado"
    }
  ]
}`;

async function fetchInstagramInsights(): Promise<Record<string, unknown>> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) return {};

  try {
    const params = new URLSearchParams({
      metric: "reach,impressions,profile_views,follower_count",
      period: "day",
      since: Math.floor((Date.now() - 7 * 86400000) / 1000).toString(),
      until: Math.floor(Date.now() / 1000).toString(),
      access_token: token,
    });

    const res = await fetch(`${GRAPH_BASE}/${INSTAGRAM_ACCOUNT_ID}/insights?${params}`);
    if (!res.ok) return {};
    return await res.json();
  } catch {
    return {};
  }
}

export interface SofiaAnalysisResult {
  summary: string;
  highlights: string[];
  alerts: string[];
  recommendations: string[];
  trendingTopics: string[];
  proposedActions: Array<{
    title: string;
    description: string;
    type: string;
    priority: string;
    estimatedImpact: string;
  }>;
}

async function proposeActions(analysis: SofiaAnalysisResult, today: string): Promise<void> {
  if (!analysis.proposedActions?.length) return;
  try {
    const db = await getDb();
    if (!db) return;
    const existing = await db
      .select({ title: agentActions.title })
      .from(agentActions)
      .where(and(eq(agentActions.agentName, "sofia"), eq(agentActions.date, today)));
    const existingTitles = new Set(existing.map((r: { title: string }) => r.title));
    const toInsert = analysis.proposedActions
      .filter((a) => a.title && !existingTitles.has(a.title))
      .map((a) => ({
        agentName: "sofia" as const,
        date: today,
        title: a.title.slice(0, 150),
        description: a.description,
        actionType: a.type || "post",
        priority: (["alta", "media", "baixa"].includes(a.priority) ? a.priority : "media") as "alta" | "media" | "baixa",
        estimatedImpact: a.estimatedImpact,
        status: "pending" as const,
      }));
    if (toInsert.length > 0) {
      await db.insert(agentActions).values(toInsert);
      console.log(`[Sofia] ${toInsert.length} ações propostas no painel`);
    }
  } catch (err: any) {
    console.error("[Sofia] Erro ao propor ações:", err.message);
  }
}

export async function runSofiaAnalysis(): Promise<SofiaAnalysisResult> {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`[Sofia] Iniciando análise de Instagram — ${today}`);

  const [memoryContext, igInsights, trendSearch, competitorSearch] = await Promise.all([
    buildMemoryContext("sofia"),
    fetchInstagramInsights(),
    searchWeb("tendências conteúdo Instagram moda pijama Brasil 2026", { days: 7, topic: "news" }),
    searchWeb("crescimento Instagram atacado moda feminina revendedoras estratégia", { days: 14 }),
  ]);

  const searchContext = [
    formatSearchResults(trendSearch),
    formatSearchResults(competitorSearch),
  ].join("\n\n");

  const userPrompt = `Data: ${today}

DADOS DO INSTAGRAM (últimos 7 dias):
${JSON.stringify(igInsights, null, 2).slice(0, 1500)}

PESQUISA DE TENDÊNCIAS:
${searchContext.slice(0, 2000)}

MEMÓRIA ACUMULADA:
${memoryContext.slice(0, 1000)}

Analise o estado atual do Instagram da Feminnita e gere o relatório diário com ações propostas.`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const content = result.choices[0]?.message?.content;
    if (typeof content !== "string") throw new Error("LLM retornou resposta inválida");

    // Extrair JSON da resposta (pode vir com markdown)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

    await saveMemory("sofia", "daily_analysis", today, parsed);
    console.log(`[Sofia] Análise ${today} salva — ${parsed.proposedActions?.length || 0} ações propostas`);
    await proposeActions(parsed as SofiaAnalysisResult, today);

    return parsed as SofiaAnalysisResult;
  } catch (err: any) {
    const fallback: SofiaAnalysisResult = {
      summary: `Análise ${today} — erro: ${err.message}`,
      highlights: [],
      alerts: ["Erro ao gerar análise — verificar logs"],
      recommendations: [],
      trendingTopics: [],
      proposedActions: [],
    };
    await saveMemory("sofia", "daily_analysis", today, fallback);
    return fallback;
  }
}
