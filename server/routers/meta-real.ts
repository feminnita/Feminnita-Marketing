import { publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { oauthCredentials } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Meta Graph API Integration Router - REAL IMPLEMENTATION
 * API Base: https://graph.instagram.com/v18.0/
 * Uses Access Token for API calls
 */

const META_API_BASE = "https://graph.instagram.com/v18.0";

export const metaRealRouter = {
  /**
   * Get Meta OAuth authorization URL
   */
  getAuthUrl: publicProcedure.query(async () => {
    try {
      const clientId = process.env.META_CLIENT_ID || "your-meta-app-id";
      const redirectUri = process.env.META_REDIRECT_URI || "https://your-domain.com/api/oauth/callback";
      
      const authUrl = `https://www.instagram.com/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=instagram_business_basic,instagram_business_content_publish,instagram_business_manage_messages&response_type=code`;

      return {
        success: true,
        authUrl,
      };
    } catch (error: any) {
      throw new Error(`Erro ao gerar URL de autenticação: ${error.message}`);
    }
  }),

  /**
   * Get access token from authorization code
   */
  getAccessToken: publicProcedure
    .input(z.object({
      code: z.string(),
    }))
    .mutation(async ({ input }: any) => {
      try {
        const clientId = process.env.META_CLIENT_ID || "your-meta-app-id";
        const clientSecret = process.env.META_CLIENT_SECRET || "your-meta-app-secret";
        const redirectUri = process.env.META_REDIRECT_URI || "https://your-domain.com/api/oauth/callback";

        const response = await fetch(`${META_API_BASE}/oauth/access_token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: "authorization_code",
            code: input.code,
            redirect_uri: redirectUri,
          }).toString(),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error?.message || "Erro ao obter token");
        }

        return {
          success: true,
          accessToken: data.access_token,
          userId: data.user_id,
          expiresIn: data.expires_in,
        };
      } catch (error: any) {
        throw new Error(`Erro ao obter token: ${error.message}`);
      }
    }),

  /**
   * Get Instagram Business Account info
   */
  getAccountInfo: protectedProcedure.query(async ({ ctx }: any) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Get Meta credentials
      const credentials = await db
        .select()
        .from(oauthCredentials)
        .where(eq(oauthCredentials.platform, "meta"));

      if (!credentials || credentials.length === 0) {
        throw new Error("Credenciais do Meta não configuradas");
      }

      const accessToken = credentials[0].accessToken;

      // Get account info from Meta API
      const response = await fetch(`${META_API_BASE}/me?fields=id,username,name,biography,profile_picture_url,followers_count,website`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao obter informações da conta: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        account: data,
      };
    } catch (error: any) {
      throw new Error(`Erro ao obter informações da conta: ${error.message}`);
    }
  }),

  /**
   * Get Instagram insights (analytics)
   */
  getInsights: protectedProcedure
    .input(z.object({
      metric: z.enum(["impressions", "reach", "profile_views", "follower_count"]).optional(),
      period: z.enum(["day", "week", "month", "lifetime"]).optional(),
    }))
    .query(async ({ input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Get Meta credentials
        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(eq(oauthCredentials.platform, "meta"));

        if (!credentials || credentials.length === 0) {
          throw new Error("Credenciais do Meta não configuradas");
        }

        const accessToken = credentials[0].accessToken;

        // Get insights from Meta API
        const metric = input.metric || "impressions";
        const period = input.period || "lifetime";

        const response = await fetch(
          `${META_API_BASE}/me/insights?metric=${metric}&period=${period}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erro ao obter insights: ${response.statusText}`);
        }

        const data = await response.json();

        return {
          success: true,
          insights: data.data || [],
        };
      } catch (error: any) {
        throw new Error(`Erro ao obter insights: ${error.message}`);
      }
    }),

  /**
   * Get recent media/posts
   */
  getRecentMedia: protectedProcedure
    .input(z.object({
      limit: z.number().optional(),
    }))
    .query(async ({ input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Get Meta credentials
        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(eq(oauthCredentials.platform, "meta"));

        if (!credentials || credentials.length === 0) {
          throw new Error("Credenciais do Meta não configuradas");
        }

        const accessToken = credentials[0].accessToken;

        // Get recent media from Meta API
        const response = await fetch(
          `${META_API_BASE}/me/media?fields=id,caption,media_type,media_url,timestamp,like_count,comments_count&limit=${input.limit || 10}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erro ao obter posts: ${response.statusText}`);
        }

        const data = await response.json();

        return {
          success: true,
          media: data.data || [],
          total: data.data?.length || 0,
        };
      } catch (error: any) {
        throw new Error(`Erro ao obter posts: ${error.message}`);
      }
    }),

  /**
   * Create a caption/post
   */
  createPost: protectedProcedure
    .input(z.object({
      caption: z.string(),
      mediaUrl: z.string(),
      mediaType: z.enum(["IMAGE", "VIDEO", "CAROUSEL"]).optional(),
    }))
    .mutation(async ({ input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Get Meta credentials
        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(eq(oauthCredentials.platform, "meta"));

        if (!credentials || credentials.length === 0) {
          throw new Error("Credenciais do Meta não configuradas");
        }

        const accessToken = credentials[0].accessToken;

        // Create post via Meta API
        const response = await fetch(`${META_API_BASE}/me/media`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: new URLSearchParams({
            caption: input.caption,
            image_url: input.mediaUrl,
            media_type: input.mediaType || "IMAGE",
          }).toString(),
        });

        if (!response.ok) {
          throw new Error(`Erro ao criar post: ${response.statusText}`);
        }

        const data = await response.json();

        return {
          success: true,
          postId: data.id,
          message: "Post criado com sucesso",
        };
      } catch (error: any) {
        throw new Error(`Erro ao criar post: ${error.message}`);
      }
    }),

  /**
   * Publish a post
   */
  publishPost: protectedProcedure
    .input(z.object({
      mediaId: z.string(),
    }))
    .mutation(async ({ input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Get Meta credentials
        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(eq(oauthCredentials.platform, "meta"));

        if (!credentials || credentials.length === 0) {
          throw new Error("Credenciais do Meta não configuradas");
        }

        const accessToken = credentials[0].accessToken;

        // Publish post via Meta API
        const response = await fetch(`${META_API_BASE}/${input.mediaId}/publish`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error(`Erro ao publicar post: ${response.statusText}`);
        }

        const data = await response.json();

        return {
          success: true,
          postId: data.id,
          message: "Post publicado com sucesso",
        };
      } catch (error: any) {
        throw new Error(`Erro ao publicar post: ${error.message}`);
      }
    }),

  /**
   * Get post comments
   */
  getPostComments: protectedProcedure
    .input(z.object({
      mediaId: z.string(),
    }))
    .query(async ({ input }: any) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database connection failed");

        // Get Meta credentials
        const credentials = await db
          .select()
          .from(oauthCredentials)
          .where(eq(oauthCredentials.platform, "meta"));

        if (!credentials || credentials.length === 0) {
          throw new Error("Credenciais do Meta não configuradas");
        }

        const accessToken = credentials[0].accessToken;

        // Get comments from Meta API
        const response = await fetch(
          `${META_API_BASE}/${input.mediaId}/comments?fields=id,text,timestamp,from`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Erro ao obter comentários: ${response.statusText}`);
        }

        const data = await response.json();

        return {
          success: true,
          comments: data.data || [],
          total: data.data?.length || 0,
        };
      } catch (error: any) {
        throw new Error(`Erro ao obter comentários: ${error.message}`);
      }
    }),

  /**
   * Disconnect Meta account
   */
  disconnect: protectedProcedure.mutation(async ({ ctx }: any) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db
        .update(oauthCredentials)
        .set({
          isConnected: false,
          accessToken: null,
          refreshToken: null,
        })
        .where(eq(oauthCredentials.platform, "meta"));

      return {
        success: true,
        message: "Conta Meta desconectada com sucesso",
      };
    } catch (error: any) {
      throw new Error(`Erro ao desconectar: ${error.message}`);
    }
  }),
};
