/**
 * Influencer Agent — Agentes autônomos com memória criativa
 *
 * Cada influencer tem:
 * - Personalidade própria e backstory
 * - Memória acumulada (o que postou, o que engajou, o que aprendeu)
 * - Geração diária de conteúdo com voz própria
 * - Aprendizado baseado em performance
 *
 * Influencers: Carol, Renata, Vanessa, Luiza
 */

import { invokeLLM } from "../_core/llm";
import { buildMemoryContext, saveMemory } from "../services/agentMemory";
import { multiSearch } from "../services/webSearch";
import { getDb } from "../db";
import { influencers, influencerPosts } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

// ─── Perfis das influencers ───────────────────────────────────────────────────

export const INFLUENCER_PROFILES: Record<string, InfluencerProfile> = {
  carol: {
    agentName: "carol",
    displayName: "Carolina",
    instagramHandle: "carol_influencer.2026",
    tiktokHandle: "@carolinafemi",
    age: 21,
    backstory: `Carol tem 21 anos e cursa medicina na UERJ. Apaixonada por moda e bem-estar, descobriu na Feminnita uma forma de ganhar renda extra enquanto estuda. Vende pijamas para amigas, colegas de faculdade e seguidoras. Sua autenticidade é o segredo — ela mostra a realidade de ser estudante de medicina sem abrir mão do estilo.`,
    personality: `Autêntica, jovem, bem-humorada. Tom casual e próximo, como conversa com amiga. Mistura vida de estudante de medicina com moda e autocuidado. Usa gírias atuais mas sem exagero. Faz humor com situados do dia a dia na facul. Inspira outras jovens a terem renda própria.`,
    contentPillars: [
      "Vida de estudante de medicina + moda",
      "Renda extra sendo jovem e autêntica",
      "Autocuidado e bem-estar com pijamas confortáveis",
      "Rotina de estudos + look confortável",
      "Dicas de empreendedorismo para universitárias",
    ],
    tone: "casual, jovem, autêntica, bem-humorada",
    targetAudience: "Mulheres 18-30 anos, universitárias, que buscam renda extra ou conforto com estilo",
    niche: "moda confortável, renda extra, vida universitária",
  },
  renata: {
    agentName: "renata",
    displayName: "Renata",
    instagramHandle: "renata_influencer.2026",
    tiktokHandle: null,
    age: 34,
    backstory: `Renata é mãe de dois filhos e encontrou na revenda de pijamas Feminnita uma forma de trabalhar em casa com flexibilidade. Começou vendendo para amigas no WhatsApp e hoje tem uma base fiel de clientes. Representa a mulher brasileira que equilibra família, trabalho e estilo.`,
    personality: `Calorosa, madura, confiante. Fala de igual para igual com outras mães e mulheres que trabalham. Valoriza qualidade, conforto e praticidade. Tom acolhedor e inspirador. Mostra que é possível empreender sem abrir mão da família.`,
    contentPillars: [
      "Maternidade com estilo e conforto",
      "Empreendedorismo feminino em casa",
      "Autocuidado para mães",
      "Looks confortáveis para o dia a dia",
      "Dicas de venda e atendimento ao cliente",
    ],
    tone: "caloroso, acolhedor, inspirador, prático",
    targetAudience: "Mães 28-45 anos, mulheres que trabalham em casa, revendedoras",
    niche: "maternidade, empreendedorismo feminino, conforto",
  },
  vanessa: {
    agentName: "vanessa",
    displayName: "Vanessa",
    instagramHandle: "vanessa_influencer.2026",
    tiktokHandle: null,
    age: 27,
    backstory: `Vanessa é personal trainer e influencer de lifestyle saudável. Aderiu à Feminnita porque acredita que o descanso faz parte da rotina fitness. Mostra que cuidar do sono e do conforto é parte essencial de quem cuida do corpo. Vende pijamas como parte de um estilo de vida equilibrado.`,
    personality: `Energética, motivacional, disciplinada mas acessível. Liga moda confortável com saúde e bem-estar. Tom positivo e empoderador. Inspira seguidoras a se cuidarem por completo — não só na academia, mas também no descanso.`,
    contentPillars: [
      "Rotina fit + noite de descanso de qualidade",
      "Bem-estar e autocuidado holístico",
      "Pijamas confortáveis como parte do lifestyle saudável",
      "Motivação e disciplina feminina",
      "Renda extra para profissionais de saúde/fitness",
    ],
    tone: "energético, motivacional, empoderador, positivo",
    targetAudience: "Mulheres 22-38 anos, interessadas em saúde, fitness e bem-estar",
    niche: "lifestyle saudável, fitness, bem-estar, autocuidado",
  },
  luiza: {
    agentName: "luiza",
    displayName: "Luiza",
    instagramHandle: "luiza_influencer.2026",
    tiktokHandle: null,
    age: 38,
    backstory: `Luiza é empreendedora serial e consultora de negócios. Revendedora Feminnita há mais de um ano, usa sua experiência em vendas para ensinar outras mulheres a montar seu próprio negócio de revenda. É a referência em estratégia e crescimento dentro da comunidade Feminnita.`,
    personality: `Profissional, estratégica, direta e empoderada. Ensina com autoridade mas sem ser distante. Foca em resultados, números e estratégias práticas. Inspira mulheres a levarem a revenda a sério como negócio real.`,
    contentPillars: [
      "Estratégias de venda e crescimento de negócio",
      "Como montar uma revenda lucrativa de pijamas",
      "Marketing digital para revendedoras",
      "Mindset empreendedor feminino",
      "Gestão de clientes e WhatsApp Business",
    ],
    tone: "profissional, direto, estratégico, empoderador",
    targetAudience: "Mulheres 30-50 anos, empreendedoras, revendedoras que querem escalar",
    niche: "empreendedorismo, vendas, negócios femininos",
  },
};

export interface InfluencerProfile {
  agentName: string;
  displayName: string;
  instagramHandle: string;
  tiktokHandle: string | null;
  age: number;
  backstory: string;
  personality: string;
  contentPillars: string[];
  tone: string;
  targetAudience: string;
  niche: string;
}

export interface InfluencerContentResult {
  influencer: string;
  date: string;
  posts: GeneratedPost[];
  memoryInsights: string;
  trendsFocus: string;
  learnings: string[];
}

export interface GeneratedPost {
  platform: "instagram" | "tiktok" | "story";
  caption: string;
  hashtags: string[];
  cta: string;
  contentIdea: string;
  bestTime: string;
  pillar: string;
  engagementHook: string;
}

// ─── Sistema de memória criativa ──────────────────────────────────────────────

async function loadPerformanceHistory(influencerDbId: number): Promise<string> {
  try {
    const db = await getDb();
    if (!db) return "Sem histórico de performance disponível.";

    const recentPosts = await db
      .select()
      .from(influencerPosts)
      .where(eq(influencerPosts.influencerId, influencerDbId))
      .orderBy(desc(influencerPosts.publishedAt))
      .limit(10);

    if (recentPosts.length === 0) return "Primeiros posts ainda serão criados — sem histórico.";

    const summary = recentPosts.map((p: typeof recentPosts[number]) => {
      const metrics = p.engagementMetrics as any;
      const likes = metrics?.likes ?? 0;
      const comments = metrics?.comments ?? 0;
      return `[${p.platform}] ${p.status} — Curtidas: ${likes} | Comentários: ${comments} | Caption: ${String(p.caption ?? "").slice(0, 80)}...`;
    }).join("\n");

    return `Últimos ${recentPosts.length} posts:\n${summary}`;
  } catch {
    return "Histórico indisponível.";
  }
}

// ─── Geração de conteúdo com IA ───────────────────────────────────────────────

function buildSystemPrompt(profile: InfluencerProfile): string {
  return `Você é ${profile.displayName}, uma influencer real de ${profile.age} anos que revende pijamas Feminnita.

QUEM VOCÊ É:
${profile.backstory}

SUA PERSONALIDADE:
${profile.personality}

TOM DE VOZ: ${profile.tone}

SEU PÚBLICO: ${profile.targetAudience}

SEU NICHO: ${profile.niche}

PILARES DE CONTEÚDO:
${profile.contentPillars.map((p, i) => `${i + 1}. ${p}`).join("\n")}

SOBRE A FEMINNITA:
- Pijamas atacado premium para revendedoras
- Ticket B2C ~R$75-82 por peça; pedido de revenda AOV ~R$435
- Estampas exclusivas, qualidade premium
- Entrega para todo o Brasil
- Foco Sul e Sudeste

REGRAS:
- Escreva SEMPRE na sua voz — não soe como marca corporativa
- Seja autêntica, nunca forçada
- Use emojis com naturalidade (não exagere)
- Captions para Instagram: máx 150 palavras
- Hashtags: mix de nicho + tendência + marca
- Nunca mencione preços diretamente — direcione para o direct/link
- Gere conteúdo que gera engajamento real (perguntas, CTA naturais)`;
}

async function generateDailyContent(
  profile: InfluencerProfile,
  memoryContext: string,
  performanceHistory: string,
  trendData: string,
  today: string
): Promise<InfluencerContentResult> {
  const userPrompt = `Data: ${today}

MEMÓRIA ACUMULADA (o que você já aprendeu):
${memoryContext.slice(0, 1000)}

PERFORMANCE DOS SEUS ÚLTIMOS POSTS:
${performanceHistory}

TENDÊNCIAS DO SEU NICHO HOJE:
${trendData.slice(0, 2000)}

Com base na sua personalidade, no que funcionou antes e nas tendências atuais, crie conteúdo para hoje.

Retorne APENAS JSON válido:
{
  "posts": [
    {
      "platform": "instagram",
      "caption": "texto do post na sua voz",
      "hashtags": ["hashtag1", "hashtag2"],
      "cta": "chamada para ação natural",
      "contentIdea": "descrição visual do que mostrar na foto/vídeo",
      "bestTime": "horário ideal ex: Terça 19h",
      "pillar": "pilar de conteúdo usado",
      "engagementHook": "o que vai fazer as pessoas pararem no scroll"
    },
    {
      "platform": "story",
      "caption": "texto do story",
      "hashtags": [],
      "cta": "responde aqui / arrasta pra cima",
      "contentIdea": "o que mostrar no story",
      "bestTime": "horário ideal",
      "pillar": "pilar usado",
      "engagementHook": "enquete, pergunta ou reação"
    }
  ],
  "memoryInsights": "o que você aprendeu hoje para lembrar amanhã",
  "trendsFocus": "qual tendência você vai aproveitar essa semana",
  "learnings": ["aprendizado 1 para guardar na memória", "aprendizado 2"]
}`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: buildSystemPrompt(profile) },
        { role: "user", content: userPrompt },
      ],
    });

    const content = result.choices[0]?.message?.content;
    if (typeof content !== "string") throw new Error("LLM retornou resposta inválida");

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

    return {
      influencer: profile.agentName,
      date: today,
      posts: parsed.posts || [],
      memoryInsights: parsed.memoryInsights || "",
      trendsFocus: parsed.trendsFocus || "",
      learnings: parsed.learnings || [],
    };
  } catch (err: any) {
    console.error(`[InfluencerAgent:${profile.displayName}] Erro LLM:`, err.message);
    return {
      influencer: profile.agentName,
      date: today,
      posts: [],
      memoryInsights: `Erro ao gerar conteúdo: ${err.message}`,
      trendsFocus: "",
      learnings: [],
    };
  }
}

// ─── Salvar posts no banco ────────────────────────────────────────────────────

async function saveGeneratedPosts(
  influencerDbId: number,
  result: InfluencerContentResult
): Promise<void> {
  try {
    const db = await getDb();
    if (!db || result.posts.length === 0) return;

    for (const post of result.posts) {
      await db.insert(influencerPosts).values({
        influencerId: influencerDbId,
        platform: post.platform === "story" ? "instagram" : post.platform,
        content: post.contentIdea,
        caption: post.caption,
        hashtags: post.hashtags,
        status: "draft",
        scheduledAt: null,
        publishedAt: null,
      });
    }

    console.log(`[InfluencerAgent] ${result.posts.length} posts salvos para ${result.influencer}`);
  } catch (err: any) {
    console.error(`[InfluencerAgent] Erro ao salvar posts:`, err.message);
  }
}

// ─── Execução para uma influencer ────────────────────────────────────────────

export async function runInfluencerAgent(agentName: string): Promise<InfluencerContentResult | null> {
  const profile = INFLUENCER_PROFILES[agentName];
  if (!profile) {
    console.error(`[InfluencerAgent] Perfil não encontrado: ${agentName}`);
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);
  console.log(`[InfluencerAgent:${profile.displayName}] Iniciando — ${today}`);

  try {
    const db = await getDb();
    if (!db) throw new Error("DB indisponível");

    // Buscar ID da influencer no banco
    const dbRecord = await db
      .select({ id: influencers.id })
      .from(influencers)
      .where(eq(influencers.instagramHandle, profile.instagramHandle))
      .limit(1);

    const influencerDbId = dbRecord[0]?.id ?? 0;

    // Carregar tudo em paralelo
    const [memoryContext, performanceHistory, trendData] = await Promise.all([
      buildMemoryContext(agentName),
      influencerDbId ? loadPerformanceHistory(influencerDbId) : Promise.resolve("Perfil ainda não registrado no banco."),
      multiSearch([
        `tendências conteúdo Instagram ${profile.niche} Brasil 2026`,
        `${profile.niche} viral TikTok reels maio 2026`,
      ]),
    ]);

    // Gerar conteúdo
    const result = await generateDailyContent(profile, memoryContext, performanceHistory, trendData, today);

    // Salvar memória criativa
    await saveMemory(agentName, "daily_content", today, {
      memoryInsights: result.memoryInsights,
      trendsFocus: result.trendsFocus,
      learnings: result.learnings,
      postsCount: result.posts.length,
    });

    // Salvar posts no banco
    if (influencerDbId) {
      await saveGeneratedPosts(influencerDbId, result);
    }

    console.log(`[InfluencerAgent:${profile.displayName}] Concluído — ${result.posts.length} posts gerados`);
    return result;
  } catch (err: any) {
    console.error(`[InfluencerAgent:${profile.displayName}] Erro:`, err.message);
    return null;
  }
}

// ─── Execução para todas as influencers ──────────────────────────────────────

export async function runAllInfluencerAgents(): Promise<void> {
  console.log("[InfluencerAgent] Iniciando ciclo diário para todas as influencers...");
  const names = Object.keys(INFLUENCER_PROFILES);

  for (const name of names) {
    await runInfluencerAgent(name);
    // Pequena pausa para não sobrecarregar a API do LLM
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log("[InfluencerAgent] Ciclo diário concluído para todas as influencers.");
}
