/**
 * Blog Agent — Gerador de Conteúdo para o Blog Feminnita
 *
 * Responsabilidade: criar posts para o blog da Feminnita usando LLM
 * especializado em moda íntima, pijamas e estilo de vida feminino.
 * Gera conteúdo SEO-otimizado, em português, voltado para o público da marca.
 */

import { invokeLLM } from "../_core/llm";

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

const SYSTEM_PROMPT = `Você é um redator sênior especializado em moda feminina, pijamas, lingerie e estilo de vida.
Escreve para o blog da Feminnita Pijamas, marca brasileira de moda íntima com foco em qualidade, conforto e elegância.

Público-alvo: mulheres entre 25-45 anos, classe média/alta, que valorizam bem-estar, moda consciente e autoestima.

Diretrizes de tom:
- Acolhedor, sofisticado e inspirador
- Usa "você" (não "tu")
- Português brasileiro formal mas próximo
- Evita clichês e exageros

Diretrizes de SEO:
- Título com palavra-chave principal
- Meta description entre 140-160 chars
- H2 e H3 dentro do conteúdo (markdown)
- Densidade de keywords natural (2-3%)
- Conteúdo original e útil, não genérico

Formato do post:
- Introdução cativante (2-3 parágrafos)
- Corpo com subtítulos H2/H3
- Conclusão com call-to-action para a loja
- Entre 800-1500 palavras dependendo do tema`;

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

  const topicPrompt = topic
    ? `Tema: ${topic}`
    : `Crie um post relevante sobre pijamas, moda íntima ou estilo de vida feminino para a temporada atual`;

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

  const raw = await invokeLLM({
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    temperature: 0.8,
  });

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
  const prompt = `Gere ${count} ideias de posts para o blog da Feminnita Pijamas.
Considere tendências atuais de moda, estações do ano, datas comemorativas e interesses do público feminino.
Inclua variedade: dicas de estilo, guias de compra, cuidados com tecidos, autocuidado, tendências.

Responda APENAS com JSON:
{
  "ideas": [
    {
      "title": "título do post",
      "category": "categoria",
      "keywords": ["kw1", "kw2"],
      "rationale": "por que esse tema é relevante agora"
    }
  ]
}`;

  const raw = await invokeLLM({
    system: SYSTEM_PROMPT,
    prompt,
    temperature: 0.9,
  });

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

  return invokeLLM({
    system: SYSTEM_PROMPT,
    prompt,
    temperature: 0.7,
  });
}
