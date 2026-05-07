/**
 * Meta OAuth Routes — OAuth 2.0 por usuário (SaaS multi-tenant)
 *
 * GET /api/meta/start    → redireciona para Facebook OAuth
 * GET /api/meta/callback → troca code por token longa duração, salva no banco por userId
 */

import type { Express } from "express";
import { sdk } from "../_core/sdk";
import { getDb } from "../db";
import { oauthTokens } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const APP_URL      = process.env.APP_URL      || "http://localhost:3001";
const APP_ID       = process.env.META_APP_ID  || "";
const APP_SECRET   = process.env.META_APP_SECRET || "";
const REDIRECT_URI = `${APP_URL}/api/meta/callback`;
const GRAPH_URL    = "https://graph.facebook.com/v19.0";

function getAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id:     APP_ID,
    redirect_uri:  REDIRECT_URI,
    response_type: "code",
    scope:         "ads_read,ads_management,business_management",
    state,
  });
  return `https://www.facebook.com/v19.0/dialog/oauth?${params}`;
}

async function exchangeCode(code: string): Promise<{ shortToken: string } | null> {
  const params = new URLSearchParams({
    client_id:     APP_ID,
    client_secret: APP_SECRET,
    redirect_uri:  REDIRECT_URI,
    code,
  });
  const res  = await fetch(`${GRAPH_URL}/oauth/access_token?${params}`);
  const data = await res.json() as Record<string, unknown>;
  if (data.error || !data.access_token) return null;
  return { shortToken: data.access_token as string };
}

async function toLongLivedToken(shortToken: string): Promise<{ token: string; expiresIn: number } | null> {
  const params = new URLSearchParams({
    grant_type:        "fb_exchange_token",
    client_id:         APP_ID,
    client_secret:     APP_SECRET,
    fb_exchange_token: shortToken,
  });
  const res  = await fetch(`${GRAPH_URL}/oauth/access_token?${params}`);
  const data = await res.json() as Record<string, unknown>;
  if (data.error || !data.access_token) return null;
  return {
    token:     data.access_token as string,
    expiresIn: (data.expires_in as number) ?? 5_184_000, // 60 dias
  };
}

export function registerMetaOAuthRoutes(app: Express) {
  /** GET /api/meta/start — inicia fluxo OAuth */
  app.get("/api/meta/start", async (req, res) => {
    try {
      const user  = await sdk.authenticateRequest(req);
      const state = Buffer.from(String(user.id)).toString("base64url");
      res.redirect(getAuthUrl(state));
    } catch {
      res.redirect("/gestor-trafego?error=auth");
    }
  });

  /** GET /api/meta/callback — recebe code, troca por token longa duração, salva no banco */
  app.get("/api/meta/callback", async (req, res) => {
    const { code, state, error } = req.query as Record<string, string>;

    if (error)        return res.redirect(`/gestor-trafego?error=${error}`);
    if (!code || !state) return res.redirect("/gestor-trafego?error=missing_params");

    const userId = parseInt(Buffer.from(state, "base64url").toString());
    if (!userId || isNaN(userId)) return res.redirect("/gestor-trafego?error=invalid_state");

    const short = await exchangeCode(code);
    if (!short)  return res.redirect("/gestor-trafego?error=exchange_failed");

    const long = await toLongLivedToken(short.shortToken);
    if (!long)   return res.redirect("/gestor-trafego?error=long_token_failed");

    const db = await getDb();
    if (!db) return res.redirect("/gestor-trafego?error=db_unavailable");

    const expiresAt = new Date(Date.now() + long.expiresIn * 1000);

    const existing = await db.select({ id: oauthTokens.id, accountInfo: oauthTokens.accountInfo })
      .from(oauthTokens)
      .where(and(eq(oauthTokens.userId, userId), eq(oauthTokens.plataforma, "meta")))
      .limit(1);

    if (existing.length > 0) {
      // Mantém adAccountId já configurado
      const prevInfo = existing[0].accountInfo ? JSON.parse(existing[0].accountInfo) : {};
      await db.update(oauthTokens).set({
        accessToken: long.token,
        expiresAt,
        isActive:    true,
        accountInfo: JSON.stringify(prevInfo),
      }).where(eq(oauthTokens.id, existing[0].id));
    } else {
      await db.insert(oauthTokens).values({
        userId,
        plataforma:   "meta",
        accessToken:  long.token,
        expiresAt,
        isActive:     true,
        accountInfo:  JSON.stringify({}),
      });
    }

    console.log(`[MetaOAuth] Usuário ${userId} conectado com sucesso (expira ${expiresAt.toISOString()})`);
    res.redirect("/gestor-trafego?meta_connected=1");
  });
}
