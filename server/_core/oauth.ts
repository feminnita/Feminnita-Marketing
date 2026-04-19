import type { Express } from "express";
import { trocarCodigoPorToken } from "../integrations/bling-oauth";
import { saveOAuthToken, getOAuthToken } from "../db";
import { sdk } from "./sdk";
import { COOKIE_NAME } from "../../shared/const";
import { getUserById, getDb } from "../db";
import { instagramAccounts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

// ─── Debug endpoint ──────────────────────────────────────────────────────────

export async function registerDebugRoutes(app: Express) {
  app.get("/api/debug/ig-test", async (_req, res) => {
    try {
      const db = await getDb();
      if (!db) return res.json({ error: "DB não conectado" });
      const [account] = await db.select().from(instagramAccounts).where(eq(instagramAccounts.id, 60001)).limit(1);
      if (!account) return res.json({ error: "Conta 60001 não encontrada" });
      const token = account.accessToken;
      const meRes = await fetch(`https://graph.instagram.com/v19.0/me?fields=id,username,followers_count&access_token=${token}`);
      const meData = await meRes.json();
      const mediaRes = await fetch(`https://graph.instagram.com/v19.0/me/media?fields=id,caption,media_type&limit=3&access_token=${token}`);
      const mediaData = await mediaRes.json();
      return res.json({ tokenPrefix: token.slice(0, 10), meData, mediaData });
    } catch (err: any) {
      return res.json({ error: err.message });
    }
  });

  /**
   * GET /api/instagram/posts-data?accountId=60001&limit=24
   * Busca posts reais do Instagram via Graph API (usa graph.instagram.com para tokens IGAAX)
   */
  app.get("/api/instagram/posts-data", async (req, res) => {
    // Endpoint de leitura — posts do Instagram são dados públicos, não requer sessão

    try {
      const { accountId, limit = "24" } = req.query as Record<string, string>;
      const db = await getDb();
      if (!db) return res.json({ posts: [], error: "DB indisponível" });

      const where = accountId
        ? eq(instagramAccounts.id, parseInt(accountId))
        : eq(instagramAccounts.accountType, "feminnita" as any);

      const [account] = await db.select().from(instagramAccounts).where(where).limit(1);
      if (!account) return res.json({ posts: [], error: "Conta não encontrada" });

      const token = account.accessToken;

      // Tokens IGAAX/IGQ/IGD → graph.instagram.com  |  EAA → graph.facebook.com
      const isIgToken = token.startsWith("IGAAX") || token.startsWith("IGQ") || token.startsWith("IGD") || token.startsWith("IG");
      const apiBase = isIgToken ? "https://graph.instagram.com/v19.0" : "https://graph.facebook.com/v19.0";
      const mediaEndpoint = isIgToken ? `${apiBase}/me/media` : `${apiBase}/${account.instagramId}/media`;

      const url = `${mediaEndpoint}?fields=id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink&limit=${limit}&access_token=${token}`;
      const mediaRes = await fetch(url);
      const mediaData = await mediaRes.json() as any;

      if (mediaData.error) {
        return res.json({ posts: [], error: mediaData.error.message });
      }

      const basePosts = (mediaData.data || []).map((p: any) => ({
        id: p.id,
        caption: (p.caption || "").slice(0, 150),
        mediaType: p.media_type,
        mediaUrl: p.media_url || p.thumbnail_url || null,
        publishedAt: p.timestamp,
        likes: p.like_count || 0,
        comments: p.comments_count || 0,
        permalink: p.permalink || null,
        reach: 0,
        impressions: 0,
      }));

      // Buscar insights por post em paralelo (reach, impressions)
      // Requer instagram_manage_insights — falha silenciosamente se sem permissão
      const posts = await Promise.all(
        basePosts.map(async (post) => {
          try {
            const insightsUrl = isIgToken
              ? `https://graph.instagram.com/v20.0/${post.id}/insights?metric=reach,impressions&access_token=${token}`
              : `https://graph.facebook.com/v20.0/${post.id}/insights?metric=reach,impressions&access_token=${token}`;
            const insRes = await fetch(insightsUrl);
            const insData = await insRes.json() as any;
            if (insData?.data) {
              for (const m of insData.data) {
                if (m.name === "reach") post.reach = m.values?.[0]?.value || 0;
                if (m.name === "impressions") post.impressions = m.values?.[0]?.value || 0;
              }
            }
          } catch (_) {}
          return post;
        })
      );

      // Também retorna dados do perfil (followers)
      const profileRes = await fetch(`${apiBase}/me?fields=id,username,followers_count,media_count&access_token=${token}`);
      const profile = await profileRes.json() as any;

      return res.json({
        posts,
        error: null,
        profile: profile.error ? null : {
          id: profile.id,
          username: profile.username,
          followers: profile.followers_count || account.followers,
          postsCount: profile.media_count || account.postsCount,
        },
      });
    } catch (err: any) {
      console.error("[/api/instagram/posts-data]", err);
      return res.json({ posts: [], error: err.message });
    }
  });
}

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
   * Diagnóstico de conexão Instagram — verifica env vars, token, e API
   * URL: GET /api/instagram/diagnostic
   */
  app.get("/api/instagram/diagnostic", async (req, res) => {
    const cookie = req.cookies?.[COOKIE_NAME];
    if (!cookie) return res.status(401).json({ error: "Não autenticado" });

    const report: Record<string, any> = {
      env: {
        META_APP_ID:     IG_APP_ID ? `${IG_APP_ID.slice(0, 6)}...` : "❌ NÃO CONFIGURADO",
        META_APP_SECRET: IG_APP_SECRET ? "✅ configurado" : "❌ NÃO CONFIGURADO",
        META_PAGE_ID:    process.env.META_PAGE_ID || "❌ NÃO CONFIGURADO",
        META_ACCESS_TOKEN: process.env.META_ACCESS_TOKEN ? "✅ presente" : "❌ NÃO CONFIGURADO",
        META_INSTAGRAM_ACCOUNT_ID: process.env.META_INSTAGRAM_ACCOUNT_ID || "não configurado",
        INSTAGRAM_REDIRECT_URI: process.env.INSTAGRAM_REDIRECT_URI || `derivado: /api/instagram/callback`,
        instagramLoginReady: !!(IG_APP_ID && IG_APP_SECRET),
      },
      api: {} as Record<string, any>,
    };

    const token = process.env.META_ACCESS_TOKEN;
    if (token) {
      // Teste 1: /me
      try {
        const r = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${encodeURIComponent(token)}`);
        const d = await r.json() as any;
        report.api.me = d.error ? `❌ ${d.error.message}` : `✅ User ID ${d.id} (${d.name})`;
      } catch (e: any) { report.api.me = `❌ erro: ${e.message}`; }

      // Teste 2: /me/accounts (Páginas)
      try {
        const r = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name,instagram_business_account,connected_instagram_account&access_token=${encodeURIComponent(token)}`);
        const d = await r.json() as any;
        if (d.error) {
          report.api.pages = `❌ ${d.error.message}`;
        } else {
          const pages = d.data || [];
          report.api.pages = pages.map((p: any) => ({
            nome: p.name,
            id: p.id,
            instagram_business_account: p.instagram_business_account?.id || "❌ não vinculada",
            connected_instagram_account: p.connected_instagram_account?.id || "não presente",
          }));
        }
      } catch (e: any) { report.api.pages = `❌ erro: ${e.message}`; }

      // Teste 3: /{META_PAGE_ID} direto
      if (process.env.META_PAGE_ID) {
        try {
          const r = await fetch(`https://graph.facebook.com/v19.0/${process.env.META_PAGE_ID}?fields=id,name,instagram_business_account,connected_instagram_account&access_token=${encodeURIComponent(token)}`);
          const d = await r.json() as any;
          if (d.error) {
            report.api.pageById = `❌ ${d.error.message}`;
          } else {
            report.api.pageById = {
              nome: d.name,
              instagram_business_account: d.instagram_business_account?.id || "❌ NÃO RETORNADO — conta não vinculada como Business",
              connected_instagram_account: d.connected_instagram_account?.id || "não presente",
            };
          }
        } catch (e: any) { report.api.pageById = `❌ erro: ${e.message}`; }
      }

      // Teste 4: page_backed_instagram_accounts (cross-post "shadow accounts")
      if (process.env.META_PAGE_ID) {
        try {
          const r = await fetch(`https://graph.facebook.com/v19.0/${process.env.META_PAGE_ID}/page_backed_instagram_accounts?access_token=${encodeURIComponent(token)}`);
          const d = await r.json() as any;
          if (d.error) {
            report.api.pageBacked = `❌ ${d.error.message}`;
          } else {
            const accounts = d.data || [];
            report.api.pageBacked = accounts.length > 0
              ? accounts.map((a: any) => ({ id: a.id, username: a.username || "N/A" }))
              : "nenhuma conta cross-post encontrada";
          }
        } catch (e: any) { report.api.pageBacked = `❌ erro: ${e.message}`; }
      }
    } else {
      report.api.note = "META_ACCESS_TOKEN não configurado — testes de API ignorados";
    }

    report.diagnostico = {
      causa: [] as string[],
      solucao: [] as string[],
    };

    if (!IG_APP_ID || !IG_APP_SECRET) {
      report.diagnostico.causa.push("META_APP_ID e/ou META_APP_SECRET não configurados no .env");
      report.diagnostico.solucao.push("Adicione ao .env: META_APP_ID=<seu_app_id> e META_APP_SECRET=<seu_app_secret> do app Meta (developers.facebook.com)");
    }

    const pagesResult = report.api.pages;
    if (Array.isArray(pagesResult)) {
      const naoVinculadas = pagesResult.filter((p: any) => p.instagram_business_account === "❌ não vinculada");
      if (naoVinculadas.length > 0) {
        report.diagnostico.causa.push(`Página(s) sem instagram_business_account: ${naoVinculadas.map((p: any) => p.nome).join(", ")}`);
        report.diagnostico.solucao.push("No Facebook: Configurações da Página → Instagram → Conectar conta → faça login com @feminnita");
        report.diagnostico.solucao.push("OU: business.facebook.com → Configurações → Contas → Contas do Instagram → Adicionar");
        report.diagnostico.solucao.push("Certifique-se que @feminnita está em modo Profissional (Criador ou Empresa) no app do Instagram");
      }
    }

    return res.json(report);
  });

  /**
   * Instagram Login — inicia o fluxo OAuth via instagram.com
   * URL: /api/instagram/start
   */
  app.get("/api/instagram/start", async (req, res) => {
    const cookie = req.cookies?.[COOKIE_NAME];
    if (!cookie) return res.redirect("/login");

    // Validar que META_APP_ID está configurado antes de redirecionar
    if (!IG_APP_ID) {
      const msg = encodeURIComponent(
        "META_APP_ID não configurado no servidor. " +
        "Adicione META_APP_ID=<id_do_app> ao .env e reinicie o servidor. " +
        "Encontre o ID em developers.facebook.com → seu app → Configurações Básicas → ID do Aplicativo."
      );
      return res.redirect(`/analytics?instagram=error&msg=${msg}`);
    }
    if (!IG_APP_SECRET) {
      const msg = encodeURIComponent(
        "META_APP_SECRET não configurado no servidor. " +
        "Adicione META_APP_SECRET=<secret> ao .env e reinicie o servidor."
      );
      return res.redirect(`/analytics?instagram=error&msg=${msg}`);
    }

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
   * Instagram — salvar token manual (gerado no Meta Developer portal)
   * POST /api/instagram/manual-token  { token: "IGAAX..." }
   */
  app.post("/api/instagram/manual-token", async (req, res) => {
    const cookie = req.cookies?.[COOKIE_NAME];
    if (!cookie) return res.status(401).json({ error: "Não autenticado" });

    const { token } = req.body as { token?: string };
    if (!token || token.trim().length < 20) {
      return res.status(400).json({ error: "Token inválido" });
    }

    try {
      const accessToken = token.trim();

      // Buscar perfil via Graph API
      const profileRes = await fetch(
        `https://graph.instagram.com/v19.0/me?fields=id,username,name,biography,followers_count,media_count,profile_picture_url&access_token=${encodeURIComponent(accessToken)}`
      );
      const profile = await profileRes.json() as any;

      if (profile.error) {
        return res.status(400).json({ error: `Graph API: ${profile.error.message}` });
      }

      const instagramId = String(profile.id);
      const username = profile.username || "feminnita";
      const displayName = profile.name || username;

      // Token gerado pelo portal já é longa duração (60 dias) — calcular expiração
      const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

      const db = await getDb();
      if (!db) return res.status(500).json({ error: "Banco indisponível" });

      const existing = await db
        .select({ id: instagramAccounts.id })
        .from(instagramAccounts)
        .where(eq(instagramAccounts.instagramId, instagramId))
        .limit(1);

      if (existing.length > 0) {
        await db.update(instagramAccounts).set({
          accessToken,
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
          accessToken,
          accessTokenExpiresAt: expiresAt,
          followers: profile.followers_count || 0,
          postsCount: profile.media_count || 0,
          profilePictureUrl: profile.profile_picture_url || null,
          biography: profile.biography || null,
          isActive: true,
          isVerified: false,
        });
      }

      console.log(`[Instagram Manual Token] @${username} (${instagramId}) salvo com sucesso`);
      return res.json({
        ok: true,
        username,
        instagramId,
        followers: profile.followers_count,
        postsCount: profile.media_count,
      });
    } catch (err: any) {
      console.error("[Instagram Manual Token]", err);
      return res.status(500).json({ error: err?.message ?? "Erro desconhecido" });
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
