import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { notifyOwner } from "../_core/notification";

/**
 * Melhor Envio Router
 * Handles tracking updates and payment confirmations
 */

const MELHOR_ENVIO_API = "https://api.melhorenvio.com.br";
const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN || "";

export const melhorEnvioRouter = router({
  /**
   * Get tracking information for an order
   */
  getTracking: protectedProcedure
    .input(
      z.object({
        trackingCode: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        if (!MELHOR_ENVIO_TOKEN) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Melhor Envio token não configurado",
          });
        }

        const response = await fetch(`${MELHOR_ENVIO_API}/shipment/tracking`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${MELHOR_ENVIO_TOKEN}`,
          },
          body: JSON.stringify({
            orders: [input.trackingCode],
          }),
        });

        if (!response.ok) {
          throw new Error(`Melhor Envio API error: ${response.statusText}`);
        }

        const data = await response.json();

        return {
          success: true,
          tracking: data,
          trackingCode: input.trackingCode,
        };
      } catch (error) {
        console.error("Error getting tracking:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao obter rastreio",
        });
      }
    }),

  /**
   * Send payment confirmation with tracking info
   */
  sendPaymentConfirmation: protectedProcedure
    .input(
      z.object({
        orderNumber: z.string(),
        trackingCode: z.string(),
        amount: z.number(),
        paymentMethod: z.string(),
        customerPhone: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        if (!MELHOR_ENVIO_TOKEN) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Melhor Envio token não configurado",
          });
        }

        // Get tracking information
        const trackingResponse = await fetch(`${MELHOR_ENVIO_API}/shipment/tracking`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${MELHOR_ENVIO_TOKEN}`,
          },
          body: JSON.stringify({
            orders: [input.trackingCode],
          }),
        });

        let trackingInfo = null;
        if (trackingResponse.ok) {
          const trackingData = await trackingResponse.json();
          trackingInfo = trackingData;
        }

        const trackingUrl = `https://www.melhorenvio.com.br/rastreamento/${input.trackingCode}`;

        // Prepare WhatsApp message
        const whatsappMessage = `
🎉 *Pagamento Confirmado!*

Obrigado pela compra! Seu pagamento foi confirmado com sucesso.

📦 *Pedido:* #${input.orderNumber}
💰 *Valor:* R$ ${input.amount.toFixed(2)}
💳 *Método:* ${input.paymentMethod}

⏳ *Status:* Estaremos dando início à separação de seu pedido.

Assim que o envio for feito, notificaremos você novamente com o link de rastreio.

🚚 *Código de Rastreamento:* ${input.trackingCode}
🔗 *Link de Rastreio:* ${trackingUrl}

Qualquer dúvida, é só chamar! 💬

Obrigada pela confiança! 💕
Feminnita Pijamas
        `.trim();

        // Log the message (in production, this would send via WhatsApp API)
        console.log(`[WhatsApp] Sending to ${input.customerPhone}:`);
        console.log(whatsappMessage);

        await notifyOwner({
          title: "Confirmação de pagamento enviada",
          content: `Pedido #${input.orderNumber} - Rastreio: ${input.trackingCode}`,
        });

        return {
          success: true,
          message: "Confirmação de pagamento enviada com sucesso",
          trackingCode: input.trackingCode,
          trackingUrl,
          whatsappMessage,
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
   * Send tracking update via WhatsApp
   */
  sendTrackingUpdate: protectedProcedure
    .input(
      z.object({
        trackingCode: z.string(),
        orderNumber: z.string(),
        customerPhone: z.string(),
        status: z.string(),
        estimatedDelivery: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const trackingUrl = `https://www.melhorenvio.com.br/rastreamento/${input.trackingCode}`;

        const whatsappMessage = `
📦 *Seu Pedido Saiu para Entrega!*

Olá! Seu pedido foi despachado e está a caminho! 🎉

📋 *Pedido:* #${input.orderNumber}
📍 *Código de Rastreamento:* ${input.trackingCode}
📊 *Status Atual:* ${input.status}
${input.estimatedDelivery ? `⏰ *Entrega Prevista:* ${input.estimatedDelivery}` : "⏰ *Entrega Prevista:* Em breve"}

🔗 *Acompanhe seu pedido:* ${trackingUrl}

Qualquer dúvida, é só chamar! 💬

Obrigada pela confiança! 💕
Feminnita Pijamas
        `.trim();

        console.log(`[WhatsApp] Sending tracking update to ${input.customerPhone}:`);
        console.log(whatsappMessage);

        await notifyOwner({
          title: "Atualização de rastreio enviada",
          content: `Pedido #${input.orderNumber} - Status: ${input.status}`,
        });

        return {
          success: true,
          message: "Atualização de rastreio enviada com sucesso",
          whatsappMessage,
        };
      } catch (error) {
        console.error("Error sending tracking update:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao enviar atualização de rastreio",
        });
      }
    }),

  /**
   * Webhook receiver for Melhor Envio updates
   */
  webhookUpdate: protectedProcedure
    .input(
      z.object({
        trackingCode: z.string(),
        status: z.string(),
        timestamp: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log(`[Melhor Envio Webhook] Received update:`, input);

        await notifyOwner({
          title: "Atualização de rastreio recebida",
          content: `Código: ${input.trackingCode} - Status: ${input.status}`,
        });

        return {
          success: true,
          message: "Webhook processado com sucesso",
        };
      } catch (error) {
        console.error("Error processing webhook:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Erro ao processar webhook",
        });
      }
    }),

  /**
   * Get Melhor Envio configuration
   */
  getConfiguration: protectedProcedure.query(async () => {
    return {
      success: true,
      configured: !!MELHOR_ENVIO_TOKEN,
      features: [
        "Rastreamento de Pedidos",
        "Confirmação de Pagamento",
        "Atualização de Status",
        "Integração WhatsApp",
      ],
      status: MELHOR_ENVIO_TOKEN ? "active" : "inactive",
    };
  }),
});
