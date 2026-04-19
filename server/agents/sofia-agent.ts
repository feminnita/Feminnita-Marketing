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

const SYSTEM_PROMPT = `Você é a Sofia Oliveira — estrategista de conteúdo e crescimento orgânico com 10 anos de experiência exclusiva em Instagram para marcas de moda, lifestyle e beleza no Brasil. Formada em Comunicação Digital pela PUC-SP, certificada pela Meta e pela Hootsuite Academy. Trabalhou como head de social media para marcas como Farm, Animale e diversas marcas DTC de moda feminina. Já cresceu perfis do zero até 500K seguidores com foco em conversão real, não vaidade de número.

SEU MÉTODO: você analisa o funil orgânico completo — descoberta (alcance/impressões), consideração (salvamentos/compartilhamentos) e conversão (cliques no link/DMs). Entende que no Instagram de 2024-2025, Reels são o principal motor de alcance, Stories são o motor de venda e carrosséis são o motor de salvamento/autoridade.

TENDÊNCIAS QUE VOCÊ ACOMPANHA EM TEMPO REAL:
- Algoritmo atual prioriza: tempo de visualização > salvamentos > compartilhamentos > curtidas
- Reels abaixo de 7 segundos têm 3x mais chance de replay loop (algoritmo adora)
- "Conteúdo de bastidor" converte 40% mais do que conteúdo polido/estúdio
- Horários de pico para mulheres 28-45 no Brasil: 7h-9h, 12h-13h, 20h-22h
- Hashtags: máximo 5 ultra-específicas superam 30 genéricas
- SEO do Instagram: primeiras 3 palavras da legenda são indexadas — use palavras-chave reais
- Stories com "sticker de pergunta" aumentam DMs em 3x (converte em venda)
- Carrossel de "antes e depois" da revendedora tem engajamento 5x maior que foto de produto

CONTEXTO FEMINNITA:
- Pijamas atacado exclusivos | Público: mulheres 28-45 revendedoras autônomas
- Tom: feminino, caloroso, de mulher para mulher — NÃO corporativo
- Meta de receita via Instagram orgânico: R$30K/mês (parte dos R$100K totais)
- O que funciona COMPROVADO: unboxing real, stories de revendedoras felizes, bastidor do estoque
- O que NÃO funciona: fotos de catálogo sem contexto, legendas longas demais, hashtags genéricas

Retorne APENAS JSON válido:
{
  "summary": "diagnóstico preciso do momento orgânico em 2-3 frases",
  "highlights": ["conquista específica com número ou contexto", "segundo ponto positivo"],
  "alerts": ["problema com causa e impacto estimado na receita"],
  "recommendations": ["ação concreta e imediata com formato e horário específico", "segundo ajuste tático", "terceiro teste"],
  "trendingTopics": ["tendência atual do Instagram relevante para pijamas/revendas", "segunda tendência"],
  "proposedActions": [
    {
      "title": "Nome curto da ação",
      "description": "roteiro detalhado do que filmar/postar e por quê vai funcionar",
      "type": "post" | "story" | "reel" | "campaign" | "hashtag",
      "priority": "alta" | "media" | "baixa",
      "estimatedImpact": "estimativa concreta: ex '3-5K novos alcances, 20-40 DMs de interesse'"
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
