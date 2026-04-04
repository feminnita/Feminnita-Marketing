import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Zap, DollarSign, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const PERSONAS = ['Carol', 'Renata', 'Vanessa', 'Luiza'];

const UPSELL_ESTRATEGIAS = [
  {
    persona: 'Carol',
    oportunidade: 'Bundle Premium (Pijama + Robe)',
    impacto: 'Aumenta ticket médio por compra',
    criterio: 'Persona de renda extra — bundle maximiza valor por pedido',
  },
  {
    persona: 'Renata',
    oportunidade: 'Programa VIP com Frete Grátis',
    impacto: 'Incentiva recompra frequente',
    criterio: 'Persona lojista — frete grátis reduz barreira para pedidos maiores',
  },
  {
    persona: 'Vanessa',
    oportunidade: 'Assinatura Mensal (Coleção Nova)',
    impacto: 'Receita recorrente e previsível',
    criterio: 'Persona de grupo — assinatura garante pedidos mensais',
  },
  {
    persona: 'Luiza',
    oportunidade: 'Desconto por Volume (3+ peças)',
    impacto: 'Aumenta quantidade por pedido',
    criterio: 'Persona trendsetter — volume alto por tendência viral',
  },
];

export function DashboardLTVPersonaSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery(undefined, { refetchInterval: 60_000 });

  const todas = campanhas as any[];

  // Group by persona keyword in campaign names for proxy performance data
  const performancePorPersona = PERSONAS.map(p => {
    const campDaPersona = todas.filter(c =>
      c.nome?.toLowerCase().includes(p.toLowerCase())
    );
    const totalConv = campDaPersona.reduce((s, c) => s + (Number(c.performance?.conversoes) || 0), 0);
    const roisValidos = campDaPersona.filter(c => ( Number(c.performance?.roi) || 0) > 0);
    const roiMedio = roisValidos.length > 0
      ? roisValidos.reduce((s, c) => s + ( Number(c.performance?.roi) || 0), 0) / roisValidos.length
      : 0;
    return { persona: p, campanhas: campDaPersona.length, conversoes: totalConv, roiMedio };
  }).filter(p => p.campanhas > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-slate-900">Lifetime Value (LTV) por Persona</h2>
        <p className="text-slate-600 mt-1">Quanto cada persona vale ao longo do tempo — estratégias de crescimento de LTV</p>
      </div>

      {/* Status Bling */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">LTV requer histórico de pedidos do Bling ERP</p>
              <p className="text-sm text-slate-600 mt-1">
                Para calcular LTV real (ticket médio × frequência × retenção), conecte o Bling ERP em{' '}
                <strong>Integrações &gt; Bling ERP</strong>. Abaixo estão as métricas de campanhas por persona disponíveis agora.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de campanha por persona (dados reais) */}
      {performancePorPersona.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Performance por Persona (dados reais de campanhas)
            </CardTitle>
            <CardDescription>Campanhas com o nome da persona no título</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performancePorPersona.map(p => (
                <div key={p.persona} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{p.persona}</p>
                    <p className="text-xs text-slate-500">{p.campanhas} campanha{p.campanhas !== 1 ? 's' : ''}</p>
                  </div>
                  <div className="flex gap-4 text-right text-sm">
                    <div>
                      <p className="text-slate-500 text-xs">Conversões</p>
                      <p className="font-bold text-green-700">{p.conversoes}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">ROI Médio</p>
                      <p className="font-bold text-purple-700">{p.roiMedio > 0 ? `${p.roiMedio.toFixed(0)}%` : '—'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 text-sm">Nenhuma campanha com nome de persona encontrada.</p>
            <p className="text-xs text-slate-400 mt-1">Inclua "Carol", "Renata", "Vanessa" ou "Luiza" no nome das campanhas para ver performance por persona.</p>
          </CardContent>
        </Card>
      )}

      {/* Placeholders LTV por persona */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">LTV por Persona — Requer Bling ERP</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {PERSONAS.map(p => (
            <Card key={p} className="border-dashed border-slate-300 bg-slate-50">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-slate-700">{p}</p>
                  <Badge variant="outline" className="text-xs text-slate-400">Aguardando Bling</Badge>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                  <div><p className="text-slate-500">LTV</p><p className="font-bold">—</p></div>
                  <div><p className="text-slate-500">Ticket Médio</p><p className="font-bold">—</p></div>
                  <div><p className="text-slate-500">Retenção</p><p className="font-bold">—</p></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Estratégias de Upsell */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Estratégias de Upsell por Persona
          </CardTitle>
          <CardDescription>Como aumentar LTV de cada segmento — aplicar nas campanhas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {UPSELL_ESTRATEGIAS.map((s, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-slate-900">{s.persona}</div>
                    <div className="text-sm text-slate-700 mt-1">{s.oportunidade}</div>
                    <div className="text-xs text-slate-500 mt-1">{s.criterio}</div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 text-xs shrink-0 ml-3">{s.impacto}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fórmula LTV */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Target className="w-5 h-5" />
            Como Calcular LTV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-slate-700">
            <div className="p-3 bg-white rounded-lg border border-blue-200 font-mono text-center">
              LTV = Ticket Médio × Frequência de Compra × Tempo de Retenção
            </div>
            <div className="space-y-2">
              <p>• <strong>Ticket Médio</strong> — valor médio por pedido (extraído do Bling ERP)</p>
              <p>• <strong>Frequência de Compra</strong> — quantas vezes/ano o cliente compra</p>
              <p>• <strong>Tempo de Retenção</strong> — por quantos anos o cliente permanece ativo</p>
              <p>• <strong>Conecte o Bling ERP</strong> para calcular automaticamente por persona</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
