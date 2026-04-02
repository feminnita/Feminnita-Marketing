import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { influencerPosts, influencers, aiTrainingData } from "../../drizzle/schema";
import { eq, desc, and, inArray } from "drizzle-orm";

export const postApprovalRouter = router({
  // Listar posts pendentes de aprovação
  listPendingPosts: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      influencerId: z.number().optional(),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const myInfluencers = await db
          .select({ id: influencers.id })
          .from(influencers)
          .where(eq(influencers.userId, ctx.user.id));
        const myIds = myInfluencers.map((i: any) => i.id);
        if (myIds.length === 0) return [];

        const whereClause = input.influencerId
          ? and(eq(influencerPosts.status, "draft"), eq(influencerPosts.influencerId, input.influencerId), inArray(influencerPosts.influencerId, myIds))
          : and(eq(influencerPosts.status, "draft"), inArray(influencerPosts.influencerId, myIds));

        const posts = await db
          .select()
          .from(influencerPosts)
          .where(whereClause)
          .orderBy(desc(influencerPosts.createdAt))
          .limit(input.limit);

        return posts.map((post: any) => ({
          id: post.id,
          influencerId: post.influencerId,
          caption: post.caption || "",
          hashtags: post.hashtags || [],
          platforms: [post.platform || "instagram"],
          productMention: "Feminnita",
          cta: "Confira nossos produtos!",
          topic: "Conteúdo",
          status: post.status,
          createdAt: post.createdAt,
        }));
      } catch (error) {
        console.error("Erro ao listar posts pendentes:", error);
        return [];
      }
    }),

  // Aprovar um post
  approvePost: protectedProcedure
    .input(z.object({
      postId: z.number(),
      scheduledFor: z.date().optional(),
      platforms: z.array(z.enum(["instagram", "tiktok", "blog"])).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify ownership
        const [post] = await db.select({ influencerId: influencerPosts.influencerId }).from(influencerPosts).where(eq(influencerPosts.id, input.postId)).limit(1);
        if (!post) throw new Error("Post não encontrado");
        const [owned] = await db.select({ id: influencers.id }).from(influencers).where(and(eq(influencers.id, post.influencerId ?? 0), eq(influencers.userId, ctx.user.id))).limit(1);
        if (!owned) throw new Error("Acesso negado");

        // Atualizar status para scheduled
        await db
          .update(influencerPosts)
          .set({
            status: "scheduled",
            scheduledAt: input.scheduledFor || new Date(),
            approvedBy: ctx.user?.name || "Admin",
            approvedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(influencerPosts.id, input.postId));

        return {
          success: true,
          postId: input.postId,
          status: "approved",
          scheduledFor: input.scheduledFor || new Date(),
          platforms: input.platforms || ["instagram", "tiktok"],
          approvedBy: ctx.user?.name || "Admin",
          approvedAt: new Date(),
        };
      } catch (error) {
        console.error("Erro ao aprovar post:", error);
        throw error;
      }
    }),

  // Rejeitar um post
  rejectPost: protectedProcedure
    .input(z.object({
      postId: z.number(),
      reason: z.string(),
      feedback: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const [post] = await db.select({ influencerId: influencerPosts.influencerId }).from(influencerPosts).where(eq(influencerPosts.id, input.postId)).limit(1);
        if (!post) throw new Error("Post não encontrado");
        const [owned] = await db.select({ id: influencers.id }).from(influencers).where(and(eq(influencers.id, post.influencerId ?? 0), eq(influencers.userId, ctx.user.id))).limit(1);
        if (!owned) throw new Error("Acesso negado");

        // Atualizar status para failed (ou criar novo status)
        await db
          .update(influencerPosts)
          .set({
            status: "failed",
            updatedAt: new Date(),
          })
          .where(eq(influencerPosts.id, input.postId));

        return {
          success: true,
          postId: input.postId,
          status: "rejected",
          reason: input.reason,
          feedback: input.feedback,
          rejectedBy: ctx.user?.name || "Admin",
          rejectedAt: new Date(),
        };
      } catch (error) {
        console.error("Erro ao rejeitar post:", error);
        throw error;
      }
    }),

  // Editar um post antes de aprovar
  editPost: protectedProcedure
    .input(z.object({
      postId: z.number(),
      caption: z.string().optional(),
      hashtags: z.array(z.string()).optional(),
      cta: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const [post] = await db.select({ influencerId: influencerPosts.influencerId }).from(influencerPosts).where(eq(influencerPosts.id, input.postId)).limit(1);
        if (!post) throw new Error("Post não encontrado");
        const [owned] = await db.select({ id: influencers.id }).from(influencers).where(and(eq(influencers.id, post.influencerId ?? 0), eq(influencers.userId, ctx.user.id))).limit(1);
        if (!owned) throw new Error("Acesso negado");

        // Atualizar post
        await db
          .update(influencerPosts)
          .set({
            caption: input.caption,
            hashtags: input.hashtags,
            updatedAt: new Date(),
          })
          .where(eq(influencerPosts.id, input.postId));

        return {
          success: true,
          postId: input.postId,
          status: "edited",
          caption: input.caption,
          hashtags: input.hashtags,
          cta: input.cta,
          editedAt: new Date(),
        };
      } catch (error) {
        console.error("Erro ao editar post:", error);
        throw error;
      }
    }),

  // Salvar feedback para treinar IA (persiste em ai_training_data)
  saveFeedback: protectedProcedure
    .input(z.object({
      postId: z.number(),
      influencerId: z.number(),
      feedback: z.string(),
      rating: z.number().min(1).max(5),
      improvements: z.array(z.string()).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const qualityMap: Record<number, "excellent" | "good" | "poor"> = {
          5: "excellent", 4: "excellent", 3: "good", 2: "poor", 1: "poor",
        };

        await db.insert(aiTrainingData).values({
          userId: ctx.user.id,
          userMessage: `Feedback sobre post ${input.postId}: ${input.feedback}`,
          expectedResponse: input.improvements?.join("; ") || input.feedback,
          category: "feedback_post",
          shouldEscalate: false,
          quality: qualityMap[input.rating] || "good",
          isActive: true,
        });

        return {
          success: true,
          postId: input.postId,
          influencerId: input.influencerId,
          feedback: input.feedback,
          rating: input.rating,
          improvements: input.improvements,
          savedAt: new Date(),
        };
      } catch (error) {
        console.error("Erro ao salvar feedback:", error);
        throw error;
      }
    }),

  // Obter histórico de posts publicados
  getPublishedHistory: protectedProcedure
    .input(z.object({
      influencerId: z.number().optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const myInfluencers = await db
          .select({ id: influencers.id })
          .from(influencers)
          .where(eq(influencers.userId, ctx.user.id));
        const myIds = myInfluencers.map((i: any) => i.id);
        if (myIds.length === 0) return [];

        const whereClause = input.influencerId
          ? and(eq(influencerPosts.status, "published"), eq(influencerPosts.influencerId, input.influencerId), inArray(influencerPosts.influencerId, myIds))
          : and(eq(influencerPosts.status, "published"), inArray(influencerPosts.influencerId, myIds));

        let query = db
          .select()
          .from(influencerPosts)
          .where(whereClause)
          .orderBy(desc(influencerPosts.publishedAt))
          .limit(input.limit);

        const posts = await query;

        return posts.map((post: any) => ({
          id: post.id,
          influencerId: post.influencerId,
          caption: post.caption || "",
          platforms: [post.platform || "instagram"],
          publishedAt: post.publishedAt,
          status: post.status,
          engagement: {
            likes: post.engagementMetrics?.likes || 0,
            comments: post.engagementMetrics?.comments || 0,
            shares: post.engagementMetrics?.shares || 0,
          },
        }));
      } catch (error) {
        console.error("Erro ao obter histórico:", error);
        return [];
      }
    }),

  // Obter estatísticas de aprovação
  getApprovalStats: protectedProcedure
    .query(async ({ ctx }) => {
      try {
        const db = await getDb();
        if (!db) {
          return {
            totalGenerated: 0,
            totalApproved: 0,
            totalRejected: 0,
            totalPending: 0,
            totalPublished: 0,
            approvalRate: 0,
            byInfluencer: {},
          };
        }

        const myInfluencers = await db
          .select()
          .from(influencers)
          .where(eq(influencers.userId, ctx.user.id));
        const myIds = myInfluencers.map((i: any) => i.id);

        const allPosts = myIds.length > 0
          ? await db.select().from(influencerPosts).where(inArray(influencerPosts.influencerId, myIds))
          : [];

        const totalGenerated = allPosts.length;
        const totalApproved = allPosts.filter((p: any) => p.status === "scheduled").length;
        const totalRejected = allPosts.filter((p: any) => p.status === "failed").length;
        const totalPending = allPosts.filter((p: any) => p.status === "draft").length;
        const totalPublished = allPosts.filter((p: any) => p.status === "published").length;

        const approvalRate =
          totalGenerated > 0
            ? Math.round((totalApproved / totalGenerated) * 100)
            : 0;

        const byInfluencer: Record<string, { approved: number; rejected: number; pending: number }> = {};

        for (const inf of myInfluencers) {
          const infPosts = allPosts.filter((p: any) => p.influencerId === inf.id);
          byInfluencer[(inf as any).name.toLowerCase()] = {
            approved: infPosts.filter((p: any) => p.status === "scheduled" || p.status === "published").length,
            rejected: infPosts.filter((p: any) => p.status === "failed").length,
            pending: infPosts.filter((p: any) => p.status === "draft").length,
          };
        }

        return {
          totalGenerated,
          totalApproved,
          totalRejected,
          totalPending,
          totalPublished,
          approvalRate,
          byInfluencer,
        };
      } catch (error) {
        console.error("Erro ao obter estatísticas:", error);
        throw error;
      }
    }),
});
