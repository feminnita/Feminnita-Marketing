import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { influencerPosts, influencers } from "../../drizzle/schema";
import { eq, desc, and, inArray } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";
import { invokeLLM } from "../_core/llm";

async function generatePostForInfluencer(influencer: {
  id: number;
  name: string;
  bio: string | null;
  personality: string | null;
}): Promise<{ caption: string; hashtags: string[] }> {
  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "Você é um especialista em marketing digital para moda e lifestyle. Gere posts para Instagram de influenciadoras virtuais da marca Feminnita Pijamas.",
      },
      {
        role: "user",
        content: `Crie um post para Instagram para a influenciadora ${influencer.name}.
Personalidade: ${influencer.personality || "jovem, descontraída e feminina"}
Bio: ${influencer.bio || "Influenciadora digital apaixonada por moda e conforto"}
Marca: Feminnita Pijamas (atacado)

Retorne um JSON com os campos:
- caption: legenda do post (máximo 150 caracteres, envolvente e autêntica)
- hashtags: array com 5-8 hashtags relevantes sem o símbolo #`,
      },
    ],
    outputSchema: {
      name: "post_content",
      schema: {
        type: "object",
        properties: {
          caption: { type: "string" },
          hashtags: { type: "array", items: { type: "string" } },
        },
        required: ["caption", "hashtags"],
        additionalProperties: false,
      },
      strict: true,
    },
  });

  const text =
    typeof result.choices[0].message.content === "string"
      ? result.choices[0].message.content
      : "";

  const parsed = JSON.parse(text);
  return {
    caption: parsed.caption || `Post de ${influencer.name} - Feminnita Pijamas`,
    hashtags: Array.isArray(parsed.hashtags)
      ? parsed.hashtags
      : ["feminnita", "pijamas", "conforto"],
  };
}

export const postApprovalEnhancedRouter = router({
  // Listar posts pendentes com integração de geração automática
  listPendingPostsWithGenerated: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(20),
        influencerId: z.number().optional(),
        includeGenerating: z.boolean().default(true),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];

        const myInfluencers = await db.select({ id: influencers.id }).from(influencers).where(eq(influencers.userId, ctx.user.id));
        const myIds = myInfluencers.map((i: any) => i.id);
        if (myIds.length === 0) return [];

        const whereClause = input.influencerId
          ? and(
              eq(influencerPosts.status, "draft"),
              eq(influencerPosts.influencerId, input.influencerId),
              inArray(influencerPosts.influencerId, myIds)
            )
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
    .input(
      z.object({
        influencerId: z.number(),
        influencerNickname: z.string(),
        includeProduct: z.boolean().default(true),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const influencerRows = await db
        .select()
        .from(influencers)
        .where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id)))
        .limit(1);

      if (influencerRows.length === 0) throw new Error("Influencer não encontrado ou acesso negado");

      const influencer = influencerRows[0] || {
        id: input.influencerId,
        name: input.influencerNickname,
        bio: null,
        personality: null,
      };

      const generatedPost = await generatePostForInfluencer(influencer);

      await db.insert(influencerPosts).values({
        influencerId: input.influencerId,
        platform: "instagram",
        caption: generatedPost.caption,
        hashtags: generatedPost.hashtags,
        status: "draft",
        aiGenerated: true,
        createdAt: new Date(),
      });

      const posts = await db
        .select()
        .from(influencerPosts)
        .where(
          and(
            eq(influencerPosts.influencerId, input.influencerId),
            eq(influencerPosts.status, "draft")
          )
        )
        .orderBy(desc(influencerPosts.createdAt))
        .limit(1);

      const postId = posts[0]?.id || 0;

      await notifyOwner({
        title: "Novo Post Gerado para Aprovação",
        content: `Um novo post foi gerado para ${influencer.name} e está aguardando sua aprovação. Acesse o Dashboard de Aprovação para revisar.`,
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
    }),

  // Gerar e enfileirar posts para todas as influenciadoras
  generateAndQueueAllPosts: protectedProcedure
    .input(
      z.object({
        includeProducts: z.boolean().default(true),
      })
    )
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const influencerList = await db
        .select()
        .from(influencers)
        .where(and(eq(influencers.isActive, true), eq(influencers.userId, ctx.user.id)));

      const results = [];

      for (const influencer of influencerList) {
        try {
          const generatedPost = await generatePostForInfluencer(influencer);

          await db.insert(influencerPosts).values({
            influencerId: influencer.id,
            platform: "instagram",
            caption: generatedPost.caption,
            hashtags: generatedPost.hashtags,
            status: "draft",
            aiGenerated: true,
            createdAt: new Date(),
          });

          const posts = await db
            .select()
            .from(influencerPosts)
            .where(
              and(
                eq(influencerPosts.influencerId, influencer.id),
                eq(influencerPosts.status, "draft")
              )
            )
            .orderBy(desc(influencerPosts.createdAt))
            .limit(1);

          results.push({
            influencerId: influencer.id,
            nickname: influencer.name,
            postId: posts[0]?.id || 0,
            status: "queued",
          });
        } catch (error) {
          console.error(`Erro ao gerar post para ${influencer.name}:`, error);
          results.push({
            influencerId: influencer.id,
            nickname: influencer.name,
            status: "error",
            error: "Falha ao gerar post",
          });
        }
      }

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
    }),

  // Obter contagem de posts pendentes
  getPendingCount: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return 0;

      const myInfluencers = await db.select({ id: influencers.id }).from(influencers).where(eq(influencers.userId, ctx.user.id));
      const myIds = myInfluencers.map((i: any) => i.id);
      if (myIds.length === 0) return 0;

      const posts = await db
        .select()
        .from(influencerPosts)
        .where(and(eq(influencerPosts.status, "draft"), inArray(influencerPosts.influencerId, myIds)));

      return posts.length;
    } catch (error) {
      console.error("Erro ao obter contagem de pendentes:", error);
      return 0;
    }
  }),

  // Obter posts pendentes por influenciadora
  getPendingByInfluencer: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) return {};

      const myInfluencers = await db.select({ id: influencers.id }).from(influencers).where(eq(influencers.userId, ctx.user.id));
      const myIds = myInfluencers.map((i: any) => i.id);
      if (myIds.length === 0) return {};

      const posts = await db
        .select()
        .from(influencerPosts)
        .where(and(eq(influencerPosts.status, "draft"), inArray(influencerPosts.influencerId, myIds)));

      const byInfluencer: Record<number, number> = {};
      posts.forEach((post: any) => {
        byInfluencer[post.influencerId] =
          (byInfluencer[post.influencerId] || 0) + 1;
      });

      return byInfluencer;
    } catch (error) {
      console.error("Erro ao obter pendentes por influenciadora:", error);
      return {};
    }
  }),

  // Notificar proprietário sobre novo post
  sendNotificationForNewPost: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        influencerName: z.string(),
        preview: z.string().optional(),
      })
    )
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
