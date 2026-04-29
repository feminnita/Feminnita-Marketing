/**
 * WhatsApp Funnel Webhook — Meta Cloud API
 *
 * GET /api/whatsapp/funnel  → verificação do webhook pelo Meta
 * POST /api/whatsapp/funnel → recebe mensagens, responde via agente Ana
 */

import type { Express } from "express";
import { runWhatsAppFunnelAgent } from "../agents/whatsapp-funnel-agent";

const VERIFY_TOKEN = process.env.WHATSAPP_FUNNEL_VERIFY_TOKEN || "feminnita-funnel-2026";

async function sendWhatsAppReply(phoneNumberId: string, to: string, text: string, token: string) {
  await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { body: text },
    }),
  });
}

async function markAsRead(phoneNumberId: string, messageId: string, token: string) {
  await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    }),
  }).catch(() => null);
}

export function registerWhatsAppFunnelWebhook(app: Express) {
  // Verificação do webhook pelo Meta
  app.get("/api/whatsapp/funnel", (req, res) => {
    const mode      = req.query["hub.mode"];
    const token     = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    if (mode === "subscribe" && token === VERIFY_TOKEN) {
      console.log("[WA Funnel] Webhook verificado pelo Meta");
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Forbidden");
  });

  // Recebe mensagens do Meta
  app.post("/api/whatsapp/funnel", async (req, res) => {
    // Responde 200 imediatamente (Meta exige < 5s)
    res.status(200).send("OK");

    try {
      const body = req.body;
      if (body.object !== "whatsapp_business_account") return;

      const entry   = body.entry?.[0];
      const changes = entry?.changes?.[0];
      const value   = changes?.value;

      if (!value?.messages?.length) return;

      const message     = value.messages[0];
      const phoneNumberId: string = value.metadata?.phone_number_id;
      const token       = process.env.WHATSAPP_ACCESS_TOKEN || "";

      if (!token || !phoneNumberId) {
        console.warn("[WA Funnel] WHATSAPP_ACCESS_TOKEN ou phone_number_id ausente");
        return;
      }

      // Só processa mensagens de texto
      if (message.type !== "text") return;

      const from        = message.from as string;
      const text        = (message.text?.body as string) || "";
      const contactName = (value.contacts?.[0]?.profile?.name as string) || "";
      const messageId   = message.id as string;

      console.log(`[WA Funnel] ${from} (${contactName}): ${text.slice(0, 60)}`);

      // Marca como lida
      markAsRead(phoneNumberId, messageId, token);

      // Gera resposta com Claude
      const reply = await runWhatsAppFunnelAgent(from, contactName, text);

      // Envia resposta
      await sendWhatsAppReply(phoneNumberId, from, reply, token);
      console.log(`[WA Funnel] Resposta enviada para ${from}`);
    } catch (e: any) {
      console.error("[WA Funnel] Erro ao processar mensagem:", e.message);
    }
  });
}
