import { startSyncAgent } from "./sync-agent";
import { startTokenRefreshAgent } from "./token-refresh-agent";
import { startContentAgent } from "./content-agent";
import { startAlertAgent } from "./alert-agent";
import { startPerformanceAgent } from "./performance-agent";
import { startPublicationWorker } from "./publication-worker";
import { startMarketResearchAgent } from "./market-research-agent";
import { startCopywriterAgent } from "./copywriter-agent";
import { startCreativeTeamAgent } from "./creative-team-agent";
import { startLaunchAgent } from "./launch-agent";
import { runAllInfluencerAgents } from "./influencer-agent";
import { startFernandaDailyAgent } from "./fernanda-daily-agent";
import { runMorningBriefing } from "./morning-briefing-agent";
import { startMLActionsExecutor } from "./ml-actions-executor";
import { startShopeeActionsExecutor } from "./shopee-actions-executor";
import { apiScrapeMLMetrics } from "./ml-ads-api";

// ─── Briefing matinal (roda às 7h todo dia, antes dos demais agentes) ────────
function startMorningBriefingScheduler(): () => void {
  const HOUR = 7;
  let timeout: NodeJS.Timeout;

  function scheduleNext() {
    const now = new Date();
    const next = new Date();
    next.setHours(HOUR, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const msUntilNext = next.getTime() - now.getTime();

    timeout = setTimeout(async () => {
      console.log("[MorningBriefing] Iniciando briefing diário...");
      try {
        await runMorningBriefing();
        console.log("[MorningBriefing] Briefing concluído.");
      } catch (err) {
        console.error("[MorningBriefing] Erro:", err);
      }
      scheduleNext();
    }, msUntilNext);

    console.log(`[MorningBriefing] Próximo briefing agendado para ${next.toLocaleString("pt-BR")}`);
  }

  scheduleNext();
  return () => clearTimeout(timeout);
}

// ─── Agendador diário das influencers (roda às 8h todo dia) ──────────────────
function startInfluencerDailyAgent(): () => void {
  const HOUR = 8; // 8h da manhã
  let timeout: NodeJS.Timeout;

  function scheduleNext() {
    const now = new Date();
    const next = new Date();
    next.setHours(HOUR, 0, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1);
    const msUntilNext = next.getTime() - now.getTime();

    timeout = setTimeout(async () => {
      console.log("[InfluencerAgent] Iniciando ciclo diário das influencers...");
      try {
        await runAllInfluencerAgents();
      } catch (err) {
        console.error("[InfluencerAgent] Erro no ciclo diário:", err);
      }
      scheduleNext();
    }, msUntilNext);

    console.log(`[InfluencerAgent] Próximo ciclo agendado para ${next.toLocaleString("pt-BR")}`);
  }

  scheduleNext();
  return () => clearTimeout(timeout);
}

// ─── Coletor de métricas ML Ads (a cada 6h) ───────────────────────────────────
function startMLMetricsCollector(): () => void {
  const INTERVAL_MS = 6 * 60 * 60 * 1000;

  async function run() {
    for (const account of ["feminnita", "fnt"] as const) {
      try {
        const count = await apiScrapeMLMetrics(account);
        console.log(`[MLMetrics] ${account}: ${count} métricas atualizadas`);
      } catch (e: any) {
        console.error(`[MLMetrics] Erro ao coletar métricas (${account}):`, e.message);
      }
    }
  }

  // Roda 30s após startup — dá tempo do banco conectar e do executor iniciar
  setTimeout(run, 30_000);
  const interval = setInterval(run, INTERVAL_MS);
  console.log(`[MLMetrics] Coletor iniciado — ciclos a cada ${INTERVAL_MS / 3600000}h`);
  return () => clearInterval(interval);
}

export function startAllAgents(): () => void {
  console.log("[Agents] Iniciando todos os agentes de automação...");
  const cleanups: Array<() => void> = [];

  // start each agent, catch errors individually
  const agents = [
    { name: "SyncAgent", start: startSyncAgent },
    { name: "TokenRefresh", start: startTokenRefreshAgent },
    { name: "ContentAgent", start: startContentAgent },
    { name: "AlertAgent", start: startAlertAgent },
    { name: "PerformanceAgent", start: startPerformanceAgent },
    { name: "PublicationWorker", start: startPublicationWorker },
    { name: "MarketResearch", start: startMarketResearchAgent },
    { name: "Copywriter", start: startCopywriterAgent },
    { name: "CreativeTeam", start: startCreativeTeamAgent },
    { name: "LaunchAgent", start: startLaunchAgent },
    { name: "MorningBriefing", start: startMorningBriefingScheduler },
    { name: "InfluencerDailyAgent", start: startInfluencerDailyAgent },
    { name: "FernandaDaily", start: startFernandaDailyAgent },
    { name: "MLActionsExecutor", start: startMLActionsExecutor },
    { name: "ShopeeActionsExecutor", start: startShopeeActionsExecutor },
    { name: "MLMetricsCollector", start: startMLMetricsCollector },
  ];

  for (const agent of agents) {
    try {
      const cleanup = agent.start();
      cleanups.push(cleanup);
      console.log(`[Agents] ${agent.name} iniciado`);
    } catch (err) {
      console.error(`[Agents] Falha ao iniciar ${agent.name}:`, err);
    }
  }

  return () => {
    cleanups.forEach(fn => fn());
    console.log("[Agents] Todos os agentes parados");
  };
}
