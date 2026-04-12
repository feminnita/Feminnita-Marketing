/**
 * Blog Agent — Gerador de Conteúdo para o Blog Feminnita
 *
 * Responsabilidade: criar posts para o blog da Feminnita usando LLM
 * especializado em moda íntima, pijamas e estilo de vida feminino.
 * Gera conteúdo SEO-otimizado, em português, voltado para o público da marca.
 */

import { invokeLLM } from "../_core/llm";

// ─── Helper: extrair texto da resposta LLM ────────────────────────────────────

function extractText(result: Awaited<ReturnType<typeof invokeLLM>>): string {
  const content = result.choices?.[0]?.message?.content;
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map(p => p.text)
      .join("");
  }
  return "";
}

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface BlogPostDraft {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  category: string;
  tags: string[];
  coverImageSuggestion: string;
}

export interface BlogGenerationInput {
  topic?: string;
  category?: string;
  targetKeywords?: string[];
  tone?: "informativo" | "inspiracional" | "educativo" | "tendência";
  wordCount?: number;
}

// ─── Prompt base ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Você é uma especialista sênior em marketing de conteúdo para o Blog Feminnita — blog oficial da Feminnita Pijamas, marca brasileira de moda íntima e pijamas, com sede em Nova Friburgo, RJ.

═══ MISSÃO DO BLOG ═══
O blog da Feminnita não é apenas sobre pijamas — é uma plataforma de educação, comunidade e capacitação para revendedoras e lojistas brasileiras. Os conteúdos ajudam mulheres a construir uma renda extra e crescer vendendo moda íntima de qualidade.

═══ PÚBLICO-ALVO ═══
Primário: Revendedoras e lojistas (mulheres entre 25-50 anos) que compram no atacado da Feminnita para revender.
Secundário: Consumidoras finais interessadas em qualidade de sono, tecidos e bem-estar.

═══ PILARES DE CONTEÚDO ═══

1. HISTÓRIAS DA COMUNIDADE (categoria: Comunidade)
   - Histórias reais de revendedoras bem-sucedidas (estilo: "Comecei com R$199 e hoje tenho 120 clientes")
   - Casos de sucesso detalhados: quanto investiram, quanto faturam, como conquistaram clientes
   - Perfis de mulheres de diferentes regiões, idades e situações de vida
   - Tom: inspiracional, detalhado, com números reais, começa pela história pessoal

2. COMO VENDER MAIS (categoria: Treinamento)
   - Técnicas práticas de vendas para revendedoras: WhatsApp Business, Instagram, abordagem presencial
   - Como tirar fotos de produtos que vendem (com celular comum)
   - Scripts de atendimento, objeções, fechamento de venda
   - Como montar kits, criar promoções, fidelizar clientes
   - PDFs e guias práticos de técnicas de vendas
   - Tom: didático, prático, passo a passo

3. TECIDOS & PRODUTOS (categoria: Tecidos & Produtos)
   - Educação sobre suede (tecido principal da Feminnita): características, vantagens, como cuidar
   - Comparativo de tecidos: suede vs. malha vs. fleece vs. viscose
   - Por que suede é superior para pijamas de qualidade
   - Guias de coleções e lançamentos de produtos
   - Tom: educativo, aprofundado, com dados técnicos acessíveis

4. QUALIDADE DO SONO (categoria: Cuidados & Dicas)
   - Impacto do pijama na qualidade do sono
   - Dicas de rotina noturna, higiene do sono
   - Como a escolha do tecido afeta o conforto e temperatura corporal
   - Conexão sono-produtividade-bem-estar feminino
   - Tom: informativo, baseado em pesquisa, prático

5. FERRAMENTAS DIGITAIS PARA REVENDEDORAS (categoria: Treinamento)
   - WhatsApp Business: catálogo, listas de transmissão, status
   - Instagram para vendas: reels, stories, highlights de coleção
   - Como vender sem aparecer nas fotos (para quem tem timidez)
   - Pinterest, TikTok, grupos de WhatsApp
   - Tom: tutorial, passo a passo, com prints/exemplos

6. DATAS ESPECIAIS & SAZONALIDADE (categoria: Datas Especiais)
   - Estratégias de venda para: Dia das Mães, Dia dos Namorados, Natal, Dia da Mulher, Black Friday, Inverno
   - Como preparar estoque, montar kits presenteáveis, criar cupons
   - Campanhas temáticas que funcionam para revendedoras
   - Tom: estratégico, antecipativo, com dicas acionáveis

═══ REGRAS DE OURO DO BLOG ═══
- Os posts de "histórias" devem ter NOME + CIDADE da revendedora (pode ser fictício/composto)
- Sempre terminar com CTA para virar revendedora: "Quero ser revendedora Feminnita"
- Mencionar Nova Friburgo como origem da marca quando relevante
- Números concretos têm mais impacto do que afirmações vagas (R$X de faturamento, Y% de aumento)
- Linguagem próxima, feminina, brasileira — não corporativa
- Suede Feminnita é o produto estrela: destacar em posts de tecidos
- Nunca falar em "lingerie" (não é o segmento) — usar "pijamas", "moda íntima", "roupas de dormir"

═══ FORMATO E SEO ═══
- Título com palavra-chave principal + elemento emocional/numérico quando possível
- Meta description 140-160 chars com call-to-action sutil
- Estrutura: introdução impactante → desenvolvimento com H2/H3 → conclusão + CTA
- 800-1400 palavras para posts de dicas; 600-900 para histórias
- Tags semânticas: incluir variações long-tail
- Slug: curto, sem acento, separado por hífen`;

// ─── Categorias válidas ───────────────────────────────────────────────────────

export const BLOG_CATEGORIES = [
  "Comunidade",
  "Treinamento",
  "Tecidos & Produtos",
  "Cuidados & Dicas",
  "Tendências",
  "Moda & Estilo",
] as const;

// ─── Gerador principal ───────────────────────────────────────────────────────

export async function generateBlogPost(input: BlogGenerationInput): Promise<BlogPostDraft> {
  const {
    topic,
    category = "Moda & Estilo",
    targetKeywords = [],
    tone = "inspiracional",
    wordCount = 1000,
  } = input;

  const keywordsStr = targetKeywords.length > 0
    ? `Palavras-chave alvo: ${targetKeywords.join(", ")}`
    : "";

  const isStoryCategory = category === "Comunidade";
  const defaultTopic = isStoryCategory
    ? `Crie uma história inspiradora de uma revendedora Feminnita com nome, cidade e resultados concretos`
    : `Crie um post relevante sobre pijamas, revendas, qualidade de sono ou tecidos para a temporada atual`;

  const topicPrompt = topic
    ? `Tema: ${topic}`
    : defaultTopic;

  const userPrompt = `${topicPrompt}
Categoria: ${category}
Tom: ${tone}
${keywordsStr}
Palavras aproximadas: ${wordCount}

Responda APENAS com JSON válido no seguinte formato:
{
  "title": "título principal do post",
  "slug": "slug-url-amigavel-sem-acentos",
  "excerpt": "resumo de 2-3 frases para preview",
  "seoTitle": "título SEO otimizado (max 60 chars)",
  "seoDescription": "meta description (140-160 chars)",
  "category": "${category}",
  "tags": ["tag1", "tag2", "tag3"],
  "coverImageSuggestion": "descrição da imagem de capa ideal",
  "content": "conteúdo completo em markdown com # título, ## subtítulos, parágrafos, listas"
}`;

  const result = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userPrompt },
    ],
  });

  const raw = extractText(result);
  // Extrair JSON da resposta
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Resposta do LLM não contém JSON válido");

  const parsed = JSON.parse(jsonMatch[0]) as BlogPostDraft;

  // Garantir slug válido
  if (!parsed.slug) {
    parsed.slug = parsed.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .slice(0, 80);
  }

  return parsed;
}

// ─── Gerador de ideias ───────────────────────────────────────────────────────

export async function generateBlogIdeas(count: number = 10): Promise<Array<{
  title: string;
  category: string;
  keywords: string[];
  rationale: string;
}>> {
  const prompt = `Gere ${count} ideias criativas e variadas de posts para o Blog Feminnita.

REGRAS PARA AS IDEIAS:
- Distribua entre os pilares: Histórias da Comunidade, Treinamento/Vendas, Tecidos & Produtos, Qualidade do Sono, Ferramentas Digitais, Datas Especiais
- Posts de "história" devem ter título com nome fictício e resultado concreto (ex: "Como Ana de Recife faturou R$3.800 em um mês revendendo pijamas")
- Posts de treinamento devem ser práticos e acionáveis
- Posts de tecido devem educar sobre suede, conforto, qualidade
- Considere o momento atual: ${new Date().toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
- Pense em datas comemorativas próximas
- Inclua ao menos 2 ideias de histórias de revendedoras

Responda APENAS com JSON:
{
  "ideas": [
    {
      "title": "título do post",
      "category": "categoria",
      "keywords": ["kw1", "kw2"],
      "rationale": "por que esse tema é relevante agora e o que a revendedora vai aprender"
    }
  ]
}`;

  const result = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });

  const raw = extractText(result);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Resposta inválida do LLM");

  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.ideas || [];
}

// ─── Otimização de post existente ────────────────────────────────────────────

export async function improveBlogPost(content: string, instructions: string): Promise<string> {
  const prompt = `Você está revisando um post do blog da Feminnita Pijamas.

INSTRUÇÕES DE MELHORIA:
${instructions}

CONTEÚDO ATUAL:
${content}

Retorne APENAS o conteúdo melhorado em markdown, sem explicações adicionais.`;

  const result = await invokeLLM({
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
  });

  return extractText(result);
}
