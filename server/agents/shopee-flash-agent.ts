/**
 * Agente de Oferta Relâmpago da Shopee (Feminnita + FNT) — RECONSTRUÍDO 22/set/2026.
 * O original vivia no VPS Vultr (morto) e nunca foi commitado. Reescrito a partir do
 * spec provado em memory:project_shopee_flash_agente.
 *
 * SELEÇÃO = CAMPEÕES (top vendas 30d) de shopee_flash_campeoes; fallback = mapa inteiro.
 * PREÇO = shopee_precos.raspa (tabela nova do PDF 22/09), via item_id do shopee_flash_map.
 * TRAVA de desconto: raspa < original_price (preço NORMAL, nunca current_price que já vem
 * com promoção ativa). Pula variação com estoque 0.
 * AUTO-ROLL: cada rodada agenda TODOS os slots disponíveis que a Shopee expõe e que ainda
 * não estão em done_slots (não 1 por vez) — mantém sempre o máximo de dias agendados.
 * Token: /opt/gestao/tokens_shopee_{a,b}.json (autoridade = gestão; NUNCA renova aqui).
 * Kill-switch: shopee_flash_config.enabled=0.
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
const MAX_PRODUCTS = 20;      // SKUs (campeões) por flash
const PROMO_STOCK_CAP = 100;  // estoque promo por variação (1..1000)
const SLOT_HORIZON_DAYS = 30; // janela p/ buscar slots liberados
const FIRST_RUN_DELAY_MS = 45_000;
const INTERVAL_MS = 60 * 60 * 1000;

// ── DB ──────────────────────────────────────────────────────────────────────
let _pool: mysql.Pool | null = null;
function pool(): mysql.Pool {
  if (!_pool) {
    const u = new URL(process.env.DATABASE_URL as string);
    _pool = mysql.createPool({
      host: u.hostname, port: Number(u.port) || 4000,
      user: decodeURIComponent(u.username), password: decodeURIComponent(u.password),
      database: u.pathname.replace("/", "") || "feminnita",
      ssl: { rejectUnauthorized: false }, waitForConnections: true, connectionLimit: 3,
    });
  }
  return _pool;
}
async function q<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await pool().query(sql, params);
  return rows as T[];
}

// ── Shopee signed call ────────────────────────────────────────────────────────
function creds(acc: Account) {
  const t = JSON.parse(fs.readFileSync(TOKEN_FILE[acc], "utf8"));
  const partner_key =
    t.partner_key ||
    (acc === "fnt" ? process.env.SHOPEE_FNT_PARTNER_KEY : process.env.SHOPEE_PARTNER_KEY) ||
    process.env.SHOPEE_PARTNER_KEY || "";
  return { partner_id: Number(t.partner_id), partner_key: String(partner_key), shop_id: Number(t.shop_id), access_token: String(t.access_token) };
}
async function shopee(acc: Account, path: string, opts: { method?: "GET" | "POST"; query?: Record<string, string | number>; body?: any } = {}): Promise<any> {
  const c = creds(acc);
  const ts = Math.floor(Date.now() / 1000);
  const baseStr = `${c.partner_id}${path}${ts}${c.access_token}${c.shop_id}`;
  const sign = crypto.createHmac("sha256", c.partner_key).update(baseStr).digest("hex");
  const qs = new URLSearchParams({ partner_id: String(c.partner_id), timestamp: String(ts), access_token: c.access_token, shop_id: String(c.shop_id), sign });
  for (const [k, v] of Object.entries(opts.query || {})) qs.set(k, String(v));
  const res = await fetch(`${BASE}${path}?${qs.toString()}`, {
    method: opts.method || "GET",
    headers: { "Content-Type": "application/json" },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return res.json();
}

// ── Slots / models ────────────────────────────────────────────────────────────
async function getAllSlots(acc: Account, doneSlots: string[]): Promise<any[]> {
  const now = Math.floor(Date.now() / 1000);
  const r = await shopee(acc, "/api/v2/shop_flash_sale/get_time_slot_id", {
    query: { start_time: now + 600, end_time: now + SLOT_HORIZON_DAYS * 24 * 3600 },
  });
  let slots: any[] = [];
  if (Array.isArray(r?.response)) slots = r.response;
  else if (Array.isArray(r?.response?.time_slot)) slots = r.response.time_slot;
  return slots
    .filter((s) => !doneSlots.includes(String(s.timeslot_id)) && Number(s.start_time) > now)
    .sort((a, b) => Number(a.start_time) - Number(b.start_time));
}
async function getModels(acc: Account, itemId: number): Promise<any[]> {
  const r = await shopee(acc, "/api/v2/product/get_model_list", { query: { item_id: itemId } });
  const models = r?.response?.model;
  return Array.isArray(models) ? models : [];
}
function listedPrice(model: any): number {
  // Preço NORMAL listado = original_price. NUNCA current_price (já com promoção ativa).
  const pi = Array.isArray(model?.price_info) ? model.price_info[0] : model?.price_info;
  const orig = Number(pi?.original_price ?? 0);
  const cur = Number(pi?.current_price ?? 0);
  return orig > 0 ? orig : cur;
}
function availStock(model: any): number {
  return Number(model?.stock_info_v2?.summary_info?.total_available_stock ?? 0);
}

// ── Payload dos campeões (get_model_list -> trava desconto + estoque) ───────────
async function buildChampionPayload(acc: Account, items: any[], out: any): Promise<any[]> {
  const payload: any[] = [];
  for (const it of items.slice(0, MAX_PRODUCTS)) {
    const raspa = Number(it.raspa);
    let models: any[] = [];
    try { models = await getModels(acc, Number(it.item_id)); } catch { continue; }
    const okModels: any[] = [];
    for (const m of models) {
      const price = listedPrice(m);
      const stock = availStock(m);
      if (stock > 0 && raspa < price) okModels.push({ model_id: Number(m.model_id), input_promo_price: raspa, stock: Math.min(stock, PROMO_STOCK_CAP) });
    }
    if (okModels.length) {
      payload.push({ item_id: Number(it.item_id), purchase_limit: 0, models: okModels });
      if (out.sample.length < 4) out.sample.push({ sku: it.sku, raspa, variacoes: okModels.length });
    }
  }
  return payload;
}

// ── Processa 1 conta: agenda TODOS os slots novos ───────────────────────────────
async function processAccount(acc: Account): Promise<any> {
  const out: any = { conta: acc, ok: false, slots: [] as any[], sample: [] as any[] };
  const st = await q<any>("SELECT done_slots FROM shopee_flash_state WHERE conta=?", [acc]);
  let doneSlots: string[] = [];
  try { doneSlots = st.length && st[0].done_slots ? JSON.parse(st[0].done_slots) : []; } catch { doneSlots = []; }

  const slots = await getAllSlots(acc, doneSlots);
  if (!slots.length) { out.motivo = "nenhum slot novo disponível"; return out; }

  // campeões (fallback: mapa inteiro)
  let items = await q<any>(
    `SELECT c.item_id, m.sku, p.raspa
       FROM shopee_flash_campeoes c
       JOIN shopee_flash_map m ON m.item_id = c.item_id AND m.conta = c.conta
       JOIN shopee_precos p ON p.sku = m.sku
      WHERE c.conta = ? AND p.raspa IS NOT NULL
      ORDER BY c.rnk ASC`, [acc]);
  if (!items.length) {
    items = await q<any>(
      `SELECT m.item_id, m.sku, p.raspa FROM shopee_flash_map m JOIN shopee_precos p ON p.sku = m.sku
        WHERE m.conta = ? AND p.raspa IS NOT NULL ORDER BY m.item_id`, [acc]);
  }
  if (!items.length) { out.motivo = "sem campeões nem mapa"; return out; }

  const payload = await buildChampionPayload(acc, items, out);
  out.produtos = payload.length;
  out.variacoes = payload.reduce((a, x) => a + x.models.length, 0);
  if (!payload.length) { out.motivo = "nenhum produto elegível (estoque/desconto)"; return out; }

  for (const slot of slots) {
    const created = await shopee(acc, "/api/v2/shop_flash_sale/create_shop_flash_sale", { method: "POST", body: { timeslot_id: Number(slot.timeslot_id) } });
    const flashId = created?.response?.flash_sale_id;
    if (!flashId) { out.slots.push({ timeslot_id: String(slot.timeslot_id), erro: "create:" + (created?.error || "") + " " + (created?.message || "") }); continue; }
    let addErr = "";
    for (let i = 0; i < payload.length; i += 5) {
      const r = await shopee(acc, "/api/v2/shop_flash_sale/add_shop_flash_sale_items", { method: "POST", body: { flash_sale_id: Number(flashId), items: payload.slice(i, i + 5) } });
      if (r?.error) addErr += `[${r.error}]`;
    }
    doneSlots.push(String(slot.timeslot_id));
    const dataSlot = new Date(Number(slot.start_time) * 1000).toISOString().slice(0, 16).replace("T", " ");
    out.slots.push({ timeslot_id: String(slot.timeslot_id), data_slot: dataSlot, flash_sale_id: String(flashId), produtos: payload.length, variacoes: out.variacoes, addErr });
    await q(
      `INSERT INTO shopee_flash_log (conta, timeslot_id, flash_sale_id, data_slot, produtos, variacoes, detalhe, criado_em)
         VALUES (?,?,?,?,?,?,?,NOW())`,
      [acc, String(slot.timeslot_id), String(flashId), dataSlot, payload.length, out.variacoes, "auto"]);
  }

  await q(
    `INSERT INTO shopee_flash_state (conta, rot_offset, done_slots, last_run) VALUES (?,?,?,NOW())
       ON DUPLICATE KEY UPDATE done_slots=VALUES(done_slots), last_run=NOW()`,
    [acc, 0, JSON.stringify(Array.from(new Set(doneSlots)).slice(-60))]);

  out.ok = out.slots.some((s: any) => s.flash_sale_id);
  return out;
}

// sincroniza raspa do map com a tabela nova (belt & suspenders)
export async function syncFlashMapRaspa(): Promise<number> {
  const r: any = await pool().query(
    `UPDATE shopee_flash_map m JOIN shopee_precos p ON p.sku=m.sku SET m.raspa=p.raspa
      WHERE m.raspa IS NULL OR ABS(m.raspa-p.raspa)>=0.01`);
  return r?.[0]?.affectedRows ?? 0;
}

// ── Execução manual (ignora enabled) ────────────────────────────────────────────
export async function rodarAgora(only?: Account): Promise<any[]> {
  await syncFlashMapRaspa();
  const accs = only ? [only] : ACCOUNTS;
  const results: any[] = [];
  for (const acc of accs) {
    try { results.push(await processAccount(acc)); } catch (e: any) { results.push({ conta: acc, ok: false, erro: e.message }); }
  }
  return results;
}

// ── Execução agendada (respeita enabled) ────────────────────────────────────────
async function runScheduled(): Promise<void> {
  await syncFlashMapRaspa().catch(() => {});
  for (const acc of ACCOUNTS) {
    try {
      const c = await q<any>("SELECT enabled FROM shopee_flash_config WHERE conta=?", [acc]);
      if (!c.length || Number(c[0].enabled) !== 1) { console.log(`[ShopeeFlash] ${acc} desabilitado, pulando`); continue; }
      const r = await processAccount(acc);
      console.log(`[ShopeeFlash] ${acc}:`, r.ok ? `agendou ${r.slots.length} slot(s), ${r.produtos} campeões` : `sem ação (${r.motivo})`);
    } catch (e: any) { console.error(`[ShopeeFlash] ${acc} erro:`, e.message); }
  }
}

export function startShopeeFlash(): () => void {
  console.log("[ShopeeFlash] Agendador iniciado (1ª rodada em 45s, depois de hora em hora; agenda todos os slots novos)");
  const first = setTimeout(() => { runScheduled().catch((e) => console.error("[ShopeeFlash] boot run:", e.message)); }, FIRST_RUN_DELAY_MS);
  const iv = setInterval(() => { runScheduled().catch((e) => console.error("[ShopeeFlash] interval:", e.message)); }, INTERVAL_MS);
  return () => { clearTimeout(first); clearInterval(iv); };
}
