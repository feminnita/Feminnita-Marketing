import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, DollarSign, Eye, MousePointerClick, ShoppingCart, BarChart3, Zap, AlertCircle } from 'lucide-react';

interface CampanhaFacebook {
  id: string;
  nome: string;
  status: string;
  persona: string;
  plataformas: string[];
  impressoes: number;
  cliques: number;
  conversoes: number;
  gasto: number;
  receita: number;
  roi: number;
  ctr: number;
  cpc: number;
}

interface MetricaFacebook {
  metrica: string;
  valor: string;
  variacao: string;
}

export function IntegracaoFacebookAdsSection() {
  const [campanhas] = useState<CampanhaFacebook[]>([
    {
      id: '1',
      nome: 'Pijama Carol - Carrossel',
      status: 'Ativa',
      persona: 'Carol',
      plataformas: ['Facebook', 'Instagram'],
      impressoes: 892400,
      cliques: 32850,
      conversoes: 512,
      gasto: 5200,
      receita: 96840,
      roi: 1.863,
      ctr: 3.68,
      cpc: 0.16,
    },
    {
      id: '2',
      nome: 'Robe Renata - Video',
      status: 'Ativa',
      persona: 'Renata',
      plataformas: ['Facebook', 'Instagram'],
      impressoes: 756200,
      cliques: 26450,
      conversoes: 378,
      gasto: 4600,
      receita: 89540,
      roi: 1.947,
      ctr: 3.50,
      cpc: 0.17,
    },
    {
      id: '3',
      nome: 'Pijama Vanessa - Stories',
      status: 'Ativa',
      persona: 'Vanessa',
      plataformas: ['Instagram'],
      impressoes: 312400,
      cliques: 11230,
      conversoes: 142,
      gasto: 1900,
      receita: 26840,
      roi: 1.414,
      ctr: 3.59,
      cpc: 0.17,
    },
    {
      id: '4',
      nome: 'Pijama Luiza Luxo - Reels',
      status: 'Ativa',
      persona: 'Luiza',
      plataformas: ['Facebook', 'Instagram'],
      impressoes: 1023600,
      cliques: 41230,
      conversoes: 658,
      gasto: 7800,
      receita: 156480,
      roi: 2.006,
      ctr: 4.03,
      cpc: 0.19,
    },
  ]);

  const [metricas] = useState<MetricaFacebook[]>([
    { metrica: 'Impressões Totais', valor: '2.98M', variacao: '↑ 77% vs Instagram só' },
    { metrica: 'Cliques Totais', valor: '111.8K', variacao: '↑ 69% vs Instagram só' },
    { metrica: 'Conversões', valor: '1.690', variacao: '↑ 72% vs Instagram só' },
    { metrica: 'Gasto Total', valor: 'R$ 19.5K', variacao: '↑ 62% vs Instagram só' },
    { metrica: 'Receita Total', valor: 'R$ 369.7K', variacao: '↑ 73% vs Instagram só' },
    { metrica: 'ROI Médio', valor: '1.858x', variacao: '↑ 5% vs Instagram só' },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Integração Facebook Ads</h2>
          <p className="text-slate-600 mt-1">Rastreie campanhas Facebook + Instagram juntas para maior alcance</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
          ✓ 4 Campanhas Meta
        </Badge>
      </div>

      {/* Benefício Principal */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">🚀 Por que Facebook + Instagram?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-lg border border-green-200">
              <div className="font-semibold text-slate-900 mb-1">📱 Maior Alcance</div>
              <div className="text-sm text-slate-600">
                Instagram: 1.68M impressões
                <br />
                Facebook + Instagram: 2.98M impressões
                <br />
                <span className="font-bold text-green-600">+77% mais pessoas!</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-green-200">
              <div className="font-semibold text-slate-900 mb-1">💰 Maior Receita</div>
              <div className="text-sm text-slate-600">
                Instagram: R$ 213K
                <br />
                Facebook + Instagram: R$ 369.7K
                <br />
                <span className="font-bold text-green-600">+R$ 156.7K extra!</span>
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-green-200">
              <div className="font-semibold text-slate-900 mb-1">🎯 Mesmo Gasto</div>
              <div className="text-sm text-slate-600">
                Instagram: R$ 12K
                <br />
                Facebook + Instagram: R$ 19.5K
                <br />
                <span className="font-bold text-green-600">+62% gasto = +73% receita!</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricas.map((metrica, idx) => (
          <Card key={idx} className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-slate-600">{metrica.metrica}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-slate-900">{metrica.valor}</div>
              <p className="text-xs text-green-600 mt-1">{metrica.variacao}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Campanhas Meta (Facebook + Instagram) */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <CardTitle>Campanhas Meta (Facebook + Instagram)</CardTitle>
          </div>
          <CardDescription>Campanhas que rodam simultaneamente em ambas plataformas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campanhas.map((camp) => (
              <div key={camp.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{camp.nome}</div>
                    <div className="text-sm text-slate-600 mt-1">{camp.persona}</div>
                  </div>
                  <div className="flex gap-2">
                    {camp.plataformas.map((plat) => (
                      <Badge key={plat} className={plat === 'Facebook' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'}>
                        {plat}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-3 p-3 bg-slate-50 rounded">
                  <div>
                    <div className="text-xs text-slate-600">Impressões</div>
                    <div className="font-semibold text-slate-900">{(camp.impressoes / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Cliques</div>
                    <div className="font-semibold text-slate-900">{(camp.cliques / 1000).toFixed(1)}K</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Conversões</div>
                    <div className="font-semibold text-green-600">{camp.conversoes}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Gasto</div>
                    <div className="font-semibold text-slate-900">R$ {camp.gasto.toLocaleString('pt-BR')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">Receita</div>
                    <div className="font-semibold text-green-600">R$ {(camp.receita / 1000).toFixed(1)}K</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">ROI</div>
                    <div className="font-semibold text-green-600">{camp.roi.toFixed(2)}x</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">CTR</div>
                    <div className="font-semibold text-slate-900">{camp.ctr.toFixed(2)}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600">CPC</div>
                    <div className="font-semibold text-slate-900">R$ {camp.cpc.toFixed(2)}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1">
                    Editar Campanha
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Ver Detalhes
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <Zap className="w-5 h-5" />
            Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <div className="font-medium text-slate-900 mb-1">✅ Escale Campanhas Meta</div>
              <div className="text-sm text-slate-600">
                Campanhas em Facebook + Instagram geram +73% receita. Aumente budget em +30% para Luiza (melhor ROI 2.006x).
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <div className="font-medium text-slate-900 mb-1">🎯 Adicione Facebook-Only</div>
              <div className="text-sm text-slate-600">
                Teste campanhas APENAS no Facebook para atingir público mais velho (35-50 anos) que não usa Instagram.
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-blue-200">
              <div className="font-medium text-slate-900 mb-1">📊 Monitore Diferenças</div>
              <div className="text-sm text-slate-600">
                Vanessa tem performance melhor no Instagram. Carol e Luiza melhor em Meta (Facebook+Instagram).
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="flex gap-3 flex-wrap">
        <Button className="bg-blue-600 hover:bg-blue-700">Criar Campanha Meta</Button>
        <Button variant="outline">Sincronizar Dados</Button>
        <Button variant="outline">Ver Relatório Completo</Button>
      </div>
    </div>
  );
}
