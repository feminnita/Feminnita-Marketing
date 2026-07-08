import { describe, it, expect } from "vitest";
import { META_COMPLIANCE_DOCTRINE } from "./meta-compliance-doctrine";

describe("META_COMPLIANCE_DOCTRINE", () => {
  it("contém as proibições essenciais", () => {
    const d = META_COMPLIANCE_DOCTRINE.toLowerCase();
    expect(d).toContain("renda");
    expect(d).toContain("sem cnpj");
    expect(d).toContain("golpe");
    expect(d).toContain("comprov");      // número comprovável
    expect(d).toContain("destino");      // coerência criativo↔destino
    expect(d).toContain("suede");        // material correto (nunca "camurça")
    expect(d).toContain("camurça");      // a doutrina proíbe explicitamente o termo errado
    expect(d).toContain("cpf ou cnpj");  // forma correta do claim
    expect(d).toContain("r$199");        // pedido mínimo real da revenda
    expect(d).toContain("catálogo");     // proíbe CTA de catálogo
  });

  it("não está vazia", () => {
    expect(META_COMPLIANCE_DOCTRINE.trim().length).toBeGreaterThan(200);
  });
});
