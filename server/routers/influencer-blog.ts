import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { influencerPosts, influencers, publicationQueueJobs } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

export const influencerBlogRouter = router({
  /**
   * Obter posts de uma influencer
   */
  getPosts: publicProcedure
    .input(
      z.object({
        influencerId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];
        const posts = await db
          .select()
          .from(influencerPosts)
          .where(eq(influencerPosts.influencerId, input.influencerId))
          .orderBy(desc(influencerPosts.createdAt));
        return posts;
      } catch (error) {
        console.error('[Influencer Blog] Erro ao buscar posts:', error);
        return [];
      }
    }),

  /**
   * Criar novo post
   */
  createPost: protectedProcedure
    .input(
      z.object({
        id: z.number().optional(),
        influencerId: z.number(),
        content: z.string().min(1),
        caption: z.string().optional(),
        hashtags: z.array(z.string()).optional(),
        scheduledAt: z.date().optional(),
        platform: z.string().default("instagram"),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        if (input.id) {
          // Update existing post
          await db
            .update(influencerPosts)
            .set({
              content: input.content,
              caption: input.caption,
              hashtags: input.hashtags,
              scheduledAt: input.scheduledAt,
              platform: input.platform,
              updatedAt: new Date(),
            })
            .where(eq(influencerPosts.id, input.id));
          return { success: true, id: input.id };
        } else {
          // Create new post
          const status = input.scheduledAt ? "scheduled" : "draft";
          const result = await db.insert(influencerPosts).values({
            influencerId: input.influencerId,
            content: input.content,
            caption: input.caption,
            hashtags: input.hashtags,
            scheduledAt: input.scheduledAt,
            platform: input.platform,
            status,
            aiGenerated: false,
            createdAt: new Date(),
            updatedAt: new Date(),
          });
          return { success: true, id: (result as any).insertId };
        }
      } catch (error) {
        console.error('[Influencer Blog] Erro ao criar post:', error);
        throw error;
      }
    }),

  /**
   * Deletar post
   */
  deletePost: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db.delete(influencerPosts).where(eq(influencerPosts.id, input.postId));
        return { success: true };
      } catch (error) {
        console.error('[Influencer Blog] Erro ao deletar post:', error);
        throw error;
      }
    }),

  /**
   * Publicar post agora (imediatamente)
   */
  publishNow: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Get the post
        const posts = await db
          .select()
          .from(influencerPosts)
          .where(eq(influencerPosts.id, input.postId))
          .limit(1);

        if (posts.length === 0) {
          throw new Error("Post não encontrado");
        }

        // Update status to published
        await db
          .update(influencerPosts)
          .set({
            status: "published",
            publishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(influencerPosts.id, input.postId));

        // TODO: Integrate with Meta Ads API to publish
        // This would call the Meta Graph API to publish to Instagram/Facebook

        // Buscar conta Instagram associada à influencer deste post
        const post = posts[0];
        const { instagramAccounts } = await import("../../drizzle/schema");
        const igAccounts = await db
          .select()
          .from(instagramAccounts)
          .where(eq(instagramAccounts.influencerId, post.influencerId ?? 0))
          .limit(1);

        if (igAccounts.length > 0) {
          await db.insert(publicationQueueJobs).values({
            postId: input.postId,
            accountId: igAccounts[0].id,
            retryCount: 0,
            maxRetries: 3,
            status: "ready",
          });
        }

        return { success: true };
      } catch (error) {
        console.error('[Influencer Blog] Erro ao publicar post:', error);
        throw error;
      }
    }),

  /**
   * Listar todas as influencers
   */
  listInfluencers: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return [];
      const allInfluencers = await db.select().from(influencers);
      return allInfluencers;
    } catch (error) {
      console.error('[Influencer Blog] Erro ao listar influencers:', error);
      return [];
    }
  }),
});
