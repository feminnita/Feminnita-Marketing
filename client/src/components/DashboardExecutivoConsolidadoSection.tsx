import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, DollarSign, ShoppingCart, Target, Activity } from 'lucide-react';

interface KPIPrincipal {
  label: string;
  valor: string | number;
  mudanca: string;
  meta: string;
  status: 'acima' | 'no-alvo' | 'abaixo';
  cor: string;
  icone: React.ReactNode;
}

export function DashboardExecutivoConsolidadoSection() {
  const [kpis] = useState<KPIPrincipal[]>([
    {
      label: 'Receita Total',
      valor: 'R$ 225.1K',
      mudanca: '↑ 22% vs período anterior',
      meta: 'Meta: R$ 200K',
      status: 'acima',
      cor: 'text-green-600',
      icone: <DollarSign className="w-5 h-5" />,
    },
    {
      label: 'Lifetime Value (LTV)',
      valor: 'R$ 1.822',
      mudanca: '↑ 8.5% vs período anterior',
      meta: 'Meta: R$ 1.800',
      status: 'acima',
      cor: 'text-green-600',
      icone: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: 'Taxa de Retenção',
      valor: '72%',
      mudanca: '↑ 5% vs período anterior',
      meta: 'Meta: 70%',
      status: 'acima',
      cor: 'text-green-600',
      icone: <Users className="w-5 h-5" />,
    },
    {
      label: 'Custo de Aquisição (CAC)',
      valor: 'R$ 45',
      mudanca: '↓ 8% vs período anterior',
      meta: 'Meta: R$ 50',
      status: 'acima',
      cor: 'text-green-600',
      icone: <Target className="w-5 h-5" />,
    },
    {
      label: 'ROI Campanhas',
      valor: '312%',
      mudanca: '↑ 18% vs período anterior',
      meta: 'Meta: 300%',
      status: 'acima',
      cor: 'text-green-600',
      icone: <Activity className="w-5 h-5" />,
    },
    {
      label: 'Taxa de Conversão',
      valor: '8.2%',
      mudanca: '↑ 2.1% vs período anterior',
      meta: 'Meta: 7.5%',
      status: 'acima',
      cor: 'text-green-600',
      icone: <ShoppingCart className="w-5 h-5" />,
    },
    {
      label: 'Ticket Médio',
      valor: 'R$ 189',
      mudanca: '↑ 5% vs período anterior',
      meta: 'Meta: R$ 180',
      status: 'acima',
      cor: 'text-green-600',
      icone: <DollarSign className="w-5 h-5" />,
    },
    {
      label: 'Demanda Prevista 30d',
      valor: '1.512 un.',
      mudanca: '↑ 18% vs período anterior',
      meta: 'Meta: 1.280 un.',
      status: 'acima',
      cor: 'text-green-600',
      icone: <TrendingUp className="w-5 h-5" />,
    },
    {
      label: 'Risco de Ruptura',
      valor: '12%',
      mudanca: '↓ 5% vs período anterior',
      meta: 'Meta: < 15%',
      status: 'acima',
      cor: 'text-green-600',
      icone: <Activity className="w-5 h-5" />,
    },
    {
      label: 'NPS (Satisfação)',
      valor: '72',
      mudanca: '↑ 8 pontos vs período anterior',
      meta: 'Meta: 70',
      status: 'acima',
      cor: 'text-green-600',
      icone: <Users className="w-5 h-5" />,
    },
  ]);

  const getStatusBadge = (status: string) => {
    if (status === 'acima') return 'bg-green-100 text-green-800';
    if (status === 'no-alvo') return 'bg-blue-100 text-blue-800';
    return 'bg-red-100 text-red-800';
  };

  const getStatusText = (status: string) => {
    if (status === 'acima') return '✓ Acima da Meta';
    if (status === 'no-alvo') return '→ No Alvo';
    return '✗ Abaixo da Meta';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Dashboard Executivo Consolidado</h2>
          <p className="text-slate-600 mt-1">10 KPIs principais atualizados em tempo real</p>
        </div>
        <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
          🟢 Todos os KPIs Acima da Meta
        </Badge>
      </div>

      {/* Grid de KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi, idx) => (
          <Card key={idx} className="hover:shadow-lg transition">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-slate-600">{kpi.label}</CardTitle>
                <div className={`${kpi.cor}`}>{kpi.icone}</div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900 mb-1">{kpi.valor}</div>
              <p className={`text-xs ${kpi.cor} mb-2`}>{kpi.mudanca}</p>
              <Badge className={`text-xs ${getStatusBadge(kpi.status)}`}>
                {getStatusText(kpi.status)}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Resumo Executivo */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">📊 Resumo Executivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Receita em Alta: R$ 225.1K</div>
                <div className="text-sm text-slate-600">22% acima do período anterior. Carol lidera com 61% da receita</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">LTV em Crescimento: R$ 1.822</div>
                <div className="text-sm text-slate-600">Clientes gastam mais. Implementar upsells pode adicionar +R$ 412K/ano</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Retenção Forte: 72%</div>
                <div className="text-sm text-slate-600">Clientes voltam a comprar. Programa de loyalty está funcionando</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">CAC Otimizado: R$ 45</div>
                <div className="text-sm text-slate-600">Custo de adquirir cliente caiu 8%. Campanhas estão mais eficientes</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">ROI de 312%</div>
                <div className="text-sm text-slate-600">Cada R$ 1 gasto em marketing gera R$ 3.12 em receita</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações Estratégicas */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Recomendações Estratégicas</CardTitle>
          <CardDescription>Ações para manter crescimento acelerado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                titulo: 'Aumentar Investimento em Carol',
                descricao: 'Carol gera 61% da receita. Aumentar orçamento de marketing em 25%',
                impacto: '+R$ 56K receita/mês',
                prioridade: 'Crítica',
              },
              {
                titulo: 'Implementar Bundles de Upsell',
                descricao: 'Oferecer Pijama + Robe com desconto 10%. Aumentar ticket médio',
                impacto: '+R$ 28.4K receita/mês',
                prioridade: 'Alta',
              },
              {
                titulo: 'Expandir Programa de Referência',
                descricao: 'Aumentar recompensa em 20%. Clientes referidos têm 45% LTV maior',
                impacto: '+R$ 18.6K receita/mês',
                prioridade: 'Alta',
              },
              {
                titulo: 'Reativar Vanessa com Promoção',
                descricao: 'Vanessa está -8%. Criar campanha de reengajamento com 20% OFF',
                impacto: '+R$ 12.8K receita/mês',
                prioridade: 'Média',
              },
            ].map((rec, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-slate-900">{rec.titulo}</div>
                    <div className="text-sm text-slate-600 mt-1">{rec.descricao}</div>
                  </div>
                  <Badge className={
                    rec.prioridade === 'Crítica' ? 'bg-red-600' :
                    rec.prioridade === 'Alta' ? 'bg-orange-600' :
                    'bg-yellow-600'
                  }>{rec.prioridade}</Badge>
                </div>
                <div className="text-sm font-bold text-green-600">{rec.impacto}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparação Personas */}
      <Card>
        <CardHeader>
          <CardTitle>👥 Performance por Persona</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { persona: 'Carol', receita: 'R$ 137.8K', crescimento: '+23%', status: '🔥 Estrela' },
              { persona: 'Renata', receita: 'R$ 58.7K', crescimento: '+12%', status: '📈 Crescendo' },
              { persona: 'Vanessa', receita: 'R$ 42.3K', crescimento: '-8%', status: '⚠️ Atenção' },
              { persona: 'Luiza', receita: 'R$ 27.5K', crescimento: '+5%', status: '→ Estável' },
            ].map((p) => (
              <div key={p.persona} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{p.persona}</div>
                  <div className="text-sm text-slate-600">{p.receita}</div>
                </div>
                <div className="text-right">
                  <div className={`text-sm font-bold ${p.crescimento.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                    {p.crescimento}
                  </div>
                  <Badge variant="outline" className="text-xs mt-1">{p.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Próximas Ações */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-purple-900">📋 Próximas Ações (Próximos 7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 list-decimal list-inside">
            <li className="text-slate-900"><strong>Hoje:</strong> Revisar recomendações e aprovar aumentos de produção</li>
            <li className="text-slate-900"><strong>Amanhã:</strong> Aumentar orçamento de marketing para Carol em 25%</li>
            <li className="text-slate-900"><strong>Dia 3:</strong> Criar e ativar bundles de upsell</li>
            <li className="text-slate-900"><strong>Dia 4:</strong> Lançar campanha de reengajamento para Vanessa</li>
            <li className="text-slate-900"><strong>Dia 5:</strong> Aumentar recompensa do programa de referência</li>
            <li className="text-slate-900"><strong>Dia 7:</strong> Revisar resultados e ajustar estratégia</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
