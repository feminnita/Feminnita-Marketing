import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TrendingUp, Zap, Target, BarChart3, CheckCircle, AlertCircle } from 'lucide-react';

interface TesteAB {
  id: string;
  nome: string;
  persona: string;
  status: string;
  dataInicio: string;
  duracao: string;
  confianca: number;
  vencedor: string;
  versoes: {
    nome: string;
    descricao: string;
    impressoes: number;
    cliques: number;
    conversoes: number;
    ctr: number;
    taxa_conversao: number;
    receita: number;
    roi: number;
  }[];
}

interface RecomendacaoAB {
  id: string;
  teste: string;
  recomendacao: string;
  impacto: string;
  acao: string;
}

export function ComparadorEstrategiasABTestingSection() {
  const [testes] = useState<TesteAB[]>([
    {
      id: '1',
      nome: 'Pijama Carol - Copy Test',
      persona: 'Carol',
      status: 'Concluído',
      dataInicio: '2026-01-15',
      duracao: '14 dias',
      confianca: 98,
      vencedor: 'Versão B',
      versoes: [
        {
          nome: 'Versão A (Preço)',
          descricao: '"Pijama Carol APENAS R$ 89,90"',
          impressoes: 125400,
          cliques: 4230,
          conversoes: 142,
          ctr: 3.37,
          taxa_conversao: 3.36,
          receita: 26840,
          roi: 1.42,
        },
        {
          nome: 'Versão B (Qualidade)',
          descricao: '"Pijama Carol Premium - Tecido Egípcio 100%"',
          impressoes: 128600,
          cliques: 5620,
          conversoes: 210,
          ctr: 4.37,
          taxa_conversao: 3.74,
          receita: 39690,
          roi: 1.98,
        },
        {
          nome: 'Versão C (Urgência)',
          descricao: '"Pijama Carol - ÚLTIMAS 20 UNIDADES!"',
          impressoes: 122800,
          cliques: 4890,
          conversoes: 168,
          ctr: 3.98,
          taxa_conversao: 3.44,
          receita: 31752,
          roi: 1.68,
        },
      ],
    },
    {
      id: '2',
      nome: 'Robe Renata - Image Test',
      persona: 'Renata',
      status: 'Concluído',
      dataInicio: '2026-01-18',
      duracao: '14 dias',
      confianca: 95,
      vencedor: 'Versão A',
      versoes: [
        {
          nome: 'Versão A (Modelo)',
          descricao: 'Imagem com modelo usando o produto',
          impressoes: 98200,
          cliques: 3840,
          conversoes: 156,
          ctr: 3.91,
          taxa_conversao: 4.06,
          receita: 29484,
          roi: 2.18,
        },
        {
          nome: 'Versão B (Produto)',
          descricao: 'Imagem apenas do produto em fundo branco',
          impressoes: 101400,
          cliques: 3120,
          conversoes: 98,
          ctr: 3.08,
          taxa_conversao: 3.14,
          receita: 18522,
          roi: 1.42,
        },
      ],
    },
    {
      id: '3',
      nome: 'Pijama Vanessa - Price Test',
      persona: 'Vanessa',
      status: 'Em Andamento',
      dataInicio: '2026-01-25',
      duracao: '7 dias (faltam 7)',
      confianca: 67,
      vencedor: 'Indefinido',
      versoes: [
        {
          nome: 'Versão A (R$ 119,90)',
          descricao: 'Preço padrão',
          impressoes: 45200,
          cliques: 1680,
          conversoes: 52,
          ctr: 3.71,
          taxa_conversao: 3.10,
          receita: 6234,
          roi: 1.56,
        },
        {
          nome: 'Versão B (R$ 99,90)',
          descricao: 'Preço reduzido',
          impressoes: 48100,
          cliques: 2140,
          conversoes: 78,
          ctr: 4.45,
          taxa_conversao: 3.65,
          receita: 7792,
          roi: 1.95,
        },
      ],
    },
  ]);

  const [recomendacoes] = useState<RecomendacaoAB[]>([
    {
      id: '1',
      teste: 'Pijama Carol - Copy Test',
      recomendacao: 'Versão B (Qualidade) venceu com 48% mais conversões',
      impacto: '+R$ 12.8K receita extra por mês',
      acao: 'Usar Versão B em 100% das campanhas Carol',
    },
    {
      id: '2',
      teste: 'Robe Renata - Image Test',
      recomendacao: 'Versão A (Modelo) venceu com 59% mais conversões',
      impacto: '+R$ 10.9K receita extra por mês',
      acao: 'Usar fotos com modelo em todas as campanhas',
    },
    {
      id: '3',
      teste: 'Pijama Vanessa - Price Test',
      recomendacao: 'Versão B (R$ 99,90) está ganhando com 50% mais conversões',
      impacto: '+R$ 1.5K receita extra por mês (projeção)',
      acao: 'Aguardar conclusão do teste em 7 dias',
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Comparador de Estratégias (A/B Testing)</h2>
          <p className="text-slate-600 mt-1">Teste diferentes abordagens para maximizar ROI</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800 text-lg px-4 py-2">
          ✓ 3 Testes
        </Badge>
      </div>

      {/* Resumo de Impacto */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-green-900">💰 Impacto Total dos A/B Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-3 bg-white rounded-lg border border-green-200">
              <div className="font-semibold text-slate-900 mb-1">Receita Extra/Mês</div>
              <div className="text-2xl font-bold text-green-600">+R$ 25.2K</div>
              <div className="text-sm text-slate-600 mt-1">Dos testes concluídos</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-green-200">
              <div className="font-semibold text-slate-900 mb-1">Receita Extra/Ano</div>
              <div className="text-2xl font-bold text-green-600">+R$ 302.4K</div>
              <div className="text-sm text-slate-600 mt-1">Se manter performance</div>
            </div>
            <div className="p-3 bg-white rounded-lg border border-green-200">
              <div className="font-semibold text-slate-900 mb-1">Melhoria Média</div>
              <div className="text-2xl font-bold text-green-600">+52%</div>
              <div className="text-sm text-slate-600 mt-1">Conversão vs controle</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testes Detalhados */}
      <div className="space-y-4">
        {testes.map((teste) => (
          <Card key={teste.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600" />
                    {teste.nome}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {teste.persona} • {teste.status} • Duração: {teste.duracao}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <Badge className={teste.status === 'Concluído' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                    {teste.status}
                  </Badge>
                  {teste.status === 'Concluído' && (
                    <div className="text-sm font-semibold text-green-600 mt-2">
                      Confiança: {teste.confianca}%
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Comparação de Versões */}
                <div className="space-y-3">
                  {teste.versoes.map((versao, idx) => {
                    const melhorConversao = Math.max(...teste.versoes.map(v => v.taxa_conversao));
                    const ehMelhor = versao.taxa_conversao === melhorConversao;
                    return (
                      <div key={idx} className={`p-4 border rounded-lg ${ehMelhor ? 'border-green-300 bg-green-50' : 'border-slate-200'}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="font-semibold text-slate-900 flex items-center gap-2">
                              {versao.nome}
                              {ehMelhor && <CheckCircle className="w-5 h-5 text-green-600" />}
                            </div>
                            <div className="text-sm text-slate-600 mt-1">{versao.descricao}</div>
                          </div>
                          {ehMelhor && (
                            <Badge className="bg-green-100 text-green-800">VENCEDOR</Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 p-3 bg-white rounded border border-slate-200">
                          <div>
                            <div className="text-xs text-slate-600">Impressões</div>
                            <div className="font-semibold text-slate-900">{(versao.impressoes / 1000).toFixed(0)}K</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600">Cliques</div>
                            <div className="font-semibold text-slate-900">{(versao.cliques / 1000).toFixed(1)}K</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600">Conversões</div>
                            <div className="font-semibold text-green-600">{versao.conversoes}</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600">CTR</div>
                            <div className="font-semibold text-slate-900">{versao.ctr.toFixed(2)}%</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600">Taxa Conv.</div>
                            <div className={`font-semibold ${ehMelhor ? 'text-green-600' : 'text-slate-900'}`}>
                              {versao.taxa_conversao.toFixed(2)}%
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600">Receita</div>
                            <div className="font-semibold text-green-600">R$ {(versao.receita / 1000).toFixed(1)}K</div>
                          </div>
                          <div>
                            <div className="text-xs text-slate-600">ROI</div>
                            <div className={`font-semibold ${ehMelhor ? 'text-green-600' : 'text-slate-900'}`}>
                              {versao.roi.toFixed(2)}x
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Barra de Progresso para Testes em Andamento */}
                {teste.status === 'Em Andamento' && (
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-slate-900">Progresso do Teste</span>
                      <span className="text-sm text-blue-600">67% confiança</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '67%' }} />
                    </div>
                    <div className="text-xs text-slate-600 mt-2">Faltam 7 dias para conclusão com 95% confiança</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recomendações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            Recomendações de Ação
          </CardTitle>
          <CardDescription>Próximos passos baseados nos resultados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recomendacoes.map((rec) => (
              <div key={rec.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start gap-3 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{rec.teste}</div>
                    <div className="text-sm text-slate-600 mt-1">{rec.recomendacao}</div>
                  </div>
                </div>
                <div className="ml-8 space-y-1">
                  <div className="text-sm">
                    <span className="text-slate-600">Impacto: </span>
                    <span className="font-semibold text-green-600">{rec.impacto}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-slate-600">Ação: </span>
                    <span className="font-semibold text-slate-900">{rec.acao}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Como Funciona */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <BarChart3 className="w-5 h-5" />
            Como Funciona A/B Testing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Crie 2-3 Versões</div>
                <div className="text-sm text-slate-600">Mude uma coisa: copy, imagem, preço, etc</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Divida o Tráfego</div>
                <div className="text-sm text-slate-600">Cada versão recebe ~33% do tráfego</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Meça Resultados</div>
                <div className="text-sm text-slate-600">Rastreie conversões, receita, ROI</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Escolha Vencedor</div>
                <div className="text-sm text-slate-600">Use a versão melhor em 100% das campanhas</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="flex gap-3 flex-wrap">
        <Button className="bg-blue-600 hover:bg-blue-700">Criar Novo A/B Test</Button>
        <Button variant="outline">Ver Histórico de Testes</Button>
        <Button variant="outline">Implementar Vencedores</Button>
      </div>
    </div>
  );
}
