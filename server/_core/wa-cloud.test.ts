import { describe, it, expect } from "vitest";
import { createHmac } from "crypto";
import { assinaturaValida, lerEventos } from "./wa-cloud";

const SEGREDO = "segredo-teste";
const corpo = Buffer.from(JSON.stringify({ ok: 1 }));
const assinar = (b: Buffer) => "sha256=" + createHmac("sha256", SEGREDO).update(b).digest("hex");

describe("assinaturaValida", () => {
  it("aceita assinatura certa", () => expect(assinaturaValida(corpo, assinar(corpo), SEGREDO)).toBe(true));
  it("recusa assinatura errada", () => expect(assinaturaValida(corpo, "sha256=00", SEGREDO)).toBe(false));
  it("recusa sem cabecalho", () => expect(assinaturaValida(corpo, undefined, SEGREDO)).toBe(false));
});

describe("lerEventos", () => {
  it("le mensagem de texto da cliente", () => {
    const body = { entry: [{ changes: [{ field: "messages", value: {
      metadata: { phone_number_id: "PN1" },
      contacts: [{ profile: { name: "Maria" }, wa_id: "5522999990000" }],
      messages: [{ from: "5522999990000", id: "wamid.1", type: "text", text: { body: "Oi, tem tamanho G?" } }],
    } }] }] };
    expect(lerEventos(body)).toEqual([
      { tipo: "mensagem", telefone: "5522999990000", nome: "Maria", texto: "Oi, tem tamanho G?", id: "wamid.1", phoneNumberId: "PN1" },
    ]);
  });
  it("marca midia sem texto", () => {
    const body = { entry: [{ changes: [{ field: "messages", value: {
      metadata: { phone_number_id: "PN1" }, contacts: [{ profile: { name: "Ana" } }],
      messages: [{ from: "551100", id: "wamid.2", type: "audio", audio: {} }],
    } }] }] };
    expect(lerEventos(body)[0]).toMatchObject({ tipo: "midia", telefone: "551100" });
  });
  it("le eco de mensagem enviada pelo app do celular", () => {
    const body = { entry: [{ changes: [{ field: "smb_message_echoes", value: {
      message_echoes: [{ from: "PN-BIZ", to: "5522999990000", id: "wamid.3", type: "text", text: { body: "Oi Maria" } }],
    } }] }] };
    expect(lerEventos(body)).toEqual([{ tipo: "eco", telefone: "5522999990000" }]);
  });
  it("ignora status de entrega", () => {
    const body = { entry: [{ changes: [{ field: "messages", value: { statuses: [{ id: "x", status: "read" }] } }] }] };
    expect(lerEventos(body)).toEqual([]);
  });
});
