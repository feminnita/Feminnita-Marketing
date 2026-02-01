import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, DollarSign, Users, Target, Zap, BarChart3, AlertCircle } from 'lucide-react';

export const ComparativoMetaGoogleAdsSection = () => {
  const campaigns = [
    {
      platform: 'Meta (Facebook + Instagram)',
      impressoes: 2980000,
      cliques: 111800,
      conversoes: 1690,
      cpc: 4.82,
      cpa: 2980,
      roi: 1.858,
      gasto: 539000,
      receita: 1002620,
      ctaRate: 3.75,
      trend: 'up'
    },
    {
      platform: 'Google Ads (Search + Display)',
      impressoes: 1680000,
      cliques: 84200,
      conversoes: 1240,
      cpc: 6.40,
      cpa: 4032,
      roi: 1.245,
      gasto: 538880,
      receita: 671200,
      ctaRate: 5.01,
      trend: 'down'
    }
  ];

  const comparacao = {
    impressoes: { meta: '+77%', valor: 1300000 },
    cliques: { meta: '+33%', valor: 27600 },
    conversoes: { meta: '+36%', valor: 450 },
    roi: { meta: '+49%', valor: 0.613 },
    receita: { meta: '+49%', valor: 331420 },
    cpa: { meta: '-26%', valor: 1052 }
  };

  const recomendacoes = [
    {
      titulo: 'Aumentar Budget Meta',
      descricao: 'Meta tem 49% melhor ROI. Recomenda-se aumentar budget em 30% (de R$ 539K para R$ 700K)',
      impacto: '+R$ 215K/mês',
      prioridade: 'Alta'
    },
    {
      titulo: 'Otimizar Google Ads',
      descricao: 'Melhorar qualidade dos anúncios Search para reduzir CPA de R$ 4.032 para R$ 3.000',
      impacto: '+R$ 98K/mês',
      prioridade: 'Alta'
    },
    {
      titulo: 'Teste A/B de Segmentação',
      descricao: 'Testar segmentação mais específica no Google Ads para aumentar taxa de conversão',
      impacto: '+R$ 45K/mês',
      prioridade: 'Média'
    },
    {
      titulo: 'Redirecionar Budget',
      descricao: 'Mover 20% do budget Google para Meta (melhor performance comprovada)',
      impacto: '+R$ 128K/mês',
      prioridade: 'Alta'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Título e Descrição */}
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Dashboard de Comparação: Meta vs Google Ads</h2>
        <p className="text-slate-600">Análise comparativa de performance entre campanhas Meta (Facebook + Instagram) e Google Ads para otimização de budget e ROI</p>
      </div>

      {/* Cards de Performance */}
      <div className="grid md:grid-cols-2 gap-6">
        {campaigns.map((campaign, idx) => (
          <Card key={idx} className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{campaign.platform}</CardTitle>
                <Badge variant={campaign.roi > 1.5 ? "default" : "secondary"}>
                  ROI: {campaign.roi.toFixed(2)}x
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Impressões</p>
                  <p className="text-2xl font-bold text-slate-900">{(campaign.impressoes / 1000000).toFixed(1)}M</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Cliques</p>
                  <p className="text-2xl font-bold text-slate-900">{(campaign.cliques / 1000).toFixed(0)}K</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">Conversões</p>
                  <p className="text-2xl font-bold text-slate-900">{campaign.conversoes.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-600">CTR</p>
                  <p className="text-2xl font-bold text-slate-900">{campaign.ctaRate.toFixed(2)}%</p>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">CPC</span>
                  <span className="font-semibold text-slate-900">R$ {campaign.cpc.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">CPA</span>
                  <span className="font-semibold text-slate-900">R$ {campaign.cpa.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Gasto Total</span>
                  <span className="font-semibold text-slate-900">R$ {campaign.gasto.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center bg-green-50 p-3 rounded-lg">
                  <span className="text-sm text-slate-600">Receita Gerada</span>
                  <span className="font-bold text-green-600">R$ {campaign.receita.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparação Detalhada */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Comparação Detalhada
          </CardTitle>
          <CardDescription>Meta apresenta vantagem em 5 das 6 métricas principais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(comparacao).map(([metrica, dados]) => (
              <div key={metrica} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900 capitalize">{metrica.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-sm text-slate-600">Vantagem Meta</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    <span className="text-lg font-bold text-green-600">{dados.meta}</span>
                  </div>
                  <p className="text-xs text-slate-600">+{dados.valor.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-600" />
            Recomendações de Otimização
          </CardTitle>
          <CardDescription>Ações prioritárias para maximizar ROI e receita</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recomendacoes.map((rec, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{rec.titulo}</h4>
                  <Badge variant={rec.prioridade === 'Alta' ? 'destructive' : 'secondary'}>
                    {rec.prioridade}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-3">{rec.descricao}</p>
                <div className="flex items-center gap-2 text-green-600 font-semibold">
                  <TrendingUp className="w-4 h-4" />
                  Impacto estimado: {rec.impacto}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights Finais */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <AlertCircle className="w-5 h-5" />
            Insights Estratégicos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-blue-900">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
            <p><strong>Meta é 49% mais eficiente:</strong> ROI de 1.858x vs 1.245x do Google Ads, com menor CPA (R$ 2.980 vs R$ 4.032)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
            <p><strong>Oportunidade de crescimento:</strong> Aumentar budget Meta em 30% pode gerar +R$ 215K/mês mantendo ROI</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
            <p><strong>Sinergia de canais:</strong> Usar Google Ads para topo de funil (awareness) e Meta para conversão (performance)</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2 flex-shrink-0" />
            <p><strong>Potencial total:</strong> Implementando todas as recomendações, receita pode crescer de R$ 1.67M para R$ 2.49M/mês (+49%)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
