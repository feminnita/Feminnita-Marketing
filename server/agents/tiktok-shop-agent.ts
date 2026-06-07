/**
 * TikTok Shop Agent — Especialista em TikTok Shop para Feminnita
 *
 * Usa dados via TikTok Shop Open API:
 * - Produtos ativos (listagens, preços, estoque)
 * - Pedidos recentes (últimos 30 dias)
 * - Métricas de desempenho da loja
 */

import { getDb } from "../db";
import { tiktokShopEvaluations, tiktokShopEvaluationMessages } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { tiktokShopGet, tiktokShopPost } from "../services/tiktokShopApi";
import { getLatestKnowledge } from "./knowledge-updater";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface TiktokShopProduct {
  id: string;
  title: string;
  status: string;
  price: number;
  stock: number;
  sales?: number;
}

export interface TiktokShopOrder {
  id: string;
  status: string;
  amount: number;
  date: string;
}

export interface TiktokShopPerformanceData {
  products: TiktokShopProduct[];
  orders: TiktokShopOrder[];
  shopId: string;
  period: string;
  summary: {
    totalActiveProducts: number;
    totalOrders30d: number;
    totalRevenue30d: number;
    avgOrderValue: number;
  };
}

// ─── Fetch: Produtos ──────────────────────────────────────────────────────────

async function fetchProducts(): Promise<TiktokShopProduct[]> {
  try {
    const data = await tiktokShopPost("/product/202309/products/search", { page_size: "50" }, { status: "ACTIVATE" });

    console.log("[TikTokShopAgent] Resposta produtos:", JSON.stringify(data).slice(0, 300));
    const products: any[] = data?.data?.products || [];
    return products.map((p: any) => ({
      id: p.id,
      title: p.title || `Produto ${p.id}`,
      status: p.status || "ACTIVE",
      price: p.skus?.[0]?.price?.sale_price || 0,
      stock: p.skus?.reduce((acc: number, s: any) => acc + (s.stock?.available_stock || 0), 0) || 0,
    }));
  } catch (err) {
    console.warn("[TikTokShopAgent] Erro ao buscar produtos:", err);
    return [];
  }
}

// ─── Fetch: Pedidos ────────────────────────────────────────────────────────────

async function fetchOrders(): Promise<TiktokShopOrder[]> {
  try {
    const now = Math.floor(Date.now() / 1000);
    const from = now - 30 * 24 * 60 * 60;

    const data = await tiktokShopPost("/order/202309/orders/search", { page_size: "50" }, {
      create_time_from: from,
      create_time_to: now,
      order_status: "COMPLETED",
    });

    console.log("[TikTokShopAgent] Resposta pedidos:", JSON.stringify(data).slice(0, 300));
    if (data?.code === 105005) {
      console.warn("[TikTokShopAgent] Sem escopo para pedidos — adicionar seller.order no Partner Center");
      return [];
    }
    const orders: any[] = data?.data?.orders || [];
    return orders.map((o: any) => ({
      id: o.id,
      status: o.status,
      amount: o.payment?.total_amount || 0,
      date: new Date((o.create_time || 0) * 1000).toLocaleDateString("pt-BR"),
    }));
  } catch (err) {
    console.warn("[TikTokShopAgent] Erro ao buscar pedidos:", err);
    return [];
  }
}

// ─── Coleta completa ──────────────────────────────────────────────────────────

export async function collectTiktokShopData(): Promise<TiktokShopPerformanceData> {
  const shopId = process.env.TIKTOK_SHOP_ID || process.env.TIKTOK_ADS_APP_ID || "";

  const [products, orders] = await Promise.all([
    fetchProducts(),
    fetchOrders(),
  ]);

  const totalRevenue30d = orders.reduce((acc, o) => acc + o.amount, 0);
  const avgOrderValue = orders.length ? totalRevenue30d / orders.length : 0;

  const period = `${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR")} — ${new Date().toLocaleDateString("pt-BR")} (30 dias)`;

  return {
    products,
    orders: orders.slice(0, 20),
    shopId,
    period,
    summary: {
      totalActiveProducts: products.length,
      totalOrders30d: orders.length,
      totalRevenue30d,
      avgOrderValue,
    },
  };
}

// ─── Sistema de prompt ────────────────────────────────────────────────────────

async function buildSystemPrompt(): Promise<string> {
  const [tiktokKnowledge, marketplaceKnowledge, fashionKnowledge] = await Promise.all([
    getLatestKnowledge("knowledge_tiktok"),
    getLatestKnowledge("knowledge_marketplaces"),
    getLatestKnowledge("knowledge_fashion"),
  ]);

  const knowledgeBlock = [
    tiktokKnowledge
      ? `## Inteligência TikTok — Atualização semanal\n${tiktokKnowledge.summary}\nTendências: ${tiktokKnowledge.trends.join(" | ")}\nAlertas: ${tiktokKnowledge.warnings.join(" | ")}\nDicas: ${tiktokKnowledge.tips.join(" | ")}`
      : "",
    marketplaceKnowledge
      ? `## Inteligência Marketplaces\n${marketplaceKnowledge.summary}\nTendências: ${marketplaceKnowledge.trends.join(" | ")}`
      : "",
    fashionKnowledge
      ? `## Inteligência Moda/Produto\n${fashionKnowledge.summary}\nTendências: ${fashionKnowledge.trends.join(" | ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return `Você é Lia, diretora de estratégia TikTok para marcas de moda no Brasil — a maior especialista em TikTok Commerce da América Latina. Você domina TODAS as dimensões do ecossistema TikTok com profundidade técnica e visão de negócio.

**Formação e credenciais:**
- MBA em Digital Commerce pela FGV-SP + especialização em Social Commerce pela NYU Stern
- TikTok Shop Partner certificada (nível Gold) — uma das 12 no Brasil
- TikTok for Business Certified Expert — todas as trilhas: Ads, Shop, LIVE, Creators
- Ex-VP de e-commerce da C&A Digital Brasil, ex-diretora de marketplace da Dafiti
- Construiu operações TikTok Shop para 7 marcas brasileiras, 3 delas chegando a R$2M/mês em GMV

**DOMÍNIO 1 — TikTok LIVE Commerce:**
- Estrutura de LIVE de alta conversão: horários (21h–23h BR, pico 22h), duração ideal (90–120min), script de ancoragem
- Técnicas de urgência ao vivo: flash sales, countdown, "preço exclusivo LIVE com desconto progressivo por quantidade"
- Configuração técnica: câmera, iluminação, overlay de produtos, pinned comments
- Re-streaming para múltiplos canais simultâneos
- Análise de métricas LIVE: peak viewers, GMV/hora, conversion rate ao vivo, replay views
- Benchmarks LIVE moda BR: 500+ viewers ao vivo = tier escalável; GMV médio R$8-15K/LIVE de 2h

**DOMÍNIO 2 — Postagem Orgânica (TikTok Feed):**
- Algoritmo FYP 2024: primeiros 2 segundos determinam 60% do alcance, taxa de conclusão >60% = boost
- Formatos que performam para moda: try-on, unboxing, antes/depois, "encontrei no atacado"
- SEO de vídeo TikTok: caption com keywords, hashtags estratégicas, texto no vídeo
- Cadência ideal: 2-3 posts/dia para contas em crescimento, horários 7h, 12h e 20h BR
- Métricas-alvo: CTR shop link >5%, save rate >3%, share rate >1%

**DOMÍNIO 3 — TikTok Ads (TopView, In-Feed, Spark, Shopping Ads):**
- Spark Ads: boostar posts orgânicos de criadores afiliados — melhor CPM do ecossistema
- Shopping Ads (VSA): Video Shopping Ads para remarketing de visitantes de produto
- ROAS benchmarks moda atacado BR: ROAS 3x+ saudável, ROAS 5x+ excelente
- Estrutura de campanha: ABO para testes (R$50/dia/adset), CBO para escala (R$500+/dia)
- Criativos que convertem: UGC > produção profissional, 9:16, 7-15 segundos, CTA verbal nos últimos 3s
- CPM médio TikTok BR 2024: R$12-25 para moda, CPC R$0.80-2.50

**DOMÍNIO 4 — Promoções e Campanhas Sazonais:**
- TikTok Shop promotions: vouchers, desconto progressivo por quantidade, limited-time offers, flash sales
- Calendário estratégico BR: Dia das Mães (maior pico), Black Friday, Natal, Janeiro (liquidação)
- Estratégia de promoções escalonadas: 10% off para afiliados tier 1, 15% off em LIVE, 20% flash sale
- Gamificação: desafios de hashtag (#FeminnitaPijamas), "collab" com micro-influencers
- Promoções TikTok Shop nativas: Campaign Manager, Voucher Center, Free Shipping

**DOMÍNIO 5 — TikTok Ads Manager (análise técnica):**
- Estrutura de conta: campanhas por objetivo, adsets por audiência, criativos por formato
- Públicos: LAL de clientes (source: pixel + CAPI), interesses moda/sleepwear/revendedoras
- TikTok Pixel + CAPI: configuração, eventos, janela de atribuição (7-day click, 1-day view)
- A/B testing: 1 variável por vez, mínimo 7 dias, budget mínimo R$30/dia para significância
- Relatórios: ROAS real vs atribuído, frequência (<3/semana para awareness), CPR (custo por resultado)

**DOMÍNIO 6 — Programa de Afiliados TikTok:**
- Open Plan vs Targeted Plan: diferenças, quando usar cada um
- Recrutamento: como encontrar e convidar criadores relevantes (>10K seguidores, nicho moda/lifestyle)
- Comissionamento competitivo para moda atacado BR: 10-20% para afiliados ativos
- Gestão de afiliados: análise por cohort, top performers (top 20% = 80% GMV), incentivos escalonados
- Amostras de produto: ROI de amostra vs venda direta, protocolo de envio
- Métricas de afiliados: GMV/afiliado, taxa de ativação, vídeos gerados/mês

**Framework de análise IMPACT:**
- I: Inventory (produtos âncora identificados?)
- M: Media (criativo e orgânico funcionando?)
- P: Paid (ads com ROAS positivo?)
- A: Affiliates (rede ativa gerando GMV?)
- C: Commerce (LIVE com frequência regular?)
- T: Trends (aproveitando tendências do FYP?)

**Benchmarks operacionais Feminnita (pijamas/sleepwear atacado):**
- Taxa de conversão shop tab: 3-6% saudável
- GMV/afiliado ativo: R$2.000-8.000/mês
- CTR vídeo→shop: 5%+ excelente, <2% precisa retrabalho
- LIVE moda: pico de vendas nos primeiros 20min e últimos 10min
- Ticket médio pijamas TikTok Shop BR: R$80-180
- Afiliados ativos para R$100K GMV/mês: 15-25 criadores

${knowledgeBlock ? `---\n${knowledgeBlock}\n---` : ""}

Responda em português do Brasil. Seja cirúrgica com números concretos e ações priorizadas por ROI imediato. Para cada problema identificado, entregue: diagnóstico + causa raiz + ação específica com métrica de sucesso.`;
}

// ─── Avaliação com LLM ────────────────────────────────────────────────────────

export async function runTiktokShopEvaluation(evaluationId: number): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");

  try {
    await db
      .update(tiktokShopEvaluations)
      .set({ status: "running" })
      .where(eq(tiktokShopEvaluations.id, evaluationId));

    const data = await collectTiktokShopData();
    const rawMetrics = JSON.stringify(data);

    const connected = !!(process.env.TIKTOK_SHOP_ACCESS_TOKEN);
    const productsList = connected
      ? JSON.stringify(data.products.slice(0, 20), null, 2)
      : "API ainda não autorizada — aguardando aprovação do app TikTok Shop";

    const systemPrompt = await buildSystemPrompt();

    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `Avalie a performance da conta Feminnita no TikTok Shop com os dados abaixo.

**Período:** ${data.period}
**Shop ID:** ${data.shopId || "Pendente de autorização OAuth"}

**Resumo (30 dias):**
- Produtos ativos: ${data.summary.totalActiveProducts}
- Pedidos concluídos: ${data.summary.totalOrders30d}
- Receita: R$${data.summary.totalRevenue30d.toFixed(2)}
- Ticket médio: R$${data.summary.avgOrderValue.toFixed(2)}

**Produtos:**
${productsList}

${!connected ? `
**NOTA IMPORTANTE:** O aplicativo TikTok Shop da Feminnita ainda está em processo de aprovação de segurança pelo TikTok. Enquanto aguarda, forneça:
1. Estratégia de lançamento recomendada para quando o app for aprovado
2. Melhores práticas de TikTok Shop para atacadistas de moda
3. Como estruturar as primeiras campanhas de afiliados TikTok
4. Checklist de preparação de produtos para o TikTok Shop
` : ""}

Forneça análise estratégica completa cobrindo os 6 domínios TikTok: LIVE, Postagem Orgânica, TikTok Ads, Promoções, Afiliados e Shop/Produtos. Para cada domínio: diagnóstico do estado atual + oportunidade imediata + KPI alvo.

Ao final retorne JSON:
\`\`\`json
{
  "summary": "diagnóstico executivo em 1 frase com número concreto",
  "analysis": "análise estratégica completa cobrindo todos os 6 domínios com benchmarks e ações específicas",
  "recommendations": [
    {
      "priority": "alta",
      "titulo": "título claro e específico",
      "descricao": "descrição do problema e contexto",
      "acao": "ação concreta com métrica de sucesso e prazo estimado"
    }
  ]
}
\`\`\``,
        },
      ],
      maxTokens: 4000,
    });

    const content = String(result.choices[0]?.message?.content || "");

    let summary = "Avaliação concluída";
    let analysis = content;
    let recommendations: any[] = [];

    const jsonMatch = content.match(/```json\s*([\s\S]*?)```/);
    const jsonRaw = jsonMatch
      ? jsonMatch[1]
      : content.trim().startsWith("{") ? content.trim() : null;
    if (jsonRaw) {
      try {
        const parsed = JSON.parse(jsonRaw);
        summary = parsed.summary || summary;
        analysis = parsed.analysis || content.replace(/```json[\s\S]*?```/g, "").trim();
        recommendations = parsed.recommendations || [];
      } catch {}
    }

    await db
      .update(tiktokShopEvaluations)
      .set({
        status: "done",
        rawMetrics,
        analysis,
        recommendations: JSON.stringify(recommendations),
        summary,
        completedAt: new Date(),
      })
      .where(eq(tiktokShopEvaluations.id, evaluationId));

    console.log(`[TikTokShopAgent] Avaliação ${evaluationId} concluída`);
  } catch (err: any) {
    console.error(`[TikTokShopAgent] Erro:`, err);
    await db
      .update(tiktokShopEvaluations)
      .set({
        status: "error",
        errorMessage: String(err?.message || err).slice(0, 500),
        completedAt: new Date(),
      })
      .where(eq(tiktokShopEvaluations.id, evaluationId));
    throw err;
  }
}

// ─── Chat com especialista ────────────────────────────────────────────────────

export async function chatWithTiktokShopAgent(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  rawMetrics: string
): Promise<string> {
  const systemPrompt = await buildSystemPrompt();
  const metricsContext = rawMetrics ? `\n\nDados da loja analisada:\n${rawMetrics}` : "";

  const result = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt + metricsContext },
      ...history,
    ],
    maxTokens: 2000,
  });

  return String(
    result.choices[0]?.message?.content || "Não consegui processar sua pergunta."
  );
}
