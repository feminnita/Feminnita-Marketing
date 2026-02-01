import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, TrendingUp, AlertTriangle, Zap, Send, Target } from 'lucide-react';

interface Segmento {
  id: string;
  nome: string;
  descricao: string;
  quantidade: number;
  percentual: number;
  ltv: number;
  churnRisk: number;
  ultimaCompra: string;
  acaoRecomendada: string;
  cor: string;
}

interface CampanhaSegmento {
  id: string;
  segmento: string;
  titulo: string;
  mensagem: string;
  oferta: string;
  canalEnvio: string;
  statusEnvio: string;
  resultados: {
    enviados: number;
    abertos: number;
    cliques: number;
    conversoes: number;
  };
}

export function SegmentacaoClientesSection() {
  const [segmentos] = useState<Segmento[]>([
    {
      id: '1',
      nome: 'VIP',
      descricao: 'Clientes que gastam muito (LTV alto)',
      quantidade: 487,
      percentual: 11.6,
      ltv: 2840,
      churnRisk: 3,
      ultimaCompra: 'Há 5 dias',
      acaoRecomendada: 'Ofereça exclusivos, desconto especial, atendimento premium',
      cor: 'gold',
    },
    {
      id: '2',
      nome: 'Em Risco',
      descricao: 'Clientes que não compram há tempo',
      quantidade: 823,
      percentual: 19.7,
      ltv: 1240,
      churnRisk: 78,
      ultimaCompra: 'Há 45 dias',
      acaoRecomendada: 'Envie promoção urgente, "Sentimos sua falta!", desconto',
      cor: 'orange',
    },
    {
      id: '3',
      nome: 'Dormentes',
      descricao: 'Clientes antigos que sumiram',
      quantidade: 412,
      percentual: 9.8,
      ltv: 680,
      churnRisk: 95,
      ultimaCompra: 'Há 120 dias',
      acaoRecomendada: 'Campanha de reativação, oferta irrecusável',
      cor: 'red',
    },
    {
      id: '4',
      nome: 'Ativos',
      descricao: 'Clientes que compram regularmente',
      quantidade: 2465,
      percentual: 58.9,
      ltv: 1560,
      churnRisk: 12,
      ultimaCompra: 'Há 15 dias',
      acaoRecomendada: 'Promoções normais, novos produtos, programa de loyalty',
      cor: 'green',
    },
  ]);

  const [campanhas] = useState<CampanhaSegmento[]>([
    {
      id: '1',
      segmento: 'VIP',
      titulo: 'Novo Pijama Luiza Luxo - Exclusivo',
      mensagem: 'Você é uma cliente VIP! Confira nosso novo pijama Luiza Luxo antes de todos.',
      oferta: 'Frete grátis + 15% desconto',
      canalEnvio: 'Email + SMS + WhatsApp',
      statusEnvio: 'Enviada',
      resultados: {
        enviados: 487,
        abertos: 412,
        cliques: 187,
        conversoes: 68,
      },
    },
    {
      id: '2',
      segmento: 'Em Risco',
      titulo: 'Sentimos sua falta! Volte com 20% OFF',
      mensagem: 'Não te vemos há 45 dias. Volte e ganhe 20% de desconto em qualquer produto.',
      oferta: '20% desconto + Frete grátis',
      canalEnvio: 'Email + SMS',
      statusEnvio: 'Enviada',
      resultados: {
        enviados: 823,
        abertos: 412,
        cliques: 98,
        conversoes: 24,
      },
    },
    {
      id: '3',
      segmento: 'Dormentes',
      titulo: 'Reativação: R$ 50 de desconto!',
      mensagem: 'Saudade! Ganhe R$ 50 de desconto em qualquer compra. Válido por 7 dias.',
      oferta: 'R$ 50 desconto direto',
      canalEnvio: 'Email',
      statusEnvio: 'Agendada',
      resultados: {
        enviados: 0,
        abertos: 0,
        cliques: 0,
        conversoes: 0,
      },
    },
    {
      id: '4',
      segmento: 'Ativos',
      titulo: 'Novo Produto: Pijama Carol Premium',
      mensagem: 'Novo lançamento! Pijama Carol Premium com tecido Egípcio 100%. Confira!',
      oferta: '10% desconto no primeiro pedido',
      canalEnvio: 'Email + SMS',
      statusEnvio: 'Enviada',
      resultados: {
        enviados: 2465,
        abertos: 1478,
        cliques: 356,
        conversoes: 142,
      },
    },
  ]);

  const totalClientes = segmentos.reduce((sum, seg) => sum + seg.quantidade, 0);
  const totalReceita = segmentos.reduce((sum, seg) => sum + (seg.quantidade * seg.ltv), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Segmentação Avançada de Clientes</h2>
          <p className="text-slate-600 mt-1">Divida clientes em grupos para campanhas personalizadas</p>
        </div>
        <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
          ✓ 4 Segmentos
        </Badge>
      </div>

      {/* Visão Geral */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Total de Clientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalClientes.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-slate-600 mt-1">Segmentados em 4 grupos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Lifetime Value Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">R$ {(totalReceita / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-slate-600 mt-1">Valor total de clientes</p>
          </CardContent>
        </Card>
      </div>

      {/* Segmentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Segmentos de Clientes
          </CardTitle>
          <CardDescription>Cada segmento recebe estratégia personalizada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {segmentos.map((seg) => {
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
              return (
                <div key={seg.id} className={`p-4 border rounded-lg ${corMap[seg.cor as keyof typeof corMap]}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-semibold text-slate-900 text-lg">{seg.nome}</div>
                      <div className="text-sm text-slate-600">{seg.descricao}</div>
                    </div>
                    <Badge className={badgeMap[seg.cor as keyof typeof badgeMap]}>
                      {seg.quantidade.toLocaleString('pt-BR')} clientes
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 p-3 bg-white rounded border border-slate-200">
                    <div>
                      <div className="text-xs text-slate-600">% do Total</div>
                      <div className="font-semibold text-slate-900">{seg.percentual}%</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600">LTV Médio</div>
                      <div className="font-semibold text-green-600">R$ {seg.ltv.toLocaleString('pt-BR')}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600">Churn Risk</div>
                      <div className={`font-semibold ${seg.churnRisk > 50 ? 'text-red-600' : 'text-green-600'}`}>
                        {seg.churnRisk}%
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600">Última Compra</div>
                      <div className="font-semibold text-slate-900">{seg.ultimaCompra}</div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-600">Receita Total</div>
                      <div className="font-semibold text-green-600">R$ {((seg.quantidade * seg.ltv) / 1000).toFixed(0)}K</div>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded border border-slate-200 mb-3">
                    <div className="text-sm font-medium text-slate-900 mb-1">💡 Ação Recomendada:</div>
                    <div className="text-sm text-slate-600">{seg.acaoRecomendada}</div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex-1">
                      <Send className="w-4 h-4 mr-1" />
                      Enviar Campanha
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Campanhas por Segmento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Campanhas Ativas por Segmento
          </CardTitle>
          <CardDescription>Performance de cada campanha personalizada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campanhas.map((camp) => (
              <div key={camp.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{camp.titulo}</div>
                    <div className="text-sm text-slate-600 mt-1">{camp.mensagem}</div>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800">{camp.segmento}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 p-3 bg-slate-50 rounded">
                  <div>
                    <div className="text-xs text-slate-600">Enviados</div>
                    <div className="font-semibold text-slate-900">{camp.resultados.enviados.toLocaleString('pt-BR')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Abertos</div>
                    <div className="font-semibold text-blue-600">
                      {camp.resultados.enviados > 0 
                        ? ((camp.resultados.abertos / camp.resultados.enviados) * 100).toFixed(0) 
                        : 0}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Cliques</div>
                    <div className="font-semibold text-slate-900">{camp.resultados.cliques.toLocaleString('pt-BR')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Conversões</div>
                    <div className="font-semibold text-green-600">{camp.resultados.conversoes.toLocaleString('pt-BR')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Status</div>
                    <Badge className={camp.statusEnvio === 'Enviada' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                      {camp.statusEnvio}
                    </Badge>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">
                    Ver Relatório
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Duplicar Campanha
                  </Button>
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
            <div className="p-3 bg-white rounded-lg border border-purple-200">
              <div className="font-medium text-slate-900 mb-1">📈 +68% Conversão</div>
              <div className="text-sm text-slate-600">Mensagens personalizadas convertem muito mais que genéricas</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-purple-200">
              <div className="font-medium text-slate-900 mb-1">💰 +45% Ticket Médio</div>
              <div className="text-sm text-slate-600">VIPs gastam mais quando recebem ofertas exclusivas</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-purple-200">
              <div className="font-medium text-slate-900 mb-1">🔄 -32% Churn</div>
              <div className="text-sm text-slate-600">Campanhas de reativação trazem clientes dormentes de volta</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-purple-200">
              <div className="font-medium text-slate-900 mb-1">⏰ -40% Tempo</div>
              <div className="text-sm text-slate-600">Automação envia campanhas sem trabalho manual</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="flex gap-3 flex-wrap">
        <Button className="bg-purple-600 hover:bg-purple-700">Criar Novo Segmento</Button>
        <Button variant="outline">Enviar Todas as Campanhas</Button>
        <Button variant="outline">Ver Análise de Churn</Button>
      </div>
    </div>
  );
}
