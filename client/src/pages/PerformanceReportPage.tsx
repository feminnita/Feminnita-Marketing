import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, AlertCircle, CheckCircle2, XCircle, Download } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function PerformanceReportPage() {
  const { user } = useAuth();
  const [selectedInfluencer, setSelectedInfluencer] = useState<string>("carol");

  // Buscar estatísticas de aprovação
  const { data: stats } = trpc.postApproval.getApprovalStats.useQuery();
  
  // Dados simulados de performance por influenciadora
  const performanceData = {
    carol: {
      name: "Carol",
      totalGenerated: 24,
      approved: 18,
      rejected: 4,
      pending: 2,
      approvalRate: 75,
      avgEngagement: 4.2,
      topRejectionReason: "Falta de autenticidade",
      trend: "up",
    },
    renata: {
      name: "Renata",
      totalGenerated: 20,
      approved: 17,
      rejected: 2,
      pending: 1,
      approvalRate: 85,
      avgEngagement: 5.1,
      topRejectionReason: "Tom inadequado",
      trend: "up",
    },
    vanessa: {
      name: "Vanessa",
      totalGenerated: 22,
      approved: 16,
      rejected: 5,
      pending: 1,
      approvalRate: 73,
      avgEngagement: 3.8,
      topRejectionReason: "Design fraco",
      trend: "down",
    },
    luiza: {
      name: "Luiza",
      totalGenerated: 19,
      approved: 15,
      rejected: 3,
      pending: 1,
      approvalRate: 79,
      avgEngagement: 4.6,
      topRejectionReason: "Falta de CTA",
      trend: "up",
    },
  };

  const current = performanceData[selectedInfluencer as keyof typeof performanceData];

  const rejectionReasons = [
    { reason: "Falta de autenticidade", count: 4, percentage: 40 },
    { reason: "Tom inadequado", count: 3, percentage: 30 },
    { reason: "Design fraco", count: 2, percentage: 20 },
    { reason: "Falta de CTA", count: 1, percentage: 10 },
  ];

  const monthlyData = [
    { month: "Jan", approved: 15, rejected: 3 },
    { month: "Fev", approved: 18, rejected: 2 },
    { month: "Mar", approved: 17, rejected: 4 },
    { month: "Abr", approved: 20, rejected: 2 },
    { month: "Mai", approved: 22, rejected: 3 },
    { month: "Jun", approved: 18, rejected: 4 },
  ];

  const improvements = [
    "✅ Aumentar menção de produtos naturalmente",
    "✅ Melhorar autenticidade da voz",
    "✅ Adicionar mais emojis relevantes",
    "✅ Incluir CTA mais claro",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Relatório de Performance</h1>
          <p className="text-slate-600">Análise de aprovação e engajamento por influenciadora</p>
        </div>

        {/* Seletor de Influenciadora */}
        <div className="mb-8 flex gap-2 flex-wrap">
          {Object.entries(performanceData).map(([key, data]) => (
            <Button
              key={key}
              variant={selectedInfluencer === key ? "default" : "outline"}
              onClick={() => setSelectedInfluencer(key)}
              className="capitalize"
            >
              {data.name}
            </Button>
          ))}
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Gerado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{current.totalGenerated}</div>
              <p className="text-xs text-slate-500 mt-1">posts este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Aprovados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{current.approved}</div>
              <p className="text-xs text-slate-500 mt-1">
                <CheckCircle2 className="inline w-3 h-3 mr-1" />
                {current.approvalRate}% taxa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Rejeitados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{current.rejected}</div>
              <p className="text-xs text-slate-500 mt-1">
                <XCircle className="inline w-3 h-3 mr-1" />
                {Math.round((current.rejected / current.totalGenerated) * 100)}% taxa
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Engajamento Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{current.avgEngagement}%</div>
              <p className="text-xs text-slate-500 mt-1">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                {current.trend === "up" ? "Crescimento" : "Queda"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com Análises */}
        <Tabs defaultValue="reasons" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="reasons">Motivos de Rejeição</TabsTrigger>
            <TabsTrigger value="timeline">Histórico Mensal</TabsTrigger>
            <TabsTrigger value="improvements">Sugestões</TabsTrigger>
          </TabsList>

          {/* Motivos de Rejeição */}
          <TabsContent value="reasons">
            <Card>
              <CardHeader>
                <CardTitle>Análise de Motivos de Rejeição</CardTitle>
                <CardDescription>
                  Principais razões por que posts foram rejeitados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {rejectionReasons.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{item.reason}</span>
                        <Badge variant="secondary">{item.count} posts</Badge>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-red-500 h-2 rounded-full transition-all"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500">{item.percentage}% do total rejeitado</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex gap-2 items-start">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-sm text-amber-900">Motivo Principal</p>
                      <p className="text-sm text-amber-800 mt-1">{current.topRejectionReason}</p>
                      <p className="text-xs text-amber-700 mt-2">
                        Foco em melhorar este aspecto pode aumentar a taxa de aprovação em até 30%.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Histórico Mensal */}
          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Aprovações - Últimos 6 Meses</CardTitle>
                <CardDescription>
                  Tendência de aprovação e rejeição ao longo do tempo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {monthlyData.map((month, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-sm">{month.month}</span>
                        <span className="text-xs text-slate-500">
                          {month.approved + month.rejected} posts
                        </span>
                      </div>
                      <div className="flex gap-1 h-8">
                        <div
                          className="bg-green-500 rounded flex items-center justify-center text-white text-xs font-bold"
                          style={{
                            width: `${(month.approved / (month.approved + month.rejected)) * 100}%`,
                          }}
                        >
                          {month.approved > 0 && month.approved}
                        </div>
                        <div
                          className="bg-red-500 rounded flex items-center justify-center text-white text-xs font-bold"
                          style={{
                            width: `${(month.rejected / (month.approved + month.rejected)) * 100}%`,
                          }}
                        >
                          {month.rejected > 0 && month.rejected}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded" />
                    <span>Aprovados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded" />
                    <span>Rejeitados</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sugestões de Melhoria */}
          <TabsContent value="improvements">
            <Card>
              <CardHeader>
                <CardTitle>Sugestões de Melhoria</CardTitle>
                <CardDescription>
                  Recomendações baseadas em análise de feedback
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {improvements.map((improvement, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-green-900">{improvement}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="font-medium text-sm text-blue-900 mb-2">💡 Dica IA</p>
                  <p className="text-sm text-blue-800">
                    Com base no padrão de rejeições, recomendamos treinar a IA com exemplos de posts
                    bem-sucedidos de {current.name} para melhorar a qualidade dos próximos posts.
                  </p>
                </div>

                <Button className="w-full mt-6 gap-2">
                  <Download className="w-4 h-4" />
                  Exportar Relatório em PDF
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Resumo Geral */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Resumo Geral do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-sm text-slate-900 mb-3">Pontos Fortes</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>✨ {current.approvalRate}% de taxa de aprovação</li>
                  <li>📈 Engajamento médio de {current.avgEngagement}%</li>
                  <li>🎯 Consistência em gerar conteúdo relevante</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm text-slate-900 mb-3">Áreas de Melhoria</h4>
                <ul className="space-y-2 text-sm text-slate-700">
                  <li>🔧 Trabalhar em {current.topRejectionReason.toLowerCase()}</li>
                  <li>📝 Revisar padrão de captions rejeitadas</li>
                  <li>🎨 Melhorar variedade de temas</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
