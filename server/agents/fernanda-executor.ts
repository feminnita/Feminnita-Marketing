/**
 * Fernanda Executor — Execução de ações na Meta Ads API
 *
 * Responsabilidade: receber ações aprovadas pelo usuário e executá-las
 * na conta Meta Ads da Feminnita.
 *
 * Requer token com permissão ads_management (escrita).
 * Token somente-leitura retorna erro 200 com { error: { code: 200 } }.
 */

// Prefere System User Token (acesso total) — fallback para token de usuário
const META_TOKEN = process.env.META_SYSTEM_USER_TOKEN || process.env.META_ACCESS_TOKEN || "";
const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || "act_231648936319132";
const GRAPH_BASE = "https://graph.facebook.com/v20.0";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getToken(token?: string) { return token || META_TOKEN; }
function getAccount(account?: string) { return account || AD_ACCOUNT_ID; }

async function metaPost(path: string, body: Record<string, any>, token?: string): Promise<any> {
  const res = await fetch(`${GRAPH_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, access_token: getToken(token) }),
  });
  const data = await res.json() as any;
  if (data.error) throw new Error(`Meta API: ${data.error.message} (código ${data.error.code})`);
  return data;
}

async function metaGet(path: string, params: Record<string, string> = {}, token?: string): Promise<any> {
  const qs = new URLSearchParams({ ...params, access_token: getToken(token) }).toString();
  const res = await fetch(`${GRAPH_BASE}/${path}?${qs}`);
  const data = await res.json() as any;
  if (data.error) throw new Error(`Meta API: ${data.error.message} (código ${data.error.code})`);
  return data;
}

// ─── Leitura de dados ─────────────────────────────────────────────────────────

export async function getCampaigns(token?: string, adAccountId?: string): Promise<string> {
  const account = getAccount(adAccountId);
  const data = await metaGet(`${account}/campaigns`, {
    fields: "id,name,status,objective,daily_budget,lifetime_budget",
    limit: "30",
  }, token);

  const campaigns = (data.data || []) as any[];
  if (!campaigns.length) return "Nenhuma campanha encontrada na conta.";

  const lines = campaigns.map((c: any) => {
    const budget = c.daily_budget
      ? `R$${(c.daily_budget / 100).toFixed(2)}/dia`
      : c.lifetime_budget
      ? `R$${(c.lifetime_budget / 100).toFixed(2)} total`
      : "sem orçamento";
    return `• [${c.id}] "${c.name}" | ${c.status} | ${c.objective} | ${budget}`;
  });

  return `CAMPANHAS (${campaigns.length}):\n${lines.join("\n")}`;
}

export async function getAdSets(campaignId: string, token?: string): Promise<string> {
  const data = await metaGet(`${campaignId}/adsets`, {
    fields: "id,name,status,daily_budget,targeting,optimization_goal",
    limit: "20",
  }, token);

  const adsets = (data.data || []) as any[];
  if (!adsets.length) return "Nenhum conjunto de anúncios encontrado.";

  const lines = adsets.map((a: any) => {
    const budget = a.daily_budget ? `R$${(a.daily_budget / 100).toFixed(2)}/dia` : "—";
    return `• [${a.id}] "${a.name}" | ${a.status} | Budget: ${budget}`;
  });

  return `CONJUNTOS DE ANÚNCIOS:\n${lines.join("\n")}`;
}

export async function getAccountInsights(token?: string, adAccountId?: string): Promise<string> {
  const account = getAccount(adAccountId);
  const data = await metaGet(`${account}/insights`, {
    fields: "campaign_name,adset_name,spend,impressions,clicks,actions,action_values,roas",
    level: "adset",
    date_preset: "last_7d",
    limit: "20",
  }, token);

  const rows = (data.data || []) as any[];
  if (!rows.length) return "Sem dados de performance nos últimos 7 dias.";

  const lines = rows.map((r: any) => {
    const purchases = (r.actions || []).find((a: any) => a.action_type === "purchase")?.value || "0";
    const revenue = (r.action_values || []).find((a: any) => a.action_type === "purchase")?.value || "0";
    const roas = r.spend > 0 ? (parseFloat(revenue) / parseFloat(r.spend)).toFixed(1) : "—";
    return `• "${r.adset_name}" | Gasto: R$${parseFloat(r.spend || 0).toFixed(2)} | Compras: ${purchases} | Receita: R$${parseFloat(revenue).toFixed(2)} | ROAS: ${roas}x`;
  });

  return `PERFORMANCE (últimos 7 dias):\n${lines.join("\n")}`;
}

export async function getCustomAudiences(token?: string, adAccountId?: string): Promise<string> {
  const account = getAccount(adAccountId);
  const data = await metaGet(`${account}/customaudiences`, {
    fields: "id,name,approximate_count,subtype",
    limit: "30",
  }, token);

  const audiences = (data.data || []) as any[];
  if (!audiences.length) return "Nenhum público personalizado encontrado.";

  const lines = audiences.map((a: any) =>
    `• [${a.id}] "${a.name}" | ${a.subtype} | ~${a.approximate_count?.toLocaleString("pt-BR") || "?"} pessoas`
  );

  return `PÚBLICOS PERSONALIZADOS (${audiences.length}):\n${lines.join("\n")}`;
}

// ─── Criação de públicos ──────────────────────────────────────────────────────

export async function createPixelAudience(params: {
  name: string;
  pixelId: string;
  event: string;          // AddToCart | InitiateCheckout | PageView | Purchase
  retentionDays: number;
  excludeEvent?: string;  // ex: "Purchase" para excluir quem já comprou
  token?: string;
  adAccountId?: string;
}): Promise<string> {
  const account = getAccount(params.adAccountId);

  const rule: any = {
    inclusions: {
      operator: "or",
      rules: [{
        event_sources: [{ id: params.pixelId, type: "pixel" }],
        retention_seconds: params.retentionDays * 86400,
        filter: { operator: "and", filters: [{ field: "event", operator: "=", value: params.event }] },
      }],
    },
  };

  if (params.excludeEvent) {
    rule.exclusions = {
      operator: "or",
      rules: [{
        event_sources: [{ id: params.pixelId, type: "pixel" }],
        retention_seconds: params.retentionDays * 86400,
        filter: { operator: "and", filters: [{ field: "event", operator: "=", value: params.excludeEvent }] },
      }],
    };
  }

  const data = await metaPost(`${account}/customaudiences`, {
    name: params.name,
    subtype: "WEBSITE",
    rule: JSON.stringify(rule),
    pixel_id: params.pixelId,
  }, params.token);

  return `Público "${params.name}" criado com sucesso (ID: ${data.id}).`;
}

export async function createEngagementAudience(params: {
  name: string;
  igUserId: string;
  retentionDays: number;
  token?: string;
  adAccountId?: string;
}): Promise<string> {
  const account = getAccount(params.adAccountId);

  const data = await metaPost(`${account}/customaudiences`, {
    name: params.name,
    subtype: "ENGAGEMENT",
    rule: JSON.stringify({
      inclusions: {
        operator: "or",
        rules: [{
          event_sources: [{ id: params.igUserId, type: "ig_business" }],
          retention_seconds: params.retentionDays * 86400,
          filter: { operator: "and", filters: [{ field: "event", operator: "=", value: "ig_business_profile_all" }] },
        }],
      },
    }),
  }, params.token);

  return `Público de engajamento IG "${params.name}" criado (ID: ${data.id}).`;
}

// ─── Pesquisa de interesses (segmentação) ─────────────────────────────────────

export async function searchInterests(query: string, limit = 12, token?: string): Promise<string> {
  const data = await metaGet(`search`, {
    type: "adinterest",
    q: query,
    limit: String(limit),
    locale: "pt_BR",
  }, token);

  const interests = (data.data || []) as any[];
  if (!interests.length) return `Nenhum interesse encontrado para "${query}".`;

  const lines = interests.map((i: any) => {
    const size = i.audience_size_lower_bound && i.audience_size_upper_bound
      ? `${Number(i.audience_size_lower_bound).toLocaleString("pt-BR")}–${Number(i.audience_size_upper_bound).toLocaleString("pt-BR")}`
      : i.audience_size
      ? Number(i.audience_size).toLocaleString("pt-BR")
      : "?";
    const path = Array.isArray(i.path) && i.path.length ? ` (${i.path.join(" > ")})` : "";
    return `• [${i.id}] ${i.name} | alcance ~${size}${path}`;
  });

  return `INTERESSES para "${query}":\n${lines.join("\n")}`;
}

// ─── Criar público semelhante (lookalike) ─────────────────────────────────────

export async function createLookalikeAudience(params: {
  name: string;
  originAudienceId: string;   // público de origem (ex.: compradores)
  ratioPct?: number;          // 1 = 1% (mais parecido); até 20
  country?: string;
  token?: string;
  adAccountId?: string;
}): Promise<string> {
  const account = getAccount(params.adAccountId);
  const ratio = Math.min(Math.max((params.ratioPct ?? 1) / 100, 0.01), 0.20);

  const data = await metaPost(`${account}/customaudiences`, {
    name: params.name,
    subtype: "LOOKALIKE",
    origin_audience_id: params.originAudienceId,
    lookalike_spec: JSON.stringify({
      type: "custom_ratio",
      country: params.country || "BR",
      ratio,
    }),
  }, params.token);

  return `Público semelhante "${params.name}" criado (ID: ${data.id}) — ${(ratio * 100).toFixed(0)}% mais parecidos no ${params.country || "BR"}.`;
}

// ─── Duplicar conjunto de anúncios ────────────────────────────────────────────

export async function duplicateAdSet(params: {
  adSetId: string;
  newName: string;
  audienceIds?: string[];   // IDs de públicos personalizados para o novo conjunto
  dailyBudgetReais?: number;
  token?: string;
}): Promise<string> {
  // Copia o ad set
  const copyData = await metaPost(`${params.adSetId}/copies`, {
    rename_options: JSON.stringify({ rename_prefix: "", rename_suffix: " - Cópia" }),
    status_option: "PAUSED",
  }, params.token);

  const newAdSetId = copyData.copied_adset_id || copyData.id;
  if (!newAdSetId) throw new Error("ID do conjunto duplicado não retornado pela API");

  // Renomeia e atualiza o conjunto
  const updateBody: Record<string, any> = { name: params.newName };
  if (params.dailyBudgetReais) {
    updateBody.daily_budget = Math.round(params.dailyBudgetReais * 100);
  }
  if (params.audienceIds && params.audienceIds.length > 0) {
    updateBody.targeting = JSON.stringify({
      custom_audiences: params.audienceIds.map(id => ({ id })),
    });
  }

  await metaPost(newAdSetId, updateBody, params.token);

  return `Conjunto duplicado: "${params.newName}" (ID: ${newAdSetId}) | Status: PAUSADO. Revise os públicos e publique quando pronto.`;
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
  let base64: string;

  // Suporta data URL inline (base64 direto do Creative Agent)
  if (imageUrl.startsWith("data:")) {
    base64 = imageUrl.split(",")[1] || "";
    if (!base64) throw new Error("Data URL inválida");
  } else {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`Não foi possível baixar a imagem: ${imgRes.status}`);
    const buffer = await imgRes.arrayBuffer();
    base64 = Buffer.from(buffer).toString("base64");
  }

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

  // 3. Criar anúncio como ACTIVE
  console.log(`[FernandaExecutor] Criando anúncio...`);
  const adData = await metaPost(`${AD_ACCOUNT_ID}/ads`, {
    name: params.adName,
    adset_id: params.adSetId,
    creative: { creative_id: creativeId },
    status: "ACTIVE",
  });

  console.log(`[FernandaExecutor] ✓ Anúncio criado (ativo): ${adData.id}`);
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

    case "meta_update_budget": {
      const budget = payload.newDailyBudget || payload.dailyBudgetReais;
      if (!payload.campaignId || !budget) throw new Error("campaignId e dailyBudgetReais obrigatórios");
      await updateCampaignBudget(payload.campaignId, budget);
      return `Orçamento de "${payload.campaignName || payload.campaignId}" atualizado para R$${budget}/dia.`;
    }

    case "meta_create_campaign":
      if (!payload.name || !payload.objective || !payload.dailyBudgetReais) throw new Error("name, objective e dailyBudgetReais obrigatórios");
      const newId = await createCampaign(payload.name, payload.objective, payload.dailyBudgetReais);
      return `Campanha "${payload.name}" criada (ID: ${newId}). Status: PAUSADA — ative no Meta Ads Manager após revisar.`;

    case "meta_duplicate_campaign":
      if (!payload.campaignId || !payload.name) throw new Error("campaignId e name obrigatórios");
      const copyId = await duplicateCampaign(payload.campaignId, payload.name);
      return `Campanha duplicada: "${payload.name}" (ID: ${copyId}). Status: PAUSADA.`;

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
