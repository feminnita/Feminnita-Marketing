import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Send, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import dudaPhoto from "@/assets/duda.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function TrayDudaPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou a Duda, especialista em SEO e otimização do site Feminnita na Tray. Posso ajudar com descrições de produto, títulos otimizados, estrutura de páginas, e estratégia para aparecer nas buscas do Google e dos agentes de IA. O que você precisa hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.trayDuda.chat.useMutation({
    onSuccess: (data) => {
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    },
    onError: (e) => {
      toast.error("Erro ao enviar mensagem: " + e.message);
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = input.trim();
    if (!text || chatMutation.isPending) return;
    const updated: Message[] = [...messages, { role: "user", content: text }];
    setMessages(updated);
    setInput("");
    chatMutation.mutate({ messages: updated });
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar — foto grande vertical */}
      <div className="hidden md:flex w-44 flex-shrink-0 flex-col items-center py-6 px-3 border-r bg-gray-50">
        <img
          src={dudaPhoto}
          alt="Duda"
          className="w-36 h-52 rounded-2xl object-cover object-top shadow-md"
        />
        <h2 className="mt-3 font-semibold text-gray-900 text-sm text-center">Duda</h2>
        <p className="text-xs text-gray-500 text-center mt-0.5 leading-tight">SEO & Otimização<br/>Site Tray</p>
        <div className="mt-3 flex flex-col items-center gap-1">
          <div className="flex items-center gap-1">
            <Search className="w-3 h-3 text-emerald-500" />
            <span className="text-xs text-emerald-600 font-medium">SEO</span>
          </div>
          <span className="text-xs text-gray-400">Neil Patel · Backlinko</span>
        </div>
        <div className="mt-auto text-xs text-center text-gray-400 leading-tight">
          Acessa o site<br/>em tempo real
        </div>
      </div>

      {/* Chat area */}
      <div className="flex flex-col flex-1 min-w-0 p-4">
        {/* Mobile header */}
        <div className="flex md:hidden items-center gap-3 mb-4 pb-4 border-b">
          <img src={dudaPhoto} alt="Duda" className="w-10 h-10 rounded-full object-cover" />
          <div>
            <h1 className="font-semibold text-gray-900">Duda — SEO & Site Tray</h1>
            <p className="text-xs text-gray-500">Especialista em otimização da loja Feminnita</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <img src={dudaPhoto} alt="Duda" className="w-7 h-7 rounded-full object-cover mr-2 mt-1 shrink-0" />
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                  msg.role === "user"
                    ? "bg-emerald-600 text-white rounded-tr-sm"
                    : "bg-gray-100 text-gray-800 rounded-tl-sm"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex justify-start">
              <img src={dudaPhoto} alt="Duda" className="w-7 h-7 rounded-full object-cover mr-2 shrink-0" />
              <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="mt-4 flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Analise a home do site e me diga o que otimizar primeiro..."
            className="resize-none min-h-[60px] max-h-[160px]"
            rows={2}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || chatMutation.isPending}
            className="bg-emerald-600 hover:bg-emerald-700 h-[60px] px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
