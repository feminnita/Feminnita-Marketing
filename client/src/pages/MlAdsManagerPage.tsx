import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  BarChart3,
  Bot,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  MessageSquare,
  PlayCircle,
  RefreshCw,
  Send,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Link,
  ShoppingCart,
  Eye,
  MousePointerClick,
  DollarSign,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Recommendation {
  priority: "alta" | "media" | "baixa";
  campanha: string;
  titulo: string;
  descricao: string;
  acao: string;
}

interface Evaluation {
  id: number;
  status: "pending" | "running" | "done" | "error";
  summary: string | null;
  errorMessage: string | null;
  triggeredAt: Date | string;
  completedAt: Date | string | null;
  analysis?: string | null;
  recommendations?: Recommendation[];
  rawMetrics?: any;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date | string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const priorityColors: Record<string, string> = {
  alta: "bg-red-100 text-red-800 border-red-200",
  media: "bg-yellow-100 text-yellow-800 border-yellow-200",
  baixa: "bg-green-100 text-green-800 border-green-200",
};

function fmtDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtCurrency(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  return `R$ ${n.toFixed(2).replace(".", ",")}`;
}

function fmtPct(n: number | undefined): string {
  if (n === undefined || n === null) return "—";
  return `${(n * 100).toFixed(2)}%`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { icon: React.ReactNode; label: string; cls: string }> = {
    pending: { icon: <Clock className="w-3 h-3" />, label: "Aguardando", cls: "bg-gray-100 text-gray-700" },
    running: { icon: <Loader2 className="w-3 h-3 animate-spin" />, label: "Analisando", cls: "bg-yellow-100 text-yellow-700" },
    done: { icon: <CheckCircle className="w-3 h-3" />, label: "Concluído", cls: "bg-green-100 text-green-700" },
    error: { icon: <XCircle className="w-3 h-3" />, label: "Erro", cls: "bg-red-100 text-red-700" },
  };
  const s = map[status] || map.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${s.cls}`}>
      {s.icon} {s.label}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MlAdsManagerPage() {
  const [selectedEvaluationId, setSelectedEvaluationId] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ─── Queries ────────────────────────────────────────────────────────────────

  const authStatus = trpc.mlAdsManager.getAuthStatus.useQuery(undefined, {
    refetchInterval: false,
  });

  const evaluations = trpc.mlAdsManager.listEvaluations.useQuery(undefined, {
    refetchInterval: 8000,
  });

  const selectedEv = trpc.mlAdsManager.getEvaluation.useQuery(
    { id: selectedEvaluationId! },
    {
      enabled: selectedEvaluationId !== null,
      refetchInterval: (query) => {
        const status = query.state.data?.status;
        return status === "pending" || status === "running" ? 3000 : false;
      },
    }
  );

  const messages = trpc.mlAdsManager.getMessages.useQuery(
    { evaluationId: selectedEvaluationId! },
    { enabled: selectedEvaluationId !== null && selectedEv.data?.status === "done" }
  );

  const campaigns = trpc.mlAdsManager.listCampaigns.useQuery(undefined, {
    enabled: authStatus.data?.connected && showCampaigns,
    retry: false,
  });

  // ─── Mutations ───────────────────────────────────────────────────────────────

  const triggerEvaluation = trpc.mlAdsManager.triggerEvaluation.useMutation({
    onSuccess: (data) => {
      toast.success("Avaliação iniciada! Aguarde alguns instantes...");
      setSelectedEvaluationId(data.evaluationId);
      evaluations.refetch();
    },
    onError: (err) => toast.error(`Erro ao iniciar avaliação: ${err.message}`),
  });

  const sendMessage = trpc.mlAdsManager.sendMessage.useMutation({
    onSuccess: () => {
      setChatInput("");
      messages.refetch();
    },
    onError: (err) => toast.error(`Erro ao enviar mensagem: ${err.message}`),
  });

  // ─── Effects ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.data]);

  // Auto-select the most recent evaluation on first load
  useEffect(() => {
    if (evaluations.data?.length && selectedEvaluationId === null) {
      setSelectedEvaluationId(evaluations.data[0].id);
    }
  }, [evaluations.data]);

  // ─── Handlers ────────────────────────────────────────────────────────────────

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !selectedEvaluationId) return;
    setIsSending(true);
    try {
      await sendMessage.mutateAsync({
        evaluationId: selectedEvaluationId,
        message: chatInput.trim(),
      });
    } finally {
      setIsSending(false);
    }
  };

  // ─── Not connected screen ─────────────────────────────────────────────────

  if (!authStatus.isLoading && !authStatus.data?.connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-amber-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-lg p-10 max-w-md w-full text-center">
          <div className="text-5xl mb-4">🛒</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">ML Ads — Especialista IA</h1>
          <p className="text-gray-500 mb-6">
            Conecte sua conta do Mercado Livre para analisar suas campanhas de Product Ads com inteligência artificial.
          </p>
          <a
            href="/api/ml/start"
            className="inline-flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-6 py-3 rounded-xl transition-colors shadow"
          >
            <Link className="w-4 h-4" />
            Conectar conta Mercado Livre
          </a>
          <p className="text-xs text-gray-400 mt-4">
            Você será redirecionado para a autorização oficial do Mercado Livre.
          </p>
        </div>
      </div>
    );
  }

  const ev = selectedEv.data as Evaluation | undefined;

  // ─── Connected screen ────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-yellow-400 border-b border-yellow-500">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingCart className="w-7 h-7 text-gray-900" />
            <div>
              <h1 className="text-xl font-bold text-gray-900">ML Ads — Especialista IA</h1>
              <p className="text-xs text-yellow-800">
                {authStatus.data?.userId ? `Conta: ${authStatus.data.userId}` : "Mercado Livre Product Ads"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCampaigns((v) => !v)}
              className="flex items-center gap-2 bg-white/80 hover:bg-white text-gray-800 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              {showCampaigns ? "Ocultar" : "Ver"} Campanhas
            </button>
            <button
              onClick={() => triggerEvaluation.mutate()}
              disabled={triggerEvaluation.isPending}
              className="flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-60"
            >
              {triggerEvaluation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              Nova Avaliação
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        {/* Live Campaigns Table */}
        {showCampaigns && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-600" />
                Campanhas ao Vivo
              </h2>
              <button
                onClick={() => campaigns.refetch()}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
            {campaigns.isLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
              </div>
            ) : campaigns.error ? (
              <div className="flex items-center gap-2 text-red-600 p-6">
                <AlertTriangle className="w-4 h-4" /> {campaigns.error.message}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {["Nome", "Status", "Tipo", "Orçamento/dia", "Cliques", "Impressões", "CTR", "CPC", "Vendas"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(campaigns.data?.campaigns || []).map((c: any) => (
                      <tr key={c.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate">{c.name}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${c.status === "active" || c.status === "enabled" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{c.type || "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{c.daily_budget ? fmtCurrency(c.daily_budget) : "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{c.clicks ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{c.impressions ?? "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{c.ctr !== undefined ? fmtPct(c.ctr) : "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{c.cpc !== undefined ? fmtCurrency(c.cpc) : "—"}</td>
                        <td className="px-4 py-3 text-gray-600">{c.sales ?? "—"}</td>
                      </tr>
                    ))}
                    {(campaigns.data?.campaigns || []).length === 0 && (
                      <tr>
                        <td colSpan={9} className="text-center text-gray-400 py-8">
                          Nenhuma campanha encontrada
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Evaluation History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-4 py-4 border-b border-gray-100 flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <h2 className="font-semibold text-gray-900 text-sm">Histórico de Avaliações</h2>
            </div>
            <div className="divide-y divide-gray-50 max-h-[500px] overflow-y-auto">
              {evaluations.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />
                </div>
              ) : (evaluations.data || []).length === 0 ? (
                <div className="text-center text-gray-400 py-8 text-sm">
                  Nenhuma avaliação ainda.<br />Clique em "Nova Avaliação".
                </div>
              ) : (
                (evaluations.data || []).map((e: any) => (
                  <button
                    key={e.id}
                    onClick={() => setSelectedEvaluationId(e.id)}
                    className={`w-full text-left px-4 py-3 hover:bg-yellow-50 transition-colors ${selectedEvaluationId === e.id ? "bg-yellow-50 border-l-2 border-yellow-400" : ""}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <StatusBadge status={e.status} />
                      <span className="text-xs text-gray-400">{fmtDate(e.triggeredAt)}</span>
                    </div>
                    {e.summary && (
                      <p className="text-xs text-gray-600 line-clamp-2 mt-1">{e.summary}</p>
                    )}
                    {e.errorMessage && (
                      <p className="text-xs text-red-500 mt-1 line-clamp-1">{e.errorMessage}</p>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Evaluation Detail + Chat */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedEvaluationId ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center py-16 text-center px-6">
                <Bot className="w-12 h-12 text-yellow-400 mb-3" />
                <h3 className="font-semibold text-gray-900 mb-1">Especialista ML Ads</h3>
                <p className="text-sm text-gray-500 max-w-sm">
                  Clique em "Nova Avaliação" para analisar suas campanhas do Mercado Livre com IA especializada.
                </p>
              </div>
            ) : selectedEv.isLoading ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
              </div>
            ) : ev ? (
              <>
                {/* Status Banner */}
                {(ev.status === "pending" || ev.status === "running") && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-5 py-4 flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-yellow-800">Analisando campanhas ML Ads...</p>
                      <p className="text-xs text-yellow-600 mt-0.5">O agente está coletando dados e gerando recomendações.</p>
                    </div>
                  </div>
                )}

                {ev.status === "error" && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Erro na avaliação</p>
                      <p className="text-xs text-red-600 mt-0.5">{ev.errorMessage}</p>
                    </div>
                  </div>
                )}

                {ev.status === "done" && ev.analysis && (
                  <>
                    {/* Summary */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-5">
                      <div className="flex items-center gap-2 mb-3">
                        <Bot className="w-5 h-5 text-yellow-600" />
                        <h3 className="font-semibold text-gray-900">Resumo da Avaliação</h3>
                        <span className="ml-auto text-xs text-gray-400">{fmtDate(ev.completedAt)}</span>
                      </div>
                      {ev.summary && (
                        <p className="text-sm text-gray-700 bg-yellow-50 rounded-lg px-4 py-3 border border-yellow-100 mb-4">
                          {ev.summary}
                        </p>
                      )}
                      <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                        {ev.analysis}
                      </div>
                    </div>

                    {/* Recommendations */}
                    {ev.recommendations && ev.recommendations.length > 0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 py-5">
                        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-yellow-600" />
                          Recomendações ({ev.recommendations.length})
                        </h3>
                        <div className="space-y-3">
                          {ev.recommendations.map((r: Recommendation, i: number) => (
                            <div key={i} className={`border rounded-lg p-4 ${priorityColors[r.priority] || "bg-gray-50 text-gray-700 border-gray-200"}`}>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase tracking-wide opacity-70">{r.priority}</span>
                                <span className="text-xs opacity-60">· {r.campanha}</span>
                              </div>
                              <p className="font-semibold text-sm">{r.titulo}</p>
                              <p className="text-xs mt-1 opacity-80">{r.descricao}</p>
                              <p className="text-xs mt-2 font-medium border-t border-current/20 pt-2 opacity-90">
                                Ação: {r.acao}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Chat */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-yellow-600" />
                        <h3 className="font-semibold text-gray-900 text-sm">Chat com o Especialista</h3>
                      </div>

                      <div className="px-6 py-4 space-y-3 max-h-80 overflow-y-auto">
                        {(messages.data || []).length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-4">
                            Faça perguntas sobre suas campanhas ML Ads
                          </p>
                        ) : (
                          (messages.data || []).map((m: ChatMessage) => (
                            <div
                              key={m.id}
                              className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                  m.role === "user"
                                    ? "bg-yellow-400 text-gray-900"
                                    : "bg-gray-100 text-gray-800"
                                }`}
                              >
                                {m.content}
                              </div>
                            </div>
                          ))
                        )}
                        <div ref={chatEndRef} />
                      </div>

                      <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSendMessage()}
                          placeholder="Pergunte sobre suas campanhas..."
                          className="flex-1 text-sm border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                          disabled={isSending}
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!chatInput.trim() || isSending}
                          className="flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
