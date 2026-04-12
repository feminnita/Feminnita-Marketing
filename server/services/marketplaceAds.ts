/**
 * Marketplace Ads Service — camada unificada de dados de anúncios
 *
 * Suporte atual e planejado:
 * ✅ Meta Ads (Facebook/Instagram) — já integrado
 * ✅ Mercado Livre Ads — API disponível (credenciais já configuradas)
 * 🔜 Shopee Ads — aguardando credenciais (SHOPEE_PARTNER_ID/KEY)
 * 🔜 Amazon Ads — aguardando credenciais (AMAZON_ADS_CLIENT_ID/SECRET)
 * 🔜 TikTok Ads — aguardando credenciais (TIKTOK_ADS_APP_ID/SECRET)
 *
 * Todos os adaptadores retornam o mesmo tipo UnifiedAdMetrics para que
 * os agentes IA possam comparar performance entre plataformas.
 */

const GRAPH_BASE = "https://graph.facebook.com/v19.0";

// ─── Tipo unificado ───────────────────────────────────────────────────────────

export interface UnifiedAdMetrics {
  platform: "meta" | "mercadolivre" | "shopee" | "amazon" | "tiktok";
  spend: number;          // R$ gasto no período
  impressions: number;
  clicks: number;
  conversions: number;    // Vendas/pedidos gerados
  revenue: number;        // R$ receita gerada (estimada quando não disponível)
  roas: number;           // revenue / spend
  ctr: number;            // %
  cpc: number;            // R$ por clique
  cpa: number;            // R$ por conversão
  currency: "BRL";
  periodDays: number;
  fetchedAt: string;      // ISO timestamp
  raw?: Record<string, unknown>; // Dados brutos para debug
}

export interface PlatformStatus {
  platform: string;
  available: boolean;
  reason?: string;
  metrics?: UnifiedAdMetrics;
}

// ─── Meta Ads ─────────────────────────────────────────────────────────────────

async function fetchMetaAdsMetrics(days = 7): Promise<PlatformStatus> {
  const token = process.env.META_ACCESS_TOKEN;
  const adAccountId = process.env.META_AD_ACCOUNT_ID || "act_231648936319132";

  if (!token) {
    return { platform: "meta", available: false, reason: "META_ACCESS_TOKEN não configurado" };
  }

  try {
    const params = new URLSearchParams({
      fields: "spend,impressions,clicks,ctr,cpc,actions",
      date_preset: days <= 7 ? "last_7d" : "last_30d",
      level: "account",
      access_token: token,
    });

    const res = await fetch(`${GRAPH_BASE}/${adAccountId}/insights?${params}`);
    if (!res.ok) {
      const err = await res.json();
      return { platform: "meta", available: false, reason: err.error?.message || `HTTP ${res.status}` };
    }

    const data = await res.json();
    const row = data.data?.[0] || {};

    const spend = parseFloat(row.spend || "0");
    const impressions = parseInt(row.impressions || "0");
    const clicks = parseInt(row.clicks || "0");
    const purchaseAction = (row.actions || []).find(
      (a: any) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase"
    );
    const conversions = purchaseAction ? parseFloat(purchaseAction.value || "0") : 0;
    const revenue = conversions * 400; // ticket médio R$400
    const roas = spend > 0 && revenue > 0 ? revenue / spend : 0;
    const cpa = conversions > 0 ? spend / conversions : 0;

    return {
      platform: "meta",
      available: true,
      metrics: {
        platform: "meta",
        spend,
        impressions,
        clicks,
        conversions,
        revenue,
        roas: Math.round(roas * 100) / 100,
        ctr: parseFloat(row.ctr || "0"),
        cpc: parseFloat(row.cpc || "0"),
        cpa: Math.round(cpa * 100) / 100,
        currency: "BRL",
        periodDays: days,
        fetchedAt: new Date().toISOString(),
        raw: row,
      },
    };
  } catch (err: any) {
    return { platform: "meta", available: false, reason: err.message };
  }
}

// ─── Mercado Livre Ads ────────────────────────────────────────────────────────

async function fetchMLAdsMetrics(_days = 7): Promise<PlatformStatus> {
  const mlToken = process.env.ML_ACCESS_TOKEN_1; // OAuth token, não as credenciais
  const mlUserId = process.env.ML_USER_ID_1;

  if (!mlToken || !mlUserId) {
    return {
      platform: "mercadolivre",
      available: false,
      reason: "ML_ACCESS_TOKEN_1 ou ML_USER_ID_1 não configurados — configure OAuth primeiro",
    };
  }

  try {
    // Mercado Livre Ads API: https://api.mercadolibre.com/advertising/campaigns
    const res = await fetch(
      `https://api.mercadolibre.com/advertising/campaigns?status=active`,
      { headers: { Authorization: `Bearer ${mlToken}` } }
    );

    if (!res.ok) {
      const err = await res.json();
      return {
        platform: "mercadolivre",
        available: false,
        reason: err.message || `ML API HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    const campaigns = Array.isArray(data) ? data : data.results || [];

    // Agregar métricas básicas de todas as campanhas
    let totalSpend = 0;
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalOrders = 0;
    let totalRevenue = 0;

    for (const campaign of campaigns) {
      totalSpend += parseFloat(campaign.daily_budget || "0");
      // ML Ads não retorna métricas no endpoint de listagem — precisaria de /reports
      // Por ora, soma orçamentos e indica que métricas precisam de endpoint de relatórios
    }

    return {
      platform: "mercadolivre",
      available: true,
      metrics: {
        platform: "mercadolivre",
        spend: totalSpend,
        impressions: totalImpressions,
        clicks: totalClicks,
        conversions: totalOrders,
        revenue: totalRevenue,
        roas: totalSpend > 0 && totalRevenue > 0 ? totalRevenue / totalSpend : 0,
        ctr: 0,
        cpc: 0,
        cpa: 0,
        currency: "BRL",
        periodDays: _days,
        fetchedAt: new Date().toISOString(),
        raw: { campaigns: campaigns.length, note: "metrics require /advertising/reports endpoint" },
      },
    };
  } catch (err: any) {
    return { platform: "mercadolivre", available: false, reason: err.message };
  }
}

// ─── Shopee Ads (placeholder) ─────────────────────────────────────────────────

async function fetchShopeeAdsMetrics(_days = 7): Promise<PlatformStatus> {
  const partnerId = process.env.SHOPEE_PARTNER_ID;
  if (!partnerId) {
    return {
      platform: "shopee",
      available: false,
      reason: "SHOPEE_PARTNER_ID não configurado — integração pendente",
    };
  }
  // TODO: implementar quando credenciais estiverem disponíveis
  // Shopee Open Platform Ads API: https://open.shopee.com/documents/v2/v2.ads.get_ads_list
  return { platform: "shopee", available: false, reason: "Integração Shopee Ads em desenvolvimento" };
}

// ─── Amazon Ads (placeholder) ─────────────────────────────────────────────────

async function fetchAmazonAdsMetrics(_days = 7): Promise<PlatformStatus> {
  const clientId = process.env.AMAZON_ADS_CLIENT_ID;
  if (!clientId) {
    return {
      platform: "amazon",
      available: false,
      reason: "AMAZON_ADS_CLIENT_ID não configurado — integração pendente",
    };
  }
  // TODO: implementar Amazon Ads API
  return { platform: "amazon", available: false, reason: "Integração Amazon Ads em desenvolvimento" };
}

// ─── TikTok Ads (placeholder) ─────────────────────────────────────────────────

async function fetchTikTokAdsMetrics(_days = 7): Promise<PlatformStatus> {
  const appId = process.env.TIKTOK_ADS_APP_ID;
  if (!appId) {
    return {
      platform: "tiktok",
      available: false,
      reason: "TIKTOK_ADS_APP_ID não configurado — integração pendente",
    };
  }
  // TODO: implementar TikTok Ads API: https://ads.tiktok.com/marketing_api/docs
  return { platform: "tiktok", available: false, reason: "Integração TikTok Ads em desenvolvimento" };
}

// ─── Agregador principal ──────────────────────────────────────────────────────

/**
 * Busca métricas de todas as plataformas de ads em paralelo.
 * Retorna status de cada plataforma (disponível ou não, com motivo).
 */
export async function fetchAllPlatformMetrics(days = 7): Promise<PlatformStatus[]> {
  const results = await Promise.allSettled([
    fetchMetaAdsMetrics(days),
    fetchMLAdsMetrics(days),
    fetchShopeeAdsMetrics(days),
    fetchAmazonAdsMetrics(days),
    fetchTikTokAdsMetrics(days),
  ]);

  return results.map((r) =>
    r.status === "fulfilled"
      ? r.value
      : { platform: "unknown", available: false, reason: (r as PromiseRejectedResult).reason?.message }
  );
}

/**
 * Formata o resumo multi-plataforma para injeção no prompt de um agente.
 */
export function formatPlatformSummary(platforms: PlatformStatus[]): string {
  const lines: string[] = ["=== RESUMO MULTI-PLATAFORMA DE ADS ===", ""];

  for (const p of platforms) {
    if (!p.available) {
      lines.push(`❌ ${p.platform.toUpperCase()}: ${p.reason}`);
    } else if (p.metrics) {
      const m = p.metrics;
      lines.push(`✅ ${p.platform.toUpperCase()}:`);
      lines.push(`   Spend: R$${m.spend.toFixed(2)} | ROAS: ${m.roas}x | Clicks: ${m.clicks}`);
      if (m.conversions > 0) lines.push(`   Conversões: ${m.conversions} | Receita: R$${m.revenue.toFixed(2)} | CPA: R$${m.cpa}`);
    }
  }

  lines.push("");
  lines.push("Plataformas pendentes de integração: Shopee, Amazon, TikTok");
  lines.push("(configurar credenciais em .env para ativar)");

  return lines.join("\n");
}
