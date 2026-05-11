import { getDb } from "../db";
import { agentActions } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { runTrayActionsInSession } from "./tray-browser-agent";

const INTERVAL_MS = 5 * 60 * 1000;

export function startTrayActionsExecutor(): () => void {
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
        .where(and(eq(agentActions.agentName, "duda"), eq(agentActions.status, "pending")));

      if (pending.length === 0) return;

      console.log(`[TrayExecutor] ${pending.length} ação(ões) pendente(s) — abrindo browser`);

      for (const action of pending) {
        await db.update(agentActions)
          .set({ status: "executing" as const })
          .where(eq(agentActions.id, action.id));
      }

      const batchActions = pending.map(a => {
        const p = (a.payload as any) || {};
        return {
          id:             a.id,
          actionType:     a.actionType,
          productId:      String(p.productId  || ""),
          pageSlug:       String(p.pageSlug   || ""),
          seoTitle:       String(p.seoTitle   || ""),
          seoDescription: String(p.seoDescription || ""),
          description:    String(p.description || ""),
        };
      });

      let results: Record<number, string>;
      try {
        results = await runTrayActionsInSession(batchActions);
      } catch (e: any) {
        console.error(`[TrayExecutor] Browser falhou:`, e.message);
        for (const action of pending) {
          await db.update(agentActions)
            .set({ status: "pending" as const, executionLog: `ERRO browser: ${e.message}` } as any)
            .where(eq(agentActions.id, action.id));
        }
        return;
      }

      for (const action of pending) {
        const log = results[action.id] ?? "Sem resultado";
        const isError = log.startsWith("ERRO:");
        console.log(`[TrayExecutor] ${isError ? "❌" : "✅"} id=${action.id}: ${log}`);
        await db.update(agentActions)
          .set({
            status:       (isError ? "pending" : "done") as const,
            executedAt:   isError ? undefined : new Date(),
            executionLog: log,
          } as any)
          .where(eq(agentActions.id, action.id));
      }

      console.log(`[TrayExecutor] Ciclo concluído`);
    } catch (err: any) {
      console.error(`[TrayExecutor] Erro no ciclo:`, err);
    } finally {
      running = false;
    }
  }

  setTimeout(run, 25_000);
  const interval = setInterval(run, INTERVAL_MS);
  console.log(`[TrayExecutor] Iniciado — ciclos a cada ${INTERVAL_MS / 60000} min (Playwright browser)`);

  return () => clearInterval(interval);
}
