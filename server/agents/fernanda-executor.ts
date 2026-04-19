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

// ─── Upload de imagem ─────────────────────────────────────────────────────────

export async function uploadAdImage(imageUrl: string): Promise<string> {
  // Baixa a imagem e faz upload para a conta de anúncios
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Não foi possível baixar a imagem: ${imgRes.status}`);

  const buffer = await imgRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString("base64");

  const data = await metaPost(`${AD_ACCOUNT_ID}/adimages`, {
    bytes: base64,
  });

  // Retorna o hash da imagem (usado para criar criativos)
  const images = data.images || {};
  const firstKey = Object.keys(images)[0];
  const imageHash = images[firstKey]?.hash;

  if (!imageHash) throw new Error("Upload de imagem falhou — hash não retornado");
  return imageHash;
}

// ─── Criar criativo (imagem + copy) ──────────────────────────────────────────

export async function createAdCreative(params: {
  name: string;
  pageId: string;
  imageHash: string;
  title: string;        // headline do anúncio
  body: string;         // copy principal (texto da Beatriz)
  linkUrl: string;      // URL de destino
  callToAction?: string; // "SHOP_NOW" | "LEARN_MORE" | "SIGN_UP"
}): Promise<string> {
  const data = await metaPost(`${AD_ACCOUNT_ID}/adcreatives`, {
    name: params.name,
    object_story_spec: {
      page_id: params.pageId,
      link_data: {
        image_hash: params.imageHash,
        link: params.linkUrl,
        message: params.body,
        name: params.title,
        call_to_action: {
          type: params.callToAction || "SHOP_NOW",
          value: { link: params.linkUrl },
        },
      },
    },
  });

  return data.id;
}

// ─── Criar anúncio completo (campanha + conjunto + anúncio) ──────────────────

export async function createFullAd(params: {
  campaignId: string;    // campanha existente onde publicar
  adSetId: string;       // conjunto de anúncios existente
  adName: string;
  imageUrl: string;      // URL da imagem preparada pela equipe criativa
  title: string;         // headline
  body: string;          // copy da Beatriz
  linkUrl: string;
  callToAction?: string;
}): Promise<{ adId: string; creativeId: string; imageHash: string }> {
  const pageId = process.env.META_PAGE_ID || "";
  if (!pageId) throw new Error("META_PAGE_ID não configurado");

  // 1. Upload da imagem
  console.log(`[FernandaExecutor] Fazendo upload da imagem...`);
  const imageHash = await uploadAdImage(params.imageUrl);

  // 2. Criar criativo
  console.log(`[FernandaExecutor] Criando criativo...`);
  const creativeId = await createAdCreative({
    name: `Criativo — ${params.adName}`,
    pageId,
    imageHash,
    title: params.title,
    body: params.body,
    linkUrl: params.linkUrl,
    callToAction: params.callToAction,
  });

  // 3. Criar anúncio (sempre pausado para revisão)
  console.log(`[FernandaExecutor] Criando anúncio...`);
  const adData = await metaPost(`${AD_ACCOUNT_ID}/ads`, {
    name: params.adName,
    adset_id: params.adSetId,
    creative: { creative_id: creativeId },
    status: "PAUSED",
  });

  console.log(`[FernandaExecutor] ✓ Anúncio criado (pausado): ${adData.id}`);
  return { adId: adData.id, creativeId, imageHash };
}

// ─── Dispatcher principal ─────────────────────────────────────────────────────

export interface MetaActionPayload {
  campaignId?: string;
  campaignName?: string;
  adSetId?: string;
  dailyBudgetReais?: number;
  name?: string;
  objective?: string;
  // Criação de anúncio completo
  adName?: string;
  imageUrl?: string;
  title?: string;
  body?: string;
  linkUrl?: string;
  callToAction?: string;
  newDailyBudget?: number;
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

    case "meta_update_budget":
      if (!payload.campaignId) throw new Error("campaignId obrigatório");
      const budget = payload.newDailyBudget || payload.dailyBudgetReais;
      if (!budget) throw new Error("newDailyBudget obrigatório");
      await updateCampaignBudget(payload.campaignId, budget);
      return `Orçamento de "${payload.campaignName || payload.campaignId}" atualizado para R$${budget}/dia.`;

    case "meta_upload_image":
      if (!payload.imageUrl) throw new Error("imageUrl obrigatório");
      const hash = await uploadAdImage(payload.imageUrl);
      return `Imagem enviada com sucesso. Hash: ${hash}`;

    case "meta_create_full_ad":
      if (!payload.campaignId || !payload.adSetId || !payload.imageUrl || !payload.body || !payload.title) {
        throw new Error("campaignId, adSetId, imageUrl, title e body são obrigatórios");
      }
      const adResult = await createFullAd({
        campaignId: payload.campaignId,
        adSetId: payload.adSetId,
        adName: payload.adName || payload.title || "Novo anúncio",
        imageUrl: payload.imageUrl,
        title: payload.title,
        body: payload.body,
        linkUrl: payload.linkUrl || "https://www.feminnita.com.br",
        callToAction: payload.callToAction,
      });
      return `Anúncio criado com sucesso (pausado para revisão). ID: ${adResult.adId}`;

    default:
      throw new Error(`Tipo de ação Meta desconhecido: ${actionType}`);
  }
}
