import { Router, Request, Response } from "express";
import { getDb } from "../db";
import { conversationHistory, escalationQueue } from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";
import { notifyOwner } from "../_core/notification";
import { eq } from "drizzle-orm";

const router = Router();

// Variáveis de ambiente para validação
const WHATSAPP_WEBHOOK_VERIFY_TOKEN = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || "your_verify_token";
const META_ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || "";

/**
 * GET /api/webhooks/whatsapp
 * Validação do webhook (Meta envia este request para verificar)
 */
router.get("/", (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // Validar token
  if (mode === "subscribe" && token === WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    console.log("[WhatsApp Webhook] Validado com sucesso");
    res.status(200).send(challenge);
  } else {
    console.error("[WhatsApp Webhook] Token inválido");
    res.status(403).send("Forbidden");
  }
});

/**
 * POST /api/webhooks/whatsapp
 * Recebe mensagens do WhatsApp Business
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Validar estrutura da mensagem
    if (body.object !== "whatsapp_business_account") {
      return res.status(400).send("Invalid webhook object");
    }

    // Processar cada entrada
    if (body.entry && Array.isArray(body.entry)) {
      for (const entry of body.entry) {
        if (entry.changes && Array.isArray(entry.changes)) {
          for (const change of entry.changes) {
            if (change.field === "messages") {
              await handleIncomingMessage(change.value);
            }
          }
        }
      }
    }

    // Responder imediatamente ao Meta
    res.status(200).send("EVENT_RECEIVED");
  } catch (error) {
    console.error("[WhatsApp Webhook] Erro ao processar:", error);
    res.status(500).send("Internal Server Error");
  }
});

/**
 * Processa mensagem recebida do WhatsApp
 */
async function handleIncomingMessage(data: any) {
  try {
    // Extrair informações da mensagem
    const messages = data.messages || [];
    const contacts = data.contacts || [];
    const phoneNumberId = data.metadata?.phone_number_id;

    if (messages.length === 0) return;

    const message = messages[0];
    const contact = contacts[0];

    if (message.type !== "text") {
      console.log("[WhatsApp] Tipo de mensagem não suportado:", message.type);
      return;
    }

    const phoneNumber = message.from;
    const messageText = message.text?.body || "";
    const contactName = contact?.profile?.name || "Cliente";
    const userId = 1; // Em produção, obter do contexto autenticado

    console.log(`[WhatsApp] Mensagem de ${phoneNumber}: ${messageText}`);

    // 1. Salvar mensagem no histórico
    const db = await getDb();
    if (db) {
      await db.insert(conversationHistory).values({
        userId,
        whatsappPhoneNumber: phoneNumber,
        whatsappContactName: contactName,
        userMessage: messageText,
        aiResponse: "", // Será preenchido depois
        status: "open",
      } as any);
    }

    // 2. Processar com IA
    const aiResponse = await processMessageWithAI(messageText, phoneNumber, userId);

    // 3. Detectar se deve escalar
    const shouldEscalate = detectEscalation(messageText);

    if (shouldEscalate) {
      // Escalar para atendente humano
      if (db) {
        await db.insert(escalationQueue).values({
          userId,
          whatsappPhoneNumber: phoneNumber,
          whatsappContactName: contactName,
          reason: "Cliente solicitou atendimento humano",
          status: "pending",
        } as any);
      }

      // Notificar proprietário
      await notifyOwner({
        title: "⚠️ Escalação de Atendimento WhatsApp",
        content: `${contactName} (${phoneNumber}) solicitou atendimento humano. Mensagem: "${messageText}"`,
      });

      // Enviar resposta de escalação
      await sendWhatsAppMessage(
        phoneNumberId,
        phoneNumber,
        "Entendo sua solicitação. Um atendente vai ajudá-lo em breve! 👋"
      );
    } else {
      // Enviar resposta automática
      await sendWhatsAppMessage(phoneNumberId, phoneNumber, aiResponse);

      // Atualizar histórico com resposta
      if (db) {
        await db
          .update(conversationHistory)
          .set({ aiResponse, status: "closed" })
          .where(eq(conversationHistory.whatsappPhoneNumber, phoneNumber));
      }
    }
  } catch (error) {
    console.error("[WhatsApp] Erro ao processar mensagem:", error);
  }
}

/**
 * Processa mensagem com IA
 */
async function processMessageWithAI(
  message: string,
  phoneNumber: string,
  userId: number
): Promise<string> {
  try {
    // Buscar contexto da conversa anterior
    const db = await getDb();
    let conversationContext = "";

    if (db) {
      const previousMessages = await db
        .select()
        .from(conversationHistory)
        .where(eq(conversationHistory.whatsappPhoneNumber, phoneNumber))
        .limit(5);

      conversationContext = previousMessages
        .map((m: any) => `Cliente: ${m.userMessage}\nIA: ${m.aiResponse}`)
        .join("\n\n");
    }

    // Chamar LLM com contexto
    const response: any = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um assistente de atendimento ao cliente amigável e profissional da Feminnita Pijamas. 
Responda em português brasileiro de forma concisa (máximo 2 linhas).
Se não souber a resposta, seja honesto e ofereça transferir para um atendente.
Histórico da conversa:
${conversationContext}`,
        },
        {
          role: "user",
          content: message,
        },
      ],
    });

    const content = response.choices?.[0]?.message?.content;
    const messageContent = typeof content === 'string' ? content : 'Desculpe, não consegui processar sua mensagem.';
    return messageContent;
  } catch (error) {
    console.error("[WhatsApp AI] Erro:", error);
    return "Desculpe, estou com dificuldades no momento. Um atendente vai ajudá-lo em breve.";
  }
}

/**
 * Detecta palavras-chave de escalação
 */
function detectEscalation(message: string): boolean {
  const escalationKeywords = [
    "atendente",
    "humano",
    "falar com",
    "suporte",
    "gerente",
    "reclamação",
    "problema",
    "urgente",
    "não funciona",
    "defeito",
    "dinheiro de volta",
    "reembolso",
  ];

  const lowerMessage = message.toLowerCase();
  return escalationKeywords.some((keyword) => lowerMessage.includes(keyword));
}

/**
 * Envia mensagem via WhatsApp
 */
async function sendWhatsAppMessage(
  phoneNumberId: string,
  toPhoneNumber: string,
  messageText: string
): Promise<boolean> {
  try {
    const response = await fetch(
      `https://graph.instagram.com/v18.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${META_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: toPhoneNumber,
          type: "text",
          text: {
            preview_url: true,
            body: messageText,
          },
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("[WhatsApp Send] Erro:", data.error);
      return false;
    }

    console.log("[WhatsApp Send] Mensagem enviada:", data.messages?.[0]?.id);
    return true;
  } catch (error) {
    console.error("[WhatsApp Send] Erro ao enviar:", error);
    return false;
  }
}

export default router;
