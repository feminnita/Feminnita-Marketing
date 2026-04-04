import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Zap, Users, TrendingUp, AlertCircle, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type CampanhaEmail = {
  id: number;
  nome: string;
  persona: string;
  tipo: string;
  status: 'ativa' | 'agendada' | 'finalizada';
  enviados: number;
  abertos: number;
  cliques: number;
  conversoes: number;
};

const PERSONAS = ['Carol', 'Renata', 'Vanessa', 'Luiza', 'Todas'];
const TIPOS = ['Onboarding', 'Recuperação', 'Reengajamento', 'Promoção', 'Lançamento', 'VIP', 'Newsletter'];

const FLUXOS_GUIDE = [
  { persona: 'Carol', fluxo: 'Onboarding (d0) → Primeiros passos (d3) → Upsell (d7) → VIP (d30)', emails: 4 },
  { persona: 'Renata', fluxo: 'Abandono de carrinho (1h) → Lembrete (24h) → Desconto (72h)', emails: 3 },
  { persona: 'Vanessa', fluxo: 'Inatividade 30d → Cupom reativação → Follow-up 7d', emails: 3 },
  { persona: 'Luiza', fluxo: 'Primeira compra → Indicação de amigos → Programa de pontos', emails: 3 },
];

const getStatusColor = (status: string) => {
  if (status === 'ativa') return 'bg-green-100 text-green-800';
  if (status === 'agendada') return 'bg-blue-100 text-blue-800';
  return 'bg-slate-100 text-slate-600';
};

export function IntegracaoEmailMarketingSection() {
  const [campanhas, setCampanhas] = useState<CampanhaEmail[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: '', persona: 'Carol', tipo: 'Onboarding', status: 'ativa' as CampanhaEmail['status'], enviados: '', abertos: '', cliques: '', conversoes: '' });
  const nextId = campanhas.length > 0 ? Math.max(...campanhas.map(c => c.id)) + 1 : 1;

  const adicionar = () => {
    if (!form.nome) { toast.error('Informe o nome da campanha'); return; }
    setCampanhas(prev => [...prev, {
      id: nextId,
      nome: form.nome,
      persona: form.persona,
      tipo: form.tipo,
      status: form.status,
      enviados: parseInt(form.enviados) || 0,
      abertos: parseInt(form.abertos) || 0,
      cliques: parseInt(form.cliques) || 0,
      conversoes: parseInt(form.conversoes) || 0,
    }]);
    setForm({ nome: '', persona: 'Carol', tipo: 'Onboarding', status: 'ativa', enviados: '', abertos: '', cliques: '', conversoes: '' });
    setShowForm(false);
    toast.success('Campanha adicionada');
  };

  const remover = (id: number) => { setCampanhas(prev => prev.filter(c => c.id !== id)); };

  const totalEnviados = campanhas.reduce((s, c) => s + c.enviados, 0);
  const totalConversoes = campanhas.reduce((s, c) => s + c.conversoes, 0);
  const avgAbertura = campanhas.filter(c => c.enviados > 0).length > 0
    ? campanhas.filter(c => c.enviados > 0).reduce((s, c) => s + (c.abertos / c.enviados * 100), 0) / campanhas.filter(c => c.enviados > 0).length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Email Marketing</h2>
        <p className="text-slate-500 text-sm mt-1">Gerencie campanhas e automações de email por persona</p>
      </div>

      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Sincronização automática com <strong>Klaviyo</strong> ou <strong>Mailchimp</strong> requer integração via API.
            Configure as credenciais em Integrações → Email. Abaixo registre campanhas manualmente.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      {campanhas.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500">Emails enviados</p>
              <p className="text-2xl font-bold text-slate-900">{totalEnviados.toLocaleString('pt-BR')}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500">Taxa de abertura média</p>
              <p className={`text-2xl font-bold ${avgAbertura >= 60 ? 'text-green-700' : 'text-amber-600'}`}>
                {avgAbertura > 0 ? `${avgAbertura.toFixed(1)}%` : '—'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500">Conversões totais</p>
              <p className="text-2xl font-bold text-slate-900">{totalConversoes.toLocaleString('pt-BR')}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Campaign list */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="w-4 h-4" style={{ color: '#8B2635' }} />
              Campanhas de email
            </CardTitle>
            <Button size="sm" onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#8B2635' }} className="text-white">
              <Plus className="w-3.5 h-3.5 mr-1.5" />Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-4 p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-700 block mb-1">Nome da campanha</label>
                  <Input placeholder="Ex: Bem-vindo Carol" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Persona</label>
                  <select value={form.persona} onChange={e => setForm(f => ({ ...f, persona: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm">
                    {PERSONAS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Tipo</label>
                  <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm">
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as CampanhaEmail['status'] }))}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm">
                    <option value="ativa">Ativa</option>
                    <option value="agendada">Agendada</option>
                    <option value="finalizada">Finalizada</option>
                  </select>
                </div>
                {['enviados', 'abertos', 'cliques', 'conversoes'].map(field => (
                  <div key={field}>
                    <label className="text-xs font-medium text-slate-700 block mb-1 capitalize">{field}</label>
                    <Input type="number" min="0" placeholder="0"
                      value={form[field as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={adicionar} size="sm" style={{ backgroundColor: '#8B2635' }} className="text-white">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />Adicionar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {campanhas.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Mail className="w-10 h-10 mx-auto" />
              <p className="text-sm">Nenhuma campanha de email cadastrada.</p>
              <p className="text-xs">Adicione campanhas com métricas reais do seu provedor de email.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campanhas.map(c => {
                const taxaAbertura = c.enviados > 0 ? (c.abertos / c.enviados * 100).toFixed(1) : '—';
                const taxaConversao = c.enviados > 0 ? (c.conversoes / c.enviados * 100).toFixed(1) : '—';
                return (
                  <div key={c.id} className="p-4 border border-slate-200 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-sm text-slate-900">{c.nome}</p>
                          <Badge variant="outline" className="text-xs">{c.persona}</Badge>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(c.status)}`}>{c.status}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{c.tipo}</p>
                      </div>
                      <button onClick={() => remover(c.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {c.enviados > 0 && (
                      <div className="grid grid-cols-4 gap-2 text-xs mt-2">
                        <div className="bg-slate-50 rounded p-2 text-center">
                          <p className="text-slate-400">Enviados</p>
                          <p className="font-bold text-slate-900">{c.enviados.toLocaleString('pt-BR')}</p>
                        </div>
                        <div className="bg-blue-50 rounded p-2 text-center">
                          <p className="text-blue-500">Abertura</p>
                          <p className="font-bold text-blue-900">{taxaAbertura}%</p>
                        </div>
                        <div className="bg-purple-50 rounded p-2 text-center">
                          <p className="text-purple-500">Cliques</p>
                          <p className="font-bold text-purple-900">{c.enviados > 0 ? (c.cliques / c.enviados * 100).toFixed(1) : '—'}%</p>
                        </div>
                        <div className="bg-green-50 rounded p-2 text-center">
                          <p className="text-green-500">Conversão</p>
                          <p className="font-bold text-green-900">{taxaConversao}%</p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Automation flows guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4" style={{ color: '#8B2635' }} />
            Fluxos de automação recomendados por persona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {FLUXOS_GUIDE.map((f, idx) => (
              <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{f.persona}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{f.fluxo}</p>
                  </div>
                  <Badge variant="secondary" className="text-xs flex-shrink-0">{f.emails} emails</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best practices */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" style={{ color: '#8B2635' }} />
            Benchmarks de email marketing para moda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p><span className="font-semibold" style={{ color: '#8B2635' }}>Taxa de abertura:</span> 55–70% (acima de 60% = bom)</p>
          <p><span className="font-semibold" style={{ color: '#8B2635' }}>Taxa de clique:</span> 15–30% de quem abriu</p>
          <p><span className="font-semibold" style={{ color: '#8B2635' }}>Taxa de conversão:</span> 10–25% de quem clicou</p>
          <p><span className="font-semibold" style={{ color: '#8B2635' }}>Melhor horário:</span> terça a quinta, 10h–11h ou 19h–20h</p>
          <p><span className="font-semibold" style={{ color: '#8B2635' }}>Frequência ideal:</span> 1–3 emails/semana por persona</p>
        </CardContent>
      </Card>
    </div>
  );
}
