/**
 * TikTok Login Kit OAuth routes
 * GET /api/tiktok/start?state=<signed>   — inicia fluxo OAuth
 * GET /api/tiktok/callback?code=X&state=Y — troca code por tokens, salva no DB
 */

import type { Express } from "express";
import { createHmac } from "crypto";
import { getDb } from "../db";
import { tiktokConnectedAccounts } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const CLIENT_KEY = () => process.env.TIKTOK_CLIENT_KEY || "";
const CLIENT_SECRET = () => process.env.TIKTOK_CLIENT_SECRET || "";
const AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";

export function signTiktokState(payload: string): string {
  const sig = createHmac("sha256", process.env.JWT_SECRET || "secret")
    .update(payload)
    .digest("hex")
    .slice(0, 16);
  return Buffer.from(`${payload}.${sig}`).toString("base64url");
}

function verifyTiktokState(state: string): { userId: number; accountType: string; label: string } | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf-8");
    const lastDot = decoded.lastIndexOf(".");
    const payload = decoded.slice(0, lastDot);
    const sig = decoded.slice(lastDot + 1);
    const expectedSig = createHmac("sha256", process.env.JWT_SECRET || "secret")
      .update(payload)
      .digest("hex")
      .slice(0, 16);
    if (sig !== expectedSig) return null;
    const parts = payload.split(":");
    const userId = parseInt(parts[0]);
    const accountType = parts[1] || "brand";
    const label = decodeURIComponent(parts.slice(2).join(":"));
    return { userId, accountType, label };
  } catch {
    return null;
  }
}

export function registerTiktokOAuthRoutes(app: Express): void {
  app.get("/api/tiktok/start", (req, res) => {
    const { state } = req.query as Record<string, string>;
    if (!state) return res.status(400).send("State ausente");
    const key = CLIENT_KEY();
    if (!key) return res.status(500).send("TIKTOK_CLIENT_KEY não configurado");

    const redirectUri = (process.env.APP_URL || "http://localhost:3000") + "/api/tiktok/callback";
    const params = new URLSearchParams({
      client_key: key,
      response_type: "code",
      scope: "user.info.basic,video.upload,video.publish",
      redirect_uri: redirectUri,
      state,
    });

    res.redirect(`${AUTH_URL}?${params}`);
  });

  app.get("/api/tiktok/callback", async (req, res) => {
    const { code, state, error } = req.query as Record<string, string>;

    if (error) {
      console.error("[TikTokOAuth] Erro na autorização:", error);
      return res.redirect(`/tiktok-team?tab=accounts&error=${encodeURIComponent(error)}`);
    }

    if (!code || !state) {
      return res.redirect("/tiktok-team?tab=accounts&error=missing_params");
    }

    const decoded = verifyTiktokState(state);
    if (!decoded) {
      return res.redirect("/tiktok-team?tab=accounts&error=invalid_state");
    }

    try {
      const redirectUri = (process.env.APP_URL || "http://localhost:3000") + "/api/tiktok/callback";

      const tokenResp = await fetch(TOKEN_URL, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_key: CLIENT_KEY(),
          client_secret: CLIENT_SECRET(),
          code,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
        }).toString(),
      });

      const tokenData = await tokenResp.json() as any;
      console.log("[TikTokOAuth] Token response:", JSON.stringify({ ...tokenData, access_token: "***", refresh_token: "***" }));

      if (tokenData.error) {
        throw new Error(tokenData.error_description || tokenData.error);
      }

      const { access_token, refresh_token, expires_in, open_id, scope } = tokenData;

      let displayName = "";
      let avatarUrl = "";
      try {
        const userResp = await fetch(`${USER_INFO_URL}?fields=open_id,display_name,avatar_url`, {
          headers: { Authorization: `Bearer ${access_token}` },
        });
        const userData = await userResp.json() as any;
        displayName = userData?.data?.user?.display_name || "";
        avatarUrl = userData?.data?.user?.avatar_url || "";
      } catch (e) {
        console.error("[TikTokOAuth] Erro ao buscar info do usuário:", e);
      }

      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const expiresAt = expires_in ? new Date(Date.now() + expires_in * 1000) : undefined;

      const existing = await db
        .select({ id: tiktokConnectedAccounts.id })
        .from(tiktokConnectedAccounts)
        .where(and(
          eq(tiktokConnectedAccounts.userId, decoded.userId),
          eq(tiktokConnectedAccounts.tiktokOpenId, open_id)
        ));

      if (existing.length > 0) {
        await db.update(tiktokConnectedAccounts).set({
          accessToken: access_token,
          refreshToken: refresh_token || null,
          expiresAt,
          scope: scope || null,
          displayName: displayName || null,
          avatarUrl: avatarUrl || null,
          updatedAt: new Date(),
        }).where(eq(tiktokConnectedAccounts.id, existing[0].id));
      } else {
        await db.insert(tiktokConnectedAccounts).values({
          userId: decoded.userId,
          tiktokOpenId: open_id,
          displayName: displayName || null,
          avatarUrl: avatarUrl || null,
          accountType: (decoded.accountType as "brand" | "influencer"),
          label: decoded.label || null,
          accessToken: access_token,
          refreshToken: refresh_token || null,
          expiresAt,
          scope: scope || null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      console.log(`[TikTokOAuth] Conta conectada: ${displayName || open_id} (userId=${decoded.userId})`);
      res.redirect("/tiktok-team?tab=accounts&connected=1");
    } catch (err: any) {
      console.error("[TikTokOAuth] Erro no callback:", err);
      res.redirect(`/tiktok-team?tab=accounts&error=${encodeURIComponent(err.message || "unknown")}`);
    }
  });
}
