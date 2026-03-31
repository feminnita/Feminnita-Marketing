import { startSyncAgent } from "./sync-agent";
import { startTokenRefreshAgent } from "./token-refresh-agent";
import { startContentAgent } from "./content-agent";
import { startAlertAgent } from "./alert-agent";
import { startPerformanceAgent } from "./performance-agent";
import { startPublicationWorker } from "./publication-worker";

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
