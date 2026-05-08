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

export async function refreshShopeeToken(): Promise<boolean> {
  const refreshToken = process.env.SHOPEE_REFRESH_TOKEN || "";
  const shopId = parseInt(process.env.SHOPEE_SHOP_ID || "0");
  if (!refreshToken || !shopId) {
    console.warn("[ShopeeOAuth] refresh impossível — token ou shopId ausente");
    return false;
  }
  try {
    const apiPath = "/api/v2/auth/access_token/get";
    const ts = Math.floor(Date.now() / 1000);
    const sign = shopeeSign(apiPath, ts);
    const url = `${BASE_URL}${apiPath}?partner_id=${PARTNER_ID}&timestamp=${ts}&sign=${sign}`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken, shop_id: shopId, partner_id: PARTNER_ID }),
    });
    const data = await r.json() as any;
    if (data.access_token) {
      updateEnvFile({ SHOPEE_ACCESS_TOKEN: data.access_token, SHOPEE_REFRESH_TOKEN: data.refresh_token || refreshToken });
      console.log("[ShopeeOAuth] ✅ Token renovado automaticamente");
      return true;
    }
    console.warn("[ShopeeOAuth] Refresh falhou:", JSON.stringify(data));
    return false;
  } catch (e: any) {
    console.error("[ShopeeOAuth] Erro ao renovar token:", e.message);
    return false;
  }
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

  // ── Refresh token ───────────────────────────────────────────────────────────
  app.get("/api/shopee/refresh", async (_req, res) => {
    const refreshToken = process.env.SHOPEE_REFRESH_TOKEN || "";
    const shopId = parseInt(process.env.SHOPEE_SHOP_ID || "0");
    if (!refreshToken || !shopId) {
      return res.status(400).json({ error: "SHOPEE_REFRESH_TOKEN ou SHOPEE_SHOP_ID não configurados" });
    }

    try {
      const apiPath = "/api/v2/auth/access_token/get";
      const ts = Math.floor(Date.now() / 1000);
      const sign = shopeeSign(apiPath, ts);

      const url = `${BASE_URL}${apiPath}?partner_id=${PARTNER_ID}&timestamp=${ts}&sign=${sign}`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken, shop_id: shopId, partner_id: PARTNER_ID }),
      });
      const data = await r.json();

      if (data.access_token) {
        updateEnvFile({
          SHOPEE_ACCESS_TOKEN: data.access_token,
          SHOPEE_REFRESH_TOKEN: data.refresh_token || refreshToken,
        });
        console.log("[ShopeeOAuth] Token renovado com sucesso");
        return res.json({ ok: true, access_token: data.access_token });
      }
      return res.status(400).json({ ok: false, data });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // ── Debug: testa endpoints disponíveis ──────────────────────────────────────
  app.get("/api/shopee/debug", async (_req, res) => {
    const accessToken = process.env.SHOPEE_ACCESS_TOKEN || "";
    const shopId = parseInt(process.env.SHOPEE_SHOP_ID || "0");
    const rawKey = PARTNER_KEY;
    const strippedKey = PARTNER_KEY.startsWith("shpk") ? PARTNER_KEY.slice(4) : PARTNER_KEY;

    const results: any[] = [];

    for (const key of [rawKey, strippedKey]) {
      const keyLabel = key === rawKey ? "key_with_shpk" : "key_without_shpk";
      const ep = "/api/v2/shop/get_shop_info";
      try {
        const ts = Math.floor(Date.now() / 1000);
        const base = `${PARTNER_ID}${ep}${ts}${accessToken}${shopId}`;
        const sign = crypto.createHmac("sha256", key).update(base).digest("hex");
        const url = `${BASE_URL}${ep}?partner_id=${PARTNER_ID}&timestamp=${ts}&sign=${sign}&access_token=${encodeURIComponent(accessToken)}&shop_id=${shopId}`;
        const r = await fetch(url);
        const data = await r.json();
        results.push({ keyLabel, status: r.status, data });
      } catch (e: any) {
        results.push({ keyLabel, error: e.message });
      }
    }

    // Testa endpoints de Ads com parâmetros reais
    const now2 = Math.floor(Date.now() / 1000);
    const from2 = now2 - 7 * 24 * 60 * 60;
    const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const endDate = new Date().toISOString().slice(0, 10);
    // IDs reais conhecidos para testar endpoints de detalhes
    const sampleCampaignIds = "16002685,16338932,16475088";

    const tests = [
      { ep: "/api/v2/ads/get_total_balance", extra: `` },
      { ep: "/api/v2/ads/get_shop_toggle_info", extra: `` },
      { ep: "/api/v2/ads/get_product_level_campaign_id_list", extra: `&page_size=10&page=1` },
      { ep: "/api/v2/ads/get_all_cpc_ads_daily_performance", extra: `&start_date=${startDate}&end_date=${endDate}` },
      { ep: "/api/v2/ads/get_product_level_campaign", extra: `&campaign_id_list=${sampleCampaignIds}` },
      { ep: "/api/v2/ads/get_product_campaign_daily_performance", extra: `&campaign_id_list=${sampleCampaignIds}&start_date=${startDate}&end_date=${endDate}` },
    ];
    for (const t of tests) {
      try {
        const ts = Math.floor(Date.now() / 1000);
        const base = `${PARTNER_ID}${t.ep}${ts}${accessToken}${shopId}`;
        const sign = crypto.createHmac("sha256", rawKey).update(base).digest("hex");
        const url = `${BASE_URL}${t.ep}?partner_id=${PARTNER_ID}&timestamp=${ts}&sign=${sign}&access_token=${encodeURIComponent(accessToken)}&shop_id=${shopId}${t.extra}`;
        const r = await fetch(url);
        const data = await r.json();
        results.push({ endpoint: t.ep, status: r.status, data });
      } catch (e: any) {
        results.push({ endpoint: t.ep, error: (e as any).message });
      }
    }

    res.json({ accessToken: accessToken.slice(0, 8) + "...", shopId, results });
  });
}
