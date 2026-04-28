import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Globe, Loader2, Send } from "lucide-react";
import dudaPhoto from "@/assets/duda.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const BANNER_FROM = "#6B1030";
const BANNER_TO = "#7B1040";
const BTN_HEX = "#6B1D28";

const SUGGESTIONS = [
  "Analise a home do site e me diga o que otimizar primeiro",
  "Como melhorar o SEO das fichas de produto?",
  "Quais palavras-chave devo priorizar agora?",
  "Como aparecer nas buscas de IA como ChatGPT?",
];

export default function TrayDudaPage() {
  const [, setLocation] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Olá! Sou a Duda, especialista em SEO e otimização do site Feminnita na Tray. Posso ajudar com descrições de produto, títulos otimizados, estrutura de páginas e estratégia para aparecer nas buscas do Google e dos agentes de IA. O que você precisa hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const chatMutation = trpc.trayDuda.chat.useMutation({
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

  function handleSend() {
    const text = input.trim();
    if (!text || chatMutation.isPending) return;
    const updated: Message[] = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setInput("");
    chatMutation.mutate({ messages: updated });
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
            onClick={() => setLocation("/equipe-marketing")}
            className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img
            src={dudaPhoto}
            alt="Duda"
            className="w-11 h-14 rounded-xl object-cover object-top border border-slate-200 flex-shrink-0 shadow-sm"
          />
          <div>
            <h1 className="text-base font-bold text-slate-900">Duda</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs text-emerald-700 font-medium">Online</span>
              <span className="text-xs text-slate-400 ml-1">· SEO & Otimização Site Tray</span>
              <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 flex items-center gap-0.5">
                <Globe className="w-2.5 h-2.5" /> Web search
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Banner */}
        <div
          className="flex items-stretch flex-shrink-0"
          style={{ background: `linear-gradient(to right, ${BANNER_FROM}, ${BANNER_TO})` }}
        >
          <div className="flex-shrink-0">
            <img
              src={dudaPhoto}
              alt="Duda"
              className="h-44 w-32 object-cover object-top"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-4 flex-1">
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: "rgba(255,255,255,0.5)" }}>
              SEO & Otimização Site Tray
            </p>
            <h2 className="text-2xl font-bold text-white leading-tight">Duda</h2>
            <p className="text-sm mt-1.5 leading-relaxed max-w-lg" style={{ color: "rgba(255,255,255,0.75)" }}>
              Especialista em otimização da loja Feminnita para buscas do Google e IA
            </p>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span className="text-xs text-emerald-300 font-medium">Online agora</span>
              <span className="ml-2 flex items-center gap-1 text-xs text-green-300">
                <Globe className="w-3 h-3" /> Web search ativo
              </span>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.map((msg, i) =>
            msg.role === "assistant" ? (
              <div key={i} className="mb-6">
                <div className="flex items-start gap-2 w-full">
                  <div className="flex-1 bg-white border border-rose-200 rounded-2xl rounded-tl-sm px-5 py-4 text-base leading-relaxed text-slate-800 shadow-sm">
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
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
              <div className="flex items-start gap-2 w-full">
                <div className="flex-1 bg-white border border-rose-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce [animation-delay:300ms]" />
                    <span className="text-xs text-slate-400 ml-1">buscando na web...</span>
                  </div>
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
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                  className="text-xs px-3 py-1.5 rounded-full border hover:bg-rose-50 text-slate-700 transition-colors"
                  style={{ borderColor: "#DDD0D2" }}
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
            className="flex items-end gap-3 rounded-2xl border border-[#E8E0CC] px-4 py-3 focus-within:border-rose-300 focus-within:ring-2 focus-within:ring-rose-100 transition-all"
            style={{ backgroundColor: "#FAF8F0" }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte à Duda... (Enter para enviar)"
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
            Shift+Enter para nova linha · Enter para enviar · A agente acessa o site em tempo real
          </p>
        </div>
      </main>
    </div>
  );
}
