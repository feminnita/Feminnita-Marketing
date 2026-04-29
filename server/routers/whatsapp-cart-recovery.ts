/**
 * Recuperação de Carrinho Abandonado via WhatsApp — Lia
 * Recebe webhook da Tray, envia mensagem imediata e agenda follow-ups em 2h e 24h
 * Suporta B2C (Feminnita varejo) e B2B (FNT atacado, pedidos ≥ R$500)
 */

import type { Express } from "express";
import { getDb } from "../db";
import { abandonamentoLogs, abandonamentoSequencias } from "../../drizzle/schema";
import { eq, and, lt } from "drizzle-orm";

const WA_API = "https://graph.facebook.com/v19.0";

// ─── Contexto compartilhado com a Lia ────────────────────────────────────────
// Quando a cliente responder, a Lia consulta esse mapa para saber o que estava no carrinho

export interface CartContext {
  items: Array<{ name: string; url?: string; price?: string; qty?: number }>;
  cartValue: number;
  cartUrl?: string;
  isB2B: boolean;
  capturedAt: Date;
}

export const cartContextStore = new Map<string, CartContext>();

// ─── Envio de mensagem WhatsApp ───────────────────────────────────────────────

async function sendWhatsAppMessage(phone: string, text: string): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    console.warn("[CartRecovery] Env vars WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID ausentes");
    return false;
  }

  try {
    const res = await fetch(`${WA_API}/${phoneNumberId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: phone,
        type: "text",
        text: { body: text, preview_url: true },
      }),
    });
    const data = await res.json() as any;
    if (data.error) {
      console.warn(`[CartRecovery] Erro Meta API (${phone}):`, data.error.message || data.error);
      return false;
    }
    return true;
  } catch (e: any) {
    console.warn(`[CartRecovery] Falha ao enviar (${phone}):`, e.message);
    return false;
  }
}

// ─── Mensagens por etapa ──────────────────────────────────────────────────────

function buildCartMessage(
  etapa: 1 | 2 | 3,
  name: string,
  items: CartContext["items"],
  cartValue: number,
  cartUrl: string | undefined,
  isB2B: boolean
): string {
  const firstName = name?.split(" ")[0] || "você";
  const itemList = items.slice(0, 3)
    .map(i => `• ${i.name}${i.price ? ` — ${i.price}` : ""}`)
    .join("\n");
  const cartLink = cartUrl ? `\n\n🛒 Retomar carrinho: ${cartUrl}` : "";

  if (isB2B) {
    const msgs: Record<1 | 2 | 3, string> = {
      1: `Olá, ${firstName}! 👋 Vi que você estava montando um pedido na Feminnita.\n\n${itemList}\n\nPosso te ajudar com condições de atacado, volume mínimo ou frete? É só me chamar aqui! 😊${cartLink}`,
      2: `${firstName}, tudo bem? 😊 Seu pedido ainda está no carrinho. Se tiver alguma dúvida sobre volume, prazo ou condições especiais, estou aqui pra resolver!${cartLink}`,
      3: `${firstName}, última mensagem da minha parte! 🙏 Pedidos acima de R$500 têm condição especial de frete. Seu carrinho ainda está salvo — é só finalizar quando quiser.${cartLink}`,
    };
    return msgs[etapa];
  }

  const msgs: Record<1 | 2 | 3, string> = {
    1: `Oi ${firstName}! 😊 Vi que você escolheu algumas peças incríveis na Feminnita mas não finalizou o pedido. Posso te ajudar?\n\n${itemList}${cartLink}`,
    2: `${firstName}, suas peças ainda estão reservadas 🥰 Mas o estoque é limitado e pode esgotar. Quer garantir as suas antes que alguém leve?${cartLink}`,
    3: `${firstName}, última chamada! 💫 Só passando para lembrar que seu carrinho ainda está salvo. Se tiver qualquer dúvida sobre tamanho, cor ou entrega, é só perguntar aqui! 🛍️${cartLink}`,
  };
  return msgs[etapa];
}

// ─── Normalização de telefone ─────────────────────────────────────────────────

function normalizeTrayPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (!digits.startsWith("55")) digits = "55" + digits;
  return digits;
}

// ─── Webhook Tray ─────────────────────────────────────────────────────────────

export function registerCartRecoveryWebhook(app: Express) {
  app.post("/api/whatsapp/cart-recovery", async (req, res) => {
    res.sendStatus(200); // Tray exige resposta < 5s

    try {
      const body = req.body as any;
      console.log("[CartRecovery] Webhook:", JSON.stringify(body).slice(0, 500));

      // Suporte a diferentes formatos de webhook da Tray
      const customer = body.customer || body.Client || body.contact || {};
      const cart     = body.cart || body.Cart || body.checkout || body;
      const items    = (cart.items || cart.CartProducts || body.products || []) as any[];

      const rawPhone = customer.phone || customer.cellphone || customer.Phone || customer.mobile || "";
      if (!rawPhone) {
        console.log("[CartRecovery] Webhook sem telefone — ignorado");
        return;
      }

      const phone     = normalizeTrayPhone(rawPhone);
      const name      = customer.name || customer.Name || customer.first_name || "Cliente";
      const cartUrl   = cart.url || cart.cart_url || cart.recovery_url || undefined;
      const cartValue = parseFloat(String(cart.total || cart.Total || cart.value || "0"));
      // Considera B2B se valor ≥ R$500 ou quantidade de itens ≥ 5 unidades
      const isB2B = cartValue >= 500 || items.some((i: any) => (i.quantity || i.qty || 1) >= 5);

      const parsedItems: CartContext["items"] = items.slice(0, 5).map((it: any) => ({
        name:  it.name || it.Product?.name || it.product_name || it.title || "Produto",
        url:   it.url  || it.Product?.url  || it.link || undefined,
        price: it.price ? `R$${parseFloat(String(it.price)).toFixed(2)}` : undefined,
        qty:   it.quantity || it.qty || 1,
      }));

      // Salva contexto para a Lia usar quando a cliente responder
      cartContextStore.set(phone, {
        items: parsedItems,
        cartValue,
        cartUrl,
        isB2B,
        capturedAt: new Date(),
      });

      // Envia etapa 1 imediatamente
      const msg  = buildCartMessage(1, name, parsedItems, cartValue, cartUrl, isB2B);
      const sent = await sendWhatsAppMessage(phone, msg);
      console.log(`[CartRecovery] Etapa 1 → ${phone} (${name}) | B2B=${isB2B} | enviado=${sent}`);

      // Registra log no banco
      const db = await getDb();
      if (db) {
        const [seq] = await db.select().from(abandonamentoSequencias)
          .where(eq(abandonamentoSequencias.userId, 1))
          .limit(1);

        await db.insert(abandonamentoLogs).values({
          userId: 1,
          sequenciaId: seq?.id ?? null,
          clienteNome: name,
          clienteWhatsapp: phone,
          pedidoId: String(body.order_id || body.cart_id || body.id || ""),
          etapaAtual: 1,
          status: "ativo",
        } as any).catch((e: any) => console.warn("[CartRecovery] DB insert:", e.message));
      }

    } catch (e: any) {
      console.error("[CartRecovery] Erro no webhook:", e.message);
    }
  });

  console.log("[CartRecovery] Webhook registrado em POST /api/whatsapp/cart-recovery");
}

// ─── Agendador de follow-ups ──────────────────────────────────────────────────
// Roda a cada 15 minutos e envia etapa 2 (após 2h) e etapa 3 (após 24h)

export function scheduleCartFollowUps() {
  setInterval(async () => {
    try {
      const db = await getDb();
      if (!db) return;

      const now  = new Date();
      const logs = await db.select().from(abandonamentoLogs)
        .where(and(
          eq(abandonamentoLogs.status as any, "ativo"),
          lt(abandonamentoLogs.etapaAtual as any, 3),
        ))
        .limit(50);

      for (const log of logs as any[]) {
        const seq = log.sequenciaId
          ? (await db.select().from(abandonamentoSequencias)
              .where(eq(abandonamentoSequencias.id, log.sequenciaId))
              .limit(1))[0]
          : null;

        const etapa = (log.etapaAtual as number) || 1;
        const nextEtapa = (etapa + 1) as 2 | 3;
        const horasAguardar = etapa === 1
          ? (seq?.etapa2Horas ?? 2)
          : (seq?.etapa3Horas ?? 24);

        const baseTime  = new Date(log.updatedAt || log.createdAt);
        const sendAfter = new Date(baseTime.getTime() + horasAguardar * 60 * 60 * 1000);
        if (now < sendAfter) continue;

        const ctx       = cartContextStore.get(log.clienteWhatsapp);
        const items     = ctx?.items     ?? [{ name: "as peças escolhidas" }];
        const cartValue = ctx?.cartValue ?? 0;
        const isB2B     = ctx?.isB2B    ?? false;
        const cartUrl   = ctx?.cartUrl;

        const msg  = buildCartMessage(nextEtapa, log.clienteNome, items, cartValue, cartUrl, isB2B);
        const sent = await sendWhatsAppMessage(log.clienteWhatsapp, msg);
        console.log(`[CartRecovery] Etapa ${nextEtapa} → ${log.clienteWhatsapp} | enviado=${sent}`);

        await db.update(abandonamentoLogs).set({
          etapaAtual: nextEtapa,
          updatedAt:  now,
          ...(nextEtapa === 3 ? { status: "finalizado" } : {}),
        } as any).where(eq(abandonamentoLogs.id, log.id));
      }
    } catch (e: any) {
      console.error("[CartRecovery] Erro no follow-up scheduler:", e.message);
    }
  }, 15 * 60 * 1000);

  console.log("[CartRecovery] Follow-up scheduler ativo (intervalo: 15 min)");
}
