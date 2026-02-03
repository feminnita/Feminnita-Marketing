import { router, publicProcedure, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";

// Types para Evolution API
interface EvolutionMessage {
  id: string;
  from: string;
  to: string;
  text: string;
  timestamp: number;
  type: "text" | "image" | "document" | "audio";
  isFromMe: boolean;
}

interface EvolutionInstance {
  instanceName: string;
  apiKey: string;
  baseUrl: string;
}

// Armazenar instâncias em memória (em produção, usar banco de dados)
const instances = new Map<string, EvolutionInstance>();

export const evolutionApiRouter = router({
  // Conectar instância com API Key
  connectInstance: protectedProcedure
    .input(
      z.object({
        instanceName: z.string().min(1, "Nome da instância é obrigatório"),
        apiKey: z.string().min(1, "API Key é obrigatória"),
        baseUrl: z.string().url("URL base inválida"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Validar conexão com Evolution API
        const response = await fetch(`${input.baseUrl}/instance/info`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${input.apiKey}`,
          },
        });

        if (!response.ok) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "API Key inválida ou Evolution API indisponível",
          });
        }

        // Armazenar instância
        instances.set(String(ctx.user.id), {
          instanceName: input.instanceName,
          apiKey: input.apiKey,
          baseUrl: input.baseUrl,
        });

        return {
          success: true,
          message: "Instância conectada com sucesso",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao conectar instância: ${error instanceof Error ? error.message : "Desconhecido"}`,
        });
      }
    }),

  // Obter QR Code para conectar WhatsApp
  getQrCode: protectedProcedure.query(async ({ ctx }) => {
    const instance = instances.get(String(ctx.user.id));

    if (!instance) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Instância não configurada",
      });
    }

    try {
      const response = await fetch(
        `${instance.baseUrl}/instance/qrcode/${instance.instanceName}`,
        {
          headers: {
            Authorization: `Bearer ${instance.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao obter QR Code");
      }

      const data = await response.json();

      return {
        qrCode: data.qrcode,
        status: data.status,
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Erro ao obter QR Code: ${error instanceof Error ? error.message : "Desconhecido"}`,
      });
    }
  }),

  // Enviar mensagem individual
  sendMessage: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string().regex(/^\d{10,15}$/, "Número de telefone inválido"),
        message: z.string().min(1, "Mensagem não pode estar vazia"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const instance = instances.get(String(ctx.user.id));

      if (!instance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Instância não configurada",
        });
      }

      try {
        const response = await fetch(`${instance.baseUrl}/message/sendText`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${instance.apiKey}`,
          },
          body: JSON.stringify({
            number: input.phoneNumber,
            text: input.message,
          }),
        });

        if (!response.ok) {
          throw new Error("Erro ao enviar mensagem");
        }

        const data = await response.json();

        return {
          success: true,
          messageId: data.key?.id,
          timestamp: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao enviar mensagem: ${error instanceof Error ? error.message : "Desconhecido"}`,
        });
      }
    }),

  // Enviar mensagem para grupo VIP
  sendGroupMessage: protectedProcedure
    .input(
      z.object({
        groupId: z.string().min(1, "ID do grupo é obrigatório"),
        message: z.string().min(1, "Mensagem não pode estar vazia"),
        type: z.enum(["promotion", "launch", "coupon", "general"]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const instance = instances.get(String(ctx.user.id));

      if (!instance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Instância não configurada",
        });
      }

      try {
        // Formatar mensagem com emoji baseado no tipo
        let formattedMessage = input.message;
        switch (input.type) {
          case "promotion":
            formattedMessage = `🎉 PROMOÇÃO\n\n${input.message}`;
            break;
          case "launch":
            formattedMessage = `🚀 LANÇAMENTO\n\n${input.message}`;
            break;
          case "coupon":
            formattedMessage = `🎁 CUPOM EXCLUSIVO\n\n${input.message}`;
            break;
        }

        const response = await fetch(`${instance.baseUrl}/message/sendText`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${instance.apiKey}`,
          },
          body: JSON.stringify({
            number: input.groupId,
            text: formattedMessage,
          }),
        });

        if (!response.ok) {
          throw new Error("Erro ao enviar mensagem para grupo");
        }

        const data = await response.json();

        // Notificar owner
        await notifyOwner({
          title: "Mensagem Enviada para Grupo VIP",
          content: `Tipo: ${input.type}\nMensagem: ${input.message.substring(0, 100)}...`,
        });

        return {
          success: true,
          messageId: data.key?.id,
          timestamp: new Date(),
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao enviar mensagem para grupo: ${error instanceof Error ? error.message : "Desconhecido"}`,
        });
      }
    }),

  // IA de atendimento automática
  generateAiResponse: protectedProcedure
    .input(
      z.object({
        customerMessage: z.string().min(1, "Mensagem do cliente é obrigatória"),
        customerPhone: z.string(),
      })
    )
    .mutation(async ({ input }: any) => {
      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: `Você é um assistente de atendimento ao cliente da Feminnita, uma loja de pijamas em atacado.
              
Seu objetivo é:
- Responder perguntas sobre produtos, pedidos e envios
- Ser amigável e profissional
- Se o cliente pedir para falar com um humano, responda: "Claro! Vou transferir você para um atendente. Um momento..."
- Se não souber a resposta, ofereça transferir para um humano

Contexto sobre Feminnita:
- Loja de pijamas em atacado
- Entrega rápida via Melhor Envio
- Atendimento via WhatsApp
- Grupo VIP com promoções exclusivas`,
            },
            {
              role: "user",
              content: input.customerMessage,
            },
          ],
        });

        const aiMessage =
          response.choices[0]?.message?.content || "Desculpe, não consegui processar sua mensagem.";

        // Detectar se deve transferir para humano
        const shouldTransfer =
          String(aiMessage).includes("transferir") ||
          String(aiMessage).includes("atendente") ||
          input.customerMessage.toLowerCase().includes("falar com humano");

        return {
          message: aiMessage,
          shouldTransfer,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao gerar resposta IA: ${error instanceof Error ? error.message : "Desconhecido"}`,
        });
      }
    }),

  // Transferir para atendimento humano
  transferToHuman: protectedProcedure
    .input(
      z.object({
        customerPhone: z.string(),
        customerMessage: z.string(),
        groupId: z.string().default("22992910707"),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const instance = instances.get(String(ctx.user.id));

      if (!instance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Instância não configurada",
        });
      }

      try {
        // Enviar notificação para grupo de atendentes
        const transferMessage = `📞 TRANSFERÊNCIA DE CLIENTE\n\nTelefone: ${input.customerPhone}\nMensagem: ${input.customerMessage}`;

        const response = await fetch(`${instance.baseUrl}/message/sendText`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${instance.apiKey}`,
          },
          body: JSON.stringify({
            number: input.groupId,
            text: transferMessage,
          }),
        });

        if (!response.ok) {
          throw new Error("Erro ao transferir para humano");
        }

        // Enviar mensagem ao cliente
        await fetch(`${instance.baseUrl}/message/sendText`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${instance.apiKey}`,
          },
          body: JSON.stringify({
            number: input.customerPhone,
            text: "Claro! Vou transferir você para um atendente. Um momento...",
          }),
        });

        return {
          success: true,
          message: "Cliente transferido para atendimento humano",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao transferir para humano: ${error instanceof Error ? error.message : "Desconhecido"}`,
        });
      }
    }),

  // Enviar confirmação de pagamento
  sendPaymentConfirmation: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
        orderId: z.string(),
        amount: z.number(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const instance = instances.get(String(ctx.user.id));

      if (!instance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Instância não configurada",
        });
      }

      try {
        const message = `✅ PAGAMENTO CONFIRMADO\n\nPedido: #${input.orderId}\nValor: R$ ${input.amount.toFixed(2)}\n\nSeu pedido será enviado em breve. Acompanhe o rastreio aqui!`;

        const response = await fetch(`${instance.baseUrl}/message/sendText`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${instance.apiKey}`,
          },
          body: JSON.stringify({
            number: input.phoneNumber,
            text: message,
          }),
        });

        if (!response.ok) {
          throw new Error("Erro ao enviar confirmação de pagamento");
        }

        return {
          success: true,
          message: "Confirmação de pagamento enviada",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao enviar confirmação: ${error instanceof Error ? error.message : "Desconhecido"}`,
        });
      }
    }),

  // Enviar código de rastreio
  sendTrackingCode: protectedProcedure
    .input(
      z.object({
        phoneNumber: z.string(),
        orderId: z.string(),
        trackingCode: z.string(),
        trackingUrl: z.string().url(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      const instance = instances.get(String(ctx.user.id));

      if (!instance) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Instância não configurada",
        });
      }

      try {
        const message = `📦 PEDIDO ENVIADO\n\nPedido: #${input.orderId}\nCódigo de rastreio: ${input.trackingCode}\n\nAcompanhe seu pedido: ${input.trackingUrl}`;

        const response = await fetch(`${instance.baseUrl}/message/sendText`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${instance.apiKey}`,
          },
          body: JSON.stringify({
            number: input.phoneNumber,
            text: message,
          }),
        });

        if (!response.ok) {
          throw new Error("Erro ao enviar código de rastreio");
        }

        return {
          success: true,
          message: "Código de rastreio enviado",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao enviar rastreio: ${error instanceof Error ? error.message : "Desconhecido"}`,
        });
      }
    }),

  // Obter status da instância
  getInstanceStatus: protectedProcedure.query(async ({ ctx }: any) => {
    const instance = instances.get(String(ctx.user.id));

    if (!instance) {
      return {
        connected: false,
        message: "Instância não configurada",
      };
    }

    try {
      const response = await fetch(
        `${instance.baseUrl}/instance/info/${instance.instanceName}`,
        {
          headers: {
            Authorization: `Bearer ${instance.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        return {
          connected: false,
          message: "Erro ao conectar com Evolution API",
        };
      }

      const data = await response.json();

      return {
        connected: true,
        instanceName: instance.instanceName,
        status: data.status,
        phoneNumber: data.phoneNumber,
      };
    } catch (error) {
      return {
        connected: false,
        message: `Erro: ${error instanceof Error ? error.message : "Desconhecido"}`,
      };
    }
  }),
});
