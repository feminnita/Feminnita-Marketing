import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import {
  initializeWhatsApp,
  getQRCode,
  getConnectionStatus,
  sendTextMessage,
  sendMediaMessage,
  getContacts,
  disconnectWhatsApp,
  getActiveSessions,
} from "../_core/baileys-service";

export const whatsappBaileysRouter = router({
  /**
   * Inicializar conexão WhatsApp
   */
  initialize: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const result = await initializeWhatsApp(ctx.user.id);
      return {
        success: true,
        message: result,
      };
    } catch (error) {
      return {
        success: false,
        message: `Erro ao inicializar: ${(error as Error).message}`,
      };
    }
  }),

  /**
   * Obter QR Code
   */
  getQRCode: protectedProcedure.query(({ ctx }) => {
    const qrCode = getQRCode(ctx.user.id);
    return {
      qrCode,
      hasQRCode: !!qrCode,
    };
  }),

  /**
   * Obter status de conexão
   */
  getStatus: protectedProcedure.query(({ ctx }) => {
    return getConnectionStatus(ctx.user.id);
  }),

  /**
   * Enviar mensagem de texto
   */
  sendMessage: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string().min(10),
        message: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const success = await sendTextMessage(
        ctx.user.id,
        input.phoneNumber,
        input.message
      );

      return {
        success,
        message: success
          ? "Mensagem enviada com sucesso"
          : "Erro ao enviar mensagem",
      };
    }),

  /**
   * Enviar mídia
   */
  sendMedia: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string().min(10),
        mediaPath: z.string(),
        caption: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const success = await sendMediaMessage(
        ctx.user.id,
        input.phoneNumber,
        input.mediaPath,
        input.caption
      );

      return {
        success,
        message: success
          ? "Mídia enviada com sucesso"
          : "Erro ao enviar mídia",
      };
    }),

  /**
   * Obter contatos
   */
  getContacts: protectedProcedure.query(async ({ ctx }) => {
    const contacts = await getContacts(ctx.user.id);
    return {
      contacts,
      count: contacts.length,
    };
  }),

  /**
   * Desconectar WhatsApp
   */
  disconnect: protectedProcedure.mutation(async ({ ctx }) => {
    await disconnectWhatsApp(ctx.user.id);
    return {
      success: true,
      message: "Desconectado com sucesso",
    };
  }),

  /**
   * Obter sessões ativas
   */
  getActiveSessions: protectedProcedure.query(() => {
    const sessions = getActiveSessions();
    return {
      sessions: sessions.map((s) => ({
        userId: s.userId,
        phoneNumber: s.phoneNumber,
        isConnected: s.isConnected,
      })),
      count: sessions.length,
    };
  }),
});
