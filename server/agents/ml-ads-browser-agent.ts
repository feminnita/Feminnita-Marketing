/**
 * ML Ads Browser Agent — Automação do Seller Center via Playwright
 * Faz login no Mercado Livre e executa ações de Product Ads em nome da Gabi
 */

import { chromium, type Browser, type Page, type BrowserContext } from "playwright";
import fs from "fs";
import path from "path";

const SESSIONS_DIR = path.join(process.cwd(), ".ml-sessions");
// URL final do painel de Product Ads (depois de todos os redirects HTTP do ML)
const SELLER_CENTER_URL = "https://ads.mercadolivre.com.br/productAds";
// URL direta da lista de campanhas — inclui todos os status (A=ativo, P=pausado, D=desabilitado)
const CAMPAIGNS_URL = "https://ads.mercadolivre.com.br/product-ads/admin/campaigns?status=A%2CP%2CD";
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

function normalizeCookie(c: any): object {
  // Cookie Editor exporta em formato diferente do Playwright — normaliza aqui
  const sameSiteMap: Record<string, "Strict" | "Lax" | "None"> = {
    no_restriction: "None",
    unspecified: "None",
    none: "None",
    lax: "Lax",
    strict: "Strict",
  };
  return {
    name: c.name,
    value: c.value,
    domain: c.domain,
    path: c.path || "/",
    expires: c.expirationDate ? Math.floor(c.expirationDate) : (c.expires ?? -1),
    httpOnly: c.httpOnly ?? false,
    secure: c.secure ?? false,
    sameSite: sameSiteMap[(c.sameSite ?? "").toLowerCase()] ?? "None",
  };
}

async function loadSession(context: BrowserContext, account: string): Promise<boolean> {
  const file = sessionFile(account);
  if (!fs.existsSync(file)) return false;
  try {
    const raw = JSON.parse(fs.readFileSync(file, "utf8"));
    const cookies = Array.isArray(raw) ? raw.map(normalizeCookie) : [];
    if (cookies.length === 0) return false;
    await context.addCookies(cookies);
    console.log(`[MLBrowser] ${cookies.length} cookies carregados para ${account}`);
    return true;
  } catch (e: any) {
    console.warn(`[MLBrowser] Erro ao carregar cookies para ${account}:`, e.message);
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

async function isOnSellerDashboard(page: Page): Promise<boolean> {
  const url = page.url();
  const onLogin = url.includes("/login") || url.includes("/jms/lgz/") || url.includes("lgz/login");
  if (onLogin) return false;
  const onAds = url.includes("productAds") || url.includes("ads.mercadolivre") || url.includes("publicidade");
  if (!onAds) return false;
  // O ML exibe a landing pública na MESMA URL /productAds quando não autenticado.
  // Checar conteúdo da página distingue dashboard autenticado da landing pública.
  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 600) ?? "");
  const isPublicLanding = bodyText.includes("Crie a sua conta") || bodyText.includes("Outros vendedores estão");
  console.log(`[MLBrowser] isOnSellerDashboard — URL: ${url} — publicLanding: ${isPublicLanding}`);
  return !isPublicLanding;
}

async function ensureLoggedIn(page: Page, context: BrowserContext, account: "feminnita" | "fnt"): Promise<boolean> {
  // 1. Carrega cookies salvos e verifica se ainda são válidos
  const hasSaved = await loadSession(context, account);
  if (hasSaved) {
    try {
      await page.goto(SELLER_CENTER_URL, { waitUntil: "domcontentloaded", timeout: 25000 });
    } catch {}
    await waitForAuthCheck(page);
    if (await isOnSellerDashboard(page)) {
      console.log(`[MLBrowser] Sessão válida via cookies salvos — ${account}`);
      return true;
    }
    console.warn(`[MLBrowser] Cookies salvos inválidos/expirados para ${account}`);
  }

  // 2. Tenta auth-from-token endpoint do ML (evita reCAPTCHA)
  const tokenOk = await tryTokenToBrowserSession(page, context, account);
  if (tokenOk) {
    try {
      await page.goto(SELLER_CENTER_URL, { waitUntil: "domcontentloaded", timeout: 25000 });
    } catch {}
    await waitForAuthCheck(page);
    if (await isOnSellerDashboard(page)) {
      console.log(`[MLBrowser] Sessão via token OK para ${account} — salvando...`);
      await saveSession(context, account);
      return true;
    }
    console.warn(`[MLBrowser] auth-from-token não funcionou para ${account}`);
  }

  // 3. Último recurso: login via formulário
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

async function scanRowsForCampaign(page: Page, lowerName: string, lowerId: string): Promise<any> {
  const rows = await page.locator("tr").all();
  for (const row of rows) {
    const text = (await row.innerText().catch(() => "")).toLowerCase();
    if ((lowerName && text.includes(lowerName)) || (lowerId && text.includes(lowerId))) {
      return row;
    }
  }
  return null;
}

async function findCampaignRow(page: Page, campaignId: string, campaignName: string): Promise<any> {
  // Tenta por data-id primeiro
  for (const attr of ["data-id", "data-campaign-id"]) {
    const el = page.locator(`[${attr}="${campaignId}"]`).first();
    if (await el.isVisible({ timeout: 2000 }).catch(() => false)) return el;
  }

  const lowerName = campaignName.toLowerCase().trim();
  const lowerId   = campaignId.toLowerCase().trim();

  // Escaneia página atual
  let found = await scanRowsForCampaign(page, lowerName, lowerId);
  if (found) return found;

  // Navega pelas páginas seguintes (paginação do ML Ads — até 10 páginas)
  for (let p = 2; p <= 10; p++) {
    const nextBtn = page.locator('button:has-text("Seguinte"), a:has-text("Seguinte"), button[aria-label*="ext"], a[aria-label*="ext"]').first();
    if (!await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) break;
    await nextBtn.click();
    await page.waitForTimeout(2000);
    console.log(`[MLBrowser] Verificando página ${p} de campanhas...`);
    found = await scanRowsForCampaign(page, lowerName, lowerId);
    if (found) return found;
  }

  return null;
}

async function logVisibleCampaigns(page: Page): Promise<string> {
  const texts = await page.evaluate(() =>
    Array.from(document.querySelectorAll("tr")).map(r =>
      (r as HTMLElement).innerText?.trim().replace(/\s+/g, " ").slice(0, 100)
    ).filter(t => t.length > 5)
  ).catch(() => [] as string[]);
  return texts.slice(0, 15).join(" || ");
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
    await page.goto(CAMPAIGNS_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);
    await debugScreenshot(page, `pause-${account}-loaded`);

    const row = await findCampaignRow(page, campaignId, campaignName);
    if (!row) {
      await debugScreenshot(page, `pause-${account}-notfound`);
      const rowCount = await page.evaluate(() => document.querySelectorAll("tr").length).catch(() => 0);
      const visible = await logVisibleCampaigns(page);
      return `Campanha "${campaignName || campaignId}" não encontrada. [URL: ${page.url()}] [Rows: ${rowCount}] [Visíveis: ${visible}]`;
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
    await page.goto(CAMPAIGNS_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);

    const row = await findCampaignRow(page, campaignId, campaignName);
    if (!row) {
      const rowCount = await page.evaluate(() => document.querySelectorAll("tr").length).catch(() => 0);
      const visible = await logVisibleCampaigns(page);
      return `Campanha "${campaignName || campaignId}" não encontrada. [URL: ${page.url()}] [Rows: ${rowCount}] [Visíveis: ${visible}]`;
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
    await page.goto(CAMPAIGNS_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);
    await debugScreenshot(page, `budget-${account}-loaded`);

    const row = await findCampaignRow(page, campaignId, campaignName);
    if (!row) {
      const rowCount = await page.evaluate(() => document.querySelectorAll("tr").length).catch(() => 0);
      const visible = await logVisibleCampaigns(page);
      return `Campanha "${campaignName || campaignId}" não encontrada. [URL: ${page.url()}] [Rows: ${rowCount}] [Visíveis: ${visible}]`;
    }

    // Clica no ícone de lápis (✏️) dentro da célula de orçamento
    // Screenshot confirmou: cada linha tem "R$ XX 🖊" na coluna de budget
    const budgetTd = row.locator('td').filter({ hasText: /R\$/ }).first();
    await budgetTd.hover().catch(() => {});
    await page.waitForTimeout(300);
    const pencilBtn = budgetTd.locator('button, [role="button"]').first();
    if (await pencilBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await pencilBtn.click();
    } else {
      await budgetTd.click();
    }
    await page.waitForTimeout(500);
    await debugScreenshot(page, `budget-${account}-pencil`);

    // Aguarda modal "Altere seu orçamento" — waitFor é mais confiável que :visible CSS (pseudo-class inválida)
    const modalTitle = page.locator('text="Altere seu orçamento"');
    let modalReady = await modalTitle.waitFor({ state: "visible", timeout: 6000 }).then(() => true).catch(() => false);

    if (!modalReady) {
      // Fallback: clica direto na célula de budget (sem depender do lápis)
      await budgetTd.click();
      modalReady = await modalTitle.waitFor({ state: "visible", timeout: 5000 }).then(() => true).catch(() => false);
    }

    if (!modalReady) {
      const pageText = await page.evaluate(() => document.body?.innerText?.slice(0, 500) ?? "").catch(() => "");
      return `Modal de budget não abriu para "${campaignName || campaignId}". [Página: ${pageText.replace(/\n/g, " ").slice(0, 300)}]`;
    }

    await debugScreenshot(page, `budget-${account}-modal`);

    // Busca input dentro da modal — .filter({ visible: true }) é o correto em Playwright (não :visible CSS)
    // Usa .last() porque o input da overlay fica no final do DOM
    let budgetInput = page.locator("input").filter({ visible: true }).last();
    if (!await budgetInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Fallback: busca pelo ancestral do título da modal
      budgetInput = modalTitle.locator("xpath=ancestor::div[6]").locator("input").first();
    }

    if (!await budgetInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await debugScreenshot(page, `budget-${account}-input-notfound`);
      return `Input de budget não encontrado na modal "${campaignName || campaignId}"`;
    }

    await budgetInput.click({ clickCount: 3 });
    await budgetInput.fill(String(dailyBudget));
    await page.waitForTimeout(500);
    await debugScreenshot(page, `budget-${account}-filled`);

    const saveBtn = page.locator('button:has-text("Salvar"), button:has-text("Confirmar"), button[type="submit"]').first();
    if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await saveBtn.click();
    } else {
      await budgetInput.press("Enter");
    }
    await page.waitForTimeout(2000);
    await debugScreenshot(page, `budget-${account}-saved`);
    return `Budget diário da campanha "${campaignName || campaignId}" atualizado para R$${dailyBudget}.`;
  }));
}
