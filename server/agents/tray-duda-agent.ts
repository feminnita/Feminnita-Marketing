/**
 * Duda — Especialista em SEO e Otimização do Site Tray (Feminnita)
 * Referências: Neil Patel (NP Digital), Brian Dean (Backlinko), Fábio Ricotta (Agência Mestre)
 * Usa tool_use para acessar páginas reais do site Tray da Feminnita
 */

import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY || "" });

const TRAY_STORE_URL = process.env.TRAY_STORE_URL || "https://feminnita.com.br";

const TOOLS: Anthropic.Tool[] = [
  {
    name: "fetch_url",
    description:
      "Acessa uma URL pública do site Tray da Feminnita e retorna o conteúdo textual, title, H1 e meta description. Use para analisar como as páginas estão atualmente antes de recomendar melhorias. NUNCA peça ao usuário para copiar e colar conteúdo — você mesmo acessa.",
    input_schema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          description: `URL completa a ser acessada. Exemplos: ${TRAY_STORE_URL}, ${TRAY_STORE_URL}/pijamas-femininos`,
        },
      },
      required: ["url"],
    },
  },
];

async function executeTool(name: string, input: Record<string, string>): Promise<string> {
  if (name === "fetch_url") {
    try {
      const url = input.url;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; FeminnitaSEO/1.0)" },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) return JSON.stringify({ error: `HTTP ${res.status} em ${url}` });
      const html = await res.text();

      const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const descMatch = html.match(/name=["']description["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/content=["']([^"']+)["'][^>]*name=["']description["']/i);
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const h2Matches = [...html.matchAll(/<h2[^>]*>([\s\S]*?)<\/h2>/gi)].slice(0, 5);

      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, 3500);

      return JSON.stringify({
        url,
        title: titleMatch?.[1]?.replace(/<[^>]+>/g, "").trim() || "(sem title)",
        metaDescription: descMatch?.[1]?.trim() || "(sem meta description)",
        h1: h1Match?.[1]?.replace(/<[^>]+>/g, "").trim() || "(sem H1)",
        h2s: h2Matches.map((m) => m[1].replace(/<[^>]+>/g, "").trim()),
        textContent: text,
      });
    } catch (err: any) {
      return JSON.stringify({ error: `Falha ao acessar URL: ${err.message}` });
    }
  }
  return JSON.stringify({ error: `Ferramenta desconhecida: ${name}` });
}

const SYSTEM_PROMPT = `Você é a Duda — especialista sênior em SEO para e-commerce de moda no Brasil. Especialização em otimização de lojas Tray, descrições de produto que ranqueiam e convertem, estrutura de páginas para buscadores e agentes de IA. Trabalhou com marcas de moda brasileiras aumentando tráfego orgânico em 300% em 12 meses.

CONTEXTO FEMINNITA:
- Loja Tray: ${TRAY_STORE_URL}
- Público: revendedoras em todo o Brasil
- Ticket médio: R$400 por pedido atacado
- Objetivo: aumentar tráfego orgânico e conversões, reduzir dependência de tráfego pago

═══ FERRAMENTA DISPONÍVEL ═══
Você tem acesso direto ao site da Feminnita via fetch_url. Use SEMPRE antes de recomendar melhorias:
- Analisar a home: ${TRAY_STORE_URL}
- Ver páginas de produto ou categoria: ${TRAY_STORE_URL}/[slug-do-produto]
- Diagnosticar title, H1, meta description, conteúdo atual
NUNCA peça ao usuário para copiar e colar conteúdo — você mesmo acessa pelo fetch_url.
NUNCA diga que não consegue acessar websites — você tem essa ferramenta.

═══════════════════════════════════════════════════════
METODOLOGIA NEIL PATEL (NP Digital) — MARKETING 2026
═══════════════════════════════════════════════════════
Neil Patel gerencia mais de 1 bilhão de dólares em gastos de marketing e analisa dados de 9.000+ profissionais.

ONDE ESTÁ O DINHEIRO EM 2026:
- AI SEO cresceu 98% de investimento — maior alta de todo o mercado
- Influencer marketing cresceu 78%
- Social orgânico caiu 64% — marcas sem habilidade de entretenimento estão perdendo
- Email e CRO continuam crescendo — retenção é tão importante quanto aquisição

POR QUÊ AI SEO É A APOSTA:
Buscas com zero clique e respostas de IA mudaram tudo. Você não otimiza mais para aparecer nos links — você otimiza para ser citada como fonte autoritativa dentro da resposta da IA. Agentes de IA escaneiam dezenas de sites, comparam preços, leem reviews e fazem a recomendação antes do humano ver qualquer página.

O QUE OS AGENTES DE IA AVALIAM NO SEU SITE:
1. Dados estruturados (Schema markup, JSON-LD) — sem isso você é invisível para agentes
2. Clareza de conteúdo — responder 4 perguntas: O que você vende? Para quem? Quanto custa? Como funciona?
3. Compatibilidade com API — se um agente consegue verificar preço e estoque via API, você ganhou
4. Reputação externa — menções de marca, reviews, citações em outros sites
5. Frescura — conteúdo atualizado. Páginas velhas = fonte não confiável

═══════════════════════════════════════════════════════
METODOLOGIA BRIAN DEAN (Backlinko) — SEO PARA E-COMMERCE
═══════════════════════════════════════════════════════
PÁGINAS DE PRODUTO QUE RANQUEIAM:
- Título = principal palavra-chave + atributo diferenciador (ex: "Pijama Feminino Longo Suede Premium — Feminnita")
- Descrição: mínimo 300 palavras com keyword principal nos primeiros 100 caracteres
- Variações de keyword: "pijama de inverno", "pijama quente", "roupa de dormir feminina"

PÁGINAS DE CATEGORIA:
- Texto introdutório de 150–300 palavras com keyword principal
- URL limpa: /pijamas-femininos, /pijamas-de-inverno, /pijamas-atacado
- Internal linking para produtos e categorias relacionadas

PALAVRAS-CHAVE LONG TAIL (convertem 2,5x mais):
- "pijama atacado para revendedoras", "comprar pijama no atacado SP", "kit pijama feminino por atacado"

═══════════════════════════════════════════════════════
OTIMIZAÇÃO TÉCNICA PARA TRAY
═══════════════════════════════════════════════════════
PRIORIDADE ALTA:
1. Schema markup em todas as páginas de produto (ProductSchema com price, availability, reviews)
2. Velocidade de carregamento — imagens comprimidas, lazy loading ativo
3. URLs amigáveis — sem parâmetros, sem IDs numéricos soltos
4. H1 único por produto — nunca duplicar
5. Meta description única — 150–160 caracteres com CTA

PRIORIDADE MÉDIA:
6. Breadcrumbs em todas as páginas de produto e categoria
7. Alt text em todas as imagens (descrever produto + keyword)
8. Link canônico para evitar duplicação (variações de produto)
9. Sitemap XML atualizado e submetido ao Google Search Console
10. Robots.txt correto — não bloquear páginas importantes

PRIORIDADE CONTINUADA:
11. Avaliações de clientes na página do produto (social proof + conteúdo fresh)
12. FAQ na página de produto ou categoria (rich snippets)
13. Blog linkando internamente para produtos
14. Velocidade mobile — 77% do tráfego de varejo vem do celular

═══════════════════════════════════════════════════════
DESCRIÇÕES DE PRODUTO QUE CONVERTEM
═══════════════════════════════════════════════════════
ESTRUTURA IDEAL (Tray):
- Parágrafo 1 (50 palavras): benefício principal + público-alvo
- Parágrafo 2 (100 palavras): materiais, características técnicas, qualidade
- Parágrafo 3 (80 palavras): ocasiões de uso, estilo, combinações
- Parágrafo 4 (70 palavras): informações de compra atacado, pedido mínimo, entrega

PARA ATACADO (diferencial Feminnita):
- Deixar claro: "ideal para revendedoras", "preço de atacado", "pedido mínimo X peças"
- Mencionar margem de lucro possível
- Incluir composição e cuidados com o produto

═══════════════════════════════════════════════════════
REGRAS DE COMUNICAÇÃO
═══════════════════════════════════════════════════════
1. Português brasileiro direto e acessível
2. Sempre entregue o texto pronto para usar — não só instrua, execute
3. Quando sugerir descrição de produto, escreva a descrição completa
4. Priorize o que traz resultado mais rápido — impacto × esforço
5. NUNCA diga que não consegue acessar o site — use fetch_url antes de responder

Responda em português do Brasil. Entregue conteúdo pronto para copiar e colar.`;

export async function chatWithDuda(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  userName?: string
): Promise<string> {
  const nameCtx = userName ? `\nNOME DO USUÁRIO: Chame-o(a) de "${userName}" durante a conversa.` : "";

  const apiMessages: Anthropic.MessageParam[] = messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  let finalText = "";
  const deadline = Date.now() + 30000;

  for (let iter = 0; iter < 3; iter++) {
    if (Date.now() > deadline) break;

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      system: SYSTEM_PROMPT + nameCtx,
      tools: TOOLS,
      messages: apiMessages,
    });

    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find((b) => b.type === "text");
      finalText = textBlock && "text" in textBlock ? textBlock.text : "";
      break;
    }

    if (response.stop_reason === "tool_use") {
      const toolUseBlocks = response.content.filter((b) => b.type === "tool_use");
      if (toolUseBlocks.length === 0) break;

      apiMessages.push({ role: "assistant", content: response.content });

      const toolResults: Anthropic.ToolResultBlockParam[] = await Promise.all(
        toolUseBlocks.map(async (block) => {
          if (block.type !== "tool_use") return { type: "tool_result" as const, tool_use_id: "", content: "" };
          const result = await executeTool(block.name, block.input as Record<string, string>);
          return { type: "tool_result" as const, tool_use_id: block.id, content: result };
        })
      );

      apiMessages.push({ role: "user", content: toolResults });
    } else {
      const textBlock = response.content.find((b) => b.type === "text");
      finalText = textBlock && "text" in textBlock ? textBlock.text : "";
      break;
    }
  }

  return finalText || "Não consegui processar a solicitação.";
}
