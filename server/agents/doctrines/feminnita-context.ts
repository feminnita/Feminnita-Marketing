// Contexto da loja por CONTA. Feminnita (A) e FNT (B) são EMPRESAS SEPARADAS —
// NUNCA misturar dados de uma com a outra. Cada agente injeta só o contexto da conta ativa
// via contextoDaConta(account). Números = snapshot real do banco (12m, ~jun/2026).
// Para o número vivo por SKU, usar a ficha (ml_get_ficha_conta / get_ficha_conta) do MESMO canal da conta.

export const FEMINNITA_CONTEXT = `
═══════════════════════════════════════════════════════
CONTEXTO DA CONTA — FEMINNITA (Conta A) — use SÓ dados da Feminnita aqui
═══════════════════════════════════════════════════════
⚠️ FNT Confecções é OUTRA empresa/conta. NUNCA misture dados da FNT nesta análise — aqui você cuida exclusivamente da Feminnita.
- MARCA: Feminnita — moda íntima / dormir feminina. Categoria: PIJAMAS femininos (manga longa/curta, suede, canelado, estampado, linha Outono-Inverno) + lingerie/conforto. Sortimento amplo de estampas e modelagens, grade P/M/G/GG.
- MODELO: B2C, consumidor final, venda por peça nos marketplaces e site próprio. VENDA É SÓ NO SITE E NOS MARKETPLACES — NÃO vendemos nem atendemos por WhatsApp. O cliente compra direto (não "entra em contato" pra comprar); todo anúncio leva ao site/marketplace, nunca a um WhatsApp.
- PÚBLICO: mulheres adultas (~25–55), compram por conforto, autoestima e presente; sensíveis a preço e foto/estampa. Forte no Sul/Sudeste.
- NÚMEROS REAIS DA FEMINNITA (snapshot 12m, receita | ticket médio por canal):
  • Mercado Livre: R$ 1,64 mi | ticket ~R$ 80 | ~20,5 mil pedidos ← MAIOR canal
  • TikTok Shop:   R$ 344 mil | ~R$ 77
  • Shopee:        R$ 132 mil | ~R$ 76
  • Amazon:        R$ 91 mil  | ~R$ 58
  • Shein:         R$ 60 mil  | ~R$ 82
  • Tray (site):   R$ 41 mil  | ~R$ 179
- IMPLICAÇÃO: ticket B2C real ~R$ 75–82 (NÃO R$ 400). No ML, ~R$ 80 fica EM CIMA do limite Clássico×Premium (≥R$79). Margem apertada (produto físico) → cada real de ads conta; subir ticket (mais peças no pedido via desconto progressivo por quantidade, sem pedido mínimo) é alavanca.
- CONCORRÊNCIA: Lupo + marcas regionais + vendedores de pijama no ML/Shopee. Diferencial = variedade de estampas/modelagens + relacionamento (não competir só por preço).
- META/DOR: faturamento caiu de ~R$78k → ~R$20k/mês após agência ruim; meta recuperar/escalar. Priorizar margem e giro (curva A), não queimar verba em cauda.
`;

export const FNT_CONTEXT = `
═══════════════════════════════════════════════════════
CONTEXTO DA CONTA — FNT CONFECÇÕES (Conta B) — use SÓ dados da FNT aqui
═══════════════════════════════════════════════════════
⚠️ Feminnita é OUTRA empresa/conta. NUNCA misture dados da Feminnita nesta análise (nem use a curva A / campeões da Feminnita aqui). Trabalhe APENAS com o que a própria FNT vendeu.
- MARCA: FNT Confecções — moda íntima/dormir feminina (pijamas, camisolas, baby doll, short doll). Fabricação própria.
- MODELO POR CANAL:
  • **Atacado B2B — SÓ na Tray** (grade fechada, revendedoras, ticket alto). É onde a FNT fatura de verdade.
  • **Marketplaces (Mercado Livre, Shopee, Amazon, TikTok, Shein) = VAREJO B2C, por peça** — mesma lógica de consumidor final. Contas NOVAS, volume ainda baixo.
- NÚMEROS REAIS DA FNT (snapshot 12m, receita por canal):
  • Atacado (Tray, B2B): R$ 1,96 mi  ← negócio principal da FNT (atacado)
  • Shopee (B):  R$ 16,6 mil | ~R$ 53
  • TikTok (B):  R$ 5,6 mil
  • Shein (B):   R$ 5,4 mil
  • Mercado Livre (B): R$ 980 | conta NOVA, pouquíssimo volume
  • Amazon (B):  R$ 383 | conta NOVA
- IMPLICAÇÃO (marketplaces): são contas NOVAS, em construção. O jogo é CONSTRUIR velocidade de venda e reputação, não otimizar curva A madura. Concentrar a verba limitada nos modelos que a PRÓPRIA FNT já está vendendo (os que aparecem subindo na ficha dela), não pulverizar. ACoS-teto = a margem do próprio produto.
- PÚBLICO (varejo): mulheres adultas, consumidor final, conforto/preço/estampa.
`;

/** Retorna o contexto da conta ativa. FNT e Feminnita NUNCA se misturam. */
export function contextoDaConta(account?: string): string {
  return account === "fnt" ? FNT_CONTEXT : FEMINNITA_CONTEXT;
}
