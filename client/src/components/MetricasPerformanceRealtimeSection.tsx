import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, ShoppingCart, Users, DollarSign, Zap } from 'lucide-react';

export default function MetricasPerformanceRealtimeSection() {
  const [metricas, setMetricas] = useState({
    vendas: { valor: 12450, variacao: 15.3, status: 'up' },
    conversao: { valor: 6.8, variacao: 2.1, status: 'up' },
    ticketMedio: { valor: 285.50, variacao: -1.2, status: 'down' },
    clientesAtivos: { valor: 487, variacao: 8.5, status: 'up' },
  });

  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(new Date());

  // Simular atualização em tempo real
  useEffect(() => {
    const interval = setInterval(() => {
      setMetricas(prev => ({
        vendas: { ...prev.vendas, valor: prev.vendas.valor + Math.floor(Math.random() * 100) },
        conversao: { ...prev.conversao, valor: Number(((prev.conversao.valor as number) + (Math.random() - 0.5) * 0.5).toFixed(1)) },
        ticketMedio: { ...prev.ticketMedio, valor: Number(((prev.ticketMedio.valor as number) + (Math.random() - 0.5) * 10).toFixed(2)) },
        clientesAtivos: { ...prev.clientesAtivos, valor: prev.clientesAtivos.valor + Math.floor(Math.random() * 5) },
      }));
      setUltimaAtualizacao(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const MetricaCard = ({ titulo, valor, unidade, variacao, status, icon: Icon }: any) => (
    <Card className="border-amber-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-600">{titulo}</CardTitle>
          <div className="p-2 bg-amber-100 rounded-lg">
            <Icon className="w-4 h-4 text-amber-700" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">
          {String(valor)}
          <span className="text-lg text-slate-500 ml-1">{unidade}</span>
        </div>
        <div className="flex items-center gap-2 mt-2">
          {status === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-600" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-600" />
          )}
          <span className={status === 'up' ? 'text-green-600 text-sm font-semibold' : 'text-red-600 text-sm font-semibold'}>
            {status === 'up' ? '+' : ''}{String(variacao)}%
          </span>
          <span className="text-xs text-slate-500">vs ontem</span>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Status em Tempo Real */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Métricas em Tempo Real</h2>
          <p className="text-sm text-slate-600 mt-1">Dashboard atualizado a cada 5 segundos</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
          <span className="text-sm text-slate-600">Atualizado às {ultimaAtualizacao.toLocaleTimeString('pt-BR')}</span>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricaCard
          titulo="Vendas do Dia"
          valor={`R$ ${metricas.vendas.valor.toLocaleString('pt-BR')}`}
          unidade=""
          variacao={metricas.vendas.variacao}
          status={metricas.vendas.status}
          icon={ShoppingCart}
        />
        <MetricaCard
          titulo="Taxa de Conversão"
          valor={metricas.conversao.valor}
          unidade="%"
          variacao={metricas.conversao.variacao}
          status={metricas.conversao.status}
          icon={Zap}
        />
        <MetricaCard
          titulo="Ticket Médio"
          valor={`R$ ${(metricas.ticketMedio.valor as number).toFixed(2)}`}
          unidade=""
          variacao={metricas.ticketMedio.variacao}
          status={metricas.ticketMedio.status}
          icon={DollarSign}
        />
        <MetricaCard
          titulo="Clientes Ativos"
          valor={metricas.clientesAtivos.valor}
          unidade=""
          variacao={metricas.clientesAtivos.variacao}
          status={metricas.clientesAtivos.status}
          icon={Users}
        />
      </div>

      {/* Detalhes por Canal */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle>Performance por Canal</CardTitle>
          <CardDescription>Vendas e conversão em tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { canal: 'Instagram', vendas: 4250, conversao: 7.2, status: 'up' },
              { canal: 'TikTok', vendas: 3800, conversao: 6.5, status: 'up' },
              { canal: 'Facebook', vendas: 2400, conversao: 5.8, status: 'down' },
              { canal: 'Email', vendas: 1950, conversao: 8.1, status: 'up' },
              { canal: 'WhatsApp', vendas: 50, conversao: 12.3, status: 'up' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div>
                  <p className="font-semibold text-slate-900">{item.canal}</p>
                  <p className="text-sm text-slate-600">R$ {item.vendas.toLocaleString('pt-BR')}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    {item.status === 'up' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-600" />
                    )}
                    <span className="font-semibold text-slate-900">{item.conversao}%</span>
                  </div>
                  <p className="text-xs text-slate-500">conversão</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas de Performance */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle>Alertas de Performance</CardTitle>
          <CardDescription>Eventos importantes do dia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
              <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-slate-900">Pico de Vendas</p>
                <p className="text-sm text-slate-600">Instagram atingiu R$ 4.250 (+18% vs média)</p>
                <p className="text-xs text-slate-500 mt-1">Há 2 minutos</p>
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-slate-900">Meta Atingida</p>
                <p className="text-sm text-slate-600">Conversão diária atingiu 6.8% (meta: 6.5%)</p>
                <p className="text-xs text-slate-500 mt-1">Há 5 minutos</p>
              </div>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
              <div className="w-2 h-2 bg-amber-600 rounded-full mt-2"></div>
              <div>
                <p className="font-semibold text-slate-900">Atenção: Facebook</p>
                <p className="text-sm text-slate-600">Conversão caiu para 5.8% (-0.7% vs ontem)</p>
                <p className="text-xs text-slate-500 mt-1">Há 8 minutos</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
