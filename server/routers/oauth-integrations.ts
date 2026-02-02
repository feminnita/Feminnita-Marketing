import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

/**
 * OAuth Integrations Router
 * Handles OAuth flows for Meta (Facebook/Instagram), TikTok, and Google Drive
 */
export const oauthIntegrationsRouter = router({
  // ============ Save Credentials ============
  saveCredentials: publicProcedure
    .input(z.object({
      platform: z.string(),
      clientId: z.string(),
      clientSecret: z.string(),
      redirectUri: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      // Salvar credenciais em variáveis de ambiente (em produção, usar banco de dados)
      process.env[`${input.platform.toUpperCase()}_CLIENT_ID`] = input.clientId;
      process.env[`${input.platform.toUpperCase()}_CLIENT_SECRET`] = input.clientSecret;
      
      return {
        success: true,
        message: `Credenciais de ${input.platform} salvas com sucesso`,
      };
    }),

  getMetaAuthUrl: publicProcedure.query(async () => {
    const clientId = process.env.META_APP_ID;
    const redirectUri = `${process.env.VITE_FRONTEND_FORGE_API_URL}/api/oauth/meta/callback`;
    const scope = "instagram_basic,instagram_graph_user_profile,pages_read_engagement,pages_manage_metadata";
    
    const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    return { url };
  }),

  handleMetaCallback: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      const clientId = process.env.META_APP_ID;
      const clientSecret = process.env.META_APP_SECRET;
      const redirectUri = `${process.env.VITE_FRONTEND_FORGE_API_URL}/api/oauth/meta/callback`;

      try {
        // Exchange code for access token
        const response = await fetch("https://graph.facebook.com/v18.0/oauth/access_token", {
          method: "POST",
          body: new URLSearchParams({
            client_id: clientId!,
            client_secret: clientSecret!,
            redirect_uri: redirectUri,
            code: input.code,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || "Failed to exchange code for token");
        }

        return {
          accessToken: data.access_token,
          tokenType: data.token_type,
          expiresIn: data.expires_in,
        };
      } catch (error) {
        throw new Error(`Meta OAuth callback failed: ${error}`);
      }
    }),

  // ============ TikTok OAuth ============
  getTikTokAuthUrl: publicProcedure.query(async () => {
    const clientId = process.env.TIKTOK_CLIENT_ID;
    const redirectUri = `${process.env.VITE_FRONTEND_FORGE_API_URL}/api/oauth/tiktok/callback`;
    const scope = "user.info.basic,video.list,video.upload";

    const url = `https://www.tiktok.com/v1/oauth/authorize?client_key=${clientId}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}`;

    return { url };
  }),

  handleTikTokCallback: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      const clientId = process.env.TIKTOK_CLIENT_ID;
      const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

      try {
        const response = await fetch("https://open.tiktokapis.com/v1/oauth/token/", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_key: clientId!,
            client_secret: clientSecret!,
            code: input.code,
            grant_type: "authorization_code",
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error_description || "Failed to exchange code for token");
        }

        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
        };
      } catch (error) {
        throw new Error(`TikTok OAuth callback failed: ${error}`);
      }
    }),

  // ============ Google Drive OAuth ============
  getGoogleDriveAuthUrl: publicProcedure.query(async () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.VITE_FRONTEND_FORGE_API_URL}/api/oauth/google-drive/callback`;
    const scope = "https://www.googleapis.com/auth/drive";

    const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&response_type=code&scope=${scope}&redirect_uri=${redirectUri}&access_type=offline`;

    return { url };
  }),

  handleGoogleDriveCallback: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = `${process.env.VITE_FRONTEND_FORGE_API_URL}/api/oauth/google-drive/callback`;

      try {
        const response = await fetch("https://oauth2.googleapis.com/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: clientId!,
            client_secret: clientSecret!,
            code: input.code,
            grant_type: "authorization_code",
            redirect_uri: redirectUri,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error_description || "Failed to exchange code for token");
        }

        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
          tokenType: data.token_type,
        };
      } catch (error) {
        throw new Error(`Google Drive OAuth callback failed: ${error}`);
      }
    }),

  // ============ Bling OAuth (reconnect) ============
  getBlingAuthUrl: publicProcedure.query(async () => {
    const clientId = process.env.BLING_CLIENT_ID;
    const redirectUri = `${process.env.VITE_FRONTEND_FORGE_API_URL}/api/oauth/bling/callback`;

    const url = `https://bling.com.br/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=*`;

    return { url };
  }),

  handleBlingCallback: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input }) => {
      const clientId = process.env.BLING_CLIENT_ID;
      const clientSecret = process.env.BLING_CLIENT_SECRET;
      const redirectUri = `${process.env.VITE_FRONTEND_FORGE_API_URL}/api/oauth/bling/callback`;

      try {
        const response = await fetch("https://bling.com.br/oauth/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            grant_type: "authorization_code",
            code: input.code,
            redirect_uri: redirectUri,
            client_id: clientId!,
            client_secret: clientSecret!,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error_description || "Failed to exchange code for token");
        }

        return {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresIn: data.expires_in,
          tokenType: data.token_type,
        };
      } catch (error) {
        throw new Error(`Bling OAuth callback failed: ${error}`);
      }
    }),
});
