import type { Express } from "express";
import { trocarCodigoPorToken } from "../integrations/bling-oauth";
import { saveOAuthToken, getOAuthToken } from "../db";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "../../shared/const";
import { getUserById, getDb } from "../db";
import { instagramAccounts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// ─── Instagram Login OAuth helpers ───────────────────────────────────────────

const IG_APP_ID = process.env.META_APP_ID || "";
const IG_APP_SECRET = process.env.META_APP_SECRET || "";

function getInstagramRedirectUri(req: any): string {
  // Use env override if set, otherwise derive from request
  if (process.env.INSTAGRAM_REDIRECT_URI) return process.env.INSTAGRAM_REDIRECT_URI;
  const protocol = req.headers["x-forwarded-proto"] || req.protocol || "https";
  const host = req.headers["x-forwarded-host"] || req.headers.host || "localhost:3000";
  return `${protocol}://${host}/api/instagram/callback`;
}

// ─── OAuth routes ─────────────────────────────────────────────────────────────

export function registerOAuthRoutes(app: Express) {
  /**
   * Instagram Login — inicia o fluxo OAuth via instagram.com
   * URL: /api/instagram/start
   */
  app.get("/api/instagram/start", async (req, res) => {
    const cookie = req.cookies?.[COOKIE_NAME];
    if (!cookie) return res.redirect("/login");

    const redirectUri = getInstagramRedirectUri(req);
    const scopes = [
      "instagram_business_basic",
      "instagram_business_manage_messages",
      "instagram_business_manage_comments",
      "instagram_business_content_publish",
    ].join(",");

    const authUrl = new URL("https://www.instagram.com/oauth/authorize");
    authUrl.searchParams.set("enable_fb_login", "0");
    authUrl.searchParams.set("force_authentication", "1");
    authUrl.searchParams.set("client_id", IG_APP_ID);
    authUrl.searchParams.set("redirect_uri", redirectUri);
    authUrl.searchParams.set("response_type", "code");
    authUrl.searchParams.set("scope", scopes);

    return res.redirect(authUrl.toString());
  });

  /**
   * Instagram Login — callback após autenticação no instagram.com
   * URL: /api/instagram/callback?code=xxx
   */
  app.get("/api/instagram/callback", async (req, res) => {
    const { code, error } = req.query as Record<string, string>;

    if (error || !code) {
      const msg = error || "missing_code";
      return res.redirect(`/analytics?instagram=error&msg=${encodeURIComponent(msg)}`);
    }

    try {
      // Verificar sessão
      const cookie = req.cookies?.[COOKIE_NAME];
      if (!cookie) return res.redirect("/login");
      const payload = await sdk.verifySession(cookie).catch(() => null);
      if (!payload) return res.redirect("/login");
      const user = await getUserById(payload.userId);
      if (!user) return res.redirect("/login");

      const redirectUri = getInstagramRedirectUri(req);

      // Passo 1: código → token de curta duração
      const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: IG_APP_ID,
          client_secret: IG_APP_SECRET,
          grant_type: "authorization_code",
          redirect_uri: redirectUri,
          code,
        }),
      });
      const tokenData = await tokenRes.json() as any;
      if (tokenData.error_type || !tokenData.access_token) {
        throw new Error(tokenData.error_message || "Falha ao trocar código por token");
      }
      const shortToken: string = tokenData.access_token;
      const igUserId: string = String(tokenData.user_id);

      // Passo 2: token curto → token longa duração (60 dias)
      const longRes = await fetch(
        `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${IG_APP_SECRET}&access_token=${shortToken}`
      );
      const longData = await longRes.json() as any;
      const longToken: string = longData.access_token || shortToken;
      const expiresIn: number = longData.expires_in || 5184000; // 60 dias padrão

      // Passo 3: buscar dados do perfil
      const profileRes = await fetch(
        `https://graph.instagram.com/v19.0/me?fields=id,username,name,biography,followers_count,media_count,profile_picture_url&access_token=${longToken}`
      );
      const profile = await profileRes.json() as any;
      const username = profile.username || "feminnita";
      const displayName = profile.name || username;
      const instagramId = profile.id || igUserId;

      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      // Passo 4: salvar ou atualizar no banco
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const existing = await db
        .select({ id: instagramAccounts.id })
        .from(instagramAccounts)
        .where(eq(instagramAccounts.instagramId, instagramId))
        .limit(1);

      if (existing.length > 0) {
        await db.update(instagramAccounts).set({
          accessToken: longToken,
          accessTokenExpiresAt: expiresAt,
          username,
          displayName,
          followers: profile.followers_count || 0,
          postsCount: profile.media_count || 0,
          profilePictureUrl: profile.profile_picture_url || null,
          biography: profile.biography || null,
          isActive: true,
          updatedAt: new Date(),
        }).where(eq(instagramAccounts.instagramId, instagramId));
      } else {
        await db.insert(instagramAccounts).values({
          accountType: "feminnita",
          instagramId,
          username,
          displayName,
          accessToken: longToken,
          accessTokenExpiresAt: expiresAt,
          followers: profile.followers_count || 0,
          postsCount: profile.media_count || 0,
          profilePictureUrl: profile.profile_picture_url || null,
          biography: profile.biography || null,
          isActive: true,
          isVerified: false,
        });
      }

      console.log(`[Instagram OAuth] @${username} conectado com sucesso (token válido por 60 dias)`);
      return res.redirect("/analytics?instagram=connected");
    } catch (err: any) {
      console.error("[Instagram OAuth callback]", err);
      return res.redirect(`/analytics?instagram=error&msg=${encodeURIComponent(err?.message ?? "unknown")}`);
    }
  });

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
