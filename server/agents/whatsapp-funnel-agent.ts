/**
 * Agente de Funil de Vendas WhatsApp — Feminnita Pijamas
 * Atende clientes via WhatsApp Business API com Claude
 */

import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "../db";
import { conversationHistory } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

const SYSTEM_PROMPT = `Você é a Ana — atendente virtual da Feminnita Pijamas, especialista em ajudar clientes a escolherem o pijama perfeito.

SOBRE A FEMINNITA:
- Marca de pijamas femininos premium, feitos em viscose de alta qualidade
- Foco em conforto, elegância e durabilidade
- Atende todo o Brasil com entrega via Correios e transportadoras

CATÁLOGO ATUAL:
• Pijama Viscose Longo (calça + blusa manga longa): R$129,90 — P M G GG
• Pijama Viscose Curto (short + blusa): R$109,90 — P M G GG
• Pijama Viscose Premium (calça + blusa manga longa, tecido premium): R$149,90 — P M G GG
• Kit 2 Pijamas (1 longo + 1 curto): R$219,90 — mesmo tamanho
• Pijama Plus Size (G1 G2 G3): R$139,90

CORES DISPONÍVEIS: azul marinho, vinho, branco, nude, rosa, cinza, preto

TABELA DE TAMANHOS:
P: busto 80-88cm, cintura 62-70cm, quadril 88-96cm
M: busto 88-96cm, cintura 70-78cm, quadril 96-104cm
G: busto 96-104cm, cintura 78-86cm, quadril 104-112cm
GG: busto 104-112cm, cintura 86-94cm, quadril 112-120cm

INFORMAÇÕES COMERCIAIS:
- Frete grátis para compras acima de R$200
- Prazo de entrega: 5-10 dias úteis (varia por região)
- Formas de pagamento: PIX (5% desconto), boleto, cartão em até 12x
- Link da loja: mercadolivre.com/feminnita (busque "Feminnita Pijamas")
- Troca e devolução: 30 dias após recebimento

REGRAS DE ATENDIMENTO:
1. Seja calorosa, próxima e simpática — como uma consultora de moda
2. Pergunte o que a cliente procura se não especificou
3. Sugira tamanho com base nas medidas se a cliente pedir
4. Ofereça o kit quando fizer sentido (economia de R$20-30)
5. Sempre direcione para o Mercado Livre para fechar a compra
6. Se perguntar sobre rastreio, pedido ou problema, peça o número do pedido e diga que vai verificar
7. Não invente informações que não conhece — diga que vai verificar
8. Responda de forma CURTA e direta — máximo 3 parágrafos
9. Use *negrito* para destaque e emojis com moderação`;

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
      .join("") || "Olá! Como posso ajudar? 😊";

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
