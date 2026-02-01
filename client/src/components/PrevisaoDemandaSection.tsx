import { TrendingUp, Calendar, AlertCircle, CheckCircle, BarChart3, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PrevisaoDemandaSection() {
  const previsaoProdutos = [
    {
      produto: "Pijama Luiza Roxo",
      vendidoMes: 1.680,
      previsaoProximo: 2.150,
      crescimento: "+28%",
      confianca: "94%",
      recomendacao: "Aumentar estoque em 35%",
      impacto: "R$ 387K"
    },
    {
      produto: "Robe Vanessa Branco",
      vendidoMes: 2.150,
      previsaoProximo: 2.890,
      crescimento: "+34%",
      confianca: "91%",
      recomendacao: "Aumentar estoque em 40%",
      impacto: "R$ 289K"
    },
    {
      produto: "Pijama Renata Azul",
      vendidoMes: 890,
      previsaoProximo: 1.120,
      crescimento: "+26%",
      confianca: "88%",
      recomendacao: "Aumentar estoque em 30%",
      impacto: "R$ 224K"
    },
    {
      produto: "Pijama Carol Rosa",
      vendidoMes: 1.250,
      previsaoProximo: 1.450,
      crescimento: "+16%",
      confianca: "85%",
      recomendacao: "Manter estoque atual",
      impacto: "R$ 181K"
    }
  ];

  const fatoresSazonalidade = [
    { mes: "Fevereiro", indice: 1.15, descricao: "Pós-Carnaval (alta demanda)" },
    { mes: "Março", indice: 1.08, descricao: "Estabilização" },
    { mes: "Abril", indice: 0.95, descricao: "Período de redução" },
    { mes: "Maio", indice: 1.20, descricao: "Preparação para inverno" }
  ];

  const analiseCanais = [
    {
      canal: "Instagram",
      vendidoMes: 3.200,
      previsaoProximo: 4.100,
      crescimento: "+28%",
      recomendacao: "Aumentar investimento em 30%"
    },
    {
      canal: "TikTok",
      vendidoMes: 2.150,
      previsaoProximo: 2.890,
      crescimento: "+34%",
      recomendacao: "Aumentar investimento em 40%"
    },
    {
      canal: "Facebook",
      vendidoMes: 1.890,
      previsaoProximo: 2.100,
      crescimento: "+11%",
      recomendacao: "Manter investimento"
    },
    {
      canal: "Email",
      vendidoMes: 1.730,
      previsaoProximo: 2.310,
      crescimento: "+34%",
      recomendacao: "Aumentar frequência em 25%"
    }
  ];

  const metricas = [
    {
      titulo: "Previsão Total (Fev)",
      valor: "7.610",
      descricao: "Unidades estimadas",
      cor: "text-blue-600"
    },
    {
      titulo: "Receita Estimada",
      valor: "R$ 1.08M",
      descricao: "Fevereiro 2026",
      cor: "text-green-600"
    },
    {
      titulo: "Crescimento vs Mês",
      valor: "+26%",
      descricao: "Média de crescimento",
      cor: "text-purple-600"
    },
    {
      titulo: "Confiança Média",
      valor: "89.5%",
      descricao: "Acurácia da previsão",
      cor: "text-emerald-600"
    }
  ];

  const fatoresInfluencia = [
    { fator: "Sazonalidade", peso: "35%", impacto: "Alto" },
    { fator: "Tendências Virais", peso: "25%", impacto: "Médio" },
    { fator: "Investimento em Ads", peso: "20%", impacto: "Alto" },
    { fator: "Estoque Disponível", peso: "15%", impacto: "Médio" },
    { fator: "Concorrência", peso: "5%", impacto: "Baixo" }
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

      {/* Previsão por Produto */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Previsão de Demanda por Produto (Fevereiro)
          </CardTitle>
          <CardDescription>Algoritmo ML com histórico de 12 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {previsaoProdutos.map((produto, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{produto.produto}</h4>
                  <Badge className="bg-blue-100 text-blue-700">{produto.confianca}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Vendido (Jan)</p>
                    <p className="font-bold text-slate-900">{produto.vendidoMes}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Previsão (Fev)</p>
                    <p className="font-bold text-slate-900">{produto.previsaoProximo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Crescimento</p>
                    <p className="font-bold text-green-600">{produto.crescimento}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Recomendação</p>
                    <p className="font-bold text-blue-600 text-xs">{produto.recomendacao}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Impacto</p>
                    <p className="font-bold text-green-600">{produto.impacto}</p>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${(produto.previsaoProximo / 3000) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sazonalidade */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-orange-50 to-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-600" />
            Índice de Sazonalidade
          </CardTitle>
          <CardDescription>Padrões de demanda por mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fatoresSazonalidade.map((sazon, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-20">
                  <p className="font-semibold text-slate-900 text-sm">{sazon.mes}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600">{sazon.descricao}</span>
                    <span className="text-sm font-bold text-slate-900">{sazon.indice}x</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full"
                      style={{ width: `${(sazon.indice / 1.3) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise por Canal */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Previsão por Canal
          </CardTitle>
          <CardDescription>Qual canal vai crescer mais em fevereiro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analiseCanais.map((canal, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{canal.canal}</h4>
                  <Badge className="bg-purple-100 text-purple-700">{canal.crescimento}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-2 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Vendido (Jan)</p>
                    <p className="font-bold text-slate-900">{canal.vendidoMes}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Previsão (Fev)</p>
                    <p className="font-bold text-slate-900">{canal.previsaoProximo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Recomendação</p>
                    <p className="font-bold text-blue-600 text-xs">{canal.recomendacao}</p>
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
            <Zap className="w-5 h-5 text-yellow-600" />
            Fatores que Influenciam a Demanda
          </CardTitle>
          <CardDescription>Peso de cada fator na previsão</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fatoresInfluencia.map((fator, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-slate-900">{fator.fator}</p>
                    <span className="text-sm font-bold text-slate-600">{fator.peso}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full"
                      style={{ width: fator.peso }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Impacto: {fator.impacto}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-slate-900">💡 Recomendações de Ação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Aumentar Estoque em 35%</p>
              <p className="text-slate-600">Robe Vanessa vai crescer 34% - prepare estoque agora</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Aumentar Investimento em TikTok</p>
              <p className="text-slate-600">Canal vai crescer 34% - ROI esperado 2.8x</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Preparar Campanhas de Email</p>
              <p className="text-slate-600">Email vai crescer 34% - aumentar frequência em 25%</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Receita Estimada: R$ 1.08M</p>
              <p className="text-slate-600">+26% vs janeiro - prepare equipe para volume maior</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
