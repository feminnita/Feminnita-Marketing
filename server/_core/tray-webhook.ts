import { Request, Response } from "express";
import crypto from "crypto";

/**
 * Tray (tray.com.br) webhook handler for FNT store order events.
 * Fires Meta CAPI Purchase on new paid orders.
 *
 * Tray sends POST to /api/tray/webhook with header X-Tray-Token.
 * Payload example:
 *   { "tipo": "pedido", "acao": "novo", "pedido": { "id": 123, "valor_total": "450.00",
 *     "cliente": { "email": "x@x.com", "celular": "11999999999" } } }
 */

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

    const userData: any = { country: ["br"] };
    if (hashEmail) userData.em = [hashEmail];
    if (hashPhone) userData.ph = [hashPhone];

    const payload = {
      data: [{
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        event_id: `tray_${opts.orderId}_${Date.now()}`,
        action_source: "website",
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
    console.log("[Tray→MetaCAPI] Purchase enviado para pedido", opts.orderId, "→", JSON.stringify(data));
  } catch (err: any) {
    console.error("[Tray→MetaCAPI] Erro:", err.message);
  }
}

export async function handleTrayWebhook(req: Request, res: Response) {
  try {
    // Optional token validation
    const secret = process.env.TRAY_WEBHOOK_TOKEN;
    if (secret) {
      const token = req.headers["x-tray-token"] as string | undefined;
      if (!token || token !== secret) {
        console.warn("[Tray Webhook] Token inválido");
        return res.status(401).json({ error: "Unauthorized" });
      }
    }

    const body = req.body;
    console.log("[Tray Webhook] Recebido:", JSON.stringify(body));

    const tipo = body?.tipo;
    const acao = body?.acao ?? body?.action;
    const pedido = body?.pedido ?? body?.order;

    if (tipo !== "pedido" || !pedido) {
      return res.status(200).json({ ok: true, skipped: true });
    }

    // Fire on new order or when status becomes "aprovado" / "pago"
    const statusMapping: Record<string, boolean> = {
      novo: true,
      aprovado: true,
      pago: true,
      new: true,
      approved: true,
      paid: true,
    };

    if (!statusMapping[acao]) {
      console.log(`[Tray Webhook] Ação '${acao}' ignorada para CAPI`);
      return res.status(200).json({ ok: true, skipped: true });
    }

    const orderId = String(pedido.id ?? pedido.numero ?? "");
    const value = parseFloat(pedido.valor_total ?? pedido.total ?? 0);
    const email = pedido.cliente?.email ?? pedido.customer?.email ?? undefined;
    const phone =
      pedido.cliente?.celular ??
      pedido.cliente?.telefone ??
      pedido.customer?.phone ??
      undefined;

    if (!orderId || value <= 0) {
      console.warn("[Tray Webhook] Pedido sem id/valor válido, ignorando");
      return res.status(200).json({ ok: true, skipped: true });
    }

    await fireMetaCAPIPurchase({ orderId, value, currency: "BRL", email, phone });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("[Tray Webhook] Erro:", error);
    return res.status(500).json({ error: "Internal error" });
  }
}
