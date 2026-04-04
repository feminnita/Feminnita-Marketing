import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Zap, Plus, Trash2, BarChart3, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type TesteAB = {
  id: number;
  nome: string;
  persona: string;
  tipo: string;
  status: 'ativo' | 'pausado' | 'finalizado';
  variacoes: string[];
  duracao: number;
  dataInicio: string;
  vencedor?: string;
};

const PERSONAS = ['Carol', 'Renata', 'Vanessa', 'Luiza'];
const TIPOS = ['Hook de Vídeo', 'Horário de Posting', 'Descrição de Produto', 'Imagem/Thumbnail', 'CTA', 'Título'];

export default function ModuloTesteABAvancadoSection() {
  const { data: campanhas = [] } = trpc.campaigns.listar.useQuery();
  const [testes, setTestes] = useState<TesteAB[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: '', persona: 'Carol', tipo: 'Hook de Vídeo', duracao: '14', varA: '', varB: '' });
  const nextId = testes.length > 0 ? Math.max(...testes.map(t => t.id)) + 1 : 1;

  const adicionar = () => {
    if (!form.nome || !form.varA || !form.varB) { toast.error('Preencha nome e pelo menos 2 variações'); return; }
    setTestes(prev => [...prev, {
      id: nextId,
      nome: form.nome,
      persona: form.persona,
      tipo: form.tipo,
      status: 'ativo',
      variacoes: [form.varA, form.varB].filter(Boolean),
      duracao: parseInt(form.duracao) || 14,
      dataInicio: new Date().toISOString().split('T')[0],
    }]);
    setForm({ nome: '', persona: 'Carol', tipo: 'Hook de Vídeo', duracao: '14', varA: '', varB: '' });
    setShowForm(false);
    toast.success('Teste A/B criado');
  };

  const remover = (id: number) => { setTestes(prev => prev.filter(t => t.id !== id)); toast.success('Removido'); };
  const setStatus = (id: number, status: TesteAB['status']) => setTestes(prev => prev.map(t => t.id === id ? { ...t, status } : t));
  const setVencedor = (id: number, v: string) => setTestes(prev => prev.map(t => t.id === id ? { ...t, vencedor: v, status: 'finalizado' } : t));

  const ativos = testes.filter(t => t.status === 'ativo').length;
  const finalizados = testes.filter(t => t.status === 'finalizado').length;

  // Campaign signal: CTR spread as proxy for A/B need
  const campanhasComCTR = (campanhas as any[]).filter((c: any) => c.performance?.ctr > 0);
  const minCTR = campanhasComCTR.length > 0 ? Math.min(...campanhasComCTR.map((c: any) => c.performance.ctr)) : 0;
  const maxCTR = campanhasComCTR.length > 0 ? Math.max(...campanhasComCTR.map((c: any) => c.performance.ctr)) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Módulo de Testes A/B</h2>
        <p className="text-slate-500 text-sm mt-1">Compare variações de conteúdo com significância estatística</p>
      </div>

      {campanhasComCTR.length > 1 && (maxCTR - minCTR) > 1 && (
        <Card className="border-0 shadow-sm border-l-4 border-blue-400 bg-blue-50">
          <CardContent className="pt-4 pb-4 flex gap-3 items-start">
            <BarChart3 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Suas campanhas têm CTR variando de <strong>{minCTR.toFixed(2)}%</strong> a <strong>{maxCTR.toFixed(2)}%</strong>.
              Testar variações de hook e criativo pode ajudar a identificar o que gera mais cliques.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Testes ativos</p>
            <p className="text-2xl font-bold text-green-700">{ativos}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Finalizados</p>
            <p className="text-2xl font-bold text-slate-900">{finalizados}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Total</p>
            <p className="text-2xl font-bold text-slate-900">{testes.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* List */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Zap className="w-4 h-4" style={{ color: '#8B2635' }} />
              Testes em andamento
            </CardTitle>
            <Button size="sm" onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#8B2635' }} className="text-white">
              <Plus className="w-3.5 h-3.5 mr-1.5" />Criar teste
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-4 p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-700 block mb-1">Nome do teste</label>
                  <Input placeholder="Ex: Teste de Hook - Carol" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Persona</label>
                  <select value={form.persona} onChange={e => setForm(f => ({ ...f, persona: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm">
                    {PERSONAS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Tipo de teste</label>
                  <select value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm">
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Variação A (controle)</label>
                  <Input placeholder='Ex: "Quanto ganhei vendendo pijamas"' value={form.varA} onChange={e => setForm(f => ({ ...f, varA: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Variação B (teste)</label>
                  <Input placeholder='Ex: "Como ganhei R$ 5K em 30 dias"' value={form.varB} onChange={e => setForm(f => ({ ...f, varB: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Duração (dias)</label>
                  <Input type="number" min="3" max="60" value={form.duracao} onChange={e => setForm(f => ({ ...f, duracao: e.target.value }))} />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={adicionar} size="sm" style={{ backgroundColor: '#8B2635' }} className="text-white">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />Criar teste
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {testes.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Zap className="w-10 h-10 mx-auto" />
              <p className="text-sm">Nenhum teste A/B criado.</p>
              <p className="text-xs">Crie testes para comparar hooks, horários, descrições e CTAs.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {testes.map(teste => (
                <div key={teste.id} className="border border-slate-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-slate-900">{teste.nome}</p>
                        <Badge variant="secondary" className="text-xs">{teste.persona}</Badge>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          teste.status === 'ativo' ? 'bg-green-100 text-green-700' :
                          teste.status === 'finalizado' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                        }`}>{teste.status}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{teste.tipo} • {teste.duracao} dias • Iniciado {teste.dataInicio}</p>
                    </div>
                    <button onClick={() => remover(teste.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1 mb-3">
                    {teste.variacoes.map((v, idx) => (
                      <div key={idx} className={`flex items-center justify-between text-xs px-2 py-1.5 rounded ${
                        teste.vencedor === v ? 'bg-green-100 text-green-800 font-semibold' : 'bg-slate-50 text-slate-700'
                      }`}>
                        <span><strong>{String.fromCharCode(65 + idx)}:</strong> "{v}"</span>
                        {teste.status === 'ativo' && (
                          <button onClick={() => setVencedor(teste.id, v)}
                            className="text-xs text-blue-600 hover:underline">Definir vencedor</button>
                        )}
                        {teste.vencedor === v && <span className="text-xs">✓ Vencedor</span>}
                      </div>
                    ))}
                  </div>
                  {teste.status === 'ativo' && (
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setStatus(teste.id, 'pausado')}>
                      Pausar
                    </Button>
                  )}
                  {teste.status === 'pausado' && (
                    <Button variant="outline" size="sm" className="text-xs" onClick={() => setStatus(teste.id, 'ativo')}>
                      Retomar
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* A/B best practices */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Boas práticas de testes A/B</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          <p><span className="font-semibold" style={{ color: '#8B2635' }}>1 variável por vez:</span> Teste apenas um elemento (hook, CTA, imagem) por vez para isolar o impacto</p>
          <p><span className="font-semibold" style={{ color: '#8B2635' }}>Amostra mínima:</span> Aguarde ao menos 500–1.000 impressões por variação antes de declarar vencedor</p>
          <p><span className="font-semibold" style={{ color: '#8B2635' }}>Duração mínima:</span> 7 dias para capturar variações de dia da semana</p>
          <p><span className="font-semibold" style={{ color: '#8B2635' }}>Confiança estatística:</span> Declare vencedor apenas com 90%+ de confiança (ferramentas: AB Testguide, VWO)</p>
          <p><span className="font-semibold" style={{ color: '#8B2635' }}>Prioridade:</span> Comece pelos hooks — são o maior driver de CTR em vídeos curtos</p>
        </CardContent>
      </Card>
    </div>
  );
}
