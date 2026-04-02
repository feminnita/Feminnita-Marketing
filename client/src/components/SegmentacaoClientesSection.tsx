import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, AlertTriangle, Zap, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const SEGMENTOS_ESTRATEGIA = [
  {
    nome: 'VIP',
    descricao: 'Clientes que gastam muito (LTV alto)',
    churnRisk: 'Baixo',
    acaoRecomendada: 'Ofereça exclusivos, desconto especial, atendimento premium',
    cor: 'gold' as const,
    criterio: 'LTV > média + desvio padrão',
  },
  {
    nome: 'Em Risco',
    descricao: 'Clientes que não compram há 20-60 dias',
    churnRisk: 'Alto',
    acaoRecomendada: 'Envie promoção urgente, "Sentimos sua falta!", desconto 20%',
    cor: 'orange' as const,
    criterio: 'Última compra: 20-60 dias atrás',
  },
  {
    nome: 'Dormentes',
    descricao: 'Clientes antigos que sumiram (60+ dias)',
    churnRisk: 'Crítico',
    acaoRecomendada: 'Campanha de reativação com oferta irrecusável (R$ 50 off)',
    cor: 'red' as const,
    criterio: 'Última compra: > 60 dias atrás',
  },
  {
    nome: 'Ativos',
    descricao: 'Clientes que compram regularmente',
    churnRisk: 'Baixo',
    acaoRecomendada: 'Promoções regulares, novos produtos, programa de loyalty',
    cor: 'green' as const,
    criterio: 'Compra recente, frequência regular',
  },
];

const BENEFICIOS = [
  { titulo: '+68% Conversão (estimado)', descricao: 'Mensagens personalizadas convertem mais que genéricas — benchmarks do setor' },
  { titulo: '+45% Ticket Médio', descricao: 'VIPs gastam mais quando recebem ofertas exclusivas' },
  { titulo: '-32% Churn', descricao: 'Campanhas de reativação trazem clientes dormentes de volta' },
  { titulo: 'Automação', descricao: 'Com Bling ERP + Email Marketing, envios automáticos por segmento' },
];

export function SegmentacaoClientesSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery(undefined, { refetchInterval: 60_000 });

  const todas = campanhas as any[];
  const totalConversoes = todas.reduce((s, c) => s + (c.conversoes ?? 0), 0);
  const porPlataforma = todas.reduce((acc, c) => {
    acc[c.plataforma] = (acc[c.plataforma] || 0) + (c.conversoes ?? 0);
    return acc;
  }, {} as Record<string, number>);
  const plataformasOrdenadas = Object.entries(porPlataforma)
    .sort(([, a], [, b]) => (b as number) - (a as number));

  const corMap = {
    gold: 'bg-yellow-50 border-yellow-200',
    orange: 'bg-orange-50 border-orange-200',
    red: 'bg-red-50 border-red-200',
    green: 'bg-green-50 border-green-200',
  };
  const badgeMap = {
    gold: 'bg-yellow-100 text-yellow-800',
    orange: 'bg-orange-100 text-orange-800',
    red: 'bg-red-100 text-red-800',
    green: 'bg-green-100 text-green-800',
  };
  const churnMap = {
    'Baixo': 'text-green-600',
    'Alto': 'text-orange-600',
    'Crítico': 'text-red-600',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Segmentação Avançada de Clientes</h2>
          <p className="text-slate-600 mt-1">Divida clientes em grupos para campanhas personalizadas</p>
        </div>
        <Badge className="bg-purple-100 text-purple-800 text-base px-4 py-2">
          {SEGMENTOS_ESTRATEGIA.length} segmentos
        </Badge>
      </div>

      {/* Status da integração com Bling */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Dados de clientes requerem Bling ERP</p>
              <p className="text-sm text-slate-600 mt-1">
                Para exibir quantidade real por segmento, LTV, risco de churn e última compra, conecte o Bling ERP em{' '}
                <strong>Integrações &gt; Bling ERP</strong>. Os segmentos abaixo mostram a estratégia recomendada para cada perfil.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance de campanhas por plataforma como proxy de segmentação */}
      {plataformasOrdenadas.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              Segmentação por Canal (dados reais)
            </CardTitle>
            <CardDescription>{totalConversoes.toLocaleString('pt-BR')} conversões totais por plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {plataformasOrdenadas.map(([plat, conv]) => {
                const pct = totalConversoes > 0 ? Math.round(((conv as number) / totalConversoes) * 100) : 0;
                return (
                  <div key={plat} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-slate-900 capitalize">{plat}</p>
                        <Badge variant="outline" className="text-xs">{conv as number} conv.</Badge>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-xs font-bold text-slate-600 w-10 text-right">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Estratégia por segmento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Estratégia por Segmento de Cliente
          </CardTitle>
          <CardDescription>Abordagem recomendada para cada perfil — aplicar quando Bling estiver conectado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {SEGMENTOS_ESTRATEGIA.map((seg) => (
              <div key={seg.nome} className={`p-4 border rounded-lg ${corMap[seg.cor]}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-slate-900 text-lg">{seg.nome}</div>
                    <div className="text-sm text-slate-600">{seg.descricao}</div>
                  </div>
                  <Badge className={badgeMap[seg.cor]}>Segmento</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-3 p-3 bg-white rounded border border-slate-200 text-sm">
                  <div>
                    <div className="text-xs text-slate-500">Critério</div>
                    <div className="font-medium text-slate-900">{seg.criterio}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Risco de Churn</div>
                    <div className={`font-medium ${churnMap[seg.churnRisk as keyof typeof churnMap]}`}>{seg.churnRisk}</div>
                  </div>
                </div>

                <div className="p-3 bg-white rounded border border-slate-200">
                  <div className="text-xs font-medium text-slate-500 mb-1">Ação Recomendada</div>
                  <div className="text-sm text-slate-700">{seg.acaoRecomendada}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Zap className="w-5 h-5" />
            Benefícios da Segmentação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {BENEFICIOS.map((b, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-purple-200">
                <div className="font-medium text-slate-900 mb-1">{b.titulo}</div>
                <div className="text-sm text-slate-600">{b.descricao}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
