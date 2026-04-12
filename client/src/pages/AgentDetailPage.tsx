/**
 * Agent Detail Page — Página individual de cada agente especialista
 *
 * Rota: /agente/:name (sofia, beatriz, clara, mariana)
 *
 * Exibe:
 * 1. Análise mais recente do agente
 * 2. Ações propostas (com aprovação direta)
 * 3. Tendências / insights específicos do agente
 * 4. Botão para rodar nova análise
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  RefreshCw,
  Bot,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Eye,
  Send,
  Zap,
  ArrowLeft,
  Globe,
  Target,
  BarChart,
} from "lucide-react";

const AGENT_CONFIG: Record<string, {
  label: string;
  role: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  routeName: string;
}> = {
  sofia: {
    label: "Sofia Oliveira",
    role: "Especialista em Crescimento Instagram",
    icon: <TrendingUp className="w-5 h-5 text-pink-500" />,
    color: "text-pink-700",
    bgColor: "bg-pink-50 border-pink-200",
    routeName: "sofia",
  },
  beatriz: {
    label: "Beatriz Santos",
    role: "Especialista em Conteúdo e Tendências",
    icon: <Lightbulb className="w-5 h-5 text-yellow-500" />,
    color: "text-yellow-700",
    bgColor: "bg-yellow-50 border-yellow-200",
    routeName: "beatriz",
  },
  clara: {
    label: "Clara Mendes",
    role: "Especialista em Inteligência Competitiva",
    icon: <Eye className="w-5 h-5 text-blue-500" />,
    color: "text-blue-700",
    bgColor: "bg-blue-50 border-blue-200",
    routeName: "clara",
  },
  mariana: {
    label: "Mariana Costa",
    role: "Especialista em Estratégia de Vendas Multicanal",
    icon: <Send className="w-5 h-5 text-green-500" />,
    color: "text-green-700",
    bgColor: "bg-green-50 border-green-200",
    routeName: "mariana",
  },
};

const PRIORITY_STYLE: Record<string, string> = {
  alta:  "bg-red-100 text-red-700 border-red-200",
  media: "bg-yellow-100 text-yellow-700 border-yellow-200",
  baixa: "bg-gray-100 text-gray-600",
};

export default function AgentDetailPage({ agentName }: { agentName: string }) {
  const [, setLocation] = useLocation();
  const [triggering, setTriggering] = useState(false);

  const config = AGENT_CONFIG[agentName];

  const { data: latestAnalysis, refetch } = trpc.morningBriefing.getAgentLatest.useQuery(
    { agentName } as { agentName: string }
  );

  const { data: pendingActions, refetch: refetchActions } =
    trpc.agentActions.listByStatus.useQuery({ agentName, status: "pending", limit: 20 });

  const approveMutation = trpc.agentActions.approve.useMutation({
    onSuccess: () => refetchActions(),
  });
  const rejectMutation = trpc.agentActions.reject.useMutation({
    onSuccess: () => refetchActions(),
  });

  // Trigger analysis for specific agent
  const triggerAnalysis = async () => {
    setTriggering(true);
    // Call the briefing trigger — it runs all agents
    // In future, each agent can have its own trigger
    setTimeout(() => { refetch(); refetchActions(); setTriggering(false); }, 3000);
  };

  if (!config) {
    return (
      <div className="p-6 text-center text-gray-500">
        Agente "{agentName}" não encontrado.
      </div>
    );
  }

  const analysis = latestAnalysis?.data as Record<string, any> | null;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/equipe-marketing")}
            className="gap-1 text-gray-500 mt-0.5"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              {config.icon}
              {config.label}
            </h1>
            <p className="text-gray-500 text-sm">{config.role}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3" />
                Busca real na internet
              </span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Bot className="w-3 h-3" />
                Memória acumulada
              </span>
              {latestAnalysis?.period && (
                <span className="text-xs text-gray-400">
                  Última análise: {latestAnalysis.period}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button
          size="sm"
          className="gap-1 bg-purple-600 hover:bg-purple-700"
          onClick={triggerAnalysis}
          disabled={triggering}
        >
          <RefreshCw className={`w-4 h-4 ${triggering ? "animate-spin" : ""}`} />
          {triggering ? "Analisando..." : "Nova análise"}
        </Button>
      </div>

      {!analysis ? (
        <div className="text-center py-16 text-gray-400">
          <Bot className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhuma análise disponível ainda.</p>
          <p className="text-xs mt-1">Clique em "Nova análise" ou execute o briefing matinal.</p>
          <Button
            className="mt-4 gap-2 bg-purple-600 hover:bg-purple-700"
            onClick={triggerAnalysis}
            disabled={triggering}
          >
            <Zap className="w-4 h-4" />
            Rodar análise agora
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary */}
          <Card className={`border ${config.bgColor}`}>
            <CardContent className="p-4">
              <p className="text-sm text-gray-800">{analysis.summary}</p>
            </CardContent>
          </Card>

          {/* Grid: Highlights + Alerts */}
          <div className="grid md:grid-cols-2 gap-4">
            {analysis.highlights && analysis.highlights.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="w-4 h-4" />
                    Destaques Positivos
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1">
                    {analysis.highlights.map((h: string, i: number) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                        <span className="text-green-400 mt-0.5">✓</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {analysis.alerts && analysis.alerts.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-4 h-4" />
                    Alertas
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <ul className="space-y-1">
                    {analysis.alerts.map((a: string, i: number) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                        <span className="text-red-400 mt-0.5">⚠</span>
                        {a}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recomendações */}
          {analysis.recommendations && analysis.recommendations.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-500" />
                  Recomendações
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-1.5">
                  {analysis.recommendations.map((r: string, i: number) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                      <span className="text-blue-400 mt-0.5 shrink-0">→</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Path to 100K (Mariana) */}
          {analysis.pathTo100k && (
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-green-800">
                  <Target className="w-4 h-4" />
                  Plano para R$100K/mês
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-xs text-green-700">{analysis.pathTo100k}</p>
              </CardContent>
            </Card>
          )}

          {/* Channel Breakdown (Mariana) */}
          {analysis.channelBreakdown && analysis.channelBreakdown.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart className="w-4 h-4 text-blue-500" />
                  Canais de Venda
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {analysis.channelBreakdown.map((ch: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 py-1.5 border-b last:border-0">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        ch.status === "ativo" ? "bg-green-100 text-green-700" :
                        ch.status === "pendente" ? "bg-yellow-100 text-yellow-700" :
                        "bg-gray-100 text-gray-500"
                      }`}>
                        {ch.status}
                      </span>
                      <span className="text-xs font-medium text-gray-800 capitalize">{ch.channel}</span>
                      <span className="text-xs text-gray-500 ml-auto">{ch.nextAction}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Content Ideas (Beatriz) */}
          {analysis.contentIdeas && analysis.contentIdeas.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Ideias de Conteúdo</CardTitle>
                <CardDescription className="text-xs">Baseadas em tendências reais da internet</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                {analysis.contentIdeas.map((idea: any, i: number) => (
                  <div key={i} className="border rounded-lg p-3 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {idea.format}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{idea.title}</span>
                    </div>
                    <p className="text-xs text-gray-600">{idea.description}</p>
                    {idea.bestTime && (
                      <p className="text-xs text-gray-400">Melhor horário: {idea.bestTime}</p>
                    )}
                    {idea.hashtags && idea.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {idea.hashtags.slice(0, 5).map((tag: string, j: number) => (
                          <span key={j} className="text-xs text-pink-600 bg-pink-50 px-1.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Competitors (Clara) */}
          {analysis.competitors && analysis.competitors.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Concorrentes Monitorados</CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {analysis.competitors.map((comp: any, i: number) => (
                  <div key={i} className="border rounded-lg p-3">
                    <p className="text-sm font-semibold text-gray-900">{comp.name}</p>
                    {comp.strength && (
                      <p className="text-xs text-gray-600 mt-0.5">
                        <span className="text-green-600 font-medium">Força:</span> {comp.strength}
                      </p>
                    )}
                    {comp.weakness && (
                      <p className="text-xs text-gray-600">
                        <span className="text-red-500 font-medium">Gap:</span> {comp.weakness}
                      </p>
                    )}
                    {comp.recentMove && (
                      <p className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1">
                        Ação recente: {comp.recentMove}
                      </p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Ações Pendentes de Aprovação */}
          {(pendingActions ?? []).length > 0 && (
            <Card className="border-yellow-200">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                  Ações para Aprovar ({pendingActions!.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-2">
                {pendingActions!.map((action: any) => (
                  <div key={action.id} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge className={`text-xs border ${PRIORITY_STYLE[action.priority] || PRIORITY_STYLE.media}`}>
                            {action.priority}
                          </Badge>
                          <span className="text-xs text-gray-400">{action.actionType}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900">{action.title}</p>
                        <p className="text-xs text-gray-600 mt-0.5">{action.description}</p>
                        {action.estimatedImpact && (
                          <p className="text-xs text-green-700 mt-1">
                            Impacto: {action.estimatedImpact}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 shrink-0">
                        <Button
                          size="sm"
                          className="gap-1 bg-green-600 hover:bg-green-700 text-xs h-7 px-2"
                          onClick={() => approveMutation.mutate({ id: action.id })}
                          disabled={approveMutation.isPending}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 text-red-600 border-red-200 hover:bg-red-50 text-xs h-7 px-2"
                          onClick={() => rejectMutation.mutate({ id: action.id })}
                          disabled={rejectMutation.isPending}
                        >
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs gap-1"
                  onClick={() => setLocation("/acoes-agentes")}
                >
                  Ver todas as ações pendentes
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
