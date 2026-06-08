# Blindagem de Conformidade Meta (Fernanda/Beatriz) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Impedir que os agentes Fernanda e Beatriz gerem (e proponham) anúncios com promessa de renda específica, "sem CNPJ" como isca, "golpe/scam" como gancho, número não comprovável ou incoerência criativo↔destino — proibindo na origem (prompts) e bloqueando mecanicamente antes de chegar ao painel de aprovação.

**Architecture:** 3 camadas. (1) Uma doutrina de conformidade em string, injetada no topo dos system prompts da Fernanda e da Beatriz. (2) Saneamento dos exemplos de copy que hoje ensinam a infração. (3) Uma trava automática (`copyComplianceGate`) que escaneia o brief inteiro no chokepoint `proposeActions` da Fernanda; se violar, tenta regenerar 1x e, persistindo, grava a ação como `rejected` (nunca publicada).

**Tech Stack:** TypeScript (ESM), Vitest (`import { describe, it, expect } from "vitest"`, testes colocados ao lado do arquivo), Drizzle ORM (MySQL). Comandos: `npm test` (= `vitest run`), `npm run check` (= `tsc --noEmit`).

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `server/agents/compliance/copyComplianceGate.ts` | **novo** — funções puras `checkCopyCompliance` e `checkCreativeCoherence` + tipos |
| `server/agents/compliance/copyComplianceGate.test.ts` | **novo** — testes do gate |
| `server/agents/doctrines/meta-compliance-doctrine.ts` | **novo** — string `META_COMPLIANCE_DOCTRINE` |
| `server/agents/doctrines/meta-compliance-doctrine.test.ts` | **novo** — teste que trava as proibições essenciais |
| `server/agents/fernanda-daily-agent.ts` | **modificar** — injetar doutrina, sanear exemplos, plugar gate em `proposeActions` |
| `server/agents/beatriz-agent.ts` | **modificar** — injetar doutrina em `generateAdCopy`, reforçar regras, remover número não comprovável |

---

## Task 1: Trava automática (copyComplianceGate)

**Files:**
- Create: `server/agents/compliance/copyComplianceGate.ts`
- Test: `server/agents/compliance/copyComplianceGate.test.ts`

- [ ] **Step 1: Write the failing test**

Create `server/agents/compliance/copyComplianceGate.test.ts`:

```ts
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
  ];

  it.each(proibidos)("bloqueia: %s", (_label, texto) => {
    const r = checkCopyCompliance(texto);
    expect(r.ok).toBe(false);
    expect(r.violations.length).toBeGreaterThan(0);
  });
});

describe("checkCopyCompliance — PASSA copy de produto/oferta", () => {
  const seguros = [
    "Pijama suede premium, fabricação própria e pronta entrega",
    "Preço de fábrica direto pra você, sem pedido mínimo",
    "Estampa exclusiva que sua cliente não acha em outro lugar",
    "Compre no atacado sem CNPJ — preço de fábrica pra revenda",
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run server/agents/compliance/copyComplianceGate.test.ts`
Expected: FAIL — "Failed to resolve import './copyComplianceGate'" (módulo ainda não existe).

- [ ] **Step 3: Write minimal implementation**

Create `server/agents/compliance/copyComplianceGate.ts`:

```ts
/**
 * Trava de conformidade Meta — escaneia o TEXTO de um brief/copy de anúncio
 * e bloqueia claims proibidos pela política do Meta (promessa de renda,
 * "sem CNPJ" como isca, "golpe/scam" como gancho) e incoerência criativo↔destino.
 *
 * Funções puras, sem I/O — testáveis isoladamente.
 * Limitação conhecida: lê texto, não lê pixel. Cobre tudo que a Fernanda
 * escreve (copy + texto ditado para a arte), não o que um designer pinta
 * fora do brief.
 */

export interface ComplianceResult {
  ok: boolean;
  violations: string[];
}

// minúsculas + remove acentos (casa "fábrica"/"fabrica", "mês"/"mes")
function normalize(s: string): string {
  return (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

const RULES: { rule: string; re: RegExp }[] = [
  {
    rule: "Promessa de renda/faturamento com valor",
    re: /(faturou|faturar|fatura|fature|ganhou|ganhar|ganhe|ganha|lucr\w*|rend\w*|receb\w*)[^.\n]{0,40}r\$\s?\d|r\$\s?\d[\d.,]*[^.\n]{0,40}(faturou|ganh\w*|lucr\w*|rend\w*)/,
  },
  {
    rule: "Valor monetario com janela de tempo (renda)",
    re: /r\$\s?\d[\d.,]*\s*(\/\s*(mes|dia|semana|hora)|por\s+(mes|dia|semana|hora))|r\$\s?\d[\d.,]*[^.\n]{0,30}\bem\s+\d+\s*(dias?|semanas?|meses|mes)\b/,
  },
  {
    rule: "'sem CNPJ' como isca de renda",
    re: /(rend\w*|ganh\w*|lucr\w*|dinheiro|faturar?)[^.\n]{0,40}sem\s+cnpj|sem\s+cnpj[^.\n]{0,40}(rend\w*|ganh\w*|lucr\w*|dinheiro)/,
  },
  {
    rule: "Promessa de renda facil/garantida",
    re: /(rend\w*|lucr\w*|ganh\w*|dinheiro)\s+(extra\s+)?(garantid\w+|facil\w*|rapid\w+|certo|sem esforco)|dinheiro\s+facil|ganhe\s+dinheiro/,
  },
  {
    rule: "Gancho 'golpe/scam/furada/cilada'",
    re: /\b(golpe|scam|furada|cilada)\b/,
  },
];

export function checkCopyCompliance(text: string): ComplianceResult {
  const norm = normalize(text);
  const violations: string[] = [];
  for (const { rule, re } of RULES) {
    const m = norm.match(re);
    if (m) violations.push(`${rule}: "${m[0].trim()}"`);
  }
  return { ok: violations.length === 0, violations };
}

// botão/texto na arte promete WhatsApp/contato/revenda, mas o destino é o site
// com CTA de compra → incoerência que o Meta lê como enganoso.
const PROMESSA_CONTATO = /(whats\s?app|chama no whats|quero revender|fala com a gente|clique aqui)/;
const CTA_CONTATO = ["MESSAGE_PAGE", "WHATSAPP_MESSAGE", "CONTACT_US", "SEND_MESSAGE"];

export function checkCreativeCoherence(params: {
  briefText: string;
  callToAction?: string;
  linkUrl?: string;
}): string[] {
  const t = normalize(params.briefText);
  const cta = (params.callToAction || "SHOP_NOW").toUpperCase();
  const link = normalize(params.linkUrl || "");

  const prometeContato = PROMESSA_CONTATO.test(t);
  const destinoEhContato =
    link.includes("wa.me") || link.includes("whatsapp") || CTA_CONTATO.includes(cta);

  if (prometeContato && !destinoEhContato) {
    return [
      "Incoerencia criativo->destino: o botao/texto promete WhatsApp/contato/revenda, mas o destino e o site com CTA de compra",
    ];
  }
  return [];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run server/agents/compliance/copyComplianceGate.test.ts`
Expected: PASS (todos os blocos verdes).

- [ ] **Step 5: Commit**

```bash
git add server/agents/compliance/copyComplianceGate.ts server/agents/compliance/copyComplianceGate.test.ts
git commit -m "feat(conformidade): trava automatica de copy/coerencia Meta com testes"
```

---

## Task 2: Doutrina de Conformidade (string compartilhada)

**Files:**
- Create: `server/agents/doctrines/meta-compliance-doctrine.ts`
- Test: `server/agents/doctrines/meta-compliance-doctrine.test.ts`

- [ ] **Step 1: Write the failing test**

Create `server/agents/doctrines/meta-compliance-doctrine.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run server/agents/doctrines/meta-compliance-doctrine.test.ts`
Expected: FAIL — "Failed to resolve import './meta-compliance-doctrine'".

- [ ] **Step 3: Write minimal implementation**

Create `server/agents/doctrines/meta-compliance-doctrine.ts`:

```ts
// Doutrina de CONFORMIDADE Meta — injetada no TOPO (prioridade máxima) dos
// system prompts da Fernanda e da Beatriz. Vale para a copy E para todo texto
// que o agente manda escrever na arte (título/preço/CTA/rodapé do banner).
// Estas regras vencem qualquer instrução de copy agressiva mais abaixo.

export const META_COMPLIANCE_DOCTRINE = `
═══════════════════════════════════════════════════════
⛔ REGRAS DE CONFORMIDADE META — INEGOCIÁVEIS (vencem tudo abaixo)
═══════════════════════════════════════════════════════
Violar qualquer regra abaixo arrisca a conta de anúncios inteira (pixel, CAPI,
Business Manager). O custo é assimétrico: nunca vale o risco. Estas regras valem
para a COPY e para QUALQUER texto que você mande escrever na arte (título,
preço, botão/CTA, rodapé, legenda).

É PROIBIDO:
1. Prometer ou insinuar valor de RENDA, GANHO, LUCRO ou FATURAMENTO específico.
   Ex. proibido: "ela faturou R$2.100", "R$2.000/mês", "renda de R$X em N dias".
2. Prometer renda fácil/garantida: "renda garantida", "dinheiro fácil",
   "lucro garantido", "ganhe dinheiro de casa", "sem sair de casa" como promessa
   financeira.
3. Usar "sem CNPJ" como isca de renda fácil (ex.: "ganhe sem CNPJ"). Falar que
   pessoa física pode COMPRAR no atacado sem CNPJ é fato de compra — permitido —
   desde que não venha colado a promessa de ganho.
4. Depoimento, caso ou número NÃO COMPROVÁVEL — sobre uma pessoa ("a Maria
   faturou…") ou agregado ("2.000 revendedoras"). Só use número se for dado real
   e comprovável; senão, redação genérica ("milhares", "uma comunidade") ou nada.
5. Usar "golpe", "scam", "furada", "cilada" como gancho.
6. Mandar escrever na ARTE qualquer número de renda ou promessa financeira.
7. Incoerência criativo↔DESTINO: o botão/texto na imagem deve combinar com o CTA
   real e a página de destino. Botão "QUERO REVENDER"/WhatsApp levando para
   "Comprar agora"/site é enganoso — proibido.

O QUE VOCÊ PODE (e deve) usar no lugar da promessa de renda:
- Preço de fábrica / atacado vs. varejo (fato de compra).
- Fabricação própria, suede premium, pronta entrega, sem pedido mínimo.
- Exclusividade de estampa, variedade de sortimento, suporte pós-venda.
- Venda o PRODUTO e a OFERTA — nunca a promessa de renda da revendedora.
`;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run server/agents/doctrines/meta-compliance-doctrine.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add server/agents/doctrines/meta-compliance-doctrine.ts server/agents/doctrines/meta-compliance-doctrine.test.ts
git commit -m "feat(conformidade): doutrina de conformidade Meta compartilhada"
```

---

## Task 3: Integrar na Fernanda (injetar doutrina + sanear exemplos + plugar trava)

**Files:**
- Modify: `server/agents/fernanda-daily-agent.ts`

- [ ] **Step 1: Adicionar imports no topo**

Logo após a linha `import { generateAdCopy } from "./beatriz-agent";` (linha ~18), adicione:

```ts
import { META_COMPLIANCE_DOCTRINE } from "./doctrines/meta-compliance-doctrine";
import { checkCopyCompliance, checkCreativeCoherence } from "./compliance/copyComplianceGate";
```

- [ ] **Step 2: Injetar a doutrina no topo do SYSTEM_PROMPT_DAILY**

Localize o início do prompt (linha ~87):

```ts
const SYSTEM_PROMPT_DAILY = `Você é a Fernanda Leal — gestora de tráfego pago sênior com 13 anos de experiência em performance marketing.
```

Troque por (interpola a doutrina antes de tudo):

```ts
const SYSTEM_PROMPT_DAILY = `${META_COMPLIANCE_DOCTRINE}

Você é a Fernanda Leal — gestora de tráfego pago sênior com 13 anos de experiência em performance marketing.
```

- [ ] **Step 3: Sanear os exemplos de hook envenenados**

Localize o bloco HOOKs (linhas ~168-178). Troque o trecho exato:

```ts
HOOK TRANSFORMAÇÃO (antes + depois + tempo específico):
"Em 30 dias revendendo de casa ela faturou R$2.100" — velocidade = atenção, transformação = confiança.

HOOK DAVID E GOLIAS / IMPACTO (formato #1 de 2026):
Chame um inimigo ou quebre uma crença. "Achei que era golpe quando vi a margem de 50%".
Cria choque + curiosidade irresistível. Maior potencial viral.

HOOK INVESTIMENTO: Mine tentativas frustradas antes da Feminnita. "Testei 8 fornecedores antes de encontrar um que pagasse minhas contas."
HOOK DO SCAM: "golpe" e "scam" são gatilhos viscerais de alto poder de parada.
POV + ÓDIO: "POV: você odeia depender de chefe" — 10-15% dos top performers de 2025 usaram POV.
```

Por (mesmos formatos, ângulo de PRODUTO/OFERTA, sem renda/golpe — respeita a doutrina):

```ts
HOOK TRANSFORMAÇÃO (antes + depois, sem número de renda):
"Antes eu comprava revenda cara e parcelada; agora compro direto da fábrica" — transformação da FONTE de compra, nunca promessa de quanto a pessoa ganha.

HOOK QUEBRA DE CRENÇA (formato de alto impacto):
Quebre uma crença sobre o PRODUTO/ACESSO, sem usar "golpe/scam". "Achei que fábrica não vendia pra revenda — até conhecer a Feminnita."

HOOK INVESTIMENTO: Mine tentativas frustradas de FORNECEDOR. "Testei 8 fornecedores até achar um com pronta entrega e estampa exclusiva."
POV (sem anti-emprego, sem renda): "POV: você achou a fábrica que vende a peça que sua cliente vive pedindo."
```

- [ ] **Step 4: Sanear os exemplos de Hormozi e Gary Halbert**

Localize (linhas ~186-197). Troque o trecho exato:

```ts
ALEX HORMOZI — EMPILHE O VALOR:
Equação: Resultado × Probabilidade ÷ Tempo × Esforço.
"R$2.000/mês de casa, sem estoque, sem CNPJ, em 48h" — não venda o pijama, venda a transformação da revendedora.

JOANNA WIEBE — VOZ DA CLIENTE:
A dor real não é "quero mais renda" — é "não aguento mais depender do salário do meu marido".
5 níveis de consciência: Inconsciente → Consciente do problema → Consciente da solução → Consciente do produto → Pronta para comprar.
Cold audience NUNCA começa com o produto — começa com dor ou desejo.

GARY HALBERT — ESPECIFICIDADE:
"R$2.147 em 23 dias" > "ganhe muito dinheiro". "127 revendedoras em SP" > "muitas revendedoras".
Substitua todo adjetivo genérico por número ou detalhe concreto.
```

Por:

```ts
ALEX HORMOZI — EMPILHE O VALOR (da OFERTA, nunca da renda):
Equação: Resultado × Probabilidade ÷ Tempo × Esforço.
"Estampa exclusiva, pronta entrega, sem pedido mínimo, direto da fábrica" — empilhe valor da OFERTA e do PRODUTO. PROIBIDO empilhar promessa de renda/ganho.

JOANNA WIEBE — VOZ DA CLIENTE:
A dor real da revendedora é sobre o NEGÓCIO: "não acho fornecedor com pronta entrega e estampa que a cliente goste". Fale dessa dor — sem prometer renda nem atacar emprego/marido.
5 níveis de consciência: Inconsciente → Consciente do problema → Consciente da solução → Consciente do produto → Pronta para comprar.
Cold audience NUNCA começa com o produto — começa com a dor de SORTIMENTO/FORNECEDOR.

GARY HALBERT — ESPECIFICIDADE (sobre PRODUTO, nunca sobre renda):
"Suede premium 280g com 6 estampas exclusivas" > "pijama de qualidade". Substitua adjetivo genérico por detalhe concreto DO PRODUTO/OFERTA. PROIBIDO especificar valor de renda ("R$X em N dias") ou número não comprovável de revendedoras.
```

- [ ] **Step 5: Reforçar a ESTRUTURA DO BANNER (proibir renda na arte)**

Localize (linha ~207):

```ts
RESTRIÇÕES: SUEDE premium — NUNCA mencione algodão/viscose/viscolaicra. Fabricação própria é diferencial. PROIBIDO repetir valores antigos da memória (R$400, R$199, R$39,90, 5% PIX).
```

Troque por:

```ts
RESTRIÇÕES: SUEDE premium — NUNCA mencione algodão/viscose/viscolaicra. Fabricação própria é diferencial. PROIBIDO repetir valores antigos da memória (R$400, R$199, R$39,90, 5% PIX). PROIBIDO escrever na arte qualquer valor de RENDA/GANHO/FATURAMENTO ou "sem CNPJ" como promessa. O texto do BOTÃO tem que combinar com o destino real (site = "Comprar"/"Ver coleção"; nunca "QUERO REVENDER/WhatsApp" levando pro site).
```

- [ ] **Step 6: Plugar a trava no `proposeActions`**

Localize o bloco `if (actionType === "meta_create_full_ad")` dentro de `proposeActions` (linhas ~458-478):

```ts
      // Se é para criar novo anúncio, gera o copy criativo
      if (actionType === "meta_create_full_ad") {
        try {
          console.log(`[FernandaDaily] Gerando copy para: "${rec.slice(0, 60)}"`);
          const copy = await generateAdCopy(
            `Contexto da campanha Feminnita Pijamas:\n${rec}\n\nROAS atual: ${analysis.roas}x | Gasto: R$${analysis.spend.toFixed(2)}`
          );
          description = JSON.stringify({
            recommendation: rec,
            copy: {
              headline: copy.headline,
              body: copy.body,
              imageDescription: copy.imageDescription,
            },
            generatedBy: "fernanda",
            linkUrl: "https://www.feminnita.com.br",
          });
          console.log(`[FernandaDaily] Copy gerado: "${copy.headline}"`);
        } catch (err: any) {
          console.error("[FernandaDaily] Falhou ao gerar copy, usando texto simples:", err.message);
        }
      }
```

Troque por (gera → checa → 1 retry → bloqueia se persistir):

```ts
      // controla se a ação deve ser bloqueada por conformidade
      let complianceBlocked = false;
      let complianceViolations: string[] = [];

      // Se é para criar novo anúncio, gera o copy criativo
      if (actionType === "meta_create_full_ad") {
        const linkUrl = "https://www.feminnita.com.br";
        const baseContext = `Contexto da campanha Feminnita Pijamas:\n${rec}\n\nROAS atual: ${analysis.roas}x | Gasto: R$${analysis.spend.toFixed(2)}`;

        const gerarEChecar = async (ctx: string) => {
          const copy = await generateAdCopy(ctx);
          const briefText = [rec, copy.headline, copy.body, copy.imageDescription]
            .filter(Boolean)
            .join("\n");
          const violations = [
            ...checkCopyCompliance(briefText).violations,
            ...checkCreativeCoherence({ briefText, callToAction: "SHOP_NOW", linkUrl }),
          ];
          return { copy, violations };
        };

        try {
          console.log(`[FernandaDaily] Gerando copy para: "${rec.slice(0, 60)}"`);
          let { copy, violations } = await gerarEChecar(baseContext);

          // 1 tentativa de regenerar devolvendo as violações pra Beatriz
          if (violations.length > 0) {
            console.warn(`[FernandaDaily] Copy violou conformidade, regenerando 1x:`, violations);
            const retryCtx = `${baseContext}\n\n⛔ A copy anterior foi BLOQUEADA por conformidade Meta pelos motivos abaixo. Reescreva SEM nenhum deles, focando em produto/oferta (preço de fábrica, fabricação própria, pronta entrega, estampa exclusiva), nunca em promessa de renda:\n- ${violations.join("\n- ")}`;
            ({ copy, violations } = await gerarEChecar(retryCtx));
          }

          if (violations.length > 0) {
            complianceBlocked = true;
            complianceViolations = violations;
            console.error(`[FernandaDaily] Copy BLOQUEADA após retry — ação marcada como rejected:`, violations);
          }

          description = JSON.stringify({
            recommendation: rec,
            copy: {
              headline: copy.headline,
              body: copy.body,
              imageDescription: copy.imageDescription,
            },
            generatedBy: "fernanda",
            linkUrl,
            ...(complianceBlocked ? { complianceBlocked: true, complianceViolations } : {}),
          });
          console.log(`[FernandaDaily] Copy gerado: "${copy.headline}"`);
        } catch (err: any) {
          console.error("[FernandaDaily] Falhou ao gerar copy, usando texto simples:", err.message);
        }
      }
```

Agora localize o `toInsert.push({ ... })` logo abaixo (linhas ~480-491):

```ts
      toInsert.push({
        agentName: "fernanda",
        date: today,
        title,
        description,
        actionType,
        priority: inferPriority(rec),
        estimatedImpact: analysis.roas > 0
          ? `ROAS atual: ${analysis.roas}x | Spend: R$${analysis.spend.toFixed(2)}`
          : undefined,
        status: "pending",
      });
```

Troque por (ação bloqueada entra como `rejected`, com motivo, e nunca é publicada):

```ts
      toInsert.push({
        agentName: "fernanda",
        date: today,
        title: complianceBlocked ? `[BLOQUEADO — conformidade] ${title}`.slice(0, 200) : title,
        description,
        actionType,
        priority: inferPriority(rec),
        estimatedImpact: analysis.roas > 0
          ? `ROAS atual: ${analysis.roas}x | Spend: R$${analysis.spend.toFixed(2)}`
          : undefined,
        status: complianceBlocked ? "rejected" : "pending",
        userNote: complianceBlocked
          ? `Bloqueado automaticamente por conformidade Meta:\n- ${complianceViolations.join("\n- ")}`
          : undefined,
      });
```

- [ ] **Step 7: Verificar tipos**

Run: `npm run check`
Expected: PASS (sem novos erros de TypeScript em `fernanda-daily-agent.ts`). Se aparecerem erros pré-existentes não relacionados, anote mas não corrija (fora de escopo).

- [ ] **Step 8: Rodar a suíte de testes do gate + doutrina**

Run: `npx vitest run server/agents/compliance server/agents/doctrines`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add server/agents/fernanda-daily-agent.ts
git commit -m "feat(conformidade): Fernanda injeta doutrina, saneia exemplos e bloqueia copy nao-conforme"
```

---

## Task 4: Integrar na Beatriz (injetar doutrina + reforçar + remover número)

**Files:**
- Modify: `server/agents/beatriz-agent.ts`

- [ ] **Step 1: Adicionar import no topo**

Após a linha `import { eq, and } from "drizzle-orm";` (linha ~18), adicione:

```ts
import { META_COMPLIANCE_DOCTRINE } from "./doctrines/meta-compliance-doctrine";
```

- [ ] **Step 2: Injetar doutrina no topo do system prompt de `generateAdCopy`**

Localize (linha ~286):

```ts
        content: `Você é a Beatriz Santos — redatora publicitária sênior com 11 anos de experiência exclusiva em performance marketing para e-commerce e atacado de moda no Brasil. Formada em Publicidade pela ESPM, pós-graduada em Neuromarketing pela FGV. Trabalhou para marcas como Riachuelo, Lupo e diversas marcas DTC de moda. Especialista certificada em Meta Ads (Facebook Blueprint) e Google Ads.
```

Troque por:

```ts
        content: `${META_COMPLIANCE_DOCTRINE}

Você é a Beatriz Santos — redatora publicitária sênior com 11 anos de experiência exclusiva em performance marketing para e-commerce e atacado de moda no Brasil. Formada em Publicidade pela ESPM, pós-graduada em Neuromarketing pela FGV. Trabalhou para marcas como Riachuelo, Lupo e diversas marcas DTC de moda. Especialista certificada em Meta Ads (Facebook Blueprint) e Google Ads.
```

- [ ] **Step 3: Remover "ganho financeiro" do diferencial de gatilhos**

Localize (linha ~288):

```ts
SEU DIFERENCIAL: você não escreve copy genérico. Cada palavra é escolhida para ativar um gatilho psicológico específico — escassez, prova social, identidade, transformação ou ganho financeiro — calibrado para o estágio do funil e o perfil da persona.
```

Troque por:

```ts
SEU DIFERENCIAL: você não escreve copy genérico. Cada palavra é escolhida para ativar um gatilho psicológico específico — escassez, prova social, identidade ou transformação do negócio dela (sortimento, exclusividade, pronta entrega) — calibrado para o estágio do funil e o perfil da persona. NUNCA use promessa de renda/ganho como gatilho.
```

- [ ] **Step 4: Remover o número não comprovável de prova social**

Localize (linha ~304):

```ts
- Prova social disponível: mais de 2.000 revendedoras ativas no Brasil
```

Troque por:

```ts
- Prova social disponível: uma comunidade de revendedoras em todo o Brasil (NÃO use número específico — não é comprovável)
```

- [ ] **Step 5: Reforçar as REGRAS ABSOLUTAS do copy**

Localize (linha ~311):

```ts
- NUNCA mencione preço específico nem percentual de desconto
```

Troque por:

```ts
- NUNCA mencione preço específico nem percentual de desconto
- NUNCA prometa renda, ganho, lucro ou faturamento (nem valor, nem "renda garantida", nem "ganhe de casa")
- NUNCA use "golpe/scam", "sem CNPJ" como isca de renda, ou número não comprovável
```

- [ ] **Step 6: Verificar tipos**

Run: `npm run check`
Expected: PASS (sem novos erros em `beatriz-agent.ts`).

- [ ] **Step 7: Commit**

```bash
git add server/agents/beatriz-agent.ts
git commit -m "feat(conformidade): Beatriz injeta doutrina, remove numero nao comprovavel e proibe promessa de renda"
```

---

## Task 5: Verificação final

- [ ] **Step 1: Rodar a suíte inteira**

Run: `npm test`
Expected: PASS — incluindo os novos testes do gate e da doutrina; nenhuma regressão nos testes existentes.

- [ ] **Step 2: Verificação de tipos do projeto**

Run: `npm run check`
Expected: Sem novos erros introduzidos por esta mudança.

- [ ] **Step 3: Conferência manual (smoke) do gate com os criativos reais de hoje**

Run:
```bash
npx tsx -e "import('./server/agents/compliance/copyComplianceGate.ts').then(m=>{console.log(m.checkCopyCompliance('Ela faturou R$2.100 em 23 dias, sem CNPJ, sem sair de casa'));})"
```
Expected: `{ ok: false, violations: [ ...pelo menos 1... ] }` — confirma que o criativo perigoso de hoje seria bloqueado.

- [ ] **Step 4: Commit final (se houver ajustes)**

```bash
git add -A
git commit -m "test(conformidade): verificacao final da blindagem Meta"
```

---

## Self-Review (cobertura vs spec)

- Camada 1 (doutrina) → Task 2 + injeções nas Tasks 3.2 e 4.2. ✓
- Camada 2 (saneamento) → Tasks 3.3, 3.4, 3.5 (Fernanda) e 4.3, 4.4, 4.5 (Beatriz). ✓
- Camada 3 (trava) → Task 1 (gate + testes) + Task 3.6 (chokepoint `proposeActions`, retry 1x, status `rejected`). ✓
- Decisão "2.000 revendedoras sai" → Task 4.4. ✓
- Coerência criativo↔destino (preocupação explícita da usuária) → `checkCreativeCoherence` (Task 1) + regra na ESTRUTURA DO BANNER (Task 3.5). ✓
- Limitação honesta (texto sim, pixel não) → documentada no cabeçalho de `copyComplianceGate.ts` (Task 1.3). ✓
- Status de bloqueio compatível com o enum real (`rejected`, não "blocked") → Task 3.6. ✓
- Fora de escopo (executor, UI, demais agentes) → não tocados. ✓
