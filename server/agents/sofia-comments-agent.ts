/**
 * Sofia Comments Agent — Resposta automática a comentários do Instagram
 *
 * Modelo A: resposta automática com filtro
 * - Elogios/perguntas simples → responde automaticamente (delay humano 2-5 min)
 * - Reclamações → fila de revisão para o dono aprovar
 * - Spam/ofensas → ignora silenciosamente
 */

import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { instagramCommentReplies } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

const META_TOKEN = process.env.META_ACCESS_TOKEN || "";
const META_PAGE_TOKEN = process.env.META_PAGE_ACCESS_TOKEN || META_TOKEN;
const GRAPH_BASE = "https://graph.facebook.com/v20.0";

// ─── Classificação + geração de resposta ─────────────────────────────────────

const SYSTEM_PROMPT = `Você é a Sofia, especialista em atendimento digital da Feminnita Pijamas — marca de atacado de pijamas para revendedoras.

Sua tarefa: analisar mensagens e comentários recebidos no Instagram, Facebook e Messenger da Feminnita e gerar a resposta ideal.

Sobre a Feminnita:
- Vende pijamas no atacado para revendedoras (mínimo geralmente 1 kit)
- Público: mulheres revendedoras no Sul e Sudeste do Brasil
- Tom de voz: caloroso, feminino, próximo — como uma amiga que entende de moda
- Sempre usa emojis com moderação (1-2 por resposta)

Regras de resposta:
- NUNCA prometa preços, prazo de entrega ou disponibilidade de produto específico
- Para dúvidas de preço/catálogo: direcione para www.feminnita.com.br e mencione "Nossa equipe de vendas está pronta para te ajudar 😊"
- Mantenha respostas curtas (1-3 frases máximo)
- Use o nome da pessoa quando possível
- Comece com "Oi [nome]!" quando souber o nome, ou "Oi!" quando não souber

Classifique a mensagem e responda em JSON:
{
  "category": "question" | "compliment" | "complaint" | "spam" | "other",
  "shouldAutoReply": true | false,
  "reply": "texto da resposta (null se não deve responder)"
}

shouldAutoReply = false quando: for reclamação grave, ofensa, ou precisar de informação específica que você não tem.`;

interface ClassificationResult {
  category: "question" | "compliment" | "complaint" | "spam" | "other";
  shouldAutoReply: boolean;
  reply: string | null;
}

export async function classifyAndGenerateReply(
  commentText: string,
  authorName: string
): Promise<ClassificationResult> {
  const result = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: `Comentário de ${authorName || "alguém"}: "${commentText}"` },
    ],
    maxTokens: 300,
  });

  const content = result.choices[0]?.message?.content || "";
  const stripped = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

  try {
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : stripped);
  } catch {
    // Fallback seguro
    return { category: "other", shouldAutoReply: false, reply: null };
  }
}

// ─── Postar resposta a comentário via Meta API ────────────────────────────────

export async function postCommentReply(commentId: string, replyText: string): Promise<void> {
  // Facebook comment IDs contêm underscore (ex: 853058534471901_935354972729215)
  // Instagram comment IDs são numéricos puros
  const isFacebook = commentId.includes("_");
  const token = isFacebook ? META_PAGE_TOKEN : META_TOKEN;

  if (!token) throw new Error("Token Meta não configurado");

  const res = await fetch(`${GRAPH_BASE}/${commentId}/replies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: replyText, access_token: token }),
  });

  const data = await res.json() as any;
  if (data.error) throw new Error(`Meta API: ${data.error.message}`);
}

// ─── Postar resposta via Messenger ────────────────────────────────────────────

export async function postMessengerReply(recipientId: string, replyText: string): Promise<void> {
  if (!META_PAGE_TOKEN) throw new Error("META_PAGE_ACCESS_TOKEN não configurado");

  const res = await fetch(`${GRAPH_BASE}/me/messages?access_token=${META_PAGE_TOKEN}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text: replyText },
      messaging_type: "RESPONSE",
    }),
  });

  const data = await res.json() as any;
  if (data.error) throw new Error(`Messenger API: ${data.error.message}`);
}

// ─── Processador de mensagens do Messenger ────────────────────────────────────

export async function processMessengerMessage(event: {
  senderId: string;
  senderName: string;
  messageText: string;
  messageId: string;
}): Promise<void> {
  if (!event.messageText?.trim()) return;

  console.log(`[SofiaMessenger] Mensagem de ${event.senderName}: "${event.messageText.slice(0, 80)}"`);

  let classification: ClassificationResult;
  try {
    classification = await classifyAndGenerateReply(event.messageText, event.senderName);
  } catch (err: any) {
    console.error("[SofiaMessenger] Erro na classificação:", err.message);
    return;
  }

  if (classification.category === "spam" || !classification.shouldAutoReply || !classification.reply) {
    console.log(`[SofiaMessenger] Mensagem ignorada/fila: categoria=${classification.category}`);
    return;
  }

  // Delay menor no Messenger (15-45s) — usuário espera resposta mais rápida
  const delayMs = (15 + Math.floor(Math.random() * 30)) * 1000;
  console.log(`[SofiaMessenger] Respondendo em ${Math.round(delayMs / 1000)}s`);

  setTimeout(async () => {
    try {
      await postMessengerReply(event.senderId, classification.reply!);
      console.log(`[SofiaMessenger] ✓ Respondido: "${classification.reply}"`);
    } catch (err: any) {
      console.error("[SofiaMessenger] Erro ao responder:", err.message);
    }
  }, delayMs);
}

// ─── Processador principal (chamado pelo webhook) ─────────────────────────────

export async function processInstagramComment(event: {
  commentId: string;
  postId: string;
  authorName: string;
  authorId: string;
  commentText: string;
}): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Evitar duplicatas
  const existing = await db.select({ id: instagramCommentReplies.id })
    .from(instagramCommentReplies)
    .where(eq(instagramCommentReplies.commentId, event.commentId))
    .limit(1);

  if (existing.length > 0) return; // já processado

  // Salva como pending
  await db.insert(instagramCommentReplies).values({
    commentId: event.commentId,
    postId: event.postId,
    authorName: event.authorName,
    authorId: event.authorId,
    commentText: event.commentText,
    status: "pending",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Classifica e gera resposta
  let classification: ClassificationResult;
  try {
    classification = await classifyAndGenerateReply(event.commentText, event.authorName);
  } catch (err: any) {
    console.error("[SofiaComments] Erro na classificação:", err.message);
    await db.update(instagramCommentReplies)
      .set({ status: "queued_review", category: "other", updatedAt: new Date() })
      .where(eq(instagramCommentReplies.commentId, event.commentId));
    return;
  }

  // Spam → ignora
  if (classification.category === "spam") {
    await db.update(instagramCommentReplies)
      .set({ status: "ignored", category: "spam", updatedAt: new Date() })
      .where(eq(instagramCommentReplies.commentId, event.commentId));
    console.log(`[SofiaComments] Spam ignorado: "${event.commentText.slice(0, 50)}"`);
    return;
  }

  // Reclamação ou sem resposta → fila de revisão
  if (!classification.shouldAutoReply || !classification.reply) {
    await db.update(instagramCommentReplies)
      .set({
        status: "queued_review",
        category: classification.category,
        replyText: classification.reply || null,
        updatedAt: new Date(),
      })
      .where(eq(instagramCommentReplies.commentId, event.commentId));
    console.log(`[SofiaComments] Comentário na fila de revisão: "${event.commentText.slice(0, 50)}"`);
    return;
  }

  // Delay humano (2-4 minutos) para não parecer bot
  const delayMs = (120 + Math.floor(Math.random() * 120)) * 1000;
  console.log(`[SofiaComments] Respondendo em ${Math.round(delayMs / 1000)}s: "${event.commentText.slice(0, 50)}"`);

  setTimeout(async () => {
    try {
      await postCommentReply(event.commentId, classification.reply!);
      await db.update(instagramCommentReplies)
        .set({
          status: "auto_replied",
          category: classification.category,
          replyText: classification.reply,
          repliedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(instagramCommentReplies.commentId, event.commentId));
      console.log(`[SofiaComments] ✓ Respondido: "${classification.reply}"`);
    } catch (err: any) {
      await db.update(instagramCommentReplies)
        .set({
          status: "queued_review",
          category: classification.category,
          replyText: classification.reply,
          errorMessage: err.message?.slice(0, 499),
          updatedAt: new Date(),
        })
        .where(eq(instagramCommentReplies.commentId, event.commentId));
      console.error("[SofiaComments] Erro ao responder:", err.message);
    }
  }, delayMs);
}
