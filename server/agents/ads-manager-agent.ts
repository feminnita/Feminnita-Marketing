/**
 * Ads Manager Agent — Gestor de Tráfego Meta Ads
 *
 * Responsabilidade: buscar dados reais da Meta Ads API, analisar com LLM
 * especializado em tráfego para atacado de moda, e gerar relatório de avaliação.
 *
 * NÃO executa ações na conta. Apenas avalia e recomenda.
 */

import { getDb } from "../db";
import { adsEvaluations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import Anthropic from "@anthropic-ai/sdk";

const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || "act_231648936319132";
const META_TOKEN = process.env.META_ACCESS_TOKEN || "";
const GRAPH_BASE = "https://graph.facebook.com/v19.0";

// ─── Tipos ───────────────────────────────────────────────────────────────────

interface CampaignRaw {
  id: string;
  name: string;
  status: string;
  objective: string;
  daily_budget?: string;
  lifetime_budget?: string;
  created_time?: string;
}

interface InsightRaw {
  impressions?: string;
  reach?: string;
  clicks?: string;
  spend?: string;
  cpc?: string;
  ctr?: string;
  cpp?: string;
  actions?: Array<{ action_type: string; value: string }>;
  date_start?: string;
  date_stop?: string;
}

interface CampaignData {
  id: string;
  name: string;
  status: string;
  objective: string;
  dailyBudget: number;
  insights: {
    period: string;
    impressions: number;
    reach: number;
    clicks: number;
    spend: number;
    cpc: number;
    ctr: number;
    cpp: number;
    purchases: number;
    costPerPurchase: number;
    roas: number;
  } | null;
}

export interface CreativeBrief {
  publico: string;
  formato: string;
  visual: string;
  headline: string;
  copy: string;
  cta: string;
  observacoes?: string;
}

export interface AdsEvaluationResult {
  adAccountId: string;
  fetchedAt: string;
  campaigns: CampaignData[];
  analysis: string;
  recommendations: Array<{
    priority: "alta" | "media" | "baixa";
    campanha: string;
    titulo: string;
    descricao: string;
    acao: string;
  }>;
  summary: string;
  creativeBriefs: CreativeBrief[];
}

// ─── Fetch Meta API ───────────────────────────────────────────────────────────

async function fetchCampaigns(): Promise<CampaignRaw[]> {
  const url =
    `${GRAPH_BASE}/${AD_ACCOUNT_ID}/campaigns` +
    `?fields=id,name,status,objective,daily_budget,lifetime_budget,created_time` +
    `&limit=50` +
    `&access_token=${META_TOKEN}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Meta API HTTP ${res.status}`);
  }

  return data.data || [];
}

async function fetchInsights(campaignId: string): Promise<InsightRaw | null> {
  const url =
    `${GRAPH_BASE}/${campaignId}/insights` +
    `?fields=impressions,reach,clicks,spend,cpc,ctr,cpp,actions` +
    `&date_preset=last_7d` +
    `&access_token=${META_TOKEN}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || data.error) {
    console.warn(`[AdsManager] Insights indisponíveis para campanha ${campaignId}: ${data.error?.message}`);
    return null;
  }

  return data.data?.[0] || null;
}

function parseInsights(raw: InsightRaw | null): CampaignData["insights"] {
  if (!raw) return null;

  const impressions = parseInt(raw.impressions || "0");
  const reach = parseInt(raw.reach || "0");
  const clicks = parseInt(raw.clicks || "0");
  const spend = parseFloat(raw.spend || "0");
  const cpc = parseFloat(raw.cpc || "0");
  const ctr = parseFloat(raw.ctr || "0");
  const cpp = parseFloat(raw.cpp || "0");

  const purchases = (raw.actions || [])
    .filter((a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase")
    .reduce((sum, a) => sum + parseFloat(a.value || "0"), 0);

  const costPerPurchase = purchases > 0 ? spend / purchases : 0;

  // ROAS estimado: sem receita real da API — retorna 0 (precisa de dados de Bling)
  const roas = 0;

  const period = raw.date_start && raw.date_stop
    ? `${raw.date_start} a ${raw.date_stop}`
    : "últimos 7 dias";

  return { period, impressions, reach, clicks, spend, cpc, ctr, cpp, purchases, costPerPurchase, roas };
}

// ─── Coleta completa ──────────────────────────────────────────────────────────

export async function collectAdsData(): Promise<{ campaigns: CampaignData[]; adAccountId: string }> {
  const rawCampaigns = await fetchCampaigns();

  const campaigns: CampaignData[] = [];

  for (const c of rawCampaigns) {
    const rawInsights = await fetchInsights(c.id);
    campaigns.push({
      id: c.id,
      name: c.name,
      status: c.status,
      objective: c.objective,
      dailyBudget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : 0,
      insights: parseInsights(rawInsights),
    });
  }

  return { campaigns, adAccountId: AD_ACCOUNT_ID };
}

// ─── Análise LLM ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é a Fernanda Leal — gestora sênior de tráfego pago Meta Ads da Feminnita Pijamas.

═══════════════════════════════════════════════════════
COMO VOCÊ FUNCIONA
═══════════════════════════════════════════════════════
Você NÃO acessa o Meta Ads Manager pelo navegador. O sistema busca os dados da Meta Ads API automaticamente e te entrega. Quando alguém pedir para "entrar no Ads Manager" ou "verificar campanhas", você JÁ TEM esses dados — analise-os diretamente. Nunca diga que não consegue acessar.

═══════════════════════════════════════════════════════
MENTALIDADE CENTRAL — PEDRO SOBRAL
═══════════════════════════════════════════════════════
"O segredo dos anúncios online são os anúncios online."

Isso significa: 80% da sua energia, tempo e atenção vai para o CRIATIVO. Não para público, não para bid, não para estrutura de campanha. O criativo É a variável que move resultado. Tudo o mais é configuração de suporte.

Você pensa assim:
— Antes de qualquer análise, pergunte: "O criativo está certo para este público?"
— Antes de qualquer recomendação, pergunte: "Já esgotei as variações de criativo possíveis?"
— A resposta para quase todo problema de performance começa e termina no anúncio em si.

OS 3 PRÉ-REQUISITOS PARA UMA CAMPANHA FUNCIONAR (Sobral):
1. PERSONA CORRETA: você sabe exatamente para quem está falando, quais são as dores, desejos e linguagem desta pessoa.
2. HOOK IRRESISTÍVEL: o anúncio prende nos primeiros 3 segundos. Fórmula do hook → Pergunta direta que ativa a dor + Sacada contra-intuitiva que desperta curiosidade.
   Exemplo de hook ruim: "Pijamas de qualidade para revender"
   Exemplo de hook certo: "Por que revendedoras do Sul faturam R$3.000/mês vendendo pijamas sem sair de casa?"
3. ESTRUTURA DE CAMPANHA LIMPA: Campanha → Conjunto de Anúncios → Anúncio. Budget no nível da campanha (CBO). Advantage+ Shopping ou Advantage+ Audience ativado. Sem duplicação de públicos entre conjuntos.

PROCESSO DE CRIAÇÃO DE ANÚNCIO EM 10 PASSOS (Sobral):
1. Defina a persona com precisão (não "mulheres 25-45" — defina a Marcia, 34 anos, mãe de 2, vende pelo WhatsApp)
2. Liste as 3 maiores dores desta persona em relação ao produto
3. Liste os 3 maiores desejos desta persona
4. Escolha UMA dor ou UM desejo para este anúncio (foco único)
5. Escreva o hook: pergunta que ativa o ponto escolhido + sacada inesperada
6. Desenvolva o corpo do anúncio provando a sacada com evidência (dado, história, prova social)
7. Faça a oferta com clareza total (o que a pessoa ganha, quanto custa, por quanto tempo)
8. CTA específico e direto (não "Saiba mais" — "Clique e peça seu catálogo agora")
9. Visual alinhado com o texto (o que se vê reforça o que se lê)
10. Teste: 1 variável por vez. Nunca mude hook e visual ao mesmo tempo.

ESTRUTURA DE CAMPANHA RECOMENDADA (Sobral):
- Budget na campanha (CBO), não no conjunto
- Advantage+ Audience ou públicos broad (deixar o Meta trabalhar)
- Nomear campanhas com padrão: [OBJETIVO] | [PÚBLICO] | [CRIATIVO] | [DATA]
- Exemplo: CONV | Revendedora-Sul | Hook-RendaCasa-Banner | 2026-04
- 1 campanha por objetivo claro. Não misture tráfego com conversão.
- Teste A/B de criativo dentro do mesmo conjunto, nunca entre conjuntos diferentes

═══════════════════════════════════════════════════════
MENTALIDADE CENTRAL — NICK SHACKELFORD
═══════════════════════════════════════════════════════
"ROAS sozinho é uma mentira. O que importa é: quanto você gasta para adquirir um cliente e quanto este cliente vale para você ao longo do tempo."

PORTAS DE INFLUÊNCIA (Shackelford) — ordem de alavancagem, da menor para a maior:
1. Otimizações de campanha (bid, budget, objetivo) → impacto pequeno, fácil de fazer
2. Criativo (hook, copy, formato, conceito) → impacto médio-alto, mais trabalhoso
3. Avatar / público-alvo (quem você está alcançando) → impacto alto, requer pesquisa
4. Landing page + oferta única (o que acontece depois do clique) → MAIOR impacto de todos

Implicação: se a campanha não converte, a primeira coisa a checar NÃO é o criativo — é a landing page e a oferta. O criativo pode ser perfeito e a página matar a conversão. Trabalhe de fora para dentro (porta 4 → 1), não de dentro para fora.

SMOKE TEST — Como validar criativo antes de gastar budget alto (Shackelford):
Rode nesta ordem, com budget mínimo suficiente para dados:
1. Imagem estática simples (texto + produto) — se não funciona, a mensagem está errada
2. Motion graphic / GIF animado — se funciona melhor que estática, o problema era atenção
3. UGC (conteúdo de usuário real ou estilo real) — se funciona melhor que motion, o problema era confiança
4. Vídeo completo com demonstração — escala só o que validou nas etapas anteriores
Nunca produza vídeo caro antes de validar com imagem barata.

ACCORDION VIEW — Como tomar decisões com tempo correto (Shackelford):
Decisão de HOJE (D+0 a D+3): Está gastando sem nenhum sinal? CPM absurdo? CTR abaixo de 0.5%? → Pause.
Decisão de 3 DIAS (D+3 a D+7): Há cliques mas sem conversão? Verifique landing page e oferta primeiro. Só então mude criativo.
Decisão de 7 DIAS (D+7 a D+14): Está convertendo com custo dentro do aceitável? → Não toque. Escale budget máximo 20% a cada 3 dias.
Decisão de 14 DIAS (D+14+): Está escalando mas o custo por compra subiu? → É hora de novo criativo, não de mexer no público. A frequência matou o anúncio.

MANIPULAÇÃO DE AOV — Aumentar o valor médio do pedido (Shackelford):
Antes de aumentar budget, pergunte: "Existe algo que posso fazer na oferta para aumentar o ticket médio?"
Táticas: bundle (kit de 3 pijamas com desconto), upsell no checkout, frete grátis acima de valor X, desconto progressivo por quantidade.
Impacto: dobrar o AOV com mesmo ROAS = dobrar o lucro sem aumentar o custo de aquisição.

CAC NATURAL (Shackelford):
Cada negócio tem um CAC sustentável baseado nas suas margens. Calcule sempre:
CAC Máximo Aceitável = (Ticket Médio × Margem) ÷ Mínimo de retorno desejado
Para a Feminnita (ticket atacado ~R$400, margem estimada ~30%): CAC máximo = R$120 para 1x retorno.
ROAS mínimo aceitável = 3.3x (para cobrir custo e ter lucro líquido).
Mas se a revendedora recompra, o LTV aumenta o CAC aceitável — considere isso ao avaliar campanhas de aquisição.

DIVERSIFICAÇÃO DE SINAIS — Como alimentar o algoritmo corretamente (Shackelford):
O Meta precisa de eventos de qualidade para otimizar. Priorize nesta ordem:
1. Purchase (compra confirmada) — sinal mais forte
2. InitiateCheckout (início de checkout) — segundo mais forte
3. AddToCart (adicionar ao carrinho) — terceiro
4. ViewContent (visualização de produto) — sinal fraco, só para TOFU
Nunca otimize para ViewContent quando quer conversão. O algoritmo aprende a entregar para quem vê, não para quem compra.

ESCALE O QUE FUNCIONA, NUNCA CONSERTE O QUE FUNCIONA (Shackelford):
Se uma campanha está performando bem, NÃO MEXA nela. A tentação de "otimizar" uma campanha vencedora mata mais resultados do que qualquer erro. Escale budget, duplique o anúncio vencedor com variações mínimas, mas nunca altere o que está gerando resultado.

PERÍODO DE FORMATURA (Shackelford):
Toda campanha nova passa por uma fase de aprendizado de 7 a 14 dias. Neste período, o algoritmo está testando. Não julgue por ROAS no D+3. Julgue pela TENDÊNCIA: o CPM está caindo? O CTR está subindo? Os primeiros sinais (cliques, visualizações) aparecem? Se sim, deixe rodar.

═══════════════════════════════════════════════════════
CONTEXTO DA CONTA — FEMINNITA PIJAMAS
═══════════════════════════════════════════════════════
- Produto: pijamas de atacado para revendedoras
- Ticket médio: ~R$400 por pedido
- Público-alvo: revendedoras nas regiões Sul e Sudeste do Brasil
- Histórico comprovado: banners estáticos performam MELHOR que vídeos nesta conta
- Evento de conversão: Purchase via API de Conversões (Pixel 1167582397593975)
- Orçamento atual: ~R$25/dia por campanha
- Meta financeira da empresa: de R$20K/mês para R$100K/mês — tráfego pago é alavanca crítica

OS 3 PERFIS DE PÚBLICO DA FEMINNITA (use sempre ao criar briefs):
1. REVENDEDORA LOJISTA — MEI ou Simples Nacional, loja física pequena ou brechó, busca fornecedor confiável com preço de atacado e produtos diferenciados. Hook certo: margem, giro, diferenciação de portfólio.
2. REVENDEDORA AUTÔNOMA / RENDA EXTRA — Não pode trabalhar fora (filhos, saúde, familiar) ou quer complementar renda. Vende pelo WhatsApp e Instagram. Hook certo: liberdade, renda de casa, começar sem estoque.
3. COMPRA EM GRUPO / FAMÍLIA — Pessoas físicas que se unem para atingir mínimo de atacado. Querem preço de fábrica sem CNPJ. Hook certo: economia inteligente, comprar junto, poder de grupo.

BENCHMARKS DESTA CONTA:
- CTR saudável: 1.5%–3.5%
- CPM saudável: R$15–R$40
- Custo por compra aceitável: até R$120 (baseado no CAC natural calculado)
- ROAS mínimo sustentável: 3.3x

═══════════════════════════════════════════════════════
COMO VOCÊ ANALISA E RESPONDE
═══════════════════════════════════════════════════════
Ao receber dados de campanha, siga esta ordem de raciocínio:
1. PORTA 4 PRIMEIRO: A oferta e a landing page estão corretas? O ticket médio pode ser aumentado?
2. PORTA 3: O público está correto? A campanha está falando com quem deve?
3. PORTA 2: O criativo está alinhado com a persona? O hook está funcionando? Qual fase do Smoke Test está sendo aplicada?
4. PORTA 1: Apenas depois de validar as portas acima, olhe para bid, budget e estrutura de campanha.

Ao usar o Accordion View ao analisar campanhas:
- Campanhas com menos de 3 dias: não julgue performance, julgue sinais iniciais (CPM, CTR, frequência)
- Campanhas com 3-7 dias: foque na relação clique → conversão → oferta
- Campanhas com 7-14 dias: avalie custo por resultado e tendência de CAC
- Campanhas com 14+ dias: olhe frequência (>3x = fadiga), escala possível ou troca de criativo

Ao recomendar novos criativos, aplique o Smoke Test:
- Se ainda não validou imagem estática → comece por aí
- Se imagem estática valida → proponha motion graphic ou UGC
- Nunca proponha vídeo completo sem antes validar formatos mais simples

Seja direto. Fale como uma gestora experiente conversando com o dono da empresa. Nada de teorias genéricas — só o que move resultado nesta conta.

═══════════════════════════════════════════════════════
BRIEFS DE CRIATIVO
═══════════════════════════════════════════════════════
Todo brief deve aplicar o processo Sobral + a fase correta do Smoke Test de Shackelford.
Campos obrigatórios:
- publico: qual dos 3 perfis (Lojista / Revendedora Autônoma / Compra em Grupo) + descrição da persona específica
- formato: Banner estático / Motion graphic / UGC / Vídeo completo / Story — e QUAL FASE DO SMOKE TEST
- visual: descrição detalhada do que deve aparecer (produto, modelo, cenário, cores, composição)
- headline: hook completo usando fórmula Sobral (pergunta + sacada) — até 40 caracteres
- copy: corpo do anúncio em 2-3 frases: prova da sacada + oferta + urgência
- cta: botão específico e direto (não "Saiba mais" — use algo como "Quero ser revendedora" ou "Ver catálogo agora")
- observacoes: detalhes técnicos (tamanho, proporção, fundo, fonte) + qual dor/desejo este criativo ativa

Formato de resposta: JSON com os campos "analysis" (texto corrido em português), "recommendations" (array com priority, campanha, titulo, descricao, acao), "summary" (1 frase resumindo o estado da conta) e "creativeBriefs" (array de briefs — vazio [] se não houver recomendação de novo criativo).`;

export async function analyzeWithLLM(
  campaigns: CampaignData[]
): Promise<Pick<AdsEvaluationResult, "analysis" | "recommendations" | "summary" | "creativeBriefs">> {
  const dataStr = JSON.stringify(campaigns, null, 2);

  const result = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Avalie o estado atual da conta Meta Ads com os dados abaixo e gere o relatório completo.\n\nDados das campanhas:\n${dataStr}`,
      },
    ],
    outputSchema: {
      name: "ads_evaluation",
      schema: {
        type: "object",
        properties: {
          analysis: { type: "string" },
          summary: { type: "string" },
          recommendations: {
            type: "array",
            items: {
              type: "object",
              properties: {
                priority: { type: "string", enum: ["alta", "media", "baixa"] },
                campanha: { type: "string" },
                titulo: { type: "string" },
                descricao: { type: "string" },
                acao: { type: "string" },
              },
              required: ["priority", "campanha", "titulo", "descricao", "acao"],
            },
          },
          creativeBriefs: {
            type: "array",
            items: {
              type: "object",
              properties: {
                publico: { type: "string" },
                formato: { type: "string" },
                visual: { type: "string" },
                headline: { type: "string" },
                copy: { type: "string" },
                cta: { type: "string" },
                observacoes: { type: "string" },
              },
              required: ["publico", "formato", "visual", "headline", "copy", "cta"],
            },
          },
        },
        required: ["analysis", "summary", "recommendations", "creativeBriefs"],
      },
    },
  });

  const content = result.choices[0]?.message?.content;
  if (typeof content !== "string") throw new Error("LLM retornou resposta inválida");

  // Extrai JSON mesmo se vier dentro de ```json ... ```
  const stripped = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

  try {
    return JSON.parse(stripped);
  } catch {
    // Tenta extrair objeto JSON de qualquer posição no texto
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { return JSON.parse(jsonMatch[0]); } catch {}
    }
    // Fallback limpo — sem expor JSON cru
    return {
      analysis: stripped.replace(/^```[\w]*\n?/gm, "").replace(/```$/gm, "").trim(),
      summary: "Avaliação concluída — veja a análise completa abaixo.",
      recommendations: [],
      creativeBriefs: [],
    };
  }
}

// ─── Chat follow-up ───────────────────────────────────────────────────────────

export async function chatWithAgent(
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  rawMetrics: string,
  imageBase64?: string,
  imageMimeType?: string
): Promise<string> {
  const systemContent = SYSTEM_PROMPT +
    `\n\nDados da avaliação que você acabou de fazer:\n${rawMetrics}\n\nIMPORTANTE: Responda SEMPRE em texto corrido, em português brasileiro, de forma direta e prática. NUNCA use JSON, markdown, blocos de código ou listas técnicas. Fale como uma gestora de tráfego experiente conversando com o dono da empresa.`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });
  const model = process.env.CLAUDE_MODEL || "claude-haiku-4-5-20251001";

  // Monta o histórico sem a última mensagem
  const anthropicMessages: Anthropic.MessageParam[] = conversationHistory
    .slice(0, -1)
    .map((m) => ({ role: m.role, content: m.content }));

  // Última mensagem — com ou sem imagem
  if (conversationHistory.length > 0) {
    const last = conversationHistory[conversationHistory.length - 1];
    if (last.role === "user" && imageBase64) {
      const mime = (imageMimeType || "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
      anthropicMessages.push({
        role: "user",
        content: [
          { type: "text", text: last.content || "Analise esta imagem para a campanha." },
          { type: "image", source: { type: "base64", media_type: mime, data: imageBase64 } },
        ],
      });
    } else {
      anthropicMessages.push({ role: last.role, content: last.content });
    }
  }

  const response = await anthropic.messages.create({
    model,
    max_tokens: 1500,
    system: systemContent,
    messages: anthropicMessages,
  });

  const text = response.content.filter((b) => b.type === "text").map((b) => (b as Anthropic.TextBlock).text).join("");
  return text || "Não consegui processar a resposta. Tente novamente.";
}

// ─── Execução principal (chamada pelo router) ─────────────────────────────────

export async function runAdsEvaluation(evaluationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");

  try {
    await db
      .update(adsEvaluations)
      .set({ status: "running" })
      .where(eq(adsEvaluations.id, evaluationId));

    if (!META_TOKEN) {
      await db
        .update(adsEvaluations)
        .set({
          status: "error",
          errorMessage: "META_ACCESS_TOKEN não configurado no servidor",
          completedAt: new Date(),
        })
        .where(eq(adsEvaluations.id, evaluationId));
      return;
    }

    const { campaigns, adAccountId } = await collectAdsData();
    const llmResult = await analyzeWithLLM(campaigns);

    await db
      .update(adsEvaluations)
      .set({
        status: "done",
        adAccountId,
        rawMetrics: JSON.stringify(campaigns),
        analysis: llmResult.analysis,
        recommendations: JSON.stringify(llmResult.recommendations),
        creativeBriefs: JSON.stringify(llmResult.creativeBriefs ?? []),
        summary: llmResult.summary,
        completedAt: new Date(),
      })
      .where(eq(adsEvaluations.id, evaluationId));

    console.log(`[AdsManager] Avaliação ${evaluationId} concluída — ${campaigns.length} campanhas analisadas`);
  } catch (err: any) {
    console.error(`[AdsManager] Erro na avaliação ${evaluationId}:`, err);
    await db
      .update(adsEvaluations)
      .set({
        status: "error",
        errorMessage: err.message?.slice(0, 499) || "Erro desconhecido",
        completedAt: new Date(),
      })
      .where(eq(adsEvaluations.id, evaluationId));
  }
}
