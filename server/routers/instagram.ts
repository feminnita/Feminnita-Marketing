import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { fetchInstagramPosts, publishInstagramPost, publishFacebookPost } from "../instagram";

export const instagramRouter = router({
  /**
   * Busca os últimos posts do Instagram da Feminnita
   */
  fetchPosts: protectedProcedure
    .input(z.object({
      limit: z.number().default(15),
    }))
    .query(async ({ input }) => {
      try {
        const instagramAccountId = process.env.VITE_APP_ID || "";
        const accessToken = process.env.META_ACCESS_TOKEN || "";

        if (!instagramAccountId || !accessToken) {
          throw new Error("Instagram credentials not configured");
        }

        const realInstagramAccountId = process.env.INSTAGRAM_ACCOUNT_ID || instagramAccountId;

        const posts = await fetchInstagramPosts(
          realInstagramAccountId,
          accessToken,
          input.limit
        );

        return {
          success: true,
          posts,
          count: posts.length,
        };
      } catch (error) {
        console.error("Failed to fetch Instagram posts:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
          posts: [],
        };
      }
    }),

  /**
   * Publica um post no Instagram (agendado ou imediato)
   */
  publishPost: protectedProcedure
    .input(z.object({
      caption: z.string(),
      imageUrl: z.string().url(),
      scheduledPublishTime: z.string().optional(),
      platforms: z.array(z.enum(["instagram", "facebook"])).default(["instagram"]),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const instagramAccountId = "59536615191";
        const pageId = process.env.META_PAGE_ID || "";
        const accessToken = process.env.META_ACCESS_TOKEN || "";

        if (!accessToken) {
          throw new Error("Meta access token not configured");
        }

        const results: any = {};

        // Publicar no Instagram
        if (input.platforms.includes("instagram")) {
          try {
            results.instagram = await publishInstagramPost(
              instagramAccountId,
              accessToken,
              input.caption,
              input.imageUrl,
              input.scheduledPublishTime
            );
          } catch (error) {
            results.instagram = {
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        }

        // Publicar no Facebook
        if (input.platforms.includes("facebook") && pageId) {
          try {
            results.facebook = await publishFacebookPost(
              pageId,
              accessToken,
              input.caption,
              input.imageUrl,
              input.scheduledPublishTime
            );
          } catch (error) {
            results.facebook = {
              error: error instanceof Error ? error.message : "Unknown error",
            };
          }
        }

        return {
          success: true,
          results,
        };
      } catch (error) {
        console.error("Failed to publish post:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),
});
