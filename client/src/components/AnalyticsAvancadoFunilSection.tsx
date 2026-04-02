import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

const PLATAFORMA_ICON: Record<string, string> = {
  instagram: "📸", facebook: "👤", tiktok: "🎵",
  whatsapp: "💬", email: "📧",
};

const FUNIL_ECOMMERCE = [
  { stage: "Visitas ao Site", icon: "🌐", descricao: "Requer Google Analytics ou Bling ERP" },
  { stage: "Carrinho Adicionado", icon: "🛒", descricao: "Requer integração com e-commerce" },
  { stage: "Checkout Iniciado", icon: "💳", descricao: "Requer integração com e-commerce" },
  { stage: "Compra Concluída", icon: "✅", descricao: "Requer integração com Bling ERP ou Shopify" },
];

export default function AnalyticsAvancadoFunilSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery(undefined, { refetchInterval: 60_000 });

  const todas = campanhas as any[];
  const totalImpressoes = todas.reduce((s, c) => s + (c.impressoes ?? 0), 0);
  const totalCliques = todas.reduce((s, c) => s + (c.cliques ?? 0), 0);
  const totalConversoes = todas.reduce((s, c) => s + (c.conversoes ?? 0), 0);
  const ctr = totalImpressoes > 0 ? ((totalCliques / totalImpressoes) * 100) : 0;
  const taxaConvCliques = totalCliques > 0 ? ((totalConversoes / totalCliques) * 100) : 0;

  const porPlataforma = todas.reduce((acc, c) => {
    const p = c.plataforma;
    if (!acc[p]) acc[p] = { impressoes: 0, cliques: 0, conversoes: 0, orcamento: 0, rois: [] as number[] };
    acc[p].impressoes += (c.impressoes ?? 0);
    acc[p].cliques += (c.cliques ?? 0);
    acc[p].conversoes += (c.conversoes ?? 0);
    acc[p].orcamento += parseFloat(c.orcamento ?? "0");
    if (parseFloat(c.roi ?? "0") > 0) acc[p].rois.push(parseFloat(c.roi ?? "0"));
    return acc;
  }, {} as Record<string, { impressoes: number; cliques: number; conversoes: number; orcamento: number; rois: number[] }>);

  const plataformas = (Object.entries(porPlataforma) as [string, { impressoes: number; cliques: number; conversoes: number; orcamento: number; rois: number[] }][])
    .map(([plat, d]) => ({
      plat,
      ...d,
      ctr: d.impressoes > 0 ? ((d.cliques / d.impressoes) * 100).toFixed(1) : "—",
      roiMedio: d.rois.length > 0 ? (d.rois.reduce((a, b) => a + b, 0) / d.rois.length).toFixed(0) : "—",
    }))
    .sort((a, b) => b.conversoes - a.conversoes);

  const funilDisponivel = [
    { stage: "Impressões", value: totalImpressoes, icon: "👁️", color: "bg-blue-500" },
    { stage: "Cliques", value: totalCliques, icon: "🖱️", color: "bg-blue-400" },
    { stage: "Conversões (registradas)", value: totalConversoes, icon: "✅", color: "bg-green-500" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Analytics Avançado — Funil de Conversão
          </CardTitle>
          <CardDescription>
            Rastreie o funil completo. Dados de impressão/clique/conversão vêm das campanhas cadastradas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {todas.length === 0 ? (
            <div className="text-center py-10">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">Nenhuma campanha cadastrada ainda.</p>
              <p className="text-sm text-slate-400 mt-1">Crie campanhas e registre impressões, cliques e conversões para ver o funil aqui.</p>
            </div>
          ) : (
            <>
              {/* Funil disponível (dados reais) */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Funil de Campanhas (dados reais)</h3>
                <div className="space-y-2">
                  {funilDisponivel.map((stage, idx) => {
                    const pct = totalImpressoes > 0 ? (stage.value / totalImpressoes) * 100 : 0;
                    return (
                      <div key={stage.stage} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span>{stage.icon}</span>
                            <span className="font-semibold text-slate-900">{stage.stage}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-semibold text-slate-900">{stage.value.toLocaleString("pt-BR")}</span>
                            {idx > 0 && <span className="text-slate-500 text-xs ml-2">({pct.toFixed(1)}%)</span>}
                          </div>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`${stage.color} h-full rounded-full`}
                            style={{ width: idx === 0 ? "100%" : `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        {idx === 0 && totalCliques > 0 && (
                          <p className="text-xs text-slate-500">CTR: {ctr.toFixed(1)}%</p>
                        )}
                        {idx === 1 && totalConversoes > 0 && (
                          <p className="text-xs text-slate-500">Conversão sobre cliques: {taxaConvCliques.toFixed(1)}%</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Funil e-commerce (requer integração) */}
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Funil de E-commerce (requer integração)</h3>
                <div className="space-y-2">
                  {FUNIL_ECOMMERCE.map((stage) => (
                    <div key={stage.stage} className="flex items-center gap-3 p-3 border border-dashed border-slate-300 rounded-lg bg-slate-50">
                      <span className="text-xl">{stage.icon}</span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-700 text-sm">{stage.stage}</p>
                        <p className="text-xs text-slate-400">{stage.descricao}</p>
                      </div>
                      <span className="font-bold text-slate-300">—</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Performance por plataforma */}
              {plataformas.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900 mb-3">Performance por Canal (dados reais)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2 px-2 font-semibold">Canal</th>
                          <th className="text-right py-2 px-2 font-semibold">Impressões</th>
                          <th className="text-right py-2 px-2 font-semibold">Cliques</th>
                          <th className="text-right py-2 px-2 font-semibold">Conversões</th>
                          <th className="text-right py-2 px-2 font-semibold">CTR</th>
                          <th className="text-right py-2 px-2 font-semibold">ROI Médio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plataformas.map((p) => (
                          <tr key={p.plat} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-2 px-2 font-medium capitalize">
                              {PLATAFORMA_ICON[p.plat] ?? "📊"} {p.plat}
                            </td>
                            <td className="text-right py-2 px-2">{p.impressoes.toLocaleString("pt-BR")}</td>
                            <td className="text-right py-2 px-2">{p.cliques.toLocaleString("pt-BR")}</td>
                            <td className="text-right py-2 px-2 font-semibold text-green-600">{p.conversoes.toLocaleString("pt-BR")}</td>
                            <td className="text-right py-2 px-2">
                              <Badge variant="outline" className="bg-blue-50 text-xs">{p.ctr}%</Badge>
                            </td>
                            <td className="text-right py-2 px-2 font-semibold text-purple-600">
                              {p.roiMedio !== "—" ? `${p.roiMedio}%` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* KPIs reais */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-600">Impressões Totais</p>
                  <p className="text-2xl font-bold text-blue-600">{totalImpressoes.toLocaleString("pt-BR")}</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-600">CTR Médio</p>
                  <p className="text-2xl font-bold text-amber-600">{ctr > 0 ? `${ctr.toFixed(1)}%` : "—"}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-slate-600">Total Conversões</p>
                  <p className="text-2xl font-bold text-green-600">{totalConversoes.toLocaleString("pt-BR")}</p>
                </div>
              </div>
            </>
          )}

          {/* Dica */}
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="font-semibold text-purple-900 text-sm mb-2 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Para ver o funil completo (visitas, carrinho, checkout)
            </p>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• Conecte <strong>Bling ERP</strong> para dados de pedidos reais</li>
              <li>• Instale <strong>Google Analytics 4</strong> no site para rastrear visitas e carrinho</li>
              <li>• Use <strong>Meta CAPI</strong> para conversões server-side do Instagram/Facebook</li>
              <li>• Registre conversões manualmente nas campanhas para ver CTR e taxa de conversão</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
