import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { influencers } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

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
        influencerName: z.string(),
        topic: z.string(),
        type: z.enum(["product", "lifestyle", "tip", "story"]),
        productName: z.string().optional(),
        additionalContext: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (db) {
          const owned = await db.select({ id: influencers.id }).from(influencers)
            .where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
          if (owned.length === 0) throw new Error("Influencer não encontrado ou acesso negado");
        }

        const nameKey = input.influencerName.toLowerCase() as keyof typeof INFLUENCER_PROFILES;
        const profile = INFLUENCER_PROFILES[nameKey] ?? {
          name: input.influencerName,
          persona: input.influencerName,
          description: "",
          topics: [],
          tone: "autêntico",
          hashtags: [],
        };

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
        influencerName: z.string(),
        caption: z.string(),
        topic: z.string(),
        count: z.number().default(10),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (db) {
          const owned = await db.select({ id: influencers.id }).from(influencers)
            .where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
          if (owned.length === 0) throw new Error("Influencer não encontrado ou acesso negado");
        }

        const nameKey = input.influencerName.toLowerCase() as keyof typeof INFLUENCER_PROFILES;
        const profile = INFLUENCER_PROFILES[nameKey] ?? {
          name: input.influencerName,
          persona: input.influencerName,
          description: "",
          topics: [],
          tone: "autêntico",
          hashtags: [],
        };

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
        influencerName: z.string(),
        topic: z.string(),
        type: z.enum(["product", "lifestyle", "tip", "story"]),
        productName: z.string().optional(),
        additionalContext: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (db) {
          const owned = await db.select({ id: influencers.id }).from(influencers)
            .where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
          if (owned.length === 0) throw new Error("Influencer não encontrado ou acesso negado");
        }

        const nameKey = input.influencerName.toLowerCase() as keyof typeof INFLUENCER_PROFILES;
        const profile = INFLUENCER_PROFILES[nameKey] ?? {
          name: input.influencerName,
          persona: input.influencerName,
          description: "",
          topics: [],
          tone: "autêntico",
          hashtags: [],
        };

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

  // Otimizar legenda existente — gera 4 versões melhoradas
  optimizeCaption: protectedProcedure
    .input(
      z.object({
        originalCaption: z.string().min(1).max(2000),
      })
    )
    .mutation(async ({ input }) => {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é um especialista em marketing de moda feminina no Brasil (Instagram, TikTok).
Dado uma legenda original, gere 4 versões otimizadas com abordagens distintas:
1. Urgência + Emojis (gatilho de escassez)
2. Storytelling + Prova Social (depoimento fictício de cliente)
3. Educacional + Benefícios (produto e diferenciais)
4. Comunidade + Inclusão (pertencimento e desconto)

Para cada versão inclua hashtags relevantes para pijamas/moda feminina brasileira.
Retorne JSON com array "versions", cada item com: title (string), caption (string), rationale (string).`,
          },
          {
            role: "user",
            content: `Legenda original: "${input.originalCaption}"\n\nGere as 4 versões otimizadas em JSON.`,
          },
        ],
        outputSchema: {
          name: "optimize_caption",
          schema: {
            type: "object",
            properties: {
              versions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    caption: { type: "string" },
                    rationale: { type: "string" },
                  },
                  required: ["title", "caption", "rationale"],
                },
              },
            },
            required: ["versions"],
            additionalProperties: false,
          },
          strict: true,
        },
      });

      const raw = response.choices?.[0]?.message?.content;
      if (!raw) throw new Error("LLM retornou resposta vazia");
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return { versions: parsed.versions as { title: string; caption: string; rationale: string }[] };
    }),

  // Gerar legendas sem necessidade de influencer ID (uso geral)
  generateCaptionFree: protectedProcedure
    .input(z.object({
      persona: z.enum(["carol", "renata", "vanessa", "luiza", "generico"]),
      topic: z.string().min(3).max(300),
      type: z.enum(["product", "lifestyle", "tip", "story"]),
      productName: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const profileMap = {
        carol: INFLUENCER_PROFILES.carol,
        renata: INFLUENCER_PROFILES.renata,
        vanessa: INFLUENCER_PROFILES.vanessa,
        luiza: INFLUENCER_PROFILES.luiza,
        generico: {
          name: "Feminnita",
          persona: "Pijamas Femininos Premium",
          description: "Marca de pijamas femininos de qualidade premium, com foco em conforto e estilo",
          topics: ["conforto", "moda feminina", "qualidade", "renda extra", "compra coletiva"],
          tone: "acolhedor e premium",
          hashtags: ["#Feminnita", "#PijamaConforto", "#ModaFeminina", "#QualidadePremium"],
        },
      };

      const profile = profileMap[input.persona];
      const typeLabels: Record<string, string> = {
        product: "destaque de produto", lifestyle: "lifestyle e cotidiano",
        tip: "dica útil", story: "story / reel curto",
      };

      const prompt = `Você é especialista em marketing de moda feminina brasileira (Instagram, TikTok).
Crie 3 versões distintas de legenda para a persona "${profile.persona}" da Feminnita Pijamas.

Tema: ${input.topic}
Tipo de conteúdo: ${typeLabels[input.type] || input.type}
${input.productName ? `Produto em destaque: ${input.productName}` : ""}
Tom da persona: ${profile.tone}
Tópicos relevantes: ${profile.topics.join(", ")}
Hashtags da marca: ${profile.hashtags.slice(0, 5).join(", ")}

Cada versão deve ter abordagem diferente:
1. Urgência e gatilho emocional (escassez, FOMO)
2. Storytelling e benefício concreto
3. CTA direto e simples com prova social

Retorne JSON com array "captions", cada item com: approach (string com nome da abordagem), text (string com a legenda completa), hashtags (array de strings com 3-5 hashtags relevantes).`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "Especialista em conteúdo para redes sociais no Brasil. Retorne apenas JSON válido." },
          { role: "user", content: prompt },
        ],
        outputSchema: {
          name: "generate_captions_free",
          schema: {
            type: "object",
            properties: {
              captions: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    approach: { type: "string" },
                    text: { type: "string" },
                    hashtags: { type: "array", items: { type: "string" } },
                  },
                  required: ["approach", "text", "hashtags"],
                  additionalProperties: false,
                },
              },
            },
            required: ["captions"],
            additionalProperties: false,
          },
          strict: true,
        },
      });

      const raw = response.choices?.[0]?.message?.content;
      if (!raw) throw new Error("LLM retornou resposta vazia");
      const parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
      return { captions: parsed.captions as { approach: string; text: string; hashtags: string[] }[] };
    }),

  // Obter sugestões de tópicos para influenciadora
  getSuggestedTopics: protectedProcedure
    .input(
      z.object({
        influencerName: z.string(),
      })
    )
    .query(async ({ input }) => {
      const nameKey = input.influencerName.toLowerCase() as keyof typeof INFLUENCER_PROFILES;
      const profile = INFLUENCER_PROFILES[nameKey] ?? {
        name: input.influencerName,
        persona: input.influencerName,
        description: "",
        topics: [],
        tone: "autêntico",
        hashtags: [],
      };

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
