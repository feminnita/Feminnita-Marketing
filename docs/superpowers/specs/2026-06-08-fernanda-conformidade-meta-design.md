# Blindagem de Conformidade — Fernanda & Beatriz (Meta Ads)

**Data:** 2026-06-08
**Projeto:** feminnita-marketing-dev
**Autor:** Chris + Claude Code

---

## 1. Problema

A Fernanda (agente Meta Ads) gerou orientação para dois criativos cuja copy
viola a política de claims do Meta (promessa de renda específica, "sem CNPJ",
"golpe" como gancho, depoimento não comprovável). O Opus do desktop ("Cláudio")
revisou e barrou antes de subir. O sistema de revisão funcionou — o problema é
estrutural, não pontual.

### Causa raiz (com evidência)

A copy perigosa **não foi um deslize** — foi exatamente o que os prompts mandam
a Fernanda fazer. Os exemplos de copy ensinados em `fernanda-daily-agent.ts`
(`SYSTEM_PROMPT_DAILY`) **são** as infrações:

- `fernanda-daily-agent.ts:169` → *"Em 30 dias revendendo de casa ela faturou R$2.100"*
- `fernanda-daily-agent.ts:196` → *"R$2.147 em 23 dias"*
- `fernanda-daily-agent.ts:188` → *"R$2.000/mês de casa, sem estoque, sem CNPJ, em 48h"*
- `fernanda-daily-agent.ts:172` / `:176` → uso de "golpe/scam" como gatilho de parada

Além disso, a seção **ESTRUTURA DO BANNER** (`fernanda-daily-agent.ts:199-207`)
faz a Fernanda **ditar o texto que vai escrito na arte** (título, preço, CTA,
rodapé). Ou seja: o número de renda no banner e o texto do botão são **texto
gerado pela Fernanda**, não pixel — portanto, são detectáveis por software.

A `beatriz-agent.ts` (`generateAdCopy`) escreve a copy final e já tem uma trava
parcial (`NUNCA mencione preço específico`), mas **nada** sobre promessa de renda.

### O que NÃO é o problema

A estratégia de tráfego e os frameworks de copy adicionados na sessão anterior
(Pedro Sobral, Hormozi, Gary Halbert, Dara Denny, etc.) são valiosos e
**permanecem**. Falta apenas a camada de conformidade — nunca foi adicionada.

---

## 2. Objetivo / Critérios de sucesso

1. Nenhum brief/copy com promessa de renda específica, "sem CNPJ" como isca de
   renda fácil, "golpe/scam" como gancho, ou depoimento não comprovável chega ao
   painel de aprovação como ação pronta.
2. A Fernanda e a Beatriz param de **gerar** esse tipo de conteúdo na origem.
3. Existe uma trava mecânica de backstop que pega violação mesmo se a IA
   escorregar — automática, sem depender de revisão humana manual.
4. Testes provam que todos os exemplos perigosos de hoje são bloqueados e que os
   equivalentes seguros passam.

---

## 3. Arquitetura — 3 camadas

### Camada 1 — Doutrina de Conformidade (arquivo novo, compartilhado)

**Arquivo:** `server/agents/doctrines/meta-compliance-doctrine.ts`
Exporta `META_COMPLIANCE_DOCTRINE` (string), injetada **no topo** (prioridade
máxima, antes de qualquer instrução de copy agressiva) de:
- `SYSTEM_PROMPT_DAILY` em `fernanda-daily-agent.ts`
- O system prompt de `generateAdCopy` em `beatriz-agent.ts`

Regras "PROIBIDO" (valem para copy **e** para texto ditado na arte):
- Prometer/insinuar valor de renda, ganho, lucro ou faturamento específico
  ("ela faturou R$X", "R$2.000/mês", "renda de R$X em N dias").
- "Renda garantida", "dinheiro fácil", "lucro garantido", "sem sair de casa"
  como **promessa financeira**.
- Depoimento, caso ou número não comprovável sobre uma pessoa.
- "Golpe", "scam", "furada" como gancho.
- Mandar escrever na arte (título/preço/CTA/rodapé) qualquer número de renda ou
  promessa financeira.
- Incoerência criativo↔destino: texto/botão na imagem prometendo uma ação
  (ex.: "QUERO REVENDER" / WhatsApp) divergente do `call_to_action` real e da
  landing de destino.

Regras "PODE" (substituem o ângulo de renda):
- Preço de fábrica / atacado vs. varejo (fato de compra, não promessa de renda).
- Fabricação própria, suede premium, pronta entrega, exclusividade de estampa,
  variedade de sortimento, suporte pós-venda.
- Vender **o produto e a oferta**, nunca a promessa de renda da revendedora.

### Camada 2 — Saneamento dos exemplos envenenados

Edições cirúrgicas (mantendo o estilo e a força de copy, trocando só o ângulo):
- `fernanda-daily-agent.ts` seção COPY & CRIATIVO (linhas ~162-197): trocar os
  exemplos de renda (169, 188, 196) e os de "golpe/scam" (172, 176) por
  equivalentes de produto/oferta seguros.
- `fernanda-daily-agent.ts` ESTRUTURA DO BANNER (199-207): reforçar que a linha
  PREÇO/OFERTA nunca contém valor de renda; só preço de produto se for dado real.
- `beatriz-agent.ts` `generateAdCopy`: o gatilho "ganho financeiro" (linha ~288)
  passa a ser explicitamente condicionado pela doutrina de conformidade; manter
  "NUNCA mencione preço específico" e somar "NUNCA prometa renda/ganho".

Nenhuma refatoração fora desse escopo. A prova social "2.000 revendedoras"
(`beatriz-agent.ts:304`) só permanece se for número real; caso contrário, vira
genérico ("milhares") ou é removida — confirmar com Chris.

### Camada 3 — Trava automática (arquivo novo)

**Arquivo:** `server/agents/compliance/copyComplianceGate.ts`
Exporta `checkCopyCompliance(text: string): { ok: boolean; violations: string[] }`.

- Detecta por padrão (regex/keyword, case-insensitive, tolerante a acento):
  - Valor monetário + tempo/ganho: `R$\s?\d` perto de "faturou/ganhou/lucro/renda/por mês/em N dias".
  - "sem CNPJ" próximo de renda/ganho/lucro.
  - "renda garantida", "lucro garantido", "dinheiro fácil", "ganhe dinheiro de casa".
  - "golpe", "scam", "furada" usados como gancho.
- Recebe o **texto concatenado do brief inteiro**: recomendação da Fernanda +
  headline + body + imageDescription + linhas do banner (título/preço/CTA/rodapé).

**Plugagem (chokepoint único):** em `proposeActions` (`fernanda-daily-agent.ts`),
no ramo `actionType === "meta_create_full_ad"`, após `generateAdCopy`:
1. Rodar `checkCopyCompliance` no brief concatenado.
2. Se violar → **1 tentativa** de regenerar a copy passando as violações de volta
   pra Beatriz no contexto.
3. Se ainda violar → a ação é gravada com `status: "blocked"` (ou
   `priority` rebaixada + título prefixado `[BLOQUEADO — conformidade]`) e
   **não** entra no painel como ação pronta para publicar.

---

## 4. Limitação honesta (escopo)

A trava lê **texto**. Não lê pixel. Cobre tudo que a Fernanda escreve — copy e
texto ditado para a arte (título/preço/CTA/rodapé). O único resíduo é um designer
pintar na arte um número que a Fernanda **não** pediu; como na operação a Fernanda
dita o brief inteiro, a cobertura é praticamente total. A revisão humana da arte
final permanece como última conferência. Não há proteção de OCR de imagem neste
escopo (possível evolução futura, fora deste spec).

---

## 5. Testes

`copyComplianceGate` (unitário):
- BLOQUEIA: cada exemplo perigoso de hoje ("ela faturou R$2.100", "R$2.147 em 23
  dias", "R$2.000/mês sem CNPJ", "achei que era golpe", botão "QUERO REVENDER"
  com destino site).
- PASSA: equivalentes seguros ("preço de fábrica", "fabricação própria",
  "pronta entrega", "suede premium", copy sem valor de renda).

Integração leve: `proposeActions` com copy violadora → ação fica `blocked`/flag
e não vira `meta_create_full_ad` pronta.

---

## 6. Arquivos tocados

| Arquivo | Ação |
|---|---|
| `server/agents/doctrines/meta-compliance-doctrine.ts` | **novo** — doutrina |
| `server/agents/compliance/copyComplianceGate.ts` | **novo** — trava + tipos |
| `server/agents/fernanda-daily-agent.ts` | injetar doutrina + sanear exemplos + plugar trava em `proposeActions` |
| `server/agents/beatriz-agent.ts` | injetar doutrina + reforçar regras em `generateAdCopy` |
| testes do gate | **novo** |

Fora de escopo: `fernanda-executor.ts` (só publica o que foi aprovado), UI do
painel, demais agentes que não geram copy de anúncio.
