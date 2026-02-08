import { Request, Response } from "express";
import crypto from "crypto";

/**
 * Processa webhooks do Bling para sincronização de estoque
 * Documentação: https://developer.bling.com.br/bling-api
 */

export async function handleBlingWebhook(req: Request, res: Response) {
  try {
    const { event, data } = req.body;

    console.log("[Bling Webhook] Recebido evento:", event);
    console.log("[Bling Webhook] Dados:", JSON.stringify(data, null, 2));

    // Validar tipo de evento
    if (!event || !data) {
      console.warn("[Bling Webhook] Evento ou dados inválidos");
      return res.status(400).json({ error: "Evento ou dados inválidos" });
    }

    // Processar eventos de estoque
    if (event === "estoque.criacao") {
      await handleEstoqueCreated(data);
    } else if (event === "estoque.atualizacao") {
      await handleEstoqueUpdated(data);
    } else if (event === "estoque.exclusao") {
      await handleEstoqueDeleted(data);
    } else {
      console.log("[Bling Webhook] Evento não tratado:", event);
    }

    // Responder com sucesso
    return res.status(200).json({ success: true, message: "Webhook processado com sucesso" });
  } catch (error) {
    console.error("[Bling Webhook] Erro ao processar webhook:", error);
    return res.status(500).json({ error: "Erro ao processar webhook" });
  }
}

/**
 * Processa criação de novo estoque
 */
async function handleEstoqueCreated(data: any) {
  try {
    console.log("[Bling Webhook] Novo estoque criado:", data);

    // Aqui você pode:
    // 1. Salvar no banco de dados
    // 2. Atualizar cache
    // 3. Notificar clientes via WebSocket
    // 4. Atualizar página de produtos

    const { id, descricao, saldoFisico, saldoVirtual, deposito } = data;

    console.log(`[Bling Webhook] Estoque criado - ID: ${id}, Descrição: ${descricao}, Saldo: ${saldoFisico}`);

    // TODO: Implementar lógica de sincronização
  } catch (error) {
    console.error("[Bling Webhook] Erro ao processar criação de estoque:", error);
  }
}

/**
 * Processa atualização de estoque
 */
async function handleEstoqueUpdated(data: any) {
  try {
    console.log("[Bling Webhook] Estoque atualizado:", data);

    const { id, descricao, saldoFisico, saldoVirtual, deposito } = data;

    console.log(
      `[Bling Webhook] Estoque atualizado - ID: ${id}, Descrição: ${descricao}, Novo saldo: ${saldoFisico}`
    );

    // TODO: Implementar lógica de sincronização
    // Exemplo:
    // - Atualizar produto no banco de dados
    // - Invalidar cache
    // - Notificar clientes se estoque ficou zerado
    // - Atualizar página em tempo real via WebSocket
  } catch (error) {
    console.error("[Bling Webhook] Erro ao processar atualização de estoque:", error);
  }
}

/**
 * Processa exclusão de estoque
 */
async function handleEstoqueDeleted(data: any) {
  try {
    console.log("[Bling Webhook] Estoque deletado:", data);

    const { id, descricao } = data;

    console.log(`[Bling Webhook] Estoque deletado - ID: ${id}, Descrição: ${descricao}`);

    // TODO: Implementar lógica de sincronização
  } catch (error) {
    console.error("[Bling Webhook] Erro ao processar exclusão de estoque:", error);
  }
}

/**
 * Valida assinatura do webhook (opcional, mas recomendado)
 */
export function validateBlingWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return hash === signature;
}
