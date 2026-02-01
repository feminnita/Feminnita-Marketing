import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { saveOAuthToken, getOAuthToken, deleteOAuthToken } from "../db";

/**
 * OAuth Callbacks Router
 * Handles storing and managing OAuth tokens after successful authentication
 */
export const oauthCallbacksRouter = router({
  // Save OAuth token after successful callback
  saveBlingToken: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        refreshToken: z.string().optional(),
        expiresIn: z.number().optional(),
        scope: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const token = await saveOAuthToken(ctx.user.id, "bling", {
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
          expiresIn: input.expiresIn,
          scope: input.scope,
          accountInfo: {
            connectedAt: new Date().toISOString(),
          },
        });

        return {
          success: true,
          message: "Bling conectado com sucesso!",
          platform: "bling",
          expiresAt: token.expiresAt,
        };
      } catch (error) {
        console.error("Error saving Bling token:", error);
        return {
          success: false,
          message: "Erro ao conectar Bling",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  saveMetaToken: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        refreshToken: z.string().optional(),
        expiresIn: z.number().optional(),
        scope: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const token = await saveOAuthToken(ctx.user.id, "meta", {
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
          expiresIn: input.expiresIn,
          scope: input.scope,
          accountInfo: {
            connectedAt: new Date().toISOString(),
          },
        });

        return {
          success: true,
          message: "Meta conectada com sucesso!",
          platform: "meta",
          expiresAt: token.expiresAt,
        };
      } catch (error) {
        console.error("Error saving Meta token:", error);
        return {
          success: false,
          message: "Erro ao conectar Meta",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  saveTikTokToken: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        refreshToken: z.string().optional(),
        expiresIn: z.number().optional(),
        scope: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const token = await saveOAuthToken(ctx.user.id, "tiktok", {
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
          expiresIn: input.expiresIn,
          scope: input.scope,
          accountInfo: {
            connectedAt: new Date().toISOString(),
          },
        });

        return {
          success: true,
          message: "TikTok conectado com sucesso!",
          platform: "tiktok",
          expiresAt: token.expiresAt,
        };
      } catch (error) {
        console.error("Error saving TikTok token:", error);
        return {
          success: false,
          message: "Erro ao conectar TikTok",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  saveGoogleDriveToken: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        refreshToken: z.string().optional(),
        expiresIn: z.number().optional(),
        scope: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const token = await saveOAuthToken(ctx.user.id, "google_drive", {
          accessToken: input.accessToken,
          refreshToken: input.refreshToken,
          expiresIn: input.expiresIn,
          scope: input.scope,
          accountInfo: {
            connectedAt: new Date().toISOString(),
          },
        });

        return {
          success: true,
          message: "Google Drive conectado com sucesso!",
          platform: "google_drive",
          expiresAt: token.expiresAt,
        };
      } catch (error) {
        console.error("Error saving Google Drive token:", error);
        return {
          success: false,
          message: "Erro ao conectar Google Drive",
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Get token status
  getTokenStatus: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["bling", "meta", "tiktok", "google_drive"]),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const token = await getOAuthToken(
          ctx.user.id,
          input.platform as "bling" | "meta" | "tiktok" | "google_drive"
        );

        if (!token) {
          return {
            connected: false,
            platform: input.platform,
          };
        }

        const isExpired = token.expiresAt && new Date() > token.expiresAt;

        return {
          connected: true,
          platform: input.platform,
          expiresAt: token.expiresAt,
          isExpired,
          lastUsed: token.lastUsed,
        };
      } catch (error) {
        console.error("Error getting token status:", error);
        return {
          connected: false,
          platform: input.platform,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Disconnect platform
  disconnectPlatform: protectedProcedure
    .input(
      z.object({
        platform: z.enum(["bling", "meta", "tiktok", "google_drive"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        await deleteOAuthToken(
          ctx.user.id,
          input.platform as "bling" | "meta" | "tiktok" | "google_drive"
        );

        return {
          success: true,
          message: `${input.platform} desconectado com sucesso!`,
          platform: input.platform,
        };
      } catch (error) {
        console.error("Error disconnecting platform:", error);
        return {
          success: false,
          message: `Erro ao desconectar ${input.platform}`,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  // Get all connected platforms
  getConnectedPlatforms: protectedProcedure.query(async ({ ctx }) => {
    try {
      const platforms = ["bling", "meta", "tiktok", "google_drive"] as const;
      const results = [];

      for (const platform of platforms) {
        const token = await getOAuthToken(ctx.user.id, platform);
        results.push({
          platform,
          connected: !!token,
          expiresAt: token?.expiresAt,
          lastUsed: token?.lastUsed,
        });
      }

      return {
        platforms: results,
        count: results.filter((p) => p.connected).length,
      };
    } catch (error) {
      console.error("Error getting connected platforms:", error);
      return {
        platforms: [],
        count: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }),
});
