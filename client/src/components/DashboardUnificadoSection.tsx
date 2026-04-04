import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Heart, Eye, DollarSign, Target, AlertCircle, CheckCircle, ArrowUp } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function DashboardUnificadoSection() {
  const [timeRange, setTimeRange] = useState("7d");

  const { data: campanhas = [], isLoading: loadingCampanhas } = trpc.campaigns.listar.useQuery(undefined, {
    refetchInterval: 60_000,
  });
  type Camp = (typeof campanhas)[number];
  const { data: alertasData } = trpc.smartAlerts.listActiveAlerts.useQuery({}, {
    refetchInterval: 60_000,
  });
  type Alerta = NonNullable<typeof alertasData>['alerts'][number];
  const alertas = alertasData?.alerts ?? [];

  const ativas = campanhas.filter((c: Camp) => c.status === 'ativa');
  const pausadas = campanhas.filter((c: Camp) => c.status === 'pausada');
  const totalConversoes = campanhas.reduce((s: number, c: Camp) => s + (Number(c.performance.conversoes) || 0), 0);
  const totalOrcamento = campanhas.reduce((s: number, c: Camp) => s + (Number(c.orcamento) || 0), 0);
  const avgROI = campanhas.length > 0
    ? campanhas.reduce((s: number, c: Camp) => s + (Number(c.performance.roi) || 0), 0) / campanhas.length
    : 0;
  const avgCTR = campanhas.length > 0
    ? campanhas.reduce((s: number, c: Camp) => s + (c.performance.impressoes > 0 ? c.performance.cliques / c.performance.impressoes * 100 : 0), 0) / campanhas.length
    : 0;

  // Top campaigns by conversoes
  const topCampanhas = [...campanhas]
    .sort((a: Camp, b: Camp) => (Number(b.performance.conversoes) || 0) - (Number(a.performance.conversoes) || 0))
    .slice(0, 4);

  // Performance by platform
  const porPlataforma: Record<string, { conversoes: number; roi: number; count: number }> = {};
  campanhas.forEach((c: Camp) => {
    const plat = c.plataforma || 'outros';
    if (!porPlataforma[plat]) porPlataforma[plat] = { conversoes: 0, roi: 0, count: 0 };
    porPlataforma[plat].conversoes += Number(c.performance.conversoes) || 0;
    porPlataforma[plat].roi += Number(c.performance.roi) || 0;
    porPlataforma[plat].count++;
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Unificado</h2>
        <p className="text-slate-600">Visão executiva de todos os KPIs e performance das campanhas</p>
      </div>

      {/* Aviso */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Dados de seguidores e engajamento social requerem integração de API.</strong>{" "}
              Os KPIs abaixo refletem dados reais das suas campanhas. Métricas de followers/views/likes do Instagram/TikTok precisam da Graph API configurada no backend.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {["7d", "30d", "90d", "1y"].map(range => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition ${timeRange === range ? "bg-pink-500 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
          >
            {range === "7d" ? "7 dias" : range === "30d" ? "30 dias" : range === "90d" ? "90 dias" : "1 ano"}
          </button>
        ))}
      </div>

      {/* Main KPIs */}
      {loadingCampanhas ? (
        <div className="text-center py-8 text-slate-500 text-sm">Carregando campanhas...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: "Campanhas Ativas", value: ativas.length.toString(), icon: Target, color: "blue", note: `${pausadas.length} pausadas` },
            { title: "Conversões Totais", value: totalConversoes.toString(), icon: TrendingUp, color: "green", note: "Todas as campanhas" },
            { title: "Orçamento Total", value: `R$ ${totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: DollarSign, color: "purple", note: "Investimento cadastrado" },
            { title: "ROI Médio", value: avgROI > 0 ? `${avgROI.toFixed(0)}%` : "—", icon: TrendingUp, color: "emerald", note: "Média das campanhas" },
            { title: "CTR Médio", value: avgCTR > 0 ? `${avgCTR.toFixed(2)}%` : "—", icon: Eye, color: "pink", note: "Click-through rate" },
            { title: "Plataformas", value: Object.keys(porPlataforma).length.toString(), icon: Users, color: "orange", note: Object.keys(porPlataforma).join(", ") || "—" },
          ].map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <Card key={idx} className="hover:shadow-lg transition">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-slate-600 mb-1">{kpi.title}</p>
                      <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
                    </div>
                    <div className={`p-3 rounded-lg bg-${kpi.color}-100`}>
                      <Icon className={`w-6 h-6 text-${kpi.color}-600`} />
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100">
                    <span className="text-xs text-slate-500">{kpi.note}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Alertas & Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alertas.length === 0 ? (
            <div className="py-6 text-center border border-dashed border-slate-300 rounded-lg">
              <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-500" />
              <p className="text-slate-500 text-sm">Nenhum alerta ativo no momento.</p>
            </div>
          ) : (
            alertas.slice(0, 4).map((alerta: Alerta, idx: number) => (
              <div key={idx} className={`border-l-4 p-4 rounded ${
                alerta.severity === 'info' ? 'border-green-500 bg-green-50' :
                alerta.severity === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                'border-blue-500 bg-blue-50'
              }`}>
                <p className="font-semibold text-slate-900">{alerta.title}</p>
                <p className="text-sm text-slate-600 mt-1">{alerta.message}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Top Campanhas */}
      {topCampanhas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Campanhas com Melhor Performance</CardTitle>
            <CardDescription>Por número de conversões</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCampanhas.map((camp, idx) => (
                <div key={camp.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{camp.nome}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{camp.plataforma}</Badge>
                        <Badge className={camp.status === 'ativa' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                          {camp.status}
                        </Badge>
                      </div>
                    </div>
                    <span className="text-sm font-bold text-purple-600">{camp.performance.roi || 0}% ROI</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-600">Conversões</p>
                      <p className="font-bold text-slate-900">{camp.performance.conversoes || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">CTR</p>
                      <p className="font-bold text-slate-900">{(camp.performance.impressoes > 0 ? (camp.performance.cliques / camp.performance.impressoes * 100) : 0).toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Orçamento</p>
                      <p className="font-bold text-slate-900">R$ {Number(camp.orcamento).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance por Plataforma */}
      {Object.keys(porPlataforma).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance por Plataforma</CardTitle>
            <CardDescription>Conversões e ROI médio por canal</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold">Plataforma</th>
                    <th className="text-center py-3 px-4 font-semibold">Campanhas</th>
                    <th className="text-center py-3 px-4 font-semibold">Conversões</th>
                    <th className="text-center py-3 px-4 font-semibold">ROI Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(porPlataforma).map(([plat, d]) => (
                    <tr key={plat} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-semibold capitalize">{plat}</td>
                      <td className="text-center py-3 px-4">{d.count}</td>
                      <td className="text-center py-3 px-4 font-semibold text-pink-600">{d.conversoes}</td>
                      <td className="text-center py-3 px-4 font-semibold text-green-600">{d.count > 0 ? `${(d.roi / d.count).toFixed(0)}%` : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Métricas que requerem integração */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader>
          <CardTitle className="text-slate-700">📊 Métricas Requerem Integração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-600">
          <p>• <strong>Seguidores e crescimento:</strong> Instagram Graph API / TikTok API</p>
          <p>• <strong>Visualizações e likes:</strong> Instagram Graph API / TikTok API</p>
          <p>• <strong>Funil de conversão (visitas/carrinho/checkout):</strong> Google Analytics 4 / Bling ERP</p>
          <p>• <strong>Receita e vendas realizadas:</strong> Bling ERP</p>
          <p>• <strong>Custo por aquisição (CPA):</strong> Meta Ads + Bling ERP</p>
        </CardContent>
      </Card>

      {/* Export */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📊 Exportar Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <button className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium text-sm" onClick={() => {
            const content = `DASHBOARD UNIFICADO - FEMINNITA\n\nCampanhas Ativas: ${ativas.length}\nConversões: ${totalConversoes}\nOrçamento: R$ ${totalOrcamento.toFixed(2)}\nROI Médio: ${avgROI.toFixed(0)}%\nCTR Médio: ${avgCTR.toFixed(2)}%`;
            const blob = new Blob([content], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `dashboard-${new Date().toISOString().split('T')[0]}.txt`;
            a.click();
            URL.revokeObjectURL(url);
          }}>
            📥 Exportar TXT
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
