import { getDb } from "../db";
import { agentActions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { runActionsInSession } from "./ml-ads-browser-agent";

const INTERVAL_MS = 5 * 60 * 1000;

export function startMLActionsExecutor(): () => void {
  let running = false;

  async function run() {
    if (running) return;
    running = true;
    try {
      const db = await getDb();
      if (!db) return;

      const { or } = await import("drizzle-orm");
      const pending = await db
        .select()
        .from(agentActions)
        .where(and(
          eq(agentActions.agentName, "gabi"),
          or(
            eq(agentActions.status, "pending"),
            eq(agentActions.status, "approved"),
          ),
          // Filtra apenas ações de ML Ads (não scrape, que o playwright-agent Python já cuida)
          // pause_ads_campaign | activate_ads_campaign | update_ads_budget
        ));

      if (pending.length === 0) return;

      console.log(`[MLExecutor] ${pending.length} ação(ões) pendente(s) — abrindo browser`);

      // Marca tudo como "executing"
      for (const action of pending) {
        await db.update(agentActions)
          .set({ status: "executing" as const })
          .where(eq(agentActions.id, action.id));
      }

      // Agrupa por conta para abrir UMA sessão de browser por conta
      const byAccount = new Map<string, typeof pending>();
      for (const action of pending) {
        const account = String((action.payload as any)?.account || "feminnita") as "feminnita" | "fnt";
        if (!byAccount.has(account)) byAccount.set(account, []);
        byAccount.get(account)!.push(action);
      }

      for (const [account, accountActions] of byAccount) {
        const batchActions = accountActions.map(a => ({
          id:           a.id,
          actionType:   String((a.payload as any)?.action || a.actionType || ""),
          campaignId:   String((a.payload as any)?.campaignId   || ""),
          campaignName: String((a.payload as any)?.campaignName || ""),
          budget:       Number((a.payload as any)?.budget       || 0),
        }));

        let results: Record<number, string>;
        try {
          results = await runActionsInSession(account as "feminnita" | "fnt", batchActions);
        } catch (e: any) {
          // Browser falhou completamente — reverte todas para pending
          console.error(`[MLExecutor] Browser falhou para ${account}:`, e.message);
          for (const action of accountActions) {
            await db.update(agentActions)
              .set({ status: "pending" as const, executionLog: `ERRO browser: ${e.message}` } as any)
              .where(eq(agentActions.id, action.id));
          }
          continue;
        }

        for (const action of accountActions) {
          const log = results[action.id] ?? "Sem resultado";
          const isError = log.startsWith("ERRO:") || log.includes("não encontrada") || log.includes("não encontrado");
          console.log(`[MLExecutor] ${isError ? "❌" : "✅"} id=${action.id}: ${log}`);
          await db.update(agentActions)
            .set({
              status:       (isError ? "pending" : "done") as const,
              executedAt:   isError ? undefined : new Date(),
              executionLog: log,
            } as any)
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

  setTimeout(run, 15_000);
  const interval = setInterval(run, INTERVAL_MS);
  console.log(`[MLExecutor] Iniciado — ciclos a cada ${INTERVAL_MS / 60000} min (Playwright browser)`);

  return () => clearInterval(interval);
}
