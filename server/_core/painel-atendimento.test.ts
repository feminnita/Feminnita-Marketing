import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { notificarCaso } from "./painel-atendimento";

const caso = { telefone: "5522999990000", nome: "Maria", resumo: "Quer trocar tamanho", ultimaMensagem: "oi" };

beforeEach(() => {
  process.env.PAINEL_ATENDIMENTO_URL = "https://painel.teste";
  process.env.PAINEL_ATENDIMENTO_SECRET = "s1";
  process.env.TELEGRAM_ALERTA_TOKEN = "tg";
  process.env.TELEGRAM_ALERTA_CHAT_ID = "123";
});
afterEach(() => vi.restoreAllMocks());

const telegramChamadas = (f: any) => f.mock.calls.filter((c: any[]) => String(c[0]).includes("api.telegram.org"));

describe("notificarCaso", () => {
  it("caso novo (201): avisa o painel e o Telegram", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockImplementation(async (u: any) =>
      String(u).includes("telegram") ? new Response('{"ok":true}') : new Response('{"id":"1"}', { status: 201 }));
    expect(await notificarCaso(caso)).toBe(true);
    expect(String(f.mock.calls[0][0])).toBe("https://painel.teste/api/atendimento/casos");
    expect((f.mock.calls[0][1] as any).headers["x-atendimento-secret"]).toBe("s1");
    expect(telegramChamadas(f)).toHaveLength(1);
  });
  it("caso repetido (200): nao repete o Telegram", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response('{"id":"1","repetido":true}', { status: 200 }));
    await notificarCaso(caso);
    expect(telegramChamadas(f)).toHaveLength(0);
  });
  it("painel fora do ar: Telegram avisa mesmo assim", async () => {
    const f = vi.spyOn(globalThis, "fetch").mockImplementation(async (u: any) => {
      if (String(u).includes("telegram")) return new Response('{"ok":true}');
      throw new Error("offline");
    });
    expect(await notificarCaso(caso)).toBe(false);
    expect(telegramChamadas(f)).toHaveLength(1);
  });
});
