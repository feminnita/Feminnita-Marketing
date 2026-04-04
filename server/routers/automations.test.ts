import { describe, it, expect, beforeAll } from "vitest";
import { automationsRouter } from "./automations";

describe("Automations Router", () => {
  let createdId: string;

  const caller = automationsRouter.createCaller({ user: { id: 1 } } as any);

  beforeAll(async () => {
    const result = await caller.criar({
      nome: "Test Automation",
      tipo: "post",
      plataforma: "instagram",
      conteudo: "Test content",
      agendamento: "Diariamente às 10:00",
    });
    createdId = String(result.id);
  });

  it("deve criar uma automação com sucesso", async () => {
    expect(createdId).toBeDefined();
  });

  it("deve listar automações", async () => {
    const result = await caller.listar();
    expect(Array.isArray(result)).toBe(true);
  });

  it("deve atualizar uma automação", async () => {
    const result = await caller.atualizar({
      id: createdId,
      nome: "Updated Name",
      conteudo: "Updated content",
    });
    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toContain("atualizada");
  });

  it("deve executar uma automação", async () => {
    const result = await caller.executar({
      id: createdId,
      plataforma: "instagram",
      conteudo: "Test content",
    });
    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toMatch(/(executada|Publicado)/i);
  });

  it("deve deletar uma automação", async () => {
    const result = await caller.deletar({ id: createdId });
    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toContain("deletada");
  });
});
