import type { Express } from "express";
import { trocarCodigoPorToken } from "../integrations/bling-oauth";
import { saveOAuthToken, getOAuthToken } from "../db";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "../../shared/const";
import { getUserById } from "../db";

export function registerOAuthRoutes(app: Express) {
  /**
   * Bling OAuth callback — Bling redirects here after user authorizes.
   * URL: /api/bling/callback?code=xxx&state=xxx
   */
  app.get("/api/bling/callback", async (req, res) => {
    const { code, error } = req.query as Record<string, string>;

    if (error) {
      return res.redirect("/?bling=error&msg=" + encodeURIComponent(error));
    }
    if (!code) {
      return res.redirect("/?bling=error&msg=missing_code");
    }

    try {
      // Identify user from session cookie
      const cookie = req.cookies?.[COOKIE_NAME];
      if (!cookie) {
        return res.redirect("/login?next=/bling-connect");
      }
      const payload = await sdk.verifySession(cookie).catch(() => null);
      if (!payload) {
        return res.redirect("/login?next=/bling-connect");
      }
      const user = await getUserById(payload.userId);
      if (!user) {
        return res.redirect("/login");
      }

      // Exchange code for token
      const token = await trocarCodigoPorToken(code);

      // Save to DB
      await saveOAuthToken(user.id, "bling", {
        accessToken: token.access_token,
        refreshToken: token.refresh_token,
        expiresIn: token.expires_in,
        scope: token.scope,
      });

      return res.redirect("/?tab=automacao-bling&bling=connected");
    } catch (err: any) {
      console.error("[Bling OAuth callback]", err);
      return res.redirect("/?bling=error&msg=" + encodeURIComponent(err?.message ?? "unknown"));
    }
  });
}
