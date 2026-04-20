/**
 * TikTok Shop Open API Client
 * Docs: https://partner.tiktokshop.com/docv2/page/6502759c6a0bb702c0f4317b
 *
 * Signing: HMAC-SHA256(app_secret, app_secret + path + sorted_params + body)
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";

const AUTH_BASE = "https://auth.tiktok-shops.com";
const API_BASE = "https://open-api.tiktokglobalshop.com";

const APP_KEY = process.env.TIKTOK_SHOP_APP_KEY || process.env.TIKTOK_ADS_APP_ID || "";
const APP_SECRET = process.env.TIKTOK_SHOP_APP_SECRET || process.env.TIKTOK_ADS_SECRET || "";

// ─── Assinatura ───────────────────────────────────────────────────────────────

export function tiktokShopSign(
  apiPath: string,
  params: Record<string, string>,
  body = ""
): string {
  // Sort params alphabetically (exclude sign and access_token)
  const sorted = Object.entries(params)
    .filter(([k]) => k !== "sign" && k !== "access_token")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}${v}`)
    .join("");

  const toSign = `${APP_SECRET}${apiPath}${sorted}${body}`;
  return crypto.createHmac("sha256", APP_SECRET).update(toSign).digest("hex");
}

// ─── URL Builder ──────────────────────────────────────────────────────────────

export function tiktokShopUrl(
  apiPath: string,
  extraParams: Record<string, string> = {},
  body = ""
): string {
  const ts = Math.floor(Date.now() / 1000);
  const accessToken = process.env.TIKTOK_SHOP_ACCESS_TOKEN || "";

  const params: Record<string, string> = {
    app_key: APP_KEY,
    timestamp: String(ts),
    ...extraParams,
  };

  const sign = tiktokShopSign(apiPath, params, body);

  const urlParams = new URLSearchParams({
    ...params,
    sign,
    ...(accessToken ? { access_token: accessToken } : {}),
  });

  return `${API_BASE}${apiPath}?${urlParams.toString()}`;
}

// ─── Auto-refresh ─────────────────────────────────────────────────────────────

let refreshing = false;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshing) return false;
  refreshing = true;
  try {
    const refreshToken = process.env.TIKTOK_SHOP_REFRESH_TOKEN || "";
    if (!refreshToken) return false;

    const ts = Math.floor(Date.now() / 1000);
    const params: Record<string, string> = {
      app_key: APP_KEY,
      timestamp: String(ts),
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    };
    const sign = tiktokShopSign("/api/v2/token/refresh", params);

    const url = `${AUTH_BASE}/api/v2/token/refresh`;
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...params, sign }),
    });
    const data = await r.json();

    if (data.data?.access_token) {
      process.env.TIKTOK_SHOP_ACCESS_TOKEN = data.data.access_token;
      if (data.data.refresh_token) {
        process.env.TIKTOK_SHOP_REFRESH_TOKEN = data.data.refresh_token;
      }

      // Persist to .env
      const envPath = path.resolve(process.cwd(), ".env");
      try {
        let content = fs.readFileSync(envPath, "utf-8");
        const updateEnv = (key: string, val: string) => {
          if (new RegExp(`^${key}=`, "m").test(content)) {
            content = content.replace(new RegExp(`^${key}=.*$`, "m"), `${key}=${val}`);
          } else {
            content += `\n${key}=${val}`;
          }
        };
        updateEnv("TIKTOK_SHOP_ACCESS_TOKEN", data.data.access_token);
        if (data.data.refresh_token) updateEnv("TIKTOK_SHOP_REFRESH_TOKEN", data.data.refresh_token);
        fs.writeFileSync(envPath, content, "utf-8");
      } catch {}

      console.log("[TikTokShopAPI] Token renovado automaticamente");
      return true;
    }
    return false;
  } catch (e) {
    console.error("[TikTokShopAPI] Erro ao renovar token:", e);
    return false;
  } finally {
    refreshing = false;
  }
}

// ─── GET autorizado com shop_cipher ───────────────────────────────────────────

export async function fetchAndStoreShopCipher(): Promise<string | null> {
  try {
    const url = tiktokShopUrl("/api/authorization/202309/shops", {});
    const res = await fetch(url);
    const body = await res.json();
    const shops: any[] = body?.data?.shops || body?.data?.list || [];
    if (!shops.length) {
      console.warn("[TikTokShopAPI] Nenhuma loja encontrada:", JSON.stringify(body).slice(0, 200));
      return null;
    }
    const cipher = shops[0].cipher || shops[0].shop_cipher || "";
    const shopId = shops[0].id || shops[0].shop_id || "";
    if (cipher) process.env.TIKTOK_SHOP_CIPHER = cipher;
    if (shopId) process.env.TIKTOK_SHOP_ID = shopId;
    console.log(`[TikTokShopAPI] Shop cipher: ${cipher}, shop_id: ${shopId}`);
    return cipher;
  } catch (e) {
    console.error("[TikTokShopAPI] Erro ao buscar lojas:", e);
    return null;
  }
}

// ─── GET com auto-retry ────────────────────────────────────────────────────────

export async function tiktokShopGet(
  apiPath: string,
  extraParams: Record<string, string> = {}
): Promise<any> {
  const shopCipher = process.env.TIKTOK_SHOP_CIPHER || "";
  const params = shopCipher ? { shop_cipher: shopCipher, ...extraParams } : extraParams;
  const url = tiktokShopUrl(apiPath, params);
  const res = await fetch(url);
  const body = await res.json();

  if (body?.code === 4000000 || body?.code === 4001000) {
    console.warn("[TikTokShopAPI] Token inválido, renovando...");
    const ok = await refreshAccessToken();
    if (ok) {
      const url2 = tiktokShopUrl(apiPath, extraParams);
      const res2 = await fetch(url2);
      return res2.json();
    }
  }

  return body;
}

// ─── OAuth URL ────────────────────────────────────────────────────────────────

export function tiktokShopAuthUrl(state = "tiktok_shop"): string {
  const redirectUrl = process.env.TIKTOK_SHOP_REDIRECT_URL ||
    "http://localhost:3000/api/tiktok-shop/callback";

  const params = new URLSearchParams({
    app_key: APP_KEY,
    state,
    redirect_uri: redirectUrl,
  });

  return `${AUTH_BASE}/oauth/authorize?${params.toString()}`;
}
