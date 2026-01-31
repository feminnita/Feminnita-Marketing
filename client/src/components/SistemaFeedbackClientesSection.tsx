import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageSquare, Star, TrendingUp, BarChart3, Heart, AlertCircle } from 'lucide-react';

interface Feedback {
  id: string;
  cliente: string;
  persona: string;
  avaliacao: number;
  sentimento: 'positivo' | 'neutro' | 'negativo';
  comentario: string;
  data: string;
  produto: string;
}

interface MetricaSentimento {
  tipo: 'positivo' | 'neutro' | 'negativo';
  percentual: number;
  cor: string;
  icone: string;
}

export function SistemaFeedbackClientesSection() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    {
      id: '1',
      cliente: 'Maria S.',
      persona: 'Carol',
      avaliacao: 5,
      sentimento: 'positivo',
      comentario: 'Adorei! Pijama super confortável e a entrega foi rápida!',
      data: '2 horas atrás',
      produto: 'Pijama Floral',
    },
    {
      id: '2',
      cliente: 'Ana P.',
      persona: 'Renata',
      avaliacao: 4,
      sentimento: 'positivo',
      comentario: 'Muito bom, mas esperava um pouco mais de variedade de cores',
      data: '4 horas atrás',
      produto: 'Pijama Premium',
    },
    {
      id: '3',
      cliente: 'Julia M.',
      persona: 'Vanessa',
      avaliacao: 3,
      sentimento: 'neutro',
      comentario: 'Bom custo-benefício, nada de especial',
      data: '6 horas atrás',
      produto: 'Pijama Básico',
    },
    {
      id: '4',
      cliente: 'Beatriz L.',
      persona: 'Carol',
      avaliacao: 5,
      sentimento: 'positivo',
      comentario: 'Perfeito! Já é a terceira vez que compro. Recomendo muito!',
      data: '8 horas atrás',
      produto: 'Pijama Floral',
    },
    {
      id: '5',
      cliente: 'Fernanda T.',
      persona: 'Luiza',
      avaliacao: 2,
      sentimento: 'negativo',
      comentario: 'Pijama encolheu na primeira lavagem. Decepcionante.',
      data: '10 horas atrás',
      produto: 'Pijama Luxo',
    },
  ]);

  const [metricas] = useState<MetricaSentimento[]>([
    { tipo: 'positivo', percentual: 68, cor: 'bg-green-500', icone: '😊' },
    { tipo: 'neutro', percentual: 20, cor: 'bg-yellow-500', icone: '😐' },
    { tipo: 'negativo', percentual: 12, cor: 'bg-red-500', icone: '😞' },
  ]);

  const nps = 72; // Net Promoter Score
  const satisfacao = 4.2; // Média de avaliação
  const totalFeedbacks = feedbacks.length;

  const feedbacksPorPersona = {
    Carol: { media: 4.5, total: 12, satisfacao: 95 },
    Renata: { media: 4.1, total: 10, satisfacao: 87 },
    Vanessa: { media: 3.8, total: 11, satisfacao: 78 },
    Luiza: { media: 3.4, total: 8, satisfacao: 71 },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Feedback de Clientes</h2>
          <p className="text-slate-600 mt-1">Análise de sentimento e satisfação por persona</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <MessageSquare className="w-4 h-4 mr-2" />
          Novo Feedback
        </Button>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">NPS (Net Promoter Score)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{nps}</div>
            <p className="text-xs text-green-600 mt-1">↑ Excelente (acima de 50)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Satisfação Média</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{satisfacao}/5.0</div>
            <div className="flex gap-1 mt-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-3 h-3 ${i < Math.floor(satisfacao) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Feedbacks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalFeedbacks}</div>
            <p className="text-xs text-slate-600 mt-1">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa de Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">78%</div>
            <p className="text-xs text-green-600 mt-1">↑ 5% vs mês anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Análise de Sentimento */}
      <Card>
        <CardHeader>
          <CardTitle>Análise de Sentimento</CardTitle>
          <CardDescription>Distribuição de sentimentos nos feedbacks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metricas.map((metrica) => (
              <div key={metrica.tipo} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{metrica.icone}</span>
                    <span className="font-medium text-slate-900 capitalize">{metrica.tipo}</span>
                  </div>
                  <span className="text-2xl font-bold text-slate-900">{metrica.percentual}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div className={`h-3 rounded-full ${metrica.cor}`} style={{ width: `${metrica.percentual}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Satisfação por Persona */}
      <Card>
        <CardHeader>
          <CardTitle>Satisfação por Persona</CardTitle>
          <CardDescription>Média de avaliação e taxa de satisfação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(feedbacksPorPersona).map(([persona, dados]) => (
              <div key={persona} className="p-4 border border-slate-200 rounded-lg">
                <div className="font-semibold text-slate-900 mb-3">{persona}</div>
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Avaliação Média</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-slate-900">{dados.media}</span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < Math.floor(dados.media) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-600 mb-1">Satisfação</div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-slate-900">{dados.satisfacao}%</span>
                      <div className="w-16 h-2 bg-slate-200 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: `${dados.satisfacao}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-600">{dados.total} feedbacks</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feedbacks Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Feedbacks Recentes
          </CardTitle>
          <CardDescription>Últimos comentários de clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {feedbacks.map((feedback) => (
              <div key={feedback.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-slate-900">{feedback.cliente}</div>
                    <div className="text-xs text-slate-600">{feedback.data}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{feedback.persona}</Badge>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < feedback.avaliacao ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-slate-700 text-sm mb-2">{feedback.comentario}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">{feedback.produto}</Badge>
                  <Badge
                    className={`text-xs ${
                      feedback.sentimento === 'positivo' ? 'bg-green-100 text-green-800' :
                      feedback.sentimento === 'neutro' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {feedback.sentimento === 'positivo' ? '😊 Positivo' : feedback.sentimento === 'neutro' ? '😐 Neutro' : '😞 Negativo'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="w-5 h-5" />
            Insights e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <Heart className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-slate-900">Carol é sua estrela</div>
                <div className="text-sm text-slate-600">95% satisfação. Considere criar programa VIP para fidelizar</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-slate-900">Problema de qualidade detectado</div>
                <div className="text-sm text-slate-600">Pijama Luxo encolhe na lavagem. Revisar processo de manufatura</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <BarChart3 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-slate-900">Oportunidade de upsell</div>
                <div className="text-sm text-slate-600">Clientes de Carol pedem mais cores. Lançar nova linha de cores</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
