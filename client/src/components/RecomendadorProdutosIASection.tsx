import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, Star, TrendingUp, ShoppingCart, Zap } from 'lucide-react';

interface Recomendacao {
  id: string;
  cliente: string;
  persona: string;
  produtoAtual: string;
  produtoRecomendado: string;
  confianca: number;
  probabilidadeCompra: number;
  valorEsperado: number;
  motivo: string;
}

interface MetricaRecomendador {
  metrica: string;
  valor: string;
  variacao: string;
}

export function RecomendadorProdutosIASection() {
  const [recomendacoes] = useState<Recomendacao[]>([
    {
      id: '1',
      cliente: 'Maria Silva',
      persona: 'Carol',
      produtoAtual: 'Pijama Carol Premium',
      produtoRecomendado: 'Robe Carol Premium',
      confianca: 94,
      probabilidadeCompra: 78,
      valorEsperado: 189.90,
      motivo: 'Comprou 3x pijama Carol. Robe é complemento perfeito',
    },
    {
      id: '2',
      cliente: 'Ana Santos',
      persona: 'Renata',
      produtoAtual: 'Pijama Renata Casual',
      produtoRecomendado: 'Kit 2 Pijamas Renata',
      confianca: 87,
      probabilidadeCompra: 72,
      valorEsperado: 279.80,
      motivo: 'Frequência de compra 2x/mês. Bundle oferece 15% desconto',
    },
    {
      id: '3',
      cliente: 'Juliana Costa',
      persona: 'Vanessa',
      produtoAtual: 'Pijama Vanessa Casual',
      produtoRecomendado: 'Pijama Vanessa Premium',
      confianca: 82,
      probabilidadeCompra: 65,
      valorEsperado: 149.90,
      motivo: 'Comprou 5x casual. Pronta para upgrade premium',
    },
    {
      id: '4',
      cliente: 'Fernanda Lima',
      persona: 'Luiza',
      produtoAtual: 'Pijama Luiza Luxo',
      produtoRecomendado: 'Robe Luiza Luxo',
      confianca: 91,
      probabilidadeCompra: 76,
      valorEsperado: 249.90,
      motivo: 'Ticket médio R$ 320. Robe complementa perfeitamente',
    },
    {
      id: '5',
      cliente: 'Patricia Oliveira',
      persona: 'Carol',
      produtoAtual: 'Pijama Carol Premium',
      produtoRecomendado: 'Pijama Carol Edição Limitada',
      confianca: 88,
      probabilidadeCompra: 71,
      valorEsperado: 219.90,
      motivo: 'Cliente VIP. Edição limitada alinha com perfil',
    },
  ]);

  const [metricas] = useState<MetricaRecomendador[]>([
    { metrica: 'Taxa de Aceitação', valor: '68%', variacao: '↑ 12% vs período anterior' },
    { metrica: 'Conversão de Recomendação', valor: '42%', variacao: '↑ 18% vs período anterior' },
    { metrica: 'Valor Médio Recomendado', valor: 'R$ 217.88', variacao: '↑ 15% vs período anterior' },
    { metrica: 'Receita Extra Gerada', valor: 'R$ 45.8K', variacao: '↑ 34% vs período anterior' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Recomendador de Produtos com IA</h2>
          <p className="text-slate-600 mt-1">Sugira produtos personalizados para aumentar conversão e ticket médio</p>
        </div>
        <Badge className="bg-purple-100 text-purple-800 text-lg px-4 py-2">
          ✓ 94% Acurácia
        </Badge>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metricas.map((metrica, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{metrica.metrica}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{metrica.valor}</div>
              <p className="text-xs text-green-600 mt-1">{metrica.variacao}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recomendações Ativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Recomendações Ativas
          </CardTitle>
          <CardDescription>Produtos recomendados por IA para clientes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recomendacoes.map((rec) => (
              <div key={rec.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{rec.cliente}</div>
                    <div className="text-sm text-slate-600">{rec.persona} • {rec.produtoAtual}</div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-purple-100 text-purple-800 mb-1">
                      {rec.confianca}% confiança
                    </Badge>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-slate-50 to-purple-50 p-3 rounded-lg mb-3 border border-purple-100">
                  <div className="flex items-center gap-2 mb-1">
                    <ShoppingCart className="w-4 h-4 text-purple-600" />
                    <span className="font-semibold text-slate-900">Recomendação: {rec.produtoRecomendado}</span>
                  </div>
                  <div className="text-sm text-slate-600">{rec.motivo}</div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm mb-3">
                  <div>
                    <div className="text-slate-600">Probabilidade Compra</div>
                    <div className="font-semibold text-slate-900">{rec.probabilidadeCompra}%</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Valor Esperado</div>
                    <div className="font-semibold text-green-600">R$ {rec.valorEsperado.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Impacto Potencial</div>
                    <div className="font-semibold text-blue-600">+R$ {(rec.valorEsperado * rec.probabilidadeCompra / 100).toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="bg-purple-600 hover:bg-purple-700 flex-1">
                    Enviar Recomendação
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Ver Histórico
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Como Funciona */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Zap className="w-5 h-5" />
            Como a IA Recomenda Produtos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Analisa Histórico de Compra</div>
                <div className="text-sm text-slate-600">Examina todos os produtos já comprados, frequência e padrões</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Identifica Padrão da Persona</div>
                <div className="text-sm text-slate-600">Compara com outras clientes da mesma persona para encontrar padrões</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Calcula Probabilidade</div>
                <div className="text-sm text-slate-600">Usa machine learning para prever chance de compra (42-78%)</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Envia Recomendação Personalizada</div>
                <div className="text-sm text-slate-600">Notifica cliente com motivo específico por email/SMS/WhatsApp</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impacto Financeiro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Impacto Financeiro Mensal
          </CardTitle>
          <CardDescription>Receita gerada por recomendações automáticas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-900">Recomendações Enviadas</span>
                <span className="text-2xl font-bold text-green-600">1.247</span>
              </div>
              <div className="text-sm text-slate-600">↑ 34% vs período anterior</div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-900">Conversões Geradas</span>
                <span className="text-2xl font-bold text-blue-600">524</span>
              </div>
              <div className="text-sm text-slate-600">Taxa de conversão: 42%</div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-900">Receita Gerada</span>
                <span className="text-2xl font-bold text-purple-600">R$ 45.8K</span>
              </div>
              <div className="text-sm text-slate-600">Valor médio: R$ 217.88 por recomendação</div>
            </div>

            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-slate-900">Aumento de Ticket Médio</span>
                <span className="text-2xl font-bold text-orange-600">+18%</span>
              </div>
              <div className="text-sm text-slate-600">De R$ 189 para R$ 223 por cliente</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Próximas Ações */}
      <div className="flex gap-3">
        <Button className="bg-purple-600 hover:bg-purple-700">Ativar para Todos os Clientes</Button>
        <Button variant="outline">Ver Análise Detalhada</Button>
        <Button variant="outline">Configurar Regras de IA</Button>
      </div>
    </div>
  );
}
