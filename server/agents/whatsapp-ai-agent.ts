import { getDb } from "../db";
import { aiSettings, conversationHistory, knowledgeBase } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

// Processa uma mensagem recebida via WhatsApp e retorna a resposta IA
export async function processWhatsAppMessage(
  userId: number,
  phoneNumber: string,
  contactName: string,
  message: string
): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Buscar configurações de IA
    const settings = await db.select().from(aiSettings)
      .where(and(eq(aiSettings.userId, userId), eq(aiSettings.isEnabled, true)))
      .limit(1);

    if (!settings.length) return null; // IA desabilitada para este usuário

    const config = settings[0];

    // Checar se deve escalar por palavras-chave
    const escalationKeywords = config.escalationKeywords ?? [];
    const shouldEscalate = escalationKeywords.some(kw =>
      message.toLowerCase().includes(kw.toLowerCase())
    );
    if (shouldEscalate) return null; // Deixa para humano

    // Buscar base de conhecimento relevante
    const knowledge = await db.select().from(knowledgeBase)
      .where(and(eq(knowledgeBase.userId, userId), eq(knowledgeBase.isActive, true)))
      .limit(config.searchResultsLimit ?? 3);

    const knowledgeContext = knowledge.map(k =>
      `[${k.contentType}] ${k.title}: ${k.description ?? ""}`
    ).join("\n");

    // Buscar histórico recente da conversa
    const history = await db.select().from(conversationHistory)
      .where(and(eq(conversationHistory.userId, userId), eq(conversationHistory.whatsappPhoneNumber, phoneNumber)))
      .limit(5);

    const historyContext = history.map(h =>
      `Cliente: ${h.userMessage}\nAtendente: ${h.aiResponse}`
    ).join("\n---\n");

    // Gerar resposta via LLM
    const systemPrompt = config.systemPrompt ??
      "Você é um assistente de vendas da Feminnita Pijamas. Seja cordial, objetivo e profissional. Responda em português.";

    const result = await invokeLLM({
      messages: [
        { role: "system", content: systemPrompt + (knowledgeContext ? `\n\nInformações disponíveis:\n${knowledgeContext}` : "") },
        ...(historyContext ? [{ role: "user" as const, content: `Histórico:\n${historyContext}` }, { role: "assistant" as const, content: "Entendido." }] : []),
        { role: "user", content: message },
      ],
    });

    const response = typeof result.choices[0].message.content === "string"
      ? result.choices[0].message.content
      : "";

    // Salvar conversa no histórico
    await db.insert(conversationHistory).values({
      userId,
      whatsappPhoneNumber: phoneNumber,
      whatsappContactName: contactName,
      userMessage: message,
      aiResponse: response,
      confidence: "0.85",
      escalated: false,
      status: "open",
    });

    return response;
  } catch (err) {
    console.error("[WhatsAppAI] Erro ao processar mensagem:", err);
    return null;
  }
}
