import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, Sparkles, Clock, TrendingUp } from "lucide-react";
import { useState } from "react";

const PRODUTOS_FEMINNITA = [
  { id: 1, nome: "Pijama Suede Rosa", preco: 89.90, url: "https://www.feminnita.com.br/pijama-suede-rosa", tamanhos: ["P", "M", "G", "GG"], descricao: "Premium em rosa claro" },
  { id: 2, nome: "Pijama Inverno Azul", preco: 94.90, url: "https://www.feminnita.com.br/pijama-inverno-azul", tamanhos: ["P", "M", "G", "GG"], descricao: "Coleção Inverno 2026" },
  { id: 3, nome: "Pijama Algodão", preco: 79.90, url: "https://www.feminnita.com.br/pijama-algodao", tamanhos: ["P", "M", "G", "GG"], descricao: "100% algodão confortável" },
  { id: 4, nome: "Pijama Inverno Vinho", preco: 94.90, url: "https://www.feminnita.com.br/pijama-inverno-vinho", tamanhos: ["P", "M", "G", "GG"], descricao: "Inverno 2026 - Vinho" },
  { id: 5, nome: "Pijama Inverno Cinza", preco: 94.90, url: "https://www.feminnita.com.br/pijama-inverno-cinza", tamanhos: ["P", "M", "G", "GG"], descricao: "Inverno 2026 - Cinza" },
  { id: 6, nome: "Pijama Inverno Preto", preco: 94.90, url: "https://www.feminnita.com.br/pijama-inverno-preto", tamanhos: ["P", "M", "G", "GG"], descricao: "Inverno 2026 - Preto" }
];

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

      setTimeout(() => {
        let respostaIA = "Obrigada pela pergunta! Estou aqui para ajudar. ";
        
        if (novaMensagem.toLowerCase().includes("pijama") || 
            novaMensagem.toLowerCase().includes("inverno") ||
            novaMensagem.toLowerCase().includes("qual")) {
          const produtoRecomendado = PRODUTOS_FEMINNITA[Math.floor(Math.random() * PRODUTOS_FEMINNITA.length)];
          respostaIA = `Ótima escolha! Recomendo nosso ${produtoRecomendado.nome} por apenas R$ ${produtoRecomendado.preco}. ${produtoRecomendado.descricao}. Confira: ${produtoRecomendado.url} 🛍️`;
        } else if (novaMensagem.toLowerCase().includes("preço")) {
          respostaIA = `Nossos pijamas variam de R$ 79,90 a R$ 94,90. Temos várias opções: Suede (R$ 89,90), Algodão (R$ 79,90) e Coleção Inverno (R$ 94,90). Qual você prefere?`;
        } else if (novaMensagem.toLowerCase().includes("tamanho")) {
          respostaIA = `Temos tamanhos P, M, G e GG. Qual é seu tamanho? Posso recomendar o melhor pijama para você!`;
        }
        
        const iaMensagem = {
          id: mensagens.length + 2,
          tipo: "ia",
          texto: respostaIA,
          hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        setMensagens(prev => [...prev, iaMensagem]);
      }, 1000);

      setNovaMensagem("");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Chat com IA - Atendimento 24/7</h2>
        <p className="text-slate-600">
          Chatbot inteligente que responde dúvidas sobre produtos, preços e promoções 24/7, com acesso ao catálogo completo da Feminnita.
        </p>
      </div>

      {/* Produtos Disponíveis */}
      <Card className="border-l-4 border-l-green-500 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Produtos Disponíveis (IA tem acesso)</CardTitle>
          <CardDescription>A IA recomenda estes produtos quando solicitado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-3">
            {PRODUTOS_FEMINNITA.map((prod) => (
              <div key={prod.id} className="border border-green-200 rounded-lg p-3 bg-white">
                <h4 className="font-bold text-slate-900 text-sm mb-1">{prod.nome}</h4>
                <p className="text-xs text-slate-600 mb-2">{prod.descricao}</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-green-600">R$ {prod.preco.toFixed(2)}</p>
                  <a href={prod.url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">Ver →</a>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Simulado */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Chat com Cliente
          </CardTitle>
          <CardDescription>Exemplo de conversa com IA (tente perguntar sobre pijamas!)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-slate-50 rounded-lg p-4 h-80 overflow-y-auto space-y-3">
            {mensagens.map((msg) => (
              <div key={msg.id} className={`flex ${msg.tipo === "cliente" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.tipo === "cliente" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-900"}`}>
                  <p className="text-sm">{msg.texto}</p>
                  <p className={`text-xs mt-1 ${msg.tipo === "cliente" ? "text-blue-100" : "text-slate-600"}`}>{msg.hora}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Input
              placeholder="Digite sua mensagem..."
              value={novaMensagem}
              onChange={(e) => setNovaMensagem(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && enviarMensagem()}
              className="flex-1"
            />
            <Button onClick={enviarMensagem} className="bg-blue-600 hover:bg-blue-700 gap-2">
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
              { categoria: "Produtos", respostas: 18, exemplo: "Qual pijama vocês têm?" },
              { categoria: "Tamanhos", respostas: 12, exemplo: "Qual é o tamanho M?" },
              { categoria: "Preços", respostas: 15, exemplo: "Qual é o preço do pijama?" },
              { categoria: "Pagamento", respostas: 8, exemplo: "Qual a melhor forma de pagar?" },
              { categoria: "Entrega", respostas: 10, exemplo: "Quanto tempo demora a entrega?" },
              { categoria: "Promoções", respostas: 14, exemplo: "Vocês têm desconto?" }
            ].map((item, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-3 hover:border-blue-300 hover:bg-blue-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-bold text-slate-900">{item.categoria}</h4>
                  <Badge className="bg-blue-600">{item.respostas}</Badge>
                </div>
                <p className="text-xs text-slate-600 italic">Ex: "{item.exemplo}"</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Métricas */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            Métricas de Engajamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-3">
            {[
              { titulo: "Mensagens", valor: "892", icon: "💬", cor: "text-blue-600" },
              { titulo: "Satisfação", valor: "94,5%", icon: "😊", cor: "text-green-600" },
              { titulo: "Conversão", valor: "22,3%", icon: "🎯", cor: "text-orange-600" },
              { titulo: "Tempo Médio", valor: "2.1min", icon: "⏱️", cor: "text-purple-600" },
              { titulo: "Disponibilidade", valor: "24/7", icon: "🔄", cor: "text-red-600" }
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

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Como Usar o Chat IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ IA responde automaticamente 24/7",
            "✅ Tem acesso ao catálogo completo de produtos",
            "✅ Envia links diretos quando cliente pede recomendação",
            "✅ Responde sobre tamanhos, preços, pagamento, entrega",
            "✅ Aprende com cada conversa e melhora respostas",
            "✅ Integra com WhatsApp, Instagram, Facebook",
            "✅ Reduz carga de atendimento em 70%",
            "✅ Aumenta conversão em 15-25%"
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">{dica}</p>
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
            { titulo: "Atendimento 24/7", descricao: "Responda clientes a qualquer hora" },
            { titulo: "Redução de Carga", descricao: "Equipe foca em vendas complexas" },
            { titulo: "Aumento de Conversão", descricao: "Recomendações personalizadas aumentam vendas" },
            { titulo: "Satisfação do Cliente", descricao: "Respostas rápidas e precisas" },
            { titulo: "Dados de Clientes", descricao: "Aprenda preferências e padrões" },
            { titulo: "Escalabilidade", descricao: "Gerencie múltiplos clientes simultaneamente" }
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
    </div>
  );
}
