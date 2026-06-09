import { describe, it, expect } from "vitest";
import { checkCopyCompliance, checkCreativeCoherence } from "./copyComplianceGate";

describe("checkCopyCompliance — BLOQUEIA claims proibidos", () => {
  const proibidos: [string, string][] = [
    ["renda com valor", "Em 30 dias revendendo de casa ela faturou R$2.100"],
    ["especificidade de renda", "R$2.147 em 23 dias revendendo"],
    ["renda mensal + sem CNPJ", "R$2.000/mês de casa, sem estoque, sem CNPJ, em 48h"],
    ["golpe como gancho", "Achei que era golpe quando vi a margem"],
    ["renda garantida", "Renda extra garantida revendendo pijama"],
    ["ganhe dinheiro", "Ganhe dinheiro fácil trabalhando de casa"],
    ["ganhe de casa", "Ganhe de casa revendendo pijama"],
    ["lucre revendendo", "Lucre revendendo nossas estampas"],
    ["renda extra", "Tenha sua renda extra revendendo"],
    ["renda paralela", "Monte sua renda paralela com a gente"],
    ["sem sair de casa", "Trabalhe sem sair de casa"],
    ["independencia financeira", "Conquiste sua independência financeira"],
    ["anti-emprego POV", "POV: você odeia depender de chefe"],
    ["depender do salario", "Cansou de depender do salário do marido?"],
  ];

  it.each(proibidos)("bloqueia: %s", (_label, texto) => {
    const r = checkCopyCompliance(texto);
    expect(r.ok).toBe(false);
    expect(r.violations.length).toBeGreaterThan(0);
  });
});

describe("checkCopyCompliance — PASSA copy de produto/oferta", () => {
  const seguros = [
    "Pijama camurça premium, fabricação própria e pronta entrega",
    "Preço de fábrica direto pra você, sem pedido mínimo",
    "Estampa exclusiva que sua cliente não acha em outro lugar",
    "Compre no atacado sem CNPJ — preço de fábrica pra revenda",
    "Venda mais com estampas exclusivas da fábrica",
    "Tenha a coleção completa pra sua revenda",
    "Pronta entrega pra você revender sem complicação",
  ];

  it.each(seguros)("passa: %s", (texto) => {
    const r = checkCopyCompliance(texto);
    expect(r.ok).toBe(true);
    expect(r.violations).toEqual([]);
  });
});

describe("checkCreativeCoherence — botão x destino", () => {
  it("bloqueia botão WhatsApp/revender com destino site + CTA compra", () => {
    const v = checkCreativeCoherence({
      briefText: "Botão: QUERO REVENDER – CLIQUE AQUI",
      callToAction: "SHOP_NOW",
      linkUrl: "https://www.feminnita.com.br",
    });
    expect(v.length).toBeGreaterThan(0);
  });

  it("passa quando botão e destino combinam (compra → site)", () => {
    const v = checkCreativeCoherence({
      briefText: "Botão: COMPRAR AGORA",
      callToAction: "SHOP_NOW",
      linkUrl: "https://www.feminnita.com.br",
    });
    expect(v).toEqual([]);
  });
});
