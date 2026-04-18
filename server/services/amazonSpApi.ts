/**
 * Amazon Selling Partner API (SP-API) Client
 *
 * Autenticação: LWA (Login with Amazon) + AWS SigV4
 * Marketplace Brasil: A2Q3Y263D00KWC
 * Endpoint NA: https://sellingpartnerapi-na.amazon.com
 *
 * NOTA: Requer credenciais AWS IAM (AMAZON_AWS_ACCESS_KEY + AMAZON_AWS_SECRET_KEY)
 * para assinar requests com SigV4. Sem elas, o agente funciona em modo planejamento.
 */

import crypto from "crypto";

const LWA_URL = "https://api.amazon.com/auth/o2/token";
const SP_API_BASE = "https://sellingpartnerapi-na.amazon.com";
const SANDBOX_BASE = "https://sandbox.sellingpartnerapi-na.amazon.com";
export const MARKETPLACE_ID = "A2Q3Y263D00KWC"; // Brasil

let cachedAccessToken: string | null = null;
let tokenExpiresAt = 0;

// ─── LWA Token ────────────────────────────────────────────────────────────────

export async function getLwaAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedAccessToken;
  }

  const r = await fetch(LWA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: process.env.AMAZON_REFRESH_TOKEN || "",
      client_id: process.env.AMAZON_ADS_CLIENT_ID || "",
      client_secret: process.env.AMAZON_ADS_CLIENT_SECRET || "",
    }),
  });

  const data = await r.json();
  if (!data.access_token) {
    throw new Error(`LWA token error: ${JSON.stringify(data)}`);
  }

  cachedAccessToken = data.access_token;
  tokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
  return data.access_token;
}

// ─── SigV4 ────────────────────────────────────────────────────────────────────

function hmacSha256(key: Buffer | string, data: string): Buffer {
  return crypto.createHmac("sha256", key).update(data, "utf8").digest();
}

function sha256Hex(data: string): string {
  return crypto.createHash("sha256").update(data, "utf8").digest("hex");
}

function getSigningKey(secretKey: string, dateStamp: string, region: string, service: string): Buffer {
  const kDate = hmacSha256(`AWS4${secretKey}`, dateStamp);
  const kRegion = hmacSha256(kDate, region);
  const kService = hmacSha256(kRegion, service);
  return hmacSha256(kService, "aws4_request");
}

export function signRequest(
  method: string,
  path: string,
  queryParams: Record<string, string>,
  headers: Record<string, string>,
  body: string,
  accessKeyId: string,
  secretAccessKey: string,
  region = "us-east-1",
  service = "execute-api"
): Record<string, string> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "").slice(0, 15) + "Z";
  const dateStamp = amzDate.slice(0, 8);

  const host = SP_API_BASE.replace("https://", "");

  const allHeaders: Record<string, string> = {
    ...headers,
    host,
    "x-amz-date": amzDate,
  };

  const sortedHeaderKeys = Object.keys(allHeaders).sort();
  const canonicalHeaders = sortedHeaderKeys.map((k) => `${k.toLowerCase()}:${allHeaders[k].trim()}`).join("\n") + "\n";
  const signedHeaders = sortedHeaderKeys.map((k) => k.toLowerCase()).join(";");

  const sortedQuery = Object.entries(queryParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const canonicalRequest = [
    method,
    path,
    sortedQuery,
    canonicalHeaders,
    signedHeaders,
    sha256Hex(body),
  ].join("\n");

  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");

  const signingKey = getSigningKey(secretAccessKey, dateStamp, region, service);
  const signature = hmacSha256(signingKey, stringToSign).toString("hex");

  return {
    ...allHeaders,
    Authorization: `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
}

// ─── SP-API GET ───────────────────────────────────────────────────────────────

export async function spApiGet(
  path: string,
  queryParams: Record<string, string> = {}
): Promise<any> {
  const accessKeyId = process.env.AMAZON_AWS_ACCESS_KEY || "";
  const secretAccessKey = process.env.AMAZON_AWS_SECRET_KEY || "";
  const lwaToken = await getLwaAccessToken();

  const baseHeaders: Record<string, string> = {
    "x-amz-access-token": lwaToken,
    "content-type": "application/json",
  };

  let finalHeaders: Record<string, string>;

  if (accessKeyId && secretAccessKey) {
    finalHeaders = signRequest("GET", path, queryParams, baseHeaders, "", accessKeyId, secretAccessKey);
  } else {
    // Sem SigV4 — tentativa direta (funciona apenas com IAM role de confiança)
    finalHeaders = baseHeaders;
  }

  const queryString = Object.entries(queryParams)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");

  const url = `${SP_API_BASE}${path}${queryString ? "?" + queryString : ""}`;
  const res = await fetch(url, { headers: finalHeaders });
  return res.json();
}

export function isConnected(): boolean {
  return !!(process.env.AMAZON_REFRESH_TOKEN);
}

export function hasAwsCredentials(): boolean {
  return !!(process.env.AMAZON_AWS_ACCESS_KEY && process.env.AMAZON_AWS_SECRET_KEY);
}
