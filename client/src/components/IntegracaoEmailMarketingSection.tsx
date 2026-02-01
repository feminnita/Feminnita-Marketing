import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Zap, Users, TrendingUp } from 'lucide-react';

interface CampanhaEmail {
  id: string;
  nome: string;
  persona: string;
  tipo: string;
  status: 'ativa' | 'agendada' | 'finalizada';
  enviados: number;
  abertos: number;
  cliques: number;
  conversoes: number;
  receita: number;
}

interface MetricaEmail {
  label: string;
  valor: string | number;
  mudanca: string;
  cor: string;
}

export function IntegracaoEmailMarketingSection() {
  const [campanhas, setCampanhas] = useState<CampanhaEmail[]>([
    {
      id: '1',
      nome: 'Bem-vindo Carol',
      persona: 'Carol',
      tipo: 'Onboarding',
      status: 'ativa',
      enviados: 1240,
      abertos: 868,
      cliques: 434,
      conversoes: 248,
      receita: 46920,
    },
    {
      id: '2',
      nome: 'Abandono de Carrinho - Renata',
      persona: 'Renata',
      tipo: 'Recuperação',
      status: 'ativa',
      enviados: 980,
      abertos: 627,
      cliques: 282,
      conversoes: 141,
      receita: 23265,
    },
    {
      id: '3',
      nome: 'Reengajamento Vanessa',
      persona: 'Vanessa',
      tipo: 'Reengajamento',
      status: 'ativa',
      enviados: 1120,
      abertos: 561,
      cliques: 224,
      conversoes: 84,
      receita: 13440,
    },
    {
      id: '4',
      nome: 'Desconto Exclusivo Luiza',
      persona: 'Luiza',
      tipo: 'Promoção',
      status: 'agendada',
      enviados: 0,
      abertos: 0,
      cliques: 0,
      conversoes: 0,
      receita: 0,
    },
    {
      id: '5',
      nome: 'Novo Lançamento - Todas',
      persona: 'Todas',
      tipo: 'Lançamento',
      status: 'finalizada',
      enviados: 4190,
      abertos: 2929,
      cliques: 1257,
      conversoes: 627,
      receita: 118713,
    },
  ]);

  const [metricas] = useState<MetricaEmail[]>([
    { label: 'Taxa de Abertura Média', valor: '68.2%', mudanca: '↑ 8% vs período anterior', cor: 'text-green-600' },
    { label: 'Taxa de Clique Média', valor: '32.4%', mudanca: '↑ 12% vs período anterior', cor: 'text-green-600' },
    { label: 'Taxa de Conversão Média', valor: '18.9%', mudanca: '↑ 5% vs período anterior', cor: 'text-green-600' },
    { label: 'Receita por Email', valor: 'R$ 28.50', mudanca: '↑ 15% vs período anterior', cor: 'text-green-600' },
  ]);

  const getStatusColor = (status: string) => {
    if (status === 'ativa') return 'bg-green-100 text-green-800';
    if (status === 'agendada') return 'bg-blue-100 text-blue-800';
    return 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Email Marketing - Klaviyo/Mailchimp</h2>
          <p className="text-slate-600 mt-1">Sincronize segmentação de personas com campanhas automáticas</p>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-blue-100 text-blue-800">Klaviyo Conectado</Badge>
          <Badge className="bg-purple-100 text-purple-800">Mailchimp Conectado</Badge>
        </div>
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

      {/* Campanhas Ativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-600" />
            Campanhas de Email por Persona
          </CardTitle>
          <CardDescription>Automação de emails baseada em comportamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campanhas.map((campanha) => (
              <div key={campanha.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-900">{campanha.nome}</span>
                      <Badge variant="outline" className="text-xs">{campanha.persona}</Badge>
                      <Badge className={`text-xs ${getStatusColor(campanha.status)}`}>
                        {campanha.status === 'ativa' ? '🟢 Ativa' : campanha.status === 'agendada' ? '🔵 Agendada' : '⚫ Finalizada'}
                      </Badge>
                    </div>
                    <div className="text-sm text-slate-600">{campanha.tipo}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">R$ {campanha.receita.toLocaleString('pt-BR')}</div>
                    <div className="text-xs text-slate-600">Receita</div>
                  </div>
                </div>

                <div className="grid grid-cols-5 gap-2 mb-3 text-sm">
                  <div className="p-2 bg-slate-100 rounded">
                    <div className="text-xs text-slate-600 mb-1">Enviados</div>
                    <div className="font-bold text-slate-900">{campanha.enviados.toLocaleString('pt-BR')}</div>
                  </div>
                  <div className="p-2 bg-blue-100 rounded">
                    <div className="text-xs text-blue-700 mb-1">Abertos</div>
                    <div className="font-bold text-blue-900">{((campanha.abertos / campanha.enviados) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="p-2 bg-purple-100 rounded">
                    <div className="text-xs text-purple-700 mb-1">Cliques</div>
                    <div className="font-bold text-purple-900">{((campanha.cliques / campanha.enviados) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="p-2 bg-green-100 rounded">
                    <div className="text-xs text-green-700 mb-1">Conversões</div>
                    <div className="font-bold text-green-900">{((campanha.conversoes / campanha.enviados) * 100).toFixed(1)}%</div>
                  </div>
                  <div className="p-2 bg-orange-100 rounded">
                    <div className="text-xs text-orange-700 mb-1">ROI</div>
                    <div className="font-bold text-orange-900">+{((campanha.receita / (campanha.enviados * 0.5)) * 100).toFixed(0)}%</div>
                  </div>
                </div>

                {campanha.status === 'agendada' && (
                  <Button size="sm" className="w-full" variant="outline">
                    Agendar Envio
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fluxos Automáticos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Fluxos Automáticos por Persona
          </CardTitle>
          <CardDescription>Automação de emails baseada em comportamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                persona: 'Carol',
                fluxo: 'Onboarding → Upsell → VIP',
                emails: 8,
                taxa: '42%',
                receita: 'R$ 18.5K',
              },
              {
                persona: 'Renata',
                fluxo: 'Abandono → Resgate → Reengajamento',
                emails: 6,
                taxa: '28%',
                receita: 'R$ 12.3K',
              },
              {
                persona: 'Vanessa',
                fluxo: 'Inatividade → Desconto → Reativação',
                emails: 5,
                taxa: '18%',
                receita: 'R$ 6.8K',
              },
              {
                persona: 'Luiza',
                fluxo: 'Primeira Compra → Fidelização',
                emails: 4,
                taxa: '12%',
                receita: 'R$ 3.2K',
              },
            ].map((f, idx) => (
              <div key={idx} className="p-4 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-semibold text-slate-900">{f.persona}</div>
                    <div className="text-sm text-slate-600 mt-1">{f.fluxo}</div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-100 text-green-800 mb-1">{f.taxa} conversão</Badge>
                    <div className="text-sm font-bold text-slate-900">{f.receita}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-600">{f.emails} emails no fluxo</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Segmentação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Segmentação Sincronizada
          </CardTitle>
          <CardDescription>Personas sincronizadas com Klaviyo/Mailchimp</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { persona: 'Carol', contatos: 1240, taxa: '82% retenção', status: 'Sincronizado' },
              { persona: 'Renata', contatos: 980, taxa: '75% retenção', status: 'Sincronizado' },
              { persona: 'Vanessa', contatos: 1120, taxa: '68% retenção', status: 'Sincronizado' },
              { persona: 'Luiza', contatos: 850, taxa: '62% retenção', status: 'Sincronizado' },
            ].map((seg, idx) => (
              <div key={idx} className="p-3 border border-slate-200 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{seg.persona}</div>
                  <div className="text-sm text-slate-600">{seg.contatos.toLocaleString('pt-BR')} contatos</div>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800 mb-1">{seg.status}</Badge>
                  <div className="text-xs text-slate-600">{seg.taxa}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <TrendingUp className="w-5 h-5" />
            Insights de Email Marketing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">68.2% taxa de abertura</div>
                <div className="text-sm text-slate-600">8% acima da média da indústria (60%). Carol tem 72% abertura</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Fluxo de Onboarding mais eficaz</div>
                <div className="text-sm text-slate-600">Carol: 42% conversão. Replicar para outras personas</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200">
              <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
              <div className="flex-1">
                <div className="font-medium text-slate-900">Receita por email: R$ 28.50</div>
                <div className="text-sm text-slate-600">Cada email gera R$ 28.50 em receita. Total: R$ 202.3K/mês</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
