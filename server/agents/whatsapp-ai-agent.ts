import { getDb } from "../db";
import { aiSettings, conversationHistory } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { selecionarConhecimento } from "./busca-catalogo";
import { buscarProdutosSite } from "./lia-site";
import { interpretarRespostaLia, MENSAGEM_PASSA_HUMANO } from "./lia-saida";

export type RespostaLia = { texto: string; humano: boolean; resumo: string };

// Atende uma mensagem recebida no WhatsApp. Devolve o texto para a cliente e se
// o caso deve ir para uma pessoa (com resumo). null = IA desligada ou erro.
export async function atenderMensagem(
  userId: number,
  phoneNumber: string,
  contactName: string,
  message: string
): Promise<RespostaLia | null> {
  const db = await getDb();
  if (!db) return null;

  try {
    // Buscar configurações de IA
    const settings = await db.select().from(aiSettings)
      .where(and(eq(aiSettings.userId, userId), eq(aiSettings.isEnabled, true)))
      .limit(1);

    if (!settings.length) return null; // IA desabilitada para este usuário

    const config = settings[0];

    // Palavra-chave de escalonamento: vai direto para uma pessoa, sem chamar o modelo.
    const escalationKeywords = config.escalationKeywords ?? [];
    const shouldEscalate = escalationKeywords.some((kw: any) =>
      message.toLowerCase().includes(kw.toLowerCase())
    );
    if (shouldEscalate) {
      return { texto: MENSAGEM_PASSA_HUMANO, humano: true, resumo: "Pediu atendente: " + message.slice(0, 120) };
    }

    // Buscar base de conhecimento relevante PARA ESTA PERGUNTA.
    // Antes era `limit 3` sem ordenacao — as mesmas 3 linhas para toda mensagem.
    // searchResultsLimit passa a valer so para os PRODUTOS: politica e
    // informacao geral entram sempre, sem disputar vaga com o catalogo.
    const knowledge = await selecionarConhecimento(
      db,
      userId,
      message,
      config.searchResultsLimit ?? 4,
    );

    // O link vai junto quando existe: e o que faz ela MANDAR o produto em vez
    // de so descrever. Sem ele o modelo nao tem como citar endereco nenhum.
    const knowledgeContext = knowledge.map((k: any) =>
      `[${k.contentType}] ${k.title}: ${k.description ?? ""}` +
      (k.url ? `\nLink: ${k.url}` : "")
    ).join("\n");

    // Produtos ao vivo do site (preco, promocao vigente, cores, tamanhos, link).
    const produtosSite = message.trim().length >= 3 ? await buscarProdutosSite(message) : "";

    // Histórico recente: as 5 ULTIMAS trocas, em ordem cronologica.
    const history = (await db.select().from(conversationHistory)
      .where(and(eq(conversationHistory.userId, userId), eq(conversationHistory.whatsappPhoneNumber, phoneNumber)))
      .orderBy(desc(conversationHistory.createdAt))
      .limit(5)).reverse();

    const historyContext = history.map((h: any) =>
      `Cliente: ${h.userMessage}\nAtendente: ${h.aiResponse}`
    ).join("\n---\n");

    // Gerar resposta via LLM
    const systemPrompt = config.systemPrompt ??
      "Você é um assistente de vendas da Feminnita Pijamas. Seja cordial, objetivo e profissional. Responda em português.";

    const result = await invokeLLM({
      messages: [
        {
          role: "system",
          content: systemPrompt
            + (knowledgeContext ? `\n\nInformações disponíveis:\n${knowledgeContext}` : "")
            + (produtosSite ? `\n\nPRODUTOS DO SITE (dados ao vivo, use só estes preços e links):\n${produtosSite}` : ""),
        },
        ...(historyContext ? [{ role: "user" as const, content: `Histórico:\n${historyContext}` }, { role: "assistant" as const, content: "Entendido." }] : []),
        { role: "user", content: message },
      ],
    });

    const rawContent = result.choices?.[0]?.message?.content ?? "";
    const resposta = interpretarRespostaLia(typeof rawContent === "string" ? rawContent : "");

    // Salvar conversa no histórico
    await db.insert(conversationHistory).values({
      userId,
      whatsappPhoneNumber: phoneNumber,
      whatsappContactName: contactName,
      userMessage: message,
      aiResponse: resposta.texto,
      confidence: "0.85",
      escalated: resposta.humano,
      status: "open",
    });

    return resposta;
  } catch (err) {
    console.error("[WhatsAppAI] Erro ao processar mensagem:", err);
    return null;
  }
}

// Compatibilidade com o WhatsApp via QR (Baileys): devolve so o texto, e nada
// quando o caso e para uma pessoa (o comportamento de antes).
export async function processWhatsAppMessage(
  userId: number,
  phoneNumber: string,
  contactName: string,
  message: string
): Promise<string | null> {
  const r = await atenderMensagem(userId, phoneNumber, contactName, message);
  return r && !r.humano ? r.texto : null;
}
