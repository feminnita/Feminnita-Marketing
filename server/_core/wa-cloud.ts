import { createHmac, timingSafeEqual } from "crypto";

// WhatsApp oficial (Cloud API da Meta): assinatura, leitura do webhook e envio.
const GRAPH = "https://graph.facebook.com/v21.0";

export type EventoWa =
  | { tipo: "mensagem"; telefone: string; nome: string; texto: string; id: string; phoneNumberId: string }
  | { tipo: "midia"; telefone: string; nome: string; id: string; phoneNumberId: string }
  // Mensagem que a equipe mandou pelo app do celular (coexistencia).
  | { tipo: "eco"; telefone: string };

export function assinaturaValida(rawBody: Buffer, cabecalho: string | undefined, appSecret: string): boolean {
  if (!cabecalho || !cabecalho.startsWith("sha256=")) return false;
  const esperado = Buffer.from("sha256=" + createHmac("sha256", appSecret).update(rawBody).digest("hex"));
  const recebido = Buffer.from(cabecalho);
  return esperado.length === recebido.length && timingSafeEqual(esperado, recebido);
}

export function lerEventos(body: any): EventoWa[] {
  const eventos: EventoWa[] = [];
  for (const entry of body?.entry ?? []) {
    for (const ch of entry?.changes ?? []) {
      const v = ch?.value ?? {};
      if (ch.field === "smb_message_echoes") {
        for (const e of v.message_echoes ?? []) if (e?.to) eventos.push({ tipo: "eco", telefone: String(e.to) });
        continue;
      }
      if (ch.field !== "messages") continue;
      const nome = v.contacts?.[0]?.profile?.name ?? "";
      const phoneNumberId = v.metadata?.phone_number_id ?? "";
      for (const m of v.messages ?? []) {
        const base = { telefone: String(m.from), nome, id: String(m.id), phoneNumberId };
        if (m.type === "text" && m.text?.body) eventos.push({ tipo: "mensagem", texto: m.text.body, ...base });
        else eventos.push({ tipo: "midia", ...base });
      }
    }
  }
  return eventos;
}

export async function enviarTexto(phoneNumberId: string, token: string, para: string, texto: string): Promise<{ ok: boolean; erro?: string }> {
  const r = await fetch(`${GRAPH}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to: para, type: "text", text: { body: texto } }),
  });
  if (r.ok) return { ok: true };
  return { ok: false, erro: `${r.status} ${(await r.text()).slice(0, 300)}` };
}

export async function criarModelo(wabaId: string, token: string, nome: string, texto: string): Promise<{ ok: boolean; id?: string; erro?: string }> {
  const r = await fetch(`${GRAPH}/${wabaId}/message_templates`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: nome, language: "pt_BR", category: "UTILITY", components: [{ type: "BODY", text: texto }] }),
  });
  const j: any = await r.json().catch(() => ({}));
  return r.ok ? { ok: true, id: j.id } : { ok: false, erro: `${r.status} ${JSON.stringify(j).slice(0, 300)}` };
}
