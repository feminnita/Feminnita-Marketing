import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, ".env") });

const TOKEN = "EAAgRL5W48wYBRItrvkVa6epPVQQceQmjdSiCDPHCcdILmkMOocBfNro7kMHHHZA9fNm6iEaNFmvY8eflNJwyh2uRUcMPnZAG2vwXbTwtm9dsN4FSZCgxFatI5E2KRi6DorjIwEoO9WBs2T9XwcqBmLLTDCkGdS2ChVZBASayLppEycTWvkcyeGZA6KMhyhLGY793C2JZBsNGHptppp21hZAh1mYwmQNIAZDZD";
const IG_ID = "59536615191";

const url = new URL(process.env.DATABASE_URL);
const conn = await mysql.createConnection({
  host: url.hostname,
  port: Number(url.port) || 4000,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1).split("?")[0],
  ssl: { rejectUnauthorized: false },
});

const [rows] = await conn.execute(
  "SELECT id, username, accessToken FROM instagram_accounts WHERE instagramId = ?",
  [IG_ID]
);

if (rows.length === 0) {
  console.log("Conta não encontrada. Inserindo...");
  await conn.execute(
    `INSERT INTO instagram_accounts (accountType, instagramId, username, displayName, accessToken, isActive, createdAt, updatedAt)
     VALUES ('feminnita', ?, 'feminnita', 'Feminnita', ?, 1, NOW(), NOW())`,
    [IG_ID, TOKEN]
  );
  console.log("Conta inserida com sucesso!");
} else {
  console.log(`Conta encontrada: @${rows[0].username} (id=${rows[0].id})`);
  await conn.execute(
    "UPDATE instagram_accounts SET accessToken = ?, updatedAt = NOW() WHERE instagramId = ?",
    [TOKEN, IG_ID]
  );
  console.log("Token atualizado com sucesso!");
}

await conn.end();
