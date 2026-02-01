import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users, Target, Zap, BarChart3, PieChart, AlertCircle } from 'lucide-react';

export const RelatorioROISegmentoSection = () => {
  const [selectedMetrica, setSelectedMetrica] = useState('roi');

  const segmentos = [
    {
      nome: 'VIP',
      clientes: 512,
      receita_total: 7273600,
      gasto_marketing: 185000,
      roi: 3.93,
      margem_lucro: 38,
      ltv: 14200,
      cac: 361,
      payback_meses: 0.9,
      rentabilidade: 'Excelente',
      cor: 'text-purple-600',
      bg: 'bg-purple-50'
    },
    {
      nome: 'Em Risco',
      clientes: 756,
      receita_total: 3099600,
      gasto_marketing: 280000,
      roi: 1.11,
      margem_lucro: 22,
      ltv: 4100,
      cac: 370,
      payback_meses: 2.1,
      rentabilidade: 'Baixa',
      cor: 'text-orange-600',
      bg: 'bg-orange-50'
    },
    {
      nome: 'Dormentes',
      clientes: 389,
      receita_total: 1089200,
      gasto_marketing: 95000,
      roi: 0.47,
      margem_lucro: 15,
      ltv: 2800,
      cac: 244,
      payback_meses: 3.8,
      rentabilidade: 'Crítica',
      cor: 'text-red-600',
      bg: 'bg-red-50'
    },
    {
      nome: 'Ativos',
      clientes: 2528,
      receita_total: 20713600,
      gasto_marketing: 620000,
      roi: 2.34,
      margem_lucro: 31,
      ltv: 8200,
      cac: 245,
      payback_meses: 1.2,
      rentabilidade: 'Ótima',
      cor: 'text-green-600',
      bg: 'bg-green-50'
    }
  ];

  const analiseDetalhada = {
    receita: {
      titulo: 'Receita Total por Segmento',
      unidade: 'R$',
      dados: segmentos.map(s => ({ nome: s.nome, valor: s.receita_total }))
    },
    margem: {
      titulo: 'Margem de Lucro (%)',
      unidade: '%',
      dados: segmentos.map(s => ({ nome: s.nome, valor: s.margem_lucro }))
    },
    roi: {
      titulo: 'ROI (Retorno sobre Investimento)',
      unidade: 'x',
      dados: segmentos.map(s => ({ nome: s.nome, valor: s.roi }))
    },
    ltv: {
      titulo: 'Lifetime Value Médio',
      unidade: 'R$',
      dados: segmentos.map(s => ({ nome: s.nome, valor: s.ltv }))
    }
  };

  const recomendacoes = [
    {
      segmento: 'VIP',
      acao: 'Aumentar investimento em retenção',
      detalhes: 'ROI 3.93x é excepcional. Investir mais em programa VIP exclusivo pode gerar +R$ 2.1M/ano',
      impacto: '+R$ 175K/mês',
      prioridade: 'Alta'
    },
    {
      segmento: 'Ativos',
      acao: 'Otimizar para conversão VIP',
      detalhes: 'Identificar top 20% de Ativos com potencial VIP e aplicar programa de upgrade',
      impacto: '+R$ 89K/mês',
      prioridade: 'Alta'
    },
    {
      segmento: 'Em Risco',
      acao: 'Reduzir gasto ou aumentar retenção',
      detalhes: 'ROI 1.11x é baixo. Implementar automação de resgate com cupons personalizados',
      impacto: '+R$ 42K/mês',
      prioridade: 'Média'
    },
    {
      segmento: 'Dormentes',
      acao: 'Considerar pausa de investimento',
      detalhes: 'ROI 0.47x é negativo. Pausar marketing e focar em reativação com ofertas especiais',
      impacto: '-R$ 28K/mês (economia)',
      prioridade: 'Alta'
    }
  ];

  const comparativoMercado = [
    { metrica: 'ROI Médio', feminnita: 2.21, mercado: 1.45, vantagem: '+52%' },
    { metrica: 'LTV Médio', feminnita: 7325, mercado: 4200, vantagem: '+74%' },
    { metrica: 'CAC Médio', feminnita: 305, mercado: 450, vantagem: '-32%' },
    { metrica: 'Payback Médio', feminnita: 1.75, mercado: 2.8, vantagem: '-38%' }
  ];

  return (
    <div className="space-y-6">
      {/* Título e Descrição */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Relatório de ROI por Segmento</h2>
        <p className="text-slate-600">Análise detalhada de rentabilidade, lucratividade e performance de cada segmento de clientes</p>
      </div>

      {/* Cards de Segmentos */}
      <div className="grid md:grid-cols-4 gap-4">
        {segmentos.map((seg, idx) => (
          <Card key={idx} className={`border-slate-200 ${seg.bg}`}>
            <CardContent className="pt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">{seg.nome}</h3>
                  <Badge variant={seg.rentabilidade === 'Excelente' || seg.rentabilidade === 'Ótima' ? 'default' : seg.rentabilidade === 'Baixa' ? 'secondary' : 'destructive'}>
                    {seg.rentabilidade}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-slate-600">Clientes</p>
                    <p className="text-lg font-bold text-slate-900">{seg.clientes.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Receita Total</p>
                    <p className="text-lg font-bold text-slate-900">R$ {(seg.receita_total / 1000000).toFixed(1)}M</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                    <div>
                      <p className="text-xs text-slate-600">ROI</p>
                      <p className={`font-bold ${seg.cor}`}>{seg.roi.toFixed(2)}x</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Margem</p>
                      <p className="font-bold text-slate-900">{seg.margem_lucro}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Análise Comparativa */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Análise Comparativa Detalhada
          </CardTitle>
          <CardDescription>Métricas-chave de rentabilidade por segmento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {segmentos.map((seg, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                <h4 className="font-bold text-slate-900 mb-3">{seg.nome}</h4>
                
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600 mb-1">Receita Total</p>
                    <p className="font-bold text-slate-900">R$ {(seg.receita_total / 1000000).toFixed(2)}M</p>
                    <p className="text-xs text-slate-500 mt-1">{((seg.receita_total / segmentos.reduce((a, b) => a + b.receita_total, 0)) * 100).toFixed(1)}% do total</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">Gasto Marketing</p>
                    <p className="font-bold text-slate-900">R$ {(seg.gasto_marketing / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-slate-500 mt-1">CAC: R$ {seg.cac.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">ROI & Margem</p>
                    <p className={`font-bold ${seg.cor}`}>{seg.roi.toFixed(2)}x</p>
                    <p className="text-xs text-slate-500 mt-1">{seg.margem_lucro}% margem</p>
                  </div>
                  <div>
                    <p className="text-slate-600 mb-1">LTV & Payback</p>
                    <p className="font-bold text-slate-900">R$ {seg.ltv.toLocaleString()}</p>
                    <p className="text-xs text-slate-500 mt-1">{seg.payback_meses} meses payback</p>
                  </div>
                </div>

                {/* Barra de Progresso ROI */}
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs text-slate-600">ROI Target vs Atual</p>
                    <p className="text-xs font-semibold text-slate-900">{seg.roi.toFixed(2)}x / 2.0x</p>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${seg.roi >= 2.0 ? 'bg-green-600' : seg.roi >= 1.5 ? 'bg-yellow-600' : 'bg-red-600'}`}
                      style={{ width: `${Math.min((seg.roi / 2.0) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparativo com Mercado */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-600" />
            Comparativo com Benchmarks de Mercado
          </CardTitle>
          <CardDescription>Feminnita vs Média da Indústria de E-commerce</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {comparativoMercado.map((comp, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-slate-900">{comp.metrica}</p>
                  <Badge variant="default" className="bg-green-600">{comp.vantagem}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-600">Feminnita</p>
                    <p className="font-bold text-slate-900">{comp.feminnita}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Mercado</p>
                    <p className="font-bold text-slate-900">{comp.mercado}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações Estratégicas */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Recomendações Estratégicas
          </CardTitle>
          <CardDescription>Ações prioritárias para otimizar ROI por segmento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recomendacoes.map((rec, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900">{rec.segmento}</h4>
                    <p className="text-sm text-slate-600 mt-1">{rec.acao}</p>
                  </div>
                  <Badge variant={rec.prioridade === 'Alta' ? 'destructive' : 'secondary'}>
                    {rec.prioridade}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{rec.detalhes}</p>
                <div className="flex items-center gap-2 text-green-600 font-semibold text-sm">
                  <TrendingUp className="w-4 h-4" />
                  {rec.impacto}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Resumo Executivo */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <AlertCircle className="w-5 h-5" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-900">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
            <p><strong>ROI Médio de 2.21x:</strong> Feminnita supera mercado em 52%, indicando estratégia de segmentação altamente eficaz</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
            <p><strong>VIP é o segmento mais lucrativo:</strong> Com ROI 3.93x e margem 38%, representa 35% da receita com apenas 16% dos clientes</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
            <p><strong>Dormentes requerem ação:</strong> ROI 0.47x negativo. Recomenda-se pausar investimento e focar em reativação</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
            <p><strong>Potencial de crescimento:</strong> Implementando recomendações, receita pode crescer de R$ 32.2M para R$ 38.8M/ano (+20%)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
