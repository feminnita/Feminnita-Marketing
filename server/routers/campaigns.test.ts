import { describe, it, expect, beforeAll } from "vitest";
import { campaignsRouter } from "./campaigns";

describe("Campaigns Router", () => {
  let createdId: string;

  const caller = campaignsRouter.createCaller({ user: { id: 1 } } as any);

  beforeAll(async () => {
    const result = await caller.criar({
      nome: "Test Campaign",
      plataforma: "instagram",
      orcamento: 5000,
      publico_alvo: "Mulheres 18-45",
      descricao: "Test campaign description",
      data_inicio: "2026-01-15",
      data_fim: "2026-02-28",
    });
    createdId = String(result.id);
  });

  it("deve criar uma campanha com sucesso", async () => {
    expect(createdId).toBeDefined();
  });

  it("deve listar campanhas", async () => {
    const result = await caller.listar();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  it("deve obter uma campanha específica", async () => {
    const result = await caller.obter({ id: createdId });
    expect(result).toHaveProperty("id");
  });

  it("deve atualizar uma campanha", async () => {
    const result = await caller.atualizar({
      id: createdId,
      nome: "Updated Campaign",
      orcamento: 7000,
    });
    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toContain("atualizada");
  });

  it("deve pausar uma campanha", async () => {
    const result = await caller.pausar({ id: createdId });
    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toContain("pausada");
  });

  it("deve retomar uma campanha", async () => {
    const result = await caller.retomar({ id: createdId });
    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toContain("retomada");
  });

  it("deve publicar uma campanha", async () => {
    const result = await caller.publicar({ id: createdId });
    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toContain("publicada");
  });

  it("deve deletar uma campanha", async () => {
    const result = await caller.deletar({ id: createdId });
    expect(result.sucesso).toBe(true);
    expect(result.mensagem).toContain("deletada");
  });
});
