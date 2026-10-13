// Aplica o cerebro da Lia Armmis (scripts/lia-armmis-prompt.txt) em ai_settings do userId 1,
// guardando antes uma copia do texto anterior. Rodar NA VPS, so com o OK da Chris.
import "dotenv/config";
import { readFileSync, writeFileSync } from "fs";
import { eq } from "drizzle-orm";
import { getDb } from "../server/db";
import { aiSettings } from "../drizzle/schema";

const db = await getDb();
if (!db) throw new Error("banco indisponivel");
const [atual] = await db.select().from(aiSettings).where(eq(aiSettings.userId, 1)).limit(1);
const backup = `scripts/backup-prompt-lia-${new Date().toISOString().slice(0, 10)}.txt`;
writeFileSync(backup, atual?.systemPrompt ?? "");
await db.update(aiSettings).set({ systemPrompt: readFileSync("scripts/lia-armmis-prompt.txt", "utf8") }).where(eq(aiSettings.userId, 1));
const [novo] = await db.select().from(aiSettings).where(eq(aiSettings.userId, 1)).limit(1);
console.log("backup do anterior:", backup);
console.log("prompt aplicado:", (novo.systemPrompt ?? "").slice(0, 80), "| tamanho", (novo.systemPrompt ?? "").length);
process.exit(0);
