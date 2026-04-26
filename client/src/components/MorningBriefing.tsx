/**
 * MorningBriefing — Componente de briefing matinal no dashboard
 *
 * Exibe o briefing consolidado de todos os 5 agentes.
 * Mostra alertas importantes, total de ações pendentes e caminho para R$100K.
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Bot,
  ChevronDown,
  ChevronUp,
  Zap,
  TrendingUp,
  Send,
  Eye,
  Target,
  Bell,
  Globe,
} from "lucide-react";

const AGENT_ICONS: Record<string, React.ReactNode> = {
  fernanda: <Zap className="w-4 h-4 text-purple-500" />,
  sofia:    <TrendingUp className="w-4 h-4 text-pink-500" />,
  clara:    <Eye className="w-4 h-4 text-blue-500" />,
  mariana:  <Send className="w-4 h-4 text-green-500" />,
};

const AGENT_COLORS: Record<string, string> = {
  fernanda: "border-l-purple-400",
  sofia:    "border-l-pink-400",
  clara:    "border-l-blue-400",
  mariana:  "border-l-green-400",
};

export default function MorningBriefing() {
  const [, setLocation] = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [triggering, setTriggering] = useState(false);

  const { data: briefing, refetch } = trpc.morningBriefing.getToday.useQuery();
  const { data: counts } = trpc.agentActions.countByStatus.useQuery();
  const triggerMutation = trpc.morningBriefing.triggerBriefing.useMutation({
    onSuccess: () => { refetch(); setTriggering(false); },
    onError: () => setTriggering(false),
  });

  if (!briefing && !counts?.pending) return null;

  const hasPending = (counts?.pending ?? 0) > 0;

  return (
    <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-white shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-500" />
            Briefing da Equipe IA
            {briefing?.date && (
              <span className="text-xs text-gray-400 font-normal">{briefing.date}</span>
            )}
            {briefing && (
              <Badge className="ml-1 text-xs bg-purple-100 text-purple-700">
                <Globe className="w-3 h-3 mr-1" />
                Web search ativo
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasPending && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-xs border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                onClick={() => setLocation("/acoes-agentes")}
              >
                <AlertTriangle className="w-3 h-3" />
                {counts!.pending} ações pendentes
              </Button>
            )}
            {briefing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                className="gap-1 text-xs"
              >
                {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {expanded ? "Recolher" : "Ver resumo"}
              </Button>
            ) : (
              <Button
                size="sm"
                className="gap-1 text-xs bg-purple-600 hover:bg-purple-700"
                onClick={() => { setTriggering(true); triggerMutation.mutate(); }}
                disabled={triggering}
              >
                <RefreshCw className={`w-3 h-3 ${triggering ? "animate-spin" : ""}`} />
                {triggering ? "Gerando..." : "Gerar briefing"}
              </Button>
            )}
          </div>
        </div>

        {/* Alertas rápidos */}
        {briefing?.topAlerts && briefing.topAlerts.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {briefing.topAlerts.slice(0, 3).map((alert, i) => (
              <span key={i} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {alert}
              </span>
            ))}
          </div>
        )}

        {/* Path to 100K */}
        {briefing?.pathTo100k && !expanded && (
          <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded px-2.5 py-1.5 mt-2 flex items-start gap-1.5">
            <Target className="w-3 h-3 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{briefing.pathTo100k}</span>
          </p>
        )}
      </CardHeader>

      {expanded && briefing && (
        <CardContent className="pt-0 space-y-3">
          {briefing.pathTo100k && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Target className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-800">Caminho para R$100K</span>
              </div>
              <p className="text-xs text-green-700">{briefing.pathTo100k}</p>
            </div>
          )}

          <div className="grid gap-2">
            {briefing.agents.map((agent) => (
              <div
                key={agent.agentName}
                className={`border-l-4 ${AGENT_COLORS[agent.agentName] || "border-l-gray-300"} pl-3 py-2 bg-white rounded-r-lg border border-l-4`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {AGENT_ICONS[agent.agentName] ?? <Bot className="w-4 h-4 text-gray-400" />}
                  <span className="text-xs font-semibold text-gray-800">{agent.agentRole}</span>
                  {agent.error && (
                    <span className="text-xs text-red-500 ml-auto">erro</span>
                  )}
                  {agent.actionCount > 0 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-1.5 rounded-full ml-auto">
                      {agent.actionCount} ações
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600">{agent.summary}</p>
                {agent.alerts && agent.alerts.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {agent.alerts.map((alert, i) => (
                      <span key={i} className="text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                        ⚠ {alert}
                      </span>
                    ))}
                  </div>
                )}
                {agent.recommendations && agent.recommendations.length > 0 && (
                  <div className="mt-1">
                    {agent.recommendations.slice(0, 2).map((rec, i) => (
                      <p key={i} className="text-xs text-gray-500">→ {rec}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              className="gap-1 text-xs"
              onClick={() => setLocation("/acoes-agentes")}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              Ver & aprovar ações ({briefing.totalActions})
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="gap-1 text-xs text-gray-500"
              onClick={() => { setTriggering(true); triggerMutation.mutate(); }}
              disabled={triggering}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${triggering ? "animate-spin" : ""}`} />
              Novo briefing
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
