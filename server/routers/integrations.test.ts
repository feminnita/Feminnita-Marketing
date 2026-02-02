import { describe, it, expect } from "vitest";
import { integrationsRouter } from "./integrations";

describe("Integrations Router", () => {
  it("deve obter status de integrações", async () => {
    const caller = integrationsRouter.createCaller({
      user: { id: 1 },
    } as any);

    const result = await caller.getStatus();

    expect(result).toHaveProperty("bling");
    expect(result).toHaveProperty("canva");
    expect(result).toHaveProperty("meta");
    expect(result.bling).toHaveProperty("connected");
    expect(result.canva).toHaveProperty("connected");
    expect(result.meta).toHaveProperty("connected");
  });

  it("deve validar estrutura de status", async () => {
    const caller = integrationsRouter.createCaller({
      user: { id: 1 },
    } as any);

    const result = await caller.getStatus();

    expect(typeof result.bling.connected).toBe("boolean");
    expect(typeof result.canva.connected).toBe("boolean");
    expect(typeof result.meta.connected).toBe("boolean");
  });

  it("deve retornar status inicial como não conectado", async () => {
    const caller = integrationsRouter.createCaller({
      user: { id: 999 }, // Usuário que não existe
    } as any);

    const result = await caller.getStatus();

    expect(result.bling.connected).toBe(false);
    expect(result.canva.connected).toBe(false);
    expect(result.meta.connected).toBe(false);
  });
});
