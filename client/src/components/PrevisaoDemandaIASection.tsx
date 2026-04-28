import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, TrendingUp, Plus, Trash2, BarChart3 } from "lucide-react";
import { toast } from "sonner";

type PrevisaoProduto = {
  id: number;
  produto: string;
  persona: string;
  estoqueAtual: number;
  previsao30d: number;
  recomendacao: string;
};

const RECOMENDACOES = [
  "Aumentar produção",
  "Manter estoque",
  "Reduzir produção",
  "Fazer promoção para giro",
  "Urgente: repor estoque",
];

export function PrevisaoDemandaIASection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery();
  const [previsoes, setPrevisoes] = useState<PrevisaoProduto[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ produto: '', persona: 'Carol', estoqueAtual: '', previsao30d: '', recomendacao: 'Manter estoque' });
  const nextId = previsoes.length > 0 ? Math.max(...previsoes.map(p => p.id)) + 1 : 1;

  const adicionar = () => {
    if (!form.produto) { toast.error('Informe o nome do produto'); return; }
    setPrevisoes(prev => [...prev, {
      id: nextId,
      produto: form.produto,
      persona: form.persona,
      estoqueAtual: parseInt(form.estoqueAtual) || 0,
      previsao30d: parseInt(form.previsao30d) || 0,
      recomendacao: form.recomendacao,
    }]);
    setForm({ produto: '', persona: 'Carol', estoqueAtual: '', previsao30d: '', recomendacao: 'Manter estoque' });
    setShowForm(false);
    toast.success('Previsão adicionada');
  };

  const remover = (id: number) => { setPrevisoes(prev => prev.filter(p => p.id !== id)); };

  // Proxy: campaigns with highest conversions as demand signal
  const topCampanhas = (campanhas as any[])
    .sort((a, b) => (b.performance?.conversoes ?? 0) - (a.performance?.conversoes ?? 0))
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Previsão de Demanda com IA</h2>
        <p className="text-slate-500 text-sm mt-1">Monitore estoque e previsões de demanda por produto</p>
      </div>

      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Previsão automática de demanda requer integração com <strong>Bling ERP</strong> (histórico de vendas)
            e API de machine learning. Abaixo você pode registrar previsões manualmente e ver sinais de demanda
            das campanhas.
          </p>
        </CardContent>
      </Card>

      {/* Demand signal from campaigns */}
      {topCampanhas.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4" style={{ color: '#6B1D28' }} />
              Sinal de demanda — top campanhas por conversão
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {topCampanhas.map((c: any, idx: number) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">{idx + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{c.nome}</p>
                    <p className="text-xs text-slate-400 capitalize">{c.plataforma}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-green-700">{(c.performance?.conversoes ?? 0).toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-slate-400">conversões</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual forecast list */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4" style={{ color: '#6B1D28' }} />
              Previsões de estoque
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
                  <label className="text-xs font-medium text-slate-700 block mb-1">Produto</label>
                  <Input placeholder="Ex: Pijama Carol Inverno" value={form.produto}
                    onChange={e => setForm(f => ({ ...f, produto: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Persona</label>
                  <select value={form.persona} onChange={e => setForm(f => ({ ...f, persona: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm">
                    {['Carol', 'Renata', 'Vanessa', 'Luiza'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Estoque atual (un.)</label>
                  <Input type="number" min="0" placeholder="150" value={form.estoqueAtual}
                    onChange={e => setForm(f => ({ ...f, estoqueAtual: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Previsão 30 dias (un.)</label>
                  <Input type="number" min="0" placeholder="300" value={form.previsao30d}
                    onChange={e => setForm(f => ({ ...f, previsao30d: e.target.value }))} />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-700 block mb-1">Recomendação</label>
                  <select value={form.recomendacao} onChange={e => setForm(f => ({ ...f, recomendacao: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm">
                    {RECOMENDACOES.map(r => <option key={r}>{r}</option>)}
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

          {previsoes.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <BarChart3 className="w-10 h-10 mx-auto" />
              <p className="text-sm">Nenhuma previsão cadastrada.</p>
              <p className="text-xs">Adicione produtos com estoque atual e previsão de demanda.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {previsoes.map(p => {
                const gap = p.previsao30d - p.estoqueAtual;
                const status = gap > 50 ? { label: 'Estoque baixo', color: 'bg-red-100 text-red-700' }
                  : gap > 0 ? { label: 'Atenção', color: 'bg-orange-100 text-orange-700' }
                  : { label: 'OK', color: 'bg-green-100 text-green-700' };
                return (
                  <div key={p.id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-sm text-slate-900">{p.produto}</p>
                        <Badge variant="secondary" className="text-xs mt-1">{p.persona}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${status.color}`}>{status.label}</span>
                        <button onClick={() => remover(p.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div className="bg-slate-50 rounded p-2">
                        <p className="text-slate-400">Estoque</p>
                        <p className="font-bold text-slate-900">{p.estoqueAtual}</p>
                      </div>
                      <div className="bg-slate-50 rounded p-2">
                        <p className="text-slate-400">Previsão 30d</p>
                        <p className="font-bold text-slate-900">{p.previsao30d}</p>
                      </div>
                      <div className={`rounded p-2 ${gap > 0 ? 'bg-red-50' : 'bg-green-50'}`}>
                        <p className="text-slate-400">Gap</p>
                        <p className={`font-bold ${gap > 0 ? 'text-red-600' : 'text-green-600'}`}>{gap > 0 ? `+${gap}` : gap}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mt-2">→ {p.recomendacao}</p>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
