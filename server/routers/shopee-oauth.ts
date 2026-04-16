/**
 * Shopee OAuth REST routes
 * GET /api/shopee/start    — inicia fluxo OAuth
 * GET /api/shopee/callback — troca code por tokens, salva no .env
 * GET /api/shopee/status   — retorna { connected, shopId }
 */

import type { Express } from "express";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import { shopeeAuthUrl, shopeeSign } from "../services/shopeeApi";

const PARTNER_ID = parseInt(process.env.SHOPEE_PARTNER_ID || "0");
const PARTNER_KEY = process.env.SHOPEE_PARTNER_KEY || "";
const BASE_URL = "https://partner.shopeemobile.com";

function updateEnvFile(updates: Record<string, string>): void {
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
    // Atualiza process.env em tempo real também
    process.env[key] = value;
  }

  fs.writeFileSync(envPath, content, "utf-8");
}

export function registerShopeeOAuthRoutes(app: Express): void {
  // ── Inicia fluxo OAuth ──────────────────────────────────────────────────────
  app.get("/api/shopee/start", (_req, res) => {
    const authUrl = shopeeAuthUrl();
    res.redirect(authUrl);
  });

  // ── Callback: troca code por tokens ────────────────────────────────────────
  app.get("/api/shopee/callback", async (req, res) => {
    const { code, shop_id } = req.query as Record<string, string>;

    if (!code || !shop_id) {
      return res.redirect("/shopee-ads?error=missing_params");
    }

    try {
      const path_ = "/api/v2/auth/token/get";
      const ts = Math.floor(Date.now() / 1000);
      const sign = shopeeSign(path_, ts);

      const url = new URL(`${BASE_URL}${path_}`);
      url.searchParams.set("partner_id", String(PARTNER_ID));
      url.searchParams.set("timestamp", String(ts));
      url.searchParams.set("sign", sign);

      const tokenRes = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          shop_id: parseInt(shop_id),
          partner_id: PARTNER_ID,
        }),
      });

      const data = (await tokenRes.json()) as any;

      if (data.error) {
        console.error("[ShopeeOAuth] Erro na troca de token:", data);
        return res.redirect(`/shopee-ads?error=${encodeURIComponent(data.error)}`);
      }

      const { access_token, refresh_token, shop_id: returnedShopId } = data;

      updateEnvFile({
        SHOPEE_SHOP_ID: String(returnedShopId || shop_id),
        SHOPEE_ACCESS_TOKEN: access_token || "",
        SHOPEE_REFRESH_TOKEN: refresh_token || "",
      });

      console.log(`[ShopeeOAuth] Conta conectada! Shop ID: ${returnedShopId || shop_id}`);
      return res.redirect("/shopee-ads?connected=1");
    } catch (err: any) {
      console.error("[ShopeeOAuth] Erro no callback:", err);
      return res.redirect(`/shopee-ads?error=${encodeURIComponent(err.message || "unknown")}`);
    }
  });

  // ── Status da conexão ───────────────────────────────────────────────────────
  app.get("/api/shopee/status", (_req, res) => {
    const shopId = process.env.SHOPEE_SHOP_ID;
    const accessToken = process.env.SHOPEE_ACCESS_TOKEN;
    const connected = !!(shopId && accessToken);
    res.json({ connected, shopId: shopId || null });
  });
}
