import { createConnection } from "mysql2/promise";
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL não encontrado"); process.exit(1); }

const conn = await createConnection(url);

try {
  await conn.execute(
    "ALTER TABLE video_plans ADD COLUMN IF NOT EXISTS videoCreditsBalance INT NOT NULL DEFAULT 0"
  );
  console.log("OK: coluna videoCreditsBalance adicionada");

  await conn.execute(`
    CREATE TABLE IF NOT EXISTS video_credit_orders (
      id              INT AUTO_INCREMENT PRIMARY KEY,
      userId          INT NOT NULL,
      packageId       VARCHAR(50) NOT NULL,
      credits         INT NOT NULL,
      amountBrl       VARCHAR(20) NOT NULL,
      asaasPaymentId  VARCHAR(100),
      asaasPaymentUrl VARCHAR(500),
      status          ENUM('pending','paid','failed') NOT NULL DEFAULT 'pending',
      createdAt       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      paidAt          TIMESTAMP NULL,
      INDEX idx_userId (userId),
      INDEX idx_asaasPaymentId (asaasPaymentId)
    )
  `);
  console.log("OK: tabela video_credit_orders criada");

  console.log("Migration concluída com sucesso.");
} catch (e) {
  console.error("ERRO:", e.message);
  process.exit(1);
} finally {
  await conn.end();
}
