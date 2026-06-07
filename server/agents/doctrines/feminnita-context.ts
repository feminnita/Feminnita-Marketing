// Contexto da loja (identidade) — compartilhado pelas agentes (Gabi/ML, Fernanda/Meta).
// Números de canal/ticket são SNAPSHOT real do banco (12 meses até ~jun/2026). Para o número
// vivo por SKU/produto, a agente usa a ficha da conta (ml_get_ficha_conta). Atualizar quando mudar muito.

export const FEMINNITA_CONTEXT = `
═══════════════════════════════════════════════════════
CONTEXTO DA LOJA — QUEM É A FEMINNITA (use isto para calibrar tudo)
═══════════════════════════════════════════════════════
- MARCA: Feminnita — moda íntima / dormir feminina. Categoria principal: PIJAMAS femininos (manga longa e curta, suede, canelado, estampado, linha Outono-Inverno) + lingerie/conforto. Sortimento amplo de estampas e modelagens, grade P/M/G/GG.
- DUAS CONTAS, MAS REGRA DE CANAL IMPORTANTE:
  • Feminnita (Conta A) = B2C, consumidor final, venda por peça em todos os marketplaces e site.
  • FNT Confecções (Conta B): **atacado B2B (grade fechada, revendedoras) SÓ na Tray.** Em TODOS os outros canais (Mercado Livre, Shopee, Amazon, etc.) a FNT vende **B2C, por peça, igual à Feminnita** — NÃO trate FNT como atacado fora da Tray.
  → Implicação p/ as agentes de marketplace (Gabi/Alice/etc.): a conta B nos marketplaces é varejo B2C — mesmo playbook da Feminnita (consumidor final), não "atacado/revendedoras".
- PÚBLICO B2C (Feminnita E FNT nos marketplaces): mulheres adultas (~25–55), compra por conforto, autoestima e presente; sensível a preço e foto/estampa. Forte no Sul/Sudeste.
- PÚBLICO B2B (só Tray/atacado): revendedoras — decidem por margem de revenda, variedade e pedido mínimo acessível.

NÚMEROS REAIS (snapshot 12m, ~jun/2026 — receita e ticket médio por canal):
- Atacado FNT (B2B, via Tray): R$ 1,96 mi | ticket ~R$ 14.870 (grade fechada — ÚNICO canal atacado)
- Mercado Livre:      R$ 1,64 mi  | ticket ~R$ 80   | ~20,5 mil pedidos  ← MAIOR canal B2C
- TikTok Shop:        R$ 344 mil  | ticket ~R$ 77
- Shopee:             R$ 132 mil  | ticket ~R$ 76
- Amazon:             R$ 91 mil   | ticket ~R$ 58
- Shein:              R$ 60 mil   | ticket ~R$ 82
- Tray (loja própria):R$ 41 mil   | ticket ~R$ 179
IMPLICAÇÃO PRÁTICA: o ticket B2C real é ~R$ 75–82 (NÃO é R$ 400). Isso define a régua: no ML, ticket ~R$ 80 fica EM CIMA do limite Clássico×Premium (≥R$79). Margem é apertada (produto físico) → cada real de ads conta; subir ticket (kit/combo) é alavanca real.

CONCORRÊNCIA: Lupo (referência nacional) + marcas regionais + vendedores de pijama atacado no ML/Shopee. Diferencial defensável da Feminnita = variedade de estampas/modelagens + atender varejo E atacado + relacionamento com revendedoras (não competir só por preço).

METAS / DOR: faturamento caiu de ~R$78k → ~R$20k/mês após uma agência ruim; meta é recuperar/escalar. Por isso: priorizar o que tem margem e giro (curva A), não queimar verba em cauda.
(Confirme com o Chris se algum diferencial/posicionamento mudou — este bloco é a base, a ficha traz o número vivo.)
`;
