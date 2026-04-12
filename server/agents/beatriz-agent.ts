/**
 * Beatriz Santos — Especialista em Conteúdo e Tendências
 *
 * Responsabilidades diárias:
 * 1. Monitorar tendências de moda, pijamas e mercado têxtil
 * 2. Sugerir pautas de conteúdo para o mês
 * 3. Identificar datas comemorativas e oportunidades de campanha
 * 4. Analisar o que está viralizando no nicho
 * 5. Propor calendário editorial
 */

import { invokeLLM } from "../_core/llm";
import { buildMemoryContext, saveMemory } from "../services/agentMemory";
import { multiSearch, searchWeb, formatSearchResults } from "../services/webSearch";

const SYSTEM_PROMPT = `Você é a Beatriz Santos — especialista sênior em estratégia de conteúdo e tendências de moda para marcas brasileiras de atacado.

CONTEXTO FEMINNITA:
- Pijamas e roupas íntimas atacado para revendedoras
- Canais: Instagram (principal), WhatsApp (revendedoras), TikTok (futuro)
- Tom: feminino, acolhedor, aspiracional mas acessível
- Público das revendedoras: mulheres que buscam renda extra revendendo moda
- Calendário editorial segue: datas comemorativas BR + lançamentos de coleção

Sua análise diária deve incluir:
1. O que está em alta no nicho (pijamas, loungewear, moda casual feminina)
2. Datas importantes nos próximos 30 dias (comemorativas, sazonais)
3. Ideias de conteúdo baseadas em tendências reais
4. Sugestão de hashtags performáticas
5. Análise de formato: o que está engajando (Reel, Carrossel, Stories)

Retorne APENAS JSON válido:
{
  "summary": "string — panorama de conteúdo atual em 2-3 frases",
  "highlights": ["tendência positiva 1", "tendência positiva 2"],
  "alerts": ["alerta ou oportunidade 1"],
  "recommendations": ["sugestão editorial 1", "sugestão editorial 2"],
  "contentIdeas": [
    {
      "title": "Título do conteúdo",
      "description": "Como produzir e o que mostrar",
      "format": "reel" | "carrossel" | "story" | "post_estatico",
      "hashtags": ["#hashtag1", "#hashtag2"],
      "bestTime": "dia da semana + horário",
      "trendSource": "de onde vem essa tendência"
    }
  ],
  "upcomingDates": [
    {
      "date": "YYYY-MM-DD",
      "event": "Nome do evento/data comemorativa",
      "contentAngle": "Como a Feminnita pode aproveitar isso"
    }
  ],
  "proposedActions": [
    {
      "title": "Título da ação",
      "description": "Descrição detalhada",
      "type": "content" | "campaign" | "collab",
      "priority": "alta" | "media" | "baixa",
      "estimatedImpact": "impacto esperado"
    }
  ]
}`;

export interface BeatrizAnalysisResult {
  summary: string;
  highlights: string[];
  alerts: string[];
  recommendations: string[];
  contentIdeas: Array<{
    title: string;
    description: string;
    format: string;
    hashtags: string[];
    bestTime: string;
    trendSource: string;
  }>;
  upcomingDates: Array<{
    date: string;
    event: string;
    contentAngle: string;
  }>;
  proposedActions: Array<{
    title: string;
    description: string;
    type: string;
    priority: string;
    estimatedImpact: string;
  }>;
}

export async function runBeatrizAnalysis(): Promise<BeatrizAnalysisResult> {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`[Beatriz] Iniciando análise de conteúdo e tendências — ${today}`);

  const [memoryContext, trendData] = await Promise.all([
    buildMemoryContext("beatriz"),
    multiSearch([
      "tendências moda pijama loungewear Brasil 2026",
      "datas comemorativas maio junho Brasil marketing vendas",
      "conteúdo viral Instagram moda feminina Brasil 2026",
    ]),
  ]);

  const userPrompt = `Data: ${today}

PESQUISA DE TENDÊNCIAS E CALENDÁRIO:
${trendData.slice(0, 3000)}

MEMÓRIA ACUMULADA:
${memoryContext.slice(0, 800)}

Gere a análise diária de conteúdo e tendências para a Feminnita, com ideias práticas de conteúdo e ações propostas.`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const content = result.choices[0]?.message?.content;
    if (typeof content !== "string") throw new Error("LLM retornou resposta inválida");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

    await saveMemory("beatriz", "daily_analysis", today, parsed);
    console.log(`[Beatriz] Análise ${today} salva — ${parsed.contentIdeas?.length || 0} ideias de conteúdo`);

    return parsed as BeatrizAnalysisResult;
  } catch (err: any) {
    const fallback: BeatrizAnalysisResult = {
      summary: `Análise ${today} — erro: ${err.message}`,
      highlights: [],
      alerts: ["Erro ao gerar análise — verificar logs"],
      recommendations: [],
      contentIdeas: [],
      upcomingDates: [],
      proposedActions: [],
    };
    await saveMemory("beatriz", "daily_analysis", today, fallback);
    return fallback;
  }
}
