import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Target, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react";

const SETUP_STEPS = [
  { step: "1", title: "Criar propriedade GA4", desc: "Em analytics.google.com → Admin → Criar Propriedade → selecione GA4" },
  { step: "2", title: "Obter Measurement ID", desc: "Admin → Fluxos de dados → Web → copie o Measurement ID (G-XXXXXXXX)" },
  { step: "3", title: "Adicionar ao .env", desc: "VITE_GA4_MEASUREMENT_ID=G-XXXXXXXX" },
  { step: "4", title: "Instalar tag no site", desc: "Adicione o script gtag.js no <head> ou use Google Tag Manager" },
];

const METRICS_TO_TRACK = [
  { icon: "👁️", label: "Sessões", desc: "Visitas únicas à loja" },
  { icon: "🛒", label: "Conversões", desc: "Compras e add-to-cart" },
  { icon: "💰", label: "Receita", desc: "Valor dos pedidos via GA4 ecommerce" },
  { icon: "📱", label: "Canais", desc: "Organic, Paid, Social, Direct" },
  { icon: "🎯", label: "Audiências", desc: "Novos vs recorrentes, geografias" },
  { icon: "⏱️", label: "Engajamento", desc: "Tempo no site, páginas por sessão" },
];

export function GoogleAnalytics4Section() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery(undefined, { refetchInterval: 60_000 });
  type Camp = (typeof campanhas)[number];
  const totalConversoes = campanhas.reduce((s: number, c: Camp) => s + (Number(c.performance.conversoes) || 0), 0);
  const totalCliques = campanhas.reduce((s: number, c: Camp) => s + (Number(c.performance.cliques) || 0), 0);

  const ga4Id = (import.meta as any).env?.VITE_GA4_MEASUREMENT_ID;
  const connected = !!ga4Id;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Google Analytics 4</h2>
        <p className="text-slate-500 text-sm mt-1">
          Acompanhe sessões, conversões e jornada do cliente em tempo real.
        </p>
      </div>

      {/* Connection status */}
      <Card className="border-0 shadow-sm">
        <CardContent className="pt-5">
          <div className="flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${connected ? 'bg-green-50' : 'bg-slate-100'}`}>
              {connected
                ? <CheckCircle2 className="w-6 h-6 text-green-600" />
                : <AlertCircle className="w-6 h-6 text-slate-400" />}
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                {connected ? `GA4 configurado (${ga4Id})` : "GA4 não configurado"}
              </p>
              <p className="text-sm text-slate-500 mt-0.5">
                {connected ? "Dados sendo coletados" : "Siga os passos abaixo para conectar"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campaign data we already have */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <p className="text-2xl font-bold" style={{ color: '#8B2635' }}>{totalConversoes.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-slate-500 mt-1">Conversões (Campanhas)</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5">
            <p className="text-2xl font-bold text-blue-600">{totalCliques.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-slate-500 mt-1">Cliques totais</p>
          </CardContent>
        </Card>
      </div>

      {/* Setup guide */}
      {!connected && (
        <Card className="border-0 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: '#8B2635' }} />
              Como configurar o GA4
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {SETUP_STEPS.map(({ step, title, desc }) => (
              <div key={step} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: '#8B2635' }}>
                  {step}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{title}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
            <div className="mt-3 p-3 bg-slate-50 rounded-xl font-mono text-xs text-slate-700">
              VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
            </div>
            <a href="https://analytics.google.com" target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-sm font-medium mt-2" style={{ color: '#8B2635' }}>
              <ExternalLink className="w-4 h-4" />
              Abrir Google Analytics
            </a>
          </CardContent>
        </Card>
      )}

      {/* What you'll get */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            Métricas disponíveis após configuração
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {METRICS_TO_TRACK.map(({ icon, label, desc }) => (
              <div key={label} className="p-3 bg-slate-50 rounded-xl">
                <p className="text-xl mb-1">{icon}</p>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Target className="w-4 h-4 text-blue-500" />
            Eventos recomendados para Feminnita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {["purchase", "add_to_cart", "view_item", "begin_checkout", "sign_up", "page_view", "scroll", "click"].map(ev => (
              <Badge key={ev} variant="secondary" className="font-mono text-xs">{ev}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
