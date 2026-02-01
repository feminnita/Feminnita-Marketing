import { describe, it, expect, vi } from "vitest";
import { automationsRouter } from "./automations";

describe("Automations Router", () => {
  it("deve criar uma automação com sucesso", async () => {
    const caller = automationsRouter.createCaller({ user: { id: "test-user" } } as any);
    
    const result = await caller.criar({
      nome: "Test Automation",
      tipo: "post",
      plataforma: "instagram",
      conteudo: "Test content",
      agendamento: "Diariamente às 10:00",
    });

    expect(result).toHaveProperty("id");
    expect(result.nome).toBe("Test Automation");
    expect(result.status).toBe("agendado");
  });

  it("deve listar automações", async () => {
    const caller = automationsRouter.createCaller({ user: { id: "test-user" } } as any);
    
    const result = await caller.listar();

    expect(Array.isArray(result)).toBe(true);
  });

  it("deve atualizar uma automação", async () => {
    const caller = automationsRouter.createCaller({ user: { id: "test-user" } } as any);
    
    const result = await caller.atualizar({
      id: "1",
      nome: "Updated Name",
      conteudo: "Updated content",
    });

    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toContain("atualizada");
  });

  it("deve deletar uma automação", async () => {
    const caller = automationsRouter.createCaller({ user: { id: "test-user" } } as any);
    
    const result = await caller.deletar({ id: "1" });

    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toContain("deletada");
  });

  it("deve executar uma automação", async () => {
    const caller = automationsRouter.createCaller({ user: { id: "test-user" } } as any);
    
    const result = await caller.executar({
      id: "1",
      plataforma: "instagram",
      conteudo: "Test content",
    });

    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toMatch(/(executada|Publicado)/i);
  });
});
