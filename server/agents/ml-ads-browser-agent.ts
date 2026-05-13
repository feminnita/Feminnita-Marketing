/**
 * ML Ads Browser Agent — Automação do Seller Center via Playwright
 * Faz login no Mercado Livre e executa ações de Product Ads em nome da Gabi
 */

import { chromium, type Browser, type Page, type BrowserContext } from "playwright";
import fs from "fs";
import path from "path";
import { getDb } from "../db";
import { marketplaceAdsMetrics } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const SESSIONS_DIR = path.join(process.cwd(), ".ml-sessions");
// URL final do painel de Product Ads (depois de todos os redirects HTTP do ML)
const SELLER_CENTER_URL = "https://ads.mercadolivre.com.br/productAds";
// URL direta da lista de campanhas — inclui todos os status (A=ativo, P=pausado, D=desabilitado)
const CAMPAIGNS_URL = "https://ads.mercadolivre.com.br/product-ads/admin/campaigns?status=A%2CP%2CD";

// FNT usa product-ads com advertiser_id e account_id explícitos na URL
function getCampaignsUrl(account: string): string {
  if (account === "fnt") {
    const advId     = process.env.ML_ADVERTISER_ID_2 || "1117634";
    const accountId = process.env.ML_ACCOUNT_ID_2    || "1155286";
    return `https://ads.mercadolivre.com.br/product-ads/admin/campaigns?advertiser_id=${advId}&account_id=${accountId}&navigate_to=mercado_ads&status=A%2CP%2CD`;
  }
  return CAMPAIGNS_URL;
}
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

  // Abordagem 3: Navegar direto para CAMPAIGNS_URL com token já no localStorage
  // O withBrowser injeta o token no localStorage via addInitScript — tenta navegar direto
  try {
    console.log(`[MLBrowser] Abordagem 3 — navegando direto para campaigns com token no localStorage...`);
    await page.goto(CAMPAIGNS_URL, { waitUntil: "domcontentloaded", timeout: 25000 });
    await waitForAuthCheck(page);
    if (await isOnSellerDashboard(page)) {
      console.log(`[MLBrowser] Abordagem 3 OK — autenticado via localStorage token para ${account}`);
      await saveSession(context, account);
      return true;
    }
    console.warn(`[MLBrowser] Abordagem 3 falhou — ainda na página de login`);
  } catch (e: any) {
    console.warn(`[MLBrowser] Abordagem 3 exceção:`, e.message);
  }

  return false;
}

// ─── 2captcha ─────────────────────────────────────────────────────────────────

async function solve2captcha(sitekey: string, pageUrl: string, enterprise = false, invisible = false): Promise<string | null> {
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
    if (invisible) params.invisible = "1";

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
  if (!email || !password) {
    console.error(`[MLBrowser] Credenciais não configuradas para ${account} (ML_EMAIL_1/ML_PASSWORD_1)`);
    return false;
  }

  try {
    console.log(`[MLBrowser] Iniciando login — ${account} — ${email}`);
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await debugScreenshot(page, `login-${account}-start`);

    // Passo 1: preenche e-mail
    const emailSel = 'input[name="user_id"], input[type="email"], input[id="user_id"]';
    await page.waitForSelector(emailSel, { timeout: 15000 });
    await page.fill(emailSel, email);
    console.log(`[MLBrowser] Email preenchido — clicando Continuar...`);
    await page.click('button[type="submit"]');

    // Passo 2: aguarda até 35s para uma das condições aparecer:
    //   (a) campo de senha já visível (ML às vezes pula captcha)
    //   (b) redirecionou para página de captcha (/msl/ ou user-recaptcha)
    //   (c) já saiu do /login (raro, mas acontece com cookies parciais)
    const afterEmail = await Promise.race([
      page.waitForSelector('input[name="password"], input[type="password"]', { timeout: 35000 })
        .then(() => "password" as const)
        .catch(() => null),
      page.waitForFunction(
        () => window.location.href.includes("/msl/") || window.location.href.includes("user-recaptcha"),
        { timeout: 35000 }
      ).then(() => "captcha" as const).catch(() => null),
      page.waitForFunction(
        () => !window.location.href.includes("/login") && !window.location.href.includes("/jms/lgz/"),
        { timeout: 35000 }
      ).then(() => "loggedin" as const).catch(() => null),
    ]);

    console.log(`[MLBrowser] Pós-email: estado="${afterEmail}" url=${page.url()}`);
    await debugScreenshot(page, `login-${account}-after-email`);

    if (afterEmail === "loggedin") {
      console.log(`[MLBrowser] Login OK (sem senha) — ${account} — URL: ${page.url()}`);
      return true;
    }

    // Passo 3: resolve captcha se necessário
    if (afterEmail === "captcha" || (!afterEmail && (page.url().includes("/msl/") || page.url().includes("user-recaptcha")))) {
      console.log(`[MLBrowser] reCAPTCHA detectado — ${page.url()}`);

      // Aguarda o iframe do reCAPTCHA carregar (até 12s)
      const iframeEl = await page.waitForSelector('iframe[src*="recaptcha"]', { timeout: 12000 }).catch(() => null);
      let sitekey = "";
      if (iframeEl) {
        const src = await iframeEl.getAttribute("src") || "";
        const skMatch = src.match(/[?&]k=([^&]+)/);
        sitekey = skMatch ? skMatch[1] : "";
      }

      if (!sitekey) {
        sitekey = await page.evaluate(() => {
          const el = document.querySelector("[data-sitekey]");
          if (el) return el.getAttribute("data-sitekey") || "";
          const m = document.body.innerHTML.match(/["'](?:sitekey|googlekey)["']\s*:\s*["']([0-9A-Za-z_-]{20,})["']/);
          return m ? m[1] : "";
        });
      }

      console.log(`[MLBrowser] Sitekey captcha: "${sitekey}"`);
      let token: string | null = null;
      if (sitekey) {
        // user-recaptcha-social é checkbox v2 visível (invisible=false); demais variantes são invisible
        const isInvisible = !page.url().includes("user-recaptcha-social");
        console.log(`[MLBrowser] reCAPTCHA sitekey=${sitekey} invisible=${isInvisible} — resolvendo via 2captcha...`);
        token = await solve2captcha(sitekey, page.url(), false, isInvisible);
      } else {
        console.warn("[MLBrowser] Sitekey não encontrado — tentando sem captcha");
      }

      if (token) {
        // Injeta token + dispara callbacks nativos (deixa o AJAX do ML navegar sozinho)
        await page.evaluate((t) => {
          // Preenche todos os campos g-recaptcha-response possíveis
          ["g-recaptcha-response", "g-recaptcha-response-100000", "g-recaptcha-response-100001"].forEach(id => {
            const el = document.getElementById(id) as HTMLTextAreaElement | null;
            if (el) { el.innerHTML = t; el.value = t; el.dispatchEvent(new Event("change", { bubbles: true })); }
          });
          const gctkn = document.querySelector('input[name="gctkn"]') as HTMLInputElement | null;
          if (gctkn) { gctkn.value = t; gctkn.dispatchEvent(new Event("change", { bubbles: true })); }

          // Percorre recursivamente ___grecaptcha_cfg procurando callbacks (nomes de propriedade são dinâmicos)
          function callCallbacks(obj: any, depth: number = 0): void {
            if (!obj || typeof obj !== "object" || depth > 8) return;
            for (const key of Object.keys(obj)) {
              try {
                const v = (obj as any)[key];
                if ((key === "callback" || key === "successCallback") && typeof v === "function") {
                  v(t);
                } else { callCallbacks(v, depth + 1); }
              } catch (_) { /* ignore */ }
            }
          }
          const w = window as any;
          if (w.___grecaptcha_cfg?.clients) callCallbacks(w.___grecaptcha_cfg.clients);
          if (w.___grecaptcha_cfg?.enterprise?.clients) callCallbacks(w.___grecaptcha_cfg.enterprise.clients);

          // Também tenta data-callback global (ML às vezes define window.recaptchaCallback)
          const dataCallbackEl = document.querySelector('[data-callback]');
          const cbName = dataCallbackEl?.getAttribute('data-callback');
          if (cbName && typeof (w as any)[cbName] === 'function') {
            try { (w as any)[cbName](t); } catch (_) {}
          }

          // NÃO faz form.submit() — deixa o callback nativo submeter via AJAX
          // Fallback: clica botão submit após 1200ms caso o callback não tenha atuado
          setTimeout(() => {
            const btn = document.querySelector('button[type="submit"]') as HTMLElement | null;
            if (btn) btn.click();
          }, 1200);
        }, token);
        console.log("[MLBrowser] Token captcha injetado + callbacks disparados — aguardando navegação do AJAX...");

        // Aguarda até 35s: campo de senha OU saída da página de captcha/msl
        const afterCaptcha = await Promise.race([
          page.waitForSelector('input[name="password"], input[type="password"]', { timeout: 35000 })
            .then(() => "password" as const).catch(() => null),
          page.waitForFunction(
            () => !window.location.href.includes("/msl/") && !window.location.href.includes("/lgz/login") &&
                  !window.location.href.includes("user-recaptcha"),
            { timeout: 35000 }
          ).then(() => "navigated" as const).catch(() => null),
        ]);
        console.log(`[MLBrowser] Pós-captcha: estado="${afterCaptcha}" url=${page.url()}`);
        await debugScreenshot(page, `login-${account}-after-captcha`);

        if (afterCaptcha !== "password") {
          // Verifica se já está logado
          if (!page.url().includes("/login") && !page.url().includes("/jms/lgz/")) {
            console.log(`[MLBrowser] Login OK após captcha (sem senha) — URL: ${page.url()}`);
            return true;
          }
          // Fallback: clica submit manualmente caso form.submit() não funcionou
          console.log(`[MLBrowser] Clicando submit pós-captcha...`);
          await page.click('button[type="submit"], button:has-text("Continuar"), button:has-text("Continue")').catch(() => {});
          const afterSubmit = await Promise.race([
            page.waitForSelector('input[name="password"], input[type="password"]', { timeout: 25000 })
              .then(() => "password" as const).catch(() => null),
            page.waitForFunction(
              () => !window.location.href.includes("/login") && !window.location.href.includes("/jms/lgz/"),
              { timeout: 25000 }
            ).then(() => "loggedin" as const).catch(() => null),
          ]);
          console.log(`[MLBrowser] Pós-submit-captcha: estado="${afterSubmit}" url=${page.url()}`);
          await debugScreenshot(page, `login-${account}-after-captcha-submit`);
          if (afterSubmit === "loggedin") {
            console.log(`[MLBrowser] Login OK — URL: ${page.url()}`);
            return true;
          }
          if (!afterSubmit) {
            console.error(`[MLBrowser] Captcha submit não avançou — URL: ${page.url()}`);
            return false;
          }
        }
      } else {
        // Sem token — tenta avançar via submit direto
        console.warn("[MLBrowser] Token captcha nulo — tentando submit direto...");
        await page.click('button[type="submit"], button:has-text("Continuar")').catch(() => {});
        await page.waitForTimeout(8000);
        await debugScreenshot(page, `login-${account}-notokensubmit`);
      }
    }

    // Passo 4: campo de senha
    console.log(`[MLBrowser] Aguardando campo senha — url=${page.url()}`);
    const pwdVisible = await page.waitForSelector('input[name="password"], input[type="password"]', { timeout: 25000 })
      .then(() => true).catch(() => false);

    if (!pwdVisible) {
      console.error(`[MLBrowser] Campo senha não apareceu — url=${page.url()}`);
      await debugScreenshot(page, `login-${account}-nopassword`);
      return false;
    }

    console.log(`[MLBrowser] Preenchendo senha — url=${page.url()}`);
    await page.fill('input[name="password"], input[type="password"]', password);
    await debugScreenshot(page, `login-${account}-password-filled`);
    await page.click('button[type="submit"]');

    // Passo 5: aguarda sair das URLs de login
    const loginDone = await page.waitForFunction(
      () => !window.location.href.includes('/login') && !window.location.href.includes('/jms/lgz/'),
      { timeout: 35000 }
    ).then(() => true).catch(() => false);

    await debugScreenshot(page, `login-${account}-final`);
    if (loginDone) {
      console.log(`[MLBrowser] Login OK — ${account} — URL: ${page.url()}`);
      return true;
    } else {
      console.error(`[MLBrowser] Login falhou após senha — URL: ${page.url()}`);
      return false;
    }
  } catch (e: any) {
    console.error(`[MLBrowser] Falha no login (${account}):`, e.message);
    await debugScreenshot(page, `login-${account}-error`);
    return false;
  }
}

async function waitForAuthCheck(page: Page): Promise<string> {
  // Aguarda a SPA React completar o check de autenticação via JS.
  // networkidle garante que chamadas de API (incluindo o check de auth) terminaram.
  // Depois, captura a URL final — se for login page, não está autenticado.
  try {
    await page.waitForLoadState("networkidle", { timeout: 25000 });
  } catch {
    // timeout ok, verifica URL de qualquer forma
  }
  // Dá 3s para o React e redirects JS terminarem após networkidle
  await page.waitForTimeout(3000);
  return page.url();
}

async function isOnSellerDashboard(page: Page): Promise<boolean> {
  const url = page.url();
  const onLogin = url.includes("/login") || url.includes("/jms/lgz/") || url.includes("lgz/login");
  if (onLogin) {
    console.log(`[MLBrowser] isOnSellerDashboard — em página de login: ${url}`);
    return false;
  }
  const onAds = url.includes("productAds") || url.includes("ads.mercadolivre") || url.includes("publicidade") || url.includes("product-ads");
  if (!onAds) {
    console.log(`[MLBrowser] isOnSellerDashboard — URL não é de ads: ${url}`);
    return false;
  }
  // O ML exibe a landing pública na MESMA URL /productAds quando não autenticado.
  // Checar conteúdo da página distingue dashboard autenticado da landing pública.
  const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 800) ?? "");
  const isPublicLanding = bodyText.includes("Crie a sua conta") || bodyText.includes("Outros vendedores estão") || bodyText.includes("Anuncie seus produtos");
  // Se há conteúdo de campanha (tabela, dashboard, etc) — está logado
  const hasDashboard = bodyText.includes("Campanhas") || bodyText.includes("Campanha") || bodyText.includes("Orçamento") || bodyText.includes("dashboard") || bodyText.includes("criar campanha");
  console.log(`[MLBrowser] isOnSellerDashboard — URL: ${url} — publicLanding: ${isPublicLanding} — hasDashboard: ${hasDashboard} — bodySnippet: "${bodyText.slice(0, 100).replace(/\n/g," ")}"`);
  return !isPublicLanding && (hasDashboard || onAds);
}

function isCampaignPageUrl(url: string): boolean {
  // CAMPAIGNS_URL é uma rota protegida — se ML redirecionar para /login, não está autenticado
  const isLogin = url.includes("/login") || url.includes("/jms/lgz/");
  const isCampaigns = url.includes("product-ads/admin") || url.includes("ads.mercadolivre.com.br");
  return !isLogin && isCampaigns;
}

function isHubInterface(url: string): boolean {
  return url.includes("ads.mercadolivre.com.br/hub/");
}

async function ensureLoggedIn(page: Page, context: BrowserContext, account: "feminnita" | "fnt"): Promise<boolean> {
  const tokenInEnv = (account === "fnt" ? process.env.ML_ACCESS_TOKEN_2 : process.env.ML_ACCESS_TOKEN_1) || "";
  console.log(`[MLBrowser] ensureLoggedIn — account=${account} tokenLen=${tokenInEnv.length} tokenPrefix=${tokenInEnv.slice(0, 15)}...`);

  // 1. Carrega cookies salvos — navega direto para CAMPAIGNS_URL (rota protegida)
  //    Se ML redirecionar para /login = cookies inválidos. Se permanecer = autenticado.
  const campaignsUrl = getCampaignsUrl(account);
  const hasSaved = await loadSession(context, account);
  if (hasSaved) {
    try {
      await page.goto(campaignsUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
      await page.waitForTimeout(2000);
    } catch {}
    const url = page.url();
    console.log(`[MLBrowser] Pós-cookies: URL=${url}`);
    if (isCampaignPageUrl(url)) {
      console.log(`[MLBrowser] Sessão válida via cookies salvos — ${account}`);
      return true;
    }
    console.warn(`[MLBrowser] Cookies salvos inválidos/expirados para ${account}`);
  }

  // 2. Tenta auth-from-token endpoint do ML (evita login por formulário)
  const tokenOk = await tryTokenToBrowserSession(page, context, account);
  if (tokenOk) {
    try {
      await page.goto(campaignsUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
      await page.waitForTimeout(3000);
    } catch {}
    const url = page.url();
    const bodySnippet = await page.evaluate(() => document.body?.innerText?.slice(0, 200) ?? "").catch(() => "");
    console.log(`[MLBrowser] Pós-token: URL=${url} body="${bodySnippet.replace(/\n/g," ").slice(0,150)}"`);
    if (isCampaignPageUrl(url)) {
      console.log(`[MLBrowser] Sessão via token OK para ${account} — salvando...`);
      await saveSession(context, account);
      return true;
    }
    if (!url.includes("/login") && !url.includes("/jms/lgz/") && !url.includes("user-recaptcha")) {
      await page.waitForTimeout(2000);
      try {
        await page.goto(campaignsUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
        await page.waitForTimeout(2000);
      } catch {}
      const url2 = page.url();
      console.log(`[MLBrowser] Segunda tentativa campaigns: URL=${url2}`);
      if (isCampaignPageUrl(url2)) {
        console.log(`[MLBrowser] Sessão via token OK (2ª tentativa) para ${account} — salvando...`);
        await saveSession(context, account);
        return true;
      }
    }
    console.warn(`[MLBrowser] auth-from-token não resultou em sessão de campaigns para ${account} — URL final: ${url}`);
  }

  // 3. Fallback: login email+senha (sem captcha obrigatório)
  // Tenta login direto — se ML não exibir captcha (IP já conhecido), funciona sem 2captcha.
  // Salva cookies de sessão ao final para as próximas execuções.
  console.log(`[MLBrowser] auth-from-token falhou para ${account} — tentando login email/senha...`);
  const loginOk = await loginML(page, account);
  if (loginOk) {
    try {
      await page.goto(campaignsUrl, { waitUntil: "domcontentloaded", timeout: 25000 });
      await page.waitForTimeout(3000);
    } catch {}
    const url = page.url();
    console.log(`[MLBrowser] Pós-login email/senha: URL=${url}`);
    if (isCampaignPageUrl(url)) {
      console.log(`[MLBrowser] Login email/senha OK para ${account} — salvando sessão...`);
      await saveSession(context, account);
      return true;
    }
    console.warn(`[MLBrowser] Login email/senha não chegou à tela de campaigns para ${account}`);
  }

  console.error(`[MLBrowser] Sessão ML expirada para ${account}. Reautentique via OAuth em /api/ml/oauth/start?account=${account} com scope advertising.`);
  return false;
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

// ─── Métricas: parse de números no formato ML (pt-BR) ────────────────────────

function parseMLNumber(s: string): number {
  if (!s) return 0;
  const clean = s
    .replace(/R\$\s*/g, "")
    .replace(/x$/i, "")
    .replace(/%$/, "")
    .replace(/\s/g, "")
    .replace(/\./g, "")   // ponto é separador de milhar em pt-BR
    .replace(",", ".");
  return parseFloat(clean) || 0;
}

// Navega todas as páginas de campanhas, coleta métricas e salva na tabela marketplace_ads_metrics.
async function scrapeAndSaveMetricsInPage(page: Page, account: string): Promise<number> {
  await page.goto(getCampaignsUrl(account), { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2000);

  const allCampaigns: Campaign[] = [];

  for (let p = 1; p <= 20; p++) {
    const campaigns = await parseCampaigns(page);
    allCampaigns.push(...campaigns);
    console.log(`[MLMetrics] Página ${p}: ${campaigns.length} campanhas`);

    const nextBtn = page.locator('button:has-text("Seguinte"), a:has-text("Seguinte"), button[aria-label*="ext"], a[aria-label*="ext"]').first();
    if (!await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) break;
    await nextBtn.click({ force: true, timeout: 5000 });
    await page.waitForTimeout(2000);
  }

  if (allCampaigns.length === 0) {
    console.warn(`[MLMetrics] Nenhuma campanha encontrada para ${account}`);
    return 0;
  }

  const db = await getDb();
  if (!db) { console.error("[MLMetrics] Banco indisponível"); return 0; }

  await db.delete(marketplaceAdsMetrics)
    .where(and(eq(marketplaceAdsMetrics.platform, "ml"), eq(marketplaceAdsMetrics.account, account)));

  const now = new Date();
  const rows = allCampaigns.map(c => ({
    platform: "ml",
    account,
    campaignId: (c.id || c.name).slice(0, 100),
    campaignName: c.name,
    impressions: Math.round(parseMLNumber(c.impressions)),
    clicks:      Math.round(parseMLNumber(c.clicks)),
    ctr:         String(parseMLNumber(c.ctr).toFixed(3)),
    spend:       String(parseMLNumber(c.spent).toFixed(2)),
    roas:        String(parseMLNumber(c.roas).toFixed(2)),
    revenue:     String(parseMLNumber(c.sales).toFixed(2)),
    acos:        "0",
    conversions: 0,
    scrapedAt:   now,
  }));

  await db.insert(marketplaceAdsMetrics).values(rows);
  console.log(`[MLMetrics] ${rows.length} métricas salvas para ${account}`);
  return rows.length;
}

// ─── Ações principais ─────────────────────────────────────────────────────────

async function withBrowser<T>(
  account: "feminnita" | "fnt",
  fn: (page: Page, context: BrowserContext) => Promise<T>
): Promise<T> {
  const browser: Browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--no-proxy-server"],
    env: {
      ...process.env,
      http_proxy: "",
      https_proxy: "",
      HTTP_PROXY: "",
      HTTPS_PROXY: "",
      ALL_PROXY: "",
      all_proxy: "",
      no_proxy: "*",
      NO_PROXY: "*",
    },
  });

  // ML Ads funciona direto do IP do Vultr SP — sem proxy.
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    locale: "pt-BR",
  });

  // Injeta o access_token OAuth no localStorage antes da SPA carregar.
  // A SPA do ML lê o token de localStorage para autenticar chamadas à API.
  const accessToken = account === "fnt" ? process.env.ML_ACCESS_TOKEN_2 : process.env.ML_ACCESS_TOKEN_1;
  if (accessToken) {
    console.log(`[MLBrowser] Injetando access_token no localStorage — account=${account} prefix=${accessToken.slice(0, 15)}...`);
    await context.addInitScript((token: string) => {
      try {
        localStorage.setItem("access_token", token);
        localStorage.setItem("ml:access_token", token);
        localStorage.setItem("@api/access_token", token);
        // Chaves adicionais usadas pela SPA do ML Ads
        localStorage.setItem("AUTH.ACCESS_TOKEN", token);
        localStorage.setItem("ml_access_token", token);
      } catch {}
    }, accessToken);
  }

  const page = await context.newPage();
  // Limita qualquer operação de locator sem timeout explícito a 8s (evita travas de 30s)
  page.setDefaultTimeout(8000);
  page.setDefaultNavigationTimeout(8000);

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
    await page.goto(SELLER_CENTER_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
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
  // Tenta seletores de linha da tabela clássica (product-ads) e hub interface
  const rowSelectors = [
    "tr",
    "[data-testid*='campaign-row']",
    "[class*='campaign-row']",
    "[class*='CampaignRow']",
    "[class*='campaign-item']",
    "li[class*='campaign']",
    "div[class*='campaign'][role='row']",
  ];
  for (const sel of rowSelectors) {
    const rows = await page.locator(sel).all();
    for (const row of rows) {
      const text = (await row.innerText({ timeout: 5000 }).catch(() => "")).toLowerCase();
      if ((lowerName && text.includes(lowerName)) || (lowerId && text.includes(lowerId))) {
        return row;
      }
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

  // Aguarda URL estabilizar (ML Ads faz redirect client-side após carregar)
  await page.waitForURL(u => !u.toString().endsWith("/campaigns"), { timeout: 5000 }).catch(() => {});
  // Aguarda linhas de campanha renderizarem (React SPA pode demorar > 2s)
  await page.waitForSelector("tr:nth-child(2)", { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(800);

  // Escaneia página atual
  let found = await scanRowsForCampaign(page, lowerName, lowerId);
  if (found) return found;

  // Navega pelas páginas seguintes (paginação do ML Ads — até 10 páginas)
  for (let p = 2; p <= 10; p++) {
    const nextBtn = page.locator('button:has-text("Seguinte"), a:has-text("Seguinte"), button[aria-label*="ext"], a[aria-label*="ext"]').first();
    if (!await nextBtn.isVisible({ timeout: 2000 }).catch(() => false)) break;
    await nextBtn.click({ force: true, timeout: 5000, noWaitAfter: true });
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

// ─── Funções de página (sem gerenciamento de browser) ─────────────────────────
// Usadas tanto pelos exports individuais quanto pelo runActionsInSession (batch).

async function pauseInPage(page: Page, account: string, campaignId: string, campaignName: string): Promise<string> {
  await page.goto(getCampaignsUrl(account), { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2000);
  await debugScreenshot(page, `pause-${account}-loaded`);
  const row = await findCampaignRow(page, campaignId, campaignName);
  if (!row) {
    await debugScreenshot(page, `pause-${account}-notfound`);
    const rowCount = await page.evaluate(() => document.querySelectorAll("tr").length).catch(() => 0);
    const visible = await logVisibleCampaigns(page);
    return `Campanha "${campaignName || campaignId}" não encontrada. [URL: ${page.url()}] [Rows: ${rowCount}] [Visíveis: ${visible}]`;
  }
  const pauseBtn = row.locator('[role="switch"], button[aria-label*="ause"], button[aria-label*="ausar"], button[title*="ause"]').first();
  if (!await pauseBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await debugScreenshot(page, `pause-${account}-nobtn`);
    return `Botão de pausar não encontrado para "${campaignName || campaignId}".`;
  }
  await pauseBtn.click({ force: true, timeout: 5000, noWaitAfter: true });
  await page.waitForTimeout(2000);
  await debugScreenshot(page, `pause-${account}-done`);
  return `Campanha "${campaignName || campaignId}" pausada com sucesso.`;
}

async function activateInPage(page: Page, account: string, campaignId: string, campaignName: string): Promise<string> {
  await page.goto(getCampaignsUrl(account), { waitUntil: "domcontentloaded", timeout: 30000 });
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
  await activateBtn.click({ force: true, timeout: 5000, noWaitAfter: true });
  await page.waitForTimeout(2000);
  return `Campanha "${campaignName || campaignId}" reativada com sucesso.`;
}

// ─── Execução em lote (um único browser por conta) ────────────────────────────

export type BatchAction = {
  id: number;
  actionType: string;
  campaignId: string;
  campaignName: string;
  budget?: number;
  itemIds?: string[];
  acosTarget?: number;
};

/**
 * Abre o browser UMA VEZ para a conta e executa todas as ações em sequência.
 * Elimina o overhead de lançar N browsers para N ações.
 */
export async function runActionsInSession(
  account: "feminnita" | "fnt",
  actions: BatchAction[]
): Promise<Record<number, string>> {
  console.log(`[MLBrowser] runActionsInSession iniciado — account=${account} actions=${JSON.stringify(actions.map(a => ({ id: a.id, type: a.actionType, campaign: a.campaignName || a.campaignId })))}`);
  return withMutex(account, () => withBrowser(account, async (page) => {
    const results: Record<number, string> = {};
    for (const action of actions) {
      try {
        switch (action.actionType) {
          case "pause_ads_campaign":
            results[action.id] = await pauseInPage(page, account, action.campaignId, action.campaignName);
            break;
          case "activate_ads_campaign":
            results[action.id] = await activateInPage(page, account, action.campaignId, action.campaignName);
            break;
          case "update_ads_budget":
            results[action.id] = await updateBudgetInPage(page, account, action.campaignId, action.budget ?? 0, action.campaignName);
            break;
          case "create_ads_campaign":
            results[action.id] = await createCampaignInPage(page, account, action.campaignName, action.budget ?? 30, action.itemIds ?? [], action.acosTarget);
            break;
          case "scrape_ads_metrics": {
            const n = await scrapeAndSaveMetricsInPage(page, account);
            results[action.id] = `${n} métricas de campanhas salvas para ${account}`;
            break;
          }
          default:
            results[action.id] = `Tipo não suportado: ${action.actionType}`;
        }
      } catch (e: any) {
        results[action.id] = `ERRO: ${e.message}`;
      }
    }
    return results;
  }));
}

// ─── Exports individuais (compatibilidade) ────────────────────────────────────

export async function pauseAdsCampaign(campaignId: string, account: "feminnita" | "fnt" = "feminnita", campaignName = ""): Promise<string> {
  return withMutex(`${account}-pause`, () => withBrowser(account, (page) => pauseInPage(page, account, campaignId, campaignName)));
}

export async function activateAdsCampaign(campaignId: string, account: "feminnita" | "fnt" = "feminnita", campaignName = ""): Promise<string> {
  return withMutex(`${account}-activate`, () => withBrowser(account, (page) => activateInPage(page, account, campaignId, campaignName)));
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

async function updateBudgetInPage(page: Page, account: string, campaignId: string, dailyBudget: number, campaignName: string): Promise<string> {
  await page.goto(getCampaignsUrl(account), { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.waitForTimeout(2000);
  await debugScreenshot(page, `budget-${account}-loaded`);

  // Aguarda a tabela de campanhas renderizar antes de escanear
  await page.waitForSelector("table tr, [class*='row']", { timeout: 8000 }).catch(() => {});

  const row = await findCampaignRow(page, campaignId, campaignName);
  if (!row) {
    const rowCount = await page.evaluate(() => document.querySelectorAll("tr").length).catch(() => 0);
    const visible = await logVisibleCampaigns(page);
    return `Campanha "${campaignName || campaignId}" não encontrada. [URL: ${page.url()}] [Rows: ${rowCount}] [Visíveis: ${visible}]`;
  }
  console.log(`[MLBrowser] updateBudgetInPage — campanha encontrada, procurando célula R$`);

  const budgetTd = row.locator('td').filter({ hasText: /R\$/ }).first();
  await budgetTd.hover({ timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(300);
  // force:true ignora checks de cobertura — o ML às vezes exibe overlays/tooltips ao hover que bloqueiam o click
  const pencilBtn = budgetTd.locator('button, [role="button"]').first();
  if (await pencilBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
    await pencilBtn.click({ force: true, timeout: 5000, noWaitAfter: true });
  } else {
    await budgetTd.click({ force: true, timeout: 5000, noWaitAfter: true });
  }
  await page.waitForTimeout(500);
  await debugScreenshot(page, `budget-${account}-pencil`);
  console.log(`[MLBrowser] updateBudgetInPage — aguardando modal orçamento. URL=${page.url()}`);

  const modalTitle = page.locator('text="Altere seu orçamento"');
  let modalReady = await modalTitle.waitFor({ state: "visible", timeout: 6000 }).then(() => true).catch(() => false);
  if (!modalReady) {
    await budgetTd.click({ force: true, timeout: 5000, noWaitAfter: true });
    modalReady = await modalTitle.waitFor({ state: "visible", timeout: 5000 }).then(() => true).catch(() => false);
  }
  if (!modalReady) {
    const pageText = await page.evaluate(() => document.body?.innerText?.slice(0, 500) ?? "").catch(() => "");
    return `Modal de budget não abriu para "${campaignName || campaignId}". [Página: ${pageText.replace(/\n/g, " ").slice(0, 300)}]`;
  }

  await debugScreenshot(page, `budget-${account}-modal`);

  const modalArea = modalTitle.locator("xpath=ancestor::div[6]");
  let budgetInput = modalArea.locator('input[type="number"]').filter({ visible: true }).first();
  if (!await budgetInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    budgetInput = modalArea.locator('input:not([type="checkbox"])').filter({ visible: true }).first();
  }
  if (!await budgetInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    budgetInput = page.locator('input[type="number"]').filter({ visible: true }).first();
  }
  if (!await budgetInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await debugScreenshot(page, `budget-${account}-input-notfound`);
    return `Input de budget não encontrado na modal "${campaignName || campaignId}"`;
  }

  // Read current value — if already correct, skip (React won't enable Save for same value)
  const currentVal = await budgetInput.inputValue().catch(() => "");
  console.log(`[MLBrowser] Budget input atual="${currentVal}" alvo="${dailyBudget}"`);
  if (currentVal === String(dailyBudget)) {
    console.log(`[MLBrowser] Budget já é R$${dailyBudget} — fechando modal`);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);
    return `Budget da campanha "${campaignName || campaignId}" já está em R$${dailyBudget}.`;
  }

  // JS focus+select direto para evitar timeout de actionability do Playwright (input pode estar coberto por overlay)
  await budgetInput.evaluate((el: HTMLInputElement) => { el.focus(); el.select(); });
  await page.waitForTimeout(100);
  await page.evaluate((val) => {
    const inputs = Array.from(document.querySelectorAll('input[type="number"]')) as HTMLInputElement[];
    const input = inputs.find(i => i.offsetParent !== null);
    if (!input) return;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    if (setter) setter.call(input, val);
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, String(dailyBudget));
  // Tab dispara onBlur que valida o form React e habilita o botão Salvar
  await page.keyboard.press("Tab");
  await page.waitForTimeout(800);
  await debugScreenshot(page, `budget-${account}-filled`);

  // Wait up to 5s for Save button to become enabled
  const btnEnabled = await page.waitForFunction(
    () => {
      const btns = Array.from(document.querySelectorAll("button"));
      return btns.some((b: any) =>
        (b.innerText?.includes("Salvar") || b.innerText?.includes("Confirmar")) &&
        !b.disabled &&
        b.getAttribute("data-andes-state") !== "disabled" &&
        b.offsetParent !== null
      );
    },
    { timeout: 5000 }
  ).then(() => true).catch(() => false);
  console.log(`[MLBrowser] Save button enabled=${btnEnabled}`);
  await debugScreenshot(page, `budget-${account}-before-save`);

  // Sempre usa JS click para evitar timeout de actionability (botão pode estar levemente coberto)
  const saveClicked = await page.evaluate((enabled) => {
    const btns = Array.from(document.querySelectorAll("button"));
    const btn = btns.find((b: any) =>
      (b.innerText?.includes("Salvar") || b.innerText?.includes("Confirmar")) &&
      b.offsetParent !== null
    ) as HTMLElement | undefined;
    if (!btn) return false;
    if (!enabled) {
      btn.removeAttribute("disabled");
      btn.removeAttribute("data-andes-state");
      (btn as any).disabled = false;
    }
    btn.click();
    return true;
  }, btnEnabled);
  console.log(`[MLBrowser] JS save click=${saveClicked} (btnEnabled=${btnEnabled})`);
  if (!saveClicked) await page.keyboard.press("Enter");
  await page.waitForTimeout(2000);
  await debugScreenshot(page, `budget-${account}-saved`);
  return `Budget diário da campanha "${campaignName || campaignId}" atualizado para R$${dailyBudget}.`;
}

export async function updateAdsBudget(campaignId: string, dailyBudget: number, account: "feminnita" | "fnt" = "feminnita", campaignName = ""): Promise<string> {
  return withMutex(`${account}-budget`, () => withBrowser(account, (page) => updateBudgetInPage(page, account, campaignId, dailyBudget, campaignName)));
}

/** Abre o browser, coleta todas as métricas de campanhas ML e salva na tabela marketplace_ads_metrics. */
export async function scrapeAdsCampaignMetrics(account: "feminnita" | "fnt" = "feminnita"): Promise<number> {
  return withMutex(account, () => withBrowser(account, page => scrapeAndSaveMetricsInPage(page, account)));
}

// ─── Criação de campanha via Playwright ───────────────────────────────────────
// API REST do ML bloqueia criação de campanhas para contas sem parceria oficial.
// Esta função usa o wizard do Seller Center (ads.mercadolivre.com.br).

async function createCampaignInPage(
  page: Page,
  account: string,
  campaignName: string,
  dailyBudget: number,
  itemIds: string[],
  acosTarget: number | undefined,
): Promise<string> {
  if (!campaignName || !campaignName.trim()) return `ERRO: nome da campanha vazio`;
  if (!(dailyBudget > 0)) return `ERRO: budget inválido (${dailyBudget})`;
  if (!itemIds || itemIds.length === 0) return `ERRO: lista de itens vazia`;

  console.log(`[MLBrowser] createCampaignInPage — nome="${campaignName}" budget=R$${dailyBudget} itens=${itemIds.length} acos=${acosTarget ?? "auto"}`);

  const NEW_CAMPAIGN_URL = "https://ads.mercadolivre.com.br/product-ads/admin/campaigns/new";

  try {
    await page.goto(NEW_CAMPAIGN_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(3000);
    await debugScreenshot(page, `create-${account}-1-landing`);
  } catch (e: any) {
    return `ERRO: não conseguiu navegar para tela de criar campanha (${e.message})`;
  }

  if (page.url().includes("/login") || page.url().includes("/jms/")) {
    return `ERRO: sessão expirou ao abrir tela de criar campanha — reautentique`;
  }

  // Wizard ML — variações conhecidas: "Anúncios", "Itens", "Produtos". Vai pra tela de seleção de itens.
  // Fluxo típico: 1) Selecionar anúncios → 2) Nome+budget → 3) Confirmar
  // Estratégia: procurar input/textarea onde colar IDs separados por vírgula/quebra de linha.

  const itemsCsv = itemIds.map(id => id.trim()).filter(Boolean).join(", ");

  // Tentativa 1: campo de busca/colagem de IDs
  const idSearchSelectors = [
    'textarea[placeholder*="MLB"]',
    'input[placeholder*="MLB"]',
    'textarea[placeholder*="anúncio"]',
    'input[placeholder*="anúncio"]',
    'textarea[placeholder*="ID"]',
    'input[placeholder*="ID"]',
    'input[aria-label*="busca"]',
    'input[type="search"]',
  ];

  let idsAdded = false;
  for (const sel of idSearchSelectors) {
    const el = page.locator(sel).first();
    if (await el.isVisible({ timeout: 1500 }).catch(() => false)) {
      console.log(`[MLBrowser] createCampaign — campo de IDs encontrado via "${sel}"`);
      await el.click({ force: true, timeout: 4000 }).catch(() => {});
      // Para textareas multi-ID, cola lista. Para input search, faz um por um.
      const isTextarea = sel.startsWith("textarea");
      if (isTextarea) {
        await el.fill(itemsCsv);
        await page.keyboard.press("Enter");
      } else {
        for (const id of itemIds) {
          await el.fill(id);
          await page.waitForTimeout(800);
          // Clica primeiro resultado ou Enter
          await page.keyboard.press("Enter");
          await page.waitForTimeout(600);
        }
      }
      idsAdded = true;
      break;
    }
  }

  await debugScreenshot(page, `create-${account}-2-items-${idsAdded ? "added" : "notfound"}`);

  if (!idsAdded) {
    const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 600) ?? "").catch(() => "");
    return `ERRO: campo para inserir IDs de anúncios não encontrado na tela de criar campanha. URL=${page.url()}. Página: ${bodyText.replace(/\n/g, " ").slice(0, 400)}`;
  }

  // Botão "Continuar" / "Próximo" / "Avançar"
  const nextBtnSelectors = [
    'button:has-text("Continuar")',
    'button:has-text("Próximo")',
    'button:has-text("Avançar")',
    'button:has-text("Seguinte")',
    'button[type="submit"]',
  ];
  let advanced = false;
  for (const sel of nextBtnSelectors) {
    const btn = page.locator(sel).first();
    if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
      await btn.click({ force: true, timeout: 5000, noWaitAfter: true }).catch(() => {});
      advanced = true;
      break;
    }
  }
  await page.waitForTimeout(2500);
  await debugScreenshot(page, `create-${account}-3-after-items`);

  // Tela de nome + budget
  const nameInput = page.locator('input[name*="name"], input[placeholder*="ome da campanha"], input[placeholder*="ome"]').first();
  if (await nameInput.isVisible({ timeout: 5000 }).catch(() => false)) {
    await nameInput.fill(campaignName);
    console.log(`[MLBrowser] createCampaign — nome preenchido: "${campaignName}"`);
  } else {
    return `ERRO: campo de nome da campanha não encontrado. URL=${page.url()}`;
  }

  // Budget diário
  const budgetInput = page.locator('input[type="number"]').filter({ visible: true }).first();
  if (await budgetInput.isVisible({ timeout: 3000 }).catch(() => false)) {
    await budgetInput.evaluate((el: HTMLInputElement) => { el.focus(); el.select(); });
    await page.evaluate((val) => {
      const inputs = Array.from(document.querySelectorAll('input[type="number"]')) as HTMLInputElement[];
      const input = inputs.find(i => i.offsetParent !== null);
      if (!input) return;
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
      if (setter) setter.call(input, val);
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    }, String(dailyBudget));
    await page.keyboard.press("Tab");
    console.log(`[MLBrowser] createCampaign — budget preenchido: R$${dailyBudget}`);
  }

  // ACoS alvo (opcional) — se acosTarget undefined, deixa o ML decidir
  if (acosTarget !== undefined && acosTarget > 0) {
    const acosInput = page.locator('input[name*="acos"], input[placeholder*="ACoS"], input[placeholder*="acos"]').first();
    if (await acosInput.isVisible({ timeout: 2000 }).catch(() => false)) {
      await acosInput.fill(String(acosTarget));
      console.log(`[MLBrowser] createCampaign — ACoS alvo: ${acosTarget}%`);
    }
  }

  await debugScreenshot(page, `create-${account}-4-config-filled`);

  // Botão final "Criar" / "Salvar" / "Publicar"
  const createBtnSelectors = [
    'button:has-text("Criar campanha")',
    'button:has-text("Criar")',
    'button:has-text("Publicar")',
    'button:has-text("Salvar")',
    'button:has-text("Confirmar")',
    'button[type="submit"]',
  ];
  let created = false;
  for (const sel of createBtnSelectors) {
    const btn = page.locator(sel).filter({ visible: true }).first();
    if (await btn.isVisible({ timeout: 1500 }).catch(() => false)) {
      const enabled = await btn.isEnabled().catch(() => true);
      if (!enabled) continue;
      await btn.click({ force: true, timeout: 5000, noWaitAfter: true }).catch(() => {});
      created = true;
      break;
    }
  }
  await page.waitForTimeout(4000);
  await debugScreenshot(page, `create-${account}-5-after-submit`);

  if (!created) {
    return `ERRO: botão final de criar campanha não encontrado/habilitado. URL=${page.url()}`;
  }

  // Verifica resultado: voltou para listagem ou tela de sucesso?
  const url = page.url();
  const success = url.includes("/campaigns") && !url.includes("/new");
  const pageText = await page.evaluate(() => document.body?.innerText?.slice(0, 400) ?? "").catch(() => "");
  const hasSuccess = /criada com sucesso|campanha criada|sucesso/i.test(pageText);

  if (success || hasSuccess) {
    return `Campanha "${campaignName}" criada com R$${dailyBudget}/dia e ${itemIds.length} anúncios.`;
  }
  return `Campanha enviada mas resultado incerto. URL=${url}. Confira em ads.mercadolivre.com.br. Página: ${pageText.replace(/\n/g, " ").slice(0, 250)}`;
}

export async function createAdsCampaign(
  campaignName: string,
  dailyBudget: number,
  itemIds: string[],
  account: "feminnita" | "fnt" = "feminnita",
  acosTarget?: number,
): Promise<string> {
  return withMutex(`${account}-create`, () => withBrowser(account, (page) =>
    createCampaignInPage(page, account, campaignName, dailyBudget, itemIds, acosTarget)
  ));
}
