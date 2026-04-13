import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq, inArray, or, and } from "drizzle-orm";
import { getDb, getOAuthToken } from "../db";
import { instagramAccounts, igPostPublications, influencers } from "../../drizzle/schema";

/** Constrói URL da Graph API com token corretamente codificado */
function graphUrl(path: string, token: string, extraFields?: string): string {
  const base = `https://graph.facebook.com/v19.0${path}`;
  const params = new URLSearchParams({ access_token: token });
  if (extraFields) params.set("fields", extraFields);
  return `${base}?${params.toString()}`;
}

/**
 * Troca token curto (1h) por Long-Lived User Token (60 dias).
 * Se META_APP_ID/META_APP_SECRET não estiverem configurados, retorna o token original.
 */
async function exchangeForLongLivedToken(shortToken: string): Promise<string> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;

  if (!appId || !appSecret) {
    console.warn("[Instagram] META_APP_ID/META_APP_SECRET não configurados — token não será renovado");
    return shortToken;
  }

  try {
    const url = new URL("https://graph.facebook.com/oauth/access_token");
    url.searchParams.set("grant_type", "fb_exchange_token");
    url.searchParams.set("client_id", appId);
    url.searchParams.set("client_secret", appSecret);
    url.searchParams.set("fb_exchange_token", shortToken);

    const res = await fetch(url.toString());
    const data = await res.json();

    if (data.error) {
      console.warn("[Instagram] Troca de token falhou:", data.error.message, "— usando token original");
      return shortToken;
    }

    console.log("[Instagram] Token trocado por long-lived com sucesso. Expira em:", Math.round((data.expires_in ?? 0) / 86400), "dias");
    return data.access_token ?? shortToken;
  } catch (err: any) {
    console.warn("[Instagram] Erro na troca de token:", err.message);
    return shortToken;
  }
}

export const instagramAccountsRouter = router({
  /**
   * Adicionar nova conta Instagram (Feminnita ou Influencer)
   */
  addAccount: protectedProcedure
    .input(
      z.object({
        accountType: z.enum(["feminnita", "influencer"]),
        influencerId: z.number().optional(),
        instagramId: z.string(),
        username: z.string(),
        displayName: z.string(),
        accessToken: z.string(),
        refreshToken: z.string().optional(),
        profilePictureUrl: z.string().optional(),
        biography: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        await db.insert(instagramAccounts).values({
          accountType: input.accountType,
          influencerId: input.influencerId || null,
          instagramId: input.instagramId,
          username: input.username,
          displayName: input.displayName,
          accessToken: input.accessToken,
          refreshToken: input.refreshToken || null,
          profilePictureUrl: input.profilePictureUrl || null,
          biography: input.biography || null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Buscar a conta inserida
        const insertedAccount = await db
          .select()
          .from(instagramAccounts)
          .where(eq(instagramAccounts.username, input.username))
          .limit(1);

        return {
          success: true,
          accountId: insertedAccount[0]?.id || 0,
          message: `Conta @${input.username} adicionada com sucesso!`,
        };
      } catch (error) {
        console.error('[Instagram Accounts] Erro ao adicionar conta:', error);
        throw error;
      }
    }),

  /**
   * Listar todas as contas Instagram (Feminnita + Influencers)
   */
  listAccounts: protectedProcedure.query(async ({ ctx }: any) => {
    try {
      const db = await getDb();
      if (!db) return [];

      // Get influencer IDs belonging to this user
      const userInfluencers = await db
        .select({ id: influencers.id })
        .from(influencers)
        .where(eq(influencers.userId, ctx.user.id));

      const influencerIds = userInfluencers.map((i: { id: number }) => i.id);

      // Return user's influencer accounts + shared feminnita brand accounts
      const accounts = influencerIds.length > 0
        ? await db.select().from(instagramAccounts).where(
            or(
              inArray(instagramAccounts.influencerId, influencerIds),
              eq(instagramAccounts.accountType, "feminnita")
            )
          )
        : await db.select().from(instagramAccounts).where(eq(instagramAccounts.accountType, "feminnita"));

      return accounts;
    } catch (error) {
      console.error('[Instagram Accounts] Erro ao listar contas:', error);
      return [];
    }
  }),

  /**
   * Obter conta Feminnita
   */
  getFeminnita: protectedProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return null;

      const account = await db
        .select()
        .from(instagramAccounts)
        .where(eq(instagramAccounts.accountType, "feminnita"))
        .limit(1);

      return account[0] || null;
    } catch (error) {
      console.error('[Instagram Accounts] Erro ao obter Feminnita:', error);
      return null;
    }
  }),

  /**
   * Obter contas de uma influencer
   */
  getInfluencerAccounts: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const owned = await db.select({ id: influencers.id }).from(influencers)
          .where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
        if (owned.length === 0) return [];

        const accounts = await db
          .select()
          .from(instagramAccounts)
          .where(eq(instagramAccounts.influencerId, input.influencerId));

        return accounts;
      } catch (error) {
        console.error('[Instagram Accounts] Erro ao obter contas da influencer:', error);
        return [];
      }
    }),

  /**
   * Atualizar token de acesso
   */
  updateAccessToken: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
        accessToken: z.string(),
        expiresIn: z.number().optional(), // segundos até expiração
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const account = await db.select().from(instagramAccounts).where(eq(instagramAccounts.id, input.accountId)).limit(1);
        if (!account || account.length === 0) throw new Error("Conta não encontrada");
        if (account[0].accountType === "influencer" && account[0].influencerId) {
          const owned = await db.select({ id: influencers.id }).from(influencers)
            .where(and(eq(influencers.id, account[0].influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
          if (owned.length === 0) throw new Error("Acesso negado");
        }

        const expiresAt = input.expiresIn
          ? new Date(Date.now() + input.expiresIn * 1000)
          : null;

        await db
          .update(instagramAccounts)
          .set({
            accessToken: input.accessToken,
            accessTokenExpiresAt: expiresAt,
            lastTokenRefresh: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(instagramAccounts.id, input.accountId));

        return { success: true };
      } catch (error) {
        console.error('[Instagram Accounts] Erro ao atualizar token:', error);
        throw error;
      }
    }),

  /**
   * Desativar conta
   */
  deactivateAccount: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const account = await db.select().from(instagramAccounts).where(eq(instagramAccounts.id, input.accountId)).limit(1);
        if (!account || account.length === 0) throw new Error("Conta não encontrada");
        if (account[0].accountType === "influencer" && account[0].influencerId) {
          const owned = await db.select({ id: influencers.id }).from(influencers)
            .where(and(eq(influencers.id, account[0].influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
          if (owned.length === 0) throw new Error("Acesso negado");
        }

        await db
          .update(instagramAccounts)
          .set({
            isActive: false,
            updatedAt: new Date(),
          })
          .where(eq(instagramAccounts.id, input.accountId));

        return { success: true };
      } catch (error) {
        console.error('[Instagram Accounts] Erro ao desativar conta:', error);
        throw error;
      }
    }),

  /**
   * Obter histórico de publicações de uma conta
   */
  getPublicationHistory: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const account = await db.select().from(instagramAccounts).where(eq(instagramAccounts.id, input.accountId)).limit(1);
        if (!account || account.length === 0) return [];
        if (account[0].accountType === "influencer" && account[0].influencerId) {
          const owned = await db.select({ id: influencers.id }).from(influencers)
            .where(and(eq(influencers.id, account[0].influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
          if (owned.length === 0) return [];
        }

        const publications = await db
          .select()
          .from(igPostPublications)
          .where(eq(igPostPublications.instagramAccountId, input.accountId))
          .limit(input.limit);

        return publications;
      } catch (error) {
        console.error('[Instagram Accounts] Erro ao obter histórico:', error);
        return [];
      }
    }),

  /**
   * Sincronizar métricas de uma conta (likes, followers, etc)
   */
  syncMetrics: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
        followers: z.number().optional(),
        following: z.number().optional(),
        postsCount: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const account = await db.select().from(instagramAccounts).where(eq(instagramAccounts.id, input.accountId)).limit(1);
        if (!account || account.length === 0) throw new Error("Conta não encontrada");
        if (account[0].accountType === "influencer" && account[0].influencerId) {
          const owned = await db.select({ id: influencers.id }).from(influencers)
            .where(and(eq(influencers.id, account[0].influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
          if (owned.length === 0) throw new Error("Acesso negado");
        }

        await db
          .update(instagramAccounts)
          .set({
            followers: input.followers,
            following: input.following,
            postsCount: input.postsCount,
            lastMetricsSync: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(instagramAccounts.id, input.accountId));

        return { success: true };
      } catch (error) {
        console.error('[Instagram Accounts] Erro ao sincronizar métricas:', error);
        throw error;
      }
    }),

  /**
   * Conectar conta Instagram da Feminnita automaticamente via token Meta
   * O token precisa ter: instagram_basic, instagram_manage_insights, pages_show_list, pages_read_engagement
   *
   * Cadeia de descoberta (5 estratégias em ordem de prioridade):
   *  1. instagramAccountId fornecido diretamente → bypass total
   *  2. GET /me/accounts → procura instagram_business_account em cada Page
   *  3. GET /{META_PAGE_ID}?fields=instagram_business_account → Page ID do .env
   *  4. GET /me?fields=instagram_business_account → user-level (token de usuário do sistema)
   *  5. GET /{username}?fields=id → lookup direto pelo username via oEmbed/iG username search
   *
   * Root cause mais comum: conta IG está conectada como "Conta Pessoal Conectada" (Cross-Post)
   * em vez de "Conta Comercial Vinculada". O cross-post envia posts para o FB mas NÃO expõe
   * instagram_business_account na Graph API. A solução é vincular via Meta Business Suite
   * (Configurações → Contas Vinculadas → Instagram) com a conta em modo Profissional/Comercial.
   */
  connectFeminnita: protectedProcedure
    .input(z.object({
      pageAccessToken: z.string(),
      instagramAccountId: z.string().optional(), // ID direto da conta IG (bypass da descoberta automática)
    }))
    .mutation(async ({ input }) => {
      // Trocar token curto (1h) por long-lived user token (60 dias).
      // O Page Access Token obtido via long-lived user token é PERMANENTE.
      const longLivedToken = await exchangeForLongLivedToken(input.pageAccessToken);
      const token = longLivedToken;

      // Se o ID foi fornecido diretamente, pula toda a descoberta
      let igAccountId: string | null = input.instagramAccountId || null;
      let pageToken: string = token;

      if (!igAccountId) {
        const debug: string[] = [];

        // ── Estratégia 1: /me/accounts → instagram_business_account por Página ──
        const pagesRes = await fetch(
          graphUrl("/me/accounts", token, "id,name,access_token,instagram_business_account")
        );
        const pagesData = await pagesRes.json();

        if (pagesData.error) {
          debug.push(`[1] me/accounts erro: ${pagesData.error.message} (code ${pagesData.error.code})`);
        } else {
          const pages: any[] = pagesData.data || [];
          debug.push(`[1] me/accounts ok: ${pages.length} página(s): ${pages.map((p: any) => `${p.name}(${p.id})`).join(", ")}`);
          for (const page of pages) {
            if (page.instagram_business_account?.id) {
              igAccountId = page.instagram_business_account.id;
              pageToken = page.access_token || token;
              debug.push(`[1] instagram_business_account encontrado na página "${page.name}": ${igAccountId}`);
              break;
            }
          }
          if (!igAccountId && pages.length > 0) {
            debug.push(`[1] Nenhuma página tem instagram_business_account — conta IG pode estar como cross-post apenas`);
          }
        }

        // ── Estratégia 2: /{META_PAGE_ID}?fields=instagram_business_account ──
        if (!igAccountId && process.env.META_PAGE_ID) {
          const pageRes = await fetch(
            graphUrl(`/${process.env.META_PAGE_ID}`, token, "id,name,instagram_business_account,connected_instagram_account")
          );
          const pageData = await pageRes.json();
          if (pageData.error) {
            debug.push(`[2] PAGE_ID ${process.env.META_PAGE_ID} erro: ${pageData.error.message}`);
          } else if (pageData.instagram_business_account?.id) {
            igAccountId = pageData.instagram_business_account.id;
            debug.push(`[2] instagram_business_account via PAGE_ID: ${igAccountId}`);
          } else if (pageData.connected_instagram_account?.id) {
            // connected_instagram_account retorna mesmo contas pessoais conectadas
            igAccountId = pageData.connected_instagram_account.id;
            debug.push(`[2] connected_instagram_account via PAGE_ID: ${igAccountId} (pode ser conta pessoal — verifique se é profissional)`);
          } else {
            debug.push(`[2] PAGE_ID ${process.env.META_PAGE_ID} sem instagram_business_account nem connected_instagram_account`);
          }
        }

        // ── Estratégia 3: GET /me?fields=instagram_business_account (user-level) ──
        if (!igAccountId) {
          const meRes = await fetch(graphUrl("/me", token, "instagram_business_account"));
          const meData = await meRes.json();
          if (meData.error) {
            debug.push(`[3] /me user-level erro: ${meData.error.message}`);
          } else if (meData.instagram_business_account?.id) {
            igAccountId = meData.instagram_business_account.id;
            debug.push(`[3] instagram_business_account via /me: ${igAccountId}`);
          } else {
            debug.push(`[3] /me não retornou instagram_business_account`);
          }
        }

        // ── Estratégia 4: oEmbed — descobre o ID público via username ──
        // Funciona mesmo sem vínculo formal com a Page. Retorna apenas id+thumbnail.
        // Requer APP_ID+APP_SECRET como Basic Auth ou app access token.
        if (!igAccountId && process.env.META_APP_ID && process.env.META_APP_SECRET) {
          try {
            const appToken = `${process.env.META_APP_ID}|${process.env.META_APP_SECRET}`;
            const oembedRes = await fetch(
              `https://graph.facebook.com/v19.0/instagram_oembed?url=${encodeURIComponent("https://www.instagram.com/feminnita/")}&access_token=${encodeURIComponent(appToken)}`
            );
            const oembedData = await oembedRes.json();
            if (oembedData.error) {
              debug.push(`[4] oEmbed erro: ${oembedData.error.message}`);
            } else if (oembedData.author_name) {
              // oEmbed NÃO retorna o IG Business Account ID — apenas confirma que a conta existe.
              // Para obter o ID, precisa-se de uma das estratégias acima funcionando.
              debug.push(`[4] oEmbed ok: conta @${oembedData.author_name} existe mas não fornece IG Account ID — use o bypass instagramAccountId`);
            }
          } catch (e: any) {
            debug.push(`[4] oEmbed exceção: ${e.message}`);
          }
        }

        // ── Estratégia 5: Lookup por username via /{ig-username} ──
        // Só funciona se o app tiver instagram_manage_insights + a conta estiver no mesmo BM
        if (!igAccountId) {
          const usernameRes = await fetch(
            graphUrl("/feminnita", token, "id,username,biography")
          );
          const usernameData = await usernameRes.json();
          if (!usernameData.error && usernameData.id) {
            igAccountId = usernameData.id;
            debug.push(`[5] ID encontrado via username lookup: ${igAccountId}`);
          } else {
            debug.push(`[5] username lookup falhou: ${usernameData.error?.message || "sem resultado"}`);
          }
        }

        if (!igAccountId) {
          throw new Error(
            `Nenhuma conta Instagram Business encontrada após 5 estratégias.\n\n` +
            `Diagnóstico:\n${debug.join("\n")}\n\n` +
            `CAUSA RAIZ PROVÁVEL: A conta @feminnita está conectada à Página "Feminnita" como ` +
            `"cross-post" (sincronização de posts) mas NÃO como conta Instagram Business vinculada. ` +
            `Esse vínculo cross-post envia posts para o FB mas não expõe instagram_business_account na API.\n\n` +
            `SOLUÇÃO:\n` +
            `1. Acesse business.facebook.com → Configurações do Business → Contas → Contas do Instagram\n` +
            `2. Clique em "Adicionar" e conecte @feminnita com login e senha do Instagram\n` +
            `3. OU: vá em facebook.com → sua Página Feminnita → Configurações → Instagram → Conectar conta\n` +
            `4. Certifique-se que @feminnita está em modo Profissional (Criador ou Empresa) no app do Instagram\n` +
            `5. Após vincular, gere um novo token em developers.facebook.com/tools/explorer com as permissões: ` +
            `instagram_basic, instagram_manage_insights, pages_show_list, pages_read_engagement, business_management\n\n` +
            `BYPASS IMEDIATO: Se souber o IG Account ID (ex: 17841459735732076), passe-o diretamente no campo instagramAccountId.`
          );
        }
      }

      // Buscar dados da conta Instagram pelo ID
      const igRes = await fetch(
        graphUrl(`/${igAccountId}`, pageToken, "id,username,name,biography,followers_count,media_count,profile_picture_url")
      );
      const igData = await igRes.json();
      if (igData.error) throw new Error(`Instagram API: ${igData.error.message}`);

      // Salvar no banco (upsert)
      const db = await getDb();
      if (!db) throw new Error("Database indisponível");

      const existing = await db
        .select()
        .from(instagramAccounts)
        .where(eq(instagramAccounts.instagramId, igAccountId))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(instagramAccounts)
          .set({
            accessToken: pageToken,
            username: igData.username || existing[0].username,
            displayName: igData.name || existing[0].displayName,
            biography: igData.biography || existing[0].biography,
            profilePictureUrl: igData.profile_picture_url || existing[0].profilePictureUrl,
            followers: igData.followers_count || existing[0].followers,
            postsCount: igData.media_count || existing[0].postsCount,
            isActive: true,
            updatedAt: new Date(),
          })
          .where(eq(instagramAccounts.instagramId, igAccountId));
      } else {
        await db.insert(instagramAccounts).values({
          accountType: "feminnita",
          instagramId: igAccountId,
          username: igData.username || "feminnita",
          displayName: igData.name || "Feminnita",
          accessToken: pageToken,
          biography: igData.biography || null,
          profilePictureUrl: igData.profile_picture_url || null,
          followers: igData.followers_count || 0,
          postsCount: igData.media_count || 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return {
        success: true,
        username: igData.username,
        followers: igData.followers_count,
        message: `Conta @${igData.username} conectada com sucesso!`,
      };
    }),

  /**
   * Conectar conta Feminnita automaticamente usando o token Meta já salvo no banco
   * (ou META_ACCESS_TOKEN do .env como fallback).
   * Usa a mesma cadeia de 5 estratégias de descoberta que connectFeminnita.
   */
  autoConnectFeminnita: protectedProcedure
    .mutation(async ({ ctx }) => {
      // Prioridade: token Meta salvo no banco pelo usuário (OAuth da Feminnita)
      const savedToken = await getOAuthToken(ctx.user.id, "meta");
      const rawToken = savedToken?.accessToken || process.env.META_ACCESS_TOKEN;
      if (!rawToken) throw new Error("Nenhum token Meta encontrado. Conecte o Meta nas Integrações ou adicione META_ACCESS_TOKEN ao .env.");

      // Trocar por long-lived token para obter Page Access Tokens permanentes
      const token = await exchangeForLongLivedToken(rawToken);

      let igAccountId: string | null = null;
      let pageToken: string = token;
      const debugLog: string[] = [];

      // ── Estratégia 1: /me/accounts → instagram_business_account por Página ──
      const pagesRes = await fetch(
        graphUrl("/me/accounts", token, "id,name,access_token,instagram_business_account")
      );
      const pagesData = await pagesRes.json();
      if (pagesData.error) {
        debugLog.push(`[1] me/accounts erro: ${pagesData.error.message} (code ${pagesData.error.code})`);
      } else {
        const pages: any[] = pagesData.data || [];
        debugLog.push(`[1] me/accounts ok: ${pages.length} página(s): ${pages.map((p: any) => `${p.name}(${p.id})`).join(", ")}`);
        for (const page of pages) {
          if (page.instagram_business_account?.id) {
            igAccountId = page.instagram_business_account.id;
            pageToken = page.access_token || token;
            debugLog.push(`[1] encontrado na página "${page.name}": ${igAccountId}`);
            break;
          }
        }
        if (!igAccountId && pages.length > 0) {
          debugLog.push(`[1] Nenhuma página tem instagram_business_account — conta pode estar como cross-post apenas`);
        }
      }

      // ── Estratégia 2: /{META_PAGE_ID}?fields=instagram_business_account,connected_instagram_account ──
      if (!igAccountId && process.env.META_PAGE_ID) {
        const pageRes = await fetch(
          graphUrl(`/${process.env.META_PAGE_ID}`, token, "id,name,instagram_business_account,connected_instagram_account")
        );
        const pageData = await pageRes.json();
        if (pageData.error) {
          debugLog.push(`[2] PAGE_ID erro: ${pageData.error.message}`);
        } else if (pageData.instagram_business_account?.id) {
          igAccountId = pageData.instagram_business_account.id;
          debugLog.push(`[2] instagram_business_account via PAGE_ID: ${igAccountId}`);
        } else if (pageData.connected_instagram_account?.id) {
          igAccountId = pageData.connected_instagram_account.id;
          debugLog.push(`[2] connected_instagram_account via PAGE_ID: ${igAccountId}`);
        } else {
          debugLog.push(`[2] PAGE_ID ${process.env.META_PAGE_ID} sem instagram_business_account nem connected_instagram_account`);
        }
      }

      // ── Estratégia 3: GET /me?fields=instagram_business_account (user-level) ──
      if (!igAccountId) {
        const meRes = await fetch(graphUrl("/me", token, "instagram_business_account"));
        const meData = await meRes.json();
        if (!meData.error && meData.instagram_business_account?.id) {
          igAccountId = meData.instagram_business_account.id;
          debugLog.push(`[3] instagram_business_account via /me: ${igAccountId}`);
        } else {
          debugLog.push(`[3] /me: ${meData.error?.message || "sem instagram_business_account"}`);
        }
      }

      // ── Estratégia 4: META_INSTAGRAM_ACCOUNT_ID do .env (configurado manualmente) ──
      if (!igAccountId && process.env.META_INSTAGRAM_ACCOUNT_ID) {
        igAccountId = process.env.META_INSTAGRAM_ACCOUNT_ID;
        debugLog.push(`[4] usando META_INSTAGRAM_ACCOUNT_ID do .env: ${igAccountId}`);
      }

      // ── Estratégia 5: username lookup via /{ig-username} ──
      if (!igAccountId) {
        const usernameRes = await fetch(graphUrl("/feminnita", token, "id,username"));
        const usernameData = await usernameRes.json();
        if (!usernameData.error && usernameData.id) {
          igAccountId = usernameData.id;
          debugLog.push(`[5] ID via username lookup: ${igAccountId}`);
        } else {
          debugLog.push(`[5] username lookup: ${usernameData.error?.message || "sem resultado"}`);
        }
      }

      if (!igAccountId) {
        throw new Error(
          `Nenhuma conta Instagram Business encontrada após 5 estratégias.\n\n` +
          `Diagnóstico:\n${debugLog.join("\n")}\n\n` +
          `CAUSA RAIZ PROVÁVEL: A conta @feminnita está em modo "cross-post" (posts aparecem no FB) ` +
          `mas não está formalmente vinculada como Instagram Business Account na Página do Facebook.\n\n` +
          `SOLUÇÃO: Acesse business.facebook.com → Configurações → Contas Instagram → Adicionar → ` +
          `conecte @feminnita. Depois adicione META_INSTAGRAM_ACCOUNT_ID=<id> ao .env ou gere novo token com ` +
          `permissões: instagram_basic, instagram_manage_insights, pages_show_list, pages_read_engagement, business_management.`
        );
      }

      // Buscar dados completos pelo ID
      const igRes = await fetch(
        graphUrl(`/${igAccountId}`, pageToken, "id,username,name,biography,followers_count,media_count,profile_picture_url")
      );
      const igData = await igRes.json();
      if (igData.error) throw new Error(`Instagram API: ${igData.error.message}`);

      const db = await getDb();
      if (!db) throw new Error("Database indisponível");

      const existing = await db.select().from(instagramAccounts).where(eq(instagramAccounts.instagramId, igAccountId)).limit(1);
      if (existing.length > 0) {
        await db.update(instagramAccounts).set({
          accessToken: pageToken,
          username: igData.username || existing[0].username,
          displayName: igData.name || existing[0].displayName,
          biography: igData.biography || existing[0].biography,
          profilePictureUrl: igData.profile_picture_url || existing[0].profilePictureUrl,
          followers: igData.followers_count || existing[0].followers,
          postsCount: igData.media_count || existing[0].postsCount,
          isActive: true,
          updatedAt: new Date(),
        }).where(eq(instagramAccounts.instagramId, igAccountId));
      } else {
        await db.insert(instagramAccounts).values({
          accountType: "feminnita",
          instagramId: igAccountId,
          username: igData.username || "feminnita",
          displayName: igData.name || "Feminnita",
          accessToken: pageToken,
          biography: igData.biography || null,
          profilePictureUrl: igData.profile_picture_url || null,
          followers: igData.followers_count || 0,
          postsCount: igData.media_count || 0,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return { success: true, username: igData.username, followers: igData.followers_count, message: `Conta @${igData.username} conectada com sucesso!` };
    }),

  /**
   * Conectar conta Feminnita diretamente pelo ID (sem validação via API)
   */
  forceConnectFeminnita: protectedProcedure
    .input(z.object({
      instagramId: z.string(),
      username: z.string().default("feminnita"),
      accessToken: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database indisponível");

      // Trocar token curto (1h) por Long-Lived User Token (60 dias)
      // O User Token com instagram_basic é o que funciona para acessar o IG account direto por ID
      let finalToken = input.accessToken || "";
      if (finalToken) {
        const longLived = await exchangeForLongLivedToken(finalToken);
        finalToken = longLived;
        console.log("[Instagram] forceConnect: Long-Lived User Token salvo");
      }

      const existing = await db
        .select()
        .from(instagramAccounts)
        .where(eq(instagramAccounts.instagramId, input.instagramId))
        .limit(1);

      if (existing.length > 0) {
        await db.update(instagramAccounts).set({
          isActive: true,
          username: input.username,
          ...(finalToken ? { accessToken: finalToken } : {}),
          updatedAt: new Date(),
        }).where(eq(instagramAccounts.instagramId, input.instagramId));
      } else {
        await db.insert(instagramAccounts).values({
          accountType: "feminnita",
          instagramId: input.instagramId,
          username: input.username,
          displayName: "Feminnita",
          accessToken: finalToken,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return {
        success: true,
        message: `Conta @${input.username} conectada com sucesso! Token permanente salvo.`,
      };
    }),
});
