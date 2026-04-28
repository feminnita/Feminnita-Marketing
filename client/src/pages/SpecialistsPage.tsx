import { useState, useEffect, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Bot, CheckCircle, ChevronDown, ChevronUp, Clock, Loader2,
  MessageSquare, PlayCircle, Send, TrendingUp, XCircle, AlertTriangle,
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

type SpecialistType = "shopee_eds" | "shopee_promo" | "ml_eds" | "shopee_live" | "instagram_live" | "tiktok_live";
type AccountType = "feminnita" | "fnt";

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
}

// ─── Config das especialistas ─────────────────────────────────────────────────

const SPECIALISTS: Array<{
  id: SpecialistType;
  name: string;
  role: string;
  color: string;
  bg: string;
  emoji: string;
  platform: string;
}> = [
  { id: "shopee_eds",      name: "Sofia",  role: "EDS Shopee",            color: "#EE4D2D", bg: "#FFF0ED", emoji: "🏅", platform: "Shopee" },
  { id: "shopee_promo",    name: "Bianca", role: "Promoções Shopee",       color: "#EE4D2D", bg: "#FFF0ED", emoji: "🎁", platform: "Shopee" },
  { id: "ml_eds",          name: "Camila", role: "Destaque ML",            color: "#FFE600", bg: "#FFFDE6", emoji: "⭐", platform: "Mercado Livre" },
  { id: "shopee_live",     name: "Lara",   role: "Shopee Live",            color: "#EE4D2D", bg: "#FFF0ED", emoji: "📺", platform: "Shopee" },
  { id: "instagram_live",  name: "Isis",   role: "Instagram Live",         color: "#E1306C", bg: "#FFF0F5", emoji: "📸", platform: "Instagram" },
  { id: "tiktok_live",     name: "Jade",   role: "TikTok Live",            color: "#000000", bg: "#F5F5F5", emoji: "🎵", platform: "TikTok" },
];

const priorityColors: Record<string, string> = {
  alta: "bg-red-100 text-red-800 border-red-200",
  media: "bg-yellow-100 text-yellow-800 border-yellow-200",
  baixa: "bg-green-100 text-green-800 border-green-200",
};

function fmtDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function StatusBadge({ status }: { status: Evaluation["status"] }) {
  if (status === "done") return <span className="flex items-center gap-1 text-green-700 text-sm font-medium"><CheckCircle className="w-4 h-4" /> Concluída</span>;
  if (status === "running" || status === "pending") return <span className="flex items-center gap-1 text-blue-700 text-sm font-medium"><Loader2 className="w-4 h-4 animate-spin" /> Analisando…</span>;
  return <span className="flex items-center gap-1 text-red-700 text-sm font-medium"><XCircle className="w-4 h-4" /> Erro</span>;
}

// ─── Painel de um especialista ────────────────────────────────────────────────

function SpecialistPanel({ specialist, account }: { specialist: typeof SPECIALISTS[0]; account: AccountType }) {
  const [activeEvalId, setActiveEvalId] = useState<number | null>(null);
  const [polling, setPolling] = useState(false);
  const [expandedRecs, setExpandedRecs] = useState<Set<number>>(new Set());
  const [chatInput, setChatInput] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const listQuery = trpc.specialists.listEvaluations.useQuery(
    { specialistType: specialist.id, account },
    { refetchInterval: polling ? 3000 : false }
  );

  const evalQuery = trpc.specialists.getEvaluation.useQuery(
    { id: activeEvalId! },
    { enabled: !!activeEvalId, refetchInterval: polling ? 2000 : false }
  );

  const messagesQuery = trpc.specialists.getMessages.useQuery(
    { evaluationId: activeEvalId! },
    { enabled: !!activeEvalId && evalQuery.data?.status === "done" }
  );

  const triggerMut = trpc.specialists.triggerEvaluation.useMutation({
    onSuccess: (data) => {
      setActiveEvalId(data.evaluationId);
      setPolling(true);
      listQuery.refetch();
      toast.success(`${specialist.name} iniciou a análise!`);
    },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const sendMsgMut = trpc.specialists.sendMessage.useMutation({
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
  const messages = (messagesQuery.data || []) as any[];

  function toggleRec(i: number) {
    setExpandedRecs(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; });
  }

  function handleSend() {
    if (!chatInput.trim() || !activeEvalId) return;
    setSendingMsg(true);
    sendMsgMut.mutate({ evaluationId: activeEvalId, message: chatInput.trim() });
  }

  return (
    <div className="space-y-4">
      {/* Card header */}
      <div className="rounded-xl p-5 flex items-center justify-between" style={{ background: specialist.bg, border: `1px solid ${specialist.color}30` }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl" style={{ background: "white" }}>
            {specialist.emoji}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">{specialist.name}</h2>
            <p className="text-sm font-medium" style={{ color: specialist.color }}>{specialist.role}</p>
            <p className="text-xs text-gray-400">{specialist.platform}</p>
          </div>
        </div>
        <button
          onClick={() => triggerMut.mutate({ specialistType: specialist.id, account })}
          disabled={triggerMut.isPending || polling}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium text-sm disabled:opacity-50 transition-colors"
          style={{ background: specialist.color }}
        >
          {polling ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
          {polling ? "Analisando…" : "Analisar"}
        </button>
      </div>

      {/* Avaliação atual */}
      {activeEvalId && currentEval && (
        <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Bot className="w-4 h-4" style={{ color: specialist.color }} />
              Avaliação #{currentEval.id}
            </h3>
            <StatusBadge status={currentEval.status} />
          </div>

          {(currentEval.status === "pending" || currentEval.status === "running") && (
            <div className="flex items-center gap-3 text-sm text-blue-600 bg-blue-50 rounded-lg p-3">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              {specialist.name} está analisando e preparando recomendações…
            </div>
          )}

          {currentEval.status === "error" && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {currentEval.errorMessage || "Erro desconhecido"}
            </div>
          )}

          {currentEval.status === "done" && currentEval.summary && (
            <div className="rounded-lg p-4 text-sm" style={{ background: specialist.bg, border: `1px solid ${specialist.color}30` }}>
              <p className="font-semibold mb-1 text-gray-800">Resumo</p>
              <p className="text-gray-700">{currentEval.summary}</p>
            </div>
          )}

          {currentEval.status === "done" && currentEval.analysis && (
            <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap border-t border-gray-100 pt-4">
              {currentEval.analysis}
            </div>
          )}

          {currentEval.status === "done" && (currentEval.recommendations?.length ?? 0) > 0 && (
            <div className="space-y-2 border-t border-gray-100 pt-4">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: specialist.color }} />
                Recomendações ({currentEval.recommendations!.length})
              </p>
              {currentEval.recommendations!.map((rec, i) => (
                <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                  <button onClick={() => toggleRec(i)} className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 text-left">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColors[rec.priority] || priorityColors.media}`}>
                        {rec.priority === "alta" ? "Alta" : rec.priority === "media" ? "Média" : "Baixa"}
                      </span>
                      <span className="text-sm font-medium text-gray-800">{toStr(rec.titulo)}</span>
                    </div>
                    {expandedRecs.has(i) ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </button>
                  {expandedRecs.has(i) && (
                    <div className="px-4 pb-4 space-y-2 bg-gray-50 border-t border-gray-100">
                      <p className="text-sm text-gray-700 mt-3">{toStr(rec.descricao)}</p>
                      <div className="bg-white border border-gray-200 rounded-lg p-3">
                        <p className="text-xs font-semibold text-gray-500 mb-1">Ação</p>
                        <p className="text-sm text-gray-800">{rec.acao}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Chat */}
          {currentEval.status === "done" && (
            <div className="border-t border-gray-100 pt-4 space-y-3">
              <p className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <MessageSquare className="w-4 h-4" style={{ color: specialist.color }} />
                Pergunte para {specialist.name}
              </p>
              {messages.length > 0 && (
                <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                  {messages.map((msg: any) => (
                    <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-xl px-4 py-2.5 text-sm ${msg.role === "user" ? "text-white" : "bg-gray-100 text-gray-800"}`}
                        style={msg.role === "user" ? { background: specialist.color } : {}}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
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
                  placeholder={`Pergunte para ${specialist.name}…`}
                  className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                  style={{ "--tw-ring-color": specialist.color } as any}
                  disabled={sendingMsg}
                />
                <button
                  onClick={handleSend}
                  disabled={!chatInput.trim() || sendingMsg}
                  className="p-2 text-white rounded-lg disabled:opacity-50"
                  style={{ background: specialist.color }}
                >
                  {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Histórico */}
      {(listQuery.data?.length ?? 0) > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-400" /> Histórico
          </h3>
          <div className="space-y-2">
            {listQuery.data?.map((ev: any) => (
              <button
                key={ev.id}
                onClick={() => setActiveEvalId(ev.id)}
                className={`w-full text-left flex items-center justify-between px-3 py-2 rounded-lg border text-sm transition-colors ${
                  activeEvalId === ev.id ? "border-gray-400 bg-gray-50" : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <div>
                  <p className="text-gray-700 truncate max-w-[260px]">{ev.summary || `Avaliação #${ev.id}`}</p>
                  <p className="text-xs text-gray-400">{fmtDate(ev.triggeredAt)}</p>
                </div>
                <StatusBadge status={ev.status} />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function SpecialistsPage() {
  const [account, setAccount] = useState<AccountType>("feminnita");
  const [activeTab, setActiveTab] = useState<SpecialistType>("shopee_eds");

  const activeSpecialist = SPECIALISTS.find((s) => s.id === activeTab)!;

  function handleAccountChange(acc: AccountType) {
    setAccount(acc);
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Especialistas por Plataforma</h1>
          <p className="text-gray-500 text-sm mt-1">
            IA especializada em EDS, promoções e lives para Shopee, Mercado Livre, Instagram e TikTok.
          </p>
        </div>
        <div className="flex rounded-lg overflow-hidden border border-gray-200 text-sm font-medium">
          <button
            onClick={() => handleAccountChange("feminnita")}
            className={`px-4 py-2 transition-colors ${account === "feminnita" ? "bg-pink-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            Feminnita
          </button>
          <button
            onClick={() => handleAccountChange("fnt")}
            className={`px-4 py-2 transition-colors ${account === "fnt" ? "bg-pink-600 text-white" : "bg-white text-gray-500 hover:bg-gray-50"}`}
          >
            FNT
          </button>
        </div>
      </div>

      {/* Tabs das especialistas */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {SPECIALISTS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveTab(s.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
              activeTab === s.id
                ? "text-white shadow-sm"
                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
            }`}
            style={activeTab === s.id ? { background: s.color, borderColor: s.color } : {}}
          >
            <span>{s.emoji}</span>
            <span>{s.name}</span>
            <span className="text-xs opacity-75">· {s.platform}</span>
          </button>
        ))}
      </div>

      {/* Painel da especialista selecionada */}
      <SpecialistPanel key={`${activeTab}-${account}`} specialist={activeSpecialist} account={account} />
    </div>
  );
}
