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

// ─── Mutações de campanha (pause/activate/budget) ─────────────────────────────
// IMPORTANTE: endpoint individual usa /advertising/product_ads/campaigns/{id}?advertiser_id={adv}
// (e NÃO /advertising/advertisers/{adv}/product_ads/campaigns/{id})

function isPermissionWriteError(msg: string): boolean {
  return /does not have permission to write|UnauthorizedException|invalid_scope|insufficient_scope/i.test(msg);
}

function reauthMessage(account: string): string {
  return `Token OAuth do ML (${account}) sem permissão de escrita. Reautentique em /api/ml/oauth/start?account=${account} marcando o scope "advertising-write" para liberar pausar/ativar/budget via API.`;
}

async function mutateCampaign(
  account: string,
  campaignId: string,
  body: object,
): Promise<{ ok: boolean; data?: any; error?: string }> {
  const advertiserId = getAdvertiserId(account);
  if (!advertiserId) return { ok: false, error: `ML_ADVERTISER_ID não configurado para ${account}` };
  if (!campaignId) return { ok: false, error: "campaignId obrigatório" };

  const token = getToken(account);
  if (!token) return { ok: false, error: `Token ML não configurado para ${account}` };

  const url = `${ML_BASE}/advertising/product_ads/campaigns/${encodeURIComponent(campaignId)}?advertiser_id=${advertiserId}`;
  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "api-version": "2",
      },
      body: JSON.stringify(body),
    });
    let data: any = {};
    try { data = await res.json(); } catch {}
    if (!res.ok) {
      const msg = data?.message || data?.error || `HTTP ${res.status}`;
      if (res.status === 401 || res.status === 403 || isPermissionWriteError(msg)) {
        return { ok: false, error: reauthMessage(account) };
      }
      return { ok: false, error: `ML API PUT ${campaignId} → HTTP ${res.status}: ${msg}` };
    }
    return { ok: true, data };
  } catch (e: any) {
    return { ok: false, error: `ML API exception: ${e?.message || String(e)}` };
  }
}

export async function apiPauseCampaign(campaignId: string, account = "feminnita"): Promise<string> {
  const r = await mutateCampaign(account, campaignId, { status: "paused" });
  if (!r.ok) throw new Error(r.error || "Falha ao pausar");
  return `Campanha ${campaignId} pausada via API.`;
}

export async function apiActivateCampaign(campaignId: string, account = "feminnita"): Promise<string> {
  const r = await mutateCampaign(account, campaignId, { status: "active" });
  if (!r.ok) throw new Error(r.error || "Falha ao ativar");
  return `Campanha ${campaignId} ativada via API.`;
}

export async function apiUpdateCampaignBudget(
  campaignId: string,
  dailyBudget: number,
  account = "feminnita",
): Promise<string> {
  if (!(dailyBudget > 0)) throw new Error(`Budget inválido: ${dailyBudget}`);
  const r = await mutateCampaign(account, campaignId, { budget: dailyBudget });
  if (!r.ok) throw new Error(r.error || "Falha ao atualizar budget");
  return `Budget da campanha ${campaignId} atualizado para R$${dailyBudget.toFixed(2)}/dia via API.`;
}

/** Resolve campaign id pelo nome quando o usuário só passou o nome. */
export async function apiResolveCampaignByName(
  name: string,
  account = "feminnita",
): Promise<{ id: string; name: string } | null> {
  if (!name) return null;
  const all = await apiListMLCampaigns(account);
  const needle = name.toLowerCase().trim();
  const exact = all.find((c: any) => String(c.name || "").toLowerCase().trim() === needle);
  if (exact) return { id: String(exact.id), name: String(exact.name) };
  const partial = all.find((c: any) => String(c.name || "").toLowerCase().includes(needle));
  if (partial) return { id: String(partial.id), name: String(partial.name) };
  return null;
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
