/**
 * TikTok Shop Open API Client
 * Docs: https://partner.tiktokshop.com/docv2/page/6502759c6a0bb702c0f4317b
 *
 * Signing algorithm (per official docs and EcomPHP reference implementation):
 *   1. Collect all query params EXCEPT sign, access_token, x-tts-access-token
 *   2. Sort alphabetically and concat as {key}{value}
 *   3. Prepend the URL path (WITHOUT /api/ prefix — path starts at /authorization/... etc.)
 *   4. For POST requests: append raw JSON body string
 *   5. Wrap with APP_SECRET on both sides: APP_SECRET + content + APP_SECRET
 *   6. HMAC-SHA256 with APP_SECRET as key, hex output
 *
 * URL path convention:
 *   API_BASE = https://open-api.tiktokglobalshop.com  (no trailing slash)
 *   Endpoint = /authorization/202309/shops            (no /api/ prefix)
 *   Full URL  = API_BASE + /authorization/202309/shops
 *
 * Reference: https://github.com/EcomPHP/tiktokshop-php/blob/master/src/Client.php
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";

const AUTH_BASE = "https://auth.tiktok-shops.com";
// NOTE: No trailing slash — paths must start with /
const API_BASE = "https://open-api.tiktokglobalshop.com";

const APP_KEY = process.env.TIKTOK_SHOP_APP_KEY || process.env.TIKTOK_ADS_APP_ID || "";
const APP_SECRET = process.env.TIKTOK_SHOP_APP_SECRET || process.env.TIKTOK_ADS_SECRET || "";

// ─── Assinatura ───────────────────────────────────────────────────────────────

/**
 * @param apiPath  The URL path WITHOUT /api/ prefix, e.g. "/authorization/202309/shops"
 * @param params   Query string params (app_key, timestamp, shop_cipher, etc.)
 * @param body     Raw JSON body string for POST requests (empty string for GET)
 */
export function tiktokShopSign(
  apiPath: string,
  params: Record<string, string>,
  body = ""
): string {
  // Step 1: exclude sign, access_token, x-tts-access-token
  const filtered = Object.entries(params).filter(
    ([k]) => k !== "sign" && k !== "access_token" && k !== "x-tts-access-token"
  );

  // Step 2: sort alphabetically and concat as {key}{value}
  const sorted = filtered
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}${v}`)
    .join("");

  // Step 3+4: path + sorted params + body (for POST)
  const inner = `${apiPath}${sorted}${body}`;

  // Step 5: wrap with APP_SECRET on BOTH sides
  const toSign = `${APP_SECRET}${inner}${APP_SECRET}`;

  // Step 6: HMAC-SHA256
  return crypto.createHmac("sha256", APP_SECRET).update(toSign).digest("hex");
}

// ─── URL Builder ──────────────────────────────────────────────────────────────

/**
 * Builds a signed TikTok Shop API URL.
 * @param apiPath   Path WITHOUT /api/ prefix, e.g. "/authorization/202309/shops"
 * @param extraParams  Additional query params (shop_cipher, page_size, etc.)
 * @param body      Raw JSON body string for POST (used in sign only, not in URL)
 */
export function tiktokShopUrl(
  apiPath: string,
  extraParams: Record<string, string> = {},
  body = ""
): string {
  const ts = Math.floor(Date.now() / 1000);

  const params: Record<string, string> = {
    app_key: APP_KEY,
    timestamp: String(ts),
    ...extraParams,
  };

  const sign = tiktokShopSign(apiPath, params, body);

  const urlParams = new URLSearchParams({ ...params, sign });

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
  // Paths WITHOUT /api/ prefix — that's the correct TikTok Shop path format.
  // The /api/ prefix is what causes error 36009009 "Invalid path".
  const paths = [
    "/authorization/202309/shops",
    "/authorization/202312/shops",
  ];
  const accessToken = process.env.TIKTOK_SHOP_ACCESS_TOKEN || "";
  const headers = { "x-tts-access-token": accessToken };
  console.log(`[TikTokShopAPI] access_token[0..20]: ${accessToken.slice(0, 20)}`);
  for (const apiPath of paths) {
    try {
      const url = tiktokShopUrl(apiPath, {});
      console.log(`[TikTokShopAPI] Chamando: ${url.replace(/sign=[^&]+/, "sign=***")}`);
      const res = await fetch(url, { headers });
      const body = await res.json();
      console.log(`[TikTokShopAPI] ${apiPath} → ${JSON.stringify(body).slice(0, 150)}`);
      const shops: any[] = body?.data?.shops || body?.data?.list || [];
      if (!shops.length) continue;
      const cipher = shops[0].cipher || shops[0].shop_cipher || "";
      const shopId = shops[0].id || shops[0].shop_id || "";
      if (cipher) process.env.TIKTOK_SHOP_CIPHER = cipher;
      if (shopId) process.env.TIKTOK_SHOP_ID = shopId;
      console.log(`[TikTokShopAPI] Shop cipher: ${cipher}, shop_id: ${shopId}`);
      return cipher;
    } catch (e: any) {
      console.warn(`[TikTokShopAPI] ${apiPath} falhou:`, e.message);
    }
  }
  console.warn("[TikTokShopAPI] Nenhum path retornou lojas — prosseguindo sem shop_cipher");
  return null;
}

// ─── GET com auto-retry ────────────────────────────────────────────────────────

export async function tiktokShopGet(
  apiPath: string,
  extraParams: Record<string, string> = {}
): Promise<any> {
  const accessToken = process.env.TIKTOK_SHOP_ACCESS_TOKEN || "";
  const shopCipher = process.env.TIKTOK_SHOP_CIPHER || "";
  const params = shopCipher ? { shop_cipher: shopCipher, ...extraParams } : extraParams;
  const headers = { "x-tts-access-token": accessToken };
  const url = tiktokShopUrl(apiPath, params);
  console.log(`[TikTokShopAPI] GET ${url.replace(/sign=[^&]+/, "sign=***")}`);
  const res = await fetch(url, { headers });
  const body = await res.json();

  if (body?.code === 4000000 || body?.code === 4001000) {
    console.warn("[TikTokShopAPI] Token inválido, renovando...");
    const ok = await refreshAccessToken();
    if (ok) {
      const newAccessToken = process.env.TIKTOK_SHOP_ACCESS_TOKEN || "";
      const url2 = tiktokShopUrl(apiPath, extraParams);
      const res2 = await fetch(url2, { headers: { "x-tts-access-token": newAccessToken } });
      return res2.json();
    }
  }

  return body;
}

// ─── POST com auto-retry ───────────────────────────────────────────────────────

export async function tiktokShopPost(
  apiPath: string,
  extraParams: Record<string, string> = {},
  body: Record<string, any> = {}
): Promise<any> {
  const accessToken = process.env.TIKTOK_SHOP_ACCESS_TOKEN || "";
  const shopCipher = process.env.TIKTOK_SHOP_CIPHER || "";
  const params = shopCipher ? { shop_cipher: shopCipher, ...extraParams } : extraParams;
  const bodyStr = JSON.stringify(body);
  // POST: pass raw body string so it's included in the HMAC signature
  const url = tiktokShopUrl(apiPath, params, bodyStr);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-tts-access-token": accessToken,
    },
    body: bodyStr,
  });
  return res.json();
}

// ─── OAuth URL ────────────────────────────────────────────────────────────────

export function tiktokShopAuthUrl(state = "tiktok_shop"): string {
  const redirectUrl = process.env.TIKTOK_SHOP_REDIRECT_URL ||
    "https://feminnita.com.br/tiktok-callback";

  const params = new URLSearchParams({
    app_key: APP_KEY,
    state,
    redirect_uri: redirectUrl,
  });

  return `${AUTH_BASE}/oauth/authorize?${params.toString()}`;
}
