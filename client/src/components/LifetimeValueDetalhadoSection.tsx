import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle, Users, BarChart3 } from "lucide-react";

const LTV_GUIDE = [
  {
    segmento: "VIP",
    criterio: "LTV > R$ 5.000 + 5+ compras",
    estrategia: "Programa de fidelidade exclusivo, acesso antecipado, atendimento premium",
    objetivo: "Maximizar LTV e NPS",
    cor: "bg-purple-50 border-purple-200",
    corText: "text-purple-700",
  },
  {
    segmento: "Ativos",
    criterio: "Compras nos últimos 60 dias",
    estrategia: "Cross-sell e upsell, lançamentos, programa de indicação",
    objetivo: "Aumentar frequência de compra",
    cor: "bg-green-50 border-green-200",
    corText: "text-green-700",
  },
  {
    segmento: "Em Risco",
    criterio: "Sem compra há 30-60 dias",
    estrategia: "Cupom de reativação, email personalizado, lembrete de produtos favoritos",
    objetivo: "Prevenir churn",
    cor: "bg-orange-50 border-orange-200",
    corText: "text-orange-700",
  },
  {
    segmento: "Dormentes",
    criterio: "Sem compra há 90+ dias",
    estrategia: "Campanha win-back, oferta especial, pesquisa de satisfação",
    objetivo: "Reativação",
    cor: "bg-red-50 border-red-200",
    corText: "text-red-700",
  },
];

const LTV_FORMULA = [
  { label: "Ticket Médio (TM)", desc: "Valor médio por compra" },
  { label: "Frequência de Compra (FC)", desc: "Compras por ano" },
  { label: "Tempo de Retenção (TR)", desc: "Anos como cliente" },
  { label: "LTV = TM × FC × TR", desc: "Ex: R$150 × 4 × 3 = R$1.800", highlight: true },
];

export function LifetimeValueDetalhadoSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery();
  const { data: blingStatus } = trpc.blingOAuth.getStatus.useQuery();

  const totalConversoes = (campanhas as any[]).reduce((s, c) => s + (c.performance?.conversoes ?? 0), 0);
  const avgROI = (campanhas as any[]).length > 0
    ? (campanhas as any[]).reduce((s, c) => s + (c.performance?.roi ?? 0), 0) / (campanhas as any[]).length
    : 0;
  const isLinked = (blingStatus as any)?.conectado;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Lifetime Value Detalhado</h2>
        <p className="text-slate-500 text-sm mt-1">Análise de LTV por segmento e estratégias de maximização</p>
      </div>

      {/* Bling status */}
      <Card className={`border-0 shadow-sm border-l-4 ${isLinked ? 'border-green-400 bg-green-50' : 'border-amber-400 bg-amber-50'}`}>
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${isLinked ? 'text-green-600' : 'text-amber-600'}`} />
          <p className={`text-sm ${isLinked ? 'text-green-800' : 'text-amber-800'}`}>
            {isLinked
              ? <><strong>Bling conectado.</strong> Dados de LTV, ticket médio e frequência de compra disponíveis no Bling.</>
              : <><strong>LTV real requer Bling ERP.</strong> O cálculo preciso de LTV depende do histórico de pedidos. Conecte o Bling em <strong>Automação Bling</strong>. Abaixo são KPIs das campanhas de marketing.</>
            }
          </p>
        </CardContent>
      </Card>

      {/* Campaign proxy KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Campanhas ativas</p>
            <p className="text-2xl font-bold text-slate-900">{(campanhas as any[]).filter((c: any) => c.status === 'ativa').length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Conversões totais</p>
            <p className="text-2xl font-bold text-slate-900">{totalConversoes.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">ROI médio</p>
            <p className="text-2xl font-bold text-blue-700">{avgROI.toFixed(2)}%</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Plataformas</p>
            <p className="text-2xl font-bold text-slate-900">
              {[...new Set((campanhas as any[]).map((c: any) => c.plataforma).filter(Boolean))].length}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* LTV formula */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="w-4 h-4" style={{ color: '#8B2635' }} />
            Como calcular o LTV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {LTV_FORMULA.map((f, idx) => (
              <div key={idx} className={`flex items-start justify-between p-3 rounded-lg ${f.highlight ? 'border-2 border-green-300 bg-green-50' : 'bg-slate-50'}`}>
                <p className={`text-sm font-mono font-semibold ${f.highlight ? 'text-green-800' : 'text-slate-800'}`}>{f.label}</p>
                <p className={`text-sm ${f.highlight ? 'text-green-700' : 'text-slate-500'}`}>{f.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Segment strategies */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: '#8B2635' }} />
            Estratégia de LTV por segmento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {LTV_GUIDE.map((seg, idx) => (
              <div key={idx} className={`border-2 rounded-lg p-4 ${seg.cor}`}>
                <div className="flex items-start justify-between mb-2">
                  <h4 className={`font-bold ${seg.corText}`}>{seg.segmento}</h4>
                  <Badge variant="outline" className="text-xs">{seg.criterio}</Badge>
                </div>
                <p className="text-sm text-slate-700 mb-1">{seg.estrategia}</p>
                <p className="text-xs text-slate-500">Objetivo: {seg.objetivo}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#8B2635' }} />
            Como aumentar o LTV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold" style={{ color: '#8B2635' }}>↑ Ticket médio:</span> Kits, combos, upgrades de produto, pijama + robe</p>
            <p><span className="font-semibold" style={{ color: '#8B2635' }}>↑ Frequência:</span> Email nurture, lançamentos sazonais, drops exclusivos VIP</p>
            <p><span className="font-semibold" style={{ color: '#8B2635' }}>↑ Retenção:</span> Programa de pontos, atendimento pós-venda, comunidade (WhatsApp VIP)</p>
            <p><span className="font-semibold" style={{ color: '#8B2635' }}>↓ Churn:</span> Detectar early signals, oferta de reativação antes dos 60 dias</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
