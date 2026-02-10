import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { scheduledPosts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const META_API_VERSION = "v18.0";
const META_GRAPH_URL = `https://graph.instagram.com/${META_API_VERSION}`;

interface MetaMediaContainer {
  id: string;
}

interface MetaPublishResponse {
  id: string;
  success?: boolean;
}

export const metaInstagramPublisherRouter = router({
  // Publicar post no Instagram
  publishToInstagram: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        influencerId: z.number(),
        caption: z.string(),
        imageUrl: z.string().optional(),
        videoUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const accessToken = process.env.META_ACCESS_TOKEN;
        const pageId = process.env.META_PAGE_ID;

        if (!accessToken || !pageId) {
          throw new Error("Meta API credentials not configured");
        }

        // Se houver vídeo, publicar como Reel
        if (input.videoUrl) {
          return await publishReel(pageId, accessToken, {
            postId: input.postId,
            influencerId: input.influencerId,
            caption: input.caption,
            videoUrl: input.videoUrl,
          });
        }

        // Se houver imagem, publicar como post de foto
        if (input.imageUrl) {
          return await publishPhotoPost(pageId, accessToken, {
            postId: input.postId,
            influencerId: input.influencerId,
            caption: input.caption,
            imageUrl: input.imageUrl,
          });
        }

        // Se não houver mídia, publicar como carrossel ou texto
        return await publishCarouselPost(pageId, accessToken, {
          postId: input.postId,
          influencerId: input.influencerId,
          caption: input.caption,
        });
      } catch (error) {
        console.error("Erro ao publicar no Instagram:", error);
        throw new Error(`Falha ao publicar no Instagram: ${error}`);
      }
    }),

  // Publicar Reel no Instagram
  publishReel: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        influencerId: z.number(),
        caption: z.string(),
        videoUrl: z.string(),
        thumbnail: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const accessToken = process.env.META_ACCESS_TOKEN;
        const pageId = process.env.META_PAGE_ID;

        if (!accessToken || !pageId) {
          throw new Error("Meta API credentials not configured");
        }

        return await publishReel(pageId, accessToken, input);
      } catch (error) {
        console.error("Erro ao publicar Reel:", error);
        throw new Error(`Falha ao publicar Reel: ${error}`);
      }
    }),

  // Obter status de publicação
  getPublicationStatus: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const post = await db
          .select()
          .from(scheduledPosts)
          .where(eq(scheduledPosts.id, input.postId));

        if (!post || post.length === 0) {
          throw new Error("Post not found");
        }

        return {
          success: true,
          data: {
            id: post[0].id,
            status: post[0].status,
            platforms: post[0].platforms,
            publishedAt: post[0].updatedAt,
          },
        };
      } catch (error) {
        console.error("Erro ao obter status:", error);
        throw new Error(`Falha ao obter status: ${error}`);
      }
    }),

  // Testar conexão com Meta API
  testConnection: protectedProcedure.query(async ({ ctx }) => {
    try {
      const accessToken = process.env.META_ACCESS_TOKEN;
      const pageId = process.env.META_PAGE_ID;

      if (!accessToken || !pageId) {
        return {
          success: false,
          message: "Meta API credentials not configured",
        };
      }

      const response = await fetch(
        `${META_GRAPH_URL}/${pageId}?access_token=${accessToken}`
      );

      if (!response.ok) {
        return {
          success: false,
          message: `Meta API error: ${response.statusText}`,
        };
      }

      const data = await response.json();

      return {
        success: true,
        message: "Connection successful",
        data: {
          pageId: data.id,
          pageName: data.name,
        },
      };
    } catch (error) {
      console.error("Erro ao testar conexão:", error);
      return {
        success: false,
        message: `Connection test failed: ${error}`,
      };
    }
  }),
});

// Funções auxiliares
async function publishPhotoPost(
  pageId: string,
  accessToken: string,
  input: {
    postId: number;
    influencerId: number;
    caption: string;
    imageUrl?: string;
  }
): Promise<MetaPublishResponse> {
  const formData = new FormData();
  formData.append("image_url", input.imageUrl || "");
  formData.append("caption", input.caption);
  formData.append("access_token", accessToken);

  const response = await fetch(
    `${META_GRAPH_URL}/${pageId}/photos`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Meta API error: ${response.statusText}`);
  }

  return await response.json();
}

async function publishReel(
  pageId: string,
  accessToken: string,
  input: {
    postId: number;
    influencerId: number;
    caption: string;
    videoUrl: string;
    thumbnail?: string;
  }
): Promise<MetaPublishResponse> {
  // Primeiro, criar um container de mídia
  const containerFormData = new FormData();
  containerFormData.append("media_type", "REELS");
  containerFormData.append("video_url", input.videoUrl);
  containerFormData.append("caption", input.caption);
  if (input.thumbnail) {
    containerFormData.append("thumbnail_url", input.thumbnail);
  }
  containerFormData.append("access_token", accessToken);

  const containerResponse = await fetch(
    `${META_GRAPH_URL}/${pageId}/media`,
    {
      method: "POST",
      body: containerFormData,
    }
  );

  if (!containerResponse.ok) {
    throw new Error(`Meta API error: ${containerResponse.statusText}`);
  }

  const containerData: MetaMediaContainer = await containerResponse.json();

  // Depois, publicar o container
  const publishFormData = new FormData();
  publishFormData.append("creation_id", containerData.id);
  publishFormData.append("access_token", accessToken);

  const publishResponse = await fetch(
    `${META_GRAPH_URL}/${pageId}/media_publish`,
    {
      method: "POST",
      body: publishFormData,
    }
  );

  if (!publishResponse.ok) {
    throw new Error(`Meta API error: ${publishResponse.statusText}`);
  }

  return await publishResponse.json();
}

async function publishCarouselPost(
  pageId: string,
  accessToken: string,
  input: {
    postId: number;
    influencerId: number;
    caption: string;
    imageUrl?: string;
  }
): Promise<MetaPublishResponse> {
  const formData = new FormData();
  formData.append("message", input.caption);
  formData.append("access_token", accessToken);

  if (input.imageUrl) {
    formData.append("link", input.imageUrl);
  }

  const response = await fetch(
    `${META_GRAPH_URL}/${pageId}/feed`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Meta API error: ${response.statusText}`);
  }

  return await response.json();
}
