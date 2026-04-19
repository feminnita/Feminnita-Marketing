/**
 * run-migrations.mjs — Executa todas as migrações SQL pendentes no TiDB Cloud
 * Uso: node run-migrations.mjs
 */

import { readFileSync, readdirSync } from "fs";
import { createConnection } from "mysql2/promise";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL não configurado no .env");
  process.exit(1);
}

// Parse MySQL URL
const url = new URL(dbUrl.replace(/\?.*$/, ""));
const sslParam = dbUrl.includes("ssl=") ? JSON.parse(decodeURIComponent(dbUrl.split("ssl=")[1])) : { rejectUnauthorized: true };

const connection = await createConnection({
  host: url.hostname,
  port: parseInt(url.port || "4000"),
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: sslParam,
  multipleStatements: true,
});

console.log("✅ Conectado ao banco de dados");

// Garante tabela de controle de migrações
await connection.execute(`
  CREATE TABLE IF NOT EXISTS __migrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(200) NOT NULL UNIQUE,
    appliedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
`);

// Lê migrações já aplicadas
const [applied] = await connection.execute("SELECT filename FROM __migrations");
const appliedSet = new Set(applied.map(r => r.filename));

// Lê arquivos SQL ordenados
const sqlDir = join(__dirname, "drizzle");
const files = readdirSync(sqlDir)
  .filter(f => f.endsWith(".sql"))
  .sort();

let count = 0;
for (const file of files) {
  if (appliedSet.has(file)) {
    console.log(`  ⏭ Já aplicado: ${file}`);
    continue;
  }

  const sql = readFileSync(join(sqlDir, file), "utf8").trim();
  if (!sql) {
    console.log(`  ⏭ Vazio: ${file}`);
    continue;
  }

  try {
    await connection.query(sql);
    await connection.execute("INSERT INTO __migrations (filename) VALUES (?)", [file]);
    console.log(`  ✅ Aplicado: ${file}`);
    count++;
  } catch (err) {
    if (err.code === "ER_TABLE_EXISTS_ERROR" || err.message.includes("already exists")) {
      await connection.execute("INSERT IGNORE INTO __migrations (filename) VALUES (?)", [file]);
      console.log(`  ⚠ Já existe (ignorado): ${file}`);
    } else {
      console.error(`  ❌ Erro em ${file}:`, err.message);
    }
  }
}

console.log(`\n🎉 Concluído: ${count} migração(ões) aplicada(s)`);
await connection.end();
