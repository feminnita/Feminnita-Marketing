/**
 * Agent Task Runner — Executa tarefas de agentes em background
 * e notifica o usuário via WebSocket quando concluída.
 */

import { getDb } from "../db";
import { agentTasks } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { chatWithSpecialist } from "./specialist-chat-agent";
import { getIO, isUserConnected } from "../_core/websocket-notifications";
import { sendPush } from "../services/webPush";
import { pushSubscriptions } from "../../drizzle/schema";

const AGENT_DISPLAY: Record<string, string> = {
  fernanda: "Fernanda",
  sofia: "Sofia",
  clara: "Clara",
  mariana: "Mariana",
};

export async function runAgentTask(
  taskId: number,
  userId: number,
  agentName: string,
  message: string
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  try {
    // Marcar como em processamento
    await db.update(agentTasks)
      .set({ status: "processing", startedAt: new Date() })
      .where(eq(agentTasks.id, taskId));

    // Executar o agente
    const response = await chatWithSpecialist(agentName, message, []);

    // Salvar resultado
    await db.update(agentTasks)
      .set({
        status: "done",
        result: response.message,
        finishedAt: new Date(),
      })
      .where(eq(agentTasks.id, taskId));

    // Notificar via WebSocket se usuário estiver online
    const io = getIO();
    if (io && isUserConnected(userId)) {
      io.to(`user_${userId}`).emit("agent:task:done", {
        taskId,
        agentName,
        agentDisplay: AGENT_DISPLAY[agentName] ?? agentName,
        message: response.message,
        originalMessage: message,
        proposedActions: response.proposedActions,
        ts: Date.now(),
      });
    } else if (db) {
      // Usuário offline — enviar push
      const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
      for (const sub of subs) {
        try {
          await sendPush(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            {
              title: `${AGENT_DISPLAY[agentName] ?? agentName} concluiu`,
              body: response.message.slice(0, 120),
              url: "/",
            }
          );
        } catch (err: any) {
          if (err.expired) {
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
          }
        }
      }
    }
  } catch (err: any) {
    await db.update(agentTasks)
      .set({ status: "error", result: err.message, finishedAt: new Date() })
      .where(eq(agentTasks.id, taskId));
  }
}
