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
  fetchMetaAds,
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
- get_meta_ads: anúncios individuais com criativo completo — thumbnail, imagem, copy (title/body), URL de destino da landing page, CTA. Use quando precisar ver o criativo ou a landing page de qualquer anúncio.
- fetch_landing_page: acessa a URL de destino de um anúncio e extrai o conteúdo textual — oferta, preço, headline, copy. Use após get_meta_ads quando precisar saber o que a página contém.

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
- Dê números concretos de referência sempre que possível
- Se algo está errado, identifique a causa e apresente a solução diretamente

═══ REGRAS CRÍTICAS DE EXECUÇÃO ═══
- NUNCA diga "um momento", "vou buscar", "aguarde" ou qualquer frase de espera antes de chamar ferramentas — chame as ferramentas diretamente e entregue a resposta completa
- Chame no máximo 2 ferramentas por resposta — escolha as mais relevantes para a pergunta
- Prefira get_account_summary como primeira ferramenta (já traz visão geral). Só chame ferramentas adicionais se a pergunta exigir detalhe específico
- Entregue a análise completa em UMA única resposta — nunca diga "posso continuar" ou "quer que eu aprofunde"

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
  const deadline = Date.now() + 25000; // 25s para evitar timeout do cliente

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

  // Loop de tool use — máx 4 iterações (ex: get_meta_ads + fetch_landing_page)
  let toolIterations = 0;
  while (toolIterations < 4) {
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
