import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Mail, MessageSquare, AlertTriangle, CheckCircle } from 'lucide-react';

interface Alerta {
  id: string;
  tipo: string;
  titulo: string;
  descricao: string;
  severidade: 'crítica' | 'alta' | 'média';
  canal: string;
  status: 'ativo' | 'enviado' | 'pendente';
  data: string;
}

interface ConfigAlerta {
  condicao: string;
  canal: string;
  threshold: string;
  ativo: boolean;
}

export function AlertasAutomaticosSection() {
  const [alertas] = useState<Alerta[]>([
    {
      id: '1',
      tipo: 'Ruptura de Estoque',
      titulo: 'URGENTE: Robe Carol Premium vai acabar',
      descricao: 'Previsão de ruptura em 48 horas. Estoque: 45 un., Demanda: 156 un.',
      severidade: 'crítica',
      canal: 'SMS + Email',
      status: 'enviado',
      data: '2026-01-31 14:32',
    },
    {
      id: '2',
      tipo: 'Oportunidade de Upsell',
      titulo: 'Carol atingiu meta de conversão',
      descricao: '487 vendas previstas. Oferecer bundle com Robe para aumentar ticket',
      severidade: 'alta',
      canal: 'Email',
      status: 'enviado',
      data: '2026-01-31 10:15',
    },
    {
      id: '3',
      tipo: 'Desaceleração',
      titulo: 'Vanessa em queda (-8%)',
      descricao: 'Demanda caindo. Ativar promoção de 15% OFF urgentemente',
      severidade: 'alta',
      canal: 'SMS + Email',
      status: 'ativo',
      data: '2026-01-30 09:45',
    },
    {
      id: '4',
      tipo: 'Meta Atingida',
      titulo: 'Receita mensal atingiu R$ 225.1K',
      descricao: 'Meta alcançada! 22% acima do período anterior',
      severidade: 'média',
      canal: 'Email',
      status: 'enviado',
      data: '2026-01-29 16:20',
    },
    {
      id: '5',
      tipo: 'Referência Convertida',
      titulo: 'Nova cliente via programa de referência',
      descricao: 'Maria indicou Juliana. Ambas recebem recompensa',
      severidade: 'média',
      canal: 'Email',
      status: 'enviado',
      data: '2026-01-28 11:30',
    },
  ]);

  const [configuracoes] = useState<ConfigAlerta[]>([
    {
      condicao: 'Previsão de ruptura > 50%',
      canal: 'SMS + Email',
      threshold: 'Imediato',
      ativo: true,
    },
    {
      condicao: 'Demanda acima da meta',
      canal: 'Email',
      threshold: 'Diário',
      ativo: true,
    },
    {
      condicao: 'Demanda abaixo de -10%',
      canal: 'SMS + Email',
      threshold: 'Imediato',
      ativo: true,
    },
    {
      condicao: 'Meta de receita atingida',
      canal: 'Email',
      threshold: 'Semanal',
      ativo: true,
    },
    {
      condicao: 'Oportunidade de upsell detectada',
      canal: 'Email',
      threshold: 'Diário',
      ativo: true,
    },
    {
      condicao: 'Referência convertida',
      canal: 'Email',
      threshold: 'Imediato',
      ativo: true,
    },
  ]);

  const getSeveridadeColor = (severidade: string) => {
    if (severidade === 'crítica') return 'bg-red-100 text-red-800';
    if (severidade === 'alta') return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const getStatusColor = (status: string) => {
    if (status === 'enviado') return 'bg-green-100 text-green-800';
    if (status === 'ativo') return 'bg-blue-100 text-blue-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Alertas Automáticos SMS/Email</h2>
          <p className="text-slate-600 mt-1">Notificações automáticas quando oportunidades ou problemas são detectados</p>
        </div>
        <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
          ✓ 6 Alertas Ativos
        </Badge>
      </div>

      {/* Alertas Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Alertas Recentes
          </CardTitle>
          <CardDescription>Últimos 5 alertas enviados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertas.map((alerta) => (
              <div key={alerta.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">{alerta.titulo}</span>
                      <Badge className={`text-xs ${getSeveridadeColor(alerta.severidade)}`}>
                        {alerta.severidade === 'crítica' ? '🔴' : alerta.severidade === 'alta' ? '🟠' : '🟡'} {alerta.severidade}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600 mb-2">{alerta.descricao}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <span>{alerta.tipo}</span>
                      <span>•</span>
                      <span>{alerta.data}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {alerta.canal.includes('SMS') && <MessageSquare className="w-4 h-4 text-blue-600" />}
                      {alerta.canal.includes('Email') && <Mail className="w-4 h-4 text-green-600" />}
                    </div>
                    <Badge className={`text-xs ${getStatusColor(alerta.status)}`}>
                      {alerta.status === 'enviado' ? '✓ Enviado' : alerta.status === 'ativo' ? '🔔 Ativo' : '⏳ Pendente'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Configurações de Alertas
          </CardTitle>
          <CardDescription>Regras automáticas ativas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {configuracoes.map((config, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{config.condicao}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Canal: <span className="font-medium">{config.canal}</span> • Frequência: <span className="font-medium">{config.threshold}</span>
                  </div>
                </div>
                <Badge className={config.ativo ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                  {config.ativo ? '✓ Ativo' : '✗ Inativo'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas de Alertas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Alertas Enviados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">247</div>
            <p className="text-xs text-green-600 mt-1">↑ 34 vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Taxa de Ação</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">78%</div>
            <p className="text-xs text-green-600 mt-1">↑ 12% vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">ROI de Alertas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">+R$ 84K</div>
            <p className="text-xs text-green-600 mt-1">↑ 28% vs período anterior</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Tempo Médio Resposta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">2.3h</div>
            <p className="text-xs text-green-600 mt-1">↓ 1.2h vs período anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Exemplos de Impacto */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle className="w-5 h-5" />
            Exemplos de Impacto dos Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Alerta de Ruptura: +R$ 46.8K</div>
                <div className="text-sm text-slate-600">Recebeu SMS sobre Robe Carol. Aumentou produção em tempo. Vendeu 156 un. extras</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Alerta de Upsell: +R$ 28.4K</div>
                <div className="text-sm text-slate-600">Recebeu email sobre oportunidade Carol. Criou bundle. Aumentou ticket médio em 12%</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Alerta de Desaceleração: +R$ 12.8K</div>
                <div className="text-sm text-slate-600">Recebeu SMS sobre Vanessa -8%. Ativou promoção 15% OFF. Recuperou demanda</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-green-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Total de Impacto: +R$ 84K/mês</div>
                <div className="text-sm text-slate-600">Alertas automáticos geraram R$ 84K em receita extra através de ações rápidas</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Canais de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>📱 Canais de Notificação</CardTitle>
          <CardDescription>Configure como receber alertas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { canal: 'SMS', status: 'Ativo', numero: '+55 11 9 8765-4321', frequencia: 'Crítica + Alta' },
              { canal: 'Email', status: 'Ativo', numero: 'seu@email.com', frequencia: 'Todas' },
              { canal: 'WhatsApp', status: 'Inativo', numero: 'Conectar', frequencia: '-' },
              { canal: 'Slack', status: 'Inativo', numero: 'Conectar', frequencia: '-' },
            ].map((notif, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{notif.canal}</div>
                  <div className="text-sm text-slate-600">{notif.numero}</div>
                </div>
                <div className="text-right">
                  <Badge className={notif.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                    {notif.status}
                  </Badge>
                  <div className="text-xs text-slate-600 mt-1">{notif.frequencia}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
