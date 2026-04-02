import { protectedProcedure, router } from "../_core/trpc";
import { z } from "zod";
import {
  enviarMensagemWhatsApp,
  enviarTemplateWhatsApp,
  enviarMidiaWhatsApp,
  marcarMensagemComoLida,
  obterContatoWhatsApp,
  obterHistoricoMensagens,
  criarTemplateWhatsApp,
  formatarErroWhatsApp,
  WhatsAppAPIError,
} from "../integrations/whatsapp-api";

export const whatsappRouter = router({
  /**
   * Envia uma mensagem de texto
   */
  enviarMensagem: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        phoneNumberId: z.string(),
        destinatario: z.string(),
        mensagem: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const resultado = await enviarMensagemWhatsApp(
          input.accessToken,
          input.phoneNumberId,
          input.destinatario,
          input.mensagem
        );
        return {
          sucesso: true,
          messageId: resultado.messages?.[0]?.id,
          mensagem: "Mensagem enviada com sucesso",
        };
      } catch (erro) {
        if (erro instanceof WhatsAppAPIError) {
          throw new Error(formatarErroWhatsApp(erro));
        }
        throw erro;
      }
    }),

  /**
   * Envia uma mensagem com template
   */
  enviarTemplate: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        phoneNumberId: z.string(),
        destinatario: z.string(),
        templateName: z.string(),
        parametros: z.record(z.string(), z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const resultado = await enviarTemplateWhatsApp(
          input.accessToken,
          input.phoneNumberId,
          input.destinatario,
          input.templateName,
          input.parametros
        );
        return {
          sucesso: true,
          messageId: resultado.messages?.[0]?.id,
          mensagem: "Template enviado com sucesso",
        };
      } catch (erro) {
        if (erro instanceof WhatsAppAPIError) {
          throw new Error(formatarErroWhatsApp(erro));
        }
        throw erro;
      }
    }),

  /**
   * Envia uma mídia (imagem, vídeo, documento)
   */
  enviarMidia: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        phoneNumberId: z.string(),
        destinatario: z.string(),
        tipo: z.enum(["image", "video", "document", "audio"]),
        urlMidia: z.string().url(),
        legenda: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const resultado = await enviarMidiaWhatsApp(
          input.accessToken,
          input.phoneNumberId,
          input.destinatario,
          input.tipo,
          input.urlMidia,
          input.legenda
        );
        return {
          sucesso: true,
          messageId: resultado.messages?.[0]?.id,
          mensagem: "Mídia enviada com sucesso",
        };
      } catch (erro) {
        if (erro instanceof WhatsAppAPIError) {
          throw new Error(formatarErroWhatsApp(erro));
        }
        throw erro;
      }
    }),

  /**
   * Marca uma mensagem como lida
   */
  marcarComoLida: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        phoneNumberId: z.string(),
        messageId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        await marcarMensagemComoLida(
          input.accessToken,
          input.phoneNumberId,
          input.messageId
        );
        return {
          sucesso: true,
          mensagem: "Mensagem marcada como lida",
        };
      } catch (erro) {
        if (erro instanceof WhatsAppAPIError) {
          throw new Error(formatarErroWhatsApp(erro));
        }
        throw erro;
      }
    }),

  /**
   * Obtém informações sobre um contato
   */
  obterContato: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        phoneNumberId: z.string(),
        numeroTelefone: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const resultado: any = await obterContatoWhatsApp(
          input.accessToken,
          input.phoneNumberId,
          input.numeroTelefone
        );
        return {
          sucesso: true,
          contato: resultado.contacts?.[0] || null,
        };
      } catch (erro) {
        if (erro instanceof WhatsAppAPIError) {
          throw new Error(formatarErroWhatsApp(erro));
        }
        throw erro;
      }
    }),

  /**
   * Obtém histórico de mensagens
   */
  obterHistorico: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        phoneNumberId: z.string(),
        limite: z.number().default(100),
      })
    )
    .query(async ({ input }) => {
      try {
        const resultado = await obterHistoricoMensagens(
          input.accessToken,
          input.phoneNumberId,
          input.limite
        );
        return {
          sucesso: true,
          mensagens: resultado.data || [],
          total: resultado.data?.length || 0,
        };
      } catch (erro) {
        if (erro instanceof WhatsAppAPIError) {
          throw new Error(formatarErroWhatsApp(erro));
        }
        throw erro;
      }
    }),

  /**
   * Cria um template de mensagem
   */
  criarTemplate: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
        businessAccountId: z.string(),
        nome: z.string(),
        categoria: z.enum(["MARKETING", "UTILITY", "AUTHENTICATION"]),
        idioma: z.string().default("pt_BR"),
        corpo: z.string(),
        rodape: z.string().optional(),
        botoes: z
          .array(
            z.object({
              tipo: z.enum(["QUICK_REPLY", "URL", "PHONE_NUMBER"]),
              texto: z.string(),
              url: z.string().optional(),
              telefone: z.string().optional(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const resultado = await criarTemplateWhatsApp(
          input.accessToken,
          input.businessAccountId,
          {
            name: input.nome,
            category: input.categoria,
            language: input.idioma,
            body: input.corpo,
            footer: input.rodape,
            buttons: input.botoes?.map((b) => ({
              type: b.tipo,
              text: b.texto,
              url: b.url,
              phone_number: b.telefone,
            })),
          }
        );
        return {
          sucesso: true,
          templateId: resultado.id,
          mensagem: "Template criado com sucesso",
        };
      } catch (erro) {
        if (erro instanceof WhatsAppAPIError) {
          throw new Error(formatarErroWhatsApp(erro));
        }
        throw erro;
      }
    }),
});
