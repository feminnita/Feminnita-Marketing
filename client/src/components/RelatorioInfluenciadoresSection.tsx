import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, Target, AlertCircle } from "lucide-react";

const PERSONA_COLORS = [
  { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200'   },
  { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200'   },
  { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
];

const CHANNEL_RECOMMENDATIONS = [
  { persona: "Carol",   channel: "Instagram",  reason: "Persona jovem — Reels e Stories têm alto engajamento" },
  { persona: "Renata",  channel: "Facebook",   reason: "Público 30-45 anos mais presente no Facebook Ads" },
  { persona: "Vanessa", channel: "TikTok",     reason: "Conteúdo materno viraliza bem no TikTok" },
  { persona: "Luiza",   channel: "Email",      reason: "Influenciadora — listas segmentadas convertem mais" },
];

export function RelatorioInfluenciadoresSection() {
  const { data: campanhas = [], isLoading } = trpc.campaigns.listar.useQuery();

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#8B2635', borderTopColor: 'transparent' }} />
    </div>
  );

  // Group campaigns by persona (extracted from campaign name)
  const personas = ["Carol", "Renata", "Vanessa", "Luiza"];
  const byPersona = personas.map((name, idx) => {
    const cs = campanhas.filter((c: any) =>
      c.nome?.toLowerCase().includes(name.toLowerCase()) ||
      c.descricao?.toLowerCase().includes(name.toLowerCase())
    );
    const totalConversoes = cs.reduce((s: number, c: any) => s + (c.performance?.conversoes ?? 0), 0);
    const totalOrcamento = cs.reduce((s: number, c: any) => s + (c.performance?.orcamentoGasto ?? 0), 0);
    const avgCTR = cs.length
      ? cs.reduce((s: number, c: any) => s + (c.performance?.ctr ?? 0), 0) / cs.length
      : 0;
    const avgROI = cs.length
      ? cs.reduce((s: number, c: any) => s + (c.performance?.roi ?? 0), 0) / cs.length
      : 0;

    const plataformas: string[] = [...new Set<string>(cs.map((c: any) => c.plataforma).filter(Boolean))];

    return {
      name,
      cs,
      totalConversoes,
      totalOrcamento,
      avgCTR,
      avgROI,
      plataformas,
      colors: PERSONA_COLORS[idx % PERSONA_COLORS.length],
    };
  });

  const totalCampanhas = campanhas.length;
  const totalConversoes = campanhas.reduce((s: number, c: any) => s + (c.performance?.conversoes ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Relatório por Influencer</h2>
        <p className="text-slate-500 text-sm mt-1">Performance das personas baseada nas campanhas ativas</p>
      </div>

      {campanhas.length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-10 pb-10 text-center text-slate-400 space-y-2">
            <BarChart3 className="w-10 h-10 mx-auto" />
            <p className="text-sm">Nenhuma campanha cadastrada ainda.</p>
            <p className="text-xs">Crie campanhas em <strong>Campanhas</strong> para ver performance por persona.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Global KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-slate-500">Total campanhas</p>
                <p className="text-2xl font-bold text-slate-900">{totalCampanhas}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-slate-500">Total conversões</p>
                <p className="text-2xl font-bold text-slate-900">{totalConversoes.toLocaleString('pt-BR')}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-slate-500">Personas ativas</p>
                <p className="text-2xl font-bold text-slate-900">{byPersona.filter(p => p.cs.length > 0).length}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-slate-500">Plataformas</p>
                <p className="text-2xl font-bold text-slate-900">
                  {[...new Set(campanhas.map((c: any) => c.plataforma).filter(Boolean))].length}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Per persona cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {byPersona.map((p) => (
              <Card key={p.name} className={`border-0 shadow-sm ${p.colors.bg}`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-lg ${p.colors.text}`}>{p.name}</CardTitle>
                  <p className="text-xs text-slate-500">{p.cs.length} campanha{p.cs.length !== 1 ? 's' : ''}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-500">Conversões</p>
                    <p className="text-xl font-bold text-slate-900">{p.totalConversoes.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">CTR médio</p>
                    <p className="text-lg font-bold text-slate-900">{p.avgCTR.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">ROI médio</p>
                    <p className="text-lg font-bold text-blue-700">{p.avgROI.toFixed(2)}%</p>
                  </div>
                  {p.plataformas.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.plataformas.map(pl => (
                        <Badge key={pl} variant="secondary" className="text-xs">{pl}</Badge>
                      ))}
                    </div>
                  )}
                  {p.cs.length === 0 && (
                    <p className="text-xs text-slate-400 italic">Sem campanhas ainda</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Channel recommendations */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="w-4 h-4" style={{ color: '#8B2635' }} />
                Canal recomendado por persona
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {CHANNEL_RECOMMENDATIONS.map((rec, idx) => {
                  const p = byPersona.find(x => x.name === rec.persona)!;
                  return (
                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${p.colors.bg} border ${p.colors.border}`}>
                      <div className={`font-semibold text-sm w-20 flex-shrink-0 ${p.colors.text}`}>{rec.persona}</div>
                      <div>
                        <Badge variant="outline" className="text-xs mb-1">{rec.channel}</Badge>
                        <p className="text-xs text-slate-600">{rec.reason}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* LTV/Receita placeholder */}
          <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
            <CardContent className="pt-4 pb-4 flex gap-3 items-start">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-800">
                <strong>Receita, LTV e Churn</strong> por persona requerem integração com <strong>Bling ERP</strong>.
                Os dados de conversão acima são derivados das campanhas de marketing.
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
