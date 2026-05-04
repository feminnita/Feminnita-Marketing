/**
 * Gabi — Especialista em ML Ads e EDS Mercado Livre
 * Fichas de produto, anúncios, atributos — Conta A e Conta B
 * Com execução real via API do ML
 */

import Anthropic from "@anthropic-ai/sdk";
import { invokeLLM } from "../_core/llm";
import { buildMemoryContext, saveMemory } from "../services/agentMemory";
import { getLatestKnowledge } from "./knowledge-updater";
import { listMLItems, pauseMLItem, activateMLItem, updateMLPrice, updateMLStock, getMLItemDetails, getMLCategoryAttributes, updateMLItemAttributes, listMLAdsCampaigns, pauseMLAdsCampaign, activateMLAdsCampaign, updateMLAdsBudget, getMLAdsCampaignStats } from "./gabi-executor";

const AGENT_NAME = "gabi";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout de ${ms / 1000}s atingido em ${label}`)), ms)
    ),
  ]);
}

const GABI_ML_TOOLS: Anthropic.Tool[] = [
  {
    name: "ml_list_items",
    description: "Lista os anúncios da conta Mercado Livre ativa com ID, título, status, preço e estoque. Use SEMPRE antes de fazer qualquer alteração para ter os IDs corretos.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "ml_pause_item",
    description: "Pausa um anúncio no Mercado Livre. Execute somente após o usuário confirmar explicitamente.",
    input_schema: {
      type: "object" as const,
      properties: {
        itemId: { type: "string", description: "ID do anúncio (obtido via ml_list_items)" },
        itemTitle: { type: "string", description: "Título do anúncio (para confirmar ao usuário)" },
      },
      required: ["itemId"],
    },
  },
  {
    name: "ml_activate_item",
    description: "Reativa um anúncio pausado no Mercado Livre. Execute somente após o usuário confirmar.",
    input_schema: {
      type: "object" as const,
      properties: {
        itemId: { type: "string", description: "ID do anúncio" },
        itemTitle: { type: "string", description: "Título do anúncio" },
      },
      required: ["itemId"],
    },
  },
  {
    name: "ml_update_price",
    description: "Atualiza o preço de um anúncio no Mercado Livre. Execute somente após o usuário confirmar.",
    input_schema: {
      type: "object" as const,
      properties: {
        itemId: { type: "string", description: "ID do anúncio" },
        price: { type: "number", description: "Novo preço em R$ (ex: 89.90)" },
        itemTitle: { type: "string", description: "Título do anúncio" },
      },
      required: ["itemId", "price"],
    },
  },
  {
    name: "ml_update_stock",
    description: "Atualiza o estoque disponível de um anúncio no Mercado Livre. Execute somente após o usuário confirmar.",
    input_schema: {
      type: "object" as const,
      properties: {
        itemId: { type: "string", description: "ID do anúncio" },
        quantity: { type: "number", description: "Nova quantidade em estoque" },
        itemTitle: { type: "string", description: "Título do anúncio" },
      },
      required: ["itemId", "quantity"],
    },
  },
  {
    name: "ml_get_item_details",
    description: "Busca detalhes completos de um anúncio: título, status, atributos preenchidos e vazios, health score, descrição. Use para auditar o EDS de um item específico antes de propor melhorias.",
    input_schema: {
      type: "object" as const,
      properties: {
        itemId: { type: "string", description: "ID do anúncio (ex: MLB5965767278)" },
      },
      required: ["itemId"],
    },
  },
  {
    name: "ml_get_category_attributes",
    description: "Busca todos os atributos obrigatórios e recomendados de uma categoria do ML. Use para saber exatamente o que preencher em cada anúncio.",
    input_schema: {
      type: "object" as const,
      properties: {
        categoryId: { type: "string", description: "ID da categoria (ex: MLB5765 — encontrado no ml_get_item_details)" },
      },
      required: ["categoryId"],
    },
  },
  {
    name: "ml_ads_list_campaigns",
    description: "Lista todas as campanhas de Product Ads (anúncios patrocinados) da conta Feminnita com ID, nome, status e budget.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "ml_ads_pause_campaign",
    description: "Pausa uma campanha de Product Ads. Execute somente após confirmação do usuário.",
    input_schema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string", description: "ID da campanha" },
        campaignName: { type: "string", description: "Nome da campanha para confirmar" },
      },
      required: ["campaignId"],
    },
  },
  {
    name: "ml_ads_activate_campaign",
    description: "Reativa uma campanha de Product Ads pausada. Execute somente após confirmação.",
    input_schema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string", description: "ID da campanha" },
        campaignName: { type: "string", description: "Nome da campanha" },
      },
      required: ["campaignId"],
    },
  },
  {
    name: "ml_ads_update_budget",
    description: "Atualiza o budget diário de uma campanha de Product Ads. Execute somente após confirmação.",
    input_schema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string", description: "ID da campanha" },
        dailyBudget: { type: "number", description: "Novo budget diário em R$" },
        campaignName: { type: "string", description: "Nome da campanha" },
      },
      required: ["campaignId", "dailyBudget"],
    },
  },
  {
    name: "ml_ads_campaign_stats",
    description: "Busca métricas de uma campanha: impressões, cliques, CTR, gasto, CPC, conversões, ROAS.",
    input_schema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string", description: "ID da campanha" },
        dateFrom: { type: "string", description: "Data início YYYY-MM-DD" },
        dateTo: { type: "string", description: "Data fim YYYY-MM-DD" },
      },
      required: ["campaignId", "dateFrom", "dateTo"],
    },
  },
  {
    name: "ml_update_item_attributes",
    description: "Atualiza atributos EDS de um anúncio (composição, cor, tamanho, marca, etc). Execute somente após o usuário confirmar. Use ml_get_category_attributes para descobrir os IDs corretos dos atributos.",
    input_schema: {
      type: "object" as const,
      properties: {
        itemId: { type: "string", description: "ID do anúncio" },
        attributes: {
          type: "array",
          description: "Lista de atributos a atualizar",
          items: {
            type: "object",
            properties: {
              id: { type: "string", description: "ID do atributo (ex: BRAND, GENDER, FABRIC)" },
              value_name: { type: "string", description: "Valor do atributo (ex: Feminnita, Feminino, Viscose)" },
            },
            required: ["id", "value_name"],
          },
        },
      },
      required: ["itemId", "attributes"],
    },
  },
];

function getMLToken(account = "feminnita"): string {
  return account === "fnt"
    ? (process.env.ML_ACCESS_TOKEN_2 || "")
    : (process.env.ML_ACCESS_TOKEN_1 || "");
}

export async function buildGabiPrompt(account = "feminnita"): Promise<string> {
  const [mlKnowledge, fashionKnowledge, memoryContext] = await Promise.all([
    getLatestKnowledge("knowledge_marketplaces"),
    getLatestKnowledge("knowledge_fashion"),
    buildMemoryContext(AGENT_NAME),
  ]);

  const knowledge = [
    mlKnowledge ? `## Mercado Livre — estado atual\n${mlKnowledge.summary}\nAlertas: ${mlKnowledge.warnings?.join(" | ") || "nenhum"}` : "",
    fashionKnowledge ? `## Tendências de produto/moda\n${fashionKnowledge.summary}` : "",
  ].filter(Boolean).join("\n\n");

  const accountCtx = account === "fnt"
    ? "Conta B — FNT Confecções (atacado B2B, foco em revendedoras)"
    : "Conta A — Feminnita (B2C, consumidor final)";

  const tokenOk = getMLToken(account).length > 10;

  return `Você é Gabi — especialista em ML Ads e EDS (Enhanced Data Sheets / Fichas de Produto) do Mercado Livre para a Feminnita.

Você gerencia duas contas:
- Conta A — Feminnita: marketplace B2C, consumidor final, pijamas femininos
- Conta B — FNT Confecções: atacado B2B, foco em revendedoras

Conta ativa nesta sessão: ${accountCtx}
Conexão ML: ${tokenOk ? "✅ conectada" : "⚠️ token não configurado"}

═══ DOIS MODOS DE TRABALHO — NUNCA MISTURE ═══

Você opera em dois modos distintos. Identifique o contexto da pergunta e fique EXCLUSIVAMENTE naquele modo.

━━━ MODO ANÚNCIOS / EDS ━━━
Ativado quando: usuário fala de anúncio, ficha, atributo, título, EDS, estoque, preço, pausar, ativar
Ferramentas deste modo: ml_list_items, ml_pause_item, ml_activate_item, ml_update_price, ml_update_stock, ml_get_item_details, ml_get_category_attributes, ml_update_item_attributes
→ NÃO mencione campanhas de Ads neste modo

━━━ MODO ADS / CAMPANHAS ━━━
Ativado quando: usuário fala de campanha, Product Ads, budget, CPC, ROAS, CTR, patrocinado, Ads
Ferramentas deste modo: ml_ads_list_campaigns, ml_ads_pause_campaign, ml_ads_activate_campaign, ml_ads_update_budget, ml_ads_campaign_stats
→ NÃO mencione anúncios/EDS neste modo

REGRA DE OURO: Responda apenas o que foi perguntado. Se a pergunta é sobre Ads, fique em Ads. Se é sobre EDS, fique em EDS. Nunca misture os dois temas na mesma resposta sem que o usuário peça explicitamente.

REGRA DE NÃO REPETIÇÃO: Se você já listou anúncios ou campanhas nesta conversa, NÃO liste de novo a não ser que o usuário peça. Use os IDs e nomes já conhecidos. Pergunte "Quer que eu liste novamente?" em vez de relist automaticamente.

FLUXO OBRIGATÓRIO ANTES DE EXECUTAR QUALQUER AÇÃO:
1. Proponha a ação ao usuário com justificativa clara
2. Execute SOMENTE após confirmação explícita ("pode fazer", "vai", "confirma", "sim")
3. Relate o resultado

FORMATO: Texto natural, português BR. NUNCA JSON bruto. Direta e objetiva.

━━━ EXPERTISE EM EDS ━━━

EDS (Enhanced Data Sheets) são as fichas técnicas que o ML exige. Ficha incompleta = menos exposição orgânica, menos Buy Box.

ATRIBUTOS OBRIGATÓRIOS para pijamas:
- Marca, Gênero, Tamanho, Material/Composição, Cor, Tipo de produto, Quantidade de peças

ATRIBUTOS RECOMENDADOS (aumentam score):
- Comprimento da manga/calça, Tipo de tecido, Estampa, Fecho, Linha/Coleção

TÍTULOS (máx 60 chars): [Tipo] [Marca] [Material] [Característica] [Tamanhos]
✅ "Pijama Feminino Feminnita Viscose Long P M G GG"
❌ "Pijama lindo super confortável kit com 2 peças"

CONTA A (Feminnita — B2C): varejo, 1 peça mínima, foco em conversão individual
CONTA B (FNT — B2B): atacado, grade fechada, foco em revendedoras

${knowledge ? `\n━━━ INTELIGÊNCIA ATUAL ━━━\n${knowledge}` : ""}
${memoryContext ? `\n━━━ MEMÓRIA ━━━\n${memoryContext}` : ""}`;
}

export async function chatWithGabi(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  account = "feminnita",
  userName?: string
): Promise<string> {
  const systemPrompt = await buildGabiPrompt(account);
  const nameCtx = userName ? `\nNOME DO USUÁRIO: Chame-o(a) de "${userName}" durante a conversa.` : "";

  const messages: Anthropic.MessageParam[] = history.map(m => ({
    role: m.role,
    content: m.content,
  }));

  let response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2000,
    system: systemPrompt + nameCtx,
    tools: GABI_ML_TOOLS,
    messages,
  });

  // Agentic loop — processa tool calls com limite de segurança
  let iterations = 0;
  while (response.stop_reason === "tool_use" && iterations < 8) {
    iterations++;
    const assistantContent = response.content;
    const toolUses = assistantContent.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUse of toolUses) {
      let result: string;
      try {
        const inp = toolUse.input as Record<string, any>;
        const TOOL_TIMEOUT = 45000;
        let call: Promise<string>;
        if (toolUse.name === "ml_list_items") {
          call = listMLItems(account);
        } else if (toolUse.name === "ml_pause_item") {
          call = pauseMLItem(inp.itemId, account);
        } else if (toolUse.name === "ml_activate_item") {
          call = activateMLItem(inp.itemId, account);
        } else if (toolUse.name === "ml_update_price") {
          call = updateMLPrice(inp.itemId, inp.price, account);
        } else if (toolUse.name === "ml_update_stock") {
          call = updateMLStock(inp.itemId, inp.quantity, account);
        } else if (toolUse.name === "ml_get_item_details") {
          call = getMLItemDetails(inp.itemId, account);
        } else if (toolUse.name === "ml_get_category_attributes") {
          call = getMLCategoryAttributes(inp.categoryId, account);
        } else if (toolUse.name === "ml_update_item_attributes") {
          call = updateMLItemAttributes(inp.itemId, inp.attributes, account);
        } else if (toolUse.name === "ml_ads_list_campaigns") {
          call = listMLAdsCampaigns(account);
        } else if (toolUse.name === "ml_ads_pause_campaign") {
          call = pauseMLAdsCampaign(inp.campaignId, account);
        } else if (toolUse.name === "ml_ads_activate_campaign") {
          call = activateMLAdsCampaign(inp.campaignId, account);
        } else if (toolUse.name === "ml_ads_update_budget") {
          call = updateMLAdsBudget(inp.campaignId, inp.dailyBudget, account);
        } else if (toolUse.name === "ml_ads_campaign_stats") {
          call = getMLAdsCampaignStats(inp.campaignId, inp.dateFrom, inp.dateTo, account);
        } else {
          call = Promise.resolve(`Ferramenta desconhecida: ${toolUse.name}`);
        }
        result = await withTimeout(call, TOOL_TIMEOUT, toolUse.name);
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
      tools: GABI_ML_TOOLS,
      messages,
    });
  }

  const textBlocks = response.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
  let finalText = textBlocks.map(b => b.text).join("\n");

  // Se chegou no limite de iterações sem resposta textual, força uma resposta final
  if (!finalText) {
    const forced = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt + nameCtx,
      messages: [...messages, { role: "assistant", content: response.content }],
    });
    const forcedText = forced.content.filter((b): b is Anthropic.TextBlock => b.type === "text");
    finalText = forcedText.map(b => b.text).join("\n");
  }

  return finalText || "Não consegui processar.";
}

export async function updateGabiKnowledge(): Promise<string> {
  const systemPrompt = await buildGabiPrompt();
  const result = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Gere um resumo semanal sobre EDS e catálogo Mercado Livre para moda. Inclua: mudanças recentes nos requisitos de atributos do ML, melhores práticas de ficha para pijamas/moda feminina, alertas de categorias com novas exigências e recomendações de ação para a próxima semana." },
    ],
    maxTokens: 1500,
  });
  const summary = String(result.choices[0]?.message?.content || "");
  const period = new Date().toISOString().slice(0, 10);
  await saveMemory(AGENT_NAME, "weekly_summary", period, { summary });
  return summary;
}
