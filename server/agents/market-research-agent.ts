import { getDb } from "../db";
import { marketingResearchReports, competitorData, users, oauthTokens } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

let lastRunDate: string | null = null;
const RUN_HOUR = 7;

// ─── Tipos locais ────────────────────────────────────────────────────────────

interface CompetitorInsight {
  name: string;
  strategy: string;
  topContent: string;
  strengths: string;
}

interface Recommendation {
  priority: "alta" | "media" | "baixa";
  action: string;
  rationale: string;
}

interface MarketResearchResult {
  competitors: CompetitorInsight[];
  trendingHashtags: string[];
  contentOpportunities: string[];
  audienceInsights: string;
  weeklyStrategy: string;
  recommendations: Recommendation[];
}

interface CompetitorTactics {
  postingFrequency: string;
  formats: string[];
  hashtagStrategy: string;
  keyStrategies: string[];
}

interface CompetitorTacticsResult {
  tactics: Array<{
    name: string;
    postingFrequency: string;
    formats: string[];
    hashtagStrategy: string;
    keyStrategies: string[];
  }>;
}

// ─── Passo 1: Pesquisa de mercado via LLM ────────────────────────────────────

async function runMarketResearchLLM(today: string): Promise<MarketResearchResult | null> {
  try {
    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em marketing digital para moda feminina e varejo de atacado brasileiro. Você analisa o mercado de pijamas femininos, tendências de consumo e estratégias de concorrentes no Instagram e TikTok.",
        },
        {
          role: "user",
          content: `Faça uma análise completa de mercado para Feminnita Pijamas para a data ${today}. Inclua: 1) Análise de 5 concorrentes do segmento (marcas de pijamas femininos no Brasil como Lua Cheia, Mafra, Liganete, Finou, Daluf), 2) Hashtags trending para o nicho, 3) Tipos de conteúdo com melhor performance no momento, 4) Oportunidades identificadas, 5) Estratégia recomendada para a semana. Retorne JSON.`,
        },
      ],
      outputSchema: {
        name: "market_research",
        schema: {
          type: "object",
          properties: {
            competitors: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  strategy: { type: "string" },
                  topContent: { type: "string" },
                  strengths: { type: "string" },
                },
                required: ["name", "strategy", "topContent", "strengths"],
              },
            },
            trendingHashtags: { type: "array", items: { type: "string" } },
            contentOpportunities: { type: "array", items: { type: "string" } },
            audienceInsights: { type: "string" },
            weeklyStrategy: { type: "string" },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  priority: { type: "string", enum: ["alta", "media", "baixa"] },
                  action: { type: "string" },
                  rationale: { type: "string" },
                },
                required: ["priority", "action", "rationale"],
              },
            },
          },
          required: [
            "competitors",
            "trendingHashtags",
            "contentOpportunities",
            "audienceInsights",
            "weeklyStrategy",
            "recommendations",
          ],
          additionalProperties: false,
        },
        strict: true,
      },
    });

    const raw = result.choices?.[0]?.message?.content;
    if (!raw) {
      console.error("[MarketResearch] LLM retornou resposta vazia no passo 1.");
      return null;
    }

    const parsed: MarketResearchResult =
      typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as MarketResearchResult);

    return parsed;
  } catch (err) {
    console.error("[MarketResearch] Erro no passo 1 (pesquisa de mercado):", err);
    return null;
  }
}

// ─── Passo 2: Análise tática de concorrentes ─────────────────────────────────

async function runCompetitorTacticsLLM(
  competitors: CompetitorInsight[]
): Promise<CompetitorTacticsResult | null> {
  const competitorNames = competitors.map((c) => c.name).join(", ");

  try {
    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em marketing digital para moda feminina e varejo de atacado brasileiro. Você analisa o mercado de pijamas femininos, tendências de consumo e estratégias de concorrentes no Instagram e TikTok.",
        },
        {
          role: "user",
          content: `Para cada um dos seguintes concorrentes de pijamas femininos brasileiros: ${competitorNames}. Forneça insights táticos detalhados sobre: frequência de postagem estimada, principais formatos de conteúdo utilizados (reels, carrossel, stories, etc.), estratégia de hashtags e principais estratégias de conteúdo. Retorne JSON.`,
        },
      ],
      outputSchema: {
        name: "competitor_tactics",
        schema: {
          type: "object",
          properties: {
            tactics: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  postingFrequency: { type: "string" },
                  formats: { type: "array", items: { type: "string" } },
                  hashtagStrategy: { type: "string" },
                  keyStrategies: { type: "array", items: { type: "string" } },
                },
                required: ["name", "postingFrequency", "formats", "hashtagStrategy", "keyStrategies"],
              },
            },
          },
          required: ["tactics"],
          additionalProperties: false,
        },
        strict: true,
      },
    });

    const raw = result.choices?.[0]?.message?.content;
    if (!raw) {
      console.error("[MarketResearch] LLM retornou resposta vazia no passo 2.");
      return null;
    }

    const parsed: CompetitorTacticsResult =
      typeof raw === "string" ? JSON.parse(raw) : (raw as unknown as CompetitorTacticsResult);

    return parsed;
  } catch (err) {
    console.error("[MarketResearch] Erro no passo 2 (análise de concorrentes):", err);
    return null;
  }
}

// ─── Passo 3: Buscar userId admin ─────────────────────────────────────────────

async function resolveAdminUserId(): Promise<number> {
  try {
    const db = await getDb();
    if (!db) return 1;

    const adminUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.role, "admin"))
      .limit(1);

    return adminUsers[0]?.id ?? 1;
  } catch {
    return 1;
  }
}

// ─── Runner principal ─────────────────────────────────────────────────────────

async function runMarketResearch(): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.log("[MarketResearch] DB indisponível, pulando ciclo.");
    return;
  }

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  console.log(`[MarketResearch] Iniciando pesquisa de mercado para ${today}...`);

  // Passo 1 — Pesquisa de mercado via LLM
  const research = await runMarketResearchLLM(today);
  if (!research) {
    console.error("[MarketResearch] Pesquisa de mercado falhou, abortando ciclo.");
    return;
  }

  console.log(
    `[MarketResearch] Passo 1 concluído: ${research.competitors.length} concorrentes, ` +
      `${research.trendingHashtags.length} hashtags, ${research.recommendations.length} recomendações.`
  );

  // Passo 2 — Análise tática de concorrentes
  const tactics = await runCompetitorTacticsLLM(research.competitors);

  if (tactics) {
    console.log(
      `[MarketResearch] Passo 2 concluído: táticas de ${tactics.tactics.length} concorrente(s) analisadas.`
    );
  } else {
    console.warn("[MarketResearch] Passo 2 falhou, continuando sem táticas detalhadas.");
  }

  // Resolver userId do admin
  const userId = await resolveAdminUserId();

  // Passo 3a — Salvar relatório em marketingResearchReports
  try {
    await db.insert(marketingResearchReports).values({
      userId,
      reportDate: today,
      competitorInsights: {
        competitors: research.competitors,
        gaps: [],
        opportunities: research.contentOpportunities,
      },
      trendingHashtags: research.trendingHashtags,
      contentOpportunities: research.contentOpportunities,
      audienceInsights: research.audienceInsights,
      weeklyStrategy: research.weeklyStrategy,
      recommendations: research.recommendations,
      rawAnalysis: JSON.stringify(research),
    });

    console.log(`[MarketResearch] Relatório salvo em marketing_research_reports (userId=${userId}).`);
  } catch (err) {
    console.error("[MarketResearch] Erro ao salvar relatório:", err);
  }

  // Passo 3b — Salvar dados de concorrentes em competitorData
  for (const competitor of research.competitors) {
    try {
      const tacticsEntry = tactics?.tactics.find(
        (t) => t.name.toLowerCase() === competitor.name.toLowerCase()
      );

      await db.insert(competitorData).values({
        userId,
        competitorName: competitor.name,
        platform: "instagram",
        contentType: tacticsEntry?.formats?.[0] ?? null,
        estimatedEngagement: null,
        captionAnalysis: competitor.strategy,
        hashtagsUsed: research.trendingHashtags.slice(0, 10),
        postingFrequency: tacticsEntry?.postingFrequency ?? null,
        keyStrategies: tacticsEntry?.keyStrategies ?? [competitor.strengths],
      });

      console.log(`[MarketResearch] Dados do concorrente "${competitor.name}" salvos.`);
    } catch (err) {
      console.error(`[MarketResearch] Erro ao salvar concorrente "${competitor.name}":`, err);
    }
  }

  // Passo 4 — Log de conclusão
  console.log(
    `[MarketResearch] Ciclo concluído para ${today}. ` +
      `${research.competitors.length} concorrente(s) registrado(s), ` +
      `${research.trendingHashtags.length} hashtag(s) trending, ` +
      `${research.recommendations.length} recomendação(ões) gerada(s).`
  );
}

// ─── Controle de frequência ───────────────────────────────────────────────────

function shouldRunToday(): boolean {
  const now = new Date();
  const isCorrectHour = now.getHours() === RUN_HOUR;
  const notYetRunToday = lastRunDate !== now.toDateString();
  return isCorrectHour && notYetRunToday;
}

// ─── Export público ───────────────────────────────────────────────────────────

export function startMarketResearchAgent(): () => void {
  console.log(
    `[MarketResearch] Agente iniciado. Roda diariamente às ${String(RUN_HOUR).padStart(2, "0")}:00, verificando a cada 10 minutos.`
  );

  const interval = setInterval(() => {
    if (shouldRunToday()) {
      lastRunDate = new Date().toDateString();
      runMarketResearch().catch((err) => {
        console.error("[MarketResearch] Erro não tratado na execução principal:", err);
      });
    }
  }, 10 * 60 * 1000);

  return () => {
    clearInterval(interval);
    console.log("[MarketResearch] Agente encerrado.");
  };
}
