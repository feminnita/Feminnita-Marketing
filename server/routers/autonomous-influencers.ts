import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { influencers, influencerPosts, influencerTrends, influencerPerformance } from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";
import { TRPCError } from "@trpc/server";
import { eq, desc, and } from "drizzle-orm";

/**
 * Autonomous Influencers Router
 * Manages AI-powered autonomous influencers (Carol, Renata, Vanessa, Luiza)
 */

export const autonomousInfluencersRouter = router({
  /**
   * Generate content using AI for an influencer
   */
  generateContent: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        theme: z.string(),
        style: z.string().optional(),
        platform: z.enum(["instagram", "tiktok", "youtube", "blog"]),
        contentType: z.enum(["image", "video", "carousel", "story"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const influencerResult = await db.select().from(influencers)
          .where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id)))
          .limit(1);
        const influencer = influencerResult.length > 0 ? influencerResult[0] : null;

        if (!influencer) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Influencer não encontrado",
          });
        }

        // Generate content using LLM
        const prompt = `
Você é ${influencer.name}, uma influenciadora de pijamas da Feminnita.
Personalidade: ${influencer.personality}

Crie um conteúdo para ${input.platform} do tipo ${input.contentType}.
Tema: ${input.theme}
Estilo: ${input.style || "natural e autêntico"}

Retorne um JSON com caption, hashtags, contentIdeas, bestTimeToPost e estimatedReach.
        `;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é um especialista em criação de conteúdo para redes sociais.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const messageContent = response.choices[0].message.content;
        const contentStr = typeof messageContent === "string" ? messageContent : JSON.stringify(messageContent);
        const content = JSON.parse(contentStr || "{}");

        // Save generated content to database
        const post = await db.insert(influencerPosts).values({
          influencerId: input.influencerId,
          platform: input.platform,
          content: content.caption || "",
          caption: content.caption || "",
          hashtags: content.hashtags || [],
          status: "draft",
          aiGenerated: true,
        });

        return {
          success: true,
          postId: post[0],
          content,
          message: "Conteúdo gerado com sucesso",
        };
      } catch (error) {
        console.error("Error generating content:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao gerar conteúdo",
        });
      }
    }),

  /**
   * Monitor trends in real-time
   */
  monitorTrends: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        platform: z.enum(["instagram", "tiktok", "youtube"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify ownership
        const owned = await db.select({ id: influencers.id }).from(influencers)
          .where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
        if (owned.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Influencer não encontrado" });

        const prompt = `
Analise as tendências atuais do ${input.platform} para conteúdo de moda/pijamas.
Retorne um JSON com um array de trends contendo: name, category, relevanceScore, momentum, estimatedReach, recommendedPostType.
        `;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é um especialista em análise de tendências de redes sociais.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const messageContent = response.choices[0].message.content;
        const trendsStr = typeof messageContent === "string" ? messageContent : JSON.stringify(messageContent);
        const trends = JSON.parse(trendsStr || "{}");

        // Save trends to database
        for (const trend of trends.trends || []) {
          await db.insert(influencerTrends).values({
            influencerId: input.influencerId,
            platform: input.platform,
            trendName: trend.name,
            trendCategory: trend.category,
            relevanceScore: trend.relevanceScore,
            momentum: trend.momentum,
            estimatedReach: trend.estimatedReach,
            recommendedPostType: trend.recommendedPostType,
          });
        }

        return {
          success: true,
          trendsFound: trends.trends?.length || 0,
          trends: trends.trends,
        };
      } catch (error) {
        console.error("Error monitoring trends:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao monitorar tendências",
        });
      }
    }),

  /**
   * Schedule post for automatic publishing
   */
  schedulePost: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        scheduledAt: z.date(),
        platform: z.enum(["instagram", "tiktok", "youtube", "blog"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify the post belongs to a user-owned influencer
        const post = await db.select({ influencerId: influencerPosts.influencerId }).from(influencerPosts)
          .where(eq(influencerPosts.id, input.postId)).limit(1);
        if (post.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Post não encontrado" });
        const owned = await db.select({ id: influencers.id }).from(influencers)
          .where(and(eq(influencers.id, post[0].influencerId ?? 0), eq(influencers.userId, ctx.user.id))).limit(1);
        if (owned.length === 0) throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });

        await db
          .update(influencerPosts)
          .set({
            scheduledAt: input.scheduledAt,
            status: "scheduled",
          })
          .where(eq(influencerPosts.id, input.postId));

        await notifyOwner({
          title: "Post agendado com sucesso",
          content: `Post #${input.postId} agendado para ${input.scheduledAt.toLocaleString("pt-BR")}`,
        });

        return {
          success: true,
          message: "Post agendado com sucesso",
          scheduledAt: input.scheduledAt,
        };
      } catch (error) {
        console.error("Error scheduling post:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao agendar post",
        });
      }
    }),

  /**
   * Get influencer performance metrics
   */
  getPerformanceMetrics: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        days: z.number().default(30),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify ownership
        const owned = await db.select({ id: influencers.id }).from(influencers)
          .where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
        if (owned.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Influencer não encontrado" });

        const metrics = await db.select().from(influencerPerformance).where(eq(influencerPerformance.influencerId, input.influencerId)).orderBy(desc(influencerPerformance.date)).limit(input.days);

        const totalEngagement = metrics.reduce((sum: number, m: any) => sum + (m.totalEngagement || 0), 0);
        const avgEngagementRate =
          metrics.length > 0
            ? metrics.reduce((sum: number, m: any) => sum + parseFloat(m.engagementRate?.toString() || "0"), 0) /
              metrics.length
            : 0;

        const latestFollowers = metrics[0]?.totalFollowers || 0;
        const oldestFollowers = metrics[metrics.length - 1]?.totalFollowers || 0;
        const followerGrowth = latestFollowers - oldestFollowers;

        return {
          success: true,
          metrics: {
            totalEngagement,
            avgEngagementRate: avgEngagementRate.toFixed(2),
            followerGrowth,
            currentFollowers: latestFollowers,
            metricsCount: metrics.length,
            data: metrics,
          },
        };
      } catch (error) {
        console.error("Error getting performance metrics:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter métricas de performance",
        });
      }
    }),

  /**
   * List all influencers
   */
  listInfluencers: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const allInfluencers = await db.select().from(influencers).where(eq(influencers.userId, ctx.user.id));

      return {
        success: true,
        influencers: allInfluencers,
        count: allInfluencers.length,
      };
    } catch (error) {
      console.error("Error listing influencers:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Erro ao listar influenciadoras",
      });
    }
  }),

  /**
   * Create new influencer
   */
  createInfluencer: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        personality: z.string(),
        bio: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const result = await db.insert(influencers).values({
          userId: ctx.user.id,
          name: input.name,
          personality: input.personality,
          bio: input.bio,
          isActive: true,
        });

        await notifyOwner({
          title: "Influenciadora criada",
          content: `${input.name} - ${input.personality}`,
        });

        return {
          success: true,
          influencerId: result[0],
          message: `Influenciadora ${input.name} criada com sucesso`,
        };
      } catch (error) {
        console.error("Error creating influencer:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar influenciadora",
        });
      }
    }),

  /**
   * Get scheduled posts for an influencer
   */
  getScheduledPosts: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Verify ownership
        const owned = await db.select({ id: influencers.id }).from(influencers)
          .where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
        if (owned.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Influencer não encontrado" });

        const posts = await db.select().from(influencerPosts).where(eq(influencerPosts.influencerId, input.influencerId)).orderBy(desc(influencerPosts.scheduledAt));

        const scheduled = posts.filter((p: any) => p.status === "scheduled");
        const published = posts.filter((p: any) => p.status === "published");
        const drafts = posts.filter((p: any) => p.status === "draft");

        return {
          success: true,
          scheduled,
          published,
          drafts,
          total: posts.length,
        };
      } catch (error) {
        console.error("Error getting scheduled posts:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter posts agendados",
        });
      }
    }),
});
