import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle, BarChart3, ArrowDown, Zap } from "lucide-react";

const FUNIL_GUIDE = [
  {
    etapa: "Awareness (Descoberta)",
    canal: "Instagram, TikTok, Google Ads",
    objetivo: "Alcance e impressões",
    metricas: ["CPM", "Alcance", "Frequência"],
    otimizacao: "Diversificar criativos, testar audiências lookalike, aumentar frequência mínima para 3x",
  },
  {
    etapa: "Consideration (Consideração)",
    canal: "Retargeting Meta/Google, Email",
    objetivo: "Engajamento e intenção",
    metricas: ["CTR", "Tempo no site", "Páginas visitadas"],
    otimizacao: "Retargeting para quem visitou produto; email nurture com 3 touchpoints em 7 dias",
  },
  {
    etapa: "Conversion (Conversão)",
    canal: "Landing page, Checkout",
    objetivo: "Venda concluída",
    metricas: ["Taxa de conversão", "Abandono de carrinho", "CPA"],
    otimizacao: "Simplificar checkout para 2 etapas; oferecer PIX com desconto; remarketing de abandono",
  },
  {
    etapa: "Retention (Retenção)",
    canal: "Email, WhatsApp VIP",
    objetivo: "Segunda compra e LTV",
    metricas: ["Taxa de recompra", "Tempo entre compras", "LTV"],
    otimizacao: "Email 7 dias após entrega; convite VIP após 2ª compra; programa de pontos",
  },
];

const GARGALOS_COMUNS = [
  { etapa: "Awareness → Consideration", problema: "CTR < 1%", solucao: "Trocar criativo, novo gancho nos primeiros 3s" },
  { etapa: "Consideration → Conversion", problema: "Abandono de carrinho > 70%", solucao: "Simplificar checkout, oferecer PIX, recuperação por email/WhatsApp" },
  { etapa: "Conversion", problema: "CPA alto", solucao: "Refinar segmentação, excluir clientes já convertidos" },
  { etapa: "Retention", problema: "Taxa recompra < 20%", solucao: "Email pós-compra estruturado, programa de fidelidade" },
];

export function OtimizacaoFunilSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery();

  const totalConversoes = (campanhas as any[]).reduce((s, c) => s + (c.performance?.conversoes ?? 0), 0);
  const totalCliques = (campanhas as any[]).reduce((s, c) => s + (c.performance?.cliques ?? 0), 0);
  const avgCTR = (campanhas as any[]).length > 0
    ? (campanhas as any[]).reduce((s, c) => s + (c.performance?.ctr ?? 0), 0) / (campanhas as any[]).length : 0;
  const convRate = totalCliques > 0 ? (totalConversoes / totalCliques * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Otimização do Funil</h2>
        <p className="text-slate-500 text-sm mt-1">Análise e otimização de cada etapa do funil de vendas</p>
      </div>

      {/* Real KPIs from campaigns */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Campanhas</p>
            <p className="text-2xl font-bold text-slate-900">{(campanhas as any[]).length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Total cliques</p>
            <p className="text-2xl font-bold text-slate-900">{totalCliques.toLocaleString('pt-BR')}</p>
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
            <p className="text-2xl font-bold text-blue-700">{avgCTR.toFixed(2)}%</p>
          </CardContent>
        </Card>
      </div>

      {(campanhas as any[]).length > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
          <CardContent className="pt-4 pb-4 flex gap-3 items-start">
            <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              Funil completo (visitas → carrinho → checkout → compra) requer <strong>Google Analytics 4</strong>
              com ecommerce tracking e <strong>Bling ERP</strong>. Os dados acima são de campanhas de marketing.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Funnel guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" style={{ color: '#8B2635' }} />
            Estratégia por etapa do funil
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {FUNIL_GUIDE.map((f, idx) => (
              <div key={idx}>
                {idx > 0 && (
                  <div className="flex justify-center my-1">
                    <ArrowDown className="w-4 h-4 text-slate-300" />
                  </div>
                )}
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm text-slate-900">{f.etapa}</h4>
                    <Badge variant="secondary" className="text-xs">{f.canal}</Badge>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">Objetivo: <strong>{f.objetivo}</strong></p>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {f.metricas.map(m => <Badge key={m} variant="outline" className="text-xs">{m}</Badge>)}
                  </div>
                  <div className="bg-slate-50 rounded p-2.5">
                    <p className="text-xs text-slate-600"><Zap className="w-3 h-3 inline mr-1 text-amber-500" />{f.otimizacao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Common bottlenecks */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#8B2635' }} />
            Gargalos mais comuns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {GARGALOS_COMUNS.map((g, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-3">
                <div className="flex items-start justify-between mb-1.5">
                  <p className="text-xs font-medium text-slate-500">{g.etapa}</p>
                  <Badge variant="destructive" className="text-xs">{g.problema}</Badge>
                </div>
                <p className="text-sm text-slate-700">→ {g.solucao}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
