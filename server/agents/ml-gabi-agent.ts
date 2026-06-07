/**
 * Gabi — Especialista em ML Ads e EDS Mercado Livre
 * Fichas de produto, anúncios, atributos — Conta A e Conta B
 * Com execução real via API do ML
 */

import Anthropic from "@anthropic-ai/sdk";
import { invokeLLM } from "../_core/llm";
import { buildMemoryContext, saveMemory } from "../services/agentMemory";
import { getLatestKnowledge } from "./knowledge-updater";
import { listMLItems, pauseMLItem, activateMLItem, updateMLPrice, updateMLStock, getMLItemDetails, getMLCategoryAttributes, updateMLItemAttributes, listMLAdsCampaigns, getMLAdsCampaignStats } from "./gabi-executor";
import { runActionsInSession } from "./ml-ads-browser-agent";
import { GABI_ML_DOCTRINE } from "./doctrines/gabi-ml-doctrine";
import { ML_PLATFORM_DOCTRINE } from "./doctrines/ml-platform-doctrine";
import { SEO_MARKETPLACE_DOCTRINE } from "./doctrines/seo-marketplace-doctrine";
import { contextoDaConta } from "./doctrines/feminnita-context";

/**
 * Executa mutação em campanha ML Ads via Playwright (browser).
 * API REST do ML bloqueia writes para contas não-parceiras, então usamos Playwright direto.
 */
async function runAdsMutation(
  account: string,
  actionType: "pause_ads_campaign" | "activate_ads_campaign" | "update_ads_budget",
  campaignId: string,
  campaignName: string,
  budget: number,
): Promise<string> {
  const acc = account as "feminnita" | "fnt";
  try {
    const tempId = Date.now();
    const results = await runActionsInSession(acc, [{
      id: tempId, actionType, campaignId, campaignName, budget,
    }]);
    return results[tempId] ?? "Sem resultado";
  } catch (e: any) {
    return `ERRO: ${e?.message || String(e)}`;
  }
}
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
    name: "ml_ads_create_campaign",
    description: "Cria uma campanha de Product Ads NOVA no Mercado Livre via browser automation. Use quando o usuário pedir para criar/abrir uma nova campanha com lista de anúncios. Execute somente após confirmação explícita.",
    input_schema: {
      type: "object" as const,
      properties: {
        campaignName: { type: "string", description: "Nome da nova campanha (ex: 'INVERNO 2026 - B')" },
        dailyBudget:  { type: "number", description: "Budget diário em R$ (ex: 30)" },
        itemIds:      { type: "array", items: { type: "string" }, description: "IDs dos anúncios MLB a incluir (ex: ['MLB4224885971','MLB4231584799'])" },
        acosTarget:   { type: "number", description: "ACoS alvo em % (opcional — omita para o ML decidir automaticamente)" },
      },
      required: ["campaignName", "dailyBudget", "itemIds"],
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
  {
    name: "ml_get_ficha_conta",
    description: "Lê a FICHA / HISTÓRIA DA CONTA do Mercado Livre por SKU: curva ABC (receita 12 meses), sazonalidade, tendência e MARGEM líquida (= ACoS-teto). É a fonte oficial para decidir o que merece esforço/verba. Use ANTES de qualquer análise de Ads ou recomendação de produto. Dado cacheado no servidor de gestão (análise on-demand, não tempo real).",
    input_schema: {
      type: "object" as const,
      properties: {
        canal: { type: "string", enum: ["ML", "ML B"], description: "Canal: 'ML' (Conta A Feminnita) ou 'ML B' (Conta B FNT). Padrão: ML." },
      },
      required: [],
    },
  },
  {
    name: "ml_review_decisions",
    description: "PLACAR das suas decisões passadas de Ads: compara o ROAS/ACoS de cada campanha ANTES da ação que você executou vs agora, e diz se melhorou/piorou/neutro. É como você aprende com a conta. Use ANTES de propor novas ações numa análise, para replicar o que deu certo e não repetir o que deu errado.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
];

const FICHA_API_BASE = process.env.FICHA_API_BASE || "https://gestao.feminnita.com.br";
const FICHA_API_TOKEN = process.env.FICHA_API_TOKEN || "12da9838b502982ad048b2e6a44b94f55a41753d1ab7f9133a773a941d021971";

/**
 * Busca a ficha/história da conta (curva ABC + margem por SKU) no servidor de gestão
 * e devolve um RESUMO compacto (não o JSON inteiro — são centenas de SKUs).
 */
async function getFichaConta(canal = "ML"): Promise<string> {
  try {
    const url = `${FICHA_API_BASE}/api/rest/ficha-clinica-sku?canal=${encodeURIComponent(canal)}&token=${FICHA_API_TOKEN}`;
    const resp = await withTimeout(fetch(url), 30000, "ficha-conta");
    if (!resp.ok) return `Não consegui ler a ficha da conta (HTTP ${resp.status}). A ficha é gerada sob demanda no servidor de gestão — pode ainda não estar pronta.`;
    const data: any = await resp.json();
    // shape real: { gerado_em, modo, max_data, canal, resumo:{total_skus,receita_12m,curva:{A,B,C},sem_custo}, skus:[{sku,descricao,classe_abc,receita_12m,margem_pct,acos_teto_pct,custo_unit,sem_custo,tendencia,...}] }
    const skus: any[] = Array.isArray(data) ? data : (data.skus || data.fichas || []);
    if (!Array.isArray(skus) || skus.length === 0) {
      return `Ficha da conta (${canal}) ainda vazia ou em geração. Resposta crua: ${JSON.stringify(data).slice(0, 600)}`;
    }
    const num = (v: any) => (typeof v === "number" ? v : Number(v)) || 0;
    const cls = (s: any) => String(s.classe_abc || s.abc || "").toUpperCase();
    const rec = (s: any) => num(s.receita_12m ?? s.receita);
    const mrg = (s: any) => num(s.margem_pct ?? s.acos_teto_pct ?? s.margem_liq_pct);
    const r = data.resumo || {};
    const cnt = r.curva || (() => { const c = { A: 0, B: 0, C: 0 } as Record<string, number>; for (const s of skus) { const k = cls(s); if (c[k] != null) c[k]++; } return c; })();
    const semCusto = r.sem_custo ?? skus.filter(s => s.sem_custo === true).length;
    const topA = [...skus].filter(s => cls(s) === "A").sort((a, b) => rec(b) - rec(a)).slice(0, 12);
    const fmt = (s: any) => `  • ${s.sku || "?"} ${(s.descricao || "").toString().slice(0, 40)} | receita12m R$${rec(s).toFixed(0)} | margem(ACoS-teto) ${s.sem_custo ? "?(sem custo)" : mrg(s).toFixed(1) + "%"} | tend ${s.tendencia || "-"}`;
    const gerado = data.gerado_em || "?";
    return [
      `FICHA DA CONTA — canal ${canal} (gerada: ${gerado}; modo ${data.modo || "?"})`,
      `Total SKUs: ${skus.length} | Curva A: ${cnt.A} · B: ${cnt.B} · C: ${cnt.C}`,
      semCusto > 0 ? `⚠️ ${semCusto} SKUs SEM CUSTO cadastrado → a margem/ACoS-teto desses NÃO é confiável; avise o usuário e baseie decisão de verba só nos que têm custo.` : `Custo cadastrado em todos os SKUs.`,
      `Top A por receita 12m:`,
      ...topA.map(fmt),
      `(Use: margem = ACoS-teto; classe A protege estoque/Full; visita alta + venda baixa = SEO/ficha, não lance.)`,
    ].join("\n");
  } catch (e: any) {
    return `ERRO ao ler a ficha da conta: ${e?.message || String(e)}`;
  }
}

/**
 * PLACAR DAS DECISÕES (loop de feedback, on-demand): para cada ação de Ads que a Gabi
 * executou, compara o ROAS/ACoS da campanha imediatamente ANTES da ação vs o mais recente.
 * Usa só dados existentes (agent_actions + marketplace_ads_metrics) — sem migração nem cron.
 */
async function reviewMlDecisions(account: string): Promise<string> {
  try {
    const db = await getDb();
    if (!db) return "Não consegui acessar o banco de decisões agora.";
    const { eq, and, desc, isNotNull, lte } = await import("drizzle-orm");
    const { marketplaceAdsMetrics } = await import("../../drizzle/schema");

    const acts = await db
      .select({
        title: agentActionsTable.title,
        actionType: agentActionsTable.actionType,
        payload: agentActionsTable.payload,
        executedAt: agentActionsTable.executedAt,
      })
      .from(agentActionsTable)
      .where(and(
        eq(agentActionsTable.agentName, "gabi"),
        eq(agentActionsTable.status, "done"),
        isNotNull(agentActionsTable.executedAt),
      ))
      .orderBy(desc(agentActionsTable.executedAt))
      .limit(25);

    const adsActs = acts.filter(a => {
      const p = a.payload as any;
      return p && (p.platform === "ml") && p.campaignId;
    });
    if (!adsActs.length) {
      return "Ainda não há decisões de Ads executadas para avaliar. O placar começa a valer assim que você aprovar e executar ações (pausar/budget/criar) — aí eu meço o antes×depois de cada uma.";
    }

    const num = (v: any) => Number(v) || 0;
    const lines: string[] = [];
    let win = 0, loss = 0, neutral = 0;
    for (const a of adsActs.slice(0, 12)) {
      const p = a.payload as any;
      const cid = String(p.campaignId);
      const when = a.executedAt as Date;
      const fmtWhen = when ? new Date(when).toISOString().slice(0, 10) : "?";
      const cond = (extra?: any) => and(
        eq(marketplaceAdsMetrics.platform, "ml"),
        eq(marketplaceAdsMetrics.account, account),
        eq(marketplaceAdsMetrics.campaignId, cid),
        ...(extra ? [extra] : []),
      );
      const base = await db.select().from(marketplaceAdsMetrics)
        .where(cond(when ? lte(marketplaceAdsMetrics.scrapedAt, when) : undefined))
        .orderBy(desc(marketplaceAdsMetrics.scrapedAt)).limit(1);
      const cur = await db.select().from(marketplaceAdsMetrics)
        .where(cond()).orderBy(desc(marketplaceAdsMetrics.scrapedAt)).limit(1);
      const b = base[0], c = cur[0];
      const acao = p.action || a.actionType;
      const nome = p.campaignName || cid;
      if (!b || !c) { lines.push(`• ${fmtWhen} ${acao} "${nome}": sem métrica suficiente p/ avaliar ainda.`); continue; }
      const dRoas = num(c.roas) - num(b.roas);
      const verdict = dRoas > 0.1 ? (win++, "✅ melhorou") : dRoas < -0.1 ? (loss++, "❌ piorou") : (neutral++, "➖ neutro");
      lines.push(`• ${fmtWhen} ${acao} "${nome}": ROAS ${num(b.roas).toFixed(2)}→${num(c.roas).toFixed(2)} | ACoS ${num(b.acos).toFixed(0)}%→${num(c.acos).toFixed(0)}% ${verdict}`);
    }
    return `PLACAR DAS SUAS DECISÕES DE ADS (antes × depois — ${win} melhoraram, ${loss} pioraram, ${neutral} neutras):\n${lines.join("\n")}\n(Aprenda: replique o padrão do que melhorou; não repita o tipo de ação que piorou. Lembre que a métrica atualiza a cada 6h.)`;
  } catch (e: any) {
    return `ERRO ao revisar decisões: ${e?.message || String(e)}`;
  }
}

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
    ? "Conta B — FNT Confecções NO MERCADO LIVRE = varejo B2C (consumidor final, por peça). FNT só faz atacado na Tray; no ML é B2C igual à Feminnita."
    : "Conta A — Feminnita (B2C, consumidor final)";

  const tokenOk = getMLToken(account).length > 10;

  return `Você é Gabi — especialista em ML Ads e EDS (Enhanced Data Sheets / Fichas de Produto) do Mercado Livre para a Feminnita.

Você gerencia duas contas:
- Conta A — Feminnita: marketplace B2C, consumidor final, pijamas femininos
- Conta B — FNT Confecções: NO MERCADO LIVRE é B2C (varejo, por peça), MESMO playbook da Feminnita. Atacado da FNT só existe na Tray — não trate a conta B do ML como atacado/revendedoras.

Conta ativa nesta sessão: ${accountCtx}
Conexão ML: ${tokenOk ? "✅ conectada" : "⚠️ token não configurado"}
${contextoDaConta(account)}
${GABI_ML_DOCTRINE}
${ML_PLATFORM_DOCTRINE}
${SEO_MARKETPLACE_DOCTRINE}
═══ DOIS MODOS DE TRABALHO — NUNCA MISTURE ═══

Você opera em dois modos distintos. Identifique o contexto da pergunta e fique EXCLUSIVAMENTE naquele modo.

━━━ MODO ANÚNCIOS / EDS ━━━
Ativado quando: usuário fala de anúncio, ficha, atributo, título, EDS, estoque, preço, pausar, ativar
Ferramentas deste modo: ml_list_items, ml_pause_item, ml_activate_item, ml_update_price, ml_update_stock, ml_get_item_details, ml_get_category_attributes, ml_update_item_attributes
→ NÃO mencione campanhas de Ads neste modo

━━━ MODO ADS / CAMPANHAS ━━━
Ativado quando: usuário fala de campanha, Product Ads, budget, CPC, ROAS, CTR, patrocinado, Ads, métricas
Ferramentas deste modo: ml_get_ficha_conta, ml_review_decisions, ml_get_ads_metrics, ml_ads_list_campaigns, ml_ads_pause_campaign, ml_ads_activate_campaign, ml_ads_update_budget, ml_ads_create_campaign, ml_ads_campaign_stats
SEMPRE comece análise de Ads/produto chamando ml_get_ficha_conta — é a margem (ACoS-teto) e a curva ABC que dizem o que merece verba. E chame ml_review_decisions para ver o PLACAR do que suas ações anteriores geraram (aprender com a conta).
REGRA CRÍTICA: A API do ML bloqueia métricas diretamente. USE SEMPRE ml_get_ads_metrics PRIMEIRO — esses dados são reais, coletados via browser a cada 6h. Se retornar vazio, informe que o agente está coletando e use ml_ads_list_campaigns para estrutura.
REGRA: Você PODE criar, pausar, ativar e ajustar budget de campanhas via browser automation. NUNCA diga "não consigo pela API" — use as ferramentas ml_ads_*.
→ NÃO mencione anúncios/EDS neste modo

REGRA DE OURO: Responda apenas o que foi perguntado. Se a pergunta é sobre Ads, fique em Ads. Se é sobre EDS, fique em EDS. Nunca misture os dois temas na mesma resposta sem que o usuário peça explicitamente.

REGRA DE NÃO REPETIÇÃO: Se você já listou anúncios ou campanhas nesta conversa, NÃO liste de novo a não ser que o usuário peça. Use os IDs e nomes já conhecidos. Pergunte "Quer que eu liste novamente?" em vez de relist automaticamente.

FLUXO OBRIGATÓRIO ANTES DE EXECUTAR QUALQUER AÇÃO DIRETA:
1. Proponha a ação ao usuário com justificativa clara
2. Execute SOMENTE após confirmação explícita ("pode fazer", "vai", "confirma", "sim")
3. Relate o resultado

━━━ ANÁLISE COMPLETA + PROPOSTA DE AÇÕES ━━━
Quando o usuário pedir "análise completa", "auditoria", "proponha ações" ou similar:
1. Chame ml_get_ficha_conta (margem/ACoS-teto + curva ABC), ml_review_decisions (placar do que já fez) E ml_ads_list_campaigns para listar TODAS as campanhas
2. Analise a estrutura: budgets vs. ROAS alvo, campanhas dormentes, ACoS acima do ACoS-teto (margem) do SKU, fragmentação de orçamento, verba em produto C/sem margem, e o que o placar mostrou que piorou/melhorou
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
CONTA B (FNT no ML — B2C/varejo): por peça, consumidor final, MESMO playbook da Feminnita. Atacado da FNT existe só na Tray — nunca tratar a conta B do ML como atacado/revendedoras.

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
        const TOOL_TIMEOUT = 90000;
        let call: Promise<string>;
        // Helper: salva ação na fila do Playwright quando a API falha
        // Ações de Ads ML executam automaticamente via Playwright (sem aprovação manual)
        const queueAdsAction = async (actionType: string, title: string, payload: Record<string, any>): Promise<string> => {
          const db = await getDb();
          if (!db) throw new Error("DB indisponível");
          await db.insert(agentActionsTable).values({
            agentName: "gabi",
            date: new Date().toISOString().slice(0, 10),
            title,
            description: title,
            actionType,
            priority: "media",
            status: "approved" as const,
            payload: { platform: "ml", account, action: actionType, ...payload },
          });
          return `Executando "${title}" via browser automation no painel ML Ads — será concluído em até 5 minutos.`;
        };

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
          call = (async (): Promise<string> => {
            const log = await runAdsMutation(account, "pause_ads_campaign",
              String(inp.campaignId || ""), String(inp.campaignName || ""), 0);
            const isError = log.startsWith("ERRO:") || log.includes("não encontrada") || log.includes("não encontrado");
            const db = await getDb();
            if (db) await db.insert(agentActionsTable).values({
              agentName: "gabi", date: new Date().toISOString().slice(0, 10),
              title: `Pausar campanha ${inp.campaignName || inp.campaignId}`,
              description: `Pausar campanha ${inp.campaignName || inp.campaignId}`,
              actionType: "pause_ads_campaign", priority: "media",
              status: (isError ? "pending" : "done") as const,
              payload: { platform: "ml", account, action: "pause_ads_campaign", campaignId: String(inp.campaignId || ""), campaignName: String(inp.campaignName || "") },
              executionLog: log, ...(isError ? {} : { executedAt: new Date() }),
            });
            return `${isError ? "❌" : "✅"} ${inp.campaignName || inp.campaignId}: ${log}`;
          })();
        } else if (toolUse.name === "ml_ads_activate_campaign") {
          call = (async (): Promise<string> => {
            const log = await runAdsMutation(account, "activate_ads_campaign",
              String(inp.campaignId || ""), String(inp.campaignName || ""), 0);
            const isError = log.startsWith("ERRO:") || log.includes("não encontrada") || log.includes("não encontrado");
            const db = await getDb();
            if (db) await db.insert(agentActionsTable).values({
              agentName: "gabi", date: new Date().toISOString().slice(0, 10),
              title: `Ativar campanha ${inp.campaignName || inp.campaignId}`,
              description: `Ativar campanha ${inp.campaignName || inp.campaignId}`,
              actionType: "activate_ads_campaign", priority: "media",
              status: (isError ? "pending" : "done") as const,
              payload: { platform: "ml", account, action: "activate_ads_campaign", campaignId: String(inp.campaignId || ""), campaignName: String(inp.campaignName || "") },
              executionLog: log, ...(isError ? {} : { executedAt: new Date() }),
            });
            return `${isError ? "❌" : "✅"} ${inp.campaignName || inp.campaignId}: ${log}`;
          })();
        } else if (toolUse.name === "ml_ads_update_budget") {
          call = (async (): Promise<string> => {
            const log = await runAdsMutation(account, "update_ads_budget",
              String(inp.campaignId || ""), String(inp.campaignName || ""), Number(inp.dailyBudget || 0));
            const isError = log.startsWith("ERRO:") || log.includes("não encontrada") || log.includes("não encontrado");
            const db = await getDb();
            if (db) await db.insert(agentActionsTable).values({
              agentName: "gabi", date: new Date().toISOString().slice(0, 10),
              title: `Atualizar orçamento ${inp.campaignName || inp.campaignId} → R$${inp.dailyBudget}/dia`,
              description: `Atualizar orçamento ${inp.campaignName || inp.campaignId} → R$${inp.dailyBudget}/dia`,
              actionType: "update_ads_budget", priority: "media",
              status: (isError ? "pending" : "done") as const,
              payload: { platform: "ml", account, action: "update_ads_budget", campaignId: String(inp.campaignId || ""), campaignName: String(inp.campaignName || ""), budget: Number(inp.dailyBudget || 0) },
              executionLog: log, ...(isError ? {} : { executedAt: new Date() }),
            });
            return `${isError ? "❌" : "✅"} ${inp.campaignName || inp.campaignId}: ${log}`;
          })();
        } else if (toolUse.name === "ml_ads_campaign_stats") {
          call = getMLAdsCampaignStats(inp.campaignId, inp.dateFrom, inp.dateTo, account);
        } else if (toolUse.name === "ml_ads_create_campaign") {
          call = (async (): Promise<string> => {
            const acc = account as "feminnita" | "fnt";
            const name = String(inp.campaignName || "").trim();
            const budget = Number(inp.dailyBudget || 0);
            const items = Array.isArray(inp.itemIds) ? (inp.itemIds as any[]).map(x => String(x).trim()).filter(Boolean) : [];
            const acos = typeof inp.acosTarget === "number" ? Number(inp.acosTarget) : undefined;
            let log: string;
            try {
              const tempId = Date.now();
              const results = await runActionsInSession(acc, [{
                id: tempId, actionType: "create_ads_campaign", campaignId: "", campaignName: name,
                budget, itemIds: items, acosTarget: acos,
              }]);
              log = results[tempId] ?? "Sem resultado";
            } catch (e: any) {
              log = `ERRO: ${e?.message || String(e)}`;
            }
            const isError = log.startsWith("ERRO:") || log.startsWith("❌");
            const db = await getDb();
            if (db) await db.insert(agentActionsTable).values({
              agentName: "gabi", date: new Date().toISOString().slice(0, 10),
              title: `Criar campanha "${name}" — R$${budget}/dia, ${items.length} anúncios`,
              description: `Criar campanha "${name}" com ${items.length} anúncios — R$${budget}/dia${acos ? ` — ACoS alvo ${acos}%` : ""}`,
              actionType: "create_ads_campaign", priority: "media",
              status: (isError ? "pending" : "done") as const,
              payload: { platform: "ml", account, action: "create_ads_campaign", campaignName: name, budget, itemIds: items, acosTarget: acos },
              executionLog: log, ...(isError ? {} : { executedAt: new Date() }),
            });
            return `${isError ? "❌" : "✅"} ${name}: ${log}`;
          })();
        } else if (toolUse.name === "ml_get_ficha_conta") {
          call = getFichaConta(inp.canal || (account === "fnt" ? "ML B" : "ML"));
        } else if (toolUse.name === "ml_review_decisions") {
          call = reviewMlDecisions(account);
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
          const ADS_ACTION_TYPES = ["pause_ads_campaign", "activate_ads_campaign", "update_ads_budget"];
          call = (async (): Promise<string> => {
            const db = await getDb();
            if (!db) return "Banco indisponível.";
            const { or } = await import("drizzle-orm");
            const allPending = await db.select().from(agentActionsTable)
              .where(and(
                eq(agentActionsTable.agentName, "gabi"),
                or(
                  eq(agentActionsTable.status, "pending"),
                  eq(agentActionsTable.status, "approved"),
                ),
              ));
            const adsActions = allPending.filter(a =>
              ADS_ACTION_TYPES.includes(String((a.payload as any)?.action || a.actionType))
            );
            if (adsActions.length === 0) return "Nenhuma ação de Ads ML pendente. Use propose_ads_actions para criar as ações antes de executar.";

            // Marca como approved para o MLExecutor executar em background (evita timeout no chat)
            for (const a of adsActions) {
              await db.update(agentActionsTable)
                .set({ status: "approved" as const })
                .where(eq(agentActionsTable.id, a.id));
            }

            const names = adsActions.map(a => a.title || a.actionType).join(", ");
            return `${adsActions.length} ação(ões) enfileirada(s) para execução via browser automation: ${names}.\n\nO agente vai executar no painel ML Ads em até 5 minutos. Acompanhe o resultado em /acoes-agentes.`;
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
