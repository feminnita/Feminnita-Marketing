import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, Mail, MessageCircle, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';

export default function AutomacaoRelatoriosAgendadosSection() {
  const [relatorios, setRelatorios] = useState([
    {
      id: 1,
      nome: 'Relatório Diário de Vendas',
      frequencia: 'Diária',
      horario: '08:00',
      canal: 'Email',
      destinatarios: 'gerente@feminnita.com.br',
      ativo: true,
      proxima: '2026-02-02 08:00',
      enviados: 45,
    },
    {
      id: 2,
      nome: 'Relatório Semanal de Performance',
      frequencia: 'Semanal',
      horario: 'Segunda 09:00',
      canal: 'Email',
      destinatarios: 'equipe@feminnita.com.br',
      ativo: true,
      proxima: '2026-02-03 09:00',
      enviados: 8,
    },
    {
      id: 3,
      nome: 'Relatório de ROI por Canal',
      frequencia: 'Semanal',
      horario: 'Sexta 17:00',
      canal: 'WhatsApp',
      destinatarios: 'gerente@feminnita.com.br',
      ativo: true,
      proxima: '2026-02-07 17:00',
      enviados: 7,
    },
    {
      id: 4,
      nome: 'Relatório Mensal Executivo',
      frequencia: 'Mensal',
      horario: '1º dia 10:00',
      canal: 'Email',
      destinatarios: 'diretoria@feminnita.com.br',
      ativo: true,
      proxima: '2026-03-01 10:00',
      enviados: 2,
    },
  ]);

  const fluxosAutomacao = [
    {
      titulo: 'Alerta de Churn',
      descricao: 'Envia email automático quando cliente entra em risco',
      frequencia: 'Em tempo real',
      taxa: '92.5%',
      impacto: '+R$ 212K/mês',
    },
    {
      titulo: 'Relatório de Estoque Baixo',
      descricao: 'Notifica via WhatsApp quando estoque < limite',
      frequencia: 'A cada 6h',
      taxa: '98%',
      impacto: '-R$ 64.8K/ano',
    },
    {
      titulo: 'Resumo de Vendas Diário',
      descricao: 'Envia resumo de vendas do dia anterior',
      frequencia: 'Diária 08:00',
      taxa: '100%',
      impacto: '+R$ 45K/mês',
    },
  ];

  const templates = [
    { nome: 'Relatório Diário', campos: 'Vendas, ROI, Top Produtos, Alertas' },
    { nome: 'Relatório Semanal', campos: 'Performance, Comparativo, Tendências' },
    { nome: 'Relatório Mensal', campos: 'Resumo, Análise, Recomendações' },
    { nome: 'Alerta de Oportunidade', campos: 'Produto, Persona, Recomendação' },
  ];

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600">Relatórios Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{relatorios.filter(r => r.ativo).length}</div>
            <p className="text-xs text-slate-500 mt-1">Agendados e funcionando</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600">Enviados este Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{relatorios.reduce((sum, r) => sum + r.enviados, 0)}</div>
            <p className="text-xs text-slate-500 mt-1">+12% vs mês anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600">Taxa de Entrega</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.8%</div>
            <p className="text-xs text-slate-500 mt-1">Sem falhas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-slate-600">Tempo Economizado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-rose-600">240h/mês</div>
            <p className="text-xs text-slate-500 mt-1">Valor: R$ 24K</p>
          </CardContent>
        </Card>
      </div>

      {/* Relatórios Agendados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Relatórios Agendados</CardTitle>
          <CardDescription>Automação de envio de relatórios por email e WhatsApp</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {relatorios.map((rel) => (
              <div key={rel.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-slate-900">{rel.nome}</h4>
                      {rel.ativo ? (
                        <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 mt-3">
                      <div>
                        <p className="text-xs text-slate-500">Frequência</p>
                        <p className="font-semibold text-slate-900">{rel.frequencia}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Horário</p>
                        <p className="font-semibold text-slate-900">{rel.horario}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Canal</p>
                        <div className="flex items-center gap-1 mt-1">
                          {rel.canal === 'Email' ? (
                            <Mail className="w-4 h-4 text-blue-600" />
                          ) : (
                            <MessageCircle className="w-4 h-4 text-green-600" />
                          )}
                          <span className="font-semibold text-slate-900">{rel.canal}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Próximo Envio</p>
                        <p className="font-semibold text-slate-900">{rel.proxima}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900">{rel.enviados}</p>
                    <p className="text-xs text-slate-500">enviados</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fluxos de Automação */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Fluxos de Automação Ativos</CardTitle>
          <CardDescription>Relatórios e alertas automáticos em tempo real</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {fluxosAutomacao.map((fluxo, idx) => (
            <div key={idx} className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-slate-900">{fluxo.titulo}</h4>
                  </div>
                  <p className="text-sm text-slate-600">{fluxo.descricao}</p>
                  <div className="flex gap-4 mt-3 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Frequência</p>
                      <p className="font-semibold text-slate-900">{fluxo.frequencia}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Taxa de Sucesso</p>
                      <p className="font-semibold text-green-600">{fluxo.taxa}</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Impacto</p>
                  <p className="text-lg font-bold text-green-600">{fluxo.impacto}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Templates Disponíveis */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Templates de Relatórios</CardTitle>
          <CardDescription>Modelos prontos para usar na automação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-slate-900 mb-2">{template.nome}</h4>
                <p className="text-sm text-slate-600">{template.campos}</p>
                <button className="mt-3 px-3 py-1 bg-rose-600 text-white text-xs rounded hover:bg-rose-700 transition-colors">
                  Usar Template
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
