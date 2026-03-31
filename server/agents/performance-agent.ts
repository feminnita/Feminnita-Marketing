import { getDb } from "../db";
import { influencers, influencerPerformance, instagramAccounts } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const CHECK_INTERVAL_MS = 5 * 60 * 1000; // verifica a cada 5 minutos
const RUN_HOUR = 0; // meia-noite

let lastRunDate: string | null = null;

interface InstagramProfile {
  followers_count?: number;
  media_count?: number;
  profile_picture_url?: string;
}

async function fetchInstagramProfile(
  instagramHandle: string,
  accessToken: string
): Promise<InstagramProfile> {
  const url =
    `https://graph.facebook.com/v18.0/${instagramHandle}` +
    `?fields=followers_count,media_count,profile_picture_url` +
    `&access_token=${accessToken}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Instagram Graph API HTTP ${res.status} para @${instagramHandle}`);
  return res.json();
}

async function collectInfluencerMetrics(influencer: {
  id: number;
  name: string;
  instagramHandle: string | null;
  instagramAccessToken: string | null;
}): Promise<void> {
  if (!influencer.instagramHandle || !influencer.instagramAccessToken) {
    console.warn(`[PerformanceAgent] Influencer id=${influencer.id} sem instagramHandle ou token — pulando`);
    return;
  }

  const profile = await fetchInstagramProfile(
    influencer.instagramHandle,
    influencer.instagramAccessToken
  );

  const totalFollowers = profile.followers_count ?? 0;
  const totalEngagement = profile.media_count ?? 0; // proxy até termos métricas reais
  const engagementRate =
    totalFollowers > 0
      ? Number(((totalEngagement / totalFollowers) * 100).toFixed(2))
      : 0;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const db = await getDb();
  if (!db) { console.warn("[PerformanceAgent] Banco indisponível ao inserir performance"); return; }

  await db.insert(influencerPerformance).values({
    influencerId: influencer.id,
    date: today,
    platform: "instagram",
    totalFollowers,
    followersGrowth: 0,
    totalEngagement,
    engagementRate: engagementRate,
    totalReach: 0,
    totalImpressions: 0,
  });

  console.log(
    `[PerformanceAgent] @${influencer.instagramHandle} — ` +
    `followers=${totalFollowers} engagement=${engagementRate}% gravado para ${today}`
  );
}

async function runPerformanceCollection(): Promise<void> {
  console.log("[PerformanceAgent] Coletando métricas de performance...");
  const db = await getDb();
  if (!db) { console.warn("[PerformanceAgent] Banco indisponível — coleta abortada"); return; }

  try {
    const activeInfluencers = await db
      .select()
      .from(influencers)
      .where(eq(influencers.isActive, true));

    console.log(`[PerformanceAgent] ${activeInfluencers.length} influencer(s) ativo(s)`);

    for (const influencer of activeInfluencers) {
      try {
        await collectInfluencerMetrics({
          id: influencer.id,
          name: influencer.name,
          instagramHandle: influencer.instagramHandle ?? null,
          instagramAccessToken: influencer.instagramAccessToken ?? null,
        });
      } catch (err) {
        console.error(
          `[PerformanceAgent] Erro ao coletar métricas influencer id=${influencer.id}:`,
          err
        );
      }
    }
  } catch (err) {
    console.error("[PerformanceAgent] Erro ao buscar influencers:", err);
  }

  lastRunDate = new Date().toDateString();
  console.log("[PerformanceAgent] Coleta diária concluída.");
}

function shouldRunToday(): boolean {
  const now = new Date();
  const isCorrectHour = now.getHours() === RUN_HOUR;
  const notYetRunToday = lastRunDate !== now.toDateString();
  return isCorrectHour && notYetRunToday;
}

export function startPerformanceAgent(): () => void {
  console.log(`[PerformanceAgent] Agente iniciado (roda diariamente às ${String(RUN_HOUR).padStart(2, "0")}:00, verifica a cada 5min)`);

  const interval = setInterval(() => {
    if (shouldRunToday()) {
      runPerformanceCollection().catch((err) =>
        console.error("[PerformanceAgent] Erro na coleta:", err)
      );
    }
  }, CHECK_INTERVAL_MS);

  return () => {
    clearInterval(interval);
    console.log("[PerformanceAgent] Agente encerrado.");
  };
}
