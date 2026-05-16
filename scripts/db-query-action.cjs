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
    "SELECT id, status, executionLog, updatedAt FROM agent_actions WHERE id = 540317"
  );
  const r = rows[0];
  console.log("id:", r.id);
  console.log("status:", r.status);
  console.log("updatedAt:", r.updatedAt);
  console.log("executionLog:", r.executionLog || "(null)");

  await c.end();
})().catch(e => console.error("ERR:", e.message));
