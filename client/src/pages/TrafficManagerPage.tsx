import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Info,
  Loader2,
  MessageSquare,
  Paperclip,
  RefreshCw,
  Send,
  TrendingDown,
  TrendingUp,
  Volume2,
  X,
  Zap,
} from "lucide-react";

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id?: number;
  imagePreview?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function CampaignStatusDot({ status }: { status: string }) {
  const map: Record<string, string> = {
    otima: "bg-green-500",
    boa: "bg-blue-500",
    atencao: "bg-amber-500",
    critica: "bg-red-500",
  };
  return (
    <span
      className={`inline-block w-2.5 h-2.5 rounded-full ${map[status] ?? "bg-slate-400"}`}
    />
  );
}

function AlertIcon({ level }: { level: string }) {
  if (level === "critico")
    return <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />;
  if (level === "aviso")
    return <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />;
  return <Info className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />;
}

function AlertBg(level: string) {
  if (level === "critico") return "bg-red-50 border-red-200";
  if (level === "aviso") return "bg-amber-50 border-amber-200";
  return "bg-blue-50 border-blue-200";
}

function PriorityIcon({ priority }: { priority: string }) {
  if (priority === "alta") return <TrendingUp className="w-3.5 h-3.5 text-red-600" />;
  if (priority === "media") return <TrendingUp className="w-3.5 h-3.5 text-amber-600" />;
  return <TrendingDown className="w-3.5 h-3.5 text-slate-500" />;
}

// ─── Avatar da Fernanda ───────────────────────────────────────────────────────

function FernandaAvatar({ size = "sm" }: { size?: "sm" | "md" }) {
  const [err, setErr] = useState(false);
  const dim = size === "md" ? "w-10 h-10" : "w-8 h-8";
  if (err)
    return (
      <div className={`${dim} rounded-full bg-gradient-to-br from-rose-400 to-pink-600 flex items-center justify-center flex-shrink-0`}>
        <span className="text-white font-bold text-sm">F</span>
      </div>
    );
  return (
    <img
      src="/agents/fernanda.jpg"
      alt="Fernanda"
      className={`${dim} rounded-full object-cover flex-shrink-0`}
      onError={() => setErr(true)}
    />
  );
}

// ─── Parser de criativo ───────────────────────────────────────────────────────

interface CreativeData {
  headline?: string;
  body?: string;
  titulo?: string;
  preco?: string;
  subtitulo?: string;
  cta?: string;
  rodape?: string;
  angle?: string;
}

function parseCreative(content: string): { text: string; creative: CreativeData | null } {
  const s = content.indexOf("<<<CREATIVE_START>>>");
  const e = content.indexOf("<<<CREATIVE_END>>>");
  if (s === -1 || e === -1) return { text: content, creative: null };
  const text = (content.slice(0, s) + content.slice(e + "<<<CREATIVE_END>>>".length)).trim();
  try {
    const creative = JSON.parse(content.slice(s + "<<<CREATIVE_START>>>".length, e).trim());
    return { text, creative };
  } catch {
    return { text: content, creative: null };
  }
}

function CreativeCard({ creative }: { creative: CreativeData }) {
  return (
    <div className="mt-3 rounded-xl overflow-hidden border border-rose-200 text-sm">
      <div className="bg-rose-700 px-4 py-3">
        {creative.titulo && <p className="text-xs font-bold text-rose-200 uppercase tracking-widest mb-1">{creative.titulo}</p>}
        {creative.headline && <p className="text-base font-bold text-white leading-snug">{creative.headline}</p>}
        {creative.subtitulo && <p className="text-xs text-rose-300 mt-1 uppercase tracking-wide">{creative.subtitulo}</p>}
      </div>
      <div className="bg-white px-4 py-3 space-y-2">
        {creative.body && <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{creative.body}</p>}
        {creative.preco && <p className="font-semibold text-slate-900 border-t border-slate-100 pt-2">{creative.preco}</p>}
        {creative.rodape && <p className="text-xs text-slate-500">{creative.rodape}</p>}
        {creative.cta && (
          <div className="bg-rose-600 rounded-lg px-4 py-2 text-center mt-1">
            <p className="font-bold text-white text-sm">{creative.cta}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Componente: Mensagem do Chat ─────────────────────────────────────────────

function ChatBubble({ message, onSpeak, isSpeaking }: {
  message: ChatMessage;
  onSpeak?: (text: string) => void;
  isSpeaking?: boolean;
}) {
  const isUser = message.role === "user";
  const { text, creative } = isUser ? { text: message.content, creative: null } : parseCreative(message.content);
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="mr-2 mt-1">
          <FernandaAvatar size="sm" />
        </div>
      )}
      <div className="flex items-start gap-2 max-w-[85%]">
        <div
          className={`flex-1 rounded-2xl px-4 py-3 text-base leading-relaxed ${
            isUser
              ? "text-slate-800 rounded-tr-sm border border-[#E8E0CC]"
              : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
          }`}
          style={isUser ? { backgroundColor: "#FAF8F0" } : undefined}
        >
          {message.imagePreview && (
            <img
              src={message.imagePreview}
              alt="Arte enviada"
              className="rounded-lg mb-2 max-w-full max-h-64 object-contain"
            />
          )}
          {text && <p className="whitespace-pre-wrap">{text}</p>}
          {creative && <CreativeCard creative={creative} />}
        </div>
        {!isUser && onSpeak && (
          <button
            onClick={() => onSpeak(message.content)}
            title="Ouvir resposta"
            className={`flex-shrink-0 mt-1 p-2.5 rounded-xl border shadow-sm transition-colors ${
              isSpeaking
                ? "bg-rose-500 border-rose-400 text-white"
                : "bg-white border-slate-200 text-rose-400 hover:bg-rose-50 hover:border-rose-300"
            }`}
          >
            {isSpeaking
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Volume2 className="w-4 h-4" />
            }
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Componente: Painel de Briefing ───────────────────────────────────────────

function BriefingPanel() {
  const { data, isLoading, refetch } = trpc.trafficManager.getDailyBriefing.useQuery(
    undefined,
    { retry: false }
  );
  const regenerate = trpc.trafficManager.regenerateBriefing.useMutation({
    onSuccess: () => {
      toast.success("Briefing sendo gerado…");
      // Polling: aguardar 15s e recarregar
      setTimeout(() => refetch(), 15000);
    },
    onError: () => toast.error("Erro ao regenerar briefing"),
  });

  const isGenerating = (data as any)?.generating === true;

  // Se está gerando, fazer polling a cada 12s
  useEffect(() => {
    if (!isGenerating) return;
    const timer = setTimeout(() => refetch(), 12000);
    return () => clearTimeout(timer);
  }, [isGenerating, refetch]);

  const [showAllAlerts, setShowAllAlerts] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-rose-500" />
      </div>
    );
  }

  const briefing = data?.data as any;
  if (!briefing) return null;

  const visibleAlerts = showAllAlerts
    ? briefing.alerts
    : (briefing.alerts ?? []).slice(0, 3);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Resumo do Dia</h3>
          <p className="text-xs text-slate-500 mt-0.5 capitalize">{briefing.date}</p>
        </div>
        <div className="flex items-center gap-1.5">
          {isGenerating && (
            <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <Loader2 className="w-3 h-3 animate-spin" />
              Gerando…
            </span>
          )}
          <button
            onClick={() => regenerate.mutate()}
            disabled={regenerate.isPending || isGenerating}
            className="p-1.5 hover:bg-rose-50 rounded-lg transition-colors"
            title="Atualizar briefing"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 text-rose-500 ${regenerate.isPending ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      {/* Gastos */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Gasto Hoje</p>
          <p className="text-base font-bold text-slate-900">{briefing.spendToday}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
          <p className="text-xs text-slate-500 mb-1">Gasto no Mês</p>
          <p className="text-base font-bold text-slate-900">{briefing.spendMonth}</p>
        </div>
      </div>

      {/* Resumo */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
        <p className="text-sm text-rose-900 leading-relaxed">{briefing.summary}</p>
      </div>

      {/* Campanhas */}
      {briefing.topCampaigns?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            Campanhas
          </h4>
          <div className="space-y-2">
            {briefing.topCampaigns.map((c: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-3 py-2"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <CampaignStatusDot status={c.status} />
                  <span className="text-sm text-slate-800 truncate">{c.name}</span>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                  <span className="text-xs text-slate-500">{c.spend}</span>
                  <span className="text-xs font-semibold text-slate-800">
                    {c.roas}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alertas */}
      {briefing.alerts?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            Alertas
          </h4>
          <div className="space-y-2">
            {visibleAlerts.map((a: any, i: number) => (
              <div
                key={i}
                className={`flex items-start gap-2 border rounded-lg px-3 py-2 text-sm ${AlertBg(a.level)}`}
              >
                <AlertIcon level={a.level} />
                <span className="text-slate-800">{a.message}</span>
              </div>
            ))}
          </div>
          {briefing.alerts.length > 3 && (
            <button
              onClick={() => setShowAllAlerts((v) => !v)}
              className="flex items-center gap-1 text-xs text-rose-600 mt-2 hover:underline"
            >
              {showAllAlerts ? (
                <>
                  <ChevronUp className="w-3 h-3" /> Mostrar menos
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" /> Ver mais{" "}
                  {briefing.alerts.length - 3} alertas
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Recomendações */}
      {briefing.recommendations?.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
            Recomendações
          </h4>
          <div className="space-y-2">
            {briefing.recommendations.map((r: any, i: number) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-lg p-3"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <PriorityIcon priority={r.priority} />
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                    {r.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-800">{r.action}</p>
                <p className="text-xs text-slate-500 mt-1">{r.expected_impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function TrafficManagerPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationIdState] = useState<number | undefined>(() => {
    const stored = sessionStorage.getItem("fernanda_conv_id");
    return stored ? parseInt(stored, 10) : undefined;
  });
  const setConversationId = (id: number | undefined) => {
    setConversationIdState(id);
    if (id !== undefined) sessionStorage.setItem("fernanda_conv_id", String(id));
    else sessionStorage.removeItem("fernanda_conv_id");
  };
  const [showHistory, setShowHistory] = useState(false);
  const [pendingImage, setPendingImage] = useState<string | null>(null);
  const [pendingCreativeId, setPendingCreativeIdState] = useState<number | null>(() => {
    const stored = sessionStorage.getItem("fernanda_creative_id");
    return stored ? parseInt(stored, 10) : null;
  });
  const setPendingCreativeId = (id: number | null) => {
    setPendingCreativeIdState(id);
    if (id !== null) sessionStorage.setItem("fernanda_creative_id", String(id));
    else sessionStorage.removeItem("fernanda_creative_id");
  };
  const [publishAdsetId, setPublishAdsetId] = useState("");
  const [publishCampaignId, setPublishCampaignId] = useState("");
  const [showBriefing, setShowBriefing] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const restoredRef = useRef(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const speakMutation = trpc.trafficManager.speak.useMutation({
    onSuccess: (data) => {
      const audio = new Audio(`data:audio/mpeg;base64,${data.audioBase64}`);
      audioRef.current = audio;
      audio.onended = () => setSpeakingIndex(null);
      audio.onerror = () => { setSpeakingIndex(null); toast.error("Erro ao reproduzir áudio"); };
      audio.play().catch(() => { setSpeakingIndex(null); toast.error("Não foi possível reproduzir o áudio"); });
    },
    onError: () => { setSpeakingIndex(null); toast.error("Erro ao gerar áudio"); },
  });

  const handleSpeak = (text: string, index: number) => {
    if (speakingIndex === index) {
      audioRef.current?.pause();
      setSpeakingIndex(null);
      return;
    }
    audioRef.current?.pause();
    setSpeakingIndex(index);
    speakMutation.mutate({ text });
  };

  const chatMutation = trpc.trafficManager.chat.useMutation({
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      setMessages((prev) => [...prev, { role: "assistant", content: data.message }]);
      if (data.creativeId) {
        setPendingCreativeId(data.creativeId);
        toast.success("Arte salva! Selecione a campanha e publique.");
      }
    },
    onError: (err, variables) => {
      toast.error("Erro ao enviar mensagem: " + err.message);
      setMessages((prev) => prev.slice(0, -1));
      if (variables.imageBase64) setPendingImage(variables.imageBase64);
    },
  });

  const { data: adsets } = trpc.trafficManager.listAdsets.useQuery(undefined, {
    enabled: !!pendingCreativeId,
    retry: false,
  });

  const publishMut = trpc.trafficManager.publishCreative.useMutation({
    onSuccess: (data) => {
      toast.success("Anúncio publicado no Meta! " + (data.metaAdId ? `ID: ${data.metaAdId}` : ""));
      setPendingCreativeId(null);
      setPublishAdsetId("");
      setPublishCampaignId("");
      setMessages((prev) => [...prev, { role: "assistant", content: `✅ Anúncio publicado com sucesso no Meta Ads!${data.metaAdId ? ` ID: ${data.metaAdId}` : ""} Quer criar o próximo?` }]);
    },
    onError: (err) => toast.error("Erro ao publicar: " + err.message),
  });

  const { data: conversations } = trpc.trafficManager.listConversations.useQuery(
    { limit: 15 },
    { enabled: showHistory || showBriefing }
  );

  const { data: restoredMessages } = trpc.trafficManager.getMessages.useQuery(
    { conversationId: conversationId! },
    { enabled: !!conversationId, staleTime: Infinity, retry: false }
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mensagem de boas-vindas na primeira carga (só quando não há conversa salva)
  useEffect(() => {
    if (!sessionStorage.getItem("fernanda_conv_id")) {
      setMessages([
        {
          role: "assistant",
          content:
            "Oi! Aqui é a Fernanda 👋\n\nSou a gestora de tráfego pago da Feminnita — cuido de Meta Ads, Google Ads e da criação dos anúncios. Tô aqui pra te ajudar a escalar as campanhas e bater os R$100K/mês.\n\nPosso trabalhar em dois fluxos:\n\n📊 GESTÃO DE CAMPANHAS\n• Análise de performance (ROAS, CPM, CTR, frequência)\n• Otimização de orçamento e pausas cirúrgicas\n• Estratégia EDS — ASC + CBO\n\n🎨 CRIAÇÃO DE ANÚNCIOS (um por vez)\n• Definimos o ângulo do anúncio (renda extra, mãe, lojista…)\n• Eu gero os textos pra você colocar no Canva\n• Você manda a arte pronta pelo botão 📎\n• Eu analiso, preparo a copy completa e publico no Meta\n\nPor onde quer começar?",
        },
      ]);
    }
  }, []);

  // Restaurar mensagens do banco ao retomar conversa (sobrevive a HMR e recargas)
  useEffect(() => {
    if (!restoredMessages || restoredRef.current) return;
    restoredRef.current = true;
    if (restoredMessages.length > 0) {
      setMessages(restoredMessages.map((m: { role: string; content: string }) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })));
    } else {
      setConversationId(undefined);
    }
  }, [restoredMessages]);

  const sendMessage = () => {
    const text = input.trim();
    if ((!text && !pendingImage) || chatMutation.isPending) return;

    const displayText = text || "Arte enviada para análise.";
    const imageToSend = pendingImage;

    setMessages((prev) => [
      ...prev,
      { role: "user", content: displayText, imagePreview: imageToSend ?? undefined },
    ]);
    setInput("");
    setPendingImage(null);

    chatMutation.mutate({
      message: text || "Analise esta arte e gere a copy do anúncio.",
      conversationId,
      imageBase64: imageToSend ?? undefined,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  const startNewConversation = () => {
    setConversationId(undefined);
    setPendingImage(null);
    setPendingCreativeId(null);
    setPublishAdsetId("");
    setPublishCampaignId("");
    setMessages([
      {
        role: "assistant",
        content: "Nova conversa iniciada. Como posso ajudar?",
      },
    ]);
    setShowHistory(false);
  };

  return (
    <div className="-m-4 flex flex-col flex-1 min-h-0 bg-slate-50">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <FernandaAvatar size="md" />
          <div>
            <h1 className="text-base font-bold text-slate-900">Fernanda Leal</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs text-emerald-700 font-medium">Online</span>
              <span className="text-xs text-slate-400 ml-1">· Gestora de Tráfego Pago · Meta &amp; Google Ads</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBriefing((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-colors ${
              showBriefing
                ? "bg-rose-50 border-rose-300 text-rose-700"
                : "border-slate-200 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Briefing
          </button>
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-sm text-slate-700 transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            Histórico
          </button>
          <button
            onClick={startNewConversation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Nova Conversa
          </button>
        </div>
      </header>

      {/* ── Conteúdo principal ───────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Painel esquerdo: Briefing (colapsável) ──────────────────────── */}
        {showBriefing && (
        <aside className="w-[300px] flex flex-col border-r border-slate-200 bg-white overflow-y-auto flex-shrink-0">
          {/* Histórico de conversas */}
          {showHistory && conversations && (
            <div className="border-b border-slate-200 p-4">
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                Conversas Anteriores
              </h3>
              {!conversations || conversations.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhuma conversa ainda.</p>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv: { id: number; title: string }) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setConversationId(conv.id);
                        setShowHistory(false);
                        toast.info("Selecione uma conversa para continuar.");
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-sm text-slate-700 truncate transition-colors"
                    >
                      {conv.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Briefing do Dia */}
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-rose-500" />
              <h2 className="text-sm font-bold text-slate-900">Briefing do Dia</h2>
            </div>
            <BriefingPanel />
          </div>

        </aside>
        )}

        {/* ── Painel direito: Chat ─────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">

          {/* ── Retrato da Fernanda ────────────────────────────────────────── */}
          <div className="flex items-stretch gap-0 flex-shrink-0" style={{ background: "linear-gradient(to right, #6B1030, #7B1040)" }}>
            <div className="flex-shrink-0">
              <img
                src="/agents/fernanda.jpg"
                alt="Fernanda Leal"
                className="h-44 w-32 object-cover object-top"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            </div>
            <div className="flex flex-col justify-center px-6 py-4 flex-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-rose-300 mb-1">Especialista em Tráfego Pago</p>
              <h2 className="text-2xl font-bold text-white leading-tight">Fernanda Leal</h2>
              <p className="text-sm text-rose-200 mt-1.5 leading-relaxed max-w-lg">
                Meta Ads · Google Ads · Estratégia EDS · Criação de anúncios para a Feminnita.<br />
                Meta: <span className="text-white font-semibold">R$100K/mês</span>
              </p>
              <div className="flex items-center gap-1.5 mt-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                <span className="text-xs text-emerald-300 font-medium">Online agora</span>
              </div>
            </div>
          </div>

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {messages.map((msg, i) => (
              <ChatBubble
                key={i}
                message={msg}
                onSpeak={msg.role === "assistant" ? (text) => handleSpeak(text, i) : undefined}
                isSpeaking={speakingIndex === i}
              />
            ))}

            {chatMutation.isPending && (
              <div className="flex justify-start mb-4">
                <div className="mr-2 mt-1">
                  <FernandaAvatar size="sm" />
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugestões rápidas */}
          {messages.length <= 1 && (
            <div className="px-6 pb-2">
              <p className="text-xs text-slate-400 mb-2">Sugestões:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Quero criar um anúncio novo — por onde começar?",
                  "Analisar performance das campanhas desta semana",
                  "Qual o CPM ideal para pijamas no Meta Ads?",
                  "Minha frequência está em 3.8 — o que fazer?",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                      textareaRef.current?.focus();
                    }}
                    className="text-sm px-3 py-2 rounded-full border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Publish card */}
          {pendingCreativeId && (
            <div className="mx-6 mb-3 bg-rose-50 border border-rose-200 rounded-2xl p-4">
              <p className="text-sm font-semibold text-rose-800 mb-3">
                🎨 Arte salva (ID: {pendingCreativeId}) — Selecione onde publicar
              </p>
              {adsets && adsets.length > 0 ? (
                <select
                  className="w-full text-sm border border-rose-200 rounded-lg px-3 py-2 mb-3 bg-white focus:outline-none focus:border-rose-400"
                  value={publishAdsetId}
                  onChange={(e) => {
                    const selected = adsets.find((a: any) => a.id === e.target.value);
                    setPublishAdsetId(e.target.value);
                    if (selected) setPublishCampaignId((selected as any).campaignId || "");
                  }}
                >
                  <option value="">Selecione um conjunto de anúncios…</option>
                  {adsets.map((a: any) => (
                    <option key={a.id} value={a.id}>
                      {a.campaignName} → {a.name} ({a.status})
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex gap-2 mb-3">
                  <input
                    className="flex-1 text-sm border border-rose-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
                    placeholder="Campaign ID"
                    value={publishCampaignId}
                    onChange={(e) => setPublishCampaignId(e.target.value)}
                  />
                  <input
                    className="flex-1 text-sm border border-rose-200 rounded-lg px-3 py-2 bg-white focus:outline-none"
                    placeholder="AdSet ID"
                    value={publishAdsetId}
                    onChange={(e) => setPublishAdsetId(e.target.value)}
                  />
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!publishAdsetId) { toast.error("Selecione um conjunto de anúncios"); return; }
                    publishMut.mutate({
                      creativeId: pendingCreativeId,
                      campaignId: publishCampaignId,
                      adSetId: publishAdsetId,
                    });
                  }}
                  disabled={publishMut.isPending || !publishAdsetId}
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold transition-colors disabled:opacity-40"
                >
                  {publishMut.isPending ? "Publicando…" : "📤 Publicar no Meta"}
                </button>
                <button
                  onClick={() => { setPendingCreativeId(null); setPublishAdsetId(""); setPublishCampaignId(""); }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm hover:bg-slate-50"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-6 py-4 bg-white border-t border-slate-200 flex-shrink-0">
            {/* Image preview */}
            {pendingImage && (
              <div className="relative inline-block mb-2">
                <img
                  src={pendingImage}
                  alt="Arte"
                  className="h-20 w-20 object-cover rounded-lg border border-slate-200"
                />
                <button
                  onClick={() => setPendingImage(null)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-slate-700 text-white rounded-full flex items-center justify-center hover:bg-slate-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                  const img = new window.Image();
                  img.onload = () => {
                    const MAX = 1200;
                    let { width, height } = img;
                    if (width > MAX || height > MAX) {
                      if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
                      else { width = Math.round(width * MAX / height); height = MAX; }
                    }
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    canvas.getContext("2d")!.drawImage(img, 0, 0, width, height);
                    setPendingImage(canvas.toDataURL("image/jpeg", 0.85));
                  };
                  img.src = ev.target?.result as string;
                };
                reader.readAsDataURL(file);
                e.target.value = "";
              }}
            />

            <div className="flex items-end gap-3 border border-[#E8E0CC] rounded-2xl px-4 py-3 focus-within:border-[#C9B99A] focus-within:ring-1 focus-within:ring-[#F5EFE0] transition-all" style={{ backgroundColor: "#FAF8F0" }}>
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Enviar arte"
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors flex-shrink-0"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={pendingImage ? "Adicione uma nota (opcional) e pressione Enter…" : "Pergunte sobre campanhas, ROAS, CPM, estratégias… (Enter para enviar)"}
                rows={1}
                className="flex-1 bg-transparent text-[15px] text-slate-800 placeholder-slate-400 resize-none focus:outline-none max-h-32 overflow-y-auto"
                style={{
                  height: "auto",
                  minHeight: "24px",
                }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 128) + "px";
                }}
              />
              <button
                onClick={sendMessage}
                disabled={(!input.trim() && !pendingImage) || chatMutation.isPending}
                className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                {chatMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 text-center">
              📎 para enviar arte · Shift+Enter para nova linha · Enter para enviar
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
