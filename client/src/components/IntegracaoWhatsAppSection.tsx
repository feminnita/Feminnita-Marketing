import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MessageCircle, CheckCircle, AlertCircle, TrendingUp, Send } from "lucide-react";
import { useState } from "react";

export default function IntegracaoWhatsAppSection() {
  const [whatsappConectado, setWhatsappConectado] = useState(false);
  const [numeroWhatsapp, setNumeroWhatsapp] = useState("(47) 99623-3764");
  const [tokenAPI, setTokenAPI] = useState("");

  const [automacoes, setAutomacoes] = useState([
    {
      id: 1,
      titulo: "Confirmação de Compra",
      descricao: "Envie mensagem automática após compra confirmada",
      ativo: true,
      template: "Obrigada pela compra! 🎉 Seu pedido #{orderId} foi confirmado. Acompanhe em: {link}",
      gatilho: "Compra confirmada"
    },
    {
      id: 2,
      titulo: "Carrinho Abandonado",
      descricao: "Lembre cliente sobre itens no carrinho após 2 horas",
      ativo: true,
      template: "Oi! Você deixou {itemCount} itens no carrinho. Aproveita e finaliza a compra: {link}",
      gatilho: "2 horas após abandono"
    },
    {
      id: 3,
      titulo: "Promoção Flash",
      descricao: "Envie promoção exclusiva para clientes VIP",
      ativo: false,
      template: "🔥 PROMOÇÃO EXCLUSIVA! 40% OFF em Pijamas Suede. Válido por 24h: {link}",
      gatilho: "Manual ou agendado"
    },
    {
      id: 4,
      titulo: "Feedback de Compra",
      descricao: "Peça avaliação após 7 dias da compra",
      ativo: true,
      template: "Como foi sua compra? Deixe sua avaliação e ganhe 10% OFF na próxima: {link}",
      gatilho: "7 dias após compra"
    },
    {
      id: 5,
      titulo: "Reabastecimento de Estoque",
      descricao: "Notifique clientes quando produto volta ao estoque",
      ativo: false,
      template: "Bom dia! O pijama {productName} que você procurava voltou ao estoque: {link}",
      gatilho: "Produto disponível"
    },
    {
      id: 6,
      titulo: "Aniversário",
      descricao: "Envie desconto especial no dia do aniversário",
      ativo: true,
      template: "Feliz Aniversário! 🎂 Ganhe 15% OFF em sua compra hoje: {link}",
      gatilho: "Data de aniversário"
    }
  ]);

  const [conversas, setConversas] = useState([
    {
      id: 1,
      cliente: "Maria Silva",
      ultimaMensagem: "Qual o tamanho M?",
      data: "2026-01-31 14:30",
      status: "pendente",
      avatar: "👩"
    },
    {
      id: 2,
      cliente: "João Santos",
      ultimaMensagem: "Chegou meu pedido!",
      data: "2026-01-31 13:15",
      status: "respondido",
      avatar: "👨"
    },
    {
      id: 3,
      cliente: "Ana Costa",
      ultimaMensagem: "Qual a melhor forma de pagar?",
      data: "2026-01-31 12:00",
      status: "pendente",
      avatar: "👩"
    },
    {
      id: 4,
      cliente: "Carlos Oliveira",
      ultimaMensagem: "Obrigado! Muito bom!",
      data: "2026-01-31 11:45",
      status: "respondido",
      avatar: "👨"
    }
  ]);

  const [metricas] = useState({
    mensagensEnviadas: 1245,
    mensagensRecebidas: 892,
    taxaResposta: 71.6,
    tempoMedioResposta: "2.3 min",
    conversaoCarrinho: 18.5,
    receita: 12540
  });

  const conectarWhatsApp = () => {
    if (tokenAPI.trim()) {
      setWhatsappConectado(true);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Integração WhatsApp Business</h2>
        <p className="text-slate-600">
          Envie mensagens automáticas quando clientes completam compra ou para follow-up de carrinho abandonado, aumentando conversão em 15-25%.
        </p>
      </div>

      {/* Conexão WhatsApp */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            Conectar WhatsApp Business
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!whatsappConectado ? (
            <>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Número WhatsApp</label>
                <Input 
                  placeholder="(47) 99623-3764"
                  value={numeroWhatsapp}
                  onChange={(e) => setNumeroWhatsapp(e.target.value)}
                  className="mb-2"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Token API (Meta)</label>
                <Input 
                  placeholder="EAABs..."
                  value={tokenAPI}
                  onChange={(e) => setTokenAPI(e.target.value)}
                  type="password"
                  className="mb-2"
                />
              </div>
              <Button 
                onClick={conectarWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                Conectar WhatsApp
              </Button>
              <div className="p-3 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                <p className="font-semibold mb-1">Como obter Token:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Acesse developers.facebook.com</li>
                  <li>Crie um app e configure WhatsApp</li>
                  <li>Gere token de acesso permanente</li>
                  <li>Cole aqui e conecte</li>
                </ol>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded">
              <div>
                <p className="font-semibold text-green-900">✅ Conectado</p>
                <p className="text-xs text-green-700">{numeroWhatsapp}</p>
              </div>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => {
                  setWhatsappConectado(false);
                  setTokenAPI("");
                }}
              >
                Desconectar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Métricas */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="text-lg">Métricas de WhatsApp</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-6 gap-3">
            {[
              { titulo: "Enviadas", valor: metricas.mensagensEnviadas, icon: "📤", cor: "text-blue-600" },
              { titulo: "Recebidas", valor: metricas.mensagensRecebidas, icon: "📥", cor: "text-green-600" },
              { titulo: "Taxa Resposta", valor: `${metricas.taxaResposta}%`, icon: "💬", cor: "text-purple-600" },
              { titulo: "Tempo Médio", valor: metricas.tempoMedioResposta, icon: "⏱️", cor: "text-orange-600" },
              { titulo: "Conversão", valor: `${metricas.conversaoCarrinho}%`, icon: "🎯", cor: "text-red-600" },
              { titulo: "Receita", valor: `R$ ${metricas.receita.toLocaleString()}`, icon: "💰", cor: "text-green-600" }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{item.titulo}</p>
                <p className={`text-lg font-bold ${item.cor}`}>{item.valor}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Automações Configuradas</CardTitle>
          <CardDescription>Mensagens automáticas por gatilho</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {automacoes.map((auto) => (
            <div key={auto.id} className={`border-2 rounded-lg p-4 ${auto.ativo ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{auto.titulo}</h4>
                  <p className="text-xs text-slate-600">{auto.descricao}</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={auto.ativo}
                  onChange={() => {
                    setAutomacoes(automacoes.map(a => 
                      a.id === auto.id ? { ...a, ativo: !a.ativo } : a
                    ));
                  }}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>

              <div className="mb-3 p-3 bg-white border border-slate-200 rounded text-xs">
                <p className="text-slate-600 mb-1"><strong>Template:</strong></p>
                <p className="text-slate-700 italic">{auto.template}</p>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs">
                  🔔 {auto.gatilho}
                </Badge>
                <Button size="sm" variant="outline">Editar</Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Conversas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conversas Recentes</CardTitle>
          <CardDescription>Últimas mensagens de clientes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {conversas.map((conv) => (
            <div key={conv.id} className={`border-2 rounded-lg p-4 hover:border-green-300 transition ${conv.status === "pendente" ? "border-orange-200 bg-orange-50" : "border-slate-200 bg-white"}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-2xl">{conv.avatar}</span>
                  <div>
                    <h4 className="font-bold text-slate-900">{conv.cliente}</h4>
                    <p className="text-xs text-slate-600">{conv.ultimaMensagem}</p>
                  </div>
                </div>
                <Badge variant={conv.status === "pendente" ? "destructive" : "default"}>
                  {conv.status === "pendente" ? "⏳ Pendente" : "✅ Respondido"}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs">
                <p className="text-slate-600">{conv.data}</p>
                <Button size="sm" className="bg-green-600 hover:bg-green-700 gap-1">
                  <Send className="w-3 h-3" />
                  Responder
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para Maximizar Conversão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ Envie confirmação de compra nos primeiros 5 minutos",
            "✅ Lembre carrinho abandonado após 2-3 horas",
            "✅ Use emojis e mensagens personalizadas",
            "✅ Responda dúvidas em até 5 minutos",
            "✅ Envie promoção exclusiva para clientes VIP",
            "✅ Peça feedback após 7 dias da compra",
            "✅ Use templates pré-aprovados do WhatsApp",
            "✅ Monitore taxa de resposta diariamente"
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
            { titulo: "Aumento de Conversão", descricao: "+15-25% em carrinho abandonado" },
            { titulo: "Tempo de Resposta", descricao: "Reduz de 24h para 2-3 minutos" },
            { titulo: "Satisfação do Cliente", descricao: "Aumenta com atendimento rápido" },
            { titulo: "Receita Extra", descricao: "R$ 2K-5K/mês em conversões adicionais" },
            { titulo: "Automatização", descricao: "Economiza 10+ horas/semana de atendimento" },
            { titulo: "Dados de Cliente", descricao: "Coleta preferências e feedback automático" }
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
