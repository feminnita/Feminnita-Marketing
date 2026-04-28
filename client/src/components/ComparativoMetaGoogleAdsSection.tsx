import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, BarChart3, AlertCircle, Loader2 } from "lucide-react";

const PLAT_META = ["meta", "instagram", "facebook", "instagram_ads", "meta_ads"];
const PLAT_GOOGLE = ["google", "googleads", "google_ads", "google ads"];

function normPlat(p: string | null | undefined): "meta" | "google" | "outro" {
  const s = (p ?? "").toLowerCase().replace(/\s+/g, "_");
  if (PLAT_META.some(k => s.includes(k))) return "meta";
  if (PLAT_GOOGLE.some(k => s.includes(k))) return "google";
  return "outro";
}

export const ComparativoMetaGoogleAdsSection = () => {
  const { data: campanhas = [], isLoading } = trpc.campaigns.listar.useQuery(undefined, { refetchInterval: 60_000 });
  type Camp = (typeof campanhas)[number];

  const metaCamps   = campanhas.filter((c: Camp) => normPlat(c.plataforma) === "meta");
  const googleCamps = campanhas.filter((c: Camp) => normPlat(c.plataforma) === "google");

  type PlatStats = { impressoes: number; cliques: number; conversoes: number; orcamento: number; roi: number; count: number };
  const calcStats = (camps: Camp[]): PlatStats => ({
    impressoes: camps.reduce((s: number, c: Camp) => s + (Number(c.performance.impressoes) || 0), 0),
    cliques:    camps.reduce((s: number, c: Camp) => s + (Number(c.performance.cliques) || 0), 0),
    conversoes: camps.reduce((s: number, c: Camp) => s + (Number(c.performance.conversoes) || 0), 0),
    orcamento:  camps.reduce((s: number, c: Camp) => s + (Number(c.orcamento) || 0), 0),
    roi: camps.length > 0 ? camps.reduce((s: number, c: Camp) => s + (Number(c.performance.roi) || 0), 0) / camps.length : 0,
    count: camps.length,
  });

  const meta   = calcStats(metaCamps);
  const google = calcStats(googleCamps);

  const hasData = metaCamps.length > 0 || googleCamps.length > 0;

  const ctr = (stats: PlatStats) =>
    stats.impressoes > 0 ? ((stats.cliques / stats.impressoes) * 100).toFixed(2) + "%" : "—";

  const platforms = [
    { label: "Meta (Facebook + Instagram)", stats: meta, color: "#1877F2", bg: "#EFF6FF" },
    { label: "Google Ads", stats: google, color: "#EA4335", bg: "#FEF2F2" },
  ];

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#6B1D28' }} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Meta vs Google Ads</h2>
        <p className="text-slate-500 text-sm mt-1">Comparativo de performance baseado nas suas campanhas cadastradas.</p>
      </div>

      {!hasData ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Nenhuma campanha Meta ou Google encontrada</p>
                <p className="text-sm text-slate-500 mt-1">
                  Crie campanhas na aba <strong>Marketing &gt; Campanhas</strong> e defina a plataforma como "meta", "instagram" ou "google" para ver o comparativo aqui.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Platform cards */}
          <div className="grid md:grid-cols-2 gap-4">
            {platforms.map(({ label, stats, color, bg }) => (
              <Card key={label} className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center justify-between">
                    <span style={{ color }}>{label}</span>
                    <Badge variant="secondary">{stats.count} camp.</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {stats.count === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center">Nenhuma campanha cadastrada.</p>
                  ) : (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "Impressões", value: stats.impressoes > 0 ? stats.impressoes.toLocaleString('pt-BR') : "—" },
                          { label: "Cliques", value: stats.cliques > 0 ? stats.cliques.toLocaleString('pt-BR') : "—" },
                          { label: "Conversões", value: stats.conversoes.toLocaleString('pt-BR') },
                          { label: "CTR", value: ctr(stats) },
                        ].map(({ label: l, value }) => (
                          <div key={l} className="rounded-xl p-3 text-center" style={{ backgroundColor: bg }}>
                            <p className="text-xs text-slate-500">{l}</p>
                            <p className="font-bold text-slate-800 mt-0.5">{value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-3 grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-slate-500">Orçamento</p>
                          <p className="font-semibold text-slate-800">R$ {stats.orcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">ROI Médio</p>
                          <p className="font-semibold" style={{ color }}>{stats.roi.toFixed(0)}%</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Head-to-head comparison */}
          {metaCamps.length > 0 && googleCamps.length > 0 && (
            <Card className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" style={{ color: '#6B1D28' }} />
                  Comparativo Direto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { label: "Campanhas", meta: meta.count, google: google.count, format: (v: number) => String(v) },
                    { label: "Conversões", meta: meta.conversoes, google: google.conversoes, format: (v: number) => v.toLocaleString('pt-BR') },
                    { label: "Orçamento (R$)", meta: meta.orcamento, google: google.orcamento, format: (v: number) => v.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) },
                    { label: "ROI Médio (%)", meta: meta.roi, google: google.roi, format: (v: number) => v.toFixed(0) + "%" },
                  ].map(({ label: l, meta: mv, google: gv, format }) => {
                    const winner = mv >= gv ? "meta" : "google";
                    return (
                      <div key={l} className="grid grid-cols-3 items-center gap-2 p-2 rounded-lg bg-slate-50">
                        <div className="text-right text-sm">
                          <span className={`font-semibold ${winner === "meta" ? "text-blue-600" : "text-slate-500"}`}>{format(mv)}</span>
                        </div>
                        <p className="text-xs text-slate-500 text-center">{l}</p>
                        <div className="text-sm">
                          <span className={`font-semibold ${winner === "google" ? "text-red-600" : "text-slate-500"}`}>{format(gv)}</span>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                    <span className="text-blue-600 font-medium">Meta</span>
                    <span>vencedor em negrito</span>
                    <span className="text-red-600 font-medium">Google</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommendation */}
          {metaCamps.length > 0 && googleCamps.length > 0 && (
            <Card className="border-0 shadow-sm" style={{ backgroundColor: '#fdf0e8' }}>
              <CardContent className="pt-5">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#6B1D28' }} />
                  <div>
                    <p className="font-semibold text-slate-800">
                      {meta.roi >= google.roi
                        ? "Meta está performando melhor — considere aumentar o orçamento nessa plataforma."
                        : "Google Ads está com ROI superior — considere aumentar o orçamento no Google."}
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                      Meta ROI: <strong>{meta.roi.toFixed(0)}%</strong> · Google ROI: <strong>{google.roi.toFixed(0)}%</strong>
                      {" — "}diferença de <strong>{Math.abs(meta.roi - google.roi).toFixed(0)} pontos percentuais</strong>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
