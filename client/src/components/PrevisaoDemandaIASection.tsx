import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, AlertTriangle, Zap, BarChart3 } from 'lucide-react';

interface PrevisaoProduto {
  id: string;
  produto: string;
  categoria: string;
  persona: string;
  previsao30d: number;
  estoque: number;
  confianca: number;
  tendencia: string;
  recomendacao: string;
  impacto: string;
}

interface MetricaPrevisao {
  label: string;
  valor: string | number;
  mudanca: string;
  cor: string;
}

export function PrevisaoDemandaIASection() {
  const [previsoes] = useState<PrevisaoProduto[]>([
    {
      id: '1',
      produto: 'Pijama Carol Premium',
      categoria: 'Premium',
      persona: 'Carol',
      previsao30d: 487,
      estoque: 234,
      confianca: 94,
      tendencia: '↑ +23% vs mês anterior',
      recomendacao: 'Aumentar produção em 300 unidades',
      impacto: '+R$ 92.046',
    },
    {
      id: '2',
      produto: 'Pijama Renata Conforto',
      categoria: 'Conforto',
      persona: 'Renata',
      previsao30d: 356,
      estoque: 412,
      confianca: 87,
      tendencia: '↑ +12% vs mês anterior',
      recomendacao: 'Manter estoque atual',
      impacto: '+R$ 58.752',
    },
    {
      id: '3',
      produto: 'Pijama Vanessa Casual',
      categoria: 'Casual',
      persona: 'Vanessa',
      previsao30d: 298,
      estoque: 521,
      confianca: 82,
      tendencia: '↓ -8% vs mês anterior',
      recomendacao: 'Reduzir produção, aumentar promoção',
      impacto: '-R$ 15.400 (sem ação)',
    },
    {
      id: '4',
      produto: 'Pijama Luiza Básico',
      categoria: 'Básico',
      persona: 'Luiza',
      previsao30d: 215,
      estoque: 189,
      confianca: 76,
      tendencia: '↑ +5% vs mês anterior',
      recomendacao: 'Aumentar produção em 100 unidades',
      impacto: '+R$ 27.520',
    },
    {
      id: '5',
      produto: 'Robe Carol Premium',
      categoria: 'Acessório',
      persona: 'Carol',
      previsao30d: 156,
      estoque: 45,
      confianca: 91,
      tendencia: '↑ +34% vs mês anterior',
      recomendacao: 'URGENTE: Aumentar produção em 200 unidades',
      impacto: '+R$ 46.800',
    },
  ]);

  const [metricas] = useState<MetricaPrevisao[]>([
    { label: 'Acurácia Média IA', valor: '87.2%', mudanca: '↑ 4% vs período anterior', cor: 'text-green-600' },
    { label: 'Previsão Total 30 dias', valor: '1.512 unidades', mudanca: '↑ 18% vs período anterior', cor: 'text-green-600' },
    { label: 'Receita Prevista 30d', valor: 'R$ 225.1K', mudanca: '↑ 22% vs período anterior', cor: 'text-green-600' },
    { label: 'Risco de Ruptura', valor: '12%', mudanca: '↓ 5% vs período anterior', cor: 'text-green-600' },
  ]);

  const getConfiancaColor = (confianca: number) => {
    if (confianca >= 90) return 'bg-green-100 text-green-800';
    if (confianca >= 80) return 'bg-blue-100 text-blue-800';
    if (confianca >= 70) return 'bg-yellow-100 text-yellow-800';
    return 'bg-orange-100 text-orange-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Previsão de Demanda com IA</h2>
          <p className="text-slate-600 mt-1">Preveja quais produtos venderão mais nos próximos 30 dias</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Zap className="w-4 h-4 mr-2" />
          Atualizar Previsões
        </Button>
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

      {/* Previsões por Produto */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Previsões de Demanda 30 Dias
          </CardTitle>
          <CardDescription>Ordenado por impacto financeiro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {previsoes.map((prev) => (
              <div key={prev.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">{prev.produto}</span>
                      <Badge variant="outline" className="text-xs">{prev.persona}</Badge>
                      <Badge className={`text-xs ${getConfiancaColor(prev.confianca)}`}>
                        {prev.confianca}% confiança
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600">{prev.tendencia}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{prev.impacto}</div>
                    <div className="text-xs text-slate-600">Impacto 30d</div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 mb-3 text-sm">
                  <div className="p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="text-xs text-blue-700 mb-1">Previsão</div>
                    <div className="font-bold text-blue-900">{prev.previsao30d} un.</div>
                  </div>
                  <div className="p-2 bg-slate-100 rounded border border-slate-300">
                    <div className="text-xs text-slate-700 mb-1">Estoque</div>
                    <div className="font-bold text-slate-900">{prev.estoque} un.</div>
                  </div>
                  <div className="p-2 bg-purple-50 rounded border border-purple-200">
                    <div className="text-xs text-purple-700 mb-1">Diferença</div>
                    <div className={`font-bold ${prev.previsao30d > prev.estoque ? 'text-red-600' : 'text-green-600'}`}>
                      {prev.previsao30d > prev.estoque ? '+' : '-'}{Math.abs(prev.previsao30d - prev.estoque)} un.
                    </div>
                  </div>
                  <div className="p-2 bg-orange-50 rounded border border-orange-200">
                    <div className="text-xs text-orange-700 mb-1">Status</div>
                    <div className="font-bold text-orange-900">
                      {prev.previsao30d > prev.estoque ? '⚠️ Risco' : '✓ OK'}
                    </div>
                  </div>
                </div>

                <div className="mb-3 p-3 bg-slate-50 rounded border border-slate-200">
                  <div className="text-sm font-medium text-slate-900 mb-1">Recomendação IA:</div>
                  <div className="text-sm text-slate-700">{prev.recomendacao}</div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                    Implementar
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise por Persona */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Demanda Prevista por Persona
          </CardTitle>
          <CardDescription>Qual persona terá maior demanda?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { persona: 'Carol', demanda: 643, crescimento: '+23%', receita: 'R$ 138.8K', recomendacao: 'Aumentar marketing' },
              { persona: 'Renata', demanda: 356, crescimento: '+12%', receita: 'R$ 58.7K', recomendacao: 'Manter estratégia' },
              { persona: 'Vanessa', demanda: 298, crescimento: '-8%', receita: 'R$ 42.3K', recomendacao: 'Promoção urgente' },
              { persona: 'Luiza', demanda: 215, crescimento: '+5%', receita: 'R$ 27.5K', recomendacao: 'Testar novos produtos' },
            ].map((p) => (
              <div key={p.persona} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-semibold text-slate-900">{p.persona}</div>
                  <div className={`text-sm font-bold ${p.crescimento.includes('-') ? 'text-red-600' : 'text-green-600'}`}>
                    {p.crescimento}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                  <div>
                    <div className="text-xs text-slate-600 mb-1">Demanda</div>
                    <div className="font-bold text-slate-900">{p.demanda} un.</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 mb-1">Receita</div>
                    <div className="font-bold text-green-600">{p.receita}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 mb-1">Ação</div>
                    <div className="font-bold text-slate-900">{p.recomendacao}</div>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${(p.demanda / 643) * 100}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Otimização de Estoque */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Recomendações de Otimização
          </CardTitle>
          <CardDescription>Ações para maximizar receita e minimizar risco</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                titulo: 'URGENTE: Robe Carol Premium',
                descricao: 'Previsão 156 un., estoque 45 un. Risco de ruptura 71%',
                acao: 'Aumentar produção em 200 un. imediatamente',
                impacto: '+R$ 46.8K receita',
                prioridade: 'Crítica',
              },
              {
                titulo: 'Pijama Carol Premium',
                descricao: 'Previsão 487 un., estoque 234 un. Risco de ruptura 52%',
                acao: 'Aumentar produção em 300 un.',
                impacto: '+R$ 92.0K receita',
                prioridade: 'Alta',
              },
              {
                titulo: 'Pijama Vanessa Casual',
                descricao: 'Previsão 298 un., estoque 521 un. Excesso 223 un.',
                acao: 'Reduzir produção, aumentar promoção em 15%',
                impacto: '-R$ 15.4K (sem ação)',
                prioridade: 'Média',
              },
            ].map((rec, idx) => (
              <div key={idx} className={`p-4 border rounded-lg ${
                rec.prioridade === 'Crítica' ? 'border-red-300 bg-red-50' :
                rec.prioridade === 'Alta' ? 'border-orange-300 bg-orange-50' :
                'border-yellow-300 bg-yellow-50'
              }`}>
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

                <div className="mb-3 p-2 bg-white rounded border">
                  <div className="text-sm font-medium text-slate-900">Ação recomendada:</div>
                  <div className="text-sm text-slate-700">{rec.acao}</div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm font-bold text-green-600">{rec.impacto}</div>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Executar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights IA */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Zap className="w-5 h-5" />
            Insights da IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Carol lidera demanda com 643 unidades</div>
                <div className="text-sm text-slate-600">42% da demanda total. Investir em produção e marketing para Carol</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Robe Carol Premium em alta demanda</div>
                <div className="text-sm text-slate-600">+34% crescimento. Oportunidade de upsell: oferecer bundle com pijama</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Vanessa em desaceleração (-8%)</div>
                <div className="text-sm text-slate-600">Testar novo design, aumentar promoção ou oferecer desconto por referência</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Receita prevista: R$ 225.1K em 30 dias</div>
                <div className="text-sm text-slate-600">Se implementar recomendações: +R$ 38.4K (+17% vs previsão base)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
