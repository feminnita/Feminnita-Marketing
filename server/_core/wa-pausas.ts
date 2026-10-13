import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { waPausas } from "../../drizzle/schema";

// Pausa da Lia POR CONVERSA. As outras clientes continuam sendo atendidas.
// - passou_humano: a Lia passou o caso; fica fora ate a equipe clicar "Atendido" (liberarPausa).
// - eco_humano: a equipe respondeu pelo celular; fica fora por 2h, renovadas a cada resposta.

export async function estaPausado(telefone: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const [p] = await db.select().from(waPausas).where(eq(waPausas.telefone, telefone)).limit(1);
  return !!p && new Date(p.pausadoAte) > new Date();
}

export async function pausar(telefone: string, horas: number, motivo: "eco_humano" | "passou_humano"): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const ate = new Date(Date.now() + horas * 3600_000);
  // Eco da equipe nao encurta uma pausa de caso passado (que vai ate o "Atendido").
  if (motivo === "eco_humano") {
    const [p] = await db.select().from(waPausas).where(eq(waPausas.telefone, telefone)).limit(1);
    if (p && p.motivo === "passou_humano" && new Date(p.pausadoAte) > ate) return;
  }
  await db.insert(waPausas).values({ telefone, pausadoAte: ate, motivo })
    .onDuplicateKeyUpdate({ set: { pausadoAte: ate, motivo } });
}

// Chamado quando a equipe clica "Atendido" no painel: a Lia volta a poder responder esta cliente.
export async function liberarPausa(telefone: string): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(waPausas).where(eq(waPausas.telefone, telefone));
}
