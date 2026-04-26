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
  PlayCircle,
  RefreshCw,
  Send,
  Paperclip,
  X,
  Image,
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
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  Upload,
  PlusCircle,
  Trash2,
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

interface CreativeBrief {
  publico: string;
  formato: string;
  visual: string;
  headline: string;
  copy: string;
  cta: string;
  observacoes?: string;
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
  creativeBriefs?: CreativeBrief[];
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

/** Extrai texto limpo de um campo que pode vir como JSON bruto */
function extractAnalysisText(raw: string | null | undefined): string {
  if (!raw) return "";
  const cleaned = raw.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

  const tryExtract = (str: string): string | null => {
    try {
      const obj = JSON.parse(str);
      // Campos conhecidos com texto útil
      for (const key of ["analysis", "summary", "descricao", "description", "content", "message", "text"]) {
        if (obj && typeof obj[key] === "string" && obj[key].length > 20) return obj[key];
      }
      // Array de objetos — junta os textos
      if (Array.isArray(obj)) {
        const parts = obj
          .map((item: any) => item?.descricao || item?.description || item?.content || item?.titulo || "")
          .filter(Boolean);
        if (parts.length > 0) return parts.join("\n\n");
      }
    } catch {}
    return null;
  };

  const direct = tryExtract(cleaned);
  if (direct) return direct;

  const m = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
  if (m) {
    const fromMatch = tryExtract(m[0]);
    if (fromMatch) return fromMatch;
  }

  // Se ainda parece JSON mas não extraiu nada útil, remove aspas e chaves
  if (cleaned.startsWith("{") || cleaned.startsWith("[")) {
    return cleaned
      .replace(/[{}\[\]"]/g, "")
      .replace(/,\s*\n/g, "\n")
      .replace(/^\s*\w+:\s*/gm, "")
      .trim();
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
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [imageMimeType, setImageMimeType] = useState<string>("image/jpeg");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [playingMsgId, setPlayingMsgId] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem muito grande. Máximo 5MB."); return; }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      setImageBase64(base64);
      setImageMimeType(file.type || "image/jpeg");
      setImagePreview(dataUrl);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function clearImage() {
    setImageBase64(null);
    setImagePreview(null);
  }

  // ── Queries ──
  const campaignsQuery = trpc.adsManager.listCampaigns.useQuery(undefined, {
    refetchInterval: 5 * 60 * 1000, // atualiza a cada 5min
  });

  const pendingActionsQuery = trpc.agentActions.listPending.useQuery(undefined, {
    refetchInterval: 30 * 1000,
  });

  const approveMut = trpc.agentActions.approve.useMutation({
    onSuccess: () => { toast.success("Ação aprovada!"); pendingActionsQuery.refetch(); },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const rejectMut = trpc.agentActions.reject.useMutation({
    onSuccess: () => { toast("Ação rejeitada."); pendingActionsQuery.refetch(); },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const approveAllMut = trpc.agentActions.approveMany.useMutation({
    onSuccess: (data) => { toast.success(`${data.count} ações aprovadas!`); pendingActionsQuery.refetch(); },
    onError: (err) => toast.error(`Erro: ${err.message}`),
  });

  const executeActionMut = trpc.adsManager.executeAction.useMutation({
    onSuccess: () => { toast.success("Ação executada na Meta Ads!"); pendingActionsQuery.refetch(); },
    onError: (err) => toast.error(`Erro ao executar: ${err.message}`),
  });

  function parseCopy(description: string) {
    try {
      const parsed = JSON.parse(description);
      if (parsed?.copy) return parsed.copy as { headline: string; body: string; imageDescription: string };
    } catch {}
    return null;
  }

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

  // ── Auto-selecionar avaliação mais recente concluída ──
  useEffect(() => {
    if (listQuery.data?.length > 0 && !activeEvalId) {
      const done = (listQuery.data as any[]).find((e) => e.status === "done");
      if (done) setActiveEvalId(done.id);
    }
  }, [listQuery.data]);

  // ── Scroll do chat — rola só o container, não a página ──
  const chatContainerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
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
    if ((!chatInput.trim() && !imageBase64) || !activeEvalId) return;
    setSendingMsg(true);
    sendMsgMut.mutate({
      evaluationId: activeEvalId,
      message: chatInput.trim(),
      imageBase64: imageBase64 || undefined,
      imageMimeType: imageMimeType || undefined,
    });
    clearImage();
  }

  return (
    <div className="max-w-full px-6 py-6 space-y-6">
      {/* ── Briefing Matinal ── */}
      <MorningBriefing />

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-gray-700 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#8B2635]" /> Meta Ads
          </h1>
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

      {/* ── Fernanda + Chat ── */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 px-5 py-4 border-b border-gray-100" style={{ background: 'linear-gradient(to right, #fff5f6, #fff)' }}>
          <img src="/agents/fernanda.jpg" alt="Fernanda" className="w-14 h-20 rounded-xl object-cover object-top border-2 shadow-md flex-shrink-0" style={{ borderColor: '#8B2635' }} />
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-lg">Fernanda</p>
            <p className="text-xs text-gray-400 mt-0.5">Especialista Meta Ads · Feminnita</p>
          </div>
          <button
            onClick={() => triggerMut.mutate()}
            disabled={triggerMut.isPending || polling}
            className="flex items-center gap-2 px-4 py-2 bg-[#8B2635] text-white rounded-lg font-medium hover:bg-[#7a1f2d] disabled:opacity-50 transition-colors text-sm"
          >
            {polling ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
            {polling ? "Analisando…" : "Avaliar Conta"}
          </button>
        </div>

        {/* Mensagens */}
        <div ref={chatContainerRef} className="p-4 space-y-3 overflow-y-auto" style={{ height: '420px' }}>
          {messages.length === 0 && !activeEvalId && (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
              <Bot className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm">Clique em <strong>"Avaliar Conta"</strong> para ativar o chat com a Fernanda.</p>
            </div>
          )}
          {messages.length === 0 && activeEvalId && (
            <p className="text-xs text-gray-400 text-center pt-8">Faça uma pergunta sobre suas campanhas.</p>
          )}
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`${msg.role === "user" ? "max-w-[60%]" : "max-w-[92%]"} rounded-2xl px-4 py-3 text-base leading-relaxed ${msg.role === "user" ? "bg-[#8B2635] text-white" : "bg-gray-100 text-gray-800"}`}>
                {msg.role === "assistant" && (
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
                      <img src="/agents/fernanda.jpg" alt="" className="w-5 h-6 rounded object-cover object-top" />
                      Fernanda
                    </span>
                    <button onClick={() => handleSpeak(msg.id, extractAnalysisText(msg.content))} className="text-[#8B2635] hover:text-[#6d1e2a] transition-colors" title={playingMsgId === msg.id ? "Parar" : "Ouvir"}>
                      {playingMsgId === msg.id ? <StopCircle className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                )}
                <p className="whitespace-pre-wrap">{msg.role === "assistant" ? extractAnalysisText(msg.content) : msg.content}</p>
              </div>
            </div>
          ))}
          {sendingMsg && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-4 py-3 text-sm text-gray-500 flex items-center gap-2">
                <Loader2 className="w-3 h-3 animate-spin" /> Pensando…
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 bg-gray-50">
          {/* Preview da imagem */}
          {imagePreview && (
            <div className="flex items-center gap-2 px-4 pt-3">
              <div className="relative inline-block">
                <img src={imagePreview} alt="preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                <button onClick={clearImage} className="absolute -top-1.5 -right-1.5 bg-gray-700 text-white rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
              <span className="text-xs text-gray-500">Imagem pronta para enviar</span>
            </div>
          )}
          <div className="flex gap-2 p-4">
            {/* Botão de imagem */}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={sendingMsg || !activeEvalId}
              title="Anexar imagem"
              className="flex items-center gap-1.5 px-3 py-2.5 border border-gray-200 rounded-xl text-gray-500 hover:text-[#8B2635] hover:border-[#8B2635] disabled:opacity-40 transition-colors bg-white text-sm font-medium"
            >
              {imageBase64 ? <Image className="w-4 h-4 text-[#8B2635]" /> : <Paperclip className="w-4 h-4" />}
              <span>Anexar</span>
            </button>
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={activeEvalId ? "Pergunte ou anexe uma imagem para análise…" : "Inicie uma avaliação para conversar"}
              className="flex-1 text-base border border-gray-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#8B2635]/30 focus:border-[#8B2635] bg-white"
              disabled={sendingMsg || !activeEvalId}
            />
            <button onClick={handleSend} disabled={(!chatInput.trim() && !imageBase64) || sendingMsg || !activeEvalId} className="px-4 py-2.5 bg-[#8B2635] text-white rounded-xl hover:bg-[#7a1f2d] disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
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

      {/* Painel de aprovação removido — ações gerenciadas direto no chat */}
      {false && ((pendingActionsQuery.data?.length ?? 0) > 0) && (
        <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Ações Propostas pela Fernanda
              <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingActionsQuery.data!.length} pendente{pendingActionsQuery.data!.length !== 1 ? "s" : ""}
              </span>
            </h2>
            <button
              onClick={() => approveAllMut.mutate({ ids: pendingActionsQuery.data!.map((a: any) => a.id) })}
              disabled={approveAllMut.isPending}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {approveAllMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <ThumbsUp className="w-3 h-3" />}
              Aprovar todas
            </button>
          </div>

          <div className="space-y-3">
            {pendingActionsQuery.data!.map((action: any) => (
              <div key={action.id} className="border border-gray-100 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                        action.priority === "alta"
                          ? "bg-red-100 text-red-800 border-red-200"
                          : action.priority === "media"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : "bg-green-100 text-green-800 border-green-200"
                      }`}>
                        {action.priority === "alta" ? "Alta" : action.priority === "media" ? "Média" : "Baixa"}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                        {action.actionType}
                      </span>
                      <span className="text-xs text-gray-400">{action.date}</span>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-1">{action.title}</p>
                    {action.description && action.description !== action.title && (
                      <p className="text-xs text-gray-500 leading-relaxed">{action.description}</p>
                    )}
                    {action.estimatedImpact && (
                      <p className="text-xs text-[#8B2635] mt-1 font-medium">{action.estimatedImpact}</p>
                    )}
                    {/* Copy do anúncio — só aparece em ações de criação de anúncio */}
                    {(() => {
                      const copy = parseCopy(action.description);
                      if (!copy) return null;
                      return (
                        <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-3 space-y-1">
                          <p className="text-xs font-semibold text-blue-700 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Copy gerado pela IA
                          </p>
                          <p className="text-xs"><span className="font-medium text-gray-600">Título:</span> {copy.headline}</p>
                          <p className="text-xs"><span className="font-medium text-gray-600">Texto:</span> {copy.body}</p>
                          <p className="text-xs text-gray-400 italic"><span className="font-medium not-italic text-gray-500">Imagem:</span> {copy.imageDescription}</p>
                        </div>
                      );
                    })()}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    {action.actionType === "meta_create_full_ad" ? (
                      <button
                        onClick={() => executeActionMut.mutate({ actionId: action.id })}
                        disabled={executeActionMut.isPending}
                        title="Aprovar e executar na Meta Ads"
                        className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-[#8B2635] text-white hover:bg-[#7a1f2d] disabled:opacity-50 transition-colors"
                      >
                        {executeActionMut.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                        Executar
                      </button>
                    ) : (
                      <button
                        onClick={() => approveMut.mutate({ id: action.id })}
                        disabled={approveMut.isPending}
                        title="Aprovar"
                        className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50 transition-colors"
                      >
                        <ThumbsUp className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => rejectMut.mutate({ id: action.id })}
                      disabled={rejectMut.isPending}
                      title="Rejeitar"
                      className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50 transition-colors"
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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

          {(() => {
            const startOfToday = new Date();
            startOfToday.setHours(0, 0, 0, 0);
            const filtered = (listQuery.data || []).filter((ev: any) =>
              ev.status !== "error" && new Date(ev.triggeredAt) >= startOfToday
            );
            if (!listQuery.isLoading && filtered.length === 0)
              return <p className="text-sm text-gray-400">Nenhuma avaliação hoje ainda.</p>;
            return filtered.map((ev: any) => (
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
            ));
          })()}
        </div>

        {/* ── Painel principal ── */}
        <div className="lg:col-span-3 space-y-4">
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

              {/* Briefs de Criativo */}
              {currentEval.creativeBriefs && currentEval.creativeBriefs.length > 0 && (
                <div className="bg-white border border-purple-200 rounded-xl p-5 shadow-sm">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span>🎨</span> Briefs de Criativo para a Equipe de Arte
                  </h3>
                  <div className="space-y-4">
                    {currentEval.creativeBriefs.map((brief, i) => (
                      <div key={i} className="border border-purple-100 rounded-lg p-4 bg-purple-50">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-bold uppercase tracking-wide bg-purple-200 text-purple-800 px-2 py-0.5 rounded-full">{brief.publico}</span>
                          <span className="text-xs font-semibold text-gray-500">{brief.formato}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm">
                          <div><span className="font-semibold text-gray-700">Visual: </span><span className="text-gray-600">{brief.visual}</span></div>
                          <div><span className="font-semibold text-gray-700">Headline: </span><span className="text-gray-800 font-medium">"{brief.headline}"</span></div>
                          <div><span className="font-semibold text-gray-700">Copy: </span><span className="text-gray-600">{brief.copy}</span></div>
                          <div><span className="font-semibold text-gray-700">CTA: </span><span className="text-purple-700 font-medium">{brief.cta}</span></div>
                          {brief.observacoes && (
                            <div><span className="font-semibold text-gray-700">Obs: </span><span className="text-gray-500 italic">{brief.observacoes}</span></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

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

      {/* ── Criativos — Upload + Aprovação ── */}
      <CreativosSection />
    </div>
  );
}

// ─── Seção de Criativos ───────────────────────────────────────────────────────

interface UploadedImage {
  file: File;
  base64: string;
  preview: string;
  title: string;
  textOverlay: string;
}

interface CreativeApprovalFields {
  campaignId: string;
  adSetId: string;
}

function CreativosSection() {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [approvalFields, setApprovalFields] = useState<Record<number, CreativeApprovalFields>>({});
  const [showLibrary, setShowLibrary] = useState(false);
  const [selectedAssetIds, setSelectedAssetIds] = useState<number[]>([]);
  const [textOverlay, setTextOverlay] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const libraryQuery = trpc.adsManager.listLibraryAssets.useQuery(
    { category: "produto" },
    { enabled: showLibrary }
  );

  const fromLibraryMut = trpc.adsManager.requestCreativeFromLibrary.useMutation({
    onSuccess: (data) => {
      toast.success(`${data.count} criativo(s) enviados para geração!`);
      setSelectedAssetIds([]);
      setShowLibrary(false);
      pendingQuery.refetch();
    },
    onError: (e) => toast.error("Erro: " + e.message),
  });

  const pendingQuery = trpc.adsManager.listPendingCreatives.useQuery(undefined, {
    refetchInterval: 10000,
  });

  const requestMut = trpc.adsManager.requestCreative.useMutation({
    onSuccess: () => { pendingQuery.refetch(); },
    onError: (e) => { toast.error("Erro: " + e.message); },
  });

  const approveMut = trpc.adsManager.approveCreative.useMutation({
    onSuccess: (data) => {
      if (data.executed) {
        toast.success(`Anúncio criado na Meta Ads! ID: ${data.adId}`);
      } else {
        toast.success("Criativo aprovado — informe Campanha e Conjunto para subir.");
      }
      pendingQuery.refetch();
    },
    onError: (e) => { toast.error("Erro: " + e.message); },
  });

  const rejectMut = trpc.adsManager.rejectCreative.useMutation({
    onSuccess: () => { toast("Criativo rejeitado."); pendingQuery.refetch(); },
    onError: (e) => { toast.error("Erro: " + e.message); },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const base64 = dataUrl.split(",")[1];
        setImages(prev => [...prev, {
          file,
          base64,
          preview: dataUrl,
          title: file.name.replace(/\.[^.]+$/, ""),
          textOverlay: "",
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  async function handleSubmit() {
    if (images.length === 0) return;
    setSubmitting(true);
    try {
      for (const img of images) {
        await requestMut.mutateAsync({
          title: img.title || img.file.name,
          imageBase64: img.base64,
          textOverlay: img.textOverlay || undefined,
          campaignType: "prospeccao",
          targetAudience: "revendedoras",
          product: "pijamas femininos Feminnita",
        });
      }
      toast.success(`${images.length} criativo(s) enviado(s) para geração!`);
      setImages([]);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Upload */}
      <div className="bg-white border border-purple-200 rounded-xl p-5 shadow-sm">
        <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-lg mb-4">
          <Sparkles className="w-5 h-5 text-purple-600" />
          Criar Anúncio
        </h2>
        <p className="text-xs text-gray-500 mb-4">
          Selecione fotos do produto na Biblioteca ou faça upload. A IA analisa, cria o banner completo e o copy. Você aprova e a Fernanda sobe na Meta.
        </p>

        {/* Opção 1: da Biblioteca de Ativos */}
        <div className="border border-purple-200 rounded-xl p-4 mb-3">
          <button
            onClick={() => setShowLibrary(!showLibrary)}
            className="flex items-center gap-2 text-sm font-medium text-purple-700 hover:text-purple-900"
          >
            <Image className="w-4 h-4" />
            {showLibrary ? "Fechar Biblioteca" : "Selecionar da Biblioteca de Ativos"}
          </button>

          {showLibrary && (
            <div className="mt-3 space-y-3">
              {libraryQuery.isLoading && <p className="text-xs text-gray-400">Carregando...</p>}
              {!libraryQuery.isLoading && (libraryQuery.data?.length ?? 0) === 0 && (
                <p className="text-xs text-gray-400">Nenhum ativo de produto encontrado na biblioteca.</p>
              )}
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                {libraryQuery.data?.map((asset: any) => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAssetIds(prev =>
                      prev.includes(asset.id) ? prev.filter(i => i !== asset.id) : [...prev, asset.id]
                    )}
                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedAssetIds.includes(asset.id)
                        ? "border-purple-500 ring-2 ring-purple-300"
                        : "border-transparent hover:border-purple-300"
                    }`}
                  >
                    <img src={asset.url} alt={asset.name} className="w-full h-20 object-cover" />
                    {selectedAssetIds.includes(asset.id) && (
                      <div className="absolute inset-0 bg-purple-600 bg-opacity-20 flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-purple-700" />
                      </div>
                    )}
                    <p className="text-xs text-gray-600 p-1 truncate">{asset.name}</p>
                  </div>
                ))}
              </div>

              {selectedAssetIds.length > 0 && (
                <div className="space-y-2">
                  <input
                    className="w-full text-sm border border-purple-200 rounded px-2 py-1.5"
                    placeholder="Texto no banner (opcional — ex: Kit Família a partir de R$89)"
                    value={textOverlay}
                    onChange={e => setTextOverlay(e.target.value)}
                  />
                  <button
                    onClick={() => fromLibraryMut.mutate({
                      assetIds: selectedAssetIds,
                      campaignType: "prospeccao",
                      targetAudience: "revendedoras",
                      textOverlay: textOverlay || undefined,
                    })}
                    disabled={fromLibraryMut.isPending}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  >
                    {fromLibraryMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {fromLibraryMut.isPending
                      ? "Criando arte e copy…"
                      : `Criar arte para ${selectedAssetIds.length} foto(s)`}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Opção 2: upload direto */}
        <div
          className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-purple-300 hover:bg-purple-50 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="w-6 h-6 text-gray-300 mx-auto mb-1" />
          <p className="text-sm text-gray-400">Ou faça upload direto de fotos</p>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
        </div>

        {images.length > 0 && (
          <div className="mt-4 space-y-3">
            {images.map((img, i) => (
              <div key={i} className="flex items-start gap-3 bg-purple-50 rounded-lg p-3">
                <img src={img.preview} alt="" className="w-16 h-16 object-cover rounded-lg shrink-0" />
                <div className="flex-1 min-w-0 space-y-2">
                  <input
                    className="w-full text-sm border border-purple-200 rounded px-2 py-1"
                    placeholder="Título do criativo"
                    value={img.title}
                    onChange={e => setImages(prev => prev.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                  />
                  <input
                    className="w-full text-sm border border-purple-200 rounded px-2 py-1"
                    placeholder="Texto no banner (opcional)"
                    value={img.textOverlay}
                    onChange={e => setImages(prev => prev.map((x, j) => j === i ? { ...x, textOverlay: e.target.value } : x))}
                  />
                </div>
                <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))} className="text-gray-400 hover:text-red-500 shrink-0 mt-1">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              {submitting ? "Analisando e criando banner…" : `Enviar ${images.length} foto(s) para criar o criativo`}
            </button>
          </div>
        )}
      </div>

      {/* Fila de aprovação */}
      {(pendingQuery.data?.length ?? 0) > 0 && (
        <div className="bg-white border border-amber-200 rounded-xl p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-lg mb-4">
            <CheckCircle className="w-5 h-5 text-amber-500" />
            Criativos Aguardando Aprovação
            <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
              {pendingQuery.data!.length}
            </span>
          </h2>

          <div className="space-y-4">
            {pendingQuery.data!.map((c: any) => (
              <div key={c.id} className="border border-amber-100 rounded-xl p-4 bg-amber-50 space-y-3">
                <div className="flex items-start gap-3">
                  {c.imageBase64 && (
                    <img
                      src={`data:image/jpeg;base64,${c.imageBase64}`}
                      alt={c.briefTitle}
                      className="w-24 h-24 object-cover rounded-lg shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{c.briefTitle}</p>
                    {c.generatedHeadline && (
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-medium text-purple-700">Headline: </span>{c.generatedHeadline}
                      </p>
                    )}
                    {c.generatedBody && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium">Copy: </span>{c.generatedBody}
                      </p>
                    )}
                  </div>
                </div>

                {/* Campos de campanha/conjunto para execução imediata */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">ID da Campanha Meta</label>
                    <input
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
                      placeholder="ex: 120210123456"
                      value={approvalFields[c.id]?.campaignId ?? ""}
                      onChange={e => setApprovalFields(prev => ({ ...prev, [c.id]: { ...prev[c.id], campaignId: e.target.value, adSetId: prev[c.id]?.adSetId ?? "" } }))}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">ID do Conjunto de Anúncios</label>
                    <input
                      className="w-full text-xs border border-gray-200 rounded px-2 py-1.5"
                      placeholder="ex: 120210789012"
                      value={approvalFields[c.id]?.adSetId ?? ""}
                      onChange={e => setApprovalFields(prev => ({ ...prev, [c.id]: { ...prev[c.id], adSetId: e.target.value, campaignId: prev[c.id]?.campaignId ?? "" } }))}
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400">Com os IDs preenchidos a Fernanda sobe o anúncio agora (PAUSADO). Sem eles, apenas aprova para o próximo ciclo.</p>

                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => rejectMut.mutate({ id: c.id })}
                    disabled={rejectMut.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg text-xs font-medium hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" /> Rejeitar
                  </button>
                  <button
                    onClick={() => approveMut.mutate({
                      id: c.id,
                      campaignId: approvalFields[c.id]?.campaignId || undefined,
                      adSetId: approvalFields[c.id]?.adSetId || undefined,
                    })}
                    disabled={approveMut.isPending}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {approveMut.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ThumbsUp className="w-3.5 h-3.5" />}
                    {approvalFields[c.id]?.campaignId && approvalFields[c.id]?.adSetId ? "Aprovar e Subir Agora" : "Aprovar"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
