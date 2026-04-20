/**
 * TikTok Shop OAuth REST routes
 * GET /api/tiktok-shop/start    — inicia fluxo OAuth
 * GET /api/tiktok-shop/callback — troca code por tokens, salva no .env
 * GET /api/tiktok-shop/status   — retorna { connected, shopId }
 * GET /api/tiktok-shop/refresh  — renova access token
 */

import type { Express } from "express";
import fs from "fs";
import path from "path";
import { tiktokShopAuthUrl, tiktokShopSign } from "../services/tiktokShopApi";

const APP_KEY = process.env.TIKTOK_SHOP_APP_KEY || process.env.TIKTOK_ADS_APP_ID || "";
const APP_SECRET = process.env.TIKTOK_SHOP_APP_SECRET || process.env.TIKTOK_ADS_SECRET || "";
const AUTH_BASE = "https://auth.tiktok-shops.com";

function updateEnvFile(updates: Record<string, string>): void {
  const envPath = path.resolve(process.cwd(), ".env");
  let content = "";
  try {
    content = fs.readFileSync(envPath, "utf-8");
  } catch {}

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

export function registerTiktokShopOAuthRoutes(app: Express): void {
  // ── Inicia fluxo OAuth ──────────────────────────────────────────────────────
  app.get("/api/tiktok-shop/start", (_req, res) => {
    const authUrl = tiktokShopAuthUrl();
    res.redirect(authUrl);
  });

  // ── Callback: troca code por tokens ────────────────────────────────────────
  app.get("/api/tiktok-shop/callback", async (req, res) => {
    const { code } = req.query as Record<string, string>;

    if (!code) {
      return res.redirect("/tiktok-shop?error=missing_code");
    }

    try {
      const ts = Math.floor(Date.now() / 1000);
      const params: Record<string, string> = {
        app_key: APP_KEY,
        timestamp: String(ts),
        auth_code: code,
        grant_type: "authorized_code",
      };
      const sign = tiktokShopSign("/api/v2/token/get", params);
      const qs = new URLSearchParams({ ...params, sign }).toString();

      const r = await fetch(`${AUTH_BASE}/api/v2/token/get?${qs}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, sign }),
      });

      const rawText = await r.text();
      console.log("[TikTokShopOAuth] Resposta raw TikTok:", rawText);
      let data: any;
      try { data = JSON.parse(rawText); } catch {
        return res.redirect(`/tiktok-shop?error=${encodeURIComponent("resposta_invalida: " + rawText.slice(0, 200))}`);
      }

      if (data.code !== 0 || !data.data?.access_token) {
        console.error("[TikTokShopOAuth] Erro na troca de token:", data);
        return res.redirect(`/tiktok-shop?error=${encodeURIComponent(data.message || "token_error")}`);
      }

      const { access_token, refresh_token, open_id } = data.data;

      updateEnvFile({
        TIKTOK_SHOP_ACCESS_TOKEN: access_token || "",
        TIKTOK_SHOP_REFRESH_TOKEN: refresh_token || "",
        TIKTOK_SHOP_ID: open_id || "",
      });

      console.log(`[TikTokShopOAuth] Conta conectada! Open ID: ${open_id}`);
      return res.redirect("/tiktok-shop?connected=1");
    } catch (err: any) {
      console.error("[TikTokShopOAuth] Erro no callback:", err);
      return res.redirect(`/tiktok-shop?error=${encodeURIComponent(err.message || "unknown")}`);
    }
  });

  // ── Status da conexão ───────────────────────────────────────────────────────
  app.get("/api/tiktok-shop/status", (_req, res) => {
    const shopId = process.env.TIKTOK_SHOP_ID;
    const accessToken = process.env.TIKTOK_SHOP_ACCESS_TOKEN;
    const connected = !!(accessToken);
    res.json({ connected, shopId: shopId || null });
  });

  // ── Refresh token ───────────────────────────────────────────────────────────
  app.get("/api/tiktok-shop/refresh", async (_req, res) => {
    const refreshToken = process.env.TIKTOK_SHOP_REFRESH_TOKEN || "";
    if (!refreshToken) {
      return res.status(400).json({ error: "TIKTOK_SHOP_REFRESH_TOKEN não configurado" });
    }

    try {
      const ts = Math.floor(Date.now() / 1000);
      const params: Record<string, string> = {
        app_key: APP_KEY,
        timestamp: String(ts),
        grant_type: "refresh_token",
        refresh_token: refreshToken,
      };
      const sign = tiktokShopSign("/api/v2/token/refresh", params);

      const r = await fetch(`${AUTH_BASE}/api/v2/token/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...params, sign }),
      });
      const data = await r.json();

      if (data.data?.access_token) {
        updateEnvFile({
          TIKTOK_SHOP_ACCESS_TOKEN: data.data.access_token,
          TIKTOK_SHOP_REFRESH_TOKEN: data.data.refresh_token || refreshToken,
        });
        return res.json({ ok: true, access_token: data.data.access_token });
      }
      return res.status(400).json({ ok: false, data });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });
}
