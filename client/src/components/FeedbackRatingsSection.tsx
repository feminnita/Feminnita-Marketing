import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Star, MessageSquare, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type Template = {
  id: number;
  nome: string;
  tipo: string;
  rating: number;
  votos: number;
  feedback: { usuario: string; rating: number; texto: string; data: string }[];
};

const TIPOS = ['story', 'reels', 'tiktok', 'ads', 'email', 'outro'];

export default function FeedbackRatingsSection() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ nome: '', tipo: 'story' });
  const [novoFeedback, setNovoFeedback] = useState('');
  const [novaRating, setNovaRating] = useState(5);
  const nextId = templates.length > 0 ? Math.max(...templates.map(t => t.id)) + 1 : 1;

  const adicionarTemplate = () => {
    if (!newTemplate.nome) { toast.error('Informe o nome do template'); return; }
    const t: Template = { id: nextId, nome: newTemplate.nome, tipo: newTemplate.tipo, rating: 0, votos: 0, feedback: [] };
    setTemplates(prev => [...prev, t]);
    setSelectedId(t.id);
    setNewTemplate({ nome: '', tipo: 'story' });
    setShowAddTemplate(false);
    toast.success('Template adicionado');
  };

  const removerTemplate = (id: number) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    if (selectedId === id) setSelectedId(null);
    toast.success('Removido');
  };

  const adicionarFeedback = () => {
    if (!novoFeedback.trim() || selectedId === null) return;
    setTemplates(prev => prev.map(t => {
      if (t.id !== selectedId) return t;
      const newVotos = t.votos + 1;
      const newRating = t.votos === 0 ? novaRating : ((t.rating * t.votos) + novaRating) / newVotos;
      return {
        ...t,
        votos: newVotos,
        rating: newRating,
        feedback: [
          { usuario: 'Você', rating: novaRating, texto: novoFeedback, data: new Date().toISOString().split('T')[0] },
          ...t.feedback,
        ],
      };
    }));
    setNovoFeedback('');
    setNovaRating(5);
    toast.success('Feedback enviado');
  };

  const templateAtual = templates.find(t => t.id === selectedId) ?? null;
  const topTemplates = [...templates].sort((a, b) => b.rating - a.rating).slice(0, 3);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Sistema de Feedback e Ratings</h2>
        <p className="text-slate-500 text-sm mt-1">Avalie e acompanhe a performance dos seus templates de conteúdo</p>
      </div>

      {/* Stats */}
      {templates.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500">Templates</p>
              <p className="text-2xl font-bold text-slate-900">{templates.length}</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500">Rating médio</p>
              <p className="text-2xl font-bold text-slate-900">
                {templates.filter(t => t.votos > 0).length > 0
                  ? (templates.filter(t => t.votos > 0).reduce((a, t) => a + t.rating, 0) / templates.filter(t => t.votos > 0).length).toFixed(1)
                  : '—'}
              </p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-5 pb-5">
              <p className="text-xs text-slate-500">Total de votos</p>
              <p className="text-2xl font-bold text-slate-900">{templates.reduce((a, t) => a + t.votos, 0)}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Template list */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Star className="w-4 h-4" style={{ color: '#8B2635' }} />
              Templates
            </CardTitle>
            <Button size="sm" onClick={() => setShowAddTemplate(!showAddTemplate)} style={{ backgroundColor: '#8B2635' }} className="text-white">
              <Plus className="w-3.5 h-3.5 mr-1.5" />Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {showAddTemplate && (
            <div className="mb-4 p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Nome do template</label>
                  <Input placeholder="Ex: Story - Enquete" value={newTemplate.nome}
                    onChange={e => setNewTemplate(f => ({ ...f, nome: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Tipo</label>
                  <select value={newTemplate.tipo} onChange={e => setNewTemplate(f => ({ ...f, tipo: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm">
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={adicionarTemplate} size="sm" style={{ backgroundColor: '#8B2635' }} className="text-white">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />Adicionar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowAddTemplate(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {templates.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Star className="w-10 h-10 mx-auto" />
              <p className="text-sm">Nenhum template cadastrado.</p>
              <p className="text-xs">Adicione seus templates de conteúdo para avaliar e comparar performance.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {templates.map(t => (
                <div key={t.id}
                  className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition ${selectedId === t.id ? 'border-slate-400 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}
                  onClick={() => setSelectedId(t.id)}>
                  <div>
                    <p className="font-semibold text-sm text-slate-900">{t.nome}</p>
                    <Badge variant="secondary" className="text-xs mt-0.5">{t.tipo}</Badge>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-sm">{t.votos > 0 ? `⭐ ${t.rating.toFixed(1)}` : '—'}</p>
                      <p className="text-xs text-slate-400">{t.votos} votos</p>
                    </div>
                    <button onClick={e => { e.stopPropagation(); removerTemplate(t.id); }}
                      className="text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Top 3 */}
      {topTemplates.filter(t => t.votos > 0).length > 0 && (
        <Card className="border-0 shadow-sm border-l-4 border-yellow-400 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Star className="w-4 h-4 text-yellow-600" />
              Top {topTemplates.filter(t => t.votos > 0).length} melhor avaliados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {topTemplates.filter(t => t.votos > 0).map((t, idx) => (
              <div key={t.id} className="flex items-center justify-between p-3 bg-white rounded border border-yellow-200">
                <div>
                  <p className="font-semibold text-sm text-slate-900">#{idx + 1} {t.nome}</p>
                  <p className="text-xs text-slate-500">{t.votos} votos</p>
                </div>
                <p className="text-lg font-bold text-yellow-600">⭐ {t.rating.toFixed(1)}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Feedback form */}
      {templateAtual && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">{templateAtual.nome} — Feedback</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {templateAtual.votos > 0 && (
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg text-sm">
                <div>
                  <p className="text-xs text-slate-500 uppercase mb-1">Rating médio</p>
                  <p className="text-2xl font-bold">⭐ {templateAtual.rating.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase mb-1">Total de votos</p>
                  <p className="text-2xl font-bold">{templateAtual.votos}</p>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-semibold text-sm text-slate-900 mb-3">Enviar feedback</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Avaliação</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button key={star} onClick={() => setNovaRating(star)}
                        className={`text-3xl transition ${novaRating >= star ? 'text-yellow-400' : 'text-slate-300'}`}>★</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Comentário</label>
                  <Textarea placeholder="Compartilhe sua experiência com este template..."
                    value={novoFeedback} onChange={e => setNovoFeedback(e.target.value)} rows={3} className="resize-none" />
                </div>
                <Button onClick={adicionarFeedback} size="sm" style={{ backgroundColor: '#8B2635' }} className="text-white">
                  <MessageSquare className="w-3.5 h-3.5 mr-1.5" />Enviar feedback
                </Button>
              </div>
            </div>

            {templateAtual.feedback.length > 0 && (
              <div className="border-t border-slate-200 pt-4">
                <h4 className="font-semibold text-sm text-slate-900 mb-3">Feedbacks ({templateAtual.feedback.length})</h4>
                <div className="space-y-2">
                  {templateAtual.feedback.map((fb, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-1.5">
                        <div>
                          <p className="font-semibold text-sm text-slate-900">{fb.usuario}</p>
                          <p className="text-xs text-slate-400">{fb.data}</p>
                        </div>
                        <span className="text-yellow-400 text-sm">{'★'.repeat(fb.rating)}{'☆'.repeat(5 - fb.rating)}</span>
                      </div>
                      <p className="text-sm text-slate-700">{fb.texto}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
