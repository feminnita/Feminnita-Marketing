import { TrendingUp, Users, DollarSign, Target, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function LifetimeValueDetalhadoSection() {
  const segmentosLTV = [
    {
      segmento: "VIP Premium",
      clientes: 487,
      ltv: "R$ 4.200",
      ticket: "R$ 280",
      compras: 15,
      retenção: "92%",
      churn: "8%",
      investimento: "R$ 150/cliente",
      roi: "28x",
      recomendacao: "Aumentar investimento em 50%"
    },
    {
      segmento: "Clientes Ativos",
      clientes: 2.465,
      ltv: "R$ 1.800",
      ticket: "R$ 150",
      compras: 12,
      retenção: "75%",
      churn: "25%",
      investimento: "R$ 45/cliente",
      roi: "40x",
      recomendacao: "Manter investimento atual"
    },
    {
      segmento: "Em Risco",
      clientes: 823,
      ltv: "R$ 1.200",
      ticket: "R$ 120",
      compras: 10,
      retenção: "38%",
      churn: "62%",
      investimento: "R$ 80/cliente",
      roi: "15x",
      recomendacao: "Campanhas de retenção urgentes"
    },
    {
      segmento: "Dormentes",
      clientes: 412,
      ltv: "R$ 600",
      ticket: "R$ 100",
      compras: 6,
      retenção: "15%",
      churn: "85%",
      investimento: "R$ 20/cliente",
      roi: "30x",
      recomendacao: "Reativação com cupom 30%"
    }
  ];

  const previsaoLTV = [
    {
      persona: "Carol",
      ltv: "R$ 1.850",
      previsao: "R$ 2.100",
      crescimento: "+13.5%",
      fatores: "Aumento de frequência, ticket maior"
    },
    {
      persona: "Renata",
      ltv: "R$ 2.400",
      previsao: "R$ 2.800",
      crescimento: "+16.7%",
      fatores: "Premium, alta retenção"
    },
    {
      persona: "Vanessa",
      ltv: "R$ 1.200",
      previsao: "R$ 1.450",
      crescimento: "+20.8%",
      fatores: "Volume, cross-sell"
    },
    {
      persona: "Luiza",
      ltv: "R$ 2.850",
      previsao: "R$ 3.400",
      crescimento: "+19.3%",
      fatores: "Email marketing, influência"
    }
  ];

  const matrizInvestimento = [
    {
      segmento: "VIP Premium",
      status: "🟢 Investir Agressivamente",
      budget: "50%",
      canais: "Email Premium, SMS, Whatsapp",
      frequencia: "2x/semana",
      roi: "28x"
    },
    {
      segmento: "Clientes Ativos",
      status: "🟡 Manter e Crescer",
      budget: "35%",
      canais: "Email, Instagram, Facebook",
      frequencia: "1x/semana",
      roi: "40x"
    },
    {
      segmento: "Em Risco",
      status: "🔴 Retenção Urgente",
      budget: "12%",
      canais: "Email com cupom, SMS",
      frequencia: "3x/mês",
      roi: "15x"
    },
    {
      segmento: "Dormentes",
      status: "⚪ Reativação Baixa",
      budget: "3%",
      canais: "Email com cupom 30%",
      frequencia: "1x/mês",
      roi: "30x"
    }
  ];

  const metricas = [
    {
      titulo: "LTV Médio",
      valor: "R$ 1.950",
      descricao: "Todos os clientes",
      cor: "text-blue-600"
    },
    {
      titulo: "LTV Total",
      valor: "R$ 32.1M",
      descricao: "Valor futuro de todos",
      cor: "text-green-600"
    },
    {
      titulo: "Potencial de Crescimento",
      valor: "+18.2%",
      descricao: "Com otimizações",
      cor: "text-purple-600"
    },
    {
      titulo: "ROI Médio",
      valor: "28.5x",
      descricao: "Investimento vs LTV",
      cor: "text-emerald-600"
    }
  ];

  const estrategiasPorSegmento = [
    {
      segmento: "VIP Premium",
      estrategias: [
        "Programa de fidelidade exclusivo",
        "Acesso antecipado a novidades",
        "Atendimento VIP personalizado",
        "Cupons exclusivos 20-30%"
      ]
    },
    {
      segmento: "Clientes Ativos",
      estrategias: [
        "Email marketing regular",
        "Programa de pontos",
        "Recomendações personalizadas",
        "Cupons 10-15% ocasionais"
      ]
    },
    {
      segmento: "Em Risco",
      estrategias: [
        "Campanhas de retenção agressivas",
        "Cupom 20% para reativar",
        "SMS com urgência",
        "Frete grátis em próxima compra"
      ]
    },
    {
      segmento: "Dormentes",
      estrategias: [
        "Cupom 30% para reativar",
        "Email com novidades",
        "Oferta limitada (48h)",
        "Frete grátis"
      ]
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

      {/* Segmentação por LTV */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            Segmentação por Lifetime Value
          </CardTitle>
          <CardDescription>Análise detalhada de cada segmento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {segmentosLTV.map((seg, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{seg.segmento}</h4>
                  <Badge className="bg-green-100 text-green-700">{seg.roi}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Clientes</p>
                    <p className="font-bold text-slate-900">{seg.clientes}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">LTV</p>
                    <p className="font-bold text-green-600">{seg.ltv}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Ticket</p>
                    <p className="font-bold text-slate-900">{seg.ticket}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Compras</p>
                    <p className="font-bold text-slate-900">{seg.compras}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Retenção</p>
                    <p className="font-bold text-blue-600">{seg.retenção}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Churn</p>
                    <p className="font-bold text-red-600">{seg.churn}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500">Investimento/Cliente</p>
                    <p className="font-bold text-slate-900">{seg.investimento}</p>
                  </div>
                  <div className="bg-blue-50 rounded p-2">
                    <p className="text-blue-700 font-semibold">{seg.recomendacao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Previsão de LTV */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Previsão de LTV (Próximos 12 Meses)
          </CardTitle>
          <CardDescription>Crescimento esperado por persona</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previsaoLTV.map((prev, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 bg-white">
                <h4 className="font-semibold text-slate-900 mb-3">{prev.persona}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500">LTV Atual</p>
                    <p className="font-bold text-slate-900">{prev.ltv}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500">Previsão</p>
                    <p className="font-bold text-slate-900">{prev.previsao}</p>
                  </div>
                  <div className="flex items-center justify-between bg-green-50 rounded p-2">
                    <p className="text-slate-500">Crescimento</p>
                    <p className="font-bold text-green-600">{prev.crescimento}</p>
                  </div>
                  <div className="text-xs text-slate-600 mt-2">
                    <p className="font-semibold text-slate-700">Fatores:</p>
                    <p>{prev.fatores}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Matriz de Investimento */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Matriz de Investimento por Segmento
          </CardTitle>
          <CardDescription>Alocação de budget recomendada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {matrizInvestimento.map((matriz, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{matriz.segmento}</h4>
                  <Badge className="bg-slate-100 text-slate-700">{matriz.status}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Budget</p>
                    <p className="font-bold text-slate-900">{matriz.budget}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Canais</p>
                    <p className="font-bold text-slate-900 text-xs">{matriz.canais}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Frequência</p>
                    <p className="font-bold text-slate-900">{matriz.frequencia}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">ROI</p>
                    <p className="font-bold text-green-600">{matriz.roi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estratégias por Segmento */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Estratégias de Crescimento por Segmento
          </CardTitle>
          <CardDescription>Ações específicas para cada grupo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {estrategiasPorSegmento.map((est, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">{est.segmento}</h4>
                <ul className="space-y-2">
                  {est.estrategias.map((estrategia, sidx) => (
                    <li key={sidx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{estrategia}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-slate-900">✅ Impacto da Segmentação por LTV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Alocação Eficiente de Budget</p>
              <p className="text-slate-600">50% em VIP (28x ROI) vs 3% em Dormentes</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Crescimento de +18.2% no LTV</p>
              <p className="text-slate-600">Implementando estratégias por segmento</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Redução de Churn em 35%</p>
              <p className="text-slate-600">Campanhas de retenção para "Em Risco"</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">ROI Médio 28.5x</p>
              <p className="text-slate-600">Cada R$ 1 investido retorna R$ 28,50</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
