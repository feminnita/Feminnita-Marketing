/**
 * ML Ads Browser Agent — Automação do Seller Center via Playwright
 * Faz login no Mercado Livre e executa ações de Product Ads em nome da Gabi
 */

import { chromium, type Browser, type Page, type BrowserContext } from "playwright";
import fs from "fs";
import path from "path";

const SESSIONS_DIR = path.join(process.cwd(), ".ml-sessions");
const SELLER_CENTER_URL = "https://www.mercadolivre.com.br/advertising/product-ads";
const LOGIN_URL = "https://www.mercadolivre.com.br/login";
const TWOCAPTCHA_KEY = process.env.TWOCAPTCHA_API_KEY || "";

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });

// Mutex por conta — impede múltiplas instâncias simultâneas do browser
const runningInstances = new Map<string, Promise<any>>();

function withMutex<T>(account: string, fn: () => Promise<T>): Promise<T> {
  const existing = runningInstances.get(account);
  if (existing) {
    console.log(`[MLBrowser] Instância já em execução para ${account} — aguardando...`);
    return existing.then(() => fn()) as Promise<T>;
  }
  const promise = fn().finally(() => runningInstances.delete(account));
  runningInstances.set(account, promise);
  return promise;
}

// ─── Sessão persistente ───────────────────────────────────────────────────────

function sessionFile(account: string) {
  return path.join(SESSIONS_DIR, `ml-session-${account}.json`);
}

async function saveSession(context: BrowserContext, account: string) {
  const cookies = await context.cookies();
  fs.writeFileSync(sessionFile(account), JSON.stringify(cookies, null, 2));
}

async function loadSession(context: BrowserContext, account: string): Promise<boolean> {
  const file = sessionFile(account);
  if (!fs.existsSync(file)) return false;
  try {
    const cookies = JSON.parse(fs.readFileSync(file, "utf8"));
    await context.addCookies(cookies);
    return true;
  } catch {
    return false;
  }
}

// ─── 2captcha ─────────────────────────────────────────────────────────────────

async function solve2captcha(sitekey: string, pageUrl: string): Promise<string | null> {
  if (!TWOCAPTCHA_KEY) return null;
  try {
    // Submete o captcha
    const submitRes = await fetch("https://2captcha.com/in.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        key: TWOCAPTCHA_KEY,
        method: "userrecaptcha",
        googlekey: sitekey,
        pageurl: pageUrl,
        json: "1",
      }).toString(),
    });
    const submit = await submitRes.json() as any;
    if (submit.status !== 1) return null;

    const captchaId = submit.request;
    // Aguarda resolução (até 120s)
    for (let i = 0; i < 24; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const resRes = await fetch(`https://2captcha.com/res.php?key=${TWOCAPTCHA_KEY}&action=get&id=${captchaId}&json=1`);
      const result = await resRes.json() as any;
      if (result.status === 1) return result.request;
      if (result.request !== "CAPCHA_NOT_READY") return null;
    }
    return null;
  } catch {
    return null;
  }
}

// ─── Login no ML ──────────────────────────────────────────────────────────────

async function loginML(page: Page, account: "feminnita" | "fnt"): Promise<boolean> {
  const email    = account === "fnt" ? process.env.ML_EMAIL_2    : process.env.ML_EMAIL_1;
  const password = account === "fnt" ? process.env.ML_PASSWORD_2 : process.env.ML_PASSWORD_1;
  if (!email || !password) return false;

  try {
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    // ML pode usar name="user_id" ou type="email" dependendo da versão da página
    await page.waitForSelector('input[name="user_id"], input[type="email"], input[id="user_id"]', { timeout: 15000 });
    await page.fill('input[name="user_id"], input[type="email"], input[id="user_id"]', email);
    await page.click('button[type="submit"]');

    await page.waitForSelector('input[name="password"], input[type="password"]', { timeout: 15000 });
    await page.fill('input[name="password"], input[type="password"]', password);

    // Verifica se há reCAPTCHA antes de submeter
    const sitekey = await page.$eval(
      '.g-recaptcha',
      (el: Element) => (el as HTMLElement).dataset.sitekey || ""
    ).catch(() => "");

    if (sitekey) {
      console.log("[MLBrowser] reCAPTCHA detectado, resolvendo via 2captcha...");
      const token = await solve2captcha(sitekey, LOGIN_URL);
      if (token) {
        await page.evaluate((t) => {
          (document.getElementById("g-recaptcha-response") as HTMLTextAreaElement).value = t;
        }, token);
      }
    }

    await page.click('button[type="submit"]');
    await page.waitForURL(/mercadolivre\.com\.br\/(home|myml|_)/, { timeout: 20000 });
    console.log(`[MLBrowser] Login OK — ${account}`);
    return true;
  } catch (e: any) {
    console.error(`[MLBrowser] Falha no login (${account}):`, e.message);
    return false;
  }
}

async function ensureLoggedIn(page: Page, context: BrowserContext, account: "feminnita" | "fnt"): Promise<boolean> {
  // Testa se a sessão ainda está válida
  await page.goto("https://www.mercadolivre.com.br/home", { waitUntil: "domcontentloaded", timeout: 20000 });
  const isLogged = await page.$('a[href*="logout"], [data-testid="header-user"]').then(Boolean).catch(() => false);
  if (isLogged) return true;

  // Tenta restaurar sessão salva
  const loaded = await loadSession(context, account);
  if (loaded) {
    await page.reload({ waitUntil: "domcontentloaded" });
    const stillLogged = await page.$('a[href*="logout"], [data-testid="header-user"]').then(Boolean).catch(() => false);
    if (stillLogged) return true;
  }

  // Login completo
  const ok = await loginML(page, account);
  if (ok) await saveSession(context, account);
  return ok;
}

// ─── Parser de campanhas ──────────────────────────────────────────────────────

interface Campaign {
  id:          string;
  name:        string;
  status:      string;
  budget:      string;
  spent:       string;
  impressions: string;
  clicks:      string;
  ctr:         string;
  roas:        string;
  sales:       string;
}

async function parseCampaigns(page: Page): Promise<Campaign[]> {
  return page.evaluate(() => {
    // Tenta primeiro com seletores semânticos
    const rows = Array.from(document.querySelectorAll('[data-testid*="campaign-row"], .campaign-row, tr[class*="campaign"]'));

    if (rows.length > 0) {
      return rows.map(row => {
        const text = (sel: string) =>
          (row.querySelector(sel) as HTMLElement)?.innerText?.trim() || "";
        return {
          id:          (row.getAttribute("data-id") || row.querySelector("[data-id]")?.getAttribute("data-id") || "").trim(),
          name:        text('[class*="name"], [data-testid*="name"]'),
          status:      text('[class*="status"], [data-testid*="status"]'),
          budget:      text('[class*="budget"], [data-testid*="budget"]'),
          spent:       text('[class*="spent"], [data-testid*="spent"]'),
          impressions: text('[class*="impression"], [data-testid*="impression"]'),
          clicks:      text('[class*="click"], [data-testid*="click"]'),
          ctr:         text('[class*="ctr"], [data-testid*="ctr"]'),
          roas:        text('[class*="roas"], [data-testid*="roas"]'),
          sales:       text('[class*="sale"], [data-testid*="sale"]'),
        };
      }).filter(c => c.name);
    }

    // Fallback: extrai da tabela genérica mapeando por header
    const table = document.querySelector("table");
    if (!table) return [];

    const headers = Array.from(table.querySelectorAll("thead th")).map(
      th => (th as HTMLElement).innerText.trim().toLowerCase()
    );

    const idx = (terms: string[]) => {
      for (const t of terms) {
        const i = headers.findIndex(h => h.includes(t));
        if (i >= 0) return i;
      }
      return -1;
    };

    const col = {
      name:        idx(["campanha", "nome", "name"]),
      status:      idx(["status", "estado"]),
      budget:      idx(["orçamento", "budget"]),
      spent:       idx(["gasto", "spent", "investimento"]),
      impressions: idx(["impre", "impression"]),
      clicks:      idx(["clique", "click"]),
      ctr:         idx(["ctr"]),
      roas:        idx(["roas"]),
      sales:       idx(["venda", "sale", "receita"]),
    };

    return Array.from(table.querySelectorAll("tbody tr")).map(tr => {
      const cells = Array.from(tr.querySelectorAll("td")).map(td => (td as HTMLElement).innerText.trim());
      const get = (i: number) => (i >= 0 ? cells[i] : "") || "";
      return {
        id:          "",
        name:        get(col.name),
        status:      get(col.status),
        budget:      get(col.budget),
        spent:       get(col.spent),
        impressions: get(col.impressions),
        clicks:      get(col.clicks),
        ctr:         get(col.ctr),
        roas:        get(col.roas),
        sales:       get(col.sales),
      };
    }).filter(c => c.name);
  });
}

// ─── Ações principais ─────────────────────────────────────────────────────────

async function withBrowser<T>(
  account: "feminnita" | "fnt",
  fn: (page: Page, context: BrowserContext) => Promise<T>
): Promise<T> {
  const browser: Browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
  });

  const proxyHost = process.env.WEBSHARE_HOST;
  const proxyPort = process.env.WEBSHARE_PORT;
  const proxyUser = process.env.WEBSHARE_USER;
  const proxyPass = process.env.WEBSHARE_PASS;
  const proxyConfig = proxyHost && proxyPort ? {
    server: `http://${proxyHost}:${proxyPort}`,
    username: proxyUser,
    password: proxyPass,
  } : undefined;

  if (proxyConfig) console.log(`[MLBrowser] Usando proxy residencial Webshare (${proxyHost})`);

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    locale: "pt-BR",
    proxy: proxyConfig,
  });
  const page = await context.newPage();

  try {
    const loggedIn = await ensureLoggedIn(page, context, account);
    if (!loggedIn) throw new Error("Não foi possível fazer login no Mercado Livre");
    return await fn(page, context);
  } finally {
    await browser.close();
  }
}

// ─── API pública (chamada pela Gabi) ──────────────────────────────────────────

export async function listAdsCampaigns(account: "feminnita" | "fnt" = "feminnita"): Promise<string> {
  return withMutex(account, () => withBrowser(account, async (page) => {
    await page.goto(SELLER_CENTER_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);

    const campaigns = await parseCampaigns(page);
    if (campaigns.length === 0) {
      const pageText = await page.textContent("body") || "";
      if (pageText.includes("Não há campanhas") || pageText.includes("Crie sua primeira")) {
        return "Nenhuma campanha de Product Ads encontrada. Acesse o Seller Center para criar a primeira.";
      }
      return "Não foi possível listar as campanhas. Tente novamente ou acesse o Seller Center diretamente.";
    }

    const lines = campaigns.map(c => {
      const metrics: string[] = [];
      if (c.impressions) metrics.push(`Impressões: ${c.impressions}`);
      if (c.clicks)      metrics.push(`Cliques: ${c.clicks}`);
      if (c.ctr)         metrics.push(`CTR: ${c.ctr}`);
      if (c.spent)       metrics.push(`Gasto: ${c.spent}`);
      if (c.roas)        metrics.push(`ROAS: ${c.roas}`);
      if (c.sales)       metrics.push(`Vendas: ${c.sales}`);
      const metricsStr = metrics.length > 0 ? ` | ${metrics.join(" | ")}` : "";
      return `• [${c.id || "—"}] "${c.name}" | ${c.status} | Budget: ${c.budget}${metricsStr}`;
    });
    return `CAMPANHAS DE PRODUCT ADS (${account === "fnt" ? "Conta B" : "Conta A"}):\n${lines.join("\n")}`;
  }));
}

// ─── Localiza linha da campanha por nome ou ID ────────────────────────────────

async function findCampaignRow(page: Page, campaignId: string, campaignName: string): Promise<any> {
  // Tenta por data-id primeiro
  for (const attr of ["data-id", "data-campaign-id"]) {
    const el = page.locator(`[${attr}="${campaignId}"]`).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) return el;
  }
  // Tenta por linha de tabela contendo o nome ou ID
  if (campaignName) {
    const row = page.locator(`tr:has-text("${campaignName}")`).first();
    if (await row.isVisible({ timeout: 2000 }).catch(() => false)) return row;
  }
  const rowById = page.locator(`tr:has-text("${campaignId}")`).first();
  if (await rowById.isVisible({ timeout: 2000 }).catch(() => false)) return rowById;
  return null;
}

async function debugScreenshot(page: Page, label: string) {
  try {
    const dir = "/var/www/feminnita-marketing/debug-screenshots";
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    await page.screenshot({ path: `${dir}/${label}-${Date.now()}.png`, fullPage: false });
  } catch { /* não crítico */ }
}

export async function pauseAdsCampaign(campaignId: string, account: "feminnita" | "fnt" = "feminnita", campaignName = ""): Promise<string> {
  return withMutex(`${account}-pause`, () => withBrowser(account, async (page) => {
    await page.goto(SELLER_CENTER_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);
    await debugScreenshot(page, `pause-${account}-loaded`);

    const row = await findCampaignRow(page, campaignId, campaignName);
    if (!row) {
      await debugScreenshot(page, `pause-${account}-notfound`);
      return `Campanha "${campaignName || campaignId}" não encontrada na página de anúncios. Verifique se está ativa no Seller Center.`;
    }

    // Tenta toggle/switch de status ou botão de pausa
    const pauseBtn = row.locator('[role="switch"], button[aria-label*="ause"], button[aria-label*="ausar"], button[title*="ause"]').first();
    if (!await pauseBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await debugScreenshot(page, `pause-${account}-nobtn`);
      return `Botão de pausar não encontrado para "${campaignName || campaignId}". Acesse o Seller Center manualmente.`;
    }
    await pauseBtn.click();
    await page.waitForTimeout(2000);
    await debugScreenshot(page, `pause-${account}-done`);
    return `Campanha "${campaignName || campaignId}" pausada com sucesso.`;
  }));
}

export async function activateAdsCampaign(campaignId: string, account: "feminnita" | "fnt" = "feminnita", campaignName = ""): Promise<string> {
  return withMutex(`${account}-activate`, () => withBrowser(account, async (page) => {
    await page.goto(SELLER_CENTER_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);

    const row = await findCampaignRow(page, campaignId, campaignName);
    if (!row) return `Campanha "${campaignName || campaignId}" não encontrada.`;

    const activateBtn = row.locator('[role="switch"], button[aria-label*="tivar"], button[title*="tivar"]').first();
    if (!await activateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      return `Botão de ativar não encontrado para "${campaignName || campaignId}".`;
    }
    await activateBtn.click();
    await page.waitForTimeout(2000);
    return `Campanha "${campaignName || campaignId}" reativada com sucesso.`;
  }));
}

export async function updateAdsBudget(campaignId: string, dailyBudget: number, account: "feminnita" | "fnt" = "feminnita", campaignName = ""): Promise<string> {
  return withMutex(`${account}-budget`, () => withBrowser(account, async (page) => {
    await page.goto(SELLER_CENTER_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);

    const row = await findCampaignRow(page, campaignId, campaignName);
    if (!row) return `Campanha "${campaignName || campaignId}" não encontrada para edição.`;

    const editBtn = row.locator('button[aria-label*="ditar"], a[href*="edit"], button[title*="ditar"]').first();
    if (!await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      return `Botão de editar não encontrado para "${campaignName || campaignId}".`;
    }
    await editBtn.click();
    await page.waitForTimeout(2000);

    // Preenche o campo de budget
    const budgetInput = await page.locator('input[name*="budget"], input[placeholder*="budget"], input[aria-label*="udget"]').first();
    if (!await budgetInput.isVisible().catch(() => false)) {
      return "Campo de budget não encontrado. O layout do Seller Center pode ter mudado.";
    }
    await budgetInput.click({ clickCount: 3 });
    await budgetInput.fill(String(dailyBudget));

    // Salva
    const saveBtn = await page.locator('button[type="submit"], button:has-text("Salvar"), button:has-text("Confirmar")').first();
    await saveBtn.click();
    await page.waitForTimeout(1500);
    return `Budget diário da campanha "${campaignId}" atualizado para R$${dailyBudget} via Seller Center.`;
  }));
}
