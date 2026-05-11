/**
 * Tray Browser Agent — Automação do painel admin via Playwright
 * Executa edições de SEO (title, meta description, descrição) em nome da Duda
 */

import { chromium, type Browser, type Page, type BrowserContext } from "playwright";
import fs from "fs";
import path from "path";

const SESSIONS_DIR = path.join(process.cwd(), ".tray-sessions");
const TRAY_STORE_URL = process.env.TRAY_STORE_URL || "https://feminnita.com.br";
const ADMIN_URL = `${TRAY_STORE_URL}/admin`;

if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR, { recursive: true });

let runningInstance: Promise<any> | null = null;

function withMutex<T>(fn: () => Promise<T>): Promise<T> {
  if (runningInstance) {
    console.log(`[TrayBrowser] Instância já em execução — aguardando...`);
    return runningInstance.then(() => fn()) as Promise<T>;
  }
  const promise = fn().finally(() => { runningInstance = null; });
  runningInstance = promise;
  return promise;
}

// ─── Sessão persistente ───────────────────────────────────────────────────────

const SESSION_FILE = path.join(SESSIONS_DIR, "tray-session.json");

async function saveSession(context: BrowserContext) {
  const cookies = await context.cookies();
  fs.writeFileSync(SESSION_FILE, JSON.stringify(cookies, null, 2));
}

async function loadSession(context: BrowserContext): Promise<boolean> {
  if (!fs.existsSync(SESSION_FILE)) return false;
  try {
    const cookies = JSON.parse(fs.readFileSync(SESSION_FILE, "utf8"));
    await context.addCookies(cookies);
    return true;
  } catch {
    return false;
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

async function loginTray(page: Page): Promise<boolean> {
  const email    = process.env.TRAY_ADMIN_EMAIL    || "";
  const password = process.env.TRAY_ADMIN_PASSWORD || "";
  if (!email || !password) {
    console.error("[TrayBrowser] TRAY_ADMIN_EMAIL / TRAY_ADMIN_PASSWORD não configurados");
    return false;
  }

  console.log("[TrayBrowser] Fazendo login...");
  await page.goto(`${ADMIN_URL}/login`, { waitUntil: "networkidle" });

  const emailInput = page.locator("input[name='email'], input[type='email']").first();
  await emailInput.fill(email, { timeout: 10_000 });

  const passInput = page.locator("input[name='password'], input[type='password']").first();
  await passInput.fill(password, { timeout: 5_000 });

  await page.locator("button[type='submit'], button:has-text('Entrar')").first().click();
  await page.waitForLoadState("networkidle", { timeout: 20_000 });

  const logged = page.url().includes("/admin/dashboard") || page.url().includes("/admin/");
  console.log(`[TrayBrowser] Login ${logged ? "OK" : "FALHOU"} — URL: ${page.url()}`);
  return logged;
}

async function ensureLoggedIn(page: Page, context: BrowserContext): Promise<boolean> {
  await page.goto(`${ADMIN_URL}/dashboard`, { waitUntil: "networkidle" });
  if (page.url().includes("/admin/login") || page.url().includes("/login")) {
    const ok = await loginTray(page);
    if (ok) await saveSession(context);
    return ok;
  }
  return true;
}

// ─── Ações individuais ────────────────────────────────────────────────────────

async function doUpdateSeoTitle(page: Page, productId: string, seoTitle: string): Promise<string> {
  await page.goto(`${ADMIN_URL}/products/edit/${productId}`, { waitUntil: "networkidle" });
  const seoTab = page.locator("a:has-text('SEO'), button:has-text('SEO'), [data-tab='seo']").first();
  await seoTab.click({ timeout: 5_000 });
  const input = page.locator("input[name='seo_title'], input[placeholder*='Título SEO'], input[placeholder*='SEO']").first();
  await input.fill(seoTitle, { timeout: 5_000 });
  await page.locator("button:has-text('Salvar'), button[type='submit']").first().click();
  await page.waitForTimeout(2_000);
  return `✅ SEO title do produto ${productId} atualizado: "${seoTitle}"`;
}

async function doUpdateSeoDescription(page: Page, productId: string, seoDescription: string): Promise<string> {
  await page.goto(`${ADMIN_URL}/products/edit/${productId}`, { waitUntil: "networkidle" });
  const seoTab = page.locator("a:has-text('SEO'), button:has-text('SEO'), [data-tab='seo']").first();
  await seoTab.click({ timeout: 5_000 });
  const textarea = page.locator("textarea[name='seo_description'], textarea[placeholder*='Descrição SEO']").first();
  await textarea.fill(seoDescription, { timeout: 5_000 });
  await page.locator("button:has-text('Salvar'), button[type='submit']").first().click();
  await page.waitForTimeout(2_000);
  return `✅ Meta description do produto ${productId} atualizada`;
}

async function doUpdateProductDescription(page: Page, productId: string, description: string): Promise<string> {
  await page.goto(`${ADMIN_URL}/products/edit/${productId}`, { waitUntil: "networkidle" });
  const descArea = page.locator(".ql-editor, [contenteditable='true'], textarea[name='description']").first();
  await descArea.fill(description, { timeout: 5_000 });
  await page.locator("button:has-text('Salvar'), button[type='submit']").first().click();
  await page.waitForTimeout(2_000);
  return `✅ Descrição do produto ${productId} atualizada`;
}

async function doUpdatePageSeo(page: Page, pageSlug: string, seoTitle: string, seoDescription: string): Promise<string> {
  await page.goto(`${ADMIN_URL}/pages`, { waitUntil: "networkidle" });
  if (pageSlug) {
    await page.locator(`a:has-text('${pageSlug}'), tr:has-text('${pageSlug}') a:has-text('Editar')`).first().click({ timeout: 5_000 });
    await page.waitForLoadState("networkidle");
  }
  if (seoTitle) {
    await page.locator("input[name='seo_title']").fill(seoTitle, { timeout: 5_000 });
  }
  if (seoDescription) {
    await page.locator("textarea[name='seo_description']").fill(seoDescription, { timeout: 5_000 });
  }
  await page.locator("button:has-text('Salvar'), button[type='submit']").first().click();
  await page.waitForTimeout(2_000);
  return `✅ SEO da página "${pageSlug}" atualizado`;
}

// ─── Sessão batch ─────────────────────────────────────────────────────────────

export interface TrayAction {
  id:         number;
  actionType: string;
  productId?: string;
  pageSlug?:  string;
  seoTitle?:  string;
  seoDescription?: string;
  description?:    string;
}

export async function runTrayActionsInSession(actions: TrayAction[]): Promise<Record<number, string>> {
  return withMutex(async () => {
    const browser: Browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-setuid-sandbox"] });
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });

    await loadSession(context);

    const page = await context.newPage();
    const results: Record<number, string> = {};

    try {
      const ok = await ensureLoggedIn(page, context);
      if (!ok) {
        for (const a of actions) results[a.id] = "ERRO: falha no login da Tray";
        return results;
      }

      for (const action of actions) {
        try {
          let log: string;
          switch (action.actionType) {
            case "tray_update_seo_title":
              log = await doUpdateSeoTitle(page, action.productId!, action.seoTitle!);
              break;
            case "tray_update_seo_description":
              log = await doUpdateSeoDescription(page, action.productId!, action.seoDescription!);
              break;
            case "tray_update_product_description":
              log = await doUpdateProductDescription(page, action.productId!, action.description!);
              break;
            case "tray_update_page_seo":
              log = await doUpdatePageSeo(page, action.pageSlug!, action.seoTitle!, action.seoDescription!);
              break;
            default:
              log = `ERRO: tipo desconhecido ${action.actionType}`;
          }
          results[action.id] = log;
        } catch (e: any) {
          results[action.id] = `ERRO: ${e.message}`;
        }
      }
    } finally {
      await saveSession(context);
      await browser.close();
    }

    return results;
  });
}
