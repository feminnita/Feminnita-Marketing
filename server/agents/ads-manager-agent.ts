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
  effective_status?: string;
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

interface AdRaw {
  id: string;
  name: string;
  status: string;
  created_time?: string;
}

interface CampaignData {
  id: string;
  name: string;
  status: string;
  effectiveStatus?: string;
  objective: string;
  dailyBudget: number;
  ads?: Array<{ id: string; name: string; status: string }>;
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
    `?fields=id,name,status,effective_status,objective,daily_budget,lifetime_budget,created_time` +
    `&limit=50` +
    `&access_token=${META_TOKEN}`;

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok || data.error) {
    throw new Error(data.error?.message || `Meta API HTTP ${res.status}`);
  }

  return data.data || [];
}

async function fetchWithTimeout(url: string, timeoutMs = 8000): Promise<any> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    const data = await res.json();
    return { ok: res.ok, data };
  } finally {
    clearTimeout(timer);
  }
}

async function fetchInsights(campaignId: string): Promise<InsightRaw | null> {
  const url =
    `${GRAPH_BASE}/${campaignId}/insights` +
    `?fields=impressions,reach,clicks,spend,cpc,ctr,cpp,actions` +
    `&date_preset=last_7d` +
    `&access_token=${META_TOKEN}`;

  try {
    const { ok, data } = await fetchWithTimeout(url);
    if (!ok || data.error) {
      console.warn(`[AdsManager] Insights indisponíveis para campanha ${campaignId}: ${data.error?.message}`);
      return null;
    }
    return data.data?.[0] || null;
  } catch (err: any) {
    console.warn(`[AdsManager] Timeout/erro em insights ${campaignId}: ${err.message}`);
    return null;
  }
}

async function fetchAds(campaignId: string): Promise<AdRaw[]> {
  const url =
    `${GRAPH_BASE}/${campaignId}/ads` +
    `?fields=id,name,status,created_time` +
    `&limit=50` +
    `&access_token=${META_TOKEN}`;

  try {
    const { ok, data } = await fetchWithTimeout(url);
    if (!ok || data.error) {
      console.warn(`[AdsManager] Ads indisponíveis para campanha ${campaignId}: ${data.error?.message}`);
      return [];
    }
    return data.data || [];
  } catch (err: any) {
    console.warn(`[AdsManager] Timeout/erro em ads ${campaignId}: ${err.message}`);
    return [];
  }
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

export async function collectAdsData(includeAds = false): Promise<{ campaigns: CampaignData[]; adAccountId: string }> {
  const rawCampaigns = await fetchCampaigns();

  // Busca insights (e ads) de todas as campanhas em paralelo
  const campaigns = await Promise.all(rawCampaigns.map(async (c) => {
    const [rawInsights, rawAds] = await Promise.all([
      fetchInsights(c.id),
      includeAds ? fetchAds(c.id) : Promise.resolve([]),
    ]);
    return {
      id: c.id,
      name: c.name,
      status: c.status,
      objective: c.objective,
      dailyBudget: c.daily_budget ? parseFloat(c.daily_budget) / 100 : 0,
      effectiveStatus: c.effective_status,
      ads: rawAds.length > 0 ? rawAds.map((a) => ({ id: a.id, name: a.name, status: a.status })) : undefined,
      insights: parseInsights(rawInsights),
    };
  }));

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
METODOLOGIA BARRY HOTT — LANDING PAGES E RELEVÂNCIA META
═══════════════════════════════════════════════════════
Barry Hott estudou bilhões de dólares em anúncios desde 2008. Seu maior ensinamento: landing page não é só taxa de conversão — ela define QUEM o Meta vai buscar a seguir.

COMO O META APRENDE:
O Meta aprende qual combinação de anúncio + landing page + usuário converte. Quando você muda a landing page, você muda quem o Meta vai alcançar. Relevância é tudo — o algoritmo não entrega para qualquer pessoa, ele entrega para as pessoas certas para aquela combinação específica.

MUDANÇAS NA LANDING PAGE MUDAM O PÚBLICO:
- Trocar o título de "para mães ocupadas" para "para atletas" → muda completamente quem o Meta busca
- Trocar a imagem principal → muda quem se identifica com a página
- Trocar o botão de "Saiba mais" para "Comprar agora" → atrai quem já está pronto para comprar, mas afasta quem ainda precisa ser convencido
- Essas mudanças são subconscientes — o usuário não percebe, mas o algoritmo percebe nos dados

O PROBLEMA COM TESTE A/B EXTERNO:
Ferramentas de A/B test externas (fora do Meta) são problemáticas para mudanças grandes porque:
- O Meta não sabe que você está testando duas páginas
- Ele continua otimizando baseado no histórico do anúncio
- O tráfego dividido dilui os sinais de relevância
- Uma página boa pode parecer ruim porque nunca encontrou a audiência certa
- Duas semanas de teste muitas vezes não são suficientes para o sistema entender

A MANEIRA CERTA DE TESTAR LANDING PAGES (Barry Hott):
1. Pegue seus melhores anúncios (os que mais gastam e convertem)
2. DUPLIQUE-os em novos conjuntos de anúncios idênticos
3. Aponte cada versão duplicada para a nova landing page
4. Mantenha tudo igual: mesmo criativo, mesmo público, mesmo bid
5. Deixe o Meta otimizar cada combinação de forma independente
6. Compare o desempenho com a campanha original ao longo do tempo
7. IMPORTANTE: às vezes manter as DUAS páginas rodando é melhor que escolher uma — cada página pode ser mais relevante para públicos diferentes

QUANDO USAR A/B TEST EXTERNO:
Apenas para mudanças pequenas que não afetam quem vai se identificar com a página — uma cor de botão, um detalhe de texto. Para mudanças grandes (novo visual, nova proposta, nova oferta), sempre use anúncios dedicados.

HOMEPAGE TAMBÉM AFETA ADS:
Mudar a imagem principal da homepage afeta o desempenho dos anúncios — mesmo que os anúncios não direcionem para a homepage. Usuários chegam lá de outras formas e o algoritmo aprende com isso.

PRINCÍPIO CENTRAL DO BARRY HOTT:
"Não somos cientistas. O objetivo é escalar e ganhar dinheiro. Às vezes escalar é mais valioso do que entender exatamente por que algo funciona. Minimize variáveis — não mude várias coisas ao mesmo tempo."

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
SEGMENTAÇÃO E LANÇAMENTO — A QUEM MOSTRAR E COMO SUBIR (regra desta conta)
═══════════════════════════════════════════════════════
O dono desta conta NÃO é especialista em tráfego. Você NUNCA o deixa no escuro sobre "para quem mostrar o anúncio". Sempre que houver campanha nova ou dúvida de público, você entrega UMA recomendação concreta e fechada — público, gênero, idade, região, orçamento e estrutura — nunca uma lista de opções para ele escolher. Decida você; ele só aprova.

GROUNDING OBRIGATÓRIO ANTES DE RECOMENDAR PÚBLICO (nunca chute):
1. get_custom_audiences → veja quais públicos JÁ existem (compradores, visitantes, semelhantes). Reaproveite antes de criar.
2. search_interests → confirme que um interesse EXISTE no Meta e qual o tamanho real dele. NUNCA invente nome de interesse — busque e use exatamente o que a ferramenta retornar.
3. Se faltar um público necessário, CRIE você mesma com create_pixel_audience / create_lookalike_audience. Nunca peça para o dono montar público manualmente.

A ESCADA DE PÚBLICO DA FEMINNITA (do quente ao frio — ordem de retorno real):
1. QUENTE / Retargeting (maior retorno — comece por aqui se já existe tráfego no site): quem visitou, adicionou ao carrinho ou iniciou compra nos últimos 30–90 dias e NÃO comprou. Crie com create_pixel_audience (evento AddToCart ou InitiateCheckout, excluindo Purchase). Orçamento pequeno, retorno alto.
2. SEMELHANTE / Lookalike (melhor público frio que existe) — quando o pixel já tem ~100+ compras: semelhante 1% aos compradores, via create_lookalike_audience a partir do público de compradores. O Meta acha quem se parece com quem JÁ comprou.
3. FRIO por interesse — enquanto não há dados suficientes para semelhante: Advantage+ (público amplo, deixa o Meta achar) OU 1 conjunto com pilha de 3–5 interesses validados no search_interests. Interesses plausíveis aqui: revenda/sacoleira, empreendedorismo feminino, renda extra, moda íntima/pijama, lojistas. Sempre confirme nome e tamanho pela ferramenta.

DEFAULTS DE SEGMENTAÇÃO DESTA CONTA (ponto de partida):
- Gênero: mulheres (o comprador é majoritariamente feminino).
- Idade: 25–55 (núcleo da revendedora).
- Localização: Brasil, com prioridade Sul e Sudeste (onde está o histórico). Com orçamento baixo, pode rodar Brasil inteiro e deixar o Meta concentrar.
- Exclusão obrigatória no frio: excluir quem já comprou, para não pagar de novo por cliente que já é seu.

LANÇAR DO ZERO — BLUEPRINT DE 1 CAMPANHA (entregue pronto, em linguagem simples):
- Objetivo: Vendas, otimizando para Compra (o sinal mais forte). Nunca otimizar para clique/visualização quando se quer venda.
- Estrutura: 1 campanha com orçamento na campanha (CBO). Dentro: 1 conjunto Advantage+ (amplo) para o Meta achar o comprador + 1 conjunto de retargeting quente. Mesmo criativo vencedor nos dois.
- Orçamento de partida: R$25–50/dia na campanha. Só escale (no máximo +20% a cada 3 dias) depois de estabilizar.
- Aprendizado: 7–14 dias. Não julgue nos 3 primeiros dias — olhe se o custo está caindo e os cliques aparecendo.
- O que testar primeiro: o CRIATIVO, mantendo o público amplo. Público se ajusta depois; o que mais move resultado é o anúncio certo para a pessoa certa.

A regra dos "80% criativo" continua valendo — MAS o público precisa estar montado certo UMA vez para o criativo ter onde funcionar. Montar a escada de público acima é a fundação. Com ela pronta, sua energia volta para o criativo.

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

  // Resumo legível dos anúncios por campanha para o LLM não ignorar
  const adsSummary = campaigns.map(c => {
    const effLabel = c.effectiveStatus && c.effectiveStatus !== c.status
      ? ` | effective_status: ${c.effectiveStatus}`
      : "";
    const adsList = c.ads && c.ads.length > 0
      ? c.ads.map(a => `    • [${a.status}] ${a.name} (ID: ${a.id})`).join("\n")
      : "    (nenhum anúncio encontrado nesta busca)";
    return `Campanha: ${c.name} [status: ${c.status}${effLabel}]\n  Anúncios (${c.ads?.length ?? 0}):\n${adsList}`;
  }).join("\n\n");

  const result = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Avalie o estado atual da conta Meta Ads com os dados abaixo e gere o relatório completo.

REGRA CRÍTICA SOBRE STATUS:
- O campo "status" é o status da CAMPANHA em si (ACTIVE, PAUSED).
- O campo "effective_status" considera também status de níveis superiores (conta, carteira).
- Um anúncio individual com status PAUSED NÃO SIGNIFICA que a campanha está pausada.
- Uma campanha pode estar ACTIVE mesmo que alguns anúncios dentro dela estejam PAUSED.
- Nunca diga que uma campanha está pausada baseado no status dos anúncios dentro dela.
- Se uma campanha tem status ACTIVE, diga claramente que ela está ATIVA, mesmo que haja anúncios PAUSED dentro.

ATENÇÃO: Os dados incluem os anúncios individuais dentro de cada campanha. Na sua análise, liste explicitamente:
1. O status de cada CAMPANHA (ACTIVE ou PAUSED)
2. Quantos anúncios existem por campanha e quais estão ACTIVE vs PAUSED
Não confunda o status da campanha com o status dos anúncios dentro dela.

━━━ ANÚNCIOS POR CAMPANHA ━━━
${adsSummary}

━━━ DADOS COMPLETOS (campanhas + métricas) ━━━
${dataStr}`,
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

// ─── Ferramentas disponíveis no chat ─────────────────────────────────────────

import {
  fetchMetaCampaignsList,
  fetchMetaAdsets,
  fetchMetaInsights,
  fetchMetaAdsData,
  fetchMetaAds,
  pauseCampaign,
  resumeCampaign,
  pauseAdset,
  resumeAdset,
  pauseAd,
  resumeAd,
  updateCampaignBudget,
  updateAdsetBudget,
} from "../services/meta-ads-service";

import {
  getCustomAudiences,
  searchInterests,
  createPixelAudience,
  createLookalikeAudience,
} from "./fernanda-executor";

const CHAT_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_account_summary",
    description: "Retorna resumo geral da conta: gasto hoje, gasto no mês e campanhas com métricas.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "get_meta_campaigns",
    description: "Lista campanhas com status, objetivo e métricas. Use para visão geral ou status de campanhas.",
    input_schema: {
      type: "object" as const,
      properties: {
        date_preset: { type: "string", enum: ["today", "yesterday", "last_7d", "last_14d", "last_30d", "this_month"] },
      },
      required: [],
    },
  },
  {
    name: "get_meta_adsets",
    description: "Lista conjuntos de anúncios com budget, status e métricas.",
    input_schema: {
      type: "object" as const,
      properties: {
        campaign_id: { type: "string", description: "ID da campanha (opcional)" },
      },
      required: [],
    },
  },
  {
    name: "get_meta_ads",
    description: "Busca anúncios individuais com criativo (body, title, URL destino, CTA) e métricas. Use para ver criativos ou landing pages.",
    input_schema: {
      type: "object" as const,
      properties: {
        campaign_id: { type: "string", description: "ID da campanha (opcional)" },
        adset_id: { type: "string", description: "ID do adset (opcional)" },
      },
      required: [],
    },
  },
  {
    name: "fetch_landing_page",
    description: "Acessa uma URL e extrai o texto da página (oferta, preço, copy, CTA). Use após ter a URL de destino de um anúncio.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: { type: "string", description: "URL completa da landing page" },
      },
      required: ["url"],
    },
  },
  {
    name: "pause_campaign",
    description: "Pausa uma campanha ativa. Use quando o usuário aprovar explicitamente ou pedir para pausar.",
    input_schema: {
      type: "object" as const,
      properties: {
        campaign_id: { type: "string", description: "ID da campanha a pausar" },
        campaign_name: { type: "string", description: "Nome da campanha (para confirmação)" },
      },
      required: ["campaign_id"],
    },
  },
  {
    name: "resume_campaign",
    description: "Reativa uma campanha pausada.",
    input_schema: {
      type: "object" as const,
      properties: {
        campaign_id: { type: "string", description: "ID da campanha a reativar" },
      },
      required: ["campaign_id"],
    },
  },
  {
    name: "pause_adset",
    description: "Pausa um conjunto de anúncios.",
    input_schema: {
      type: "object" as const,
      properties: {
        adset_id: { type: "string", description: "ID do adset a pausar" },
      },
      required: ["adset_id"],
    },
  },
  {
    name: "resume_adset",
    description: "Reativa um conjunto de anúncios pausado.",
    input_schema: {
      type: "object" as const,
      properties: {
        adset_id: { type: "string", description: "ID do adset a reativar" },
      },
      required: ["adset_id"],
    },
  },
  {
    name: "pause_ad",
    description: "Pausa um anúncio individual dentro de um conjunto de anúncios.",
    input_schema: {
      type: "object" as const,
      properties: {
        ad_id: { type: "string", description: "ID do anúncio a pausar" },
        ad_name: { type: "string", description: "Nome do anúncio (para log)" },
      },
      required: ["ad_id"],
    },
  },
  {
    name: "resume_ad",
    description: "Reativa um anúncio individual pausado dentro de um conjunto de anúncios.",
    input_schema: {
      type: "object" as const,
      properties: {
        ad_id: { type: "string", description: "ID do anúncio a reativar" },
        ad_name: { type: "string", description: "Nome do anúncio (para log)" },
      },
      required: ["ad_id"],
    },
  },
  {
    name: "update_campaign_budget",
    description: "Atualiza o budget diário de uma campanha (CBO). Valor em reais — ex: 50 para R$50/dia.",
    input_schema: {
      type: "object" as const,
      properties: {
        campaign_id: { type: "string", description: "ID da campanha" },
        daily_budget_brl: { type: "number", description: "Novo budget diário em reais" },
      },
      required: ["campaign_id", "daily_budget_brl"],
    },
  },
  {
    name: "update_adset_budget",
    description: "Atualiza o budget diário de um conjunto de anúncios. Valor em reais.",
    input_schema: {
      type: "object" as const,
      properties: {
        adset_id: { type: "string", description: "ID do adset" },
        daily_budget_brl: { type: "number", description: "Novo budget diário em reais" },
      },
      required: ["adset_id", "daily_budget_brl"],
    },
  },
  {
    name: "get_custom_audiences",
    description: "Lista os públicos personalizados que JÁ existem na conta (compradores, visitantes, retargeting, semelhantes) com tamanho aproximado. Use SEMPRE antes de recomendar ou criar público novo, para reaproveitar o que existe.",
    input_schema: { type: "object" as const, properties: {}, required: [] },
  },
  {
    name: "search_interests",
    description: "Busca interesses reais de segmentação no Meta e retorna o nome oficial, ID e tamanho de alcance. Use para validar que um interesse existe antes de sugeri-lo — nunca invente nomes de interesse.",
    input_schema: {
      type: "object" as const,
      properties: {
        q: { type: "string", description: "Termo a buscar (ex: 'revenda de roupas', 'empreendedorismo feminino')" },
      },
      required: ["q"],
    },
  },
  {
    name: "create_pixel_audience",
    description: "Cria um público de retargeting a partir de eventos do pixel (ex: quem adicionou ao carrinho e não comprou). Não gasta dinheiro — só monta o público para uso futuro.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Nome do público (ex: 'Carrinho 30d sem compra')" },
        event: { type: "string", description: "Evento do pixel: AddToCart, InitiateCheckout, ViewContent, PageView ou Purchase" },
        retention_days: { type: "number", description: "Janela em dias (padrão 90)" },
        exclude_event: { type: "string", description: "Evento a excluir, ex: 'Purchase' para tirar quem já comprou" },
      },
      required: ["name", "event"],
    },
  },
  {
    name: "create_lookalike_audience",
    description: "Cria um público semelhante (lookalike) a partir de um público de origem (ex: compradores). Use o get_custom_audiences antes para pegar o ID do público de origem. Não gasta dinheiro.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string", description: "Nome do público semelhante" },
        origin_audience_id: { type: "string", description: "ID do público de origem (ex: compradores)" },
        ratio_pct: { type: "number", description: "Grau de semelhança: 1 = 1% (mais parecido), até 10" },
      },
      required: ["name", "origin_audience_id"],
    },
  },
];

async function executeChatTool(name: string, input: Record<string, any>): Promise<string> {
  try {
    if (name === "get_account_summary") {
      const data = await fetchMetaAdsData();
      if (data.error) return JSON.stringify({ error: data.error });
      return JSON.stringify({
        spendToday: `R$${data.spendToday.toFixed(2)}`,
        spendMonth: `R$${data.spendMonth.toFixed(2)}`,
        campaigns: data.campaigns.map((c) => ({
          id: c.id, name: c.name, status: c.status,
          spend: `R$${c.spend.toFixed(2)}`, roas: c.roas?.toFixed(2) ?? "N/D",
          cpm: `R$${c.cpm.toFixed(2)}`, ctr: `${c.ctr.toFixed(2)}%`,
        })),
      });
    }
    if (name === "get_meta_campaigns") {
      const [campaigns, insights] = await Promise.all([
        fetchMetaCampaignsList(),
        fetchMetaInsights("campaign", input.date_preset || "last_7d"),
      ]);
      const insMap: Record<string, any> = {};
      for (const row of insights) insMap[row.campaign_id || row.campaign_name] = row;
      return JSON.stringify(campaigns.map((c) => {
        const ins = insMap[c.id] || {};
        const spend = parseFloat(ins.spend || "0");
        const purchaseAction = (ins.actions || []).find((a: any) => a.action_type === "purchase" || a.action_type === "omni_purchase");
        const revenue = purchaseAction ? parseFloat(purchaseAction.value) : 0;
        return {
          id: c.id, name: c.name,
          status: c.status,
          status_note: c.status === "ACTIVE" ? "CAMPANHA ATIVA" : "CAMPANHA PAUSADA",
          objective: c.objective,
          spend: `R$${spend.toFixed(2)}`,
          roas: spend > 0 && revenue > 0 ? (revenue / spend).toFixed(2) + "x" : "N/D",
          cpm: ins.cpm ? `R$${parseFloat(ins.cpm).toFixed(2)}` : "N/D",
          ctr: ins.ctr ? `${parseFloat(ins.ctr).toFixed(2)}%` : "N/D",
        };
      }));
    }
    if (name === "get_meta_adsets") {
      const adsets = await fetchMetaAdsets(input.campaign_id);
      return JSON.stringify(adsets.map((a) => ({
        id: a.id, name: a.name, campaign: a.campaignName, status: a.status,
        dailyBudget: a.dailyBudget ? `R$${a.dailyBudget.toFixed(2)}` : undefined,
        spend: `R$${a.spend.toFixed(2)}`, roas: a.roas ? a.roas.toFixed(2) + "x" : "N/D",
        ctr: `${a.ctr.toFixed(2)}%`,
      })));
    }
    if (name === "get_meta_ads") {
      const ads = await fetchMetaAds(input.adset_id, input.campaign_id);
      return JSON.stringify(ads.map((ad) => ({
        id: ad.id, name: ad.name, status: ad.status,
        copy_titulo: ad.title || "N/D", copy_texto: ad.body || "N/D",
        cta: ad.callToActionType || "N/D", url_destino: ad.linkUrl || "N/D",
        spend: `R$${ad.spend.toFixed(2)}`, ctr: `${ad.ctr.toFixed(2)}%`,
        roas: ad.roas ? ad.roas.toFixed(2) + "x" : "N/D",
      })));
    }
    if (name === "get_custom_audiences") {
      return await getCustomAudiences();
    }
    if (name === "search_interests") {
      return await searchInterests(input.q, 12);
    }
    if (name === "create_pixel_audience") {
      const pixelId = process.env.META_PIXEL_ID || "1167582397593975";
      return await createPixelAudience({
        name: input.name,
        pixelId,
        event: input.event,
        retentionDays: input.retention_days || 90,
        excludeEvent: input.exclude_event,
      });
    }
    if (name === "create_lookalike_audience") {
      return await createLookalikeAudience({
        name: input.name,
        originAudienceId: input.origin_audience_id,
        ratioPct: input.ratio_pct || 1,
      });
    }
    if (name === "fetch_landing_page") {
      const url = input.url as string;
      if (!url?.startsWith("http")) return JSON.stringify({ error: "URL inválida" });
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" }, signal: AbortSignal.timeout(10000) });
      const html = await res.text();
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s{2,}/g, " ").trim().slice(0, 4000);
      return JSON.stringify({ url, content: text });
    }
    if (name === "pause_campaign") {
      await pauseCampaign(input.campaign_id);
      return JSON.stringify({ success: true, message: `Campanha ${input.campaign_name || input.campaign_id} pausada.` });
    }
    if (name === "resume_campaign") {
      await resumeCampaign(input.campaign_id);
      return JSON.stringify({ success: true, message: `Campanha ${input.campaign_id} reativada.` });
    }
    if (name === "pause_adset") {
      await pauseAdset(input.adset_id);
      return JSON.stringify({ success: true, message: `Adset ${input.adset_id} pausado.` });
    }
    if (name === "resume_adset") {
      await resumeAdset(input.adset_id);
      return JSON.stringify({ success: true, message: `Adset ${input.adset_id} reativado.` });
    }
    if (name === "pause_ad") {
      await pauseAd(input.ad_id);
      return JSON.stringify({ success: true, message: `Anúncio ${input.ad_name || input.ad_id} pausado.` });
    }
    if (name === "resume_ad") {
      await resumeAd(input.ad_id);
      return JSON.stringify({ success: true, message: `Anúncio ${input.ad_name || input.ad_id} reativado.` });
    }
    if (name === "update_campaign_budget") {
      const cents = Math.round(input.daily_budget_brl * 100);
      await updateCampaignBudget(input.campaign_id, cents);
      return JSON.stringify({ success: true, message: `Budget da campanha ${input.campaign_id} atualizado para R$${input.daily_budget_brl}/dia.` });
    }
    if (name === "update_adset_budget") {
      const cents = Math.round(input.daily_budget_brl * 100);
      await updateAdsetBudget(input.adset_id, cents);
      return JSON.stringify({ success: true, message: `Budget do adset ${input.adset_id} atualizado para R$${input.daily_budget_brl}/dia.` });
    }
    return JSON.stringify({ error: `Ferramenta desconhecida: ${name}` });
  } catch (err: any) {
    return JSON.stringify({ error: err.message });
  }
}

// ─── Chat follow-up ───────────────────────────────────────────────────────────

export async function chatWithAgent(
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  rawMetrics: string,
  imageBase64?: string,
  imageMimeType?: string,
  userName?: string
): Promise<string> {
  const systemContent = SYSTEM_PROMPT + `

${userName ? `NOME DO USUÁRIO: Chame-o(a) de "${userName}" durante a conversa.` : ""}

CONTEXTO DESTA CONVERSA: Você acabou de analisar a conta. Dados da avaliação:
${rawMetrics}

FERRAMENTAS DISPONÍVEIS: Você tem acesso direto à Meta Ads API. Use as ferramentas para buscar dados atualizados, executar ações (pausar, reativar, alterar budget) sem pedir permissão ao usuário para ações que você já diagnosticou como necessárias. Quando o usuário pedir uma ação, execute-a diretamente usando a ferramenta correta.

REGRA CRÍTICA SOBRE STATUS DE CAMPANHAS:
- Uma campanha com status ACTIVE está ATIVA — mesmo que os anúncios dentro dela estejam PAUSED.
- Um anúncio PAUSED dentro de uma campanha ACTIVE não significa que a campanha está pausada.
- Nunca afirme que uma campanha está pausada baseado no status dos anúncios internos.
- Para verificar o status real de campanhas, use a ferramenta get_meta_campaigns.
- Para verificar o status dos anúncios individuais dentro de uma campanha, use get_meta_ads.

REGRAS CRÍTICAS:
1. Português brasileiro claro e acessível. Sem gírias, sem tecnicismos desnecessários, sem siglas sem explicação.
2. NUNCA retorne JSON, blocos de código, markdown formatado, ou qualquer estrutura técnica na resposta de chat. NUNCA. Isso inclui briefs, recomendações, análises — tudo em texto corrido, em português.
3. NUNCA use termos técnicos de marketing sem explicar em linguagem simples: não use "smoke test", "fase 1", "TOFU/MOFU/BOFU", "CPM", "CTR" etc. sem explicar o que significa em palavras simples logo após. Escreva para quem entende de pijamas e atacado, não para quem trabalha em agência de marketing.
4. Se precisar apresentar um brief de banner, escreva assim: "Proponho um anúncio com imagem estática de 1080 por 1080 pixels mostrando a pijama sobre fundo claro, com o texto em destaque: 'Qualidade que faz sua cliente voltar'. Botão de chamada: 'Ver catálogo'." — NUNCA em JSON, NUNCA com títulos técnicos como "brief", "fase", "smoke test".
5. NUNCA liste limitações técnicas. Se não tem dado, busque pela ferramenta disponível.
6. NUNCA peça ao usuário para abrir o Ads Manager, tirar print ou acessar qualquer ferramenta externa.
7. Quando propor pausar ou alterar budget, execute a ação diretamente via ferramenta — não instrua o usuário a fazer manualmente.
8. Resposta completa em uma única mensagem. Sem "posso continuar?" ou "quer mais detalhes?".`;

  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

  const anthropicMessages: Anthropic.MessageParam[] = conversationHistory
    .slice(0, -1)
    .map((m) => ({ role: m.role, content: m.content }));

  if (conversationHistory.length > 0) {
    const last = conversationHistory[conversationHistory.length - 1];
    if (last.role === "user" && imageBase64) {
      const mime = (imageMimeType || "image/jpeg") as "image/jpeg" | "image/png" | "image/gif" | "image/webp";
      anthropicMessages.push({
        role: "user",
        content: [
          { type: "text", text: last.content || "Analise esta imagem." },
          { type: "image", source: { type: "base64", media_type: mime, data: imageBase64 } },
        ],
      });
    } else {
      anthropicMessages.push({ role: last.role, content: last.content });
    }
  }

  // Tool use loop — máx 2 buscas, depois força resposta de texto
  let toolIterations = 0;
  let finalText = "";

  while (toolIterations < 2) {
    toolIterations++;
    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemContent,
      tools: CHAT_TOOLS,
      messages: anthropicMessages,
    });

    const hasToolUse = response.content.some((b) => b.type === "tool_use");
    const textBlocks = response.content.filter((b) => b.type === "text").map((b) => (b as Anthropic.TextBlock).text).join("");

    if (!hasToolUse) {
      finalText = textBlocks;
      break;
    }

    // Executar ferramentas
    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const block of response.content) {
      if (block.type === "tool_use") {
        console.log(`[AdsManagerAgent] Tool: ${block.name}`);
        const result = await executeChatTool(block.name, block.input as Record<string, any>);
        toolResults.push({ type: "tool_result", tool_use_id: block.id, content: result });
      }
    }

    anthropicMessages.push({ role: "assistant", content: response.content });
    anthropicMessages.push({ role: "user", content: toolResults });
  }

  // Se ainda sem texto, forçar resposta final sem ferramentas
  if (!finalText) {
    const finalResponse = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: systemContent,
      tool_choice: { type: "none" },
      tools: CHAT_TOOLS,
      messages: anthropicMessages,
    });
    finalText = finalResponse.content.filter((b) => b.type === "text").map((b) => (b as Anthropic.TextBlock).text).join("");
  }

  return finalText || "Não obtive dados suficientes para responder. Tente reformular a pergunta.";
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

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Avaliação excedeu 90 segundos — Meta API ou LLM lento")), 90_000)
    );

    const { campaigns, adAccountId } = await Promise.race([
      collectAdsData(true),
      timeoutPromise,
    ]);
    const llmResult = await Promise.race([
      analyzeWithLLM(campaigns),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("LLM não respondeu em 60 segundos")), 60_000)
      ),
    ]);

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
