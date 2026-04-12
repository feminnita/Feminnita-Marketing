/**
 * Agent Memory Service — persistência e recuperação de memória dos agentes IA
 *
 * Permite que agentes como a Fernanda (tráfego) acumulem contexto ao longo do tempo:
 * análises diárias, resumos semanais, metas de negócio e aprendizados.
 */

import { getDb } from "../db";
import { agentMemory } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export type MemoryType =
  | "daily_analysis"
  | "weekly_summary"
  | "monthly_report"
  | "business_goals"
  | "learning";

// ─── Funções principais ───────────────────────────────────────────────────────

/**
 * Salva ou atualiza uma memória (upsert por agentName + memoryType + period).
 */
export async function saveMemory(
  agentName: string,
  memoryType: MemoryType,
  period: string,
  content: object | string
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Banco indisponível");

  const contentStr =
    typeof content === "string" ? content : JSON.stringify(content);

  // Verificar se já existe entrada para este (agentName, memoryType, period)
  const existing = await db
    .select({ id: agentMemory.id })
    .from(agentMemory)
    .where(
      and(
        eq(agentMemory.agentName, agentName),
        eq(agentMemory.memoryType, memoryType),
        eq(agentMemory.period, period)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(agentMemory)
      .set({ content: contentStr })
      .where(eq(agentMemory.id, existing[0].id));
  } else {
    await db.insert(agentMemory).values({
      agentName,
      memoryType,
      period,
      content: contentStr,
    });
  }
}

/**
 * Retorna as últimas N memórias de um agente, ordenadas pela mais recente.
 */
export async function getRecentMemories(
  agentName: string,
  limit = 10
) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(agentMemory)
    .where(eq(agentMemory.agentName, agentName))
    .orderBy(desc(agentMemory.createdAt))
    .limit(limit);
}

/**
 * Retorna memórias de um tipo específico para um agente.
 */
export async function getMemoriesByType(
  agentName: string,
  memoryType: MemoryType,
  limit = 10
) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(agentMemory)
    .where(
      and(
        eq(agentMemory.agentName, agentName),
        eq(agentMemory.memoryType, memoryType)
      )
    )
    .orderBy(desc(agentMemory.createdAt))
    .limit(limit);
}

/**
 * Constrói o contexto de memória completo para injetar no prompt da Fernanda.
 *
 * Inclui:
 * - Contexto fixo do negócio Feminnita
 * - Últimas 7 análises diárias
 * - Último resumo semanal
 * - Todos os aprendizados acumulados
 */
export async function buildMemoryContext(agentName: string): Promise<string> {
  const db = await getDb();
  if (!db) return buildStaticBusinessContext();

  // Buscar dados em paralelo
  const [dailyAnalyses, weeklySummaries, learnings, goals] = await Promise.all([
    getMemoriesByType(agentName, "daily_analysis", 7),
    getMemoriesByType(agentName, "weekly_summary", 1),
    getMemoriesByType(agentName, "learning", 20),
    getMemoriesByType(agentName, "business_goals", 1),
  ]);

  const lines: string[] = [];

  lines.push("=== MEMÓRIA DA FERNANDA ===");
  lines.push("");

  // Contexto do negócio (das metas salvas ou padrão)
  lines.push("CONTEXTO DO NEGÓCIO:");
  if (goals.length > 0) {
    try {
      const goalsData = JSON.parse(goals[0].content);
      if (typeof goalsData === "object" && goalsData !== null) {
        Object.entries(goalsData).forEach(([k, v]) => {
          lines.push(`- ${k}: ${v}`);
        });
      } else {
        lines.push(goals[0].content);
      }
    } catch {
      lines.push(goals[0].content);
    }
  } else {
    lines.push("- Feminnita Pijamas Atacado | Ticket médio: R$400");
    lines.push("- Meta mensal: R$100.000 (atual: ~R$20.000 — era R$78.000 antes da agência)");
    lines.push("- Ad spend: R$1.500/mês (R$50/dia) | ROAS mínimo: 4x | CPA máximo: R$80");
    lines.push("- Campanhas ativas: Remarketing + Revenda Sul+Sudeste | R$25/dia cada");
  }
  lines.push("");

  // Últimas análises diárias
  if (dailyAnalyses.length > 0) {
    lines.push("ÚLTIMAS ANÁLISES DIÁRIAS:");
    for (const entry of dailyAnalyses) {
      lines.push(`\n[${entry.period}]`);
      try {
        const data = JSON.parse(entry.content);
        if (data.summary) lines.push(`Resumo: ${data.summary}`);
        if (data.spend !== undefined) lines.push(`Spend: R$${data.spend} | ROAS: ${data.roas ?? "N/D"}`);
        if (Array.isArray(data.highlights) && data.highlights.length > 0) {
          lines.push("Destaques: " + data.highlights.join(" | "));
        }
        if (Array.isArray(data.alerts) && data.alerts.length > 0) {
          lines.push("Alertas: " + data.alerts.join(" | "));
        }
      } catch {
        lines.push(entry.content.slice(0, 300));
      }
    }
    lines.push("");
  }

  // Último resumo semanal
  if (weeklySummaries.length > 0) {
    lines.push("RESUMO SEMANAL MAIS RECENTE:");
    lines.push(`[${weeklySummaries[0].period}]`);
    try {
      const data = JSON.parse(weeklySummaries[0].content);
      if (typeof data === "object" && data !== null && data.summary) {
        lines.push(data.summary);
      } else {
        lines.push(weeklySummaries[0].content.slice(0, 500));
      }
    } catch {
      lines.push(weeklySummaries[0].content.slice(0, 500));
    }
    lines.push("");
  }

  // Aprendizados acumulados
  if (learnings.length > 0) {
    lines.push("APRENDIZADOS ACUMULADOS:");
    for (const entry of learnings) {
      try {
        const data = JSON.parse(entry.content);
        const insight = data.insight || entry.content;
        lines.push(`- [${entry.period}] ${insight}`);
      } catch {
        lines.push(`- [${entry.period}] ${entry.content}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

function buildStaticBusinessContext(): string {
  return `=== MEMÓRIA DA FERNANDA ===

CONTEXTO DO NEGÓCIO:
- Feminnita Pijamas Atacado | Ticket médio: R$400
- Meta mensal: R$100.000 (atual: ~R$20.000 — era R$78.000 antes da agência)
- Ad spend: R$1.500/mês (R$50/dia) | ROAS mínimo: 4x | CPA máximo: R$80
- Campanhas ativas: Remarketing + Revenda Sul+Sudeste | R$25/dia cada
`;
}
