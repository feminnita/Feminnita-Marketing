import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { z } from "zod";

// Perfis das influenciadoras com contexto para IA
const influencerProfiles = {
  carol: {
    name: "Carol",
    persona: "A Mãe Moderna",
    bio: "Mãe de dois filhos, trabalha como freelancer, adora séries e pijamas confortáveis. Sempre buscando equilibrar maternidade, trabalho e autocuidado.",
    interests: ["maternidade", "trabalho remoto", "séries", "conforto", "autocuidado", "família"],
    postTopics: [
      "rotina de mãe moderna",
      "dicas de conforto",
      "noites de série",
      "trabalho remoto com filhos",
      "autocuidado para mães",
      "pijamas para relaxar"
    ]
  },
  renata: {
    name: "Renata",
    persona: "A Executiva Elegante",
    bio: "Executiva de sucesso, viaja a negócios, aprecia luxo e sofisticação. Acredita que qualidade de sono é essencial para performance.",
    interests: ["negócios", "viagens", "sofisticação", "performance", "bem-estar", "estilo"],
    postTopics: [
      "dicas de viagem executiva",
      "importância do sono",
      "rotina de executiva",
      "sofisticação no dia a dia",
      "recuperação após viagens",
      "pijamas sofisticados"
    ]
  },
  vanessa: {
    name: "Vanessa",
    persona: "A Criativa Artística",
    bio: "Designer criativa, trabalha em estúdio próprio, adora cores e designs únicos. Busca inspiração em tudo ao seu redor.",
    interests: ["design", "criatividade", "cores", "arte", "inovação", "estilo pessoal"],
    postTopics: [
      "processo criativo",
      "inspiração para designs",
      "dia no estúdio",
      "tendências de moda",
      "cores e padrões",
      "pijamas com designs únicos"
    ]
  },
  luiza: {
    name: "Luiza",
    persona: "A Fitness Aventureira",
    bio: "Personal trainer e aventureira, adora treinos intensos e atividades ao ar livre. Acredita que recuperação é tão importante quanto o treino.",
    interests: ["fitness", "aventura", "saúde", "performance", "recuperação", "bem-estar"],
    postTopics: [
      "treinos intensos",
      "recuperação muscular",
      "importância do sono",
      "aventuras ao ar livre",
      "nutrição e bem-estar",
      "pijamas para atletas"
    ]
  }
};

type InfluencerId = keyof typeof influencerProfiles;

export const autoContentGeneratorRouter = router({
  // Gerar um post automático para uma influenciadora
  generatePost: protectedProcedure
    .input(z.object({
      influencerId: z.enum(["carol", "renata", "vanessa", "luiza"]),
      includeProduct: z.boolean().default(true),
    }))
    .mutation(async ({ input }) => {
      const profile = influencerProfiles[input.influencerId as InfluencerId];
      
      if (!profile) {
        throw new Error("Influenciadora não encontrada");
      }

      // Selecionar um tópico aleatório
      const randomTopic = profile.postTopics[
        Math.floor(Math.random() * profile.postTopics.length)
      ];

      const prompt = `
Você é ${profile.name}, conhecida como "${profile.persona}".
Bio: ${profile.bio}

Gere um post autêntico e engajador sobre: "${randomTopic}"

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
        influencerName: profile.name,
        caption: content.caption,
        hashtags: content.hashtags,
        cta: content.cta,
        productMention: content.productMention,
        generatedAt: new Date(),
        topic: randomTopic
      };
    }),

  // Gerar posts para todas as influenciadoras
  generateAllPosts: protectedProcedure
    .input(z.object({
      includeProducts: z.boolean().default(true),
    }))
    .mutation(async ({ input }): Promise<any[]> => {
      const influencerIds: InfluencerId[] = ["carol", "renata", "vanessa", "luiza"];
      const posts: any[] = [];

      for (const id of influencerIds) {
        try {
          const post: any = await autoContentGeneratorRouter.createCaller({ user: null } as any).generatePost({
            influencerId: id,
            includeProduct: input.includeProducts,
          });
          posts.push(post);
        } catch (error) {
          console.error(`Erro ao gerar post para ${id}:`, error);
          posts.push({
            influencerId: id,
            error: "Falha ao gerar post"
          });
        }
      }

      return posts;
    }),

  // Gerar múltiplos posts para uma influenciadora
  generateMultiplePosts: protectedProcedure
    .input(z.object({
      influencerId: z.enum(["carol", "renata", "vanessa", "luiza"]),
      count: z.number().min(1).max(5).default(3),
      includeProducts: z.boolean().default(true),
    }))
    .mutation(async ({ input }): Promise<any[]> => {
      const posts: any[] = [];

      for (let i = 0; i < input.count; i++) {
        try {
          const post: any = await autoContentGeneratorRouter.createCaller({ user: null } as any).generatePost({
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

  // Obter perfil de uma influenciadora
  getInfluencerProfile: publicProcedure
    .input(z.object({
      influencerId: z.enum(["carol", "renata", "vanessa", "luiza"]),
    }))
    .query(({ input }) => {
      const profile = influencerProfiles[input.influencerId as InfluencerId];
      if (!profile) {
        throw new Error("Influenciadora não encontrada");
      }
      return profile;
    }),

  // Listar todas as influenciadoras
  listInfluencers: publicProcedure
    .query(() => {
      return Object.entries(influencerProfiles).map(([id, profile]) => ({
        id,
        name: profile.name,
        persona: profile.persona,
        bio: profile.bio
      }));
    })
});
