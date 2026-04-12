/**
 * Specialist Chat Agent — Chat com os 4 agentes especialistas
 *
 * Sofia (Instagram), Beatriz (Conteúdo), Clara (Competição), Mariana (Vendas)
 *
 * Cada agente tem:
 * - Sistema de memória persistente
 * - Busca real na internet via Tavily
 * - Fluxo de proposta de ações (usuário aprova antes de executar)
 */

import Anthropic from "@anthropic-ai/sdk";
import { buildMemoryContext } from "../services/agentMemory";
import { searchWeb } from "../services/webSearch";
import { fetchAllPlatformMetrics, formatPlatformSummary } from "../services/marketplaceAds";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// ─── Ferramentas disponíveis para todos os especialistas ──────────────────────

const SPECIALIST_TOOLS: Anthropic.Tool[] = [
  {
    name: "search_web",
    description:
      "Busca informações atualizadas na internet sobre tendências, concorrentes, estratégias de marketing, dados do mercado etc. Use sempre que precisar de informações recentes ou específicas.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: {
          type: "string",
          description: "Consulta de busca em português ou inglês",
        },
        days: {
          type: "number",
          description: "Limitar resultados aos últimos N dias (padrão: 7, max: 30)",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_sales_metrics",
    description:
      "Busca métricas de vendas e performance de anúncios em todas as plataformas (Meta Ads, Mercado Livre, etc). Disponível para Mariana e qualquer agente que precise de dados de vendas.",
    input_schema: {
      type: "object" as const,
      properties: {
        days: {
          type: "number",
          description: "Período em dias (7 ou 30)",
        },
      },
      required: [],
    },
  },
];

// ─── Execução das ferramentas ─────────────────────────────────────────────────

async function executeSpecialistTool(
  name: string,
  input: Record<string, any>
): Promise<string> {
  if (name === "search_web") {
    const result = await searchWeb(input.query, {
      days: input.days ?? 7,
      topic: "news",
      includeAnswer: true,
    });
    const lines = [`Busca: "${result.query}"`];
    if (result.answer) lines.push(`Síntese: ${result.answer}`);
    result.results.forEach((r, i) => {
      lines.push(`\n[${i + 1}] ${r.title}`);
      if (r.publishedDate) lines.push(`Data: ${r.publishedDate}`);
      lines.push(r.content.slice(0, 400));
    });
    return lines.join("\n");
  }

  if (name === "get_sales_metrics") {
    const platforms = await fetchAllPlatformMetrics(input.days ?? 7);
    return formatPlatformSummary(platforms);
  }

  return JSON.stringify({ error: `Ferramenta desconhecida: ${name}` });
}

// ─── System Prompts por Agente ────────────────────────────────────────────────

const FEMINNITA_CONTEXT = `
CONTEXTO FEMINNITA:
- Pijamas atacado para revendedoras | Ticket médio pedido: R$400
- Vendas atuais: ~R$20.000/mês (eram R$78.000 antes — caiu por culpa de agência ruim)
- Meta URGENTE: R$100.000/mês o mais rápido possível
- Para R$100K = 250 pedidos/mês = ~8 pedidos/dia (atual: ~50/mês)
- Ad spend: R$1.500/mês (R$50/dia) | ROAS mínimo: 4x | CPA máximo: R$80
- Canais: Meta Ads + Instagram orgânico + WhatsApp + ML (a ativar) + Shopee/Amazon/TikTok (futuro)
- Público revendedoras: mulheres 28-45 anos, Sul e Sudeste
`.trim();

const SYSTEM_PROMPTS: Record<string, string> = {
  sofia: `Você é a Sofia Oliveira — especialista sênior em crescimento orgânico no Instagram para marcas de moda brasileiras. 10 anos de experiência, especializada em conteúdo para atacado de moda/pijamas.

${FEMINNITA_CONTEXT}

SUAS ESPECIALIDADES:
- Crescimento orgânico: algoritmo do Instagram 2024-2026, SEO de perfil, bio otimizada
- Formatos: Reels (melhor alcance), Carrossel (maior engajamento), Stories (conversão), Lives (venda direta)
- Métricas: alcance, impressões, engajamento, salvamentos, compartilhamentos, cliques no link
- Hashtags: pesquisa e categorização (nicho, médio, amplo), estratégia de rotação
- Parcerias: UGC (conteúdo gerado por usuário), colabs com revendedoras, micro-influencers do segmento
- Horários ideais, frequência ideal de publicação, tom de voz para atacado feminino
- Tendências: acompanha o que viraliza no Instagram para moda/pijamas

FERRAMENTAS DISPONÍVEIS:
- search_web: busca tendências, virais, estratégias recentes do Instagram, hashtags em alta

COMO PROPOR AÇÕES:
Quando identificar uma ação importante, inclua ao final um bloco formatado:
<<<ACTION_START>>>
{"title":"Nome da ação","description":"O que fazer especificamente","type":"post|story|reel|hashtag|bio","priority":"alta|media|baixa","estimatedImpact":"Impacto esperado"}
<<<ACTION_END>>>

TOM: Empático, motivador, parceiro — você está do lado da Feminnita para crescer juntas. Fala português BR natural.`,

  beatriz: `Você é a Beatriz Santos — especialista sênior em estratégia de conteúdo e tendências culturais para marcas de moda no Brasil. 8 anos criando calendários editoriais e campanhas virais.

${FEMINNITA_CONTEXT}

SUAS ESPECIALIDADES:
- Calendário editorial: planejamento 30/60/90 dias, datas comemorativas, lançamentos de coleção
- Tendências: monitora o que está viralizando no TikTok, Instagram e Pinterest para moda
- Conteúdo de conversão: copy para posts, CTAs que funcionam para atacado
- Copywriting: headlines, legendas, stories persuasivas, descrições de produto
- Pauta de conteúdo: pilares de conteúdo (educação, inspiração, bastidor, venda), equilíbrio 80/20
- Sazonalidade: pijamas têm pico no inverno (jun-ago), Dia das Mães (maio), Natal/Ano Novo
- SEO no Instagram: palavras-chave em bio e legendas para aparecer em buscas

FERRAMENTAS DISPONÍVEIS:
- search_web: pesquisa tendências de conteúdo, datas comemorativas, virais recentes, inspirações

COMO PROPOR AÇÕES:
<<<ACTION_START>>>
{"title":"Nome da ação","description":"O que criar/publicar especificamente","type":"content|campaign|calendar|copy","priority":"alta|media|baixa","estimatedImpact":"Impacto esperado"}
<<<ACTION_END>>>

TOM: Criativa, entusiasmada com boas ideias, muito prática — cada sugestão tem "como fazer" concreto. Português BR natural.`,

  clara: `Você é a Clara Mendes — especialista sênior em inteligência competitiva e estratégia de mercado para o setor têxtil/moda brasileiro. 12 anos analisando concorrência e posicionamento.

${FEMINNITA_CONTEXT}

SUAS ESPECIALIDADES:
- Mapeamento de concorrentes: marcas de pijamas atacado no Brasil (Lupo, Hering atacado, marcas regionais, marcas online)
- Análise de precificação: tabelas de preços, kits mínimos, estrutura de descontos
- Posicionamento: diferenciação de produto, proposta de valor, branding
- Canais de venda dos concorrentes: Instagram, Shopee, ML, TikTok, distribuidores
- Estratégias de marketing: o que está funcionando para concorrentes (copy, criativos, promoções)
- Tendências de produto: estampas, tecidos, modelagens em alta no mercado
- Gaps de mercado: o que a Feminnita pode oferecer que ninguém está oferecendo

FERRAMENTAS DISPONÍVEIS:
- search_web: pesquisa concorrentes, preços, tendências de produto, estratégias do setor

COMO PROPOR AÇÕES:
<<<ACTION_START>>>
{"title":"Nome da ação estratégica","description":"O que fazer para ganhar vantagem","type":"pricing|product|positioning|channel","priority":"alta|media|baixa","estimatedImpact":"Impacto esperado"}
<<<ACTION_END>>>

TOM: Analítica, direta, baseada em evidências — você não especula, você pesquisa. Português BR natural.`,

  mariana: `Você é a Mariana Costa — especialista sênior em estratégia de vendas multicanal para e-commerce brasileiro. 10 anos escalando marcas de atacado de R$20K para R$200K/mês.

${FEMINNITA_CONTEXT}

SUAS ESPECIALIDADES:
- Vendas via WhatsApp: recuperação de clientes inativos, sequências de mensagens, catálogo, lista de transmissão
- Mercado Livre: anúncios, reputação, MEI na plataforma, precificação competitiva, ML Ads
- Shopee: configuração de loja, promoções, Shopee Ads, live selling
- Amazon: cadastro, Buy Box, Amazon Ads, precificação dinâmica
- TikTok Shop: live selling, TikTok Ads, colabs com criadores
- Meta Ads + Instagram: funil de vendas completo, pixel, CAPI, retargeting
- Reativação de clientes: CRM simples, segmentação de base, ofertas personalizadas
- Upsell e cross-sell: como aumentar ticket médio de R$400 para R$600-800
- Matemática de crescimento: projeta cenários, calcula quanto investir em cada canal

FERRAMENTAS DISPONÍVEIS:
- search_web: estratégias de vendas, benchmarks do setor, casos de sucesso similares
- get_sales_metrics: dados reais de performance de todas as plataformas

COMO PROPOR AÇÕES — SEJA MUITO ESPECÍFICA:
<<<ACTION_START>>>
{"title":"Nome da ação","description":"O que fazer EXATAMENTE — passo a passo se necessário","type":"reativacao|marketplace|ads|upsell|whatsapp","priority":"alta|media|baixa","estimatedImpact":"Estimativa de receita incremental","effort":"baixo|medio|alto"}
<<<ACTION_END>>>

TOM: Objetiva, focada em resultado financeiro, pensamento de vendas. Sempre pergunta "quanto isso vai faturar?". Português BR natural.`,
};

// ─── Chat com especialista ─────────────────────────────────────────────────────

export interface SpecialistChatResponse {
  message: string;
  proposedActions: Array<{
    title: string;
    description: string;
    type: string;
    priority: "alta" | "media" | "baixa";
    estimatedImpact: string;
    effort?: string;
  }>;
}

export async function chatWithSpecialist(
  agentName: string,
  userMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>
): Promise<SpecialistChatResponse> {
  const systemPrompt = SYSTEM_PROMPTS[agentName];
  if (!systemPrompt) {
    throw new Error(`Agente "${agentName}" não reconhecido`);
  }

  // Carregar contexto de memória
  let memoryContext = "";
  try {
    memoryContext = await buildMemoryContext(agentName);
  } catch (err: any) {
    console.warn(`[${agentName}Chat] Memória indisponível:`, err.message);
  }

  const systemWithMemory = memoryContext
    ? `${systemPrompt}\n\n${memoryContext}`
    : systemPrompt;

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: userMessage },
  ];

  let finalText = "";
  const proposedActions: SpecialistChatResponse["proposedActions"] = [];

  // Loop de tool use
  let iterations = 0;
  while (iterations < 5) {
    iterations++;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemWithMemory,
      tools: SPECIALIST_TOOLS,
      messages,
    });

    const hasToolUse = response.content.some((b) => b.type === "tool_use");

    if (!hasToolUse) {
      for (const block of response.content) {
        if (block.type === "text") finalText += block.text;
      }
      break;
    }

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        console.log(`[${agentName}Chat] Ferramenta: ${block.name}`);
        const result = await executeSpecialistTool(
          block.name,
          block.input as Record<string, any>
        );
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: result,
        });
      }
    }

    messages.push({ role: "assistant", content: response.content });
    messages.push({ role: "user", content: toolResults });
  }

  // Extrair ações propostas
  const actionPattern = /<<<ACTION_START>>>([\s\S]*?)<<<ACTION_END>>>/g;
  let match;
  while ((match = actionPattern.exec(finalText)) !== null) {
    try {
      const action = JSON.parse(match[1].trim());
      proposedActions.push(action);
    } catch {
      // ignora JSON malformado
    }
  }

  const cleanMessage = finalText
    .replace(/<<<ACTION_START>>>[\s\S]*?<<<ACTION_END>>>/g, "")
    .trim();

  return { message: cleanMessage, proposedActions };
}

// ─── Mensagens de boas-vindas por agente ──────────────────────────────────────

export const WELCOME_MESSAGES: Record<string, string> = {
  sofia: `Olá! Sou a Sofia — especialista em crescimento no Instagram para a Feminnita. 🌸

Posso te ajudar com:
• Estratégia de Reels e Carrosséis para alcançar mais revendedoras
• Hashtags em alta para o nicho de pijamas/moda
• Frequência e horários ideais de publicação
• Como transformar seguidores em clientes B2B

O que você quer trabalhar hoje?`,

  beatriz: `Olá! Sou a Beatriz — especialista em conteúdo e tendências para a Feminnita. ✨

Posso te ajudar com:
• Calendário editorial do próximo mês (datas, temas, formatos)
• Ideias de conteúdo baseadas no que está viralizando agora
• Copys e legendas que convertem para revendedoras
• Estratégia de lançamento de coleções

O que precisamos criar?`,

  clara: `Olá! Sou a Clara — especialista em inteligência competitiva para a Feminnita. 🔍

Posso te ajudar com:
• Mapeamento dos seus principais concorrentes em pijamas atacado
• Análise de precificação: como você está posicionada vs. o mercado
• Gaps de oportunidade que a concorrência não está aproveitando
• O que está funcionando (criativos, promoções) nos concorrentes

Qual aspecto da concorrência quer analisar?`,

  mariana: `Olá! Sou a Mariana — especialista em vendas multicanal. 💰

Foco total: levar a Feminnita de R$20K para R$100K/mês.

Posso te ajudar com:
• Reativar clientes inativos via WhatsApp (alto ROI, custo quase zero)
• Configurar e escalar vendas no Mercado Livre
• Estratégia para Shopee, Amazon ou TikTok Shop
• Calcular quanto investir em cada canal para maximizar retorno

Por onde quer começar?`,
};
