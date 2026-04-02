import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import axios from "axios";

const META_GRAPH_API_URL = "https://graph.instagram.com/v18.0";
const META_GRAPH_FACEBOOK_URL = "https://graph.facebook.com/v18.0";

export const metaGraphRouter = router({
  /**
   * Publicar postagem no Facebook
   */
  publishToFacebook: protectedProcedure
    .input(
      z.object({
        message: z.string().describe("Texto da postagem"),
        imageUrl: z.string().optional().describe("URL da imagem"),
        link: z.string().optional().describe("Link para incluir na postagem"),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      try {
        const pageId = process.env.META_PAGE_ID;
        const accessToken = process.env.META_ACCESS_TOKEN;

        if (!pageId || !accessToken) {
          throw new Error("META_PAGE_ID ou META_ACCESS_TOKEN não configurados");
        }

        const payload: Record<string, string> = {
          message: input.message,
          access_token: accessToken,
        };

        if (input.imageUrl) {
          payload.picture = input.imageUrl;
        }

        if (input.link) {
          payload.link = input.link;
        }

        const response = await axios.post(
          `${META_GRAPH_FACEBOOK_URL}/${pageId}/feed`,
          payload
        );

        console.log("[Meta Graph] Postagem publicada no Facebook:", response.data.id);

        return {
          success: true,
          postId: response.data.id,
          platform: "facebook",
          message: "Postagem publicada com sucesso no Facebook",
        };
      } catch (error) {
        console.error("[Meta Graph] Erro ao publicar no Facebook:", error);
        throw error;
      }
    }),

  /**
   * Publicar postagem no Instagram
   */
  publishToInstagram: protectedProcedure
    .input(
      z.object({
        caption: z.string().describe("Legenda da postagem"),
        imageUrl: z.string().describe("URL da imagem"),
        isCarousel: z.boolean().optional().describe("Se é um carrossel"),
        carouselItems: z
          .array(
            z.object({
              imageUrl: z.string(),
              caption: z.string().optional(),
            })
          )
          .optional()
          .describe("Itens do carrossel"),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      try {
        const instagramAccountId = process.env.META_INSTAGRAM_ACCOUNT_ID;
        const accessToken = process.env.META_ACCESS_TOKEN;

        if (!instagramAccountId || !accessToken) {
          throw new Error(
            "META_INSTAGRAM_ACCOUNT_ID ou META_ACCESS_TOKEN não configurados"
          );
        }

        if (input.isCarousel && input.carouselItems) {
          // Publicar carrossel
          const containerPayload = {
            media_type: "CAROUSEL",
            children: input.carouselItems.map((item: any) => ({
              media_type: "IMAGE",
              image_url: item.imageUrl,
            })),
            caption: input.caption,
            access_token: accessToken,
          };

          const containerResponse = await axios.post(
            `${META_GRAPH_API_URL}/${instagramAccountId}/media`,
            containerPayload
          );

          const publishResponse = await axios.post(
            `${META_GRAPH_API_URL}/${instagramAccountId}/media_publish`,
            {
              creation_id: containerResponse.data.id,
              access_token: accessToken,
            }
          );

          console.log(
            "[Meta Graph] Carrossel publicado no Instagram:",
            publishResponse.data.id
          );

          return {
            success: true,
            postId: publishResponse.data.id,
            platform: "instagram",
            message: "Carrossel publicado com sucesso no Instagram",
          };
        } else {
          // Publicar foto simples
          const containerPayload = {
            image_url: input.imageUrl,
            caption: input.caption,
            access_token: accessToken,
          };

          const containerResponse = await axios.post(
            `${META_GRAPH_API_URL}/${instagramAccountId}/media`,
            containerPayload
          );

          const publishResponse = await axios.post(
            `${META_GRAPH_API_URL}/${instagramAccountId}/media_publish`,
            {
              creation_id: containerResponse.data.id,
              access_token: accessToken,
            }
          );

          console.log(
            "[Meta Graph] Foto publicada no Instagram:",
            publishResponse.data.id
          );

          return {
            success: true,
            postId: publishResponse.data.id,
            platform: "instagram",
            message: "Foto publicada com sucesso no Instagram",
          };
        }
      } catch (error) {
        console.error("[Meta Graph] Erro ao publicar no Instagram:", error);
        throw error;
      }
    }),

  /**
   * Agendar postagem para publicar depois
   */
  schedulePost: protectedProcedure
    .input(
      z.object({
        platforms: z.array(z.enum(["facebook", "instagram"])),
        message: z.string(),
        imageUrl: z.string().optional(),
        scheduledTime: z.date().describe("Data e hora para publicar"),
        isCarousel: z.boolean().optional(),
        carouselItems: z.array(z.object({ imageUrl: z.string() })).optional(),
      })
    )
    .mutation(async ({ input }: { input: any }) => {
      try {
        const accessToken = process.env.META_ACCESS_TOKEN;
        const pageId = process.env.META_PAGE_ID;

        if (!accessToken || !pageId) {
          throw new Error("Credenciais do Meta não configuradas");
        }

        const results = [];

        // Agendar para Facebook
        if (input.platforms.includes("facebook")) {
          const facebookPayload = {
            message: input.message,
            picture: input.imageUrl,
            scheduled_publish_time: Math.floor(input.scheduledTime.getTime() / 1000),
            access_token: accessToken,
          };

          const facebookResponse = await axios.post(
            `${META_GRAPH_FACEBOOK_URL}/${pageId}/feed`,
            facebookPayload
          );

          results.push({
            platform: "facebook",
            postId: facebookResponse.data.id,
            scheduledTime: input.scheduledTime,
          });

          console.log("[Meta Graph] Postagem agendada no Facebook");
        }

        // Agendar para Instagram
        if (input.platforms.includes("instagram")) {
          const instagramAccountId = process.env.META_INSTAGRAM_ACCOUNT_ID;

          if (instagramAccountId) {
            const instagramPayload = {
              image_url: input.imageUrl,
              caption: input.message,
              scheduled_publish_time: Math.floor(
                input.scheduledTime.getTime() / 1000
              ),
              access_token: accessToken,
            };

            const instagramResponse = await axios.post(
              `${META_GRAPH_API_URL}/${instagramAccountId}/media`,
              instagramPayload
            );

            results.push({
              platform: "instagram",
              postId: instagramResponse.data.id,
              scheduledTime: input.scheduledTime,
            });

            console.log("[Meta Graph] Postagem agendada no Instagram");
          }
        }

        return {
          success: true,
          results,
          message: "Postagens agendadas com sucesso",
        };
      } catch (error) {
        console.error("[Meta Graph] Erro ao agendar postagens:", error);
        throw error;
      }
    }),

  /**
   * Obter insights de uma postagem
   */
  getPostInsights: protectedProcedure
    .input(
      z.object({
        postId: z.string().describe("ID da postagem no Meta"),
        platform: z.enum(["facebook", "instagram"]),
      })
    )
    .query(async ({ input }: { input: any }) => {
      try {
        const accessToken = process.env.META_ACCESS_TOKEN;

        if (!accessToken) {
          throw new Error("META_ACCESS_TOKEN não configurado");
        }

        const baseUrl =
          input.platform === "facebook"
            ? META_GRAPH_FACEBOOK_URL
            : META_GRAPH_API_URL;

        const response = await axios.get(
          `${baseUrl}/${input.postId}/insights?fields=impressions,engagement,reach,saved&access_token=${accessToken}`
        );

        return {
          success: true,
          postId: input.postId,
          platform: input.platform,
          insights: response.data.data,
        };
      } catch (error) {
        console.error("[Meta Graph] Erro ao obter insights:", error);
        throw error;
      }
    }),

  /**
   * Testar conexão com Meta Graph API
   */
  testConnection: protectedProcedure.query(async () => {
    try {
      const accessToken = process.env.META_ACCESS_TOKEN;
      const pageId = process.env.META_PAGE_ID;

      if (!accessToken || !pageId) {
        return {
          success: false,
          message: "META_ACCESS_TOKEN ou META_PAGE_ID não configurados",
        };
      }

      const response = await axios.get(
        `${META_GRAPH_FACEBOOK_URL}/${pageId}?fields=id,name,picture&access_token=${accessToken}`
      );

      console.log("[Meta Graph] Conexão testada com sucesso:", response.data);

      return {
        success: true,
        message: "Conexão com Meta Graph API estabelecida",
        pageInfo: response.data,
      };
    } catch (error) {
      console.error("[Meta Graph] Erro ao testar conexão:", error);
      return {
        success: false,
        message: "Erro ao conectar com Meta Graph API",
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }),
});
