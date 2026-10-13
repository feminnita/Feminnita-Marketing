import { describe, it, expect } from "vitest";
import { interpretarRespostaLia } from "./lia-saida";

describe("interpretarRespostaLia", () => {
  it("resposta normal", () => {
    expect(interpretarRespostaLia("Oi! Temos sim no G 💛")).toEqual({ texto: "Oi! Temos sim no G 💛", humano: false, resumo: "" });
  });
  it("pedido de humano com resumo", () => {
    expect(interpretarRespostaLia("[[HUMANO]] Quer trocar o tamanho do pedido ARM-12\nVou chamar uma pessoa da equipe 💛")).toEqual({
      texto: "Vou chamar uma pessoa da equipe 💛", humano: true, resumo: "Quer trocar o tamanho do pedido ARM-12",
    });
  });
  it("tira asteriscos de markdown", () => {
    expect(interpretarRespostaLia("Use o **tamanho G**").texto).toBe("Use o tamanho G");
  });
  it("humano sem texto ganha mensagem padrao", () => {
    expect(interpretarRespostaLia("[[HUMANO]] Reclamacao").texto).toMatch(/pessoa da nossa equipe/);
  });
});
