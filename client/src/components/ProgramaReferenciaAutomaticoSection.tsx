import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Share2, Gift, Users, TrendingUp } from 'lucide-react';

interface Referencia {
  id: string;
  referidor: string;
  persona: string;
  amigo: string;
  status: 'ativa' | 'convertida' | 'pendente';
  dataReferencia: string;
  recompensaReferidor: string;
  recompensaAmigo: string;
  vendas: number;
}

interface MetricaReferencia {
  label: string;
  valor: string | number;
  mudanca: string;
  cor: string;
}

export function ProgramaReferenciaAutomaticoSection() {
  const [referencias, setReferencias] = useState<Referencia[]>([
    {
      id: '1',
      referidor: 'Maria S.',
      persona: 'Carol',
      amigo: 'Juliana T.',
      status: 'convertida',
      dataReferencia: '2026-01-28',
      recompensaReferidor: 'R$ 45 (desconto)',
      recompensaAmigo: 'R$ 30 (desconto)',
      vendas: 3,
    },
    {
      id: '2',
      referidor: 'Ana P.',
      persona: 'Renata',
      amigo: 'Beatriz L.',
      status: 'convertida',
      dataReferencia: '2026-01-25',
      recompensaReferidor: 'R$ 45 (desconto)',
      recompensaAmigo: 'R$ 30 (desconto)',
      vendas: 2,
    },
    {
      id: '3',
      referidor: 'Patricia M.',
      persona: 'Vanessa',
      amigo: 'Fernanda T.',
      status: 'ativa',
      dataReferencia: '2026-01-20',
      recompensaReferidor: 'R$ 45 (pendente)',
      recompensaAmigo: 'R$ 30 (pendente)',
      vendas: 0,
    },
    {
      id: '4',
      referidor: 'Camila S.',
      persona: 'Carol',
      amigo: 'Debora L.',
      status: 'convertida',
      dataReferencia: '2026-01-15',
      recompensaReferidor: 'R$ 45 (desconto)',
      recompensaAmigo: 'R$ 30 (desconto)',
      vendas: 4,
    },
    {
      id: '5',
      referidor: 'Elisa P.',
      persona: 'Luiza',
      amigo: 'Gabriela M.',
      status: 'pendente',
      dataReferencia: '2026-01-10',
      recompensaReferidor: 'R$ 45 (pendente)',
      recompensaAmigo: 'R$ 30 (pendente)',
      vendas: 0,
    },
  ]);

  const [metricas] = useState<MetricaReferencia[]>([
    { label: 'Referências Ativas', valor: 127, mudanca: '↑ 34 vs mês anterior', cor: 'text-green-600' },
    { label: 'Taxa de Conversão', valor: '68%', mudanca: '↑ 12% vs mês anterior', cor: 'text-green-600' },
    { label: 'Novos Clientes via Referência', valor: 86, mudanca: '↑ 42% vs mês anterior', cor: 'text-green-600' },
    { label: 'Receita Referência', valor: 'R$ 32.8K', mudanca: '↑ 58% vs mês anterior', cor: 'text-green-600' },
  ]);

  const getStatusColor = (status: string) => {
    if (status === 'convertida') return 'bg-green-100 text-green-800';
    if (status === 'ativa') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Programa de Referência Automático</h2>
          <p className="text-slate-600 mt-1">Recompense clientes que indicam amigos com pontos/descontos</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Share2 className="w-4 h-4 mr-2" />
          Compartilhar
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

      {/* Referências */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Histórico de Referências
          </CardTitle>
          <CardDescription>Rastreie origem de cada novo cliente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {referencias.map((ref) => (
              <div key={ref.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">{ref.referidor}</span>
                      <Badge variant="outline" className="text-xs">{ref.persona}</Badge>
                      <Badge className={`text-xs ${getStatusColor(ref.status)}`}>
                        {ref.status === 'convertida' ? '✓ Convertida' : ref.status === 'ativa' ? '⏳ Ativa' : '⏱ Pendente'}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600">Indicou: <span className="font-medium">{ref.amigo}</span></div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-600 mb-1">{ref.dataReferencia}</div>
                    <div className="text-sm font-semibold text-slate-900">{ref.vendas} vendas</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  <div className="p-2 bg-green-50 rounded border border-green-200">
                    <div className="text-xs text-green-700 mb-1">Recompensa Referidor</div>
                    <div className="font-semibold text-green-900">{ref.recompensaReferidor}</div>
                  </div>
                  <div className="p-2 bg-blue-50 rounded border border-blue-200">
                    <div className="text-xs text-blue-700 mb-1">Recompensa Amigo</div>
                    <div className="font-semibold text-blue-900">{ref.recompensaAmigo}</div>
                  </div>
                </div>

                {ref.status !== 'convertida' && (
                  <Button size="sm" className="w-full" variant="outline">
                    Acompanhar
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estrutura de Recompensas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-600" />
            Estrutura de Recompensas
          </CardTitle>
          <CardDescription>Incentivos por persona</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                persona: 'Carol',
                recompensaRef: 'R$ 50 desconto',
                recompensaAmigo: 'R$ 35 desconto',
                bonus: '+R$ 10 se amigo gasta 500+',
              },
              {
                persona: 'Renata',
                recompensaRef: 'R$ 45 desconto',
                recompensaAmigo: 'R$ 30 desconto',
                bonus: '+R$ 8 se amigo gasta 400+',
              },
              {
                persona: 'Vanessa',
                recompensaRef: 'R$ 40 desconto',
                recompensaAmigo: 'R$ 25 desconto',
                bonus: '+R$ 5 se amigo gasta 300+',
              },
              {
                persona: 'Luiza',
                recompensaRef: 'R$ 35 desconto',
                recompensaAmigo: 'R$ 20 desconto',
                bonus: '+R$ 3 se amigo gasta 200+',
              },
            ].map((r, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-900 mb-2">{r.persona}</div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-xs text-slate-600 mb-1">Referidor</div>
                    <div className="font-medium text-slate-900">{r.recompensaRef}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 mb-1">Novo Cliente</div>
                    <div className="font-medium text-slate-900">{r.recompensaAmigo}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 mb-1">Bônus</div>
                    <div className="font-medium text-green-600">{r.bonus}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <TrendingUp className="w-5 h-5" />
            Insights do Programa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">68% taxa de conversão</div>
                <div className="text-sm text-slate-600">Clientes indicados por amigos têm 3x mais chance de comprar</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Carol gera 42% das referências</div>
                <div className="text-sm text-slate-600">Aumentar incentivo para Carol pode gerar +R$ 15K/mês</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
              <div className="w-2 h-2 rounded-full bg-pink-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">LTV de clientes referidos: +45%</div>
                <div className="text-sm text-slate-600">Clientes indicados gastam mais e têm maior retenção</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
