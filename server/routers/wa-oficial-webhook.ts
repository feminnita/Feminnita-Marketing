import type { Express, Request, Response } from "express";
import { timingSafeEqual } from "crypto";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { waOficialConfig } from "../../drizzle/schema";
import { assinaturaValida, lerEventos, enviarTexto } from "../_core/wa-cloud";
import { estaPausado, pausar, liberarPausa } from "../_core/wa-pausas";
import { notificarCaso } from "../_core/painel-atendimento";
import { atenderMensagem } from "../agents/whatsapp-ai-agent";

// WhatsApp OFICIAL (Cloud API, coexistencia com o app do celular) -> Lia.
// So responde quem escreveu (nunca inicia conversa). Em WA_MODO=teste, so os
// numeros de WA_TESTE_NUMEROS sao atendidos.
const USER_ID = 1;
const PEDE_TEXTO = "Oi! Por aqui eu só consigo ler mensagens escritas. Pode me mandar por texto? 💛";
const HORAS_ECO = 2; // equipe respondeu pelo celular: Lia fica fora so desta conversa por 2h
const HORAS_CASO = 24 * 30; // caso passado: fora desta conversa ate o "Atendido" do painel

async function config() {
  const db = await getDb();
  if (!db) return undefined;
  const [c] = await db.select().from(waOficialConfig).where(eq(waOficialConfig.userId, USER_ID)).limit(1);
  return c;
}

function liberadoNoModoTeste(telefone: string): boolean {
  if ((process.env.WA_MODO || "teste") === "producao") return true;
  const lista = (process.env.WA_TESTE_NUMEROS || "").split(",").map((s) => s.trim()).filter(Boolean);
  return lista.includes(telefone);
}

function segredoPainelOk(recebido: string | undefined): boolean {
  const segredo = process.env.PAINEL_ATENDIMENTO_SECRET;
  if (!segredo || !recebido) return false;
  const a = Buffer.from(segredo), b = Buffer.from(recebido);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function registerWaOficialWebhook(app: Express) {
  app.get("/api/webhooks/whatsapp-oficial", async (req: Request, res: Response) => {
    const c = await config();
    if (req.query["hub.mode"] === "subscribe" && c?.verifyToken && req.query["hub.verify_token"] === c.verifyToken) {
      return res.status(200).send(String(req.query["hub.challenge"]));
    }
    return res.sendStatus(403);
  });

  app.post("/api/webhooks/whatsapp-oficial", async (req: any, res: Response) => {
    const c = await config();
    if (!c?.appSecret || !req.rawBody || !assinaturaValida(req.rawBody, req.header("x-hub-signature-256"), c.appSecret)) {
      return res.sendStatus(401);
    }
    res.sendStatus(200); // responde ja: a Meta reenvia se demorar
    if (!c.ativo || !c.phoneNumberId || !c.accessToken) return;
    for (const ev of lerEventos(req.body)) {
      try {
        if (ev.tipo === "eco") { await pausar(ev.telefone, HORAS_ECO, "eco_humano"); continue; }
        if (!liberadoNoModoTeste(ev.telefone)) continue;
        if (await estaPausado(ev.telefone)) continue;
        if (ev.tipo === "midia") { await enviarTexto(c.phoneNumberId, c.accessToken, ev.telefone, PEDE_TEXTO); continue; }
        const r = await atenderMensagem(USER_ID, ev.telefone, ev.nome, ev.texto);
        if (!r) continue;
        const env = await enviarTexto(c.phoneNumberId, c.accessToken, ev.telefone, r.texto);
        if (!env.ok) console.error("[wa-oficial] envio falhou", env.erro);
        if (r.humano) {
          await pausar(ev.telefone, HORAS_CASO, "passou_humano");
          await notificarCaso({ telefone: ev.telefone, nome: ev.nome, resumo: r.resumo, ultimaMensagem: ev.texto });
        }
      } catch (e: any) {
        console.error("[wa-oficial] erro ao tratar evento", ev.tipo, e.message);
      }
    }
  });

  // O painel chama aqui quando a equipe clica "Atendido": a Lia volta a poder responder esta cliente.
  app.post("/api/atendimento/liberar", async (req: Request, res: Response) => {
    if (!segredoPainelOk(req.header("x-atendimento-secret"))) return res.sendStatus(401);
    const tel = String(req.body?.telefone ?? "");
    if (!/^\d{10,15}$/.test(tel)) return res.status(400).json({ erro: "telefone invalido" });
    await liberarPausa(tel);
    return res.json({ ok: true });
  });
}
