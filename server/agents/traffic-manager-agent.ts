/**
 * Traffic Manager Agent — Especialista Sênior em Tráfego Pago
 *
 * Usa Claude tool_use para buscar dados reais da Meta Ads durante a conversa
 * e propor ações estruturadas que o usuário pode aprovar/rejeitar.
 */

import Anthropic from "@anthropic-ai/sdk";
import {
  fetchMetaCampaignsList,
  fetchMetaAdsets,
  fetchMetaInsights,
  fetchMetaAdsData,
} from "../services/meta-ads-service";
import { buildMemoryContext } from "../services/agentMemory";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// ─── Tipos públicos ───────────────────────────────────────────────────────────

export interface ProposedAction {
  action:
    | "pause_campaign"
    | "pause_adset"
    | "resume_campaign"
    | "resume_adset"
    | "increase_budget"
    | "decrease_budget"
    | "duplicate_adset"
    | "change_audience"
    | "change_creative"
    | "enable_advantage_plus"
    | "schedule_campaign"
    | "review_creative"
    | "custom";
  target_id?: string;
  target_name?: string;
  reason: string;
  urgency: "alta" | "media" | "baixa";
  expected_impact?: string;
  custom_description?: string;
}

export interface DailyBriefingData {
  date: string;
  spendToday: string;
  spendMonth: string;
  topCampaigns: Array<{
    name: string;
    roas: string;
    spend: string;
    status: "otima" | "boa" | "atencao" | "critica";
  }>;
  alerts: Array<{
    level: "critico" | "aviso" | "info";
    message: string;
  }>;
  recommendations: Array<{
    priority: "alta" | "media" | "baixa";
    action: string;
    expected_impact: string;
  }>;
  summary: string;
}

export interface AgentChatResponse {
  message: string;
  proposedActions: ProposedAction[];
}

// ─── Ferramentas disponíveis para a Fernanda ──────────────────────────────────

const TOOLS: Anthropic.Tool[] = [
  {
    name: "get_meta_campaigns",
    description:
      "Lista todas as campanhas da conta Meta Ads com status, objetivo e métricas do mês. Use sempre que precisar de uma visão geral da conta ou verificar o status de campanhas específicas.",
    input_schema: {
      type: "object" as const,
      properties: {
        date_preset: {
          type: "string",
          enum: ["today", "yesterday", "last_7d", "last_14d", "last_30d", "this_month", "last_month"],
          description: "Período para as métricas",
        },
      },
      required: [],
    },
  },
  {
    name: "get_meta_adsets",
    description:
      "Lista os conjuntos de anúncios (adsets) da conta ou de uma campanha específica, com budget, status e métricas. Use para analisar performance em nível de adset.",
    input_schema: {
      type: "object" as const,
      properties: {
        campaign_id: {
          type: "string",
          description: "ID da campanha para filtrar adsets (opcional). Se omitido, retorna todos os adsets da conta.",
        },
      },
      required: [],
    },
  },
  {
    name: "get_meta_insights",
    description:
      "Busca métricas detalhadas (spend, ROAS, CPM, CTR, CPC, frequência, alcance, conversões) no nível desejado. Use para análises específicas de performance.",
    input_schema: {
      type: "object" as const,
      properties: {
        level: {
          type: "string",
          enum: ["campaign", "adset", "ad"],
          description: "Nível de agregação dos dados",
        },
        date_preset: {
          type: "string",
          enum: ["today", "yesterday", "last_7d", "last_14d", "last_30d", "this_month", "last_month"],
          description: "Período para as métricas",
        },
        object_id: {
          type: "string",
          description: "ID de campanha ou adset específico para filtrar (opcional)",
        },
      },
      required: ["level", "date_preset"],
    },
  },
  {
    name: "get_account_summary",
    description:
      "Retorna resumo geral da conta: gasto hoje, gasto no mês e lista de campanhas com métricas consolidadas. Use como ponto de partida para qualquer análise.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
];

// ─── Execução das ferramentas ─────────────────────────────────────────────────

async function executeTool(name: string, input: Record<string, any>): Promise<string> {
  try {
    if (name === "get_account_summary") {
      const data = await fetchMetaAdsData();
      if (data.error) return JSON.stringify({ error: data.error });
      return JSON.stringify({
        spendToday: `R$${data.spendToday.toFixed(2)}`,
        spendMonth: `R$${data.spendMonth.toFixed(2)}`,
        campaigns: data.campaigns.map(c => ({
          id: c.id,
          name: c.name,
          status: c.status,
          spend: `R$${c.spend.toFixed(2)}`,
          roas: c.roas?.toFixed(2) ?? "N/D",
          cpm: `R$${c.cpm.toFixed(2)}`,
          ctr: `${c.ctr.toFixed(2)}%`,
          impressions: c.impressions,
          clicks: c.clicks,
        })),
      });
    }

    if (name === "get_meta_campaigns") {
      const datePreset = input.date_preset || "this_month";
      const [campaigns, insights] = await Promise.all([
        fetchMetaCampaignsList(),
        fetchMetaInsights("campaign", datePreset),
      ]);
      const insMap: Record<string, any> = {};
      for (const row of insights) insMap[row.campaign_id || row.campaign_name] = row;

      return JSON.stringify(campaigns.map(c => {
        const ins = insMap[c.id] || {};
        const spend = parseFloat(ins.spend || "0");
        const purchaseAction = (ins.actions || []).find(
          (a: any) => a.action_type === "purchase" || a.action_type === "omni_purchase"
        );
        const revenue = purchaseAction ? parseFloat(purchaseAction.value) : 0;
        return {
          id: c.id,
          name: c.name,
          status: c.status,
          objective: c.objective,
          spend: `R$${spend.toFixed(2)}`,
          roas: spend > 0 && revenue > 0 ? (revenue / spend).toFixed(2) + "x" : "N/D",
          cpm: ins.cpm ? `R$${parseFloat(ins.cpm).toFixed(2)}` : "N/D",
          ctr: ins.ctr ? `${parseFloat(ins.ctr).toFixed(2)}%` : "N/D",
          impressions: ins.impressions || 0,
          clicks: ins.clicks || 0,
        };
      }));
    }

    if (name === "get_meta_adsets") {
      const adsets = await fetchMetaAdsets(input.campaign_id);
      return JSON.stringify(adsets.map(a => ({
        id: a.id,
        name: a.name,
        campaign: a.campaignName,
        status: a.status,
        dailyBudget: a.dailyBudget ? `R$${a.dailyBudget.toFixed(2)}` : undefined,
        lifetimeBudget: a.lifetimeBudget ? `R$${a.lifetimeBudget.toFixed(2)}` : undefined,
        spend: `R$${a.spend.toFixed(2)}`,
        roas: a.roas ? a.roas.toFixed(2) + "x" : "N/D",
        cpm: `R$${a.cpm.toFixed(2)}`,
        ctr: `${a.ctr.toFixed(2)}%`,
      })));
    }

    if (name === "get_meta_insights") {
      const rows = await fetchMetaInsights(input.level, input.date_preset, input.object_id);
      return JSON.stringify(rows.map((row: any) => {
        const spend = parseFloat(row.spend || "0");
        const purchaseAction = (row.actions || []).find(
          (a: any) => a.action_type === "purchase" || a.action_type === "omni_purchase"
        );
        const revenue = purchaseAction ? parseFloat(purchaseAction.value) : 0;
        return {
          campaign: row.campaign_name,
          adset: row.adset_name,
          ad: row.ad_name,
          spend: `R$${spend.toFixed(2)}`,
          roas: spend > 0 && revenue > 0 ? (revenue / spend).toFixed(2) + "x" : "N/D",
          impressions: row.impressions,
          clicks: row.clicks,
          ctr: row.ctr ? `${parseFloat(row.ctr).toFixed(2)}%` : "N/D",
          cpm: row.cpm ? `R$${parseFloat(row.cpm).toFixed(2)}` : "N/D",
          cpc: row.cpc ? `R$${parseFloat(row.cpc).toFixed(2)}` : "N/D",
          reach: row.reach,
          frequency: row.frequency,
          purchases: purchaseAction?.value ?? 0,
        };
      }));
    }

    return JSON.stringify({ error: `Ferramenta desconhecida: ${name}` });
  } catch (err: any) {
    console.error(`[Tool ${name}] Erro:`, err.message);
    return JSON.stringify({ error: err.message });
  }
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é a Dra. Fernanda Leal — especialista sênior em tráfego pago com 12 anos de experiência, focada em e-commerce de moda e vestuário brasileiro.

═══ CONTEXTO DA CONTA ═══
Cliente: Feminnita Pijamas — marca de moda íntima e pijamas em suede premium, com sede em Nova Friburgo, RJ.
Canais ativos: Meta Ads (principal), Google Ads (shopping + search), ML Ads (Mercado Livre), Shopee Ads.
Ticket médio: R$120-R$280 (kit pijama suede). Público principal: mulheres 25-55 anos, classes B/C.
Objetivo primário: ROAS ≥ 4.0 em Meta, CAC ≤ R$35, escalar com eficiência em sazonais (Dia das Mães, Natal, inverno).

═══ FERRAMENTAS DISPONÍVEIS ═══
Você tem acesso direto à conta Meta Ads via ferramentas. SEMPRE que o usuário perguntar sobre performance, campanhas, métricas ou pedir análise, use as ferramentas para buscar dados reais ANTES de responder. Não responda com base em suposições quando pode verificar os dados reais.

- get_account_summary: visão geral da conta (gasto hoje/mês + campanhas)
- get_meta_campaigns: lista campanhas com status e métricas
- get_meta_adsets: lista adsets de uma campanha ou da conta
- get_meta_insights: métricas detalhadas por nível (campanha/adset/anúncio)

═══ SEU PERFIL E EXPERTISE ═══
- Domina Meta Ads profundamente: campanhas ASC (Advantage Shopping Campaigns), Advantage+ Audience, Broad targeting, pixel events, CAPI server-side, Value Optimization
- Entende as mudanças de algoritmo Meta 2023-2026: consolidação de adsets, aprendizado acelerado, signal loss pós-iOS 14, Andromeda (algoritmo Meta 2024), ABO vs CBO
- Google Ads: Shopping, PMAX (Performance Max), Search com match types, ROAS targets, bid strategies
- ML Ads: CPM, CPC, campanhas de produto patrocinado no Mercado Livre, segmentação por categoria
- Shopee Ads: campanhas de produto, loja patrocinada, search ads na Shopee, ROAS peculiaridades do marketplace
- Métricas que importam: ROAS, CAC, LTV, CPM, CTR, CPC, CPA, Frequência, Relevance Score, Thumb Stop Rate, Hook Rate

═══ COMO VOCÊ PENSA ═══
1. Primeiro busca dados reais — não analisa no escuro
2. Diagnóstico preciso: segmentação, criativo, oferta ou estrutura de campanha
3. Prioriza impacto real: não sugere microajustes quando o problema é estrutural
4. Pensa em janela de atribuição: modelos de atribuição diferentes distorcem ROAS
5. Considera sazonalidade: pijamas têm pico em inverno (jun-ago) e datas comemorativas
6. Equilibra eficiência vs. escala

═══ COMO PROPOR AÇÕES ═══
Quando identificar uma ação necessária (pausar campanha, ajustar budget, mudar creative, etc.), inclua na resposta um bloco JSON estruturado EXATAMENTE neste formato:

<<<ACTION_START>>>
{"action":"pause_campaign","target_id":"123456789","target_name":"Nome da Campanha","reason":"Explicação objetiva","urgency":"alta","expected_impact":"O que melhora"}
<<<ACTION_END>>>

Você pode propor múltiplas ações — cada uma em seu próprio bloco ACTION_START/ACTION_END.

Ações válidas: pause_campaign, pause_adset, resume_campaign, resume_adset, increase_budget, decrease_budget, duplicate_adset, change_audience, change_creative, enable_advantage_plus, schedule_campaign, review_creative, custom.

IMPORTANTE: Sempre inclua o target_id real (obtido pelas ferramentas) quando propor pause/resume/budget changes — isso permite a execução automática quando o usuário aprovar.

Para "custom", adicione "custom_description" explicando a ação.

═══ FORMATO DA RESPOSTA ═══
SEMPRE responda em texto natural, português BR. NUNCA retorne JSON bruto na resposta de chat.
Os únicos blocos estruturados permitidos são os <<<ACTION_START>>>...<<<ACTION_END>>> para propor ações.
Tudo o mais deve ser prosa clara e direta.

═══ TOM E COMUNICAÇÃO ═══
- Fala português BR, profissional mas direto — sem rodeios corporativos
- Usa termos técnicos de tráfego naturalmente
- Quando não tem dados, busca com as ferramentas — não chuta
- Sempre que possível, dá números de referência
- Se algo está errado, diz claramente

═══ SOBRE A FEMINNITA ═══
- Produto: pijamas em suede premium, conjuntos calça+blusa, infantil, adulto
- Diferenciais: qualidade do tecido, modelo exclusivo, fotografia profissional
- Sazonalidade forte: inverno (junho a agosto = 3x volume normal), Dia das Mães (maio), Natal (dezembro)
- Revendedoras B2B também são público (atacado) — mas a conta Meta foca no varejo direto
- Concorrência: muitas marcas similares no Instagram/Meta — diferencial criativo é crítico`;

// ─── Chat com tool use ────────────────────────────────────────────────────────

export async function chatWithAgent(
  userMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
): Promise<AgentChatResponse> {
  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  let finalText = "";
  const proposedActions: ProposedAction[] = [];

  // Carregar contexto de memória histórica da Fernanda
  let memoryContext = "";
  try {
    memoryContext = await buildMemoryContext("fernanda");
  } catch (err: any) {
    console.warn("[FernandaAgent] Não foi possível carregar memória:", err.message);
  }

  const systemWithMemory = memoryContext
    ? `${SYSTEM_PROMPT}\n\n${memoryContext}`
    : SYSTEM_PROMPT;

  // Loop de tool use — continua até o modelo não chamar mais ferramentas
  while (true) {
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemWithMemory,
      tools: TOOLS,
      messages,
    });

    const hasToolUse = response.content.some((b) => b.type === "tool_use");

    if (!hasToolUse) {
      // Resposta final — extrai texto
      for (const block of response.content) {
        if (block.type === "text") finalText += block.text;
      }
      break;
    }

    // Processar chamadas de ferramentas
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        console.log(`[FernandaAgent] Chamando ferramenta: ${block.name}`);
        const result = await executeTool(block.name, block.input as Record<string, any>);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    // Adicionar resposta do modelo + resultados das ferramentas ao histórico
    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });
  }

  // Extrair ações propostas do texto final
  const actionPattern = /<<<ACTION_START>>>([\s\S]*?)<<<ACTION_END>>>/g;
  let match;
  while ((match = actionPattern.exec(finalText)) !== null) {
    try {
      const action = JSON.parse(match[1].trim()) as ProposedAction;
      proposedActions.push(action);
    } catch {
      // ignora JSON malformado
    }
  }

  // Limpar blocos de ação da mensagem
  const cleanMessage = finalText
    .replace(/<<<ACTION_START>>>[\s\S]*?<<<ACTION_END>>>/g, "")
    .trim();

  return { message: cleanMessage, proposedActions };
}

// ─── Gerador de Briefing Diário ───────────────────────────────────────────────

export async function generateDailyBriefing(
  metaData?: {
    adAccountId?: string;
    spendToday?: number;
    spendMonth?: number;
    campaigns?: Array<{
      name: string;
      spend: number;
      roas?: number;
      cpm?: number;
      ctr?: number;
      status?: string;
    }>;
  }
): Promise<DailyBriefingData> {
  const today = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const month = new Date().toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  let dataContext = "";
  if (metaData?.campaigns && metaData.campaigns.length > 0) {
    dataContext = `
DADOS REAIS DA CONTA (hoje):
- Gasto hoje: R$${metaData.spendToday?.toFixed(2) ?? "N/D"}
- Gasto no mês: R$${metaData.spendMonth?.toFixed(2) ?? "N/D"}
- Campanhas ativas:
${metaData.campaigns
  .map(
    (c) =>
      `  • ${c.name}: R$${c.spend.toFixed(2)} gasto, ROAS ${c.roas?.toFixed(2) ?? "N/D"}, CPM R$${c.cpm?.toFixed(2) ?? "N/D"}, CTR ${c.ctr?.toFixed(2) ?? "N/D"}%`
  )
  .join("\n")}`;
  } else {
    dataContext = `
ATENÇÃO: Dados da API Meta não disponíveis. Gere um briefing contextual para ${today} com base no conhecimento sazonal e nas melhores práticas para uma conta de pijamas em ${month}.
Neste caso, os valores de spend/ROAS devem ser apresentados como "Aguardando dados" e as recomendações devem ser baseadas em sazonalidade e boas práticas.`;
  }

  const prompt = `Gere o briefing diário de tráfego pago para a Feminnita — ${today}.
${dataContext}

Responda APENAS com JSON válido neste formato:
{
  "date": "${today}",
  "spendToday": "R$XXX ou 'Aguardando dados'",
  "spendMonth": "R$X.XXX ou 'Aguardando dados'",
  "topCampaigns": [
    {"name": "Nome da Campanha", "roas": "4.2x", "spend": "R$450", "status": "otima|boa|atencao|critica"}
  ],
  "alerts": [
    {"level": "critico|aviso|info", "message": "Descrição do alerta"}
  ],
  "recommendations": [
    {"priority": "alta|media|baixa", "action": "Ação recomendada", "expected_impact": "Impacto esperado"}
  ],
  "summary": "Parágrafo resumo do dia — máx. 3 frases, direto ao ponto"
}`;

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content[0]?.type === "text" ? response.content[0].text : "";
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return {
      date: today,
      spendToday: "Aguardando dados",
      spendMonth: "Aguardando dados",
      topCampaigns: [],
      alerts: [{ level: "aviso", message: "Conecte a conta Meta Ads para ver dados em tempo real." }],
      recommendations: [
        {
          priority: "alta",
          action: "Conectar conta Meta Ads nas integrações",
          expected_impact: "Habilita análise automatizada e briefings com dados reais",
        },
      ],
      summary: "Briefing indisponível — a conta Meta Ads ainda não está conectada.",
    };
  }

  return JSON.parse(jsonMatch[0]) as DailyBriefingData;
}
