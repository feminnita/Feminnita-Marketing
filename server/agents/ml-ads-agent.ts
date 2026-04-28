/**
 * Gabi — Especialista em Mercado Livre (EDS + Product Ads + Performance)
 * Fichas de produto, atributos, categorização, campanhas de Product Ads,
 * análise de performance orgânica — Conta A (Feminnita) e Conta B (FNT)
 */

import { getDb } from "../db";
import { mlAdsEvaluations } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

const ML_BASE = "https://api.mercadolibre.com";

function getMLToken(account = "feminnita"): string {
  return account === "fnt"
    ? (process.env.ML_ACCESS_TOKEN_2 || "")
    : (process.env.ML_ACCESS_TOKEN_1 || "");
}
function getUserId(account = "feminnita"): string {
  return account === "fnt"
    ? (process.env.ML_USER_ID_2 || "")
    : (process.env.ML_USER_ID_1 || "");
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface MLItem {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  sold_quantity: number;
  status: string;
  permalink?: string;
  thumbnail?: string;
  category_id?: string;
  listing_type_id?: string;
  health?: number;
}

export interface MLOrder {
  id: number;
  total_amount: number;
  status: string;
  date_created: string;
  items: Array<{ item: { id: string; title: string }; quantity: number; unit_price: number }>;
}

export interface MLPerformanceData {
  items: MLItem[];
  campaigns: MLItem[]; // alias de items para compatibilidade com frontend
  recentOrders: MLOrder[];
  sellerId: string;
  period: string;
  summary: {
    totalActiveItems: number;
    totalSoldLast30d: number;
    totalRevenueLast30d: number;
    avgOrderValue: number;
    topSellingIds: string[];
    zeroSalesIds: string[];
  };
}

// Alias para compatibilidade com o router existente
export type MLAdsData = MLPerformanceData;
export type MLCampaign = MLItem;

// ─── Fetch: Listagens ativas ─────────────────────────────────────────────────

async function fetchActiveItems(account = "feminnita"): Promise<MLItem[]> {
  const token = getMLToken(account);
  const userId = getUserId(account);
  if (!token || !userId) return [];

  // Busca IDs dos itens ativos
  const searchRes = await fetch(
    `${ML_BASE}/users/${userId}/items/search?status=active&limit=50`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!searchRes.ok) {
    console.warn(`[MLAgent] items/search HTTP ${searchRes.status}`);
    return [];
  }
  const searchData = await searchRes.json();
  const ids: string[] = searchData.results || [];
  if (!ids.length) return [];

  // Busca detalhes em lote (máx 20 por chamada)
  const items: MLItem[] = [];
  for (let i = 0; i < ids.length; i += 20) {
    const batch = ids.slice(i, i + 20).join(",");
    const detailRes = await fetch(`${ML_BASE}/items?ids=${batch}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!detailRes.ok) continue;
    const details = await detailRes.json();
    for (const entry of details) {
      if (entry.code === 200 && entry.body) {
        const b = entry.body;
        items.push({
          id: b.id,
          title: b.title,
          price: b.price,
          available_quantity: b.available_quantity,
          sold_quantity: b.sold_quantity,
          status: b.status,
          permalink: b.permalink,
          thumbnail: b.thumbnail,
          category_id: b.category_id,
          listing_type_id: b.listing_type_id,
          health: b.health,
        });
      }
    }
  }
  return items;
}

// ─── Fetch: Pedidos recentes (30 dias) ───────────────────────────────────────

async function fetchRecentOrders(account = "feminnita"): Promise<MLOrder[]> {
  const token = getMLToken(account);
  const userId = getUserId(account);
  if (!token || !userId) return [];

  const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  const res = await fetch(
    `${ML_BASE}/orders/search?seller=${userId}&order.status=paid&sort=date_desc&limit=50&order.date_created.from=${dateFrom}T00:00:00.000-00:00`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!res.ok) {
    console.warn(`[MLAgent] orders/search HTTP ${res.status}`);
    return [];
  }
  const data = await res.json();
  return (data.results || []) as MLOrder[];
}

// ─── Coleta completa ──────────────────────────────────────────────────────────

export async function collectMLAdsData(account = "feminnita"): Promise<MLPerformanceData> {
  const userId = getUserId(account);
  const [items, recentOrders] = await Promise.all([
    fetchActiveItems(account),
    fetchRecentOrders(account),
  ]);

  // Calcular métricas
  const totalSoldLast30d = recentOrders.reduce(
    (acc, o) => acc + o.items.reduce((s, i) => s + i.quantity, 0),
    0
  );
  const totalRevenueLast30d = recentOrders.reduce((acc, o) => acc + o.total_amount, 0);
  const avgOrderValue = recentOrders.length ? totalRevenueLast30d / recentOrders.length : 0;

  // Contagem de vendas por item
  const salesByItem: Record<string, number> = {};
  for (const order of recentOrders) {
    for (const oi of order.items) {
      salesByItem[oi.item.id] = (salesByItem[oi.item.id] || 0) + oi.quantity;
    }
  }
  const topSellingIds = Object.entries(salesByItem)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);
  const zeroSalesIds = items
    .filter((i) => !salesByItem[i.id] && i.sold_quantity === 0)
    .map((i) => i.id)
    .slice(0, 10);

  const period = `${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")} — ${new Date().toLocaleDateString("pt-BR")} (30 dias)`;

  return {
    items,
    campaigns: items, // alias para compatibilidade com frontend
    recentOrders: recentOrders.slice(0, 20), // limita payload
    sellerId: userId,
    period,
    summary: {
      totalActiveItems: items.length,
      totalSoldLast30d,
      totalRevenueLast30d,
      avgOrderValue,
      topSellingIds,
      zeroSalesIds,
    },
  };
}

// ─── Sistema de prompt ────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é Gabi — especialista em Mercado Livre Ads e EDS da Feminnita e FNT Confecções.

Você domina dois mundos dentro do ML: o tráfego pago (Product Ads — CPC) e a saúde do catálogo (EDS — fichas, atributos, health score). Sua mentalidade central:

"Anúncio no Mercado Livre não é custo de mídia. É investimento em posição de mercado. O dinheiro que você gasta hoje em ads é o rank orgânico que você vai colher nos próximos meses — sem pagar mais por ele."

Você pensa em flywheel: cada real em ads gera venda → venda aumenta velocidade → velocidade melhora rank orgânico → rank reduz dependência de ads. A roda gira — mas alguém precisa dar o primeiro impulso.

━━━ REGRA FUNDAMENTAL ━━━
No Mercado Livre, quem está buscando já decidiu comprar. A única pergunta é: quem vai interceptar essa intenção.
A busca no ML não é descoberta — é intenção declarada. Você não precisa convencer. Precisa aparecer na hora certa, com o produto certo, na posição certa.
Antes de qualquer campanha: ficha completa, fotos que fecham venda, estoque disponível, preço competitivo.

━━━ CONTAS GERENCIADAS ━━━
Conta A — Feminnita (B2C): consumidor final, mulheres comprando para uso próprio, ticket R$80–150
Produtos: pijamas femininos, babydoll, camisola, short doll
Objetivo: dominar primeiras posições de "pijama feminino" e variações

Conta B — FNT Confecções (B2B): revendedoras buscando atacado, ticket R$300–600
Produtos: kits atacado, lotes mínimos por categoria
Objetivo: interceptar revendedoras no momento da busca por fornecedor
Destacar sempre: "kit", "atacado", "mínimo X peças" no título e descrição

━━━ DNA DOS MESTRES ━━━

THIAGO FRANCO (ICOMM) — ADS COMO ALAVANCA DE CRESCIMENTO
• Mercado Ads não vende — é potencializador. Anúncio ruim → amplifica o ruim. Anúncio bom → amplifica o bom.
• Produto que vende orgânico é o primeiro a receber ads. Não anuncie o que você quer vender — anuncie o que o mercado já quer comprar.
• Velocidade de vendas é a moeda do algoritmo. Ads geram vendas → vendas aumentam velocidade → velocidade melhora rank.
• Campanha automática é o pesquisador de campo: você não sabe quais palavras seus clientes usam — o ML sabe. 7–14 dias de automática entrega as keywords que convertem.
• Sistema de adscore e leilão: quanto maior o adscore do anúncio, menor o CPC no leilão. Produto novo tem adscore baixo → precisa aceitar ACOS alto no início para ganhar posição.
• Fases de campanha (analogia das marchas):
  - VISIBILIDADE (1ª/2ª marcha): produto novo, ACOS 30%+, objetivo é sair da inércia e comprar histórico de vendas. 80–90% das vendas vêm de publicidade nessa fase. É investimento em posição, não custo.
  - CRESCIMENTO (3ª/4ª marcha): produto com histórico consolidado, ACOS 15–30%. Orgânico começa a subir, % de vendas por publicidade cai. Não migrar para essa fase antes de ter conversão consolidada — corta a visibilidade antes de hora.
• Tráfego orgânico e pago 100% ligados: as palavras-chave do anúncio definem em quais páginas o EDS vai distribuir. Bom trabalho de keyword ajuda o algoritmo a mostrar o produto para o cliente certo.
• 90% dos vendedores ainda são amadores — quem domina as ferramentas vence sem depender de preço.

ALEXANDRE NOGUEIRA (UNIVERSIDADE MARKETPLACES) — DOMÍNIO DE CATEGORIA
• Ads não é sobre produto — é sobre posição de categoria. Você disputa a referência em "pijama feminino", não vende um pijama.
• Portfólio, não produto único: 20% dos produtos geram 80% das vendas. Esses 20% merecem 80% do budget.
• Consistência como vantagem: budget pequeno todos os dias > budget grande uma vez por semana. ML distribui melhor para vendedores previsíveis.
• Concorrente é dado, não ameaça: antes de definir CPC, veja quem está na primeira página. CPC, avaliações, fotos. Ads sem benchmarking é navegar sem mapa.

BRETT CURRY (OMG COMMERCE) — INTENÇÃO DE BUSCA COMO FUNDAÇÃO
• Busca é intenção declarada: "pijama feminino suede" no ML = ela quer comprar. Seu anúncio não cria desejo — intercepta quem já quer.
• Três objetivos, três campanhas:
  - ESCALA (produto novo): ACOS até 50–60% por 14 dias, budget agressivo para comprar velocidade
  - EFICIÊNCIA (produto estabelecido): ACOS 20–30%, keywords de cauda longa com alta conversão
  - DEFESA (produto campeão): proteger posição — custo de perder é maior que custo de manter
• Cauda longa converte mais e custa menos: "pijama feminino suede estampado plus size" tem CPC menor e comprador mais específico.
• Dados de ads alimentam SEO orgânico: keywords que convertem → incluir no título e atributos. Keywords caras com volume → prioridade de SEO para eliminar custo a longo prazo.

LEI DO FLYWHEEL
[ADS] → vendas iniciais → [VELOCIDADE DE VENDAS] → rank orgânico sobe → [MAIS VENDAS ORGÂNICAS] → menos dependência de ads → [POSIÇÃO DEFENSÁVEL] → custo relativo de ads cai
Erro que quebra o flywheel: pausar ads logo que ACOS parece "caro" nos primeiros dias. Sem impulso suficiente, nenhum benefício orgânico é acumulado.
Flywheel girando: 10+ vendas/semana constantes, rank orgânico subindo, ACOS caindo progressivamente, vendas não atribuídas a ads começando a aparecer.

━━━ SAÚDE DO ANÚNCIO (EDS) ━━━
Fatores que determinam a saúde: qualidade das fotos, completude dos atributos, título com keywords, avaliações (mín. 4.0★), taxa de conversão histórica, velocidade de resposta, taxa de cancelamento, estoque disponível.
Ads em produto com saúde baixa = você paga mais CPC pela mesma posição. Ficha que não converte sem ads vai piorar com ads — só custa mais.

CHECKLIST EDS — ANTES DE QUALQUER CAMPANHA:
□ Título: keyword principal no início, 60+ caracteres
□ Fotos: mínimo 6, capa sem texto/logo, produto no corpo, iluminação limpa, cada variação com foto própria
□ Atributos 100% preenchidos: Gênero, Tecido (Suede/Malha/Viscolycra/Microfibra), Tamanho (P M G GG XG), Cor, Ocasião, Estação, Tipo
□ Descrição: medidas, composição, guia de tamanhos
□ Avaliações: mínimo 3–5 antes de investir em ads
□ Preço: dentro da faixa competitiva da categoria
□ Estoque: > 10 unidades disponíveis
□ GTIN: preencher se tiver EAN/GS1; se não tiver, declarar "Não possui" — nunca em branco

━━━ ALOCAÇÃO DE BUDGET ━━━
→ 70% para os 3–5 produtos campeões (flywheel já girando)
→ 20% para produtos em lançamento/escala (comprar velocidade inicial)
→ 10% para exploração via campanha automática (identificar próximos campeões)

━━━ GESTÃO DE ESTOQUE ━━━
Produto sem estoque é penalizado — queda de rank pode levar semanas para se recuperar.
< 10 unidades: reduzir budget em 50%
< 5 unidades: pausar campanha (nunca excluir — preservar histórico)
Reposição chegou: reativar com budget gradual
Nunca excluir campanha pausada — histórico acumulado tem valor

━━━ MÉTRICAS-CHAVE ━━━
CTR baixo = problema na foto de capa ou título, não no CPC
Conversão baixa com CTR bom = problema na ficha (fotos, preço, avaliações)
ACOS produto novo/escala: aceitar até 50–60% por 14 dias — é fase de compra de velocidade
ACOS produto estabelecido: trabalhar para 20–30%
ACOS muito baixo (< 10%): possível sub-investimento — pode estar perdendo posição
Velocidade de vendas: métrica que o algoritmo mais valoriza — monitorar diariamente

━━━ FRETE COMO FATOR DE CONVERSÃO ━━━
Velocidade de entrega impacta diretamente as vendas. Ponto de coleta aprovado pode triplicar vendas por reduzir prazo de entrega. Para produtos com frete complexo: modalidade ME1 permite integrar transportadoras próprias com a plataforma. Frete deve ser facilitador, não empecílio na jornada do comprador.

━━━ O QUE VOCÊ NÃO FAZ ━━━
- Não ativa ads em produto com ficha incompleta
- Não pausa campanha de produto campeão sem avaliar custo de perder a posição orgânica
- Não aumenta budget sem entender a fase do produto
- Não cria campanha manual sem dados da automática
- Não exclui campanhas pausadas
- Não trata ACOS alto em produto novo como erro
- Não ativa ads com estoque < 10 unidades sem alertar sobre o risco

Seja direta e específica com números. Responda em português do Brasil.`;

// ─── Análise LLM ─────────────────────────────────────────────────────────────

async function analyzeWithLLM(data: MLPerformanceData): Promise<{
  analysis: string;
  recommendations: Array<{
    priority: "alta" | "media" | "baixa";
    campanha: string;
    titulo: string;
    descricao: string;
    acao: string;
  }>;
  summary: string;
}> {
  // Prepara resumo compacto para não sobrecarregar o LLM
  const compactItems = data.items.map((i) => ({
    id: i.id,
    title: i.title.slice(0, 60),
    price: i.price,
    stock: i.available_quantity,
    sold_total: i.sold_quantity,
    listing_type: i.listing_type_id,
    health: i.health,
  }));

  const result = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Avalie a performance da conta Feminnita no Mercado Livre com os dados abaixo e gere o relatório completo.

**Período:** ${data.period}
**Vendedor:** ${data.sellerId}

**Resumo do período:**
- Anúncios ativos: ${data.summary.totalActiveItems}
- Unidades vendidas (30d): ${data.summary.totalSoldLast30d}
- Receita (30d): R$${data.summary.totalRevenueLast30d.toFixed(2)}
- Ticket médio: R$${data.summary.avgOrderValue.toFixed(2)}
- Top produtos (IDs): ${data.summary.topSellingIds.join(", ") || "nenhum"}
- Sem vendas (IDs): ${data.summary.zeroSalesIds.join(", ") || "nenhum"}

**Listagens ativas:**
${JSON.stringify(compactItems, null, 2)}

Forneça:
1. Resumo executivo (2-3 frases)
2. Análise detalhada por produto/grupo
3. Alertas críticos
4. Recomendações priorizadas

Ao final, retorne JSON EXATO:
\`\`\`json
{
  "summary": "resumo em 1 frase",
  "analysis": "análise completa em texto corrido",
  "recommendations": [
    {
      "priority": "alta",
      "campanha": "nome/id do produto",
      "titulo": "título da recomendação",
      "descricao": "descrição detalhada",
      "acao": "ação específica a tomar"
    }
  ]
}
\`\`\``,
      },
    ],
    maxTokens: 4000,
  });

  const content = String(result.choices[0]?.message?.content || "");

  // Extrai JSON do bloco markdown
  const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[1]);
      if (parsed.analysis) return parsed;
    } catch {}
  }

  // Tenta parse direto
  try {
    const parsed = JSON.parse(content);
    if (parsed.analysis) return parsed;
  } catch {}

  return {
    analysis: content,
    summary: "Avaliação concluída — veja a análise completa abaixo.",
    recommendations: [],
  };
}

// ─── Chat follow-up ───────────────────────────────────────────────────────────

export async function chatWithMLAgent(
  conversationHistory: Array<{ role: "user" | "assistant"; content: string }>,
  rawMetrics: string
): Promise<string> {
  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          SYSTEM_PROMPT +
          `\n\nDados da avaliação:\n${rawMetrics}\n\nResponda as dúvidas sobre a performance ML de forma direta e prática.`,
      },
      ...conversationHistory.map((m) => ({ role: m.role, content: m.content })),
    ],
    maxTokens: 1024,
  });

  const content = result.choices[0]?.message?.content;
  return typeof content === "string"
    ? content
    : "Não consegui processar. Tente novamente.";
}

// ─── Execução principal ───────────────────────────────────────────────────────

export async function runMLAdsEvaluation(evaluationId: number, account = "feminnita"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");

  try {
    await db
      .update(mlAdsEvaluations)
      .set({ status: "running" })
      .where(eq(mlAdsEvaluations.id, evaluationId));

    if (!getMLToken(account)) {
      await db
        .update(mlAdsEvaluations)
        .set({
          status: "error",
          errorMessage: `Token ML não configurado para conta ${account}`,
          completedAt: new Date(),
        })
        .where(eq(mlAdsEvaluations.id, evaluationId));
      return;
    }

    const mlData = await collectMLAdsData(account);
    const llmResult = await analyzeWithLLM(mlData);

    await db
      .update(mlAdsEvaluations)
      .set({
        status: "done",
        rawMetrics: JSON.stringify(mlData),
        analysis: llmResult.analysis,
        recommendations: JSON.stringify(llmResult.recommendations),
        summary: llmResult.summary,
        completedAt: new Date(),
      })
      .where(eq(mlAdsEvaluations.id, evaluationId));

    console.log(
      `[MLAgent] Avaliação ${evaluationId} concluída — ${mlData.items.length} itens, ${mlData.recentOrders.length} pedidos analisados`
    );
  } catch (err: any) {
    console.error(`[MLAgent] Erro na avaliação ${evaluationId}:`, err);
    await db
      .update(mlAdsEvaluations)
      .set({
        status: "error",
        errorMessage: err.message?.slice(0, 499) || "Erro desconhecido",
        completedAt: new Date(),
      })
      .where(eq(mlAdsEvaluations.id, evaluationId));
  }
}
