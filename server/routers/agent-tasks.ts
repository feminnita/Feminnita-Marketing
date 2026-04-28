/**
 * Agent Tasks — Tarefas assíncronas para os agentes especialistas
 *
 * Permite enviar uma tarefa para um agente e receber a resposta
 * via WebSocket quando estiver pronta (mesmo com a aba fechada).
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { agentTasks } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { runAgentTask } from "../agents/agent-task-runner";

const VALID_AGENTS = ["fernanda", "sofia", "clara", "mariana"] as const;

export const agentTasksRouter = router({
  submit: protectedProcedure
    .input(z.object({
      agentName: z.enum(VALID_AGENTS),
      message: z.string().min(1).max(10000),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      const result = await db.insert(agentTasks).values({
        userId: ctx.user.id,
        agentName: input.agentName,
        message: input.message,
        status: "pending",
      });
      const taskId = (result[0] as any).insertId as number;

      // Dispara em background — não aguarda
      runAgentTask(taskId, ctx.user.id, input.agentName, input.message).catch((err) => {
        console.error(`[AgentTask] Erro na tarefa ${taskId}:`, err.message);
      });

      return { taskId };
    }),

  list: protectedProcedure
    .input(z.object({
      agentName: z.enum(VALID_AGENTS).optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];
      const { and, eq, desc } = await import("drizzle-orm");
      const conditions: any[] = [eq(agentTasks.userId, ctx.user.id)];
      if (input.agentName) conditions.push(eq(agentTasks.agentName, input.agentName));
      return db.select().from(agentTasks)
        .where(and(...conditions))
        .orderBy(desc(agentTasks.createdAt))
        .limit(input.limit);
    }),
});
