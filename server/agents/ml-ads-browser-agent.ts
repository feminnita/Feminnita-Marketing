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
    await page.waitForSelector('input[name="user_id"]', { timeout: 10000 });
    await page.fill('input[name="user_id"]', email);
    await page.click('button[type="submit"]');

    await page.waitForSelector('input[name="password"]', { timeout: 10000 });
    await page.fill('input[name="password"]', password);

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
  id:     string;
  name:   string;
  status: string;
  budget: string;
  spent:  string;
}

async function parseCampaigns(page: Page): Promise<Campaign[]> {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('[data-testid*="campaign-row"], .campaign-row, tr[class*="campaign"]'));
    if (rows.length === 0) {
      // Fallback: tenta extrair da tabela genérica
      return Array.from(document.querySelectorAll("table tbody tr")).map(tr => {
        const cells = Array.from(tr.querySelectorAll("td")).map(td => td.innerText.trim());
        return { id: cells[0] || "", name: cells[1] || "", status: cells[2] || "", budget: cells[3] || "", spent: cells[4] || "" };
      }).filter(c => c.name);
    }
    return rows.map(row => ({
      id:     (row.getAttribute("data-id") || row.querySelector("[data-id]")?.getAttribute("data-id") || "").trim(),
      name:   (row.querySelector('[class*="name"], [data-testid*="name"]') as HTMLElement)?.innerText?.trim() || "",
      status: (row.querySelector('[class*="status"], [data-testid*="status"]') as HTMLElement)?.innerText?.trim() || "",
      budget: (row.querySelector('[class*="budget"], [data-testid*="budget"]') as HTMLElement)?.innerText?.trim() || "",
      spent:  (row.querySelector('[class*="spent"], [data-testid*="spent"]') as HTMLElement)?.innerText?.trim() || "",
    })).filter(c => c.name);
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
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",
    locale: "pt-BR",
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
  return withBrowser(account, async (page) => {
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

    const lines = campaigns.map(c =>
      `• [${c.id || "—"}] "${c.name}" | ${c.status} | Budget: ${c.budget} | Gasto: ${c.spent}`
    );
    return `CAMPANHAS DE PRODUCT ADS (${account === "fnt" ? "Conta B" : "Conta A"}):\n${lines.join("\n")}`;
  });
}

export async function pauseAdsCampaign(campaignId: string, account: "feminnita" | "fnt" = "feminnita"): Promise<string> {
  return withBrowser(account, async (page) => {
    await page.goto(SELLER_CENTER_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);

    // Localiza o botão de pause da campanha pelo ID ou nome
    const btn = await page.locator(`[data-id="${campaignId}"] button[aria-label*="ause"], [data-id="${campaignId}"] button[title*="ause"]`).first();
    if (!await btn.isVisible().catch(() => false)) {
      return `Campanha "${campaignId}" não encontrada ou já está pausada.`;
    }
    await btn.click();
    await page.waitForTimeout(1500);
    return `Campanha "${campaignId}" pausada com sucesso via Seller Center.`;
  });
}

export async function activateAdsCampaign(campaignId: string, account: "feminnita" | "fnt" = "feminnita"): Promise<string> {
  return withBrowser(account, async (page) => {
    await page.goto(SELLER_CENTER_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);

    const btn = await page.locator(`[data-id="${campaignId}"] button[aria-label*="tivar"], [data-id="${campaignId}"] button[title*="tivar"]`).first();
    if (!await btn.isVisible().catch(() => false)) {
      return `Campanha "${campaignId}" não encontrada ou já está ativa.`;
    }
    await btn.click();
    await page.waitForTimeout(1500);
    return `Campanha "${campaignId}" reativada com sucesso via Seller Center.`;
  });
}

export async function updateAdsBudget(campaignId: string, dailyBudget: number, account: "feminnita" | "fnt" = "feminnita"): Promise<string> {
  return withBrowser(account, async (page) => {
    await page.goto(SELLER_CENTER_URL, { waitUntil: "networkidle", timeout: 30000 });
    await page.waitForTimeout(2000);

    // Clica em editar campanha
    const editBtn = await page.locator(`[data-id="${campaignId}"] button[aria-label*="ditar"], [data-id="${campaignId}"] a[href*="edit"]`).first();
    if (!await editBtn.isVisible().catch(() => false)) {
      return `Campanha "${campaignId}" não encontrada para edição.`;
    }
    await editBtn.click();
    await page.waitForTimeout(2000);

    // Preenche o campo de budget
    const budgetInput = await page.locator('input[name*="budget"], input[placeholder*="budget"], input[aria-label*="udget"]').first();
    if (!await budgetInput.isVisible().catch(() => false)) {
      return "Campo de budget não encontrado. O layout do Seller Center pode ter mudado.";
    }
    await budgetInput.triple_click();
    await budgetInput.fill(String(dailyBudget));

    // Salva
    const saveBtn = await page.locator('button[type="submit"], button:has-text("Salvar"), button:has-text("Confirmar")').first();
    await saveBtn.click();
    await page.waitForTimeout(1500);
    return `Budget diário da campanha "${campaignId}" atualizado para R$${dailyBudget} via Seller Center.`;
  });
}
