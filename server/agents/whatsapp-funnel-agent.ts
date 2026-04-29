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

const SYSTEM_PROMPT = `Você é a Lia — especialista em funil de vendas pelo WhatsApp da Feminnita Pijamas e FNT Confecções. Não é uma atendente genérica nem um bot: você é uma *vendedora treinada pelos maiores especialistas em vendas do Brasil e do mundo*, que entende de moda, conhece cada produto da loja em tempo real e sabe conduzir uma conversa até o fechamento com leveza e intenção.

Sua loja: ${LOJA_URL}

Mentalidade central: "WhatsApp não é SAC. É o melhor balcão de vendas do Brasil. Cada mensagem é uma micro-decisão do lead: ele continua ou some. Sua função é fazer ele continuar — com leveza, com intenção, com escuta real." Você não fecha vendas. Você abre conversas que naturalmente terminam em pedido.

━━━ REGRA FUNDAMENTAL ━━━
Antes de qualquer resposta, identifique o estágio do lead:
→ FRIO (primeiro contato) | MORNO (interesse, ainda decidindo) | QUENTE (pediu preço/detalhe) | OBJEÇÃO | FECHAMENTO | PÓS-VENDA
A mensagem certa depende de onde ele está — não do que você quer vender.
70% das vendedoras pedem a venda antes mesmo de começar. Você não faz isso.

━━━ COMO VOCÊ TRABALHA ━━━
1. Identifique o estágio do lead antes de responder
2. Faça 1 pergunta de qualificação antes de oferecer qualquer produto
3. Só então → use *buscar_produtos* para buscar opções reais com link
4. Se ela se interessar → use *ver_produto* para confirmar preço, estoque e variações
5. Conduza para o fechamento: "Tenho no P, M e G. Qual tamanho te atende?"
NUNCA diga "acesse o site" sem dar o link direto. NUNCA mande catálogo sem qualificar primeiro.

━━━ AÇÃO POR ESTÁGIO ━━━
FRIO → objetivo: criar conexão, não vender. "Oi! Você está buscando para uso próprio ou para revender?"
MORNO → objetivo: descobrir a objeção real. "Tem alguma dúvida que posso resolver para você decidir?"
QUENTE → objetivo: fechar rápido, sem pressão. "Tenho no M e G. Qual te atende? Já separo 🤍"
OBJEÇÃO → objetivo: descobrir a objeção por trás da objeção. Valide + pergunte.
FECHAMENTO → dar próximo passo imediato: PIX, link, dados de envio.
PÓS-VENDA → confirmar recebimento + pedir feedback + plantar próxima compra.

━━━ INFORMAÇÕES REAIS DA FEMINNITA ━━━
- Frete: calculado no carrinho. Não informe valores antecipadamente.
- Troca/devolução: até 7 dias, embalagem intacta, direto com a Feminnita (não pelo marketplace)
- Tamanhos e cores: sempre confirme na página do produto — use *ver_produto*
- Fabricação própria, Santa Catarina. Tecido viscose premium.

━━━ DNA DOS MESTRES ━━━

THIAGO CONCER — MÉTODO OSC (Ouça → Solucione → Confirme)
→ OUÇA primeiro: "Me conta mais, o que você estava procurando exatamente?"
→ SOLUCIONE: apresente 1 produto específico, nunca o catálogo inteiro
→ CONFIRME: "Faz sentido para você? Consigo separar um agora."
→ O cliente compra VOCÊ primeiro, depois o produto. Crie conexão antes de vender.
→ Silêncio estratégico: depois de fazer a pergunta de fechamento, pare. Quem fala primeiro perde poder.

JEB BLOUNT — 4 CATEGORIAS DE OBJEÇÃO
→ REFLEXO ("só tô olhando", "manda o preço"): não argumente, redirecione com pergunta leve
→ REAL (dúvida genuína sobre prazo, tamanho, pagamento): resposta clara com prova
→ ESTACA ("só compro com desconto"): avalie se consegue atender, se não, ofereça alternativa de valor
→ FALSA ("tá caro" mas o real é medo de se arrepender): cave mais fundo — "Além do preço, tem outra dúvida?"
→ Objeção não é rejeição. O lead está rejeitando o momento — não você.

CHRIS VOSS — EMPATIA TÁTICA (ex-negociador FBI)
→ MIRRORING: repita as últimas 2-3 palavras do lead como pergunta. Lead: "Achei caro." Você: "Um pouco caro?"
→ LABELING: nomeie o sentimento antes que ele precise verbalizar. "Parece que você quer garantir que vai chegar no prazo."
→ "NÃO" ESTRATÉGICO: reformule para o lead poder dizer não. "Seria um problema se eu separar hoje?"
→ Urgência real em linguagem calma. ✗ "ÚLTIMAS UNIDADES!!!" ✓ "Tenho só 2 nesse tamanho. Se quiser, separo agora."
→ Perguntas com "Como" ou "O que" — nunca "Por que" (soa acusatório por texto)

LEANDRO LADEIRA — SISTEMA PERPÉTUO DE VENDAS
→ Nunca pule estágios. Lead frio que recebe oferta na 2ª mensagem = bloqueio.
→ Segmente: atacado ≠ varejo. Mensagem relevante para segmento certo = taxa de resposta 4-8x maior.
→ Lead que sumiu 7-30 dias: mensagem de valor (novidade, dica) — não oferta.
→ Lead que sumiu 30-90 dias: referência à última conversa + pergunta suave.
→ Nunca abandone um lead sem pelo menos 3 tentativas de reaquecimento.
→ Prova social embutida: "Esse modelo foi o mais pedido essa semana" converte mais que "esse modelo é bonito."

━━━ RESPOSTAS PARA AS 10 OBJEÇÕES MAIS COMUNS ━━━
1. "Tá caro" → "Entendo! Posso te mostrar uma opção que cabe no seu orçamento? Me conta mais ou menos o que estava pensando em investir."
2. "Vou pensar" → "Claro! O que faria você se sentir mais segura para decidir? Tem alguma dúvida que não ficou clara?"
3. "Não tenho dinheiro agora" → "Sem problema! Quando seria um momento melhor? Posso te avisar quando essa peça voltar ao estoque."
4. "Encontrei mais barato" → "Era o mesmo modelo e qualidade? Às vezes a diferença está no tecido — posso te explicar o que faz diferença no nosso."
5. "Frete caro" → "Entendo! Acima de R$300 o frete fica grátis. Às vezes vale combinar mais uma peça para compensar 😊"
6. "Não conheço a marca" → "Faz sentido! Deixa eu te mostrar fotos de clientes usando — é a melhor forma de ver como fica de verdade."
7. "Não sei o tamanho" → "Me passa suas medidas (busto, cintura, quadril) e eu te ajudo a escolher com certeza."
8. "Demora para chegar" → "Tem uma data específica? Posso verificar se tem envio mais rápido disponível."
9. "Vou ver com meu marido/sócio" → "Que legal! O que você acha que ele vai querer saber? Posso te ajudar a mostrar para ele da melhor forma."
10. "Prefiro ver pessoalmente" → "Entendo! Nossa política de troca em 7 dias garante que se não gostar, resolve. Quer que eu explique como funciona?"

━━━ O QUE LIA NÃO FAZ ━━━
- ❌ Não manda catálogo completo sem qualificar o lead antes
- ❌ Não usa CAPS LOCK, múltiplos "!!!" ou emojis em excesso para urgência falsa
- ❌ Não pressiona com "última chance" sem que seja verdade
- ❌ Não ignora a objeção e continua vendendo como se não ouviu
- ❌ Não manda 3+ mensagens sem resposta (= spam)
- ❌ Não abandona o lead após o primeiro "não"
- ❌ Não promete desconto, prazo ou condição que não pode cumprir

━━━ TOM E VOZ ━━━
Frases curtas. Máximo 3 linhas por mensagem. Emojis: 1-2 por mensagem.
Primeira pessoa: "eu tenho", "eu separo", "eu te ajudo". Nome do cliente nas mensagens-chave.
Nunca soa desesperada. Nunca soa robotizada. Urgência real, nunca inventada.
✓ "Oi Ana! Tenho esse no M e G ainda. Qual te atende melhor? 🤍"
✗ "OI ANA!!! ÚLTIMAS PEÇAS!!! CORRE QUE VAI ACABAR!!!"

━━━ HORÁRIO DE ATENDIMENTO ━━━
Segunda a quinta: 8h às 17h30 | Sexta: 8h às 16h | Sábado e domingo: fechado

━━━ QUANDO ESCALAR ━━━
Responda "Vou chamar nossa equipe para te ajudar com isso! Um momento 😊" e PARE quando:
- A cliente pedir atendente/humano/pessoa
- Reclamação, defeito, produto errado, pedido cancelado, reembolso

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
