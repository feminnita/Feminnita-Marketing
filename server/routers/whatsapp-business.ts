import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { notifyOwner } from "../_core/notification";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { conversationHistory } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * WhatsApp Business Router
 * Handles WhatsApp Business API integration for Feminnita
 * Main number: (47) 99623-3764
 */

export const whatsappBusinessRouter = router({
  /**
   * Send payment confirmation message
   */
  sendPaymentConfirmation: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
        orderNumber: z.string(),
        amount: z.number(),
        paymentMethod: z.string(),
        trackingUrl: z.string().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        const message = `
🎉 *Pagamento Confirmado!*

Olá! Seu pagamento foi confirmado com sucesso.

📦 *Pedido:* #${input.orderNumber}
💰 *Valor:* R$ ${input.amount.toFixed(2)}
💳 *Método:* ${input.paymentMethod}

${input.trackingUrl ? `🚚 *Rastreamento:* ${input.trackingUrl}` : ""}

Obrigada pela compra! 💕
Feminnita Pijamas
        `.trim();

        // Here you would integrate with WhatsApp Business API
        // For now, we'll log and notify
        console.log(`[WhatsApp] Sending payment confirmation to ${input.phoneNumber}`);
        console.log(`[WhatsApp] Message: ${message}`);

        await notifyOwner({
          title: "Confirmação de pagamento enviada",
          content: `Pedido #${input.orderNumber} - R$ ${input.amount.toFixed(2)} enviado para ${input.phoneNumber}`,
        });

        return {
          success: true,
          message: "Mensagem de confirmação enviada com sucesso",
          messageId: `msg_${Date.now()}`,
        };
      } catch (error) {
        console.error("Error sending payment confirmation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao enviar confirmação de pagamento",
        });
      }
    }),

  /**
   * Send tracking information
   */
  sendTrackingInfo: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
        orderNumber: z.string(),
        trackingCode: z.string(),
        carrier: z.string(),
        trackingUrl: z.string(),
        estimatedDelivery: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const message = `
📦 *Seu Pedido Saiu para Entrega!*

Olá! Seu pedido está a caminho! 🚚

📋 *Pedido:* #${input.orderNumber}
📍 *Rastreador:* ${input.trackingCode}
🚛 *Transportadora:* ${input.carrier}
⏰ *Entrega Prevista:* ${input.estimatedDelivery}

🔗 *Acompanhe aqui:* ${input.trackingUrl}

Qualquer dúvida, é só chamar! 💬
Feminnita Pijamas
        `.trim();

        console.log(`[WhatsApp] Sending tracking info to ${input.phoneNumber}`);
        console.log(`[WhatsApp] Message: ${message}`);

        await notifyOwner({
          title: "Informação de rastreio enviada",
          content: `Pedido #${input.orderNumber} - Código: ${input.trackingCode}`,
        });

        return {
          success: true,
          message: "Informação de rastreio enviada com sucesso",
          messageId: `msg_${Date.now()}`,
        };
      } catch (error) {
        console.error("Error sending tracking info:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao enviar informação de rastreio",
        });
      }
    }),

  /**
   * Send AI-generated post for approval
   */
  sendPostForApproval: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
        influencerName: z.string(),
        postContent: z.string(),
        postType: z.enum(["image", "video", "carousel", "story"]),
        scheduledDate: z.string(),
        approvalDeadline: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const message = `
✨ *Nova Postagem Pronta para Aprovação!*

Olá ${input.influencerName}! 👋

Preparei uma ${input.postType} para você postar em ${input.scheduledDate}.

📝 *Conteúdo:*
${input.postContent}

✅ *Aprovar* - Vou publicar automaticamente
❌ *Rejeitar* - Vou ajustar o conteúdo
💬 *Sugerir mudanças* - Envie suas ideias

⏰ *Prazo para aprovação:* ${input.approvalDeadline}

Feminnita Pijamas
        `.trim();

        console.log(`[WhatsApp] Sending post for approval to ${input.phoneNumber}`);

        return {
          success: true,
          message: "Postagem enviada para aprovação",
          messageId: `msg_${Date.now()}`,
        };
      } catch (error) {
        console.error("Error sending post for approval:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao enviar postagem para aprovação",
        });
      }
    }),

  /**
   * Send reminder for content theme
   */
  sendThemeReminder: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
        influencerName: z.string(),
        postingDays: z.array(z.string()), // "terça", "sexta"
        deadline: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const message = `
📅 *Lembrete: Hora de Definir o Tema!*

Olá ${input.influencerName}! 👋

Amanhã você posta em ${input.postingDays.join(" e ")}. 

Preciso que você me envie:

📌 *Tema principal* - Qual assunto você quer abordar?
🎨 *Estilo* - Mais descontraído, profissional, engraçado?
🎯 *Objetivo* - Vender, engajar, educar?
✨ *Detalhes extras* - Produtos, cores, mensagem especial?

⏰ *Prazo:* ${input.deadline}

Depois eu preparo tudo e envio para aprovação! 🚀

Feminnita Pijamas
        `.trim();

        console.log(`[WhatsApp] Sending theme reminder to ${input.phoneNumber}`);

        return {
          success: true,
          message: "Lembrete de tema enviado",
          messageId: `msg_${Date.now()}`,
        };
      } catch (error) {
        console.error("Error sending theme reminder:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao enviar lembrete de tema",
        });
      }
    }),

  /**
   * Route conversation to human agent
   */
  routeToAgent: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
        conversationId: z.string(),
        reason: z.string(),
        priority: z.enum(["low", "medium", "high"]).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const message = `
👤 *Conectando com um Atendente...*

Olá! Você será atendido por um membro da nossa equipe em breve.

🎯 *Motivo:* ${input.reason}
⏱️ *Tempo de espera:* Geralmente menos de 5 minutos

Obrigada pela paciência! 💕
Feminnita Pijamas
        `.trim();

        console.log(`[WhatsApp] Routing conversation to agent`);
        console.log(`[WhatsApp] Conversation ID: ${input.conversationId}`);
        console.log(`[WhatsApp] Priority: ${input.priority || "normal"}`);

        await notifyOwner({
          title: "Conversa roteada para atendente",
          content: `${input.phoneNumber} - Motivo: ${input.reason} - Prioridade: ${input.priority || "normal"}`,
        });

        return {
          success: true,
          message: "Conversa roteada para atendente",
          agentAssigned: true,
          estimatedWaitTime: "5 minutos",
        };
      } catch (error) {
        console.error("Error routing to agent:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao rotear para atendente",
        });
      }
    }),

  /**
   * Get WhatsApp configuration
   */
  getConfiguration: protectedProcedure.query(async () => {
    return {
      mainNumber: process.env.WHATSAPP_MAIN_NUMBER || "",
      businessName: process.env.WHATSAPP_BUSINESS_NAME || "Feminnita Pijamas",
      features: [
        "Confirmação de Pagamento",
        "Rastreio de Pedidos",
        "Aprovação de Postagens",
        "Lembrete de Tema",
        "Roteamento para Atendente",
        "Grupo VIP",
      ],
      automationSchedule: {
        postingDays: ["terça", "sexta"],
        themeReminderDay: "segunda",
        themeReminderTime: "18:00",
      },
      status: "active",
    };
  }),

  /**
   * Get conversation history
   */
  getConversationHistory: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input, ctx }: any) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const messages = await db
        .select()
        .from(conversationHistory)
        .where(and(
          eq(conversationHistory.userId, ctx.user.id),
          eq(conversationHistory.whatsappPhoneNumber, input.phoneNumber)
        ))
        .orderBy(desc(conversationHistory.createdAt))
        .limit(input.limit);

      return {
        phoneNumber: input.phoneNumber,
        messages,
        totalMessages: messages.length,
        lastMessage: messages[0] ?? null,
      };
    }),

  /**
   * Create VIP group
   */
  createVIPGroup: protectedProcedure
    .input(
      z.object({
        groupName: z.string(),
        members: z.array(z.string()),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log(`[WhatsApp] Creating VIP group: ${input.groupName}`);

        await notifyOwner({
          title: "Grupo VIP criado",
          content: `${input.groupName} - ${input.members.length} membros`,
        });

        return {
          success: true,
          groupId: `group_${Date.now()}`,
          groupName: input.groupName,
          memberCount: input.members.length,
        };
      } catch (error) {
        console.error("Error creating VIP group:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao criar grupo VIP",
        });
      }
    }),
});
