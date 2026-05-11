/**
 * ML Product Ads — REST API (sem Playwright/Chromium)
 * Substitui o ml-ads-browser-agent para execução de ações e coleta de métricas.
 * Chamadas leves de JSON: ~1KB por request, zero risco de OOM.
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

function getUserId(account: string): string {
  return account === "fnt"
    ? (process.env.ML_USER_ID_2 || "")
    : (process.env.ML_USER_ID_1 || "");
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
  const userId = getUserId(account);
  if (!userId) return [];

  const all: any[] = [];
  let offset = 0;
  const limit = 50;

  while (true) {
    try {
      const data = await mlFetch(
        "GET",
        `/advertising/product_ads/v1/accounts/${userId}/product_ads/campaigns?status=A%2CP&limit=${limit}&offset=${offset}`,
        account
      );
      const batch: any[] = data.product_ads_campaigns || data.results || data.campaigns || [];
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
  const userId = getUserId(account);
  if (!userId) return `User ID não configurado para ${account}`;
  try {
    await mlFetch(
      "PATCH",
      `/advertising/product_ads/v1/accounts/${userId}/product_ads/campaigns/${campaignId}`,
      account,
      { status: "paused" }
    );
    return `✅ Campanha "${campaignName || campaignId}" pausada via API.`;
  } catch (e: any) {
    return `❌ Erro ao pausar "${campaignName || campaignId}": ${e.message}`;
  }
}

export async function apiActivateMLCampaign(account: string, campaignId: string, campaignName: string): Promise<string> {
  const userId = getUserId(account);
  if (!userId) return `User ID não configurado para ${account}`;
  try {
    await mlFetch(
      "PATCH",
      `/advertising/product_ads/v1/accounts/${userId}/product_ads/campaigns/${campaignId}`,
      account,
      { status: "active" }
    );
    return `✅ Campanha "${campaignName || campaignId}" reativada via API.`;
  } catch (e: any) {
    return `❌ Erro ao ativar "${campaignName || campaignId}": ${e.message}`;
  }
}

export async function apiUpdateMLBudget(account: string, campaignId: string, budget: number, campaignName: string): Promise<string> {
  const userId = getUserId(account);
  if (!userId) return `User ID não configurado para ${account}`;
  try {
    await mlFetch(
      "PATCH",
      `/advertising/product_ads/v1/accounts/${userId}/product_ads/campaigns/${campaignId}`,
      account,
      { daily_budget: budget }
    );
    return `✅ Budget de "${campaignName || campaignId}" atualizado para R$${budget} via API.`;
  } catch (e: any) {
    return `❌ Erro ao atualizar budget de "${campaignName || campaignId}": ${e.message}`;
  }
}

// ─── Coleta de métricas → marketplace_ads_metrics ────────────────────────────

export async function apiScrapeMLMetrics(account = "feminnita"): Promise<number> {
  const userId = getUserId(account);
  if (!userId) { console.error(`[MLMetrics] User ID não configurado para ${account}`); return 0; }

  try {
    const campaigns = await apiListMLCampaigns(account);
    if (campaigns.length === 0) {
      console.warn(`[MLMetrics] Nenhuma campanha para ${account}`);
      return 0;
    }

    const dateTo   = new Date().toISOString().slice(0, 10);
    const dateFrom = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

    const metricsById = new Map<string, any>();
    try {
      const md = await mlFetch(
        "GET",
        `/advertising/product_ads/v1/accounts/${userId}/product_ads/metrics?date_from=${dateFrom}&date_to=${dateTo}`,
        account
      );
      for (const m of (md.results || md.campaign_metrics || [])) {
        metricsById.set(String(m.campaign_id || m.id), m);
      }
    } catch (e: any) {
      console.warn(`[MLMetrics] Endpoint de métricas indisponível (${account}): ${e.message}`);
    }

    const db = await getDb();
    if (!db) { console.error("[MLMetrics] Banco indisponível"); return 0; }

    await db.delete(marketplaceAdsMetrics)
      .where(and(eq(marketplaceAdsMetrics.platform, "ml"), eq(marketplaceAdsMetrics.account, account)));

    const now = new Date();
    const rows = campaigns.map((c: any) => {
      const m = metricsById.get(String(c.id || c.campaign_id)) || {};
      const roas = Number(m.roas || 0);
      return {
        platform:    "ml",
        account,
        campaignId:  String(c.id || c.campaign_id || "").slice(0, 100),
        campaignName: String(c.name || c.campaign_name || ""),
        impressions: Math.round(Number(m.impressions || 0)),
        clicks:      Math.round(Number(m.clicks || 0)),
        ctr:         String(Number(m.ctr || 0).toFixed(3)),
        spend:       String(Number(m.spend || 0).toFixed(2)),
        roas:        String(roas.toFixed(2)),
        revenue:     String(Number(m.revenue || m.sales || 0).toFixed(2)),
        acos:        String(roas > 0 ? (100 / roas).toFixed(2) : "0"),
        conversions: Math.round(Number(m.conversions || m.orders || 0)),
        scrapedAt:   now,
      };
    });

    if (rows.length > 0) await db.insert(marketplaceAdsMetrics).values(rows);
    console.log(`[MLMetrics] ${rows.length} campanhas salvas para ${account}`);
    return rows.length;
  } catch (e: any) {
    console.error(`[MLMetrics] Erro (${account}):`, e.message);
    return 0;
  }
}
