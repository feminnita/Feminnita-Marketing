/**
 * Agent Actions Page — Aprovar ou rejeitar ações propostas pela equipe IA
 *
 * A equipe de agentes propõe ações diariamente.
 * O usuário revisa, aprova ou rejeita cada uma.
 * Ações aprovadas ficam marcadas para execução.
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Bot,
  Zap,
  TrendingUp,
  Send,
  Eye,
  Lightbulb,
} from "lucide-react";

const AGENT_META: Record<string, { label: string; badgeClass: string; icon: React.ReactNode }> = {
  fernanda: { label: "Fernanda — Tráfego", badgeClass: "bg-purple-100 text-purple-700", icon: <Zap className="w-3 h-3" /> },
  sofia:    { label: "Sofia — Instagram",  badgeClass: "bg-pink-100 text-pink-700",     icon: <TrendingUp className="w-3 h-3" /> },
clara:    { label: "Clara — Competição", badgeClass: "bg-blue-100 text-blue-700",     icon: <Eye className="w-3 h-3" /> },
  mariana:  { label: "Mariana — Vendas",   badgeClass: "bg-green-100 text-green-700",   icon: <Send className="w-3 h-3" /> },
};

const PRIORITY_STYLE: Record<string, string> = {
  alta:  "bg-red-100 text-red-700 border-red-200",
  media: "bg-yellow-100 text-yellow-700 border-yellow-200",
  baixa: "bg-gray-100 text-gray-600 border-gray-200",
};

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-slate-100 text-slate-600",
  approved:  "bg-green-100 text-green-700",
  rejected:  "bg-red-100 text-red-600",
  executing: "bg-blue-100 text-blue-700",
  done:      "bg-purple-100 text-purple-700",
};

const STATUS_LABEL: Record<string, string> = {
  pending:   "Pendente",
  approved:  "Aprovada",
  rejected:  "Rejeitada",
  executing: "Executando",
  done:      "Concluída",
};

interface Action {
  id: number;
  agentName: string;
  date: string;
  title: string;
  description: string;
  actionType: string;
  priority: string;
  estimatedImpact?: string | null;
  status: string;
  userNote?: string | null;
  createdAt: Date | string;
}

function ActionCard({
  action,
  onApprove,
  onReject,
  onDone,
  loading,
}: {
  action: Action;
  onApprove: (id: number) => void;
  onReject: (id: number) => void;
  onDone: (id: number) => void;
  loading: boolean;
}) {
  const meta = AGENT_META[action.agentName] ?? { label: action.agentName, badgeClass: "bg-gray-100 text-gray-600", icon: <Bot className="w-3 h-3" /> };

  return (
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${meta.badgeClass}`}>
                {meta.icon}
                {meta.label}
              </span>
              <Badge className={`text-xs border ${PRIORITY_STYLE[action.priority] || PRIORITY_STYLE.media}`}>
                {action.priority}
              </Badge>
              <Badge className={`text-xs ${STATUS_STYLE[action.status] || STATUS_STYLE.pending}`}>
                {STATUS_LABEL[action.status] || action.status}
              </Badge>
              {action.actionType && (
                <span className="text-xs text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                  {action.actionType}
                </span>
              )}
            </div>
            <h3 className="font-semibold text-sm text-gray-900">{action.title}</h3>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{action.description}</p>
            {action.estimatedImpact && (
              <p className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded mt-2">
                <span className="font-medium">Impacto estimado:</span> {action.estimatedImpact}
              </p>
            )}
          </div>

          {action.status === "pending" && (
            <div className="flex flex-col gap-1.5 shrink-0">
              <Button
                size="sm"
                className="gap-1 bg-green-600 hover:bg-green-700 text-xs h-7 px-2"
                onClick={() => onApprove(action.id)}
                disabled={loading}
              >
                <CheckCircle2 className="w-3 h-3" />
                Aprovar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1 text-red-600 border-red-200 hover:bg-red-50 text-xs h-7 px-2"
                onClick={() => onReject(action.id)}
                disabled={loading}
              >
                <XCircle className="w-3 h-3" />
                Rejeitar
              </Button>
            </div>
          )}

          {action.status === "approved" && (
            <Button
              size="sm"
              className="gap-1 bg-purple-600 hover:bg-purple-700 text-xs h-7 px-2 shrink-0"
              onClick={() => onDone(action.id)}
              disabled={loading}
            >
              <CheckCircle2 className="w-3 h-3" />
              Concluída
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AgentActionsPage() {
  const [tab, setTab] = useState("pending");

  const { data: counts, refetch: refetchCounts } = trpc.agentActions.countByStatus.useQuery();

  const { data: pendingActions, refetch: refetchPending, isLoading: loadingPending } =
    trpc.agentActions.listByStatus.useQuery({ status: "pending", limit: 100 });

  const { data: approvedActions, refetch: refetchApproved } =
    trpc.agentActions.listByStatus.useQuery({ status: "approved", limit: 50 });

  const { data: doneActions, refetch: refetchDone } =
    trpc.agentActions.listByStatus.useQuery({ status: "done", limit: 50 });

  const { data: rejectedActions, refetch: refetchRejected } =
    trpc.agentActions.listByStatus.useQuery({ status: "rejected", limit: 50 });

  const refetchAll = () => {
    refetchCounts();
    refetchPending();
    refetchApproved();
    refetchDone();
    refetchRejected();
  };

  const approveMutation = trpc.agentActions.approve.useMutation({ onSuccess: refetchAll });
  const rejectMutation = trpc.agentActions.reject.useMutation({ onSuccess: refetchAll });
  const doneMutation = trpc.agentActions.markDone.useMutation({ onSuccess: refetchAll });
  const approveManyMutation = trpc.agentActions.approveMany.useMutation({ onSuccess: refetchAll });
  const rejectManyMutation = trpc.agentActions.rejectMany.useMutation({ onSuccess: refetchAll });

  const loading =
    approveMutation.isPending ||
    rejectMutation.isPending ||
    doneMutation.isPending ||
    approveManyMutation.isPending ||
    rejectManyMutation.isPending;

  // Ordenar pendentes: alta primeiro, depois media, depois baixa
  const sortedPending = [...(pendingActions || [])].sort((a, b) => {
    const order = { alta: 0, media: 1, baixa: 2 };
    return (order[a.priority as keyof typeof order] ?? 2) - (order[b.priority as keyof typeof order] ?? 2);
  });

  const pendingIds = (pendingActions || []).map((a: Action) => a.id);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bot className="w-6 h-6 text-purple-500" />
            Ações da Equipe IA
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Revise e aprove as ações propostas pelos agentes. Ações aprovadas são priorizadas na execução.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetchAll} className="gap-2">
          <RefreshCw className="w-4 h-4" />
          Atualizar
        </Button>
      </div>

      {/* Contadores */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="cursor-pointer hover:border-yellow-300 transition-colors" onClick={() => setTab("pending")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-gray-500">Pendentes</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{counts?.pending ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-green-300 transition-colors" onClick={() => setTab("approved")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-xs text-gray-500">Aprovadas</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{counts?.approved ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-red-300 transition-colors" onClick={() => setTab("rejected")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="w-4 h-4 text-red-500" />
              <span className="text-xs text-gray-500">Rejeitadas</span>
            </div>
            <div className="text-2xl font-bold text-red-600">{counts?.rejected ?? 0}</div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:border-purple-300 transition-colors" onClick={() => setTab("done")}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-purple-500" />
              <span className="text-xs text-gray-500">Concluídas</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{counts?.done ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Ações em massa */}
      {(pendingActions?.length ?? 0) > 0 && tab === "pending" && (
        <div className="flex gap-2 flex-wrap">
          <Button
            size="sm"
            className="gap-2 bg-green-600 hover:bg-green-700"
            onClick={() => approveManyMutation.mutate({ ids: pendingIds })}
            disabled={loading}
          >
            <CheckCircle2 className="w-4 h-4" />
            Aprovar todas ({pendingIds.length})
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
            onClick={() => rejectManyMutation.mutate({ ids: pendingIds })}
            disabled={loading}
          >
            <XCircle className="w-4 h-4" />
            Rejeitar todas
          </Button>
        </div>
      )}

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />
            Pendentes
            {(counts?.pending ?? 0) > 0 && (
              <Badge className="ml-1 bg-yellow-500 text-white text-xs">{counts!.pending}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved">Aprovadas</TabsTrigger>
          <TabsTrigger value="done">Concluídas</TabsTrigger>
          <TabsTrigger value="rejected">Rejeitadas</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-4 space-y-3">
          {loadingPending ? (
            <div className="flex justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : sortedPending.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Nenhuma ação pendente.</p>
              <p className="text-xs mt-1">Execute o briefing matinal para gerar novas ações.</p>
            </div>
          ) : (
            sortedPending.map((action) => (
              <ActionCard
                key={action.id}
                action={action as Action}
                onApprove={(id) => approveMutation.mutate({ id })}
                onReject={(id) => rejectMutation.mutate({ id })}
                onDone={(id) => doneMutation.mutate({ id })}
                loading={loading}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-4 space-y-3">
          {(approvedActions || []).length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Nenhuma ação aprovada ainda.</div>
          ) : (
            (approvedActions || []).map((action: Action) => (
              <ActionCard
                key={action.id}
                action={action as Action}
                onApprove={(id) => approveMutation.mutate({ id })}
                onReject={(id) => rejectMutation.mutate({ id })}
                onDone={(id) => doneMutation.mutate({ id })}
                loading={loading}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="done" className="mt-4 space-y-3">
          {(doneActions || []).length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Nenhuma ação concluída ainda.</div>
          ) : (
            (doneActions || []).map((action: Action) => (
              <ActionCard
                key={action.id}
                action={action as Action}
                onApprove={(id) => approveMutation.mutate({ id })}
                onReject={(id) => rejectMutation.mutate({ id })}
                onDone={(id) => doneMutation.mutate({ id })}
                loading={loading}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-4 space-y-3">
          {(rejectedActions || []).length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">Nenhuma ação rejeitada.</div>
          ) : (
            (rejectedActions || []).map((action: Action) => (
              <ActionCard
                key={action.id}
                action={action as Action}
                onApprove={(id) => approveMutation.mutate({ id })}
                onReject={(id) => rejectMutation.mutate({ id })}
                onDone={(id) => doneMutation.mutate({ id })}
                loading={loading}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
