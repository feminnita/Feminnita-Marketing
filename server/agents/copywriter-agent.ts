import { getDb } from "../db";
import { contentBriefs, influencers, marketingResearchReports } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

const CHECK_INTERVAL_MS = 30 * 60 * 1000;

async function processPendingBriefs(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.log("[Copywriter] DB indisponível, pulando ciclo.");
    return;
  }

  console.log("[Copywriter] Buscando briefs pendentes...");

  let pendingBriefs: typeof contentBriefs.$inferSelect[] = [];
  try {
    pendingBriefs = await db
      .select()
      .from(contentBriefs)
      .where(eq(contentBriefs.status, "pending"))
      .limit(10);
  } catch (err) {
    console.error("[Copywriter] Erro ao buscar briefs:", err);
    return;
  }

  if (pendingBriefs.length === 0) {
    console.log("[Copywriter] Nenhum brief pendente encontrado.");
    return;
  }

  console.log(`[Copywriter] ${pendingBriefs.length} brief(s) para processar.`);

  let lastReport: typeof marketingResearchReports.$inferSelect | null = null;
  try {
    const reports = await db
      .select()
      .from(marketingResearchReports)
      .orderBy(desc(marketingResearchReports.createdAt))
      .limit(1);
    lastReport = reports[0] ?? null;
  } catch (err) {
    console.error("[Copywriter] Erro ao buscar research report:", err);
  }

  for (const brief of pendingBriefs) {
    try {
      let influencer: typeof influencers.$inferSelect | null = null;
      if (brief.influencerId) {
        try {
          const rows = await db
            .select()
            .from(influencers)
            .where(eq(influencers.id, brief.influencerId))
            .limit(1);
          influencer = rows[0] ?? null;
        } catch (err) {
          console.error(`[Copywriter] Erro ao buscar influencer id=${brief.influencerId}:`, err);
        }
      }

      const influencerName = influencer?.name ?? "a influenciadora";
      const weeklyStrategy = lastReport?.weeklyStrategy ?? "sem contexto disponível";
      const targetAudience = brief.targetAudience ?? "mulheres interessadas em moda e conforto";

      let generatedContent: Record<string, unknown> = {};

      if (brief.briefType === "carousel") {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é um copywriter especialista em carrosséis para Instagram. Cria narrativas que educam, engajam e convertem para marcas de moda feminina brasileira.",
            },
            {
              role: "user",
              content: `Crie um carrossel de 6 slides para ${influencerName} sobre o tema: ${brief.topic}. Público: ${targetAudience}. Contexto de mercado: ${weeklyStrategy}. Retorne JSON com: slides (array de {slideNumber, title, body, visualSuggestion}), hook (título do slide 1 para parar o scroll), cta (slide final), hashtags.`,
            },
          ],
          outputSchema: {
            name: "carousel_copy",
            schema: {
              type: "object",
              properties: {
                slides: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      slideNumber: { type: "number" },
                      title: { type: "string" },
                      body: { type: "string" },
                      visualSuggestion: { type: "string" },
                    },
                    required: ["slideNumber", "title", "body", "visualSuggestion"],
                  },
                },
                hook: { type: "string" },
                cta: { type: "string" },
                hashtags: { type: "array", items: { type: "string" } },
              },
              required: ["slides", "hook", "cta", "hashtags"],
            },
          },
        });
        const raw = response.choices[0].message.content;
        generatedContent = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));

      } else if (brief.briefType === "reel") {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é roteirista especialista em Reels do Instagram e TikTok para moda feminina. Cria scripts virais e envolventes.",
            },
            {
              role: "user",
              content: `Crie um script de Reel de 30-60 segundos para ${influencerName} sobre: ${brief.topic}. Público: ${targetAudience}. Retorne JSON com: hook (primeiros 3 segundos), scenes (array de {duration, action, text, voiceover}), cta, suggestedAudio, hashtags, estimatedDuration.`,
            },
          ],
          outputSchema: {
            name: "reel_script",
            schema: {
              type: "object",
              properties: {
                hook: { type: "string" },
                scenes: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      duration: { type: "number" },
                      action: { type: "string" },
                      text: { type: "string" },
                      voiceover: { type: "string" },
                    },
                    required: ["duration", "action", "text", "voiceover"],
                  },
                },
                cta: { type: "string" },
                suggestedAudio: { type: "string" },
                hashtags: { type: "array", items: { type: "string" } },
                estimatedDuration: { type: "number" },
              },
              required: ["hook", "scenes", "cta", "suggestedAudio", "hashtags", "estimatedDuration"],
            },
          },
        });
        const raw = response.choices[0].message.content;
        generatedContent = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));

      } else if (brief.briefType === "story") {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é especialista em Instagram Stories para moda feminina. Cria sequências de stories que engajam e convertem.",
            },
            {
              role: "user",
              content: `Crie uma sequência de 5 stories para ${influencerName} sobre: ${brief.topic}. Retorne JSON com: stories (array de {storyNumber, type (image/poll/question/countdown), content, sticker, swipeUpText}), objective.`,
            },
          ],
          outputSchema: {
            name: "story_sequence",
            schema: {
              type: "object",
              properties: {
                stories: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      storyNumber: { type: "number" },
                      type: { type: "string" },
                      content: { type: "string" },
                      sticker: { type: "string" },
                      swipeUpText: { type: "string" },
                    },
                    required: ["storyNumber", "type", "content", "sticker", "swipeUpText"],
                  },
                },
                objective: { type: "string" },
              },
              required: ["stories", "objective"],
            },
          },
        });
        const raw = response.choices[0].message.content;
        generatedContent = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));

      } else {
        // post ou feed
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "Você é copywriter especialista em posts para feed do Instagram voltado a moda feminina brasileira.",
            },
            {
              role: "user",
              content: `Crie um post de feed para ${influencerName} sobre: ${brief.topic}. Público: ${targetAudience}. Retorne JSON com: caption, hashtags (array), cta, bestTimesToPost (array de strings com horários sugeridos).`,
            },
          ],
          outputSchema: {
            name: "feed_post_copy",
            schema: {
              type: "object",
              properties: {
                caption: { type: "string" },
                hashtags: { type: "array", items: { type: "string" } },
                cta: { type: "string" },
                bestTimesToPost: { type: "array", items: { type: "string" } },
              },
              required: ["caption", "hashtags", "cta", "bestTimesToPost"],
            },
          },
        });
        const raw = response.choices[0].message.content;
        generatedContent = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw));
      }

      await db
        .update(contentBriefs)
        .set({ generatedContent, status: "generated" })
        .where(eq(contentBriefs.id, brief.id));

      console.log(`[Copywriter] Brief id=${brief.id} (${brief.briefType}) gerado para ${influencerName}.`);
    } catch (err) {
      console.error(`[Copywriter] Erro ao processar brief id=${brief.id}:`, err);
    }
  }
  console.log("[Copywriter] Ciclo concluído.");
}

export function startCopywriterAgent(): () => void {
  console.log("[Copywriter] Agente iniciado. Processando briefs a cada 30 minutos.");

  const interval = setInterval(async () => {
    await processPendingBriefs().catch((err) =>
      console.error("[Copywriter] Erro no ciclo:", err)
    );
  }, CHECK_INTERVAL_MS);

  return () => {
    clearInterval(interval);
    console.log("[Copywriter] Agente encerrado.");
  };
}
