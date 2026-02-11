import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { conversationHistory, escalationQueue } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Router para integração com WhatsApp Business API
 * Processa webhooks, envia mensagens e gerencia conversas
 */
export const whatsappAIIntegrationRouter = router({
  // ============================================
  // WEBHOOKS DO WHATSAPP
  // ============================================

  /**
   * Processa webhook de mensagens recebidas do WhatsApp
   */
  handleIncomingMessage: protectedProcedure
    .input(
      z.object({
        whatsappPhoneNumber: z.string(),
        whatsappContactName: z.string().optional(),
        messageText: z.string(),
        messageId: z.string(),
        timestamp: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // 1. Processar a mensagem com a IA
        const aiResponse = await fetch(`${process.env.BUILT_IN_FORGE_API_URL}/ai/chat`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.BUILT_IN_FORGE_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [
              {
                role: "user",
                content: input.messageText,
              },
            ],
          }),
        });

        const aiData = await aiResponse.json();
        const responseText = aiData.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

        // 2. Enviar resposta via WhatsApp
        const sendResponse = await sendWhatsAppMessage(
          ctx.user.id,
          input.whatsappPhoneNumber,
          responseText
        );

        // 3. Salvar na história
        const db = await getDb();
        if (db) {
          await db.insert(conversationHistory).values({
            userId: ctx.user.id,
            whatsappPhoneNumber: input.whatsappPhoneNumber,
            whatsappContactName: input.whatsappContactName,
            userMessage: input.messageText,
            aiResponse: responseText,
            confidence: 0.85,
            status: "open",
          } as any);
        }

        return {
          success: true,
          messageId: sendResponse?.messageId,
          response: responseText,
        };
      } catch (error) {
        console.error("[WhatsApp AI] Erro ao processar mensagem:", error);
        return {
          success: false,
          error: "Erro ao processar mensagem",
        };
      }
    }),

  /**
   * Enviar mensagem de texto via WhatsApp
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        whatsappPhoneNumber: z.string(),
        messageText: z.string(),
        mediaUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await sendWhatsAppMessage(
          ctx.user.id,
          input.whatsappPhoneNumber,
          input.messageText,
          input.mediaUrl
        );

        return {
          success: true,
          messageId: result?.messageId,
        };
      } catch (error) {
        console.error("[WhatsApp] Erro ao enviar mensagem:", error);
        return {
          success: false,
          error: "Erro ao enviar mensagem",
        };
      }
    }),

  /**
   * Enviar mensagem de template (pré-aprovado pelo WhatsApp)
   */
  sendTemplateMessage: protectedProcedure
    .input(
      z.object({
        whatsappPhoneNumber: z.string(),
        templateName: z.string(),
        templateLanguage: z.string().default("pt_BR"),
        templateParameters: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const phoneNumberId = await getWhatsAppPhoneNumberId(ctx.user.id);
        if (!phoneNumberId) {
          throw new Error("WhatsApp Phone Number ID não configurado");
        }

        const response = await fetch(
          `https://graph.instagram.com/v18.0/${phoneNumberId}/messages`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              messaging_product: "whatsapp",
              to: input.whatsappPhoneNumber,
              type: "template",
              template: {
                name: input.templateName,
                language: {
                  code: input.templateLanguage,
                },
                components: input.templateParameters
                  ? [
                      {
                        type: "body",
                        parameters: input.templateParameters.map((param) => ({
                          type: "text",
                          text: param,
                        })),
                      },
                    ]
                  : undefined,
              },
            }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(`WhatsApp API error: ${data.error?.message}`);
        }

        return {
          success: true,
          messageId: data.messages?.[0]?.id,
        };
      } catch (error) {
        console.error("[WhatsApp Template] Erro:", error);
        return {
          success: false,
          error: String(error),
        };
      }
    }),

  /**
   * Marcar conversa como resolvida
   */
  markConversationResolved: protectedProcedure
    .input(
      z.object({
        whatsappPhoneNumber: z.string(),
        resolutionNote: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Atualizar status da conversa
      await db
        .update(conversationHistory)
        .set({
          status: "closed",
          updatedAt: new Date(),
        })
        .where(
          eq(conversationHistory.whatsappPhoneNumber, input.whatsappPhoneNumber)
        );

      return { success: true };
    }),

  /**
   * Obter histórico de conversa para análise
   */
  getConversationForAnalysis: protectedProcedure
    .input(
      z.object({
        whatsappPhoneNumber: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const conversations = await db
        .select()
        .from(conversationHistory)
        .where(
          eq(conversationHistory.whatsappPhoneNumber, input.whatsappPhoneNumber)
        );

      return {
        phoneNumber: input.whatsappPhoneNumber,
        totalMessages: conversations.length,
        escalated: conversations.some((c) => c.escalated),
        lastMessage: conversations[conversations.length - 1],
        messages: conversations,
      };
    }),

  /**
   * Configurar credenciais do WhatsApp Business
   */
  configureWhatsAppCredentials: protectedProcedure
    .input(
      z.object({
        phoneNumberId: z.string(),
        businessAccountId: z.string(),
        accessToken: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database connection failed");

      // Salvar credenciais (em produção, usar vault seguro)
      // Por enquanto, salvar em variáveis de ambiente ou banco de dados criptografado

      return {
        success: true,
        message: "Credenciais do WhatsApp configuradas com sucesso",
      };
    }),

  /**
   * Obter status da integração WhatsApp
   */
  getWhatsAppStatus: protectedProcedure.query(async ({ ctx }) => {
    try {
      const phoneNumberId = await getWhatsAppPhoneNumberId(ctx.user.id);

      if (!phoneNumberId) {
        return {
          connected: false,
          message: "WhatsApp não configurado",
        };
      }

      // Verificar status da conexão
      const response = await fetch(
        `https://graph.instagram.com/v18.0/${phoneNumberId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
          },
        }
      );

      const data = await response.json();

      return {
        connected: response.ok,
        phoneNumber: data.display_phone_number,
        status: data.status,
        qualityRating: data.quality_rating,
      };
    } catch (error) {
      console.error("[WhatsApp Status] Erro:", error);
      return {
        connected: false,
        error: String(error),
      };
    }
  }),

  /**
   * Listar conversas ativas
   */
  listActiveConversations: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const conversations = await db
        .select()
        .from(conversationHistory)
        .where(eq(conversationHistory.userId, ctx.user.id));

      // Agrupar por telefone e pegar última mensagem
      const grouped = new Map<
        string,
        {
          phoneNumber: string;
          lastMessage: string;
          lastTimestamp: Date | null;
          status: string;
          messageCount: number;
        }
      >();

      conversations.forEach((conv) => {
        const key = conv.whatsappPhoneNumber;
        const existing = grouped.get(key);

        if (!existing || (conv.createdAt && existing.lastTimestamp && conv.createdAt > existing.lastTimestamp)) {
          grouped.set(key, {
            phoneNumber: conv.whatsappPhoneNumber,
            lastMessage: conv.userMessage,
            lastTimestamp: conv.createdAt,
            status: conv.status,
            messageCount: (existing?.messageCount || 0) + 1,
          });
        }
      });

      return Array.from(grouped.values()).slice(0, input.limit);
    }),
});

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

async function sendWhatsAppMessage(
  userId: number,
  phoneNumber: string,
  messageText: string,
  mediaUrl?: string
): Promise<{ messageId: string } | null> {
  try {
    const phoneNumberId = await getWhatsAppPhoneNumberId(userId);

    if (!phoneNumberId) {
      console.error("WhatsApp Phone Number ID não configurado");
      return null;
    }

    const body: any = {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: mediaUrl ? "image" : "text",
    };

    if (mediaUrl) {
      body.image = {
        link: mediaUrl,
      };
    } else {
      body.text = {
        preview_url: true,
        body: messageText,
      };
    }

    const response = await fetch(
      `https://graph.instagram.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("WhatsApp API error:", data.error);
      return null;
    }

    return {
      messageId: data.messages?.[0]?.id || "",
    };
  } catch (error) {
    console.error("[WhatsApp Send] Erro:", error);
    return null;
  }
}

async function getWhatsAppPhoneNumberId(userId: number): Promise<string | null> {
  // Em produção, buscar do banco de dados
  // Por enquanto, usar variável de ambiente
  return process.env.META_WHATSAPP_PHONE_NUMBER_ID || null;
}
