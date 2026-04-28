import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, BarChart3, Download, Loader2, TrendingUp, Target, Users } from "lucide-react";

export default function RelatoriosAgendadosSection() {
  const { data: campanhas = [], isLoading } = trpc.campaigns.listar.useQuery(undefined, { refetchInterval: 60_000 });
  const { data: posts = [] } = trpc.influencers.getAllPosts.useQuery({ limit: 500 });
  type Camp = (typeof campanhas)[number];
  type Post = (typeof posts)[number];

  const totalOrcamento = campanhas.reduce((s: number, c: Camp) => s + (Number(c.orcamento) || 0), 0);
  const totalConversoes = campanhas.reduce((s: number, c: Camp) => s + (Number(c.performance.conversoes) || 0), 0);
  const avgROI = campanhas.length > 0
    ? campanhas.reduce((s: number, c: Camp) => s + (Number(c.performance.roi) || 0), 0) / campanhas.length
    : 0;
  const ativas = campanhas.filter((c: Camp) => c.status === 'ativa');
  const totalPosts = posts.length;

  // Group campaigns by platform
  const byPlat: Record<string, { count: number; orcamento: number; conversoes: number; roi: number }> = {};
  campanhas.forEach((c: Camp) => {
    const p = c.plataforma || "outros";
    if (!byPlat[p]) byPlat[p] = { count: 0, orcamento: 0, conversoes: 0, roi: 0 };
    byPlat[p].count++;
    byPlat[p].orcamento += Number(c.orcamento) || 0;
    byPlat[p].conversoes += Number(c.performance.conversoes) || 0;
    byPlat[p].roi += Number(c.performance.roi) || 0;
  });

  // Group posts by influencer
  const byInf: Record<string, number> = {};
  posts.forEach((p: Post) => {
    byInf[p.influencerName] = (byInf[p.influencerName] || 0) + 1;
  });

  const exportarRelatorio = () => {
    const hoje = new Date().toLocaleDateString('pt-BR');
    const linhas = [
      `RELATÓRIO FEMINNITA PIJAMAS — ${hoje}`,
      `${'='.repeat(50)}`,
      ``,
      `📊 CAMPANHAS`,
      `Campanhas ativas: ${ativas.length} / ${campanhas.length} total`,
      `Orçamento total: R$ ${totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      `Conversões totais: ${totalConversoes}`,
      `ROI médio: ${avgROI.toFixed(0)}%`,
      ``,
      `📱 POR PLATAFORMA`,
      ...Object.entries(byPlat).map(([p, d]) =>
        `  ${p}: ${d.count} camp. | R$ ${d.orcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | ${d.conversoes} conv. | ROI ${d.count > 0 ? (d.roi/d.count).toFixed(0) : 0}%`
      ),
      ``,
      `✍️ CONTEÚDO`,
      `Posts criados: ${totalPosts}`,
      ...Object.entries(byInf).map(([inf, n]) => `  ${inf}: ${n} posts`),
      ``,
      `🎯 TOP 5 CAMPANHAS POR ROI`,
      ...[...campanhas]
        .sort((a: Camp, b: Camp) => (Number(b.performance.roi) || 0) - (Number(a.performance.roi) || 0))
        .slice(0, 5)
        .map((c: Camp) => `  ${c.nome} (${c.plataforma}): ROI ${c.performance.roi || 0}% | ${c.performance.conversoes || 0} conv.`),
    ];

    const blob = new Blob([linhas.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-feminnita-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#6B1D28' }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Relatórios</h2>
          <p className="text-slate-500 text-sm mt-1">Visão consolidada em tempo real. Exporte para compartilhar com a equipe.</p>
        </div>
        <Button style={{ backgroundColor: '#6B1D28' }} className="text-white" onClick={exportarRelatorio}>
          <Download className="w-4 h-4 mr-2" />
          Exportar Relatório
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Campanhas Ativas", value: ativas.length, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: "Orçamento Total", value: `R$ ${totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
          { label: "Conversões", value: totalConversoes, icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: "ROI Médio", value: `${avgROI.toFixed(0)}%`, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map(({ label, value, icon: Icon, color, bg }, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="pt-5">
              <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-xs text-slate-500 mt-1">{label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conteúdo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* By platform */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: '#6B1D28' }} />
              Performance por Plataforma
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(byPlat).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Nenhuma campanha cadastrada.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(byPlat).map(([plat, d]) => (
                  <div key={plat} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                    <div>
                      <p className="text-sm font-medium text-slate-800 capitalize">{plat}</p>
                      <p className="text-xs text-slate-400">{d.count} camp. · {d.conversoes} conv.</p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      ROI {d.count > 0 ? (d.roi / d.count).toFixed(0) : 0}%
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Posts by influencer */}
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="w-4 h-4" style={{ color: '#6B1D28' }} />
              Posts por Influencer ({totalPosts} total)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(byInf).length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">Nenhum post criado ainda.</p>
            ) : (
              <div className="space-y-2">
                {Object.entries(byInf)
                  .sort(([, a], [, b]) => b - a)
                  .map(([inf, n], i) => (
                    <div key={inf} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: ['#6B1D28','#A63D4A','#6B7A3A','#3A5A6B'][i % 4] }}>
                          {inf[0]}
                        </div>
                        <p className="text-sm font-medium text-slate-800">{inf}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">{n} posts</Badge>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top 5 campaigns */}
      {campanhas.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText className="w-4 h-4" style={{ color: '#6B1D28' }} />
              Top Campanhas por ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...campanhas]
                .sort((a: Camp, b: Camp) => (Number(b.performance.roi) || 0) - (Number(a.performance.roi) || 0))
                .slice(0, 5)
                .map((c: Camp, i: number) => (
                  <div key={c.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-slate-300">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium text-slate-800">{c.nome}</p>
                        <p className="text-xs text-slate-400">{c.plataforma} · {c.performance.conversoes || 0} conversões</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: '#6B1D28' }}>{c.performance.roi || 0}%</p>
                      <p className="text-xs text-slate-400">ROI</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {campanhas.length === 0 && posts.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
          <FileText className="w-10 h-10 mx-auto mb-3 text-slate-300" />
          <p className="text-slate-500 text-sm">Nenhum dado disponível.</p>
          <p className="text-xs text-slate-400 mt-1">Crie campanhas e influencers para ver relatórios reais.</p>
        </div>
      )}
    </div>
  );
}
