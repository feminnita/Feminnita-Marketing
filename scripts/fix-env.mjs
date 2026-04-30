// Corrige linha quebrada no .env (ML_ACCESS_TOKEN_2 grudado na mesma linha)
import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const envPath = resolve(process.cwd(), ".env");
let content = readFileSync(envPath, "utf-8");
const before = content;

content = content.replace(/([^\n])ML_ACCESS_TOKEN_2=/g, "$1\nML_ACCESS_TOKEN_2=");

if (content !== before) {
  writeFileSync(envPath, content, "utf-8");
  console.log("✅ .env corrigido — ML_ACCESS_TOKEN_2 agora está em linha separada.");
} else {
  console.log("ℹ️  Nenhuma correção necessária — já estava correto.");
}
