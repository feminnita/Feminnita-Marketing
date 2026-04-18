import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Bot,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  MessageSquare,
  Package,
  PlayCircle,
  Send,
  TrendingUp,
  XCircle,
  AlertTriangle,
} from "lucide-react";

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

const AMAZON_ORANGE = "#FF9900";
const AMAZON_DARK = "#131921";

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
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: Evaluation["status"] }) {
  if (status === "done")
    return <span className="flex items-center gap-1 text-green-700 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Concluída</span>;
  if (status === "running" || status === "pending")
    return <span className="flex items-center gap-1 text-blue-700 text-sm font-medium"><Loader2 className="w-4 h-4 animate-spin" /> Analisando…</span>;
  return <span className="flex items-center gap-1 text-red-700 text-sm font-medium"><XCircle className="w-4 h-4" /> Erro</span>;
}

export default function AmazonPage() {
  const [activeEvalId, setActiveEvalId] = useState<number | null>(null);
  const [polling, setPolling] = useState(false);
  const [expandedRecs, setExpandedRecs] = useState<Set<number>>(new Set());
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const authQuery = trpc.amazonManager.getAuthStatus.useQuery();

  const listQuery = trpc.amazonManager.listEvaluations.useQuery(undefined, {
    refetchInterval: polling ? 3000 : false,
  });

  const evalQuery = trpc.amazonManager.getEvaluation.useQuery(
    { id: activeEvalId! },
    { enabled: !!activeEvalId, refetchInterval: polling ? 2000 : false }
  );

  const messagesQuery = trpc.amazonManager.getMessages.useQuery(
    { evaluationId: activeEvalId! },
    { enabled: !!activeEvalId && evalQuery.data?.status === "done" }
  );

  const triggerMut = trpc.amazonManager.triggerEvaluation.useMutation({
    onSuccess: (data) => {
      setActiveEvalId(data.evaluationId);
      setPolling(true);
      listQuery.refetch();
      toast.success("Avaliação Amazon iniciada!");
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const sendMsgMut = trpc.amazonManager.sendMessage.useMutation({
    onSuccess: () => { setChatInput(""); messagesQuery.refetch(); },
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

  const auth = authQuery.data;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">📦</span>
            Especialista Amazon Brasil
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Analisa pedidos, catálogo e estratégia de vendas na Amazon.com.br com IA especializada.
          </p>
          {auth?.connected && (
            <p className="text-xs mt-0.5 flex items-center gap-1 text-green-600">
              <CheckCircle className="w-3 h-3" /> SP-API autorizado
              {!auth?.hasAwsCreds && (
                <span className="ml-2 text-amber-600">
                  · Credenciais AWS IAM pendentes (modo planejamento)
                </span>
              )}
            </p>
          )}
        </div>

        <button
          onClick={() => triggerMut.mutate()}
          disabled={triggerMut.isPending || polling}
          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
          style={{ background: AMAZON_ORANGE }}
        >
          {polling ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
          {polling ? "Analisando…" : "Avaliar Amazon"}
        </button>
      </div>

      {/* Banner AWS IAM */}
      {auth?.connected && !auth?.hasAwsCreds && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <p className="font-semibold">Credenciais AWS IAM não configuradas</p>
            <p className="mt-1 text-amber-700">
              O app SP-API está autorizado, mas para fazer chamadas à API é necessário criar um
              <strong> usuário IAM na AWS</strong> e adicionar as chaves <code>AMAZON_AWS_ACCESS_KEY</code> e{" "}
              <code>AMAZON_AWS_SECRET_KEY</code> no servidor. O agente funciona em <strong>modo planejamento</strong> enquanto isso.
            </p>
            <p className="mt-2 text-xs text-amber-600">
              Passos: AWS Console → IAM → Criar usuário → Anexar política AmazonSellingPartnerAPIRole → Gerar chave de acesso
            </p>
          </div>
        </div>
      )}

      {/* Histórico */}
      {(listQuery.data?.length ?? 0) > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-400" /> Histórico de Avaliações
          </h2>
          <div className="space-y-2">
            {listQuery.data?.map((ev: any) => (
              <button
                key={ev.id}
                onClick={() => setActiveEvalId(ev.id)}
                className={`w-full text-left flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                  activeEvalId === ev.id ? "border-orange-300 bg-orange-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">{ev.summary || `Avaliação #${ev.id}`}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{fmtDate(ev.triggeredAt)}</p>
                </div>
                <StatusBadge status={ev.status} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Resultado */}
      {currentEval?.status === "done" && (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5" style={{ color: AMAZON_ORANGE }} />
              <h2 className="font-semibold text-gray-800">Resumo Executivo</h2>
            </div>
            <p className="text-gray-700 text-sm">{currentEval.summary}</p>
          </div>

          {currentEval.analysis && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
                <Bot className="w-5 h-5" style={{ color: AMAZON_ORANGE }} />
                Análise Detalhada
              </h2>
              <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {currentEval.analysis}
              </div>
            </div>
          )}

          {(currentEval.recommendations?.length ?? 0) > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-5">
              <h2 className="font-semibold text-gray-800 flex items-center gap-2 mb-4">
                <Package className="w-5 h-5" style={{ color: AMAZON_ORANGE }} />
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
                        <span className="text-sm font-medium text-gray-800">{rec.titulo}</span>
                      </div>
                      {expandedRecs.has(i) ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
                    </button>
                    {expandedRecs.has(i) && (
                      <div className="px-4 pb-4 space-y-2 bg-gray-50 border-t border-gray-100">
                        <p className="text-sm text-gray-600 pt-3">{rec.descricao}</p>
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
              <MessageSquare className="w-5 h-5" style={{ color: AMAZON_ORANGE }} />
              Chat com Especialista Amazon
            </h2>
            <div className="min-h-[120px] max-h-[400px] overflow-y-auto space-y-3 mb-4 pr-1">
              {messages.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-6">
                  Pergunte sobre estratégia Amazon, FBA/FBM, Buy Box, Amazon Ads, etc.
                </p>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === "user" ? "text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}
                    style={msg.role === "user" ? { background: AMAZON_ORANGE } : {}}
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
                placeholder="Ex: Vale mais a pena FBA ou FBM para pijamas?"
                className="flex-1 text-sm border border-gray-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-300"
              />
              <button
                onClick={handleSend}
                disabled={sendingMsg || !chatInput.trim()}
                className="p-2.5 text-white rounded-lg disabled:opacity-50 transition-colors"
                style={{ background: AMAZON_ORANGE }}
              >
                {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Processando */}
      {currentEval && (currentEval.status === "running" || currentEval.status === "pending") && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center space-y-3">
          <Loader2 className="w-10 h-10 animate-spin mx-auto" style={{ color: AMAZON_ORANGE }} />
          <p className="font-medium text-gray-700">Especialista analisando sua conta Amazon…</p>
          <p className="text-sm text-gray-400">Isso pode levar até 30 segundos</p>
        </div>
      )}

      {/* Erro */}
      {currentEval?.status === "error" && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 flex items-start gap-3">
          <XCircle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-red-800">Erro na avaliação</p>
            <p className="text-sm text-red-600 mt-1">{currentEval.errorMessage}</p>
          </div>
        </div>
      )}

      {/* Estado vazio */}
      {!activeEvalId && (listQuery.data?.length ?? 0) === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-10 text-center space-y-4">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl" style={{ background: "#FFF8EE" }}>
            📦
          </div>
          <div>
            <p className="font-semibold text-gray-800">Nenhuma avaliação ainda</p>
            <p className="text-sm text-gray-500 mt-1">Clique em "Avaliar Amazon" para o especialista analisar sua estratégia de vendas.</p>
          </div>
          <button
            onClick={() => triggerMut.mutate()}
            disabled={triggerMut.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-medium disabled:opacity-50"
            style={{ background: AMAZON_ORANGE }}
          >
            <PlayCircle className="w-4 h-4" />
            Iniciar primeira avaliação
          </button>
        </div>
      )}
    </div>
  );
}
