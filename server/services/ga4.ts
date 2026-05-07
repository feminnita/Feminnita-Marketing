import { getDb } from "../db";
import { oauthTokens } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const TOKEN_URL = "https://oauth2.googleapis.com/token";

export function getGA4AuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_GA4_CLIENT_ID!,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/analytics.readonly",
    access_type: "offline",
    prompt: "consent",
    state,
  });
  return `https://accounts.google.com/o/oauth2/auth?${params}`;
}

export async function exchangeGA4Code(code: string, redirectUri: string) {
  const body = new URLSearchParams({
    code,
    client_id: process.env.GOOGLE_GA4_CLIENT_ID!,
    client_secret: process.env.GOOGLE_GA4_CLIENT_SECRET!,
    redirect_uri: redirectUri,
    grant_type: "authorization_code",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) return null;
  const data = await res.json() as Record<string, unknown>;
  return {
    accessToken: data.access_token as string,
    refreshToken: data.refresh_token as string | undefined,
    expiresIn: (data.expires_in as number) ?? 3600,
  };
}

async function refreshGA4Token(userId: number, tokenId: number, refreshToken: string): Promise<string | null> {
  const body = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: process.env.GOOGLE_GA4_CLIENT_ID!,
    client_secret: process.env.GOOGLE_GA4_CLIENT_SECRET!,
    grant_type: "refresh_token",
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!res.ok) return null;
  const data = await res.json() as Record<string, unknown>;
  const accessToken = data.access_token as string;
  const expiresIn = (data.expires_in as number) ?? 3600;
  const expiresAt = new Date(Date.now() + expiresIn * 1000);
  const db = await getDb();
  if (db) {
    await db.update(oauthTokens)
      .set({ accessToken, expiresAt })
      .where(eq(oauthTokens.id, tokenId));
  }
  return accessToken;
}

export async function getValidGA4Token(userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(oauthTokens)
    .where(and(
      eq(oauthTokens.userId, userId),
      eq(oauthTokens.plataforma, "google_analytics"),
      eq(oauthTokens.isActive, true),
    ))
    .limit(1);
  if (rows.length === 0) return null;
  const token = rows[0];
  const expiredOrSoon = token.expiresAt && token.expiresAt.getTime() - 300_000 < Date.now();
  if (expiredOrSoon) {
    if (!token.refreshToken) return null;
    return refreshGA4Token(userId, token.id, token.refreshToken);
  }
  return token.accessToken;
}

export async function runGA4Report(accessToken: string, propertyId: string, body: object) {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GA4 API error ${res.status}: ${err}`);
  }
  return res.json();
}

export async function getGA4Realtime(accessToken: string, propertyId: string): Promise<number> {
  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runRealtimeReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ metrics: [{ name: "activeUsers" }] }),
    }
  );
  if (!res.ok) return 0;
  const data = await res.json() as Record<string, unknown>;
  const rows = data.rows as Array<{ metricValues: Array<{ value: string }> }> | undefined;
  return parseInt(rows?.[0]?.metricValues?.[0]?.value ?? "0");
}
