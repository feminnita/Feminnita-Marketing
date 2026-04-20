import { Request, Response } from "express";
import crypto from "crypto";
import { getDb } from "../db";
import { blingProdutos, blingEstoque } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

async function fireMetaCAPIPurchase(opts: {
  orderId: string;
  value: number;
  currency?: string;
  email?: string;
  phone?: string;
}) {
  try {
    const pixelId = process.env.META_PIXEL_ID;
    const accessToken = process.env.META_SYSTEM_USER_TOKEN || process.env.META_ACCESS_TOKEN;
    if (!pixelId || !accessToken) return;

    const hashEmail = opts.email
      ? crypto.createHash("sha256").update(opts.email.toLowerCase().trim()).digest("hex")
      : undefined;
    const hashPhone = opts.phone
      ? crypto.createHash("sha256").update(opts.phone.replace(/\D/g, "")).digest("hex")
      : undefined;

    const userData: any = {};
    if (hashEmail) userData.em = [hashEmail];
    if (hashPhone) userData.ph = [hashPhone];
    userData.country = ["br"];

    const payload = {
      data: [{
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: `bling_${opts.orderId}_${Date.now()}`,
        action_source: "other",
        user_data: userData,
        custom_data: {
          value: opts.value,
          currency: opts.currency ?? "BRL",
          order_id: opts.orderId,
        },
      }],
    };

    const res = await fetch(
      `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`,
      { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }
    );
    const data = await res.json();
    console.log("[MetaCAPI] Purchase enviado para pedido", opts.orderId, "→", JSON.stringify(data));
  } catch (err: any) {
    console.error("[MetaCAPI] Erro ao enviar Purchase:", err.message);
  }
}

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
    } else if (event === "pedido.criacao") {
      await handlePedidoCriado(data);
    } else if (event === "pedido.atualizacao") {
      await handlePedidoAtualizado(data);
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
 * Processa criação de pedido — dispara Purchase no Meta CAPI
 * Payload Bling: { id, numero, total, contato: { email, celular }, situacao }
 */
async function handlePedidoCriado(data: any) {
  try {
    const orderId = String(data?.id ?? data?.numero ?? "");
    const total = parseFloat(data?.total ?? data?.totalProdutos ?? 0);
    const email = data?.contato?.email ?? data?.cliente?.email ?? undefined;
    const phone =
      data?.contato?.celular ?? data?.contato?.telefone ?? data?.cliente?.celular ?? undefined;

    if (!orderId || total <= 0) {
      console.warn("[Bling Webhook] pedido.criacao sem id/total válido, ignorando CAPI");
      return;
    }

    await fireMetaCAPIPurchase({ orderId, value: total, currency: "BRL", email, phone });
    console.log(`[Bling Webhook] Pedido ${orderId} criado — CAPI Purchase disparado (R$ ${total})`);
  } catch (error) {
    console.error("[Bling Webhook] Erro ao processar pedido.criacao:", error);
  }
}

/**
 * Processa atualização de pedido — re-dispara Purchase apenas se situação = "Atendido" (9)
 * Evita duplicatas para qualquer outra mudança de status
 */
async function handlePedidoAtualizado(data: any) {
  try {
    // situacao.id 9 = Atendido (pedido faturado/entregue), único momento que consideramos conversão confirmada
    const situacaoId = data?.situacao?.id ?? data?.idSituacao;
    if (situacaoId !== 9 && situacaoId !== "9") {
      console.log(`[Bling Webhook] pedido.atualizacao situação ${situacaoId} — ignorando CAPI`);
      return;
    }

    const orderId = String(data?.id ?? data?.numero ?? "");
    const total = parseFloat(data?.total ?? data?.totalProdutos ?? 0);
    const email = data?.contato?.email ?? data?.cliente?.email ?? undefined;
    const phone =
      data?.contato?.celular ?? data?.contato?.telefone ?? data?.cliente?.celular ?? undefined;

    if (!orderId || total <= 0) return;

    await fireMetaCAPIPurchase({ orderId, value: total, currency: "BRL", email, phone });
    console.log(`[Bling Webhook] Pedido ${orderId} Atendido — CAPI Purchase disparado (R$ ${total})`);
  } catch (error) {
    console.error("[Bling Webhook] Erro ao processar pedido.atualizacao:", error);
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
