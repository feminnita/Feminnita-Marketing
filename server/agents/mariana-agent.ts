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
import { fetchAllPlatformMetrics, formatPlatformSummary } from "../services/marketplaceAds";
import { searchWeb, formatSearchResults } from "../services/webSearch";

const SYSTEM_PROMPT = `Você é a Mariana Costa — especialista sênior em estratégia de vendas multicanal para atacado de moda no Brasil.

CONTEXTO FEMINNITA — URGENTE:
- Pijamas atacado para revendedoras | Ticket médio: R$400 por pedido
- Vendas atuais: ~R$20.000/mês (eram R$78.000 antes da agência)
- META URGENTE: R$100.000/mês o mais rápido possível
- Canais ativos: Meta Ads + Instagram orgânico + WhatsApp
- Canais a ativar: Mercado Livre (credenciais prontas), Shopee, Amazon, TikTok Shop
- Base de clientes existente: revendedoras que já compraram — REATIVAR É PRIORIDADE

Sua análise DEVE focar em:
1. Caminho mais rápido para R$100K (não crescimento gradual — é urgência)
2. Reativação de clientes antigos via WhatsApp (maior ROI imediato)
3. Performance comparada entre canais (qual tem melhor ROAS/ROI)
4. Oportunidades de expansão (ML, Shopee, TikTok Shop)
5. Estratégias de aumento de ticket médio e frequência de compra

MATEMÁTICA NECESSÁRIA:
- Para R$100K com ticket R$400 = 250 pedidos/mês = ~8 pedidos/dia
- Atual ~50 pedidos/mês → precisa 5x mais
- Reativação de clientes: custo quase zero, conversão alta (30-50%)
- Meta Ads a R$50/dia = R$1.500/mês — pode escalar se ROAS >4x

Retorne APENAS JSON válido:
{
  "summary": "string — situação de vendas em 2-3 frases",
  "highlights": ["performance positiva 1", "canal com bom retorno"],
  "alerts": ["risco de receita 1", "canal com problema"],
  "recommendations": ["ação de vendas 1", "ação de vendas 2", "ação de vendas 3"],
  "channelBreakdown": [
    {
      "channel": "meta" | "mercadolivre" | "whatsapp" | "instagram_organic" | "shopee" | "amazon" | "tiktok",
      "status": "ativo" | "pendente" | "inativo",
      "estimatedRevenue": 0,
      "priority": "alta" | "media" | "baixa",
      "nextAction": "o que fazer agora"
    }
  ],
  "pathTo100k": "string — plano de ação específico para chegar a R$100K",
  "proposedActions": [
    {
      "title": "Título da ação",
      "description": "O que fazer especificamente — ser MUITO concreto",
      "type": "reativacao" | "ads" | "marketplace" | "upsell" | "canal_novo",
      "priority": "alta" | "media" | "baixa",
      "estimatedImpact": "estimativa de receita incremental",
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
