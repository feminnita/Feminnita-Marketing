import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Send } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Account = "feminnita" | "fnt";

const SHEIN_PINK = "#FF2D55";
const BTN_HEX = "#8B0000";

const SUGGESTIONS: Record<Account, string[]> = {
  feminnita: [
    "Como melhorar a visibilidade dos meus produtos no algoritmo Shein?",
    "Quais produtos devo colocar na próxima Flash Sale?",
    "Minha taxa de retorno está alta — o que fazer?",
    "Como preparar o catálogo para a Black Friday na Shein?",
  ],
  fnt: [
    "Como posicionar pijamas de atacado na Shein para revendedoras?",
    "Qual estratégia de precificação para a conta FNT na Shein?",
    "Como aumentar o GMV mensal da conta FNT?",
    "Quais produtos têm maior potencial de giro para atacado na Shein?",
  ],
};

const WELCOME: Record<Account, string> = {
  feminnita:
    "Olá! Sou a Isabela, especialista em Shein — Conta Feminnita (B2C). Monitoro visibilidade, taxas de conversão, promoções e saúde do catálogo. As duas contas estão ativas há mais de 2 anos. O que precisa analisar hoje?",
  fnt:
    "Olá! Sou a Isabela, especialista em Shein — Conta FNT Confecções (atacado B2B). Foco em volume, giro de estoque e posicionamento para revendedoras. O que precisamos trabalhar?",
};

export default function SheinIsabelaPage() {
  const [, setLocation] = useLocation();
  const [account, setAccount] = useState<Account>("feminnita");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: WELCOME.feminnita },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chatMutation = trpc.sheinIsabela.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
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
    setInput("");
  }

  function handleSend() {
    const text = input.trim();
    if (!text || chatMutation.isPending) return;
    const updated: Message[] = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setInput("");
    chatMutation.mutate({ messages: updated, account });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const isLoading = chatMutation.isPending;

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-slate-50">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200 shrink-0">
        <button
          onClick={() => setLocation("/")}
          className="p-1.5 rounded-md hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 text-slate-600" />
        </button>

        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ background: SHEIN_PINK }}
        >
          IS
        </div>

        <div className="flex-1 min-w-0">
          <div className="font-semibold text-slate-800 text-sm">Isabela</div>
          <div className="text-xs text-slate-500">Especialista Shein</div>
        </div>

        {/* Account switcher */}
        <div className="flex gap-1">
          {(["feminnita", "fnt"] as Account[]).map((acc) => (
            <button
              key={acc}
              onClick={() => switchAccount(acc)}
              className="px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
              style={
                account === acc
                  ? { background: SHEIN_PINK, color: "#fff" }
                  : { background: "#f1f5f9", color: "#64748b" }
              }
            >
              {acc === "feminnita" ? "Feminnita" : "FNT"}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
                style={{ background: SHEIN_PINK }}
              >
                IS
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-slate-800 text-white rounded-tr-sm"
                  : "bg-white text-slate-800 shadow-sm rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5"
              style={{ background: SHEIN_PINK }}
            >
              IS
            </div>
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggestions */}
      {messages.length === 1 && !isLoading && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS[account].map((s) => (
            <button
              key={s}
              onClick={() => {
                const updated: Message[] = [...messages, { role: "user", content: s }];
                setMessages(updated);
                chatMutation.mutate({ messages: updated, account });
              }}
              className="text-xs px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:border-pink-300 hover:text-pink-700 transition-colors text-slate-600"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 pt-2 bg-white border-t border-slate-200 shrink-0">
        <div className="flex gap-2 items-end">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pergunte sobre Shein..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-200 max-h-32 overflow-y-auto"
            style={{ minHeight: "40px" }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2.5 rounded-xl text-white transition-colors disabled:opacity-40"
            style={{ background: isLoading || !input.trim() ? "#94a3b8" : BTN_HEX }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
