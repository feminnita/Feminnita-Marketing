import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, TrendingDown, Users, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

type ClienteRisco = {
  id: number;
  nome: string;
  email: string;
  diasSemCompra: number;
  acao: string;
};

const RISCO_LABEL = (dias: number) => {
  if (dias >= 60) return { label: 'Alto', color: 'bg-red-100 text-red-700' };
  if (dias >= 30) return { label: 'Médio', color: 'bg-orange-100 text-orange-700' };
  return { label: 'Baixo', color: 'bg-yellow-100 text-yellow-700' };
};

const ACOES_SUGERIDAS = [
  "Cupom 20%",
  "Email exclusivo",
  "Cupom 15% + Frete grátis",
  "WhatsApp pessoal",
  "Oferta VIP",
];

export function PrevisaoChurnSection() {
  const [clientes, setClientes] = useState<ClienteRisco[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: '', email: '', diasSemCompra: '', acao: 'Cupom 20%' });
  const nextId = clientes.length > 0 ? Math.max(...clientes.map(c => c.id)) + 1 : 1;

  const adicionar = () => {
    const dias = parseInt(form.diasSemCompra);
    if (!form.nome || isNaN(dias) || dias < 1) {
      toast.error('Preencha nome e dias sem compra');
      return;
    }
    setClientes(prev => [...prev, { id: nextId, nome: form.nome, email: form.email, diasSemCompra: dias, acao: form.acao }]);
    setForm({ nome: '', email: '', diasSemCompra: '', acao: 'Cupom 20%' });
    setShowForm(false);
    toast.success('Cliente adicionado');
  };

  const remover = (id: number) => { setClientes(prev => prev.filter(c => c.id !== id)); toast.success('Removido'); };

  const alto = clientes.filter(c => c.diasSemCompra >= 60).length;
  const medio = clientes.filter(c => c.diasSemCompra >= 30 && c.diasSemCompra < 60).length;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Previsão de Churn</h2>
        <p className="text-slate-500 text-sm mt-1">Monitore clientes em risco de abandono e defina ações de retenção</p>
      </div>

      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Detecção automática de churn requer integração com <strong>Bling ERP</strong> para analisar histórico
            de pedidos. Aqui você pode registrar manualmente clientes identificados.
          </p>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Total em risco</p>
            <p className="text-2xl font-bold text-slate-900">{clientes.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Risco alto (60+ dias)</p>
            <p className="text-2xl font-bold text-red-600">{alto}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Risco médio (30-59d)</p>
            <p className="text-2xl font-bold text-orange-600">{medio}</p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingDown className="w-4 h-4 text-red-500" />
              Clientes em risco
            </CardTitle>
            <Button size="sm" onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#6B1D28' }} className="text-white">
              <Plus className="w-3.5 h-3.5 mr-1.5" />Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Form */}
          {showForm && (
            <div className="mb-4 p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Nome</label>
                  <Input placeholder="Ex: Maria Silva" value={form.nome}
                    onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Email (opcional)</label>
                  <Input placeholder="maria@email.com" type="email" value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Dias sem compra</label>
                  <Input placeholder="45" type="number" min="1" value={form.diasSemCompra}
                    onChange={e => setForm(f => ({ ...f, diasSemCompra: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Ação recomendada</label>
                  <select value={form.acao} onChange={e => setForm(f => ({ ...f, acao: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm">
                    {ACOES_SUGERIDAS.map(a => <option key={a}>{a}</option>)}
                  </select>
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

          {clientes.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Users className="w-10 h-10 mx-auto" />
              <p className="text-sm">Nenhum cliente em risco registrado.</p>
              <p className="text-xs">Identifique clientes inativos no Bling e registre aqui.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-xs text-slate-500">
                    <th className="text-left py-2 font-medium">Cliente</th>
                    <th className="text-right py-2 font-medium">Dias inativo</th>
                    <th className="text-right py-2 font-medium">Risco</th>
                    <th className="text-right py-2 font-medium">Ação</th>
                    <th className="py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {clientes
                    .sort((a, b) => b.diasSemCompra - a.diasSemCompra)
                    .map(c => {
                      const r = RISCO_LABEL(c.diasSemCompra);
                      return (
                        <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                          <td className="py-2">
                            <p className="font-medium text-slate-900">{c.nome}</p>
                            {c.email && <p className="text-xs text-slate-400">{c.email}</p>}
                          </td>
                          <td className="text-right py-2 font-semibold text-slate-700">{c.diasSemCompra}d</td>
                          <td className="text-right py-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${r.color}`}>{r.label}</span>
                          </td>
                          <td className="text-right py-2 text-xs text-slate-600">{c.acao}</td>
                          <td className="py-2 pl-2">
                            <button onClick={() => remover(c.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Sinais de churn para monitorar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p><span className="font-semibold text-red-600">🔴 Alto risco:</span> Sem compra há 60+ dias, sem abrir emails por 3+ semanas</p>
          <p><span className="font-semibold text-orange-600">🟡 Médio risco:</span> Sem compra há 30-60 dias, CTR de email caindo</p>
          <p><span className="font-semibold text-yellow-600">🟨 Baixo risco:</span> Sem compra há 15-30 dias, menos engajamento</p>
          <p className="pt-2 text-slate-500 text-xs">Fonte: histórico de pedidos no Bling + abertura de emails</p>
        </CardContent>
      </Card>
    </div>
  );
}
