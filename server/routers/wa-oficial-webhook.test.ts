import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from "vitest";
import express from "express";
import type { Server } from "http";
import { createHmac } from "crypto";

const cfg = { userId: 1, phoneNumberId: "PN1", accessToken: "tok", appSecret: "app-secret", verifyToken: "vt", wabaId: "W1", ativo: true };

vi.mock("../db", () => ({
  getDb: vi.fn(async () => ({
    select: () => ({ from: () => ({ where: () => ({ limit: async () => [cfg] }) }) }),
  })),
}));
vi.mock("../_core/wa-pausas", () => ({ estaPausado: vi.fn(async () => false), pausar: vi.fn(async () => {}), liberarPausa: vi.fn(async () => {}) }));
vi.mock("../_core/painel-atendimento", () => ({ notificarCaso: vi.fn(async () => true) }));
vi.mock("../agents/whatsapp-ai-agent", () => ({ atenderMensagem: vi.fn() }));
vi.mock("../_core/wa-cloud", async (orig) => ({ ...(await orig<any>()), enviarTexto: vi.fn(async () => ({ ok: true })) }));

import { registerWaOficialWebhook } from "./wa-oficial-webhook";
import { pausar, liberarPausa, estaPausado } from "../_core/wa-pausas";
import { notificarCaso } from "../_core/painel-atendimento";
import { atenderMensagem } from "../agents/whatsapp-ai-agent";
import { enviarTexto } from "../_core/wa-cloud";

let server: Server;
let base = "";
beforeAll(async () => {
  const app = express();
  app.use(express.json({ verify: (req: any, _res, buf) => { req.rawBody = buf; } }));
  registerWaOficialWebhook(app);
  await new Promise<void>((ok) => { server = app.listen(0, () => ok()); });
  base = `http://127.0.0.1:${(server.address() as any).port}`;
});
afterAll(() => server.close());
beforeEach(() => {
  vi.clearAllMocks();
  process.env.WA_MODO = "teste";
  process.env.WA_TESTE_NUMEROS = "5522999990000";
  process.env.PAINEL_ATENDIMENTO_SECRET = "s1";
});

const msg = (from: string, texto: string) => ({ entry: [{ changes: [{ field: "messages", value: {
  metadata: { phone_number_id: "PN1" }, contacts: [{ profile: { name: "Maria" } }],
  messages: [{ from, id: "wamid.1", type: "text", text: { body: texto } }],
} }] }] });
async function postarAssinado(body: any) {
  const raw = JSON.stringify(body);
  const sig = "sha256=" + createHmac("sha256", cfg.appSecret).update(raw).digest("hex");
  const r = await fetch(`${base}/api/webhooks/whatsapp-oficial`, { method: "POST", headers: { "Content-Type": "application/json", "x-hub-signature-256": sig }, body: raw });
  await new Promise((ok) => setTimeout(ok, 50)); // processamento continua depois do 200
  return r;
}

describe("webhook WhatsApp oficial", () => {
  it("verificacao da Meta: token certo devolve o desafio, errado 403", async () => {
    expect(await (await fetch(`${base}/api/webhooks/whatsapp-oficial?hub.mode=subscribe&hub.verify_token=vt&hub.challenge=42`)).text()).toBe("42");
    expect((await fetch(`${base}/api/webhooks/whatsapp-oficial?hub.mode=subscribe&hub.verify_token=x&hub.challenge=42`)).status).toBe(403);
  });
  it("sem assinatura: 401 e nada acontece", async () => {
    const r = await fetch(`${base}/api/webhooks/whatsapp-oficial`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(msg("5522999990000", "oi")) });
    expect(r.status).toBe(401);
    expect(atenderMensagem).not.toHaveBeenCalled();
  });
  it("numero de teste: a Lia responde", async () => {
    vi.mocked(atenderMensagem).mockResolvedValue({ texto: "Oi Maria!", humano: false, resumo: "" });
    expect((await postarAssinado(msg("5522999990000", "oi"))).status).toBe(200);
    expect(enviarTexto).toHaveBeenCalledWith("PN1", "tok", "5522999990000", "Oi Maria!");
    expect(notificarCaso).not.toHaveBeenCalled();
  });
  it("modo teste: numero fora da lista e ignorado", async () => {
    await postarAssinado(msg("5511888887777", "oi"));
    expect(atenderMensagem).not.toHaveBeenCalled();
  });
  it("conversa pausada: a Lia nao responde", async () => {
    vi.mocked(estaPausado).mockResolvedValueOnce(true);
    await postarAssinado(msg("5522999990000", "oi"));
    expect(atenderMensagem).not.toHaveBeenCalled();
  });
  it("passa para humano: responde, pausa so esta conversa e avisa o painel", async () => {
    vi.mocked(atenderMensagem).mockResolvedValue({ texto: "Vou chamar uma pessoa", humano: true, resumo: "Quer trocar tamanho" });
    await postarAssinado(msg("5522999990000", "quero falar com alguem"));
    expect(enviarTexto).toHaveBeenCalled();
    expect(pausar).toHaveBeenCalledWith("5522999990000", 24 * 30, "passou_humano");
    expect(notificarCaso).toHaveBeenCalledWith({ telefone: "5522999990000", nome: "Maria", resumo: "Quer trocar tamanho", ultimaMensagem: "quero falar com alguem" });
  });
  it("eco da equipe pelo celular: pausa 2h so esta conversa", async () => {
    await postarAssinado({ entry: [{ changes: [{ field: "smb_message_echoes", value: { message_echoes: [{ to: "5522999990000" }] } }] }] });
    expect(pausar).toHaveBeenCalledWith("5522999990000", 2, "eco_humano");
    expect(atenderMensagem).not.toHaveBeenCalled();
  });
  it("Atendido do painel: segredo errado 401, certo libera", async () => {
    const post = (sec: string) => fetch(`${base}/api/atendimento/liberar`, { method: "POST", headers: { "Content-Type": "application/json", "x-atendimento-secret": sec }, body: JSON.stringify({ telefone: "5522999990000" }) });
    expect((await post("errado")).status).toBe(401);
    expect((await post("s1")).status).toBe(200);
    expect(liberarPausa).toHaveBeenCalledWith("5522999990000");
  });
});
