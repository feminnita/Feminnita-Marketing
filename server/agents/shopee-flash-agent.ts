/**
 * Agente de Oferta Relâmpago da Shopee (Feminnita + FNT) — RECONSTRUÍDO 22/set/2026.
 * O original vivia no VPS Vultr (morto) e nunca foi commitado. Reescrito a partir do
 * spec provado em memory:project_shopee_flash_agente.
 *
 * PREÇO DA OFERTA = shopee_precos.raspa (tabela nova do PDF 22/09). O shopee_flash_map
 * é usado só para o vínculo item_id <-> sku; o preço é lido por JOIN com shopee_precos.
 *
 * Token: lido de /opt/gestao/tokens_shopee_{a,b}.json (autoridade única = gestão, cron
 * renova). NUNCA renova aqui (guerra de rotação). Assinatura shop-level HMAC-SHA256.
 *
 * TRAVA de desconto: só adiciona model cujo raspa < preço listado atual (Shopee rejeita
 * não-desconto). Pula variação com estoque 0. Kill-switch = shopee_flash_config.enabled=0.
 */
import crypto from "crypto";
import fs from "fs";
import mysql from "mysql2/promise";

type Account = "feminnita" | "fnt";

const BASE = "https://partner.shopeemobile.com";
const TOKEN_FILE: Record<Account, string> = {
  feminnita: "/opt/gestao/tokens_shopee_a.json",
  fnt: "/opt/gestao/tokens_shopee_b.json",
};
const ACCOUNTS: Account[] = ["feminnita", "fnt"];
const MAX_PRODUCTS = 20;       // produtos por rodada (rotativo)
const PROMO_STOCK_CAP = 100;   // estoque promo por variação (1..1000)
const FIRST_RUN_DELAY_MS = 45_000;
const INTERVAL_MS = 60 * 60 * 1000; // hora em hora

// ── DB ────────────────────────────────────────────────────────────────────
let _pool: mysql.Pool | null = null;
function pool(): mysql.Pool {
  if (!_pool) {
    const u = new URL(process.env.DATABASE_URL as string);
    _pool = mysql.createPool({
      host: u.hostname,
      port: Number(u.port) || 4000,
      user: decodeURIComponent(u.username),
      password: decodeURIComponent(u.password),
      database: u.pathname.replace("/", "") || "feminnita",
      ssl: { rejectUnauthorized: false },
      waitForConnections: true,
      connectionLimit: 3,
    });
  }
  return _pool;
}
async function q<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await pool().query(sql, params);
  return rows as T[];
}

// ── Shopee signed call ──────────────────────────────────────────────────────
function creds(acc: Account) {
  const t = JSON.parse(fs.readFileSync(TOKEN_FILE[acc], "utf8"));
  const partner_key =
    t.partner_key ||
    (acc === "fnt" ? process.env.SHOPEE_FNT_PARTNER_KEY : process.env.SHOPEE_PARTNER_KEY) ||
    process.env.SHOPEE_PARTNER_KEY ||
    "";
  return {
    partner_id: Number(t.partner_id),
    partner_key: String(partner_key),
    shop_id: Number(t.shop_id),
    access_token: String(t.access_token),
  };
}

async function shopee(
  acc: Account,
  path: string,
  opts: { method?: "GET" | "POST"; query?: Record<string, string | number>; body?: any } = {},
): Promise<any> {
  const c = creds(acc);
  const ts = Math.floor(Date.now() / 1000);
  const baseStr = `${c.partner_id}${path}${ts}${c.access_token}${c.shop_id}`;
  const sign = crypto.createHmac("sha256", c.partner_key).update(baseStr).digest("hex");
  const qs = new URLSearchParams({
    partner_id: String(c.partner_id),
    timestamp: String(ts),
    access_token: c.access_token,
    shop_id: String(c.shop_id),
    sign,
  });
  for (const [k, v] of Object.entries(opts.query || {})) qs.set(k, String(v));
  const url = `${BASE}${path}?${qs.toString()}`;
  const res = await fetch(url, {
    method: opts.method || "GET",
    headers: { "Content-Type": "application/json" },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return res.json();
}

// ── Flash sale API ──────────────────────────────────────────────────────────
async function getNextSlot(acc: Account, doneSlots: string[]): Promise<any | null> {
  const now = Math.floor(Date.now() / 1000);
  const r = await shopee(acc, "/api/v2/shop_flash_sale/get_time_slot_id", {
    query: { start_time: now + 600, end_time: now + 7 * 24 * 3600 },
  });
  let slots: any[] = [];
  if (Array.isArray(r?.response)) slots = r.response;
  else if (Array.isArray(r?.response?.time_slot)) slots = r.response.time_slot;
  slots = slots
    .filter((s) => !doneSlots.includes(String(s.timeslot_id)) && Number(s.start_time) > now)
    .sort((a, b) => Number(a.start_time) - Number(b.start_time));
  return slots[0] || null;
}

async function getModels(acc: Account, itemId: number): Promise<any[]> {
  const r = await shopee(acc, "/api/v2/product/get_model_list", { query: { item_id: itemId } });
  const models = r?.response?.model;
  return Array.isArray(models) ? models : [];
}
function listedPrice(model: any): number {
  // Preço NORMAL listado = original_price. NUNCA current_price: este é o preço
  // JÁ com promoção ativa (flash/desconto anterior), o que quebrava a trava de
  // desconto (raspa parecia >= preço quando na verdade é um desconto real).
  const pi = Array.isArray(model?.price_info) ? model.price_info[0] : model?.price_info;
  const orig = Number(pi?.original_price ?? 0);
  const cur = Number(pi?.current_price ?? 0);
  return orig > 0 ? orig : cur;
}
function availStock(model: any): number {
  return Number(model?.stock_info_v2?.summary_info?.total_available_stock ?? 0);
}

// ── Processa 1 conta (1 slot, até MAX_PRODUCTS) ──────────────────────────────
async function processAccount(acc: Account): Promise<any> {
  const out: any = { conta: acc, ok: false, skipped: [] as any[], sample: [] as any[] };

  // estado
  const st = await q<any>("SELECT rot_offset, done_slots FROM shopee_flash_state WHERE conta=?", [acc]);
  let rotOffset = st.length ? Number(st[0].rot_offset) || 0 : 0;
  let doneSlots: string[] = [];
  try { doneSlots = st.length && st[0].done_slots ? JSON.parse(st[0].done_slots) : []; } catch { doneSlots = []; }

  // CAMPEÕES primeiro (top vendas 30d, ranqueados em shopee_flash_campeoes).
  // Preço SEMPRE da tabela nova (shopee_precos.raspa) via item_id do map.
  let items = await q<any>(
    `SELECT c.item_id, m.sku, p.raspa
       FROM shopee_flash_campeoes c
       JOIN shopee_flash_map m ON m.item_id = c.item_id AND m.conta = c.conta
       JOIN shopee_precos p ON p.sku = m.sku
      WHERE c.conta = ? AND p.raspa IS NOT NULL
      ORDER BY c.rnk ASC`,
    [acc],
  );
  // fallback: sem campeões cadastrados -> usa o mapa inteiro (ordem por item_id)
  if (!items.length) {
    items = await q<any>(
      `SELECT m.item_id, m.sku, p.raspa
         FROM shopee_flash_map m JOIN shopee_precos p ON p.sku = m.sku
        WHERE m.conta = ? AND p.raspa IS NOT NULL ORDER BY m.item_id`,
      [acc],
    );
  }
  out.total_itens_mapeados = items.length;
  if (!items.length) { out.motivo = "sem itens (campeões nem mapa)"; return out; }

  // slot
  const slot = await getNextSlot(acc, doneSlots);
  if (!slot) { out.motivo = "nenhum time slot disponível não usado"; return out; }
  out.timeslot_id = String(slot.timeslot_id);
  out.data_slot = new Date(Number(slot.start_time) * 1000).toISOString();

  // top-20 campeões (já ranqueados) — mesmos 20 em cada slot, sem puxar a cauda
  const window: any[] = items.slice(0, MAX_PRODUCTS);
  void rotOffset;

  // monta payload por item (get_model_list -> trava desconto + estoque)
  const payloadItems: any[] = [];
  for (const it of window) {
    const raspa = Number(it.raspa);
    let models: any[] = [];
    try { models = await getModels(acc, Number(it.item_id)); }
    catch (e: any) { out.skipped.push({ item_id: it.item_id, sku: it.sku, motivo: "erro get_model_list: " + e.message }); continue; }
    if (!models.length) { out.skipped.push({ item_id: it.item_id, sku: it.sku, motivo: "sem models" }); continue; }

    const okModels: any[] = [];
    for (const m of models) {
      const price = listedPrice(m);
      const stock = availStock(m);
      if (stock <= 0) { out.skipped.push({ item_id: it.item_id, sku: it.sku, model_id: m.model_id, motivo: "estoque 0" }); continue; }
      if (!(raspa < price)) { out.skipped.push({ item_id: it.item_id, sku: it.sku, model_id: m.model_id, raspa, preco_listado: price, motivo: "raspa>=preço listado (não é desconto)" }); continue; }
      okModels.push({ model_id: Number(m.model_id), input_promo_price: raspa, stock: Math.min(stock, PROMO_STOCK_CAP) });
    }
    if (okModels.length) {
      payloadItems.push({ item_id: Number(it.item_id), purchase_limit: 0, models: okModels });
      if (out.sample.length < 4) out.sample.push({ item_id: it.item_id, sku: it.sku, raspa_aplicada: raspa, models: okModels.length });
    }
  }
  out.produtos_elegiveis = payloadItems.length;
  out.variacoes = payloadItems.reduce((a, x) => a + x.models.length, 0);
  if (!payloadItems.length) { out.motivo = "nenhum produto elegível após travas (estoque/desconto)"; return out; }

  // cria flash + adiciona itens
  const created = await shopee(acc, "/api/v2/shop_flash_sale/create_shop_flash_sale", {
    method: "POST", body: { timeslot_id: Number(slot.timeslot_id) },
  });
  const flashId = created?.response?.flash_sale_id;
  if (!flashId) { out.motivo = "create_shop_flash_sale falhou"; out.create_resp = created; return out; }
  out.flash_sale_id = String(flashId);

  const added = await shopee(acc, "/api/v2/shop_flash_sale/add_shop_flash_sale_items", {
    method: "POST", body: { flash_sale_id: Number(flashId), items: payloadItems },
  });
  out.add_error = added?.error || "";
  out.add_failed = added?.response?.failed_items || added?.response?.fail_items || [];

  // verifica na fonte
  const verify = await shopee(acc, "/api/v2/shop_flash_sale/get_shop_flash_sale_items", {
    query: { flash_sale_id: Number(flashId), offset: 0, limit: 50 },
  });
  const vModels = verify?.response?.models || verify?.response?.item_info || [];
  out.verificado_variacoes = Array.isArray(vModels) ? vModels.length : 0;
  out.verify_sample = (Array.isArray(vModels) ? vModels.slice(0, 4) : []).map((m: any) => ({
    item_id: m.item_id, model_id: m.model_id,
    input_promotion_price: m.input_promotion_price ?? m.promotion_price,
    campaign_stock: m.campaign_stock, status: m.status,
  }));

  // status flash
  out.status = created?.response?.status ?? 1;

  // grava estado + log
  const newOffset = (rotOffset + MAX_PRODUCTS) % items.length;
  const newDone = Array.from(new Set([...doneSlots, String(slot.timeslot_id)])).slice(-60);
  await q(
    `INSERT INTO shopee_flash_state (conta, rot_offset, done_slots, last_run)
       VALUES (?,?,?,NOW())
     ON DUPLICATE KEY UPDATE rot_offset=VALUES(rot_offset), done_slots=VALUES(done_slots), last_run=NOW()`,
    [acc, newOffset, JSON.stringify(newDone)],
  );
  await q(
    `INSERT INTO shopee_flash_log (conta, timeslot_id, flash_sale_id, data_slot, produtos, variacoes, detalhe, criado_em)
       VALUES (?,?,?,?,?,?,?,NOW())`,
    [acc, String(slot.timeslot_id), String(flashId),
     new Date(Number(slot.start_time) * 1000).toISOString().slice(0, 16).replace("T", " "),
     out.produtos_elegiveis, out.variacoes, "auto"],
  );

  out.ok = true;
  return out;
}

// sincroniza a coluna raspa do map com a tabela nova (belt & suspenders)
export async function syncFlashMapRaspa(): Promise<number> {
  const r: any = await pool().query(
    `UPDATE shopee_flash_map m JOIN shopee_precos p ON p.sku=m.sku
        SET m.raspa=p.raspa
      WHERE m.raspa IS NULL OR ABS(m.raspa-p.raspa)>=0.01`,
  );
  return r?.[0]?.affectedRows ?? 0;
}

// ── Execução manual (supervisionada) — ignora enabled ────────────────────────
export async function rodarAgora(only?: Account): Promise<any[]> {
  await syncFlashMapRaspa();
  const accs = only ? [only] : ACCOUNTS;
  const results: any[] = [];
  for (const acc of accs) {
    try { results.push(await processAccount(acc)); }
    catch (e: any) { results.push({ conta: acc, ok: false, erro: e.message }); }
  }
  return results;
}

// ── Execução agendada — respeita enabled (kill-switch) ───────────────────────
async function runScheduled(): Promise<void> {
  await syncFlashMapRaspa().catch(() => {});
  for (const acc of ACCOUNTS) {
    try {
      const c = await q<any>("SELECT enabled FROM shopee_flash_config WHERE conta=?", [acc]);
      if (!c.length || Number(c[0].enabled) !== 1) { console.log(`[ShopeeFlash] ${acc} desabilitado, pulando`); continue; }
      const r = await processAccount(acc);
      console.log(`[ShopeeFlash] ${acc}:`, r.ok ? `flash ${r.flash_sale_id} (${r.produtos_elegiveis}p/${r.variacoes}v)` : `sem ação (${r.motivo})`);
    } catch (e: any) {
      console.error(`[ShopeeFlash] ${acc} erro:`, e.message);
    }
  }
}

export function startShopeeFlash(): () => void {
  console.log("[ShopeeFlash] Agendador iniciado (1ª rodada em 45s, depois de hora em hora)");
  const first = setTimeout(() => { runScheduled().catch((e) => console.error("[ShopeeFlash] boot run:", e.message)); }, FIRST_RUN_DELAY_MS);
  const iv = setInterval(() => { runScheduled().catch((e) => console.error("[ShopeeFlash] interval:", e.message)); }, INTERVAL_MS);
  return () => { clearTimeout(first); clearInterval(iv); };
}
