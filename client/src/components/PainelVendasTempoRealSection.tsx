import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle, Zap, RefreshCw } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function PainelVendasTempoRealSection() {
  const { data: campaigns = [], dataUpdatedAt } = trpc.campaigns.listar.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  const { data: alertsData } = trpc.campaignMetricsSync.getPerformanceAlerts.useQuery(
    {},
    { refetchInterval: 60_000 }
  );

  const ativas = campaigns.filter((c: any) => c.status === "ativa");

  const totalOrcamento = ativas.reduce((s: number, c: any) => s + (Number(c.orcamento) || 0), 0);
  const totalConversoes = ativas.reduce((s: number, c: any) => s + (c.performance?.conversoes ?? 0), 0);
  const totalCliques = ativas.reduce((s: number, c: any) => s + (c.performance?.cliques ?? 0), 0);
  const taxaConversao = totalCliques > 0
    ? ((totalConversoes / totalCliques) * 100).toFixed(1)
    : "0.0";
  const ticketMedio = totalConversoes > 0 ? totalOrcamento / totalConversoes : 0;

  // Agrupar por plataforma
  const porPlataforma: Record<string, { orcamento: number; conversoes: number; cliques: number }> = {};
  for (const c of ativas) {
    const p = c.plataforma ?? "outro";
    if (!porPlataforma[p]) porPlataforma[p] = { orcamento: 0, conversoes: 0, cliques: 0 };
    porPlataforma[p].orcamento += Number(c.orcamento) || 0;
    porPlataforma[p].conversoes += c.performance?.conversoes ?? 0;
    porPlataforma[p].cliques += c.performance?.cliques ?? 0;
  }

  const plataformaEntries = Object.entries(porPlataforma).sort(([, a], [, b]) => b.conversoes - a.conversoes);
  const maxConversoes = plataformaEntries[0]?.[1]?.conversoes ?? 1;

  // Top campanhas por conversões
  const topCampaigns = [...ativas]
    .sort((a: any, b: any) => (b.conversoes ?? 0) - (a.conversoes ?? 0))
    .slice(0, 5);

  const alerts: any[] = alertsData?.alerts ?? [];

  const ultimaAtualizacao = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR")
    : "—";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Vendas em Tempo Real</h2>
          <p className="text-slate-600 mt-1">Campanhas ativas · atualiza a cada 60s</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <RefreshCw className="w-3 h-3" />
            {ultimaAtualizacao}
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Ao Vivo</span>
          </div>
        </div>
      </div>

      {ativas.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            Nenhuma campanha ativa. Crie e ative uma campanha na seção Campanhas para ver métricas aqui.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPIs Principais */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Orçamento Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  R$ {totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-slate-500 mt-1">{ativas.length} campanha{ativas.length !== 1 ? "s" : ""} ativa{ativas.length !== 1 ? "s" : ""}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Conversões</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{totalConversoes.toLocaleString("pt-BR")}</div>
                <p className="text-xs text-slate-500 mt-1">{totalCliques.toLocaleString("pt-BR")} cliques</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Ticket Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-slate-500 mt-1">por conversão</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Conversão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{taxaConversao}%</div>
                <p className="text-xs text-slate-500 mt-1">cliques → conversões</p>
              </CardContent>
            </Card>
          </div>

          {/* Performance por Canal */}
          {plataformaEntries.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Performance por Canal</CardTitle>
                <CardDescription>Conversões e orçamento por plataforma (campanhas ativas)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {plataformaEntries.map(([plataforma, data]) => (
                    <div key={plataforma} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-900 capitalize">{plataforma}</span>
                        <div className="text-right">
                          <div className="font-bold text-slate-900">{data.conversoes} conversões</div>
                          <div className="text-xs text-slate-600">
                            R$ {data.orcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-amber-500"
                          style={{ width: `${maxConversoes > 0 ? (data.conversoes / maxConversoes) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Campanhas por Conversões */}
          {topCampaigns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top Campanhas por Conversões
                </CardTitle>
                <CardDescription>Campanhas ativas com melhor desempenho</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {topCampaigns.map((camp: any, idx: number) => (
                    <div key={camp.id} className="p-3 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className="bg-amber-600 text-xs">{idx + 1}º</Badge>
                        <div>
                          <div className="font-semibold text-slate-900">{camp.nome}</div>
                          <div className="text-xs text-slate-600 capitalize">{camp.plataforma}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">{camp.conversoes ?? 0} conversões</div>
                        <div className="text-xs text-slate-600">
                          R$ {parseFloat(camp.orcamento ?? "0").toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Alertas Reais */}
          {alerts.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <AlertCircle className="w-5 h-5" />
                  Alertas e Oportunidades
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alerts.slice(0, 5).map((alert: any, idx: number) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
                      <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium text-slate-900 text-sm">{alert.alertType ?? "Alerta"}</div>
                        <div className="text-sm text-slate-600">{alert.message ?? JSON.stringify(alert)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
