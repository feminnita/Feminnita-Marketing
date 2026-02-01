import { describe, it, expect, vi } from "vitest";
import { integrationsRouter } from "./integrations";

describe("Integrations Router", () => {
  it("deve salvar token com sucesso", async () => {
    const caller = integrationsRouter.createCaller({ user: { id: "test-user" } } as any);

    const result = await caller.salvarToken({
      plataforma: "tray",
      token: "test_token_123456789",
    });

    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toContain("salvo com sucesso");
    expect(result.plataforma).toBe("tray");
  });

  it("deve validar conexão com token válido", async () => {
    const caller = integrationsRouter.createCaller({ user: { id: "test-user" } } as any);

    const result = await caller.validarConexao({
      plataforma: "tray",
      token: "valid_token_with_more_than_10_chars",
    });

    expect(result.sucesso).toBe(true);
    expect(result.conectado).toBe(true);
    expect(result.mensagem).toContain("validada com sucesso");
  });

  it("deve rejeitar token inválido", async () => {
    const caller = integrationsRouter.createCaller({ user: { id: "test-user" } } as any);

    const result = await caller.validarConexao({
      plataforma: "tray",
      token: "short",
    });

    expect(result.sucesso).toBe(false);
    expect(result.conectado).toBe(false);
    expect(result.mensagem).toContain("Token inválido");
  });

  it("deve validar token Meta com prefixo EAA", async () => {
    const caller = integrationsRouter.createCaller({ user: { id: "test-user" } } as any);

    const result = await caller.validarConexao({
      plataforma: "meta",
      token: "EAA1234567890",
    });

    expect(result.conectado).toBe(true);
  });

  it("deve validar token Google Drive com prefixo ya29", async () => {
    const caller = integrationsRouter.createCaller({ user: { id: "test-user" } } as any);

    const result = await caller.validarConexao({
      plataforma: "google_drive",
      token: "ya29_1234567890",
    });

    expect(result.conectado).toBe(true);
  });

  it("deve listar integrações do usuário", async () => {
    const caller = integrationsRouter.createCaller({ user: { id: "test-user" } } as any);

    const result = await caller.listar();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBe(9);
    expect(result[0].plataforma).toBe("tray");
    expect(result[0].isConnected).toBe(false);
  });

  it("deve desconectar integração", async () => {
    const caller = integrationsRouter.createCaller({ user: { id: "test-user" } } as any);

    const result = await caller.desconectar({
      plataforma: "tray",
    });

    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toContain("desconectado com sucesso");
  });

  it("deve obter status de integração", async () => {
    const caller = integrationsRouter.createCaller({ user: { id: "test-user" } } as any);

    const result = await caller.obterStatus({
      plataforma: "tray",
    });

    expect(result.plataforma).toBe("tray");
    expect(result.isConnected).toBe(false);
    expect(result.mensagem).toBe("Não conectado");
  });

  it("deve validar todas as plataformas suportadas", async () => {
    const caller = integrationsRouter.createCaller({ user: { id: "test-user" } } as any);

    const plataformas = [
      "tray",
      "google_drive",
      "meta",
      "email_marketing",
      "instagram",
      "tiktok",
      "facebook",
      "whatsapp",
      "bling",
    ];

    for (const plataforma of plataformas) {
      const result = await caller.salvarToken({
        plataforma: plataforma as any,
        token: `test_token_${plataforma}`,
      });

      expect(result.sucesso).toBe(true);
      expect(result.plataforma).toBe(plataforma);
    }
  });
});
