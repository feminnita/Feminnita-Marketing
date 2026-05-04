/**
 * Shopee API Client — Autenticação HMAC-SHA256 + auto-refresh de token
 */

import crypto from "crypto";
import fs from "fs";
import path from "path";

const BASE_URL = "https://partner.shopeemobile.com";
const PARTNER_ID = parseInt(process.env.SHOPEE_PARTNER_ID || "0");
const PARTNER_KEY = process.env.SHOPEE_PARTNER_KEY || "";

export function shopeeSign(
  apiPath: string,
  ts: number,
  accessToken?: string,
  shopId?: number
): string {
  let base: string;
  if (accessToken && shopId) {
    base = `${PARTNER_ID}${apiPath}${ts}${accessToken}${shopId}`;
  } else {
    base = `${PARTNER_ID}${apiPath}${ts}`;
  }
  return crypto.createHmac("sha256", PARTNER_KEY).update(base).digest("hex");
}

export function shopeeUrl(
  apiPath: string,
  extraParams: Record<string, string> = {}
): string {
  const ts = Math.floor(Date.now() / 1000);
  const accessToken = process.env.SHOPEE_ACCESS_TOKEN || "";
  const shopId = parseInt(process.env.SHOPEE_SHOP_ID || "0");

  const isShopLevel = !!accessToken && !!shopId;
  const sign = shopeeSign(apiPath, ts, isShopLevel ? accessToken : undefined, isShopLevel ? shopId : undefined);

  const params = new URLSearchParams({
    partner_id: String(PARTNER_ID),
    timestamp: String(ts),
    sign,
    ...extraParams,
  });

  if (isShopLevel) {
    params.set("access_token", accessToken);
    params.set("shop_id", String(shopId));
  }

  return `${BASE_URL}${apiPath}?${params.toString()}`;
}

// ─── Auto-refresh ─────────────────────────────────────────────────────────────

let refreshing = false;

async function refreshAccessToken(): Promise<boolean> {
  if (refreshing) return false;
  refreshing = true;
  try {
    const refreshToken = process.env.SHOPEE_REFRESH_TOKEN || "";
    const shopId = parseInt(process.env.SHOPEE_SHOP_ID || "0");
    if (!refreshToken || !shopId) return false;

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
      process.env.SHOPEE_ACCESS_TOKEN = data.access_token;
      if (data.refresh_token) process.env.SHOPEE_REFRESH_TOKEN = data.refresh_token;

      // Persiste no .env
      const envPath = path.resolve(process.cwd(), ".env");
      try {
        let content = fs.readFileSync(envPath, "utf-8");
        content = content.replace(/^SHOPEE_ACCESS_TOKEN=.*$/m, `SHOPEE_ACCESS_TOKEN=${data.access_token}`);
        if (data.refresh_token) {
          content = content.replace(/^SHOPEE_REFRESH_TOKEN=.*$/m, `SHOPEE_REFRESH_TOKEN=${data.refresh_token}`);
        }
        fs.writeFileSync(envPath, content, "utf-8");
      } catch {}

      console.log("[ShopeeAPI] Token renovado automaticamente");
      return true;
    }
    return false;
  } catch (e) {
    console.error("[ShopeeAPI] Erro ao renovar token:", e);
    return false;
  } finally {
    refreshing = false;
  }
}

// ─── GET com auto-retry após refresh ─────────────────────────────────────────

export async function shopeeGet(
  apiPath: string,
  extraParams: Record<string, string> = {}
): Promise<any> {
  const url = shopeeUrl(apiPath, extraParams);
  const res = await fetch(url);
  const body = await res.json();

  // Token inválido — tenta refresh e retry
  if (res.status === 403 && body?.error === "invalid_acceess_token") {
    console.warn("[ShopeeAPI] Token expirado, renovando...");
    const ok = await refreshAccessToken();
    if (ok) {
      const url2 = shopeeUrl(apiPath, extraParams);
      const res2 = await fetch(url2);
      if (!res2.ok) throw new Error(`Shopee API error ${res2.status} após refresh`);
      return res2.json();
    }
  }

  if (!res.ok) {
    throw new Error(`Shopee API error ${res.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

export async function shopeePost(apiPath: string, body: any): Promise<any> {
  const ts = Math.floor(Date.now() / 1000);
  const sign = shopeeSign(apiPath, ts);

  const url = new URL(`${BASE_URL}${apiPath}`);
  url.searchParams.set("partner_id", String(PARTNER_ID));
  url.searchParams.set("timestamp", String(ts));
  url.searchParams.set("sign", sign);

  const res = await fetch(url.toString(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Shopee API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

/** Requisição autenticada genérica com suporte a conta A/B */
export async function shopeeRequest(
  method: "GET" | "POST",
  apiPath: string,
  body?: Record<string, any>,
  account = "feminnita"
): Promise<any> {
  const ts = Math.floor(Date.now() / 1000);
  const accessToken =
    account === "fnt"
      ? (process.env.SHOPEE_ACCESS_TOKEN_2 || process.env.SHOPEE_ACCESS_TOKEN || "")
      : (process.env.SHOPEE_ACCESS_TOKEN || "");
  const shopId = parseInt(
    account === "fnt"
      ? (process.env.SHOPEE_SHOP_ID_2 || process.env.SHOPEE_SHOP_ID || "0")
      : (process.env.SHOPEE_SHOP_ID || "0")
  );

  const sign = shopeeSign(apiPath, ts, accessToken || undefined, shopId || undefined);
  const params = new URLSearchParams({
    partner_id: String(PARTNER_ID),
    timestamp: String(ts),
    sign,
  });
  if (accessToken) params.set("access_token", accessToken);
  if (shopId) params.set("shop_id", String(shopId));

  const url = `${BASE_URL}${apiPath}?${params.toString()}`;
  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body && method === "POST" ? { body: JSON.stringify(body) } : {}),
  });
  const data = await res.json() as any;
  if (data?.error && data.error !== "") {
    throw new Error(`Shopee ${apiPath}: ${data.message || data.error}`);
  }
  return data;
}

/** Gera URL de autorização OAuth Shopee */
export function shopeeAuthUrl(): string {
  const apiPath = "/api/v2/shop/auth_partner";
  const ts = Math.floor(Date.now() / 1000);
  const sign = shopeeSign(apiPath, ts);
  const redirectUrl = process.env.SHOPEE_REDIRECT_URL || "http://localhost:3000/api/shopee/callback";

  const params = new URLSearchParams({
    partner_id: String(PARTNER_ID),
    timestamp: String(ts),
    sign,
    redirect: redirectUrl,
    cancel_redirect: redirectUrl,
  });

  return `${BASE_URL}${apiPath}?${params.toString()}`;
}
