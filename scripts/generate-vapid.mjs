// Gera chaves VAPID válidas e salva no .env
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

// Usa web-push do projeto
const { default: webpush } = await import("../node_modules/web-push/src/index.js");
const keys = webpush.generateVAPIDKeys();

console.log("✅ Chaves VAPID geradas:");
console.log("PUBLIC: ", keys.publicKey);
console.log("PRIVATE:", keys.privateKey);

const envPath = resolve(process.cwd(), ".env");
let content = readFileSync(envPath, "utf-8");

// Remove chaves antigas se existirem
content = content.replace(/^VAPID_PUBLIC_KEY=.*$/m, "");
content = content.replace(/^VAPID_PRIVATE_KEY=.*$/m, "");

// Adiciona novas
content += `\nVAPID_PUBLIC_KEY=${keys.publicKey}`;
content += `\nVAPID_PRIVATE_KEY=${keys.privateKey}\n`;

writeFileSync(envPath, content, "utf-8");
console.log("✅ Chaves salvas no .env — reinicie com: pm2 restart feminnita");
