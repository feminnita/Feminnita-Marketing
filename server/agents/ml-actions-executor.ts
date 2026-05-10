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

      console.log(`[MLExecutor] ${pending.length} ação(ões) pendente(s) — agrupando por conta`);

      const { runActionsInSession } = await import("./ml-ads-browser-agent");

      // Agrupa por conta — abre um único browser por conta
      const byAccount = new Map<string, typeof pending>();
      for (const action of pending) {
        const acc = String((action.payload as any)?.account || "feminnita");
        if (!byAccount.has(acc)) byAccount.set(acc, []);
        byAccount.get(acc)!.push(action);
      }

      for (const [acc, actions] of byAccount) {
        console.log(`[MLExecutor] Conta "${acc}" — ${actions.length} ação(ões) em um único browser`);

        // Marca todas como "executing"
        for (const action of actions) {
          await db.update(agentActions)
            .set({ status: "executing" as const })
            .where(eq(agentActions.id, action.id));
        }

        try {
          const batchActions = actions.map(a => ({
            id: a.id,
            actionType: String((a.payload as any)?.action || a.actionType || ""),
            campaignId: String((a.payload as any)?.campaignId || ""),
            campaignName: String((a.payload as any)?.campaignName || ""),
            budget: Number((a.payload as any)?.budget || 0),
          }));

          const results = await runActionsInSession(acc as "feminnita" | "fnt", batchActions);

          for (const [id, log] of Object.entries(results)) {
            console.log(`[MLExecutor] ✅ id=${id}: ${log}`);
            await db.update(agentActions)
              .set({ status: "done" as const, executedAt: new Date(), executionLog: log } as any)
              .where(eq(agentActions.id, Number(id)));
          }

          // Ações sem resultado (bug inesperado) — marca como failed
          for (const action of actions) {
            if (!(action.id in results)) {
              await db.update(agentActions)
                .set({ status: "pending" as const, executionLog: "Sem resultado do executor" } as any)
                .where(eq(agentActions.id, action.id));
            }
          }

        } catch (e: any) {
          console.error(`[MLExecutor] ❌ Erro na sessão "${acc}": ${e.message}`);
          // Reverte todas para pending para retry no próximo ciclo
          for (const action of actions) {
            await db.update(agentActions)
              .set({ status: "pending" as const, executionLog: `ERRO sessão: ${e.message}` } as any)
              .where(eq(agentActions.id, action.id));
          }
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
