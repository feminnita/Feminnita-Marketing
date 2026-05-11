import { getDb } from "../db";
import { agentActions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { apiPauseMLCampaign, apiActivateMLCampaign, apiUpdateMLBudget } from "./ml-ads-api";

const INTERVAL_MS = 5 * 60 * 1000;

export function startMLActionsExecutor(): () => void {
  let running = false;

  async function run() {
    if (running) return;
    running = true;
    try {
      const db = await getDb();
      if (!db) return;

      const pending = await db
        .select()
        .from(agentActions)
        .where(and(eq(agentActions.agentName, "gabi"), eq(agentActions.status, "pending")));

      if (pending.length === 0) return;

      console.log(`[MLExecutor] ${pending.length} ação(ões) pendente(s) — executando via API REST`);

      for (const action of pending) {
        await db.update(agentActions)
          .set({ status: "executing" as const })
          .where(eq(agentActions.id, action.id));

        const payload      = action.payload as any;
        const account      = String(payload?.account      || "feminnita") as "feminnita" | "fnt";
        const actionType   = String(payload?.action       || action.actionType || "");
        const campaignId   = String(payload?.campaignId   || "");
        const campaignName = String(payload?.campaignName || "");
        const budget       = Number(payload?.budget       || 0);

        let log = "";
        try {
          switch (actionType) {
            case "pause_ads_campaign":
              log = await apiPauseMLCampaign(account, campaignId, campaignName);
              break;
            case "activate_ads_campaign":
              log = await apiActivateMLCampaign(account, campaignId, campaignName);
              break;
            case "update_ads_budget":
              log = await apiUpdateMLBudget(account, campaignId, budget, campaignName);
              break;
            default:
              log = `Tipo não suportado: ${actionType}`;
          }
          console.log(`[MLExecutor] ✅ id=${action.id}: ${log}`);
          await db.update(agentActions)
            .set({ status: "done" as const, executedAt: new Date(), executionLog: log } as any)
            .where(eq(agentActions.id, action.id));
        } catch (e: any) {
          log = `ERRO: ${e.message}`;
          console.error(`[MLExecutor] ❌ id=${action.id}: ${log}`);
          await db.update(agentActions)
            .set({ status: "pending" as const, executionLog: log } as any)
            .where(eq(agentActions.id, action.id));
        }
      }

      console.log(`[MLExecutor] Ciclo concluído`);
    } catch (err: any) {
      console.error(`[MLExecutor] Erro no ciclo:`, err);
    } finally {
      running = false;
    }
  }

  // Roda 15s após o startup (dá tempo do banco conectar)
  setTimeout(run, 15_000);

  const interval = setInterval(run, INTERVAL_MS);
  console.log(`[MLExecutor] Iniciado — ciclos a cada ${INTERVAL_MS / 60000} min (API REST — sem browser)`);

  return () => clearInterval(interval);
}
