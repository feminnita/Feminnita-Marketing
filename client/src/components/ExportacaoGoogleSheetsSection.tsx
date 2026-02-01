import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Download, Share2, RefreshCw, CheckCircle, Clock, FileText } from 'lucide-react';

interface ExportacaoDisponivel {
  id: string;
  nome: string;
  descricao: string;
  linhas: number;
  colunas: number;
  tamanho: string;
  ultimaAtualizacao: string;
  frequencia: string;
  status: string;
}

interface ConfiguracaoExportacao {
  id: string;
  nome: string;
  planilha: string;
  frequencia: string;
  ativo: boolean;
  ultimaSincronizacao: string;
}

export function ExportacaoGoogleSheetsSection() {
  const [exportacoes] = useState<ExportacaoDisponivel[]>([
    {
      id: '1',
      nome: 'Dashboard KPIs Principais',
      descricao: '10 KPIs principais: receita, LTV, retenção, CAC, ROI, conversão, ticket, demanda, risco, NPS',
      linhas: 1,
      colunas: 10,
      tamanho: '2 KB',
      ultimaAtualizacao: '2026-02-01 00:32',
      frequencia: 'Tempo Real',
      status: 'Ativo',
    },
    {
      id: '2',
      nome: 'Performance por Persona',
      descricao: 'Vendas, receita, ROI, LTV, retenção, NPS para cada persona (Carol, Renata, Vanessa, Luiza)',
      linhas: 4,
      colunas: 12,
      tamanho: '4 KB',
      ultimaAtualizacao: '2026-02-01 00:30',
      frequencia: 'Diário',
      status: 'Ativo',
    },
    {
      id: '3',
      nome: 'Campanhas TikTok Ads',
      descricao: 'Impressões, cliques, conversões, gasto, receita, ROI, CTR, CPC para cada campanha',
      linhas: 4,
      colunas: 8,
      tamanho: '3 KB',
      ultimaAtualizacao: '2026-02-01 00:28',
      frequencia: 'Tempo Real',
      status: 'Ativo',
    },
    {
      id: '4',
      nome: 'Previsão de Demanda',
      descricao: 'Previsões 30 dias, estoque atual, recomendações, impacto financeiro por produto',
      linhas: 12,
      colunas: 8,
      tamanho: '5 KB',
      ultimaAtualizacao: '2026-02-01 00:25',
      frequencia: 'Diário',
      status: 'Ativo',
    },
    {
      id: '5',
      nome: 'Clientes e Segmentação',
      descricao: 'Lista completa de clientes, persona, LTV, retenção, churn risk, valor de referência',
      linhas: 4187,
      colunas: 9,
      tamanho: '156 KB',
      ultimaAtualizacao: '2026-02-01 00:20',
      frequencia: 'Diário',
      status: 'Ativo',
    },
    {
      id: '6',
      nome: 'Relatório de Vendas Completo',
      descricao: 'Todas as transações: data, cliente, persona, produto, valor, canal, fonte, persona',
      linhas: 12847,
      colunas: 11,
      tamanho: '412 KB',
      ultimaAtualizacao: '2026-02-01 00:15',
      frequencia: 'Diário',
      status: 'Ativo',
    },
  ]);

  const [configuracoes] = useState<ConfiguracaoExportacao[]>([
    {
      id: '1',
      nome: 'Dashboard Executivo',
      planilha: 'Feminnita - Dashboard KPIs',
      frequencia: 'Tempo Real (a cada 5 min)',
      ativo: true,
      ultimaSincronizacao: '2026-02-01 00:32:15',
    },
    {
      id: '2',
      nome: 'Performance Personas',
      planilha: 'Feminnita - Performance Personas',
      frequencia: 'Diário (00:00)',
      ativo: true,
      ultimaSincronizacao: '2026-02-01 00:30:42',
    },
    {
      id: '3',
      nome: 'TikTok Ads Performance',
      planilha: 'Feminnita - TikTok Ads',
      frequencia: 'Tempo Real (a cada 15 min)',
      ativo: true,
      ultimaSincronizacao: '2026-02-01 00:28:33',
    },
    {
      id: '4',
      nome: 'Previsão de Demanda',
      planilha: 'Feminnita - Previsão Demanda',
      frequencia: 'Diário (06:00)',
      ativo: true,
      ultimaSincronizacao: '2026-02-01 06:00:18',
    },
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Exportação para Google Sheets</h2>
          <p className="text-slate-600 mt-1">Sincronize dados em tempo real com Google Sheets para compartilhamento com equipe</p>
        </div>
        <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
          ✓ 6 Exportações Ativas
        </Badge>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Exportações Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">6</div>
            <p className="text-xs text-slate-600 mt-1">Sincronizando dados continuamente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Dados Sincronizados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">17.2K</div>
            <p className="text-xs text-slate-600 mt-1">Linhas de dados em tempo real</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa de Sincronização</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.8%</div>
            <p className="text-xs text-green-600 mt-1">↑ 0.2% vs período anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Exportações Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-blue-600" />
            Exportações Disponíveis
          </CardTitle>
          <CardDescription>Dados que podem ser sincronizados com Google Sheets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exportacoes.map((exp) => (
              <div key={exp.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{exp.nome}</div>
                    <div className="text-sm text-slate-600 mt-1">{exp.descricao}</div>
                  </div>
                  <Badge className={exp.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                    {exp.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm mb-3 p-3 bg-slate-50 rounded">
                  <div>
                    <div className="text-slate-600">Linhas</div>
                    <div className="font-semibold text-slate-900">{exp.linhas.toLocaleString('pt-BR')}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Colunas</div>
                    <div className="font-semibold text-slate-900">{exp.colunas}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Tamanho</div>
                    <div className="font-semibold text-slate-900">{exp.tamanho}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Frequência</div>
                    <div className="font-semibold text-blue-600">{exp.frequencia}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Atualizado</div>
                    <div className="font-semibold text-slate-900">{exp.ultimaAtualizacao}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700 flex-1">
                    <Download className="w-4 h-4 mr-1" />
                    Sincronizar Agora
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1">
                    <Share2 className="w-4 h-4 mr-1" />
                    Compartilhar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Sincronização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5 text-green-600" />
            Configurações de Sincronização
          </CardTitle>
          <CardDescription>Exportações automáticas ativas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {configuracoes.map((config) => (
              <div key={config.id} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">{config.nome}</div>
                    <div className="text-sm text-slate-600 mt-1">📊 {config.planilha}</div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    {config.ativo ? '✓ Ativo' : '✗ Inativo'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm p-3 bg-slate-50 rounded">
                  <div>
                    <div className="text-slate-600">Frequência</div>
                    <div className="font-semibold text-slate-900">{config.frequencia}</div>
                  </div>
                  <div>
                    <div className="text-slate-600">Última Sincronização</div>
                    <div className="font-semibold text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {config.ultimaSincronizacao}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Como Usar */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <FileText className="w-5 h-5" />
            Como Usar Google Sheets com Feminnita
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Selecione a Exportação</div>
                <div className="text-sm text-slate-600">Clique em "Sincronizar Agora" na exportação desejada</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Autorize o Google Sheets</div>
                <div className="text-sm text-slate-600">Faça login com sua conta Google e autorize acesso</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Escolha a Planilha</div>
                <div className="text-sm text-slate-600">Selecione uma planilha existente ou crie uma nova</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">4</div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Configure Frequência</div>
                <div className="text-sm text-slate-600">Escolha se quer tempo real, diário, semanal ou mensal</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">5</div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Compartilhe com Equipe</div>
                <div className="text-sm text-slate-600">Envie o link da planilha para sua equipe acessar dados em tempo real</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card>
        <CardHeader>
          <CardTitle>✨ Benefícios da Sincronização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="font-medium text-slate-900 mb-1">📊 Compartilhamento em Tempo Real</div>
              <div className="text-sm text-slate-600">Toda equipe vê dados atualizados sem esperar relatórios</div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="font-medium text-slate-900 mb-1">🔄 Automação de Relatórios</div>
              <div className="text-sm text-slate-600">Relatórios se atualizam automaticamente sem trabalho manual</div>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="font-medium text-slate-900 mb-1">📈 Análise Colaborativa</div>
              <div className="text-sm text-slate-600">Equipe pode comentar, anotar e analisar dados juntos</div>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="font-medium text-slate-900 mb-1">🔐 Segurança Google</div>
              <div className="text-sm text-slate-600">Dados protegidos com segurança de nível empresarial</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ações Rápidas */}
      <div className="flex gap-3">
        <Button className="bg-green-600 hover:bg-green-700">Sincronizar Tudo Agora</Button>
        <Button variant="outline">Configurar Nova Exportação</Button>
        <Button variant="outline">Ver Histórico de Sincronizações</Button>
      </div>
    </div>
  );
}
