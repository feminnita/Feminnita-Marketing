import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Zap, DollarSign } from 'lucide-react';

interface PersonaLTV {
  persona: string;
  ltv: number;
  ltvMedio: number;
  crescimento: number;
  clientes: number;
  ticketMedio: number;
  frequenciaCompra: number;
  retencao: number;
  projecao12m: number;
}

interface MetricaLTV {
  label: string;
  valor: string | number;
  mudanca: string;
  cor: string;
}

export function DashboardLTVPersonaSection() {
  const [personas] = useState<PersonaLTV[]>([
    {
      persona: 'Carol',
      ltv: 2340,
      ltvMedio: 2100,
      crescimento: 11.4,
      clientes: 1240,
      ticketMedio: 189,
      frequenciaCompra: 12.4,
      retencao: 82,
      projecao12m: 2890,
    },
    {
      persona: 'Renata',
      ltv: 1950,
      ltvMedio: 1800,
      crescimento: 8.3,
      clientes: 980,
      ticketMedio: 165,
      frequenciaCompra: 11.8,
      retencao: 75,
      projecao12m: 2280,
    },
    {
      persona: 'Vanessa',
      ltv: 1620,
      ltvMedio: 1500,
      crescimento: 8.0,
      clientes: 1120,
      ticketMedio: 142,
      frequenciaCompra: 11.4,
      retencao: 68,
      projecao12m: 1890,
    },
    {
      persona: 'Luiza',
      ltv: 1380,
      ltvMedio: 1350,
      crescimento: 2.2,
      clientes: 850,
      ticketMedio: 128,
      frequenciaCompra: 10.8,
      retencao: 62,
      projecao12m: 1520,
    },
  ]);

  const [metricas] = useState<MetricaLTV[]>([
    { label: 'LTV Médio Total', valor: 'R$ 1.822', mudanca: '↑ 8.5% vs período anterior', cor: 'text-green-600' },
    { label: 'LTV Máximo (Carol)', valor: 'R$ 2.340', mudanca: '↑ 11.4% vs período anterior', cor: 'text-green-600' },
    { label: 'Projeção 12 Meses', valor: 'R$ 2.145', mudanca: '↑ 17.7% vs LTV atual', cor: 'text-green-600' },
    { label: 'Oportunidade de Upsell', valor: 'R$ 412K', mudanca: '↑ 23% vs mês anterior', cor: 'text-green-600' },
  ]);

  const getLTVColor = (ltv: number) => {
    if (ltv >= 2200) return 'bg-green-100 text-green-800';
    if (ltv >= 1800) return 'bg-blue-100 text-blue-800';
    if (ltv >= 1500) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Lifetime Value (LTV) por Persona</h2>
          <p className="text-slate-600 mt-1">Quanto cada persona vale ao longo do tempo com projeções de crescimento</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metricas.map((metrica, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{metrica.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{metrica.valor}</div>
              <p className={`text-xs ${metrica.cor} mt-1`}>{metrica.mudanca}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparação de LTV */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-green-600" />
            LTV Atual vs Projeção 12 Meses
          </CardTitle>
          <CardDescription>Crescimento esperado por persona</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {personas.map((p) => (
              <div key={p.persona} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-slate-900">{p.persona}</div>
                  <Badge className={getLTVColor(p.ltv)}>LTV: R$ {p.ltv.toLocaleString('pt-BR')}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-slate-600 mb-1">LTV Atual</div>
                    <div className="text-lg font-bold text-slate-900">R$ {p.ltv.toLocaleString('pt-BR')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl text-green-600">→</div>
                    <div className="text-xs text-slate-600">+{p.crescimento}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 mb-1">Projeção 12m</div>
                    <div className="text-lg font-bold text-green-600">R$ {p.projecao12m.toLocaleString('pt-BR')}</div>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 mb-3">
                  <div className="h-2 bg-green-500 rounded-full" style={{ width: `${(p.ltv / p.projecao12m) * 100}%` }}></div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-slate-600">Clientes</div>
                    <div className="font-semibold text-slate-900">{p.clientes.toLocaleString('pt-BR')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Ticket Médio</div>
                    <div className="font-semibold text-slate-900">R$ {p.ticketMedio}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Frequência</div>
                    <div className="font-semibold text-slate-900">{p.frequenciaCompra}x/ano</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Retenção</div>
                    <div className="font-semibold text-slate-900">{p.retencao}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Oportunidades de Upsell */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Oportunidades de Upsell
          </CardTitle>
          <CardDescription>Como aumentar LTV de cada persona</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                persona: 'Carol',
                oportunidade: 'Bundle Premium (Pijama + Robe)',
                impacto: '+R$ 550 LTV',
                potencial: '23%',
              },
              {
                persona: 'Renata',
                oportunidade: 'Programa VIP com Frete Grátis',
                impacto: '+R$ 330 LTV',
                potencial: '17%',
              },
              {
                persona: 'Vanessa',
                oportunidade: 'Assinatura Mensal (Coleção Nova)',
                impacto: '+R$ 270 LTV',
                potencial: '17%',
              },
              {
                persona: 'Luiza',
                oportunidade: 'Desconto por Volume (3+ peças)',
                impacto: '+R$ 140 LTV',
                potencial: '10%',
              },
            ].map((opp, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-slate-900">{opp.persona}</div>
                    <div className="text-sm text-slate-600 mt-1">{opp.oportunidade}</div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800 mb-1">{opp.impacto}</Badge>
                    <div className="text-xs text-slate-600">{opp.potencial} crescimento</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Target className="w-5 h-5" />
            Insights de LTV
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Carol é 70% mais valiosa que Luiza</div>
                <div className="text-sm text-slate-600">LTV R$ 2.340 vs R$ 1.380. Investir em estratégia Carol para outras personas</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Projeção 12m: +17.7% crescimento</div>
                <div className="text-sm text-slate-600">Se manter retenção atual e aumentar ticket médio em 8%</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-yellow-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Oportunidade total: +R$ 1.290 LTV</div>
                <div className="text-sm text-slate-600">Implementar 4 estratégias de upsell = +R$ 412K receita anual</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
