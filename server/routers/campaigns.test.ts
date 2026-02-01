import { describe, it, expect } from "vitest";
import { campaignsRouter } from "./campaigns";

describe("Campaigns Router", () => {
  it("deve criar uma campanha com sucesso", async () => {
    const caller = campaignsRouter.createCaller({ user: { id: "test-user" } } as any);
    
    const result = await caller.criar({
      nome: "Test Campaign",
      plataforma: "instagram",
      orcamento: 5000,
      publico_alvo: "Mulheres 18-45",
      descricao: "Test campaign description",
      data_inicio: "2026-01-15",
      data_fim: "2026-02-28",
    });

    expect(result).toHaveProperty("id");
    expect(result.nome).toBe("Test Campaign");
    expect(result.status).toBe("rascunho");
  });

  it("deve listar campanhas", async () => {
    const caller = campaignsRouter.createCaller({ user: { id: "test-user" } } as any);
    
    const result = await caller.listar();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("deve obter uma campanha específica", async () => {
    const caller = campaignsRouter.createCaller({ user: { id: "test-user" } } as any);
    
    const result = await caller.obter({ id: "1" });

    expect(result).toHaveProperty("id");
    expect(result.id).toBe("1");
  });

  it("deve atualizar uma campanha", async () => {
    const caller = campaignsRouter.createCaller({ user: { id: "test-user" } } as any);
    
    const result = await caller.atualizar({
      id: "1",
      nome: "Updated Campaign",
      orcamento: 7000,
    });

    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toContain("atualizada");
  });

  it("deve deletar uma campanha", async () => {
    const caller = campaignsRouter.createCaller({ user: { id: "test-user" } } as any);
    
    const result = await caller.deletar({ id: "1" });

    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toContain("deletada");
  });

  it("deve publicar uma campanha", async () => {
    const caller = campaignsRouter.createCaller({ user: { id: "test-user" } } as any);
    
    const result = await caller.publicar({ id: "1" });

    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toContain("publicada");
  });

  it("deve pausar uma campanha", async () => {
    const caller = campaignsRouter.createCaller({ user: { id: "test-user" } } as any);
    
    const result = await caller.pausar({ id: "1" });

    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toContain("pausada");
  });

  it("deve retomar uma campanha", async () => {
    const caller = campaignsRouter.createCaller({ user: { id: "test-user" } } as any);
    
    const result = await caller.retomar({ id: "1" });

    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toContain("retomada");
  });
});
