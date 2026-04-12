/**
 * Clara Mendes — Especialista em Inteligência Competitiva
 *
 * Responsabilidades diárias:
 * 1. Monitorar concorrentes diretos de pijamas atacado no Brasil
 * 2. Analisar precificação de mercado e posicionamento
 * 3. Identificar gaps e oportunidades competitivas
 * 4. Monitorar lançamentos de produtos concorrentes
 * 5. Alertar sobre ameaças e oportunidades estratégicas
 */

import { invokeLLM } from "../_core/llm";
import { buildMemoryContext, saveMemory } from "../services/agentMemory";
import { multiSearch } from "../services/webSearch";

const SYSTEM_PROMPT = `Você é a Clara Mendes — especialista sênior em inteligência competitiva para o setor de moda atacado no Brasil.

CONTEXTO FEMINNITA:
- Pijamas atacado para revendedoras | Ticket médio: R$400 por pedido
- Posicionamento: qualidade premium a preço atacado competitivo
- Distribuição: Sul e Sudeste do Brasil (principal), outras regiões (crescimento)
- Mercados: Instagram DM, WhatsApp, Mercado Livre, Shopee (futuramente)
- Diferencial: atendimento personalizado + pijamas exclusivos com estampas próprias

Monitore e analise:
1. Concorrentes principais: outras marcas de pijamas atacado BR (Lupo, Hering atacado, marcas regionais)
2. Precificação de mercado: tickets mínimos, preços por kit, descontos sazonais
3. Estratégias de marketing que concorrentes estão usando (anúncios, influencers, promoções)
4. Novos entrantes no mercado de pijamas atacado
5. Tendências de produto (estampas, tecidos, modelagens em alta)

Retorne APENAS JSON válido:
{
  "summary": "string — panorama competitivo em 2-3 frases",
  "highlights": ["oportunidade competitiva 1", "oportunidade 2"],
  "alerts": ["ameaça competitiva 1", "risco 2"],
  "recommendations": ["ação estratégica 1", "ação estratégica 2"],
  "competitors": [
    {
      "name": "Nome do concorrente",
      "strength": "ponto forte identificado",
      "weakness": "ponto fraco ou gap",
      "recentMove": "ação recente identificada"
    }
  ],
  "marketOpportunities": ["oportunidade de mercado 1", "oportunidade 2"],
  "pricingIntel": "insights sobre precificação do mercado",
  "proposedActions": [
    {
      "title": "Título da ação estratégica",
      "description": "O que fazer para ganhar vantagem competitiva",
      "type": "pricing" | "product" | "marketing" | "channel",
      "priority": "alta" | "media" | "baixa",
      "estimatedImpact": "impacto esperado no negócio"
    }
  ]
}`;

export interface ClaraAnalysisResult {
  summary: string;
  highlights: string[];
  alerts: string[];
  recommendations: string[];
  competitors: Array<{
    name: string;
    strength: string;
    weakness: string;
    recentMove: string;
  }>;
  marketOpportunities: string[];
  pricingIntel: string;
  proposedActions: Array<{
    title: string;
    description: string;
    type: string;
    priority: string;
    estimatedImpact: string;
  }>;
}

export async function runClaraAnalysis(): Promise<ClaraAnalysisResult> {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`[Clara] Iniciando análise competitiva — ${today}`);

  const [memoryContext, competitorData] = await Promise.all([
    buildMemoryContext("clara"),
    multiSearch([
      "pijamas atacado Brasil concorrentes marcas 2026 revendedoras",
      "preço atacado pijama kit por maior Brasil 2026",
      "tendência pijama estampa tecido moda feminina Brasil 2026",
    ]),
  ]);

  const userPrompt = `Data: ${today}

PESQUISA DE MERCADO E CONCORRÊNCIA:
${competitorData.slice(0, 3000)}

MEMÓRIA ACUMULADA:
${memoryContext.slice(0, 800)}

Faça a análise competitiva diária para a Feminnita. Identifique ameaças, oportunidades e ações estratégicas concretas.`;

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

    await saveMemory("clara", "daily_analysis", today, parsed);
    console.log(`[Clara] Análise ${today} salva — ${parsed.competitors?.length || 0} concorrentes monitorados`);

    return parsed as ClaraAnalysisResult;
  } catch (err: any) {
    const fallback: ClaraAnalysisResult = {
      summary: `Análise ${today} — erro: ${err.message}`,
      highlights: [],
      alerts: ["Erro ao gerar análise — verificar logs"],
      recommendations: [],
      competitors: [],
      marketOpportunities: [],
      pricingIntel: "",
      proposedActions: [],
    };
    await saveMemory("clara", "daily_analysis", today, fallback);
    return fallback;
  }
}
