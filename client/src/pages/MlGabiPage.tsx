import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Send } from "lucide-react";
import gabiPhoto from "@/assets/gabi.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Account = "feminnita" | "fnt";

const ML_YELLOW = "#FFD100";
const ML_DARK = "#1a1a2e";
const BTN_HEX = "#6B1D28";

const SUGGESTIONS: Record<Account, string[]> = {
  feminnita: [
    "Quais atributos estão faltando nos meus anúncios de pijama?",
    "Como otimizar o título para aparecer mais nas buscas do ML?",
    "O que é catálogo compartilhado e como me proteger?",
    "Quais fichas de produto preciso preencher com urgência?",
  ],
  fnt: [
    "Como estruturar os anúncios de atacado no ML?",
    "Quais atributos são obrigatórios para kits de pijama?",
    "Como destacar que é venda no atacado na ficha?",
    "Como o GTIN afeta meus anúncios na Conta B?",
  ],
};

const WELCOME: Record<Account, string> = {
  feminnita:
    "Olá! Sou a Gabi — Conta A Feminnita. Cuido dos anúncios e das campanhas de Product Ads do Mercado Livre. Posso listar seus anúncios, auditar fichas, ajustar preços e estoque, gerenciar campanhas de Ads e muito mais. O que precisa hoje?",
  fnt:
    "Olá! Sou a Gabi — Conta B FNT Confecções (atacado). Cuido dos anúncios e campanhas de Product Ads do Mercado Livre para revendedoras. O que precisa hoje?",
};

const STORAGE_KEY = (acc: Account) => `gabi_messages_${acc}`;

function loadMessages(acc: Account): Message[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY(acc));
    if (saved) {
      const parsed = JSON.parse(saved) as Message[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return [{ role: "assistant", content: WELCOME[acc] }];
}

export default function MlGabiPage() {
  const [, setLocation] = useLocation();
  const [account, setAccount] = useState<Account>("feminnita");
  const [messages, setMessages] = useState<Message[]>(() => loadMessages("feminnita"));
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY(account), JSON.stringify(messages));
    } catch {}
  }, [messages, account]);

  const chatMutation = trpc.mlGabi.chat.useMutation({
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
    setMessages(loadMessages(acc));
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

  return (
    <div className="-m-4 flex flex-col flex-1 min-h-0" style={{ backgroundColor: "#FAF6EE" }}>
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
            src={gabiPhoto}
            alt="Gabi"
            className="w-11 h-14 rounded-xl object-cover object-top border border-slate-200 flex-shrink-0 shadow-sm"
          />
          <div>
            <h1 className="text-base font-bold text-slate-900">Gabi</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs text-emerald-700 font-medium">Online</span>
              <span className="text-xs text-slate-400 ml-1">· ML Ads & Anúncios</span>
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
          style={{ background: `linear-gradient(to right, ${ML_DARK}, #16213e)` }}
        >
          <div className="flex-shrink-0">
            <img
              src={gabiPhoto}
              alt="Gabi"
              className="h-44 w-32 object-cover object-top"
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            />
          </div>
          <div className="flex flex-col justify-center px-6 py-4 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ backgroundColor: ML_YELLOW, color: ML_DARK }}
              >
                Mercado Livre
              </span>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>
                {account === "fnt" ? "Conta B · FNT Atacado" : "Conta A · Feminnita"}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">Gabi</h2>
            <p className="text-sm mt-1.5 leading-relaxed max-w-lg" style={{ color: "rgba(255,255,255,0.7)" }}>
              Anúncios, fichas de produto e campanhas de Ads no Mercado Livre
            </p>
            <div className="flex items-center gap-1.5 mt-3">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
              <span className="text-xs text-emerald-300 font-medium">Online agora</span>
            </div>
          </div>
        </div>

        {/* Mensagens */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.map((msg, i) =>
            msg.role === "assistant" ? (
              <div key={i} className="mb-6">
                <div className="flex items-start gap-2 w-full">
                  <div className="flex-1 bg-white border border-yellow-200 rounded-2xl rounded-tl-sm px-5 py-4 text-base leading-relaxed text-slate-800 shadow-sm">
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
                <div className="flex-1 bg-white border border-yellow-200 rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce [animation-delay:0ms]" />
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce [animation-delay:150ms]" />
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-bounce [animation-delay:300ms]" />
                    <span className="text-xs text-slate-400 ml-1">Gabi está analisando...</span>
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
              {SUGGESTIONS[account].map((s) => (
                <button
                  key={s}
                  onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                  className="text-xs px-3 py-1.5 rounded-full border hover:bg-yellow-50 text-slate-700 transition-colors"
                  style={{ borderColor: "#E5D080" }}
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
            className="flex items-end gap-3 rounded-2xl border border-[#E8E0CC] px-4 py-3 focus-within:border-yellow-300 focus-within:ring-2 focus-within:ring-yellow-100 transition-all"
            style={{ backgroundColor: "#FAF8F0" }}
          >
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                const el = e.target;
                el.style.height = "auto";
                el.style.height = Math.min(el.scrollHeight, 160) + "px";
              }}
              onKeyDown={handleKeyDown}
              placeholder={`Pergunte à Gabi sobre anúncios ou Ads ${account === "fnt" ? "(Conta B)" : "(Conta A)"}...`}
              className="flex-1 resize-none bg-transparent outline-none text-base text-slate-800 placeholder-slate-400"
              style={{ minHeight: 24, maxHeight: 160, overflowY: "auto" }}
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
