import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ArrowLeft,
  Bot,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Globe,
  Loader2,
  MessageSquare,
  PlayCircle,
  Send,
  ShoppingBag,
  TrendingUp,
  XCircle,
  Link,
  AlertTriangle,
  Package,
} from "lucide-react";
import liaPhoto from "@/assets/lia.jpg";

const BANNER_FROM = "#6B1030";
const BANNER_TO = "#7B1040";

function toStr(item: any): string {
  if (typeof item === "string") return item;
  if (item === null || item === undefined) return "";
  if (typeof item === "object") {
    return item.titulo || item.summary || item.descricao || item.acao || item.message || item.text || JSON.stringify(item);
  }
  return String(item);
}

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Recommendation {
  priority: "alta" | "media" | "baixa";
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
  rawMetrics?: any | null;
}

interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date | string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TT_PINK = "#FE2C55";

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

function cleanAnalysis(text: string): string {
  // Strip JSON code blocks if analysis accidentally contains them
  return text.replace(/```json[\s\S]*?```/g, "").replace(/```[\s\S]*?```/g, "").trim();
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function TiktokShopPage() {
  const [activeEvalId, setActiveEvalId] = useState<number | null>(null);
  const [polling, setPolling] = useState(false);
  const [expandedRecs, setExpandedRecs] = useState<Set<number>>(new Set());
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const authQuery = trpc.tiktokShopManager.getAuthStatus.useQuery();
  const [permResults, setPermResults] = useState<Record<string, string> | null>(null);
  const checkPermMut = trpc.tiktokShopManager.checkProductPermissions.useMutation({
    onSuccess: (data) => { setPermResults(data); },
    onError: (e) => toast.error("Erro ao verificar: " + e.message),
  });
  const refreshCipherMut = trpc.tiktokShopManager.refreshShopCipher.useMutation({
    onSuccess: () => { toast.success("Shop cipher renovado! Tente verificar permissões novamente."); },
    onError: (e) => toast.error("Erro ao renovar: " + e.message),
  });

  const listQuery = trpc.tiktokShopManager.listEvaluations.useQuery(undefined, {
    refetchInterval: polling ? 3000 : false,
  });

  const evalQuery = trpc.tiktokShopManager.getEvaluation.useQuery(
    { id: activeEvalId! },
    {
      enabled: !!activeEvalId,
      refetchInterval: polling ? 2000 : false,
    }
  );

  const messagesQuery = trpc.tiktokShopManager.getMessages.useQuery(
    { evaluationId: activeEvalId! },
    { enabled: !!activeEvalId && evalQuery.data?.status === "done" }
  );

  const triggerMut = trpc.tiktokShopManager.triggerEvaluation.useMutation({
    onSuccess: (data) => {
      setActiveEvalId(data.evaluationId);
      setPolling(true);
      listQuery.refetch();
      toast.success("Avaliação iniciada! Lia está analisando sua conta TikTok Shop…");
    },
    onError: (err) => toast.error(`Erro ao iniciar: ${err.message}`),
  });

  const sendMsgMut = trpc.tiktokShopManager.sendMessage.useMutation({
    onSuccess: () => {
      setChatInput("");
      messagesQuery.refetch();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
    onSettled: () => setSendingMsg(false),
  });

  useEffect(() => {
    if (evalQuery.data?.status === "done" || evalQuery.data?.status === "error") {
      setPolling(false);
      listQuery.refetch();
    }
  }, [evalQuery.data?.status]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesQuery.data]);

  // Auto-select most recent evaluation on load
  useEffect(() => {
    if (!activeEvalId && listQuery.data && listQuery.data.length > 0) {
      setActiveEvalId(listQuery.data[0].id);
    }
  }, [listQuery.data]);

  const currentEval = evalQuery.data as Evaluation | undefined;
  const messages = (messagesQuery.data || []) as ChatMessage[];
  const recentEvals = (listQuery.data || []).slice(0, 5) as any[];

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

  const [, setLocation] = useLocation();

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">

      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
        <button
          onClick={() => setLocation("/equipe-marketing")}
          className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <img
          src={liaPhoto}
          alt="Lia"
          className="w-11 h-14 rounded-xl object-cover object-top border border-slate-200 shadow-sm"
        />
        <div>
          <h1 className="text-base font-bold text-slate-900">Lia</h1>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-xs text-emerald-700 font-medium">Online</span>
            <span className="text-xs text-slate-400 ml-1">· Especialista TikTok Shop</span>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div
        className="flex items-stretch flex-shrink-0"
        style={{ background: `linear-gradient(to right, ${BANNER_FROM}, ${BANNER_TO})` }}
      >
        <div className="flex-shrink-0">
          <img
            src={liaPhoto}
            alt="Lia"
            className="h-44 w-32 object-cover object-top"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-4 flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
            Especialista TikTok Shop
          </p>
          <h2 className="text-2xl font-bold text-white leading-tight">Lia</h2>
          <p className="text-sm mt-1.5 leading-relaxed max-w-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
            Social commerce · 11 anos em e-commerce de moda · Partner certificada TikTok Shop Academy
          </p>
          <div className="flex items-center gap-1.5 mt-3">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            <span className="text-xs text-emerald-300 font-medium">Online agora</span>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 overflow-y-auto">
      <div className="max-w-5xl mx-auto p-6 space-y-6">

      {/* ── Info Card — Lia ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-5">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h2 className="text-lg font-bold text-gray-900">Lia</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ background: TT_PINK }}>
              Especialista TikTok Shop
            </span>
          </div>
          <p className="text-sm text-gray-500 leading-snug">
            Especialista sênior em TikTok Shop e social commerce · 11 anos em e-commerce de moda na América Latina · MBA FGV-SP · Partner certificada TikTok Shop Academy
          </p>
          {authQuery.data?.connected ? (
            <p className="text-xs text-green-600 mt-1.5 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> TikTok Shop conectado — Shop ID: {authQuery.data.shopId || "—"}
            </p>
          ) : (
            <p className="text-xs text-amber-600 mt-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Não conectado — autorize para análise com dados reais
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 shrink-0">
          <button
            onClick={() => checkPermMut.mutate()}
            disabled={checkPermMut.isPending}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {checkPermMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Package className="w-3.5 h-3.5" />}
            Verificar permissões
          </button>
          <button
            onClick={() => refreshCipherMut.mutate()}
            disabled={refreshCipherMut.isPending}
            className="flex items-center gap-2 px-4 py-2 border border-amber-300 rounded-lg text-sm font-medium text-amber-700 hover:bg-amber-50 disabled:opacity-50"
          >
            {refreshCipherMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Link className="w-3.5 h-3.5" />}
            Renovar shop cipher
          </button>
          {permResults && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs space-y-1 max-w-xs">
              {Object.entries(permResults).map(([k, v]) => (
                <p key={k}><span className="font-medium text-slate-500">{k}:</span> {v}</p>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => triggerMut.mutate()}
          disabled={triggerMut.isPending || polling}
          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
          style={{ background: TT_PINK }}
        >
          {polling ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <PlayCircle className="w-4 h-4" />
          )}
          {polling ? "Analisando…" : "Avaliar TikTok Shop"}
        </button>
      </div>

      {/* ── Banner: não conectado ── */}
      {!authQuery.data?.connected && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <ShoppingBag className="w-5 h-5 text-blue-600 mt-0.5 shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-semibold">Conecte sua conta TikTok Shop</p>
            <p className="mt-1 text-blue-700">
              Autorize o acesso para que a Lia possa analisar produtos, pedidos e performance real da loja.
              Enquanto não conectado, funciona em <strong>modo planejamento</strong> com estratégias e benchmarks de mercado.
            </p>
            <div className="mt-3">
              <a
                href="/api/tiktok-shop/start"
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg text-white"
                style={{ background: TT_PINK }}
              >
                <Link className="w-3 h-3" /> Conectar TikTok Shop
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── Resultado da avaliação ── */}
      {currentEval && currentEval.status === "done" && (
        <div className="space-y-4">
          {/* Resumo */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5" style={{ color: TT_PINK }} />
              <h2 className="font-semibold text-gray-800">Resumo Executivo</h2>
            </div>
            <p className="text-gray-700 text-sm">{currentEval.summary}</p>
          </div>

          {/* Análise */}
          {currentEval.analysis && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <Bot className="w-5 h-5" style={{ color: TT_PINK }} />
                Análise Detalhada
              </h2>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {cleanAnalysis(currentEval.analysis)}
              </div>
            </div>
          )}

          {/* Recomendações */}
          {(currentEval.recommendations?.length ?? 0) > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <Package className="w-5 h-5" style={{ color: TT_PINK }} />
                Recomendações ({currentEval.recommendations!.length})
              </h2>
              <div className="space-y-3">
                {currentEval.recommendations!.map((rec, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                      onClick={() => toggleRec(i)}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${priorityColors[rec.priority]}`}>
                          {priorityLabel[rec.priority]}
                        </span>
                        <span className="text-sm font-medium text-gray-800">{toStr(rec.titulo)}</span>
                      </div>
                      {expandedRecs.has(i) ? (
                        <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
                      )}
                    </button>
                    {expandedRecs.has(i) && (
                      <div className="px-4 pb-4 space-y-2 bg-gray-50 border-t border-gray-100">
                        <p className="text-sm text-gray-600 pt-3">{toStr(rec.descricao)}</p>
                        <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                          <p className="text-xs font-semibold text-gray-500 mb-1">Ação recomendada</p>
                          <p className="text-sm text-gray-800">{rec.acao}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Chat */}
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5" style={{ color: TT_PINK }} />
              Chat com Lia
            </h2>

            <div className="min-h-[120px] max-h-[400px] overflow-y-auto space-y-3 mb-4 pr-1">
              {messages.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">
                  Faça perguntas sobre estratégias, produtos ou vendas no TikTok Shop.
                </p>
              )}
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${
                      msg.role === "user"
                        ? "text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm"
                    }`}
                    style={msg.role === "user" ? { background: TT_PINK } : {}}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ex: Como estruturo minha primeira campanha de afiliados TikTok?"
                className="flex-1 text-sm border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-300"
              />
              <button
                onClick={handleSend}
                disabled={sendingMsg || !chatInput.trim()}
                className="p-2.5 text-white rounded-lg disabled:opacity-50 transition-colors"
                style={{ background: TT_PINK }}
              >
                {sendingMsg ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Processando ── */}
      {currentEval && (currentEval.status === "running" || currentEval.status === "pending") && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: TT_PINK }} />
          <p className="font-medium text-gray-700">Lia está analisando sua conta TikTok Shop…</p>
          <p className="text-sm text-gray-400">Isso pode levar até 30 segundos</p>
        </div>
      )}

      {/* ── Erro ── */}
      {currentEval?.status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Erro na avaliação</p>
            <p className="text-sm text-red-600 mt-1">{currentEval.errorMessage || "Erro desconhecido"}</p>
          </div>
        </div>
      )}

      {/* ── Histórico de avaliações ── */}
      {recentEvals.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-400" /> Histórico de Avaliações
          </h2>
          <div className="space-y-2">
            {recentEvals.map((ev: any) => (
              <button
                key={ev.id}
                onClick={() => setActiveEvalId(ev.id)}
                className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                  activeEvalId === ev.id
                    ? "border-pink-300 bg-pink-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {ev.summary || `Avaliação #${ev.id}`}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtDate(ev.triggeredAt)}</p>
                </div>
                <StatusBadge status={ev.status} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Estado vazio ── */}
      {!activeEvalId && recentEvals.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center space-y-4">
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl"
            style={{ background: "#FFF0F3" }}
          >
            🎵
          </div>
          <div>
            <p className="font-semibold text-gray-800">Nenhuma avaliação ainda</p>
            <p className="text-sm text-gray-500 mt-1">
              Clique em "Avaliar TikTok Shop" para a Lia analisar sua conta e gerar recomendações.
            </p>
          </div>
          <button
            onClick={() => triggerMut.mutate()}
            disabled={triggerMut.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-medium disabled:opacity-50"
            style={{ background: TT_PINK }}
          >
            <PlayCircle className="w-4 h-4" />
            Iniciar primeira avaliação
          </button>
        </div>
      )}
    </div>
      </div>
    </div>
  );
}
