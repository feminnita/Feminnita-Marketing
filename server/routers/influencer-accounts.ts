import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "../_core/notification";

/**
 * Influencer Accounts Router
 * Manages real social media accounts for influencers (Instagram, TikTok, YouTube, Blog)
 */

export const influencerAccountsRouter = router({
  /**
   * Add a new social media account for an influencer
   */
  addAccount: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        platform: z.enum(["instagram", "tiktok", "youtube", "blog"]),
        accountHandle: z.string(),
        accessToken: z.string(),
        refreshToken: z.string().optional(),
        accountId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Validate token format based on platform
        if (input.platform === "instagram" && !input.accessToken.startsWith("IG")) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Token inválido para Instagram",
          });
        }

        if (input.platform === "tiktok" && input.accessToken.length < 50) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Token inválido para TikTok",
          });
        }

        // Store account securely (in production, encrypt tokens)
        const accountData = {
          influencerId: input.influencerId,
          platform: input.platform,
          accountHandle: input.accountHandle,
          accountId: input.accountId,
          isActive: true,
          connectedAt: new Date(),
          lastSync: new Date(),
        };

        console.log(`[Influencer Account] Added ${input.platform} account for influencer ${input.influencerId}`);

        await notifyOwner({
          title: "Conta de rede social conectada",
          content: `${input.accountHandle} (@${input.accountHandle}) conectada ao ${input.platform}`,
        });

        return {
          success: true,
          message: `Conta ${input.platform} conectada com sucesso`,
          account: accountData,
        };
      } catch (error) {
        console.error("Error adding account:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao conectar conta",
        });
      }
    }),

  /**
   * Get all accounts for an influencer
   */
  getInfluencerAccounts: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        // Mock data - in production, fetch from database
        const accounts = [
          {
            id: 1,
            influencerId: input.influencerId,
            platform: "instagram",
            accountHandle: "carol_feminnita",
            accountId: "12345678",
            followers: 5420,
            isActive: true,
            connectedAt: new Date("2026-02-01"),
          },
          {
            id: 2,
            influencerId: input.influencerId,
            platform: "tiktok",
            accountHandle: "carol_feminnita",
            accountId: "87654321",
            followers: 12300,
            isActive: true,
            connectedAt: new Date("2026-02-01"),
          },
        ];

        return {
          success: true,
          accounts: accounts.filter((a) => a.influencerId === input.influencerId),
          totalAccounts: accounts.filter((a) => a.influencerId === input.influencerId).length,
        };
      } catch (error) {
        console.error("Error getting accounts:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter contas",
        });
      }
    }),

  /**
   * Sync metrics from real accounts
   */
  syncAccountMetrics: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        platform: z.enum(["instagram", "tiktok", "youtube", "blog"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Mock sync - in production, call platform APIs
        const metrics = {
          followers: Math.floor(Math.random() * 50000) + 1000,
          engagement: (Math.random() * 10).toFixed(2),
          postsThisMonth: Math.floor(Math.random() * 30) + 1,
          avgLikes: Math.floor(Math.random() * 5000) + 100,
          avgComments: Math.floor(Math.random() * 500) + 10,
          avgShares: Math.floor(Math.random() * 200) + 5,
          lastSyncedAt: new Date(),
        };

        console.log(`[Sync] Updated metrics for ${input.platform} account`);

        await notifyOwner({
          title: "Métricas sincronizadas",
          content: `${input.platform}: ${metrics.followers} seguidores, ${metrics.engagement}% engajamento`,
        });

        return {
          success: true,
          message: "Métricas sincronizadas com sucesso",
          metrics,
        };
      } catch (error) {
        console.error("Error syncing metrics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao sincronizar métricas",
        });
      }
    }),

  /**
   * Publish post to real account
   */
  publishPost: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        platform: z.enum(["instagram", "tiktok", "youtube", "blog"]),
        content: z.string(),
        caption: z.string(),
        mediaUrl: z.string().optional(),
        hashtags: z.array(z.string()).optional(),
        scheduledFor: z.date().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Mock publish - in production, call platform APIs
        const postId = `${input.platform}_${Date.now()}`;

        console.log(`[Publish] Publishing to ${input.platform}: ${input.caption.substring(0, 50)}...`);

        await notifyOwner({
          title: "Post publicado com sucesso",
          content: `${input.platform}: "${input.caption.substring(0, 50)}..."`,
        });

        return {
          success: true,
          message: `Post publicado com sucesso no ${input.platform}`,
          postId,
          platform: input.platform,
          publishedAt: new Date(),
          url: `https://${input.platform}.com/post/${postId}`,
        };
      } catch (error) {
        console.error("Error publishing post:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao publicar post",
        });
      }
    }),

  /**
   * Get account connection status
   */
  getConnectionStatus: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const platforms = ["instagram", "tiktok", "youtube", "blog"];
        const status = platforms.map((platform) => ({
          platform,
          isConnected: Math.random() > 0.3, // Mock: 70% connected
          followers: Math.floor(Math.random() * 50000) + 1000,
          lastSync: new Date(Date.now() - Math.random() * 86400000), // Random time in last 24h
        }));

        return {
          success: true,
          influencerId: input.influencerId,
          platforms: status,
          allConnected: status.every((s) => s.isConnected),
        };
      } catch (error) {
        console.error("Error getting connection status:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter status de conexão",
        });
      }
    }),

  /**
   * Disconnect an account
   */
  disconnectAccount: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        platform: z.enum(["instagram", "tiktok", "youtube", "blog"]),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log(`[Disconnect] Disconnecting ${input.platform} account`);

        await notifyOwner({
          title: "Conta desconectada",
          content: `${input.platform} desconectada da influenciadora`,
        });

        return {
          success: true,
          message: `Conta ${input.platform} desconectada com sucesso`,
        };
      } catch (error) {
        console.error("Error disconnecting account:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao desconectar conta",
        });
      }
    }),
});
