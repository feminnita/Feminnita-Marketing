// Avisa o painel administrativo que uma cliente esta esperando uma pessoa.
// O painel guarda o caso, mostra na tela "Atendimento" (com som) e manda no Telegram.
export type CasoAtendimento = { telefone: string; nome: string; resumo: string; ultimaMensagem: string };

export async function notificarCaso(caso: CasoAtendimento): Promise<boolean> {
  const url = process.env.PAINEL_ATENDIMENTO_URL;
  const segredo = process.env.PAINEL_ATENDIMENTO_SECRET;
  if (!url || !segredo) { console.error("[atendimento] PAINEL_ATENDIMENTO_URL/SECRET ausentes"); return false; }
  try {
    const r = await fetch(`${url}/api/atendimento/casos`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-atendimento-secret": segredo },
      body: JSON.stringify({ ...caso, origem: "whatsapp-oficial" }),
    });
    if (!r.ok) console.error("[atendimento] painel respondeu", r.status);
    return r.ok;
  } catch (e: any) {
    console.error("[atendimento] falha ao avisar painel:", e.message);
    return false;
  }
}
