/**
 * ML OAuth Routes — Mercado Livre OAuth 2.0 flow com PKCE
 *
 * GET /api/ml/start    → gera PKCE, redireciona para ML authorization page
 * GET /api/ml/callback → troca code por token (com code_verifier), salva no .env
 */

import type { Express } from "express";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ML_CLIENT_ID     = process.env.ML_CLIENT_ID_1 || "";
const ML_CLIENT_SECRET = process.env.ML_CLIENT_SECRET_1 || "";
const ML_REDIRECT_URL  = process.env.ML_REDIRECT_URL || "https://gestao.feminnita.com.br/ml/webhook";

// Armazena code_verifier temporariamente (state → verifier)
const pkceStore = new Map<string, string>();

function base64urlEncode(buf: Buffer): string {
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function generatePKCE(): { verifier: string; challenge: string } {
  const verifier  = base64urlEncode(crypto.randomBytes(48)); // ~64 chars URL-safe
  const challenge = base64urlEncode(crypto.createHash("sha256").update(verifier).digest());
  return { verifier, challenge };
}

function updateEnvFile(updates: Record<string, string>) {
  const envPath = path.resolve(process.cwd(), ".env");
  let content = "";
  try {
    content = fs.readFileSync(envPath, "utf-8");
  } catch {
    // arquivo não existe ainda
  }
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `\n${key}=${value}`;
    }
    process.env[key] = value;
  }
  fs.writeFileSync(envPath, content, "utf-8");
}

export function registerMLOAuthRoutes(app: Express) {
  /**
   * GET /api/ml/start
   * Gera PKCE e redireciona para a página de autorização do ML.
   */
  app.get("/api/ml/start", (_req, res) => {
    if (!ML_CLIENT_ID) {
      return res.status(500).send("ML_CLIENT_ID_1 não configurado no servidor");
    }

    const { verifier, challenge } = generatePKCE();
    const state = "mkt_" + crypto.randomBytes(8).toString("hex");

    // Guarda verifier para recuperar no callback
    pkceStore.set(state, verifier);
    // Limpa após 10 minutos (evita memory leak)
    setTimeout(() => pkceStore.delete(state), 10 * 60 * 1000);

    const authUrl =
      `https://auth.mercadolivre.com.br/authorization` +
      `?response_type=code` +
      `&client_id=${ML_CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(ML_REDIRECT_URL)}` +
      `&state=${encodeURIComponent(state)}` +
      `&code_challenge=${challenge}` +
      `&code_challenge_method=S256`;

    console.log(`[MLOAuth] Iniciando OAuth PKCE — state: ${state}`);
    return res.redirect(authUrl);
  });

  /**
   * GET /api/ml/callback
   * Recebe o code do relay (gestão/webhook), troca pelo token usando PKCE.
   */
  app.get("/api/ml/callback", async (req, res) => {
    const { code, state, error } = req.query as Record<string, string>;

    if (error || !code) {
      return res.status(400).send(`Erro na autorização ML: ${error || "código ausente"}`);
    }

    // Recupera code_verifier pelo state
    const codeVerifier = state ? pkceStore.get(state) : undefined;
    if (!codeVerifier) {
      console.warn(`[MLOAuth] code_verifier não encontrado para state=${state}. Tentando sem PKCE.`);
    } else {
      pkceStore.delete(state);
    }

    try {
      const params: Record<string, string> = {
        grant_type:   "authorization_code",
        client_id:    ML_CLIENT_ID,
        client_secret: ML_CLIENT_SECRET,
        code,
        redirect_uri: ML_REDIRECT_URL,
      };
      if (codeVerifier) params.code_verifier = codeVerifier;

      const tokenRes = await fetch("https://api.mercadolibre.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(params),
      });

      const tokenData = await tokenRes.json();

      if (!tokenRes.ok || tokenData.error) {
        const msg = tokenData.message || tokenData.error || `HTTP ${tokenRes.status}`;
        console.error("[MLOAuth] Erro ao trocar código:", msg, JSON.stringify(tokenData));
        return res.status(500).send(`Erro ao trocar código ML: ${msg}`);
      }

      const { access_token, refresh_token, user_id } = tokenData;

      updateEnvFile({
        ML_ACCESS_TOKEN_1:  access_token,
        ML_REFRESH_TOKEN_1: refresh_token || "",
        ML_USER_ID_1:       String(user_id || ""),
      });

      // Salva no DB (best effort)
      try {
        const { getDb } = await import("../db");
        const db = await getDb();
        if (db) {
          await (db as any).execute(
            `INSERT INTO oauth_tokens (provider, accessToken, refreshToken, userId, externalUserId, createdAt, updatedAt)
             VALUES ('mercadolivre', ?, ?, 1, ?, NOW(), NOW())
             ON DUPLICATE KEY UPDATE accessToken=VALUES(accessToken), refreshToken=VALUES(refreshToken), externalUserId=VALUES(externalUserId), updatedAt=NOW()`,
            [access_token, refresh_token || "", String(user_id || "")]
          ).catch((e: any) => console.warn("[MLOAuth] DB save warning:", e.message));
        }
      } catch (e: any) {
        console.warn("[MLOAuth] DB indisponível:", e.message);
      }

      console.log(`[MLOAuth] ✅ Conta ML conectada — user_id: ${user_id}`);

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
