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
  RefreshCw,
  Send,
  TrendingDown,
  TrendingUp,
  Zap,
} from "lucide-react";

// ─── Tipos locais ─────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id?: number;
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

// ─── Componente: Mensagem do Chat ─────────────────────────────────────────────

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
          <span className="text-sm">📊</span>
        </div>
      )}
      <div
        className={`${isUser ? "max-w-[70%]" : "max-w-[92%]"} rounded-2xl px-4 py-3 text-base leading-relaxed ${
          isUser
            ? "bg-pink-100 text-slate-800 rounded-tr-sm border border-pink-200"
            : "bg-white border border-slate-200 text-slate-800 rounded-tl-sm shadow-sm"
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
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
  const [conversationId, setConversationId] = useState<number | undefined>(
    undefined
  );
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chatMutation = trpc.trafficManager.chat.useMutation({
    onSuccess: (data) => {
      setConversationId(data.conversationId);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
    },
    onError: (err) => {
      toast.error("Erro ao enviar mensagem: " + err.message);
      setMessages((prev) => prev.slice(0, -1)); // remover placeholder
    },
  });

  const { data: conversations } = trpc.trafficManager.listConversations.useQuery(
    { limit: 15 },
    { enabled: showHistory }
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mensagem de boas-vindas na primeira carga
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        content:
          "Olá! Sou a Fernanda — especialista sênior em tráfego pago da Feminnita.\n\nEstou aqui para analisar suas campanhas, identificar oportunidades de melhoria e propor ações concretas.\n\nPode me perguntar sobre:\n• Performance das campanhas Meta Ads\n• Otimização de ROAS e CAC\n• Estratégia para datas sazonais\n• Análise de CPM/CTR/frequência\n• Configuração de ASC e Advantage+\n\nComo posso ajudar hoje?",
      },
    ]);
  }, []);

  const sendMessage = () => {
    const text = input.trim();
    if (!text || chatMutation.isPending) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");

    chatMutation.mutate({ message: text, conversationId });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };


  const startNewConversation = () => {
    setConversationId(undefined);
    setMessages([
      {
        role: "assistant",
        content: "Nova conversa iniciada. Como posso ajudar?",
      },
    ]);
    setShowHistory(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-rose-100 flex items-center justify-center">
            <span className="text-lg">📊</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">
              Especialista em Tráfego — Feminnita
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs text-emerald-700 font-medium">Online</span>
              <span className="text-xs text-slate-400 ml-1">· Dra. Fernanda Leal</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
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
        {/* ── Painel esquerdo: Briefing + Fila de Aprovações ──────────────── */}
        <aside className="w-[300px] flex flex-col border-r border-slate-200 bg-white overflow-y-auto flex-shrink-0">
          {/* Histórico de conversas */}
          {showHistory && conversations && (
            <div className="border-b border-slate-200 p-4">
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-3">
                Conversas Anteriores
              </h3>
              {conversations.length === 0 ? (
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

        {/* ── Painel direito: Chat ─────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} />
            ))}

            {chatMutation.isPending && (
              <div className="flex justify-start mb-4">
                <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0 mr-2 mt-1">
                  <span className="text-sm">📊</span>
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
                  "Analisar performance das campanhas desta semana",
                  "Qual o CPM ideal para pijamas no Meta Ads?",
                  "Como configurar uma campanha ASC eficiente?",
                  "Minha frequência está em 3.8 — o que fazer?",
                ].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                      textareaRef.current?.focus();
                    }}
                    className="text-xs px-3 py-1.5 rounded-full border border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-6 py-4 bg-white border-t border-slate-200 flex-shrink-0">
            <div className="flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:border-rose-400 focus-within:ring-1 focus-within:ring-rose-200 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Pergunte sobre campanhas, ROAS, CPM, estratégias… (Enter para enviar)"
                rows={1}
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none max-h-32 overflow-y-auto"
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
                disabled={!input.trim() || chatMutation.isPending}
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
              Shift+Enter para nova linha · Enter para enviar
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
