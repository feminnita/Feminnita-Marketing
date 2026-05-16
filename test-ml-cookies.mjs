import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const SESSIONS_DIR = "/opt/marketing/.ml-sessions";
const SELLER_CENTER_URL = "https://ads.mercadolivre.com.br/productAds";

const file = path.join(SESSIONS_DIR, "ml-session-feminnita.json");
const raw = JSON.parse(fs.readFileSync(file, "utf8"));
console.log("Cookies carregados:", raw.length);
console.log("Dominios:", [...new Set(raw.map(c => c.domain))].join(", "));

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox","--disable-setuid-sandbox","--disable-dev-shm-usage"] });
const ctx = await browser.newContext({ userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36", locale: "pt-BR" });

// Normaliza e adiciona cookies
const sameSiteMap = { no_restriction:"None", unspecified:"None", none:"None", lax:"Lax", strict:"Strict" };
const cookies = raw.map(c => ({
  name: c.name, value: c.value, domain: c.domain, path: c.path || "/",
  expires: c.expirationDate ? Math.floor(c.expirationDate) : (c.expires ?? -1),
  httpOnly: c.httpOnly ?? false, secure: c.secure ?? false,
  sameSite: sameSiteMap[(c.sameSite || "").toLowerCase()] ?? "None",
})).filter(c => c.name && c.value);

await ctx.addCookies(cookies);
console.log("Cookies injetados:", cookies.length);

const page = await ctx.newPage();
console.log("\nNavegando para Seller Center...");
await page.goto(SELLER_CENTER_URL, { waitUntil: "domcontentloaded", timeout: 25000 }).catch(e => console.log("goto warn:", e.message));
await page.waitForTimeout(4000);

const url = page.url();
const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 500) ?? "");
await page.screenshot({ path: "/tmp/ml-cookies-test.png" });

const onLogin = url.includes("/login") || url.includes("/jms/lgz/");
const isPublic = bodyText.includes("Crie a sua conta") || bodyText.includes("Outros vendedores estão");

console.log("URL:", url);
console.log("Body:", bodyText.replace(/\n/g, " ").slice(0, 300));
console.log("\nLogin page:", onLogin);
console.log("Public landing:", isPublic);
console.log("AUTENTICADO:", (!onLogin && !isPublic) ? "SIM ✅" : "NAO ❌");

await browser.close();
