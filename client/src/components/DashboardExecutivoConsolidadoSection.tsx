import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, ShoppingCart, Target, Activity, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

export function DashboardExecutivoConsolidadoSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery(undefined, { refetchInterval: 60_000 });

  const todas = campanhas as any[];
  const ativas = todas.filter(c => c.status === 'ativa');
  const totalConversoes = todas.reduce((s, c) => s + (c.conversoes ?? 0), 0);
  const totalImpressoes = todas.reduce((s, c) => s + (c.impressoes ?? 0), 0);
  const totalCliques = todas.reduce((s, c) => s + (c.cliques ?? 0), 0);
  const totalOrcamento = todas.reduce((s, c) => s + parseFloat(c.orcamento ?? '0'), 0);
  const roisValidos = todas.filter(c => parseFloat(c.roi ?? '0') > 0);
  const roiMedio = roisValidos.length > 0
    ? roisValidos.reduce((s, c) => s + parseFloat(c.roi ?? '0'), 0) / roisValidos.length
    : 0;
  const ctr = totalImpressoes > 0 ? (totalCliques / totalImpressoes) * 100 : 0;

  const porPlataforma = todas.reduce((acc, c) => {
    acc[c.plataforma] = (acc[c.plataforma] || 0) + (c.conversoes ?? 0);
    return acc;
  }, {} as Record<string, number>);
  const melhorPlataforma = Object.entries(porPlataforma)
    .sort(([, a], [, b]) => (b as number) - (a as number))[0];

  const kpisReais = [
    {
      label: 'Campanhas Ativas',
      valor: String(ativas.length),
      sub: `${todas.length} total`,
      cor: 'text-blue-600',
      icone: <Activity className="w-5 h-5" />,
    },
    {
      label: 'Total Conversões',
      valor: totalConversoes.toLocaleString('pt-BR'),
      sub: 'todas as campanhas',
      cor: 'text-green-600',
      icone: <ShoppingCart className="w-5 h-5" />,
    },
    {
      label: 'CTR Médio',
      valor: totalImpressoes > 0 ? `${ctr.toFixed(1)}%` : '—',
      sub: `${totalCliques.toLocaleString('pt-BR')} cliques`,
      cor: 'text-purple-600',
      icone: <Target className="w-5 h-5" />,
    },
    {
      label: 'ROI Médio',
      valor: roiMedio > 0 ? `${roiMedio.toFixed(0)}%` : '—',
      sub: `${roisValidos.length} camp. com ROI`,
      cor: 'text-orange-600',
      icone: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: 'Orçamento Total',
      valor: totalOrcamento > 0
        ? `R$ ${totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`
        : '—',
      sub: 'investido em campanhas',
      cor: 'text-green-700',
      icone: <DollarSign className="w-5 h-5" />,
    },
    {
      label: 'Melhor Canal',
      valor: melhorPlataforma ? melhorPlataforma[0] : '—',
      sub: melhorPlataforma ? `${melhorPlataforma[1]} conversões` : 'sem dados',
      cor: 'text-pink-600',
      icone: <Users className="w-5 h-5" />,
    },
  ];

  const kpisBling = [
    { label: 'LTV Médio', descricao: 'Valor por cliente ao longo do tempo' },
    { label: 'Taxa de Retenção', descricao: '% de clientes que recompram' },
    { label: 'CAC', descricao: 'Custo de aquisição de cliente' },
    { label: 'Ticket Médio', descricao: 'Valor médio por pedido' },
  ];

  const top5 = [...todas]
    .sort((a, b) => (b.conversoes ?? 0) - (a.conversoes ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard Executivo Consolidado</h2>
          <p className="text-slate-600 mt-1">KPIs calculados a partir das campanhas cadastradas</p>
        </div>
        {todas.length > 0 && (
          <Badge className="bg-blue-100 text-blue-800 text-base px-4 py-2">
            {todas.length} campanhas
          </Badge>
        )}
      </div>

      {todas.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">Nenhuma campanha cadastrada ainda.</p>
            <p className="text-sm text-slate-400 mt-1">Crie campanhas na aba Campanhas para ver KPIs reais aqui.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* KPIs reais das campanhas */}
          <div>
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">KPIs de Campanhas</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {kpisReais.map((kpi, idx) => (
                <Card key={idx} className="hover:shadow-md transition">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xs font-medium text-slate-500">{kpi.label}</CardTitle>
                      <div className={kpi.cor}>{kpi.icone}</div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold text-slate-900 mb-0.5">{kpi.valor}</div>
                    <p className="text-xs text-slate-500">{kpi.sub}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Top campanhas */}
          {top5.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Top Campanhas por Conversão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {top5.map((c: any, i) => (
                    <div key={c.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-slate-400 w-5">#{i + 1}</span>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">{c.nome}</p>
                          <p className="text-xs text-slate-500 capitalize">{c.plataforma} · {c.status}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-700 text-sm">{c.conversoes ?? 0} conv.</p>
                        <p className="text-xs text-slate-500">ROI {parseFloat(c.roi ?? '0').toFixed(0)}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* KPIs que exigem Bling ERP */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">KPIs de Clientes — Requer Bling ERP</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {kpisBling.map((kpi, idx) => (
            <Card key={idx} className="border-dashed border-slate-300 bg-slate-50">
              <CardContent className="pt-4 text-center">
                <p className="text-xs font-medium text-slate-500 mb-1">{kpi.label}</p>
                <p className="text-lg font-bold text-slate-300">—</p>
                <p className="text-xs text-slate-400 mt-1">{kpi.descricao}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Conecte o Bling ERP em <strong>Integrações &gt; Bling</strong> para calcular LTV, retenção, CAC e ticket médio com dados reais de pedidos.
        </p>
      </div>

      {/* Próximas Ações */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-900">Próximas Ações</CardTitle>
          <CardDescription>Para enriquecer o dashboard com dados completos</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 list-decimal list-inside text-sm text-slate-700">
            <li>Crie campanhas e registre impressões, cliques e conversões</li>
            <li>Conecte o Bling ERP para dados de pedidos e clientes</li>
            <li>Configure OAuth Meta para sincronização automática de campanhas Instagram/Facebook</li>
            <li>Use Smart Alerts para monitorar performance em tempo real</li>
            <li>Acompanhe o ROI por plataforma para alocar orçamento eficientemente</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
