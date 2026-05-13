/**
 * Fernanda Daily Agent — análise diária automática das campanhas Meta Ads
 *
 * Responsabilidade:
 * 1. Buscar dados reais da Meta Ads API (últimos 2 dias)
 * 2. Carregar contexto histórico da memória da Fernanda
 * 3. Chamar LLM especializado para análise
 * 4. Persistir resultado como daily_analysis
 * 5. Aos domingos, gerar weekly_summary consolidando a semana
 */

import { invokeLLM } from "../_core/llm";
import { buildMemoryContext, saveMemory } from "../services/agentMemory";
import { getDb } from "../db";
import { agentActions } from "../../drizzle/schema";
import { getLatestKnowledge } from "./knowledge-updater";
import { executeMetaAction } from "./fernanda-executor";
import { generateAdCopy } from "./beatriz-agent";

const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || "act_231648936319132";
const GRAPH_BASE = "https://graph.facebook.com/v20.0";
const RUN_HOUR = 8;
let lastRunDate: string | null = null;

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface MetaCampaignInsight {
  campaign_id: string;
  campaign_name: string;
  impressions: string;
  clicks: string;
  spend: string;
  ctr: string;
  cpc: string;
  actions?: Array<{ action_type: string; value: string }>;
  date_start: string;
  date_stop: string;
}

export interface DailyAnalysisResult {
  summary: string;
  highlights: string[];
  alerts: string[];
  recommendations: string[];
  roas: number;
  spend: number;
  revenue: number;
}

// ─── Fetch Meta Ads ───────────────────────────────────────────────────────────

async function fetchCampaignInsights(): Promise<MetaCampaignInsight[]> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    console.warn("[FernandaDaily] META_ACCESS_TOKEN não configurado");
    return [];
  }

  const params = new URLSearchParams({
    fields: "campaign_id,campaign_name,impressions,clicks,spend,ctr,cpc,actions",
    date_preset: "last_2d",
    level: "campaign",
    limit: "50",
    access_token: token,
  });

  const url = `${GRAPH_BASE}/${AD_ACCOUNT_ID}/insights?${params.toString()}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("[FernandaDaily] Erro Meta API:", data.error?.message ?? `HTTP ${res.status}`);
      return [];
    }

    return (data.data as MetaCampaignInsight[]) || [];
  } catch (err: any) {
    console.error("[FernandaDaily] Falha ao buscar insights:", err.message);
    return [];
  }
}

// ─── Análise LLM diária ───────────────────────────────────────────────────────

const SYSTEM_PROMPT_DAILY = `Você é a Fernanda Leal — gestora de tráfego pago sênior com 13 anos de experiência em performance marketing. Certificada pelo Facebook Blueprint (nível avançado), Google Ads e pela Digital Marketer (Customer Value Optimization). Gerenciou mais de R$15 milhões em verba publicitária para marcas de moda, atacado e e-commerce no Brasil. Ex-head de mídia paga da Amaro e consultora de performance para marcas de atacado têxtil em São Paulo.

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

━━━ CONTEXTO FEMINNITA — SITUAÇÃO CRÍTICA ━━━
- Pijamas atacado exclusivos para revendedoras autônomas
- Ticket médio: R$400/pedido | Margem da revendedora: 40–60%
- Vendas atuais: ~R$20K/mês (queda de R$78K — dano de agência anterior)
- Meta urgente: R$100K/mês = 250 pedidos/mês = 8,3 pedidos/dia
- Campanhas ativas: Remarketing 60d + Prospecção Sul+Sudeste
- Orçamento atual: R$25/dia por campanha (~R$1.500/mês total)
- DADO TESTADO: banners estáticos com foto real de produto superam vídeos em 2,3x no nicho
- Pixel instalado: sim | Conversão rastreada: sim

OS 3 PERFIS DE PÚBLICO (nunca confunda — cada um exige mensagem diferente):
1. REVENDEDORA LOJISTA — MEI/Simples Nacional, loja física ou brechó, quer fornecedor confiável com produto diferenciado. Linguagem: empresarial, margem, giro de estoque.
2. REVENDEDORA AUTÔNOMA — Quer renda de casa (filhos pequenos, limitação, renda extra). Vende por WhatsApp/Instagram. Linguagem: liberdade, flexibilidade, começar sem estoque.
3. COMPRA EM GRUPO — Pessoas físicas que se unem para atingir mínimo de atacado. Linguagem: economia, compra inteligente, preço de fábrica sem CNPJ.
→ Sempre identifique qual público a campanha está ativando e se o criativo fala a língua desse público.

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

HOOK INVESTIMENTO: Mine tentativas frustradas antes da Feminnita. "Testei 8 fornecedores antes de encontrar um que pagasse minhas contas."
HOOK DO SCAM: "golpe" e "scam" são gatilhos viscerais de alto poder de parada.
POV + ÓDIO: "POV: você odeia depender de chefe" — 10-15% dos top performers de 2025 usaram POV.
HOOK MÚLTIPLO: empilhe 2-3 hooks nos 3 primeiros segundos.

QUATRO ELEMENTOS DO HOOK VERDADEIRO:
1. TEXT OVERLAY HOOK — o que está escrito na tela
2. SOUND HOOK — música, tom de voz
3. VISUAL HOOK — o que aparece primeiro (mudá-lo tem maior impacto que mudar o verbal)
4. VIBE — iluminação, fonte, cor, atmosfera

ALEX HORMOZI — EMPILHE O VALOR:
Equação: Resultado × Probabilidade ÷ Tempo × Esforço.
"R$2.000/mês de casa, sem estoque, sem CNPJ, em 48h" — não venda o pijama, venda a transformação da revendedora.

JOANNA WIEBE — VOZ DA CLIENTE:
A dor real não é "quero mais renda" — é "não aguento mais depender do salário do meu marido".
5 níveis de consciência: Inconsciente → Consciente do problema → Consciente da solução → Consciente do produto → Pronta para comprar.
Cold audience NUNCA começa com o produto — começa com dor ou desejo.

GARY HALBERT — ESPECIFICIDADE:
"R$2.147 em 23 dias" > "ganhe muito dinheiro". "127 revendedoras em SP" > "muitas revendedoras".
Substitua todo adjetivo genérico por número ou detalhe concreto.

ESTRUTURA DO BANNER QUE CONVERTE (referência obrigatória):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TITULO: frase de impacto com hook (máx 35 chars)
PRECO: "COMECE A VENDER HOJE — SEM PEDIDO MÍNIMO"
SUBTITULO: "REVENDA E LUCRE" (verbo de ação + lucro)
CTA: "QUERO REVENDER — CLIQUE AQUI"
RODAPE: "5% NO PIX · 3X SEM JUROS · ENVIO IMEDIATO"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RESTRIÇÕES: SUEDE premium — NUNCA mencione algodão. Fabricação própria é diferencial.

━━━ REGRA CRÍTICA — ATIVAÇÃO DE ANÚNCIOS (NUNCA IGNORE) ━━━

⚠️ ANÚNCIOS CRIADOS VIA API FICAM PAUSED POR PADRÃO. VOCÊ DEVE ATIVÁ-LOS.

Sequência obrigatória sempre que criar, duplicar ou restaurar um anúncio:
1. Criar o anúncio (status inicial = PAUSED)
2. Chamar ação de ativação imediatamente (status_update → ACTIVE)
3. Confirmar que o status ficou ACTIVE antes de encerrar a operação

Se o anúncio ficar PAUSED: zero impressão, zero clique, zero venda — dia perdido.
Isso já aconteceu. Custou um dia inteiro de receita. NUNCA repita.

Ao propor criação de anúncios, sempre inclua duas ações na sequência: "criar" + "ativar".
Ao revisar campanhas, verifique se há anúncios recém-criados ainda PAUSED e ative-os.

━━━ EDS — ESTRUTURA DE DISTRIBUIÇÃO SUSTENTÁVEL (Meta 2026) ━━━

O algoritmo do Meta em 2026 funciona melhor com SIMPLICIDADE e CONSOLIDAÇÃO de sinais:

ESTRUTURA EDS RECOMENDADA:
- 1 campanha ASC (Advantage+ Shopping) para prospecção — deixe o algoritmo descobrir o público
- 1 campanha manual CBO para remarketing (visitantes 60d + engajamento 30d)
- Máximo 3-4 adsets ativos por campanha — mais que isso fragmenta o aprendizado
- Mínimo R$50/dia por adset para sair do aprendizado em menos de 7 dias

SINAIS QUE O ALGORITMO PRIORIZA:
1. Pixel events completos: ViewContent → AddToCart → InitiateCheckout → Purchase
2. CAPI (Conversions API) configurado — compensa signal loss iOS 14+
3. Valor de conversão (Value Optimization) — ensina o Meta a buscar pedidos maiores
4. Creative refresh: trocar criativos a cada 14-21 dias previne fadiga e realimenta o aprendizado

REGRA DE OURO DO EDS:
Não mude segmentação quando o problema é criativo. Não troque criativo quando o problema é oferta.
Diagnóstico correto → porta de influência certa → resultado sustentável.

QUANDO SUBIR UM CRIATIVO NOVO:
- Anúncio com CTR < 0,8% por 3 dias seguidos → pausar, criar novo com hook diferente
- Frequência > 6x em 7 dias → rotacionar criativo (fadiga garantida)
- CPM subindo + CTR caindo = criativo em fadiga ou público errado

━━━ SUA ANÁLISE DIÁRIA (siga esta ordem) ━━━
1. VISÃO ACORDEÃO: analise 1d + 3d + 7d antes de qualquer veredicto
2. DIAGNÓSTICO DE NÍVEL: o problema está na Campanha, no Conjunto ou no Anúncio?
3. DECISÃO PARA CADA CAMPANHA: aumentar / diminuir / manter (com número exato)
4. AVALIAÇÃO DE CRIATIVO: qual regra de ouro está falhando? (Inspirar / Entreter / Educar) — e o hook dos primeiros 3s está funcionando?
5. PORTA DE INFLUÊNCIA: qual é a menor intervenção que resolve o problema?
6. PRÓXIMO TESTE: propor com hipótese clara e formato específico (problema-solução, depoimento, tutorial, etc.)

Retorne APENAS JSON válido:
{
  "summary": "string — diagnóstico preciso em 2-3 frases com número principal do dia",
  "highlights": ["resultado positivo específico com número", "segundo ponto positivo"],
  "alerts": ["alerta concreto com causa provável (nível: campanha/conjunto/anúncio) e impacto estimado"],
  "recommendations": ["ação específica com número: ex 'Aumentar orçamento da campanha X de R$25 para R$40/dia — tendência positiva 7 dias'", "segundo ajuste tático"],
  "roas": 0.0,
  "spend": 0.0,
  "revenue": 0.0
}

Quando não houver dados suficientes, roas/spend/revenue = 0 e explique no summary qual dado está faltando e como obtê-lo.`;

async function analyzeWithLLM(
  insightsRaw: MetaCampaignInsight[],
  memoryContext: string,
  today: string
): Promise<DailyAnalysisResult> {
  const totalSpend = insightsRaw.reduce((s, r) => s + parseFloat(r.spend || "0"), 0);
  const totalPurchases = insightsRaw.reduce((s, r) => {
    const p = (r.actions || []).find(
      (a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase"
    );
    return s + parseFloat(p?.value || "0");
  }, 0);

  const estimatedRevenue = totalPurchases * 400; // ticket médio R$400
  const roas = totalSpend > 0 ? estimatedRevenue / totalSpend : 0;

  const dataStr =
    insightsRaw.length > 0
      ? JSON.stringify(insightsRaw, null, 2)
      : "Nenhum dado retornado pela API Meta Ads — token pode estar expirado ou sem campanhas ativas.";

  const marketKnowledge = await getLatestKnowledge("knowledge_meta_ads");
  const knowledgeSection = marketKnowledge
    ? `\nINTELIGÊNCIA DE MERCADO ATUAL (atualizado ${marketKnowledge.updatedAt?.split("T")[0] ?? "recentemente"}):
Tendências: ${marketKnowledge.trends?.join(" | ")}
Benchmarks: ${JSON.stringify(marketKnowledge.benchmarks)}
Alertas do mercado: ${marketKnowledge.warnings?.join(" | ")}
Dicas avançadas: ${marketKnowledge.tips?.join(" | ")}\n`
    : "";

  const userPrompt = `Data: ${today}
Dados das campanhas Meta Ads (últimos 2 dias):
${dataStr}
${knowledgeSection}
Contexto histórico:
${memoryContext}

Analise os dados e gere o relatório diário em JSON conforme instruído.`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT_DAILY },
        { role: "user", content: userPrompt },
      ],
      outputSchema: {
        name: "daily_analysis",
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            highlights: { type: "array", items: { type: "string" } },
            alerts: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            roas: { type: "number" },
            spend: { type: "number" },
            revenue: { type: "number" },
          },
          required: ["summary", "highlights", "alerts", "recommendations", "roas", "spend", "revenue"],
        },
      },
    });

    const content = result.choices[0]?.message?.content;
    if (typeof content !== "string") throw new Error("LLM retornou resposta inválida");

    const stripped = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : stripped) as DailyAnalysisResult;
    // Enriquecer com valores calculados se o LLM retornou 0
    if (parsed.spend === 0 && totalSpend > 0) parsed.spend = totalSpend;
    if (parsed.roas === 0 && roas > 0) parsed.roas = Math.round(roas * 100) / 100;
    if (parsed.revenue === 0 && estimatedRevenue > 0) parsed.revenue = estimatedRevenue;

    return parsed;
  } catch (err: any) {
    console.error("[FernandaDaily] Erro LLM:", err.message);
    return {
      summary: `Análise do dia ${today} — erro ao processar dados: ${err.message}`,
      highlights: [],
      alerts: ["Erro ao gerar análise automática — verificar logs"],
      recommendations: [],
      roas,
      spend: totalSpend,
      revenue: estimatedRevenue,
    };
  }
}

// ─── Resumo semanal ───────────────────────────────────────────────────────────

async function generateWeeklySummary(weekPeriod: string): Promise<void> {
  const { getMemoriesByType } = await import("../services/agentMemory");

  const dailyAnalyses = await getMemoriesByType("fernanda", "daily_analysis", 7);
  if (dailyAnalyses.length === 0) {
    console.log("[FernandaDaily] Sem análises diárias para consolidar no resumo semanal");
    return;
  }

  const summariesText = dailyAnalyses
    .map((entry: { period: string; content: string }) => {
      try {
        const data = JSON.parse(entry.content) as DailyAnalysisResult;
        return `[${entry.period}] Spend: R$${data.spend} | ROAS: ${data.roas}x\n${data.summary}`;
      } catch {
        return `[${entry.period}] ${entry.content.slice(0, 200)}`;
      }
    })
    .join("\n\n");

  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é a Fernanda Leal, especialista em tráfego Meta Ads para atacado de moda.
Consolide as análises diárias da semana em um resumo executivo usando a Visão Acordeão (tendência 7 dias, não ponto a ponto).
Aplique as Portas de Influência ao priorizar ações: primeiro otimizações internas, depois novo criativo, depois novo avatar, por último nova oferta.
Para cada criativo com baixo CTR, diagnostique qual Regra de Ouro falhou: Inspirar, Entreter ou Educar.
Use CAC vs LTV como métrica real — ROAS é indicativo, não veredicto.
Retorne JSON: { "summary": "resumo em 3-5 frases com tendência 7d", "totalSpend": number, "avgRoas": number, "keyLearnings": ["aprendizado com causa raiz identificada"], "weekPriorities": ["ação da menor porta de influência possível para o maior impacto"] }`,
      },
      {
        role: "user",
        content: `Semana ${weekPeriod} — análises diárias:\n\n${summariesText}\n\nGere o resumo semanal consolidado.`,
      },
    ],
  });

  const content = result.choices[0]?.message?.content;
  if (typeof content === "string") {
    try {
      const s = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
      const m = s.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(m ? m[0] : s);
      await saveMemory("fernanda", "weekly_summary", weekPeriod, parsed);
      console.log(`[FernandaDaily] Resumo semanal ${weekPeriod} salvo`);
    } catch {
      await saveMemory("fernanda", "weekly_summary", weekPeriod, { summary: content });
    }
  }
}

// ─── Propor ações para o painel de aprovação ─────────────────────────────────

function inferPriority(text: string): "alta" | "media" | "baixa" {
  const low = text.toLowerCase();
  if (/pausar|desativar|urgente|roas.*baix|cpa.*alto|desperd/.test(low)) return "alta";
  if (/monitorar|observar|acompanhar/.test(low)) return "baixa";
  return "media";
}

function inferActionType(text: string): string {
  const low = text.toLowerCase();
  if (/novo anúncio|criar anúncio|novo criativo|criar criativo/.test(low)) return "meta_create_full_ad";
  if (/criativo|banner|imagem|vídeo/.test(low)) return "criativo";
  if (/orçamento|budget|verba|investimento/.test(low)) return "orcamento";
  if (/público|audience|segmentação/.test(low)) return "segmentacao";
  if (/pausar|desativar|ativar|reativar/.test(low)) return "campanha";
  return "campaign";
}

async function proposeActions(analysis: DailyAnalysisResult, today: string): Promise<void> {
  if (!analysis.recommendations || analysis.recommendations.length === 0) return;

  try {
    const db = await getDb();
    if (!db) return;

    const { eq, and } = await import("drizzle-orm");
    const existing = await db
      .select({ title: agentActions.title })
      .from(agentActions)
      .where(and(eq(agentActions.agentName, "fernanda"), eq(agentActions.date, today)));

    const existingTitles = new Set(existing.map((r: { title: string | null }) => r.title));

    const toInsert: typeof agentActions.$inferInsert[] = [];

    for (const rec of analysis.recommendations) {
      if (!rec || !rec.trim()) continue;
      const title = rec.length > 150 ? rec.slice(0, 147) + "…" : rec;
      if (existingTitles.has(title)) continue;

      const actionType = inferActionType(rec);
      let description = rec;

      // Se é para criar novo anúncio, gera o copy criativo
      if (actionType === "meta_create_full_ad") {
        try {
          console.log(`[FernandaDaily] Gerando copy para: "${rec.slice(0, 60)}"`);
          const copy = await generateAdCopy(
            `Contexto da campanha Feminnita Pijamas:\n${rec}\n\nROAS atual: ${analysis.roas}x | Gasto: R$${analysis.spend.toFixed(2)}`
          );
          description = JSON.stringify({
            recommendation: rec,
            copy: {
              headline: copy.headline,
              body: copy.body,
              imageDescription: copy.imageDescription,
            },
            generatedBy: "fernanda",
            linkUrl: "https://www.feminnita.com.br",
          });
          console.log(`[FernandaDaily] Copy gerado: "${copy.headline}"`);
        } catch (err: any) {
          console.error("[FernandaDaily] Falhou ao gerar copy, usando texto simples:", err.message);
        }
      }

      toInsert.push({
        agentName: "fernanda",
        date: today,
        title,
        description,
        actionType,
        priority: inferPriority(rec),
        estimatedImpact: analysis.roas > 0
          ? `ROAS atual: ${analysis.roas}x | Spend: R$${analysis.spend.toFixed(2)}`
          : undefined,
        status: "pending",
      });
    }

    if (toInsert.length > 0) {
      await db.insert(agentActions).values(toInsert);
      console.log(`[FernandaDaily] ${toInsert.length} ações propostas (${toInsert.filter(a => a.actionType === "meta_create_full_ad").length} com copy criativo)`);
    }
  } catch (err: any) {
    console.error("[FernandaDaily] Erro ao propor ações:", err.message);
  }
}

// ─── Execução principal ───────────────────────────────────────────────────────

export async function runDailyAnalysis(): Promise<DailyAnalysisResult> {
  const today = new Date().toISOString().slice(0, 10); // "2026-04-12"

  console.log(`[FernandaDaily] Iniciando análise diária — ${today}`);

  // 1. Carregar contexto histórico
  const memoryContext = await buildMemoryContext("fernanda");

  // 2. Buscar dados reais Meta Ads
  const insights = await fetchCampaignInsights();
  console.log(`[FernandaDaily] ${insights.length} campanhas com dados`);

  // 3. Analisar com LLM
  const analysis = await analyzeWithLLM(insights, memoryContext, today);

  // 4. Persistir no banco
  await saveMemory("fernanda", "daily_analysis", today, analysis);
  console.log(`[FernandaDaily] Análise do dia ${today} salva — ROAS: ${analysis.roas}x | Spend: R$${analysis.spend}`);

  // 5. Propor ações para o painel de aprovação
  await proposeActions(analysis, today);

  // 6. Se domingo (0), gerar resumo semanal
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 0) {
    const weekNumber = getISOWeek(new Date());
    const year = new Date().getFullYear();
    const weekPeriod = `${year}-W${String(weekNumber).padStart(2, "0")}`;
    console.log(`[FernandaDaily] Domingo — gerando resumo semanal ${weekPeriod}`);
    await generateWeeklySummary(weekPeriod);
  }

  return analysis;
}

// ─── Execução automática de ações de baixo risco ─────────────────────────────

async function autoExecuteCampaignActions(insights: MetaCampaignInsight[], today: string): Promise<void> {
  const db = await getDb();

  for (const ins of insights) {
    const spend = parseFloat(ins.spend || "0");
    const ctr = parseFloat(ins.ctr || "0");
    const clicks = parseInt(ins.clicks || "0");

    // Pausa automática: CTR < 0.8% com gasto > R$30 nos últimos 2 dias
    if (ctr < 0.8 && spend > 30 && clicks < 5) {
      try {
        console.log(`[FernandaDaily] Auto-pausando campanha com baixo CTR: ${ins.campaign_name} (CTR: ${ctr.toFixed(2)}%, gasto: R$${spend.toFixed(2)})`);
        await executeMetaAction("meta_pause_campaign", { campaignId: ins.campaign_id });

        if (db) {
          await db.insert(agentActions).values({
            agentName: "fernanda",
            date: today,
            title: `[Auto-executado] Campanha pausada: ${ins.campaign_name}`,
            description: `Campanha pausada automaticamente por baixo desempenho: CTR ${ctr.toFixed(2)}%, gasto R$${spend.toFixed(2)} nos últimos 2 dias.`,
            actionType: "campanha",
            priority: "alta",
            estimatedImpact: `Economia de verba em campanha ineficiente`,
            status: "done",
          });
        }
      } catch (err: any) {
        console.error(`[FernandaDaily] Erro ao pausar ${ins.campaign_name}:`, err.message);
      }
    }
  }
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

export function startFernandaDailyAgent(): () => void {
  console.log(`[FernandaDaily] Agente iniciado. Roda diariamente às ${String(RUN_HOUR).padStart(2, "0")}:00.`);

  const interval = setInterval(async () => {
    const now = new Date();
    if (now.getHours() === RUN_HOUR && lastRunDate !== now.toDateString()) {
      lastRunDate = now.toDateString();
      try {
        const insights = await fetchCampaignInsights();
        const today = now.toISOString().slice(0, 10);

        // Executa ações automáticas antes da análise LLM
        await autoExecuteCampaignActions(insights, today);

        // Análise completa + propostas para aprovação
        await runDailyAnalysis();
      } catch (err: any) {
        console.error("[FernandaDaily] Erro no ciclo diário:", err.message);
      }
    }
  }, 10 * 60 * 1000); // verifica a cada 10 minutos

  return () => {
    clearInterval(interval);
    console.log("[FernandaDaily] Agente encerrado.");
  };
}

// Utilitário: número da semana ISO
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
