import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, AlertCircle, Zap } from 'lucide-react';

interface Venda {
  id: string;
  persona: string;
  valor: number;
  produto: string;
  timestamp: string;
  cor?: string;
}

interface MetricaPersona {
  nome: string;
  vendas: number;
  total: number;
  percentual: number;
  cor: string;
}

export function PainelVendasTempoRealSection() {
  const [vendas, setVendas] = useState<Venda[]>([
    { id: '1', persona: 'Carol', valor: 189.90, produto: 'Pijama Floral', timestamp: '14:32', cor: 'bg-pink-100' },
    { id: '2', persona: 'Renata', valor: 249.90, produto: 'Pijama Premium', timestamp: '14:28', cor: 'bg-purple-100' },
    { id: '3', persona: 'Vanessa', valor: 159.90, produto: 'Pijama Básico', timestamp: '14:15', cor: 'bg-blue-100' },
    { id: '4', persona: 'Carol', valor: 189.90, produto: 'Pijama Floral', timestamp: '14:05', cor: 'bg-pink-100' },
    { id: '5', persona: 'Luiza', valor: 219.90, produto: 'Pijama Luxo', timestamp: '13:52', cor: 'bg-amber-100' },
  ]);

  const [metricas, setMetricas] = useState<MetricaPersona[]>([
    { nome: 'Carol', vendas: 12, total: 2278.80, percentual: 32, cor: 'bg-pink-500' },
    { nome: 'Renata', vendas: 10, total: 2499.00, percentual: 28, cor: 'bg-purple-500' },
    { nome: 'Vanessa', vendas: 11, total: 1759.90, percentual: 25, cor: 'bg-blue-500' },
    { nome: 'Luiza', vendas: 8, total: 1759.20, percentual: 15, cor: 'bg-amber-500' },
  ]);

  const totalVendas = metricas.reduce((sum, m) => sum + m.total, 0);
  const totalTransacoes = metricas.reduce((sum, m) => sum + m.vendas, 0);
  const ticketMedio = totalVendas / totalTransacoes;

  useEffect(() => {
    const interval = setInterval(() => {
      const personas = ['Carol', 'Renata', 'Vanessa', 'Luiza'];
      const produtos = ['Pijama Floral', 'Pijama Premium', 'Pijama Básico', 'Pijama Luxo'];
      const valores = [159.90, 189.90, 219.90, 249.90];

      const novaVenda: Venda = {
        id: Date.now().toString(),
        persona: personas[Math.floor(Math.random() * personas.length)],
        valor: valores[Math.floor(Math.random() * valores.length)],
        produto: produtos[Math.floor(Math.random() * produtos.length)],
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        cor: ['bg-pink-100', 'bg-purple-100', 'bg-blue-100', 'bg-amber-100'][Math.floor(Math.random() * 4)],
      };

      setVendas(prev => [novaVenda, ...prev.slice(0, 9)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Vendas em Tempo Real</h2>
          <p className="text-slate-600 mt-1">Acompanhe conversões e receita por persona</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
          <Zap className="w-4 h-4 text-green-600" />
          <span className="text-sm font-medium text-green-700">Ao Vivo</span>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Receita Hoje</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-green-600 mt-1">↑ 12% vs ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Transações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">{totalTransacoes}</div>
            <p className="text-xs text-green-600 mt-1">↑ 8% vs ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Ticket Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
            <p className="text-xs text-green-600 mt-1">↑ 3% vs ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Conversão</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">8.2%</div>
            <p className="text-xs text-green-600 mt-1">↑ 1.2% vs ontem</p>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Persona */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Persona</CardTitle>
          <CardDescription>Vendas e receita gerada por cada persona</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metricas.map((metrica) => (
              <div key={metrica.nome} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${metrica.cor}`}></div>
                    <span className="font-medium text-slate-900">{metrica.nome}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-900">R$ {metrica.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                    <div className="text-xs text-slate-600">{metrica.vendas} vendas</div>
                  </div>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${metrica.cor}`}
                    style={{ width: `${metrica.percentual}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vendas ao Vivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Vendas ao Vivo
          </CardTitle>
          <CardDescription>Últimas transações em tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {vendas.map((venda) => (
              <div key={venda.id} className={`p-3 rounded-lg ${venda.cor} border border-slate-200 flex items-center justify-between`}>
                <div>
                  <div className="font-semibold text-slate-900">{venda.persona}</div>
                  <div className="text-xs text-slate-600">{venda.produto}</div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-slate-900">R$ {venda.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                  <div className="text-xs text-slate-600">{venda.timestamp}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-900">
            <AlertCircle className="w-5 h-5" />
            Alertas e Oportunidades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
              <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Carol atingiu meta de R$ 2K</div>
                <div className="text-sm text-slate-600">Considere aumentar investimento nesta persona</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Pijama Floral é o produto mais vendido</div>
                <div className="text-sm text-slate-600">45% das vendas hoje</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-amber-200">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Luiza precisa de estímulo</div>
                <div className="text-sm text-slate-600">Apenas 8 vendas vs 12 de Carol. Considere nova campanha</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
