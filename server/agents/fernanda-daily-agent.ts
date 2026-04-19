/**
 * Fernanda Daily Agent — análise diária automática das campanhas Meta Ads
 *
 * Responsabilidade:
 * 1. Buscar dados reais da Meta Ads API (últimos 2 dias)
 * 2. Carregar contexto histórico da memória da Fernanda
 * 3. Chamar LLM especializado para análise
 * 4. Persistir resultado como daily_analysis
 * 5. Aos domingos, gerar weekly_summary consolidando a semana
 */

import { invokeLLM } from "../_core/llm";
import { buildMemoryContext, saveMemory } from "../services/agentMemory";
import { getDb } from "../db";
import { agentActions } from "../../drizzle/schema";
import { executeMetaAction } from "./fernanda-executor";
import { generateAdCopy } from "./beatriz-agent";

const AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || "act_231648936319132";
const GRAPH_BASE = "https://graph.facebook.com/v20.0";
const RUN_HOUR = 8;
let lastRunDate: string | null = null;

// ─── Tipos internos ───────────────────────────────────────────────────────────

interface MetaCampaignInsight {
  campaign_id: string;
  campaign_name: string;
  impressions: string;
  clicks: string;
  spend: string;
  ctr: string;
  cpc: string;
  actions?: Array<{ action_type: string; value: string }>;
  date_start: string;
  date_stop: string;
}

export interface DailyAnalysisResult {
  summary: string;
  highlights: string[];
  alerts: string[];
  recommendations: string[];
  roas: number;
  spend: number;
  revenue: number;
}

// ─── Fetch Meta Ads ───────────────────────────────────────────────────────────

async function fetchCampaignInsights(): Promise<MetaCampaignInsight[]> {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    console.warn("[FernandaDaily] META_ACCESS_TOKEN não configurado");
    return [];
  }

  const params = new URLSearchParams({
    fields: "campaign_id,campaign_name,impressions,clicks,spend,ctr,cpc,actions",
    date_preset: "last_2d",
    level: "campaign",
    limit: "50",
    access_token: token,
  });

  const url = `${GRAPH_BASE}/${AD_ACCOUNT_ID}/insights?${params.toString()}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("[FernandaDaily] Erro Meta API:", data.error?.message ?? `HTTP ${res.status}`);
      return [];
    }

    return (data.data as MetaCampaignInsight[]) || [];
  } catch (err: any) {
    console.error("[FernandaDaily] Falha ao buscar insights:", err.message);
    return [];
  }
}

// ─── Análise LLM diária ───────────────────────────────────────────────────────

const SYSTEM_PROMPT_DAILY = `Você é a Fernanda Leal — gestora de tráfego pago sênior com 13 anos de experiência em performance marketing. Certificada pelo Facebook Blueprint (nível avançado), Google Ads e pela Digital Marketer (Customer Value Optimization). Gerenciou mais de R$15 milhões em verba publicitária para marcas de moda, atacado e e-commerce no Brasil. Ex-head de mídia paga da Amaro e consultora de performance para marcas de atacado têxtil em São Paulo.

SEU MÉTODO: você pensa em dados primeiro, nunca em achismo. Identifica o gargalo exato na jornada (impressão → clique → sessão → carrinho → compra) e ataca o ponto de maior alavancagem. Usa a metodologia "80/20 de verba" — concentra 80% do orçamento nas campanhas com ROAS comprovado e testa 20% em novas abordagens.

BENCHMARKS QUE VOCÊ USA COMO REFERÊNCIA (atacado moda Brasil):
- CTR saudável para cold audience: 1,2–2,5% | Abaixo de 0,8% = criativo morto
- CPC aceitável: R$1,50–R$3,50 | Acima de R$5 = público errado ou criativo fraco
- ROAS mínimo aceitável: 4x | Meta: 6x+ | Excepcional: 10x+
- CPA máximo para produto R$400: R$80 (20% do ticket)
- Frequência ideal: 2,5–4x por semana (acima de 6 = fadiga)
- CPM normal no nicho: R$15–R$35

CONTEXTO FEMINNITA — SITUAÇÃO CRÍTICA:
- Pijamas atacado exclusivos para revendedoras autônomas
- Ticket médio: R$400/pedido | Margem da revendedora: 40-60%
- Vendas atuais: ~R$20K/mês (queda de R$78K — dano de agência anterior)
- Meta urgente: R$100K/mês = 250 pedidos/mês = 8,3 pedidos/dia
- Campanhas ativas: Remarketing 60d + Prospecção Sul+Sudeste
- Orçamento atual: R$25/dia por campanha (~R$1.500/mês)
- DADO TESTADO: banners estáticos com foto real de produto superam vídeos em 2,3x no nicho
- Pixel instalado: sim | Conversão rastreada: sim

SUA ANÁLISE DEVE:
1. Identificar qual campanha está puxando ou segurando o resultado
2. Detectar se há fadiga de criativo (frequência alta + CTR caindo)
3. Apontar o gargalo principal (topo, meio ou fundo de funil)
4. Recomendar ajuste de orçamento específico (números reais, não "aumentar um pouco")
5. Sugerir próximo teste criativo com hipótese clara

Retorne APENAS JSON válido:
{
  "summary": "string — diagnóstico preciso em 2-3 frases com número principal do dia",
  "highlights": ["resultado positivo específico com número", "segundo ponto positivo"],
  "alerts": ["alerta concreto com causa provável e impacto estimado"],
  "recommendations": ["ação específica com número: ex 'Aumentar orçamento da campanha X de R$25 para R$40/dia'", "segundo ajuste tático"],
  "roas": 0.0,
  "spend": 0.0,
  "revenue": 0.0
}

Quando não houver dados suficientes, roas/spend/revenue = 0 e explique no summary qual dado está faltando e como obtê-lo.`;

async function analyzeWithLLM(
  insightsRaw: MetaCampaignInsight[],
  memoryContext: string,
  today: string
): Promise<DailyAnalysisResult> {
  const totalSpend = insightsRaw.reduce((s, r) => s + parseFloat(r.spend || "0"), 0);
  const totalPurchases = insightsRaw.reduce((s, r) => {
    const p = (r.actions || []).find(
      (a) => a.action_type === "purchase" || a.action_type === "offsite_conversion.fb_pixel_purchase"
    );
    return s + parseFloat(p?.value || "0");
  }, 0);

  const estimatedRevenue = totalPurchases * 400; // ticket médio R$400
  const roas = totalSpend > 0 ? estimatedRevenue / totalSpend : 0;

  const dataStr =
    insightsRaw.length > 0
      ? JSON.stringify(insightsRaw, null, 2)
      : "Nenhum dado retornado pela API Meta Ads — token pode estar expirado ou sem campanhas ativas.";

  const userPrompt = `Data: ${today}
Dados das campanhas Meta Ads (últimos 2 dias):
${dataStr}

Contexto histórico:
${memoryContext}

Analise os dados e gere o relatório diário em JSON conforme instruído.`;

  try {
    const result = await invokeLLM({
      messages: [
        { role: "system", content: SYSTEM_PROMPT_DAILY },
        { role: "user", content: userPrompt },
      ],
      outputSchema: {
        name: "daily_analysis",
        schema: {
          type: "object",
          properties: {
            summary: { type: "string" },
            highlights: { type: "array", items: { type: "string" } },
            alerts: { type: "array", items: { type: "string" } },
            recommendations: { type: "array", items: { type: "string" } },
            roas: { type: "number" },
            spend: { type: "number" },
            revenue: { type: "number" },
          },
          required: ["summary", "highlights", "alerts", "recommendations", "roas", "spend", "revenue"],
        },
      },
    });

    const content = result.choices[0]?.message?.content;
    if (typeof content !== "string") throw new Error("LLM retornou resposta inválida");

    const stripped = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : stripped) as DailyAnalysisResult;
    // Enriquecer com valores calculados se o LLM retornou 0
    if (parsed.spend === 0 && totalSpend > 0) parsed.spend = totalSpend;
    if (parsed.roas === 0 && roas > 0) parsed.roas = Math.round(roas * 100) / 100;
    if (parsed.revenue === 0 && estimatedRevenue > 0) parsed.revenue = estimatedRevenue;

    return parsed;
  } catch (err: any) {
    console.error("[FernandaDaily] Erro LLM:", err.message);
    return {
      summary: `Análise do dia ${today} — erro ao processar dados: ${err.message}`,
      highlights: [],
      alerts: ["Erro ao gerar análise automática — verificar logs"],
      recommendations: [],
      roas,
      spend: totalSpend,
      revenue: estimatedRevenue,
    };
  }
}

// ─── Resumo semanal ───────────────────────────────────────────────────────────

async function generateWeeklySummary(weekPeriod: string): Promise<void> {
  const { getMemoriesByType } = await import("../services/agentMemory");

  const dailyAnalyses = await getMemoriesByType("fernanda", "daily_analysis", 7);
  if (dailyAnalyses.length === 0) {
    console.log("[FernandaDaily] Sem análises diárias para consolidar no resumo semanal");
    return;
  }

  const summariesText = dailyAnalyses
    .map((entry: { period: string; content: string }) => {
      try {
        const data = JSON.parse(entry.content) as DailyAnalysisResult;
        return `[${entry.period}] Spend: R$${data.spend} | ROAS: ${data.roas}x\n${data.summary}`;
      } catch {
        return `[${entry.period}] ${entry.content.slice(0, 200)}`;
      }
    })
    .join("\n\n");

  const result = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Você é a Fernanda Leal, especialista em tráfego Meta Ads para atacado de moda.
Consolide as análises diárias da semana em um resumo executivo.
Retorne JSON: { "summary": "resumo em 3-5 frases", "totalSpend": number, "avgRoas": number, "keyLearnings": ["..."], "weekPriorities": ["..."] }`,
      },
      {
        role: "user",
        content: `Semana ${weekPeriod} — análises diárias:\n\n${summariesText}\n\nGere o resumo semanal consolidado.`,
      },
    ],
  });

  const content = result.choices[0]?.message?.content;
  if (typeof content === "string") {
    try {
      const s = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
      const m = s.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(m ? m[0] : s);
      await saveMemory("fernanda", "weekly_summary", weekPeriod, parsed);
      console.log(`[FernandaDaily] Resumo semanal ${weekPeriod} salvo`);
    } catch {
      await saveMemory("fernanda", "weekly_summary", weekPeriod, { summary: content });
    }
  }
}

// ─── Propor ações para o painel de aprovação ─────────────────────────────────

function inferPriority(text: string): "alta" | "media" | "baixa" {
  const low = text.toLowerCase();
  if (/pausar|desativar|urgente|roas.*baix|cpa.*alto|desperd/.test(low)) return "alta";
  if (/monitorar|observar|acompanhar/.test(low)) return "baixa";
  return "media";
}

function inferActionType(text: string): string {
  const low = text.toLowerCase();
  if (/novo anúncio|criar anúncio|novo criativo|criar criativo/.test(low)) return "meta_create_full_ad";
  if (/criativo|banner|imagem|vídeo/.test(low)) return "criativo";
  if (/orçamento|budget|verba|investimento/.test(low)) return "orcamento";
  if (/público|audience|segmentação/.test(low)) return "segmentacao";
  if (/pausar|desativar|ativar|reativar/.test(low)) return "campanha";
  return "campaign";
}

async function proposeActions(analysis: DailyAnalysisResult, today: string): Promise<void> {
  if (!analysis.recommendations || analysis.recommendations.length === 0) return;

  try {
    const db = await getDb();
    if (!db) return;

    const { eq, and } = await import("drizzle-orm");
    const existing = await db
      .select({ title: agentActions.title })
      .from(agentActions)
      .where(and(eq(agentActions.agentName, "fernanda"), eq(agentActions.date, today)));

    const existingTitles = new Set(existing.map((r: { title: string | null }) => r.title));

    const toInsert: typeof agentActions.$inferInsert[] = [];

    for (const rec of analysis.recommendations) {
      if (!rec || !rec.trim()) continue;
      const title = rec.length > 150 ? rec.slice(0, 147) + "…" : rec;
      if (existingTitles.has(title)) continue;

      const actionType = inferActionType(rec);
      let description = rec;

      // Se é para criar novo anúncio, chama a Beatriz para gerar o copy
      if (actionType === "meta_create_full_ad") {
        try {
          console.log(`[FernandaDaily] Chamando Beatriz para gerar copy: "${rec.slice(0, 60)}"`);
          const copy = await generateAdCopy(
            `Contexto da campanha Feminnita Pijamas:\n${rec}\n\nROAS atual: ${analysis.roas}x | Gasto: R$${analysis.spend.toFixed(2)}`
          );
          description = JSON.stringify({
            recommendation: rec,
            copy: {
              headline: copy.headline,
              body: copy.body,
              imageDescription: copy.imageDescription,
            },
            generatedBy: "beatriz",
            linkUrl: "https://www.feminnita.com.br",
          });
          console.log(`[FernandaDaily] Beatriz gerou copy: "${copy.headline}"`);
        } catch (err: any) {
          console.error("[FernandaDaily] Beatriz falhou no copy, usando texto simples:", err.message);
        }
      }

      toInsert.push({
        agentName: "fernanda",
        date: today,
        title,
        description,
        actionType,
        priority: inferPriority(rec),
        estimatedImpact: analysis.roas > 0
          ? `ROAS atual: ${analysis.roas}x | Spend: R$${analysis.spend.toFixed(2)}`
          : undefined,
        status: "pending",
      });
    }

    if (toInsert.length > 0) {
      await db.insert(agentActions).values(toInsert);
      console.log(`[FernandaDaily] ${toInsert.length} ações propostas (${toInsert.filter(a => a.actionType === "meta_create_full_ad").length} com copy da Beatriz)`);
    }
  } catch (err: any) {
    console.error("[FernandaDaily] Erro ao propor ações:", err.message);
  }
}

// ─── Execução principal ───────────────────────────────────────────────────────

export async function runDailyAnalysis(): Promise<DailyAnalysisResult> {
  const today = new Date().toISOString().slice(0, 10); // "2026-04-12"

  console.log(`[FernandaDaily] Iniciando análise diária — ${today}`);

  // 1. Carregar contexto histórico
  const memoryContext = await buildMemoryContext("fernanda");

  // 2. Buscar dados reais Meta Ads
  const insights = await fetchCampaignInsights();
  console.log(`[FernandaDaily] ${insights.length} campanhas com dados`);

  // 3. Analisar com LLM
  const analysis = await analyzeWithLLM(insights, memoryContext, today);

  // 4. Persistir no banco
  await saveMemory("fernanda", "daily_analysis", today, analysis);
  console.log(`[FernandaDaily] Análise do dia ${today} salva — ROAS: ${analysis.roas}x | Spend: R$${analysis.spend}`);

  // 5. Propor ações para o painel de aprovação
  await proposeActions(analysis, today);

  // 6. Se domingo (0), gerar resumo semanal
  const dayOfWeek = new Date().getDay();
  if (dayOfWeek === 0) {
    const weekNumber = getISOWeek(new Date());
    const year = new Date().getFullYear();
    const weekPeriod = `${year}-W${String(weekNumber).padStart(2, "0")}`;
    console.log(`[FernandaDaily] Domingo — gerando resumo semanal ${weekPeriod}`);
    await generateWeeklySummary(weekPeriod);
  }

  return analysis;
}

// ─── Execução automática de ações de baixo risco ─────────────────────────────

async function autoExecuteCampaignActions(insights: MetaCampaignInsight[], today: string): Promise<void> {
  const db = await getDb();

  for (const ins of insights) {
    const spend = parseFloat(ins.spend || "0");
    const ctr = parseFloat(ins.ctr || "0");
    const clicks = parseInt(ins.clicks || "0");

    // Pausa automática: CTR < 0.8% com gasto > R$30 nos últimos 2 dias
    if (ctr < 0.8 && spend > 30 && clicks < 5) {
      try {
        console.log(`[FernandaDaily] Auto-pausando campanha com baixo CTR: ${ins.campaign_name} (CTR: ${ctr.toFixed(2)}%, gasto: R$${spend.toFixed(2)})`);
        await executeMetaAction("meta_pause_campaign", { campaignId: ins.campaign_id });

        if (db) {
          await db.insert(agentActions).values({
            agentName: "fernanda",
            date: today,
            title: `[Auto-executado] Campanha pausada: ${ins.campaign_name}`,
            description: `Campanha pausada automaticamente por baixo desempenho: CTR ${ctr.toFixed(2)}%, gasto R$${spend.toFixed(2)} nos últimos 2 dias.`,
            actionType: "campanha",
            priority: "alta",
            estimatedImpact: `Economia de verba em campanha ineficiente`,
            status: "done",
          });
        }
      } catch (err: any) {
        console.error(`[FernandaDaily] Erro ao pausar ${ins.campaign_name}:`, err.message);
      }
    }
  }
}

// ─── Scheduler ────────────────────────────────────────────────────────────────

export function startFernandaDailyAgent(): () => void {
  console.log(`[FernandaDaily] Agente iniciado. Roda diariamente às ${String(RUN_HOUR).padStart(2, "0")}:00.`);

  const interval = setInterval(async () => {
    const now = new Date();
    if (now.getHours() === RUN_HOUR && lastRunDate !== now.toDateString()) {
      lastRunDate = now.toDateString();
      try {
        const insights = await fetchCampaignInsights();
        const today = now.toISOString().slice(0, 10);

        // Executa ações automáticas antes da análise LLM
        await autoExecuteCampaignActions(insights, today);

        // Análise completa + propostas para aprovação
        await runDailyAnalysis();
      } catch (err: any) {
        console.error("[FernandaDaily] Erro no ciclo diário:", err.message);
      }
    }
  }, 10 * 60 * 1000); // verifica a cada 10 minutos

  return () => {
    clearInterval(interval);
    console.log("[FernandaDaily] Agente encerrado.");
  };
}

// Utilitário: número da semana ISO
function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}
