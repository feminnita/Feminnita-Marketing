import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { conversationHistory, knowledgeBase } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

export const baileysAIIntegrationRouter = router({
  /**
   * Processa mensagem recebida do Baileys com IA
   * Busca contexto de conversas anteriores e gera resposta
   */
  processIncomingMessage: protectedProcedure
    .input(
      z.object({
        whatsappPhoneNumber: z.string(),
        userMessage: z.string(),
        whatsappContactName: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return {
          success: false,
          response: "Banco de dados não disponível",
          error: "Database not available",
        };
      }

      try {
        // 1. Buscar histórico de conversas anteriores
        const previousMessages = await db
          .select()
          .from(conversationHistory)
          .where(
            and(
              eq(conversationHistory.whatsappPhoneNumber, input.whatsappPhoneNumber),
              eq(conversationHistory.userId, ctx.user.id)
            )
          )
          .orderBy(desc(conversationHistory.createdAt))
          .limit(10);

        // 2. Buscar base de conhecimento (produtos, FAQs)
        const knowledgeItems = await db
          .select()
          .from(knowledgeBase)
          .where(eq(knowledgeBase.userId, ctx.user.id))
          .limit(20);

        // 3. Construir contexto para IA
        const conversationContext = previousMessages
          .reverse()
          .map((msg: any) => {
            if (msg.userMessage) return `Cliente: ${msg.userMessage}`;
            if (msg.aiResponse) return `Bot: ${msg.aiResponse}`;
            return "";
          })
          .filter((msg: string) => msg)
          .join("\n");

        const knowledgeContext = knowledgeItems
          .map((item: any) => `${item.category}: ${item.title} - ${item.content}`)
          .join("\n");

        // 4. Chamar LLM para gerar resposta
        const systemPrompt = `Você é um assistente de atendimento ao cliente para uma loja de pijamas.
Você deve:
1. Responder perguntas sobre produtos, tamanhos, preços e entrega
2. Ser amigável e profissional
3. Se não souber a resposta, oferecer encaminhar para um humano
4. Detectar quando o cliente pede para falar com um humano (palavras-chave: "humano", "atendente", "pessoa", "falar com alguém")

Base de Conhecimento:
${knowledgeContext}

Histórico da Conversa:
${conversationContext}`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.userMessage },
          ],
        });

        const aiResponse =
          response.choices[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

        // 5. Detectar se precisa escalação
        const escalationKeywords = [
          "humano",
          "atendente",
          "pessoa",
          "falar com alguém",
          "gerente",
          "supervisor",
        ];
        const needsEscalation = escalationKeywords.some((keyword) =>
          input.userMessage.toLowerCase().includes(keyword)
        );

        // 6. Salvar conversa no histórico
        await db.insert(conversationHistory).values({
          userId: ctx.user.id,
          whatsappPhoneNumber: input.whatsappPhoneNumber,
          whatsappContactName: input.whatsappContactName || "Cliente",
          userMessage: input.userMessage,
          aiResponse: aiResponse,
          escalated: needsEscalation,
          status: needsEscalation ? "escalated" : "open",
        } as any);

        return {
          success: true,
          response: aiResponse,
          needsEscalation,
          whatsappPhoneNumber: input.whatsappPhoneNumber,
          whatsappContactName: input.whatsappContactName || "Cliente",
        };
      } catch (error) {
        console.error("[Baileys AI] Error processing message:", error);
        return {
          success: false,
          response: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
          needsEscalation: true,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Obter histórico de conversa com um cliente
   */
  getConversationHistory: protectedProcedure
    .input(z.object({ whatsappPhoneNumber: z.string() }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return {
          whatsappPhoneNumber: input.whatsappPhoneNumber,
          messages: [],
          totalMessages: 0,
          error: "Database not available",
        };
      }

      const messages = await db
        .select()
        .from(conversationHistory)
        .where(
          and(
            eq(conversationHistory.whatsappPhoneNumber, input.whatsappPhoneNumber),
            eq(conversationHistory.userId, ctx.user.id)
          )
        )
        .orderBy(conversationHistory.createdAt);

      return {
        whatsappPhoneNumber: input.whatsappPhoneNumber,
        messages: messages.map((msg: any) => ({
          id: msg.id,
          userMessage: msg.userMessage,
          aiResponse: msg.aiResponse,
          escalated: msg.escalated,
          status: msg.status,
          createdAt: msg.createdAt,
        })),
        totalMessages: messages.length,
      };
    }),

  /**
   * Listar conversas ativas (últimas 24 horas)
   */
  getActiveConversations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        activeConversations: [],
        totalActive: 0,
        error: "Database not available",
      };
    }

    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const conversations = await db
      .select()
      .from(conversationHistory)
      .where(
        and(
          eq(conversationHistory.userId, ctx.user.id),
          eq(conversationHistory.status, "open")
        )
      )
      .orderBy(desc(conversationHistory.createdAt));

    // Remove duplicates by phoneNumber, keeping the most recent
    const uniqueConversations = Array.from(
      new Map(
        conversations.map((conv: any) => [conv.whatsappPhoneNumber, conv])
      ).values()
    );

    return {
      activeConversations: uniqueConversations.map((conv: any) => ({
        whatsappPhoneNumber: conv.whatsappPhoneNumber,
        whatsappContactName: conv.whatsappContactName,
        lastMessage: conv.userMessage,
        lastMessageTime: conv.createdAt,
        status: conv.status,
      })),
      totalActive: uniqueConversations.length,
    };
  }),

  /**
   * Marcar conversa como escalada para humano
   */
  escalateToHuman: protectedProcedure
    .input(
      z.object({
        whatsappPhoneNumber: z.string(),
        reason: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) {
        return {
          success: false,
          error: "Database not available",
        };
      }

      try {
        // Buscar última mensagem da conversa
        const lastMessage = await db
          .select()
          .from(conversationHistory)
          .where(
            and(
              eq(conversationHistory.whatsappPhoneNumber, input.whatsappPhoneNumber),
              eq(conversationHistory.userId, ctx.user.id)
            )
          )
          .orderBy(desc(conversationHistory.createdAt))
          .limit(1);

        if (lastMessage.length === 0) {
          return {
            success: false,
            error: "Conversa não encontrada",
          };
        }

        // Atualizar status para escalado
        // Note: Drizzle não tem update direto, então inserimos um novo registro
        await db.insert(conversationHistory).values({
          userId: ctx.user.id,
          whatsappPhoneNumber: input.whatsappPhoneNumber,
          whatsappContactName: lastMessage[0].whatsappContactName || "Cliente",
          userMessage: `[ESCALAÇÃO] ${input.reason || "Conversa escalada para atendimento humano"}`,
          aiResponse: null,
          escalated: true,
          status: "escalated",
        } as any);

        return {
          success: true,
          message: "Conversa escalada para atendimento humano",
          whatsappPhoneNumber: input.whatsappPhoneNumber,
        };
      } catch (error) {
        console.error("[Baileys AI] Error escalating conversation:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Obter estatísticas de atendimento
   */
  getAttendanceStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) {
      return {
        totalMessages: 0,
        uniqueCustomers: 0,
        messagesWithAIResponse: 0,
        escalatedConversations: 0,
        resolvedConversations: 0,
        averageMessagesPerCustomer: 0,
        error: "Database not available",
      };
    }

    const allMessages = await db
      .select()
      .from(conversationHistory)
      .where(eq(conversationHistory.userId, ctx.user.id));

    const uniquePhones = new Set(allMessages.map((msg: any) => msg.whatsappPhoneNumber)).size;
    const messagesWithAI = allMessages.filter((msg: any) => msg.aiResponse).length;
    const escalatedConversations = allMessages.filter((msg: any) => msg.escalated).length;
    const resolvedConversations = allMessages.filter((msg: any) => msg.status === "resolved").length;

    return {
      totalMessages: allMessages.length,
      uniqueCustomers: uniquePhones,
      messagesWithAIResponse: messagesWithAI,
      escalatedConversations,
      resolvedConversations,
      averageMessagesPerCustomer: uniquePhones > 0 ? Math.round(allMessages.length / uniquePhones) : 0,
    };
  }),
});
