/**
 * Fernanda Executor — Execução de ações na Meta Ads API
 *
 * Responsabilidade: receber ações aprovadas pelo usuário e executá-las
 * na conta Meta Ads da Feminnita.
 *
 * Requer token com permissão ads_management (escrita).
 * Token somente-leitura retorna erro 200 com { error: { code: 200 } }.
 */

const META_TOKEN = process.env.META_ACCESS_TOKEN || "";
const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || "act_231648936319132";
const GRAPH_BASE = "https://graph.facebook.com/v20.0";

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function metaPost(path: string, body: Record<string, any>): Promise<any> {
  const res = await fetch(`${GRAPH_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, access_token: META_TOKEN }),
  });
  const data = await res.json() as any;
  if (data.error) throw new Error(`Meta API: ${data.error.message} (código ${data.error.code})`);
  return data;
}

// ─── Ações individuais ────────────────────────────────────────────────────────

export async function pauseCampaign(campaignId: string): Promise<void> {
  await metaPost(campaignId, { status: "PAUSED" });
}

export async function resumeCampaign(campaignId: string): Promise<void> {
  await metaPost(campaignId, { status: "ACTIVE" });
}

export async function updateCampaignBudget(campaignId: string, dailyBudgetReais: number): Promise<void> {
  // Meta API usa centavos
  await metaPost(campaignId, { daily_budget: Math.round(dailyBudgetReais * 100) });
}

export async function updateAdSetBudget(adSetId: string, dailyBudgetReais: number): Promise<void> {
  await metaPost(adSetId, { daily_budget: Math.round(dailyBudgetReais * 100) });
}

export async function createCampaign(
  name: string,
  objective: string,    // OUTCOME_SALES | OUTCOME_TRAFFIC | OUTCOME_AWARENESS
  dailyBudgetReais: number
): Promise<string> {
  const data = await metaPost(`${AD_ACCOUNT_ID}/campaigns`, {
    name,
    objective,
    status: "PAUSED", // sempre criada pausada — usuário ativa manualmente
    daily_budget: Math.round(dailyBudgetReais * 100),
    special_ad_categories: [],
  });
  return data.id;
}

export async function duplicateCampaign(campaignId: string, newName: string): Promise<string> {
  // Meta API: copiar campanha via /copies
  const data = await metaPost(`${campaignId}/copies`, {
    name: newName,
    status_option: "PAUSED",
  });
  return data.copied_campaign_id || data.id;
}

// ─── Dispatcher principal ─────────────────────────────────────────────────────

export interface MetaActionPayload {
  campaignId?: string;
  campaignName?: string;
  adSetId?: string;
  dailyBudgetReais?: number;
  name?: string;
  objective?: string;
}

export async function executeMetaAction(
  actionType: string,
  payload: MetaActionPayload
): Promise<string> {
  if (!META_TOKEN) throw new Error("META_ACCESS_TOKEN não configurado no servidor");

  switch (actionType) {
    case "meta_pause_campaign":
      if (!payload.campaignId) throw new Error("campaignId obrigatório");
      await pauseCampaign(payload.campaignId);
      return `Campanha "${payload.campaignName || payload.campaignId}" pausada com sucesso.`;

    case "meta_resume_campaign":
      if (!payload.campaignId) throw new Error("campaignId obrigatório");
      await resumeCampaign(payload.campaignId);
      return `Campanha "${payload.campaignName || payload.campaignId}" reativada.`;

    case "meta_update_budget":
      if (!payload.campaignId || !payload.dailyBudgetReais) throw new Error("campaignId e dailyBudgetReais obrigatórios");
      await updateCampaignBudget(payload.campaignId, payload.dailyBudgetReais);
      return `Orçamento de "${payload.campaignName}" atualizado para R$${payload.dailyBudgetReais}/dia.`;

    case "meta_create_campaign":
      if (!payload.name || !payload.objective || !payload.dailyBudgetReais) throw new Error("name, objective e dailyBudgetReais obrigatórios");
      const newId = await createCampaign(payload.name, payload.objective, payload.dailyBudgetReais);
      return `Campanha "${payload.name}" criada (ID: ${newId}). Status: PAUSADA — ative no Meta Ads Manager após revisar.`;

    case "meta_duplicate_campaign":
      if (!payload.campaignId || !payload.name) throw new Error("campaignId e name obrigatórios");
      const copyId = await duplicateCampaign(payload.campaignId, payload.name);
      return `Campanha duplicada: "${payload.name}" (ID: ${copyId}). Status: PAUSADA.`;

    default:
      throw new Error(`Tipo de ação Meta desconhecido: ${actionType}`);
  }
}
