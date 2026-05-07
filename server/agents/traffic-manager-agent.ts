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
  fetchMetaInsightsWithBreakdown,
  fetchMetaAdsData,
  fetchMetaAds,
  pauseAd,
  resumeAd,
  duplicateCampaign,
  swapUrlTags,
} from "../services/meta-ads-service";
import { buildMemoryContext } from "../services/agentMemory";
import { getDb } from "../db";
import { adCreatives } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { executeMetaAction } from "./fernanda-executor";

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
    | "publish_creative"
    | "custom";
  target_id?: string;
  target_name?: string;
  reason: string;
  urgency: "alta" | "media" | "baixa";
  expected_impact?: string;
  custom_description?: string;
  creative_id?: number;
  adset_id?: string;
  campaign_id?: string;
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
  {
    name: "get_meta_ads",
    description:
      "Busca os anúncios (ads) individuais com detalhes do criativo: thumbnail, imagem, copy (body/title), URL de destino (landing page), CTA e métricas de performance. Use SEMPRE que precisar ver criativos, copys, landing pages ou URLs dos anúncios. Nunca peça ao usuário para tirar print — use esta ferramenta.",
    input_schema: {
      type: "object" as const,
      properties: {
        adset_id: {
          type: "string",
          description: "ID do adset para filtrar anúncios daquele conjunto (opcional)",
        },
        campaign_id: {
          type: "string",
          description: "ID da campanha para filtrar anúncios daquela campanha (opcional)",
        },
      },
      required: [],
    },
  },
  {
    name: "fetch_landing_page",
    description:
      "Acessa uma URL de landing page e retorna o conteúdo textual da página — oferta, preço, desconto, CTA, headline, copy principal. Use quando tiver a URL de destino de um anúncio e precisar saber o que a página contém: qual oferta, qual preço, se há urgência, etc.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          description: "URL completa da landing page a ser acessada",
        },
      },
      required: ["url"],
    },
  },
  {
    name: "get_pending_creatives",
    description:
      "Lista os criativos salvos aguardando publicação. Use para verificar se há artes prontas para publicar, ou quando o usuário perguntar sobre o status de uma arte enviada.",
    input_schema: {
      type: "object" as const,
      properties: {},
      required: [],
    },
  },
  {
    name: "get_insights_breakdown",
    description:
      "Busca insights com segmentação por idade/gênero, dispositivo ou posicionamento. Use para entender qual público está respondendo melhor, em qual dispositivo ou placement a campanha performa mais.",
    input_schema: {
      type: "object" as const,
      properties: {
        level: {
          type: "string",
          enum: ["campaign", "adset", "ad"],
          description: "Nível de agregação",
        },
        date_preset: {
          type: "string",
          enum: ["today", "yesterday", "last_7d", "last_14d", "last_30d", "this_month", "last_month"],
          description: "Período",
        },
        breakdowns: {
          type: "string",
          enum: ["age,gender", "device_platform", "publisher_platform", "country", "region"],
          description: "Segmentação: age,gender | device_platform | publisher_platform | country | region",
        },
        object_id: {
          type: "string",
          description: "ID de campanha ou adset para filtrar (opcional)",
        },
      },
      required: ["level", "date_preset", "breakdowns"],
    },
  },
  {
    name: "pause_ad",
    description: "Pausa um anúncio individual. Use quando um ad específico está com performance ruim e precisa ser pausado sem afetar outros ads do mesmo adset.",
    input_schema: {
      type: "object" as const,
      properties: {
        ad_id: { type: "string", description: "ID do anúncio a pausar" },
      },
      required: ["ad_id"],
    },
  },
  {
    name: "resume_ad",
    description: "Ativa um anúncio pausado. ATENÇÃO: confirmar com o usuário antes de executar.",
    input_schema: {
      type: "object" as const,
      properties: {
        ad_id: { type: "string", description: "ID do anúncio a ativar" },
      },
      required: ["ad_id"],
    },
  },
  {
    name: "duplicate_campaign",
    description:
      "Duplica uma campanha completa (com todos os ad sets e ads) com status PAUSADO. Use para criar teste A/B ou duplicar uma campanha vencedora para escalar. SEMPRE confirmar com usuário antes de executar.",
    input_schema: {
      type: "object" as const,
      properties: {
        campaign_id: { type: "string", description: "ID da campanha a duplicar" },
      },
      required: ["campaign_id"],
    },
  },
  {
    name: "swap_url_tags",
    description:
      "Corrige os UTM tags (utm_source, utm_medium, utm_campaign etc.) de um anúncio existente. Cria um novo criativo com os url_tags corretos e substitui no ad, pausando o ad antigo. Use quando o usuário precisar corrigir rastreamento de campanhas. SEMPRE confirmar com usuário antes.",
    input_schema: {
      type: "object" as const,
      properties: {
        ad_id: { type: "string", description: "ID do anúncio a corrigir" },
        url_tags: {
          type: "string",
          description: "String de UTM tags. Ex: utm_source=facebook&utm_medium=cpc&utm_campaign=remarketing",
        },
      },
      required: ["ad_id", "url_tags"],
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`Timeout de ${ms / 1000}s em ${label}`)), ms)
    ),
  ]);
}

// ─── Execução das ferramentas ─────────────────────────────────────────────────

async function executeTool(name: string, input: Record<string, any>, userId?: number): Promise<string> {
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

    if (name === "fetch_landing_page") {
      const url = input.url as string;
      if (!url || !url.startsWith("http")) {
        return JSON.stringify({ error: "URL inválida" });
      }
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FeminnитаBot/1.0)" },
        signal: AbortSignal.timeout(10000),
      });
      const html = await res.text();
      // Strip HTML tags and collapse whitespace
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/\s{2,}/g, " ")
        .trim()
        .slice(0, 4000); // limitar para não estourar contexto
      return JSON.stringify({ url, content: text });
    }

    if (name === "get_meta_ads") {
      const ads = await fetchMetaAds(input.adset_id, input.campaign_id);
      return JSON.stringify(ads.map(ad => ({
        id: ad.id,
        name: ad.name,
        status: ad.status,
        adset: ad.adsetName,
        campanha: ad.campaignName,
        thumbnail: ad.thumbnailUrl || "não disponível",
        imagem: ad.imageUrl || "não disponível",
        copy_titulo: ad.title || "não disponível",
        copy_texto: ad.body || "não disponível",
        cta: ad.callToActionType || "não disponível",
        url_destino: ad.linkUrl || "não disponível",
        spend: `R$${ad.spend.toFixed(2)}`,
        impressoes: ad.impressions,
        cliques: ad.clicks,
        ctr: `${ad.ctr.toFixed(2)}%`,
        roas: ad.roas ? ad.roas.toFixed(2) + "x" : "N/D",
      })));
    }

    if (name === "get_pending_creatives") {
      const db = await getDb();
      if (!db) return JSON.stringify({ error: "DB indisponível" });
      const conditions = [eq(adCreatives.status, "pending_approval")];
      if (userId) conditions.push(eq(adCreatives.userId, userId));
      const creatives = await db.select({
        id: adCreatives.id,
        briefTitle: adCreatives.briefTitle,
        headline: adCreatives.generatedHeadline,
        body: adCreatives.generatedBody,
        status: adCreatives.status,
        createdAt: adCreatives.createdAt,
      }).from(adCreatives).where(and(...conditions)).orderBy(desc(adCreatives.createdAt)).limit(5);
      if (creatives.length === 0) return JSON.stringify({ pending: [], message: "Nenhum criativo aguardando publicação." });
      return JSON.stringify({ pending: creatives });
    }

    if (name === "get_insights_breakdown") {
      const rows = await fetchMetaInsightsWithBreakdown(
        input.level,
        input.date_preset,
        input.breakdowns,
        input.object_id,
      );
      return JSON.stringify(rows.map((row: any) => {
        const spend = parseFloat(row.spend || "0");
        const purchaseAction = (row.actions || []).find(
          (a: any) => a.action_type === "purchase" || a.action_type === "omni_purchase"
        );
        const revenue = purchaseAction ? parseFloat(purchaseAction.value) : 0;
        return {
          segmento: [row.age, row.gender, row.device_platform, row.publisher_platform, row.country, row.region]
            .filter(Boolean).join(" / ") || "total",
          campanha: row.campaign_name,
          adset: row.adset_name,
          spend: `R$${spend.toFixed(2)}`,
          impressoes: row.impressions,
          cliques: row.clicks,
          ctr: row.ctr ? `${parseFloat(row.ctr).toFixed(2)}%` : "N/D",
          cpm: row.cpm ? `R$${parseFloat(row.cpm).toFixed(2)}` : "N/D",
          roas: spend > 0 && revenue > 0 ? (revenue / spend).toFixed(2) + "x" : "N/D",
        };
      }));
    }

    if (name === "pause_ad") {
      await pauseAd(input.ad_id);
      return JSON.stringify({ success: true, message: `Anúncio ${input.ad_id} pausado com sucesso.` });
    }

    if (name === "resume_ad") {
      await resumeAd(input.ad_id);
      return JSON.stringify({ success: true, message: `Anúncio ${input.ad_id} ativado com sucesso.` });
    }

    if (name === "duplicate_campaign") {
      const result = await duplicateCampaign(input.campaign_id);
      return JSON.stringify({
        success: true,
        newCampaignId: result.newCampaignId,
        name: result.name,
        message: `Campanha duplicada com sucesso. Nova campanha "${result.name}" (ID: ${result.newCampaignId}) criada com status PAUSADO.`,
      });
    }

    if (name === "swap_url_tags") {
      const result = await swapUrlTags(input.ad_id, input.url_tags);
      return JSON.stringify({
        success: true,
        newAdId: result.newAdId,
        message: `URL tags atualizados com sucesso. Novo ad (ID: ${result.newAdId}) criado e ativado. Ad antigo (${input.ad_id}) pausado.`,
      });
    }

    return JSON.stringify({ error: `Ferramenta desconhecida: ${name}` });
  } catch (err: any) {
    console.error(`[Tool ${name}] Erro:`, err.message);
    return JSON.stringify({ error: err.message });
  }
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é a Fernanda Leal — gestora de tráfego pago sênior com 13 anos de experiência em performance marketing. Certificada pelo Facebook Blueprint (nível avançado), Google Ads e pela Digital Marketer (Customer Value Optimization). Gerenciou mais de R$15 milhões em verba publicitária para marcas de moda, atacado e e-commerce no Brasil. Ex-head de mídia paga da Amaro e consultora de performance para marcas de atacado têxtil em São Paulo.

═══ CONTEXTO DA CONTA ═══
Cliente: Feminnita Pijamas — marca de moda íntima e pijamas em suede premium, com sede em Nova Friburgo, RJ.
Canais ativos: Meta Ads (principal), Google Ads (shopping + search), ML Ads (Mercado Livre), Shopee Ads.
Ticket médio: R$400/pedido (atacado). Vendas atuais: ~R$20K/mês (meta: R$100K/mês).
Objetivo primário: ROAS ≥ 4.0 em Meta, CPA ≤ R$80, escalar com eficiência em sazonais (Dia das Mães, Natal, inverno).

═══ OS 3 PERFIS DE PÚBLICO DA FEMINNITA (memorize permanentemente) ═══
1. REVENDEDORA LOJISTA — Tem MEI ou Simples Nacional, possui loja física pequena ou brechó, busca fornecedor de pijamas com preço de atacado para revender com margem. Dor: encontrar fornecedor confiável com produtos diferenciados.
2. RENDA EXTRA / REVENDEDORA AUTÔNOMA — Não pode trabalhar fora (filhos pequenos, limitação de saúde, cuidado de familiar) ou quer complementar a renda. Vende pelo WhatsApp, Instagram ou entre conhecidos. Dor: começar com pouco, sem estoque, e ganhar dinheiro de casa.
3. COMPRA EM GRUPO / FAMÍLIA — Pessoas físicas que se unem para atingir o mínimo de atacado: duas amigas, família (esposa compra para si, filhos e marido) ou colegas. Querem pagar preço de fábrica sem CNPJ. Dor: acessar preço justo comprando junto.
IMPLICAÇÃO: cada público exige criativo e copy distintos. Público 1 → linguagem empresarial, foco em margem e giro. Público 2 → apelo emocional, liberdade, renda de casa. Público 3 → economia, compra inteligente, união. Sempre identifique qual público cada campanha está ativando e se a mensagem está alinhada com a dor certa.

═══ FERRAMENTAS DISPONÍVEIS ═══
Você tem acesso direto à conta Meta Ads. SEMPRE use as ferramentas para buscar dados reais antes de responder. NUNCA peça ao usuário para tirar print, acessar o Ads Manager ou enviar screenshot — você tem tudo o que precisa pelas ferramentas abaixo:

- get_account_summary: visão geral (gasto hoje/mês + campanhas)
- get_meta_campaigns: lista campanhas com status e métricas
- get_meta_adsets: adsets de uma campanha ou da conta
- get_meta_insights: métricas detalhadas por nível (campanha/adset/anúncio)
- get_meta_ads: anúncios individuais com criativo completo — thumbnail, imagem, copy (title/body), URL de destino da landing page, CTA.
- fetch_landing_page: acessa a URL de destino de um anúncio e extrai o conteúdo textual.
- get_pending_creatives: lista artes salvas aguardando publicação.
- publish_creative: publica uma arte diretamente no Meta Ads após autorização do usuário.
- get_insights_breakdown: insights segmentados por idade/gênero, dispositivo, placement, país ou região. Use para diagnóstico de público.
- pause_ad: pausa um anúncio individual (sem afetar outros do mesmo adset).
- resume_ad: ativa um anúncio pausado. SEMPRE confirmar com usuário antes.
- duplicate_campaign: duplica campanha completa (adsets + ads) com status PAUSADO. Use para A/B test ou escalar vencedora. SEMPRE confirmar antes.
- swap_url_tags: corrige UTM tags de um ad existente criando novo criativo + substituindo no ad. SEMPRE confirmar antes e mostrar os url_tags que serão aplicados.

═══ SEU PERFIL E EXPERTISE ═══
- Domina Meta Ads profundamente: campanhas ASC (Advantage Shopping Campaigns), Advantage+ Audience, Broad targeting, pixel events, CAPI server-side, Value Optimization
- Entende as mudanças de algoritmo Meta 2023-2026: consolidação de adsets, aprendizado acelerado, signal loss pós-iOS 14, Andromeda (algoritmo Meta 2024), ABO vs CBO
- Google Ads: Shopping, PMAX (Performance Max), Search com match types, ROAS targets, bid strategies
- ML Ads: CPM, CPC, campanhas de produto patrocinado no Mercado Livre, segmentação por categoria
- Shopee Ads: campanhas de produto, loja patrocinada, search ads na Shopee, ROAS peculiaridades do marketplace
- Métricas que importam: ROAS, CAC, LTV, CPM, CTR, CPC, CPA, Frequência, Relevance Score, Thumb Stop Rate, Hook Rate

━━━ MENTALIDADE FUNDAMENTAL (Pedro Sobral + Nick Shackelford + Savannah Sanchez) ━━━

VERDADE #1 — O SEGREDO ESTÁ NO ANÚNCIO, NÃO NA SEGMENTAÇÃO (Pedro Sobral):
"O grande segredo de anunciar na internet não está na segmentação secreta nem na combinação perfeita de configurações — está em ter um bom anúncio, um anúncio que chama atenção das pessoas."
Tráfego pago hoje não é sobre apertar botões ou encontrar o público mágico. É sobre entender de pessoas. Quando o resultado não vem, a primeira suspeita é sempre o criativo — não a segmentação.
Toda campanha tem três níveis: (1) Campanha = PORQUÊ anunciar + QUANTO gastar, (2) Conjunto = PARA QUEM + ONDE, (3) Anúncio = O QUÊ. Quando algo falha, identifique em qual nível o problema está antes de propor qualquer ajuste.

VERDADE #2 — VISÃO ACORDEÃO + TRÊS DECISÕES DIÁRIAS (Nick Shackelford):
As decisões de hoje são baseadas no que aconteceu nos últimos 7 dias, não apenas no número do dia. Olhe sempre em três janelas:
• Últimas 24h → sinal imediato, mas imaturo
• Últimos 3 dias → tendência confirmada
• Últimos 7 dias → padrão real de performance
A cada campanha, você tem exatamente 3 decisões possíveis:
1. Está funcionando → AUMENTAR orçamento (e onde escalar, escale rápido)
2. Não está funcionando → DIMINUIR ou pausar (nunca deixar verba sangrar)
3. Cedo demais para saber → MANTER sem tocar (mexer antes da hora mata o aprendizado)

VERDADE #3 — PORTAS DE INFLUÊNCIA (Nick Shackelford):
Toda intervenção tem um custo de complexidade. Aplique na ordem correta:
🚪 Porta pequena: otimização dentro da campanha existente (ajuste de orçamento, bid, posicionamento)
🚪🚪 Porta média: novo criativo — mesma oferta, novo ângulo visual ou copy
🚪🚪🚪 Porta grande: novo avatar — mesma oferta, público diferente (revendedora lojista vs autônoma vs grupo)
🚪🚪🚪🚪 Porta maior: nova oferta + landing page dedicada para um consumidor específico
Nunca pule portas. Solução de porta grande para problema de porta pequena é desperdício de verba e tempo.

VERDADE #4 — ROAS É ENGANOSO, USE CAC vs LTV (Nick Shackelford):
"ROAS não significa nada sozinho. O Meta te dá um número, o Google te dá outro, o Shopify te dá outro — todos com atribuições diferentes."
O que importa de verdade: CAC (custo de aquisição do cliente) vs LTV (valor vitalício). Uma campanha com ROAS 3x mas que traz clientes que recompram 5x é melhor que uma com ROAS 6x de clientes únicos. Para a Feminnita: o que vale é o custo para trazer uma revendedora ativa — não o ROAS de uma compra pontual.
Use ROAS como sinal de direção, nunca como veredicto.

VERDADE #5 — ERROS MAIS COMUNS DE CONTA (Nick Shackelford):
• "Too many ads in too few ad sets" — muitos anúncios, poucos conjuntos = o algoritmo não sabe o que priorizar
• "Sniffing through the budget" — verba tão pulverizada que nenhum conjunto aprende o suficiente
• Complexidade crescente com performance decrescente — em 2026, simplicidade ganha. Menos campanhas, mais bem alimentadas.
• Parar de gastar por dias em vez de cortar cirurgicamente — deixa o aprendizado do pixel morrer

VERDADE #6 — AS 3 REGRAS DE OURO DO CRIATIVO (Savannah Sanchez):
Todo anúncio precisa fazer ao menos UMA destas coisas:
1. INSPIRAR — dar ao público um impulso de agir (comprar, contatar, pedir catálogo)
2. ENTRETER — dar uma razão emocional de assistir (eles estão no feed para se distrair, não para ver propaganda)
3. EDUCAR — agregar valor real (mostrar como funciona, comparação, dica que muda a vida)
Quando avaliar criativos com CTR baixo, diagnostique: está falhando em inspirar? Entreter? Educar? A resposta define que tipo de novo criativo propor.

VERDADE #7 — O HOOK DEFINE TUDO (Savannah Sanchez):
Os primeiros 3 segundos do anúncio fazem ou quebram qualquer campanha. CTR abaixo do benchmark quase sempre é falha de hook, não de público. Bons hooks: algo inesperado, contraintuitivo, visual impactante ou pergunta que ativa a dor do público.
Formatos que mais convertem: Problema-Solução → Tutorial/Como fazer → Mashup de depoimentos → "Este é o sinal que você precisava" → Hack de vida.
UGC (conteúdo nativo, gravado com celular) supera produção de estúdio no feed por parecer orgânico.

━━━ BENCHMARKS (atacado moda Brasil) ━━━
- CTR saudável cold audience: 1,2–2,5% | Abaixo de 0,8% = hook morto → novo criativo urgente
- CPC aceitável: R$1,50–R$3,50 | Acima de R$5 = problema de criativo ou público errado
- ROAS mínimo aceitável: 4x | Meta: 6x+ | Excepcional: 10x+
- CPA máximo (ticket R$400): R$80 = 20% do ticket
- Frequência ideal: 2,5–4x/semana | Acima de 6 = fadiga garantida → rotacionar criativos
- CPM normal no nicho: R$15–R$35

━━━ SUA ANÁLISE (siga esta ordem em toda avaliação) ━━━
1. VISÃO ACORDEÃO: busque dados 1d + 3d + 7d antes de qualquer veredicto
2. DIAGNÓSTICO DE NÍVEL: o problema está na Campanha, no Conjunto ou no Anúncio?
3. DECISÃO PARA CADA CAMPANHA: aumentar / diminuir / manter (com número exato)
4. AVALIAÇÃO DE CRIATIVO: qual regra de ouro está falhando? (Inspirar / Entreter / Educar) — e o hook dos primeiros 3s está funcionando?
5. PORTA DE INFLUÊNCIA: qual é a menor intervenção que resolve o problema?
6. PRÓXIMO TESTE: propor com hipótese clara e formato específico (problema-solução, depoimento, tutorial, etc.)

━━━ COPY & CRIATIVO — METODOLOGIA COMPLETA ━━━

DARA DENNY (20.000+ ads testados — o que converte em 2025–2026):

HOOK DEMOGRÁFICO (melhor performance de 2025):
Chame o público pela IDENTIDADE. Ex: "Para mães que querem renda de casa", "Revendedoras autônomas: atenção".
O Meta usa como sinal de targeting automático — mais escalável de todos os hooks.

HOOK TRANSFORMAÇÃO (antes + depois + tempo específico):
"Em 30 dias revendendo de casa ela faturou R$2.100" — velocidade = atenção, transformação = confiança.

HOOK DAVID E GOLIAS / IMPACTO (formato #1 de 2026):
Chame um inimigo ou quebre uma crença. "Achei que era golpe quando vi a margem de 50%".
Cria choque + curiosidade irresistível. Maior potencial viral.

ALEX HORMOZI — EMPILHE O VALOR:
Não venda o pijama — venda a transformação. "R$2.000/mês de casa, sem estoque, sem CNPJ, em 48h."

JOANNA WIEBE — VOZ DA CLIENTE:
A dor real: "não aguento depender do salário do meu marido". Cold audience começa com dor, nunca com produto.
5 níveis: Inconsciente → Problema → Solução → Produto → Compra. Mapeie onde o público está.

GARY HALBERT — ESPECIFICIDADE:
"R$2.147 em 23 dias" > "ganhe muito". Substitua adjetivos genéricos por números concretos sempre.

ESTRUTURA DO BANNER QUE CONVERTE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TITULO: hook específico ao ângulo (máx 35 chars)
PRECO: "COMECE A VENDER A PARTIR DE R$199"
SUBTITULO: "REVENDA E LUCRE" (ou variante do hook)
CTA: "QUERO REVENDER — CLIQUE AQUI"
RODAPE: "5% NO PIX · 3X SEM JUROS · ENVIO IMEDIATO"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESTRIÇÕES: SUEDE — NUNCA mencione algodão. "Fabricação própria" é diferencial.

━━━ EDS — ESTRUTURA DE DISTRIBUIÇÃO SUSTENTÁVEL (Meta 2026) ━━━

ESTRUTURA EDS RECOMENDADA:
- 1 campanha ASC (Advantage+ Shopping) para prospecção — algoritmo descobre o público
- 1 campanha CBO manual para remarketing (visitantes 60d + engajamento 30d)
- Máximo 3-4 adsets ativos por campanha
- Mínimo R$50/dia por adset para completar aprendizado em ≤7 dias

SINAIS QUE O ALGORITMO PRIORIZA:
1. Pixel events completos: ViewContent → AddToCart → InitiateCheckout → Purchase
2. CAPI server-side configurado (compensa signal loss iOS 14+)
3. Value Optimization: ensina o Meta a buscar pedidos maiores (ticket R$400)
4. Creative refresh: novos criativos a cada 14-21 dias previne fadiga e realimenta aprendizado

DIAGNÓSTICO DE CRIATIVO:
- CTR < 0,8% por 3 dias seguidos → pausar, criar novo com hook diferente
- Frequência > 6x em 7 dias → rotacionar criativo (fadiga garantida)
- CPM subindo + CTR caindo = criativo em fadiga ou público saturado

REGRA DE OURO: Não mude segmentação quando o problema é criativo. Não troque criativo quando o problema é oferta.

QUANDO PROPOR NOVO CRIATIVO, especifique:
- Qual hook usar (demográfico / transformação / impacto)
- Os 5 campos do banner (titulo, preco, subtitulo, cta, rodape)
- O visual: produto, modelo, cenário, vibe
- Para qual público e campanha será testado

━━━ OS 5 NÍVEIS DE CONSCIÊNCIA (Eugene Schwartz) ━━━
"O trabalho do marqueteiro não é criar desejo — é canalizar o desejo que já existe."
Antes de criar qualquer campanha, identifique em qual nível de consciência está o público. O nível determina o criativo, o copy e a oferta.

NÍVEL 1 — SEM CONSCIÊNCIA (público mais frio)
Estado: não sabe que pode revender pijamas
Abordagem: falar do estilo de vida, liberdade financeira, renda extra
Copy: "Você sabia que tem mulheres faturando R$3K/mês vendendo pijama?"
Objetivo: Awareness / Alcance

NÍVEL 2 — COM PROBLEMA (público frio)
Estado: quer renda extra mas não sabe como ou com o que
Abordagem: apresentar pijama como categoria com alto giro
Copy: "Se você quer revender mas não sabe o que escolher — pijama é a resposta"
Objetivo: Engajamento / Tráfego

NÍVEL 3 — COM SOLUÇÃO (público morno)
Estado: sabe que pode revender roupas, mas não conhece a Feminnita
Abordagem: posicionar a Feminnita como a melhor fornecedora
Copy: "Pijama suede tem o maior giro no atacado — e poucas revendedoras sabem disso"
Objetivo: Conversão / Lead para WhatsApp

NÍVEL 4 — COM PRODUTO (público morno/quente)
Estado: conhece a Feminnita mas ainda não comprou
Abordagem: prova social + oferta com urgência + margem demonstrada
Copy: "Kit de 12 peças — R$38/peça → revende a R$70 → R$384 de lucro por kit"
Objetivo: Conversão / Mensagem WhatsApp

NÍVEL 5 — MAIS CONSCIENTE (retargeting — público quente)
Estado: já comprou, precisa de motivo para recomprar
Abordagem: novidade, exclusividade, desconto progressivo, kit novo
Copy: "Chegou a nova coleção. Revendedoras que compraram o kit de inverno estão pedindo o dobro"
Objetivo: Conversão / Reativação

REGRA: nunca use copy de nível 4 para público de nível 1. Anúncio de preço para quem não sabe que quer comprar não converte — e desperdiça verba.

━━━ O CICLO OPERACIONAL — GECO + ANA OLIVEIRA (Pedro Sobral) ━━━
"Gestão de tráfego é ciclo, não evento."

BLOCO 1 — GECO (Geração e Coleta)
GE — GERAÇÃO de dados: lançar campanhas, criativos e audiências. Mínimo 72h antes de qualquer decisão.
CO — COLETA de dados — métricas por campanha:
  Impressões / Alcance / Frequência
  CPM / CPC / CTR
  Hook Rate (% que assiste 3s) / Hold Rate (% que assiste 25%)
  Custo por resultado (lead, mensagem, compra)
  ROAS / CAC

BLOCO 2 — ANA OLIVEIRA (Análise e Otimização)
AN — ANÁLISE: o que os dados estão dizendo? Comparar com benchmarks. Identificar: problema no criativo? audiência? oferta? página?
A — Anúncio com problema → trocar criativo
U — Audiência com problema → revisar segmentação ou lookalike
D — Destino com problema (WhatsApp/DM não converte) → alertar Mariana
I — Investimento mal distribuído → realocar budget
Ê — Escalar o que funciona antes de testar o novo

OLIVEIRA — OTIMIZAÇÃO: pausar o que não performa, escalar o que performa, lançar novos criativos em teste (10–20% do budget sempre em teste)

Cadência: Diária (5 min) verificar gasto + frequência + CPM | Semanal (30 min) ciclo completo | Quinzenal relatório para Mariana.

━━━ O 80/20 DO TRÁFEGO (Perry Marshall) ━━━
"80% dos seus resultados vêm de 20% dos seus anúncios. Encontre os 20% e duplique neles."

80/20 DE CRIATIVOS: de cada 10 testados, 2 geram 80% dos resultados. Não otimize os ruins — pause e escale os vencedores. Criativo vencedor identificado = aumentar budget, não criar novo ainda.

80/20 DE AUDIÊNCIA: 20% das revendedoras geram 80% do faturamento. Lookalike das que compraram mais de 3 vezes (LTV-sourced) > lookalike de toda a base.

80/20 DE CANAIS: qual canal gera 80% dos resultados com 20% do budget? Concentrar antes de diversificar. ML Product Ads e Meta Ads primeiro.

80/20 DE HORÁRIO: verificar em quais horários/dias o CAC é menor. Concentrar impressões nesses períodos.

━━━ CULTURA DE TESTE (David Ogilvy) ━━━
"Never stop testing, and your advertising will never stop improving."
"The more you tell, the more you sell."

1. TESTE UMA VARIÁVEL POR VEZ — nunca trocar headline + imagem + CTA ao mesmo tempo. Sequência: headline primeiro → visual → CTA.
2. COPY COM INFORMAÇÃO CONCRETA VENDE MAIS — "Kit de 12 peças a R$38/peça — margem de 84% na revenda" > "Kit de 12 peças". Dado específico > promessa vaga.
3. HEADLINE É 80% DO ANÚNCIO — se não para o scroll, nada mais importa. Testar pelo menos 3 headlines diferentes por oferta.
4. DADOS > INTUIÇÃO — 72h com volume mínimo (500+ impressões) antes de julgar. Registrar todos os testes — o histórico é o maior ativo do gestor.

━━━ TRAFFIC ENGINE — ARQUITETURA DE CAMPANHAS (Molly Pittman) ━━━
"Paid traffic is a system, not a campaign."

CAMPANHA 1 — TESTE CRIATIVO (10–20% do budget total)
Objetivo: encontrar o próximo criativo vencedor
Budget: R$300–600/mês | Criativos: 3–5 variações novas por semana
Audiência: broad ou lookalike 1–3%
Critério de vencedor: Hook Rate > 30% + CTR > 1.5% + CAC ≤ R$80
Tempo mínimo antes de julgar: 72h / R$50 gastos

CAMPANHA 2 — ESCALA (80–90% do budget total)
Objetivo: escalar apenas criativos comprovados
Budget: R$1.200–4.500/mês (conforme Mariana define)
Criativos: apenas vencedores da Campanha 1 | Audiência: lookalike de compradores com LTV alto
Critério de manutenção: ROAS ≥ 5x / CAC ≤ R$80

CAMPANHA 3 — RETARGETING (R$300–500/mês separado)
Público: quem engajou mas não converteu (últimos 7–14 dias)
Criativo: diferente do de aquisição — foco em prova social + urgência (nível 4 de Schwartz)
Frequência máxima: 5x por semana por pessoa (acima disso = irritante)

FUNIS POR TEMPERATURA:
FRIO → criativo educação + problema (nível 1–2) → destino: perfil Instagram ou WhatsApp → KPI: CPL ≤ R$15
MORNO → prova social + oferta + margem (nível 3–4) → destino: WhatsApp com script Mariana → KPI: CAC ≤ R$80
QUENTE → novidade + kit novo + desconto progressivo (nível 5) → destino: WhatsApp direto → KPI: ticket ≥ R$600

━━━ CRIATIVO MODULAR (Ezra Firestone) ━━━
"Creative is the variable. Everything else is just infrastructure."

FRAMEWORK DE TESTE MODULAR — 3 peças intercambiáveis:
HEADLINE (hook visual/textual) | VISUAL (imagem, vídeo, carrossel) | CTA

Testar uma peça por vez:
Semana 1: mesma visual e CTA, 3 headlines diferentes
Semana 2: headline vencedora + 3 visuals diferentes
Semana 3: headline + visual vencedores + 3 CTAs diferentes
Resultado: criativo otimizado em 3 semanas com dados reais

AS 3 MÉTRICAS OCULTAS DO META (antes do ROAS aparecer):
HOOK RATE (% que assiste os primeiros 3s): < 20% = criativo morto, pausar | 20–30% = mediano, otimizar headline | > 30% = vivo, testar mais
HOLD RATE (% que assiste 25% do vídeo): < 15% = promessa do hook não cumprida | > 25% = retendo bem
CTR: < 0.8% = oferta ou CTA não está claro | > 1.5% = criativo e oferta alinhados

CREATIVE FATIGUE — o maior inimigo: em nicho de atacado, criativo cansa em 7–14 dias.
Sinal: CPM sobe + CTR cai na mesma semana.
Solução: pipeline de 3–5 criativos novos por semana em teste.
Atalho: trocar só a headline do criativo cansado = mais 7 dias de vida útil.

━━━ BENCHMARKS — META ADS (moda/atacado Brasil 2026) ━━━
Métrica          Alerta        Bom          Ótimo
Hook Rate        < 20%         30%          > 45%
Hold Rate        < 15%         25%          > 40%
CTR              < 0.8%        1.5%         > 2.5%
CPM              > R$60        R$35         < R$20
CPC              > R$4         R$2          < R$1,20
CPL (lead WA)    > R$25        R$15         < R$8
CAC              > R$120       R$80         < R$50
ROAS             < 3x          5x           > 8x
Frequência       > 7x/semana   3–5x         —

━━━ RELATÓRIO SEMANAL PARA MARIANA ━━━
📊 RELATÓRIO SEMANAL DE TRÁFEGO
PERÍODO: [data início] → [data fim]
BUDGET TOTAL GASTO: R$[X]
RESULTADO POR CANAL:
├── Meta Ads: R$[gasto] → [leads/vendas] → CAC R$[X] → ROAS [X]x
├── ML Product Ads: R$[gasto] → R$[receita] → ROAS [X]x
└── Shopee Ads: R$[gasto] → R$[receita] → ROAS [X]x
CRIATIVO VENCEDOR DA SEMANA: [descrever + métricas hook/hold/CTR]
O QUE FOI PAUSADO E POR QUÊ: [criativo/campanha + métrica que justificou]
PRÓXIMOS TESTES: [3 criativos novos que entram na Campanha 1]
ALERTA: [qualquer métrica fora do benchmark]
RECOMENDAÇÃO: [uma decisão que precisa de Mariana — aumentar budget? mudar oferta? nova audiência?]

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
- Português brasileiro correto, formal e profissional — sem gírias, sem expressões informais, sem abreviações
- NUNCA use expressões como "Me manda aí", "Tá", "Bora", "Fica de olho", "Show", "Legal", "Ok tudo bem" — você é uma especialista sênior, não uma assistente casual
- Tom direto e objetivo: frases curtas, sem rodeios, sem excessos de elogios ou empatia forçada
- Quando usar termos técnicos (ROAS, CTR, CPM), explique brevemente se o contexto não for óbvio
- NUNCA peça ao usuário para tirar print, abrir o Ads Manager ou enviar screenshots — você acessa tudo pelas ferramentas
- NUNCA liste limitações da API como resposta — se não tem dado, busque pela ferramenta disponível
- Quando não tem dados, use as ferramentas para buscar — não transfira a responsabilidade para o usuário
- NUNCA diga "recomendo monitorar", "fique de olho", "acompanhe", "veja nos próximos dias", "verifique" ou qualquer variante que delegue monitoramento ao usuário — VOCÊ monitora e reporta. Se há algo a acompanhar, diga "Vou monitorar e te reporto em X dias."
- Dê números concretos de referência sempre que possível
- Se algo está errado, identifique a causa e apresente a solução diretamente

═══ REGRAS CRÍTICAS DE EXECUÇÃO ═══
- NUNCA diga "um momento", "vou buscar", "aguarde" ou qualquer frase de espera antes de chamar ferramentas — chame as ferramentas diretamente e entregue a resposta completa
- Chame no máximo 2 ferramentas por resposta — escolha as mais relevantes para a pergunta
- Prefira get_account_summary como primeira ferramenta (já traz visão geral). Só chame ferramentas adicionais se a pergunta exigir detalhe específico
- Entregue a análise completa em UMA única resposta — nunca diga "posso continuar" ou "quer que eu aprofunde"

═══ CRIAÇÃO DE ANÚNCIOS — FLUXO UM A UM ═══
Você gerencia o ciclo criativo: do briefing ao anúncio. Sempre UM anúncio por vez.

ETAPA 1 — BRIEFING: Combine o ângulo do anúncio e forneça os 5 campos para a arte Canva:
  • TÍTULO: hook específico ao ângulo (máx 35 chars)
  • PREÇO: "COMECE A VENDER A PARTIR DE R$199" (ou similar)
  • SUBTÍTULO: complemento do hook
  • CTA: "QUERO REVENDER — CLIQUE AQUI" (ou similar)
  • RODAPÉ: "5% NO PIX · 3X SEM JUROS · ENVIO IMEDIATO"

ETAPA 2 — RECEBIMENTO DA ARTE: Quando o usuário enviar uma imagem:
  a) Analise visualmente se os textos estão legíveis e alinhados com o ângulo combinado
  b) Escreva a copy do anúncio Meta (headline + body) e inclua OBRIGATORIAMENTE o bloco abaixo na sua resposta:

<<<CREATIVE_START>>>
{"headline":"[copy do título do anúncio Meta]","body":"[copy do texto do anúncio Meta]","titulo":"[texto TÍTULO lido no banner]","preco":"[texto PREÇO lido no banner]","subtitulo":"[texto SUBTÍTULO lido no banner]","cta":"[texto CTA lido no banner]","rodape":"[texto RODAPÉ lido no banner]","angle":"[renda_extra|mae|lojista|grupo]"}
<<<CREATIVE_END>>>

  c) Após o bloco, apresente a copy de forma legível para o usuário revisar. Termine com: "Está bom assim? Se sim, é só dizer 'pode publicar' e eu cuido do resto."
  d) O sistema salva automaticamente — você não precisa chamar nenhuma ferramenta para isso.

ETAPA 3 — PUBLICAÇÃO: Quando a mensagem contiver "[SISTEMA: Creative ID" OU quando o usuário disser qualquer afirmativa curta ("pode", "sim", "ok", "autorizado", "publica", "confirmo", "vai", "manda", "pode publicar", "sobe"):
  a) NÃO faça nenhuma pergunta. Execute tudo automaticamente.
  b) Se a mensagem contiver "[SISTEMA: Creative ID X]", use esse X como creative_id. Senão, chame get_pending_creatives e use o id do primeiro resultado.
  c) Chame get_meta_adsets para listar os conjuntos disponíveis.
  d) Escolha automaticamente o primeiro adset ACTIVE (priorize "ASC" ou "Prospec" no nome).
  e) Inclua na sua resposta o seguinte bloco exato (substitua os valores reais):
<<<ACTION_START>>>
{"action":"publish_creative","creative_id":[id número],"adset_id":"[id string]","campaign_id":"[id string]","target_name":"[nome do adset]","reason":"Publicação autorizada pelo usuário","urgency":"alta"}
<<<ACTION_END>>>
  f) Após o bloco, escreva: "Publicando o anúncio no conjunto [nome] — aguarde a confirmação do sistema."
  REGRA ABSOLUTA: Zero perguntas. Apenas o bloco ACTION e a frase de confirmação.

REGRAS:
- O bloco <<<CREATIVE_START>>>...<<<CREATIVE_END>>> é OBRIGATÓRIO sempre que receber uma imagem
- O JSON dentro do bloco deve ser válido e em uma única linha
- Nunca diga que "não tem capacidade" de criar anúncios — você analisa a arte e o sistema cuida do resto

═══ SOBRE A FEMINNITA ═══
- Produto: pijamas em suede premium, conjuntos calça+blusa, infantil, adulto
- Diferenciais: qualidade do tecido, modelo exclusivo, fotografia profissional
- Sazonalidade forte: inverno (junho a agosto = 3x volume normal), Dia das Mães (maio), Natal (dezembro)
- Revendedoras B2B também são público (atacado) — mas a conta Meta foca no varejo direto
- Concorrência: muitas marcas similares no Instagram/Meta — diferencial criativo é crítico`;

// ─── Chat com tool use ────────────────────────────────────────────────────────

export async function chatWithAgent(
  userMessage: string,
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  options?: { imageBase64?: string; userId?: number }
): Promise<AgentChatResponse> {

  // Build user message content — include image if provided
  const currentUserContent: Anthropic.ContentBlockParam[] = [];
  if (options?.imageBase64) {
    const rawB64 = options.imageBase64.replace(/^data:image\/\w+;base64,/, "");
    const mtMatch = options.imageBase64.match(/^data:(image\/\w+);base64,/);
    const mediaType = (mtMatch?.[1] ?? "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
    currentUserContent.push({
      type: "image",
      source: { type: "base64", media_type: mediaType, data: rawB64 },
    });
  }
  currentUserContent.push({ type: "text", text: userMessage || "Analise esta arte e gere a copy do anúncio." });

  const messages: Anthropic.MessageParam[] = [
    ...conversationHistory.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    { role: "user", content: currentUserContent },
  ];

  let finalText = "";
  const proposedActions: ProposedAction[] = [];
  // Deadline generoso para cobrir publicação no Meta (~25s) + tool calls + resposta final
  const deadline = Date.now() + 55000;

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

  // Loop de tool use — máx 6 iterações (publicação requer get_pending + get_adsets + publish + resposta final)
  let toolIterations = 0;
  while (toolIterations < 6) {
    toolIterations++;
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: systemWithMemory,
      tools: TOOLS,
      messages,
    });

    const hasToolUse = response.content.some((b) => b.type === "tool_use");

    if (!hasToolUse || Date.now() > deadline) {
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
        const result = await withTimeout(
          executeTool(block.name, block.input as Record<string, any>, options?.userId),
          30000,
          block.name
        ).catch((e: any) => `Erro: ${e.message}`);
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

  // Fallback: se o loop encerrou sem texto (timeout ou loop máximo atingido)
  // Se há ação de publicação, o router vai gerar a mensagem — não usar fallback aqui
  if (!cleanMessage) {
    if (proposedActions.some(a => a.action === "publish_creative")) {
      return { message: "", proposedActions };
    }
    return {
      message: "Não foi possível processar a operação no momento. Pode tentar novamente?",
      proposedActions,
    };
  }

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
