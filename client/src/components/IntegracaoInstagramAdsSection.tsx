import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, AlertCircle, ExternalLink, CheckCircle2 } from "lucide-react";

const SETUP_STEPS = [
  { step: "1", title: "Meta Business Manager", desc: "business.facebook.com → Criar conta de negócios" },
  { step: "2", title: "Conectar Instagram", desc: "Configurações → Contas do Instagram → Adicionar conta" },
  { step: "3", title: "Meta Pixel", desc: "Events Manager → Criar Pixel → Instalar no site" },
  { step: "4", title: "Catálogo de Produtos", desc: "Importar produtos do Bling para o Commerce Manager" },
  { step: "5", title: "Criar campanha", desc: "Objetivo: Vendas no catálogo → público → orçamento → publicar" },
];

export function IntegracaoInstagramAdsSection() {
  const { data: campanhas = [], isLoading } = trpc.campaigns.listar.useQuery();
  const { data: tokenStatus } = trpc.oauthCallbacks.getTokenStatus.useQuery(
    { platform: "instagram" } as any, { onError: () => {} } as any
  );

  const igCampanhas = (campanhas as any[]).filter(c =>
    ['instagram', 'instagram ads', 'instagram_ads', 'meta'].includes((c.plataforma ?? '').toLowerCase())
  );

  const totalConversoes = igCampanhas.reduce((s, c) => s + (c.performance?.conversoes ?? 0), 0);
  const avgCTR = igCampanhas.length
    ? igCampanhas.reduce((s, c) => s + (c.performance?.ctr ?? 0), 0) / igCampanhas.length : 0;
  const avgROI = igCampanhas.length
    ? igCampanhas.reduce((s, c) => s + (c.performance?.roi ?? 0), 0) / igCampanhas.length : 0;
  const isConnected = (tokenStatus as any)?.isActive;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Instagram Ads</h2>
          <p className="text-slate-500 text-sm mt-1">Campanhas Instagram Ads registradas</p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected
            ? <Badge className="bg-green-100 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" />Conectado</Badge>
            : <Badge variant="secondary">Não conectado</Badge>
          }
          <Button variant="outline" size="sm" onClick={() => window.open("https://business.facebook.com", "_blank")}>
            <ExternalLink className="w-3.5 h-3.5 mr-1.5" />Meta Business
          </Button>
        </div>
      </div>

      {!isConnected && (
        <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
          <CardContent className="pt-4 pb-4 flex gap-3 items-start">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Meta / Instagram não conectado. Dados abaixo são campanhas cadastradas manualmente.
              Para sincronização automática, configure <strong>META_ACCESS_TOKEN</strong> e conecte em <strong>Credenciais</strong>.
            </p>
          </CardContent>
        </Card>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Campanhas</p>
            <p className="text-2xl font-bold text-slate-900">{igCampanhas.length}</p>
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
          <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#6B1D28', borderTopColor: 'transparent' }} />
        </div>
      ) : igCampanhas.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-10 pb-10 text-center text-slate-400 space-y-2">
            <BarChart3 className="w-10 h-10 mx-auto" />
            <p className="text-sm">Nenhuma campanha Instagram cadastrada.</p>
            <p className="text-xs">Crie campanhas com plataforma "instagram" em <strong>Campanhas</strong>.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: '#6B1D28' }} />
              Campanhas Instagram
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-slate-500">
                    <th className="text-left py-2 font-medium">Nome</th>
                    <th className="text-right py-2 font-medium">Status</th>
                    <th className="text-right py-2 font-medium">Conversões</th>
                    <th className="text-right py-2 font-medium">CTR</th>
                    <th className="text-right py-2 font-medium">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {igCampanhas.map((c: any) => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2 font-medium text-slate-900">{c.nome}</td>
                      <td className="text-right py-2">
                        <Badge variant={c.status === 'ativa' ? 'default' : 'secondary'} className="text-xs">{c.status}</Badge>
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
            <TrendingUp className="w-4 h-4" style={{ color: '#6B1D28' }} />
            Como configurar Instagram Ads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SETUP_STEPS.map((s) => (
              <div key={s.step} className="flex gap-3 items-start">
                <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#6B1D28' }}>
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
