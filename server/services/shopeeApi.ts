/**
 * Shopee API Client — Autenticação HMAC-SHA256 + helpers de requisição
 */

import crypto from "crypto";

const BASE_URL = "https://partner.shopeemobile.com";
const PARTNER_ID = parseInt(process.env.SHOPEE_PARTNER_ID || "0");
const PARTNER_KEY = process.env.SHOPEE_PARTNER_KEY || "";

export function shopeeSign(
  path: string,
  ts: number,
  accessToken?: string,
  shopId?: number
): string {
  let base: string;
  if (accessToken && shopId) {
    // Shop-level API
    base = `${PARTNER_ID}${path}${ts}${accessToken}${shopId}`;
  } else {
    // Public API
    base = `${PARTNER_ID}${path}${ts}`;
  }
  return crypto.createHmac("sha256", PARTNER_KEY).update(base).digest("hex");
}

export function shopeeUrl(
  path: string,
  extraParams: Record<string, string> = {}
): string {
  const ts = Math.floor(Date.now() / 1000);
  const accessToken = process.env.SHOPEE_ACCESS_TOKEN || "";
  const shopId = parseInt(process.env.SHOPEE_SHOP_ID || "0");

  const isShopLevel = !!accessToken && !!shopId;
  const sign = shopeeSign(path, ts, isShopLevel ? accessToken : undefined, isShopLevel ? shopId : undefined);

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

  return `${BASE_URL}${path}?${params.toString()}`;
}

export async function shopeeGet(
  path: string,
  extraParams: Record<string, string> = {}
): Promise<any> {
  const url = shopeeUrl(path, extraParams);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Shopee API error ${res.status}: ${await res.text()}`);
  }
  return res.json();
}

export async function shopeePost(path: string, body: any): Promise<any> {
  const ts = Math.floor(Date.now() / 1000);
  const sign = shopeeSign(path, ts);

  const url = new URL(`${BASE_URL}${path}`);
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

/** Gera URL de autorização OAuth Shopee */
export function shopeeAuthUrl(): string {
  const path = "/api/v2/shop/auth_partner";
  const ts = Math.floor(Date.now() / 1000);
  const sign = shopeeSign(path, ts);
  const redirectUrl = process.env.SHOPEE_REDIRECT_URL || "http://localhost:3001/api/shopee/callback";

  const params = new URLSearchParams({
    partner_id: String(PARTNER_ID),
    timestamp: String(ts),
    sign,
    redirect: redirectUrl,
    cancel_redirect: redirectUrl,
  });

  return `${BASE_URL}${path}?${params.toString()}`;
}
