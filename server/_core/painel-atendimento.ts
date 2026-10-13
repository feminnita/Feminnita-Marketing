// Avisa o painel administrativo que uma cliente esta esperando uma pessoa.
// O painel guarda o caso e mostra na tela "Atendimento" (com som). Quando o caso
// e NOVO (painel responde 201), o alerta vai tambem para o Telegram da equipe
// (@feminnita_alerta_bot; WhatsApp nao entrega alerta fora da janela de 24h).
export type CasoAtendimento = { telefone: string; nome: string; resumo: string; ultimaMensagem: string };

export async function alertarTelegram(texto: string): Promise<boolean> {
  const token = process.env.TELEGRAM_ALERTA_TOKEN;
  const chat = process.env.TELEGRAM_ALERTA_CHAT_ID;
  if (!token || !chat) return false;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text: texto }),
    });
    const j: any = await r.json().catch(() => ({}));
    return j.ok === true;
  } catch {
    return false;
  }
}

export async function notificarCaso(caso: CasoAtendimento): Promise<boolean> {
  const url = process.env.PAINEL_ATENDIMENTO_URL;
  const segredo = process.env.PAINEL_ATENDIMENTO_SECRET;
  let novo = true;
  let ok = false;
  if (!url || !segredo) {
    console.error("[atendimento] PAINEL_ATENDIMENTO_URL/SECRET ausentes");
  } else {
    try {
      const r = await fetch(`${url}/api/atendimento/casos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-atendimento-secret": segredo },
        body: JSON.stringify({ ...caso, origem: "whatsapp-oficial" }),
      });
      ok = r.ok;
      novo = r.status !== 200; // 200 = caso ja aberto para esta cliente; 201 = novo
      if (!r.ok) console.error("[atendimento] painel respondeu", r.status);
    } catch (e: any) {
      console.error("[atendimento] falha ao avisar painel:", e.message);
    }
  }
  // Alerta mesmo se o painel falhar: a equipe nao pode deixar de saber.
  if (novo) {
    await alertarTelegram(`🔔 Cliente aguardando atendimento\n${caso.nome || "Sem nome"} (${caso.telefone})\n${caso.resumo}\nhttps://wa.me/${caso.telefone}`);
  }
  return ok;
}
