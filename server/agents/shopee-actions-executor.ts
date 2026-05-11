import { getDb } from "../db";
import { agentActions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { pauseShopeeCampaign, activateShopeeCampaign, updateShopeeBudget, updateShopeeRoas } from "./shopee-ads-browser-agent";

const INTERVAL_MS = 5 * 60 * 1000;

export function startShopeeActionsExecutor(): () => void {
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
        .where(and(eq(agentActions.agentName, "luiza"), eq(agentActions.status, "pending")));

      if (pending.length === 0) return;

      console.log(`[ShopeeExecutor] ${pending.length} ação(ões) pendente(s) — executando via browser`);

      for (const action of pending) {
        await db.update(agentActions)
          .set({ status: "executing" as const })
          .where(eq(agentActions.id, action.id));

        const payload    = action.payload as any;
        const acc        = (payload?.account || "feminnita") as "feminnita" | "fnt";
        const campaignId = String(payload?.campaignId || "");
        const proposed   = String(payload?.proposedValue ?? "");

        let log = "";
        try {
          switch (action.actionType) {
            case "shopee_pause_campaign":
              log = await pauseShopeeCampaign(campaignId, acc);
              break;
            case "shopee_activate_campaign":
              log = await activateShopeeCampaign(campaignId, acc);
              break;
            case "shopee_update_budget":
              log = await updateShopeeBudget(campaignId, Number(proposed), acc);
              break;
            case "shopee_update_roas":
              log = await updateShopeeRoas(campaignId, Number(proposed), acc);
              break;
            default:
              log = `Tipo não suportado: ${action.actionType}`;
          }
          console.log(`[ShopeeExecutor] ✅ id=${action.id}: ${log}`);
          await db.update(agentActions)
            .set({ status: "done" as const, executedAt: new Date(), executionLog: log } as any)
            .where(eq(agentActions.id, action.id));
        } catch (e: any) {
          log = `ERRO: ${e.message}`;
          console.error(`[ShopeeExecutor] ❌ id=${action.id}: ${log}`);
          await db.update(agentActions)
            .set({ status: "pending" as const, executionLog: log } as any)
            .where(eq(agentActions.id, action.id));
        }
      }

      console.log(`[ShopeeExecutor] Ciclo concluído`);
    } catch (err: any) {
      console.error(`[ShopeeExecutor] Erro no ciclo:`, err);
    } finally {
      running = false;
    }
  }

  setTimeout(run, 20_000);
  const interval = setInterval(run, INTERVAL_MS);
  console.log(`[ShopeeExecutor] Iniciado — ciclos a cada ${INTERVAL_MS / 60000} min (Playwright browser)`);

  return () => clearInterval(interval);
}
