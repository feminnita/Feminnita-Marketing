// Le a resposta do modelo. Quando a Lia decide chamar uma pessoa, ela comeca com
// "[[HUMANO]] <resumo em uma linha>", quebra a linha e escreve a mensagem da cliente.
// Asteriscos de markdown saem: no WhatsApp eles aparecem literais.
const PADRAO_HUMANO = "Vou chamar uma pessoa da nossa equipe, ela já te responde aqui mesmo 💛";

export function interpretarRespostaLia(bruto: string): { texto: string; humano: boolean; resumo: string } {
  const limpo = (bruto ?? "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\*(.+?)\*/g, "$1").trim();
  const m = limpo.match(/^\[\[HUMANO\]\]\s*(.*?)(?:\n+([\s\S]*))?$/);
  if (!m) return { texto: limpo, humano: false, resumo: "" };
  const resumo = (m[1] ?? "").trim();
  const texto = (m[2] ?? "").trim() || PADRAO_HUMANO;
  return { texto, humano: true, resumo };
}

export const MENSAGEM_PASSA_HUMANO = PADRAO_HUMANO;
