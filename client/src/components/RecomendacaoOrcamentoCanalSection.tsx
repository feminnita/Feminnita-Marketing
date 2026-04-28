import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, AlertCircle, BarChart3, Zap } from "lucide-react";

const CHANNEL_GUIDE = [
  {
    canal: "Meta Ads (Facebook + Instagram)",
    quando: "Produto visual, público amplo, retargeting",
    percentual: "30-40%",
    objetivo: "Awareness + Conversão",
    dica: "Comece com R$ 30-50/dia por conjunto de anúncios. Escale os que tiverem CPA abaixo de R$ 15.",
  },
  {
    canal: "Google Ads",
    quando: "Captura de intenção — quem já busca pijama",
    percentual: "20-30%",
    objetivo: "Conversão de fundo de funil",
    dica: "Foco em keywords de compra: 'pijama atacado', 'pijama adulto comprar'. Evite keywords genéricas.",
  },
  {
    canal: "TikTok Ads",
    quando: "Público jovem 18-35, conteúdo viral",
    percentual: "15-25%",
    objetivo: "Awareness + Engajamento",
    dica: "CPV alvo: R$ 0,003. Use criativos nativos (parecidos com TikTok orgânico).",
  },
  {
    canal: "Email Marketing",
    quando: "Base existente de clientes e leads",
    percentual: "5-10%",
    objetivo: "Retenção + Upsell",
    dica: "ROI mais alto do marketing digital. Priorize lista segmentada por persona.",
  },
  {
    canal: "Influencer / Orgânico",
    quando: "Construção de brand e prova social",
    percentual: "10-20%",
    objetivo: "Brand awareness + UGC",
    dica: "Micro-influenciadores (10K-100K) geralmente têm melhor ROI que mega-influenciadores.",
  },
];

export function RecomendacaoOrcamentoCanalSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery();

  // Breakdown by platform
  const byPlatform = (campanhas as any[]).reduce((acc: Record<string, { count: number; conversoes: number; roi: number }>, c) => {
    const p = c.plataforma || "outros";
    if (!acc[p]) acc[p] = { count: 0, conversoes: 0, roi: 0 };
    acc[p].count++;
    acc[p].conversoes += c.performance?.conversoes ?? 0;
    acc[p].roi += c.performance?.roi ?? 0;
    return acc;
  }, {});

  const platforms = Object.entries(byPlatform).map(([platform, data]) => ({
    platform,
    count: data.count,
    conversoes: data.conversoes,
    avgROI: data.count > 0 ? data.roi / data.count : 0,
  })).sort((a, b) => b.avgROI - a.avgROI);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Recomendação de Orçamento por Canal</h2>
        <p className="text-slate-500 text-sm mt-1">Estratégia de alocação de budget baseada em performance real e benchmarks</p>
      </div>

      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <strong>Valores de budget em R$</strong> requerem dados do Bling ERP para calcular CAC e ROI real.
            Os percentuais abaixo são referências estratégicas baseadas em benchmarks do setor de moda/atacado.
          </p>
        </CardContent>
      </Card>

      {/* Real platform performance */}
      {platforms.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: '#6B1D28' }} />
              Performance real por plataforma
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-slate-500">
                    <th className="text-left py-2 font-medium">Plataforma</th>
                    <th className="text-right py-2 font-medium">Campanhas</th>
                    <th className="text-right py-2 font-medium">Conversões</th>
                    <th className="text-right py-2 font-medium">ROI médio</th>
                  </tr>
                </thead>
                <tbody>
                  {platforms.map(p => (
                    <tr key={p.platform} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2 font-medium text-slate-900 capitalize">{p.platform}</td>
                      <td className="text-right py-2 text-slate-600">{p.count}</td>
                      <td className="text-right py-2 text-slate-600">{p.conversoes.toLocaleString('pt-BR')}</td>
                      <td className="text-right py-2 font-semibold text-green-700">{p.avgROI.toFixed(2)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Channel strategy guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Target className="w-4 h-4" style={{ color: '#6B1D28' }} />
            Estratégia de alocação por canal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {CHANNEL_GUIDE.map((c, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{c.canal}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{c.quando}</p>
                  </div>
                  <div className="text-right ml-3 flex-shrink-0">
                    <Badge variant="outline" className="text-xs">{c.percentual} do budget</Badge>
                    <p className="text-xs text-slate-400 mt-1">{c.objetivo}</p>
                  </div>
                </div>
                <div className="bg-slate-50 rounded p-2.5 mt-2">
                  <p className="text-xs text-slate-600"><Zap className="w-3 h-3 inline mr-1 text-amber-500" />{c.dica}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#6B1D28' }} />
            Regras de escalonamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold text-green-600">✓ Escalar</span> quando CPA &lt; meta e ROAS &gt; 3x por 7+ dias consecutivos</p>
            <p><span className="font-semibold text-amber-600">⚠ Otimizar</span> quando CTR &lt; 1% ou taxa de conversão &lt; 0.5%</p>
            <p><span className="font-semibold text-red-600">✗ Pausar</span> quando CPA &gt; 3x o meta após 200+ impressões</p>
            <p><span className="font-semibold text-blue-600">↔ Testar</span> no mínimo 3 criativos por grupo de anúncios antes de decidir</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
