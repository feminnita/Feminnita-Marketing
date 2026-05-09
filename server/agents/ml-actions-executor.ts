import { getDb } from "../db";
import { agentActions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

const INTERVAL_MS = 5 * 60 * 1000; // a cada 5 minutos

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

      console.log(`[MLExecutor] ${pending.length} ação(ões) pendente(s) — iniciando execução`);

      const { pauseAdsCampaign, activateAdsCampaign, updateAdsBudget } = await import("./ml-ads-browser-agent");

      for (const action of pending) {
        const payload = action.payload as any;
        if (!payload) {
          console.warn(`[MLExecutor] Ação id=${action.id} sem payload — pulando`);
          continue;
        }

        const campaignId   = String(payload.campaignId   || "");
        const campaignName = String(payload.campaignName || "");
        const acc          = ((payload.account as string) || "feminnita") as "feminnita" | "fnt";
        const actionType   = String(payload.action || action.actionType || "");

        console.log(`[MLExecutor] id=${action.id} tipo="${actionType}" campanha="${campaignName}" account="${acc}"`);

        try {
          await db.update(agentActions)
            .set({ status: "executing" as const })
            .where(eq(agentActions.id, action.id));

          let res: string;
          switch (actionType) {
            case "pause_ads_campaign":
              res = await pauseAdsCampaign(campaignId, acc, campaignName);
              break;
            case "activate_ads_campaign":
              res = await activateAdsCampaign(campaignId, acc, campaignName);
              break;
            case "update_ads_budget":
              res = await updateAdsBudget(campaignId, Number(payload.budget || 0), acc, campaignName);
              break;
            default:
              console.warn(`[MLExecutor] Tipo desconhecido "${actionType}" id=${action.id} — marcando como done para não re-processar`);
              await db.update(agentActions)
                .set({ status: "done" as const, executionLog: `Tipo não suportado pelo MLExecutor: ${actionType}` } as any)
                .where(eq(agentActions.id, action.id));
              continue;
          }

          console.log(`[MLExecutor] ✅ id=${action.id}: ${res}`);
          await db.update(agentActions)
            .set({ status: "done" as const, executedAt: new Date(), executionLog: res } as any)
            .where(eq(agentActions.id, action.id));

        } catch (e: any) {
          console.error(`[MLExecutor] ❌ id=${action.id} "${action.title}": ${e.message}`);
          await db.update(agentActions)
            .set({ status: "pending" as const, executionLog: `ERRO: ${e.message}` } as any)
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
  console.log(`[MLExecutor] Iniciado — ciclos a cada ${INTERVAL_MS / 60000} min`);

  return () => clearInterval(interval);
}
