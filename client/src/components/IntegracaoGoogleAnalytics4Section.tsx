import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, AlertCircle, Settings } from "lucide-react";

const SETUP_STEPS = [
  'Acesse Google Analytics → Admin → Propriedade → Fluxos de dados → Adicionar fluxo (Web)',
  'Copie o ID de medição (G-XXXXXXXXXX)',
  'Instale o gtag.js ou via Google Tag Manager no seu site',
  'Ative o Enhanced Ecommerce no GA4 (Admin → Propriedade → Eventos)',
  'Configure eventos: add_to_cart, begin_checkout, purchase, view_item',
  'Conecte o GA4 ao Google Ads para importar conversões',
  'Cole o ID de medição em Configurações → Integrações → Google Analytics neste painel',
];

const KEY_EVENTS = [
  { evento: 'view_item', descricao: 'Visualização de página de produto', tipo: 'Awareness' },
  { evento: 'add_to_cart', descricao: 'Adição ao carrinho', tipo: 'Consideration' },
  { evento: 'begin_checkout', descricao: 'Início do checkout', tipo: 'Intent' },
  { evento: 'purchase', descricao: 'Compra concluída', tipo: 'Conversion' },
  { evento: 'sign_up', descricao: 'Inscrição na newsletter', tipo: 'Retention' },
];

export default function IntegracaoGoogleAnalytics4Section() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery();

  const totalCliques = (campanhas as any[]).reduce((s, c) => s + (c.performance?.cliques ?? 0), 0);
  const totalConversoes = (campanhas as any[]).reduce((s, c) => s + (c.performance?.conversoes ?? 0), 0);
  const avgCTR = (campanhas as any[]).length > 0
    ? (campanhas as any[]).reduce((s, c) => s + (c.performance?.ctr ?? 0), 0) / (campanhas as any[]).length : 0;
  const convRate = totalCliques > 0 ? (totalConversoes / totalCliques * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Integração Google Analytics 4</h2>
        <p className="text-slate-500 text-sm mt-1">Sincronize dados de tráfego, conversões e comportamento de usuários</p>
      </div>

      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <strong>Google Analytics 4 não conectado.</strong> Dados de tráfego, sessões, funil e comportamento
            requerem o GA4 configurado no seu site. Abaixo estão métricas das campanhas de marketing e o guia de configuração.
          </p>
        </CardContent>
      </Card>

      {/* Campaign proxy KPIs */}
      {(campanhas as any[]).length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500">Total cliques (campanhas)</p>
              <p className="text-2xl font-bold text-slate-900">{totalCliques.toLocaleString('pt-BR')}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500">Conversões (campanhas)</p>
              <p className="text-2xl font-bold text-slate-900">{totalConversoes.toLocaleString('pt-BR')}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500">CTR médio</p>
              <p className="text-2xl font-bold text-blue-700">{avgCTR.toFixed(2)}%</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500">Taxa conversão (cliques→conv.)</p>
              <p className="text-2xl font-bold text-green-700">{convRate.toFixed(2)}%</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Setup guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="w-4 h-4" style={{ color: '#6B1D28' }} />
            Como configurar o GA4
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-3">
            {SETUP_STEPS.map((step, idx) => (
              <li key={idx} className="flex gap-3 items-start text-sm text-slate-700">
                <span className="flex-shrink-0 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                  style={{ backgroundColor: '#6B1D28' }}>
                  {idx + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Key events */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-4 h-4" style={{ color: '#6B1D28' }} />
            Eventos-chave para rastrear
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {KEY_EVENTS.map((ev, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                <div>
                  <p className="text-sm font-mono font-semibold text-slate-900">{ev.evento}</p>
                  <p className="text-xs text-slate-500">{ev.descricao}</p>
                </div>
                <Badge variant="secondary" className="text-xs">{ev.tipo}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What becomes available */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" style={{ color: '#6B1D28' }} />
            O que estará disponível após integração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 text-sm text-slate-600">
            {['Usuários únicos e sessões', 'Fontes de tráfego (orgânico, pago, social)', 'Funil completo (visita → compra)',
              'Comportamento por página', 'Distribuição por dispositivo', 'Geolocalização dos visitantes',
              'Tempo médio de sessão', 'Taxa de rejeição'].map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-slate-300">—</span>{item}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
