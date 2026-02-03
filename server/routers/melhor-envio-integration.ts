import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

/**
 * Integração com Melhor Envio API
 * Documentação: https://docs.melhorenvio.com.br/docs/introducao-a-api
 * 
 * Fluxo:
 * 1. Cliente escolhe transportadora e paga frete no carrinho
 * 2. Você gera etiqueta no Melhor Envio
 * 3. Você obtém código de rastreio
 * 4. Você envia WhatsApp com link de rastreamento
 */

// Armazenar credenciais em memória (em produção, usar banco de dados)
const credentials = new Map<string, { apiKey: string; secretToken: string }>();

export const melhorEnvioIntegrationRouter = router({
  // Configurar credenciais
  setCredentials: protectedProcedure
    .input(
      z.object({
        apiKey: z.string().min(1, "API Key é obrigatória"),
        secretToken: z.string().min(1, "Secret Token é obrigatório"),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      try {
        credentials.set(String(ctx.user.id), {
          apiKey: input.apiKey,
          secretToken: input.secretToken,
        });

        return {
          success: true,
          message: "Credenciais configuradas com sucesso",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao configurar credenciais: ${error instanceof Error ? error.message : "Desconhecido"}`,
        });
      }
    }),

  // Validar credenciais
  validateCredentials: protectedProcedure.query(async ({ ctx }: any) => {
    try {
      const cred = credentials.get(String(ctx.user.id));

      if (!cred) {
        return {
          valid: false,
          message: "Credenciais não configuradas",
        };
      }

      // Simular validação com API
      // Em produção, fazer uma chamada real à API do Melhor Envio
      const isValid = cred.apiKey.length > 0 && cred.secretToken.length > 0;

      return {
        valid: isValid,
        message: isValid ? "Credenciais válidas" : "Credenciais inválidas",
      };
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Erro ao validar credenciais: ${error instanceof Error ? error.message : "Desconhecido"}`,
      });
    }
  }),

  // Obter código de rastreio
  getTrackingCode: protectedProcedure
    .input(
      z.object({
        orderId: z.string().min(1, "ID do pedido é obrigatório"),
        trackingNumber: z.string().min(1, "Número de rastreio é obrigatório"),
      })
    )
    .query(async ({ input, ctx }: any) => {
      try {
        const cred = credentials.get(String(ctx.user.id));

        if (!cred) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Credenciais não configuradas",
          });
        }

        // Simular obtenção de código de rastreio
        // Em produção, fazer chamada real à API do Melhor Envio
        const trackingCode = input.trackingNumber;
        const carrier = "Correios"; // Simular transportadora

        return {
          orderId: input.orderId,
          trackingCode,
          carrier,
          trackingUrl: `https://rastreamento.melhorenvio.com.br/${trackingCode}`,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao obter código de rastreio: ${error instanceof Error ? error.message : "Desconhecido"}`,
        });
      }
    }),

  // Gerar link de rastreamento
  getTrackingLink: protectedProcedure
    .input(
      z.object({
        trackingCode: z.string().min(1, "Código de rastreio é obrigatório"),
      })
    )
    .query(async ({ input, ctx }: any) => {
      try {
        const cred = credentials.get(String(ctx.user.id));

        if (!cred) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Credenciais não configuradas",
          });
        }

        // Gerar link de rastreamento
        const trackingUrl = `https://rastreamento.melhorenvio.com.br/${input.trackingCode}`;

        return {
          trackingCode: input.trackingCode,
          trackingUrl,
          shortUrl: `https://me.io/${input.trackingCode}`, // Simular URL curta
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao gerar link de rastreamento: ${error instanceof Error ? error.message : "Desconhecido"}`,
        });
      }
    }),

  // Formatar mensagem de rastreio para WhatsApp
  formatTrackingMessage: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        trackingCode: z.string(),
        trackingUrl: z.string().url(),
        customerName: z.string().optional(),
      })
    )
    .query(async ({ input }: any) => {
      try {
        const message = `📦 *PEDIDO ENVIADO*

Olá${input.customerName ? ` ${input.customerName}` : ""}! 👋

Seu pedido #${input.orderId} foi enviado com sucesso! 🎉

*Código de rastreio:* ${input.trackingCode}

*Acompanhe seu pedido aqui:*
${input.trackingUrl}

Qualquer dúvida, é só chamar! 😊`;

        return {
          message,
          trackingCode: input.trackingCode,
          trackingUrl: input.trackingUrl,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao formatar mensagem: ${error instanceof Error ? error.message : "Desconhecido"}`,
        });
      }
    }),

  // Listar opções de frete (simular)
  getShippingOptions: protectedProcedure
    .input(
      z.object({
        destinationCep: z.string().regex(/^\d{8}$/, "CEP inválido"),
        weight: z.number().positive("Peso deve ser maior que 0"),
        width: z.number().positive(),
        height: z.number().positive(),
        length: z.number().positive(),
      })
    )
    .query(async ({ input, ctx }: any) => {
      try {
        const cred = credentials.get(String(ctx.user.id));

        if (!cred) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Credenciais não configuradas",
          });
        }

        // Simular opções de frete
        const shippingOptions = [
          {
            id: "correios-pac",
            name: "PAC - Correios",
            carrier: "Correios",
            service: "PAC",
            price: 25.5,
            deadline: "8-12 dias",
            daysToDeliver: 10,
          },
          {
            id: "correios-sedex",
            name: "SEDEX - Correios",
            carrier: "Correios",
            service: "SEDEX",
            price: 45.0,
            deadline: "2-3 dias",
            daysToDeliver: 3,
          },
          {
            id: "jadlog-package",
            name: "Jadlog Package",
            carrier: "Jadlog",
            service: "Package",
            price: 35.0,
            deadline: "5-7 dias",
            daysToDeliver: 6,
          },
          {
            id: "loggi-ponto",
            name: "Loggi Ponto",
            carrier: "Loggi",
            service: "Loggi Ponto",
            price: 30.0,
            deadline: "3-5 dias",
            daysToDeliver: 4,
          },
        ];

        return {
          destinationCep: input.destinationCep,
          options: shippingOptions,
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao listar opções de frete: ${error instanceof Error ? error.message : "Desconhecido"}`,
        });
      }
    }),

  // Gerar etiqueta (simular)
  generateLabel: protectedProcedure
    .input(
      z.object({
        orderId: z.string(),
        recipientName: z.string(),
        recipientPhone: z.string(),
        recipientEmail: z.string().email(),
        recipientCep: z.string().regex(/^\d{8}$/),
        recipientAddress: z.string(),
        recipientNumber: z.string(),
        recipientComplement: z.string().optional(),
        recipientCity: z.string(),
        recipientState: z.string(),
        weight: z.number(),
        width: z.number(),
        height: z.number(),
        length: z.number(),
        shippingServiceId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }: any) => {
      try {
        const cred = credentials.get(String(ctx.user.id));

        if (!cred) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Credenciais não configuradas",
          });
        }

        // Simular geração de etiqueta
        const trackingCode = `BR${Math.random().toString(36).substring(2, 13).toUpperCase()}BR`;

        return {
          success: true,
          orderId: input.orderId,
          trackingCode,
          trackingUrl: `https://rastreamento.melhorenvio.com.br/${trackingCode}`,
          labelUrl: `https://melhorenvio.com.br/label/${trackingCode}.pdf`,
          message: "Etiqueta gerada com sucesso",
        };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Erro ao gerar etiqueta: ${error instanceof Error ? error.message : "Desconhecido"}`,
        });
      }
    }),
});
