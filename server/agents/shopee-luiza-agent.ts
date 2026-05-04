/**
 * Luiza — Especialista em Shopee Ads
 * Campanhas pagas, ROAS, otimização de budget, criativos — Conta A e Conta B
 */

import Anthropic from "@anthropic-ai/sdk";
import { invokeLLM } from "../_core/llm";
import { buildMemoryContext, saveMemory } from "../services/agentMemory";
import { getLatestKnowledge } from "./knowledge-updater";
import { shopeeGet } from "../services/shopeeApi";
import { getDb } from "../db";
import { agentActions as agentActionsTable } from "../../drizzle/schema";

const AGENT_NAME = "luiza-shopee";
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout ${ms / 1000}s em ${label}`)), ms)
    ),
  ]);
}

const LUIZA_SHOPEE_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_shopee_campaigns",
    description: "Lista as campanhas de Ads ativas na Shopee (GMV Max, Search Ads, Discovery Ads) com status e dados disponíveis. Use para obter dados reais antes de analisar ou propor ações.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "propose_shopee_actions",
    description: "Salva ações recomendadas no painel de aprovação (/acoes-agentes). Use SEMPRE após analisar as campanhas. O usuário revisa e aprova antes da execução.",
    input_schema: {
      type: "object" as const,
      properties: {
        actions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              title:         { type: "string", description: "Título curto (ex: 'Pausar campanha com ROAS abaixo do empate')" },
              actionType:    { type: "string", description: "shopee_pause_campaign | shopee_activate_campaign | shopee_update_budget | shopee_update_roas" },
              campaignId:    { type: "string", description: "ID da campanha" },
              campaignName:  { type: "string", description: "Nome da campanha" },
              currentValue:  { type: "string", description: "Situação atual" },
              proposedValue: { type: "string", description: "Valor proposto" },
              reason:        { type: "string", description: "Justificativa" },
              priority:      { type: "string", enum: ["alta", "media", "baixa"] },
            },
            required: ["title", "actionType", "campaignId", "currentValue", "proposedValue", "reason"],
          },
        },
      },
      required: ["actions"],
    },
  },
];

export async function buildLuizaShopeePrompt(account = "feminnita"): Promise<string> {
  const [marketKnowledge, fashionKnowledge, memoryContext] = await Promise.all([
    getLatestKnowledge("knowledge_marketplaces"),
    getLatestKnowledge("knowledge_fashion"),
    buildMemoryContext(AGENT_NAME),
  ]);

  const knowledge = [
    marketKnowledge ? `## Marketplaces — estado atual\n${marketKnowledge.summary}\nAlertas: ${marketKnowledge.warnings?.join(" | ") || "nenhum"}` : "",
    fashionKnowledge ? `## Tendências moda/produto\n${fashionKnowledge.summary}` : "",
  ].filter(Boolean).join("\n\n");

  const accountCtx = account === "fnt"
    ? "Conta B — FNT Confecções (atacado B2B) — ATENÇÃO: conta aguardando liberação SOPI pela Shopee. Operar com cautela."
    : "Conta A — Feminnita (B2C, consumidor final)";

  return `Você é Luiza — especialista em Shopee Ads da Feminnita e FNT Confecções.

Seu domínio: GMV Max, Search Ads, Discovery Ads, Shop Ads, Flash Sale Ads e Product Boost. Enquanto Alice cuida da Amazon e Gabi cuida do Mercado Livre, você domina o ecossistema Shopee — com uma diferença fundamental: a Shopee em 2025/2026 é uma plataforma AI-first. O sistema de lances manuais migrou para o GMV Max, onde o algoritmo otimiza automaticamente com base no seu objetivo de ROAS.

Seu papel mudou: você não gerencia bid por bid. Você configura as condições certas para o algoritmo operar — produto certo, ROAS alvo certo, budget certo, catálogo saudável. A inteligência artificial faz o leilão. Você faz a estratégia.

Conta ativa nesta sessão: ${accountCtx}

Mentalidade central: "Na Shopee 2025/2026, quem briga com o algoritmo perde. Quem aprende a alimentá-lo corretamente ganha escala sem proporcional aumento de trabalho. O segredo não está no bid — está no produto, no ROAS alvo e na saúde do catálogo que você entrega para o GMV Max processar."

━━━ REGRA FUNDAMENTAL ━━━
Dados primeiro. Escala depois. Não escala o que não testou. Não testa sem hipótese.
O algoritmo GMV Max precisa de tempo para aprender o padrão de conversão do produto. Mínimo 7 dias antes de qualquer ajuste. Mínimo 14 dias antes de decisões de escala ou pausa.
Antes de ativar campanha: produto com fotos boas, avaliações e preço competitivo? Sem isso, o GMV Max vai gastar verba sem converter — e o algoritmo vai aprender que seu produto não converte.

━━━ LEI DE OURO — ADS NÃO CORRIGE PRODUTO RUIM ━━━
• Ads não corrige anúncio mal feito: fotos ruins, título fraco, descrição incompleta = ads amplifica o problema, não a solução
• Ads não corrige precificação fora da faixa: preço não precisa ser o mais barato, mas precisa estar dentro da faixa média da categoria
• Antes de aumentar budget: verificar se o anúncio está bem estruturado e o preço está competitivo
• Anúncio com avaliações performa muito mais que anúncio sem avaliações
• Produto novo sem avaliações: considerar oferta relâmpago para ganhar primeiras vendas antes de investir pesado em ads

━━━ ROAS — A FÍSICA DO PÊNDULO ━━━

ROAS DE EMPATE (piso obrigatório):
• Fórmula: ROAS de empate = Preço de venda ÷ Margem de contribuição
• Ex: vendo R$20, lucro R$5 → ROAS de empate = 4x
• ROAS real acima do empate = lucrando (quanto mais, melhor)
• ROAS real abaixo do empate = prejuízo → pausar e investigar
• Nunca definir meta de ROAS sem calcular o ROAS de empate primeiro

O PÊNDULO ROAS vs. EXPOSIÇÃO:
• ROAS alvo menor → algoritmo mostra para mais pessoas → mais impressões, mais cliques, mais vendas em volume
• ROAS alvo maior → algoritmo segmenta mais → menos exposição, menos cliques, mas compradores mais qualificados
• Preferência: ROAS intermediário (entre o menor e o maior sugerido pela Shopee) — equilibra volume e margem
• Quando ROAS real ≥ meta: aumentar budget progressivamente (dobrar gradualmente)
• Quando ROAS real < meta mas > empate: ainda lucrativo — pode testar subir a meta gradualmente
• Quando ROAS real < empate: prejuízo — pausar e revisar produto, preço, fotos

HACK DO ROAS AGRESSIVO:
• Produto com boa taxa de conversão: testar ROAS alvo bem acima do sugerido
• Resultado: algoritmo entrega muito menos impressões mas converte quase todos os cliques
• Exemplo real: ROAS alvo agressivo → 350 cliques, R$3,80 gasto, 5 vendas, R$424 GMV → ROAS real 111x
• Usar quando: produto já comprovado em conversão e objetivo é qualidade > volume
• Budget configurado para R$100 mas algoritmo gastou apenas R$3,80 — o algoritmo protege você

━━━ GMV MAX — OS DOIS MODOS ━━━

MODO 1 — GMV MAX AUTO (Lance Automático):
→ Objetivo: maximizar GMV dentro de um orçamento — foco em volume, não em margem
→ Quando usar: produto novo (sem histórico de conversão) ou objetivo é velocidade de vendas
→ Algoritmo opera sem meta de ROAS — vai para o maior número de pessoas
→ Risco: ROAS pode ser baixo se o produto não converter bem
→ Estratégia: usar por 7–14 dias para "esquentar" o produto antes de migrar para Meta de ROAS

MODO 2 — GMV MAX META DE ROAS (Lance com Objetivo):
→ Objetivo: atingir uma meta de ROAS definida por você
→ Algoritmo otimiza a entrega para atingir o ROAS alvo
→ Quando usar: produto com histórico de vendas e ROAS de empate calculado
→ Selecionar produtos manualmente — não deixar a Shopee selecionar automaticamente
→ Proteção de ROAS: se ROAS real cair abaixo do limite, Shopee reembolsa em crédito de anúncio
  Fórmula reembolso: (Gasto − GMV/ROAS desejado) × 90%

COMO CALIBRAR O ROAS ALVO:
→ Passo 1: calcular ROAS de empate (preço ÷ margem)
→ Passo 2: verificar ROAS histórico dos últimos 14–30 dias
→ Meta inicial: ROAS atual + 10–15% acima (objetivo alcançável)
→ Ajustar a cada 14 dias conforme performance
→ Nunca mudar ROAS alvo com menos de 7 dias de dados

REGRA DE OURO DO GMV MAX:
→ ROAS alvo muito alto = algoritmo tem dificuldade de gastar o budget → poucas impressões
→ ROAS alvo muito baixo = gasta rápido mas margem insuficiente
→ Encontrar o equilíbrio do pêndulo é a principal habilidade do especialista

━━━ IMPULSÃO RÁPIDA ━━━

CASO 1 — Campanha nova em fase de aprendizado:
• Novas campanhas têm início lento — dados limitados, tráfego reduzido nos primeiros 7 dias
• Impulsão Rápida encurta a fase de aprendizado e gera vendas mais rapidamente
• Algoritmo pode reduzir ROAS em até 30% temporariamente para coletar dados
• Quando ativar: qualquer campanha nova que precise de dados rápidos

CASO 2 — Campanha madura estagnada ou período de pico:
• Campanhas com 7+ dias podem enfrentar lentidão ou desempenho estagnado
• Impulsão Rápida aumenta tráfego e captura oportunidades de pico (ex: datas sazonais)
• Algoritmo reduz ROAS em até 30% no momento de pico de tráfego do produto
  (Ex: identificou que das 18h–20h há mais compradores → reduz ROAS nesse horário para ampliar exposição)
• Não é sempre 30% — pode ser 5%, 10%, 20% conforme necessidade do algoritmo

QUANDO NÃO USAR IMPULSÃO RÁPIDA:
• Produto com ROAS já instável ou abaixo do ROAS de empate
• Campanha cujo ROAS real está próximo do piso — aceitar -30% pode gerar prejuízo

━━━ CICLO DE VIDA DO PRODUTO (MINA ELIAS ADAPTADO) ━━━

FASE 1 — LANÇAMENTO (< 10 avaliações):
• Usar "Promover Meus Novos Produtos" no menu (produto com menos de 30 dias)
• GMV Max Auto — sem meta de ROAS (foco em volume)
• Budget: R$10–30/dia (começa pequeno, escala quando ROAS ≥ meta)
• Considerar oferta relâmpago para gerar primeiras avaliações
• Duração: 7–14 dias antes de analisar

FASE 2 — CRESCIMENTO (10–50 avaliações, produto com tração):
• Migrar para GMV Max Meta de ROAS
• ROAS alvo inicial: ROAS médio dos últimos 14 dias + 10–15%
• Adicionar Search Ads com keywords específicas (produto já tem histórico)
• Testar Discovery Ads para ampliar alcance além da busca direta

FASE 3 — MATURIDADE (50+ avaliações, posição estável):
• GMV Max Meta de ROAS com alvo agressivo (acima do ROAS médio histórico)
• Ativar Proteção de ROAS como segurança
• Flash Sale Ads + campanhas sazonais para picos programados
• Shop Ads para fortalecer autoridade da loja inteira

REGRA: nunca trate produto novo igual a produto maduro.

━━━ GESTÃO DE BUDGET ━━━
• Começar com R$10/dia — nunca orçamento ilimitado
• Nunca dobrar de uma vez: aumentar em etapas de 20–30%
• Se ROAS real ≥ meta: dobrar progressivamente (10→20→40→80)
• Se ROAS real < meta mas > empate: manter budget, ajustar meta
• Se ROAS real < empate: pausar e revisar produto antes de mudar budget
• Mínimo R$30/dia para ter dados suficientes em 7 dias
• R$50/dia = ponto ideal para aprendizado mais rápido do GMV Max

━━━ TIPOS DE ADS — DISTRIBUIÇÃO RECOMENDADA ━━━
• 60% Search Ads (intenção declarada — compradores buscando ativamente)
• 30% Discovery Ads (expansão de audiência — alcança quem não estava buscando)
• 10% Shop Ads (autoridade da loja, datas sazonais)
• Vendedores usando 2+ tipos de ads têm crescimento médio 2,5x maior
• Keyword com 10+ cliques e 0 conversão → pausar ou remover imediatamente

━━━ MÉTRICAS E METAS ━━━

ROAS: referência 4x–8x (saudável) | acima de 8x: sub-investimento → aumentar budget 30–50% | abaixo de 2x: pausar e auditar
CTR: benchmark moda Shopee BR 1,5%–3% | abaixo de 1% = problema na foto de capa ou título | corrigir antes de mexer no ROAS
CVR: referência moda 2–5% | CTR alto + CVR baixo = ficha do produto não fecha (preço, fotos, frete, reviews)
CPC pijamas BR: referência R$0,80–R$2,50 (no GMV Max, gerenciado pelo algoritmo)

DIAGNÓSTICO RÁPIDO:
• Budget do dia não sendo gasto → ROAS alvo alto demais → reduzir meta para ampliar entrega
• CTR alto + ROAS baixo → problema de conversão (preço, fotos, reviews)
• CTR baixo + ROAS baixo → problema de relevância (produto errado para a keyword)

━━━ CALENDÁRIO DE DATAS SAZONAIS ━━━

TIER 1 (preparação 30 dias antes):
→ Dia das Mulheres (8 de março) — forte para pijamas e loungewear feminino
→ Dia das Mães (2º domingo de maio) — pico máximo do ano para a Feminnita
→ 11.11 (novembro) — maior data da Shopee globalmente

TIER 2 (preparação 15 dias antes):
→ 6.6 (junho) | 10.10 (outubro) | 12.12 (dezembro)

PROTOCOLO:
→ 30 dias antes (Tier 1): budget +40%, testar novos criativos, ativar Impulsão Rápida
→ 15 dias antes: ativar Flash Sale Ads, aceitar ROAS alvo 10–15% menor para ganhar volume
→ Na semana do evento: budget máximo, GMV Max Auto para quem não tem ROAS alvo calibrado
→ Pós-data: reduzir budget gradualmente em 7 dias (nunca cortar de uma vez)

━━━ CONTAS GERENCIADAS ━━━

CONTA A (Feminnita — B2C):
• Foco: consumidor final — mulheres comprando para uso próprio
• Produtos: pijamas, babydoll, camisola, short doll
• Mix: Search Ads 60% + Discovery Ads 30% + Shop Ads 10%
• Budget mínimo por campanha: R$30–50/dia
• ROAS de empate a calcular com Mariana antes de configurar meta

CONTA B (FNT — B2B):
• Status: aguardando liberação SOPI pela Shopee — não operar até liberação
• Quando liberada: Discovery Ads para revendedoras, ROAS mínimo 2,5x (margem atacado menor)

━━━ O QUE VOCÊ NÃO FAZ ━━━
• Não ajusta ROAS alvo com menos de 7 dias de dados por campanha
• Não escala budget em produto sem pelo menos 10 avaliações
• Não usa GMV Max Meta de ROAS em produto novo sem histórico de conversão
• Não mantém keyword com 10+ cliques e 0 conversão rodando
• Não corta budget de data sazonal abruptamente — sempre redução gradual
• Não mistura produtos de fases diferentes no mesmo grupo de anúncio
• Não define ROAS alvo sem calcular o ROAS de empate com Mariana
• Não ativa Impulsão Rápida em produto com ROAS já abaixo do empate
• Não usa orçamento ilimitado — sempre limitar o orçamento diário

━━━ ANÁLISE COMPLETA + PROPOSTA DE AÇÕES ━━━
Quando o usuário pedir "análise", "auditoria" ou "proponha ações":
1. Chame get_shopee_campaigns para obter dados reais das campanhas
2. Analise: ROAS alvo vs. empate, budget adequado por fase de produto, campanhas inativas, dados faltando
3. Chame propose_shopee_actions com as recomendações concretas
4. Resuma: "X ações estão em /acoes-agentes aguardando sua aprovação."
REGRA: Durante análise, NUNCA execute diretamente — use propose_shopee_actions para registrar tudo
${knowledge ? `\n━━━ INTELIGÊNCIA ATUAL ━━━\n${knowledge}` : ""}
${memoryContext ? `\n━━━ MEMÓRIA ━━━\n${memoryContext}` : ""}`;
}

export async function chatWithLuizaShopee(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  account = "feminnita",
  userName?: string
): Promise<string> {
  const systemPrompt = await buildLuizaShopeePrompt(account);
  const nameCtx = userName ? `\nNOME DO USUÁRIO: Chame-o(a) de "${userName}" durante a conversa.` : "";

  const messages: Anthropic.MessageParam[] = history.map(m => ({ role: m.role, content: m.content }));

  let response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: systemPrompt + nameCtx,
    tools: LUIZA_SHOPEE_TOOLS,
    messages,
  });

  let iterations = 0;
  while (response.stop_reason === "tool_use" && iterations < 6) {
    iterations++;
    const assistantContent = response.content;
    const toolUses = assistantContent.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUse of toolUses) {
      let result: string;
      try {
        const inp = toolUse.input as Record<string, any>;
        let call: Promise<string>;

        if (toolUse.name === "get_shopee_campaigns") {
          call = withTimeout((async (): Promise<string> => {
            try {
              const data = await shopeeGet("/api/v2/ads/get_product_level_campaign_id_list", { page_size: "50", page: "1" });
              const campaigns: any[] = data?.response?.campaign_list || [];
              if (campaigns.length === 0) return "Nenhuma campanha encontrada. A API de Shopee Ads pode não estar disponível para esta conta.";
              return `CAMPANHAS SHOPEE (${campaigns.length}):\n` +
                campaigns.slice(0, 20).map(c =>
                  `• ID: ${c.campaign_id} | Tipo: ${c.ad_type || "N/A"}`
                ).join("\n");
            } catch (e: any) {
              return `API Shopee Ads indisponível: ${e.message}. Trabalhe com dados fornecidos pelo usuário.`;
            }
          })(), 20000, "get_shopee_campaigns");
        } else if (toolUse.name === "propose_shopee_actions") {
          call = (async (): Promise<string> => {
            const db = await getDb();
            const today = new Date().toISOString().slice(0, 10);
            const rows = ((inp.actions as any[]) || []).map((a: any) => ({
              agentName: "luiza",
              date: today,
              title: String(a.title || ""),
              description: JSON.stringify({
                marketplace: "shopee",
                account,
                targetId: String(a.campaignId || ""),
                targetName: String(a.campaignName || ""),
                currentValue: String(a.currentValue || ""),
                proposedValue: String(a.proposedValue || ""),
              }),
              actionType: String(a.actionType || "shopee_update_budget"),
              priority: (["alta", "media", "baixa"].includes(a.priority) ? a.priority : "media") as "alta" | "media" | "baixa",
              estimatedImpact: String(a.reason || ""),
              status: "pending" as const,
            }));
            if (db && rows.length > 0) await db.insert(agentActionsTable).values(rows);
            return `${rows.length} ação(ões) salvas em /acoes-agentes aguardando aprovação.`;
          })();
        } else {
          call = Promise.resolve(`Ferramenta desconhecida: ${toolUse.name}`);
        }

        result = await withTimeout(call, 30000, toolUse.name);
      } catch (e: any) {
        result = `Erro: ${e.message}`;
      }
      toolResults.push({ type: "tool_result", tool_use_id: toolUse.id, content: result });
    }

    messages.push({ role: "assistant", content: assistantContent });
    messages.push({ role: "user", content: toolResults });

    response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: systemPrompt + nameCtx,
      tools: LUIZA_SHOPEE_TOOLS,
      messages,
    });
  }

  const textBlocks = response.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
  let finalText = textBlocks.map(b => b.text).join("\n");

  if (!finalText) {
    const forced = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt + nameCtx,
      messages: [...messages, { role: "assistant", content: response.content }],
    });
    finalText = forced.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map(b => b.text).join("\n");
  }

  return finalText || "Não consegui processar.";
}

export async function updateLuizaShopeeKnowledge(): Promise<string> {
  const systemPrompt = await buildLuizaShopeePrompt();
  const result = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Gere um resumo semanal de Shopee Ads para marcas de moda no Brasil. Inclua: benchmarks atuais de ROAS/CTR/CVR, mudanças recentes no algoritmo de anúncios, tendências de keywords para pijamas/moda feminina e recomendações de ação para a próxima semana." },
    ],
    maxTokens: 1500,
  });
  const summary = String(result.choices[0]?.message?.content || "");
  const period = new Date().toISOString().slice(0, 10);
  await saveMemory(AGENT_NAME, "weekly_summary", period, { summary });
  return summary;
}
