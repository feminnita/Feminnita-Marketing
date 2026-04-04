import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  knowledgeBase,
  aiTrainingData,
  conversationHistory,
  escalationQueue,
  aiSettings,
} from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";
import { eq, and, desc, like } from "drizzle-orm";

export const aiCustomerSupportRouter = router({
  // ============================================
  // PROCESSAMENTO DE MENSAGENS
  // ============================================

  /**
   * Processa uma mensagem do cliente e retorna resposta da IA
   */
  processMessage: protectedProcedure
    .input(
      z.object({
        whatsappPhoneNumber: z.string(),
        whatsappContactName: z.string().optional(),
        userMessage: z.string(),
        conversationContext: z.array(z.object({
          role: z.enum(["user", "assistant"]),
          content: z.string(),
        })).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      try {
        // 1. Buscar configurações de IA do usuário
        const settings = await db
          .select()
          .from(aiSettings)
          .where(eq(aiSettings.userId, ctx.user.id))
          .limit(1);

        const aiConfig = settings[0];

        // 2. Buscar dados de treinamento relevantes
        const trainingExamples = await db
          .select()
          .from(aiTrainingData)
          .where(
            and(
              eq(aiTrainingData.userId, ctx.user.id),
              eq(aiTrainingData.isActive, true)
            )
          )
          .limit(5);

        // 3. Buscar produtos relevantes na base de conhecimento
        const relevantProducts = await searchKnowledgeBase(
          db,
          ctx.user.id,
          input.userMessage,
          aiConfig?.searchResultsLimit || 3
        );

        // 4. Construir prompt para LLM
        const systemPrompt = buildSystemPrompt(
          aiConfig?.systemPrompt,
          trainingExamples,
          relevantProducts
        );

        // 5. Verificar palavras-chave de escalação
        const shouldEscalate = checkEscalationKeywords(
          input.userMessage,
          aiConfig?.escalationKeywords || []
        );

        if (shouldEscalate) {
          // Criar escalação imediata
          await createEscalation(
            db,
            ctx.user.id,
            input.whatsappPhoneNumber,
            input.whatsappContactName,
            "Cliente solicitou atendimento humano"
          );

          return {
            success: true,
            response: "Entendi! Vou conectar você com um atendente humano. Um momento, por favor.",
            escalated: true,
            escalationReason: "Cliente solicitou atendimento humano",
            mentionedProducts: [],
          };
        }

        // 6. Chamar LLM
        const messages = [
          { role: "system" as const, content: systemPrompt },
          ...(input.conversationContext || []),
          { role: "user" as const, content: input.userMessage },
        ];

        const llmResponse = await invokeLLM({
          messages: messages as any,
        } as any);

        const aiResponse = llmResponse.choices[0]?.message?.content || "";

        // 7. Salvar na histu00f3ria de conversas
        await db
          .insert(conversationHistory)
          .values({
            userId: ctx.user.id,
            whatsappPhoneNumber: input.whatsappPhoneNumber,
            whatsappContactName: input.whatsappContactName,
            userMessage: input.userMessage,
            aiResponse: aiResponse,
            confidence: 0.85, // Placeholder
            mentionedProducts: relevantProducts.map((p: any) => ({
              id: p.id,
              name: p.title,
              url: p.url || "",
            })),
            status: "open",
          } as any);

        // 8. Verificar se deve auto-escalar após N mensagens
        const conversationCount = await db
          .select()
          .from(conversationHistory)
          .where(
            and(
              eq(conversationHistory.userId, ctx.user.id),
              eq(conversationHistory.whatsappPhoneNumber, input.whatsappPhoneNumber),
              eq(conversationHistory.status, "open")
            )
          );

        if (
          conversationCount.length >= (aiConfig?.autoEscalateAfterMessages || 5)
        ) {
          await createEscalation(
            db,
            ctx.user.id,
            input.whatsappPhoneNumber,
            input.whatsappContactName,
            `Conversa atingiu limite de ${conversationCount.length} mensagens`
          );

          return {
            success: true,
            response: aiResponse + "\n\n(Sua conversa será transferida para um atendente humano)",
            escalated: true,
            escalationReason: "Limite de mensagens atingido",
            mentionedProducts: relevantProducts,
          };
        }

        return {
          success: true,
          response: aiResponse,
          escalated: false,
          mentionedProducts: relevantProducts,
        };
      } catch (error) {
        console.error("[AI Support] Erro ao processar mensagem:", error);
        
        // Notificar proprietário em caso de erro
        await notifyOwner({
          title: "Erro na IA de Atendimento",
          content: `Erro ao processar mensagem de ${input.whatsappPhoneNumber}: ${error}`,
        });

        return {
          success: false,
          response: "Desculpe, tive um problema ao processar sua mensagem. Um atendente humano vai ajudá-lo em breve.",
          escalated: true,
          escalationReason: "Erro no processamento",
          mentionedProducts: [],
        };
      }
    }),

  // ============================================
  // GERENCIAR BASE DE CONHECIMENTO
  // ============================================

  /**
   * Adicionar item à base de conhecimento
   */
  addKnowledgeItem: protectedProcedure
    .input(
      z.object({
        contentType: z.enum(["product", "faq", "policy", "promotion", "general_info"]),
        title: z.string(),
        description: z.string().optional(),
        url: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

        const result = await db.insert(knowledgeBase).values({
        userId: ctx.user.id,
        contentType: input.contentType,
        title: input.title,
        description: input.description,
        url: input.url,
        category: input.category,
        tags: input.tags || [],
      });

      return {
        success: true,
        itemId: (result as any).insertId || 0,
      };
    }),

  /**
   * Listar itens da base de conhecimento
   */
  listKnowledgeItems: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        contentType: z.enum(["product", "faq", "policy", "promotion", "general_info"]).optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [eq(knowledgeBase.userId, ctx.user.id), eq(knowledgeBase.isActive, true)];
      
      if (input.category) {
        conditions.push(eq(knowledgeBase.category, input.category));
      }

      if (input.contentType) {
        conditions.push(eq(knowledgeBase.contentType, input.contentType));
      }

      return db
        .select()
        .from(knowledgeBase)
        .where(and(...conditions))
        .limit(input.limit);
    }),

  // ============================================
  // GERENCIAR DADOS DE TREINAMENTO
  // ============================================

  /**
   * Adicionar exemplo de treinamento
   */
  addTrainingExample: protectedProcedure
    .input(
      z.object({
        userMessage: z.string(),
        expectedResponse: z.string(),
        category: z.string().optional(),
        shouldEscalate: z.boolean().default(false),
        escalationReason: z.string().optional(),
        quality: z.enum(["excellent", "good", "poor"]).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      await db.insert(aiTrainingData).values({
        userId: ctx.user.id,
        userMessage: input.userMessage,
        expectedResponse: input.expectedResponse,
        category: input.category,
        shouldEscalate: input.shouldEscalate,
        escalationReason: input.escalationReason,
        quality: input.quality,
      });

      return {
        success: true,
        trainingId: Date.now(),
      };
    }),

  /**
   * Listar exemplos de treinamento
   */
  listTrainingExamples: protectedProcedure
    .input(
      z.object({
        category: z.string().optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [eq(aiTrainingData.userId, ctx.user.id), eq(aiTrainingData.isActive, true)];
      
      if (input.category) {
        conditions.push(eq(aiTrainingData.category, input.category));
      }

      return db
        .select()
        .from(aiTrainingData)
        .where(and(...conditions))
        .limit(input.limit);
    }),

  // ============================================
  // GERENCIAR FILA DE ESCALAÇÃO
  // ============================================

  /**
   * Listar conversas escaladas
   */
  listEscalations: protectedProcedure
    .input(
      z.object({
        status: z.enum(["waiting", "in_progress", "resolved", "closed"]).optional(),
        limit: z.number().default(20),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conditions = [eq(escalationQueue.userId, ctx.user.id)];
      
      if (input.status) {
        conditions.push(eq(escalationQueue.status, input.status));
      }

      return db
        .select()
        .from(escalationQueue)
        .where(and(...conditions))
        .orderBy(desc(escalationQueue.createdAt))
        .limit(input.limit);
    }),

  /**
   * Atualizar status de escalação
   */
  updateEscalationStatus: protectedProcedure
    .input(
      z.object({
        escalationId: z.number(),
        status: z.enum(["waiting", "in_progress", "resolved", "closed"]),
        assignedToAgent: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      const updates: Record<string, any> = {
        status: input.status,
        updatedAt: new Date(),
      };

      if (input.status === "in_progress" && !input.assignedToAgent) {
        updates.startedAt = new Date();
      }

      if (input.status === "resolved" || input.status === "closed") {
        updates.resolvedAt = new Date();
      }

      if (input.assignedToAgent) {
        updates.assignedToAgent = input.assignedToAgent;
      }

      await db
        .update(escalationQueue)
        .set(updates)
        .where(
          and(
            eq(escalationQueue.id, input.escalationId),
            eq(escalationQueue.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  // ============================================
  // HISTÓRICO E ANÁLISE
  // ============================================

  /**
   * Obter histórico de conversas
   */
  getConversationHistory: protectedProcedure
    .input(
      z.object({
        whatsappPhoneNumber: z.string(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      return db
        .select()
        .from(conversationHistory)
        .where(
          and(
            eq(conversationHistory.userId, ctx.user.id),
            eq(conversationHistory.whatsappPhoneNumber, input.whatsappPhoneNumber)
          )
        )
        .orderBy(desc(conversationHistory.createdAt))
        .limit(input.limit);
    }),

  /**
   * Obter estatísticas de IA
   */
  getAIStats: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const totalConversations = await db
      .select()
      .from(conversationHistory)
      .where(eq(conversationHistory.userId, ctx.user.id));

    const escalatedConversations = totalConversations.filter(
      (c: any) => c.escalated
    );

    const trainingExamples = await db
      .select()
      .from(aiTrainingData)
      .where(eq(aiTrainingData.userId, ctx.user.id));

    const knowledgeItems = await db
      .select()
      .from(knowledgeBase)
      .where(eq(knowledgeBase.userId, ctx.user.id));

    const pendingEscalations = await db
      .select()
      .from(escalationQueue)
      .where(
        and(
          eq(escalationQueue.userId, ctx.user.id),
          eq(escalationQueue.status, "waiting")
        )
      );

    return {
      totalConversations: totalConversations.length,
      escalatedConversations: escalatedConversations.length,
      escalationRate: totalConversations.length > 0
        ? (escalatedConversations.length / totalConversations.length) * 100
        : 0,
      trainingExamples: trainingExamples.length,
      knowledgeItems: knowledgeItems.length,
      pendingEscalations: pendingEscalations.length,
    };
  }),

  // ============================================
  // CONFIGURAÇÕES DE IA
  // ============================================

  /**
   * Obter configurações de IA
   */
  getAISettings: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const settings = await db
      .select()
      .from(aiSettings)
      .where(eq(aiSettings.userId, ctx.user.id))
      .limit(1);

    return settings[0] || null;
  }),

  /**
   * Atualizar configurações de IA
   */
  updateAISettings: protectedProcedure
    .input(
      z.object({
        systemPrompt: z.string().optional(),
        temperature: z.number().min(0).max(2).optional(),
        maxTokens: z.number().optional(),
        escalationKeywords: z.array(z.string()).optional(),
        autoEscalateAfterMessages: z.number().optional(),
        searchResultsLimit: z.number().optional(),
        minConfidenceScore: z.number().optional(),
        isEnabled: z.boolean().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Verificar se já existe configuração
      const existing = await db
        .select()
        .from(aiSettings)
        .where(eq(aiSettings.userId, ctx.user.id))
        .limit(1);

      if (existing.length > 0) {
        // Atualizar
        const updateData: Record<string, any> = {};
        if (input.systemPrompt) updateData.systemPrompt = input.systemPrompt;
        if (input.temperature !== undefined) updateData.temperature = input.temperature.toString();
        if (input.maxTokens) updateData.maxTokens = input.maxTokens;
        if (input.escalationKeywords) updateData.escalationKeywords = input.escalationKeywords;
        if (input.autoEscalateAfterMessages) updateData.autoEscalateAfterMessages = input.autoEscalateAfterMessages;
        if (input.searchResultsLimit) updateData.searchResultsLimit = input.searchResultsLimit;
        if (input.minConfidenceScore !== undefined) updateData.minConfidenceScore = input.minConfidenceScore.toString();
        if (input.isEnabled !== undefined) updateData.isEnabled = input.isEnabled;
        
        await db
          .update(aiSettings)
          .set(updateData)
          .where(eq(aiSettings.userId, ctx.user.id));
      } else {
        // Criar
        const settingsData: any = {
          userId: ctx.user.id,
        };
        if (input.systemPrompt) settingsData.systemPrompt = input.systemPrompt;
        if (input.temperature) settingsData.temperature = input.temperature;
        if (input.maxTokens) settingsData.maxTokens = input.maxTokens;
        if (input.escalationKeywords) settingsData.escalationKeywords = input.escalationKeywords;
        if (input.autoEscalateAfterMessages) settingsData.autoEscalateAfterMessages = input.autoEscalateAfterMessages;
        if (input.searchResultsLimit) settingsData.searchResultsLimit = input.searchResultsLimit;
        if (input.minConfidenceScore) settingsData.minConfidenceScore = input.minConfidenceScore;
        if (input.isEnabled !== undefined) settingsData.isEnabled = input.isEnabled;
        
        await db.insert(aiSettings).values(settingsData);
      }

      return { success: true };
    }),
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

async function searchKnowledgeBase(
  db: any,
  userId: number,
  query: string,
  limit: number
) {
  // Busca simples por palavras-chave (em produção, usar busca semântica)
  const keywords = query.toLowerCase().split(" ");

  let results = await db
    .select()
    .from(knowledgeBase)
    .where(
      and(
        eq(knowledgeBase.userId, userId),
        eq(knowledgeBase.isActive, true)
      )
    );

  // Filtrar por relevância
  results = results.filter((item: any) => {
    const text = `${item.title} ${item.description || ""}`.toLowerCase();
    return keywords.some((keyword) => text.includes(keyword));
  });

  return results.slice(0, limit);
}

function buildSystemPrompt(
  customPrompt: string | null | undefined,
  trainingExamples: any[],
  relevantProducts: any[]
): string {
  let prompt = customPrompt || `Você é um assistente de atendimento ao cliente amigável e profissional para a Feminnita Pijamas.
Sua responsabilidade é ajudar os clientes com dúvidas sobre produtos, pedidos e políticas.
Sempre seja educado, conciso e útil.
Se não souber a resposta, ofereça conectar com um atendente humano.`;

  if (trainingExamples.length > 0) {
    prompt += "\n\nExemplos de conversas anteriores:\n";
    trainingExamples.slice(0, 3).forEach((example) => {
      prompt += `\nCliente: ${example.userMessage}\nVocê: ${example.expectedResponse}`;
    });
  }

  if (relevantProducts.length > 0) {
    prompt += "\n\nProdutos relevantes para esta conversa:\n";
    relevantProducts.forEach((product) => {
      prompt += `\n- ${product.title}: ${product.description || ""}`;
      if (product.url) {
        prompt += ` (${product.url})`;
      }
    });
  }

  return prompt;
}

function checkEscalationKeywords(
  message: string,
  keywords: string[]
): boolean {
  const defaultKeywords = [
    "atendente",
    "humano",
    "falar com",
    "suporte",
    "gerente",
    "reclamação",
    "problema",
    "urgente",
  ];

  const allKeywords = [...defaultKeywords, ...keywords];
  const lowerMessage = message.toLowerCase();

  return allKeywords.some((keyword) => lowerMessage.includes(keyword));
}

async function createEscalation(
  db: any,
  userId: number,
  whatsappPhoneNumber: string,
  whatsappContactName: string | undefined,
  reason: string
) {
  // Buscar última conversa
  const lastConversation = await db
    .select()
    .from(conversationHistory)
    .where(
      and(
        eq(conversationHistory.userId, userId),
        eq(conversationHistory.whatsappPhoneNumber, whatsappPhoneNumber)
      )
    )
    .orderBy(desc(conversationHistory.createdAt))
    .limit(1);

  if (lastConversation.length > 0) {
    await db.insert(escalationQueue).values({
      userId,
      conversationHistoryId: lastConversation[0].id,
      whatsappPhoneNumber,
      whatsappContactName,
      reason,
      priority: "medium",
      status: "waiting",
    });

    // Notificar proprietário
    await notifyOwner({
      title: "Nova Escalação de Atendimento",
      content: `Cliente ${whatsappContactName || whatsappPhoneNumber} foi escalado para atendimento humano. Motivo: ${reason}`,
    });
  }
}
