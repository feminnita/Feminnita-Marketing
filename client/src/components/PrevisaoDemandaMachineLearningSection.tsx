import { TrendingUp, AlertCircle, CheckCircle, Zap, BarChart3, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PrevisaoDemandaMachineLearningSection() {
  const metricas = [
    {
      titulo: "Acurácia ML",
      valor: "94.2%",
      descricao: "Previsões corretas",
      cor: "text-green-600"
    },
    {
      titulo: "Produtos Analisados",
      valor: "4",
      descricao: "Carol, Renata, Vanessa, Luiza",
      cor: "text-blue-600"
    },
    {
      titulo: "Período Previsto",
      valor: "30 dias",
      descricao: "Fevereiro 2026",
      cor: "text-purple-600"
    },
    {
      titulo: "Receita Projetada",
      valor: "R$ 2.1M",
      descricao: "Fevereiro",
      cor: "text-emerald-600"
    }
  ];

  const previsoesProdutos = [
    {
      produto: "Pijama Carol",
      previsao: "8.450",
      crescimento: "+26%",
      receita: "R$ 845K",
      confianca: "96%",
      fatores: "Tendência viral, influenciadores, sazonalidade",
      recomendacao: "Aumentar estoque em 30%"
    },
    {
      produto: "Robe Renata",
      previsao: "5.230",
      crescimento: "+12%",
      receita: "R$ 627K",
      confianca: "92%",
      fatores: "Estável, público premium, email marketing",
      recomendacao: "Manter estoque atual"
    },
    {
      produto: "Pijama Vanessa",
      previsao: "3.890",
      crescimento: "+18%",
      receita: "R$ 389K",
      confianca: "88%",
      fatores: "Crescimento consistente, acessível",
      recomendacao: "Aumentar estoque em 20%"
    },
    {
      produto: "Pijama Luiza",
      previsao: "2.450",
      crescimento: "+32%",
      receita: "R$ 245K",
      confianca: "85%",
      fatores: "Novo lançamento, influenciadores, TikTok",
      recomendacao: "Aumentar estoque em 50%"
    }
  ];

  const modeloML = [
    {
      modelo: "ARIMA",
      uso: "Série temporal",
      acuracia: "91%",
      peso: "30%",
      descricao: "Analisa padrões históricos"
    },
    {
      modelo: "Prophet",
      uso: "Sazonalidade",
      acuracia: "93%",
      peso: "25%",
      descricao: "Detecta picos e sazonalidade"
    },
    {
      modelo: "Random Forest",
      uso: "Variáveis externas",
      acuracia: "94%",
      peso: "25%",
      descricao: "Incorpora campanhas e eventos"
    },
    {
      modelo: "Ensemble",
      uso: "Combinação",
      acuracia: "94.2%",
      peso: "20%",
      descricao: "Média ponderada dos 3 modelos"
    }
  ];

  const fatoresInfluencia = [
    {
      fator: "Campanhas Ativas",
      impacto: "+18%",
      peso: "25%",
      descricao: "Meta Ads, Google Ads, Email"
    },
    {
      fator: "Sazonalidade",
      impacto: "+12%",
      peso: "20%",
      descricao: "Fevereiro: Carnaval, Dia das Mulheres"
    },
    {
      fator: "Tendências Virais",
      impacto: "+22%",
      peso: "20%",
      descricao: "#PijamaChallenge, influenciadores"
    },
    {
      fator: "Preço Concorrentes",
      impacto: "-8%",
      peso: "15%",
      descricao: "Monitoramento diário"
    },
    {
      fator: "Histórico de Vendas",
      impacto: "+15%",
      peso: "20%",
      descricao: "Padrões dos últimos 12 meses"
    }
  ];

  const cenariosPrevisto = [
    {
      cenario: "Pessimista",
      probabilidade: "15%",
      unidades: "15.200",
      receita: "R$ 1.52M",
      descricao: "Sem campanhas extras, sem virais"
    },
    {
      cenario: "Realista",
      probabilidade: "70%",
      unidades: "20.020",
      receita: "R$ 2.1M",
      descricao: "Cenário base com campanhas atuais"
    },
    {
      cenario: "Otimista",
      probabilidade: "15%",
      unidades: "25.450",
      receita: "R$ 2.68M",
      descricao: "Viral explode, campanhas extras"
    }
  ];

  const previsaoPorSemana = [
    {
      semana: "Semana 1 (1-7 fev)",
      unidades: "4.200",
      receita: "R$ 420K",
      crescimento: "+15%",
      evento: "Início de fevereiro"
    },
    {
      semana: "Semana 2 (8-14 fev)",
      unidades: "5.450",
      receita: "R$ 545K",
      crescimento: "+28%",
      evento: "Carnaval, Dia dos Namorados"
    },
    {
      semana: "Semana 3 (15-21 fev)",
      unidades: "5.120",
      receita: "R$ 512K",
      crescimento: "+22%",
      evento: "Dia das Mulheres (28 fev)"
    },
    {
      semana: "Semana 4 (22-28 fev)",
      unidades: "5.250",
      receita: "R$ 625K",
      crescimento: "+32%",
      evento: "Promoção Dia das Mulheres"
    }
  ];

  const recomendacoesEstoque = [
    {
      produto: "Pijama Carol",
      estoque_atual: 2.100,
      estoque_recomendado: 2.730,
      diferenca: "+630",
      custo: "R$ 31.5K",
      impacto: "Evitar stockout em +26% demanda"
    },
    {
      produto: "Robe Renata",
      estoque_atual: 1.850,
      estoque_recomendado: 1.850,
      diferenca: "0",
      custo: "R$ 0",
      impacto: "Estoque adequado"
    },
    {
      produto: "Pijama Vanessa",
      estoque_atual: 1.200,
      estoque_recomendado: 1.440,
      diferenca: "+240",
      custo: "R$ 9.6K",
      impacto: "Evitar stockout em +18% demanda"
    },
    {
      produto: "Pijama Luiza",
      estoque_atual: 650,
      estoque_recomendado: 975,
      diferenca: "+325",
      custo: "R$ 16.25K",
      impacto: "Evitar stockout em +32% demanda"
    }
  ];

  const recomendacoesCampanhas = [
    {
      campanha: "Aumentar Meta Ads",
      produto: "Pijama Carol",
      investimento: "+R$ 15K",
      impacto: "+R$ 210K receita",
      roi: "14x",
      prazo: "Imediato"
    },
    {
      campanha: "Promoção Dia das Mulheres",
      produto: "Todos",
      investimento: "+R$ 25K",
      impacto: "+R$ 380K receita",
      roi: "15.2x",
      prazo: "Semana 3"
    },
    {
      campanha: "Influenciadores TikTok",
      produto: "Pijama Luiza",
      investimento: "+R$ 10K",
      impacto: "+R$ 165K receita",
      roi: "16.5x",
      prazo: "Imediato"
    },
    {
      campanha: "Email Premium",
      produto: "Robe Renata",
      investimento: "+R$ 5K",
      impacto: "+R$ 52K receita",
      roi: "10.4x",
      prazo: "Semana 1"
    }
  ];

  const alertasRiscos = [
    {
      alerta: "Possível Stockout Carol",
      probabilidade: "18%",
      impacto: "-R$ 150K",
      acao: "Aumentar estoque em 30%",
      status: "Crítico"
    },
    {
      alerta: "Concorrência Aumenta Preço",
      probabilidade: "35%",
      impacto: "-R$ 85K",
      acao: "Monitorar diariamente",
      status: "Médio"
    },
    {
      alerta: "Viral Não Explode",
      probabilidade: "25%",
      impacto: "-R$ 280K",
      acao: "Ter plano B de campanhas",
      status: "Médio"
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

      {/* Previsões por Produto */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Previsões de Demanda por Produto (Fevereiro)
          </CardTitle>
          <CardDescription>Acurácia: 94.2% | Modelos: ARIMA + Prophet + Random Forest</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {previsoesProdutos.map((prev, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{prev.produto}</h4>
                  <Badge className="bg-green-100 text-green-700">{prev.confianca}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Unidades</p>
                    <p className="font-bold text-slate-900">{prev.previsao}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Crescimento</p>
                    <p className="font-bold text-green-600">{prev.crescimento}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Receita</p>
                    <p className="font-bold text-green-600">{prev.receita}</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded p-2 mb-2 text-xs text-blue-700">
                  <p className="font-semibold">Fatores: {prev.fatores}</p>
                </div>

                <div className="bg-green-50 rounded p-2 text-xs text-green-700">
                  <p className="font-semibold">✓ {prev.recomendacao}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modelos de ML */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            4 Modelos de Machine Learning
          </CardTitle>
          <CardDescription>Ensemble com acurácia 94.2%</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {modeloML.map((modelo, idx) => (
              <div key={idx} className="border border-purple-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{modelo.modelo}</h4>
                  <Badge className="bg-purple-100 text-purple-700">{modelo.acuracia}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Uso</p>
                    <p className="font-bold text-slate-900">{modelo.uso}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Peso</p>
                    <p className="font-bold text-slate-900">{modelo.peso}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-500 text-xs">Descrição</p>
                    <p className="font-bold text-slate-900 text-xs">{modelo.descricao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fatores de Influência */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            5 Fatores de Influência
          </CardTitle>
          <CardDescription>O que afeta a demanda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fatoresInfluencia.map((fator, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{fator.fator}</h4>
                  <Badge className="bg-blue-100 text-blue-700">{fator.impacto}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Peso</p>
                    <p className="font-bold text-slate-900">{fator.peso}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Descrição</p>
                    <p className="font-bold text-slate-900 text-xs">{fator.descricao}</p>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{width: fator.peso}}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cenários Previstos */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            3 Cenários Previstos
          </CardTitle>
          <CardDescription>Pessimista, Realista, Otimista</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cenariosPrevisto.map((cen, idx) => (
              <div key={idx} className={`border rounded-lg p-4 ${
                idx === 1 ? "border-green-300 bg-green-50" : "border-slate-200/50"
              }`}>
                <h4 className="font-semibold text-slate-900 mb-3">{cen.cenario}</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Probabilidade</p>
                    <p className="font-bold text-slate-900">{cen.probabilidade}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Unidades</p>
                    <p className="font-bold text-slate-900">{cen.unidades}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Receita</p>
                    <p className="font-bold text-green-600">{cen.receita}</p>
                  </div>
                  <div className="bg-slate-100 rounded p-2 text-xs text-slate-700">
                    <p>{cen.descricao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Previsão por Semana */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Previsão Semanal
          </CardTitle>
          <CardDescription>Distribuição de vendas ao longo de fevereiro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {previsaoPorSemana.map((sem, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{sem.semana}</h4>
                  <Badge className="bg-green-100 text-green-700">{sem.crescimento}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Unidades</p>
                    <p className="font-bold text-slate-900">{sem.unidades}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Receita</p>
                    <p className="font-bold text-green-600">{sem.receita}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-500 text-xs">Evento</p>
                    <p className="font-bold text-slate-900 text-xs">{sem.evento}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações de Estoque */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            Recomendações de Estoque
          </CardTitle>
          <CardDescription>Baseado em previsões de demanda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recomendacoesEstoque.map((rec, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 bg-white">
                <h4 className="font-semibold text-slate-900 mb-3">{rec.produto}</h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-2">
                  <div>
                    <p className="text-slate-500 text-xs">Atual</p>
                    <p className="font-bold text-slate-900">{rec.estoque_atual.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Recomendado</p>
                    <p className="font-bold text-green-600">{rec.estoque_recomendado.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Diferença</p>
                    <p className="font-bold text-blue-600">{rec.diferenca}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Custo</p>
                    <p className="font-bold text-slate-900">{rec.custo}</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded p-2 text-xs text-green-700">
                  <p className="font-semibold">→ {rec.impacto}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações de Campanhas */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            4 Recomendações de Campanhas
          </CardTitle>
          <CardDescription>Para maximizar vendas em fevereiro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recomendacoesCampanhas.map((camp, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{camp.campanha}</h4>
                  <Badge className="bg-purple-100 text-purple-700">{camp.roi}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Produto</p>
                    <p className="font-bold text-slate-900 text-xs">{camp.produto}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Investimento</p>
                    <p className="font-bold text-slate-900">{camp.investimento}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Impacto</p>
                    <p className="font-bold text-green-600">{camp.impacto}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Prazo</p>
                    <p className="font-bold text-slate-900 text-xs">{camp.prazo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas e Riscos */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            3 Alertas e Riscos
          </CardTitle>
          <CardDescription>Monitorar durante fevereiro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertasRiscos.map((alerta, idx) => (
              <div key={idx} className="border border-red-200 rounded-lg p-4 bg-red-50/30">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{alerta.alerta}</h4>
                  <Badge className={
                    alerta.status === "Crítico" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }>
                    {alerta.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Probabilidade</p>
                    <p className="font-bold text-red-600">{alerta.probabilidade}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Impacto</p>
                    <p className="font-bold text-red-600">{alerta.impacto}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-500 text-xs">Ação</p>
                    <p className="font-bold text-slate-900 text-xs">{alerta.acao}</p>
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
          <CardTitle className="text-slate-900">✅ Plano de Ação para Fevereiro</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">1. Aumentar Estoque</p>
              <p className="text-slate-600">Carol +630, Vanessa +240, Luiza +325 (Total: R$ 57.35K)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">2. Implementar Campanhas</p>
              <p className="text-slate-600">Meta Ads +R$ 15K, Dia das Mulheres +R$ 25K, Influenciadores +R$ 10K</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">3. Monitorar Riscos</p>
              <p className="text-slate-600">Possível stockout Carol (18%), concorrência (35%), viral (25%)</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Receita Projetada: R$ 2.1M</p>
              <p className="text-slate-600">Crescimento de +26% vs janeiro (R$ 1.6M)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
