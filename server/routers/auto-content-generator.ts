import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { z } from "zod";
import { getDb } from "../db";
import { influencers } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export const autoContentGeneratorRouter = router({
  // Gerar um post automático para uma influenciadora
  generatePost: protectedProcedure
    .input(z.object({
      influencerId: z.number(),
      includeProduct: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const [influencer] = await db
        .select()
        .from(influencers)
        .where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id)))
        .limit(1);

      if (!influencer) throw new Error("Influenciadora não encontrada");

      const name = influencer.name;
      const persona = influencer.personality || name;
      const bio = influencer.bio || `${name} é uma influenciadora da Feminnita.`;

      const prompt = `
Você é ${name}, conhecida como "${persona}".
Bio: ${bio}

Gere um post autêntico e engajador para o Instagram.

${input.includeProduct ? `
Inclua uma menção natural aos pijamas Feminnita de forma orgânica, sem parecer propaganda.
Adicione um call-to-action sutil para visitar a loja.
` : ""}

O post deve:
- Ser autêntico e refletir sua personalidade
- Ter 150-250 caracteres
- Incluir 3-5 hashtags relevantes
- Ser inspirador e engajador
- Mencionar produtos Feminnita se solicitado

Responda em JSON com este formato:
{
  "caption": "seu post aqui",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "cta": "call to action aqui",
  "productMention": "menção do produto aqui"
}
`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: "Você é um especialista em criar conteúdo autêntico para redes sociais."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "post_content",
            strict: true,
            schema: {
              type: "object",
              properties: {
                caption: { type: "string", description: "O conteúdo do post" },
                hashtags: { type: "array", items: { type: "string" }, description: "Hashtags relevantes" },
                cta: { type: "string", description: "Call to action" },
                productMention: { type: "string", description: "Menção do produto" }
              },
              required: ["caption", "hashtags", "cta", "productMention"],
              additionalProperties: false
            }
          }
        }
      });

      const messageContent = response.choices[0].message.content;
      const contentStr = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
      const content = JSON.parse(contentStr || "{}");

      return {
        influencerId: input.influencerId,
        influencerName: name,
        caption: content.caption,
        hashtags: content.hashtags,
        cta: content.cta,
        productMention: content.productMention,
        generatedAt: new Date(),
      };
    }),

  // Gerar posts para todas as influenciadoras do usuário
  generateAllPosts: protectedProcedure
    .input(z.object({
      includeProducts: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }): Promise<any[]> => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const userInfluencers = await db
        .select()
        .from(influencers)
        .where(and(eq(influencers.userId, ctx.user.id), eq(influencers.isActive, true)));

      const posts: any[] = [];

      for (const inf of userInfluencers) {
        try {
          const post: any = await autoContentGeneratorRouter.createCaller({ user: ctx.user } as any).generatePost({
            influencerId: inf.id,
            includeProduct: input.includeProducts,
          });
          posts.push(post);
        } catch (error) {
          console.error(`Erro ao gerar post para ${inf.name}:`, error);
          posts.push({
            influencerId: inf.id,
            influencerName: inf.name,
            error: "Falha ao gerar post"
          });
        }
      }

      return posts;
    }),

  // Gerar múltiplos posts para uma influenciadora
  generateMultiplePosts: protectedProcedure
    .input(z.object({
      influencerId: z.number(),
      count: z.number().min(1).max(5).default(3),
      includeProducts: z.boolean().default(true),
    }))
    .mutation(async ({ ctx, input }): Promise<any[]> => {
      const posts: any[] = [];

      for (let i = 0; i < input.count; i++) {
        try {
          const post: any = await autoContentGeneratorRouter.createCaller({ user: ctx.user } as any).generatePost({
            influencerId: input.influencerId,
            includeProduct: input.includeProducts,
          });
          posts.push(post);

          // Pequeno delay entre gerações para evitar rate limit
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
          console.error(`Erro ao gerar post ${i + 1}:`, error);
        }
      }

      return posts;
    }),

  // Listar influenciadoras do usuário
  listInfluencers: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];

      const rows = await db
        .select()
        .from(influencers)
        .where(and(eq(influencers.userId, ctx.user.id), eq(influencers.isActive, true)));

      return rows.map((inf) => ({
        id: inf.id,
        name: inf.name,
        persona: inf.personality || inf.name,
        bio: inf.bio || "",
      }));
    }),
});
