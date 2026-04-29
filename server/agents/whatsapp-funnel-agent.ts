/**
 * Agente de Funil de Vendas WhatsApp — Feminnita Pijamas
 * Atende clientes via WhatsApp Business API com Claude
 */

import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "../db";
import { conversationHistory } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

const LOJA_URL = process.env.FEMINNITA_LOJA_URL || "https://feminnita.com.br";

const SYSTEM_PROMPT = `Você é a Lia — atendente virtual da Feminnita Pijamas. Seu papel é ajudar clientes com dúvidas sobre produtos, pedidos e políticas da marca, com um tom equilibrado: próximo mas profissional, nunca informal demais nem frio demais. Use emojis com moderação.

SOBRE A FEMINNITA:
- Marca própria de pijamas femininos, fabricação própria
- Vende pelo site (Tray) e marketplaces
- Catálogo amplo com muitas variações — cada produto pode ter dezenas de opções de cor, tamanho e modelo

CATÁLOGO E PRODUTOS:
- NÃO tente listar ou descrever produtos específicos — o catálogo é extenso e muda constantemente
- Sempre direcione a cliente para ver os produtos diretamente no site: ${LOJA_URL}
- Cores e disponibilidade variam por produto e não podem ser garantidas sem verificar no site
- Se a cliente pedir uma cor ou modelo específico, oriente a acessar o site e verificar o estoque em tempo real

FRETE:
- O frete é calculado automaticamente no carrinho, com base no peso e valor do pedido
- Há um seguro de transporte incluído calculado sobre o valor da compra
- Não é possível informar o valor do frete antecipadamente — a cliente deve finalizar o carrinho para ver o valor exato

TROCA E DEVOLUÇÃO:
- Prazo: até 7 dias após o recebimento do produto
- Não são aceitas trocas ou devoluções com embalagem violada no recebimento
- O processo é feito DIRETAMENTE com a Feminnita — não pelo marketplace
- Para iniciar uma troca, a cliente deve entrar em contato com nossa equipe

SITUAÇÕES QUE VOCÊ DEVE ESCALAR (transferir para atendimento humano):
- Reclamações de qualquer tipo
- Pedido cancelado
- Produto com defeito
- Qualquer mensagem que mencione "falar com atendente", "falar com alguém", "falar com humano", "quero falar com uma pessoa", ou similar

REGRAS OBRIGATÓRIAS:
1. Nunca invente preços, cores, disponibilidade ou prazos — redirecione ao site
2. Respostas curtas e diretas — máximo 3 parágrafos
3. Quando não souber algo, diga "vou verificar com nossa equipe" e escale
4. Use *negrito* só para informações importantes
5. Ao escalar, diga: "Vou chamar nossa equipe para te ajudar com isso! Um momento 😊"
6. Nunca mencione concorrentes ou compare com outros marketplaces`;

const ESCALATION_TRIGGERS = [
  "falar com atendente", "falar com alguém", "falar com humano", "falar com uma pessoa",
  "falar com vocês", "quero atendente", "atendimento humano", "reclamação", "produto com defeito",
  "produto danificado", "chegou errado", "pedido cancelado", "cancelar pedido",
  "falar com um mano", "quero falar", "me chama",
];

function needsEscalation(message: string): boolean {
  const lower = message.toLowerCase();
  return ESCALATION_TRIGGERS.some(t => lower.includes(t));
}

export async function runWhatsAppFunnelAgent(
  phoneNumber: string,
  contactName: string,
  incomingMessage: string,
  userId = 1
): Promise<string> {
  const db = await getDb();

  // Histórico recente da conversa (últimas 8 trocas)
  const history = db
    ? await db
        .select()
        .from(conversationHistory)
        .where(
          and(
            eq(conversationHistory.userId, userId),
            eq(conversationHistory.whatsappPhoneNumber, phoneNumber)
          )
        )
        .orderBy(desc(conversationHistory.id))
        .limit(8)
    : [];

  const messages: Anthropic.MessageParam[] = history
    .reverse()
    .flatMap((h: any) => [
      { role: "user" as const, content: h.userMessage },
      ...(h.aiResponse ? [{ role: "assistant" as const, content: h.aiResponse }] : []),
    ]);

  // Verifica escalação antes de chamar o Claude
  if (needsEscalation(incomingMessage)) {
    const escalationMsg = "Vou chamar nossa equipe para te ajudar com isso! Um momento 😊";
    if (db) {
      await db.insert(conversationHistory).values({
        userId,
        whatsappPhoneNumber: phoneNumber,
        whatsappContactName: contactName || null,
        userMessage: incomingMessage,
        aiResponse: escalationMsg,
        confidence: "1.00",
        escalated: true,
        status: "escalated",
      } as any).catch(() => null);
    }
    console.log(`[WA Lia] Escalação para ${phoneNumber}: "${incomingMessage.slice(0, 60)}"`);
    return escalationMsg;
  }

  messages.push({ role: "user", content: incomingMessage });

  const nameCtx = contactName ? `\nCliente: ${contactName}` : "";

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    system: SYSTEM_PROMPT + nameCtx,
    messages,
  });

  const reply =
    response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("") || "Olá! Sou a Lia da Feminnita 😊 Como posso ajudar?";

  // Salvar no histórico
  if (db) {
    await db.insert(conversationHistory).values({
      userId,
      whatsappPhoneNumber: phoneNumber,
      whatsappContactName: contactName || null,
      userMessage: incomingMessage,
      aiResponse: reply,
      confidence: "0.90",
      escalated: false,
      status: "open",
    } as any).catch(() => null);
  }

  return reply;
}
