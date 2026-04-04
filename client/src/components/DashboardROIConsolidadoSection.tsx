import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Target, Download, AlertCircle } from "lucide-react";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function DashboardROIConsolidadoSection() {
  const [periodo, setPeriodo] = useState("7dias");
  const [plataformaSelecionada, setPlataformaSelecionada] = useState("todas");

  const { data: campanhas = [], isLoading } = trpc.campaigns.listar.useQuery(undefined, {
    refetchInterval: 60_000,
  });
  type Camp = (typeof campanhas)[number];

  const campanhasFiltradas = plataformaSelecionada === "todas"
    ? campanhas
    : campanhas.filter((c: Camp) => c.plataforma === plataformaSelecionada);

  // Group by platform
  const porPlataforma: Record<string, { orcamento: number; conversoes: number; ctr: number; count: number; roi: number }> = {};
  campanhas.forEach((c: Camp) => {
    const plat = c.plataforma || "outros";
    if (!porPlataforma[plat]) porPlataforma[plat] = { orcamento: 0, conversoes: 0, ctr: 0, count: 0, roi: 0 };
    porPlataforma[plat].orcamento += Number(c.orcamento) || 0;
    porPlataforma[plat].conversoes += Number(c.performance.conversoes) || 0;
    porPlataforma[plat].ctr += (c.performance.impressoes > 0 ? c.performance.cliques / c.performance.impressoes * 100 : 0);
    porPlataforma[plat].roi += Number(c.performance.roi) || 0;
    porPlataforma[plat].count += 1;
  });

  const totalOrcamento = campanhas.reduce((s: number, c: Camp) => s + (Number(c.orcamento) || 0), 0);
  const totalConversoes = campanhas.reduce((s: number, c: Camp) => s + (Number(c.performance.conversoes) || 0), 0);
  const totalROI = campanhas.length > 0
    ? (campanhas.reduce((s: number, c: Camp) => s + (Number(c.performance.roi) || 0), 0) / campanhas.length).toFixed(0)
    : "—";
  const avgCTR = campanhas.length > 0
    ? (campanhas.reduce((s: number, c: Camp) => s + (c.performance.impressoes > 0 ? c.performance.cliques / c.performance.impressoes * 100 : 0), 0) / campanhas.length).toFixed(2)
    : "—";

  const exportarRelatorio = () => {
    const relatorio = `RELATÓRIO DE ROI CONSOLIDADO - FEMINNITA PIJAMAS
Data: ${new Date().toLocaleDateString('pt-BR')}
Período: Últimos ${periodo === "7dias" ? "7 dias" : periodo === "30dias" ? "30 dias" : "90 dias"}

=== RESUMO EXECUTIVO ===
Campanhas Ativas: ${campanhas.filter((c: Camp) => c.status === 'ativa').length}
Orçamento Total: R$ ${totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
Conversões: ${totalConversoes}
ROI Médio: ${totalROI}%
CTR Médio: ${avgCTR}%

=== POR PLATAFORMA ===
${Object.entries(porPlataforma).map(([plat, d]) => `
${plat.toUpperCase()}:
- Campanhas: ${d.count}
- Orçamento: R$ ${d.orcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Conversões: ${d.conversoes}
- CTR Médio: ${d.count > 0 ? (d.ctr / d.count).toFixed(2) : 0}%
- ROI Médio: ${d.count > 0 ? (d.roi / d.count).toFixed(0) : 0}%
`).join('')}

=== CAMPANHAS ===
${campanhasFiltradas.map((c: Camp) => `
${c.nome}:
- Plataforma: ${c.plataforma}
- Orçamento: R$ ${Number(c.orcamento).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
- Status: ${c.status}
- Conversões: ${c.performance.conversoes || 0}
- CTR: ${(c.performance.impressoes > 0 ? (c.performance.cliques / c.performance.impressoes * 100) : 0).toFixed(2)}%
- ROI: ${c.performance.roi || 0}%
`).join('')}`;

    const blob = new Blob([relatorio], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-roi-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard de ROI Consolidado</h2>
        <p className="text-slate-600">
          Unifique dados de todas as plataformas em um único dashboard com ROI por campanha.
        </p>
      </div>

      {/* Aviso receita */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Receita não disponível aqui.</strong>{" "}
              Dados de faturamento real requerem integração com Bling ERP. Os valores de ROI abaixo são os cadastrados manualmente nas campanhas.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Período</label>
          <select value={periodo} onChange={e => setPeriodo(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded">
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
            <option value="90dias">Últimos 90 dias</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Plataforma</label>
          <select value={plataformaSelecionada} onChange={e => setPlataformaSelecionada(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded">
            <option value="todas">Todas as Plataformas</option>
            {(Array.from(new Set(campanhas.map((c: Camp) => c.plataforma).filter(Boolean))) as string[]).map((p: string) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <Button onClick={exportarRelatorio} className="w-full bg-green-600 hover:bg-green-700 gap-2">
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumo Executivo */}
      <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-500 text-sm">Carregando campanhas...</p>
          ) : (
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { titulo: "Campanhas Ativas", valor: campanhas.filter((c: Camp) => c.status === 'ativa').length, icon: "🎯", cor: "text-blue-600" },
                { titulo: "Orçamento Total", valor: `R$ ${totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: "💰", cor: "text-purple-600" },
                { titulo: "Conversões", valor: totalConversoes, icon: "✅", cor: "text-orange-600" },
                { titulo: "ROI Médio", valor: totalROI !== "—" ? `${totalROI}%` : "—", icon: "📈", cor: "text-green-600" },
              ].map((item, idx) => (
                <div key={idx} className="text-center">
                  <p className="text-2xl mb-2">{item.icon}</p>
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{item.titulo}</p>
                  <p className={`text-2xl font-bold ${item.cor}`}>{item.valor}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance por Plataforma */}
      {Object.keys(porPlataforma).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Performance por Plataforma</CardTitle>
            <CardDescription>Orçamento, conversões e CTR médio por plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(porPlataforma).map(([plat, d]) => (
                <div key={plat} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900 capitalize">{plat}</h4>
                      <p className="text-xs text-slate-600">{d.count} campanha(s) · {d.conversoes} conversões</p>
                    </div>
                    {d.count > 0 && d.roi > 0 && (
                      <Badge className={d.roi / d.count >= 300 ? "bg-green-600" : d.roi / d.count >= 150 ? "bg-yellow-600" : "bg-red-600"}>
                        {(d.roi / d.count).toFixed(0)}% ROI
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <p className="text-slate-600">Orçamento</p>
                      <p className="font-bold text-slate-900">R$ {d.orcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">CTR Médio</p>
                      <p className="font-bold text-slate-900">{d.count > 0 ? (d.ctr / d.count).toFixed(2) : 0}%</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Conversões</p>
                      <p className="font-bold text-slate-900">{d.conversoes}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Campanhas Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Campanhas Detalhadas
          </CardTitle>
          <CardDescription>Performance de cada campanha</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-500 text-sm py-4 text-center">Carregando...</p>
          ) : campanhasFiltradas.length === 0 ? (
            <div className="py-8 text-center border border-dashed border-slate-300 rounded-lg">
              <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="text-slate-500 text-sm">Nenhuma campanha encontrada.</p>
              <p className="text-xs text-slate-400 mt-1">Crie campanhas na aba "Campanhas" para ver dados aqui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campanhasFiltradas.map((camp: Camp) => (
                <div key={camp.id} className={`border-2 rounded-lg p-4 ${camp.status === 'ativa' ? 'border-green-200 bg-green-50' : 'border-slate-200 bg-slate-50'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900">{camp.nome}</h4>
                      <p className="text-xs text-slate-600">{camp.plataforma}</p>
                    </div>
                    <Badge variant={camp.status === 'ativa' ? 'default' : 'secondary'}>
                      {camp.status === 'ativa' ? '✅ Ativa' : '⏸️ Pausada'}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div>
                      <p className="text-slate-600">Orçamento</p>
                      <p className="font-bold text-slate-900">R$ {Number(camp.orcamento).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">CTR</p>
                      <p className="font-bold text-slate-900">{(camp.performance.impressoes > 0 ? (camp.performance.cliques / camp.performance.impressoes * 100) : 0).toFixed(2)}%</p>
                    </div>
                    <div>
                      <p className="text-slate-600">Conversões</p>
                      <p className="font-bold text-slate-900">{camp.performance.conversoes || 0}</p>
                    </div>
                    <div>
                      <p className="text-slate-600">ROI</p>
                      <p className={`font-bold ${Number(camp.performance.roi) >= 300 ? 'text-green-600' : Number(camp.performance.roi) >= 150 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {camp.performance.roi || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para Maximizar ROI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ Priorize campanhas com ROI > 300%",
            "✅ Pause campanhas com ROI < 150%",
            "✅ Realoque budget de baixo para alto ROI",
            "✅ Teste novas audiências em campanhas top",
            "✅ Monitore CTR diariamente",
            "✅ Aumente budget gradualmente (+10-20%)",
            "✅ Mantenha histórico de 90 dias para análise",
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">{dica}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
