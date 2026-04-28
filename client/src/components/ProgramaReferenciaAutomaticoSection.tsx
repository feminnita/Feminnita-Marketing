import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Share2, Gift, Users, Plus, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type Referencia = {
  id: number;
  referidor: string;
  persona: string;
  amigo: string;
  status: 'ativa' | 'convertida' | 'pendente';
  dataReferencia: string;
  vendas: number;
};

const PERSONAS = ['Carol', 'Renata', 'Vanessa', 'Luiza'];
const RECOMPENSAS_REFERIDOR: Record<string, string> = {
  Carol: 'R$ 50 desconto',
  Renata: 'R$ 45 desconto',
  Vanessa: 'R$ 40 desconto',
  Luiza: 'R$ 35 desconto',
};
const RECOMPENSAS_AMIGO: Record<string, string> = {
  Carol: 'R$ 35 desconto',
  Renata: 'R$ 30 desconto',
  Vanessa: 'R$ 25 desconto',
  Luiza: 'R$ 20 desconto',
};

const getStatusColor = (status: string) => {
  if (status === 'convertida') return 'bg-green-100 text-green-800';
  if (status === 'ativa') return 'bg-blue-100 text-blue-800';
  return 'bg-yellow-100 text-yellow-800';
};

export function ProgramaReferenciaAutomaticoSection() {
  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ referidor: '', persona: 'Carol', amigo: '', status: 'pendente' as Referencia['status'], vendas: '' });
  const nextId = referencias.length > 0 ? Math.max(...referencias.map(r => r.id)) + 1 : 1;

  const adicionar = () => {
    if (!form.referidor || !form.amigo) { toast.error('Preencha referidor e indicado'); return; }
    setReferencias(prev => [...prev, {
      id: nextId,
      referidor: form.referidor,
      persona: form.persona,
      amigo: form.amigo,
      status: form.status,
      dataReferencia: new Date().toISOString().split('T')[0],
      vendas: parseInt(form.vendas) || 0,
    }]);
    setForm({ referidor: '', persona: 'Carol', amigo: '', status: 'pendente', vendas: '' });
    setShowForm(false);
    toast.success('Referência adicionada');
  };

  const remover = (id: number) => { setReferencias(prev => prev.filter(r => r.id !== id)); toast.success('Removida'); };

  const convertidas = referencias.filter(r => r.status === 'convertida').length;
  const ativas = referencias.filter(r => r.status === 'ativa').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Programa de Referência</h2>
          <p className="text-slate-500 text-sm mt-1">Recompense clientes que indicam amigos com descontos</p>
        </div>
      </div>

      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Rastreamento automático de referências requer integração com <strong>Bling ERP</strong> (histórico de pedidos)
            e lógica de cupons. Registre manualmente as referências identificadas abaixo.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Total registradas</p>
            <p className="text-2xl font-bold text-slate-900">{referencias.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Convertidas</p>
            <p className="text-2xl font-bold text-green-700">{convertidas}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Ativas</p>
            <p className="text-2xl font-bold text-blue-700">{ativas}</p>
          </CardContent>
        </Card>
      </div>

      {/* Referências list */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" style={{ color: '#6B1D28' }} />
              Histórico de Referências
            </CardTitle>
            <Button size="sm" onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#6B1D28' }} className="text-white">
              <Plus className="w-3.5 h-3.5 mr-1.5" />Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-4 p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Referidor (quem indicou)</label>
                  <Input placeholder="Ex: Maria Silva" value={form.referidor} onChange={e => setForm(f => ({ ...f, referidor: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Persona</label>
                  <select value={form.persona} onChange={e => setForm(f => ({ ...f, persona: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm">
                    {PERSONAS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Indicado (amigo)</label>
                  <Input placeholder="Ex: Juliana Torres" value={form.amigo} onChange={e => setForm(f => ({ ...f, amigo: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Referencia['status'] }))}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm">
                    <option value="pendente">Pendente</option>
                    <option value="ativa">Ativa</option>
                    <option value="convertida">Convertida</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Vendas geradas</label>
                  <Input type="number" min="0" placeholder="0" value={form.vendas} onChange={e => setForm(f => ({ ...f, vendas: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={adicionar} size="sm" style={{ backgroundColor: '#6B1D28' }} className="text-white">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />Adicionar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {referencias.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Share2 className="w-10 h-10 mx-auto" />
              <p className="text-sm">Nenhuma referência registrada.</p>
              <p className="text-xs">Identifique clientes que indicaram amigos e registre aqui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {referencias.map(ref => (
                <div key={ref.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-900">{ref.referidor}</span>
                        <Badge variant="outline" className="text-xs">{ref.persona}</Badge>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusColor(ref.status)}`}>
                          {ref.status === 'convertida' ? '✓ Convertida' : ref.status === 'ativa' ? '⏳ Ativa' : '⏱ Pendente'}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 mt-0.5">Indicou: <span className="font-medium text-slate-700">{ref.amigo}</span></p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-slate-400">{ref.dataReferencia}</p>
                        <p className="text-sm font-semibold text-slate-700">{ref.vendas} vendas</p>
                      </div>
                      <button onClick={() => remover(ref.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                    <div className="p-2 bg-green-50 rounded border border-green-100">
                      <p className="text-green-600 mb-0.5">Recompensa referidor</p>
                      <p className="font-semibold text-green-800">{RECOMPENSAS_REFERIDOR[ref.persona] ?? '—'}</p>
                    </div>
                    <div className="p-2 bg-blue-50 rounded border border-blue-100">
                      <p className="text-blue-600 mb-0.5">Recompensa amigo</p>
                      <p className="font-semibold text-blue-800">{RECOMPENSAS_AMIGO[ref.persona] ?? '—'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reward structure guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Gift className="w-4 h-4" style={{ color: '#6B1D28' }} />
            Estrutura de recompensas por persona
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {PERSONAS.map(persona => (
              <div key={persona} className="p-3 border border-slate-200 rounded-lg grid grid-cols-3 gap-2 text-sm">
                <div className="font-semibold text-slate-900">{persona}</div>
                <div>
                  <p className="text-xs text-slate-500">Referidor</p>
                  <p className="font-medium">{RECOMPENSAS_REFERIDOR[persona]}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Amigo indicado</p>
                  <p className="font-medium">{RECOMPENSAS_AMIGO[persona]}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
