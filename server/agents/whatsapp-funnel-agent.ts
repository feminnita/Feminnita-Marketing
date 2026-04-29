/**
 * Lia — Vendedora WhatsApp da Feminnita Pijamas
 * Acessa a loja em tempo real, busca produtos e links, vence objeções
 * Treinada pelos mestres: Jeb Blount, Jordão Ferreira, Thiago Concer, Zig Ziglar
 */

import Anthropic from "@anthropic-ai/sdk";
import { getDb } from "../db";
import { conversationHistory } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

import { cartContextStore } from "../routers/whatsapp-cart-recovery";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });
const LOJA_URL = process.env.TRAY_STORE_URL || "https://www.feminnita.com.br";

// ─── Horário de funcionamento ─────────────────────────────────────────────────
// Seg-Qui: 08:00–17:30 | Sex: 08:00–16:00 | Sáb-Dom: fechado
// Fuso: America/Sao_Paulo

function isBusinessHours(): boolean {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
  const day  = now.getDay(); // 0=Dom, 1=Seg … 6=Sáb
  const mins = now.getHours() * 60 + now.getMinutes();

  if (day === 0 || day === 6) return false;          // fim de semana
  if (day >= 1 && day <= 4) return mins >= 480 && mins < 1050; // Seg–Qui 08:00–17:30
  if (day === 5)            return mins >= 480 && mins < 960;  // Sex 08:00–16:00
  return false;
}

function outOfHoursMessage(contactName: string): string {
  const name = contactName ? `, ${contactName.split(" ")[0]}` : "";
  return (
    `Olá${name}! 😊 Obrigada pelo contato com a Feminnita Pijamas.\n\n` +
    `No momento estamos fora do horário de atendimento. Nosso expediente é:\n` +
    `📅 Segunda a quinta: 8h às 17h30\n` +
    `📅 Sexta-feira: 8h às 16h\n` +
    `🚫 Sábados e domingos: não trabalhamos\n\n` +
    `Sua mensagem foi registrada e nossa equipe retorna assim que reabrir! ` +
    `Se preferir, você também pode ver nossos produtos a qualquer hora em ${LOJA_URL} 🛍️`
  );
}

// ─── Alerta interno ───────────────────────────────────────────────────────────

async function notifyTeamEscalation(
  from: string,
  contactName: string,
  message: string
): Promise<void> {
  const internalNumber = process.env.WHATSAPP_INTERNAL_NUMBER;
  const token          = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId  = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!internalNumber || !token || !phoneNumberId) return;

  const name    = contactName || from;
  const preview = message.slice(0, 120);
  const alert   =
    `🔔 *Atendimento solicitado*\n\n` +
    `👤 Cliente: ${name}\n` +
    `📱 Número: +${from}\n` +
    `💬 Mensagem: "${preview}"\n\n` +
    `Acesse o WhatsApp para continuar o atendimento.`;

  await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: internalNumber,
      type: "text",
      text: { body: alert },
    }),
  }).catch(e => console.warn("[WA Lia] Falha ao notificar equipe:", e.message));
}

// ─── Acesso à loja Tray ───────────────────────────────────────────────────────

async function fetchTrayPage(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; FeminnitaBot/1.0)" },
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return `[HTTP ${res.status}]`;
    const html = await res.text();

    // Extrai title, preço, descrição, variações e URL canônica
    const title   = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || "";
    const h1      = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, "").trim() || "";
    const prices  = [...html.matchAll(/R\$\s*[\d.,]+/g)].map(m => m[0]).slice(0, 4);
    const canonical = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] || url;

    // Extrai nomes e links de produtos (listagem de busca)
    const productLinks: string[] = [];
    const linkRe = /href=["'](https?:\/\/www\.feminnita\.com\.br\/[^"'?#]+)["'][^>]*>/gi;
    let m;
    while ((m = linkRe.exec(html)) !== null) {
      const l = m[1];
      if (!productLinks.includes(l) && !l.includes("/busca") && l.split("/").length >= 4) {
        productLinks.push(l);
      }
    }

    // Texto limpo (sem scripts/styles)
    const text = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 2500);

    return [
      `URL: ${canonical}`,
      title   ? `TÍTULO: ${title}` : "",
      h1      ? `H1: ${h1}` : "",
      prices.length ? `PREÇOS: ${prices.join(" | ")}` : "",
      productLinks.length ? `LINKS DE PRODUTOS:\n${productLinks.slice(0, 12).join("\n")}` : "",
      `CONTEÚDO: ${text}`,
    ].filter(Boolean).join("\n");
  } catch (e: any) {
    return `[Erro ao acessar ${url}: ${e.message}]`;
  }
}

async function searchTrayProducts(query: string): Promise<string> {
  const searchUrl = `${LOJA_URL}/busca?q=${encodeURIComponent(query)}`;
  return fetchTrayPage(searchUrl);
}

// ─── Tools da Lia ─────────────────────────────────────────────────────────────

const LIA_TOOLS: Anthropic.Tool[] = [
  {
    name: "buscar_produtos",
    description: "Busca produtos na loja Feminnita com base em uma descrição ou palavra-chave. Retorna lista de produtos com links e preços. Use SEMPRE que a cliente perguntar sobre um tipo de produto para poder oferecer opções reais.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Termo de busca (ex: 'pijama viscose', 'pijama plus size longo', 'babydoll')" },
      },
      required: ["query"],
    },
  },
  {
    name: "ver_produto",
    description: "Acessa a página de um produto específico para ver preço atual, variações, cores disponíveis e estoque. Use quando a cliente se interessar por um produto específico.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: { type: "string", description: "URL completa do produto na loja Feminnita" },
      },
      required: ["url"],
    },
  },
];

// ─── Escalação ────────────────────────────────────────────────────────────────

const ESCALATION_TRIGGERS = [
  "falar com atendente", "falar com alguém", "falar com humano", "falar com uma pessoa",
  "falar com vocês", "quero atendente", "atendimento humano", "falar com um mano",
  "quero falar com", "me chama", "me passa para", "reclamação", "produto com defeito",
  "produto danificado", "chegou errado", "chegou quebrado", "pedido cancelado",
  "cancelar pedido", "reembolso", "devolução do dinheiro",
];

function needsEscalation(message: string): boolean {
  const lower = message.toLowerCase();
  return ESCALATION_TRIGGERS.some(t => lower.includes(t));
}

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é a Lia — vendedora da Feminnita Pijamas no WhatsApp. Não é uma atendente genérica: você é uma *vendedora treinada*, que entende de moda, conhece cada produto da loja e sabe conduzir uma conversa até o fechamento.

Sua loja: ${LOJA_URL}

━━━ SUA MISSÃO ━━━
Transformar cada contato em venda. Não apenas tirar dúvidas — *vender*. Você busca os produtos em tempo real na loja, apresenta opções concretas com link direto, e conduz a cliente até o carrinho.

━━━ TOM DE VOZ ━━━
Equilibrado: próximo sem ser informal demais, profissional sem ser frio. Pense numa consultora de moda de uma boutique bem atendida. Use emojis com moderação — um ou dois por mensagem, nunca excessivo. Respostas curtas e diretas — máximo 3 parágrafos.

━━━ COMO VOCÊ TRABALHA ━━━
1. Quando a cliente perguntar sobre um produto → use *buscar_produtos* imediatamente
2. Apresente 1 a 3 opções com o link direto — nunca diga "acesse o site" sem dar o link
3. Se ela se interessar por um → use *ver_produto* para confirmar preço e disponibilidade
4. Conduza para o fechamento: "Quer que eu te mande o link direto para já garantir o seu?"

━━━ INFORMAÇÕES REAIS ━━━
- Frete: calculado no carrinho (depende do peso + valor + seguro de transporte). Não informe valores antecipadamente.
- Troca/devolução: até 7 dias após recebimento, embalagem intacta, direto com a Feminnita (não pelo marketplace)
- Tamanhos: variam por produto — confirme sempre na página do produto
- Cores: verificar disponibilidade em tempo real na página do produto

━━━ MENTALIDADE DE VENDAS (os mestres) ━━━

JEB BLOUNT — Rapport e urgência:
→ Crie conexão antes de vender. Pergunte o contexto: "É presente? É pra você?"
→ Urgência real: estoque limitado, lançamento, promoção pontual
→ "Toda objeção é um pedido por mais informação"

ZIG ZIGLAR — As 5 objeções reais:
→ Sem necessidade → faça ela imaginar usando: "Imagina você acordando num pijama assim no frio de manhã..."
→ Sem dinheiro → mostre valor, não desconto: compare com qualidade, conforto, durabilidade
→ Sem pressa → crie urgência: "Esse modelo saiu bastante essa semana, não posso garantir o estoque"
→ Sem desejo → conecte ao benefício emocional: conforto, autoestima, presente especial
→ Sem confiança → prova social: "É nossa peça mais vendida, as clientes adoram o caimento"

JORDÃO FERREIRA — "A venda começa quando o cliente diz não":
→ Nunca aceite o "vou pensar" como final: "Claro! O que você ainda precisa saber pra decidir?"
→ Reforce o valor antes de qualquer concessão de preço

THIAGO CONCER — Técnica IEV:
→ Identificar: o que ela realmente quer? (modelo, tamanho, ocasião, presente?)
→ Explorar: "Você prefere manga longa ou curta? Tem alguma cor favorita?"
→ Validar: "Então o [produto] parece perfeito pra você — quer ver?"

━━━ OBJEÇÕES COMUNS ━━━
"Tá caro" → "Entendo! Mas olha: é viscose premium, lava fácil, não amassa. Comparado com o que vende em loja de shopping pela metade da qualidade, esse preço faz sentido 😊 Quer ver as opções de kit que saem mais em conta por peça?"
"Vou pensar" → "Claro, sem pressão! O que ficou em dúvida? Tamanho? Cor? Posso te ajudar a decidir agora mesmo"
"Não conheço a marca" → "É normal! A Feminnita é fabricação própria, aqui em Santa Catarina. O que mais aparece no feedback das clientes é o caimento e o tecido — sente diferença na hora de usar"
"Tem desconto?" → "Desconto pontual eu não tenho agora, mas temos kit com [X] peças que sai mais em conta por unidade — quer que eu busque pra você?"

━━━ HORÁRIO DE ATENDIMENTO ━━━
Segunda a quinta: 8h às 17h30 | Sexta: 8h às 16h | Sábado e domingo: fechado
Se a cliente perguntar sobre horário ou quando pode ser atendida por uma pessoa, informe esses horários.

━━━ QUANDO ESCALAR ━━━
Responda "Vou chamar nossa equipe para te ajudar com isso! Um momento 😊" e PARE quando:
- A cliente pedir para falar com atendente/humano/pessoa
- Reclamação, defeito, produto errado, pedido cancelado, reembolso
- Qualquer situação que você não consiga resolver

━━━ REGRAS ABSOLUTAS ━━━
- NUNCA invente preço, cor ou disponibilidade — busque na loja antes de afirmar
- NUNCA diga "acesse o site" sem dar o link direto do produto
- NUNCA prometa desconto sem autorização
- Se não souber → "Deixa eu verificar aqui pra você" e busque com a ferramenta`;

// ─── Agente principal ─────────────────────────────────────────────────────────

export async function runWhatsAppFunnelAgent(
  phoneNumber: string,
  contactName: string,
  incomingMessage: string,
  userId = 1
): Promise<string> {
  const db = await getDb();

  // Fora do horário de funcionamento
  if (!isBusinessHours()) {
    const msg = outOfHoursMessage(contactName);
    if (db) {
      await db.insert(conversationHistory).values({
        userId,
        whatsappPhoneNumber: phoneNumber,
        whatsappContactName: contactName || null,
        userMessage: incomingMessage,
        aiResponse: msg,
        confidence: "1.00",
        escalated: false,
        status: "out_of_hours",
      } as any).catch(() => null);
    }
    console.log(`[WA Lia] Fora do expediente — ${phoneNumber}`);
    return msg;
  }

  // Escalação imediata — notifica equipe e encerra
  if (needsEscalation(incomingMessage)) {
    const msg = "Vou chamar nossa equipe para te ajudar com isso! Um momento 😊";
    if (db) {
      await db.insert(conversationHistory).values({
        userId,
        whatsappPhoneNumber: phoneNumber,
        whatsappContactName: contactName || null,
        userMessage: incomingMessage,
        aiResponse: msg,
        confidence: "1.00",
        escalated: true,
        status: "escalated",
      } as any).catch(() => null);
    }
    // Dispara alerta no WhatsApp interno
    notifyTeamEscalation(phoneNumber, contactName, incomingMessage);
    console.log(`[WA Lia] Escalação: ${phoneNumber} — "${incomingMessage.slice(0, 60)}"`);
    return msg;
  }

  // Histórico recente (últimas 8 trocas)
  const history = db
    ? await db
        .select()
        .from(conversationHistory)
        .where(and(
          eq(conversationHistory.userId, userId),
          eq(conversationHistory.whatsappPhoneNumber, phoneNumber),
        ))
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

  const nameCtx = contactName ? `\nCliente atual: ${contactName}` : "";

  // Injeta contexto do carrinho abandonado se a cliente está em recuperação
  const cartCtx = cartContextStore.get(phoneNumber);
  const cartNote = cartCtx
    ? `\n\n━━━ CONTEXTO: CARRINHO ABANDONADO ━━━\n` +
      `Esta cliente estava recuperando um carrinho. Use isso para retomar a conversa de forma natural.\n` +
      `Itens no carrinho:\n${cartCtx.items.map(i => `• ${i.name}${i.price ? ` — ${i.price}` : ""}${i.url ? ` (${i.url})` : ""}`).join("\n")}\n` +
      `Valor total: R$${cartCtx.cartValue.toFixed(2)}\n` +
      `Segmento: ${cartCtx.isB2B ? "B2B (atacado)" : "B2C (varejo)"}\n` +
      (cartCtx.cartUrl ? `Link do carrinho: ${cartCtx.cartUrl}\n` : "") +
      `Abordagem: mencione os produtos do carrinho dela, ofereça ajuda para finalizar, use técnica de urgência (estoque limitado).`
    : "";

  // Agentic loop — Lia pode usar ferramentas antes de responder
  const fullSystem = SYSTEM_PROMPT + nameCtx + cartNote;

  let response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 700,
    system: fullSystem,
    tools: LIA_TOOLS,
    messages,
  });

  while (response.stop_reason === "tool_use") {
    const assistantContent = response.content;
    const toolUses = assistantContent.filter((b): b is Anthropic.ToolUseBlock => b.type === "tool_use");

    const toolResults: Anthropic.ToolResultBlockParam[] = [];
    for (const toolUse of toolUses) {
      let result: string;
      try {
        const inp = toolUse.input as Record<string, string>;
        if (toolUse.name === "buscar_produtos") {
          console.log(`[WA Lia] buscando: "${inp.query}"`);
          result = await searchTrayProducts(inp.query);
        } else if (toolUse.name === "ver_produto") {
          console.log(`[WA Lia] acessando produto: ${inp.url}`);
          result = await fetchTrayPage(inp.url);
        } else {
          result = `Ferramenta desconhecida: ${toolUse.name}`;
        }
      } catch (e: any) {
        result = `Erro: ${e.message}`;
      }
      toolResults.push({ type: "tool_result", tool_use_id: toolUse.id, content: result });
    }

    messages.push({ role: "assistant", content: assistantContent });
    messages.push({ role: "user", content: toolResults });

    response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 700,
      system: fullSystem,
      tools: LIA_TOOLS,
      messages,
    });
  }

  const reply =
    response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("") || "Olá! Sou a Lia da Feminnita 😊 Como posso ajudar?";

  // Salvar histórico
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
