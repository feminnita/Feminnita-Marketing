import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Users, DollarSign, Eye, MousePointerClick, ShoppingCart, BarChart3, Zap, AlertCircle } from 'lucide-react';

interface CampanhaInstagram {
  id: string;
  nome: string;
  status: string;
  persona: string;
  impressoes: number;
  cliques: number;
  conversoes: number;
  gasto: number;
  receita: number;
  roi: number;
  ctr: number;
  cpc: number;
  dataInicio: string;
  dataFim: string;
}

interface MetricaInstagram {
  metrica: string;
  valor: string;
  variacao: string;
  cor: string;
}

export function IntegracaoInstagramAdsSection() {
  const [campanhas] = useState<CampanhaInstagram[]>([
    {
      id: '1',
      nome: 'Pijama Carol - Carrossel',
      status: 'Ativa',
      persona: 'Carol',
      impressoes: 456200,
      cliques: 18450,
      conversoes: 287,
      gasto: 3200,
      receita: 54380,
      roi: 1.699,
      ctr: 4.04,
      cpc: 0.17,
      dataInicio: '2026-01-15',
      dataFim: 'Ativa',
    },
    {
      id: '2',
      nome: 'Robe Renata - Video',
      status: 'Ativa',
      persona: 'Renata',
      impressoes: 389100,
      cliques: 14230,
      conversoes: 198,
      gasto: 2800,
      receita: 47240,
      roi: 1.687,
      ctr: 3.66,
      cpc: 0.20,
      dataInicio: '2026-01-18',
      dataFim: 'Ativa',
    },
    {
      id: '3',
      nome: 'Pijama Vanessa - Stories',
      status: 'Ativa',
      persona: 'Vanessa',
      impressoes: 312400,
      cliques: 11230,
      conversoes: 142,
      gasto: 1900,
      receita: 26840,
      roi: 1.414,
      ctr: 3.59,
      cpc: 0.17,
      dataInicio: '2026-01-20',
      dataFim: 'Ativa',
    },
    {
      id: '4',
      nome: 'Pijama Luiza Luxo - Reels',
      status: 'Ativa',
      persona: 'Luiza',
      impressoes: 523800,
      cliques: 22340,
      conversoes: 356,
      gasto: 4100,
      receita: 84560,
      roi: 2.063,
      ctr: 4.26,
      cpc: 0.18,
      dataInicio: '2026-01-12',
      dataFim: 'Ativa',
    },
  ]);

  const [metricas] = useState<MetricaInstagram[]>([
    { metrica: 'Impressões Totais', valor: '1.68M', variacao: '↑ 23% vs período anterior', cor: 'blue' },
    { metrica: 'Cliques Totais', valor: '66.2K', variacao: '↑ 18% vs período anterior', cor: 'purple' },
    { metrica: 'Conversões', valor: '983', variacao: '↑ 31% vs período anterior', cor: 'green' },
    { metrica: 'Gasto Total', valor: 'R$ 12K', variacao: '↑ 8% vs período anterior', cor: 'orange' },
    { metrica: 'Receita Total', valor: 'R$ 213K', variacao: '↑ 42% vs período anterior', cor: 'green' },
    { metrica: 'ROI Médio', valor: '1.766x', variacao: '↑ 15% vs período anterior', cor: 'green' },
  ]);

  const [filtroPersona, setFiltroPersona] = useState('todas');

  const campanhasFiltradas = filtroPersona === 'todas' 
    ? campanhas 
    : campanhas.filter(c => c.persona === filtroPersona);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Integração Instagram Ads</h2>
          <p className="text-slate-600 mt-1">Rastreie performance de campanhas Instagram em tempo real</p>
        </div>
        <Badge className="bg-pink-100 text-pink-800 text-lg px-4 py-2">
          ✓ 4 Campanhas Ativas
        </Badge>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metricas.map((metrica, idx) => {
          const corMap = {
            blue: 'bg-blue-50 border-blue-200',
            purple: 'bg-purple-50 border-purple-200',
            green: 'bg-green-50 border-green-200',
            orange: 'bg-orange-50 border-orange-200',
          };
          return (
            <Card key={idx} className={`${corMap[metrica.cor as keyof typeof corMap]}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-slate-600">{metrica.metrica}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-slate-900">{metrica.valor}</div>
                <p className="text-xs text-green-600 mt-1">{metrica.variacao}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Campanhas Ativas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-pink-600" />
              <CardTitle>Campanhas Instagram Ads</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant={filtroPersona === 'todas' ? 'default' : 'outline'}
                onClick={() => setFiltroPersona('todas')}
              >
                Todas
              </Button>
              <Button 
                size="sm" 
                variant={filtroPersona === 'Carol' ? 'default' : 'outline'}
                onClick={() => setFiltroPersona('Carol')}
              >
                Carol
              </Button>
              <Button 
                size="sm" 
                variant={filtroPersona === 'Renata' ? 'default' : 'outline'}
                onClick={() => setFiltroPersona('Renata')}
              >
                Renata
              </Button>
              <Button 
                size="sm" 
                variant={filtroPersona === 'Vanessa' ? 'default' : 'outline'}
                onClick={() => setFiltroPersona('Vanessa')}
              >
                Vanessa
              </Button>
              <Button 
                size="sm" 
                variant={filtroPersona === 'Luiza' ? 'default' : 'outline'}
                onClick={() => setFiltroPersona('Luiza')}
              >
                Luiza
              </Button>
            </div>
          </div>
          <CardDescription>Performance detalhada de cada campanha</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campanhasFiltradas.map((camp) => (
              <div key={camp.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{camp.nome}</div>
                    <div className="text-sm text-slate-600">{camp.persona} • {camp.dataInicio}</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{camp.status}</Badge>
                </div>

                {/* Métricas Principais */}
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mb-3 p-3 bg-slate-50 rounded">
                  <div>
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      Impressões
                    </div>
                    <div className="font-semibold text-slate-900">{(camp.impressoes / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <MousePointerClick className="w-3 h-3" />
                      Cliques
                    </div>
                    <div className="font-semibold text-slate-900">{(camp.cliques / 1000).toFixed(1)}K</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <ShoppingCart className="w-3 h-3" />
                      Conversões
                    </div>
                    <div className="font-semibold text-green-600">{camp.conversoes}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Gasto
                    </div>
                    <div className="font-semibold text-slate-900">R$ {camp.gasto.toLocaleString('pt-BR')}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Receita
                    </div>
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

                {/* Barra de Progresso ROI */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-600">Eficiência ROI</span>
                    <span className="text-xs font-semibold text-green-600">{(camp.roi * 100).toFixed(0)}% de retorno</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${Math.min(camp.roi * 50, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="bg-pink-600 hover:bg-pink-700 flex-1">
                    Editar Campanha
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Ver Detalhes
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    Pausar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparação Instagram vs TikTok */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-pink-600" />
            Comparação: Instagram vs TikTok Ads
          </CardTitle>
          <CardDescription>Performance comparativa entre plataformas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-pink-50 rounded-lg border border-pink-200">
              <div className="font-semibold text-slate-900 mb-3">📸 Instagram Ads</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Impressões</span>
                  <span className="font-semibold text-slate-900">1.68M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Gasto Total</span>
                  <span className="font-semibold text-slate-900">R$ 12K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Receita</span>
                  <span className="font-semibold text-green-600">R$ 213K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">ROI Médio</span>
                  <span className="font-semibold text-green-600">1.766x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">CTR Médio</span>
                  <span className="font-semibold text-slate-900">3.89%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-semibold text-slate-900 mb-3">🎵 TikTok Ads</div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Impressões</span>
                  <span className="font-semibold text-slate-900">718K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Gasto Total</span>
                  <span className="font-semibold text-slate-900">R$ 8.6K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Receita</span>
                  <span className="font-semibold text-green-600">R$ 213.1K</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">ROI Médio</span>
                  <span className="font-semibold text-green-600">2.476x</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">CTR Médio</span>
                  <span className="font-semibold text-slate-900">3.12%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-slate-900">Recomendação</div>
              <div className="text-sm text-slate-600 mt-1">
                Instagram gera mais impressões (1.68M vs 718K) mas TikTok tem melhor ROI (2.476x vs 1.766x). 
                Considere aumentar budget em TikTok em +30% para maximizar retorno.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      <Card className="border-pink-200 bg-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-900">
            <Zap className="w-5 h-5" />
            Insights e Recomendações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded-lg border border-pink-200">
              <div className="font-medium text-slate-900 mb-1">🎯 Melhor Performer</div>
              <div className="text-sm text-slate-600">
                Pijama Luiza Luxo - Reels com ROI de 2.063x. Aumentar budget em +25% para escalar.
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-pink-200">
              <div className="font-medium text-slate-900 mb-1">⚠️ Oportunidade</div>
              <div className="text-sm text-slate-600">
                Pijama Vanessa tem menor ROI (1.414x). Testar novo copy, imagem ou público-alvo.
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-pink-200">
              <div className="font-medium text-slate-900 mb-1">📈 Crescimento</div>
              <div className="text-sm text-slate-600">
                CTR médio 3.89% está acima da média (2-3%). Manter estratégia de creative atual.
              </div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-pink-200">
              <div className="font-medium text-slate-900 mb-1">💡 Próximo Passo</div>
              <div className="text-sm text-slate-600">
                Implementar Dynamic Ads para retargeting de visitantes do site com 15% desconto.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="flex gap-3 flex-wrap">
        <Button className="bg-pink-600 hover:bg-pink-700">Criar Nova Campanha</Button>
        <Button variant="outline">Sincronizar Dados Agora</Button>
        <Button variant="outline">Ver Relatório Completo</Button>
        <Button variant="outline">Configurar Alertas</Button>
      </div>
    </div>
  );
}
