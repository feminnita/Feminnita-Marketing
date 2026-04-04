import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Clock, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';

interface ConversaChat {
  id: string;
  cliente: string;
  persona: string;
  status: 'ativa' | 'encerrada' | 'aguardando';
  ultimaMensagem: string;
  tempo: string;
  satisfacao?: number;
}

interface MetricaChat {
  label: string;
  valor: string | number;
  mudanca: string;
  cor: string;
}

export function IntegracaoTawkIntercomSection() {
  const [conversas, setConversas] = useState<ConversaChat[]>([]);

  const ativas = conversas.filter(c => c.status === 'ativa').length;
  const encerradas = conversas.filter(c => c.status === 'encerrada');
  const avgSatisfacao = encerradas.filter(c => c.satisfacao).length > 0
    ? encerradas.reduce((s, c) => s + (c.satisfacao ?? 0), 0) / encerradas.filter(c => c.satisfacao).length : 0;
  const taxaResolucao = conversas.length > 0
    ? Math.round((encerradas.length / conversas.length) * 100) : null;

  const metricas: MetricaChat[] = [
    { label: 'Chats Ativos', valor: ativas, mudanca: '', cor: 'text-slate-600' },
    { label: 'Taxa de Resolução', valor: taxaResolucao !== null ? `${taxaResolucao}%` : '—', mudanca: '', cor: 'text-slate-600' },
    { label: 'Satisfação Média', valor: avgSatisfacao > 0 ? `${avgSatisfacao.toFixed(1)}/5` : '—', mudanca: '', cor: 'text-slate-600' },
    { label: 'Total Conversas', valor: conversas.length, mudanca: '', cor: 'text-slate-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Chat ao Vivo - Tawk.io/Intercom</h2>
          <p className="text-slate-600 mt-1">Suporte imediato e coleta de feedback em tempo real</p>
        </div>
        <Badge variant="outline" className="text-xs text-slate-500">Requer integração</Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metricas.map((metrica, idx) => (
          <Card key={idx}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">{metrica.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{metrica.valor}</div>
              <p className={`text-xs ${metrica.cor} mt-1`}>{metrica.mudanca}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Conversas Ativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            Conversas em Tempo Real
          </CardTitle>
          <CardDescription>Chat ao vivo com clientes</CardDescription>
        </CardHeader>
        <CardContent>
          {conversas.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <MessageCircle className="w-8 h-8 mx-auto" />
              <p className="text-sm">Nenhuma conversa registrada.</p>
              <p className="text-xs">Conversas aparecerão aqui após conectar Tawk.io ou Intercom.</p>
            </div>
          ) : (
          <div className="space-y-3">
            {conversas.map((conversa) => (
              <div key={conversa.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">{conversa.cliente}</span>
                      <Badge variant="outline" className="text-xs">{conversa.persona}</Badge>
                      <Badge
                        className={`text-xs ${
                          conversa.status === 'ativa' ? 'bg-green-100 text-green-800' :
                          conversa.status === 'aguardando' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {conversa.status === 'ativa' ? '🟢 Ativa' : conversa.status === 'aguardando' ? '🟡 Aguardando' : '⚫ Encerrada'}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-600">{conversa.ultimaMensagem}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-slate-600 mb-1">{conversa.tempo}</div>
                    {conversa.satisfacao && (
                      <div className="flex gap-0.5 justify-end">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-xs ${i < conversa.satisfacao! ? '⭐' : '☆'}`}></span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {conversa.status === 'ativa' && (
                  <Button size="sm" variant="outline" className="w-full mt-2">
                    Responder
                  </Button>
                )}
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Configurações de Integração */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Integração</CardTitle>
          <CardDescription>Conecte Tawk.io ou Intercom para chat ao vivo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-slate-900">Tawk.io</div>
                  <div className="text-sm text-slate-600">Chat gratuito com IA</div>
                </div>
                <Button size="sm" variant="outline">Conectar</Button>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div>○ Chat ao vivo gratuito</div>
                <div>○ IA para respostas automáticas</div>
                <div>○ Integre em tawk.to/settings</div>
              </div>
            </div>

            <div className="p-4 border border-slate-200 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-slate-900">Intercom</div>
                  <div className="text-sm text-slate-600">Chat premium com automação</div>
                </div>
                <Button size="sm" variant="outline">Conectar</Button>
              </div>
              <div className="space-y-2 text-sm text-slate-600">
                <div>○ Automação de fluxos</div>
                <div>○ Segmentação avançada</div>
                <div>○ Análise detalhada</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Insights de Chat */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="w-5 h-5" />
            Insights de Chat
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-slate-900">Responda em menos de 2 minutos</div>
                <div className="text-sm text-slate-600">Tempo de resposta rápido aumenta taxa de conversão em 30%</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-slate-900">Crie FAQ das perguntas frequentes</div>
                <div className="text-sm text-slate-600">Tamanho/medidas, prazo de entrega e formas de pagamento são as mais comuns</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <Users className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="font-medium text-slate-900">Configure respostas automáticas por persona</div>
                <div className="text-sm text-slate-600">Adapte o tom da resposta: Carol (casual), Renata (profissional), Luiza (jovem)</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
