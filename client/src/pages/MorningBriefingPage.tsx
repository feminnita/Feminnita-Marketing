import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  Play,
  RefreshCw,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Config por agente ────────────────────────────────────────────────────────

const AGENT_CONFIG: Record<string, { label: string; role: string; emoji: string; color: string; bg: string }> = {
  fernanda: { label: "Fernanda",  role: "Tráfego Pago",             emoji: "📊", color: "#6B1D28", bg: "#FFF1F2" },
  sofia:    { label: "Sofia",     role: "Crescimento Instagram",     emoji: "📱", color: "#DB2777", bg: "#FCE7F3" },
  clara:    { label: "Clara",     role: "Inteligência Competitiva",  emoji: "🔍", color: "#2563EB", bg: "#EFF6FF" },
  mariana:  { label: "Mariana",   role: "Vendas Multicanal",         emoji: "💰", color: "#059669", bg: "#D1FAE5" },
};

function toStr(item: any): string {
  if (typeof item === "string") return item;
  if (item === null || item === undefined) return "";
  if (typeof item === "object") {
    return item.summary || item.titulo || item.message || item.text || JSON.stringify(item);
  }
  return String(item);
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

// ─── Componente de card do agente ─────────────────────────────────────────────

function AgentCard({ agent }: { agent: any }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = AGENT_CONFIG[agent.agentName] ?? {
    label: agent.agentName, role: agent.agentRole, emoji: "🤖", color: "#64748b", bg: "#F8FAFC",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4" style={{ backgroundColor: cfg.bg }}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold border-2 border-white shadow"
            style={{ backgroundColor: cfg.color }}
          >
            <span>{cfg.emoji}</span>
          </div>
          <div>
            <p className="font-semibold text-slate-900">{cfg.label}</p>
            <p className="text-xs text-slate-500">{cfg.role}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {agent.error ? (
            <Badge variant="destructive" className="text-xs">Erro</Badge>
          ) : (
            <>
              {agent.actionCount > 0 && (
                <Badge className="text-xs text-white" style={{ backgroundColor: cfg.color }}>
                  {agent.actionCount} {agent.actionCount === 1 ? "ação" : "ações"}
                </Badge>
              )}
              {agent.alerts?.length > 0 && (
                <Badge variant="outline" className="text-xs text-amber-700 border-amber-300">
                  {agent.alerts.length} alerta{agent.alerts.length > 1 ? "s" : ""}
                </Badge>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sumário */}
      <div className="p-4">
        {agent.error ? (
          <p className="text-sm text-red-600 italic">{agent.error}</p>
        ) : (
          <>
            <p className="text-sm text-slate-700 leading-relaxed">{toStr(agent.summary)}</p>

            {/* Highlights */}
            {agent.highlights?.length > 0 && (
              <div className="mt-3 space-y-1">
                {agent.highlights.map((h: string, i: number) => (
                  <p key={i} className="text-xs text-slate-600 flex items-start gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    {h}
                  </p>
                ))}
              </div>
            )}

            {/* Alertas */}
            {expanded && agent.alerts?.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">Alertas</p>
                {agent.alerts.map((a: string, i: number) => (
                  <p key={i} className="text-xs text-amber-700 flex items-start gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    {a}
                  </p>
                ))}
              </div>
            )}

            {/* Recomendações */}
            {expanded && agent.recommendations?.length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-1">Recomendações</p>
                {agent.recommendations.map((r: string, i: number) => (
                  <p key={i} className="text-xs text-slate-700 flex items-start gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-violet-500 flex-shrink-0 mt-0.5" />
                    {r}
                  </p>
                ))}
              </div>
            )}

            {/* Toggle */}
            {(agent.alerts?.length > 0 || agent.recommendations?.length > 0) && (
              <button
                onClick={() => setExpanded((v) => !v)}
                className="mt-3 text-xs font-medium hover:underline"
                style={{ color: cfg.color }}
              >
                {expanded ? "▲ Ver menos" : "▼ Ver alertas e recomendações"}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function MorningBriefingPage() {
  const { data: briefing, isLoading, refetch } = trpc.morningBriefing.getToday.useQuery(undefined, {
    retry: false,
  });
  const { data: recent } = trpc.morningBriefing.getRecent.useQuery();

  const triggerMutation = trpc.morningBriefing.triggerBriefing.useMutation({
    onSuccess: () => {
      toast.success("Briefing gerado com sucesso!");
      refetch();
    },
    onError: (e) => toast.error("Erro ao gerar briefing: " + e.message),
  });

  const isGenerating = triggerMutation.isPending;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            ☀️ Briefing Matinal
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Análise diária dos 5 agentes da Feminnita
          </p>
        </div>
        <Button
          onClick={() => triggerMutation.mutate()}
          disabled={isGenerating}
          style={{ backgroundColor: "#6B1D28" }}
          className="text-white gap-2"
        >
          {isGenerating ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Gerando…</>
          ) : briefing ? (
            <><RefreshCw className="w-4 h-4" /> Atualizar Briefing</>
          ) : (
            <><Play className="w-4 h-4" /> Gerar Briefing de Hoje</>
          )}
        </Button>
      </div>

      {/* Estado: gerando */}
      {isGenerating && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-rose-600 mb-3" />
          <p className="font-medium text-rose-800">Executando análise dos 5 agentes em paralelo…</p>
          <p className="text-sm text-rose-600 mt-1">Pode levar até 2 minutos.</p>
        </div>
      )}

      {/* Estado: sem briefing */}
      {!isLoading && !briefing && !isGenerating && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-10 text-center text-slate-400">
          <Clock className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium">Nenhum briefing para hoje.</p>
          <p className="text-sm mt-1">Clique em "Gerar Briefing de Hoje" para iniciar a análise dos agentes.</p>
        </div>
      )}

      {/* Estado: carregando */}
      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white rounded-2xl h-48 animate-pulse border border-slate-100" />
          ))}
        </div>
      )}

      {/* Briefing carregado */}
      {briefing && !isGenerating && (
        <>
          {/* Meta info */}
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Gerado em {formatDateTime(briefing.generatedAt)}
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl border border-slate-100 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-slate-900">{briefing.agents.filter((a: any) => !a.error).length}/5</p>
              <p className="text-xs text-slate-500 mt-1">Agentes ativos</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-slate-900">{briefing.totalActions}</p>
              <p className="text-xs text-slate-500 mt-1">Ações propostas</p>
            </div>
            <div className="bg-white rounded-xl border border-rose-200 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-rose-700">{briefing.highPriorityActions}</p>
              <p className="text-xs text-rose-500 mt-1">Alta prioridade</p>
            </div>
            <div className="bg-white rounded-xl border border-slate-100 p-4 text-center shadow-sm">
              <p className="text-2xl font-bold text-slate-900">{briefing.topAlerts?.length ?? 0}</p>
              <p className="text-xs text-slate-500 mt-1">Alertas críticos</p>
            </div>
          </div>

          {/* Path to 100K */}
          {briefing.pathTo100k && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
              <Target className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-emerald-800 mb-1">Caminho para R$100K</p>
                <p className="text-sm text-emerald-700">{briefing.pathTo100k}</p>
              </div>
            </div>
          )}

          {/* Alertas críticos */}
          {briefing.topAlerts?.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-amber-800 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Alertas Críticos
              </p>
              <ul className="space-y-2">
                {briefing.topAlerts.map((a: string, i: number) => (
                  <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 text-xs flex items-center justify-center flex-shrink-0 font-bold mt-0.5">{i + 1}</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cards dos agentes */}
          <div>
            <h2 className="text-base font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> Análise por Agente
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {briefing.agents.map((agent: any) => (
                <AgentCard key={agent.agentName} agent={agent} />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Histórico */}
      {recent && recent.filter((r: any) => r.data).length > 1 && (
        <div className="border-t border-slate-200 pt-6">
          <h2 className="text-sm font-semibold text-slate-600 mb-3">Histórico recente</h2>
          <div className="flex flex-wrap gap-2">
            {recent
              .filter((r: any) => r.data)
              .map((r: any) => (
                <div
                  key={r.period}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-2"
                >
                  <span>{r.period}</span>
                  <span className="text-slate-400">{r.data?.totalActions ?? 0} ações</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
