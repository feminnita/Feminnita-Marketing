import { getDb } from "../db";
import { contentBriefs, influencers, marketingResearchReports, users } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

const CHECK_INTERVAL_MS = 60 * 60 * 1000; // verifica a cada hora
const RUN_DAY = 1;  // segunda-feira
const RUN_HOUR = 8; // 08:00

let lastRunWeek: string | null = null;

interface ContentPlanItem {
  type: string;
  topic: string;
  targetAudience: string;
  keyMessage: string;
  cta: string;
  suggestedHashtags: string[];
  priority: number;
  bestTimeToPost: string;
}

function getCurrentWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(
    ((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7
  );
  return `${now.getFullYear()}-W${weekNumber}`;
}

async function generateWeeklyContentPlan(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.log("[CreativeTeam] DB indisponível, pulando ciclo.");
    return;
  }

  console.log("[CreativeTeam] Gerando plano de conteúdo semanal...");

  let lastReport: typeof marketingResearchReports.$inferSelect | null = null;
  try {
    const reports = await db
      .select()
      .from(marketingResearchReports)
      .orderBy(desc(marketingResearchReports.createdAt))
      .limit(1);
    lastReport = reports[0] ?? null;
  } catch (err) {
    console.error("[CreativeTeam] Erro ao buscar research report:", err);
  }

  let firstUser: typeof users.$inferSelect | null = null;
  try {
    const userRows = await db.select().from(users).limit(1);
    firstUser = userRows[0] ?? null;
  } catch (err) {
    console.error("[CreativeTeam] Erro ao buscar usuário:", err);
  }

  if (!firstUser) {
    console.warn("[CreativeTeam] Nenhum usuário encontrado. Abortando.");
    return;
  }

  let activeInfluencers: typeof influencers.$inferSelect[] = [];
  try {
    activeInfluencers = await db
      .select()
      .from(influencers)
      .where(eq(influencers.isActive, true));
  } catch (err) {
    console.error("[CreativeTeam] Erro ao buscar influencers:", err);
    return;
  }

  if (activeInfluencers.length === 0) {
    console.log("[CreativeTeam] Nenhum influencer ativo encontrado.");
    return;
  }

  const weeklyStrategy = lastReport?.weeklyStrategy ?? "sem contexto de mercado disponível";
  const contentOpportunities = (lastReport?.contentOpportunities ?? []).join("; ") || "não identificadas";

  for (const influencer of activeInfluencers) {
    try {
      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "Você é o diretor criativo de uma agência de marketing especializada em moda feminina brasileira. Você cria planos de conteúdo semanais estratégicos baseados em pesquisa de mercado.",
          },
          {
            role: "user",
            content: `Crie um plano de conteúdo para a semana para ${influencer.name} (personalidade: ${influencer.personality ?? "descontraída e autêntica"}).
Contexto de mercado: ${weeklyStrategy}.
Oportunidades identificadas: ${contentOpportunities}.
Crie exatamente: 2 carrosséis educativos, 2 reels (1 de produto, 1 de lifestyle), 3 posts de feed, 1 sequência de stories.
Para cada peça, defina: tema, público-alvo, mensagem-chave, CTA.
Retorne JSON com array 'contentPlan' onde cada item tem: type, topic, targetAudience, keyMessage, cta, suggestedHashtags, priority (1-5), bestTimeToPost.`,
          },
        ],
        outputSchema: {
          name: "weekly_content_plan",
          schema: {
            type: "object",
            properties: {
              contentPlan: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    topic: { type: "string" },
                    targetAudience: { type: "string" },
                    keyMessage: { type: "string" },
                    cta: { type: "string" },
                    suggestedHashtags: { type: "array", items: { type: "string" } },
                    priority: { type: "number" },
                    bestTimeToPost: { type: "string" },
                  },
                  required: ["type", "topic", "targetAudience", "keyMessage", "cta", "suggestedHashtags", "priority", "bestTimeToPost"],
                },
              },
            },
            required: ["contentPlan"],
          },
        },
      });

      const raw = response.choices[0].message.content;
      const parsed = JSON.parse(typeof raw === "string" ? raw : JSON.stringify(raw)) as { contentPlan: ContentPlanItem[] };
      const contentPlan: ContentPlanItem[] = parsed.contentPlan ?? [];

      const briefTypeMap: Record<string, "carousel" | "reel" | "story" | "post" | "feed"> = {
        carousel: "carousel",
        reel: "reel",
        story: "story",
        stories: "story",
        post: "post",
        feed: "feed",
      };

      let insertedCount = 0;
      for (const item of contentPlan) {
        try {
          const rawType = (item.type ?? "post").toLowerCase();
          const briefType = briefTypeMap[rawType] ?? "post";

          await db.insert(contentBriefs).values({
            userId: firstUser.id,
            influencerId: influencer.id,
            briefType,
            topic: item.topic,
            targetAudience: item.targetAudience,
            keyMessages: [item.keyMessage],
            hashtags: item.suggestedHashtags,
            callToAction: item.cta,
            copywriterNotes: `Prioridade: ${item.priority}. Melhor horário: ${item.bestTimeToPost}`,
            status: "pending",
            researchReportId: lastReport?.id ?? null,
          });
          insertedCount++;
        } catch (err) {
          console.error(`[CreativeTeam] Erro ao inserir brief para ${influencer.name}:`, err);
        }
      }

      console.log(`[CreativeTeam] ${insertedCount} peça(s) planejada(s) para ${influencer.name}.`);
    } catch (err) {
      console.error(`[CreativeTeam] Erro ao gerar plano para ${influencer.name}:`, err);
    }
  }

  lastRunWeek = getCurrentWeekKey();
  console.log(`[CreativeTeam] Plano semanal gerado para ${activeInfluencers.length} influencer(s). Semana: ${lastRunWeek}.`);
}

function shouldRunThisWeek(): boolean {
  const now = new Date();
  return (
    now.getDay() === RUN_DAY &&
    now.getHours() === RUN_HOUR &&
    lastRunWeek !== getCurrentWeekKey()
  );
}

export function startCreativeTeamAgent(): () => void {
  console.log(`[CreativeTeam] Agente iniciado. Roda toda segunda-feira às ${String(RUN_HOUR).padStart(2, "0")}:00.`);

  const interval = setInterval(() => {
    if (shouldRunThisWeek()) {
      generateWeeklyContentPlan().catch((err) =>
        console.error("[CreativeTeam] Erro no plano semanal:", err)
      );
    }
  }, CHECK_INTERVAL_MS);

  return () => {
    clearInterval(interval);
    console.log("[CreativeTeam] Agente encerrado.");
  };
}
