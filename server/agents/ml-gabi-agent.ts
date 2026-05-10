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
import { getDb } from "../db";
import { agentActions as agentActionsTable } from "../../drizzle/schema";
import { desc, eq, and, isNotNull } from "drizzle-orm";

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
    name: "propose_ads_actions",
    description: "Salva uma lista de ações recomendadas no painel de aprovação (/acoes-agentes). Use SEMPRE após analisar campanhas para registrar suas recomendações. O usuário revisa e aprova antes da execução.",
    input_schema: {
      type: "object" as const,
      properties: {
        actions: {
          type: "array",
          description: "Ações recomendadas",
          items: {
            type: "object",
            properties: {
              title:         { type: "string", description: "Título curto da ação (ex: 'Aumentar budget — INVERNO 2026')" },
              actionType:    { type: "string", description: "ml_pause_campaign | ml_activate_campaign | ml_update_budget" },
              campaignId:    { type: "string", description: "ID da campanha (número)" },
              campaignName:  { type: "string", description: "Nome legível da campanha" },
              currentValue:  { type: "string", description: "Situação atual (ex: 'budget: R$40, ACoS alvo: 7.69%')" },
              proposedValue: { type: "string", description: "Valor proposto para a ação (ex: 'R$60' ou 'paused')" },
              reason:        { type: "string", description: "Justificativa técnica" },
              priority:      { type: "string", enum: ["alta", "media", "baixa"] },
            },
            required: ["title", "actionType", "campaignId", "currentValue", "proposedValue", "reason"],
          },
        },
      },
      required: ["actions"],
    },
  },
  {
    name: "ml_get_ads_metrics",
    description: "Lê métricas REAIS de campanhas de Ads coletadas via browser pelo agente Playwright (impressões, cliques, CTR, gasto, ROAS, ACoS, conversões, receita). Dados atualizados automaticamente a cada 6h. Use SEMPRE que precisar analisar performance de campanhas — estes dados substituem os dados bloqueados da API.",
    input_schema: {
      type: "object" as const,
      properties: {
        account: { type: "string", enum: ["feminnita", "fnt"], description: "Conta ML a consultar (padrão: feminnita)" },
        platform: { type: "string", enum: ["ml", "shopee", "amazon"], description: "Plataforma (padrão: ml)" },
      },
      required: [],
    },
  },
  {
    name: "execute_pending_actions",
    description: "Executa imediatamente todas as ações pendentes que você propôs via propose_ads_actions. Use quando o usuário disser 'pode executar', 'autorizo', 'pode continuar', 'confirmo', 'faz isso', 'vai lá' ou qualquer frase de aprovação. Não peça confirmação adicional.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
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
  const db = await getDb();

  const [mlKnowledge, fashionKnowledge, memoryContext] = await Promise.all([
    getLatestKnowledge("knowledge_marketplaces"),
    getLatestKnowledge("knowledge_fashion"),
    buildMemoryContext(AGENT_NAME),
  ]);

  // Histórico de execuções reais do agente Playwright (últimas 30 ações concluídas)
  let executionHistory = "";
  try {
    if (db) {
      const recent = await db
        .select({
          title: agentActionsTable.title,
          executionLog: agentActionsTable.executionLog,
          executedAt: agentActionsTable.executedAt,
          actionType: agentActionsTable.actionType,
        })
        .from(agentActionsTable)
        .where(and(
          eq(agentActionsTable.agentName, "gabi"),
          eq(agentActionsTable.status, "done"),
          isNotNull(agentActionsTable.executedAt)
        ))
        .orderBy(desc(agentActionsTable.executedAt))
        .limit(30);

      if (recent.length > 0) {
        const lines = recent.map(r => {
          const when = r.executedAt ? r.executedAt.toISOString().slice(0, 16).replace("T", " ") : "?";
          return `- [${when}] ${r.title || r.actionType}: ${r.executionLog || "sem log"}`;
        });
        executionHistory = `\n━━━ AÇÕES JÁ EXECUTADAS PELO AGENTE PLAYWRIGHT ━━━\nAs ações abaixo foram executadas com sucesso. NÃO as proponha novamente.\n${lines.join("\n")}`;
      }
    }
  } catch { /* não crítico */ }

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
Ativado quando: usuário fala de campanha, Product Ads, budget, CPC, ROAS, CTR, patrocinado, Ads, métricas
Ferramentas deste modo: ml_get_ads_metrics, ml_ads_list_campaigns, ml_ads_pause_campaign, ml_ads_activate_campaign, ml_ads_update_budget, ml_ads_campaign_stats
REGRA CRÍTICA: A API do ML bloqueia métricas diretamente. USE SEMPRE ml_get_ads_metrics PRIMEIRO — esses dados são reais, coletados via browser a cada 6h. Se retornar vazio, informe que o agente está coletando e use ml_ads_list_campaigns para estrutura.
→ NÃO mencione anúncios/EDS neste modo

REGRA DE OURO: Responda apenas o que foi perguntado. Se a pergunta é sobre Ads, fique em Ads. Se é sobre EDS, fique em EDS. Nunca misture os dois temas na mesma resposta sem que o usuário peça explicitamente.

REGRA DE NÃO REPETIÇÃO: Se você já listou anúncios ou campanhas nesta conversa, NÃO liste de novo a não ser que o usuário peça. Use os IDs e nomes já conhecidos. Pergunte "Quer que eu liste novamente?" em vez de relist automaticamente.

FLUXO OBRIGATÓRIO ANTES DE EXECUTAR QUALQUER AÇÃO DIRETA:
1. Proponha a ação ao usuário com justificativa clara
2. Execute SOMENTE após confirmação explícita ("pode fazer", "vai", "confirma", "sim")
3. Relate o resultado

━━━ ANÁLISE COMPLETA + PROPOSTA DE AÇÕES ━━━
Quando o usuário pedir "análise completa", "auditoria", "proponha ações" ou similar:
1. Chame ml_ads_list_campaigns para listar TODAS as campanhas
2. Analise a estrutura: budgets vs. ROAS alvo, campanhas dormentes, ACoS inconsistentes, fragmentação de orçamento
3. Monte ações concretas e chame propose_ads_actions com todas as recomendações
4. Após salvar, resuma o que foi proposto e diga: "Suas X ações estão em /acoes-agentes aguardando aprovação."
REGRA CRÍTICA: Durante análise, NUNCA execute diretamente — use sempre propose_ads_actions

FORMATO: Texto natural, português BR. NUNCA JSON bruto. Direta e objetiva.

REGRA CRÍTICA — EXECUÇÃO vs MÉTRICAS:
→ Os dados de ml_get_ads_metrics são coletados automaticamente a cada 6 horas pelo sistema. Eles NÃO atualizam em tempo real.
→ Após executar ações via execute_pending_actions, os dados no banco continuarão mostrando os valores antigos até a próxima coleta (próximas 6h). Isso é NORMAL.
→ NUNCA use a ausência de mudança nos dados do banco para concluir que a execução falhou. Confie no resultado retornado pelo execute_pending_actions (✅ ou ❌).
→ Após execute: relate ao usuário o resultado exato retornado (sucesso ou erro de cada campanha). Não chame ml_get_ads_metrics logo depois para "verificar" — é perda de tempo.

FLUXO OBRIGATÓRIO PARA EXECUTAR AÇÕES:
1. Primeiro chame ml_get_ads_metrics para obter os dados atuais
2. Analise e chame propose_ads_actions para salvar as ações propostas
3. Aguarde o usuário dizer "pode executar", "autorizo", "vai" ou similar
4. Então chame execute_pending_actions — ele abre o browser e executa no painel do ML
5. Relate o resultado ao usuário (sucesso/erro por campanha)
Se o usuário pedir "execute" sem que haja ações propostas nesta conversa: explique que precisa analisar primeiro e proponha as ações antes de executar.

━━━ LINGUAGEM — REGRA FUNDAMENTAL ━━━
Fale como se a pessoa não soubesse nada de marketing digital ou ads. Nunca use jargão sem explicar. Sempre que um termo técnico aparecer, traduza em seguida entre parênteses.
→ "budget" → escreva "orçamento diário"
→ "ROAS" → explique: "retorno sobre o investimento — ex: ROAS 3x significa que cada R$1 investido trouxe R$3 em vendas"
→ "ACoS" → explique: "custo de anúncio sobre a venda — ex: ACoS 30% significa que gastou R$30 em anúncio para vender R$100"
→ "CTR" → explique: "taxa de cliques — de cada 100 pessoas que viram o anúncio, X clicaram"
→ "impressões" → "quantas vezes o anúncio apareceu na tela"
→ "conversão" → "venda concretizada"
→ "bid" → "lance (valor pago por clique)"
→ "CPC" → "custo por clique (quanto cada clique no anúncio está custando)"
→ Use "anúncio" em vez de "ad". Use "orçamento" em vez de "budget". Use "palavra-chave" em vez de "keyword".
→ Se a análise for técnica, resuma em linguagem simples logo depois. Exemplo: "O ACoS está em 45% (ou seja, você está gastando R$45 em anúncio para cada R$100 vendido — o ideal seria abaixo de 30%)."

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
${memoryContext ? `\n━━━ MEMÓRIA ━━━\n${memoryContext}` : ""}
${executionHistory}`;
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
        // Helper: salva ação na fila do Playwright quando a API falha
        const queueAction = async (actionType: string, title: string, payload: Record<string, any>): Promise<string> => {
          const db = await getDb();
          if (!db) throw new Error("DB indisponível");
          await db.insert(agentActionsTable).values({
            agentName: "gabi",
            date: new Date().toISOString().slice(0, 10),
            title,
            description: title,
            actionType,
            priority: "media",
            status: "pending" as const,
            payload: { platform: "ml", account, action: actionType, ...payload },
          });
          return `Ação "${title}" salva para aprovação. Acesse /acoes-agentes para aprovar — o agente Playwright executará via browser.`;
        };

        if (toolUse.name === "ml_list_items") {
          call = listMLItems(account);
        } else if (toolUse.name === "ml_pause_item") {
          call = pauseMLItem(inp.itemId, account).catch(() =>
            queueAction("pause_item", `Pausar anúncio ${inp.itemTitle || inp.itemId}`, { itemId: inp.itemId, itemTitle: inp.itemTitle || "" })
          );
        } else if (toolUse.name === "ml_activate_item") {
          call = activateMLItem(inp.itemId, account).catch(() =>
            queueAction("activate_item", `Reativar anúncio ${inp.itemTitle || inp.itemId}`, { itemId: inp.itemId, itemTitle: inp.itemTitle || "" })
          );
        } else if (toolUse.name === "ml_update_price") {
          call = updateMLPrice(inp.itemId, inp.price, account).catch(() =>
            queueAction("update_price", `Atualizar preço de ${inp.itemTitle || inp.itemId} para R$${inp.price}`, { itemId: inp.itemId, itemTitle: inp.itemTitle || "", price: inp.price })
          );
        } else if (toolUse.name === "ml_update_stock") {
          call = updateMLStock(inp.itemId, inp.quantity, account).catch(() =>
            queueAction("update_stock", `Atualizar estoque de ${inp.itemTitle || inp.itemId} para ${inp.quantity}`, { itemId: inp.itemId, itemTitle: inp.itemTitle || "", quantity: inp.quantity })
          );
        } else if (toolUse.name === "ml_get_item_details") {
          call = getMLItemDetails(inp.itemId, account);
        } else if (toolUse.name === "ml_get_category_attributes") {
          call = getMLCategoryAttributes(inp.categoryId, account);
        } else if (toolUse.name === "ml_update_item_attributes") {
          call = updateMLItemAttributes(inp.itemId, inp.attributes, account).catch(() =>
            queueAction("update_item_attributes", `Atualizar atributos do anúncio ${inp.itemId}`, { itemId: inp.itemId, attributes: inp.attributes })
          );
        } else if (toolUse.name === "ml_ads_list_campaigns") {
          call = listMLAdsCampaigns(account);
        } else if (toolUse.name === "ml_ads_pause_campaign") {
          call = pauseMLAdsCampaign(inp.campaignId, account).catch(() =>
            queueAction("pause_ads_campaign", `Pausar campanha ${inp.campaignName || inp.campaignId}`, { campaignId: inp.campaignId, campaignName: inp.campaignName || "" })
          );
        } else if (toolUse.name === "ml_ads_activate_campaign") {
          call = activateMLAdsCampaign(inp.campaignId, account).catch(() =>
            queueAction("activate_ads_campaign", `Ativar campanha ${inp.campaignName || inp.campaignId}`, { campaignId: inp.campaignId, campaignName: inp.campaignName || "" })
          );
        } else if (toolUse.name === "ml_ads_update_budget") {
          call = updateMLAdsBudget(inp.campaignId, inp.dailyBudget, account).catch(() =>
            queueAction("update_ads_budget", `Atualizar orçamento campanha ${inp.campaignId} para R$${inp.dailyBudget}/dia`, { campaignId: inp.campaignId, budget: inp.dailyBudget })
          );
        } else if (toolUse.name === "ml_ads_campaign_stats") {
          call = getMLAdsCampaignStats(inp.campaignId, inp.dateFrom, inp.dateTo, account);
        } else if (toolUse.name === "ml_get_ads_metrics") {
          call = (async (): Promise<string> => {
            const db = await getDb();
            if (!db) throw new Error("DB indisponível");
            const { eq, and, desc } = await import("drizzle-orm");
            const { marketplaceAdsMetrics } = await import("../../drizzle/schema");
            const targetPlatform = (inp.platform || "ml") as string;
            const targetAccount  = (inp.account  || account) as string;

            const rows = await db
              .select()
              .from(marketplaceAdsMetrics)
              .where(and(
                eq(marketplaceAdsMetrics.platform, targetPlatform),
                eq(marketplaceAdsMetrics.account, targetAccount),
              ))
              .orderBy(desc(marketplaceAdsMetrics.scrapedAt))
              .limit(200);

            // Sem dados — verificar se já há coleta em andamento antes de criar nova
            if (!rows.length) {
              const { or } = await import("drizzle-orm");
              const pending = await db
                .select({ id: agentActionsTable.id })
                .from(agentActionsTable)
                .where(and(
                  eq(agentActionsTable.actionType, "scrape_ads_metrics"),
                  or(
                    eq(agentActionsTable.status, "approved"),
                    eq(agentActionsTable.status, "executing"),
                    eq(agentActionsTable.status, "pending"),
                  ),
                ))
                .limit(1);
              if (!pending.length) {
                await db.insert(agentActionsTable).values({
                  agentName: AGENT_NAME,
                  date: new Date().toISOString().slice(0, 10),
                  title: `Coletar métricas ${targetPlatform.toUpperCase()} — ${targetAccount}`,
                  description: `Solicitado por Gabi: scraping de métricas de Ads do ${targetPlatform}`,
                  actionType: "scrape_ads_metrics",
                  priority: "alta" as const,
                  status: "approved" as const,
                  payload: { platform: targetPlatform, account: targetAccount },
                });
                return `Ainda não há métricas de ${targetPlatform.toUpperCase()}/${targetAccount} no banco. Solicitei a coleta ao agente Playwright — em 2–3 minutos os dados estarão disponíveis. Peça para eu buscar novamente.`;
              }
              return `O agente Playwright já está coletando métricas de ${targetPlatform.toUpperCase()}/${targetAccount}. Aguarde 2–3 minutos e peça novamente.`;
            }

            // Deduplicar: manter apenas registro mais recente por campanha
            const seen = new Set<string>();
            const latest = rows.filter((r: typeof rows[number]) => {
              if (seen.has(r.campaignId)) return false;
              seen.add(r.campaignId);
              return true;
            });
            const scrapedAt = latest[0]?.scrapedAt?.toISOString().slice(0, 16) ?? "desconhecido";
            const totalSpend = latest.reduce((s: number, r: typeof rows[number]) => s + Number(r.spend || 0), 0);
            const totalRev   = latest.reduce((s: number, r: typeof rows[number]) => s + Number(r.revenue || 0), 0);
            const lines = latest.map((r: typeof rows[number]) =>
              `- [${r.campaignId}] ${r.campaignName || "–"} | impressões=${r.impressions} cliques=${r.clicks} CTR=${r.ctr}% gasto=R$${Number(r.spend).toFixed(2)} receita=R$${Number(r.revenue).toFixed(2)} ROAS=${r.roas} ACoS=${r.acos}% conversões=${r.conversions}`
            );
            return `Métricas ${targetPlatform.toUpperCase()} — conta=${targetAccount} (coletadas em ${scrapedAt})\n\nTotal: ${latest.length} campanhas | Gasto total=R$${totalSpend.toFixed(2)} | Receita total=R$${totalRev.toFixed(2)}\n\n${lines.join("\n")}`;
          })();
        } else if (toolUse.name === "execute_pending_actions") {
          call = (async (): Promise<string> => {
            const db = await getDb();
            if (!db) return "Banco indisponível.";
            const { eq, and } = await import("drizzle-orm");
            const { pauseAdsCampaign, activateAdsCampaign, updateAdsBudget } = await import("./ml-ads-browser-agent");
            const pending = await db.select().from(agentActionsTable)
              .where(and(eq(agentActionsTable.agentName, "gabi"), eq(agentActionsTable.status, "pending")));
            console.log(`[GabiExecute] Iniciando execução de ${pending.length} ação(ões) pendentes`);
            if (pending.length === 0) return "Nenhuma ação pendente encontrada. Use propose_ads_actions primeiro para criar ações, então peça para executar.";
            const results: string[] = [];
            for (const action of pending) {
              console.log(`[GabiExecute] Processando ação id=${action.id} tipo=${action.actionType} title="${action.title}"`);
              try {
                const payload = action.payload as any;
                if (!payload) {
                  console.warn(`[GabiExecute] Ação id=${action.id} sem payload — pulando`);
                  results.push(`⚠️ ${action.title}: sem payload`);
                  continue;
                }
                const campaignId   = String(payload.campaignId   || "");
                const campaignName = String(payload.campaignName || "");
                const acc = (payload.account || account) as "feminnita" | "fnt";
                console.log(`[GabiExecute] payload.action="${payload.action}" campaignId="${campaignId}" campaignName="${campaignName}" acc="${acc}"`);
                await db.update(agentActionsTable).set({ status: "executing" as const }).where(eq(agentActionsTable.id, action.id));
                let res: string;
                switch (payload.action) {
                  case "pause_ads_campaign":    res = await pauseAdsCampaign(campaignId, acc, campaignName); break;
                  case "activate_ads_campaign": res = await activateAdsCampaign(campaignId, acc, campaignName); break;
                  case "update_ads_budget":     res = await updateAdsBudget(campaignId, Number(payload.budget || 0), acc, campaignName); break;
                  default:
                    console.warn(`[GabiExecute] Tipo desconhecido: "${payload.action}" para ação id=${action.id}`);
                    results.push(`⚠️ ${action.title}: tipo desconhecido (${payload.action})`);
                    await db.update(agentActionsTable).set({ status: "pending" as const }).where(eq(agentActionsTable.id, action.id));
                    continue;
                }
                console.log(`[GabiExecute] ✅ Ação id=${action.id} concluída: ${res}`);
                await db.update(agentActionsTable).set({ status: "done" as const, executedAt: new Date(), executionLog: res } as any).where(eq(agentActionsTable.id, action.id));
                results.push(`✅ ${action.title}: ${res}`);
              } catch (e: any) {
                console.error(`[GabiExecute] ❌ Erro na ação id=${action.id} "${action.title}": ${e.message}`, e.stack);
                await db.update(agentActionsTable).set({ status: "pending" as const, executionLog: `ERRO: ${e.message}` } as any).where(eq(agentActionsTable.id, action.id));
                results.push(`❌ ${action.title}: ${e.message}`);
              }
            }
            console.log(`[GabiExecute] Execução finalizada. Resultados: ${results.join(" | ")}`);
            return `Execução concluída (${pending.length} ação(ões)):\n${results.join("\n")}`;
          })();
        } else if (toolUse.name === "propose_ads_actions") {
          call = (async (): Promise<string> => {
            const db = await getDb();
            const today = new Date().toISOString().slice(0, 10);
            // Mapeia actionType do agente para o nome de ação do executor Playwright
            const actionMap: Record<string, string> = {
              ml_update_budget:      "update_ads_budget",
              ml_pause_campaign:     "pause_ads_campaign",
              ml_activate_campaign:  "activate_ads_campaign",
              update_ads_budget:     "update_ads_budget",
              pause_ads_campaign:    "pause_ads_campaign",
              activate_ads_campaign: "activate_ads_campaign",
            };
            const rows = ((inp.actions as any[]) || []).map((a: any) => {
              const playwrightAction = actionMap[String(a.actionType || "")] || String(a.actionType || "update_ads_budget");
              const payload = {
                platform: "ml",
                account,
                action: playwrightAction,
                campaignId:   String(a.campaignId   || ""),
                campaignName: String(a.campaignName || ""),
                budget: a.proposedValue ? Number(String(a.proposedValue).replace(/[^0-9.]/g, "")) : undefined,
              };
              return {
                agentName: "gabi",
                date: today,
                title: String(a.title || ""),
                description: `${String(a.campaignName || "")} — ${String(a.currentValue || "")} → ${String(a.proposedValue || "")}`,
                actionType: playwrightAction,
                priority: (["alta", "media", "baixa"].includes(a.priority) ? a.priority : "media") as "alta" | "media" | "baixa",
                estimatedImpact: String(a.reason || ""),
                status: "pending" as const,
                payload,
              };
            });
            if (db && rows.length > 0) await db.insert(agentActionsTable).values(rows);
            return `${rows.length} ação(ões) propostas salvas. Para executar: diga "pode continuar" ou "autorizo" aqui mesmo, ou acesse /acoes-agentes para revisar primeiro.`;
          })();
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
