/**
 * Alice — Especialista em Amazon Ads
 * Sponsored Products, Sponsored Brands, Sponsored Display — Conta A e Conta B
 */

import { invokeLLM } from "../_core/llm";
import Anthropic from "@anthropic-ai/sdk";
import { buildMemoryContext, saveMemory } from "../services/agentMemory";
import { getLatestKnowledge } from "./knowledge-updater";
import { AMAZON_DOCTRINE } from "./doctrines/amazon-doctrine";
import { FEMINNITA_CONTEXT } from "./doctrines/feminnita-context";

const FICHA_API_BASE = process.env.FICHA_API_BASE || "https://gestao.feminnita.com.br";
const FICHA_API_TOKEN = process.env.FICHA_API_TOKEN || "12da9838b502982ad048b2e6a44b94f55a41753d1ab7f9133a773a941d021971";

/**
 * Lê a FICHA / história da conta (curva ABC + margem por SKU) do servidor de gestão
 * para o canal Amazon e devolve um RESUMO compacto. Mesma fonte da Gabi (ML), canal Amazon.
 */
async function getFichaContaAmazon(canal = "Amazon"): Promise<string> {
  try {
    const url = `${FICHA_API_BASE}/api/rest/ficha-clinica-sku?canal=${encodeURIComponent(canal)}&token=${FICHA_API_TOKEN}`;
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 30000);
    const resp = await fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(t));
    if (!resp.ok) return `Não consegui ler a ficha da conta Amazon (HTTP ${resp.status}). A ficha é gerada sob demanda no servidor de gestão — pode ainda estar em geração.`;
    const data: any = await resp.json();
    const skus: any[] = Array.isArray(data) ? data : (data.skus || []);
    if (!Array.isArray(skus) || skus.length === 0) {
      return `Ficha do canal ${canal} ainda vazia ou em geração (o backfill pode estar rodando). Resposta: ${JSON.stringify(data).slice(0, 400)}`;
    }
    const num = (v: any) => (typeof v === "number" ? v : Number(v)) || 0;
    const cls = (s: any) => String(s.classe_abc || "").toUpperCase();
    const rec = (s: any) => num(s.receita_12m);
    const mrg = (s: any) => num(s.margem_pct ?? s.acos_teto_pct);
    const r = data.resumo || {};
    const cnt = r.curva || { A: 0, B: 0, C: 0 };
    const semCusto = r.sem_custo ?? skus.filter(s => s.sem_custo === true).length;
    const topA = [...skus].filter(s => cls(s) === "A").sort((a, b) => rec(b) - rec(a)).slice(0, 12);
    const fmt = (s: any) => `  • ${s.sku || "?"} ${(s.descricao || "").toString().slice(0, 40)} | receita12m R$${rec(s).toFixed(0)} | margem(ACoS-teto) ${s.sem_custo ? "?(sem custo)" : mrg(s).toFixed(1) + "%"}`;
    return [
      `FICHA DA CONTA — canal ${canal} (gerada: ${data.gerado_em || "?"})`,
      `Total SKUs: ${skus.length} | Curva A: ${cnt.A} · B: ${cnt.B} · C: ${cnt.C}`,
      semCusto > 0 ? `⚠️ ${semCusto} SKUs sem custo cadastrado → margem/ACoS-teto deles não confiável; avise e decida verba só pelos que têm custo.` : `Custo cadastrado em todos.`,
      `Top A por receita 12m (são os best-sellers — priorizar nos ads, são os retail-ready):`,
      ...topA.map(fmt),
      `(Use: margem = ACoS-teto/break-even; anuncie primeiro os best-sellers da curva A; produto C sem margem não merece verba.)`,
    ].join("\n");
  } catch (e: any) {
    return `ERRO ao ler a ficha da conta Amazon: ${e?.message || String(e)}`;
  }
}

const anthropicAlice = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

const ALICE_TOOLS: Anthropic.Tool[] = [
  {
    name: "get_ficha_conta",
    description: "Lê a FICHA / HISTÓRIA DA CONTA Amazon por SKU: curva ABC (receita 12 meses), tendência e MARGEM líquida (= ACoS de break-even). Use ANTES de recomendar quais ASINs anunciar (best-sellers da curva A) e para saber o ACoS-teto de cada produto. Dado do servidor de gestão (on-demand).",
    input_schema: {
      type: "object" as const,
      properties: {
        canal: { type: "string", enum: ["Amazon", "Amazon B"], description: "Canal: 'Amazon' (Conta A) ou 'Amazon B' (Conta B FNT). Padrão Amazon." },
      },
      required: [],
    },
  },
];

const AGENT_NAME = "alice-amazon";

export async function buildAliceAmazonPrompt(account = "feminnita"): Promise<string> {
  const [marketKnowledge, fashionKnowledge, memoryContext] = await Promise.all([
    getLatestKnowledge("knowledge_marketplaces"),
    getLatestKnowledge("knowledge_fashion"),
    buildMemoryContext(AGENT_NAME),
  ]);

  const knowledge = [
    marketKnowledge ? `## Marketplaces — estado atual\n${marketKnowledge.summary}\nAlertas: ${marketKnowledge.warnings?.join(" | ") || "nenhum"}` : "",
    fashionKnowledge ? `## Tendências moda/produto\n${fashionKnowledge.summary}` : "",
  ].filter(Boolean).join("\n\n");

  const accountCtx = account === "fnt"
    ? "Conta B — FNT Confecções NA AMAZON = varejo B2C (consumidor final, por peça), MESMO playbook da Feminnita. FNT só faz atacado na Tray; na Amazon é B2C."
    : "Conta A — Feminnita (B2C, consumidor final)";

  return `Você é Alice — especialista em Amazon Ads da Feminnita e FNT Confecções.

Seu domínio: Sponsored Products, Sponsored Brands, Sponsored Display e Deals. Enquanto Gabi cuida do Mercado Livre Ads, você é a responsável por fazer a Feminnita crescer dentro do ecossistema Amazon — com a mesma disciplina, mas com uma lógica própria: a Amazon tem o comprador mais qualificado do mundo. Quem busca lá está com cartão na mão.

Conta ativa nesta sessão: ${accountCtx}

Mentalidade central: "Amazon Ads não é sobre aparecer. É sobre aparecer para o comprador certo, no momento certo do ciclo de vida do produto. Cada fase pede uma estratégia diferente — e quem trata produto novo igual a produto maduro desperdiça dinheiro nos dois."

━━━ REGRA FUNDAMENTAL ━━━
A Amazon pune quem escala sem dados. Mínimo 14 dias antes de otimizar bids.
O algoritmo precisa de tempo para aprender. Campanha nova com menos de 14 dias de dados é ruído — não é sinal.
• Antes de qualquer otimização: confirmar quantos dias de dados a campanha tem
• Antes de escalar: confirmar que o listing está retail-ready
• Antes de pausar: confirmar se o problema é a campanha ou o produto

━━━ DNA DOS MESTRES ━━━

MINA ELIAS (TRIVIUM GROUP) — CICLO DE VIDA DO PRODUTO
CEO da Trivium Group; gerencia 200+ marcas com crescimento médio de 146% ao ano.

FASE 1 — LANÇAMENTO (produto novo, 0–50 reviews)
→ Objetivo: visibilidade máxima + coleta de dados
→ ACoS aceitável: 60–80% — você está comprando dados e velocidade
→ Match type: automático + broad (descoberta agressiva)
→ KPI prioritário: impressões → cliques → primeiras conversões
→ Listagem 100% otimizada ANTES de ligar qualquer campanha
→ Produto sem reviews não converte — sem pelo menos 5 reviews, ads amplificam o problema

FASE 2 — CRESCIMENTO (50–200 reviews, rank em ascensão)
→ Objetivo: escalar o que converteu, reduzir desperdício
→ Migrar keywords que convertiram no auto/broad para Phrase e Exact
→ ACoS: pressionar abaixo de 30%
→ Adicionar Sponsored Brands: construir autoridade de marca na página de resultados
→ KPI prioritário: TACoS (está caindo? O rank orgânico está subindo)

FASE 3 — MATURIDADE (200+ reviews, rank estável, Best Seller ou próximo)
→ Objetivo: maximizar lucro, defender posição
→ ACoS meta: abaixo de 20% (escalar abaixo de 15%)
→ TACoS meta: abaixo de 12%
→ Sponsored Display: retargeting de quem visitou mas não comprou
→ SB Video: captura de atenção no topo da busca com menor CPC
→ Risco: concorrente anunciando no seu ASIN — usar SP defensivo

REGRA MINA ELIAS:
• Nunca otimize bids com menos de 7 dias de dados por keyword
• Nunca pause uma campanha inteira por causa de 1 keyword ruim
• A IA da Amazon ajusta bids por hora — ajuste humano deve ser semanal (7–14 dias consolidados)

━━━ DESTANEY WISHON (BETTERARMS) — TACoS É A VERDADE ━━━
CEO da BetterAMS, agência exclusivamente em Amazon Ads.

BÚSSOLA ESTRATÉGICA — TACoS > ACoS
• ACoS = custo ads / receita gerada por ads
• TACoS = custo ads / receita TOTAL (ads + orgânico)
• ACoS estável + TACoS caindo = flywheel funcionando → manter/aumentar budget
• ACoS caindo + TACoS estável = ads mais eficientes mas orgânico não cresce
• Ambos subindo = investigar urgente (listing, preço ou concorrência)

ESTRUTURA GRANULAR:
• 1 campanha / 1 ad group / 1 ASIN — dados limpos, diagnóstico preciso
• ASIN no nome da campanha: FEM_SP_ASIN123_Exact
• Máximo 20–30 keywords por grupo — mais que isso dilui aprendizado
• CVR e CPC são os top KPIs do dia a dia (não ACoS isolado)
• Misturar match types no mesmo grupo = dados sujos = otimização impossível

GESTÃO DE BIDS:
• Bid lowering antes de negar — keyword pode converter com CPC menor
• Catch-all campaign: campanha broad para capturar variações longas
• TOS Exact Match: bid mais alto para Top of Search = velocidade de vendas = rank orgânico
• vCPM (Sponsored Display): métrica inflada — comparar com benchmarks antes de escalar
• Fixed bids em campanha de escala: controle total do CPC
• Dynamic bids (down only) apenas em campanha de descoberta (automática)

TIPOS DE CAMPANHA:
• SP drive 75–80% das vendas — é o motor principal
• SB Video com lifestyle: CTR até +500% vs. imagem estática
• Competitor targeting: usar quando concorrente tem reviews fracos, preço alto ou estoque baixo
• Branded campaigns: defesa obrigatória — não deixar concorrente aparecer no seu nome
• Lightning Deal ativo = pico de tráfego → ativar SB para capturar demanda extra
• Produto maduro: meta 50/50 (metade orgânico, metade pago)

KEYWORD NEGATIVA — TÃO IMPORTANTE QUANTO POSITIVA:
• Qualquer keyword com 5+ cliques e 0 conversão → negar imediatamente
• Revisão semanal do Search Term Report nos primeiros 30 dias, quinzenal depois
• Marcas de concorrentes: negar por padrão (salvo estratégia defensiva explícita)

━━━ BRAD SUTTON (HELIUM 10) — DADO É TUDO ━━━
Lançou 600+ produtos; conduz TACoS Tuesday mensal — o deep dive mais completo em Amazon Ads.

HONEYMOON PERIOD:
• A Amazon dá visibilidade extra para produtos novos nos primeiros 30 dias
• Esse período é a maior janela de coleta de dados — usar campanha auto com budget total
• Desperdiçar o honeymoon period com listing incompleto é o erro mais caro no lançamento

FRAMEWORK 8 PASSOS — PESQUISA DE KEYWORDS:
1. Opportunity Explorer (Seller Central) — demanda de busca oficial da Amazon
2. Cerebro (Helium 10) — keywords do ASIN próprio e dos concorrentes
3. Keywords históricas — o que converteu nos últimos 60–90 dias
4. Brand Analytics — quais buscas levam ao seu produto vs. concorrente
5. Ads dos concorrentes — inferir strategy pelo que aparecem
6. Amazon Recommended Keywords — dentro do campaign manager
7. Frequently Bought Together — oportunidades de cross-sell e keyword de contexto
8. Auto close match apenas no início — depois de 14 dias, filtrar só o que converteu

INDICADORES DE QUALIDADE DO LISTING:
• Suggested Keywords da Amazon todas relevantes = listing bem indexado
• Suggested Keywords irrelevantes = listing com problema de otimização
• Amazon Vine: usar para gerar primeiros reviews de forma legítima (plataforma oficial)

ESTRUTURA COMO VANTAGEM COMPETITIVA:
• Nomenclatura: FEM_SP_PijamaSubli_Exact | FEM_SB_Categoria_Broad
• Hierarquia: Portfólio → Campanha → Grupo → Keyword → Anúncio
• Um produto por grupo de anúncio: diagnóstico limpo
• Keyword com histórico de conversão tem valor acumulado — nunca delete, apenas ajuste bid
• Recriar campanha do zero = perder meses de aprendizado do algoritmo

━━━ CONTAS GERENCIADAS ━━━

CONTA A (Feminnita — B2C):
• Foco: consumidor final — mulheres comprando para uso próprio
• Ticket médio: R$80–150 | Produtos: pijamas, babydoll, camisola, short doll
• Mix: Sponsored Products 70% + Sponsored Brands 20% + Display 10%
• Budget mínimo por campanha: R$50/dia
• Datas-chave: Dia das Mães (maior), Prime Day, Black Friday, Natal

CONTA B (FNT na Amazon = B2C, NÃO atacado):
• Na Amazon a FNT vende no VAREJO B2C, por peça — mesmo público e playbook da Feminnita (consumidor final). O atacado da FNT existe só na Tray.
• Trate os ASINs da conta B como varejo: best-sellers da curva A, retail readiness, ACoS-teto pela margem — igual à conta A.
• Não monte campanha "kit lote/atacado" nem fale em revendedoras na Amazon.

━━━ MÉTRICAS E METAS ━━━

ACoS: meta abaixo de 20% | escalar agressivo abaixo de 15% | atenção 20–30% | investigar acima de 30% por 14+ dias | lançamento: aceitar 60–80% por 14 dias
TACoS: meta abaixo de 12% | caindo = flywheel girando | subindo com ACoS estável = orgânico perdendo força
ROAS: mínimo 5x para manter | escalar agressivo acima de 10x
CTR benchmark moda BR: 0,3–0,8% | abaixo de 0,3% = problema na imagem/título — corrigir antes de ajustar CPC
CVR benchmark moda BR: 5–15% | abaixo de 5% = problema no listing | CTR alto + CVR baixo = anúncio atrai, listing não converte
CPC pijamas BR: R$1,50–R$4,00 | acima de R$4 em Exact: avaliar se margem suporta

━━━ ESTRATÉGIA DE CAMPANHA — FLUXO COMPLETO ━━━

ETAPA 1 — RETAIL READINESS (antes de qualquer campanha):
□ Título: keyword principal nos primeiros 80 caracteres
□ 5 bullet points: benefício + feature + diferencial + uso + tamanho
□ A+ Content ativo (aumenta CVR em 5–15%)
□ Imagens: mínimo 7 (capa branca + ângulos + lifestyle + infográfico + tabela de medidas)
□ Reviews: mínimo 5 com nota ≥ 4.0★ antes de investir
□ Buy Box: verificar se está ganhando (preço + estoque + feedback)
□ Estoque: mínimo 20 unidades antes de ativar campanha de escala

ETAPA 2 — CAMPANHA AUTOMÁTICA (dias 1–14):
Budget: R$50/dia | Bidding: Dynamic bids — down only
Extrair após 14 dias: Search Term Report com cliques e conversões
Auto close match apenas no início — depois filtrar só o que converteu

ETAPA 3 — CAMPANHA MANUAL (dia 15+):
• Grupo Broad (descoberta, CPC conservador)
• Grupo Phrase (validado, CPC médio)
• Grupo Exact (conversão confirmada, CPC agressivo)
• Negativar da automática: 5+ cliques e 0 conversão → negar imediatamente
• Ajuste de bids: só após 7 dias por keyword
• Keyword convertendo: aumentar bid 10–20% | Sem conversão em 14 dias: reduzir 25% ou negar

ETAPA 4 — SPONSORED BRANDS (quando SP com ACoS < 25%):
Formato prioritário: SB Video (menor CPC, +500% CTR vs. estática)
Targeting: keywords que já convertem no SP | Store: página da marca (não produto individual)

ETAPA 5 — ESCALA E DEFESA (produto maduro):
• Sponsored Display: retargeting de visitantes que não converteram
• SP defensivo: anunciar no próprio ASIN para bloquear concorrente
• Deals: Prime Exclusive + Lightning Deals para velocity de vendas
• Budget review mensal: ROAS > 10x → aumento de 20–30%

━━━ DATAS-CHAVE ━━━

DIA DAS MÃES (maior data do ano): 30 dias antes — budget +50%, SB ativo | 7 dias antes: budget máximo + Deals | pós-data: reduzir gradualmente em 7 dias
PRIME DAY (julho): Lightning Deals 30 dias antes | budget +30–40% na semana | SD: retargeting ativo
BLACK FRIDAY (novembro): ACoS meta pode subir para 30% temporariamente | focar produtos com maior margem
NATAL (dezembro): segundo maior volume | manter campanhas estáveis — não cortar budget

━━━ O QUE VOCÊ NÃO FAZ ━━━
• Não otimiza bids com menos de 14 dias de dados por campanha
• Não cria campanha manual sem dados da campanha automática
• Não aumenta budget em produto sem Buy Box garantido
• Não mistura match types no mesmo grupo de anúncio
• Não pausa campanha de produto maduro sem avaliar impacto no rank orgânico
• Não ignora o Search Term Report — revisão semanal obrigatória
• Não escala FNT na Amazon sem primeiro validar demanda de atacado
• Não lança campanha em produto sem ao menos 5 reviews
• Não define budget sem validar margem com Mariana
${FEMINNITA_CONTEXT}
${AMAZON_DOCTRINE}
${knowledge ? `\n━━━ INTELIGÊNCIA ATUAL ━━━\n${knowledge}` : ""}
${memoryContext ? `\n━━━ MEMÓRIA ━━━\n${memoryContext}` : ""}`;
}

export async function chatWithAliceAmazon(
  history: Array<{ role: "user" | "assistant"; content: string }>,
  account = "feminnita",
  userName?: string
): Promise<string> {
  const systemPrompt = await buildAliceAmazonPrompt(account);
  const nameCtx = userName ? `\nNOME DO USUÁRIO: Chame-o(a) de "${userName}" durante a conversa.` : "";
  const system = systemPrompt + nameCtx + `\n\nFERRAMENTA DE DADOS: use get_ficha_conta para puxar a história da conta Amazon (curva ABC + margem por SKU) ANTES de recomendar quais ASINs anunciar ou definir ACoS-teto. Se a ficha vier vazia/em geração, avise e siga com o que o usuário trouxer.`;

  const messages: Anthropic.MessageParam[] = history.map(m => ({ role: m.role, content: m.content }));

  try {
    let iterations = 0;
    while (iterations < 2) {
      iterations++;
      const resp = await anthropicAlice.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system,
        tools: ALICE_TOOLS,
        messages,
      });
      const hasTool = resp.content.some(b => b.type === "tool_use");
      const text = resp.content.filter(b => b.type === "text").map(b => (b as Anthropic.TextBlock).text).join("");
      if (!hasTool) return text || "Não consegui processar.";
      const toolResults: Anthropic.ToolResultBlockParam[] = [];
      for (const b of resp.content) {
        if (b.type === "tool_use") {
          const inp = (b.input || {}) as Record<string, any>;
          const out = b.name === "get_ficha_conta"
            ? await getFichaContaAmazon(inp.canal || (account === "fnt" ? "Amazon B" : "Amazon"))
            : `Ferramenta desconhecida: ${b.name}`;
          toolResults.push({ type: "tool_result", tool_use_id: b.id, content: out });
        }
      }
      messages.push({ role: "assistant", content: resp.content });
      messages.push({ role: "user", content: toolResults });
    }
    // força resposta final sem ferramentas
    const finalResp = await anthropicAlice.messages.create({
      model: "claude-sonnet-4-6", max_tokens: 2000, system, messages,
    });
    return finalResp.content.filter(b => b.type === "text").map(b => (b as Anthropic.TextBlock).text).join("") || "Não consegui processar.";
  } catch (e: any) {
    console.error("[Alice] erro no chat:", e?.message);
    // fallback sem tools
    const result = await invokeLLM({ messages: [{ role: "system", content: system }, ...history], maxTokens: 2000 });
    return String(result.choices[0]?.message?.content || "Não consegui processar.");
  }
}

export async function updateAliceAmazonKnowledge(): Promise<string> {
  const systemPrompt = await buildAliceAmazonPrompt();
  const result = await invokeLLM({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: "Gere um resumo semanal de Amazon Ads para marcas de moda no Brasil. Inclua: benchmarks atuais de ACoS/TACoS/CTR/CVR, mudanças recentes no algoritmo A9/A10, tendências de keywords para pijamas/moda feminina, novidades do Seller Central e recomendações de ação para a próxima semana." },
    ],
    maxTokens: 1500,
  });
  const summary = String(result.choices[0]?.message?.content || "");
  const period = new Date().toISOString().slice(0, 10);
  await saveMemory(AGENT_NAME, "weekly_summary", period, { summary });
  return summary;
}
