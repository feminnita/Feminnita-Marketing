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

        // 1. Buscar páginas acessíveis pelo token
        const pagesRes = await fetch(
          graphUrl("/me/accounts", token, "id,name,access_token,instagram_business_account")
        );
        const pagesData = await pagesRes.json();

        if (pagesData.error) {
          debug.push(`me/accounts: ${pagesData.error.message} (code ${pagesData.error.code})`);
        } else {
          const pages: any[] = pagesData.data || [];
          debug.push(`me/accounts ok: ${pages.length} página(s)`);
          for (const page of pages) {
            if (page.instagram_business_account?.id) {
              igAccountId = page.instagram_business_account.id;
              pageToken = page.access_token || token;
              break;
            }
          }
          if (!igAccountId && pages.length > 0) {
            debug.push(`Páginas encontradas: ${pages.map((p: any) => p.name).join(", ")} — nenhuma com Instagram Business vinculado`);
          }
        }

        // 2. Tenta pelo Page ID configurado no servidor
        if (!igAccountId && process.env.META_PAGE_ID) {
          const pageRes = await fetch(
            graphUrl(`/${process.env.META_PAGE_ID}`, token, "instagram_business_account")
          );
          const pageData = await pageRes.json();
          if (pageData.error) {
            debug.push(`PAGE_ID ${process.env.META_PAGE_ID}: ${pageData.error.message}`);
          } else if (pageData.instagram_business_account?.id) {
            igAccountId = pageData.instagram_business_account.id;
          } else {
            debug.push(`PAGE_ID ${process.env.META_PAGE_ID} não tem instagram_business_account`);
          }
        }

        if (!igAccountId) {
          throw new Error(
            `Nenhuma conta Instagram Business encontrada.\n\nDiagnóstico:\n${debug.join("\n")}\n\nVerifique: (1) o token tem permissões instagram_basic + pages_read_engagement, (2) a Página do Facebook tem conta Instagram Business vinculada nas configurações do Meta Business Suite.`
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
   * (ou META_ACCESS_TOKEN do .env como fallback)
   */
  autoConnectFeminnita: protectedProcedure
    .mutation(async ({ ctx }) => {
      // 1. Prioridade: token Meta salvo no banco pelo usuário (OAuth da Feminnita)
      const savedToken = await getOAuthToken(ctx.user.id, "meta");
      const rawToken = savedToken?.accessToken || process.env.META_ACCESS_TOKEN;
      if (!rawToken) throw new Error("Nenhum token Meta encontrado. Conecte o Meta nas Integrações ou adicione META_ACCESS_TOKEN ao .env.");

      // Trocar por long-lived token para obter Page Access Tokens permanentes
      const token = await exchangeForLongLivedToken(rawToken);

      let igAccountId: string | null = null;
      let pageToken: string = token;
      const debugLog: string[] = [];

      // 1. Tentar via páginas da conta (me/accounts)
      const pagesRes = await fetch(
        graphUrl("/me/accounts", token, "id,name,access_token,instagram_business_account")
      );
      const pagesData = await pagesRes.json();
      if (pagesData.error) {
        debugLog.push(`me/accounts erro: ${pagesData.error.message} (code ${pagesData.error.code})`);
      } else {
        const pages: any[] = pagesData.data || [];
        debugLog.push(`me/accounts ok: ${pages.length} página(s)`);
        for (const page of pages) {
          if (page.instagram_business_account?.id) {
            igAccountId = page.instagram_business_account.id;
            pageToken = page.access_token || token;
            debugLog.push(`Instagram encontrado via página "${page.name}": ${igAccountId}`);
            break;
          }
        }
        if (!igAccountId && pages.length > 0) {
          debugLog.push(`Páginas encontradas mas nenhuma tem instagram_business_account vinculado`);
        }
      }

      // 2. Tentar via META_PAGE_ID configurado
      if (!igAccountId && process.env.META_PAGE_ID) {
        const pageRes = await fetch(
          graphUrl(`/${process.env.META_PAGE_ID}`, token, "instagram_business_account")
        );
        const pageData = await pageRes.json();
        if (pageData.error) {
          debugLog.push(`PAGE_ID direto erro: ${pageData.error.message}`);
        } else if (pageData.instagram_business_account?.id) {
          igAccountId = pageData.instagram_business_account.id;
          debugLog.push(`Instagram encontrado via META_PAGE_ID: ${igAccountId}`);
        } else {
          debugLog.push(`META_PAGE_ID ${process.env.META_PAGE_ID} não tem instagram_business_account`);
        }
      }

      if (!igAccountId) {
        throw new Error(
          `Nenhuma conta Instagram Business encontrada.\n\nDiagnóstico:\n${debugLog.join("\n")}\n\nSolução: Obtenha um token com permissões instagram_basic + pages_read_engagement em developers.facebook.com/tools/explorer e use o botão "Conectar" no modal.`
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

      const existing = await db
        .select()
        .from(instagramAccounts)
        .where(eq(instagramAccounts.instagramId, input.instagramId))
        .limit(1);

      if (existing.length > 0) {
        await db.update(instagramAccounts).set({
          isActive: true,
          username: input.username,
          ...(input.accessToken ? { accessToken: input.accessToken } : {}),
          updatedAt: new Date(),
        }).where(eq(instagramAccounts.instagramId, input.instagramId));
      } else {
        await db.insert(instagramAccounts).values({
          accountType: "feminnita",
          instagramId: input.instagramId,
          username: input.username,
          displayName: "Feminnita",
          accessToken: input.accessToken || "",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return {
        success: true,
        message: `Conta @${input.username} conectada com sucesso!`,
      };
    }),
});
