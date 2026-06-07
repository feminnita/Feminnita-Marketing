/**
 * Mariana Costa — Especialista em Estratégia de Vendas e Marketplaces
 *
 * Responsabilidades diárias:
 * 1. Monitorar performance de vendas em todos os canais (Meta, ML, Shopee, Amazon, TikTok)
 * 2. Identificar oportunidades de reativação da base de clientes
 * 3. Propor estratégias de upsell e cross-sell para revendedoras
 * 4. Analisar funil de vendas e pontos de abandono
 * 5. Estratégias para chegar a R$100.000/mês o mais rápido possível
 */

import { invokeLLM } from "../_core/llm";
import { buildMemoryContext, saveMemory } from "../services/agentMemory";
import { getLatestKnowledge } from "./knowledge-updater";
import { fetchAllPlatformMetrics, formatPlatformSummary } from "../services/marketplaceAds";
import { searchWeb, formatSearchResults } from "../services/webSearch";
import { getDb } from "../db";
import { agentActions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const SYSTEM_PROMPT = `Você é a Mariana Costa — diretora comercial e estrategista de vendas com 14 anos de experiência em atacado têxtil, e-commerce e expansão multicanal no Brasil. Especialização em Gestão Comercial pela FGV e em Growth Hacking pela Reforge (San Francisco). Construiu do zero operações de atacado digital para marcas de moda que saíram de R$50K para R$500K/mês em 18 meses. Conhece profundamente o comportamento da revendedora autônoma brasileira — suas objeções, motivações, jornada de compra e pontos de abandono.

SEU MÉTODO: você pensa em funil de receita, não em ações isoladas. Cada recomendação sua tem: canal + mensagem + oferta + timing + métrica de sucesso. Usa a metodologia ICE Score (Impacto × Confiança × Esforço) para priorizar ações e o framework AARRR (Aquisição, Ativação, Retenção, Receita, Referência) para diagnóstico.

INTELIGÊNCIA COMERCIAL QUE VOCÊ APLICA:
- Reativação de clientes inativos: taxa de conversão 30-50%, custo ~R$2/contato via WhatsApp, ROI imediato
- Sequência de reativação comprovada: mensagem de reconexão → oferta exclusiva → urgência (48h) → prova social
- Upsell no atacado: mais peças no pedido (desconto progressivo por quantidade) converte 15-25% com oferta certa — a revendedora monta o pedido livre, sem pedido mínimo
- Programa de indicação: revendedoras indicam 2-3 novas por mês quando incentivadas (produto grátis funciona mais que desconto)
- TikTok Shop 2025: produtos de pijama viralizam orgânicamente — potencial de R$20-40K/mês em 90 dias
- Mercado Livre: reputação +500 avaliações = venda orgânica R$15-30K/mês sem ads

CONTEXTO FEMINNITA — SITUAÇÃO DE GUERRA:
- Produto: pijamas atacado exclusivos com estampas próprias | Ticket médio: R$400
- Queda drástica: R$78K → R$20K/mês após agência ruim — urgência máxima
- META CRÍTICA: R$100K/mês = 250 pedidos/mês = 8,3 pedidos/dia
- Atual: ~50 pedidos/mês → precisa 5x de crescimento
- BASE DE OURO: revendedoras que já compraram — reativar é o caminho mais rápido e barato
- Canais ativos: Meta Ads + Instagram + WhatsApp
- Canais prontos para ativar: Mercado Livre, Shopee, Amazon, TikTok Shop

MATEMÁTICA DO CRESCIMENTO:
- Reativar 100 revendedoras antigas × 30% conversão × R$400 = R$12.000 em 1 semana (custo quase zero)
- Meta Ads escalado de R$50 para R$150/dia com ROAS 4x = R$18.000/mês adicional
- TikTok Shop orgânico ativado = R$15-25K/mês em 60 dias
- ML com 200 avaliações = R$10-15K/mês orgânico

Retorne APENAS JSON válido:
{
  "summary": "diagnóstico comercial direto: onde estamos, o que está travando, qual a maior alavanca agora",
  "highlights": ["canal ou ação com melhor retorno atual com número", "segundo ponto positivo"],
  "alerts": ["risco comercial concreto com impacto estimado em R$", "segundo risco"],
  "recommendations": ["ação comercial específica com canal + mensagem + timing + meta", "segunda ação", "terceira ação"],
  "channelBreakdown": [
    {
      "channel": "meta" | "mercadolivre" | "whatsapp" | "instagram_organic" | "shopee" | "amazon" | "tiktok",
      "status": "ativo" | "pendente" | "inativo",
      "estimatedRevenue": 0,
      "priority": "alta" | "media" | "baixa",
      "nextAction": "próxima ação específica para este canal"
    }
  ],
  "pathTo100k": "plano de 30/60/90 dias com ações, canais e metas numéricas para chegar a R$100K",
  "proposedActions": [
    {
      "title": "Nome da iniciativa comercial",
      "description": "roteiro detalhado e acionável — quem faz, o que faz, como mede o resultado",
      "type": "reativacao" | "ads" | "marketplace" | "upsell" | "canal_novo",
      "priority": "alta" | "media" | "baixa",
      "estimatedImpact": "receita incremental estimada em R$ com prazo",
      "effort": "baixo" | "medio" | "alto"
    }
  ]
}`;

export interface MarianaAnalysisResult {
  summary: string;
  highlights: string[];
  alerts: string[];
  recommendations: string[];
  channelBreakdown: Array<{
    channel: string;
    status: string;
    estimatedRevenue: number;
    priority: string;
    nextAction: string;
  }>;
  pathTo100k: string;
  proposedActions: Array<{
    title: string;
    description: string;
    type: string;
    priority: string;
    estimatedImpact: string;
    effort: string;
  }>;
}

async function proposeActions(analysis: MarianaAnalysisResult, today: string): Promise<void> {
  if (!analysis.proposedActions?.length) return;
  try {
    const db = await getDb();
    if (!db) return;
    const existing = await db
      .select({ title: agentActions.title })
      .from(agentActions)
      .where(and(eq(agentActions.agentName, "mariana"), eq(agentActions.date, today)));
    const existingTitles = new Set(existing.map((r: { title: string }) => r.title));
    const toInsert = analysis.proposedActions
      .filter((a) => a.title && !existingTitles.has(a.title))
      .map((a) => ({
        agentName: "mariana" as const,
        date: today,
        title: a.title.slice(0, 150),
        description: a.description,
        actionType: a.type || "canal_novo",
        priority: (["alta", "media", "baixa"].includes(a.priority) ? a.priority : "media") as "alta" | "media" | "baixa",
        estimatedImpact: a.estimatedImpact,
        status: "pending" as const,
      }));
    if (toInsert.length > 0) {
      await db.insert(agentActions).values(toInsert);
      console.log(`[Mariana] ${toInsert.length} ações propostas no painel`);
    }
  } catch (err: any) {
    console.error("[Mariana] Erro ao propor ações:", err.message);
  }
}

export async function runMarianaAnalysis(): Promise<MarianaAnalysisResult> {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`[Mariana] Iniciando análise de vendas multicanal — ${today}`);

  const [memoryContext, platformMetrics, salesSearch] = await Promise.all([
    buildMemoryContext("mariana"),
    fetchAllPlatformMetrics(7),
    searchWeb("estratégias vendas atacado WhatsApp reativação clientes Brasil 2026", { days: 14 }),
  ]);

  const platformSummary = formatPlatformSummary(platformMetrics);
  const searchContext = formatSearchResults(salesSearch);

  const userPrompt = `Data: ${today}

DADOS DE PERFORMANCE MULTICANAL:
${platformSummary}

PESQUISA DE ESTRATÉGIAS:
${searchContext.slice(0, 1500)}

MEMÓRIA ACUMULADA:
${memoryContext.slice(0, 800)}

INTELIGÊNCIA DE MERCADO ATUAL:
${await Promise.all([getLatestKnowledge("knowledge_marketplaces"), getLatestKnowledge("knowledge_whatsapp")]).then(([m, w]) => [
  m ? `Marketplaces: ${m.trends?.join(" | ")}` : "",
  w ? `WhatsApp vendas: ${w.tips?.join(" | ")}` : "",
].filter(Boolean).join("\n"))}

Analise a performance de vendas multicanal da Feminnita. FOQUE no caminho mais rápido para R$100K/mês. Seja muito específico nas ações propostas.`;

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

    await saveMemory("mariana", "daily_analysis", today, parsed);
    console.log(`[Mariana] Análise ${today} salva — ${parsed.proposedActions?.length || 0} ações de vendas`);
    await proposeActions(parsed as MarianaAnalysisResult, today);

    return parsed as MarianaAnalysisResult;
  } catch (err: any) {
    const fallback: MarianaAnalysisResult = {
      summary: `Análise ${today} — erro: ${err.message}`,
      highlights: [],
      alerts: ["Erro ao gerar análise — verificar logs"],
      recommendations: [],
      channelBreakdown: [],
      pathTo100k: "",
      proposedActions: [],
    };
    await saveMemory("mariana", "daily_analysis", today, fallback);
    return fallback;
  }
}
