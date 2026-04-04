import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Calendar, Clock, Settings, Plus, Trash2, Send } from 'lucide-react';
import { toast } from 'sonner';

type Postagem = {
  id: number;
  data: string;
  tipo: string;
  produto: string;
  preco: string;
  descricao: string;
  link: string;
};

const TIPOS = ['Lançamento', 'Retorno ao Estoque', 'Promoção', 'Oferta VIP'];

export default function AutomacaoWhatsAppVIPSection() {
  const [whatsappToken, setWhatsappToken] = useState('');
  const [grupoVIP, setGrupoVIP] = useState('');
  const [horarioDisparo, setHorarioDisparo] = useState('10:00');
  const [diasDisparo, setDiasDisparo] = useState(['terça', 'quinta']);
  const [postagens, setPostagens] = useState<Postagem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [novaPost, setNovaPost] = useState({ data: '', tipo: 'Lançamento', produto: '', preco: '', descricao: '', link: '' });
  const nextId = postagens.length > 0 ? Math.max(...postagens.map(p => p.id)) + 1 : 1;

  const adicionarPost = () => {
    if (!novaPost.data || !novaPost.produto || !novaPost.descricao) {
      toast.error('Preencha data, produto e descrição');
      return;
    }
    setPostagens(prev => [...prev, { ...novaPost, id: nextId }]);
    setNovaPost({ data: '', tipo: 'Lançamento', produto: '', preco: '', descricao: '', link: '' });
    setShowForm(false);
    toast.success('Postagem adicionada');
  };

  const removerPost = (id: number) => {
    setPostagens(prev => prev.filter(p => p.id !== id));
    toast.success('Postagem removida');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#A63D4A' }}>Automação WhatsApp VIP</h2>
        <p className="text-slate-500 text-sm mt-1">
          Sistema de postagens automáticas para o grupo VIP no WhatsApp. Configure e agende postagens de produtos.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Agendadas</p>
            <p className="text-2xl font-bold" style={{ color: '#A63D4A' }}>{postagens.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Próximo disparo</p>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              {postagens.length > 0
                ? new Date(postagens.sort((a, b) => a.data.localeCompare(b.data))[0].data).toLocaleDateString('pt-BR')
                : '—'}
            </p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Horário</p>
            <p className="text-2xl font-bold text-slate-700">{horarioDisparo}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Dias</p>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              {diasDisparo.length > 0 ? diasDisparo.join(', ') : '—'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Config */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings className="w-4 h-4" style={{ color: '#A63D4A' }} />
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">Token WhatsApp Business API</label>
              <Input value={whatsappToken} onChange={e => setWhatsappToken(e.target.value)}
                placeholder="EAAxxxxxxxxxx..." />
              <p className="text-xs text-slate-400 mt-1">Gere em developers.facebook.com/products/whatsapp</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">ID do Grupo VIP</label>
              <Input value={grupoVIP} onChange={e => setGrupoVIP(e.target.value)}
                placeholder="5500000000000-000000@g.us" />
              <p className="text-xs text-slate-400 mt-1">ID do grupo WhatsApp (via Baileys ou API)</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                <Clock className="w-3.5 h-3.5 inline mr-1" />Horário de disparo
              </label>
              <Input type="time" value={horarioDisparo} onChange={e => setHorarioDisparo(e.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 block mb-1">
                <Calendar className="w-3.5 h-3.5 inline mr-1" />Dias de disparo
              </label>
              <div className="flex flex-wrap gap-2">
                {['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'].map(dia => (
                  <button key={dia} onClick={() => {
                    setDiasDisparo(prev => prev.includes(dia) ? prev.filter(d => d !== dia) : [...prev, dia]);
                  }}
                    className={`px-3 py-1.5 rounded text-xs font-medium transition-colors border ${
                      diasDisparo.includes(dia)
                        ? 'text-white border-transparent'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                    }`}
                    style={diasDisparo.includes(dia) ? { backgroundColor: '#A63D4A', borderColor: '#A63D4A' } : {}}>
                    {dia.charAt(0).toUpperCase() + dia.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Postagens */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageCircle className="w-4 h-4" style={{ color: '#A63D4A' }} />
              Postagens agendadas
            </CardTitle>
            <Button size="sm" onClick={() => setShowForm(!showForm)} style={{ backgroundColor: '#A63D4A' }} className="text-white">
              <Plus className="w-3.5 h-3.5 mr-1.5" />Nova
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Form */}
          {showForm && (
            <div className="mb-4 p-4 border-2 border-amber-200 rounded-lg bg-amber-50 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Data</label>
                  <Input type="date" value={novaPost.data} onChange={e => setNovaPost(p => ({ ...p, data: e.target.value }))} />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Tipo</label>
                  <select value={novaPost.tipo} onChange={e => setNovaPost(p => ({ ...p, tipo: e.target.value }))}
                    className="w-full border border-slate-200 rounded px-3 py-2 text-sm">
                    {TIPOS.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Preço</label>
                  <Input placeholder="R$ 89,90" value={novaPost.preco} onChange={e => setNovaPost(p => ({ ...p, preco: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Produto</label>
                <Input placeholder="Ex: Pijama Carol - Edição Inverno" value={novaPost.produto}
                  onChange={e => setNovaPost(p => ({ ...p, produto: e.target.value }))} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Mensagem</label>
                <Textarea placeholder="Texto que Carol vai enviar no grupo VIP..." value={novaPost.descricao}
                  onChange={e => setNovaPost(p => ({ ...p, descricao: e.target.value }))} rows={3} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700 block mb-1">Link do produto</label>
                <Input placeholder="https://feminnita.com.br/produto/..." value={novaPost.link}
                  onChange={e => setNovaPost(p => ({ ...p, link: e.target.value }))} />
              </div>
              <div className="flex gap-2">
                <Button onClick={adicionarPost} size="sm" style={{ backgroundColor: '#A63D4A' }} className="text-white">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />Adicionar
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancelar</Button>
              </div>
            </div>
          )}

          {postagens.length === 0 ? (
            <div className="text-center py-10 text-slate-400 space-y-2">
              <Send className="w-10 h-10 mx-auto" />
              <p className="text-sm">Nenhuma postagem agendada ainda.</p>
              <p className="text-xs">Clique em <strong>Nova</strong> para adicionar.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {postagens
                .sort((a, b) => a.data.localeCompare(b.data))
                .map(post => (
                  <div key={post.id} className="border border-amber-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-sm" style={{ color: '#A63D4A' }}>{post.produto}</h3>
                          <Badge variant="secondary" className="text-xs">{post.tipo}</Badge>
                        </div>
                        <div className="flex gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(post.data + 'T00:00:00').toLocaleDateString('pt-BR')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />{horarioDisparo}
                          </span>
                          {post.preco && <span className="font-medium" style={{ color: '#A63D4A' }}>{post.preco}</span>}
                        </div>
                      </div>
                      <button onClick={() => removerPost(post.id)}
                        className="text-slate-300 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-sm text-slate-700">{post.descricao}</p>
                    {post.link && (
                      <a href={post.link} target="_blank" rel="noopener noreferrer"
                        className="text-xs text-blue-500 hover:underline flex items-center gap-1 mt-1.5">
                        <Send className="w-3 h-3" />Ver produto
                      </a>
                    )}
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Como funciona */}
      <Card className="border-0 shadow-sm bg-amber-50 border border-amber-200">
        <CardHeader>
          <CardTitle className="text-sm">📋 Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-slate-700">
          <p><strong>1. Monitoramento:</strong> Carol monitora Bling para detectar lançamentos, retornos e promoções</p>
          <p><strong>2. Seleção:</strong> O cérebro da Carol escolhe qual produto postar baseado em tendências e estoque</p>
          <p><strong>3. Geração:</strong> Carol gera texto personalizado com sua voz + emoji + link</p>
          <p><strong>4. Disparo:</strong> Postagem enviada automaticamente nos dias/horário configurados para o grupo VIP</p>
          <p><strong>5. Análise:</strong> Rastreia engajamento, cliques e vendas geradas</p>
        </CardContent>
      </Card>
    </div>
  );
}
