/**
 * Script de migração — roda as migrations pendentes no TiDB Cloud
 * Uso: node scripts/migrate.js
 */
import "dotenv/config";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL não configurada");
  process.exit(1);
}

const MIGRATIONS = [
  {
    name: "0031_agent_actions",
    sql: `
CREATE TABLE IF NOT EXISTS \`agent_actions\` (
  \`id\` int AUTO_INCREMENT PRIMARY KEY,
  \`agentName\` varchar(50) NOT NULL,
  \`date\` varchar(10) NOT NULL,
  \`title\` varchar(200) NOT NULL,
  \`description\` text NOT NULL,
  \`actionType\` varchar(50) NOT NULL,
  \`priority\` enum('alta','media','baixa') NOT NULL DEFAULT 'media',
  \`estimatedImpact\` text,
  \`status\` enum('pending','approved','rejected','executing','done') NOT NULL DEFAULT 'pending',
  \`userNote\` text,
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`,
  },
  {
    name: "0031_agent_actions_idx1",
    sql: "CREATE INDEX `idx_agent_actions_status` ON `agent_actions` (`status`)",
  },
  {
    name: "0031_agent_actions_idx2",
    sql: "CREATE INDEX `idx_agent_actions_date` ON `agent_actions` (`date`)",
  },
  {
    name: "0031_agent_actions_idx3",
    sql: "CREATE INDEX `idx_agent_actions_agent` ON `agent_actions` (`agentName`)",
  },
  {
    name: "0032_specialist_conversations",
    sql: `
CREATE TABLE IF NOT EXISTS \`specialist_conversations\` (
  \`id\` int AUTO_INCREMENT PRIMARY KEY,
  \`userId\` int NOT NULL,
  \`agentName\` varchar(50) NOT NULL,
  \`title\` varchar(255) NOT NULL,
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updatedAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`,
  },
  {
    name: "0032_specialist_messages",
    sql: `
CREATE TABLE IF NOT EXISTS \`specialist_messages\` (
  \`id\` int AUTO_INCREMENT PRIMARY KEY,
  \`conversationId\` int NOT NULL,
  \`role\` enum('user','assistant') NOT NULL,
  \`content\` text NOT NULL,
  \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
)`,
  },
  {
    name: "0032_specialist_idx1",
    sql: "CREATE INDEX `idx_spec_conv_user_agent` ON `specialist_conversations` (`userId`, `agentName`)",
  },
  {
    name: "0032_specialist_idx2",
    sql: "CREATE INDEX `idx_spec_msg_conv` ON `specialist_messages` (`conversationId`)",
  },
];

async function run() {
  const conn = await mysql.createConnection(DATABASE_URL);
  console.log("Conectado ao banco.");

  for (const m of MIGRATIONS) {
    try {
      await conn.execute(m.sql);
      console.log(`✓ ${m.name}`);
    } catch (err) {
      if (err.code === "ER_DUP_KEYNAME" || err.code === "ER_TABLE_EXISTS_ERROR" || err.errno === 1061 || err.errno === 1050) {
        console.log(`~ ${m.name} (já existe, ok)`);
      } else {
        console.error(`✗ ${m.name}: ${err.message}`);
      }
    }
  }

  await conn.end();
  console.log("Migrações concluídas.");
}

run().catch((e) => {
  console.error("Erro fatal:", e.message);
  process.exit(1);
});
