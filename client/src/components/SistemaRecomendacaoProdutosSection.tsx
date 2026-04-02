import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, BarChart3, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

const PLATAFORMA_ICON: Record<string, string> = {
  instagram: "📸", facebook: "👤", tiktok: "🎵",
  whatsapp: "💬", email: "📧",
};

export default function SistemaRecomendacaoProdutosSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery(undefined, { refetchInterval: 60_000 });

  const todas = campanhas as any[];
  const comConversao = todas.filter(c => (c.conversoes ?? 0) > 0);
  const top5 = [...comConversao].sort((a, b) => (b.conversoes ?? 0) - (a.conversoes ?? 0)).slice(0, 5);

  const totalConversoes = todas.reduce((s, c) => s + (c.conversoes ?? 0), 0);
  const totalCampanhas = todas.length;
  const porPlataforma = todas.reduce((acc, c) => {
    acc[c.plataforma] = (acc[c.plataforma] || 0) + (c.conversoes ?? 0);
    return acc;
  }, {} as Record<string, number>);
  const melhoresPlataformas = Object.entries(porPlataforma)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3);

  const ctrMedio = (() => {
    const valid = todas.filter(c => (c.impressoes ?? 0) > 0);
    if (valid.length === 0) return 0;
    const totalImpressoes = valid.reduce((s, c) => s + (c.impressoes ?? 0), 0);
    const totalCliques = valid.reduce((s, c) => s + (c.cliques ?? 0), 0);
    return (totalCliques / totalImpressoes) * 100;
  })();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            Recomendação Baseada em Performance Real
          </CardTitle>
          <CardDescription>
            Análise de campanhas com maior conversão para identificar os melhores canais e ações.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {todas.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">Nenhuma campanha cadastrada ainda.</p>
              <p className="text-sm text-slate-400 mt-1">Crie campanhas e registre conversões para ver recomendações baseadas em dados reais.</p>
            </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <TrendingUp className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Total Conversões</p>
                  <p className="text-2xl font-bold text-blue-700">{totalConversoes.toLocaleString("pt-BR")}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <BarChart3 className="w-5 h-5 text-green-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">CTR Médio</p>
                  <p className="text-2xl font-bold text-green-700">{ctrMedio.toFixed(1)}%</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <Lightbulb className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Campanhas</p>
                  <p className="text-2xl font-bold text-purple-700">{totalCampanhas}</p>
                </div>
              </div>

              {/* Melhores canais */}
              {melhoresPlataformas.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">🏆 Canais com Mais Conversões</h3>
                  <div className="space-y-2">
                    {melhoresPlataformas.map(([plat, conv], i) => {
                      const total = (Object.values(porPlataforma) as number[]).reduce((s: number, v: number) => s + v, 0);
                      const pct = total > 0 ? Math.round(((conv as number) / total) * 100) : 0;
                      return (
                        <div key={plat} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                          <span className="text-xl">{PLATAFORMA_ICON[plat] ?? "📊"}</span>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-slate-900 capitalize">{plat}</p>
                              <Badge variant="outline" className="text-xs">{conv as number} conv.</Badge>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-1.5">
                              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <span className="text-xs font-bold text-slate-600 w-10 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Top 5 campanhas */}
              {top5.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">✨ Campanhas com Maior Conversão</h3>
                  <div className="space-y-2">
                    {top5.map((c: any, i) => (
                      <div key={c.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:border-amber-300 transition">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-slate-400 w-5">#{i + 1}</span>
                          <div>
                            <p className="font-medium text-slate-900">{c.nome}</p>
                            <p className="text-xs text-slate-500 capitalize">
                              {PLATAFORMA_ICON[c.plataforma] ?? "📊"} {c.plataforma} · {c.status}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-green-700">{c.conversoes} conv.</p>
                          <p className="text-xs text-slate-500">ROI {parseFloat(c.roi ?? "0").toFixed(0)}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Dicas */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-2">
            <p className="font-semibold text-amber-900 text-sm">💡 Como Usar as Recomendações</p>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>• <strong>Canais com mais conversão</strong> — concentre orçamento neles</li>
              <li>• <strong>Top campanhas</strong> — replique a estratégia vencedora</li>
              <li>• <strong>CTR baixo</strong> — teste novos criativos ou audiências</li>
              <li>• <strong>Registre dados no Bling</strong> para cruzar com histórico de pedidos reais</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
