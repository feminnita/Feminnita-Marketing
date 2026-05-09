/**
 * ML Ads Browser Agent — Automação do Seller Center via Playwright
 * Faz login no Mercado Livre e executa ações de Product Ads em nome da Gabi
 */

import { chromium, type Browser, type Page, type BrowserContext } from "playwright";
import fs from "fs";
import path from "path";

const SESSIONS_DIR = path.join(process.cwd(), ".ml-sessions");
// URL final do painel de Product Ads (depois de todos os redirects HTTP do ML)
// www.mercadolivre.com.br/publicidade/product-ads → 302 → publicidade.ml.com.br → 301 → esta URL
const SELLER_CENTER_URL = "https://ads.mercadolivre.com.br/productAds";
const LOGIN_URL = "https://www.mercadolivre.com/jms/mlb/lgz/login";
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

// ─── Auth via token OAuth (bypass reCAPTCHA) ─────────────────────────────────
// Tenta converter o access_token OAuth (já existente no .env) em cookies de sessão
// do browser ML — se funcionar, elimina completamente o login por formulário.

async function tryTokenToBrowserSession(page: Page, context: BrowserContext, account: "feminnita" | "fnt"): Promise<boolean> {
  const token = account === "fnt" ? process.env.ML_ACCESS_TOKEN_2 : process.env.ML_ACCESS_TOKEN_1;
  if (!token) return false;

  // Abordagem 1: endpoint auth-from-token (endpoint interno do ML para apps parceiros)
  // Navega o browser direto — se ML aceitar, seta cookies e redireciona para a página destino
  const authFromTokenUrl = `https://www.mercadolivre.com.br/jms/mlb/lgz/auth-from-token?access_token=${token}&platform_id=ML&go=${encodeURIComponent(SELLER_CENTER_URL)}`;
  try {
    console.log(`[MLBrowser] Tentando auth-from-token para ${account}...`);
    await page.goto(authFromTokenUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    await debugScreenshot(page, `token-auth-${account}-1`);
    const url = page.url();
    if (!url.includes("/login") && !url.includes("/jms/lgz/")) {
      console.log(`[MLBrowser] auth-from-token OK — URL: ${url}`);
      return true;
    }
  } catch (e: any) {
    console.warn(`[MLBrowser] auth-from-token falhou:`, e.message);
  }

  // Abordagem 2: Server-side fetch para obter Set-Cookie e injetar no contexto
  // Faz a troca token→cookies via fetch Node.js e injeta no browser context
  const candidates = [
    `https://www.mercadolivre.com.br/jms/mlb/lgz/auth-from-token?access_token=${token}&platform_id=ML&go=%2F`,
    `https://auth.mercadolibre.com/authorization?response_type=token&access_token=${token}&platform_id=MP`,
  ];

  for (const url of candidates) {
    try {
      const res = await fetch(url, {
        method: "GET",
        redirect: "manual",
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
          "Accept-Language": "pt-BR,pt;q=0.9",
          "Accept": "text/html,application/xhtml+xml",
        },
      });

      const location = res.headers.get("location") || "";
      const rawCookies: string[] = typeof (res.headers as any).getSetCookie === "function"
        ? (res.headers as any).getSetCookie()
        : (res.headers.get("set-cookie") ? [res.headers.get("set-cookie")!] : []);

      const isLoginRedirect = location.includes("/login") || location.includes("/jms/lgz/login");
      if (rawCookies.length > 0 && !isLoginRedirect) {
        const parsed = rawCookies.map(c => {
          const main = c.split(";")[0];
          const eq = main.indexOf("=");
          return {
            name: main.slice(0, eq).trim(),
            value: main.slice(eq + 1).trim(),
            domain: ".mercadolivre.com.br",
            path: "/",
            httpOnly: false,
            secure: true,
          };
        }).filter(c => c.name && c.value);

        if (parsed.length > 0) {
          await context.addCookies(parsed);
          console.log(`[MLBrowser] ${parsed.length} cookies de sessão injetados via fetch para ${account}`);
          return true;
        }
      }
    } catch (e: any) {
      console.warn(`[MLBrowser] fetch candidate falhou:`, e.message);
    }
  }

  return false;
}

// ─── 2captcha ─────────────────────────────────────────────────────────────────

async function solve2captcha(sitekey: string, pageUrl: string, enterprise = false): Promise<string | null> {
  if (!TWOCAPTCHA_KEY) return null;
  try {
    const params: Record<string, string> = {
      key: TWOCAPTCHA_KEY,
      method: "userrecaptcha",
      googlekey: sitekey,
      pageurl: pageUrl,
      json: "1",
    };
    if (enterprise) params.enterprise = "1";

    const submitRes = await fetch("https://2captcha.com/in.php", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(params).toString(),
    });
    const submit = await submitRes.json() as any;
    if (submit.status !== 1) {
      console.warn("[MLBrowser] 2captcha submit falhou:", submit.request);
      return null;
    }

    const captchaId = submit.request;
    console.log(`[MLBrowser] 2captcha id=${captchaId}, aguardando resolução...`);
    for (let i = 0; i < 30; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const resRes = await fetch(`https://2captcha.com/res.php?key=${TWOCAPTCHA_KEY}&action=get&id=${captchaId}&json=1`);
      const result = await resRes.json() as any;
      if (result.status === 1) { console.log("[MLBrowser] 2captcha resolvido"); return result.request; }
      if (result.request !== "CAPCHA_NOT_READY") { console.warn("[MLBrowser] 2captcha erro:", result.request); return null; }
    }
    return null;
  } catch (e: any) {
    console.error("[MLBrowser] 2captcha exception:", e.message);
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
    await page.waitForSelector('input[name="user_id"], input[type="email"], input[id="user_id"]', { timeout: 15000 });
    await page.fill('input[name="user_id"], input[type="email"], input[id="user_id"]', email);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(4000);

    // ML tem passo intermediário com reCAPTCHA Enterprise antes da senha
    // URL contém /msl/ ou user-recaptcha-social nesse caso
    if (page.url().includes("/msl/") || page.url().includes("user-recaptcha")) {
      console.log(`[MLBrowser] Passo intermediário reCAPTCHA detectado...`);

      // Extrai sitekey do iframe do reCAPTCHA
      const captchaIframeSrc = await page.evaluate(() => {
        const iframe = document.querySelector('iframe[src*="recaptcha"]') as HTMLIFrameElement | null;
        return iframe ? iframe.src : null;
      });

      let token: string | null = null;
      if (captchaIframeSrc) {
        const skMatch = captchaIframeSrc.match(/[?&]k=([^&]+)/);
        const sitekey = skMatch ? skMatch[1] : "";
        if (sitekey) {
          console.log(`[MLBrowser] reCAPTCHA Enterprise sitekey=${sitekey} — resolvendo via 2captcha...`);
          token = await solve2captcha(sitekey, page.url(), true);
        }
      }

      if (token) {
        // Injeta em todos os campos possíveis (gctkn e g-recaptcha-response)
        await page.evaluate((t) => {
          const gctkn = document.querySelector('input[name="gctkn"]') as HTMLInputElement | null;
          if (gctkn) gctkn.value = t;
          const resp = document.getElementById("g-recaptcha-response") as HTMLTextAreaElement | null;
          if (resp) resp.value = t;
        }, token);
        console.log("[MLBrowser] Token injetado — clicando Continuar...");
      } else {
        console.warn("[MLBrowser] Não foi possível resolver reCAPTCHA — tentando continuar mesmo assim...");
      }

      await page.click('button[type="submit"], button:has-text("Continuar"), button:has-text("Continue")');
      await page.waitForTimeout(5000);
    }

    // Aguarda campo de senha
    await page.waitForSelector('input[name="password"], input[type="password"]', { timeout: 25000 });
    await page.fill('input[name="password"], input[type="password"]', password);
    await page.click('button[type="submit"]');

    await page.waitForFunction(
      () => !window.location.href.includes('/login') && !window.location.href.includes('/jms/'),
      { timeout: 30000 }
    );
    console.log(`[MLBrowser] Login OK — ${account} — URL: ${page.url()}`);
    return true;
  } catch (e: any) {
    console.error(`[MLBrowser] Falha no login (${account}):`, e.message);
    return false;
  }
}

async function waitForAuthCheck(page: Page): Promise<string> {
  // Aguarda a SPA React completar o check de autenticação via JS.
  // networkidle garante que chamadas de API (incluindo o check de auth) terminaram.
  // Depois, captura a URL final — se for login page, não está autenticado.
  try {
    await page.waitForLoadState("networkidle", { timeout: 20000 });
  } catch {
    // timeout ok, verifica URL de qualquer forma
  }
  // Dá mais 1s para JS de redirect terminar após networkidle
  await page.waitForTimeout(1000);
  return page.url();
}

async function isOnSellerDashboard(url: string): Promise<boolean> {
  // Está no seller center se: não está em página de login E está na URL do productAds
  const onLogin = url.includes("/login") || url.includes("/jms/lgz/") || url.includes("lgz/login");
  const onAds   = url.includes("productAds") || url.includes("ads.mercadolivre") || url.includes("publicidade");
  return !onLogin && onAds;
}

async function ensureLoggedIn(page: Page, context: BrowserContext, account: "feminnita" | "fnt"): Promise<boolean> {
  // 1. Carrega cookies salvos e verifica se ainda são válidos
  const hasSaved = await loadSession(context, account);
  if (hasSaved) {
    try {
      await page.goto(SELLER_CENTER_URL, { waitUntil: "domcontentloaded", timeout: 25000 });
    } catch {}
    const url = await waitForAuthCheck(page);
    if (await isOnSellerDashboard(url)) {
      console.log(`[MLBrowser] Sessão válida via cookies salvos — ${account} — URL: ${url}`);
      return true;
    }
    console.warn(`[MLBrowser] Cookies salvos inválidos para ${account} — URL: ${url}`);
  }

  // 2. Tenta auth-from-token endpoint do ML (evita reCAPTCHA)
  const tokenOk = await tryTokenToBrowserSession(page, context, account);
  if (tokenOk) {
    try {
      await page.goto(SELLER_CENTER_URL, { waitUntil: "domcontentloaded", timeout: 25000 });
    } catch {}
    const url = await waitForAuthCheck(page);
    if (await isOnSellerDashboard(url)) {
      console.log(`[MLBrowser] Sessão via token OK para ${account} — salvando...`);
      await saveSession(context, account);
      return true;
    }
    console.warn(`[MLBrowser] auth-from-token não funcionou para ${account} — URL: ${url}`);
  }

  // 3. localStorage injection já foi feita via addInitScript — testa direto
  console.log(`[MLBrowser] Tentando acesso via localStorage token para ${account}...`);
  try {
    await page.goto(SELLER_CENTER_URL, { waitUntil: "domcontentloaded", timeout: 25000 });
  } catch {}
  const urlAfterLs = await waitForAuthCheck(page);
  if (await isOnSellerDashboard(urlAfterLs)) {
    console.log(`[MLBrowser] Sessão via localStorage OK para ${account} — URL: ${urlAfterLs}`);
    await saveSession(context, account);
    return true;
  }
  console.warn(`[MLBrowser] localStorage não autenticou para ${account} — URL: ${urlAfterLs}`);

  // 4. Último recurso: login via formulário
  console.log(`[MLBrowser] Tentando login via formulário para ${account}...`);
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

  // Usa relay SOCKS5 local (localhost:1080) que autentica com Webshare transparentemente.
  // Playwright não suporta SOCKS5 com usuário/senha direto — relay resolve isso.
  const useProxy = !!(process.env.WEBSHARE_HOST && process.env.WEBSHARE_PORT);
  const proxyConfig = useProxy ? { server: "socks5://127.0.0.1:1080" } : undefined;

  if (proxyConfig) console.log(`[MLBrowser] Usando relay SOCKS5 local → Webshare`);

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    locale: "pt-BR",
    proxy: proxyConfig,
  });

  // Injeta o access_token OAuth no localStorage antes da SPA carregar.
  // A SPA do ML lê o token de localStorage para autenticar chamadas à API.
  const accessToken = account === "fnt" ? process.env.ML_ACCESS_TOKEN_2 : process.env.ML_ACCESS_TOKEN_1;
  if (accessToken) {
    await context.addInitScript((token: string) => {
      try {
        localStorage.setItem("access_token", token);
        localStorage.setItem("ml:access_token", token);
        localStorage.setItem("@api/access_token", token);
      } catch {}
    }, accessToken);
  }

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

    const pauseUrl = page.url();
    const pauseTitle = await page.title().catch(() => "");
    const row = await findCampaignRow(page, campaignId, campaignName);
    if (!row) {
      await debugScreenshot(page, `pause-${account}-notfound`);
      const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 400) ?? "").catch(() => "");
      const rowCount = await page.evaluate(() => document.querySelectorAll("tr").length).catch(() => 0);
      return `Campanha "${campaignName || campaignId}" não encontrada. [URL: ${pauseUrl}] [Title: ${pauseTitle}] [Rows: ${rowCount}] [Body: ${bodyText.replace(/\n/g, " ").slice(0, 300)}]`;
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

    const activateUrl = page.url();
    const activateTitle = await page.title().catch(() => "");
    const row = await findCampaignRow(page, campaignId, campaignName);
    if (!row) {
      const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 400) ?? "").catch(() => "");
      const rowCount = await page.evaluate(() => document.querySelectorAll("tr").length).catch(() => 0);
      return `Campanha "${campaignName || campaignId}" não encontrada. [URL: ${activateUrl}] [Title: ${activateTitle}] [Rows: ${rowCount}] [Body: ${bodyText.replace(/\n/g, " ").slice(0, 300)}]`;
    }

    const activateBtn = row.locator('[role="switch"], button[aria-label*="tivar"], button[title*="tivar"]').first();
    if (!await activateBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      return `Botão de ativar não encontrado para "${campaignName || campaignId}".`;
    }
    await activateBtn.click();
    await page.waitForTimeout(2000);
    return `Campanha "${campaignName || campaignId}" reativada com sucesso.`;
  }));
}

/** Importa cookies de uma sessão existente (bootstrap manual). */
export async function importMLSession(cookies: any[], account: "feminnita" | "fnt" = "feminnita"): Promise<void> {
  const file = sessionFile(account);
  fs.writeFileSync(file, JSON.stringify(cookies, null, 2));
  console.log(`[MLBrowser] Sessão importada para ${account}: ${cookies.length} cookies → ${file}`);
}

/** Retorna status da sessão salva (existe, quando foi salva, quantos dias atrás). */
export function getMLSessionStatus(account: "feminnita" | "fnt" = "feminnita"): { exists: boolean; savedAt: Date | null; ageDays: number | null; cookieCount: number | null } {
  const file = sessionFile(account);
  if (!fs.existsSync(file)) return { exists: false, savedAt: null, ageDays: null, cookieCount: null };
  try {
    const stat = fs.statSync(file);
    const cookies = JSON.parse(fs.readFileSync(file, "utf8"));
    const ageDays = Math.floor((Date.now() - stat.mtimeMs) / (1000 * 60 * 60 * 24));
    return { exists: true, savedAt: stat.mtime, ageDays, cookieCount: Array.isArray(cookies) ? cookies.length : null };
  } catch {
    return { exists: false, savedAt: null, ageDays: null, cookieCount: null };
  }
}

export async function updateAdsBudget(campaignId: string, dailyBudget: number, account: "feminnita" | "fnt" = "feminnita", campaignName = ""): Promise<string> {
  return withMutex(`${account}-budget`, () => withBrowser(account, async (page) => {
    await page.goto(SELLER_CENTER_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);
    await debugScreenshot(page, `budget-${account}-loaded`);

    const finalUrl = page.url();
    const pageTitle = await page.title().catch(() => "");
    const row = await findCampaignRow(page, campaignId, campaignName);
    if (!row) {
      const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 400) ?? "").catch(() => "");
      const rowCount = await page.evaluate(() => document.querySelectorAll("tr").length).catch(() => 0);
      return `Campanha "${campaignName || campaignId}" não encontrada. [URL: ${finalUrl}] [Title: ${pageTitle}] [Rows: ${rowCount}] [Body: ${bodyText.replace(/\n/g, " ").slice(0, 300)}]`;
    }

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
