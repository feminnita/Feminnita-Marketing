/**
 * Specialist Chat Router — Chat com Sofia, Clara e Mariana
 */

import { z } from "zod";
import { router, protectedProcedure } from "../_core/trpc";
import { textToSpeech } from "../services/tts";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import {
  specialistConversations,
  specialistMessages,
  SpecialistMessage,
} from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { chatWithSpecialist } from "../agents/specialist-chat-agent";
import { agentActions } from "../../drizzle/schema";

const VALID_AGENTS = ["fernanda", "sofia", "clara", "mariana", "luiza", "luiza_fnt", "gabi"] as const;
type AgentName = typeof VALID_AGENTS[number];

export const specialistChatRouter = router({
  // ── Enviar mensagem ao agente ──────────────────────────────────────────────
  chat: protectedProcedure
    .input(
      z.object({
        agentName: z.enum(VALID_AGENTS),
        message: z.string().min(1).max(10000),
        conversationId: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB unavailable" });

      // Buscar ou criar conversa
      let convId = input.conversationId;
      if (!convId) {
        const autoTitle =
          input.message.slice(0, 60) + (input.message.length > 60 ? "…" : "");
        await db.insert(specialistConversations).values({
          userId: ctx.user.id,
          agentName: input.agentName,
          title: autoTitle,
        });
        const [created] = await db
          .select()
          .from(specialistConversations)
          .where(
            and(
              eq(specialistConversations.userId, ctx.user.id),
              eq(specialistConversations.agentName, input.agentName)
            )
          )
          .orderBy(desc(specialistConversations.createdAt))
          .limit(1);
        convId = created.id;
      } else {
        // Verificar ownership
        const [conv] = await db
          .select()
          .from(specialistConversations)
          .where(
            and(
              eq(specialistConversations.id, convId),
              eq(specialistConversations.userId, ctx.user.id)
            )
          )
          .limit(1);
        if (!conv) throw new TRPCError({ code: "NOT_FOUND", message: "Conversa não encontrada" });
      }

      // Histórico (últimas 20 mensagens)
      const history = await db
        .select()
        .from(specialistMessages)
        .where(eq(specialistMessages.conversationId, convId!))
        .orderBy(desc(specialistMessages.createdAt))
        .limit(20);

      const conversationHistory = history
        .reverse()
        .map((m: SpecialistMessage) => ({ role: m.role as "user" | "assistant", content: m.content }));

      // Salvar mensagem do usuário
      await db.insert(specialistMessages).values({
        conversationId: convId!,
        role: "user",
        content: input.message,
      });

      // Chamar o agente
      const agentResponse = await chatWithSpecialist(
        input.agentName,
        input.message,
        conversationHistory
      );

      // Salvar resposta do agente
      await db.insert(specialistMessages).values({
        conversationId: convId!,
        role: "assistant",
        content: agentResponse.message,
      });

      // Atualizar timestamp da conversa
      await db
        .update(specialistConversations)
        .set({ updatedAt: new Date() })
        .where(eq(specialistConversations.id, convId!));

      // Salvar ações propostas na tabela agent_actions
      const today = new Date().toISOString().slice(0, 10);
      for (const action of agentResponse.proposedActions) {
        try {
          await db.insert(agentActions).values({
            agentName: input.agentName,
            date: today,
            title: action.title,
            description: action.description,
            actionType: action.type || "chat_action",
            priority: (action.priority || "media") as "alta" | "media" | "baixa",
            estimatedImpact: action.estimatedImpact,
            status: "pending",
          });
        } catch (err: any) {
          console.warn("[specialistChat] Erro ao salvar ação:", err.message);
        }
      }

      return {
        conversationId: convId,
        message: agentResponse.message,
        proposedActions: agentResponse.proposedActions,
      };
    }),

  // ── Listar conversas de um agente ──────────────────────────────────────────
  listConversations: protectedProcedure
    .input(
      z.object({
        agentName: z.enum(VALID_AGENTS),
        limit: z.number().default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      return db
        .select()
        .from(specialistConversations)
        .where(
          and(
            eq(specialistConversations.userId, ctx.user.id),
            eq(specialistConversations.agentName, input.agentName)
          )
        )
        .orderBy(desc(specialistConversations.updatedAt))
        .limit(input.limit);
    }),

  // ── Buscar mensagens de uma conversa ──────────────────────────────────────
  getMessages: protectedProcedure
    .input(z.object({ conversationId: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return [];

      // Verificar ownership
      const [conv] = await db
        .select()
        .from(specialistConversations)
        .where(
          and(
            eq(specialistConversations.id, input.conversationId),
            eq(specialistConversations.userId, ctx.user.id)
          )
        )
        .limit(1);
      if (!conv) throw new TRPCError({ code: "NOT_FOUND", message: "Conversa não encontrada" });

      return db
        .select()
        .from(specialistMessages)
        .where(eq(specialistMessages.conversationId, input.conversationId))
        .orderBy(specialistMessages.createdAt);
    }),

  speak: protectedProcedure
    .input(z.object({ text: z.string().max(10000), agentName: z.string() }))
    .mutation(async ({ input }) => {
      const truncated = input.text.length > 4000 ? input.text.slice(0, 4000) + "…" : input.text;
      const audioBuffer = await textToSpeech(truncated, input.agentName);
      return { audioBase64: audioBuffer.toString("base64") };
    }),
});
