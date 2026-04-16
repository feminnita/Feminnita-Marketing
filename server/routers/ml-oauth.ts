/**
 * ML OAuth Routes — Mercado Livre OAuth 2.0 flow
 *
 * GET /api/ml/start    → redirect to ML authorization page
 * GET /api/ml/callback → exchange code for token, save to .env + DB
 */

import type { Express } from "express";
import fs from "fs";
import path from "path";

const ML_CLIENT_ID = process.env.ML_CLIENT_ID_1 || "";
const ML_CLIENT_SECRET = process.env.ML_CLIENT_SECRET_1 || "";
const ML_REDIRECT_URL = process.env.ML_REDIRECT_URL || "http://localhost:3000/api/ml/callback";

function updateEnvFile(updates: Record<string, string>) {
  const envPath = path.resolve(process.cwd(), ".env");
  let content = "";
  try {
    content = fs.readFileSync(envPath, "utf-8");
  } catch {
    // file doesn't exist yet, start fresh
  }

  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
    // Also update process.env immediately
    process.env[key] = value;
  }

  fs.writeFileSync(envPath, content, "utf-8");
}

export function registerMLOAuthRoutes(app: Express) {
  /**
   * GET /api/ml/start
   * Redirects user to Mercado Livre authorization page.
   */
  app.get("/api/ml/start", (_req, res) => {
    if (!ML_CLIENT_ID) {
      return res.status(500).send("ML_CLIENT_ID_1 não configurado no servidor");
    }

    const authUrl =
      `https://auth.mercadolivre.com.br/authorization` +
      `?response_type=code` +
      `&client_id=${ML_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(ML_REDIRECT_URL)}`;

    return res.redirect(authUrl);
  });

  /**
   * GET /api/ml/callback
   * Receives the authorization code, exchanges for access token, saves to .env + DB.
   */
  app.get("/api/ml/callback", async (req, res) => {
    const { code, error } = req.query as Record<string, string>;

    if (error || !code) {
      return res.status(400).send(`Erro na autorização ML: ${error || "código ausente"}`);
    }

    try {
      const tokenRes = await fetch("https://api.mercadolibre.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: ML_CLIENT_ID,
          client_secret: ML_CLIENT_SECRET,
          code,
          redirect_uri: ML_REDIRECT_URL,
        }),
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || tokenData.error) {
        const msg = tokenData.message || tokenData.error || `HTTP ${tokenRes.status}`;
        console.error("[MLOAuth] Erro ao trocar código:", msg);
        return res.status(500).send(`Erro ao trocar código ML: ${msg}`);
      }

      const { access_token, refresh_token, user_id } = tokenData;

      // Save to .env file
      updateEnvFile({
        ML_ACCESS_TOKEN_1: access_token,
        ML_REFRESH_TOKEN_1: refresh_token || "",
        ML_USER_ID_1: String(user_id || ""),
      });

      // Save to DB (oauth_tokens table or similar — best effort)
      try {
        const { getDb } = await import("../db");
        const db = await getDb();
        if (db) {
          // Use raw query since we don't have a specific oauth_tokens table
          await (db as any).execute(
            `INSERT INTO oauth_tokens (provider, accessToken, refreshToken, userId, externalUserId, createdAt, updatedAt)
             VALUES ('mercadolivre', ?, ?, 1, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE accessToken=VALUES(accessToken), refreshToken=VALUES(refreshToken), externalUserId=VALUES(externalUserId), updatedAt=NOW()`,
            [access_token, refresh_token || "", String(user_id || "")]
          ).catch((dbErr: any) => {
            // Table may not exist — log and continue
            console.warn("[MLOAuth] Não foi possível salvar no DB:", dbErr.message);
          });
        }
      } catch (dbErr: any) {
        console.warn("[MLOAuth] DB indisponível:", dbErr.message);
      }

      console.log(`[MLOAuth] Conta ML conectada — user_id: ${user_id}`);

      // Redirect to ML Ads page
      return res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Conectado ao Mercado Livre</title>
  <meta http-equiv="refresh" content="2;url=/ml-ads">
  <style>body{font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;background:#fff9e6;margin:0}</style>
</head>
<body>
  <div style="text-align:center">
    <div style="font-size:3rem">✅</div>
    <h2 style="color:#333">Conta Mercado Livre conectada!</h2>
    <p style="color:#666">Redirecionando para o painel de ML Ads...</p>
  </div>
</body>
</html>`);
    } catch (err: any) {
      console.error("[MLOAuth] Erro inesperado:", err);
      return res.status(500).send(`Erro interno: ${err.message}`);
    }
  });
}
