import { getDb } from "../db";
import { influencers, influencerPosts } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";
import { VIDEO_SOCIAL_LADEIRA_DOCTRINE } from "./doctrines/video-social-ladeira-doctrine";

let lastRunDate: string | null = null;

async function runContentGeneration() {
  const db = await getDb();
  if (!db) {
    console.log("[ContentAgent] DB indisponível, pulando ciclo.");
    return;
  }

  console.log("[ContentAgent] Iniciando geração de conteúdo...");

  let activeInfluencers: typeof influencers.$inferSelect[] = [];
  try {
    activeInfluencers = await db
      .select()
      .from(influencers)
      .where(eq(influencers.isActive, true));
  } catch (err) {
    console.error("[ContentAgent] Erro ao buscar influencers:", err);
    return;
  }

  if (activeInfluencers.length === 0) {
    console.log("[ContentAgent] Nenhum influencer ativo encontrado.");
    return;
  }

  let generatedCount = 0;

  for (const influencer of activeInfluencers) {
    try {
      const result = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Você é especialista em marketing para Feminnita Pijamas, marca de atacado de pijamas femininos. Crie posts autênticos para Instagram.\n\n${VIDEO_SOCIAL_LADEIRA_DOCTRINE}`,
          },
          {
            role: "user",
            content: `Gere um post para a influenciadora ${influencer.name} (personalidade: ${influencer.personality ?? "descontraída"}, bio: ${influencer.bio ?? "influenciadora de moda"}). Retorne JSON com: caption (máx 200 chars), hashtags (array de 5-8 strings sem #), cta (call to action curto).`,
          },
        ],
        outputSchema: {
          name: "post_instagram",
          schema: {
            type: "object",
            properties: {
              caption: { type: "string" },
              hashtags: { type: "array", items: { type: "string" } },
              cta: { type: "string" },
            },
            required: ["caption", "hashtags", "cta"],
          },
        },
      });

      const post = typeof result === "string" ? JSON.parse(result) : result;

      await db.insert(influencerPosts).values({
        influencerId: influencer.id,
        platform: "instagram",
        caption: post.caption,
        hashtags: post.hashtags,
        content: `${post.caption}\n\n${post.cta}`,
        status: "draft",
        aiGenerated: true,
      });

      generatedCount++;
      console.log(`[ContentAgent] Post gerado para ${influencer.name}.`);
    } catch (err) {
      console.error(
        `[ContentAgent] Erro ao gerar post para ${influencer.name}:`,
        err
      );
    }
  }

  if (generatedCount > 0) {
    try {
      await notifyOwner({
        title: "[ContentAgent] Posts gerados",
        content: `${generatedCount} post(s) gerado(s) automaticamente para aprovação.`,
      });
    } catch (err) {
      console.error("[ContentAgent] Erro ao notificar owner:", err);
    }
  }

  console.log(
    `[ContentAgent] Ciclo concluído. ${generatedCount}/${activeInfluencers.length} posts gerados.`
  );
}

export function startContentAgent(): () => void {
  console.log("[ContentAgent] Agente iniciado. Verificando a cada 10 minutos.");

  const interval = setInterval(async () => {
    const now = new Date();
    const today = now.toDateString();

    if (now.getHours() === 6 && today !== lastRunDate) {
      lastRunDate = today;
      await runContentGeneration();
    }
  }, 10 * 60 * 1000);

  return () => {
    clearInterval(interval);
    console.log("[ContentAgent] Agente encerrado.");
  };
}
