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
 *
 * 06/out/2026 (Chris): relâmpago SÓ nos 10 mais vendidos de cada loja (TOP_ITENS), no preço que ele salva
 * na Tabela Shopee do Gestão (@relampago). corrigirAgendadas() mantém as upcoming nesse padrão a cada rodada.
 * NUNCA altera o preço do anúncio.
 */
import crypto from "crypto";
import fs from "fs";
import { execSync } from "child_process";
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

// ── 06/10/2026 (Chris): relâmpago SÓ nos 10 mais vendidos de cada loja, no preço que ELE salvou
// na Tabela de Preços Shopee do Gestão (preco_anuncio canal=shopee coluna "@relampago").
// Nunca mexe no preço do anúncio. Itens ativos conferidos na API em 06/10 (23500 fica fora: sem preço/custo).
const TOP_ITENS: Record<Account, Record<string, string>> = {
  feminnita: { "46500071872": "31300", "23537699914": "08237", "23793271622": "24520", "29592476673": "31400", "54166288100": "59000",
               "48901941579": "32750", "56709322762": "50650", "23397568574": "25500", "43922563750": "50200" },
  fnt:       { "23794531530": "31300", "56966288307": "59000", "22199153568": "31400", "23399123508": "32700", "22394641990": "40500",
               "23794621829": "31500", "51813197105": "51650", "58208447463": "30850", "53161935419": "50250" },
};
const OVERRIDE: Record<Account, Record<string, number>> = { feminnita: {}, fnt: { "51650": 59.99 } };  // Chris 06/10
function precosRelampago(acc: Account): Record<string, number> {
  const out: Record<string, number> = {};
  try {
    const sql = `SELECT trim(p.sku) sku, a.valor FROM preco_anuncio a JOIN produto_catalogo p ON p.id=a.produto_id WHERE a.canal='shopee' AND a.coluna='@relampago' AND p.excluido=0`;
    const rows = JSON.parse(execSync(`sqlite3 -json /opt/gestao/gestao.db "${sql}"`, { encoding: "utf8" }) || "[]");
    for (const r of rows) if (Number(r.valor) > 0) out[String(r.sku)] = Number(r.valor);
  } catch {}
  Object.assign(out, OVERRIDE[acc]);
  return out;
}
const upd = (acc: Account, fid: number, items: any[]) =>
  shopee(acc, "/api/v2/shop_flash_sale/update_shop_flash_sale_items", { method: "POST", body: { flash_sale_id: fid, items } });

async function modelosElegiveis(acc: Account, itemId: number, preco: number): Promise<any[]> {
  const ms: any[] = [];
  for (const m of await getModels(acc, itemId)) {
    const stk = availStock(m); const orig = listedPrice(m);
    if (stk > 0 && preco < orig) ms.push({ model_id: Number(m.model_id), input_promo_price: preco, stock: Math.min(stk, PROMO_STOCK_CAP) });
  }
  return ms;
}

// ── Corrige relâmpagos já agendadas: tira quem não é top 10, acerta o preço dos top 10, adiciona top 10 faltante ──
export async function corrigirAgendadas(acc: Account): Promise<any> {
  const res: any = { conta: acc, flash: 0, tirados: 0, preco_ajustado: 0, adicionados: 0, ja_certos: 0, falhas: [] as any[] };
  const precos = precosRelampago(acc); const top = TOP_ITENS[acc];
  const lista: any[] = [];
  for (let off = 0; ; off += 100) {
    const r = await shopee(acc, "/api/v2/shop_flash_sale/get_shop_flash_sale_list", { query: { type: 1, offset: off, limit: 100 } });
    const l = r?.response?.flash_sale_list || []; lista.push(...l); if (l.length < 100) break;
  }
  for (const f of lista) {
    res.flash++; const fid = Number(f.flash_sale_id);
    const d = await shopee(acc, "/api/v2/shop_flash_sale/get_shop_flash_sale_items", { query: { flash_sale_id: fid, offset: 0, limit: 100 } });
    const porItem: Record<string, any[]> = {};
    for (const mo of d?.response?.models || []) (porItem[String(mo.item_id)] ||= []).push(mo);
    for (const [iid, mods] of Object.entries(porItem)) {
      const ativos = mods.filter((m) => Number(m.status) === 1);
      const sku = top[iid]; const preco = sku ? precos[sku] : undefined;
      if (!sku || !preco) {
        if (ativos.length) { const r = await upd(acc, fid, [{ item_id: Number(iid), models: ativos.map((m) => ({ model_id: Number(m.model_id), status: 0 })) }]); res.tirados++;
          if (r?.error || (r?.response?.failed_items || []).length) res.falhas.push({ fid, iid, op: "tirar", e: r?.error || r?.response?.failed_items?.[0] }); }
        continue;
      }
      if (ativos.length && ativos.every((m) => Math.abs(Number(m.input_promotion_price) - preco) < 0.005)) { res.ja_certos++; continue; }
      if (ativos.length) await upd(acc, fid, [{ item_id: Number(iid), models: ativos.map((m) => ({ model_id: Number(m.model_id), status: 0 })) }]);
      const alvo = ativos.length ? ativos : mods;
      const r = await upd(acc, fid, [{ item_id: Number(iid), purchase_limit: 0, models: alvo.map((m) => ({ model_id: Number(m.model_id), status: 1, input_promo_price: preco, stock: Math.max(1, Number(m.campaign_stock) || 1) })) }]);
      res.preco_ajustado++;
      if (r?.error || (r?.response?.failed_items || []).length) res.falhas.push({ fid, iid, op: "preco", e: r?.error || r?.response?.failed_items?.[0] });
    }
    for (const [iid, sku] of Object.entries(top)) {
      if (porItem[iid] || !precos[sku]) continue;
      const ms = await modelosElegiveis(acc, Number(iid), precos[sku]); if (!ms.length) continue;
      const r = await shopee(acc, "/api/v2/shop_flash_sale/add_shop_flash_sale_items", { method: "POST", body: { flash_sale_id: fid, items: [{ item_id: Number(iid), purchase_limit: 0, models: ms }] } });
      res.adicionados++;
      if (r?.error || (r?.response?.failed_items || []).length) res.falhas.push({ fid, iid, op: "adicionar", e: r?.error || r?.response?.failed_items?.[0] });
    }
  }
  return res;
}

// ── Payload das novas relâmpagos: só top 10, preço do Gestão ──
async function buildChampionPayload(acc: Account, _items: any[], out: any): Promise<any[]> {
  const payload: any[] = []; const precos = precosRelampago(acc);
  for (const [iid, sku] of Object.entries(TOP_ITENS[acc])) {
    const preco = precos[sku]; if (!preco) continue;
    let ms: any[] = [];
    try { ms = await modelosElegiveis(acc, Number(iid), preco); } catch { continue; }
    if (ms.length) { payload.push({ item_id: Number(iid), purchase_limit: 0, models: ms }); if (out.sample.length < 4) out.sample.push({ sku, preco, variacoes: ms.length }); }
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

  const items: any[] = [];  // 06/10: seleção fixa TOP_ITENS (10 mais vendidos por loja)
  const payload = await buildChampionPayload(acc, items, out);
  out.produtos = payload.length;
  out.variacoes = payload.reduce((a, x) => a + x.models.length, 0);
  if (!payload.length) { out.motivo = "nenhum top 10 com preço/estoque"; return out; }

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
      const cor = await corrigirAgendadas(acc);
      console.log(`[ShopeeFlash] ${acc} correcao:`, JSON.stringify(cor).slice(0, 400));
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
