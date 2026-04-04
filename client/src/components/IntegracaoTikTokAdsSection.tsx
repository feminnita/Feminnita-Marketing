import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, AlertCircle, ExternalLink } from "lucide-react";

const TIKTOK_GUIDE = [
  { step: "1", title: "Criar conta TikTok Ads", desc: "ads.tiktok.com → Business Center → criar conta de anúncios" },
  { step: "2", title: "Instalar TikTok Pixel", desc: "Copiar código do pixel e adicionar ao site (ou via GTM)" },
  { step: "3", title: "Configurar catálogo", desc: "Importar produtos do Bling para o catálogo de produtos TikTok" },
  { step: "4", title: "Criar primeira campanha", desc: "Objetivo: Conversão → instalar pixel → definir orçamento diário" },
];

export function IntegracaoTikTokAdsSection() {
  const { data: campanhas = [], isLoading } = trpc.campaigns.listar.useQuery();
  const { data: statusOAuth } = trpc.oauthCallbacks.getTokenStatus.useQuery({ platform: "tiktok" } as any, {
    onError: () => {},
  } as any);

  const tiktokCampanhas = campanhas.filter((c: any) =>
    c.plataforma?.toLowerCase() === "tiktok" || c.plataforma?.toLowerCase() === "tiktok ads"
  );

  const totalConversoes = tiktokCampanhas.reduce((s: number, c: any) => s + (c.performance?.conversoes ?? 0), 0);
  const totalOrcamento = tiktokCampanhas.reduce((s: number, c: any) => s + (c.performance?.orcamentoGasto ?? 0), 0);
  const avgCTR = tiktokCampanhas.length
    ? tiktokCampanhas.reduce((s: number, c: any) => s + (c.performance?.ctr ?? 0), 0) / tiktokCampanhas.length
    : 0;
  const avgROI = tiktokCampanhas.length
    ? tiktokCampanhas.reduce((s: number, c: any) => s + (c.performance?.roi ?? 0), 0) / tiktokCampanhas.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>TikTok Ads</h2>
          <p className="text-slate-500 text-sm mt-1">Campanhas TikTok Ads registradas</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => window.open("https://ads.tiktok.com", "_blank")}>
          <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> TikTok Ads Manager
        </Button>
      </div>

      {/* Status */}
      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Integração via API TikTok não configurada. Dados abaixo são das campanhas cadastradas manualmente.
            Para dados automáticos, configure <strong>TIKTOK_ACCESS_TOKEN</strong> no .env.
          </p>
        </CardContent>
      </Card>

      {/* KPIs (real data) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Campanhas TikTok</p>
            <p className="text-2xl font-bold text-slate-900">{tiktokCampanhas.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Conversões</p>
            <p className="text-2xl font-bold text-slate-900">{totalConversoes.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">CTR médio</p>
            <p className="text-2xl font-bold text-slate-900">{avgCTR.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">ROI médio</p>
            <p className="text-2xl font-bold text-blue-700">{avgROI.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* Campaign list */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#8B2635', borderTopColor: 'transparent' }} />
        </div>
      ) : tiktokCampanhas.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-10 pb-10 text-center text-slate-400 space-y-2">
            <BarChart3 className="w-10 h-10 mx-auto" />
            <p className="text-sm">Nenhuma campanha TikTok cadastrada.</p>
            <p className="text-xs">Crie campanhas com plataforma "tiktok" na seção <strong>Campanhas</strong>.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: '#8B2635' }} />
              Campanhas TikTok
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-slate-500 text-xs">
                    <th className="text-left py-2 font-medium">Nome</th>
                    <th className="text-right py-2 font-medium">Status</th>
                    <th className="text-right py-2 font-medium">Conversões</th>
                    <th className="text-right py-2 font-medium">CTR</th>
                    <th className="text-right py-2 font-medium">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {tiktokCampanhas.map((c: any) => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2 font-medium text-slate-900">{c.nome}</td>
                      <td className="text-right py-2">
                        <Badge variant={c.status === 'ativa' ? 'default' : 'secondary'} className="text-xs">
                          {c.status}
                        </Badge>
                      </td>
                      <td className="text-right py-2 text-slate-600">{(c.performance?.conversoes ?? 0).toLocaleString('pt-BR')}</td>
                      <td className="text-right py-2 text-slate-600">{(c.performance?.ctr ?? 0).toFixed(2)}%</td>
                      <td className="text-right py-2 font-semibold text-green-700">{(c.performance?.roi ?? 0).toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Setup guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#8B2635' }} />
            Como configurar TikTok Ads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {TIKTOK_GUIDE.map((s) => (
              <div key={s.step} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#8B2635' }}>
                  {s.step}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{s.title}</p>
                  <p className="text-xs text-slate-500">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
