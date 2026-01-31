import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Sparkles, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function ChatIASection() {
  const [mensagens, setMensagens] = useState([
    {
      id: 1,
      tipo: "cliente",
      texto: "Qual é o tamanho M?",
      hora: "14:30"
    },
    {
      id: 2,
      tipo: "ia",
      texto: "Ótima pergunta! O tamanho M (Médio) é ideal para pessoas com altura entre 1,60m e 1,75m. Temos pijamas em Suede, Algodão e Inverno. Qual você prefere? 😊",
      hora: "14:30"
    },
    {
      id: 3,
      tipo: "cliente",
      texto: "Qual a melhor forma de pagar?",
      hora: "14:31"
    },
    {
      id: 4,
      tipo: "ia",
      texto: "Aceitamos várias formas de pagamento: 💳 Cartão de Crédito (até 12x), 💰 PIX (à vista com 5% OFF), 🏦 Transferência Bancária e 📱 WhatsApp Pay. Qual você prefere?",
      hora: "14:31"
    },
    {
      id: 5,
      tipo: "cliente",
      texto: "Vocês têm pijama de inverno?",
      hora: "14:32"
    },
    {
      id: 6,
      tipo: "ia",
      texto: "Sim! Temos a Coleção Inverno 2026 com 4 cores exclusivas: Azul Marinho, Cinza, Vinho e Preto. Todos com tecido premium e conforto máximo. Quer ver as opções? 🔗",
      hora: "14:32"
    }
  ]);

  const [novaMensagem, setNovaMensagem] = useState("");

  const enviarMensagem = () => {
    if (novaMensagem.trim()) {
      const clienteMensagem = {
        id: mensagens.length + 1,
        tipo: "cliente",
        texto: novaMensagem,
        hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      };

      setMensagens([...mensagens, clienteMensagem]);

      // Simular resposta da IA
      setTimeout(() => {
        const iaMensagem = {
          id: mensagens.length + 2,
          tipo: "ia",
          texto: "Obrigada pela pergunta! Estou aqui para ajudar. Você pode me perguntar sobre tamanhos, preços, promoções, formas de pagamento ou qualquer dúvida sobre nossos pijamas. 😊",
          hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        setMensagens(prev => [...prev, iaMensagem]);
      }, 1000);

      setNovaMensagem("");
    }
  };

  const [metricas] = useState({
    mensagensRespondidas: 892,
    tempoMedioResposta: "1.2s",
    taxaSatisfacao: 94.5,
    conversaoChat: 22.3,
    horarioOperacao: "24/7"
  });

  const [perguntasFrequentes] = useState([
    {
      pergunta: "Qual é o tamanho M?",
      resposta: "O tamanho M é ideal para pessoas com altura entre 1,60m e 1,75m",
      frequencia: 245
    },
    {
      pergunta: "Qual a melhor forma de pagar?",
      resposta: "Aceitamos Cartão, PIX, Transferência e WhatsApp Pay",
      frequencia: 189
    },
    {
      pergunta: "Vocês têm pijama de inverno?",
      resposta: "Sim! Coleção Inverno 2026 com 4 cores exclusivas",
      frequencia: 156
    },
    {
      pergunta: "Qual é o preço?",
      resposta: "Preço varia de R$ 49,90 a R$ 94,90 conforme modelo",
      frequencia: 134
    },
    {
      pergunta: "Qual a garantia?",
      resposta: "Garantia de 1 ano contra defeitos de fabricação",
      frequencia: 98
    },
    {
      pergunta: "Como rastrear pedido?",
      resposta: "Enviaremos link de rastreamento por WhatsApp/Email",
      frequencia: 87
    }
  ]);

  const [respostas] = useState([
    {
      categoria: "Tamanhos",
      respostas: 12,
      exemplo: "Qual é o tamanho M?"
    },
    {
      categoria: "Preços",
      respostas: 8,
      exemplo: "Qual é o preço do pijama?"
    },
    {
      categoria: "Pagamento",
      respostas: 7,
      exemplo: "Qual a melhor forma de pagar?"
    },
    {
      categoria: "Produtos",
      respostas: 15,
      exemplo: "Vocês têm pijama de inverno?"
    },
    {
      categoria: "Entrega",
      respostas: 6,
      exemplo: "Quanto tempo demora a entrega?"
    },
    {
      categoria: "Promoções",
      respostas: 5,
      exemplo: "Vocês têm desconto?"
    }
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Chat com IA 24/7</h2>
        <p className="text-slate-600">
          Adicione chatbot inteligente que responde dúvidas sobre produtos, preços e promoções 24/7, reduzindo carga de atendimento.
        </p>
      </div>

      {/* Chat Simulado */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Chat com Cliente
          </CardTitle>
          <CardDescription>Exemplo de conversa com IA</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4 space-y-3 h-80 overflow-y-auto">
            {mensagens.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex ${msg.tipo === "cliente" ? "justify-end" : "justify-start"}`}
              >
                <div 
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.tipo === "cliente" 
                      ? "bg-blue-600 text-white rounded-br-none" 
                      : "bg-white border border-slate-200 text-slate-900 rounded-bl-none"
                  }`}
                >
                  <p className="text-sm">{msg.texto}</p>
                  <p className={`text-xs mt-1 ${msg.tipo === "cliente" ? "text-blue-100" : "text-slate-500"}`}>
                    {msg.hora}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input 
              placeholder="Digite sua pergunta..."
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && enviarMensagem()}
            />
            <Button 
              onClick={enviarMensagem}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Send className="w-4 h-4" />
              Enviar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Métricas */}
      <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-lg">Métricas do Chat IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-3">
            {[
              { titulo: "Respondidas", valor: metricas.mensagensRespondidas, icon: "✅", cor: "text-green-600" },
              { titulo: "Tempo Médio", valor: metricas.tempoMedioResposta, icon: "⏱️", cor: "text-orange-600" },
              { titulo: "Satisfação", valor: `${metricas.taxaSatisfacao}%`, icon: "😊", cor: "text-yellow-600" },
              { titulo: "Conversão", valor: `${metricas.conversaoChat}%`, icon: "🎯", cor: "text-purple-600" },
              { titulo: "Operação", valor: metricas.horarioOperacao, icon: "🕐", cor: "text-blue-600" }
            ].map((item, idx) => (
              <div key={idx} className="text-center p-3 bg-white rounded-lg border border-slate-200">
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{item.titulo}</p>
                <p className={`text-lg font-bold ${item.cor}`}>{item.valor}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Perguntas Frequentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Perguntas Mais Frequentes</CardTitle>
          <CardDescription>Dúvidas que a IA responde automaticamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {perguntasFrequentes.map((pf, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">❓ {pf.pergunta}</h4>
                  <p className="text-xs text-slate-600 mt-1">💬 {pf.resposta}</p>
                </div>
                <Badge variant="outline">{pf.frequencia}x</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Categorias de Respostas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Categorias de Respostas Automáticas
          </CardTitle>
          <CardDescription>Tópicos que a IA domina</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {respostas.map((cat, idx) => (
            <div key={idx} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-slate-900">{cat.categoria}</h4>
                  <p className="text-xs text-slate-600 mt-1">Ex: "{cat.exemplo}"</p>
                </div>
                <Badge className="bg-purple-600">{cat.respostas} respostas</Badge>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full bg-purple-600"
                  style={{ width: `${(cat.respostas / 15) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Configurações da IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { titulo: "Disponibilidade", valor: "24/7 (sempre ativa)", icon: "🕐" },
            { titulo: "Tempo de Resposta", valor: "Menos de 2 segundos", icon: "⚡" },
            { titulo: "Idiomas", valor: "Português, Inglês, Espanhol", icon: "🌍" },
            { titulo: "Plataformas", valor: "WhatsApp, Instagram, Website", icon: "📱" },
            { titulo: "Taxa de Acerto", valor: "94,5% de satisfação", icon: "✅" },
            { titulo: "Escalabilidade", valor: "Atende ilimitados clientes", icon: "📈" }
          ].map((config, idx) => (
            <div key={idx} className="flex items-start gap-3 p-3 bg-white border border-blue-200 rounded">
              <span className="text-2xl">{config.icon}</span>
              <div>
                <p className="font-semibold text-slate-900">{config.titulo}</p>
                <p className="text-xs text-slate-600">{config.valor}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Benefícios Esperados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { titulo: "Redução de Atendimento", descricao: "Economiza 15-20 horas/semana de atendimento manual" },
            { titulo: "Aumento de Conversão", descricao: "+15-25% em taxa de conversão de chat" },
            { titulo: "Satisfação do Cliente", descricao: "Resposta imediata 24/7 aumenta satisfação" },
            { titulo: "Coleta de Dados", descricao: "Aprende preferências de clientes automaticamente" },
            { titulo: "Escalabilidade", descricao: "Atende ilimitados clientes simultaneamente" },
            { titulo: "Custo Reduzido", descricao: "Reduz custo de atendimento em 60-70%" }
          ].map((beneficio, idx) => (
            <div key={idx} className="flex gap-3 p-3 border border-green-200 rounded bg-white">
              <span className="text-lg">✨</span>
              <div>
                <p className="font-semibold text-slate-900">{beneficio.titulo}</p>
                <p className="text-xs text-slate-600">{beneficio.descricao}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para Máxima Eficiência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ Treine a IA com perguntas frequentes do seu negócio",
            "✅ Atualize respostas conforme novos produtos/promoções",
            "✅ Monitore conversas para identificar lacunas",
            "✅ Integre com CRM para personalizar respostas",
            "✅ Use dados do chat para melhorar marketing",
            "✅ Teste diferentes tons de voz (formal, casual, amigável)",
            "✅ Configure escalação para atendente humano quando necessário",
            "✅ Analise satisfação do cliente regularmente"
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">{dica}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
