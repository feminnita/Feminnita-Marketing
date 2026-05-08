import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import luizaPhoto from "@/assets/luiza-shopee.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Account = "feminnita" | "fnt";

const SHOPEE_ORANGE = "#EE4D2D";
const BTN_HEX = "#6B1D28";

const SUGGESTIONS: Record<Account, string[]> = {
  feminnita: [
    "Analise o ROAS das minhas campanhas esta semana",
    "Quais keywords devo priorizar nos Search Ads?",
    "Como preparar as campanhas para o Dia das Mães?",
    "Meu CTR está abaixo de 1% — o que fazer?",
  ],
  fnt: [
    "Como configurar campanhas de atacado na Shopee?",
    "Quais keywords funcionam para pijama revenda?",
    "Como segmentar anúncios para revendedoras?",
    "Qual ROAS mínimo faz sentido para atacado?",
  ],
};

const WELCOME: Record<Account, string> = {
  feminnita:
    "Olá! Sou a Luiza, especialista em Shopee Ads — Conta A Feminnita. Cuido de Search Ads, Discovery Ads, Product Boost e campanhas sazonais para maximizar seu ROAS. O que precisa analisar hoje?",
  fnt:
    "Olá! Sou a Luiza, especialista em Shopee Ads — Conta B FNT Confecções (atacado). Atenção: esta conta ainda aguarda liberação SOPI pela Shopee. Quando liberada, focaremos em Discovery Ads para revendedoras. O que precisa planejar?",
};

export default function ShopeeLuizaPage() {
  const [, setLocation] = useLocation();
  const [account, setAccount] = useState<Account>("feminnita");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME.feminnita },
  ]);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const agentName = account === "fnt" ? "luiza_fnt" : "luiza";

  // Carrega última conversa do banco ao abrir
  const { data: conversations } = trpc.specialistChat.listConversations.useQuery(
    { agentName: agentName as any, limit: 1 },
    { staleTime: Infinity }
  );

  const lastConvId = conversations?.[0]?.id;

  const { data: savedMessages } = trpc.specialistChat.getMessages.useQuery(
    { conversationId: lastConvId! },
    { enabled: !!lastConvId && !historyLoaded }
  );

  useEffect(() => {
    if (savedMessages && savedMessages.length > 0 && !historyLoaded) {
      setMessages(savedMessages.map((m: any) => ({ role: m.role as "user" | "assistant", content: m.content })));
      setConversationId(lastConvId!);
      setHistoryLoaded(true);
    }
  }, [savedMessages, historyLoaded, lastConvId]);

  const chatMutation = trpc.shopeeLuiza.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      if (data.conversationId) setConversationId(data.conversationId);
    },
    onError: (e) => {
      toast.error("Erro ao enviar mensagem: " + e.message);
      setMessages((prev) => prev.slice(0, -1));
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function switchAccount(acc: Account) {
    setAccount(acc);
    setMessages([{ role: "assistant", content: WELCOME[acc] }]);
    setConversationId(null);
    setHistoryLoaded(false);
    setInput("");
  }

  function handleSend() {
    const text = input.trim();
    if (!text || chatMutation.isPending) return;
    const updated: Message[] = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setInput("");
    chatMutation.mutate({ messages: updated, account, conversationId: conversationId ?? undefined });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="-m-4 flex flex-col flex-1 min-h-0 bg-slate-50">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 flex-shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLocation("/marketplaces")}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img
            src={luizaPhoto}
            alt="Luiza"
            className="w-11 h-14 rounded-xl object-cover object-top border border-slate-200 flex-shrink-0 shadow-sm"
          />
          <div>
            <h1 className="text-base font-bold text-slate-900">Luiza</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs text-emerald-700 font-medium">Online</span>
              <span className="text-xs text-slate-400 ml-1">· Shopee Ads</span>
            </div>
          </div>
        </div>

        {/* Seletor de conta */}
        <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => switchAccount("feminnita")}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
              account === "feminnita"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Conta A
          </button>
          <button
            onClick={() => switchAccount("fnt")}
            className={`text-xs px-3 py-1.5 rounded-md font-medium transition-all ${
              account === "fnt"
                ? "bg-white shadow-sm text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            Conta B
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Banner */}
        <div
          className="flex items-stretch flex-shrink-0"
          style={{ background: `linear-gradient(to right, ${SHOPEE_ORANGE}, #c73d20)` }}
        >
          <div className="flex-shrink-0">
            <img
              src={luizaPhoto}
              alt="Luiza"
              className="h-44 w-32 object-cover object-top"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-4 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.5)" }}>
                Shopee Ads · {account === "fnt" ? "Conta B · FNT Atacado" : "Conta A · Feminnita"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">Luiza</h2>
            <p className="text-sm mt-1.5 leading-relaxed max-w-lg" style={{ color: "rgba(255,255,255,0.8)" }}>
              Especialista em campanhas pagas Shopee — ROAS, CPC, sazonalidade e escala
            </p>
            {account === "fnt" && (
              <span className="mt-2 text-xs px-2 py-0.5 rounded-full bg-yellow-400 text-yellow-900 font-semibold w-fit">
                ⚠ Aguardando SOPI
              </span>
            )}
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span className="text-xs text-emerald-200 font-medium">Online agora</span>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.map((msg, i) =>
            msg.role === "assistant" ? (
              <div key={i} className="mb-6">
                <div className="flex-1 bg-white border border-orange-200 rounded-2xl rounded-tl-sm px-5 py-4 text-base leading-relaxed text-slate-800 shadow-sm">
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ) : (
              <div key={i} className="flex justify-end mb-4">
                <div
                  className="max-w-[65%] rounded-2xl rounded-tr-sm px-4 py-3 text-base leading-relaxed text-slate-800 border border-[#E8E0CC]"
                  style={{ backgroundColor: "#FAF8F0" }}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            )
          )}

          {chatMutation.isPending && (
            <div className="mb-6">
              <div className="flex-1 bg-white border border-orange-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 rounded-full bg-orange-400 animate-bounce [animation-delay:300ms]" />
                  <span className="text-xs text-slate-400 ml-1">Luiza está analisando...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sugestões */}
        {messages.length <= 1 && (
          <div className="px-6 pb-2">
            <p className="text-xs text-slate-400 mb-2">Sugestões:</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS[account].map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                  className="text-xs px-3 py-1.5 rounded-full border hover:bg-orange-50 text-slate-700 transition-colors"
                  style={{ borderColor: "#EFCDC4" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div
          className="px-6 py-4 border-t border-[#E8E0CC] flex-shrink-0"
          style={{ backgroundColor: "#FAF8F0" }}
        >
          <div
            className="flex items-end gap-3 rounded-2xl border border-[#E8E0CC] px-4 py-3 focus-within:border-orange-300 focus-within:ring-2 focus-within:ring-orange-100 transition-all"
            style={{ backgroundColor: "#FAF8F0" }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Pergunte à Luiza sobre Shopee Ads ${account === "fnt" ? "(Conta B)" : "(Conta A)"}...`}
              className="flex-1 resize-none bg-transparent outline-none text-base text-slate-800 placeholder-slate-400 min-h-[24px] max-h-[160px]"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || chatMutation.isPending}
              className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all disabled:opacity-40 hover:opacity-90"
              style={{ backgroundColor: BTN_HEX }}
            >
              {chatMutation.isPending
                ? <Loader2 className="w-4 h-4 text-white animate-spin" />
                : <Send className="w-4 h-4 text-white" />
              }
            </button>
          </div>
          <p className="text-center text-xs text-slate-400 mt-2">
            Shift+Enter para nova linha · Enter para enviar
          </p>
        </div>
      </main>
    </div>
  );
}
