const fs = require("fs");

const APP_DIR = "/var/www/feminnita-marketing";
const env = Object.fromEntries(
  fs.readFileSync(`${APP_DIR}/.env`, "utf8").trim().split("\n")
    .filter(l => l && !l.startsWith("#"))
    .map(l => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; })
);

const url = env.DATABASE_URL;
const m = url.match(/mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
const [, user, pass, host, port, db] = m;

const mysql = require(`${APP_DIR}/node_modules/mysql2/promise`);

(async () => {
  const c = await mysql.createConnection({
    host, port: +port, user, password: pass,
    database: db.split("?")[0],
    ssl: { rejectUnauthorized: false },
  });

  const [rows] = await c.execute(
    "SELECT id, status, executionLog FROM agent_actions WHERE agentName = 'gabi' ORDER BY id DESC LIMIT 10"
  );
  console.log("Gabi actions:", JSON.stringify(rows.map(r => ({ id: r.id, status: r.status, log: (r.executionLog || "").slice(0, 80) }))));

  // Reset action 540317 to pending for testing keyboard.type fix
  await c.execute("UPDATE agent_actions SET status = 'pending', executionLog = NULL WHERE id = 540317");
  console.log("Reset 540317 to pending OK");

  await c.end();
})().catch(e => console.error("ERR:", e.message, e.stack));
