import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, CheckCircle, Info, Zap, X } from 'lucide-react';

export default function NotificacoesInteligenteSection() {
  const [notificacoes, setNotificacoes] = useState([
    {
      id: 1,
      titulo: 'Estoque Baixo - Pijama Carol',
      descricao: 'Apenas 2 unidades restantes. Reabastecimento recomendado.',
      tipo: 'alerta',
      urgencia: 'alta',
      timestamp: 'Há 2 minutos',
      acao: 'Pausar Campanha',
      lida: false,
    },
    {
      id: 2,
      titulo: 'Churn Detectado',
      descricao: 'Carol Silva não compra há 45 dias. Enviar email de reativação?',
      tipo: 'aviso',
      urgencia: 'media',
      timestamp: 'Há 5 minutos',
      acao: 'Enviar Email',
      lida: false,
    },
    {
      id: 3,
      titulo: 'Meta de Conversão Atingida',
      descricao: 'Conversão diária atingiu 6.8% (meta: 6.5%). Parabéns!',
      tipo: 'sucesso',
      urgencia: 'baixa',
      timestamp: 'Há 8 minutos',
      acao: 'Ver Detalhes',
      lida: false,
    },
    {
      id: 4,
      titulo: 'Oportunidade Viral Detectada',
      descricao: 'Post no TikTok atingiu 50K visualizações. Aumentar investimento?',
      tipo: 'info',
      urgencia: 'media',
      timestamp: 'Há 12 minutos',
      acao: 'Aumentar Budget',
      lida: true,
    },
    {
      id: 5,
      titulo: 'Afiliado com Baixa Performance',
      descricao: 'Influenciadora Vanessa com 0 vendas nesta semana.',
      tipo: 'aviso',
      urgencia: 'media',
      timestamp: 'Há 15 minutos',
      acao: 'Contatar',
      lida: true,
    },
  ]);

  const removerNotificacao = (id: number) => {
    setNotificacoes(notificacoes.filter(n => n.id !== id));
  };

  const marcarComoLida = (id: number) => {
    setNotificacoes(notificacoes.map(n => n.id === id ? { ...n, lida: true } : n));
  };

  const getIcone = (tipo: string) => {
    switch (tipo) {
      case 'alerta':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'aviso':
        return <Zap className="w-5 h-5 text-amber-600" />;
      case 'sucesso':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-600" />;
    }
  };

  const getCor = (tipo: string) => {
    switch (tipo) {
      case 'alerta':
        return 'bg-red-50 border-red-200';
      case 'aviso':
        return 'bg-amber-50 border-amber-200';
      case 'sucesso':
        return 'bg-green-50 border-green-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const getCorBadge = (urgencia: string) => {
    switch (urgencia) {
      case 'alta':
        return 'bg-red-100 text-red-700';
      case 'media':
        return 'bg-amber-100 text-amber-700';
      case 'baixa':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const naoLidas = notificacoes.filter(n => !n.lida).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Notificações Inteligentes</h2>
          <p className="text-sm text-slate-600 mt-1">Alertas automáticos para eventos críticos</p>
        </div>
        {naoLidas > 0 && (
          <Badge className="bg-red-100 text-red-700 text-lg px-3 py-1">
            {naoLidas} nova{naoLidas > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Notificações */}
      <div className="space-y-3">
        {notificacoes.length > 0 ? (
          notificacoes.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-lg border-2 transition-all ${getCor(notif.tipo)} ${
                !notif.lida ? 'ring-2 ring-amber-300' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">{getIcone(notif.tipo)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-slate-900">{notif.titulo}</h3>
                      <p className="text-sm text-slate-600 mt-1">{notif.descricao}</p>
                    </div>
                    <button
                      onClick={() => removerNotificacao(notif.id)}
                      className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <Badge className={getCorBadge(notif.urgencia)}>
                      {notif.urgencia === 'alta' ? 'Urgente' : notif.urgencia === 'media' ? 'Importante' : 'Normal'}
                    </Badge>
                    <span className="text-xs text-slate-500">{notif.timestamp}</span>
                    <button className="text-xs font-semibold text-amber-700 hover:text-amber-900 transition-colors">
                      {notif.acao}
                    </button>
                    {!notif.lida && (
                      <button
                        onClick={() => marcarComoLida(notif.id)}
                        className="text-xs text-slate-500 hover:text-slate-700 transition-colors ml-auto"
                      >
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Nenhuma notificação no momento</p>
          </div>
        )}
      </div>

      {/* Configurações de Notificações */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle>Configurações de Notificações</CardTitle>
          <CardDescription>Escolha quais alertas você quer receber</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { nome: 'Estoque Baixo', descricao: 'Alertas quando estoque < 5 unidades', ativo: true },
              { nome: 'Churn Detectado', descricao: 'Clientes sem compras há 30+ dias', ativo: true },
              { nome: 'Metas Atingidas', descricao: 'Quando atingir metas de conversão', ativo: true },
              { nome: 'Oportunidades Virais', descricao: 'Posts com alto engajamento', ativo: true },
              { nome: 'Performance Baixa', descricao: 'Canais com conversão < 5%', ativo: false },
              { nome: 'Afiliados', descricao: 'Alertas de performance de afiliados', ativo: true },
            ].map((config, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                <div>
                  <p className="font-semibold text-slate-900">{config.nome}</p>
                  <p className="text-sm text-slate-600">{config.descricao}</p>
                </div>
                <div className="w-12 h-6 bg-amber-300 rounded-full relative cursor-pointer">
                  <div
                    className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                      config.ativo ? 'right-0.5' : 'left-0.5'
                    }`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card className="border-amber-200">
        <CardHeader>
          <CardTitle>Histórico de Notificações</CardTitle>
          <CardDescription>Últimas 30 dias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="text-slate-600">📊 45 notificações enviadas</p>
            <p className="text-slate-600">✅ 38 ações tomadas (84% de taxa de ação)</p>
            <p className="text-slate-600">⏱️ Tempo médio de resposta: 12 minutos</p>
            <p className="text-slate-600">💰 Impacto em receita: disponível com Bling ERP conectado</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
