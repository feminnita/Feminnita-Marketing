/**
 * Web Search Service — Tavily API wrapper
 *
 * Fornece busca real na internet para todos os agentes IA da equipe Feminnita.
 * Tavily é otimizado para LLMs: retorna conteúdo limpo e contextualizado.
 */

const TAVILY_API_URL = "https://api.tavily.com/search";
const TAVILY_API_KEY = process.env.TAVILY_API_KEY || "";

export interface SearchResult {
  title: string;
  url: string;
  content: string;
  score: number;
  publishedDate?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  answer?: string; // Resposta direta quando Tavily consegue sintetizar
}

/**
 * Busca na internet via Tavily.
 *
 * @param query - Consulta em linguagem natural
 * @param options.maxResults - Número máximo de resultados (padrão: 5)
 * @param options.searchDepth - "basic" (rápido) ou "advanced" (mais profundo)
 * @param options.includeAnswer - Se true, Tavily sintetiza uma resposta direta
 * @param options.topic - "general" | "news" (padrão: news para contexto de marketing)
 * @param options.days - Janela de dias para resultados recentes (padrão: 7)
 */
export async function searchWeb(
  query: string,
  options: {
    maxResults?: number;
    searchDepth?: "basic" | "advanced";
    includeAnswer?: boolean;
    topic?: "general" | "news";
    days?: number;
  } = {}
): Promise<SearchResponse> {
  if (!TAVILY_API_KEY) {
    console.warn("[WebSearch] TAVILY_API_KEY não configurado — retornando resultado vazio");
    return { query, results: [] };
  }

  const {
    maxResults = 5,
    searchDepth = "basic",
    includeAnswer = true,
    topic = "news",
    days = 7,
  } = options;

  try {
    const response = await fetch(TAVILY_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${TAVILY_API_KEY}`,
      },
      body: JSON.stringify({
        query,
        max_results: maxResults,
        search_depth: searchDepth,
        include_answer: includeAnswer,
        topic,
        days,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[WebSearch] Tavily error ${response.status}: ${errText}`);
      return { query, results: [] };
    }

    const data = await response.json();

    return {
      query,
      results: (data.results || []).map((r: any) => ({
        title: r.title || "",
        url: r.url || "",
        content: r.content || "",
        score: r.score || 0,
        publishedDate: r.published_date,
      })),
      answer: data.answer,
    };
  } catch (err: any) {
    console.error("[WebSearch] Falha ao chamar Tavily:", err.message);
    return { query, results: [] };
  }
}

/**
 * Formata resultados de busca para injeção no prompt de um agente.
 */
export function formatSearchResults(results: SearchResponse): string {
  if (results.results.length === 0 && !results.answer) {
    return `[Busca: "${results.query}" — sem resultados]`;
  }

  const lines: string[] = [];
  lines.push(`=== BUSCA WEB: "${results.query}" ===`);

  if (results.answer) {
    lines.push(`Síntese: ${results.answer}`);
    lines.push("");
  }

  results.results.forEach((r, i) => {
    lines.push(`[${i + 1}] ${r.title}`);
    if (r.publishedDate) lines.push(`    Data: ${r.publishedDate}`);
    lines.push(`    ${r.content.slice(0, 300)}${r.content.length > 300 ? "..." : ""}`);
    lines.push("");
  });

  return lines.join("\n");
}

/**
 * Executa múltiplas buscas em paralelo e retorna tudo formatado.
 */
export async function multiSearch(queries: string[]): Promise<string> {
  const results = await Promise.all(queries.map((q) => searchWeb(q)));
  return results.map(formatSearchResults).join("\n\n");
}
