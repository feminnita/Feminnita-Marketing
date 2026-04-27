/**
 * Meta Ads Service — Busca e executa ações na conta Meta Ads
 */

const META_TOKEN = process.env.META_ACCESS_TOKEN || "";
const META_ACCOUNT = process.env.META_AD_ACCOUNT_ID || "";
const BASE_URL = "https://graph.facebook.com/v19.0";

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

async function metaGet(path: string, params: Record<string, string> = {}): Promise<any> {
  const query = new URLSearchParams({ access_token: META_TOKEN, ...params });
  const res = await fetch(`${BASE_URL}${path}?${query}`);
  const json = await res.json();
  if (json.error) throw new Error(`Meta API: ${json.error.message}`);
  return json;
}

async function metaPost(path: string, body: Record<string, string> = {}): Promise<any> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ access_token: META_TOKEN, ...body }),
  });
  const json = await res.json();
  if (json.error) throw new Error(`Meta API: ${json.error.message}`);
  return json;
}

// ─── Leitura ──────────────────────────────────────────────────────────────────

async function fetchCampaigns(datePreset: "today" | "this_month"): Promise<MetaCampaignData[]> {
  const fields = [
    "campaign_id", "campaign_name",
    "spend", "impressions", "clicks", "ctr", "cpm", "cpp",
    "reach", "frequency", "actions",
  ].join(",");

  const data = await metaGet(`/${META_ACCOUNT}/insights`, {
    level: "campaign",
    date_preset: datePreset,
    fields,
    limit: "20",
  });

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

export async function fetchMetaAdsData(): Promise<MetaAccountData> {
  if (!META_TOKEN || META_TOKEN === "seu_token_de_acesso_meta") {
    return { spendToday: 0, spendMonth: 0, campaigns: [], error: "Token Meta não configurado" };
  }
  try {
    const [todayCampaigns, monthCampaigns] = await Promise.all([
      fetchCampaigns("today"),
      fetchCampaigns("this_month"),
    ]);
    const spendToday = todayCampaigns.reduce((sum, c) => sum + c.spend, 0);
    const spendMonth = monthCampaigns.reduce((sum, c) => sum + c.spend, 0);
    return { spendToday, spendMonth, campaigns: monthCampaigns };
  } catch (err: any) {
    console.error("[MetaAdsService] Erro:", err.message);
    return { spendToday: 0, spendMonth: 0, campaigns: [], error: err.message };
  }
}

export async function fetchMetaCampaignsList(): Promise<{ id: string; name: string; status: string; effectiveStatus: string; objective: string }[]> {
  const data = await metaGet(`/${META_ACCOUNT}/campaigns`, {
    fields: "id,name,status,effective_status,objective",
    limit: "30",
  });
  return (data.data || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    status: c.status,
    effectiveStatus: c.effective_status || c.status,
    objective: c.objective,
  }));
}

export async function fetchMetaAdsets(campaignId?: string): Promise<MetaAdsetData[]> {
  const path = campaignId
    ? `/${campaignId}/adsets`
    : `/${META_ACCOUNT}/adsets`;

  const fields = "id,name,campaign_id,campaign{name},status,daily_budget,lifetime_budget";
  const data = await metaGet(path, { fields, limit: "30" });

  // Buscar insights separadamente
  const insightsData = await metaGet(`/${META_ACCOUNT}/insights`, {
    level: "adset",
    date_preset: "this_month",
    fields: "adset_id,spend,impressions,clicks,ctr,cpm,actions",
    limit: "30",
    ...(campaignId ? { filtering: JSON.stringify([{ field: "campaign.id", operator: "EQUAL", value: campaignId }]) } : {}),
  });

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
  objectId?: string
): Promise<any[]> {
  const path = objectId ? `/${objectId}/insights` : `/${META_ACCOUNT}/insights`;
  const fields = [
    "campaign_name", "adset_name", "ad_name",
    "spend", "impressions", "clicks", "ctr", "cpm", "cpc", "cpp",
    "reach", "frequency", "actions", "cost_per_action_type",
  ].join(",");

  const data = await metaGet(path, { level, date_preset: datePreset, fields, limit: "30" });
  return data.data || [];
}

export async function fetchMetaAds(adsetId?: string, campaignId?: string): Promise<Array<{
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
  const path = adsetId ? `/${adsetId}/ads` : campaignId ? `/${campaignId}/ads` : `/${META_ACCOUNT}/ads`;
  const fields = "id,name,status,adset_id,adset{name,campaign{name}},creative{id,thumbnail_url,image_url,body,title,call_to_action_type,link_url,object_story_spec}";

  let ads: any[] = [];
  try {
    const data = await metaGet(path, { fields, limit: "30" });
    ads = data.data || [];
  } catch (err: any) {
    console.warn("[MetaAds] Erro ao buscar ads:", err.message);
    return [];
  }

  // Buscar insights dos ads
  const insPath = adsetId ? `/${adsetId}/insights` : campaignId ? `/${campaignId}/insights` : `/${META_ACCOUNT}/insights`;
  let insMap: Record<string, any> = {};
  try {
    const insData = await metaGet(insPath, {
      level: "ad",
      date_preset: "last_30d",
      fields: "ad_id,spend,impressions,clicks,ctr,actions",
      limit: "30",
    });
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

export async function pauseCampaign(campaignId: string): Promise<{ success: boolean }> {
  await metaPost(`/${campaignId}`, { status: "PAUSED" });
  return { success: true };
}

export async function resumeCampaign(campaignId: string): Promise<{ success: boolean }> {
  await metaPost(`/${campaignId}`, { status: "ACTIVE" });
  return { success: true };
}

export async function pauseAdset(adsetId: string): Promise<{ success: boolean }> {
  await metaPost(`/${adsetId}`, { status: "PAUSED" });
  return { success: true };
}

export async function resumeAdset(adsetId: string): Promise<{ success: boolean }> {
  await metaPost(`/${adsetId}`, { status: "ACTIVE" });
  return { success: true };
}

export async function updateAdsetBudget(
  adsetId: string,
  dailyBudgetCents?: number,
  lifetimeBudgetCents?: number
): Promise<{ success: boolean }> {
  const body: Record<string, string> = {};
  if (dailyBudgetCents) body.daily_budget = String(dailyBudgetCents);
  if (lifetimeBudgetCents) body.lifetime_budget = String(lifetimeBudgetCents);
  await metaPost(`/${adsetId}`, body);
  return { success: true };
}

export async function updateCampaignBudget(
  campaignId: string,
  dailyBudgetCents: number
): Promise<{ success: boolean }> {
  await metaPost(`/${campaignId}`, { daily_budget: String(dailyBudgetCents) });
  return { success: true };
}

export async function pauseAd(adId: string): Promise<{ success: boolean }> {
  await metaPost(`/${adId}`, { status: "PAUSED" });
  return { success: true };
}

export async function resumeAd(adId: string): Promise<{ success: boolean }> {
  await metaPost(`/${adId}`, { status: "ACTIVE" });
  return { success: true };
}
