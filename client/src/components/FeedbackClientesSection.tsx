import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, ThumbsUp, TrendingUp, Send, Star, BarChart3 } from "lucide-react";
import { toast } from "sonner";

interface Feedback {
  id: number;
  persona: string;
  roteiro: string;
  tipo: string;
  conversoes: number;
  engajamento: string;
  satisfacao: number;
  comentario: string;
  data: string;
}

const PERSONAS = ["Carol (Renda Extra)", "Renata (Lojista)", "Vanessa (Compra Coletiva)", "Luiza (Trendsetter)"];
const TIPOS = ["Story", "Reels", "TikTok", "Ads", "Post", "Live"];

export default function FeedbackClientesSection() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [selectedFeedback, setSelectedFeedback] = useState<number | null>(null);
  const [form, setForm] = useState({
    persona: PERSONAS[0], roteiro: '', tipo: 'Reels',
    conversoes: '', engajamento: '', satisfacao: 5, comentario: '',
  });

  const enviarFeedback = () => {
    if (!form.roteiro.trim()) { toast.error('Informe o roteiro avaliado.'); return; }
    const novo: Feedback = {
      id: Date.now(),
      persona: form.persona,
      roteiro: form.roteiro,
      tipo: form.tipo,
      conversoes: Number(form.conversoes) || 0,
      engajamento: form.engajamento ? `${form.engajamento}%` : '—',
      satisfacao: form.satisfacao,
      comentario: form.comentario,
      data: new Date().toISOString().split('T')[0],
    };
    setFeedbacks(prev => [novo, ...prev]);
    setForm({ persona: PERSONAS[0], roteiro: '', tipo: 'Reels', conversoes: '', engajamento: '', satisfacao: 5, comentario: '' });
    toast.success('Feedback registrado com sucesso.');
  };

  const remover = (id: number) => {
    setFeedbacks(prev => prev.filter(f => f.id !== id));
    setSelectedFeedback(null);
  };

  const avgSatisfacao = feedbacks.length > 0
    ? (feedbacks.reduce((a, f) => a + f.satisfacao, 0) / feedbacks.length).toFixed(1)
    : '—';
  const totalConversoes = feedbacks.reduce((a, f) => a + f.conversoes, 0);

  // Melhor persona por conversões médias
  const melhorPersona = (() => {
    if (feedbacks.length === 0) return null;
    const por = PERSONAS.map(p => {
      const fbs = feedbacks.filter(f => f.persona === p);
      if (fbs.length === 0) return { persona: p, avg: 0 };
      return { persona: p, avg: fbs.reduce((a, f) => a + f.conversoes, 0) / fbs.length };
    }).filter(p => p.avg > 0);
    if (por.length === 0) return null;
    return por.reduce((best, p) => p.avg > best.avg ? p : best);
  })();

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            Sistema de Feedback de Roteiros
          </CardTitle>
          <CardDescription>
            Registre o desempenho real de cada roteiro/persona — conversões, engajamento e observações. Identifique o que funciona melhor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estatísticas reais */}
          <div className="grid md:grid-cols-3 gap-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Total Conversões</p>
              <p className="text-2xl font-bold text-blue-600">{totalConversoes > 0 ? totalConversoes : '—'}</p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Satisfação Média</p>
              <p className="text-2xl font-bold text-purple-600">{avgSatisfacao}</p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Feedbacks</p>
              <p className="text-2xl font-bold text-green-600">{feedbacks.length}</p>
            </div>
          </div>

          {melhorPersona && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
              <span className="font-semibold text-slate-900">Melhor Persona:</span>{' '}
              <span className="text-yellow-700">{melhorPersona.persona}</span>{' '}
              <span className="text-slate-500">({melhorPersona.avg.toFixed(0)} conversões médias)</span>
            </div>
          )}

          {/* Feedbacks */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Feedbacks Registrados</h3>
            {feedbacks.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-300 rounded-lg">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-slate-500 text-sm">Nenhum feedback registrado ainda.</p>
                <p className="text-xs text-slate-400 mt-1">Use o formulário abaixo para avaliar roteiros.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {feedbacks.map(feedback => (
                  <Card
                    key={feedback.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedFeedback(selectedFeedback === feedback.id ? null : feedback.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-sm">{feedback.persona} — {feedback.roteiro}</h4>
                          <Badge variant="outline" className="text-xs">{feedback.tipo}</Badge>
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < Math.floor(feedback.satisfacao) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs mb-2">
                          {feedback.conversoes > 0 && (
                            <div className="bg-green-50 px-2 py-1 rounded">
                              <span className="text-slate-600">Conversões:</span>
                              <span className="font-semibold text-green-600 ml-1">{feedback.conversoes}</span>
                            </div>
                          )}
                          {feedback.engajamento !== '—' && (
                            <div className="bg-blue-50 px-2 py-1 rounded">
                              <span className="text-slate-600">Engajamento:</span>
                              <span className="font-semibold text-blue-600 ml-1">{feedback.engajamento}</span>
                            </div>
                          )}
                          <div className="bg-slate-100 px-2 py-1 rounded text-slate-600">📅 {feedback.data}</div>
                        </div>

                        {selectedFeedback === feedback.id && feedback.comentario && (
                          <div className="mt-3 pt-3 border-t border-slate-200">
                            <p className="text-sm text-slate-700 mb-3">
                              <strong>Comentário:</strong> {feedback.comentario}
                            </p>
                          </div>
                        )}
                      </div>
                      {selectedFeedback === feedback.id && (
                        <Button size="sm" variant="outline" className="text-red-600 text-xs" onClick={e => { e.stopPropagation(); remover(feedback.id); }}>
                          Remover
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Formulário */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Registrar Feedback</h3>
            <Card className="p-4 bg-slate-50">
              <div className="space-y-3">
                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Persona</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" value={form.persona} onChange={e => setForm(f => ({ ...f, persona: e.target.value }))}>
                      {PERSONAS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Tipo de Conteúdo</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                      {TIPOS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Satisfação (1-5)</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" value={form.satisfacao} onChange={e => setForm(f => ({ ...f, satisfacao: Number(e.target.value) }))}>
                      {[5, 4, 3, 2, 1].map(n => <option key={n} value={n}>{n} ⭐</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Roteiro / Título do Vídeo</label>
                  <input type="text" placeholder="Ex: Análise Rápida de Qualidade" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" value={form.roteiro} onChange={e => setForm(f => ({ ...f, roteiro: e.target.value }))} />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Conversões reais (opcional)</label>
                    <input type="number" min="0" placeholder="Ex: 150" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" value={form.conversoes} onChange={e => setForm(f => ({ ...f, conversoes: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Engajamento % (opcional)</label>
                    <input type="number" min="0" step="0.1" placeholder="Ex: 8.5" className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm" value={form.engajamento} onChange={e => setForm(f => ({ ...f, engajamento: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1">Comentário (opcional)</label>
                  <textarea
                    placeholder="Observações sobre performance, o que funcionou, o que melhorar..."
                    value={form.comentario}
                    onChange={e => setForm(f => ({ ...f, comentario: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm h-20"
                  />
                </div>
                <Button onClick={enviarFeedback} className="w-full gap-2 bg-purple-600 hover:bg-purple-700">
                  <Send className="w-4 h-4" />
                  Registrar Feedback
                </Button>
              </div>
            </Card>
          </div>

          {/* Comparação de personas (derivada de dados reais) */}
          {feedbacks.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-3">Comparação de Personas</h3>
              <div className="space-y-2">
                {PERSONAS.map(persona => {
                  const pData = feedbacks.filter(f => f.persona === persona);
                  if (pData.length === 0) return null;
                  const avgConv = (pData.reduce((a, f) => a + f.conversoes, 0) / pData.length).toFixed(0);
                  const avgEng = pData.filter(f => f.engajamento !== '—').map(f => parseFloat(f.engajamento));
                  const avgEngStr = avgEng.length > 0 ? `${(avgEng.reduce((a, b) => a + b, 0) / avgEng.length).toFixed(1)}%` : '—';
                  return (
                    <Card key={persona} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-sm">{persona}</h4>
                          <p className="text-xs text-slate-600">{pData.length} vídeo(s) · {avgConv} conversões médias · {avgEngStr} engajamento</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-slate-900">{avgConv}</div>
                          <div className="text-xs text-slate-600">conversões</div>
                        </div>
                      </div>
                    </Card>
                  );
                }).filter(Boolean)}
              </div>
            </div>
          )}

          {/* Dicas */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3">💡 Como Usar o Feedback para Otimizar</h4>
            <ul className="text-sm space-y-1 text-slate-700">
              <li>✅ Registre conversões reais após cada publicação (48-72h depois)</li>
              <li>✅ Compare personas para identificar qual gera mais resultado</li>
              <li>✅ Replique roteiros com satisfação ≥ 4 em variações diferentes</li>
              <li>✅ Identifique padrões nos comentários dos feedbacks mais altos</li>
              <li>✅ Use engajamento + conversões juntos — alto engajamento sem conversão indica problema de CTA</li>
            </ul>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
