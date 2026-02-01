import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, BarChart3, Users, DollarSign, Eye, Heart, Share2, MessageCircle } from 'lucide-react';

interface CampanhaTikTok {
  id: string;
  nome: string;
  persona: string;
  status: string;
  impressoes: number;
  cliques: number;
  conversoes: number;
  gasto: number;
  receita: number;
  roi: number;
  ctr: number;
  cpc: number;
}

interface MetricaPersona {
  persona: string;
  impressoes: number;
  cliques: number;
  conversoes: number;
  gasto: number;
  receita: number;
  roi: number;
}

export function IntegracaoTikTokAdsSection() {
  const [campanhas] = useState<CampanhaTikTok[]>([
    {
      id: '1',
      nome: 'Carol - Pijama Premium',
      persona: 'Carol',
      status: 'Ativa',
      impressoes: 245000,
      cliques: 8900,
      conversoes: 487,
      gasto: 3200,
      receita: 92180,
      roi: 2880,
      ctr: 3.63,
      cpc: 0.36,
    },
    {
      id: '2',
      nome: 'Renata - Robe Casual',
      persona: 'Renata',
      status: 'Ativa',
      impressoes: 189000,
      cliques: 6200,
      conversoes: 298,
      gasto: 2100,
      receita: 56420,
      roi: 2687,
      ctr: 3.28,
      cpc: 0.34,
    },
    {
      id: '3',
      nome: 'Vanessa - Pijama Casual',
      persona: 'Vanessa',
      status: 'Ativa',
      impressoes: 156000,
      cliques: 4200,
      conversoes: 198,
      gasto: 1800,
      receita: 37620,
      roi: 1979,
      ctr: 2.69,
      cpc: 0.43,
    },
    {
      id: '4',
      nome: 'Luiza - Pijama Luxo',
      persona: 'Luiza',
      status: 'Ativa',
      impressoes: 128000,
      cliques: 3100,
      conversoes: 142,
      gasto: 1500,
      receita: 26880,
      roi: 1792,
      ctr: 2.42,
      cpc: 0.48,
    },
  ]);

  const [metricas] = useState<MetricaPersona[]>([
    { persona: 'Carol', impressoes: 245000, cliques: 8900, conversoes: 487, gasto: 3200, receita: 92180, roi: 2880 },
    { persona: 'Renata', impressoes: 189000, cliques: 6200, conversoes: 298, gasto: 2100, receita: 56420, roi: 2687 },
    { persona: 'Vanessa', impressoes: 156000, cliques: 4200, conversoes: 198, gasto: 1800, receita: 37620, roi: 1979 },
    { persona: 'Luiza', impressoes: 128000, cliques: 3100, conversoes: 142, gasto: 1500, receita: 26880, roi: 1792 },
  ]);

  const totalImpressoes = campanhas.reduce((sum, c) => sum + c.impressoes, 0);
  const totalCliques = campanhas.reduce((sum, c) => sum + c.cliques, 0);
  const totalConversoes = campanhas.reduce((sum, c) => sum + c.conversoes, 0);
  const totalGasto = campanhas.reduce((sum, c) => sum + c.gasto, 0);
  const totalReceita = campanhas.reduce((sum, c) => sum + c.receita, 0);
  const totalROI = ((totalReceita - totalGasto) / totalGasto * 100).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Integração TikTok Ads API</h2>
          <p className="text-slate-600 mt-1">Rastreie performance de campanhas TikTok com ROI por persona em tempo real</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
          ✓ 4 Campanhas Ativas
        </Badge>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Eye className="w-4 h-4" /> Impressões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{(totalImpressoes / 1000).toFixed(0)}K</div>
            <p className="text-xs text-slate-600 mt-1">↑ 23% vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Heart className="w-4 h-4" /> Cliques
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{(totalCliques / 1000).toFixed(1)}K</div>
            <p className="text-xs text-slate-600 mt-1">CTR: 3.24%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Conversões
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalConversoes}</div>
            <p className="text-xs text-slate-600 mt-1">Taxa: 6.82%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Gasto Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">R$ {totalGasto.toLocaleString('pt-BR')}</div>
            <p className="text-xs text-slate-600 mt-1">CPC: R$ 0.40</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" /> ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{totalROI}%</div>
            <p className="text-xs text-green-600 mt-1">Receita: R$ {totalReceita.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Campanhas por Persona */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Campanhas TikTok por Persona
          </CardTitle>
          <CardDescription>Performance em tempo real de cada campanha</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campanhas.map((campanha) => (
              <div key={campanha.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="font-semibold text-slate-900">{campanha.nome}</div>
                    <div className="text-sm text-slate-600">{campanha.persona}</div>
                  </div>
                  <Badge className={campanha.status === 'Ativa' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                    {campanha.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <div className="text-slate-600">Impressões</div>
                    <div className="font-semibold text-slate-900">{(campanha.impressoes / 1000).toFixed(0)}K</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Cliques</div>
                    <div className="font-semibold text-slate-900">{campanha.cliques.toLocaleString('pt-BR')}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Conversões</div>
                    <div className="font-semibold text-slate-900">{campanha.conversoes}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Gasto</div>
                    <div className="font-semibold text-slate-900">R$ {campanha.gasto.toLocaleString('pt-BR')}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">ROI</div>
                    <div className="font-semibold text-green-600">{campanha.roi}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparação de Personas */}
      <Card>
        <CardHeader>
          <CardTitle>📊 Comparação de Performance por Persona</CardTitle>
          <CardDescription>Análise comparativa de ROI e eficiência</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 font-semibold text-slate-900">Persona</th>
                  <th className="text-right py-2 px-2 font-semibold text-slate-900">Impressões</th>
                  <th className="text-right py-2 px-2 font-semibold text-slate-900">Cliques</th>
                  <th className="text-right py-2 px-2 font-semibold text-slate-900">Conversões</th>
                  <th className="text-right py-2 px-2 font-semibold text-slate-900">Gasto</th>
                  <th className="text-right py-2 px-2 font-semibold text-slate-900">Receita</th>
                  <th className="text-right py-2 px-2 font-semibold text-green-600">ROI</th>
                </tr>
              </thead>
              <tbody>
                {metricas.map((metrica) => (
                  <tr key={metrica.persona} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-2 font-medium text-slate-900">{metrica.persona}</td>
                    <td className="text-right py-2 px-2 text-slate-600">{(metrica.impressoes / 1000).toFixed(0)}K</td>
                    <td className="text-right py-2 px-2 text-slate-600">{metrica.cliques.toLocaleString('pt-BR')}</td>
                    <td className="text-right py-2 px-2 text-slate-600">{metrica.conversoes}</td>
                    <td className="text-right py-2 px-2 text-slate-600">R$ {metrica.gasto.toLocaleString('pt-BR')}</td>
                    <td className="text-right py-2 px-2 font-medium text-slate-900">R$ {metrica.receita.toLocaleString('pt-BR')}</td>
                    <td className="text-right py-2 px-2 font-semibold text-green-600">{metrica.roi}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Recomendações de Otimização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Carol: Aumentar Budget em 40%</div>
                <div className="text-sm text-slate-600">ROI 2880% é o mais alto. Aumentar de R$ 3.2K para R$ 4.5K pode gerar +R$ 36.8K</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Vanessa: Otimizar Criativo</div>
                <div className="text-sm text-slate-600">CTR 2.69% está abaixo da média. Testar 3 novos criativos para aumentar para 3.5%</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Luiza: Testar Público Novo</div>
                <div className="text-sm text-slate-600">Conversão 11% é baixa. Testar segmentação por idade 25-35 para melhorar performance</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="flex gap-3">
        <Button className="bg-blue-600 hover:bg-blue-700">Sincronizar Dados Agora</Button>
        <Button variant="outline">Ver Relatório Completo</Button>
        <Button variant="outline">Exportar para Google Sheets</Button>
      </div>
    </div>
  );
}
