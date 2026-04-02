import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Activity, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function DashboardPerformanceRealtimeSection() {
  const { data: campaigns = [], dataUpdatedAt } = trpc.campaigns.listar.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  const { data: alertsData } = trpc.campaignMetricsSync.getPerformanceAlerts.useQuery(
    {},
    { refetchInterval: 60_000 }
  );

  const ativas = campaigns.filter((c: any) => c.status === "ativa");
  const totalImpressoes = ativas.reduce((s: number, c: any) => s + (c.impressoes ?? 0), 0);
  const totalCliques = ativas.reduce((s: number, c: any) => s + (c.cliques ?? 0), 0);
  const totalConversoes = ativas.reduce((s: number, c: any) => s + (c.conversoes ?? 0), 0);
  const totalOrcamento = ativas.reduce((s: number, c: any) => s + parseFloat(c.orcamento ?? "0"), 0);
  const avgRoi = ativas.length > 0
    ? ativas.reduce((s: number, c: any) => s + parseFloat(c.roi ?? "0"), 0) / ativas.length
    : 0;
  const ctr = totalImpressoes > 0 ? ((totalCliques / totalImpressoes) * 100).toFixed(1) : "0.0";

  const topCampaigns = [...ativas]
    .sort((a: any, b: any) => (b.impressoes ?? 0) - (a.impressoes ?? 0))
    .slice(0, 5);

  const ultimaAtualizacao = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR")
    : "—";

  const alerts: any[] = alertsData?.alerts ?? [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard de Performance</h2>
          <p className="text-slate-600">Campanhas ativas · atualiza a cada 60s</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <RefreshCw className="w-3 h-3" />
          Atualizado às {ultimaAtualizacao}
        </div>
      </div>

      {/* Métricas Agregadas */}
      <Card className="border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Métricas das Campanhas Ativas ({ativas.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ativas.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-6">
              Nenhuma campanha ativa. Crie ou ative uma campanha na seção Campanhas.
            </p>
          ) : (
            <div className="grid md:grid-cols-6 gap-3">
              {[
                { titulo: "Impressões", valor: totalImpressoes.toLocaleString("pt-BR"), icon: "👁️", cor: "text-blue-600" },
                { titulo: "Cliques", valor: totalCliques.toLocaleString("pt-BR"), icon: "🖱️", cor: "text-green-600" },
                { titulo: "Conversões", valor: totalConversoes.toLocaleString("pt-BR"), icon: "🛒", cor: "text-orange-600" },
                { titulo: "Orçamento", valor: `R$ ${totalOrcamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`, icon: "💰", cor: "text-green-600" },
                { titulo: "CTR", valor: `${ctr}%`, icon: "💬", cor: "text-purple-600" },
                { titulo: "ROI Médio", valor: `${avgRoi.toFixed(0)}%`, icon: "📈", cor: "text-red-600" },
              ].map((item, idx) => (
                <div key={idx} className="text-center p-4 bg-white rounded-lg border-2 border-slate-200">
                  <p className="text-3xl mb-2">{item.icon}</p>
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{item.titulo}</p>
                  <p className={`text-lg font-bold ${item.cor}`}>{item.valor}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top Campanhas */}
      {topCampaigns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Top Campanhas por Impressões
            </CardTitle>
            <CardDescription>Campanhas ativas com maior alcance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topCampaigns.map((camp: any, idx: number) => (
              <div key={camp.id} className="border-2 border-slate-200 rounded-lg p-4 hover:border-purple-300 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-600 text-xs">{idx + 1}º</Badge>
                    <h4 className="font-bold text-slate-900">{camp.nome}</h4>
                    <Badge variant="outline" className="text-xs capitalize">{camp.plataforma}</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-5 gap-2 text-xs">
                  <div className="p-2 bg-blue-50 rounded border border-blue-200">
                    <p className="text-slate-600">Impressões</p>
                    <p className="font-bold text-blue-600">{(camp.impressoes ?? 0).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded border border-green-200">
                    <p className="text-slate-600">Cliques</p>
                    <p className="font-bold text-green-600">{(camp.cliques ?? 0).toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="p-2 bg-orange-50 rounded border border-orange-200">
                    <p className="text-slate-600">Conversões</p>
                    <p className="font-bold text-orange-600">{camp.conversoes ?? 0}</p>
                  </div>
                  <div className="p-2 bg-purple-50 rounded border border-purple-200">
                    <p className="text-slate-600">Orçamento</p>
                    <p className="font-bold text-purple-600">R$ {parseFloat(camp.orcamento ?? "0").toLocaleString("pt-BR")}</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded border border-slate-200">
                    <p className="text-slate-600">ROI</p>
                    <p className="font-bold text-slate-900">{parseFloat(camp.roi ?? "0").toFixed(0)}%</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Funil de Conversão */}
      {totalImpressoes > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Funil de Conversão (Campanhas Ativas)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { stage: "Impressões", valor: totalImpressoes, percentual: 100, cor: "bg-blue-500" },
                { stage: "Cliques", valor: totalCliques, percentual: parseFloat(ctr), cor: "bg-green-500" },
                {
                  stage: "Conversões",
                  valor: totalConversoes,
                  percentual: totalImpressoes > 0 ? parseFloat(((totalConversoes / totalImpressoes) * 100).toFixed(2)) : 0,
                  cor: "bg-orange-500",
                },
              ].map((item, idx) => (
                <div key={idx}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-900">{item.stage}</p>
                    <p className="text-sm font-bold text-slate-600">
                      {item.valor.toLocaleString("pt-BR")} ({item.percentual}%)
                    </p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div className={`${item.cor} h-full`} style={{ width: `${Math.min(item.percentual, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alertas Reais */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Alertas de Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, 5).map((alert: any, idx: number) => (
              <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                <div className="w-2 h-2 bg-amber-600 rounded-full mt-2 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{alert.alertType ?? "Alerta"}</p>
                  <p className="text-xs text-slate-600">{alert.message ?? JSON.stringify(alert)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
