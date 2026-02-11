import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { influencerPosts, influencers } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

export const postApprovalEnhancedRouter = router({
  // Listar posts pendentes com integração de geração automática
  listPendingPostsWithGenerated: protectedProcedure
    .input(z.object({
      limit: z.number().default(20),
      influencerId: z.number().optional(),
      includeGenerating: z.boolean().default(true),
    }))
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        let query = db
          .select()
          .from(influencerPosts)
          .where(eq(influencerPosts.status, "draft"))
          .orderBy(desc(influencerPosts.createdAt))
          .limit(input.limit);

        const posts = await query;

        return posts.map((post: any) => ({
          id: post.id,
          influencerId: post.influencerId,
          caption: post.caption || "",
          hashtags: post.hashtags || [],
          platforms: [post.platform || "instagram"],
          productMention: post.productMention || "Feminnita",
          cta: post.cta || "Confira nossos produtos!",
          topic: post.topic || "Conteúdo",
          status: post.status,
          createdAt: post.createdAt,
          aiGenerated: post.aiGenerated || false,
          generatedAt: post.generatedAt,
        }));
      } catch (error) {
        console.error("Erro ao listar posts pendentes:", error);
        return [];
      }
    }),

  // Gerar novo post e adicionar à fila de aprovação
  generateAndQueuePost: protectedProcedure
    .input(z.object({
      influencerId: z.number(),
      influencerNickname: z.enum(["carol", "renata", "vanessa", "luiza"]),
      includeProduct: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Simular geração de post com IA
        const generatedPost = {
          caption: `Post gerado para ${input.influencerNickname} - ${new Date().toLocaleString()}`,
          hashtags: ["#feminnita", "#pijamas", "#conforto"],
          cta: "Confira nossos produtos!",
          productMention: "Pijamas Feminnita",
          topic: "Conteúdo automático",
        };

        // Salvar na fila de aprovação
        const result = await db.insert(influencerPosts).values({
          influencerId: input.influencerId,
          platform: "instagram",
          caption: generatedPost.caption,
          hashtags: generatedPost.hashtags,
          status: "draft",
          aiGenerated: true,
          createdAt: new Date(),
        });

        // Obter o ID do post inserido
        const posts = await db
          .select()
          .from(influencerPosts)
          .orderBy(desc(influencerPosts.createdAt))
          .limit(1);

        const postId = posts[0]?.id || 0;

        // Notificar proprietário
        await notifyOwner({
          title: "Novo Post Gerado para Aprovação",
          content: `Um novo post foi gerado para ${input.influencerNickname} e está aguardando sua aprovação. Acesse o Dashboard de Aprovação para revisar.`,
        });

        return {
          success: true,
          postId,
          influencerId: input.influencerId,
          influencerNickname: input.influencerNickname,
          status: "queued",
          generatedPost,
          generatedAt: new Date(),
        };
      } catch (error) {
        console.error("Erro ao gerar e enfileirar post:", error);
        throw error;
      }
    }),

  // Gerar e enfileirar posts para todas as influenciadoras
  generateAndQueueAllPosts: protectedProcedure
    .input(z.object({
      includeProducts: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const influencerList = [
          { id: 1, nickname: "carol" },
          { id: 2, nickname: "renata" },
          { id: 3, nickname: "vanessa" },
          { id: 4, nickname: "luiza" },
        ] as const;

        const results = [];

        for (const influencer of influencerList) {
          try {
            const generatedPost = {
              caption: `Post automático para ${influencer.nickname}`,
              hashtags: ["#feminnita", "#pijamas"],
              cta: "Confira!",
              productMention: "Pijamas Feminnita",
              topic: "Conteúdo automático",
            };

            const result = await db.insert(influencerPosts).values({
              influencerId: influencer.id,
              platform: "instagram",
              caption: generatedPost.caption,
              hashtags: generatedPost.hashtags,
              status: "draft",
              aiGenerated: true,
              createdAt: new Date(),
            });

            // Obter o ID do post inserido
            const posts = await db
              .select()
              .from(influencerPosts)
              .orderBy(desc(influencerPosts.createdAt))
              .limit(1);

            results.push({
              influencerId: influencer.id,
              nickname: influencer.nickname,
              postId: posts[0]?.id || 0,
              status: "queued",
            });
          } catch (error) {
            console.error(`Erro ao gerar post para ${influencer.nickname}:`, error);
            results.push({
              influencerId: influencer.id,
              nickname: influencer.nickname,
              status: "error",
              error: "Falha ao gerar post",
            });
          }
        }

        // Notificar proprietário
        const successCount = results.filter((r) => r.status === "queued").length;
        await notifyOwner({
          title: "Posts Gerados para Aprovação",
          content: `${successCount} posts foram gerados para as influenciadoras e estão aguardando sua aprovação.`,
        });

        return {
          success: true,
          totalGenerated: results.length,
          results,
          generatedAt: new Date(),
        };
      } catch (error) {
        console.error("Erro ao gerar posts para todas:", error);
        throw error;
      }
    }),

  // Obter contagem de posts pendentes
  getPendingCount: protectedProcedure
    .query(async () => {
      try {
        const db = await getDb();
        if (!db) return 0;

        const posts = await db
          .select()
          .from(influencerPosts)
          .where(eq(influencerPosts.status, "draft"));

        return posts.length;
      } catch (error) {
        console.error("Erro ao obter contagem de pendentes:", error);
        return 0;
      }
    }),

  // Obter posts pendentes por influenciadora
  getPendingByInfluencer: protectedProcedure
    .query(async () => {
      try {
        const db = await getDb();
        if (!db) return {};

        const posts = await db
          .select()
          .from(influencerPosts)
          .where(eq(influencerPosts.status, "draft"));

        const byInfluencer: Record<number, number> = {};
        posts.forEach((post: any) => {
          byInfluencer[post.influencerId] = (byInfluencer[post.influencerId] || 0) + 1;
        });

        return byInfluencer;
      } catch (error) {
        console.error("Erro ao obter pendentes por influenciadora:", error);
        return {};
      }
    }),

  // Notificar proprietário sobre novo post
  sendNotificationForNewPost: protectedProcedure
    .input(z.object({
      postId: z.number(),
      influencerName: z.string(),
      preview: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      try {
        const result = await notifyOwner({
          title: `Novo Post de ${input.influencerName}`,
          content: `Um novo post foi gerado e está aguardando aprovação. ${input.preview ? `Preview: "${input.preview.substring(0, 50)}..."` : ""}`,
        });

        return {
          success: result,
          notifiedAt: new Date(),
        };
      } catch (error) {
        console.error("Erro ao enviar notificação:", error);
        throw error;
      }
    }),
});
