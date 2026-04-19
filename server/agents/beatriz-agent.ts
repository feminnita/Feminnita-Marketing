/**
 * Beatriz Santos — Especialista em Conteúdo e Tendências
 *
 * Responsabilidades diárias:
 * 1. Monitorar tendências de moda, pijamas e mercado têxtil
 * 2. Sugerir pautas de conteúdo para o mês
 * 3. Identificar datas comemorativas e oportunidades de campanha
 * 4. Analisar o que está viralizando no nicho
 * 5. Propor calendário editorial
 */

import { invokeLLM } from "../_core/llm";
import { buildMemoryContext, saveMemory } from "../services/agentMemory";
import { multiSearch, searchWeb, formatSearchResults } from "../services/webSearch";
import { getDb } from "../db";
import { agentActions, blogPosts } from "../../drizzle/schema";
import { generateBlogPost } from "./blog-agent";
import { eq, and } from "drizzle-orm";

const SYSTEM_PROMPT = `Você é a Beatriz Santos — especialista sênior em estratégia de conteúdo e tendências de moda para marcas brasileiras de atacado.

CONTEXTO FEMINNITA:
- Pijamas e roupas íntimas atacado para revendedoras
- Canais: Instagram (principal), WhatsApp (revendedoras), TikTok (futuro)
- Tom: feminino, acolhedor, aspiracional mas acessível
- Público das revendedoras: mulheres que buscam renda extra revendendo moda
- Calendário editorial segue: datas comemorativas BR + lançamentos de coleção

Sua análise diária deve incluir:
1. O que está em alta no nicho (pijamas, loungewear, moda casual feminina)
2. Datas importantes nos próximos 30 dias (comemorativas, sazonais)
3. Ideias de conteúdo baseadas em tendências reais
4. Sugestão de hashtags performáticas
5. Análise de formato: o que está engajando (Reel, Carrossel, Stories)

Retorne APENAS JSON válido:
{
  "summary": "string — panorama de conteúdo atual em 2-3 frases",
  "highlights": ["tendência positiva 1", "tendência positiva 2"],
  "alerts": ["alerta ou oportunidade 1"],
  "recommendations": ["sugestão editorial 1", "sugestão editorial 2"],
  "contentIdeas": [
    {
      "title": "Título do conteúdo",
      "description": "Como produzir e o que mostrar",
      "format": "reel" | "carrossel" | "story" | "post_estatico",
      "hashtags": ["#hashtag1", "#hashtag2"],
      "bestTime": "dia da semana + horário",
      "trendSource": "de onde vem essa tendência"
    }
  ],
  "upcomingDates": [
    {
      "date": "YYYY-MM-DD",
      "event": "Nome do evento/data comemorativa",
      "contentAngle": "Como a Feminnita pode aproveitar isso"
    }
  ],
  "proposedActions": [
    {
      "title": "Título da ação",
      "description": "Descrição detalhada",
      "type": "content" | "campaign" | "collab",
      "priority": "alta" | "media" | "baixa",
      "estimatedImpact": "impacto esperado"
    }
  ]
}`;

export interface BeatrizAnalysisResult {
  summary: string;
  highlights: string[];
  alerts: string[];
  recommendations: string[];
  contentIdeas: Array<{
    title: string;
    description: string;
    format: string;
    hashtags: string[];
    bestTime: string;
    trendSource: string;
  }>;
  upcomingDates: Array<{
    date: string;
    event: string;
    contentAngle: string;
  }>;
  proposedActions: Array<{
    title: string;
    description: string;
    type: string;
    priority: string;
    estimatedImpact: string;
  }>;
}

// ─── Propor ações no painel ───────────────────────────────────────────────────

async function proposeActionsFromBeatriz(
  analysis: BeatrizAnalysisResult,
  today: string
): Promise<void> {
  if (!analysis.proposedActions?.length) return;
  try {
    const db = await getDb();
    if (!db) return;

    const existing = await db
      .select({ title: agentActions.title })
      .from(agentActions)
      .where(and(eq(agentActions.agentName, "beatriz"), eq(agentActions.date, today)));

    const existingTitles = new Set(existing.map((r: { title: string }) => r.title));

    const toInsert = analysis.proposedActions
      .filter((a) => a.title && !existingTitles.has(a.title))
      .map((a) => ({
        agentName: "beatriz" as const,
        date: today,
        title: a.title.slice(0, 150),
        description: a.description,
        actionType: a.type || "content",
        priority: (["alta", "media", "baixa"].includes(a.priority) ? a.priority : "media") as "alta" | "media" | "baixa",
        estimatedImpact: a.estimatedImpact,
        status: "pending" as const,
      }));

    if (toInsert.length > 0) {
      await db.insert(agentActions).values(toInsert);
      console.log(`[Beatriz] ${toInsert.length} ações propostas no painel`);
    }
  } catch (err: any) {
    console.error("[Beatriz] Erro ao propor ações:", err.message);
  }
}

// ─── Gerar rascunhos de blog ──────────────────────────────────────────────────

const BLOG_CATEGORIES = [
  "Moda & Estilo", "Tendências", "Cuidados & Dicas",
  "Tecidos & Produtos", "Comunidade", "Negócios",
] as const;

function mapCategory(raw: string): string {
  const match = BLOG_CATEGORIES.find((c) =>
    c.toLowerCase().includes(raw.toLowerCase()) || raw.toLowerCase().includes(c.toLowerCase())
  );
  return match ?? "Moda & Estilo";
}

async function generateBlogDrafts(
  analysis: BeatrizAnalysisResult,
  today: string
): Promise<void> {
  // Pega até 2 ideias de blog (evita custo LLM excessivo)
  const blogIdeas = (analysis.contentIdeas ?? [])
    .filter((i) => i.format === "post_estatico" || i.format === "carrossel" || !i.format)
    .slice(0, 2);

  if (blogIdeas.length === 0) return;

  try {
    const db = await getDb();
    if (!db) return;

    for (const idea of blogIdeas) {
      try {
        const draft = await generateBlogPost({
          topic: idea.title,
          category: mapCategory(idea.trendSource || "Moda & Estilo"),
          targetKeywords: idea.hashtags?.map((h: string) => h.replace("#", "")) ?? [],
          tone: "informativo",
        });

        // Slug único: append data para evitar colisão
        const slug = `${draft.slug}-${today}`;

        // Verifica se já existe
        const existing = await db
          .select({ id: blogPosts.id })
          .from(blogPosts)
          .where(eq(blogPosts.slug, slug));

        if (existing.length > 0) continue;

        await db.insert(blogPosts).values({
          title: draft.title,
          slug,
          content: draft.content,
          excerpt: draft.excerpt ?? "",
          category: draft.category,
          tags: JSON.stringify(draft.tags ?? []),
          status: "draft",
          seoTitle: draft.seoTitle,
          seoDescription: draft.seoDescription,
        });

        console.log(`[Beatriz] Rascunho de blog criado: "${draft.title}"`);
      } catch (err: any) {
        console.error(`[Beatriz] Erro ao gerar rascunho "${idea.title}":`, err.message);
      }
    }
  } catch (err: any) {
    console.error("[Beatriz] Erro ao gerar drafts de blog:", err.message);
  }
}

// ─── Análise principal ────────────────────────────────────────────────────────

export async function runBeatrizAnalysis(): Promise<BeatrizAnalysisResult> {
  const today = new Date().toISOString().slice(0, 10);
  console.log(`[Beatriz] Iniciando análise de conteúdo e tendências — ${today}`);

  const [memoryContext, trendData] = await Promise.all([
    buildMemoryContext("beatriz"),
    multiSearch([
      "tendências moda pijama loungewear Brasil 2026",
      "datas comemorativas maio junho Brasil marketing vendas",
      "conteúdo viral Instagram moda feminina Brasil 2026",
    ]),
  ]);

  const userPrompt = `Data: ${today}

PESQUISA DE TENDÊNCIAS E CALENDÁRIO:
${trendData.slice(0, 3000)}

MEMÓRIA ACUMULADA:
${memoryContext.slice(0, 800)}

Gere a análise diária de conteúdo e tendências para a Feminnita, com ideias práticas de conteúdo e ações propostas.`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
    });

    const content = result.choices[0]?.message?.content;
    if (typeof content !== "string") throw new Error("LLM retornou resposta inválida");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

    await saveMemory("beatriz", "daily_analysis", today, parsed);
    console.log(`[Beatriz] Análise ${today} salva — ${parsed.contentIdeas?.length || 0} ideias de conteúdo`);

    // Conectar ao painel de ações e ao blog
    await Promise.all([
      proposeActionsFromBeatriz(parsed, today),
      generateBlogDrafts(parsed, today),
    ]);

    return parsed as BeatrizAnalysisResult;
  } catch (err: any) {
    const fallback: BeatrizAnalysisResult = {
      summary: `Análise ${today} — erro: ${err.message}`,
      highlights: [],
      alerts: ["Erro ao gerar análise — verificar logs"],
      recommendations: [],
      contentIdeas: [],
      upcomingDates: [],
      proposedActions: [],
    };
    await saveMemory("beatriz", "daily_analysis", today, fallback);
    return fallback;
  }
}

// ─── Geração de copy para anúncio (chamada pela Fernanda) ─────────────────────

export interface AdCopyResult {
  headline: string;
  headlineVariants?: string[];
  body: string;
  imageDescription: string;
}

export async function generateAdCopy(context: string): Promise<AdCopyResult> {
  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é a Beatriz Santos — redatora publicitária sênior com 11 anos de experiência exclusiva em performance marketing para e-commerce e atacado de moda no Brasil. Formada em Publicidade pela ESPM, pós-graduada em Neuromarketing pela FGV. Trabalhou para marcas como Riachuelo, Lupo e diversas marcas DTC de moda. Especialista certificada em Meta Ads (Facebook Blueprint) e Google Ads.

SEU DIFERENCIAL: você não escreve copy genérico. Cada palavra é escolhida para ativar um gatilho psicológico específico — escassez, prova social, identidade, transformação ou ganho financeiro — calibrado para o estágio do funil e o perfil da persona.

FRAMEWORKS QUE VOCÊ DOMINA:
- PAS (Problema → Agitação → Solução) para cold audience
- AIDA (Atenção → Interesse → Desejo → Ação) para remarketing
- 4U's (Urgente, Único, Ultra-específico, Útil) para headlines
- Before/After/Bridge para transformação
- Social Proof Loop para reativação

CONTEXTO FEMINNITA — DECORE:
- Produto: pijamas premium atacado para revendedoras autônomas
- Ticket médio: R$400/pedido | Margem revendedora: 40-60%
- Persona primária: mulher 28-45 anos, mãe, quer renda extra sem sair de casa
- Persona secundária: revendedora experiente que quer expandir portfólio
- Dor real: medo de não vender, de ficar com estoque parado
- Desejo real: independência financeira, produto que "vende sozinho"
- Prova social disponível: mais de 2.000 revendedoras ativas no Brasil
- Diferencial: pijamas exclusivos (estampas próprias), pronta entrega, suporte pós-venda

REGRAS ABSOLUTAS DO COPY:
- Headline: máximo 40 caracteres — 1 único gancho, zero floreios, impacto nos primeiros 2 segundos
- Body: máximo 125 caracteres — benefício concreto + micro-prova social + CTA de baixa fricção
- NUNCA mencione preço específico nem percentual de desconto
- Use linguagem coloquial brasileira nordestina/sudestina (você, a gente, né, tá)
- Evite clichês: "aproveite", "não perca", "clique aqui", "oportunidade única"
- Prefira verbos de ação e posse: "ganhe", "venda", "tenha", "comece", "entre"
- imageDescription: cena específica e realista — iluminação, enquadramento, emoção da modelo

VARIAÇÕES OBRIGATÓRIAS — sempre retorne 3 opções de headline para A/B test:

Retorne APENAS JSON:
{
  "headline": "melhor headline escolhida (≤40 chars)",
  "headlineVariants": ["variante B (≤40 chars)", "variante C (≤40 chars)"],
  "body": "texto principal com gatilho + prova + CTA (≤125 chars)",
  "imageDescription": "cena detalhada para o criativo visual"
}`,
      },
      {
        role: "user",
        content: `Gere o copy para este anúncio:\n\n${context}`,
      },
    ],
    maxTokens: 300,
  });

  const rawContent = result.choices[0]?.message?.content;
  const content = typeof rawContent === "string" ? rawContent : "";
  const stripped = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    const m = stripped.match(/\{[\s\S]*\}/);
    return JSON.parse(m ? m[0] : stripped) as AdCopyResult;
  } catch {
    return {
      headline: "Revenda Pijamas Feminnita",
      body: "Peças exclusivas com lucro garantido. Conheça nossa coleção!",
      imageDescription: "Mulher sorrindo segurando pijama floral feminino",
    };
  }
}
