import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Users, TrendingUp, AlertCircle, CheckCircle, Clock, ArrowRight, Settings } from 'lucide-react';

export const AutomacaoSegmentacaoClientesSection = () => {
  const [selectedRule, setSelectedRule] = useState(0);

  const regras = [
    {
      nome: 'VIP → Em Risco',
      condicao: 'Sem compra há 30 dias',
      acao: 'Enviar cupom exclusivo 15% + email personalizado',
      clientes: 47,
      taxa_sucesso: 68,
      receita_gerada: 18500,
      ativa: true,
      frequencia: 'Diária'
    },
    {
      nome: 'Em Risco → Ativo',
      condicao: 'Compra acima de R$ 500 no mês',
      acao: 'Remover da lista de risco + oferecer programa loyalty',
      clientes: 156,
      taxa_sucesso: 82,
      receita_gerada: 52300,
      ativa: true,
      frequencia: 'Diária'
    },
    {
      nome: 'Dormentes → Em Risco',
      condicao: 'Sem compra há 60 dias',
      acao: 'Enviar SMS + email com top 3 produtos recomendados',
      clientes: 89,
      taxa_sucesso: 45,
      receita_gerada: 12400,
      ativa: true,
      frequencia: 'Semanal'
    },
    {
      nome: 'Ativos → VIP',
      condicao: 'LTV > R$ 5.000 + 5+ compras',
      acao: 'Convite exclusivo VIP + acesso early access',
      clientes: 23,
      taxa_sucesso: 91,
      receita_gerada: 28600,
      ativa: true,
      frequencia: 'Diária'
    },
    {
      nome: 'Qualquer → Dormentes',
      condicao: 'Sem atividade há 90 dias',
      acao: 'Mover para segmento dormentes + pausar emails',
      clientes: 412,
      taxa_sucesso: 100,
      receita_gerada: 0,
      ativa: true,
      frequencia: 'Semanal'
    }
  ];

  const metricas = [
    {
      titulo: 'Clientes Movimentados',
      valor: '727',
      descricao: 'Este mês',
      icon: Users,
      cor: 'text-blue-600'
    },
    {
      titulo: 'Taxa de Sucesso Média',
      valor: '77.2%',
      descricao: 'Todas as regras',
      icon: CheckCircle,
      cor: 'text-green-600'
    },
    {
      titulo: 'Receita Gerada',
      valor: 'R$ 111.8K',
      descricao: 'Por automação',
      icon: TrendingUp,
      cor: 'text-emerald-600'
    },
    {
      titulo: 'Tempo Economizado',
      valor: '156h',
      descricao: 'Trabalho manual evitado',
      icon: Clock,
      cor: 'text-purple-600'
    }
  ];

  const impactos = [
    {
      segmento: 'VIP',
      antes: { clientes: 487, ltv: 'R$ 12.500', churn: '8%' },
      depois: { clientes: 512, ltv: 'R$ 14.200', churn: '3%' },
      melhoria: '+5.1% clientes, +13.6% LTV, -62.5% churn'
    },
    {
      segmento: 'Em Risco',
      antes: { clientes: 823, ltv: 'R$ 3.200', churn: '45%' },
      depois: { clientes: 756, ltv: 'R$ 4.100', churn: '22%' },
      melhoria: '-8.1% clientes, +28.1% LTV, -51.1% churn'
    },
    {
      segmento: 'Dormentes',
      antes: { clientes: 412, ltv: 'R$ 1.500', churn: '92%' },
      depois: { clientes: 389, ltv: 'R$ 2.800', churn: '68%' },
      melhoria: '-5.6% clientes, +86.7% LTV, -26.1% churn'
    },
    {
      segmento: 'Ativos',
      antes: { clientes: 2465, ltv: 'R$ 6.800', churn: '15%' },
      depois: { clientes: 2528, ltv: 'R$ 8.200', churn: '9%' },
      melhoria: '+2.6% clientes, +20.6% LTV, -40% churn'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Título e Descrição */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Automação de Segmentação de Clientes</h2>
        <p className="text-slate-600">Sistema inteligente que move clientes automaticamente entre segmentos baseado em comportamento, gerando +R$ 111.8K/mês</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid md:grid-cols-4 gap-4">
        {metricas.map((metrica, idx) => {
          const Icon = metrica.icon;
          return (
            <Card key={idx} className="border-slate-200">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{metrica.titulo}</p>
                    <p className="text-2xl font-bold text-slate-900">{metrica.valor}</p>
                    <p className="text-xs text-slate-500 mt-1">{metrica.descricao}</p>
                  </div>
                  <Icon className={`w-5 h-5 ${metrica.cor}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Regras de Automação */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Regras de Automação Ativas
          </CardTitle>
          <CardDescription>5 regras automáticas movimentando {regras.reduce((a, b) => a + b.clientes, 0)} clientes/mês</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {/* Lista de Regras */}
            <div className="space-y-2">
              {regras.map((regra, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedRule(idx)}
                  className={`w-full text-left p-3 rounded-lg border transition-all ${
                    selectedRule === idx
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{regra.nome}</p>
                      <p className="text-xs text-slate-600">{regra.condicao}</p>
                    </div>
                    {regra.ativa && <Badge variant="default" className="text-xs">Ativa</Badge>}
                  </div>
                </button>
              ))}
            </div>

            {/* Detalhes da Regra Selecionada */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Regra Selecionada</p>
                  <p className="text-lg font-bold text-slate-900">{regras[selectedRule].nome}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-600 uppercase font-semibold">Condição</p>
                    <p className="text-sm text-slate-900">{regras[selectedRule].condicao}</p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-600 uppercase font-semibold">Ação</p>
                    <p className="text-sm text-slate-900">{regras[selectedRule].acao}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                    <div>
                      <p className="text-xs text-slate-600">Clientes/Mês</p>
                      <p className="text-lg font-bold text-blue-600">{regras[selectedRule].clientes}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Taxa Sucesso</p>
                      <p className="text-lg font-bold text-green-600">{regras[selectedRule].taxa_sucesso}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Receita Gerada</p>
                      <p className="text-lg font-bold text-emerald-600">R$ {(regras[selectedRule].receita_gerada / 1000).toFixed(1)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Frequência</p>
                      <p className="text-sm font-semibold text-slate-900">{regras[selectedRule].frequencia}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Impacto por Segmento */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Impacto da Automação por Segmento
          </CardTitle>
          <CardDescription>Comparação antes vs depois da implementação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {impactos.map((impacto, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-bold text-slate-900 mb-3">{impacto.segmento}</h4>
                
                <div className="grid md:grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Clientes</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">{impacto.antes.clientes}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-900">{impacto.depois.clientes}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">LTV Médio</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">{impacto.antes.ltv}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-slate-900">{impacto.depois.ltv}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 mb-1">Churn</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-600">{impacto.antes.churn}</span>
                      <ArrowRight className="w-4 h-4 text-slate-400" />
                      <span className="font-semibold text-green-600">{impacto.depois.churn}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 p-2 rounded text-sm text-green-700">
                  <strong>Melhoria:</strong> {impacto.melhoria}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Próximos Passos */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <AlertCircle className="w-5 h-5" />
            Próximas Otimizações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-900">
          <div className="flex items-start gap-3">
            <Settings className="w-4 h-4 mt-1 flex-shrink-0" />
            <p><strong>Adicionar IA Preditiva:</strong> Prever churn com 30 dias de antecedência para ação preventiva</p>
          </div>
          <div className="flex items-start gap-3">
            <Settings className="w-4 h-4 mt-1 flex-shrink-0" />
            <p><strong>Personalização Dinâmica:</strong> Ajustar cupons e ofertas baseado em histórico de compra individual</p>
          </div>
          <div className="flex items-start gap-3">
            <Settings className="w-4 h-4 mt-1 flex-shrink-0" />
            <p><strong>Integração CRM:</strong> Sincronizar automação com CRM para rastreamento completo de jornada</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
