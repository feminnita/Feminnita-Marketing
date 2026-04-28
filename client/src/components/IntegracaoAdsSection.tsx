import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle, Target, Eye, MousePointerClick, ShoppingCart, Settings } from "lucide-react";

const SETUP_GUIDE = [
  { plataforma: 'Google Ads', passo: 'Acesse Google Ads → Ferramentas → API Center → Crie um projeto OAuth 2.0' },
  { plataforma: 'Google Ads', passo: 'Copie o Customer ID (XXX-XXX-XXXX) e o Developer Token' },
  { plataforma: 'Meta Ads', passo: 'Acesse Meta Business → Configurações → Usuários → Usuários do sistema → Gere token' },
  { plataforma: 'Meta Ads', passo: 'Permissões necessárias: ads_read, ads_management, business_management' },
  { plataforma: 'TikTok Ads', passo: 'Acesse TikTok for Business → Assets → Business Account → API Access' },
];

const OPTIMIZATION_TIPS = [
  { titulo: 'CPC acima de R$ 10', acao: 'Pausar o anúncio e testar novo criativo com hook diferente' },
  { titulo: 'CTR abaixo de 1%', acao: 'Trocar a imagem/vídeo e reescrever o headline' },
  { titulo: 'ROAS abaixo de 2x', acao: 'Refinar segmentação, excluir clientes já convertidos' },
  { titulo: 'CPM subindo', acao: 'Ampliar público ou experimentar novas faixas etárias' },
  { titulo: 'Frequência > 4', acao: 'Renovar criativos para evitar fadiga de anúncio' },
];

export default function IntegracaoAdsSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery();

  const googleCamps = (campanhas as any[]).filter((c: any) =>
    ['google', 'google ads', 'google shopping'].includes((c.plataforma ?? '').toLowerCase())
  );
  const metaCamps = (campanhas as any[]).filter((c: any) =>
    ['meta', 'facebook', 'instagram', 'instagram ads', 'meta ads'].includes((c.plataforma ?? '').toLowerCase())
  );
  const tiktokCamps = (campanhas as any[]).filter((c: any) =>
    ['tiktok', 'tiktok ads'].includes((c.plataforma ?? '').toLowerCase())
  );

  const totalCliques = (campanhas as any[]).reduce((s, c) => s + (c.performance?.cliques ?? 0), 0);
  const totalConversoes = (campanhas as any[]).reduce((s, c) => s + (c.performance?.conversoes ?? 0), 0);
  const avgCTR = (campanhas as any[]).length > 0
    ? (campanhas as any[]).reduce((s, c) => s + (c.performance?.ctr ?? 0), 0) / (campanhas as any[]).length : 0;
  const avgROI = (campanhas as any[]).length > 0
    ? (campanhas as any[]).reduce((s, c) => s + (c.performance?.roi ?? 0), 0) / (campanhas as any[]).length : 0;

  const platformStats = [
    { label: 'Google Ads', count: googleCamps.length, conversoes: googleCamps.reduce((s: number, c: any) => s + (c.performance?.conversoes ?? 0), 0) },
    { label: 'Meta/Instagram', count: metaCamps.length, conversoes: metaCamps.reduce((s: number, c: any) => s + (c.performance?.conversoes ?? 0), 0) },
    { label: 'TikTok', count: tiktokCamps.length, conversoes: tiktokCamps.reduce((s: number, c: any) => s + (c.performance?.conversoes ?? 0), 0) },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Integração de Ads</h2>
        <p className="text-slate-500 text-sm mt-1">Gerencie campanhas Google Ads, Meta Ads e TikTok Ads</p>
      </div>

      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Dados de impressões, gasto e CPC requerem conexão direta com as APIs do <strong>Google Ads</strong>,
            <strong> Meta Ads</strong> e <strong>TikTok Ads</strong>. Abaixo estão métricas das campanhas cadastradas neste painel.
          </p>
        </CardContent>
      </Card>

      {/* Campaign KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500 flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> Cliques totais</p>
            <p className="text-2xl font-bold text-slate-900">{totalCliques.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500 flex items-center gap-1"><ShoppingCart className="w-3 h-3" /> Conversões</p>
            <p className="text-2xl font-bold text-slate-900">{totalConversoes.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500 flex items-center gap-1"><Eye className="w-3 h-3" /> CTR médio</p>
            <p className="text-2xl font-bold text-blue-700">{avgCTR.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> ROI médio</p>
            <p className="text-2xl font-bold text-green-700">{avgROI.toFixed(1)}%</p>
          </CardContent>
        </Card>
      </div>

      {/* By platform */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="w-4 h-4" style={{ color: '#6B1D28' }} />
            Campanhas por plataforma
          </CardTitle>
        </CardHeader>
        <CardContent>
          {(campanhas as any[]).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Nenhuma campanha cadastrada. Adicione campanhas na seção de Campanhas.</p>
          ) : (
            <div className="space-y-2">
              {platformStats.filter(p => p.count > 0).map(p => (
                <div key={p.label} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{p.label}</p>
                    <p className="text-xs text-slate-500">{p.count} campanha(s)</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{p.conversoes.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-slate-400">conversões</p>
                  </div>
                </div>
              ))}
              {platformStats.every(p => p.count === 0) && (
                <p className="text-sm text-slate-400 text-center py-4">
                  Nenhuma campanha associada a Google/Meta/TikTok. Edite as campanhas e defina a plataforma.
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Setup guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="w-4 h-4" style={{ color: '#6B1D28' }} />
            Como conectar as APIs de Ads
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {SETUP_GUIDE.map((item, idx) => (
              <div key={idx} className="flex gap-3 p-3 border border-slate-200 rounded-lg">
                <Badge variant="secondary" className="text-xs flex-shrink-0 h-fit">{item.plataforma}</Badge>
                <p className="text-sm text-slate-700">{item.passo}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization tips */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Quando otimizar seus anúncios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {OPTIMIZATION_TIPS.map((tip, idx) => (
            <div key={idx} className="p-3 border border-slate-200 rounded-lg">
              <p className="text-xs font-semibold text-slate-500 mb-0.5">Se: {tip.titulo}</p>
              <p className="text-sm text-slate-700">→ {tip.acao}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
