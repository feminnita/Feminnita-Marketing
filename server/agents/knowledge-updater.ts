import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { agentMemory } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export interface MarketKnowledge {
  domain: string;
  summary: string;
  trends: string[];
  benchmarks: Record<string, string>;
  warnings: string[];
  tips: string[];
  updatedAt: string;
}

const DOMAINS = [
  {
    key: "meta_ads",
    agentName: "knowledge_meta_ads",
    prompt: `Você é um especialista em Meta Ads (Facebook/Instagram) com acesso às últimas informações do mercado brasileiro.

Gere um briefing semanal de inteligência de mercado para uma gestora de tráfego pago focada em atacado de moda/pijamas no Brasil.

Inclua:
1. Mudanças recentes no algoritmo do Meta Ads e como adaptá-las
2. Benchmarks atuais de performance (CPM, CPC, CTR, ROAS) para nicho moda/atacado Brasil
3. Novos formatos e funcionalidades do Ads Manager que devem ser testados
4. Públicos e segmentações em alta para o nicho de revendedoras
5. Erros comuns que estão derrubando campanhas atualmente
6. Estratégias de criativo que estão performando melhor agora
7. Mudanças em políticas de anúncios que podem afetar o nicho

Retorne JSON:
{
  "domain": "meta_ads",
  "summary": "resumo executivo em 3 frases do estado atual do Meta Ads",
  "trends": ["tendência 1 com ação prática", "tendência 2", "tendência 3"],
  "benchmarks": {
    "cpm_medio": "R$ X–Y",
    "ctr_saudavel": "X%–Y%",
    "cpc_aceitavel": "R$ X–Y",
    "roas_meta_atacado": "Xx–Xx",
    "frequencia_ideal": "X–Y por semana"
  },
  "warnings": ["alerta 1 sobre mudança ou risco", "alerta 2"],
  "tips": ["dica avançada 1 para melhorar performance agora", "dica 2", "dica 3"],
  "updatedAt": "${new Date().toISOString()}"
}`,
  },
  {
    key: "instagram_organic",
    agentName: "knowledge_instagram",
    prompt: `Você é um especialista em crescimento orgânico no Instagram com foco em marcas de moda e negócios B2B2C (atacado para revendedoras) no Brasil.

Gere um briefing semanal de inteligência sobre o Instagram para uma estrategista de conteúdo.

Inclua:
1. Estado atual do algoritmo do Instagram e o que está sendo priorizado
2. Formatos de conteúdo com maior alcance orgânico neste momento
3. Tendências de conteúdo em alta no nicho moda/pijamas/revendas
4. Horários de maior engajamento para o público feminino brasileiro 28-45 anos
5. Hashtags e palavras-chave que estão gerando alcance real
6. Estratégias de Stories que convertem em vendas
7. Mudanças recentes nas políticas ou funcionalidades

Retorne JSON:
{
  "domain": "instagram_organic",
  "summary": "diagnóstico atual do Instagram orgânico para moda/atacado",
  "trends": ["trend 1 com formato específico e por que funciona", "trend 2", "trend 3"],
  "benchmarks": {
    "taxa_engajamento_boa": "X%+",
    "alcance_organico_reels": "X–Yx seguidores",
    "frequencia_ideal_posts": "X posts/semana",
    "melhor_horario": "HH:mm–HH:mm BRT"
  },
  "warnings": ["mudança de algoritmo ou tendência que pode prejudicar", "segundo aviso"],
  "tips": ["ação concreta que gera resultado rápido", "segunda dica", "terceira dica"],
  "updatedAt": "${new Date().toISOString()}"
}`,
  },
  {
    key: "ecommerce_marketplaces",
    agentName: "knowledge_marketplaces",
    prompt: `Você é especialista em marketplaces brasileiros (Mercado Livre, Shopee, Amazon Brasil, TikTok Shop) com foco em moda e têxtil.

Gere um briefing semanal de inteligência sobre marketplaces para uma estrategista de e-commerce de atacado.

Inclua:
1. Mudanças recentes em taxas, políticas ou algoritmos de cada marketplace
2. Categorias e produtos de moda/pijamas com maior demanda atual
3. Estratégias de precificação que estão funcionando no nicho
4. TikTok Shop Brasil — oportunidades e como aproveitar
5. Dicas de posicionamento e SEO interno em cada plataforma
6. Programas de anúncio internos (ML Ads, Shopee Ads) — o que vale o custo

Retorne JSON:
{
  "domain": "ecommerce_marketplaces",
  "summary": "panorama atual dos marketplaces para moda/pijamas atacado",
  "trends": ["oportunidade 1 em marketplace específico", "oportunidade 2", "oportunidade 3"],
  "benchmarks": {
    "taxa_ml_moda": "~X%",
    "taxa_shopee_moda": "~X%",
    "tiktok_shop_crescimento": "X% ao mês",
    "ticket_medio_ml_pijamas": "R$ X–Y"
  },
  "warnings": ["mudança de política ou taxa que afeta o negócio", "segundo aviso"],
  "tips": ["ação de curto prazo para crescer em marketplace", "segunda dica", "terceira dica"],
  "updatedAt": "${new Date().toISOString()}"
}`,
  },
  {
    key: "fashion_trends",
    agentName: "knowledge_fashion",
    prompt: `Você é especialista em tendências de moda feminina, vestuário íntimo e sleepwear no Brasil, com foco em atacado.

Gere um briefing semanal de tendências de produto e mercado para uma analista de moda atacado.

Inclua:
1. Tendências de produto em alta: estampas, tecidos, modelagens, cores da temporada
2. Categorias em crescimento no nicho pijamas/sleepwear Brasil
3. Sazonalidade atual — o que está vendendo bem neste período
4. Comportamento da revendedora autônoma brasileira — o que ela quer comprar agora
5. Influencers e nichos do TikTok/Instagram que estão impulsionando pijamas
6. Produtos com gap de mercado (demanda > oferta)

Retorne JSON:
{
  "domain": "fashion_trends",
  "summary": "panorama atual do mercado de pijamas/sleepwear para atacado",
  "trends": ["tendência de produto específica com ação sugerida", "tendência 2", "tendência 3"],
  "benchmarks": {
    "categoria_mais_vendida": "nome da categoria",
    "tecido_em_alta": "nome do tecido",
    "estampa_tendencia": "tipo de estampa",
    "sazonalidade_atual": "contexto do período"
  },
  "warnings": ["categoria ou produto que está saturando", "segundo aviso"],
  "tips": ["sugestão de produto ou coleção para lançar agora", "segunda sugestão", "terceira"],
  "updatedAt": "${new Date().toISOString()}"
}`,
  },
  {
    key: "whatsapp_sales",
    agentName: "knowledge_whatsapp",
    prompt: `Você é especialista em vendas via WhatsApp Business para atacado de moda no Brasil, com foco em reativação de clientes e conversão de revendedoras.

Gere um briefing semanal de estratégias e boas práticas para vendas via WhatsApp.

Inclua:
1. Mudanças recentes nas políticas do WhatsApp Business e Meta para disparos
2. Taxas de abertura e conversão atuais para mensagens de reativação
3. Templates de mensagem que mais convertem para atacado (exemplos)
4. Horários ideais para envio de mensagens de vendas para revendedoras
5. Erros que levam ao banimento de números — como evitar
6. Estratégias de funil via WhatsApp (frio → morno → quente → fechamento)

Retorne JSON:
{
  "domain": "whatsapp_sales",
  "summary": "estado atual das vendas via WhatsApp para atacado",
  "trends": ["estratégia de conversão em alta com exemplo", "estratégia 2", "estratégia 3"],
  "benchmarks": {
    "taxa_abertura_media": "X%",
    "taxa_resposta_reativacao": "X%",
    "melhor_horario_envio": "HH:mm–HH:mm",
    "intervalo_seguro_disparos": "X msgs/hora"
  },
  "warnings": ["risco de banimento ou bloqueio — como evitar", "mudança de política importante"],
  "tips": ["script de reativação que converte", "segunda dica de conversão", "terceira dica"],
  "updatedAt": "${new Date().toISOString()}"
}`,
  },
];

export async function updateMarketKnowledge(domain?: string): Promise<{ updated: string[]; errors: string[] }> {
  const db = await getDb();
  if (!db) throw new Error("Database unavailable");

  const toUpdate = domain ? DOMAINS.filter((d) => d.key === domain) : DOMAINS;
  const updated: string[] = [];
  const errors: string[] = [];

  for (const d of toUpdate) {
    try {
      const result = await invokeLLM({
        messages: [{ role: "user", content: d.prompt }],
        maxTokens: 1200,
      });

      const raw = result.choices[0]?.message?.content ?? "";
      const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
      const m = cleaned.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(m ? m[0] : cleaned);

      const period = new Date().toISOString().split("T")[0];

      await db.insert(agentMemory).values({
        agentName: d.agentName,
        memoryType: "learning",
        period,
        content: JSON.stringify(parsed),
      });

      updated.push(d.key);
      console.log(`[KnowledgeUpdater] ✓ ${d.key} atualizado`);
    } catch (err: any) {
      errors.push(`${d.key}: ${err.message}`);
      console.error(`[KnowledgeUpdater] ✗ ${d.key}:`, err.message);
    }
  }

  return { updated, errors };
}

export async function getLatestKnowledge(agentName: string): Promise<MarketKnowledge | null> {
  try {
    const db = await getDb();
    if (!db) return null;

    const rows = await db
      .select()
      .from(agentMemory)
      .where(and(eq(agentMemory.agentName, agentName), eq(agentMemory.memoryType, "learning")))
      .orderBy(desc(agentMemory.createdAt))
      .limit(1);

    if (!rows.length) return null;
    return JSON.parse(rows[0].content) as MarketKnowledge;
  } catch {
    return null;
  }
}

export async function getKnowledgeStatus(): Promise<{ domain: string; lastUpdate: string | null; daysOld: number }[]> {
  const db = await getDb();
  if (!db) return [];

  return Promise.all(
    DOMAINS.map(async (d) => {
      const rows = await db
        .select()
        .from(agentMemory)
        .where(and(eq(agentMemory.agentName, d.agentName), eq(agentMemory.memoryType, "learning")))
        .orderBy(desc(agentMemory.createdAt))
        .limit(1);

      const lastUpdate = rows[0]?.createdAt ? new Date(rows[0].createdAt).toISOString() : null;
      const daysOld = lastUpdate
        ? Math.floor((Date.now() - new Date(lastUpdate).getTime()) / 86400000)
        : 999;

      return { domain: d.key, lastUpdate, daysOld };
    })
  );
}
