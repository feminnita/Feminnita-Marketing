import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, Eye, Heart, MessageCircle } from "lucide-react";
import PersonaAvatar from "./PersonaAvatar";

export default function PerformancePersonaSection() {
  const performanceData = [
    {
      persona: "Carol",
      metrics: {
        conversao: 12.5,
        engajamento: 8.3,
        roi: 245,
        alcance: 45000,
        cliques: 3600,
        vendas: 1250,
      },
      trend: "up",
      budget: "R$ 2.500",
      status: "Excelente",
      recomendacao: "Aumentar budget em 30%",
    },
    {
      persona: "Renata",
      metrics: {
        conversao: 18.7,
        engajamento: 6.2,
        roi: 380,
        alcance: 28000,
        cliques: 2100,
        vendas: 2890,
      },
      trend: "up",
      budget: "R$ 5.000",
      status: "Excelente",
      recomendacao: "Melhor ROI - manter estratégia",
    },
    {
      persona: "Vanessa",
      metrics: {
        conversao: 9.2,
        engajamento: 11.5,
        roi: 156,
        alcance: 67000,
        cliques: 4200,
        vendas: 890,
      },
      trend: "up",
      budget: "R$ 1.800",
      status: "Bom",
      recomendacao: "Focar em conversão",
    },
    {
      persona: "Luiza",
      metrics: {
        conversao: 14.3,
        engajamento: 15.8,
        roi: 198,
        alcance: 89000,
        cliques: 5600,
        vendas: 1560,
      },
      trend: "up",
      budget: "R$ 3.200",
      status: "Excelente",
      recomendacao: "Maior alcance - investir em conteúdo",
    },
  ];

  const totalMetrics = {
    alcanceTotal: 229000,
    vendas: 6590,
    roiMedio: 244.75,
    engajamentoMedio: 10.45,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Performance por Persona</h2>
        <p className="text-slate-600">Análise comparativa de conversão, engajamento e ROI para cada persona</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Alcance Total</p>
                <p className="text-2xl font-bold text-slate-900">{(totalMetrics.alcanceTotal / 1000).toFixed(0)}K</p>
              </div>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Vendas Totais</p>
                <p className="text-2xl font-bold text-slate-900">{totalMetrics.vendas.toLocaleString('pt-BR')}</p>
              </div>
              <DollarSign className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">ROI Médio</p>
                <p className="text-2xl font-bold text-slate-900">{totalMetrics.roiMedio.toFixed(0)}%</p>
              </div>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Engajamento Médio</p>
                <p className="text-2xl font-bold text-slate-900">{totalMetrics.engajamentoMedio.toFixed(1)}%</p>
              </div>
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de Métricas</CardTitle>
          <CardDescription>Dados consolidados de todas as campanhas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Persona</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Conversão</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Engajamento</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">ROI</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Alcance</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Vendas</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {performanceData.map((data) => (
                  <tr key={data.persona} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <PersonaAvatar name={data.persona} size="sm" />
                        <span className="font-medium text-slate-900">{data.persona}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <span className="font-semibold text-slate-900">{data.metrics.conversao}%</span>
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      </div>
                    </td>
                    <td className="text-center py-3 px-4 font-semibold text-slate-900">{data.metrics.engajamento}%</td>
                    <td className="text-center py-3 px-4 font-semibold text-purple-600">{data.metrics.roi}%</td>
                    <td className="text-center py-3 px-4 text-slate-600">{(data.metrics.alcance / 1000).toFixed(0)}K</td>
                    <td className="text-center py-3 px-4 font-semibold text-slate-900">{data.metrics.vendas}</td>
                    <td className="text-center py-3 px-4">
                      <Badge className="bg-green-100 text-green-800">{data.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {performanceData.map((data) => (
          <Card key={data.persona} className="border-slate-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <PersonaAvatar name={data.persona} size="md" />
                  <div>
                    <CardTitle>{data.persona}</CardTitle>
                    <CardDescription>Budget: {data.budget}</CardDescription>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">{data.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Metrics Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-blue-50 rounded p-3 text-center">
                  <p className="text-xs text-slate-600">Conversão</p>
                  <p className="text-lg font-bold text-blue-600">{data.metrics.conversao}%</p>
                </div>
                <div className="bg-pink-50 rounded p-3 text-center">
                  <p className="text-xs text-slate-600">Engajamento</p>
                  <p className="text-lg font-bold text-pink-600">{data.metrics.engajamento}%</p>
                </div>
                <div className="bg-purple-50 rounded p-3 text-center">
                  <p className="text-xs text-slate-600">ROI</p>
                  <p className="text-lg font-bold text-purple-600">{data.metrics.roi}%</p>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="space-y-2 border-t border-slate-100 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Alcance</span>
                  <span className="font-semibold text-slate-900">{(data.metrics.alcance / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Cliques</span>
                  <span className="font-semibold text-slate-900">{data.metrics.cliques.toLocaleString('pt-BR')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Vendas</span>
                  <span className="font-semibold text-slate-900">{data.metrics.vendas}</span>
                </div>
              </div>

              {/* Recommendation */}
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-xs text-yellow-900">
                  <strong>💡 Recomendação:</strong> {data.recomendacao}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Budget Allocation Recommendation */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💰 Recomendação de Alocação de Budget</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {performanceData.map((data) => {
              const percentage = (data.metrics.roi / totalMetrics.roiMedio * 100).toFixed(0);
              return (
                <div key={data.persona}>
                  <div className="flex justify-between mb-2">
                    <span className="font-medium text-slate-900">{data.persona}</span>
                    <span className="font-bold text-slate-900">{percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-slate-600 pt-4 border-t border-slate-300">
            Baseado no ROI de cada persona. Personas com melhor ROI devem receber mais budget para maximizar retorno.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
