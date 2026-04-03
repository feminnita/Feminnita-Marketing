import { defineConfig } from "drizzle-kit";

const rawUrl = process.env.DATABASE_URL;
if (!rawUrl) {
  throw new Error("DATABASE_URL is required to run drizzle commands");
}

// Parse URL to pass SSL credentials explicitly (required for TiDB Cloud Serverless)
const url = new URL(rawUrl);

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    host: url.hostname,
    port: Number(url.port) || 4000,
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.replace("/", "") || "feminnita",
    ssl: { rejectUnauthorized: true },
  },
  relations: "./drizzle/relations.ts",
});
