import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { influencerPosts, influencers } from "../../drizzle/schema";

export const publicBlogsRouter = router({
  /**
   * Obter posts de uma influencer (público)
   */
  getInfluencerBlog: publicProcedure
    .input(
      z.object({
        influencerId: z.number(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return { influencer: null, posts: [] };

        // Obter dados da influencer
        const influencer = await db
          .select()
          .from(influencers)
          .where(eq(influencers.id, input.influencerId))
          .limit(1);

        if (!influencer || influencer.length === 0) {
          return { influencer: null, posts: [] };
        }

        // Obter posts publicados
        const posts = await db
          .select()
          .from(influencerPosts)
          .where(eq(influencerPosts.influencerId, input.influencerId))
          .limit(input.limit)
          .offset(input.offset);

        return {
          influencer: influencer[0],
          posts: posts.filter((p: any) => p.status === "published"),
        };
      } catch (error) {
        console.error("[Public Blogs] Erro ao obter blog:", error);
        return { influencer: null, posts: [] };
      }
    }),

  /**
   * Obter post específico (público)
   */
  getPost: publicProcedure
    .input(
      z.object({
        postId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const post = await db
          .select()
          .from(influencerPosts)
          .where(eq(influencerPosts.id, input.postId))
          .limit(1);

        if (!post || post.length === 0) {
          return null;
        }

        // Apenas retornar se estiver publicado
        const publishedPost = post[0];
        if (publishedPost.status !== "published") {
          return null;
        }

        return publishedPost;
      } catch (error) {
        console.error("[Public Blogs] Erro ao obter post:", error);
        return null;
      }
    }),

  /**
   * Listar todas as influencers (para navegação)
   */
  listInfluencers: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) return [];

      const allInfluencers = await db.select().from(influencers);
      // Deduplicar por nome (mantém o primeiro registro de cada nome)
      const seen = new Set<string>();
      return allInfluencers.filter((inf: any) => {
        const key = (inf.name || "").toLowerCase().trim();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } catch (error) {
      console.error("[Public Blogs] Erro ao listar influencers:", error);
      return [];
    }
  }),

  /**
   * Buscar posts por keyword (público)
   */
  searchPosts: publicProcedure
    .input(
      z.object({
        keyword: z.string(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        // Busca simples em conteúdo e caption
        const posts = await db
          .select()
          .from(influencerPosts)
          .limit(input.limit);

        return posts.filter(
          (p: any) =>
            p.status === "published" &&
            (p.content?.toLowerCase().includes(input.keyword.toLowerCase()) ||
              p.caption?.toLowerCase().includes(input.keyword.toLowerCase()))
        );
      } catch (error) {
        console.error("[Public Blogs] Erro ao buscar posts:", error);
        return [];
      }
    }),

  /**
   * Obter posts relacionados
   */
  getRelatedPosts: publicProcedure
    .input(
      z.object({
        postId: z.number(),
        limit: z.number().default(3),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const post = await db
          .select()
          .from(influencerPosts)
          .where(eq(influencerPosts.id, input.postId))
          .limit(1);

        if (!post || post.length === 0) {
          return [];
        }

        const currentPost = post[0];

        // Obter posts da mesma influencer
        const relatedPosts = await db
          .select()
          .from(influencerPosts)
          .where(eq(influencerPosts.influencerId, currentPost.influencerId))
          .limit(input.limit + 1);

        return relatedPosts
          .filter((p: any) => p.status === "published" && p.id !== input.postId)
          .slice(0, input.limit);
      } catch (error) {
        console.error("[Public Blogs] Erro ao obter posts relacionados:", error);
        return [];
      }
    }),

  /**
   * Obter estatísticas públicas de um blog
   */
  getBlogStats: publicProcedure
    .input(
      z.object({
        influencerId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const posts = await db
          .select()
          .from(influencerPosts)
          .where(eq(influencerPosts.influencerId, input.influencerId));

        const publishedPosts = posts.filter((p: any) => p.status === "published");
        const totalLikes = publishedPosts.reduce((sum: any, p: any) => sum + ((p as any).likes || 0), 0);
        const totalComments = publishedPosts.reduce((sum: any, p: any) => sum + ((p as any).comments || 0), 0);

        return {
          totalPosts: publishedPosts.length,
          totalLikes,
          totalComments,
          avgLikesPerPost: publishedPosts.length > 0 ? totalLikes / publishedPosts.length : 0,
          avgCommentsPerPost: publishedPosts.length > 0 ? totalComments / publishedPosts.length : 0,
        };
      } catch (error) {
        console.error("[Public Blogs] Erro ao obter estatísticas:", error);
        return null;
      }
    }),
});
