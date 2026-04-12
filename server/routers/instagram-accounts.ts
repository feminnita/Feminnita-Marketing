import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq, inArray, or, and } from "drizzle-orm";
import { getDb } from "../db";
import { instagramAccounts, igPostPublications, influencers } from "../../drizzle/schema";

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
      const token = input.pageAccessToken;

      // Se o ID foi fornecido diretamente, pula toda a descoberta
      let igAccountId: string | null = input.instagramAccountId || null;
      let pageToken: string = token;

      if (!igAccountId) {
        // 1. Buscar páginas acessíveis pelo token
        const pagesRes = await fetch(
          `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${token}`
        );
        const pagesData = await pagesRes.json();

        if (!pagesData.error) {
          // 2. Encontrar a página que tem Instagram Business Account
          const pages: any[] = pagesData.data || [];
          for (const page of pages) {
            if (page.instagram_business_account?.id) {
              igAccountId = page.instagram_business_account.id;
              pageToken = page.access_token || token;
              break;
            }
          }
        }

        // Se não achou via pages, tenta direto com o token fornecido
        if (!igAccountId) {
          const directRes = await fetch(
            `https://graph.facebook.com/v19.0/me?fields=instagram_business_account&access_token=${token}`
          );
          const directData = await directRes.json();
          if (directData.instagram_business_account?.id) {
            igAccountId = directData.instagram_business_account.id;
          }
        }

        // Tenta pelo Page ID configurado no servidor
        if (!igAccountId) {
          const pageId = process.env.META_PAGE_ID;
          if (pageId) {
            const pageRes = await fetch(
              `https://graph.facebook.com/v19.0/${pageId}?fields=instagram_business_account&access_token=${token}`
            );
            const pageData = await pageRes.json();
            if (pageData.instagram_business_account?.id) {
              igAccountId = pageData.instagram_business_account.id;
            }
          }
        }

        // Tenta como conta Instagram diretamente (caso o token seja de uma IG account)
        if (!igAccountId) {
          const igDirectRes = await fetch(
            `https://graph.facebook.com/v19.0/me?fields=id,username,name,biography,followers_count,media_count,profile_picture_url&access_token=${token}`
          );
          const igDirectData = await igDirectRes.json();
          if (igDirectData.username && !igDirectData.error) {
            igAccountId = igDirectData.id;
            const db = await getDb();
            if (!db) throw new Error("Database indisponível");
            const existing = await db.select().from(instagramAccounts).where(eq(instagramAccounts.instagramId, igAccountId!)).limit(1);
            if (existing.length > 0) {
              await db.update(instagramAccounts).set({ accessToken: token, updatedAt: new Date() }).where(eq(instagramAccounts.instagramId, igAccountId!));
            } else {
              await db.insert(instagramAccounts).values({
                accountType: "feminnita", instagramId: igAccountId!, username: igDirectData.username,
                displayName: igDirectData.name || "Feminnita", accessToken: token,
                biography: igDirectData.biography || null, profilePictureUrl: igDirectData.profile_picture_url || null,
                followers: igDirectData.followers_count || 0, postsCount: igDirectData.media_count || 0,
                isActive: true, createdAt: new Date(), updatedAt: new Date(),
              });
            }
            return { success: true, username: igDirectData.username, followers: igDirectData.followers_count, message: `Conta @${igDirectData.username} conectada com sucesso!` };
          }
        }

        if (!igAccountId) {
          throw new Error(
            "Nenhuma conta Instagram Business encontrada. Informe o ID da conta Instagram manualmente."
          );
        }
      }

      // Buscar dados da conta Instagram pelo ID
      const igRes = await fetch(
        `https://graph.facebook.com/v19.0/${igAccountId}?fields=id,username,name,biography,followers_count,media_count,profile_picture_url&access_token=${pageToken}`
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
   * Conectar conta Feminnita automaticamente usando META_ACCESS_TOKEN do servidor
   * Não requer input do usuário — usa o token já configurado no .env
   */
  autoConnectFeminnita: protectedProcedure
    .mutation(async () => {
      const token = process.env.META_ACCESS_TOKEN;
      if (!token) throw new Error("META_ACCESS_TOKEN não configurado no servidor. Adicione ao .env e reinicie.");

      let igAccountId: string | null = null;
      let pageToken: string = token;

      // 1. Tentar via páginas da conta
      try {
        const pagesRes = await fetch(
          `https://graph.facebook.com/v19.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${token}`
        );
        const pagesData = await pagesRes.json();
        if (!pagesData.error) {
          const pages: any[] = pagesData.data || [];
          for (const page of pages) {
            if (page.instagram_business_account?.id) {
              igAccountId = page.instagram_business_account.id;
              pageToken = page.access_token || token;
              break;
            }
          }
        }
      } catch (_) {}

      // 2. Tentar via META_PAGE_ID configurado
      if (!igAccountId && process.env.META_PAGE_ID) {
        try {
          const pageRes = await fetch(
            `https://graph.facebook.com/v19.0/${process.env.META_PAGE_ID}?fields=instagram_business_account&access_token=${token}`
          );
          const pageData = await pageRes.json();
          if (pageData.instagram_business_account?.id) {
            igAccountId = pageData.instagram_business_account.id;
          }
        } catch (_) {}
      }

      // 3. Tentar token como conta IG direta
      if (!igAccountId) {
        try {
          const igDirectRes = await fetch(
            `https://graph.facebook.com/v19.0/me?fields=id,username,name,biography,followers_count,media_count,profile_picture_url&access_token=${token}`
          );
          const igDirectData = await igDirectRes.json();
          if (igDirectData.username && !igDirectData.error) {
            igAccountId = igDirectData.id;
            const db = await getDb();
            if (!db) throw new Error("Database indisponível");
            const existing = await db.select().from(instagramAccounts).where(eq(instagramAccounts.instagramId, igAccountId!)).limit(1);
            if (existing.length > 0) {
              await db.update(instagramAccounts).set({ accessToken: token, updatedAt: new Date() }).where(eq(instagramAccounts.instagramId, igAccountId!));
            } else {
              await db.insert(instagramAccounts).values({
                accountType: "feminnita", instagramId: igAccountId!, username: igDirectData.username,
                displayName: igDirectData.name || "Feminnita", accessToken: token,
                biography: igDirectData.biography || null, profilePictureUrl: igDirectData.profile_picture_url || null,
                followers: igDirectData.followers_count || 0, postsCount: igDirectData.media_count || 0,
                isActive: true, createdAt: new Date(), updatedAt: new Date(),
              });
            }
            return { success: true, username: igDirectData.username, message: `Conta @${igDirectData.username} conectada!` };
          }
        } catch (_) {}
      }

      if (!igAccountId) {
        throw new Error("Token configurado mas nenhuma conta Instagram Business encontrada. Verifique se a página do Facebook tem uma conta Instagram Business vinculada.");
      }

      // Buscar dados completos pelo ID
      const igRes = await fetch(
        `https://graph.facebook.com/v19.0/${igAccountId}?fields=id,username,name,biography,followers_count,media_count,profile_picture_url&access_token=${pageToken}`
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
