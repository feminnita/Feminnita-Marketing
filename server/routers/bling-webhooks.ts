import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { notifyOwner } from "../_core/notification";

/**
 * Bling Webhooks Router
 * Handles incoming webhooks from Bling ERP for real-time synchronization
 */

export const blingWebhooksRouter = router({
  /**
   * Handle product updates from Bling
   * Webhook triggered when products are created/updated in Bling
   */
  handleProductUpdate: publicProcedure
    .input(
      z.object({
        event: z.string(),
        data: z.object({
          id: z.number(),
          nome: z.string(),
          descricao: z.string().optional(),
          preco: z.number(),
          estoque: z.number(),
          sku: z.string().optional(),
          categoria: z.string().optional(),
          imagens: z.array(z.string()).optional(),
        }),
        timestamp: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log(`[Bling Webhook] Produto atualizado: ${input.data.nome}`);

        // Log the webhook event
        console.log(`[Bling Webhook] Event: ${input.event}`, {
          productId: input.data.id,
          timestamp: new Date(input.timestamp),
        });

        // Here you would typically:
        // 1. Update your database with the new product info
        // 2. Trigger any downstream processes
        // 3. Update caches

        // Notify owner of important updates
        if (input.data.estoque === 0) {
          await notifyOwner({
            title: "Produto fora de estoque",
            content: `O produto "${input.data.nome}" (ID: ${input.data.id}) ficou sem estoque.`,
          });
        }

        return {
          success: true,
          message: "Produto sincronizado com sucesso",
          productId: input.data.id,
        };
      } catch (error) {
        console.error("Error handling product webhook:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Handle order updates from Bling
   * Webhook triggered when orders are created/updated in Bling
   */
  handleOrderUpdate: publicProcedure
    .input(
      z.object({
        event: z.string(),
        data: z.object({
          id: z.number(),
          numero: z.string(),
          cliente: z.string(),
          email: z.string().optional(),
          telefone: z.string().optional(),
          valor: z.number(),
          status: z.string(),
          data: z.string(),
          itens: z.array(
            z.object({
              produtoId: z.number(),
              nome: z.string(),
              quantidade: z.number(),
              preco: z.number(),
            })
          ),
        }),
        timestamp: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log(`[Bling Webhook] Pedido atualizado: ${input.data.numero}`);

        // Log the webhook event
        console.log(`[Bling Webhook] Event: ${input.event}`, {
          orderId: input.data.id,
          orderNumber: input.data.numero,
          status: input.data.status,
          timestamp: new Date(input.timestamp),
        });

        // Here you would typically:
        // 1. Update order status in your database
        // 2. Trigger fulfillment processes
        // 3. Send notifications to customer
        // 4. Update inventory

        // Notify owner of high-value orders
        if (input.data.valor > 5000) {
          await notifyOwner({
            title: "Pedido de alto valor recebido",
            content: `Novo pedido #${input.data.numero} de R$ ${input.data.valor.toFixed(2)} do cliente ${input.data.cliente}`,
          });
        }

        return {
          success: true,
          message: "Pedido sincronizado com sucesso",
          orderId: input.data.id,
          orderNumber: input.data.numero,
        };
      } catch (error) {
        console.error("Error handling order webhook:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Handle inventory updates from Bling
   * Webhook triggered when inventory levels change
   */
  handleInventoryUpdate: publicProcedure
    .input(
      z.object({
        event: z.string(),
        data: z.object({
          produtoId: z.number(),
          sku: z.string(),
          quantidade: z.number(),
          quantidadeAnterior: z.number(),
          localizacao: z.string().optional(),
        }),
        timestamp: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        console.log(
          `[Bling Webhook] Estoque atualizado: SKU ${input.data.sku} - ${input.data.quantidade} unidades`
        );

        const diferenca = input.data.quantidade - input.data.quantidadeAnterior;

        // Log the webhook event
        console.log(`[Bling Webhook] Event: ${input.event}`, {
          productId: input.data.produtoId,
          newQuantity: input.data.quantidade,
          difference: diferenca > 0 ? `+${diferenca}` : diferenca,
          timestamp: new Date(input.timestamp),
        });

        // Notify if stock is low
        if (input.data.quantidade < 10 && input.data.quantidade > 0) {
          await notifyOwner({
            title: "Estoque baixo",
            content: `Produto SKU ${input.data.sku} tem apenas ${input.data.quantidade} unidades em estoque.`,
          });
        }

        // Notify if out of stock
        if (input.data.quantidade === 0 && input.data.quantidadeAnterior > 0) {
          await notifyOwner({
            title: "Produto fora de estoque",
            content: `Produto SKU ${input.data.sku} ficou sem estoque.`,
          });
        }

        return {
          success: true,
          message: "Estoque sincronizado com sucesso",
          productId: input.data.produtoId,
          newQuantity: input.data.quantidade,
        };
      } catch (error) {
        console.error("Error handling inventory webhook:", error);
        return {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Verify webhook signature (for security)
   * Bling sends a signature header to verify the webhook is authentic
   */
  verifyWebhookSignature: publicProcedure
    .input(
      z.object({
        payload: z.string(),
        signature: z.string(),
        secret: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        // In production, verify the signature using HMAC-SHA256
        // This is a simplified example
        const crypto = require("crypto");
        const hash = crypto
          .createHmac("sha256", input.secret)
          .update(input.payload)
          .digest("hex");

        const isValid = hash === input.signature;

        return {
          valid: isValid,
          message: isValid ? "Assinatura válida" : "Assinatura inválida",
        };
      } catch (error) {
        return {
          valid: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }),

  /**
   * Get webhook configuration
   * Returns the webhook URLs and events that should be configured in Bling
   */
  getWebhookConfig: publicProcedure.query(async () => {
    const baseUrl = process.env.WEBHOOK_BASE_URL || "https://api.example.com";

    return {
      webhooks: [
        {
          event: "product.updated",
          url: `${baseUrl}/api/trpc/blingWebhooks.handleProductUpdate`,
          description: "Triggered when products are created or updated",
          active: true,
        },
        {
          event: "order.updated",
          url: `${baseUrl}/api/trpc/blingWebhooks.handleOrderUpdate`,
          description: "Triggered when orders are created or updated",
          active: true,
        },
        {
          event: "inventory.updated",
          url: `${baseUrl}/api/trpc/blingWebhooks.handleInventoryUpdate`,
          description: "Triggered when inventory levels change",
          active: true,
        },
      ],
      instructions: [
        "1. Acesse sua conta Bling",
        "2. Vá para Configurações → Webhooks",
        "3. Adicione os URLs acima",
        "4. Selecione os eventos que deseja receber",
        "5. Salve e teste a conexão",
      ],
    };
  }),
});
