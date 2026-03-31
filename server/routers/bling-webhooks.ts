import { router, publicProcedure } from "../_core/trpc";
import { z } from "zod";
import { notifyOwner } from "../_core/notification";
import * as crypto from "crypto";

/**
 * Verifica assinatura HMAC-SHA256 do Bling antes de processar qualquer webhook.
 * Bling envia o header X-Bling-Signature: sha256=<hash>
 */
function verifyBlingSignature(payload: string, signature: string): boolean {
  const secret = process.env.BLING_WEBHOOK_SECRET;
  if (!secret) {
    console.warn("[BlingWebhook] BLING_WEBHOOK_SECRET não configurado — assinatura ignorada em dev");
    return true; // em dev sem secret, deixar passar
  }
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(signature.replace("sha256=", ""), "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

export const blingWebhooksRouter = router({
  handleProductUpdate: publicProcedure
    .input(
      z.object({
        event: z.string(),
        signature: z.string().default(""),
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
      const payload = JSON.stringify({ event: input.event, data: input.data, timestamp: input.timestamp });
      if (!verifyBlingSignature(payload, input.signature)) {
        throw new Error("Assinatura inválida");
      }

      console.log(`[BlingWebhook] Produto atualizado: ${input.data.nome} (id=${input.data.id})`);

      if (input.data.estoque === 0) {
        await notifyOwner({
          title: "Produto fora de estoque",
          content: `O produto "${input.data.nome}" (ID: ${input.data.id}) ficou sem estoque.`,
        });
      }

      return { success: true, productId: input.data.id };
    }),

  handleOrderUpdate: publicProcedure
    .input(
      z.object({
        event: z.string(),
        signature: z.string().default(""),
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
      const payload = JSON.stringify({ event: input.event, data: input.data, timestamp: input.timestamp });
      if (!verifyBlingSignature(payload, input.signature)) {
        throw new Error("Assinatura inválida");
      }

      console.log(`[BlingWebhook] Pedido atualizado: #${input.data.numero} (R$${input.data.valor.toFixed(2)})`);

      if (input.data.valor > 5000) {
        await notifyOwner({
          title: "Pedido de alto valor recebido",
          content: `Novo pedido #${input.data.numero} de R$ ${input.data.valor.toFixed(2)} do cliente ${input.data.cliente}`,
        });
      }

      return { success: true, orderId: input.data.id, orderNumber: input.data.numero };
    }),

  handleInventoryUpdate: publicProcedure
    .input(
      z.object({
        event: z.string(),
        signature: z.string().default(""),
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
      const payload = JSON.stringify({ event: input.event, data: input.data, timestamp: input.timestamp });
      if (!verifyBlingSignature(payload, input.signature)) {
        throw new Error("Assinatura inválida");
      }

      console.log(`[BlingWebhook] Estoque atualizado: SKU ${input.data.sku} → ${input.data.quantidade} un.`);

      if (input.data.quantidade < 10 && input.data.quantidade > 0) {
        await notifyOwner({
          title: "Estoque baixo",
          content: `Produto SKU ${input.data.sku} tem apenas ${input.data.quantidade} unidades.`,
        });
      }

      if (input.data.quantidade === 0 && input.data.quantidadeAnterior > 0) {
        await notifyOwner({
          title: "Produto fora de estoque",
          content: `Produto SKU ${input.data.sku} ficou sem estoque.`,
        });
      }

      return { success: true, productId: input.data.produtoId, newQuantity: input.data.quantidade };
    }),

  getWebhookConfig: publicProcedure.query(async () => {
    const baseUrl = process.env.WEBHOOK_BASE_URL || process.env.VITE_APP_URL || "https://api.example.com";
    return {
      webhooks: [
        { event: "product.updated", url: `${baseUrl}/api/trpc/blingWebhooks.handleProductUpdate` },
        { event: "order.updated", url: `${baseUrl}/api/trpc/blingWebhooks.handleOrderUpdate` },
        { event: "inventory.updated", url: `${baseUrl}/api/trpc/blingWebhooks.handleInventoryUpdate` },
      ],
      instructions: [
        "1. Acesse sua conta Bling → Configurações → Webhooks",
        "2. Adicione os URLs acima",
        "3. Configure a variável BLING_WEBHOOK_SECRET com o secret gerado pelo Bling",
        "4. Selecione os eventos e salve",
      ],
    };
  }),
});
