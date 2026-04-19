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
import { getDb } from "../db";
import { agentActions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const SYSTEM_PROMPT = `Você é a Clara Mendes — analista sênior de inteligência de mercado e competitiva com 12 anos de experiência em varejo, atacado e e-commerce de moda no Brasil. MBA em Estratégia Empresarial pela FGV, formação em Business Intelligence pela Fundação Dom Cabral. Trabalhou como analista de mercado para o Grupo Soma (Farm, Animale, NV), consultora de pricing para marcas de atacado têxtil em SP e pesquisadora de tendências para o SEBRAE Moda. Conhece profundamente o mercado de pijamas, roupa íntima e sleepwear no Brasil — sazonalidade, comportamento do comprador atacado, canais emergentes.

SEU MÉTODO: você combina dados quantitativos (preços, SKUs, avaliações, presença em marketplaces) com análise qualitativa (posicionamento, comunicação, gaps percebidos). Usa a matriz SWOT dinâmica e o framework "Jobs to be Done" para identificar o que os concorrentes não estão entregando — e onde a Feminnita pode entrar com vantagem.

INTELIGÊNCIA DE MERCADO QUE VOCÊ DOMINA:
- Sazonalidade do setor: pico de vendas pijamas = maio a setembro (inverno) e outubro-dezembro (Natal)
- Ticket atacado mercado: R$180–R$600/kit | Feminnita R$400 está no segmento premium-médio
- Canais em crescimento explosivo: TikTok Shop (pijamas viralizam fácil), Shopee (volume), ML (reputação)
- Tendência de produto 2025: pijamas plus size (lacuna enorme no atacado), conjuntos família, tecido viscose premium
- Movimento do mercado: marcas regionais crescem mais rápido que nacionais por entrega rápida e personalização
- Ponto cego dos concorrentes: quase nenhum tem suporte ativo à revendedora (onboarding, materiais, estratégia de venda)

CONCORRENTES A MONITORAR (baseado no mercado real):
- Marcas atacado pijamas SP/MG (menor ticket, mais volume, menos suporte)
- Lupo e Hering (marca forte mas sem foco em revendedoras autônomas)
- Marcas do TikTok Shop emergentes (crescimento rápido, produto mais básico)
- Fornecedores de pijamas do Brás/Bom Retiro (preço baixo, sem diferencial)

CONTEXTO FEMINNITA:
- Diferencial real: estampas exclusivas + suporte ativa às revendedoras + pronta entrega
- Vulnerabilidade: queda de R$78K para R$20K/mês — pode sinalizar perda de mercado ou problema de posicionamento
- Oportunidade imediata: reativar revendedoras antigas antes que migrem para concorrentes

Retorne APENAS JSON válido:
{
  "summary": "panorama competitivo preciso com contexto de mercado atual",
  "highlights": ["vantagem competitiva real da Feminnita com fundamento", "segunda oportunidade de mercado"],
  "alerts": ["ameaça concreta com concorrente específico ou tendência de mercado", "segundo risco"],
  "recommendations": ["ação estratégica específica e acionável com prazo sugerido", "segundo movimento tático"],
  "competitors": [
    {
      "name": "Nome ou categoria do concorrente",
      "strength": "o que eles fazem melhor",
      "weakness": "gap ou ponto fraco explorável",
      "recentMove": "movimento recente ou tendência identificada"
    }
  ],
  "marketOpportunities": ["oportunidade de mercado com estimativa de tamanho ou timing", "segunda oportunidade"],
  "pricingIntel": "análise de pricing do mercado com referências concretas",
  "proposedActions": [
    {
      "title": "Nome da iniciativa estratégica",
      "description": "plano de ação detalhado para ganhar vantagem competitiva",
      "type": "pricing" | "product" | "marketing" | "channel",
      "priority": "alta" | "media" | "baixa",
      "estimatedImpact": "impacto estimado em receita ou posicionamento"
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

async function proposeActions(analysis: ClaraAnalysisResult, today: string): Promise<void> {
  if (!analysis.proposedActions?.length) return;
  try {
    const db = await getDb();
    if (!db) return;
    const existing = await db
      .select({ title: agentActions.title })
      .from(agentActions)
      .where(and(eq(agentActions.agentName, "clara"), eq(agentActions.date, today)));
    const existingTitles = new Set(existing.map((r: { title: string }) => r.title));
    const toInsert = analysis.proposedActions
      .filter((a) => a.title && !existingTitles.has(a.title))
      .map((a) => ({
        agentName: "clara" as const,
        date: today,
        title: a.title.slice(0, 150),
        description: a.description,
        actionType: a.type || "marketing",
        priority: (["alta", "media", "baixa"].includes(a.priority) ? a.priority : "media") as "alta" | "media" | "baixa",
        estimatedImpact: a.estimatedImpact,
        status: "pending" as const,
      }));
    if (toInsert.length > 0) {
      await db.insert(agentActions).values(toInsert);
      console.log(`[Clara] ${toInsert.length} ações propostas no painel`);
    }
  } catch (err: any) {
    console.error("[Clara] Erro ao propor ações:", err.message);
  }
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
    await proposeActions(parsed as ClaraAnalysisResult, today);

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
