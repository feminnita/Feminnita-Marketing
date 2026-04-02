import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Sparkles } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";

interface Mensagem {
  id: number;
  tipo: "cliente" | "ia";
  texto: string;
  hora: string;
}

const PHONE_SIMULADO = "demo-chat-ui";

export default function ChatIASection() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([
    {
      id: 1,
      tipo: "ia",
      texto: "Olá! Sou a assistente virtual da Feminnita Pijamas. Como posso te ajudar hoje? 😊",
      hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [novaMensagem, setNovaMensagem] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const processMessage = trpc.aiCustomerSupport.processMessage.useMutation({
    onSuccess: (data) => {
      const iaMensagem: Mensagem = {
        id: Date.now(),
        tipo: "ia",
        texto: data.response as string,
        hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMensagens((prev) => [...prev, iaMensagem]);
    },
    onError: () => {
      const errMensagem: Mensagem = {
        id: Date.now(),
        tipo: "ia",
        texto: "Desculpe, tive um problema técnico. Tente novamente em instantes.",
        hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      };
      setMensagens((prev) => [...prev, errMensagem]);
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensagens]);

  const enviarMensagem = () => {
    const texto = novaMensagem.trim();
    if (!texto || processMessage.isPending) return;

    const clienteMensagem: Mensagem = {
      id: Date.now(),
      tipo: "cliente",
      texto,
      hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
    };

    const contexto = mensagens.map((m) => ({
      role: m.tipo === "cliente" ? ("user" as const) : ("assistant" as const),
      content: m.texto,
    }));

    setMensagens((prev) => [...prev, clienteMensagem]);
    setNovaMensagem("");

    processMessage.mutate({
      whatsappPhoneNumber: PHONE_SIMULADO,
      whatsappContactName: "Demo UI",
      userMessage: texto,
      conversationContext: contexto,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Chat com IA - Atendimento 24/7</h2>
        <p className="text-slate-600">
          Chatbot inteligente que responde dúvidas sobre produtos, preços e promoções 24/7, com acesso ao catálogo completo da Feminnita.
        </p>
      </div>

      {/* Chat */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Chat com Cliente
          </CardTitle>
          <CardDescription>Teste a IA de atendimento ao vivo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div ref={scrollRef} className="bg-slate-50 rounded-lg p-4 h-80 overflow-y-auto space-y-3">
            {mensagens.map((msg) => (
              <div key={msg.id} className={`flex ${msg.tipo === "cliente" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.tipo === "cliente" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-900"}`}>
                  <p className="text-sm">{msg.texto}</p>
                  <p className={`text-xs mt-1 ${msg.tipo === "cliente" ? "text-blue-100" : "text-slate-600"}`}>{msg.hora}</p>
                </div>
              </div>
            ))}
            {processMessage.isPending && (
              <div className="flex justify-start">
                <div className="bg-slate-200 text-slate-500 px-4 py-2 rounded-lg text-sm animate-pulse">
                  Digitando...
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
              className="flex-1"
              disabled={processMessage.isPending}
            />
            <Button
              onClick={enviarMensagem}
              disabled={processMessage.isPending || !novaMensagem.trim()}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Send className="w-4 h-4" />
              Enviar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Perguntas Frequentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perguntas Frequentes que a IA Responde</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { categoria: "Produtos", exemplo: "Qual pijama vocês têm?" },
              { categoria: "Tamanhos", exemplo: "Qual é o tamanho M?" },
              { categoria: "Preços", exemplo: "Qual é o preço do pijama?" },
              { categoria: "Pagamento", exemplo: "Qual a melhor forma de pagar?" },
              { categoria: "Entrega", exemplo: "Quanto tempo demora a entrega?" },
              { categoria: "Promoções", exemplo: "Vocês têm desconto?" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="border border-slate-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition cursor-pointer"
                onClick={() => setNovaMensagem(item.exemplo)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-slate-900">{item.categoria}</h4>
                </div>
                <p className="text-xs text-slate-600 italic">"{item.exemplo}"</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Como Funciona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="text-sm space-y-2 text-slate-700">
            <li>• <strong>Base de conhecimento</strong> treinada com seus produtos e FAQs</li>
            <li>• <strong>Contexto de conversa</strong> mantido entre mensagens</li>
            <li>• <strong>Escalação automática</strong> quando o cliente solicita humano</li>
            <li>• <strong>Histórico salvo</strong> no banco para análise e melhoria</li>
            <li>• <strong>Treine a IA</strong> na aba "Treinamento IA" com exemplos reais</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
