import { DollarSign, TrendingUp, Zap, Target, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function RecomendacaoOrcamentoCanalSection() {
  const metricas = [
    {
      titulo: "Orçamento Total/Mês",
      valor: "R$ 125K",
      descricao: "Alocado entre canais",
      cor: "text-blue-600"
    },
    {
      titulo: "ROI Médio",
      valor: "12.8x",
      descricao: "Retorno atual",
      cor: "text-green-600"
    },
    {
      titulo: "Oportunidade",
      valor: "R$ 85K",
      descricao: "Potencial de otimização",
      cor: "text-purple-600"
    },
    {
      titulo: "Receita Gerada",
      valor: "R$ 1.6M",
      descricao: "Mensal via ads",
      cor: "text-emerald-600"
    }
  ];

  const alocacaoAtual = [
    {
      canal: "Meta Ads (Facebook + Instagram)",
      orcamento: "R$ 45K",
      percentual: "36%",
      roi: "14.2x",
      receita: "R$ 640K",
      conversoes: 8.450,
      cpa: "R$ 5.32",
      status: "Ótimo"
    },
    {
      canal: "Google Ads",
      orcamento: "R$ 35K",
      percentual: "28%",
      roi: "11.5x",
      receita: "R$ 402K",
      conversoes: 5.230,
      cpa: "R$ 6.69",
      status: "Bom"
    },
    {
      canal: "Email Marketing",
      orcamento: "R$ 25K",
      percentual: "20%",
      roi: "8.5x",
      receita: "R$ 212K",
      conversoes: 3.120,
      cpa: "R$ 8.01",
      status: "Bom"
    },
    {
      canal: "WhatsApp Business",
      orcamento: "R$ 15K",
      percentual: "12%",
      roi: "22.0x",
      receita: "R$ 330K",
      conversoes: 6.850,
      cpa: "R$ 2.19",
      status: "Excelente"
    },
    {
      canal: "Influenciadores",
      orcamento: "R$ 5K",
      percentual: "4%",
      roi: "18.5x",
      receita: "R$ 92K",
      conversoes: 1.540,
      cpa: "R$ 3.25",
      status: "Excelente"
    }
  ];

  const recomendacoesAlgoritmicas = [
    {
      acao: "Aumentar WhatsApp",
      de: "R$ 15K",
      para: "R$ 35K",
      diferenca: "+R$ 20K",
      roi: "22.0x",
      impacto: "+R$ 440K/mês",
      confianca: "98%",
      prazo: "7 dias"
    },
    {
      acao: "Aumentar Influenciadores",
      de: "R$ 5K",
      para: "R$ 15K",
      diferenca: "+R$ 10K",
      roi: "18.5x",
      impacto: "+R$ 185K/mês",
      confianca: "92%",
      prazo: "14 dias"
    },
    {
      acao: "Reduzir Email",
      de: "R$ 25K",
      para: "R$ 15K",
      diferenca: "-R$ 10K",
      roi: "8.5x",
      impacto: "-R$ 85K/mês",
      confianca: "85%",
      prazo: "Imediato"
    },
    {
      acao: "Manter Meta Ads",
      de: "R$ 45K",
      para: "R$ 45K",
      diferenca: "Sem mudança",
      roi: "14.2x",
      impacto: "Estável",
      confianca: "95%",
      prazo: "Contínuo"
    },
    {
      acao: "Otimizar Google Ads",
      de: "R$ 35K",
      para: "R$ 35K",
      diferenca: "Sem mudança",
      roi: "11.5x",
      impacto: "Melhorar CPA",
      confianca: "88%",
      prazo: "30 dias"
    }
  ];

  const cenarios = [
    {
      cenario: "Conservador",
      meta: "Manter ROI 12.8x",
      mudancas: "Sem alterações",
      receita: "R$ 1.6M",
      risco: "Baixo",
      recomendacao: "Manter atual"
    },
    {
      cenario: "Agressivo",
      meta: "Maximizar ROI",
      mudancas: "Aumentar WhatsApp +R$ 20K, Influenciadores +R$ 10K",
      receita: "R$ 2.1M",
      risco: "Médio",
      recomendacao: "Implementar em 2 semanas"
    },
    {
      cenario: "Balanceado",
      meta: "Crescimento seguro",
      mudancas: "WhatsApp +R$ 10K, Influenciadores +R$ 5K, Email -R$ 5K",
      receita: "R$ 1.85M",
      risco: "Baixo",
      recomendacao: "Implementar em 1 semana"
    }
  ];

  const simulacoes = [
    {
      simulacao: "Aumentar Meta em 20%",
      orcamento: "R$ 54K",
      roiEsperado: "13.8x",
      receita: "R$ 745K",
      impacto: "+R$ 105K",
      risco: "Baixo"
    },
    {
      simulacao: "Aumentar Google em 30%",
      orcamento: "R$ 45.5K",
      roiEsperado: "11.2x",
      receita: "R$ 510K",
      impacto: "+R$ 108K",
      risco: "Médio"
    },
    {
      simulacao: "Aumentar WhatsApp em 150%",
      orcamento: "R$ 37.5K",
      roiEsperado: "21.5x",
      receita: "R$ 807K",
      impacto: "+R$ 477K",
      risco: "Médio"
    },
    {
      simulacao: "Aumentar Influenciadores em 200%",
      orcamento: "R$ 15K",
      roiEsperado: "17.8x",
      receita: "R$ 267K",
      impacto: "+R$ 175K",
      risco: "Médio"
    }
  ];

  const analiseHistorica = [
    {
      mes: "Janeiro",
      orcamento: "R$ 120K",
      receita: "R$ 1.45M",
      roi: "12.1x",
      melhorCanal: "Meta (14.0x)",
      piorCanal: "Email (7.8x)"
    },
    {
      mes: "Fevereiro (Atual)",
      orcamento: "R$ 125K",
      receita: "R$ 1.6M",
      roi: "12.8x",
      melhorCanal: "WhatsApp (22.0x)",
      piorCanal: "Email (8.5x)"
    },
    {
      mes: "Março (Projetado)",
      orcamento: "R$ 140K",
      receita: "R$ 1.95M",
      roi: "13.9x",
      melhorCanal: "WhatsApp (22.0x)",
      piorCanal: "Email (8.2x)"
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

      {/* Alocação Atual */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Alocação Atual (R$ 125K/mês)
          </CardTitle>
          <CardDescription>Performance de cada canal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alocacaoAtual.map((canal, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{canal.canal}</h4>
                  <Badge className={
                    canal.status === "Excelente" ? "bg-green-100 text-green-700" :
                    canal.status === "Ótimo" ? "bg-blue-100 text-blue-700" :
                    "bg-slate-100 text-slate-700"
                  }>
                    {canal.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Orçamento</p>
                    <p className="font-bold text-slate-900">{canal.orcamento}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">ROI</p>
                    <p className="font-bold text-green-600">{canal.roi}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Receita</p>
                    <p className="font-bold text-slate-900">{canal.receita}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Conversões</p>
                    <p className="font-bold text-slate-900">{canal.conversoes.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">CPA</p>
                    <p className="font-bold text-slate-900">{canal.cpa}</p>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: canal.percentual}}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações Algorítmicas */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            5 Recomendações Algorítmicas
          </CardTitle>
          <CardDescription>IA analisou 12 meses de dados históricos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recomendacoesAlgoritmicas.map((rec, idx) => (
              <div key={idx} className="border border-purple-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{rec.acao}</h4>
                  <Badge className="bg-purple-100 text-purple-700">{rec.confianca}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">De</p>
                    <p className="font-bold text-slate-900">{rec.de}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Para</p>
                    <p className="font-bold text-green-600">{rec.para}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">ROI</p>
                    <p className="font-bold text-slate-900">{rec.roi}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Impacto</p>
                    <p className="font-bold text-green-600">{rec.impacto}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Prazo</p>
                    <p className="font-bold text-slate-900">{rec.prazo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cenários */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            3 Cenários de Alocação
          </CardTitle>
          <CardDescription>Escolha a estratégia que melhor se adequa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cenarios.map((cen, idx) => (
              <div key={idx} className={`border rounded-lg p-4 ${
                idx === 1 ? "border-green-300 bg-green-50" : "border-slate-200/50"
              }`}>
                <h4 className="font-semibold text-slate-900 mb-3">{cen.cenario}</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Meta</p>
                    <p className="font-bold text-slate-900">{cen.meta}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Mudanças</p>
                    <p className="font-bold text-slate-900 text-xs">{cen.mudancas}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Receita Projetada</p>
                    <p className="font-bold text-green-600">{cen.receita}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Risco</p>
                    <p className="font-bold text-slate-900">{cen.risco}</p>
                  </div>
                  <div className="bg-blue-50 rounded p-2 text-xs text-blue-700">
                    <p className="font-semibold">{cen.recomendacao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simulações */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            4 Simulações de Cenários
          </CardTitle>
          <CardDescription>Teste diferentes estratégias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {simulacoes.map((sim, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{sim.simulacao}</h4>
                  <Badge className="bg-green-100 text-green-700">{sim.impacto}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Orçamento</p>
                    <p className="font-bold text-slate-900">{sim.orcamento}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">ROI Esperado</p>
                    <p className="font-bold text-green-600">{sim.roiEsperado}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Receita</p>
                    <p className="font-bold text-slate-900">{sim.receita}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Risco</p>
                    <p className="font-bold text-slate-900">{sim.risco}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise Histórica */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            Análise Histórica (3 Meses)
          </CardTitle>
          <CardDescription>Tendência de ROI e performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analiseHistorica.map((hist, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 bg-white">
                <h4 className="font-semibold text-slate-900 mb-3">{hist.mes}</h4>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Orçamento</p>
                    <p className="font-bold text-slate-900">{hist.orcamento}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Receita</p>
                    <p className="font-bold text-green-600">{hist.receita}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">ROI</p>
                    <p className="font-bold text-slate-900">{hist.roi}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Melhor Canal</p>
                    <p className="font-bold text-green-600 text-xs">{hist.melhorCanal}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Pior Canal</p>
                    <p className="font-bold text-red-600 text-xs">{hist.piorCanal}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendação Final */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-slate-900">✅ Recomendação Final da IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Implementar Cenário Balanceado</p>
              <p className="text-slate-600">WhatsApp +R$ 10K, Influenciadores +R$ 5K, Email -R$ 5K</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Impacto: +R$ 250K/mês</p>
              <p className="text-slate-600">ROI aumenta de 12.8x para 14.2x</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Prazo: 1 Semana</p>
              <p className="text-slate-600">Baixo risco, implementação imediata</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
