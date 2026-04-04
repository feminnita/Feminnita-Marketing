import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, BarChart3, AlertCircle } from "lucide-react";

const PERSONA_STYLES = [
  { bg: 'bg-rose-50',   text: 'text-rose-700',   accent: '#8B2635' },
  { bg: 'bg-purple-50', text: 'text-purple-700', accent: '#6B3A8B' },
  { bg: 'bg-blue-50',   text: 'text-blue-700',   accent: '#2563EB' },
  { bg: 'bg-orange-50', text: 'text-orange-700', accent: '#C2410C' },
];

export default function DashboardROIPersonaSection() {
  const { data: campanhas = [], isLoading } = trpc.campaigns.listar.useQuery();

  const personas = ["Carol", "Renata", "Vanessa", "Luiza"];

  const byPersona = personas.map((name, idx) => {
    const cs = (campanhas as any[]).filter(c =>
      c.nome?.toLowerCase().includes(name.toLowerCase()) ||
      c.descricao?.toLowerCase().includes(name.toLowerCase())
    );
    const totalConversoes = cs.reduce((s, c) => s + (c.performance?.conversoes ?? 0), 0);
    const totalOrcamento = cs.reduce((s, c) => s + (c.performance?.orcamentoGasto ?? 0), 0);
    const avgCTR = cs.length ? cs.reduce((s, c) => s + (c.performance?.ctr ?? 0), 0) / cs.length : 0;
    const avgROI = cs.length ? cs.reduce((s, c) => s + (c.performance?.roi ?? 0), 0) / cs.length : 0;
    const plataformas = [...new Set(cs.map((c) => c.plataforma).filter(Boolean))];
    return { name, cs, totalConversoes, totalOrcamento, avgCTR, avgROI, plataformas, style: PERSONA_STYLES[idx] };
  });

  const totalConversoes = byPersona.reduce((s, p) => s + p.totalConversoes, 0);
  const bestPersona = byPersona.reduce((best, p) => p.avgROI > best.avgROI ? p : best, byPersona[0]);

  if (isLoading) return (
    <div className="flex justify-center py-16">
      <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: '#8B2635', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>ROI por Persona</h2>
        <p className="text-slate-500 text-sm mt-1">Performance das influenciadoras baseada nas campanhas de marketing</p>
      </div>

      {(campanhas as any[]).length === 0 ? (
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-10 pb-10 text-center text-slate-400 space-y-2">
            <BarChart3 className="w-10 h-10 mx-auto" />
            <p className="text-sm">Nenhuma campanha cadastrada ainda.</p>
            <p className="text-xs">Crie campanhas na seção <strong>Campanhas</strong> para ver ROI por persona.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Global KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-slate-500">Total campanhas</p>
                <p className="text-2xl font-bold text-slate-900">{(campanhas as any[]).length}</p>
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
                <p className="text-xs text-slate-500">Melhor ROI</p>
                <p className="text-2xl font-bold text-blue-700">{bestPersona.avgROI.toFixed(2)}%</p>
                <p className="text-xs text-slate-400 mt-0.5">{bestPersona.name}</p>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="pt-5 pb-5">
                <p className="text-xs text-slate-500">Personas ativas</p>
                <p className="text-2xl font-bold text-slate-900">{byPersona.filter(p => p.cs.length > 0).length}</p>
              </CardContent>
            </Card>
          </div>

          {/* Per persona */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {byPersona.map((p) => (
              <Card key={p.name} className={`border-0 shadow-sm ${p.style.bg}`}>
                <CardHeader className="pb-2">
                  <CardTitle className={`text-lg ${p.style.text}`}>{p.name}</CardTitle>
                  <p className="text-xs text-slate-500">{p.cs.length} campanha{p.cs.length !== 1 ? 's' : ''}</p>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-500">Conversões</p>
                    <p className="text-xl font-bold text-slate-900">{p.totalConversoes.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">CTR médio</p>
                    <p className="text-base font-bold text-slate-900">{p.avgCTR.toFixed(2)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">ROI médio</p>
                    <p className="text-base font-bold text-blue-700">{p.avgROI.toFixed(2)}%</p>
                  </div>
                  {p.plataformas.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {p.plataformas.map(pl => (
                        <Badge key={pl} variant="secondary" className="text-xs capitalize">{pl}</Badge>
                      ))}
                    </div>
                  )}
                  {p.cs.length === 0 && <p className="text-xs text-slate-400 italic">Sem campanhas</p>}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" style={{ color: '#8B2635' }} />
                Campanhas por persona
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-xs text-slate-500">
                      <th className="text-left py-2 font-medium">Persona</th>
                      <th className="text-right py-2 font-medium">Campanhas</th>
                      <th className="text-right py-2 font-medium">Conversões</th>
                      <th className="text-right py-2 font-medium">CTR médio</th>
                      <th className="text-right py-2 font-medium">ROI médio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {byPersona.map(p => (
                      <tr key={p.name} className="border-b border-slate-50 hover:bg-slate-50">
                        <td className="py-2 font-medium text-slate-900">{p.name}</td>
                        <td className="text-right py-2 text-slate-600">{p.cs.length}</td>
                        <td className="text-right py-2 text-slate-600">{p.totalConversoes.toLocaleString('pt-BR')}</td>
                        <td className="text-right py-2 text-slate-600">{p.avgCTR.toFixed(2)}%</td>
                        <td className="text-right py-2 font-semibold text-green-700">{p.avgROI.toFixed(2)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
            <CardContent className="pt-4 pb-4 flex gap-3 items-start">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                <strong>LTV, CAC, Custo por Lead e Receita</strong> por persona requerem integração com
                <strong> Bling ERP</strong>. Os dados acima são baseados nas campanhas de marketing cadastradas.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
