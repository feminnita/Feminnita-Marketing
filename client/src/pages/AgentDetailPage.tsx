/**
 * Agent Detail Page — Chat completo com cada agente especialista
 *
 * Rota: /agente/:name (sofia, beatriz, clara, mariana)
 *
 * Interface idêntica ao TrafficManagerPage da Fernanda:
 * - Painel esquerdo: análise mais recente + ações pendentes
 * - Painel direito: chat em tempo real com busca na internet
 */

import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Globe,
  Lightbulb,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  TrendingUp,
  Eye,
  XCircle,
  Zap,
  Bot,
  Target,
} from "lucide-react";

// ─── Config por agente ────────────────────────────────────────────────────────

const AGENT_CONFIG: Record<string, {
  label: string;
  role: string;
  emoji: string;
  color: string;
  bgColor: string;
  borderColor: string;
  suggestions: string[];
}> = {
  sofia: {
    label: "Sofia Oliveira",
    role: "Especialista em Crescimento Instagram",
    emoji: "📱",
    color: "rose",
    bgColor: "bg-rose-50",
    borderColor: "border-rose-200",
    suggestions: [
      "Quais Reels devo criar essa semana?",
      "Como crescer seguidores revendedoras?",
      "Melhores hashtags para pijamas atacado",
      "Qual horário postar para meu público?",
    ],
  },
  beatriz: {
    label: "Beatriz Santos",
    role: "Especialista em Conteúdo e Tendências",
    emoji: "✨",
    color: "yellow",
    bgColor: "bg-yellow-50",
    borderColor: "border-yellow-200",
    suggestions: [
      "Crie um calendário editorial para maio",
      "O que está viralizando em pijamas agora?",
      "Escreva uma legenda para lançamento de coleção",
      "Datas comemorativas para usar em posts",
    ],
  },
  clara: {
    label: "Clara Mendes",
    role: "Especialista em Inteligência Competitiva",
    emoji: "🔍",
    color: "blue",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    suggestions: [
      "Quem são meus maiores concorrentes?",
      "Como está a precificação do mercado?",
      "O que os concorrentes estão anunciando?",
      "Onde estão os gaps de oportunidade?",
    ],
  },
  mariana: {
    label: "Mariana Costa",
    role: "Especialista em Vendas Multicanal",
    emoji: "💰",
    color: "green",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    suggestions: [
      "Como reativar clientes inativos no WhatsApp?",
      "Como configurar vendas no Mercado Livre?",
      "Qual canal tem maior ROI para atacado?",
      "Como chegar a R$100K/mês mais rápido?",
    ],
  },
};

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ProposedAction {
  title: string;
  description: string;
  type: string;
  priority: string;
  estimatedImpact: string;
}

// ─── Componentes ──────────────────────────────────────────────────────────────

function ChatBubble({ message, agentName }: { message: ChatMessage; agentName: string }) {
  const isUser = message.role === "user";
  const config = AGENT_CONFIG[agentName];
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-4`}>
      {!isUser && (
        <div className={`w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0 mr-2 mt-1 text-sm`}>
          {config.emoji}
        </div>
      )}
      <div
        className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser
            ? "bg-pink-100 text-slate-800 rounded-tr-sm border border-pink-200"
            : `bg-white border ${config.borderColor} text-slate-800 rounded-tl-sm shadow-sm`
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}

// ─── Painel lateral: análise + ações pendentes ────────────────────────────────

function SidePanel({ agentName }: { agentName: string }) {
  const config = AGENT_CONFIG[agentName];

  const { data: latestAnalysis } = trpc.morningBriefing.getAgentLatest.useQuery(
    { agentName } as { agentName: string }
  );

  const { data: pendingActions, refetch: refetchActions } =
    trpc.agentActions.listByStatus.useQuery({
      agentName,
      status: "pending",
      limit: 10,
    });

  const approveMutation = trpc.agentActions.approve.useMutation({
    onSuccess: () => { refetchActions(); toast.success("Ação aprovada"); },
  });
  const rejectMutation = trpc.agentActions.reject.useMutation({
    onSuccess: () => { refetchActions(); toast.success("Ação rejeitada"); },
  });

  const analysis = latestAnalysis?.data as Record<string, any> | null;
  const pendingOnly = (pendingActions || []).slice(0, 5);

  return (
    <aside className="w-[30%] min-w-[260px] max-w-[340px] flex flex-col border-r border-slate-200 bg-white overflow-y-auto flex-shrink-0">
      {/* Análise do dia */}
      {analysis && (
        <div className={`p-4 border-b border-slate-200 ${config.bgColor}`}>
          <div className="flex items-center gap-2 mb-2">
            <Globe className="w-3.5 h-3.5 text-green-600" />
            <span className="text-xs font-semibold text-slate-700">
              Análise de {latestAnalysis?.period}
            </span>
          </div>
          <p className="text-xs text-slate-700 leading-relaxed">{analysis.summary}</p>

          {analysis.highlights && analysis.highlights.length > 0 && (
            <div className="mt-2 space-y-1">
              {(analysis.highlights as string[]).slice(0, 2).map((h, i) => (
                <p key={i} className="text-xs text-green-700 flex items-start gap-1">
                  <span>✓</span>{h}
                </p>
              ))}
            </div>
          )}
          {analysis.alerts && analysis.alerts.length > 0 && (
            <div className="mt-2 space-y-1">
              {(analysis.alerts as string[]).slice(0, 2).map((a, i) => (
                <p key={i} className="text-xs text-red-700 flex items-start gap-1">
                  <span>⚠</span>{a}
                </p>
              ))}
            </div>
          )}

          {/* Path to 100K (apenas Mariana) */}
          {analysis.pathTo100k && (
            <div className="mt-2 bg-white rounded p-2 border border-green-200">
              <div className="flex items-center gap-1 mb-1">
                <Target className="w-3 h-3 text-green-600" />
                <span className="text-xs font-semibold text-green-800">Plano R$100K</span>
              </div>
              <p className="text-xs text-green-700">{analysis.pathTo100k}</p>
            </div>
          )}
        </div>
      )}

      {/* Fila de aprovação */}
      <div className="p-4 flex-1">
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle2 className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Fila de Aprovação</h2>
          {pendingOnly.length > 0 && (
            <span className="ml-auto text-xs bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {pendingOnly.length}
            </span>
          )}
        </div>

        {pendingOnly.length === 0 ? (
          <div className="text-center py-6 text-slate-400">
            <CheckCircle2 className="w-7 h-7 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Sem ações pendentes.</p>
            <p className="text-xs mt-0.5 text-slate-300">Peça ao agente para propor ações.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingOnly.map((action: any) => (
              <div key={action.id} className="border rounded-lg p-3 bg-white">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                    action.priority === "alta" ? "bg-red-100 text-red-700" :
                    action.priority === "media" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {action.priority}
                  </span>
                  <span className="text-xs text-gray-400">{action.actionType}</span>
                </div>
                <p className="text-xs font-semibold text-slate-800 mb-0.5">{action.title}</p>
                <p className="text-xs text-slate-600 line-clamp-2">{action.description}</p>
                {action.estimatedImpact && (
                  <p className="text-xs text-green-700 mt-1">{action.estimatedImpact}</p>
                )}
                <div className="flex gap-1.5 mt-2">
                  <button
                    onClick={() => approveMutation.mutate({ id: action.id })}
                    disabled={approveMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Aprovar
                  </button>
                  <button
                    onClick={() => rejectMutation.mutate({ id: action.id })}
                    disabled={rejectMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1 py-1 rounded border border-slate-300 hover:bg-slate-50 text-slate-600 text-xs font-medium transition-colors"
                  >
                    <XCircle className="w-3 h-3" /> Rejeitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AgentDetailPage({ agentName }: { agentName: string }) {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [conversationId, setConversationId] = useState<number | undefined>(undefined);
  const [showHistory, setShowHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const config = AGENT_CONFIG[agentName];

  const chatMutation = trpc.specialistChat.chat.useMutation({
    onSuccess: (data) => {
      setConversationId(data.conversationId ?? undefined);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message },
      ]);
      if (data.proposedActions?.length) {
        toast.success(`${data.proposedActions.length} ação(ões) proposta(s) — veja na fila de aprovação`);
      }
    },
    onError: (err) => {
      toast.error("Erro: " + err.message);
      setMessages((prev) => prev.slice(0, -1));
    },
  });

  const { data: conversations } = trpc.specialistChat.listConversations.useQuery(
    { agentName: agentName as any, limit: 15 },
    { enabled: showHistory }
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Mensagem de boas-vindas
  useEffect(() => {
    const welcomeMessages: Record<string, string> = {
      sofia: `Olá! Sou a Sofia — especialista em crescimento no Instagram para a Feminnita. 🌸

Posso te ajudar com:
• Estratégia de Reels e Carrosséis para alcançar mais revendedoras
• Hashtags em alta para o nicho de pijamas/moda
• Frequência e horários ideais de publicação
• Como transformar seguidores em clientes B2B

O que você quer trabalhar hoje?`,
      beatriz: `Olá! Sou a Beatriz — especialista em conteúdo e tendências para a Feminnita. ✨

Posso te ajudar com:
• Calendário editorial do próximo mês (datas, temas, formatos)
• Ideias de conteúdo baseadas no que está viralizando agora
• Copys e legendas que convertem para revendedoras
• Estratégia de lançamento de coleções

O que precisamos criar?`,
      clara: `Olá! Sou a Clara — especialista em inteligência competitiva para a Feminnita. 🔍

Posso te ajudar com:
• Mapeamento dos seus principais concorrentes em pijamas atacado
• Análise de precificação: como você está posicionada vs. o mercado
• Gaps de oportunidade que a concorrência não está aproveitando
• O que está funcionando (criativos, promoções) nos concorrentes

Qual aspecto da concorrência quer analisar?`,
      mariana: `Olá! Sou a Mariana — especialista em vendas multicanal. 💰

Foco total: levar a Feminnita de R$20K para R$100K/mês.

Posso te ajudar com:
• Reativar clientes inativos via WhatsApp (alto ROI, custo quase zero)
• Configurar e escalar vendas no Mercado Livre
• Estratégia para Shopee, Amazon ou TikTok Shop
• Calcular quanto investir em cada canal para maximizar retorno

Por onde quer começar?`,
    };
    setMessages([{ role: "assistant", content: welcomeMessages[agentName] || "Olá! Como posso ajudar?" }]);
  }, [agentName]);

  if (!config) {
    return (
      <div className="p-6 text-center text-gray-500">
        Agente "{agentName}" não encontrado.
      </div>
    );
  }

  const sendMessage = () => {
    const text = input.trim();
    if (!text || chatMutation.isPending) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    chatMutation.mutate({ agentName: agentName as any, message: text, conversationId });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const startNewConversation = () => {
    setConversationId(undefined);
    const firstMessage = messages[0];
    setMessages(firstMessage ? [firstMessage] : []);
    setShowHistory(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/equipe-marketing")}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className={`w-9 h-9 rounded-full ${config.bgColor} flex items-center justify-center text-lg`}>
            {config.emoji}
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900">{config.label}</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs text-emerald-700 font-medium">Online</span>
              <span className="text-xs text-slate-400 ml-1">· {config.role}</span>
              <span className={`ml-1 text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-0.5`}>
                <Globe className="w-2.5 h-2.5" />
                Web search
              </span>
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
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-${config.color}-600 hover:bg-${config.color}-700 text-white text-sm font-medium transition-colors`}
            style={{ backgroundColor: config.color === "yellow" ? "#ca8a04" : config.color === "blue" ? "#2563eb" : config.color === "green" ? "#16a34a" : "#e11d48" }}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Nova Conversa
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <div className="flex flex-1 overflow-hidden">
        {/* Painel esquerdo */}
        <SidePanel agentName={agentName} />

        {/* Chat */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Histórico de conversas */}
          {showHistory && conversations && (
            <div className="border-b border-slate-200 bg-white p-4 max-h-48 overflow-y-auto">
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wide mb-2">
                Conversas Anteriores
              </h3>
              {conversations.length === 0 ? (
                <p className="text-xs text-slate-400">Nenhuma conversa ainda.</p>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conv: any) => (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setConversationId(conv.id);
                        setShowHistory(false);
                        toast.info("Continuando conversa anterior.");
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-50 text-sm text-slate-700 truncate transition-colors"
                    >
                      {conv.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Mensagens */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {messages.map((msg, i) => (
              <ChatBubble key={i} message={msg} agentName={agentName} />
            ))}

            {chatMutation.isPending && (
              <div className="flex justify-start mb-4">
                <div className={`w-8 h-8 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0 mr-2 mt-1 text-sm`}>
                  {config.emoji}
                </div>
                <div className={`bg-white border ${config.borderColor} rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm`}>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                    <span className="text-xs text-slate-400 ml-1">buscando na web...</span>
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
                {config.suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setInput(s);
                      textareaRef.current?.focus();
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full border ${config.borderColor} text-slate-700 ${config.bgColor} hover:opacity-80 transition-opacity`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="px-6 py-4 bg-white border-t border-slate-200 flex-shrink-0">
            <div className={`flex items-end gap-3 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 focus-within:${config.borderColor} focus-within:ring-1 transition-all`}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Pergunte à ${config.label.split(" ")[0]}… (Enter para enviar)`}
                rows={1}
                className="flex-1 bg-transparent text-sm text-slate-800 placeholder-slate-400 resize-none focus:outline-none max-h-32 overflow-y-auto"
                style={{ height: "auto", minHeight: "24px" }}
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = "auto";
                  el.style.height = Math.min(el.scrollHeight, 128) + "px";
                }}
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || chatMutation.isPending}
                className="p-2 rounded-xl text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                style={{ backgroundColor: config.color === "yellow" ? "#ca8a04" : config.color === "blue" ? "#2563eb" : config.color === "green" ? "#16a34a" : "#e11d48" }}
              >
                {chatMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-1.5 text-center">
              Shift+Enter para nova linha · Enter para enviar · A agente busca informações na internet automaticamente
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
