/**
 * Shopee Ads Browser Agent — Automação do Seller Center via Playwright
 * Faz login no Shopee e executa ações de Ads em nome da Luiza
 * (mesmo padrão do ML Ads Browser Agent)
 */

import { chromium, type Browser, type Page, type BrowserContext } from "playwright";
import fs from "fs";
import path from "path";

const SESSIONS_DIR = path.join(process.cwd(), ".shopee-sessions");
const SELLER_CENTER_URL = "https://seller.shopee.com.br/portal/ads-management/";
const LOGIN_URL = "https://seller.shopee.com.br/";

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });

const runningInstances = new Map<string, Promise<any>>();

function withMutex<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = runningInstances.get(key);
  if (existing) {
    console.log(`[ShopeeBrowser] Instância já em execução para ${key} — aguardando...`);
    return existing.then(() => fn()) as Promise<T>;
  }
  const promise = fn().finally(() => runningInstances.delete(key));
  runningInstances.set(key, promise);
  return promise;
}

// ─── Sessão persistente ───────────────────────────────────────────────────────

function sessionFile(account: string) {
  return path.join(SESSIONS_DIR, `shopee-session-${account}.json`);
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

// ─── Login no Shopee Seller Center ────────────────────────────────────────────

async function loginShopee(page: Page, account: "feminnita" | "fnt"): Promise<boolean> {
  const email    = account === "fnt" ? process.env.SHOPEE_SELLER_EMAIL_2    : process.env.SHOPEE_SELLER_EMAIL;
  const password = account === "fnt" ? process.env.SHOPEE_SELLER_PASSWORD_2 : process.env.SHOPEE_SELLER_PASSWORD;
  if (!email || !password) {
    console.error(`[ShopeeBrowser] Credenciais não configuradas: SHOPEE_SELLER_EMAIL / SHOPEE_SELLER_PASSWORD`);
    return false;
  }

  try {
    await page.goto(LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(2000);

    // Clicar no botão de login caso a página inicial mostre um hero
    const loginBtn = page.locator('a[href*="login"], button:has-text("Entrar"), button:has-text("Login")').first();
    if (await loginBtn.isVisible().catch(() => false)) {
      await loginBtn.click();
      await page.waitForTimeout(1500);
    }

    // Preenche email/telefone
    const emailInput = page.locator('input[type="text"], input[name="loginKey"], input[placeholder*="mail"], input[placeholder*="elefone"]').first();
    await emailInput.waitFor({ state: "visible", timeout: 15000 });
    await emailInput.fill(email);
    await page.waitForTimeout(500);

    // Clica em continuar se houver botão antes do password
    const nextBtn = page.locator('button:has-text("Próximo"), button:has-text("Next"), button[type="submit"]').first();
    if (await nextBtn.isVisible().catch(() => false)) {
      await nextBtn.click();
      await page.waitForTimeout(1500);
    }

    // Preenche senha
    const passInput = page.locator('input[type="password"]').first();
    await passInput.waitFor({ state: "visible", timeout: 15000 });
    await passInput.fill(password);
    await page.waitForTimeout(500);

    // Submete
    await page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first().click();

    // Aguarda entrar no seller center
    await page.waitForURL(/seller\.shopee\.com\.br\/(portal|account|home)/, { timeout: 25000 });
    console.log(`[ShopeeBrowser] Login OK — ${account}`);
    return true;
  } catch (e: any) {
    console.error(`[ShopeeBrowser] Falha no login (${account}):`, e.message);
    return false;
  }
}

async function ensureLoggedIn(page: Page, context: BrowserContext, account: "feminnita" | "fnt"): Promise<boolean> {
  // Testa sessão atual
  try {
    await page.goto("https://seller.shopee.com.br/portal/dashboard", { waitUntil: "domcontentloaded", timeout: 20000 });
    const url = page.url();
    if (!url.includes("login") && url.includes("seller.shopee.com.br/portal")) return true;
  } catch { /* ignorar */ }

  // Tenta restaurar sessão salva
  const loaded = await loadSession(context, account);
  if (loaded) {
    await page.goto("https://seller.shopee.com.br/portal/dashboard", { waitUntil: "domcontentloaded", timeout: 20000 }).catch(() => {});
    const url = page.url();
    if (!url.includes("login") && url.includes("seller.shopee.com.br/portal")) return true;
  }

  // Login completo
  const ok = await loginShopee(page, account);
  if (ok) await saveSession(context, account);
  return ok;
}

// ─── Browser wrapper ──────────────────────────────────────────────────────────

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

  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    locale: "pt-BR",
    proxy: proxyConfig,
  });
  const page = await context.newPage();

  try {
    const loggedIn = await ensureLoggedIn(page, context, account);
    if (!loggedIn) throw new Error("Não foi possível fazer login no Shopee Seller Center");
    return await fn(page, context);
  } finally {
    await browser.close();
  }
}

// ─── Localizar campanha por ID na tabela de ads ───────────────────────────────

async function navigateToAds(page: Page) {
  await page.goto(SELLER_CENTER_URL, { waitUntil: "networkidle", timeout: 40000 });
  await page.waitForTimeout(3000);
  // Aceita qualquer modal de boas-vindas
  await page.locator('button:has-text("Entendido"), button:has-text("OK"), button:has-text("Fechar"), [aria-label="Close"]').first().click().catch(() => {});
  await page.waitForTimeout(1000);
}

async function findCampaignRow(page: Page, campaignId: string): Promise<boolean> {
  // Tenta localizar pela célula que contém o ID numérico ou pelo data-id
  const selectors = [
    `[data-id="${campaignId}"]`,
    `tr:has-text("${campaignId}")`,
    `[data-campaign-id="${campaignId}"]`,
    `[id*="${campaignId}"]`,
  ];
  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 3000 })) return true;
    } catch { /* continua */ }
  }
  return false;
}

// ─── API pública (chamada pela Luiza) ─────────────────────────────────────────

export async function pauseShopeeCampaign(campaignId: string, account: "feminnita" | "fnt" = "feminnita"): Promise<string> {
  return withMutex(`${account}-pause-${campaignId}`, () => withBrowser(account, async (page) => {
    await navigateToAds(page);

    const found = await findCampaignRow(page, campaignId);
    if (!found) {
      return `Campanha ID ${campaignId} não encontrada na página de Ads. Verifique se está ativa.`;
    }

    // Procura toggle/switch de status ou botão de pausa
    const pauseSelectors = [
      `[data-id="${campaignId}"] [role="switch"]`,
      `tr:has-text("${campaignId}") [role="switch"]`,
      `[data-id="${campaignId}"] button[aria-label*="ause"]`,
      `tr:has-text("${campaignId}") button[aria-label*="ause"]`,
      `[data-id="${campaignId}"] button[aria-label*="ausar"]`,
    ];

    for (const sel of pauseSelectors) {
      try {
        const btn = page.locator(sel).first();
        if (await btn.isVisible({ timeout: 3000 })) {
          const checked = await btn.getAttribute("aria-checked") || await btn.getAttribute("data-checked") || "";
          if (checked === "false" || checked === "") {
            return `Campanha ID ${campaignId} já está pausada.`;
          }
          await btn.click();
          await page.waitForTimeout(2000);
          return `Campanha ID ${campaignId} pausada com sucesso via Seller Center.`;
        }
      } catch { /* tenta próximo */ }
    }

    return `Botão de pausa não encontrado para campanha ${campaignId}. Acesse o Seller Center manualmente.`;
  }));
}

export async function activateShopeeCampaign(campaignId: string, account: "feminnita" | "fnt" = "feminnita"): Promise<string> {
  return withMutex(`${account}-activate-${campaignId}`, () => withBrowser(account, async (page) => {
    await navigateToAds(page);

    const found = await findCampaignRow(page, campaignId);
    if (!found) {
      return `Campanha ID ${campaignId} não encontrada na página de Ads.`;
    }

    const activateSelectors = [
      `[data-id="${campaignId}"] [role="switch"]`,
      `tr:has-text("${campaignId}") [role="switch"]`,
      `[data-id="${campaignId}"] button[aria-label*="tivar"]`,
      `tr:has-text("${campaignId}") button[aria-label*="tivar"]`,
    ];

    for (const sel of activateSelectors) {
      try {
        const btn = page.locator(sel).first();
        if (await btn.isVisible({ timeout: 3000 })) {
          const checked = await btn.getAttribute("aria-checked") || "";
          if (checked === "true") {
            return `Campanha ID ${campaignId} já está ativa.`;
          }
          await btn.click();
          await page.waitForTimeout(2000);
          return `Campanha ID ${campaignId} ativada com sucesso via Seller Center.`;
        }
      } catch { /* tenta próximo */ }
    }

    return `Botão de ativação não encontrado para campanha ${campaignId}. Acesse o Seller Center manualmente.`;
  }));
}

export async function updateShopeeBudget(campaignId: string, newBudget: number, account: "feminnita" | "fnt" = "feminnita"): Promise<string> {
  return withMutex(`${account}-budget-${campaignId}`, () => withBrowser(account, async (page) => {
    await navigateToAds(page);

    const found = await findCampaignRow(page, campaignId);
    if (!found) {
      return `Campanha ID ${campaignId} não encontrada na página de Ads.`;
    }

    // Clica em editar
    const editSelectors = [
      `[data-id="${campaignId}"] button[aria-label*="ditar"]`,
      `tr:has-text("${campaignId}") button[aria-label*="ditar"]`,
      `[data-id="${campaignId}"] a[href*="edit"]`,
      `tr:has-text("${campaignId}") a[href*="edit"]`,
      `[data-id="${campaignId}"] [data-testid*="edit"]`,
    ];

    let edited = false;
    for (const sel of editSelectors) {
      try {
        const btn = page.locator(sel).first();
        if (await btn.isVisible({ timeout: 3000 })) {
          await btn.click();
          edited = true;
          break;
        }
      } catch { /* tenta próximo */ }
    }

    if (!edited) {
      return `Botão de edição não encontrado para campanha ${campaignId}. Acesse o Seller Center manualmente.`;
    }

    await page.waitForTimeout(2000);

    // Localiza campo de budget e atualiza
    const budgetInput = page.locator('input[name*="budget"], input[placeholder*="orçamento"], input[placeholder*="Budget"], input[type="number"]').first();
    if (!await budgetInput.isVisible({ timeout: 8000 }).catch(() => false)) {
      return `Campo de orçamento não encontrado na tela de edição da campanha ${campaignId}.`;
    }

    await budgetInput.triple_click();
    await budgetInput.fill(String(newBudget));
    await page.waitForTimeout(500);

    // Confirma
    const saveBtn = page.locator('button:has-text("Salvar"), button:has-text("Confirmar"), button[type="submit"]').first();
    if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
      return `Orçamento da campanha ${campaignId} atualizado para R$${newBudget}/dia via Seller Center.`;
    }

    return `Budget preenchido mas botão de salvar não encontrado para campanha ${campaignId}.`;
  }));
}

export async function updateShopeeRoas(campaignId: string, targetRoas: number, account: "feminnita" | "fnt" = "feminnita"): Promise<string> {
  return withMutex(`${account}-roas-${campaignId}`, () => withBrowser(account, async (page) => {
    await navigateToAds(page);

    const found = await findCampaignRow(page, campaignId);
    if (!found) return `Campanha ID ${campaignId} não encontrada.`;

    // Clica em editar
    const editSelectors = [
      `[data-id="${campaignId}"] button[aria-label*="ditar"]`,
      `tr:has-text("${campaignId}") button[aria-label*="ditar"]`,
      `[data-id="${campaignId}"] a[href*="edit"]`,
    ];
    let edited = false;
    for (const sel of editSelectors) {
      try {
        const btn = page.locator(sel).first();
        if (await btn.isVisible({ timeout: 3000 })) { await btn.click(); edited = true; break; }
      } catch { /* continua */ }
    }
    if (!edited) return `Botão de edição não encontrado para campanha ${campaignId}.`;

    await page.waitForTimeout(2000);

    const roasInput = page.locator('input[name*="roas"], input[placeholder*="ROAS"], input[placeholder*="roas"]').first();
    if (!await roasInput.isVisible({ timeout: 8000 }).catch(() => false)) {
      return `Campo de ROAS não encontrado para campanha ${campaignId}.`;
    }
    await roasInput.triple_click();
    await roasInput.fill(String(targetRoas));
    await page.waitForTimeout(500);

    const saveBtn = page.locator('button:has-text("Salvar"), button:has-text("Confirmar"), button[type="submit"]').first();
    if (await saveBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
      return `ROAS alvo da campanha ${campaignId} atualizado para ${targetRoas}x via Seller Center.`;
    }
    return `ROAS preenchido mas botão de salvar não encontrado para campanha ${campaignId}.`;
  }));
}
