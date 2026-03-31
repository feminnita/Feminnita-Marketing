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
