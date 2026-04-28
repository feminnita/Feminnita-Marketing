import React, { useState } from 'react';
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TrendingUp, Users, Plus, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type Afiliado = {
  id: number;
  nome: string;
  email: string;
  persona: string;
  vendas: number;
  comissao: number;
  status: 'ativo' | 'inativo';
};

const PERSONAS = ['Carol', 'Renata', 'Vanessa', 'Luiza', 'Todas'];

const REGRAS_COMISSAO = [
  { faixa: 'Até 500 vendas/mês', comissao: '5%', condicao: 'Padrão' },
  { faixa: '501 a 1000 vendas/mês', comissao: '6%', condicao: 'Bom desempenho' },
  { faixa: '1001+ vendas/mês', comissao: '7%', condicao: 'Excelente desempenho' },
  { faixa: 'Bônus: 50+ vendas/semana', comissao: '+1%', condicao: 'Incentivo semanal' },
];

export default function IntegracaoAfiliados() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery();
  const [afiliados, setAfiliados] = useState<Afiliado[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', persona: 'Carol', vendas: '', comissao: '5' });
  const nextId = afiliados.length > 0 ? Math.max(...afiliados.map(a => a.id)) + 1 : 1;

  const adicionar = () => {
    if (!form.nome) { toast.error('Informe o nome do afiliado'); return; }
    setAfiliados(prev => [...prev, {
      id: nextId,
      nome: form.nome,
      email: form.email,
      persona: form.persona,
      vendas: parseInt(form.vendas) || 0,
      comissao: parseFloat(form.comissao) || 5,
      status: 'ativo',
    }]);
    setForm({ nome: '', email: '', persona: 'Carol', vendas: '', comissao: '5' });
    setShowForm(false);
    toast.success('Afiliado adicionado');
  };

  const remover = (id: number) => { setAfiliados(prev => prev.filter(a => a.id !== id)); toast.success('Removido'); };
  const toggleStatus = (id: number) => setAfiliados(prev => prev.map(a =>
    a.id === id ? { ...a, status: a.status === 'ativo' ? 'inativo' : 'ativo' } : a
  ));

  const totalVendas = afiliados.reduce((s, a) => s + a.vendas, 0);
  const ativos = afiliados.filter(a => a.status === 'ativo').length;
  const totalConversoesCampanhas = (campanhas as any[]).reduce((s, c) => s + (c.performance?.conversoes ?? 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Integração de Afiliados</h2>
        <p className="text-slate-500 text-sm mt-1">Gerencie afiliadas e acompanhe vendas por parceiro</p>
      </div>

      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Rastreamento automático de vendas por afiliado requer integração com <strong>Bling ERP</strong>
            (cupons de desconto por afiliado) ou plataforma de afiliados. Registre afiliadas manualmente abaixo.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Afiliadas ativas</p>
            <p className="text-2xl font-bold text-green-700">{ativos}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Vendas registradas</p>
            <p className="text-2xl font-bold text-slate-900">{totalVendas.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Conversões (campanhas)</p>
            <p className="text-2xl font-bold text-blue-700">{totalConversoesCampanhas.toLocaleString('pt-BR')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Affiliates list */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="w-4 h-4" style={{ color: '#6B1D28' }} />
              Afiliadas cadastradas
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
                  <label className="text-xs font-medium text-slate-700 block mb-1">Nome</label>
                  <Input placeholder="Ex: Maria Silva" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Email (opcional)</label>
                  <Input type="email" placeholder="maria@email.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Persona</label>
                  <select value={form.persona} onChange={e => setForm(f => ({ ...f, persona: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm">
                    {PERSONAS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Comissão (%)</label>
                  <Input type="number" min="1" max="20" value={form.comissao} onChange={e => setForm(f => ({ ...f, comissao: e.target.value }))} />
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

          {afiliados.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto" />
              <p className="text-sm">Nenhuma afiliada cadastrada.</p>
              <p className="text-xs">Adicione influenciadoras e revendedoras que promovem seus produtos.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-slate-500">
                    <th className="text-left py-2 font-medium">Nome</th>
                    <th className="text-left py-2 font-medium">Persona</th>
                    <th className="text-right py-2 font-medium">Vendas</th>
                    <th className="text-right py-2 font-medium">Comissão</th>
                    <th className="text-right py-2 font-medium">Status</th>
                    <th className="py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {afiliados.sort((a, b) => b.vendas - a.vendas).map(a => (
                    <tr key={a.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2">
                        <p className="font-medium text-slate-900">{a.nome}</p>
                        {a.email && <p className="text-xs text-slate-400">{a.email}</p>}
                      </td>
                      <td className="py-2"><Badge variant="secondary" className="text-xs">{a.persona}</Badge></td>
                      <td className="text-right py-2 font-semibold text-slate-700">{a.vendas.toLocaleString('pt-BR')}</td>
                      <td className="text-right py-2 text-green-700 font-medium">{a.comissao}%</td>
                      <td className="text-right py-2">
                        <button onClick={() => toggleStatus(a.id)}
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${a.status === 'ativo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                          {a.status}
                        </button>
                      </td>
                      <td className="py-2 pl-2">
                        <button onClick={() => remover(a.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commission rules */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" style={{ color: '#6B1D28' }} />
            Regras de comissão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {REGRAS_COMISSAO.map((r, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg text-sm">
                <div>
                  <p className="font-medium text-slate-900">{r.faixa}</p>
                  <p className="text-xs text-slate-500">{r.condicao}</p>
                </div>
                <Badge variant="secondary" className="text-sm font-bold">{r.comissao}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
