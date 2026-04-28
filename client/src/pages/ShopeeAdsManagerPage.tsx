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
  Activity,
  DollarSign,
  MousePointerClick,
  Eye,
  ShoppingBag,
  Link,
} from "lucide-react";

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

const SHOPEE_ORANGE = "#EE4D2D";

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

// ─── Componente principal ─────────────────────────────────────────────────────

type AccountType = "feminnita" | "fnt";

export default function ShopeeAdsManagerPage() {
  const [account, setAccount] = useState<AccountType>("feminnita");
  const [activeEvalId, setActiveEvalId] = useState<number | null>(null);
  const [polling, setPolling] = useState(false);
  const [expandedRecs, setExpandedRecs] = useState<Set<number>>(new Set());
  const [expandedHistory, setExpandedHistory] = useState<Set<number>>(new Set());
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  function handleAccountChange(acc: AccountType) {
    setAccount(acc);
    setActiveEvalId(null);
  }

  // ── Queries ──
  const authQuery = trpc.shopeeAdsManager.getAuthStatus.useQuery();

  const adsQuery = trpc.shopeeAdsManager.listAds.useQuery(undefined, {
    enabled: authQuery.data?.connected === true,
    refetchInterval: 5 * 60 * 1000,
  });

  const listQuery = trpc.shopeeAdsManager.listEvaluations.useQuery({ account }, {
    enabled: authQuery.data?.connected === true,
    refetchInterval: polling ? 3000 : false,
  });

  const evalQuery = trpc.shopeeAdsManager.getEvaluation.useQuery(
    { id: activeEvalId! },
    {
      enabled: !!activeEvalId,
      refetchInterval: polling ? 2000 : false,
    }
  );

  const messagesQuery = trpc.shopeeAdsManager.getMessages.useQuery(
    { evaluationId: activeEvalId! },
    { enabled: !!activeEvalId && evalQuery.data?.status === "done" }
  );

  // ── Mutations ──
  const triggerMut = trpc.shopeeAdsManager.triggerEvaluation.useMutation({
    onSuccess: (data) => {
      setActiveEvalId(data.evaluationId);
      setPolling(true);
      listQuery.refetch();
      toast.success("Avaliação iniciada! Analisando suas campanhas Shopee…");
    },
    onError: (err) => toast.error(`Erro ao iniciar: ${err.message}`),
  });

  function handleTrigger() {
    triggerMut.mutate({ account });
  }

  const updateKnowledgeMut = trpc.shopeeAdsManager.updateKnowledge.useMutation({
    onSuccess: () => toast.success("Conhecimento da agente Shopee atualizado!"),
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const sendMsgMut = trpc.shopeeAdsManager.sendMessage.useMutation({
    onSuccess: () => {
      setChatInput("");
      messagesQuery.refetch();
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
    onSettled: () => setSendingMsg(false),
  });

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

  // ── Não conectado ──
  if (authQuery.data?.connected === false) {
    return (
      <div className="max-w-2xl mx-auto p-6 mt-20 text-center space-y-6">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto" style={{ background: "#FFF0ED" }}>
          <ShoppingBag className="w-10 h-10" style={{ color: SHOPEE_ORANGE }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Especialista Shopee Ads</h1>
          <p className="text-gray-500 mt-2 text-sm">
            Conecte sua conta Shopee para começar a analisar suas campanhas com IA especializada em atacado de moda.
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-sm text-left space-y-2">
          <p className="font-semibold text-orange-800">O que você vai ganhar:</p>
          <ul className="text-orange-700 space-y-1 list-disc list-inside">
            <li>Análise automática de ROAS, CPC, CTR e ACOS</li>
            <li>Benchmarks específicos para atacado de moda</li>
            <li>Recomendações priorizadas por impacto</li>
            <li>Chat com especialista IA para dúvidas</li>
          </ul>
        </div>
        <button
          onClick={() => { window.location.href = "/api/shopee/start"; }}
          className="inline-flex items-center gap-2 px-6 py-3 text-white font-semibold rounded-lg transition-colors"
          style={{ background: SHOPEE_ORANGE }}
        >
          <Link className="w-4 h-4" />
          Conectar conta Shopee
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* ── Header ── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShoppingBag className="w-7 h-7" style={{ color: SHOPEE_ORANGE }} />
            Especialista Shopee Ads
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Avalia suas campanhas com IA — benchmarks: ROAS &gt; 3x · CPC &lt; R$0,50 · CTR &gt; 0,3% · ACOS &lt; 20%.
          </p>
          {authQuery.data?.shopId && (
            <p className="text-xs text-gray-400 mt-0.5">Shop ID: {authQuery.data.shopId}</p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm font-medium">
            <button
              onClick={() => handleAccountChange("feminnita")}
              className={`px-3 py-1.5 transition-colors ${account === "feminnita" ? "text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              style={account === "feminnita" ? { background: SHOPEE_ORANGE } : {}}
            >
              Feminnita
            </button>
            <button
              onClick={() => handleAccountChange("fnt")}
              className={`px-3 py-1.5 transition-colors ${account === "fnt" ? "text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
              style={account === "fnt" ? { background: SHOPEE_ORANGE } : {}}
            >
              FNT
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleTrigger}
              disabled={triggerMut.isPending || polling}
              className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ background: SHOPEE_ORANGE }}
            >
              {polling ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <PlayCircle className="w-4 h-4" />
              )}
              {polling ? "Analisando…" : "Avaliar Campanhas Agora"}
            </button>
            <button
              onClick={() => updateKnowledgeMut.mutate()}
              disabled={updateKnowledgeMut.isPending}
              className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium disabled:opacity-50 transition-colors text-sm"
            >
              {updateKnowledgeMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Atualizar Conhecimento
            </button>
          </div>
        </div>
      </div>

      {/* ── Anúncios ao Vivo ── */}
      <div className="bg-white border border-gray-200 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Activity className="w-4 h-4" style={{ color: SHOPEE_ORANGE }} />
            Anúncios ao Vivo
            <span className="text-xs font-normal text-gray-400">(últimos 7 dias)</span>
          </h2>
          <button
            onClick={() => adsQuery.refetch()}
            className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1"
          >
            <RefreshCw className={`w-3 h-3 ${adsQuery.isFetching ? "animate-spin" : ""}`} />
            Atualizar
          </button>
        </div>

        {adsQuery.isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-400 py-4">
            <Loader2 className="w-4 h-4 animate-spin" /> Buscando dados da Shopee Ads API…
          </div>
        )}

        {adsQuery.error && (
          <div className="flex items-center gap-2 text-sm text-red-600 py-2">
            <AlertTriangle className="w-4 h-4" /> {adsQuery.error.message}
          </div>
        )}

        {adsQuery.data && adsQuery.data.ads.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-gray-400 border-b border-gray-100">
                  <th className="text-left pb-2 font-medium">Nome</th>
                  <th className="text-center pb-2 font-medium">Status</th>
                  <th className="text-center pb-2 font-medium">Tipo</th>
                  <th className="text-right pb-2 font-medium">
                    <span className="flex items-center justify-end gap-1"><DollarSign className="w-3 h-3" />CPC</span>
                  </th>
                  <th className="text-right pb-2 font-medium">
                    <span className="flex items-center justify-end gap-1"><MousePointerClick className="w-3 h-3" />Cliques</span>
                  </th>
                  <th className="text-right pb-2 font-medium">
                    <span className="flex items-center justify-end gap-1"><Eye className="w-3 h-3" />Impressões</span>
                  </th>
                  <th className="text-right pb-2 font-medium">
                    <span className="flex items-center justify-end gap-1"><ShoppingBag className="w-3 h-3" />Pedidos</span>
                  </th>
                  <th className="text-right pb-2 font-medium">ROAS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {adsQuery.data.ads.map((ad: any) => (
                  <tr key={ad.adid} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-4 max-w-[200px]">
                      <p className="font-medium text-gray-800 truncate" title={ad.name}>{ad.name}</p>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        ad.status === "active" || ad.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}>
                        {ad.status === "active" || ad.status === "ACTIVE" ? "Ativo" : ad.status || "—"}
                      </span>
                    </td>
                    <td className="py-2.5 text-center text-xs text-gray-500">{ad.type || "—"}</td>
                    <td className={`py-2.5 text-right font-medium ${
                      ad.cpc > 0 && ad.cpc <= 0.5 ? "text-green-600" : ad.cpc > 0.5 ? "text-red-600" : "text-gray-400"
                    }`}>
                      {ad.cpc > 0 ? `R$ ${ad.cpc.toFixed(2)}` : "—"}
                    </td>
                    <td className="py-2.5 text-right text-gray-700">
                      {ad.clicks > 0 ? ad.clicks.toLocaleString("pt-BR") : "—"}
                    </td>
                    <td className="py-2.5 text-right text-gray-700">
                      {ad.impressions > 0 ? ad.impressions.toLocaleString("pt-BR") : "—"}
                    </td>
                    <td className="py-2.5 text-right text-gray-700">
                      {ad.orders > 0 ? ad.orders : "—"}
                    </td>
                    <td className={`py-2.5 text-right font-semibold ${
                      ad.roas >= 3 ? "text-green-600" : ad.roas > 0 ? "text-red-600" : "text-gray-400"
                    }`}>
                      {ad.roas > 0 ? `${ad.roas.toFixed(1)}x` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-gray-400 mt-2">{adsQuery.data.period}</p>
          </div>
        )}

        {adsQuery.data && adsQuery.data.ads.length === 0 && (
          <p className="text-sm text-gray-400 py-4 text-center">Nenhum anúncio encontrado na conta.</p>
        )}
      </div>

      {/* ── Avaliação atual ── */}
      {activeEvalId && currentEval && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Bot className="w-4 h-4" style={{ color: SHOPEE_ORANGE }} />
              Avaliação #{currentEval.id}
            </h2>
            <StatusBadge status={currentEval.status} />
          </div>

          {currentEval.status === "pending" || currentEval.status === "running" ? (
            <div className="flex items-center gap-3 text-sm text-blue-600 bg-blue-50 rounded-lg p-3">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              Buscando dados das campanhas e analisando com IA especializada em Shopee…
            </div>
          ) : null}

          {currentEval.status === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {currentEval.errorMessage || "Erro desconhecido"}
            </div>
          )}

          {currentEval.status === "done" && currentEval.summary && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-sm text-orange-900">
              <p className="font-semibold mb-1">Resumo Executivo</p>
              <p>{currentEval.summary}</p>
            </div>
          )}

          {currentEval.status === "done" && currentEval.analysis && (
            <div className="prose prose-sm max-w-none text-gray-700 text-sm leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-4">
              {currentEval.analysis}
            </div>
          )}

          {currentEval.status === "done" && currentEval.recommendations && currentEval.recommendations.length > 0 && (
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: SHOPEE_ORANGE }} />
                Recomendações ({currentEval.recommendations.length})
              </p>
              {currentEval.recommendations.map((rec, i) => (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => toggleRec(i)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left"
                  >
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColors[rec.priority] || priorityColors.media}`}>
                        {priorityLabel[rec.priority] || rec.priority}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{toStr(rec.titulo)}</span>
                    </div>
                    {expandedRecs.has(i) ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedRecs.has(i) && (
                    <div className="px-4 pb-4 space-y-2 border-t border-gray-100 bg-gray-50">
                      <p className="text-sm text-gray-700 mt-3">{toStr(rec.descricao)}</p>
                      <div className="flex items-start gap-2 bg-white border border-gray-200 rounded-lg p-3">
                        <span className="text-xs font-semibold text-gray-500 uppercase mt-0.5">Ação</span>
                        <p className="text-sm text-gray-800">{rec.acao}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ── Chat ── */}
          {currentEval.status === "done" && (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" style={{ color: SHOPEE_ORANGE }} />
                Pergunte ao Especialista Shopee Ads
              </p>

              {messages.length > 0 && (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${
                        msg.role === "user"
                          ? "text-white"
                          : "bg-gray-100 text-gray-800"
                      }`} style={msg.role === "user" ? { background: SHOPEE_ORANGE } : {}}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.role === "user" ? "text-orange-100" : "text-gray-400"}`}>
                          {fmtDate(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Ex: Como melhorar o ROAS das minhas campanhas?"
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
                  disabled={sendingMsg}
                />
                <button
                  onClick={handleSend}
                  disabled={!chatInput.trim() || sendingMsg}
                  className="p-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  style={{ background: SHOPEE_ORANGE }}
                >
                  {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Histórico ── */}
      {listQuery.data && listQuery.data.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4" style={{ color: SHOPEE_ORANGE }} />
            Histórico de Avaliações
          </h2>
          <div className="space-y-2">
            {listQuery.data.map((ev: any) => (
              <div key={ev.id} className="border border-gray-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => {
                    setActiveEvalId(ev.id);
                    setExpandedHistory((prev) => {
                      const next = new Set(prev);
                      next.has(ev.id) ? next.delete(ev.id) : next.add(ev.id);
                      return next;
                    });
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left"
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge status={ev.status} />
                    <span className="text-sm text-gray-600">{fmtDate(ev.triggeredAt)}</span>
                    {ev.summary && (
                      <span className="text-xs text-gray-400 truncate max-w-[300px]">{toStr(ev.summary)}</span>
                    )}
                  </div>
                  {expandedHistory.has(ev.id) ? (
                    <ChevronUp className="w-4 h-4 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  )}
                </button>
                {expandedHistory.has(ev.id) && activeEvalId === ev.id && currentEval?.status === "done" && (
                  <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100">
                    <p className="text-xs text-gray-500 mt-3">
                      Concluída em: {fmtDate(currentEval.completedAt)}
                    </p>
                    {currentEval.summary && (
                      <p className="text-sm text-gray-700 mt-2">{currentEval.summary}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Loading inicial ── */}
      {authQuery.isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
    </div>
  );
}
