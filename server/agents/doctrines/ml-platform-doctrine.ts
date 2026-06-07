// Doutrina de PLATAFORMA do Mercado Livre (Gabi). Fonte: Painel Vendedor ML (conta Feminnita)
// + Mercado Ads Academy, preparada pelo Chris em 07/06/2026 (DOUTRINA_ML.md).
// Complementa GABI_ML_DOCTRINE (margem/ACoS/curva ABC) com as mecânicas oficiais da plataforma.
// NÚMEROS de estado (qtd de anúncios, reputação, Full) são SNAPSHOT — a verdade ao vivo vem das tools/ficha.

export const ML_PLATFORM_DOCTRINE = `
═══════════════════════════════════════════════════════
DOUTRINA DE PLATAFORMA — MERCADO LIVRE (oficial)
═══════════════════════════════════════════════════════
Você não chuta: quando não tem certeza de uma regra, orienta a consultar a Central de Ajuda do ML.

━━━ ALGORITMO DE RANQUEAMENTO (ordem de impacto) ━━━
1. Relevância do título — keyword no INÍCIO é determinante
2. Conversão (CTR → CVR) — clique que vira compra
3. Reputação do vendedor — Verde > Amarelo > Laranja > Vermelho
4. Velocidade de envio — Flex e Full sobem no ranking
5. Ficha técnica completa — anúncio sem atributos some dos filtros laterais
6. Preço competitivo — preço alto vs. concorrência penaliza
7. Avaliações (quantidade + qualidade)
8. Histórico de vendas
9. Product Ads (pago) — posições destacadas
10. Mercado Envios Full — maior prioridade entre as logísticas

━━━ TÍTULO (regras oficiais) ━━━
Estrutura: [Produto] + [Marca/Modelo] + [Característica] + [Variações] + [Tamanhos]
- Limite 60 caracteres — usar TODOS, sem desperdiçar
- Keyword principal no início
- NUNCA repetir palavras (o algoritmo ignora repetição = espaço perdido)
- Sem artigos (o, a, de, para), sem pontuação/aspas/símbolos, sem promessa vazia
- ✅ "Pijama Feminino Calça Blusa Manga Longa Liganete P M G GG"
- ❌ "Pijama lindo e confortável qualidade premium tendência" / repetição de "Pijama"

━━━ FICHA TÉCNICA — TECIDO CORRETO (CRÍTICO) ━━━
Tecido errado (ex.: viscolaicra/viscose no lugar de SUEDE) causa: aparecer em busca errada → comprador recebe diferente → reclamação → derruba reputação → ML pode suspender.
Correção em MASSA: Anúncios → Alterar pelo Excel (exporta planilha → filtra coluna tecido → corrige → reimporta) OU Editor em Massa. Material Feminnita = SUEDE.

━━━ QUALIDADE DO ANÚNCIO ━━━
- Pontuação 0–100 na coluna "Qualidade". < 80 = atributos faltando → preencher.
- Coluna "Experiência" = fotos, descrição, prazo.
- Checklist do anúncio perfeito: título 60c keyword-início; ≥6 fotos (capa fundo branco); ficha 100% com tecido CORRETO; todas as variações com estoque; preço competitivo; descrição com benefícios + cuidados; EAN/GTIN quando houver; condição Novo; garantia preenchida.
- Seguir as "recomendações" do painel (frete grátis, preço atacado) sobe a pontuação.

━━━ MERCADO ADS (Product Ads) ━━━
Posições destacadas no topo da busca e na página de concorrentes. Orçamento diário, paga por clique (CPC).
Estratégia: anunciar SÓ produto com ficha boa (pontuação ≥80); começar pelos de mais venda orgânica (amplifica o que já funciona); não queimar verba em ficha ruim.
Ferramenta nova 2026 "Aumentar Seguidores": seguidores recebem notificação de promoção → venda recorrente sem custo de ads.
Capacitação gratuita c/ certificado: Mercado Ads Academy (academy.mercadoads.com) — Curso Product Ads, Certificação.

━━━ LOGÍSTICA → RANKING ━━━
Full (🥇 máxima prioridade) > Flex (🥈 entrega no dia) > Agências ML (🥉) > por conta do comprador (❌ sem prioridade).
Full em status "Cheio" = CD no limite → pode bloquear novos envios/reduzir prioridade → gerenciar estoque (tirar parado, enviar só alto giro).

━━━ REPUTAÇÃO (prioridade absoluta) ━━━
Termômetro: Verde (exposição máx) → Amarelo → Laranja → Vermelho (venda bloqueada).
Manter em 0%: reclamações, canceladas por você, mediações, envios incorretos.
Derruba: reclamação mal resolvida, cancelamento por falta de estoque, atraso, mediação perdida, descrição enganosa.

━━━ CENTRAL DE PROMOÇÕES ━━━
Desconto direto, Frete grátis, Oferta do dia, Desconto por quantidade.
Frete grátis aumenta MUITO a conversão e a visibilidade no ML — calcular se o ticket absorve o frete com margem; ativar nos de maior volume.

━━━ FLUXO OPERACIONAL ━━━
Diário: perguntas sem resposta (<24h); pedidos a despachar; reclamações pós-venda; estoque zerado em anúncio ativo.
Semanal: reputação verde; anúncios pendentes; oportunidade de preço por variação; ROAS/CPC de Product Ads; estoque Full.
Mensal: qualidade <80; fichas com tecido errado; títulos dos 20 mais vendidos; preço vs. concorrência; novas categorias.

━━━ PRIORIDADES (quando auditar a conta) ━━━
🔴 Corrigir tecido errado em massa (Excel) · resolver anúncios pendentes · checar Full "Cheio".
🟡 Revisar anúncios com preço alto · avaliar frete grátis · completar ficha dos "a melhorar" (priorizar maior visita).
🟢 Mercado Ads Academy · ativar "Aumentar Seguidores" · métricas personalizadas no Resumo.
`;
