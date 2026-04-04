import { Request, Response } from "express";
import crypto from "crypto";
import { getDb } from "../db";
import { blingProdutos, blingEstoque } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

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
 * Payload Bling: { id, produto: { id, sku }, saldoFisico, saldoVirtual, deposito }
 */
async function handleEstoqueCreated(data: any) {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Bling Webhook] DB indisponível, ignorando estoque.criacao");
      return;
    }

    const produtoId = data?.produto?.id ?? data?.id;
    const produtoSku = data?.produto?.sku ?? data?.sku ?? "";
    const quantidade = data?.saldoFisico ?? 0;
    const quantidadeReservada = data?.saldoReservado ?? 0;
    const quantidadeDisponivel = data?.saldoVirtual ?? quantidade;

    if (!produtoId) {
      console.warn("[Bling Webhook] estoque.criacao sem produtoId, ignorando");
      return;
    }

    // userId "system" para webhooks não autenticados por usuário
    const userId = "system";

    await db.insert(blingEstoque).values({
      userId,
      produtoId,
      produtoSku,
      quantidade,
      quantidadeReservada,
      quantidadeDisponivel,
      dataAtualizacao: new Date(),
    });

    // Atualizar coluna estoque em blingProdutos se o produto já existe
    await db
      .update(blingProdutos)
      .set({ estoque: quantidade, dataAtualizacao: new Date() })
      .where(and(eq(blingProdutos.id, produtoId), eq(blingProdutos.userId, userId)));

    console.log(`[Bling Webhook] Estoque criado — produto ${produtoId} (SKU: ${produtoSku}), saldo: ${quantidade}`);
  } catch (error) {
    console.error("[Bling Webhook] Erro ao processar criação de estoque:", error);
  }
}

/**
 * Processa atualização de estoque
 */
async function handleEstoqueUpdated(data: any) {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Bling Webhook] DB indisponível, ignorando estoque.atualizacao");
      return;
    }

    const produtoId = data?.produto?.id ?? data?.id;
    const produtoSku = data?.produto?.sku ?? data?.sku ?? "";
    const quantidade = data?.saldoFisico ?? 0;
    const quantidadeReservada = data?.saldoReservado ?? 0;
    const quantidadeDisponivel = data?.saldoVirtual ?? quantidade;

    if (!produtoId) {
      console.warn("[Bling Webhook] estoque.atualizacao sem produtoId, ignorando");
      return;
    }

    const userId = "system";

    // Tenta update; se não existir, insere (upsert manual)
    const existing = await db
      .select({ id: blingEstoque.id })
      .from(blingEstoque)
      .where(and(eq(blingEstoque.produtoId, produtoId), eq(blingEstoque.userId, userId)))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(blingEstoque)
        .set({ quantidade, quantidadeReservada, quantidadeDisponivel, dataAtualizacao: new Date() })
        .where(and(eq(blingEstoque.produtoId, produtoId), eq(blingEstoque.userId, userId)));
    } else {
      await db.insert(blingEstoque).values({
        userId,
        produtoId,
        produtoSku,
        quantidade,
        quantidadeReservada,
        quantidadeDisponivel,
        dataAtualizacao: new Date(),
      });
    }

    // Sincronizar coluna estoque em blingProdutos
    await db
      .update(blingProdutos)
      .set({ estoque: quantidade, dataAtualizacao: new Date() })
      .where(and(eq(blingProdutos.id, produtoId), eq(blingProdutos.userId, userId)));

    console.log(`[Bling Webhook] Estoque atualizado — produto ${produtoId} (SKU: ${produtoSku}), novo saldo: ${quantidade}`);
  } catch (error) {
    console.error("[Bling Webhook] Erro ao processar atualização de estoque:", error);
  }
}

/**
 * Processa exclusão de estoque
 */
async function handleEstoqueDeleted(data: any) {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Bling Webhook] DB indisponível, ignorando estoque.exclusao");
      return;
    }

    const produtoId = data?.produto?.id ?? data?.id;

    if (!produtoId) {
      console.warn("[Bling Webhook] estoque.exclusao sem produtoId, ignorando");
      return;
    }

    const userId = "system";

    // Zerar estoque ao invés de deletar — preserva o registro histórico
    await db
      .update(blingEstoque)
      .set({ quantidade: 0, quantidadeReservada: 0, quantidadeDisponivel: 0, dataAtualizacao: new Date() })
      .where(and(eq(blingEstoque.produtoId, produtoId), eq(blingEstoque.userId, userId)));

    await db
      .update(blingProdutos)
      .set({ estoque: 0, dataAtualizacao: new Date() })
      .where(and(eq(blingProdutos.id, produtoId), eq(blingProdutos.userId, userId)));

    console.log(`[Bling Webhook] Estoque deletado — produto ${produtoId} zerado`);
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
