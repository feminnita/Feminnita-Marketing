/**
 * Morning Briefing Agent — Briefing Diário Agregado
 *
 * Roda todo dia de manhã (via cron ou trigger manual) e:
 * 1. Executa análises de todos os 5 agentes em paralelo
 * 2. Agrega as ações propostas em uma lista unificada
 * 3. Salva o briefing consolidado para exibição no dashboard
 *
 * O usuário vê o briefing ao abrir o sistema e pode:
 * - Ver o resumo de cada agente
 * - Aprovar ou rejeitar ações propostas
 * - Executar ações aprovadas
 */

import { runDailyAnalysis } from "./fernanda-daily-agent";
import { runSofiaAnalysis } from "./sofia-agent";
import { runBeatrizAnalysis } from "./beatriz-agent";
import { runClaraAnalysis } from "./clara-agent";
import { runMarianaAnalysis } from "./mariana-agent";
import { saveMemory } from "../services/agentMemory";
import { getDb } from "../db";
import { agentActions } from "../../drizzle/schema";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface AgentBriefing {
  agentName: string;
  agentRole: string;
  summary: string;
  highlights: string[];
  alerts: string[];
  recommendations: string[];
  actionCount: number;
  error?: string;
}

export interface MorningBriefingResult {
  date: string;
  generatedAt: string;
  agents: AgentBriefing[];
  totalActions: number;
  highPriorityActions: number;
  topAlerts: string[];
  pathTo100k?: string;
}

// ─── Execução principal ───────────────────────────────────────────────────────

export async function runMorningBriefing(): Promise<MorningBriefingResult> {
  const today = new Date().toISOString().slice(0, 10);
  const generatedAt = new Date().toISOString();
  console.log(`[MorningBriefing] Iniciando briefing do dia ${today}`);

  // Executar todos os agentes em paralelo (com timeout individual de 60s)
  const withTimeout = <T>(promise: Promise<T>, agentName: string, ms = 60000): Promise<T> =>
    Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout ${ms}ms`)), ms)
      ),
    ]).catch((err: Error) => {
      console.error(`[MorningBriefing] Agente ${agentName} falhou:`, err.message);
      throw err;
    });

  const [fernandaResult, sofiaResult, beatrizResult, claraResult, marianaResult] =
    await Promise.allSettled([
      withTimeout(runDailyAnalysis(), "fernanda"),
      withTimeout(runSofiaAnalysis(), "sofia"),
      withTimeout(runBeatrizAnalysis(), "beatriz"),
      withTimeout(runClaraAnalysis(), "clara"),
      withTimeout(runMarianaAnalysis(), "mariana"),
    ]);

  // Mapear resultados
  const agents: AgentBriefing[] = [];

  function extractBriefing(
    result: PromiseSettledResult<any>,
    agentName: string,
    agentRole: string
  ): AgentBriefing {
    if (result.status === "rejected") {
      return {
        agentName,
        agentRole,
        summary: "Erro ao executar análise",
        highlights: [],
        alerts: [],
        recommendations: [],
        actionCount: 0,
        error: result.reason?.message || "Erro desconhecido",
      };
    }
    const data = result.value;
    return {
      agentName,
      agentRole,
      summary: data.summary || "",
      highlights: data.highlights || [],
      alerts: data.alerts || [],
      recommendations: data.recommendations || [],
      actionCount: (data.proposedActions || []).length,
    };
  }

  agents.push(extractBriefing(fernandaResult, "fernanda", "Gestora de Tráfego Meta Ads"));
  agents.push(extractBriefing(sofiaResult, "sofia", "Especialista em Crescimento Instagram"));
  agents.push(extractBriefing(beatrizResult, "beatriz", "Especialista em Conteúdo e Tendências"));
  agents.push(extractBriefing(claraResult, "clara", "Inteligência Competitiva"));
  agents.push(extractBriefing(marianaResult, "mariana", "Estratégia de Vendas Multicanal"));

  // Salvar ações propostas na tabela agent_actions
  const db = await getDb();
  if (db) {
    const allActions: Array<{
      agentName: string;
      title: string;
      description: string;
      type: string;
      priority: string;
      estimatedImpact: string;
      date: string;
    }> = [];

    const agentResults = [
      { name: "fernanda", result: fernandaResult },
      { name: "sofia", result: sofiaResult },
      { name: "beatriz", result: beatrizResult },
      { name: "clara", result: claraResult },
      { name: "mariana", result: marianaResult },
    ];

    for (const { name, result } of agentResults) {
      if (result.status === "fulfilled") {
        const actions = (result.value as any).proposedActions || [];
        for (const action of actions) {
          allActions.push({
            agentName: name,
            title: action.title || "Ação sem título",
            description: action.description || "",
            type: action.type || "general",
            priority: action.priority || "media",
            estimatedImpact: action.estimatedImpact || "",
            date: today,
          });
        }
      }
    }

    // Inserir ações (evitar duplicatas do mesmo dia)
    for (const action of allActions) {
      try {
        await db.insert(agentActions).values({
          agentName: action.agentName,
          date: action.date,
          title: action.title,
          description: action.description,
          actionType: action.type,
          priority: action.priority as "alta" | "media" | "baixa",
          estimatedImpact: action.estimatedImpact,
          status: "pending",
        });
      } catch (err: any) {
        // Ignora duplicatas
        if (!err.message?.includes("Duplicate")) {
          console.warn("[MorningBriefing] Erro ao salvar ação:", err.message);
        }
      }
    }

    console.log(`[MorningBriefing] ${allActions.length} ações salvas para aprovação`);
  }

  // Agregar alertas importantes
  const topAlerts = agents
    .flatMap((a) => a.alerts)
    .filter(Boolean)
    .slice(0, 5);

  const totalActions = agents.reduce((sum, a) => sum + a.actionCount, 0);
  const highPriorityActions = 0; // calculado na query

  // Path to R$100K (da Mariana)
  const pathTo100k =
    marianaResult.status === "fulfilled"
      ? (marianaResult.value as any).pathTo100k
      : undefined;

  const briefing: MorningBriefingResult = {
    date: today,
    generatedAt,
    agents,
    totalActions,
    highPriorityActions,
    topAlerts,
    pathTo100k,
  };

  // Salvar briefing consolidado na memória
  await saveMemory("sistema", "daily_analysis", today, briefing);
  console.log(`[MorningBriefing] Briefing do dia ${today} completo — ${totalActions} ações propostas`);

  return briefing;
}
