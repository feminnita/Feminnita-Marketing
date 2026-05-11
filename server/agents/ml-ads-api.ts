/**
 * ML Product Ads — REST API
 * Endpoint correto: /advertising/advertisers/{advertiserId}/product_ads/campaigns
 * advertiserId ≠ userId; configurado via ML_ADVERTISER_ID_1 / ML_ADVERTISER_ID_2
 */

import { getDb } from "../db";
import { marketplaceAdsMetrics } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const ML_BASE = "https://api.mercadolibre.com";

function getToken(account: string): string {
  return account === "fnt"
    ? (process.env.ML_ACCESS_TOKEN_2 || "")
    : (process.env.ML_ACCESS_TOKEN_1 || "");
}

function getAdvertiserId(account: string): string {
  return account === "fnt"
    ? (process.env.ML_ADVERTISER_ID_2 || "")
    : (process.env.ML_ADVERTISER_ID_1 || "");
}

async function mlFetch(method: string, path: string, account: string, body?: object): Promise<any> {
  const token = getToken(account);
  if (!token) throw new Error(`Token ML não configurado para ${account}`);

  const res = await fetch(`${ML_BASE}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  let data: any;
  try { data = await res.json(); } catch { data = {}; }

  if (!res.ok) {
    const msg = data?.message || data?.error || JSON.stringify(data).slice(0, 200);
    throw new Error(`ML API ${method} ${path} → HTTP ${res.status}: ${msg}`);
  }
  return data;
}

// ─── Listagem de campanhas ────────────────────────────────────────────────────

export async function apiListMLCampaigns(account = "feminnita"): Promise<any[]> {
  const advertiserId = getAdvertiserId(account);
  if (!advertiserId) {
    console.warn(`[MLAdsAPI] ML_ADVERTISER_ID não configurado para ${account}`);
    return [];
  }

  const all: any[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    try {
      const data = await mlFetch(
        "GET",
        `/advertising/advertisers/${advertiserId}/product_ads/campaigns?limit=${limit}&offset=${offset}`,
        account
      );
      const batch: any[] = data.results || data.data || data.campaigns || [];
      all.push(...batch);
      if (batch.length < limit) break;
      offset += limit;
    } catch (e: any) {
      console.error(`[MLAdsAPI] Erro ao listar campanhas (${account}):`, e.message);
      break;
    }
  }

  return all;
}

// ─── Ações de campanha ────────────────────────────────────────────────────────

export async function apiPauseMLCampaign(account: string, campaignId: string, campaignName: string): Promise<string> {
  const advertiserId = getAdvertiserId(account);
  if (!advertiserId) return `ML_ADVERTISER_ID não configurado para ${account}`;
  try {
    await mlFetch(
      "PUT",
      `/advertising/advertisers/${advertiserId}/product_ads/campaigns/${campaignId}`,
      account,
      { status: "paused" }
    );
    return `✅ Campanha "${campaignName || campaignId}" pausada.`;
  } catch (e: any) {
    return `❌ Erro ao pausar "${campaignName || campaignId}": ${e.message}`;
  }
}

export async function apiActivateMLCampaign(account: string, campaignId: string, campaignName: string): Promise<string> {
  const advertiserId = getAdvertiserId(account);
  if (!advertiserId) return `ML_ADVERTISER_ID não configurado para ${account}`;
  try {
    await mlFetch(
      "PUT",
      `/advertising/advertisers/${advertiserId}/product_ads/campaigns/${campaignId}`,
      account,
      { status: "active" }
    );
    return `✅ Campanha "${campaignName || campaignId}" reativada.`;
  } catch (e: any) {
    return `❌ Erro ao ativar "${campaignName || campaignId}": ${e.message}`;
  }
}

export async function apiUpdateMLBudget(account: string, campaignId: string, budget: number, campaignName: string): Promise<string> {
  const advertiserId = getAdvertiserId(account);
  if (!advertiserId) return `ML_ADVERTISER_ID não configurado para ${account}`;
  try {
    await mlFetch(
      "PUT",
      `/advertising/advertisers/${advertiserId}/product_ads/campaigns/${campaignId}`,
      account,
      { budget }
    );
    return `✅ Budget de "${campaignName || campaignId}" atualizado para R$${budget}.`;
  } catch (e: any) {
    return `❌ Erro ao atualizar budget de "${campaignName || campaignId}": ${e.message}`;
  }
}

// ─── Coleta de métricas → marketplace_ads_metrics ────────────────────────────

export async function apiScrapeMLMetrics(account = "feminnita"): Promise<number> {
  const advertiserId = getAdvertiserId(account);
  if (!advertiserId) {
    console.error(`[MLMetrics] ML_ADVERTISER_ID não configurado para ${account}`);
    return 0;
  }

  try {
    const campaigns = await apiListMLCampaigns(account);
    if (campaigns.length === 0) {
      console.warn(`[MLMetrics] Nenhuma campanha para ${account}`);
      return 0;
    }

    const db = await getDb();
    if (!db) { console.error("[MLMetrics] Banco indisponível"); return 0; }

    await db.delete(marketplaceAdsMetrics)
      .where(and(eq(marketplaceAdsMetrics.platform, "ml"), eq(marketplaceAdsMetrics.account, account)));

    const now = new Date();
    const rows = campaigns.map((c: any) => {
      const budget = Number(c.budget || 0);
      const acos   = Number(c.acos_target || 0);
      const roas   = acos > 0 ? (100 / acos) : (Number(c.roas_target) || 0);
      return {
        platform:     "ml",
        account,
        campaignId:   String(c.id || c.campaign_id || "").slice(0, 100),
        campaignName: String(c.name || c.campaign_name || ""),
        impressions:  Math.round(Number(c.impressions || 0)),
        clicks:       Math.round(Number(c.clicks || 0)),
        ctr:          String(Number(c.ctr || 0).toFixed(3)),
        spend:        String(Number(c.spend || 0).toFixed(2)),
        roas:         String(roas.toFixed(2)),
        revenue:      String(Number(c.revenue || c.sales || 0).toFixed(2)),
        acos:         String(acos.toFixed(2)),
        conversions:  Math.round(Number(c.conversions || c.orders || 0)),
        scrapedAt:    now,
      };
    });

    if (rows.length > 0) await db.insert(marketplaceAdsMetrics).values(rows);
    console.log(`[MLMetrics] ${rows.length} campanhas salvas para ${account} (budget/acos_target da listagem)`);
    return rows.length;
  } catch (e: any) {
    console.error(`[MLMetrics] Erro (${account}):`, e.message);
    return 0;
  }
}
