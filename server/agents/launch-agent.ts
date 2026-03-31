import { getDb } from "../db";
import { productCollections, assetLibrary, contentBriefs, influencers } from "../../drizzle/schema";
import { eq, and, inArray } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes

async function processNewCollections(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.log("[LaunchAgent] DB indisponível, pulando ciclo.");
    return;
  }

  console.log("[LaunchAgent] Verificando coleções ativas sem briefs gerados...");

  let pendingCollections: typeof productCollections.$inferSelect[] = [];
  try {
    pendingCollections = await db
      .select()
      .from(productCollections)
      .where(
        and(
          eq(productCollections.status, "ativo"),
          eq(productCollections.briefsGenerated, false)
        )
      );
  } catch (err) {
    console.error("[LaunchAgent] Erro ao buscar coleções pendentes:", err);
    return;
  }

  if (pendingCollections.length === 0) {
    console.log("[LaunchAgent] Nenhuma coleção pendente encontrada.");
    return;
  }

  console.log(`[LaunchAgent] ${pendingCollections.length} coleção(ões) para processar.`);

  for (const collection of pendingCollections) {
    try {
      console.log(`[LaunchAgent] Processando coleção id=${collection.id} nome="${collection.name}"`);

      // Fetch associated assets
      const assetIds = (collection.assetIds as number[]) ?? [];
      let assets: typeof assetLibrary.$inferSelect[] = [];

      if (assetIds.length > 0) {
        try {
          assets = await db
            .select()
            .from(assetLibrary)
            .where(inArray(assetLibrary.id, assetIds));
        } catch (err) {
          console.error(`[LaunchAgent] Erro ao buscar assets da coleção id=${collection.id}:`, err);
        }
      }

      // Analyse collection via LLM using asset images
      let collectionAnalysis = "";
      if (assets.length > 0) {
        try {
          const imageAssets = assets.filter((a) =>
            a.url.match(/\.(jpg|jpeg|png|webp|gif)/i)
          );

          if (imageAssets.length > 0) {
            const contentParts: Array<
              { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }
            > = [
              {
                type: "text",
                text: `Analise esta coleção de moda feminina chamada "${collection.name}" (tipo: ${collection.collectionType}, temporada: ${collection.season ?? "não especificada"}). As imagens a seguir fazem parte desta coleção. Forneça uma análise de marketing com: estilo geral, público-alvo, destaques de produto, mensagem de marca e sugestões de conteúdo para redes sociais. Seja direto e prático.`,
              },
              ...imageAssets.slice(0, 5).map((a) => ({
                type: "image_url" as const,
                image_url: { url: a.url },
              })),
            ];

            const llmResult = await invokeLLM({
              messages: [{ role: "user", content: contentParts }],
            });

            collectionAnalysis =
              typeof llmResult.choices[0].message.content === "string"
                ? llmResult.choices[0].message.content
                : "";
          }
        } catch (err) {
          console.error(`[LaunchAgent] Erro na análise LLM da coleção id=${collection.id}:`, err);
        }
      }

      // Persist content_plan with the LLM analysis
      if (collectionAnalysis) {
        try {
          await db
            .update(productCollections)
            .set({ contentPlan: { llmAnalysis: collectionAnalysis } })
            .where(eq(productCollections.id, collection.id));
        } catch (err) {
          console.error(`[LaunchAgent] Erro ao salvar content_plan id=${collection.id}:`, err);
        }
      }

      // Build asset reference string for brief topics
      const assetReference =
        assets.length > 0
          ? ` Imagens da coleção: ${assets.map((a) => a.name).join(", ")}.`
          : "";

      // Define brief templates
      const briefTemplates: Array<{
        briefType: "carousel" | "reel" | "story" | "post" | "feed";
        topic: string;
      }> = [
        {
          briefType: "carousel",
          topic: `Conheça nossa nova ${collection.collectionType}: ${collection.name}.${assetReference}`,
        },
        {
          briefType: "reel",
          topic: `Lançamento: ${collection.name} - ${collection.season ?? "Nova Temporada"}.${assetReference}`,
        },
        {
          briefType: "story",
          topic: `Novidade! ${collection.name}.${assetReference}`,
        },
        {
          briefType: "story",
          topic: `Novidade! ${collection.name} — deslize para ver mais.${assetReference}`,
        },
        {
          briefType: "feed",
          topic: `${collection.name} — confira os destaques da coleção.${assetReference}`,
        },
        {
          briefType: "feed",
          topic: `${collection.name} — estilo e conforto em uma só peça.${assetReference}`,
        },
      ];

      // Insert content briefs
      let briefsInserted = 0;
      for (const template of briefTemplates) {
        try {
          await db.insert(contentBriefs).values({
            userId: collection.userId,
            briefType: template.briefType,
            topic: template.topic,
            status: "pending",
          });
          briefsInserted++;
        } catch (err) {
          console.error(
            `[LaunchAgent] Erro ao inserir brief "${template.briefType}" para coleção id=${collection.id}:`,
            err
          );
        }
      }

      // Mark collection as processed
      await db
        .update(productCollections)
        .set({ briefsGenerated: true })
        .where(eq(productCollections.id, collection.id));

      console.log(
        `[LaunchAgent] Coleção id=${collection.id} processada — ${briefsInserted} brief(s) criados.`
      );
    } catch (err) {
      console.error(`[LaunchAgent] Erro ao processar coleção id=${collection.id}:`, err);
    }
  }
}

export function startLaunchAgent(): () => void {
  console.log("[LaunchAgent] Iniciado. Intervalo: 5 minutos.");

  // Run immediately on startup
  processNewCollections().catch((err) => {
    console.error("[LaunchAgent] Erro no ciclo inicial:", err);
  });

  const interval = setInterval(() => {
    processNewCollections().catch((err) => {
      console.error("[LaunchAgent] Erro no ciclo periódico:", err);
    });
  }, CHECK_INTERVAL_MS);

  return () => {
    clearInterval(interval);
    console.log("[LaunchAgent] Parado.");
  };
}
