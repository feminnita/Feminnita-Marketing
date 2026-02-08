import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { instagramAccounts, igPostPublications } from "../../drizzle/schema";

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
  listAccounts: protectedProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return [];

      const accounts = await db.select().from(instagramAccounts);
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
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

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
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

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
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

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
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

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
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

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
});
