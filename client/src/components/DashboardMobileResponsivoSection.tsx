import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, BarChart3, AlertCircle, Users } from "lucide-react";

const BREAKPOINTS = [
  { label: 'Mobile', range: '0px – 640px' },
  { label: 'Tablet', range: '641px – 1024px' },
  { label: 'Desktop', range: '1025px – 1920px' },
  { label: 'Wide', range: '1921px+' },
];

export default function DashboardMobileResponsivoSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery();

  const totalConversoes = (campanhas as any[]).reduce((s, c) => s + (c.performance?.conversoes ?? 0), 0);
  const totalCliques = (campanhas as any[]).reduce((s, c) => s + (c.performance?.cliques ?? 0), 0);
  const avgROI = (campanhas as any[]).length > 0
    ? (campanhas as any[]).reduce((s, c) => s + (c.performance?.roi ?? 0), 0) / (campanhas as any[]).length : 0;
  const avgCTR = (campanhas as any[]).length > 0
    ? (campanhas as any[]).reduce((s, c) => s + (c.performance?.ctr ?? 0), 0) / (campanhas as any[]).length : 0;

  const kpis = [
    { titulo: 'Conversões', valor: totalConversoes > 0 ? totalConversoes.toLocaleString('pt-BR') : '—' },
    { titulo: 'Cliques', valor: totalCliques > 0 ? totalCliques.toLocaleString('pt-BR') : '—' },
    { titulo: 'CTR médio', valor: avgCTR > 0 ? `${avgCTR.toFixed(2)}%` : '—' },
    { titulo: 'ROI médio', valor: avgROI > 0 ? `${avgROI.toFixed(1)}%` : '—' },
  ];

  const PERSONAS = ['Carol', 'Renata', 'Vanessa', 'Luiza'];
  const porPersona = PERSONAS.map(persona => {
    const grupo = (campanhas as any[]).filter((c: any) =>
      (c.persona ?? '').toLowerCase() === persona.toLowerCase()
    );
    const conversoes = grupo.reduce((s: number, c: any) => s + (c.performance?.conversoes ?? 0), 0);
    const ctr = grupo.length > 0 ? grupo.reduce((s: number, c: any) => s + (c.performance?.ctr ?? 0), 0) / grupo.length : 0;
    return { persona, conversoes, ctr, campanhas: grupo.length };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Dashboard Mobile Responsivo</h2>
        <p className="text-slate-500 text-sm mt-1">Visualize métricas principais otimizadas para celular</p>
      </div>

      {/* Phone mockup */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Smartphone className="w-4 h-4" style={{ color: '#8B2635' }} />
            Preview mobile
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center mb-4">
            <div className="w-72 bg-black rounded-3xl p-3 shadow-2xl" style={{ aspectRatio: '9/16' }}>
              <div className="bg-white rounded-2xl h-full overflow-hidden flex flex-col">
                <div className="text-white px-4 py-2 text-xs flex justify-between items-center" style={{ backgroundColor: '#8B2635' }}>
                  <span>9:41</span>
                  <div className="flex gap-1"><span>📶</span><span>🔋</span></div>
                </div>
                <div className="text-white px-4 py-3" style={{ backgroundColor: '#8B2635' }}>
                  <h1 className="font-bold text-base">Feminnita</h1>
                  <p className="text-xs opacity-80">Dashboard</p>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {kpis.map(kpi => (
                      <div key={kpi.titulo} className="bg-slate-50 rounded-lg p-2">
                        <p className="text-xs text-slate-500">{kpi.titulo}</p>
                        <p className="text-sm font-bold text-slate-900">{kpi.valor}</p>
                      </div>
                    ))}
                  </div>
                  {(campanhas as any[]).length === 0 && (
                    <div className="text-center py-4 text-slate-400 text-xs">
                      <AlertCircle className="w-6 h-6 mx-auto mb-1" />
                      Sem campanhas
                    </div>
                  )}
                  {porPersona.filter(p => p.campanhas > 0).slice(0, 2).map(p => (
                    <div key={p.persona} className="bg-slate-50 rounded-lg p-2 text-xs">
                      <div className="flex justify-between">
                        <p className="font-semibold text-slate-900">{p.persona}</p>
                        <span className="text-blue-600">{p.ctr.toFixed(2)}% CTR</span>
                      </div>
                      <p className="text-slate-500">{p.conversoes.toLocaleString('pt-BR')} conversões</p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-slate-200 px-2 py-2 flex justify-around text-xs text-slate-400">
                  <button className="flex flex-col items-center gap-0.5">
                    <BarChart3 className="w-4 h-4" />
                    <span>Dashboard</span>
                  </button>
                  <button className="flex flex-col items-center gap-0.5">
                    <AlertCircle className="w-4 h-4" />
                    <span>Alertas</span>
                  </button>
                  <button className="flex flex-col items-center gap-0.5">
                    <Users className="w-4 h-4" />
                    <span>Personas</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            {[{ label: 'Mobile', px: '320px' }, { label: 'Tablet', px: '768px' }, { label: 'Desktop', px: '1024px' }, { label: 'Wide', px: '1920px' }].map(bp => (
              <div key={bp.label} className="bg-slate-50 rounded-lg p-3 text-center">
                <p className="text-xs text-slate-500">{bp.label}</p>
                <p className="text-base font-bold text-slate-900">{bp.px}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <Card key={kpi.titulo} className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500">{kpi.titulo}</p>
              <p className="text-2xl font-bold text-slate-900">{kpi.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Personas */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Users className="w-4 h-4" style={{ color: '#8B2635' }} />
            Personas — visualização mobile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {porPersona.filter(p => p.campanhas > 0).length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">Nenhuma campanha com persona definida.</p>
          ) : (
            <div className="space-y-2">
              {porPersona.filter(p => p.campanhas > 0).map(p => (
                <div key={p.persona} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{p.persona}</p>
                    <p className="text-xs text-slate-500">{p.campanhas} campanha(s)</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs">{p.ctr.toFixed(2)}% CTR</Badge>
                    <p className="text-xs text-slate-500 mt-0.5">{p.conversoes.toLocaleString('pt-BR')} conv.</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Breakpoints */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Breakpoints configurados (Tailwind)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {BREAKPOINTS.map(bp => (
              <div key={bp.label} className="flex justify-between p-2 bg-slate-50 rounded text-sm">
                <span className="font-semibold text-slate-900">{bp.label}</span>
                <span className="text-slate-500">{bp.range}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
