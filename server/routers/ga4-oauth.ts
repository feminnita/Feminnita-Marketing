import type { Express } from "express";
import { sdk } from "../_core/sdk";
import { getGA4AuthUrl, exchangeGA4Code } from "../services/ga4";
import { getDb } from "../db";
import { oauthTokens } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const APP_URL = process.env.APP_URL || "http://localhost:3001";
const REDIRECT_URI = `${APP_URL}/api/ga4/callback`;

export function registerGA4OAuthRoutes(app: Express) {
  app.get("/api/ga4/start", async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req);
      const state = Buffer.from(String(user.id)).toString("base64url");
      res.redirect(getGA4AuthUrl(REDIRECT_URI, state));
    } catch {
      res.redirect("/ga4?error=auth");
    }
  });

  app.get("/api/ga4/callback", async (req, res) => {
    try {
      const { code, state, error } = req.query as Record<string, string>;

      if (error) {
        console.error("[GA4 OAuth] Google error:", error);
        return res.redirect(`/ga4?error=${error}`);
      }
      if (!code || !state) return res.redirect("/ga4?error=missing_params");

      const userId = parseInt(Buffer.from(state, "base64url").toString());
      if (!userId || isNaN(userId)) return res.redirect("/ga4?error=invalid_state");

      const tokens = await exchangeGA4Code(code, REDIRECT_URI);
      if (!tokens) return res.redirect("/ga4?error=exchange_failed");

      const db = await getDb();
      if (!db) return res.redirect("/ga4?error=db_unavailable");

      const existing = await db.select({ id: oauthTokens.id, accountInfo: oauthTokens.accountInfo })
        .from(oauthTokens)
        .where(and(eq(oauthTokens.userId, userId), eq(oauthTokens.plataforma, "google_analytics")))
        .limit(1);

      const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);

      if (existing.length > 0) {
        await db.update(oauthTokens).set({
          accessToken: tokens.accessToken,
          ...(tokens.refreshToken ? { refreshToken: tokens.refreshToken } : {}),
          expiresAt,
          isActive: true,
        }).where(eq(oauthTokens.id, existing[0].id));
      } else {
        if (!tokens.refreshToken) {
          console.error("[GA4 OAuth] No refresh token received");
          return res.redirect("/ga4?error=no_refresh_token");
        }
        await db.insert(oauthTokens).values({
          userId,
          plataforma: "google_analytics",
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresAt,
          scope: "https://www.googleapis.com/auth/analytics.readonly",
          isActive: true,
          accountInfo: JSON.stringify({}),
        });
      }

      console.log(`[GA4 OAuth] Usuário ${userId} conectado com sucesso`);
      res.redirect("/ga4?connected=1");
    } catch (err) {
      console.error("[GA4 OAuth] Callback error:", err);
      res.redirect("/ga4?error=server");
    }
  });
}
