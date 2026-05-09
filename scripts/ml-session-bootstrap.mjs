/**
 * ML Session Bootstrap — extrai cookies do browser após login manual e faz upload pro VPS.
 *
 * Como usar:
 *   1. Configure o .env com ML_SESSION_SECRET=uma_senha_qualquer
 *   2. No VPS, também configure ML_SESSION_SECRET com o mesmo valor
 *   3. Rode: node scripts/ml-session-bootstrap.mjs [feminnita|fnt]
 *   4. O browser abre. Faça login no ML normalmente.
 *   5. Quando chegar na página de Product Ads, pressione ENTER no terminal.
 *   6. Os cookies são salvos no VPS automaticamente.
 */

import { chromium } from "playwright";
import { readFileSync } from "fs";
import { createInterface } from "readline";

// Lê .env local
const envText = readFileSync(".env", "utf8").split("\n").reduce((acc, line) => {
  const eq = line.indexOf("=");
  if (eq > 0) acc[line.slice(0, eq).trim()] = line.slice(eq + 1).trim();
  return acc;
}, {});

const ACCOUNT   = process.argv[2] || "feminnita";
const VPS_URL   = envText.APP_URL || "http://216.238.112.109:3001";
const SECRET    = envText.ML_SESSION_SECRET || "";

if (!["feminnita", "fnt"].includes(ACCOUNT)) {
  console.error("Uso: node scripts/ml-session-bootstrap.mjs [feminnita|fnt]");
  process.exit(1);
}
if (!SECRET) {
  console.error("ML_SESSION_SECRET não configurado no .env");
  process.exit(1);
}

console.log(`\n=== ML Session Bootstrap (${ACCOUNT}) ===`);
console.log(`VPS: ${VPS_URL}`);
console.log("Abrindo browser para login manual...\n");

const browser = await chromium.launch({ headless: false, slowMo: 50 });
const ctx = await browser.newContext({
  locale: "pt-BR",
  timezoneId: "America/Sao_Paulo",
  viewport: { width: 1366, height: 768 },
});
const page = await ctx.newPage();

await page.goto("https://www.mercadolivre.com.br/publicidade/product-ads");

const rl = createInterface({ input: process.stdin, output: process.stdout });
await new Promise(resolve => {
  rl.question(
    "\nFaça login no ML e navegue até a página de Product Ads.\nQuando estiver logado e na página correta, pressione ENTER: ",
    resolve
  );
});
rl.close();

const cookies = await ctx.cookies();
console.log(`\n${cookies.length} cookies capturados.`);

// Filtra apenas cookies relevantes do ML
const mlCookies = cookies.filter(c =>
  c.domain.includes("mercadolivre") || c.domain.includes("mercadolibre") || c.domain.includes("meli")
);
console.log(`${mlCookies.length} cookies do ML/Meli.`);

console.log(`\nEnviando para ${VPS_URL}/api/ml-session/${ACCOUNT}...`);
try {
  const res = await fetch(`${VPS_URL}/api/ml-session/${ACCOUNT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-session-secret": SECRET,
    },
    body: JSON.stringify(mlCookies),
  });
  const json = await res.json();
  if (json.ok) {
    console.log(`✓ Sessão salva no VPS! ${json.cookies} cookies para conta ${json.account}.`);
    console.log("A Gabi vai usar esses cookies nas próximas execuções.");
  } else {
    console.error("Erro do servidor:", json);
  }
} catch (e) {
  console.error("Falha no upload:", e.message);
  // Salva localmente como fallback
  const { writeFileSync } = await import("fs");
  const outFile = `.ml-sessions/ml-session-${ACCOUNT}.json`;
  writeFileSync(outFile, JSON.stringify(mlCookies, null, 2));
  console.log(`Cookies salvos localmente em ${outFile} — copie para o VPS manualmente.`);
}

await browser.close();
