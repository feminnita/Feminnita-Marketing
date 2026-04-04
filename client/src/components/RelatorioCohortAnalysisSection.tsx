import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart3, TrendingUp, Plus, Trash2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

type CohortData = {
  id: number;
  cohort: string;
  m0: number;
  m1: number;
  m2: number;
  m3: number;
  m4: number;
  m5: number;
  m6: number;
  ltv: number;
};

const getRetencaoColor = (valor: number) => {
  if (valor >= 90) return 'bg-green-100 text-green-800';
  if (valor >= 80) return 'bg-green-50 text-green-700';
  if (valor >= 70) return 'bg-yellow-50 text-yellow-700';
  if (valor >= 60) return 'bg-orange-50 text-orange-700';
  return 'bg-red-50 text-red-700';
};

const COHORT_GUIDE = [
  { titulo: 'M0 = 100%', descricao: 'Todos os clientes do mês de entrada' },
  { titulo: 'M1–M6', descricao: '% que realizou outra compra nos meses seguintes' },
  { titulo: 'LTV', descricao: 'Lifetime Value médio desse cohort até o momento' },
  { titulo: 'Retenção saudável', descricao: 'M3 > 70% e M6 > 60% são indicadores positivos para moda' },
];

export function RelatorioCohortAnalysisSection() {
  const [cohorts, setCohorts] = useState<CohortData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cohort: '', m1: '', m2: '', m3: '', m4: '', m5: '', m6: '', ltv: '' });
  const nextId = cohorts.length > 0 ? Math.max(...cohorts.map(c => c.id)) + 1 : 1;

  const adicionar = () => {
    if (!form.cohort) { toast.error('Informe o nome do cohort (ex: Jan 2026)'); return; }
    setCohorts(prev => [...prev, {
      id: nextId,
      cohort: form.cohort,
      m0: 100,
      m1: parseFloat(form.m1) || 0,
      m2: parseFloat(form.m2) || 0,
      m3: parseFloat(form.m3) || 0,
      m4: parseFloat(form.m4) || 0,
      m5: parseFloat(form.m5) || 0,
      m6: parseFloat(form.m6) || 0,
      ltv: parseFloat(form.ltv) || 0,
    }]);
    setForm({ cohort: '', m1: '', m2: '', m3: '', m4: '', m5: '', m6: '', ltv: '' });
    setShowForm(false);
    toast.success('Cohort adicionado');
  };

  const remover = (id: number) => { setCohorts(prev => prev.filter(c => c.id !== id)); };

  const avgM6 = cohorts.length > 0 ? cohorts.reduce((s, c) => s + c.m6, 0) / cohorts.length : 0;
  const avgLTV = cohorts.length > 0 ? cohorts.reduce((s, c) => s + c.ltv, 0) / cohorts.length : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Cohort Analysis</h2>
        <p className="text-slate-500 text-sm mt-1">Segmente clientes por data de primeira compra para medir retenção</p>
      </div>

      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Cohort analysis automático requer integração com <strong>Bling ERP</strong> (histórico de pedidos por cliente).
            Registre abaixo os dados de retenção por cohort extraídos manualmente do Bling.
          </p>
        </CardContent>
      </Card>

      {/* Summary KPIs */}
      {cohorts.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500">Cohorts registrados</p>
              <p className="text-2xl font-bold text-slate-900">{cohorts.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500">Retenção M6 média</p>
              <p className={`text-2xl font-bold ${avgM6 >= 70 ? 'text-green-700' : avgM6 >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
                {avgM6.toFixed(1)}%
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500">LTV médio</p>
              <p className="text-2xl font-bold text-slate-900">
                {avgLTV > 0 ? `R$ ${avgLTV.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}` : '—'}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Cohort Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 className="w-4 h-4" style={{ color: '#8B2635' }} />
              Tabela de retenção por cohort
            </CardTitle>
            <Button size="sm" onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#8B2635' }} className="text-white">
              <Plus className="w-3.5 h-3.5 mr-1.5" />Adicionar cohort
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-4 p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-700 block mb-1">Cohort (ex: Jan 2026)</label>
                  <Input placeholder="Jan 2026" value={form.cohort} onChange={e => setForm(f => ({ ...f, cohort: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">LTV médio (R$)</label>
                  <Input type="number" placeholder="1800" value={form.ltv} onChange={e => setForm(f => ({ ...f, ltv: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                {['m1', 'm2', 'm3', 'm4', 'm5', 'm6'].map((m, idx) => (
                  <div key={m}>
                    <label className="text-xs font-medium text-slate-700 block mb-1">M{idx + 1} (%)</label>
                    <Input type="number" min="0" max="100" placeholder="—"
                      value={form[m as keyof typeof form]}
                      onChange={e => setForm(f => ({ ...f, [m]: e.target.value }))} />
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

          {cohorts.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <BarChart3 className="w-10 h-10 mx-auto" />
              <p className="text-sm">Nenhum cohort registrado.</p>
              <p className="text-xs">Extraia dados de retenção do Bling e adicione os cohorts mensais.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs text-slate-500">
                    <th className="text-left py-2 font-medium">Cohort</th>
                    {['M0', 'M1', 'M2', 'M3', 'M4', 'M5', 'M6'].map(m => (
                      <th key={m} className="text-center py-2 px-1 font-medium">{m}</th>
                    ))}
                    <th className="text-right py-2 font-medium">LTV</th>
                    <th className="py-2 w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {cohorts.map(c => (
                    <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50">
                      <td className="py-2 font-medium text-slate-900">{c.cohort}</td>
                      <td className={`text-center py-2 px-1 text-xs font-semibold ${getRetencaoColor(100)}`}>100%</td>
                      {[c.m1, c.m2, c.m3, c.m4, c.m5, c.m6].map((v, idx) => (
                        <td key={idx} className={`text-center py-2 px-1 text-xs font-semibold ${v > 0 ? getRetencaoColor(v) : 'text-slate-300'}`}>
                          {v > 0 ? `${v}%` : '—'}
                        </td>
                      ))}
                      <td className="text-right py-2 text-slate-900 font-medium">
                        {c.ltv > 0 ? `R$ ${c.ltv.toLocaleString('pt-BR')}` : '—'}
                      </td>
                      <td className="py-2 pl-2">
                        <button onClick={() => remover(c.id)} className="text-slate-300 hover:text-red-500 transition-colors">
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

      {/* Guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" style={{ color: '#8B2635' }} />
            Como interpretar cohort analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {COHORT_GUIDE.map((item, idx) => (
            <div key={idx} className="p-3 border border-slate-200 rounded-lg">
              <p className="text-sm font-semibold text-slate-900">{item.titulo}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.descricao}</p>
            </div>
          ))}
          <p className="text-xs text-slate-400 pt-2">
            Para calcular: no Bling, exporte pedidos por cliente e cliente por mês de primeira compra.
            Calcule quantos de cada cohort fizeram pedido nos meses M1–M6.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
