import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Link2, AlertCircle, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Evento {
  id: number;
  data: string;
  hora: string;
  tipo: string;
  titulo: string;
  persona: string;
  plataforma: string;
  roteiro: string;
  duracao: string;
  hashtags: string;
}

const INTEGRACOES = [
  { id: 1, nome: "Google Calendar", icon: "📅", descricao: "Sincronize postagens com seu calendário Google" },
  { id: 2, nome: "Notion", icon: "📝", descricao: "Organize conteúdo em banco de dados Notion" },
  { id: 3, nome: "Asana", icon: "✓", descricao: "Crie tarefas de conteúdo no Asana" },
];

const PERSONAS = ["Carol (Renda Extra)", "Renata (Lojista)", "Vanessa (Compra Coletiva)", "Luiza (Trendsetter)"];
const PLATAFORMAS = ["Instagram", "TikTok", "Facebook", "WhatsApp", "YouTube"];
const TIPOS = ["Story", "Reels", "Ads", "Post", "TikTok", "Live"];

export default function CalendarioConteudoSection() {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [eventoSelecionado, setEventoSelecionado] = useState<Evento | null>(null);
  const [novoEvento, setNovoEvento] = useState(false);
  const [form, setForm] = useState({
    data: '', hora: '09:00', tipo: 'Reels', titulo: '',
    persona: PERSONAS[0], plataforma: 'Instagram',
    roteiro: '', duracao: '', hashtags: '',
  });

  const adicionarEvento = () => {
    if (!form.titulo.trim() || !form.data) {
      toast.error('Preencha título e data.');
      return;
    }
    const novo: Evento = {
      id: Date.now(),
      data: form.data,
      hora: form.hora,
      tipo: form.tipo,
      titulo: form.titulo,
      persona: form.persona,
      plataforma: form.plataforma,
      roteiro: form.roteiro,
      duracao: form.duracao,
      hashtags: form.hashtags,
    };
    setEventos(prev => [...prev, novo].sort((a, b) => a.data.localeCompare(b.data) || a.hora.localeCompare(b.hora)));
    setForm({ data: '', hora: '09:00', tipo: 'Reels', titulo: '', persona: PERSONAS[0], plataforma: 'Instagram', roteiro: '', duracao: '', hashtags: '' });
    setNovoEvento(false);
    toast.success('Evento adicionado ao calendário.');
  };

  const removerEvento = (id: number) => {
    setEventos(prev => prev.filter(e => e.id !== id));
    setEventoSelecionado(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Calendário de Conteúdo</h2>
        <p className="text-slate-600">
          Planeje e organize posts por data, persona e plataforma. Conecte ferramentas externas para sincronização automática.
        </p>
      </div>

      {/* Aviso integrações */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-600" />
            Plataformas de Integração
          </CardTitle>
          <CardDescription>Conecte com ferramentas que sua equipe já usa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg mb-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-700">Integração com Google Calendar, Notion e Asana requer configuração de OAuth no backend. Por enquanto, adicione eventos manualmente abaixo.</p>
          </div>
          {INTEGRACOES.map((int) => (
            <div key={int.id} className="border border-slate-200 bg-white rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{int.icon}</span>
                  <div>
                    <h4 className="font-bold text-slate-900">{int.nome}</h4>
                    <p className="text-xs text-slate-600">{int.descricao}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary">⚪ Desconectado</Badge>
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => toast.error(`Integração com ${int.nome} requer configuração no backend. Entre em contato com o desenvolvedor.`)}
                  >
                    Conectar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Botão adicionar evento */}
      <Button onClick={() => setNovoEvento(!novoEvento)} className="w-full bg-purple-600 hover:bg-purple-700 gap-2" size="lg">
        <Plus className="w-5 h-5" />
        Adicionar Evento ao Calendário
      </Button>

      {/* Formulário */}
      {novoEvento && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-lg">Novo Evento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Título</label>
                <input
                  type="text" placeholder="Ex: Story - Renda Extra"
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.titulo}
                  onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Tipo</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                  {TIPOS.map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Data</label>
                <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Hora</label>
                <input type="time" className="w-full px-3 py-2 border border-slate-300 rounded" value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Plataforma</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded" value={form.plataforma} onChange={e => setForm(f => ({ ...f, plataforma: e.target.value }))}>
                  {PLATAFORMAS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Persona</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded" value={form.persona} onChange={e => setForm(f => ({ ...f, persona: e.target.value }))}>
                  {PERSONAS.map(p => <option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Roteiro (opcional)</label>
                <input type="text" placeholder="Ex: Compra Coletiva com Amigas" className="w-full px-3 py-2 border border-slate-300 rounded" value={form.roteiro} onChange={e => setForm(f => ({ ...f, roteiro: e.target.value }))} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Duração (opcional)</label>
                <input type="text" placeholder="Ex: 30 segundos" className="w-full px-3 py-2 border border-slate-300 rounded" value={form.duracao} onChange={e => setForm(f => ({ ...f, duracao: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Hashtags (opcional)</label>
                <input type="text" placeholder="#Feminnita #PijamaQualidade" className="w-full px-3 py-2 border border-slate-300 rounded" value={form.hashtags} onChange={e => setForm(f => ({ ...f, hashtags: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={adicionarEvento} className="flex-1 bg-green-600 hover:bg-green-700">Adicionar Evento</Button>
              <Button variant="outline" className="flex-1" onClick={() => setNovoEvento(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de eventos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Eventos Agendados
          </CardTitle>
          <CardDescription>Posts planejados por data e hora</CardDescription>
        </CardHeader>
        <CardContent>
          {eventos.length === 0 ? (
            <div className="py-10 text-center">
              <Calendar className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-slate-500">Nenhum evento adicionado ainda.</p>
              <p className="text-sm text-slate-400 mt-1">Use o botão acima para planejar posts no calendário.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {eventos.map((evt) => (
                <div key={evt.id} className="border border-slate-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 transition">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-slate-900">{evt.titulo}</h4>
                      <p className="text-xs text-slate-600">{evt.data} às {evt.hora}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-purple-600">{evt.tipo}</Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div><p className="text-slate-500">Persona</p><p className="font-semibold">{evt.persona}</p></div>
                    <div><p className="text-slate-500">Plataforma</p><p className="font-semibold">{evt.plataforma}</p></div>
                    {evt.duracao && <div><p className="text-slate-500">Duração</p><p className="font-semibold">{evt.duracao}</p></div>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEventoSelecionado(evt)}>Ver Detalhes</Button>
                    <Button size="sm" variant="outline" className="text-red-600" onClick={() => removerEvento(evt.id)}>Remover</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {eventoSelecionado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4 border-b">
              <div>
                <CardTitle className="text-2xl">{eventoSelecionado.titulo}</CardTitle>
                <CardDescription className="mt-1">{eventoSelecionado.tipo} • {eventoSelecionado.plataforma}</CardDescription>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setEventoSelecionado(null)} className="h-8 w-8 p-0">
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-slate-500 text-xs">Data e Hora</p><p className="font-medium">{eventoSelecionado.data} às {eventoSelecionado.hora}</p></div>
                <div><p className="text-slate-500 text-xs">Persona</p><p className="font-medium">{eventoSelecionado.persona}</p></div>
                {eventoSelecionado.roteiro && <div><p className="text-slate-500 text-xs">Roteiro</p><p className="font-medium">{eventoSelecionado.roteiro}</p></div>}
                {eventoSelecionado.duracao && <div><p className="text-slate-500 text-xs">Duração</p><p className="font-medium">{eventoSelecionado.duracao}</p></div>}
              </div>
              {eventoSelecionado.hashtags && (
                <div><p className="text-slate-500 text-xs mb-1">Hashtags</p><p className="text-sm">{eventoSelecionado.hashtags}</p></div>
              )}
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 text-red-600" onClick={() => removerEvento(eventoSelecionado.id)}>Remover</Button>
                <Button variant="outline" className="flex-1" onClick={() => setEventoSelecionado(null)}>Fechar</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader><CardTitle className="text-lg">Como Usar</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            "Adicione eventos com antecedência para visualizar a semana completa",
            "Use as integrações (quando configuradas) para sincronizar com Google Calendar",
            "Organize por persona para garantir diversidade de conteúdo",
            "Registre roteiro e hashtags para facilitar a produção",
            "Monitore frequência por plataforma para manter consistência",
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">✅ {dica}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
