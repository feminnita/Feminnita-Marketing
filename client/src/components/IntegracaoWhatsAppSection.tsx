import { MessageCircle, Send, Users, TrendingUp, CheckCircle, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function IntegracaoWhatsAppSection() {
  const fluxosWhatsApp = [
    {
      fluxo: "Confirmação de Pedido",
      trigger: "Pedido realizado",
      mensagem: "Olá [Nome]! 🎉 Seu pedido #[ID] foi confirmado. Acompanhe em [Link]",
      taxa: "92%",
      receita: "R$ 45K/mês",
      status: "Ativo"
    },
    {
      fluxo: "Atualização de Entrega",
      trigger: "Pedido enviado",
      mensagem: "Seu pedido saiu para entrega! 📦 Rastreie em [Link]. Chegará em [Data]",
      taxa: "88%",
      receita: "R$ 35K/mês",
      status: "Ativo"
    },
    {
      fluxo: "Recomendação de Produto",
      trigger: "Após compra (24h)",
      mensagem: "Você pode gostar: [Produto] - Cupom 15% para você: [CUPOM]",
      taxa: "28%",
      receita: "R$ 125K/mês",
      status: "Ativo"
    },
    {
      fluxo: "Carrinho Abandonado",
      trigger: "Carrinho por 2h",
      mensagem: "Oi [Nome]! 😊 Você deixou [Produto] no carrinho. Cupom 10%: [CUPOM]",
      taxa: "32%",
      receita: "R$ 95K/mês",
      status: "Ativo"
    },
    {
      fluxo: "Pesquisa de Satisfação",
      trigger: "Após entrega",
      mensagem: "Gostou? 😊 Clique para avaliar: [Link]. Sua opinião importa!",
      taxa: "42%",
      receita: "R$ 15K/mês (reviews)",
      status: "Ativo"
    },
    {
      fluxo: "Oferta Exclusiva VIP",
      trigger: "Cliente VIP (semanal)",
      mensagem: "Exclusivo VIP! 👑 Acesso antecipado a [Produto]. Cupom VIP: [CUPOM]",
      taxa: "58%",
      receita: "R$ 185K/mês",
      status: "Ativo"
    }
  ];

  const metricas = [
    {
      titulo: "Mensagens/Mês",
      valor: "425.320",
      descricao: "Enviadas via WhatsApp",
      cor: "text-green-600"
    },
    {
      titulo: "Taxa de Abertura",
      valor: "98%",
      descricao: "Vs 34% email",
      cor: "text-blue-600"
    },
    {
      titulo: "Taxa de Clique",
      valor: "42%",
      descricao: "Vs 8.7% email",
      cor: "text-purple-600"
    },
    {
      titulo: "Receita Gerada",
      valor: "R$ 500K",
      descricao: "Mensal via WhatsApp",
      cor: "text-emerald-600"
    }
  ];

  const casosUso = [
    {
      caso: "Confirmação de Pedido",
      usuarios: 8.450,
      taxa: "92%",
      impacto: "R$ 45K/mês",
      descricao: "Reduz dúvidas, aumenta confiança"
    },
    {
      caso: "Atualização de Entrega",
      usuarios: 8.450,
      taxa: "88%",
      impacto: "R$ 35K/mês",
      descricao: "Reduz SAC, aumenta satisfação"
    },
    {
      caso: "Recomendação Pós-Compra",
      usuarios: 6.340,
      taxa: "28%",
      impacto: "R$ 125K/mês",
      descricao: "Aumenta ticket médio em 23%"
    },
    {
      caso: "Carrinho Abandonado",
      usuarios: 5.670,
      taxa: "32%",
      impacto: "R$ 95K/mês",
      descricao: "Recupera 32% dos carrinhos"
    },
    {
      caso: "Pesquisa de Satisfação",
      usuarios: 8.450,
      taxa: "42%",
      impacto: "R$ 15K/mês",
      descricao: "Gera reviews e feedback"
    },
    {
      caso: "Oferta Exclusiva VIP",
      usuarios: 487,
      taxa: "58%",
      impacto: "R$ 185K/mês",
      descricao: "Aumenta LTV de VIPs em 35%"
    }
  ];

  const comparativoCanais = [
    {
      canal: "WhatsApp",
      abertura: "98%",
      clique: "42%",
      conversao: "18%",
      roi: "22x",
      custo: "Baixo"
    },
    {
      canal: "Email",
      abertura: "34%",
      clique: "8.7%",
      conversao: "2.8%",
      roi: "8.5x",
      custo: "Muito Baixo"
    },
    {
      canal: "SMS",
      abertura: "95%",
      clique: "28%",
      conversao: "12%",
      roi: "15x",
      custo: "Médio"
    },
    {
      canal: "Push",
      abertura: "45%",
      clique: "12%",
      conversao: "3.5%",
      roi: "5x",
      custo: "Baixo"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metricas.map((metrica, idx) => (
          <Card key={idx} className="border-slate-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">{metrica.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${metrica.cor}`}>{metrica.valor}</div>
              <p className="text-xs text-slate-500 mt-1">{metrica.descricao}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Fluxos de WhatsApp */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-green-600" />
            6 Fluxos de Automação WhatsApp
          </CardTitle>
          <CardDescription>Gerando R$ 500K/mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fluxosWhatsApp.map((fluxo, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{fluxo.fluxo}</h4>
                  <Badge className="bg-green-100 text-green-700">{fluxo.status}</Badge>
                </div>

                <p className="text-sm text-slate-600 mb-3">Trigger: {fluxo.trigger}</p>
                <div className="bg-slate-100 rounded p-3 mb-3 text-sm text-slate-700">
                  <p className="italic">"{fluxo.mensagem}"</p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Taxa</p>
                    <p className="font-bold text-green-600">{fluxo.taxa}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Receita/Mês</p>
                    <p className="font-bold text-green-600">{fluxo.receita}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparativo de Canais */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            WhatsApp vs Outros Canais
          </CardTitle>
          <CardDescription>Por que WhatsApp é superior</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {comparativoCanais.map((comp, idx) => (
              <div key={idx} className={`border rounded-lg p-4 ${
                idx === 0 ? "border-green-300 bg-white" : "border-slate-200/50"
              }`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{comp.canal}</h4>
                  {idx === 0 && <Badge className="bg-green-100 text-green-700">Melhor</Badge>}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Abertura</p>
                    <p className="font-bold text-slate-900">{comp.abertura}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Clique</p>
                    <p className="font-bold text-slate-900">{comp.clique}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Conversão</p>
                    <p className="font-bold text-slate-900">{comp.conversao}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">ROI</p>
                    <p className="font-bold text-green-600">{comp.roi}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Custo</p>
                    <p className="font-bold text-slate-900">{comp.custo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Casos de Uso */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-orange-600" />
            6 Casos de Uso
          </CardTitle>
          <CardDescription>Onde WhatsApp gera mais valor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {casosUso.map((caso, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{caso.caso}</h4>
                  <Badge className="bg-green-100 text-green-700">{caso.taxa}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Usuários</p>
                    <p className="font-bold text-slate-900">{caso.usuarios.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Impacto/Mês</p>
                    <p className="font-bold text-green-600">{caso.impacto}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-500 text-xs">Benefício</p>
                    <p className="font-bold text-slate-900 text-xs">{caso.descricao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendação Final */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-slate-900">🚀 Recomendação Final</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Implementar em 30 Dias</p>
              <p className="text-slate-600">WhatsApp é o canal com melhor ROI (22x) - não deixar para depois</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Impacto: R$ 500K/mês</p>
              <p className="text-slate-600">6 fluxos automáticos gerando receita 24/7</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Complementa Email</p>
              <p className="text-slate-600">Email + WhatsApp = R$ 1.17M/mês (vs R$ 669K email sozinho)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
