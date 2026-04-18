import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import MorningBriefing from "@/components/MorningBriefing";
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
  Brain,
  Zap,
  Activity,
  DollarSign,
  MousePointerClick,
  Eye,
  Volume2,
  StopCircle,
} from "lucide-react";

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface DailyAnalysisContent {
  summary: string;
  highlights: string[];
  alerts: string[];
  recommendations: string[];
  roas: number;
  spend: number;
  revenue: number;
}

interface AgentMemoryEntry {
  id: number;
  agentName: string;
  memoryType: string;
  period: string;
  content: string;
  createdAt: Date | string;
}

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
  rawMetrics?: any[] | null;
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

const priorityLabel: Record<string, string> = {
  alta: "Alta",
  media: "Média",
  baixa: "Baixa",
};

function fmtDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Extrai texto limpo de um campo analysis que pode vir como JSON bruto */
function extractAnalysisText(raw: string | null | undefined): string {
  if (!raw) return "";
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  try {
    const obj = JSON.parse(cleaned);
    if (obj && typeof obj.analysis === "string") return obj.analysis;
  } catch {}
  // tenta extrair de qualquer JSON no meio do texto
  const m = cleaned.match(/\{[\s\S]*\}/);
  if (m) {
    try {
      const obj = JSON.parse(m[0]);
      if (obj && typeof obj.analysis === "string") return obj.analysis;
    } catch {}
  }
  return cleaned;
}

function StatusBadge({ status }: { status: Evaluation["status"] }) {
  if (status === "done")
    return (
      <span className="flex items-center gap-1 text-green-700 text-sm font-medium">
        <CheckCircle className="w-4 h-4" /> Concluída
      </span>
    );
  if (status === "running" || status === "pending")
    return (
      <span className="flex items-center gap-1 text-blue-700 text-sm font-medium">
        <Loader2 className="w-4 h-4 animate-spin" /> Analisando…
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-red-700 text-sm font-medium">
      <XCircle className="w-4 h-4" /> Erro
    </span>
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function AdsManagerPage() {
  const [activeEvalId, setActiveEvalId] = useState<number | null>(null);
  const [polling, setPolling] = useState(false);
  const [expandedRecs, setExpandedRecs] = useState<Set<number>>(new Set());
  const [expandedHistory, setExpandedHistory] = useState<Set<number>>(new Set());
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [playingMsgId, setPlayingMsgId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // ── Queries ──
  const campaignsQuery = trpc.adsManager.listCampaigns.useQuery(undefined, {
    refetchInterval: 5 * 60 * 1000, // atualiza a cada 5min
  });

  const listQuery = trpc.adsManager.listEvaluations.useQuery(undefined, {
    refetchInterval: polling ? 3000 : false,
  });

  const evalQuery = trpc.adsManager.getEvaluation.useQuery(
    { id: activeEvalId! },
    {
      enabled: !!activeEvalId,
      refetchInterval: polling ? 2000 : false,
    }
  );

  const messagesQuery = trpc.adsManager.getMessages.useQuery(
    { evaluationId: activeEvalId! },
    { enabled: !!activeEvalId && evalQuery.data?.status === "done" }
  );

  const latestAnalysisQuery = trpc.agentMemory.getLatestAnalysis.useQuery();
  const recentAnalysesQuery = trpc.agentMemory.getRecentAnalyses.useQuery({ limit: 7 });

  // ── Mutations ──
  const triggerDailyMut = trpc.agentMemory.triggerDailyAnalysis.useMutation({
    onSuccess: () => {
      toast.success("Análise diária concluída!");
      latestAnalysisQuery.refetch();
      recentAnalysesQuery.refetch();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const triggerMut = trpc.adsManager.triggerEvaluation.useMutation({
    onSuccess: (data) => {
      setActiveEvalId(data.evaluationId);
      setPolling(true);
      listQuery.refetch();
      toast.success("Avaliação iniciada! Analisando sua conta…");
    },
    onError: (err) => toast.error(`Erro ao iniciar: ${err.message}`),
  });

  const sendMsgMut = trpc.adsManager.sendMessage.useMutation({
    onSuccess: () => {
      setChatInput("");
      messagesQuery.refetch();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
    onSettled: () => setSendingMsg(false),
  });

  const speakMut = trpc.adsManager.speak.useMutation({
    onSuccess: (data) => {
      const audio = new Audio(`data:audio/mp3;base64,${data.audioBase64}`);
      audioRef.current = audio;
      audio.play();
      audio.onended = () => setPlayingMsgId(null);
    },
    onError: (err) => {
      toast.error(`Erro no áudio: ${err.message}`);
      setPlayingMsgId(null);
    },
  });

  function handleSpeak(msgId: number, text: string) {
    if (playingMsgId === msgId) {
      audioRef.current?.pause();
      audioRef.current = null;
      setPlayingMsgId(null);
      return;
    }
    audioRef.current?.pause();
    setPlayingMsgId(msgId);
    speakMut.mutate({ text });
  }

  // ── Parar polling quando done/error ──
  useEffect(() => {
    if (evalQuery.data?.status === "done" || evalQuery.data?.status === "error") {
      setPolling(false);
      listQuery.refetch();
    }
  }, [evalQuery.data?.status]);

  // ── Scroll do chat ──
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesQuery.data]);

  const currentEval = evalQuery.data as Evaluation | undefined;
  const messages = (messagesQuery.data || []) as ChatMessage[];

  function toggleRec(i: number) {
    setExpandedRecs((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function handleSend() {
    if (!chatInput.trim() || !activeEvalId) return;
    setSendingMsg(true);
    sendMsgMut.mutate({ evaluationId: activeEvalId, message: chatInput.trim() });
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* ── Briefing Matinal ── */}
      <MorningBriefing />

      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <BarChart3 className="w-7 h-7 text-[#8B2635]" />
            Gestor de Tráfego Meta Ads
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Avalia sua conta e recomenda ações — sem mexer em nada sem sua aprovação.
          </p>
        </div>

        <button
          onClick={() => triggerMut.mutate()}
          disabled={triggerMut.isPending || polling}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#8B2635] text-white rounded-lg font-medium hover:bg-[#7a1f2d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {polling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <PlayCircle className="w-4 h-4" />
          )}
          {polling ? "Analisando…" : "Avaliar Conta Agora"}
        </button>
      </div>

      {/* ── Campanhas ao Vivo ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#8B2635]" /> Campanhas ao Vivo
            <span className="text-xs font-normal text-gray-400">(últimos 7 dias)</span>
          </h2>
          <button
            onClick={() => campaignsQuery.refetch()}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${campaignsQuery.isFetching ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>

        {campaignsQuery.isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Buscando dados da Meta Ads API…
          </div>
        )}

        {campaignsQuery.error && (
          <div className="flex items-center gap-2 text-sm text-red-600 py-2">
            <AlertTriangle className="w-4 h-4" /> {campaignsQuery.error.message}
          </div>
        )}

        {campaignsQuery.data && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-2 font-medium">Campanha</th>
                  <th className="text-center pb-2 font-medium">Status</th>
                  <th className="text-right pb-2 font-medium">
                    <span className="flex items-center justify-end gap-1"><DollarSign className="w-3 h-3" />Gasto</span>
                  </th>
                  <th className="text-right pb-2 font-medium">
                    <span className="flex items-center justify-end gap-1"><Eye className="w-3 h-3" />Impressões</span>
                  </th>
                  <th className="text-right pb-2 font-medium">
                    <span className="flex items-center justify-end gap-1"><MousePointerClick className="w-3 h-3" />Cliques</span>
                  </th>
                  <th className="text-right pb-2 font-medium">CTR</th>
                  <th className="text-right pb-2 font-medium">CPC</th>
                  <th className="text-right pb-2 font-medium">Compras</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {campaignsQuery.data.campaigns.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-4 max-w-[220px]">
                      <p className="font-medium text-gray-800 truncate" title={c.name}>{c.name}</p>
                      <p className="text-xs text-gray-400">{c.objective}</p>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        c.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : c.status === "PAUSED"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {c.status === "ACTIVE" ? "Ativa" : c.status === "PAUSED" ? "Pausada" : c.status}
                      </span>
                    </td>
                    <td className="py-2.5 text-right text-gray-700">
                      {c.insights ? `R$ ${c.insights.spend.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2.5 text-right text-gray-700">
                      {c.insights ? c.insights.impressions.toLocaleString("pt-BR") : "—"}
                    </td>
                    <td className="py-2.5 text-right text-gray-700">
                      {c.insights ? c.insights.clicks.toLocaleString("pt-BR") : "—"}
                    </td>
                    <td className={`py-2.5 text-right font-medium ${
                      c.insights?.ctr >= 1.5 ? "text-green-600" : c.insights?.ctr > 0 ? "text-yellow-600" : "text-gray-400"
                    }`}>
                      {c.insights ? `${c.insights.ctr.toFixed(2)}%` : "—"}
                    </td>
                    <td className={`py-2.5 text-right font-medium ${
                      c.insights?.cpc > 0 && c.insights.cpc <= 2 ? "text-green-600" : c.insights?.cpc > 0 ? "text-yellow-600" : "text-gray-400"
                    }`}>
                      {c.insights && c.insights.cpc > 0 ? `R$ ${c.insights.cpc.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2.5 text-right font-semibold text-[#8B2635]">
                      {c.insights ? (c.insights.purchases > 0 ? c.insights.purchases : "0") : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-3">
              Orçamento diário: {campaignsQuery.data.campaigns
                .filter((c: any) => c.status === "ACTIVE" && c.dailyBudget > 0)
                .map((c: any) => `${c.name.split("|")[1]?.trim() || c.name}: R$ ${c.dailyBudget.toFixed(0)}/dia`)
                .join(" · ") || "—"
              }
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Histórico ── */}
        <div className="lg:col-span-1 space-y-3">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Avaliações Anteriores
          </h2>

          {listQuery.isLoading && (
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Carregando…
            </div>
          )}

          {listQuery.data?.length === 0 && (
            <p className="text-sm text-gray-400">Nenhuma avaliação ainda.</p>
          )}

          {(listQuery.data || []).map((ev: any) => (
            <button
              key={ev.id}
              onClick={() => {
                setActiveEvalId(ev.id);
                if (ev.status === "pending" || ev.status === "running") setPolling(true);
              }}
              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                activeEvalId === ev.id
                  ? "border-[#8B2635] bg-rose-50"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <StatusBadge status={ev.status as Evaluation["status"]} />
                <span className="text-xs text-gray-400">{fmtDate(ev.triggeredAt)}</span>
              </div>
              {ev.summary && (
                <p className="text-xs text-gray-600 line-clamp-2 mt-1">{ev.summary}</p>
              )}
              {ev.errorMessage && (
                <p className="text-xs text-red-500 mt-1">{ev.errorMessage}</p>
              )}
            </button>
          ))}
        </div>

        {/* ── Painel principal ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sem avaliação selecionada */}
          {!activeEvalId && (
            <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-400">
              <Bot className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="text-sm">Clique em "Avaliar Conta Agora" para iniciar a análise.</p>
            </div>
          )}

          {/* Carregando / analisando */}
          {activeEvalId && (currentEval?.status === "pending" || currentEval?.status === "running") && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
              <Loader2 className="w-10 h-10 mx-auto mb-3 text-blue-500 animate-spin" />
              <p className="font-medium text-blue-800">Buscando dados da sua conta Meta Ads…</p>
              <p className="text-sm text-blue-600 mt-1">
                Isso leva cerca de 20–40 segundos.
              </p>
            </div>
          )}

          {/* Erro */}
          {currentEval?.status === "error" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-5">
              <div className="flex items-center gap-2 text-red-700 font-medium mb-1">
                <AlertTriangle className="w-5 h-5" /> Erro na avaliação
              </div>
              <p className="text-sm text-red-600">{currentEval.errorMessage}</p>
            </div>
          )}

          {/* Resultado concluído */}
          {currentEval?.status === "done" && (
            <>
              {/* Resumo */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-[#8B2635]" /> Resumo
                  </h3>
                  <span className="text-xs text-gray-400">{fmtDate(currentEval.completedAt)}</span>
                </div>
                <p className="text-gray-700 text-sm font-medium">{currentEval.summary}</p>
              </div>

              {/* Análise completa */}
              <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <h3 className="font-semibold text-gray-800 mb-3">Análise Detalhada</h3>
                <p className="text-gray-600 text-sm whitespace-pre-wrap leading-relaxed">
                  {extractAnalysisText(currentEval.analysis)}
                </p>
              </div>

              {/* Métricas das campanhas */}
              {currentEval.rawMetrics && currentEval.rawMetrics.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3">Campanhas</h3>
                  <div className="space-y-3">
                    {currentEval.rawMetrics.map((c: any) => (
                      <div key={c.id} className="border border-gray-100 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-sm text-gray-800">{c.name}</span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              c.status === "ACTIVE"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        {c.insights ? (
                          <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                            <div>
                              <span className="text-gray-400 block">Gasto (7d)</span>
                              R$ {c.insights.spend.toFixed(2)}
                            </div>
                            <div>
                              <span className="text-gray-400 block">Cliques</span>
                              {c.insights.clicks.toLocaleString("pt-BR")}
                            </div>
                            <div>
                              <span className="text-gray-400 block">CTR</span>
                              {c.insights.ctr.toFixed(2)}%
                            </div>
                            <div>
                              <span className="text-gray-400 block">CPC</span>
                              R$ {c.insights.cpc.toFixed(2)}
                            </div>
                            <div>
                              <span className="text-gray-400 block">Impressões</span>
                              {c.insights.impressions.toLocaleString("pt-BR")}
                            </div>
                            <div>
                              <span className="text-gray-400 block">Compras</span>
                              {c.insights.purchases}
                            </div>
                          </div>
                        ) : (
                          <p className="text-xs text-gray-400 italic">
                            Sem dados de insights — campanha nova ou em revisão.
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recomendações */}
              {currentEval.recommendations && currentEval.recommendations.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3">Recomendações</h3>
                  <div className="space-y-2">
                    {currentEval.recommendations.map((rec, i) => (
                      <div
                        key={i}
                        className={`border rounded-lg overflow-hidden ${priorityColors[rec.priority]}`}
                      >
                        <button
                          className="w-full flex items-center justify-between p-3 text-left"
                          onClick={() => toggleRec(i)}
                        >
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${priorityColors[rec.priority]}`}
                            >
                              {priorityLabel[rec.priority]}
                            </span>
                            <span className="text-sm font-medium">{rec.titulo}</span>
                          </div>
                          {expandedRecs.has(i) ? (
                            <ChevronUp className="w-4 h-4 shrink-0" />
                          ) : (
                            <ChevronDown className="w-4 h-4 shrink-0" />
                          )}
                        </button>
                        {expandedRecs.has(i) && (
                          <div className="px-3 pb-3 space-y-1 text-sm border-t border-current border-opacity-20">
                            <p className="text-xs opacity-70 font-medium mt-2">{rec.campanha}</p>
                            <p>{rec.descricao}</p>
                            <div className="mt-2 bg-white bg-opacity-60 rounded p-2">
                              <span className="font-semibold text-xs uppercase tracking-wide opacity-70">
                                Ação sugerida:{" "}
                              </span>
                              {rec.acao}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat com o agente */}
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
                  <MessageSquare className="w-4 h-4 text-[#8B2635]" />
                  <span className="font-semibold text-gray-700 text-sm">
                    Converse com o agente sobre esta avaliação
                  </span>
                </div>

                {/* Mensagens */}
                <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
                  {messages.length === 0 && (
                    <p className="text-xs text-gray-400 text-center py-4">
                      Faça uma pergunta sobre as campanhas ou peça mais detalhes sobre alguma recomendação.
                    </p>
                  )}
                  {messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                          msg.role === "user"
                            ? "bg-[#8B2635] text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {msg.role === "assistant" && (
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                              <Bot className="w-3 h-3" /> Fernanda
                            </span>
                            <button
                              onClick={() => handleSpeak(msg.id, msg.content)}
                              className="flex items-center gap-1 text-xs text-[#8B2635] hover:text-[#6d1e2a] transition-colors"
                              title={playingMsgId === msg.id ? "Parar" : "Ouvir"}
                            >
                              {playingMsgId === msg.id ? (
                                <StopCircle className="w-4 h-4" />
                              ) : (
                                <Volume2 className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {sendingMsg && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 rounded-xl px-4 py-2.5 text-sm text-gray-500 flex items-center gap-2">
                        <Loader2 className="w-3 h-3 animate-spin" /> Pensando…
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2 p-3 border-t border-gray-100">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                    placeholder="Ex: Por que o CTR está baixo? O que testar primeiro?"
                    className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#8B2635]/30 focus:border-[#8B2635]"
                    disabled={sendingMsg}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!chatInput.trim() || sendingMsg}
                    className="p-2 bg-[#8B2635] text-white rounded-lg hover:bg-[#7a1f2d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Histórico de Análises Diárias (Memória da Fernanda) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-lg">
            <Brain className="w-5 h-5 text-[#8B2635]" />
            Histórico de Análises Diárias
          </h2>
          <button
            onClick={() => triggerDailyMut.mutate()}
            disabled={triggerDailyMut.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B2635] text-white rounded-lg text-sm font-medium hover:bg-[#7a1f2d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {triggerDailyMut.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
            {triggerDailyMut.isPending ? "Analisando…" : "Rodar Análise Agora"}
          </button>
        </div>

        {/* Card da última análise */}
        {latestAnalysisQuery.data && (() => {
          const entry = latestAnalysisQuery.data as AgentMemoryEntry & { contentParsed: DailyAnalysisContent | null };
          const data = entry.contentParsed;
          return (
            <div className="bg-white border border-[#8B2635]/20 rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-[#8B2635]">
                  Última análise — {entry.period}
                </span>
                {data && (
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {data.spend > 0 && <span>Spend: R${data.spend.toFixed(2)}</span>}
                    {data.roas > 0 && (
                      <span className={`font-semibold ${data.roas >= 4 ? "text-green-600" : "text-red-600"}`}>
                        ROAS: {data.roas.toFixed(2)}x
                      </span>
                    )}
                  </div>
                )}
              </div>
              {data ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700 leading-relaxed">{data.summary}</p>
                  {data.highlights.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-green-700 mb-1">Destaques</p>
                      <ul className="space-y-1">
                        {data.highlights.map((h, i) => (
                          <li key={i} className="text-sm text-green-800 flex items-start gap-2">
                            <CheckCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            {h}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {data.alerts.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-orange-700 mb-1">Alertas</p>
                      <ul className="space-y-1">
                        {data.alerts.map((a, i) => (
                          <li key={i} className="text-sm text-orange-800 flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">{entry.content.slice(0, 300)}</p>
              )}
            </div>
          );
        })()}

        {latestAnalysisQuery.isLoading && (
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando análise…
          </div>
        )}

        {!latestAnalysisQuery.isLoading && !latestAnalysisQuery.data && (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-8 text-center text-gray-400">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Nenhuma análise diária ainda. Clique em "Rodar Análise Agora" para começar.</p>
          </div>
        )}

        {/* Accordion das últimas 7 análises */}
        {(recentAnalysesQuery.data || []).length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Últimas 7 análises</p>
            {(recentAnalysesQuery.data as AgentMemoryEntry[] || []).map((entry, idx) => {
              const isOpen = expandedHistory.has(idx);
              let data: DailyAnalysisContent | null = null;
              try { data = JSON.parse(entry.content); } catch { /* noop */ }
              return (
                <div key={entry.id} className="border border-gray-200 rounded-lg overflow-hidden bg-white">
                  <button
                    className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandedHistory((prev) => {
                      const next = new Set(prev);
                      next.has(idx) ? next.delete(idx) : next.add(idx);
                      return next;
                    })}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700">{entry.period}</span>
                      {data && data.roas > 0 && (
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${data.roas >= 4 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          ROAS {data.roas.toFixed(2)}x
                        </span>
                      )}
                      {data && data.spend > 0 && (
                        <span className="text-xs text-gray-400">R${data.spend.toFixed(2)}</span>
                      )}
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {isOpen && data && (
                    <div className="px-4 pb-4 border-t border-gray-100 space-y-2 pt-3">
                      <p className="text-sm text-gray-700">{data.summary}</p>
                      {data.recommendations.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-1">Recomendações</p>
                          <ul className="space-y-1">
                            {data.recommendations.map((r, i) => (
                              <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                <span className="text-[#8B2635] mt-0.5">→</span> {r}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
