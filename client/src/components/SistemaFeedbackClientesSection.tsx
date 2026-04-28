import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageSquare, Star, TrendingUp, BarChart3, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Feedback {
  id: string;
  cliente: string;
  persona: string;
  avaliacao: number;
  sentimento: 'positivo' | 'neutro' | 'negativo';
  comentario: string;
  data: string;
  produto: string;
}

const PERSONAS = ['Carol', 'Renata', 'Vanessa', 'Luiza'];

const sentimentoFromAvaliacao = (av: number): Feedback['sentimento'] =>
  av >= 4 ? 'positivo' : av === 3 ? 'neutro' : 'negativo';

export function SistemaFeedbackClientesSection() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ cliente: '', persona: 'Carol', avaliacao: '5', comentario: '', produto: '' });

  const adicionar = () => {
    if (!form.cliente) { toast.error('Informe o nome do cliente'); return; }
    const av = parseInt(form.avaliacao) || 5;
    const id = String(Date.now());
    setFeedbacks(prev => [...prev, {
      id,
      cliente: form.cliente,
      persona: form.persona,
      avaliacao: av,
      sentimento: sentimentoFromAvaliacao(av),
      comentario: form.comentario,
      data: 'agora',
      produto: form.produto || '—',
    }]);
    setForm({ cliente: '', persona: 'Carol', avaliacao: '5', comentario: '', produto: '' });
    setShowForm(false);
    toast.success('Feedback adicionado');
  };

  const remover = (id: string) => { setFeedbacks(prev => prev.filter(f => f.id !== id)); };

  const total = feedbacks.length;
  const satisfacao = total > 0
    ? feedbacks.reduce((s, f) => s + f.avaliacao, 0) / total : 0;
  const promotores = feedbacks.filter(f => f.avaliacao >= 4).length;
  const detratores = feedbacks.filter(f => f.avaliacao <= 2).length;
  const nps = total > 0 ? Math.round(((promotores - detratores) / total) * 100) : null;

  const countBySentiment = (tipo: Feedback['sentimento']) => feedbacks.filter(f => f.sentimento === tipo).length;
  const metricas = [
    { tipo: 'positivo' as const, cor: 'bg-green-500', icone: '😊' },
    { tipo: 'neutro' as const, cor: 'bg-yellow-500', icone: '😐' },
    { tipo: 'negativo' as const, cor: 'bg-red-500', icone: '😞' },
  ].map(m => ({
    ...m,
    percentual: total > 0 ? Math.round((countBySentiment(m.tipo) / total) * 100) : 0,
  }));

  const feedbacksPorPersona = PERSONAS.reduce((acc, p) => {
    const grupo = feedbacks.filter(f => f.persona === p);
    const media = grupo.length > 0 ? grupo.reduce((s, f) => s + f.avaliacao, 0) / grupo.length : 0;
    const satisfacaoPercent = grupo.length > 0
      ? Math.round((grupo.filter(f => f.sentimento === 'positivo').length / grupo.length) * 100) : 0;
    acc[p] = { media: parseFloat(media.toFixed(1)), total: grupo.length, satisfacao: satisfacaoPercent };
    return acc;
  }, {} as Record<string, { media: number; total: number; satisfacao: number }>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Feedback de Clientes</h2>
          <p className="text-slate-500 text-sm mt-1">Análise de sentimento e satisfação por persona</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#6B1D28' }} className="text-white" size="sm">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Novo Feedback
        </Button>
      </div>

      {/* KPIs Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">NPS</p>
            <p className="text-2xl font-bold text-slate-900">{nps !== null ? nps : '—'}</p>
            {nps !== null && <p className="text-xs text-slate-400 mt-1">{nps >= 50 ? 'Excelente' : nps >= 0 ? 'Bom' : 'Atenção'}</p>}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Satisfação Média</p>
            <p className="text-2xl font-bold text-slate-900">{satisfacao > 0 ? `${satisfacao.toFixed(1)}/5` : '—'}</p>
            {satisfacao > 0 && (
              <div className="flex gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3 h-3 ${i < Math.floor(satisfacao) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Total de Feedbacks</p>
            <p className="text-2xl font-bold text-slate-900">{total}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Feedbacks Positivos</p>
            <p className="text-2xl font-bold text-green-700">{total > 0 ? `${metricas[0].percentual}%` : '—'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Feedbacks list + form */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-4 h-4" style={{ color: '#6B1D28' }} />
            Feedbacks Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showForm && (
            <div className="mb-4 p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Nome do cliente</label>
                  <Input placeholder="Ex: Maria S." value={form.cliente} onChange={e => setForm(f => ({ ...f, cliente: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Produto</label>
                  <Input placeholder="Ex: Pijama Floral" value={form.produto} onChange={e => setForm(f => ({ ...f, produto: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Persona</label>
                  <select value={form.persona} onChange={e => setForm(f => ({ ...f, persona: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm">
                    {PERSONAS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Avaliação (1–5)</label>
                  <select value={form.avaliacao} onChange={e => setForm(f => ({ ...f, avaliacao: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm">
                    {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{'⭐'.repeat(n)} ({n})</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs font-medium text-slate-700 block mb-1">Comentário</label>
                  <Input placeholder="Comentário do cliente..." value={form.comentario} onChange={e => setForm(f => ({ ...f, comentario: e.target.value }))} />
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

          {feedbacks.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <MessageSquare className="w-10 h-10 mx-auto" />
              <p className="text-sm">Nenhum feedback cadastrado.</p>
              <p className="text-xs">Adicione feedbacks de clientes reais do Bling ERP ou WhatsApp.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedbacks.map((feedback) => (
                <div key={feedback.id} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="font-semibold text-sm text-slate-900">{feedback.cliente}</div>
                      <div className="text-xs text-slate-400">{feedback.data}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{feedback.persona}</Badge>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < feedback.avaliacao ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                        ))}
                      </div>
                      <button onClick={() => remover(feedback.id)} className="text-slate-300 hover:text-red-500 transition-colors ml-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {feedback.comentario && <p className="text-sm text-slate-700 mb-2">{feedback.comentario}</p>}
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">{feedback.produto}</Badge>
                    <Badge className={`text-xs ${
                      feedback.sentimento === 'positivo' ? 'bg-green-100 text-green-800' :
                      feedback.sentimento === 'neutro' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {feedback.sentimento === 'positivo' ? '😊 Positivo' : feedback.sentimento === 'neutro' ? '😐 Neutro' : '😞 Negativo'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Análise de Sentimento — shown when data exists */}
      {total > 0 && (
        <>
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Análise de Sentimento</CardTitle>
              <CardDescription className="text-xs">Distribuição dos feedbacks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {metricas.map((metrica) => (
                  <div key={metrica.tipo} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        <span>{metrica.icone}</span>
                        <span className="capitalize text-slate-700">{metrica.tipo}</span>
                      </span>
                      <span className="font-bold text-slate-900">{metrica.percentual}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className={`h-2 rounded-full ${metrica.cor}`} style={{ width: `${metrica.percentual}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Satisfação por Persona</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {PERSONAS.map(persona => {
                  const dados = feedbacksPorPersona[persona];
                  if (dados.total === 0) return null;
                  return (
                    <div key={persona} className="p-3 border border-slate-200 rounded-lg">
                      <p className="font-semibold text-sm text-slate-900 mb-2">{persona}</p>
                      <p className="text-xs text-slate-500">Média</p>
                      <p className="text-xl font-bold text-slate-900">{dados.media}</p>
                      <p className="text-xs text-slate-500 mt-1">{dados.total} feedback(s)</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Tips */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="w-4 h-4" style={{ color: '#6B1D28' }} />
            Melhores Práticas de Feedback
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            { icon: <BarChart3 className="w-4 h-4 text-blue-500 flex-shrink-0" />, text: 'NPS ≥ 50 é excelente. Entre 0–49 é bom. Abaixo de 0 precisa atenção imediata.' },
            { icon: <Star className="w-4 h-4 text-yellow-500 flex-shrink-0" />, text: 'Meta de satisfação: ≥ 4.2/5. Avaliações 1–2 estrelas devem receber resposta em menos de 24h.' },
            { icon: <MessageSquare className="w-4 h-4 text-green-500 flex-shrink-0" />, text: 'Padrões de problema em feedbacks negativos indicam ação: qualidade do produto, prazo de entrega, embalagem.' },
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
              {tip.icon}
              <p className="text-slate-700">{tip.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
