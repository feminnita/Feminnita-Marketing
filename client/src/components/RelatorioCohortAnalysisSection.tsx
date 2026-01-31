import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart3, TrendingUp, Users, DollarSign } from 'lucide-react';

interface CohortData {
  cohort: string;
  m0: number;
  m1: number;
  m2: number;
  m3: number;
  m4: number;
  m5: number;
  m6: number;
  ltv: number;
  churnRate: number;
}

interface MetricaCohort {
  label: string;
  valor: string | number;
  mudanca: string;
  cor: string;
}

export function RelatorioCohortAnalysisSection() {
  const [cohorts] = useState<CohortData[]>([
    { cohort: 'Jan 2026', m0: 100, m1: 92, m2: 87, m3: 82, m4: 78, m5: 75, m6: 72, ltv: 1850, churnRate: 28 },
    { cohort: 'Dez 2025', m0: 120, m1: 110, m2: 104, m3: 98, m4: 93, m5: 89, m6: 85, ltv: 2180, churnRate: 29 },
    { cohort: 'Nov 2025', m0: 95, m1: 87, m2: 81, m3: 76, m4: 72, m5: 68, m6: 65, ltv: 1670, churnRate: 32 },
    { cohort: 'Out 2025', m0: 110, m1: 100, m2: 93, m3: 87, m4: 82, m5: 78, m6: 74, ltv: 1920, churnRate: 33 },
    { cohort: 'Set 2025', m0: 85, m1: 77, m2: 71, m3: 66, m4: 62, m5: 59, m6: 56, ltv: 1440, churnRate: 34 },
  ]);

  const [metricas] = useState<MetricaCohort[]>([
    { label: 'LTV Médio', valor: 'R$ 1.812', mudanca: '↑ 8% vs período anterior', cor: 'text-green-600' },
    { label: 'Churn Rate Médio', valor: '31.2%', mudanca: '↓ 2% vs período anterior', cor: 'text-green-600' },
    { label: 'Retenção M6', valor: '72%', mudanca: '↑ 5% vs período anterior', cor: 'text-green-600' },
    { label: 'Repeat Purchase Rate', valor: '58%', mudanca: '↑ 12% vs período anterior', cor: 'text-green-600' },
  ]);

  const getRetencaoColor = (valor: number) => {
    if (valor >= 90) return 'bg-green-100 text-green-800';
    if (valor >= 80) return 'bg-green-50 text-green-700';
    if (valor >= 70) return 'bg-yellow-50 text-yellow-700';
    if (valor >= 60) return 'bg-orange-50 text-orange-700';
    return 'bg-red-50 text-red-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Cohort Analysis</h2>
          <p className="text-slate-600 mt-1">Segmente clientes por data de primeira compra para medir retenção</p>
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

      {/* Cohort Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Tabela de Retenção por Cohort
          </CardTitle>
          <CardDescription>Percentual de clientes retidos em cada mês após primeira compra</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Cohort</th>
                  <th className="text-center py-3 px-2 font-semibold text-slate-600">M0</th>
                  <th className="text-center py-3 px-2 font-semibold text-slate-600">M1</th>
                  <th className="text-center py-3 px-2 font-semibold text-slate-600">M2</th>
                  <th className="text-center py-3 px-2 font-semibold text-slate-600">M3</th>
                  <th className="text-center py-3 px-2 font-semibold text-slate-600">M4</th>
                  <th className="text-center py-3 px-2 font-semibold text-slate-600">M5</th>
                  <th className="text-center py-3 px-2 font-semibold text-slate-600">M6</th>
                  <th className="text-right py-3 px-4 font-semibold text-slate-600">LTV</th>
                </tr>
              </thead>
              <tbody>
                {cohorts.map((cohort) => (
                  <tr key={cohort.cohort} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-medium text-slate-900">{cohort.cohort}</td>
                    <td className={`text-center py-3 px-2 font-semibold ${getRetencaoColor(100)}`}>100%</td>
                    <td className={`text-center py-3 px-2 font-semibold ${getRetencaoColor(cohort.m1)}`}>{cohort.m1}%</td>
                    <td className={`text-center py-3 px-2 font-semibold ${getRetencaoColor(cohort.m2)}`}>{cohort.m2}%</td>
                    <td className={`text-center py-3 px-2 font-semibold ${getRetencaoColor(cohort.m3)}`}>{cohort.m3}%</td>
                    <td className={`text-center py-3 px-2 font-semibold ${getRetencaoColor(cohort.m4)}`}>{cohort.m4}%</td>
                    <td className={`text-center py-3 px-2 font-semibold ${getRetencaoColor(cohort.m5)}`}>{cohort.m5}%</td>
                    <td className={`text-center py-3 px-2 font-semibold ${getRetencaoColor(cohort.m6)}`}>{cohort.m6}%</td>
                    <td className="text-right py-3 px-4 font-semibold text-slate-900">R$ {cohort.ltv.toLocaleString('pt-BR')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Análise por Persona */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Retenção por Persona
          </CardTitle>
          <CardDescription>Qual persona tem melhor retenção?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { persona: 'Carol', m6: 82, ltv: 2340, churn: 18 },
              { persona: 'Renata', m6: 75, ltv: 1950, churn: 25 },
              { persona: 'Vanessa', m6: 68, ltv: 1620, churn: 32 },
              { persona: 'Luiza', m6: 62, ltv: 1380, churn: 38 },
            ].map((p) => (
              <div key={p.persona} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-slate-900">{p.persona}</div>
                  <div className="flex gap-4 text-sm">
                    <div className="text-right">
                      <div className="text-xs text-slate-600">Retenção M6</div>
                      <div className="font-bold text-slate-900">{p.m6}%</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-600">LTV</div>
                      <div className="font-bold text-slate-900">R$ {p.ltv}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-600">Churn</div>
                      <div className="font-bold text-red-600">{p.churn}%</div>
                    </div>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${p.m6}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <TrendingUp className="w-5 h-5" />
            Insights de Retenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Carol tem 82% de retenção M6</div>
                <div className="text-sm text-slate-600">20% acima da média. Modelo a replicar para outras personas</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Luiza tem 38% de churn</div>
                <div className="text-sm text-slate-600">Criar campanha de reengajamento com desconto para repeat purchase</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Cohort Jan 2026 em crescimento</div>
                <div className="text-sm text-slate-600">Apenas 2 meses, mas já mostra 92% retenção M1. Tendência positiva</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
