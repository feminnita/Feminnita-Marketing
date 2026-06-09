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
  });

  it("não está vazia", () => {
    expect(META_COMPLIANCE_DOCTRINE.trim().length).toBeGreaterThan(200);
  });
});
