import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Zap, Users, TrendingUp } from 'lucide-react';

interface PedidoShopify {
  id: string;
  cliente: string;
  persona: string;
  produtos: string;
  valor: number;
  status: string;
  data: string;
}

interface MetricaShopify {
  label: string;
  valor: string | number;
  mudanca: string;
  cor: string;
}

export function IntegracaoShopifySection() {
  const [pedidos] = useState<PedidoShopify[]>([
    {
      id: '#SH-2026-001',
      cliente: 'Maria Silva',
      persona: 'Carol',
      produtos: 'Pijama Carol Premium + Robe',
      valor: 489,
      status: 'Entregue',
      data: '2026-01-31',
    },
    {
      id: '#SH-2026-002',
      cliente: 'Ana Costa',
      persona: 'Renata',
      produtos: 'Pijama Renata Conforto',
      valor: 189,
      status: 'Em Trânsito',
      data: '2026-01-30',
    },
    {
      id: '#SH-2026-003',
      cliente: 'Patricia Gomes',
      persona: 'Vanessa',
      produtos: 'Pijama Vanessa Casual',
      valor: 142,
      status: 'Processando',
      data: '2026-01-29',
    },
    {
      id: '#SH-2026-004',
      cliente: 'Camila Santos',
      persona: 'Carol',
      produtos: 'Pijama Carol Premium',
      valor: 289,
      status: 'Entregue',
      data: '2026-01-28',
    },
    {
      id: '#SH-2026-005',
      cliente: 'Elisa Martins',
      persona: 'Luiza',
      produtos: 'Pijama Luiza Básico',
      valor: 128,
      status: 'Entregue',
      data: '2026-01-27',
    },
  ]);

  const [metricas] = useState<MetricaShopify[]>([
    { label: 'Pedidos Sincronizados', valor: '1.247', mudanca: '↑ 34 vs período anterior', cor: 'text-green-600' },
    { label: 'Clientes Sincronizados', valor: '4.190', mudanca: '↑ 289 vs período anterior', cor: 'text-green-600' },
    { label: 'Receita Shopify', valor: 'R$ 236.3K', mudanca: '↑ 28% vs período anterior', cor: 'text-green-600' },
    { label: 'Taxa de Sincronização', valor: '99.8%', mudanca: '↑ 0.2% vs período anterior', cor: 'text-green-600' },
  ]);

  const getStatusColor = (status: string) => {
    if (status === 'Entregue') return 'bg-green-100 text-green-800';
    if (status === 'Em Trânsito') return 'bg-blue-100 text-blue-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Integração com Shopify</h2>
          <p className="text-slate-600 mt-1">Sincronize pedidos, clientes e produtos automaticamente</p>
        </div>
        <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
          ✓ Conectado
        </Badge>
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

      {/* Pedidos Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            Pedidos Recentes do Shopify
          </CardTitle>
          <CardDescription>Últimos 5 pedidos sincronizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {pedidos.map((pedido) => (
              <div key={pedido.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">{pedido.id}</span>
                      <Badge variant="outline" className="text-xs">{pedido.persona}</Badge>
                      <Badge className={`text-xs ${getStatusColor(pedido.status)}`}>
                        {pedido.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">{pedido.cliente}</span> • {pedido.produtos}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">R$ {pedido.valor}</div>
                    <div className="text-xs text-slate-600">{pedido.data}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sincronização de Dados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Status de Sincronização
          </CardTitle>
          <CardDescription>Dados sincronizados em tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { tipo: 'Pedidos', total: '1.247', ultima: 'Agora', status: '✓ Ativo' },
              { tipo: 'Clientes', total: '4.190', ultima: '2 min atrás', status: '✓ Ativo' },
              { tipo: 'Produtos', total: '48', ultima: '5 min atrás', status: '✓ Ativo' },
              { tipo: 'Inventário', total: 'Sincronizado', ultima: 'Tempo real', status: '✓ Ativo' },
              { tipo: 'Análise', total: 'Completa', ultima: 'Atualizado', status: '✓ Ativo' },
            ].map((sync, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{sync.tipo}</div>
                  <div className="text-sm text-slate-600">Total: {sync.total} • Última: {sync.ultima}</div>
                </div>
                <Badge className="bg-green-100 text-green-800">{sync.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Análise de Clientes Shopify
          </CardTitle>
          <CardDescription>Segmentação automática por persona</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { persona: 'Carol', clientes: 1240, receita: 'R$ 137.8K', ltv: 'R$ 2.340', taxa: '82%' },
              { persona: 'Renata', clientes: 980, receita: 'R$ 58.7K', ltv: 'R$ 1.950', taxa: '75%' },
              { persona: 'Vanessa', clientes: 1120, receita: 'R$ 42.3K', ltv: 'R$ 1.620', taxa: '68%' },
              { persona: 'Luiza', clientes: 850, receita: 'R$ 27.5K', ltv: 'R$ 1.380', taxa: '62%' },
            ].map((seg, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-semibold text-slate-900">{seg.persona}</div>
                  <div className="text-sm font-bold text-green-600">{seg.receita}</div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-slate-600">Clientes</div>
                    <div className="font-bold text-slate-900">{seg.clientes}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">LTV</div>
                    <div className="font-bold text-slate-900">{seg.ltv}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Retenção</div>
                    <div className="font-bold text-slate-900">{seg.taxa}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefícios da Integração */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="w-5 h-5" />
            Benefícios da Integração Shopify
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Dados em Tempo Real</div>
                <div className="text-sm text-slate-600">Pedidos, clientes e inventário sincronizados automaticamente</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Previsões Mais Precisas</div>
                <div className="text-sm text-slate-600">IA treina com dados reais do Shopify, acurácia aumenta para 92%</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Segmentação Automática</div>
                <div className="text-sm text-slate-600">Clientes classificados automaticamente por persona</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Campanhas Personalizadas</div>
                <div className="text-sm text-slate-600">Email marketing automático baseado em histórico de compras</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Impacto: +R$ 47K/mês</div>
                <div className="text-sm text-slate-600">Previsões mais precisas + automação = +21% receita</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
