import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Mail, MessageSquare, AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const CONFIGURACOES = [
  { condicao: 'Previsão de ruptura > 50%', canal: 'SMS + Email', threshold: 'Imediato' },
  { condicao: 'Demanda acima da meta', canal: 'Email', threshold: 'Diário' },
  { condicao: 'Demanda abaixo de -10%', canal: 'SMS + Email', threshold: 'Imediato' },
  { condicao: 'Meta de receita atingida', canal: 'Email', threshold: 'Semanal' },
  { condicao: 'Oportunidade de upsell detectada', canal: 'Email', threshold: 'Diário' },
  { condicao: 'Referência convertida', canal: 'Email', threshold: 'Imediato' },
];

export function AlertasAutomaticosSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery(undefined, { refetchInterval: 60_000 });

  const todas = campanhas as any[];

  // Derive contextual alerts from real campaign data
  const alertas: { id: string; titulo: string; descricao: string; severidade: 'crítica' | 'alta' | 'média'; canal: string; status: string }[] = [];

  const semConversao = todas.filter(c => c.status === 'ativa' && (Number(c.performance?.conversoes) || 0) === 0);
  if (semConversao.length > 0) {
    alertas.push({
      id: 'a1',
      titulo: `${semConversao.length} campanha${semConversao.length > 1 ? 's' : ''} ativa${semConversao.length > 1 ? 's' : ''} sem conversões`,
      descricao: `Verifique criativos ou segmentação: ${semConversao.slice(0, 2).map((c: any) => c.nome).join(', ')}${semConversao.length > 2 ? '...' : ''}`,
      severidade: 'alta',
      canal: 'Email',
      status: 'ativo',
    });
  }

  const altaPerformance = todas.filter(c => ( Number(c.performance?.roi) || 0) > 200);
  if (altaPerformance.length > 0) {
    alertas.push({
      id: 'a2',
      titulo: `${altaPerformance.length} campanha${altaPerformance.length > 1 ? 's' : ''} com ROI acima de 200%`,
      descricao: `Considere aumentar o orçamento: ${altaPerformance.slice(0, 2).map((c: any) => c.nome).join(', ')}`,
      severidade: 'média',
      canal: 'Email',
      status: 'ativo',
    });
  }

  const pausadas = todas.filter(c => c.status === 'pausada');
  if (pausadas.length > 0) {
    alertas.push({
      id: 'a3',
      titulo: `${pausadas.length} campanha${pausadas.length > 1 ? 's' : ''} pausada${pausadas.length > 1 ? 's' : ''}`,
      descricao: `Revise e reative se necessário: ${pausadas.slice(0, 2).map((c: any) => c.nome).join(', ')}`,
      severidade: 'média',
      canal: 'Email',
      status: 'pendente',
    });
  }

  const totalConversoes = todas.reduce((s, c) => s + (Number(c.performance?.conversoes) || 0), 0);
  if (totalConversoes > 0) {
    alertas.push({
      id: 'a4',
      titulo: `${totalConversoes.toLocaleString('pt-BR')} conversões registradas`,
      descricao: 'Performance acumulada de todas as campanhas',
      severidade: 'média',
      canal: 'Email',
      status: 'enviado',
    });
  }

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Alertas Automáticos SMS/Email</h2>
          <p className="text-slate-600 mt-1">Notificações automáticas quando oportunidades ou problemas são detectados</p>
        </div>
        <Badge className="bg-green-100 text-green-800 text-base px-4 py-2">
          {CONFIGURACOES.length} regras configuradas
        </Badge>
      </div>

      {/* Alertas gerados a partir de dados reais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Alertas Baseados em Dados Reais
          </CardTitle>
          <CardDescription>Situações identificadas nas suas campanhas cadastradas</CardDescription>
        </CardHeader>
        <CardContent>
          {alertas.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">
                {todas.length === 0
                  ? 'Nenhuma campanha cadastrada. Crie campanhas para gerar alertas automáticos.'
                  : 'Nenhum alerta de atenção no momento.'}
              </p>
            </div>
          ) : (
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
                      <div className="text-sm text-slate-600">{alerta.descricao}</div>
                    </div>
                    <div className="text-right ml-3">
                      <div className="flex items-center gap-1 mb-1 justify-end">
                        {alerta.canal.includes('SMS') && <MessageSquare className="w-4 h-4 text-blue-600" />}
                        {alerta.canal.includes('Email') && <Mail className="w-4 h-4 text-green-600" />}
                      </div>
                      <Badge className={`text-xs ${getStatusColor(alerta.status)}`}>
                        {alerta.status === 'enviado' ? '✓ Resolvido' : alerta.status === 'ativo' ? '🔔 Atenção' : '⏳ Pendente'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações de Alertas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            Regras de Alerta Automático
          </CardTitle>
          <CardDescription>Conecte Bling ERP e SMS para ativar notificações automáticas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CONFIGURACOES.map((config, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                <div className="flex-1">
                  <div className="font-semibold text-slate-900">{config.condicao}</div>
                  <div className="text-sm text-slate-600 mt-1">
                    Canal: <span className="font-medium">{config.canal}</span> · Frequência: <span className="font-medium">{config.threshold}</span>
                  </div>
                </div>
                <Badge className="bg-slate-100 text-slate-600">Aguardando integração</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Canais de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Canais de Notificação</CardTitle>
          <CardDescription>Configure como receber alertas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { canal: 'SMS', status: 'Inativo', info: 'Configure nas Integrações', frequencia: 'Crítica + Alta' },
              { canal: 'Email', status: 'Inativo', info: 'Configure nas Integrações', frequencia: 'Todas' },
              { canal: 'WhatsApp', status: 'Inativo', info: 'Conecte via Baileys', frequencia: '-' },
              { canal: 'Slack', status: 'Inativo', info: 'Webhook necessário', frequencia: '-' },
            ].map((notif, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{notif.canal}</div>
                  <div className="text-sm text-slate-600">{notif.info}</div>
                </div>
                <div className="text-right">
                  <Badge className="bg-slate-100 text-slate-600">{notif.status}</Badge>
                  <div className="text-xs text-slate-500 mt-1">{notif.frequencia}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="bg-blue-50 border-blue-200 p-4">
        <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-600" />
          Como ativar alertas reais
        </h4>
        <ul className="text-sm space-y-2 text-slate-700">
          <li>• <strong>Conecte o Bling ERP</strong> para alertas de estoque e demanda</li>
          <li>• <strong>Configure SMS</strong> nas Integrações para notificações críticas</li>
          <li>• <strong>Use Email Marketing</strong> (SendGrid) para alertas diários automáticos</li>
          <li>• <strong>Registre conversões</strong> nas campanhas para alertas de performance</li>
          <li>• <strong>Smart Alerts</strong> (aba Reports) monitora ROI e CTR em tempo real</li>
        </ul>
      </Card>
    </div>
  );
}
