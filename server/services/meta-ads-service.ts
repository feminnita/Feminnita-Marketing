/**
 * Meta Ads Service — Busca e executa ações na conta Meta Ads (SaaS multi-tenant)
 *
 * Todas as funções públicas aceitam `creds?: MetaCreds`.
 * Se omitido, fazem fallback para as env vars (compatibilidade retroativa).
 */

import { getDb } from "../db";
import { oauthTokens } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const BASE_URL = "https://graph.facebook.com/v19.0";

// Env var fallback (usado quando não há creds do DB)
const ENV_TOKEN   = process.env.META_ACCESS_TOKEN   || "";
const ENV_ACCOUNT = process.env.META_AD_ACCOUNT_ID  || "";

export interface MetaCreds {
  token:     string;
  accountId: string;
}

function envCreds(): MetaCreds {
  return { token: ENV_TOKEN, accountId: ENV_ACCOUNT };
}

/** Busca credenciais Meta do usuário no banco. Retorna null se não conectado. */
export async function getValidMetaCredentials(userId: number): Promise<MetaCreds | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select({
    accessToken: oauthTokens.accessToken,
    accountInfo: oauthTokens.accountInfo,
  })
    .from(oauthTokens)
    .where(and(
      eq(oauthTokens.userId, userId),
      eq(oauthTokens.plataforma, "meta"),
      eq(oauthTokens.isActive, true),
    ))
    .limit(1);
  if (rows.length === 0) return null;
  const info      = rows[0].accountInfo ? JSON.parse(rows[0].accountInfo) : {};
  const accountId = (info.adAccountId as string) ?? "";
  return { token: rows[0].accessToken, accountId };
}

/** Salva o adAccountId do usuário no banco (chamado via tRPC após conectar). */
export async function setMetaAdAccountId(userId: number, adAccountId: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const rows = await db.select({ id: oauthTokens.id, accountInfo: oauthTokens.accountInfo })
    .from(oauthTokens)
    .where(and(eq(oauthTokens.userId, userId), eq(oauthTokens.plataforma, "meta")))
    .limit(1);
  if (rows.length === 0) return;
  const info = rows[0].accountInfo ? JSON.parse(rows[0].accountInfo) : {};
  info.adAccountId = adAccountId;
  await db.update(oauthTokens).set({ accountInfo: JSON.stringify(info) })
    .where(eq(oauthTokens.id, rows[0].id));
}

/** Status da conexão Meta do usuário. Fallback para env vars se não houver token no banco. */
export async function getMetaConnectionStatus(userId: number): Promise<{ connected: boolean; adAccountId: string | null; source: "db" | "env" | "none" }> {
  const creds = await getValidMetaCredentials(userId);
  if (creds) return { connected: true, adAccountId: creds.accountId || null, source: "db" };
  if (ENV_TOKEN) return { connected: true, adAccountId: ENV_ACCOUNT || null, source: "env" };
  return { connected: false, adAccountId: null, source: "none" };
}

export interface MetaCampaignData {
  id: string;
  name: string;
  status: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpm: number;
  cpp: number;
  reach: number;
  frequency: number;
  actions?: { action_type: string; value: string }[];
  roas?: number;
}

export interface MetaAdsetData {
  id: string;
  name: string;
  campaignId: string;
  campaignName: string;
  status: string;
  dailyBudget?: number;
  lifetimeBudget?: number;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpm: number;
  roas?: number;
}

export interface MetaAccountData {
  spendToday: number;
  spendMonth: number;
  campaigns: MetaCampaignData[];
  error?: string;
}

async function metaGet(path: string, params: Record<string, string> = {}, creds?: MetaCreds): Promise<any> {
  const token = creds?.token ?? ENV_TOKEN;
  const query = new URLSearchParams({ access_token: token, ...params });
  const res = await fetch(`${BASE_URL}${path}?${query}`);
  const json = await res.json();
  if (json.error) throw new Error(`Meta API: ${json.error.message}`);
  return json;
}

async function metaPost(path: string, body: Record<string, string> = {}, creds?: MetaCreds): Promise<any> {
  const token = creds?.token ?? ENV_TOKEN;
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ access_token: token, ...body }),
  });
  const json = await res.json();
  if (json.error) throw new Error(`Meta API: ${json.error.message}`);
  return json;
}

// ─── Leitura ──────────────────────────────────────────────────────────────────

async function fetchCampaigns(datePreset: "today" | "this_month", creds?: MetaCreds): Promise<MetaCampaignData[]> {
  const account = creds?.accountId ?? ENV_ACCOUNT;
  const fields = [
    "campaign_id", "campaign_name",
    "spend", "impressions", "clicks", "ctr", "cpm", "cpp",
    "reach", "frequency", "actions",
  ].join(",");

  const data = await metaGet(`/${account}/insights`, {
    level: "campaign",
    date_preset: datePreset,
    fields,
    limit: "20",
  }, creds);

  return (data.data || []).map((row: any) => {
    const purchaseAction = (row.actions || []).find(
      (a: any) => a.action_type === "purchase" || a.action_type === "omni_purchase"
    );
    const revenue = purchaseAction ? parseFloat(purchaseAction.value) : 0;
    const spend = parseFloat(row.spend || "0");
    return {
      id: row.campaign_id,
      name: row.campaign_name,
      status: "ACTIVE",
      spend,
      impressions: parseInt(row.impressions || "0"),
      clicks: parseInt(row.clicks || "0"),
      ctr: parseFloat(row.ctr || "0"),
      cpm: parseFloat(row.cpm || "0"),
      cpp: parseFloat(row.cpp || "0"),
      reach: parseInt(row.reach || "0"),
      frequency: parseFloat(row.frequency || "0"),
      actions: row.actions || [],
      roas: spend > 0 && revenue > 0 ? revenue / spend : undefined,
    };
  });
}

export async function fetchMetaAdsData(creds?: MetaCreds): Promise<MetaAccountData> {
  const token = creds?.token ?? ENV_TOKEN;
  if (!token || token === "seu_token_de_acesso_meta") {
    return { spendToday: 0, spendMonth: 0, campaigns: [], error: "Token Meta não configurado" };
  }
  try {
    const [todayCampaigns, monthCampaigns] = await Promise.all([
      fetchCampaigns("today", creds),
      fetchCampaigns("this_month", creds),
    ]);
    const spendToday = todayCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const spendMonth = monthCampaigns.reduce((sum, c) => sum + c.spend, 0);
    return { spendToday, spendMonth, campaigns: monthCampaigns };
  } catch (err: any) {
    console.error("[MetaAdsService] Erro:", err.message);
    return { spendToday: 0, spendMonth: 0, campaigns: [], error: err.message };
  }
}

export async function fetchMetaCampaignsList(creds?: MetaCreds): Promise<{ id: string; name: string; status: string; effectiveStatus: string; objective: string }[]> {
  const account = creds?.accountId ?? ENV_ACCOUNT;
  const data = await metaGet(`/${account}/campaigns`, {
    fields: "id,name,status,effective_status,objective",
    limit: "30",
  }, creds);
  return (data.data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    effectiveStatus: c.effective_status || c.status,
    objective: c.objective,
  }));
}

export async function fetchMetaAdsets(campaignId?: string, creds?: MetaCreds): Promise<MetaAdsetData[]> {
  const account = creds?.accountId ?? ENV_ACCOUNT;
  const path = campaignId
    ? `/${campaignId}/adsets`
    : `/${account}/adsets`;

  const fields = "id,name,campaign_id,campaign{name},status,daily_budget,lifetime_budget";
  const data = await metaGet(path, { fields, limit: "30" }, creds);

  // Buscar insights separadamente
  const insightsData = await metaGet(`/${account}/insights`, {
    level: "adset",
    date_preset: "this_month",
    fields: "adset_id,spend,impressions,clicks,ctr,cpm,actions",
    limit: "30",
    ...(campaignId ? { filtering: JSON.stringify([{ field: "campaign.id", operator: "EQUAL", value: campaignId }]) } : {}),
  }, creds);

  const insightsMap: Record<string, any> = {};
  for (const row of (insightsData.data || [])) {
    insightsMap[row.adset_id] = row;
  }

  return (data.data || []).map((adset: any) => {
    const ins = insightsMap[adset.id] || {};
    const spend = parseFloat(ins.spend || "0");
    const purchaseAction = (ins.actions || []).find(
      (a: any) => a.action_type === "purchase" || a.action_type === "omni_purchase"
    );
    const revenue = purchaseAction ? parseFloat(purchaseAction.value) : 0;
    return {
      id: adset.id,
      name: adset.name,
      campaignId: adset.campaign_id,
      campaignName: adset.campaign?.name || "",
      status: adset.status,
      dailyBudget: adset.daily_budget ? parseInt(adset.daily_budget) / 100 : undefined,
      lifetimeBudget: adset.lifetime_budget ? parseInt(adset.lifetime_budget) / 100 : undefined,
      spend,
      impressions: parseInt(ins.impressions || "0"),
      clicks: parseInt(ins.clicks || "0"),
      ctr: parseFloat(ins.ctr || "0"),
      cpm: parseFloat(ins.cpm || "0"),
      roas: spend > 0 && revenue > 0 ? revenue / spend : undefined,
    };
  });
}

export async function fetchMetaInsights(
  level: "campaign" | "adset" | "ad",
  datePreset: string,
  objectId?: string,
  creds?: MetaCreds,
): Promise<any[]> {
  const account = creds?.accountId ?? ENV_ACCOUNT;
  const path = objectId ? `/${objectId}/insights` : `/${account}/insights`;
  const fields = [
    "campaign_name", "adset_name", "ad_name",
    "spend", "impressions", "clicks", "ctr", "cpm", "cpc", "cpp",
    "reach", "frequency", "actions", "cost_per_action_type",
  ].join(",");

  const data = await metaGet(path, { level, date_preset: datePreset, fields, limit: "30" }, creds);
  return data.data || [];
}

export async function fetchMetaAds(adsetId?: string, campaignId?: string, creds?: MetaCreds): Promise<Array<{
  id: string;
  name: string;
  status: string;
  adsetId: string;
  adsetName: string;
  campaignName: string;
  thumbnailUrl?: string;
  imageUrl?: string;
  body?: string;
  title?: string;
  callToActionType?: string;
  linkUrl?: string;
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  roas?: number;
}>> {
  const account = creds?.accountId ?? ENV_ACCOUNT;
  const path = adsetId ? `/${adsetId}/ads` : campaignId ? `/${campaignId}/ads` : `/${account}/ads`;
  const fields = "id,name,status,adset_id,adset{name,campaign{name}},creative{id,thumbnail_url,image_url,body,title,call_to_action_type,link_url,object_story_spec}";

  let ads: any[] = [];
  try {
    const data = await metaGet(path, { fields, limit: "30" }, creds);
    ads = data.data || [];
  } catch (err: any) {
    console.warn("[MetaAds] Erro ao buscar ads:", err.message);
    return [];
  }

  // Buscar insights dos ads
  const insPath = adsetId ? `/${adsetId}/insights` : campaignId ? `/${campaignId}/insights` : `/${account}/insights`;
  let insMap: Record<string, any> = {};
  try {
    const insData = await metaGet(insPath, {
      level: "ad",
      date_preset: "last_30d",
      fields: "ad_id,spend,impressions,clicks,ctr,actions",
      limit: "30",
    }, creds);
    for (const row of (insData.data || [])) insMap[row.ad_id] = row;
  } catch {}

  return ads.map((ad: any) => {
    const creative = ad.creative || {};
    const ins = insMap[ad.id] || {};
    const spend = parseFloat(ins.spend || "0");
    const purchaseAction = (ins.actions || []).find(
      (a: any) => a.action_type === "purchase" || a.action_type === "omni_purchase"
    );
    const revenue = purchaseAction ? parseFloat(purchaseAction.value) * 400 : 0;

    const linkUrl = creative.link_url
      || creative.object_story_spec?.link_data?.link
      || creative.object_story_spec?.video_data?.call_to_action?.value?.link
      || undefined;

    return {
      id: ad.id,
      name: ad.name,
      status: ad.status,
      adsetId: ad.adset_id,
      adsetName: ad.adset?.name || "",
      campaignName: ad.adset?.campaign?.name || "",
      thumbnailUrl: creative.thumbnail_url || undefined,
      imageUrl: creative.image_url || undefined,
      body: creative.body || undefined,
      title: creative.title || undefined,
      callToActionType: creative.call_to_action_type || undefined,
      linkUrl,
      spend,
      impressions: parseInt(ins.impressions || "0"),
      clicks: parseInt(ins.clicks || "0"),
      ctr: parseFloat(ins.ctr || "0"),
      roas: spend > 0 && revenue > 0 ? revenue / spend : undefined,
    };
  });
}

// ─── Escrita / Execução de ações ──────────────────────────────────────────────

export async function pauseCampaign(campaignId: string, creds?: MetaCreds): Promise<{ success: boolean }> {
  await metaPost(`/${campaignId}`, { status: "PAUSED" }, creds);
  return { success: true };
}

export async function resumeCampaign(campaignId: string, creds?: MetaCreds): Promise<{ success: boolean }> {
  await metaPost(`/${campaignId}`, { status: "ACTIVE" }, creds);
  return { success: true };
}

export async function pauseAdset(adsetId: string, creds?: MetaCreds): Promise<{ success: boolean }> {
  await metaPost(`/${adsetId}`, { status: "PAUSED" }, creds);
  return { success: true };
}

export async function resumeAdset(adsetId: string, creds?: MetaCreds): Promise<{ success: boolean }> {
  await metaPost(`/${adsetId}`, { status: "ACTIVE" }, creds);
  return { success: true };
}

export async function updateAdsetBudget(
  adsetId: string,
  dailyBudgetCents?: number,
  lifetimeBudgetCents?: number,
  creds?: MetaCreds,
): Promise<{ success: boolean }> {
  const body: Record<string, string> = {};
  if (dailyBudgetCents) body.daily_budget = String(dailyBudgetCents);
  if (lifetimeBudgetCents) body.lifetime_budget = String(lifetimeBudgetCents);
  await metaPost(`/${adsetId}`, body, creds);
  return { success: true };
}

export async function updateCampaignBudget(
  campaignId: string,
  dailyBudgetCents: number,
  creds?: MetaCreds,
): Promise<{ success: boolean }> {
  await metaPost(`/${campaignId}`, { daily_budget: String(dailyBudgetCents) }, creds);
  return { success: true };
}

export async function pauseAd(adId: string, creds?: MetaCreds): Promise<{ success: boolean }> {
  await metaPost(`/${adId}`, { status: "PAUSED" }, creds);
  return { success: true };
}

export async function resumeAd(adId: string, creds?: MetaCreds): Promise<{ success: boolean }> {
  await metaPost(`/${adId}`, { status: "ACTIVE" }, creds);
  return { success: true };
}

export async function fetchMetaInsightsWithBreakdown(
  level: "campaign" | "adset" | "ad",
  datePreset: string,
  breakdowns: string,
  objectId?: string,
  creds?: MetaCreds,
): Promise<any[]> {
  const account = creds?.accountId ?? ENV_ACCOUNT;
  const path = objectId ? `/${objectId}/insights` : `/${account}/insights`;
  const fields = [
    "campaign_name", "adset_name", "ad_name",
    "spend", "impressions", "clicks", "ctr", "cpm", "reach", "frequency", "actions",
  ].join(",");
  const data = await metaGet(path, { level, date_preset: datePreset, fields, breakdowns, limit: "50" }, creds);
  return data.data || [];
}

export async function duplicateCampaign(
  campaignId: string,
  creds?: MetaCreds,
): Promise<{ newCampaignId: string; name: string }> {
  const copy = await metaPost(`/${campaignId}/copies`, {
    status_option: "PAUSED",
    deep_copy: "true",
  }, creds);
  const newId = copy.copied_campaign_id as string;
  const campaign = await metaGet(`/${newId}`, { fields: "id,name" }, creds);
  return { newCampaignId: newId, name: campaign.name as string };
}

export async function swapUrlTags(
  adId: string,
  urlTags: string,
  creds?: MetaCreds,
): Promise<{ success: boolean; newAdId: string }> {
  const account = creds?.accountId ?? ENV_ACCOUNT;

  // 1. Buscar o ad e seu criativo atual
  const adData = await metaGet(`/${adId}`, {
    fields: "name,adset_id,status,creative{id,object_story_id,image_hash,body,title,call_to_action_type,link_url,url_tags},tracking_specs",
  }, creds);
  const creative = adData.creative || {};
  const adsetId = adData.adset_id as string;

  // 2. Criar novo criativo com os url_tags corretos
  const newCreativeBody: Record<string, string> = {
    name: `${creative.id || adData.name} [url_tags_fix]`,
    url_tags: urlTags,
  };

  if (creative.object_story_id) {
    newCreativeBody.object_story_id = creative.object_story_id;
  } else {
    throw new Error("Criativo baseado em post orgânico não encontrado (object_story_id ausente). Verifique o ad manualmente.");
  }

  const newCreative = await metaPost(`/${account}/adcreatives`, newCreativeBody, creds);
  const newCreativeId = newCreative.id as string;

  // 3. Criar novo ad PAUSED com o criativo novo
  const newAdBody: Record<string, string> = {
    name: `${adData.name} [url_tags_fix]`,
    adset_id: adsetId,
    creative: JSON.stringify({ creative_id: newCreativeId }),
    status: "PAUSED",
  };
  if (adData.tracking_specs) {
    newAdBody.tracking_specs = JSON.stringify(adData.tracking_specs);
  }
  const newAd = await metaPost(`/${account}/ads`, newAdBody, creds);
  const newAdId = newAd.id as string;

  // 4. Ativar novo ad e pausar o antigo
  await metaPost(`/${newAdId}`, { status: "ACTIVE" }, creds);
  await metaPost(`/${adId}`, { status: "PAUSED" }, creds);

  return { success: true, newAdId };
}
