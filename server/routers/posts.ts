import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { influencerPosts, influencers, publicationQueueJobs } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const postsRouter = router({
  create: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        title: z.string().min(1),
        content: z.string().min(1),
        caption: z.string().optional(),
        platforms: z.array(z.string()).optional(),
        hashtags: z.array(z.string()).optional(),
        mediaUrls: z.array(z.string()).optional(),
        scheduledAt: z.string().datetime().optional(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Ensure this influencer belongs to the user
      const [influencer] = await db
        .select()
        .from(influencers)
        .where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id)))
        .limit(1);
      if (!influencer) throw new Error("Influenciadora não encontrada");

      await db.insert(influencerPosts).values({
        influencerId: input.influencerId,
        platform: input.platforms?.[0] ?? "instagram",
        content: input.content,
        caption: input.caption ?? input.content,
        hashtags: input.hashtags ?? [],
        mediaUrls: input.mediaUrls ?? [],
        status: "draft",
        aiGenerated: false,
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
      });

      const [created] = await db
        .select()
        .from(influencerPosts)
        .where(eq(influencerPosts.influencerId, input.influencerId))
        .orderBy(desc(influencerPosts.createdAt))
        .limit(1);

      return { success: true, post: created };
    }),

  schedule: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        scheduledAt: z.string().datetime(),
        platforms: z.array(z.enum(["instagram", "facebook", "tiktok", "whatsapp"])),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [post] = await db.select({ influencerId: influencerPosts.influencerId }).from(influencerPosts).where(eq(influencerPosts.id, input.postId)).limit(1);
      if (!post) throw new Error("Post não encontrado");
      const [owned] = await db.select({ id: influencers.id }).from(influencers).where(and(eq(influencers.id, post.influencerId!), eq(influencers.userId, ctx.user.id))).limit(1);
      if (!owned) throw new Error("Acesso negado");

      const scheduledDate = new Date(input.scheduledAt);

      await db
        .update(influencerPosts)
        .set({ status: "scheduled", scheduledAt: scheduledDate })
        .where(eq(influencerPosts.id, input.postId));

      // Create queue job for each platform
      for (const platform of input.platforms) {
        // Find matching instagram account for the influencer
        await db.insert(publicationQueueJobs).values({
          postId: input.postId,
          accountId: 1, // resolved at publication time by worker
          status: "waiting",
          retryCount: 0,
          maxRetries: 3,
          nextRetryTime: scheduledDate,
        });
      }

      return {
        success: true,
        message: `Post agendado para ${scheduledDate.toLocaleString("pt-BR")}`,
      };
    }),

  publish: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        platforms: z.array(z.enum(["instagram", "facebook", "tiktok", "whatsapp"])),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [post] = await db.select({ influencerId: influencerPosts.influencerId }).from(influencerPosts).where(eq(influencerPosts.id, input.postId)).limit(1);
      if (!post) throw new Error("Post não encontrado");
      const [owned] = await db.select({ id: influencers.id }).from(influencers).where(and(eq(influencers.id, post.influencerId!), eq(influencers.userId, ctx.user.id))).limit(1);
      if (!owned) throw new Error("Acesso negado");

      const now = new Date();

      await db
        .update(influencerPosts)
        .set({ status: "scheduled", scheduledAt: now })
        .where(eq(influencerPosts.id, input.postId));

      // Queue for immediate processing
      await db.insert(publicationQueueJobs).values({
        postId: input.postId,
        accountId: 1,
        status: "ready",
        retryCount: 0,
        maxRetries: 3,
        nextRetryTime: now,
      });

      return {
        success: true,
        message: "Post enviado para publicação",
        postId: input.postId,
      };
    }),

  getById: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [post] = await db
        .select()
        .from(influencerPosts)
        .where(eq(influencerPosts.id, input.postId))
        .limit(1);

      if (!post) throw new Error("Post não encontrado");

      const [owned] = await db.select({ id: influencers.id }).from(influencers).where(and(eq(influencers.id, post.influencerId!), eq(influencers.userId, ctx.user.id))).limit(1);
      if (!owned) throw new Error("Acesso negado");

      return post;
    }),

  list: protectedProcedure
    .input(
      z.object({
        status: z.enum(["draft", "scheduled", "published", "failed"]).optional(),
        influencerId: z.number().optional(),
        limit: z.number().default(20),
        offset: z.number().default(0),
      })
    )
    .query(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      // Get influencer IDs that belong to this user
      const userInfluencers = await db
        .select({ id: influencers.id })
        .from(influencers)
        .where(eq(influencers.userId, ctx.user.id));

      if (userInfluencers.length === 0) return { posts: [], total: 0 };

      const influencerIds = userInfluencers.map((i: { id: number }) => i.id);
      const targetId = input.influencerId && influencerIds.includes(input.influencerId)
        ? input.influencerId
        : null;

      const conditions = targetId
        ? [eq(influencerPosts.influencerId, targetId), ...(input.status ? [eq(influencerPosts.status, input.status)] : [])]
        : input.status
          ? [eq(influencerPosts.status, input.status)]
          : [];

      const query = db
        .select()
        .from(influencerPosts)
        .orderBy(desc(influencerPosts.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const posts = conditions.length > 0
        ? await query.where(conditions.length === 1 ? conditions[0] : and(...conditions))
        : await query;

      // Filter by user's influencers
      const filtered = targetId
        ? posts
        : posts.filter((p: any) => influencerIds.includes(p.influencerId));

      return { posts: filtered, total: filtered.length };
    }),

  delete: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [post] = await db.select({ influencerId: influencerPosts.influencerId }).from(influencerPosts).where(eq(influencerPosts.id, input.postId)).limit(1);
      if (!post) return { success: true }; // already gone
      const [owned] = await db.select({ id: influencers.id }).from(influencers).where(and(eq(influencers.id, post.influencerId!), eq(influencers.userId, ctx.user.id))).limit(1);
      if (!owned) throw new Error("Acesso negado");

      await db
        .delete(influencerPosts)
        .where(eq(influencerPosts.id, input.postId));

      return { success: true };
    }),

  uploadMedia: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        mediaType: z.enum(["image", "video"]),
        fileName: z.string(),
        fileSize: z.number(),
        mediaUrl: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [post] = await db
        .select()
        .from(influencerPosts)
        .where(eq(influencerPosts.id, input.postId))
        .limit(1);

      if (!post) throw new Error("Post não encontrado");

      const [owned] = await db.select({ id: influencers.id }).from(influencers).where(and(eq(influencers.id, post.influencerId!), eq(influencers.userId, ctx.user.id))).limit(1);
      if (!owned) throw new Error("Acesso negado");

      const existing: string[] = Array.isArray(post.mediaUrls) ? post.mediaUrls : [];
      await db
        .update(influencerPosts)
        .set({ mediaUrls: [...existing, input.mediaUrl] })
        .where(eq(influencerPosts.id, input.postId));

      return { success: true, mediaUrl: input.mediaUrl };
    }),

  getHistory: protectedProcedure
    .input(z.object({ influencerId: z.number() }))
    .query(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [owned] = await db.select({ id: influencers.id }).from(influencers).where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
      if (!owned) return { influencerId: input.influencerId, posts: [] };

      const posts = await db
        .select()
        .from(influencerPosts)
        .where(and(
          eq(influencerPosts.influencerId, input.influencerId),
          eq(influencerPosts.status, "published")
        ))
        .orderBy(desc(influencerPosts.publishedAt))
        .limit(50);

      return { influencerId: input.influencerId, posts };
    }),
});
