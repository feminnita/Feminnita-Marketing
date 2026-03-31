import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import axios, { AxiosError } from "axios";
import { getDb } from "../db";
import { instagramAccounts } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const INSTAGRAM_GRAPH_API_BASE = "https://graph.instagram.com/v19.0";

/**
 * Instagram Graph API Router
 * Integração com Instagram Business Account para puxar posts e métricas em tempo real
 */

interface InstagramMediaInsight {
  name: string;
  period: string;
  values: Array<{ value: number }>;
  title: string;
  description: string;
  id: string;
}

interface InstagramMedia {
  id: string;
  caption: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS";
  media_url: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

interface InstagramBusinessAccount {
  id: string;
  name: string;
  biography: string;
  followers_count: number;
  following_count: number;
  ig_username: string;
  profile_picture_url: string;
}

export const instagramApiRouter = router({
  /**
   * Obter dados da conta de negócios do Instagram
   */
  getBusinessAccount: protectedProcedure
    .input(
      z.object({
        businessAccountId: z.string(),
        accessToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await axios.get<InstagramBusinessAccount>(
          `${INSTAGRAM_GRAPH_API_BASE}/${input.businessAccountId}`,
          {
            params: {
              fields:
                "id,name,biography,followers_count,following_count,ig_username,profile_picture_url",
              access_token: input.accessToken,
            },
          }
        );

        return {
          success: true,
          data: response.data,
        };
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error(
          "[Instagram] Error getting business account:",
          axiosError.response?.data
        );
        throw new Error(
          `Erro ao obter dados da conta: ${axiosError.message}`
        );
      }
    }),

  /**
   * Listar posts/reels/stories da conta
   */
  getMediaList: protectedProcedure
    .input(
      z.object({
        businessAccountId: z.string(),
        accessToken: z.string(),
        limit: z.number().default(25),
        after: z.string().optional(),
      })
    )
    .query(async ({ input }) => {
      try {
        const params: Record<string, any> = {
          fields:
            "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count",
          access_token: input.accessToken,
          limit: input.limit,
        };

        if (input.after) {
          params.after = input.after;
        }

        const response = await axios.get<{
          data: InstagramMedia[];
          paging: { cursors: { before: string; after: string } };
        }>(`${INSTAGRAM_GRAPH_API_BASE}/${input.businessAccountId}/media`, {
          params,
        });

        return {
          success: true,
          data: response.data.data,
          paging: response.data.paging,
        };
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error(
          "[Instagram] Error getting media list:",
          axiosError.response?.data
        );
        throw new Error(`Erro ao listar posts: ${axiosError.message}`);
      }
    }),

  /**
   * Obter métricas de engajamento de um post
   */
  getMediaInsights: protectedProcedure
    .input(
      z.object({
        mediaId: z.string(),
        accessToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await axios.get<{ data: InstagramMediaInsight[] }>(
          `${INSTAGRAM_GRAPH_API_BASE}/${input.mediaId}/insights`,
          {
            params: {
              metric:
                "engagement,impressions,reach,saved,video_views,shares",
              access_token: input.accessToken,
            },
          }
        );

        // Transformar dados para formato mais legível
        const insights: Record<string, number> = {};
        response.data.data.forEach((metric) => {
          if (metric.values && metric.values.length > 0) {
            insights[metric.name] = metric.values[0].value;
          }
        });

        return {
          success: true,
          data: insights,
        };
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error(
          "[Instagram] Error getting media insights:",
          axiosError.response?.data
        );
        const errorMsg = axiosError instanceof Error ? axiosError.message : "Unknown error";
        throw new Error(`Erro ao obter métricas: ${errorMsg}`);
      }
    }),

  /**
   * Obter métricas da conta (seguidores, impressões, etc)
   */
  getFollowerInsights: protectedProcedure
    .input(
      z.object({
        businessAccountId: z.string(),
        accessToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await axios.get<{ data: InstagramMediaInsight[] }>(
          `${INSTAGRAM_GRAPH_API_BASE}/${input.businessAccountId}/insights`,
          {
            params: {
              metric:
                "impressions,reach,follower_count,profile_views,website_clicks",
              period: "day",
              access_token: input.accessToken,
            },
          }
        );

        // Transformar dados para formato mais legível
        const insights: Record<string, number> = {};
        response.data.data.forEach((metric) => {
          if (metric.values && metric.values.length > 0) {
            insights[metric.name] = metric.values[0].value;
          }
        });

        return {
          success: true,
          data: insights,
        };
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error(
          "[Instagram] Error getting follower insights:",
          axiosError.response?.data
        );
        const errorMsg = axiosError instanceof Error ? axiosError.message : "Unknown error";
        throw new Error(
          `Erro ao obter métricas de seguidores: ${errorMsg}`
        );
      }
    }),

  /**
   * Sincronizar posts do Instagram com o banco de dados
   * (Chamada para armazenar posts localmente)
   */
  syncInstagramPosts: protectedProcedure
    .input(
      z.object({
        businessAccountId: z.string(),
        accessToken: z.string(),
        limit: z.number().default(25),
      })
    )
    .mutation(async ({ input }) => {
      try {
        // Obter lista de posts
        const mediaResponse = await axios.get<{
          data: InstagramMedia[];
          paging: { cursors: { before: string; after: string } };
        }>(`${INSTAGRAM_GRAPH_API_BASE}/${input.businessAccountId}/media`, {
          params: {
            fields:
              "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count",
            access_token: input.accessToken,
            limit: input.limit,
          },
        });

        const posts = mediaResponse.data.data;

        // Para cada post, obter insights
        const postsWithInsights = await Promise.all(
          posts.map(async (post) => {
            try {
              const insightsResponse = await axios.get<{
                data: InstagramMediaInsight[];
              }>(`${INSTAGRAM_GRAPH_API_BASE}/${post.id}/insights`, {
                params: {
                  metric: "engagement,impressions,reach,saved,video_views",
                  access_token: input.accessToken,
                },
              });

              const insights: Record<string, number> = {};
              insightsResponse.data.data.forEach((metric) => {
                if (metric.values && metric.values.length > 0) {
                  insights[metric.name] = metric.values[0].value;
                }
              });

              return {
                ...post,
                insights,
              };
            } catch (error) {
              console.error(
                `[Instagram] Error getting insights for post ${post.id}:`,
                error
              );
              return {
                ...post,
                insights: {},
              };
            }
          })
        );

        return {
          success: true,
          message: `${postsWithInsights.length} posts sincronizados com sucesso`,
          data: postsWithInsights,
          count: postsWithInsights.length,
        };
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error(
          "[Instagram] Error syncing posts:",
          axiosError.response?.data
        );
        const errorMsg = axiosError instanceof Error ? axiosError.message : "Unknown error";
        throw new Error(`Erro ao sincronizar posts: ${errorMsg}`);
      }
    }),

  /**
   * Testar conexão com Instagram API
   */
  testConnection: protectedProcedure
    .input(
      z.object({
        businessAccountId: z.string(),
        accessToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const response = await axios.get(
          `${INSTAGRAM_GRAPH_API_BASE}/${input.businessAccountId}`,
          {
            params: {
              fields: "id,name",
              access_token: input.accessToken,
            },
          }
        );

        return {
          success: true,
          message: "Conexão com Instagram API estabelecida com sucesso!",
          data: {
            accountId: response.data.id,
            accountName: response.data.name,
          },
        };
      } catch (error) {
        const axiosError = error as AxiosError;
        console.error("[Instagram] Connection test failed:", axiosError.message);
        return {
          success: false,
          message: `Erro na conexão: ${axiosError.message}`,
          error: axiosError.response?.data,
        };
      }
    }),

  /**
   * Obter credenciais salvas do Instagram
   */
  getCredentials: protectedProcedure.query(async ({ ctx }: any) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Buscar conta Instagram ativa do usuário
      const accounts = await db
        .select()
        .from(instagramAccounts)
        .where(and(eq(instagramAccounts.userId, ctx.user.id), eq(instagramAccounts.isActive, true)))
        .limit(1);

      if (accounts.length > 0) {
        return {
          success: true,
          data: {
            businessAccountId: accounts[0].instagramId,
            accessToken: accounts[0].accessToken,
            username: accounts[0].username,
          },
        };
      }

      // Fallback para env vars se nenhuma conta no DB
      return {
        success: true,
        data: {
          businessAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || "",
          accessToken: process.env.META_ACCESS_TOKEN || "",
          username: "",
        },
      };
    } catch (error) {
      console.error("[Instagram] Error getting credentials:", error);
      throw new Error("Erro ao obter credenciais");
    }
  }),
});
