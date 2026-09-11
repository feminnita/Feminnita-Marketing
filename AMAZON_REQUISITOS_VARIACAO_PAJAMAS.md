# REQUISITOS OFICIAIS AMAZON BR — Famílias de Variação de Vestuário (PAJAMAS) via SP-API Listings Items 2021-08-01

> Compilado em 15/07/2026 a partir de documentação oficial (developer-docs.amazon.com, Seller Central Help) + fontes secundárias verificadas. Contexto: contas Feminnita (marca própria SEM Brand Registry) e FNT (marca "Genérico"), GTIN exemption, variation_theme SIZE/COLOR.
> **ALERTA DE PRAZO: 27/07/2026 — títulos passam a valer no máximo 75 caracteres (ver Q3).**

---

## Q1 — PAI "bloqueado" no Seller Central (DISCOVERABLE na API, não editável na UI)

**Causas conhecidas (em ordem de probabilidade no nosso caso):**

1. **Pai não aparece no filtro padrão do Manage Inventory.** O pai é entidade *non-buyable* (sem oferta/estoque). O filtro padrão "Fulfilled by" esconde SKUs sem oferta. Workaround confirmado em fórum oficial: mudar o filtro **"Fulfilled by" para "All/Todos"**, localizar o pai e editar pelo menu de 3 pontos. [Fórum Seller Central](https://sellercentral.amazon.com/seller-forums/discussions/t/73494712-65ae-4527-abed-aae491cc99e9)
2. **Classificação de produto inconsistente com o ASIN** ("This SKU has an inconsistent product classification with the ASIN"). Acontece quando o productType do pai difere do que o catálogo gravou (ex.: pai criado como PAJAMAS mas o ASIN classificado como SLEEPWEAR/SHIRT). A UI se recusa a abrir o editor. Correção: re-submeter o SKU pai com o productType que o `getCatalogItem` retorna para o ASIN.
3. **Atributos que a UI não mapeia.** O schema `parentageLevel=PARENT` aceita atributos que o formulário web de vestuário não renderiza; a UI trava campos de variação (color/size) criados via API e não aceita edição. Confirmado em fórum: campo do tema de variação "locked" em famílias criadas por API. Edição nesses casos: **flat file (template da categoria) ou API — nunca a UI**.
4. **Conflito de contribuições / detail page control.** Sem Brand Registry, as contribuições da conta disputam com outras fontes; atributos aparecem read-only quando outra contribuição "venceu". Brand Registry NÃO é requisito para variação, mas dá prioridade de contribuição e o "Review listing updates" (14 dias) nas mudanças automáticas.

**Como evitar no cadastro via API:**
- Pai e filhos com o MESMO productType, MESMA brand (byte a byte), MESMO variation_theme.
- Pai mínimo: apenas atributos exigidos pelo schema `PARENT` com `requirements=LISTING_PRODUCT_ONLY` — sem oferta, sem preço, sem estoque, sem imagens obrigatórias.
- Padronizar: família criada por API é gerenciada por API/flat file. Não depender da UI para reordenar imagem/adicionar filho (Q2/Q4 mostram como via PATCH/PUT).

Fontes: [Building Listings Management Workflows](https://developer-docs.amazon.com/sp-api/docs/building-listings-management-workflows-guide) · [Listings Items Troubleshooting](https://developer-docs.amazon.com/sp-api/docs/listings-items-api-issues-troubleshooting) · fóruns oficiais Seller Central.

---

## Q2 — IMAGENS (vestuário BR)

**MAIN image (regras oficiais G1881 + Style Guide de Apparel):**
- Fundo **branco puro RGB (255,255,255)** — uniforme. Off-white, sombra projetada ou cenário = issue **100588**.
- Produto ocupa **≥85% do quadro**, inteiro (nada cortado).
- **Vestuário adulto (fem/masc): OBRIGATÓRIO on-model** (em modelo humano), **de frente, uma única vista** — proibido frente+costas na mesma imagem; modelo só de costas não atende "vista frontal do produto". Cabelo atrás do ombro, sem cobrir o produto.
- **Infantil/bebê, acessórios, multipacks/kits: flat (off-model)**, sem manequim.
- Proibido na MAIN: texto, logo, marca d'água, bordas, gráficos, props, múltiplos produtos (exceto kit real).
- Técnico: JPEG (preferido) ou TIFF; **≥1000 px no lado maior** (habilita zoom; recomendado 1600 px+); sRGB.
- **MAIN ausente/reprovada = issue 18320 → suprimido da busca.**

**Slots:** `main_product_image_locator` (MAIN/PT00) + `other_product_image_locator_1` a `_8` (PT01–PT08) + `swatch_product_image_locator` (amostra de cor). Total 9 posições; a busca usa a MAIN, o detail page mostra até 7.

**Por variação:** cada FILHO carrega o próprio conjunto de imagens — a MAIN do filho deve mostrar a cor/estampa daquele filho (o cliente vê as imagens do filho selecionado). O pai não precisa de imagens (não é comprável); a "capa" exibida na busca vem do filho.

**Reordenar/trocar via API (sem UI):** `patchListingsItem` com `op: replace` — a posição É o nome do atributo:
```json
{"productType":"PAJAMAS","patches":[
 {"op":"replace","path":"/attributes/main_product_image_locator",
  "value":[{"media_location":"https://.../nova-capa.jpg","marketplace_id":"A2Q3Y263D00KWC"}]},
 {"op":"replace","path":"/attributes/other_product_image_locator_1",
  "value":[{"media_location":"https://.../foto2.jpg","marketplace_id":"A2Q3Y263D00KWC"}]}
]}
```
Para remover um slot: `op: delete` no path do slot. URL precisa ser pública; processamento é assíncrono (conferir depois com `getListingsItem` includedData=issues,attributes).

Fontes: [Requisitos de imagem G1881](https://sellercentral.amazon.com/help/hub/reference/external/G1881) · [Style Guide Apparel oficial (PDF)](https://m.media-amazon.com/images/G/01/SPIS/Fashion_Apparel_Imaging_Guidelines_Spring_2021.pdf) · [Submit images — Workflows Guide](https://developer-docs.amazon.com/sp-api/docs/building-listings-management-workflows-guide).

---

## Q3 — TÍTULOS (BR)

**Regra vigente (desde 21/01/2025):**
- Máx **200 caracteres** com espaços (maioria das categorias).
- Proibidos os caracteres `! $ ? _ { } ^ ¬ ¦` (exceto se parte da marca).
- Mesma palavra no máximo **2x** (exceto artigos/preposições/conjunções).
- **Proibido claim promocional/subjetivo**: "frete grátis", "promoção", "melhor", "100% garantido", "oferta" — e adjetivos subjetivos de qualidade. **"Muito Macio" cai aqui (issue 100473: frase/claim proibido)** — descrever o material objetivamente: "de Suede" em vez de "Muito Macio". Sem preço, sem condição do item.

**MUDANÇA 27/07/2026 (confirmada, todas as categorias exceto Mídia):**
- Título máx **75 caracteres** com espaços + novo campo **Item Highlights** (125 chars, indexável) para material/uso.
- Títulos acima do limite serão **substituídos gradualmente por sugestão de IA da Amazon**. Sem Brand Registry NÃO há janela de revisão de 14 dias — a troca é direta. **Encurtar nossos títulos ANTES do dia 27.**

**Formato recomendado vestuário:** `Marca + Tipo de Produto + Material/Atributo-chave` no PAI (sem cor/tamanho); nos FILHOS a Amazon anexa a variação. Ex.: `Feminnita Pijama Feminino Bermuda de Suede` (43 chars, sobra folga).

**Onde obter as listas oficiais:** [Requisitos de título GYTR6SYGFA5E3EQC](https://sellercentral.amazon.com/help/hub/reference/external/GYTR6SYGFA5E3EQC) (logado, locale pt-BR) · [Style Guides por categoria G200270100](https://sellercentral.amazon.com/gp/help/external/G200270100) · resumo verificado: [Amalytix](https://www.amalytix.com/en/knowledge/seo/amazon-product-title/), [Search Engine Land](https://searchengineland.com/amazon-title-policy-update-2025-450485).

---

## Q4 — FAMÍLIA: ordem de criação e erro 8007

**Ordem oficial (Workflows Guide, seção "Configure variation families"):**
1. **Schema do pai**: `getDefinitionsProductType /PAJAMAS?marketplaceIds=A2Q3Y263D00KWC&requirements=LISTING&parentageLevel=PARENT`.
2. **PUT do PAI primeiro**, com exatamente:
```json
"parentage_level":[{"value":"parent"}],
"child_parent_sku_relationship":[{"child_relationship_type":"variation"}],
"variation_theme":[{"name":"SIZE/COLOR"}]
```
   Pai é **non-buyable**: NÃO enviar oferta (preço/estoque/fulfillment). ("A parent listing must not be a buyable product.")
3. **Aguardar o pai processar** (getListingsItem até status DISCOVERABLE/sem issue bloqueante). Submeter filho antes do pai existir no catálogo = **erro 8007** ("unable to find the Parent SKU").
4. **PUT dos FILHOS** (schema `parentageLevel=CHILD`), cada um com:
```json
"parentage_level":[{"value":"child"}],
"child_parent_sku_relationship":[{"child_relationship_type":"variation","parent_sku":"SKU-DO-PAI"}],
"variation_theme":[{"name":"SIZE/COLOR"}]
```
   Tema SIZE/COLOR torna `size` e `color` **obrigatórios em cada filho** (+ `color_map`/`size_map` quando o schema pedir). Filho tem oferta completa (nosso `skip_offer:false` correto).
5. **Replicar os "product facts" do pai em todos os filhos** (brand, item_name base, material, productType, target_gender, age_range etc.). Divergência = conflito/família quebrada.

**Causas do 8007:** parent_sku digitado errado; pai não criado/rejeitado silenciosamente (checar issues do pai!); pai ainda processando; pai que é ele próprio filho de outro pai; pai sem `parentage_level=parent`.

**Gerenciar depois (sem Brand Registry — tudo via API):**
- *Adicionar variação*: PUT de um novo filho apontando `parent_sku` (pai intacto).
- *Trocar capa*: PATCH da MAIN dos filhos (a busca usa a MAIN do filho representante) — Q2.
- *Remover filho da família*: DELETE do filho remove só o vínculo dele; deletar o PAI desfaz a família inteira sem derrubar a compra dos filhos. Para mover um filho de família: remover a relação atual ANTES de apontar novo pai.

Fontes: [Workflows Guide — variation families](https://developer-docs.amazon.com/sp-api/docs/building-listings-management-workflows-guide) · [Erro 8007 — EasyChannel](https://www.easychannel.com/listing-errors/amazon-listing-error-8007-parent-sku-not-recognized) · [StoreAutomator 8007](https://support.storeautomator.com/hc/en-us/articles/4411196700306-How-to-Solve-Amazon-Error-Code-8007).

---

## Q5 — GTIN: exemption "Genérico" vs marca própria, e os erros 8560/13013

**Escopo da exemption:** concedida **por PAR (marca × categoria)**. "Genérico" só vale se o produto/embalagem NÃO exibe marca (exigem fotos provando). Marca própria sem Brand Registry PODE ter exemption — pede-se com o nome exato da marca + 2-9 fotos reais do produto/embalagem mostrando a marca.

**Regra de ouro:** o campo `brand` do listing deve bater **EXATAMENTE** (caixa, acento, espaço) com a marca da exemption aprovada, naquela categoria. `supplier_declared_has_product_identifier_exemption=true` só é aceito quando a conta TEM a exemption ativa para aquele par marca×categoria — senão vem 8560.

**Por que uns filhos casam ASIN e outros dão 8560/13013:**
- Sem GTIN, a Amazon faz *matching* por atributos (brand + título + productType + IDs). Filho cuja combinação coincide com ASIN existente → casa (vira oferta no ASIN). Filho sem match e sem exemption válida para a marca/categoria → **8560** (produto fora do catálogo / product ID inválido).
- **13013**: o SKU referenciado não existe no catálogo — típico de mandar patch/oferta (preço/estoque) para SKU cujo PUT de criação falhou antes. Sempre confirmar criação (getListingsItem) antes de qualquer update.
- **8541** (parente do 8560): conflito de atributo-identidade com ASIN já publicado — se o ASIN encontrado É o nosso produto, usar o próprio ASIN como identificador (`merchant_suggested_asin`) e resubmeter.

**Alternativas oficiais:** (1) EAN GS1 legítimo (GS1 Brasil) — resolve de vez e vale para todos os canais; (2) `merchant_suggested_asin` para ofertar em ASIN existente; (3) Brand Registry (marca registrada no INPI) — dispensa GTIN para a marca e destrava prioridade de contribuição. Códigos comprados fora da GS1 são rejeitados na validação.

Fontes: [Help GTIN exemption G200426310](https://sellercentral.amazon.com/gp/help/external/G200426310) · [Jungle Scout — GTIN exemption](https://www.junglescout.com/resources/articles/gtin-exemption-amazon/) · [Bar Codes Talk — 8541](https://support.barcodestalk.com/en/support/solutions/articles/16000096237) · [Troubleshooting 90188 (checksum EAN/UPC/GTIN)](https://developer-docs.amazon.com/sp-api/docs/listings-items-api-issues-troubleshooting).

---

## (b) CHECKLIST DE VALIDAÇÃO PRÉ-PUBLICAÇÃO (para codificar no pipeline)

### TÍTULO (pai e filhos)
- [ ] ≤ 75 caracteres com espaços (regra 27/07/2026; hoje ≤200, mas já validar 75)
- [ ] Sem caracteres `! $ ? _ { } ^ ¬ ¦`
- [ ] Nenhuma palavra repetida >2x (exceto artigos/preposições)
- [ ] Sem claims subjetivos/promocionais: regex-lista mínima BR: `muito macio|super|melhor|premium|promoção|oferta|frete grátis|garantido|100%|top|luxo|incrível|barato|imperdível|novidade|lançamento`
- [ ] Sem preço, sem condição, sem emoji/caractere decorativo
- [ ] Começa com a marca; pai SEM cor/tamanho no título
- [ ] Marca no título == campo `brand` == marca da exemption (byte a byte)

### IMAGENS (cada filho)
- [ ] `main_product_image_locator` presente (senão → 18320)
- [ ] MAIN: fundo branco puro — validar programaticamente: amostrar bordas da imagem, exigir ≥99% dos pixels de borda com RGB ≥ (250,250,250) (senão → 100588)
- [ ] MAIN: produto ≥85% do quadro (bounding box do não-branco / área total ≥ 0,85 — usar tolerância 0,80 e revisar manualmente entre 0,80-0,85)
- [ ] MAIN adulto: on-model, vista frontal única (checagem manual/visual — flag no pipeline para revisão humana)
- [ ] ≥1000 px lado maior (ideal ≥1600); JPEG; sRGB
- [ ] MAIN do filho mostra a COR do filho
- [ ] ≥6 imagens no total (meta retail-ready), slots `other_product_image_locator_1..8` sem buracos (preencher 1,2,3... em sequência)
- [ ] URLs públicas e respondendo 200

### ATRIBUTOS / FAMÍLIA
- [ ] Validar payload contra o JSON Schema do `getDefinitionsProductType` ANTES do PUT (requirements=LISTING, parentageLevel correto) — usar validador JSON Schema
- [ ] Pai: `parentage_level=parent` + `child_parent_sku_relationship.child_relationship_type=variation` + `variation_theme` — e NADA de oferta/preço/estoque/GTIN
- [ ] Filho: `parentage_level=child` + `parent_sku` + MESMO `variation_theme` do pai + `size` e `color` preenchidos (únicos por filho — combinação size×color não pode repetir)
- [ ] `brand`, `productType`, material, gênero IDÊNTICOS entre pai e todos os filhos
- [ ] `supplier_declared_has_product_identifier_exemption=true` só se exemption ativa p/ (marca, categoria); FNT → brand "Genérico" exato
- [ ] Pai criado e PROCESSADO (getListingsItem sem issue bloqueante) antes de submeter qualquer filho (senão → 8007)

### OFERTA (cada filho)
- [ ] Preço dentro do range são (R$80-150 ticket alvo da conta), estoque >0, fulfillment_availability
- [ ] `skip_offer:false` nos filhos; oferta AUSENTE no pai
- [ ] Pós-submissão: getListingsItem com includedData=issues,summaries — status alvo DISCOVERABLE/BUYABLE e zero issues severity ERROR; registrar issues WARNING no log

---

## (c) FLUXO DE CADASTRO RECOMENDADO (passo a passo)

1. **searchCatalogItems** (por keywords/EAN se houver): o produto já existe no catálogo? Se sim → oferta no ASIN existente (`merchant_suggested_asin`, requirements=LISTING_OFFER_ONLY) em vez de criar duplicado (evita 8541/8560).
2. **getListingsRestrictions** no ASIN (quando ofertar em existente) — checar elegibilidade.
3. **getDefinitionsProductType** PAJAMAS, 3 schemas: `parentageLevel=PARENT`, `=CHILD` e (p/ item solto) `=NONE`. Cachear por versão do schema; assinar notificação PRODUCT_TYPE_DEFINITIONS_CHANGE.
4. **Validar localmente** pai e todos os filhos contra o schema + CHECKLIST (b). Nada sobe com falha local.
5. **PUT do PAI** (`putListingsItem`, mode opcional VALIDATION_PREVIEW antes do real). Conferir resposta ACCEPTED.
6. **Poll do pai**: getListingsItem até aparecer no catálogo sem issue ERROR (com backoff; tipicamente minutos).
7. **PUT dos FILHOS** um a um (nossa regra: sem GTIN → 1 SKU por vez; lote trava com 8560), cada um com parent_sku + oferta completa + imagens.
8. **Poll dos filhos**: issues + summaries. Tratar: 8007→reconferir pai; 8560→conferir brand/exemption ou casar ASIN; 8541→usar ASIN existente; 18320/100588→corrigir MAIN e PATCH; 100473→reescrever título e PATCH.
9. **Verificação final na fonte** (regra de ouro): getListingsItem de TODOS os SKUs da família + abrir o detail page público do ASIN — família agrupada, seletor size/color funcionando, capa certa.
10. **Manutenção**: qualquer mudança (capa, título, nova variação) via patchListingsItem/putListingsItem com GET-backup do estado anterior. Não usar a UI do Seller Central para famílias criadas por API.

---

### Fontes principais
- [SP-API Building Listings Management Workflows Guide](https://developer-docs.amazon.com/sp-api/docs/building-listings-management-workflows-guide) (variation families, imagens, requirements)
- [SP-API Listings Items API Use Case Guide](https://developer-docs.amazon.com/sp-api/docs/listings-items-api-v2021-08-01-use-case-guide)
- [SP-API Listings Items Issues Troubleshooting](https://developer-docs.amazon.com/sp-api/docs/listings-items-api-issues-troubleshooting)
- [Requisitos de imagem G1881](https://sellercentral.amazon.com/help/hub/reference/external/G1881) · [Apparel Imaging Guidelines (PDF oficial)](https://m.media-amazon.com/images/G/01/SPIS/Fashion_Apparel_Imaging_Guidelines_Spring_2021.pdf)
- [Requisitos de título GYTR6SYGFA5E3EQC](https://sellercentral.amazon.com/help/hub/reference/external/GYTR6SYGFA5E3EQC) · [Style Guides G200270100](https://sellercentral.amazon.com/gp/help/external/G200270100)
- [GTIN exemption G200426310](https://sellercentral.amazon.com/gp/help/external/G200426310) · [Parent-child relationships G202135320](https://sellercentral.amazon.com/gp/help/external/G202135320)
- Secundárias verificadas: Amalytix (títulos 2026), Jungle Scout (imagens/GTIN), EasyChannel/StoreAutomator (8007), Bar Codes Talk (8541), fóruns oficiais Seller Central (pai não editável).
