/**
 * Migration runner for TiDB Cloud.
 *
 * 1. Creates __drizzle_migrations table if missing
 * 2. Marks migrations 0000-0015 as applied (they were run directly before drizzle tracking)
 * 3. Runs pending migrations 0016-0026 using CREATE TABLE IF NOT EXISTS semantics
 */

import { createConnection } from "mysql2/promise";
import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import dotenv from "dotenv";

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error("DATABASE_URL not set");

const url = new URL(DATABASE_URL);

const conn = await createConnection({
  host: url.hostname,
  port: Number(url.port) || 4000,
  user: decodeURIComponent(url.username),
  password: decodeURIComponent(url.password),
  database: url.pathname.replace("/", "") || "feminnita",
  ssl: { rejectUnauthorized: true },
  multipleStatements: true,
});

console.log("Connected to TiDB Cloud");

// 1. Ensure __drizzle_migrations table exists
await conn.execute(`
  CREATE TABLE IF NOT EXISTS \`__drizzle_migrations\` (
    id serial PRIMARY KEY,
    hash text NOT NULL,
    created_at bigint
  )
`);
console.log("__drizzle_migrations table ready");

// 2. Check which migrations are already tracked
const [rows] = await conn.execute("SELECT hash FROM `__drizzle_migrations`");
const applied = new Set(rows.map(r => r.hash));
console.log(`Already tracked: ${applied.size} migrations`);

// 3. Mark 0000-0015 as applied (they were manually run before drizzle tracking)
const alreadyApplied = [
  "0000_wide_vision",
  "0001_same_winter_soldier",
  "0002_thankful_vertigo",
  "0003_crazy_zarda",
  "0004_optimal_paper_doll",
  "0005_brief_whirlwind",
  "0006_orange_medusa",
  "0007_left_blackheart",
  "0008_tan_mikhail_rasputin",
  "0009_fresh_cardiac",
  "0010_true_rawhide_kid",
  "0011_narrow_kitty_pryde",
  "0012_bored_night_nurse",
  "0013_clean_starjammers",
  "0014_classy_alex_power",
  "0015_pale_wild_child",
];

for (const hash of alreadyApplied) {
  if (!applied.has(hash)) {
    await conn.execute(
      "INSERT INTO `__drizzle_migrations` (hash, created_at) VALUES (?, ?)",
      [hash, Date.now()]
    );
    console.log(`  Marked as applied: ${hash}`);
  }
}

// 4. Run pending migrations 0014_campaigns_automations through 0026_auth_own
const pending = [
  "0014_campaigns_automations",
  "0015_marketing_team",
  "0016_asset_library",
  "0017_afiliadas",
  "0018_abandono",
  "0019_brand_book",
  "0020_drops",
  "0021_ugc",
  "0022_tiktok_live",
  "0023_cupons",
  "0024_templates",
  "0025_design_history",
  "0026_auth_own",
  "0027_ads_evaluations",
  "0028_blog_feminnita",
  "0029_traffic_manager",
  "0030_agent_memory",
  "0031_agent_actions",
  "0032_specialist_chat",
  "0033_whatsapp_blasts",
];

for (const name of pending) {
  if (applied.has(name)) {
    console.log(`  Skipping (already applied): ${name}`);
    continue;
  }

  const filePath = join(ROOT, "drizzle", `${name}.sql`);
  if (!existsSync(filePath)) {
    console.log(`  File not found, skipping: ${name}`);
    continue;
  }

  const sql = readFileSync(filePath, "utf8")
    // Remove comment lines
    .split("\n")
    .filter(l => !l.trim().startsWith("--"))
    .join("\n")
    // Split on semicolons to run statement by statement
  ;

  // Split into individual statements
  const statements = sql
    .split(";")
    .map(s => s.trim())
    .filter(s => s.length > 3);

  console.log(`\nRunning: ${name} (${statements.length} statements)`);

  let errors = 0;
  for (const stmt of statements) {
    try {
      await conn.execute(stmt);
    } catch (err) {
      const msg = err.message || "";
      // Tolerate "already exists" and "duplicate key" errors (idempotent)
      if (
        msg.includes("already exists") ||
        msg.includes("Duplicate entry") ||
        msg.includes("ER_TABLE_EXISTS_ERROR") ||
        msg.includes("ER_DUP_KEYNAME") ||
        msg.includes("Duplicate key name") ||
        msg.includes("ER_DUP_FIELDNAME")
      ) {
        console.log(`    [skip] ${msg.substring(0, 80)}`);
      } else {
        console.error(`    [ERROR] ${msg}`);
        errors++;
      }
    }
  }

  if (errors === 0) {
    await conn.execute(
      "INSERT INTO `__drizzle_migrations` (hash, created_at) VALUES (?, ?)",
      [name, Date.now()]
    );
    console.log(`  ✓ Applied and tracked: ${name}`);
  } else {
    console.error(`  ✗ ${errors} error(s) in ${name} — NOT marked as applied`);
  }
}

await conn.end();
console.log("\nDone.");
