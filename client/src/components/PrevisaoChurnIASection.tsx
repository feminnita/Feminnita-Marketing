import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingDown, Zap, Target, AlertCircle } from 'lucide-react';

interface ClienteRisco {
  id: string;
  nome: string;
  persona: string;
  risco: number;
  ultimaCompra: string;
  diasInativo: number;
  totalGasto: number;
  motivo: string;
  acao: string;
}

interface MetricaChurn {
  label: string;
  valor: string | number;
  mudanca: string;
  cor: string;
}

export function PrevisaoChurnIASection() {
  const [clientesRisco, setClientesRisco] = useState<ClienteRisco[]>([
    {
      id: '1',
      nome: 'Fernanda T.',
      persona: 'Luiza',
      risco: 92,
      ultimaCompra: '45 dias atrás',
      diasInativo: 45,
      totalGasto: 1200,
      motivo: 'Sem compras há 45 dias + avaliação negativa anterior',
      acao: 'Enviar cupom 30% + email personalizado',
    },
    {
      id: '2',
      nome: 'Patricia M.',
      persona: 'Vanessa',
      risco: 78,
      ultimaCompra: '32 dias atrás',
      diasInativo: 32,
      totalGasto: 890,
      motivo: 'Diminuição de engajamento em emails',
      acao: 'Reengajamento com novo produto',
    },
    {
      id: '3',
      nome: 'Camila S.',
      persona: 'Renata',
      risco: 65,
      ultimaCompra: '28 dias atrás',
      diasInativo: 28,
      totalGasto: 2100,
      motivo: 'Aumento de cliques em concorrentes',
      acao: 'Oferta exclusiva VIP',
    },
    {
      id: '4',
      nome: 'Debora L.',
      persona: 'Carol',
      risco: 42,
      ultimaCompra: '15 dias atrás',
      diasInativo: 15,
      totalGasto: 3400,
      motivo: 'Padrão normal de compra',
      acao: 'Manter contato regular',
    },
    {
      id: '5',
      nome: 'Elisa P.',
      persona: 'Vanessa',
      risco: 38,
      ultimaCompra: '10 dias atrás',
      diasInativo: 10,
      totalGasto: 1500,
      motivo: 'Cliente ativa e engajada',
      acao: 'Nenhuma ação necessária',
    },
  ]);

  const [metricas] = useState<MetricaChurn[]>([
    { label: 'Clientes em Risco Alto', valor: 2, mudanca: '↑ 1 vs semana anterior', cor: 'text-red-600' },
    { label: 'Clientes em Risco Médio', valor: 3, mudanca: '↓ 2 vs semana anterior', cor: 'text-orange-600' },
    { label: 'Churn Previsto (30 dias)', valor: '8.2%', mudanca: '↓ 1.5% vs mês anterior', cor: 'text-green-600' },
    { label: 'Efetividade de Retenção', valor: '76%', mudanca: '↑ 5% vs mês anterior', cor: 'text-green-600' },
  ]);

  const getRiscoColor = (risco: number) => {
    if (risco >= 80) return 'bg-red-100 text-red-800 border-red-300';
    if (risco >= 60) return 'bg-orange-100 text-orange-800 border-orange-300';
    if (risco >= 40) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-green-100 text-green-800 border-green-300';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Previsão de Churn com IA</h2>
          <p className="text-slate-600 mt-1">Identifique clientes em risco e ative campanhas de retenção</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Gerar Alertas
        </Button>
      </div>

      {/* Disclaimer */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Dados de exemplo — conecte seu ERP para previsão real de churn</p>
              <p className="text-sm text-slate-600 mt-1">
                Os clientes, scores de risco e valores exibidos abaixo são dados fictícios para demonstração. Conecte o Bling ERP para análise de churn baseada nos seus clientes reais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

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

      {/* Clientes em Risco */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Clientes em Risco de Churn
          </CardTitle>
          <CardDescription>Ordenado por probabilidade de churn (IA)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clientesRisco.map((cliente) => (
              <div key={cliente.id} className={`p-4 border rounded-lg ${getRiscoColor(cliente.risco)}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{cliente.nome}</span>
                      <Badge variant="outline" className="text-xs">{cliente.persona}</Badge>
                    </div>
                    <div className="text-sm opacity-90 mb-2">{cliente.ultimaCompra}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{cliente.risco}%</div>
                    <div className="text-xs opacity-75">Risco</div>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="w-full bg-black/20 rounded-full h-2">
                    <div
                      className="h-2 bg-current rounded-full"
                      style={{ width: `${cliente.risco}%` }}
                    ></div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                  <div>
                    <div className="opacity-75">Dias Inativo</div>
                    <div className="font-semibold">{cliente.diasInativo} dias</div>
                  </div>
                  <div>
                    <div className="opacity-75">Total Gasto</div>
                    <div className="font-semibold">R$ {cliente.totalGasto.toLocaleString('pt-BR')}</div>
                  </div>
                </div>

                <div className="mb-3 p-2 bg-black/10 rounded text-sm">
                  <div className="opacity-75 mb-1">Motivo:</div>
                  <div>{cliente.motivo}</div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 bg-white text-slate-900 hover:bg-slate-100" title={cliente.acao}>
                    Ativar
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

      {/* Campanhas de Retenção */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Campanhas de Retenção Automáticas
          </CardTitle>
          <CardDescription>Ações recomendadas por IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                titulo: 'Cupom de 30% para Luiza',
                descricao: 'Fernanda T. (92% risco). Enviar cupom exclusivo + email personalizado',
                efetividade: 65,
              },
              {
                titulo: 'Novo Produto VIP para Renata',
                descricao: 'Camila S. (65% risco). Oferta exclusiva de novo lançamento',
                efetividade: 58,
              },
              {
                titulo: 'Reengajamento Vanessa',
                descricao: 'Patricia M. (78% risco). Email com top 3 produtos mais vendidos',
                efetividade: 72,
              },
            ].map((campanha, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-slate-900">{campanha.titulo}</div>
                    <div className="text-sm text-slate-600 mt-1">{campanha.descricao}</div>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">{campanha.efetividade}% efetivo</Badge>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                    Ativar Campanha
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Agendar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise Preditiva */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <Target className="w-5 h-5" />
            Análise Preditiva
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
              <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Luiza tem maior taxa de churn</div>
                <div className="text-sm text-slate-600">38% de churn vs 18% de Carol. Investigar causas: qualidade, preço ou comunicação?</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
              <div className="w-2 h-2 rounded-full bg-orange-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Padrão: inatividade acima de 30 dias = 70% churn</div>
                <div className="text-sm text-slate-600">Ativar reengajamento antes de 30 dias para máxima efetividade</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-purple-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Carol: 82% retenção M6</div>
                <div className="text-sm text-slate-600">Modelo ideal. Replicar estratégia de comunicação para outras personas</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
