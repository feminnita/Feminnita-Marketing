/**
 * Gabi — Especialista em ML Ads e EDS Mercado Livre
 * Fichas de produto, anúncios, atributos — Conta A e Conta B
 * Com execução real via API do ML
 */

import Anthropic from "@anthropic-ai/sdk";
import { invokeLLM } from "../_core/llm";
import { buildMemoryContext, saveMemory } from "../services/agentMemory";
import { getLatestKnowledge } from "./knowledge-updater";
import { listMLItems, pauseMLItem, activateMLItem, updateMLPrice, updateMLStock } from "./gabi-executor";

const AGENT_NAME = "gabi";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

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

═══ O QUE VOCÊ PODE FAZER NESTE CHAT ═══
Você analisa E executa ações diretamente no Mercado Livre.

FERRAMENTAS DISPONÍVEIS:
- ml_list_items: lista anúncios com ID, status, preço e estoque da conta ativa
- ml_pause_item: pausa um anúncio (requer confirmação do usuário)
- ml_activate_item: reativa um anúncio pausado (requer confirmação)
- ml_update_price: atualiza preço de um anúncio (requer confirmação)
- ml_update_stock: atualiza estoque de um anúncio (requer confirmação)

FLUXO OBRIGATÓRIO ANTES DE EXECUTAR:
1. Use ml_list_items para ver os anúncios e IDs reais
2. Analise e proponha a ação ao usuário com justificativa clara
3. Execute SOMENTE após o usuário confirmar ("pode fazer", "vai", "confirma", "sim")
4. Relate o resultado da execução

FORMATO: SEMPRE responda em texto natural, português BR. NUNCA retorne JSON bruto. Seja direta e objetiva.

━━━ EXPERTISE EM EDS ━━━

EDS (Enhanced Data Sheets) são as fichas técnicas estruturadas que o ML exige. Ficha incompleta = menos exposição orgânica, menos Buy Box, mais restrições.

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

  // Agentic loop — processa tool calls até o agente parar
  while (response.stop_reason === "tool_use") {
    const assistantContent = response.content;
    const toolUses = assistantContent.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUse of toolUses) {
      let result: string;
      try {
        const inp = toolUse.input as Record<string, any>;
        if (toolUse.name === "ml_list_items") {
          result = await listMLItems(account);
        } else if (toolUse.name === "ml_pause_item") {
          result = await pauseMLItem(inp.itemId, account);
        } else if (toolUse.name === "ml_activate_item") {
          result = await activateMLItem(inp.itemId, account);
        } else if (toolUse.name === "ml_update_price") {
          result = await updateMLPrice(inp.itemId, inp.price, account);
        } else if (toolUse.name === "ml_update_stock") {
          result = await updateMLStock(inp.itemId, inp.quantity, account);
        } else {
          result = `Ferramenta desconhecida: ${toolUse.name}`;
        }
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
  return textBlocks.map(b => b.text).join("\n") || "Não consegui processar.";
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
