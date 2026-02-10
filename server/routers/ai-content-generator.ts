import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";

// Perfis das influenciadoras para contexto de IA
const INFLUENCER_PROFILES = {
  carol: {
    name: "Carol",
    persona: "A Mãe Moderna",
    description: "Mãe de dois filhos, trabalha como executiva de marketing, ama séries e pijamas confortáveis",
    topics: ["maternidade", "trabalho remoto", "rotina familiar", "autocuidado", "moda confortável"],
    tone: "Acolhedor, autêntico, inspirador",
    hashtags: ["#MãeModerna", "#AutocuidadoMãe", "#RotinaMãe", "#MãeQueTrabalha", "#PijamaConfortável"],
  },
  renata: {
    name: "Renata",
    persona: "A Executiva Elegante",
    description: "Executiva de sucesso, viaja constantemente, aprecia moda sofisticada e bem-estar",
    topics: ["carreira", "viagens de negócios", "moda executiva", "bem-estar", "produtividade"],
    tone: "Profissional, sofisticado, inspirador",
    hashtags: ["#ExecutivaElegante", "#CarreiraDeMulther", "#ViagensDeBusiness", "#ModoExecutivo", "#BemEstarExecutivo"],
  },
  vanessa: {
    name: "Vanessa",
    persona: "A Criativa Artística",
    description: "Designer criativa, apaixonada por arte e design, cria conteúdo visual único",
    topics: ["design", "arte", "criatividade", "moda criativa", "inovação"],
    tone: "Criativo, inspirador, artístico",
    hashtags: ["#CriativaArtística", "#DesignDePijamas", "#ArteCriativa", "#ModoArtístico", "#CriatividadeNoDesign"],
  },
  luiza: {
    name: "Luiza",
    persona: "A Fitness Aventureira",
    description: "Atleta fitness, adora aventuras, viagens e estilo de vida saudável",
    topics: ["fitness", "aventura", "saúde", "treinos", "estilo de vida ativo"],
    tone: "Energético, motivador, inspirador",
    hashtags: ["#FitnessAventureira", "#VidaSaudável", "#TreinoEmCasa", "#AventuraFitness", "#CorpoSaudável"],
  },
};

export const aiContentGeneratorRouter = router({
  // Gerar caption com IA
  generateCaption: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        influencerName: z.enum(["carol", "renata", "vanessa", "luiza"]),
        topic: z.string(),
        type: z.enum(["product", "lifestyle", "tip", "story"]),
        productName: z.string().optional(),
        additionalContext: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const profile = INFLUENCER_PROFILES[input.influencerName];

        const prompt = buildCaptionPrompt(profile, input);

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um especialista em criar conteúdo para redes sociais. 
              Crie captions autênticas, engajantes e que reflitam a personalidade da influenciadora.
              Use um tom ${profile.tone.toLowerCase()}.
              Mantenha a caption concisa (máximo 150 caracteres para Instagram, máximo 280 para Twitter).
              Inclua emojis relevantes.`,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const caption =
          response.choices[0]?.message?.content || "Post agendado";

        return {
          success: true,
          data: {
            caption,
            influencer: input.influencerName,
            type: input.type,
          },
        };
      } catch (error) {
        console.error("Erro ao gerar caption:", error);
        throw new Error(`Falha ao gerar caption: ${error}`);
      }
    }),

  // Gerar hashtags com IA
  generateHashtags: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        influencerName: z.enum(["carol", "renata", "vanessa", "luiza"]),
        caption: z.string(),
        topic: z.string(),
        count: z.number().default(10),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const profile = INFLUENCER_PROFILES[input.influencerName];

        const prompt = `Gere ${input.count} hashtags relevantes para este post:
        
Influenciadora: ${profile.name} (${profile.persona})
Tópico: ${input.topic}
Caption: ${input.caption}

Hashtags sugeridas pelo perfil: ${profile.hashtags.join(", ")}

Retorne apenas as hashtags separadas por espaço, começando com #.`;

        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "Você é um especialista em SEO e redes sociais. Gere hashtags relevantes e populares.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const hashtagsText =
          typeof response.choices[0]?.message?.content === "string"
            ? response.choices[0].message.content
            : "";
        const hashtags = hashtagsText
          .split(" ")
          .filter((tag: string) => tag.startsWith("#"))
          .slice(0, input.count);

        return {
          success: true,
          data: {
            hashtags,
            count: hashtags.length,
          },
        };
      } catch (error) {
        console.error("Erro ao gerar hashtags:", error);
        throw new Error(`Falha ao gerar hashtags: ${error}`);
      }
    }),

  // Gerar post completo com IA
  generateFullPost: protectedProcedure
    .input(
      z.object({
        influencerId: z.number(),
        influencerName: z.enum(["carol", "renata", "vanessa", "luiza"]),
        topic: z.string(),
        type: z.enum(["product", "lifestyle", "tip", "story"]),
        productName: z.string().optional(),
        additionalContext: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const profile = INFLUENCER_PROFILES[input.influencerName];

        // Gerar caption
        const captionPrompt = buildCaptionPrompt(profile, input);

        const captionResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um especialista em criar conteúdo para redes sociais.
              Crie captions autênticas que reflitam a personalidade de ${profile.name}.
              Tone: ${profile.tone}`,
            },
            {
              role: "user",
              content: captionPrompt,
            },
          ],
        });

        const caption =
          captionResponse.choices[0]?.message?.content ||
          "Post agendado";

        // Gerar hashtags
        const hashtagsPrompt = `Gere 10 hashtags relevantes para este post de ${profile.name}:
        
Tópico: ${input.topic}
Caption: ${caption}

Hashtags sugeridas: ${profile.hashtags.join(", ")}

Retorne apenas as hashtags separadas por espaço.`;

        const hashtagsResponse = await invokeLLM({
          messages: [
            {
              role: "system",
              content:
                "Você é um especialista em SEO. Gere hashtags relevantes.",
            },
            {
              role: "user",
              content: hashtagsPrompt,
            },
          ],
        });

        const hashtagsText =
          typeof hashtagsResponse.choices[0]?.message?.content === "string"
            ? hashtagsResponse.choices[0].message.content
            : "";
        const hashtags = hashtagsText
          .split(" ")
          .filter((tag: string) => tag.startsWith("#"))
          .slice(0, 10);

        return {
          success: true,
          data: {
            caption,
            hashtags,
            influencer: input.influencerName,
            type: input.type,
            fullPost: `${caption}\n\n${hashtags.join(" ")}`,
          },
        };
      } catch (error) {
        console.error("Erro ao gerar post completo:", error);
        throw new Error(`Falha ao gerar post: ${error}`);
      }
    }),

  // Obter sugestões de tópicos para influenciadora
  getSuggestedTopics: protectedProcedure
    .input(
      z.object({
        influencerName: z.enum(["carol", "renata", "vanessa", "luiza"]),
      })
    )
    .query(async ({ input }) => {
      const profile = INFLUENCER_PROFILES[input.influencerName];

      return {
        success: true,
        data: {
          influencer: input.influencerName,
          persona: profile.persona,
          suggestedTopics: profile.topics,
          suggestedHashtags: profile.hashtags,
          tone: profile.tone,
        },
      };
    }),
});

// Funções auxiliares
function buildCaptionPrompt(
  profile: (typeof INFLUENCER_PROFILES)[keyof typeof INFLUENCER_PROFILES],
  input: {
    topic: string;
    type: string;
    productName?: string;
    additionalContext?: string;
  }
): string {
  let prompt = `Crie uma caption autêntica para ${profile.name} (${profile.persona}) sobre: ${input.topic}`;

  if (input.type === "product" && input.productName) {
    prompt += `\nProduto: ${input.productName}`;
  }

  if (input.additionalContext) {
    prompt += `\nContexto adicional: ${input.additionalContext}`;
  }

  prompt += `\n\nCaracterísticas de ${profile.name}:
- Persona: ${profile.persona}
- Descrição: ${profile.description}
- Tópicos comuns: ${profile.topics.join(", ")}
- Tom: ${profile.tone}

Crie uma caption que seja:
1. Autêntica e pessoal
2. Engajante e inspiradora
3. Relevante ao tópico
4. Com emojis apropriados
5. Máximo 150 caracteres`;

  return prompt;
}
