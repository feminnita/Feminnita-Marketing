import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Send, Loader2, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import anyPhoto from "@/assets/any.jpg";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function TrayAnyPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou a Any, especialista em programa de afiliadas da Feminnita na Tray. Posso ajudar a estruturar comissões, recrutar afiliadas, criar materiais de suporte e monitorar performance. O que você precisa hoje?",
    },
  ]);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const chatMutation = trpc.trayAny.chat.useMutation({
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
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-4xl mx-auto p-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b">
        <img src={anyPhoto} alt="Any" className="w-10 h-10 rounded-full object-cover" />
        <div>
          <h1 className="font-semibold text-gray-900">Any — Afiliadas Tray</h1>
          <p className="text-xs text-gray-500">Especialista em programa de afiliadas Feminnita</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Link className="w-3.5 h-3.5 text-violet-500" />
          <span className="text-xs text-violet-600 font-medium">Comissões · Recrutamento · Performance</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "assistant" && (
              <img src={anyPhoto} alt="Any" className="w-7 h-7 rounded-full object-cover mr-2 mt-1 shrink-0" />
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                msg.role === "user"
                  ? "bg-violet-600 text-white rounded-tr-sm"
                  : "bg-gray-100 text-gray-800 rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {chatMutation.isPending && (
          <div className="flex justify-start">
            <img src={anyPhoto} alt="Any" className="w-7 h-7 rounded-full object-cover mr-2 shrink-0" />
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader2 className="w-4 h-4 animate-spin text-violet-500" />
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
          placeholder="Ex: Como estruturo as comissões do programa de afiliadas?"
          className="resize-none min-h-[60px] max-h-[160px]"
          rows={2}
        />
        <Button
          onClick={handleSend}
          disabled={!input.trim() || chatMutation.isPending}
          className="bg-violet-600 hover:bg-violet-700 h-[60px] px-4"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
