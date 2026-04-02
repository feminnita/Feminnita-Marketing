import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, CheckCircle, AlertCircle, ExternalLink, Zap, Plus } from "lucide-react";
import { toast } from "sonner";

interface Post {
  id: number;
  titulo: string;
  plataforma: string;
  data: string;
  hora: string;
  status: "Agendado" | "Publicado" | "Erro";
  persona: string;
  tipo: string;
}

const PLATAFORMAS = [
  { id: "instagram", nome: "Instagram", logo: "📷", url: "https://business.instagram.com", features: ["Stories", "Reels", "Feed", "IGTV"] },
  { id: "tiktok", nome: "TikTok", logo: "🎵", url: "https://www.tiktok.com/creator", features: ["Vídeos", "Duetos", "Stitches"] },
  { id: "facebook", nome: "Facebook", logo: "f", url: "https://www.facebook.com/creator", features: ["Feed", "Reels", "Stories"] },
  { id: "youtube", nome: "YouTube", logo: "▶️", url: "https://www.youtube.com/creator_studio", features: ["Shorts", "Vídeos", "Premieres"] },
];

const PERSONAS = ["Carol (Renda Extra)", "Renata (Lojista)", "Vanessa (Compra Coletiva)", "Luiza (Trendsetter)"];
const TIPOS = ["Story", "Reels", "TikTok", "Feed", "Shorts", "Live"];
const PLATAFORMA_NOMES = ["Instagram Stories", "Instagram Reels", "Instagram Feed", "TikTok", "Facebook Feed", "YouTube Shorts"];
const STATUS_OPCOES = ["Agendado", "Publicado", "Erro"] as const;

export default function AgendadorPublicacaoSection() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedTab, setSelectedTab] = useState<"Agendado" | "Publicado" | "Erro">("Agendado");
  const [novoPost, setNovoPost] = useState(false);
  const [form, setForm] = useState({ titulo: '', plataforma: PLATAFORMA_NOMES[0], data: '', hora: '', persona: PERSONAS[0], tipo: TIPOS[0] });

  const agendarPost = () => {
    if (!form.titulo.trim()) { toast.error('Informe o título do post.'); return; }
    if (!form.data) { toast.error('Informe a data de publicação.'); return; }
    const novo: Post = {
      id: Date.now(),
      titulo: form.titulo,
      plataforma: form.plataforma,
      data: form.data,
      hora: form.hora || '—',
      status: 'Agendado',
      persona: form.persona,
      tipo: form.tipo,
    };
    setPosts(prev => [novo, ...prev]);
    setForm({ titulo: '', plataforma: PLATAFORMA_NOMES[0], data: '', hora: '', persona: PERSONAS[0], tipo: TIPOS[0] });
    setNovoPost(false);
    toast.success('Post agendado.');
  };

  const atualizarStatus = (id: number, status: Post['status']) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, status } : p));
  };

  const remover = (id: number) => {
    setPosts(prev => prev.filter(p => p.id !== id));
  };

  const filtrados = posts.filter(p => p.status === selectedTab);
  const agendados = posts.filter(p => p.status === 'Agendado').length;
  const publicados = posts.filter(p => p.status === 'Publicado').length;
  const erros = posts.filter(p => p.status === 'Erro').length;

  const getStatusColor = (status: string) => {
    if (status === "Publicado") return "bg-green-100 text-green-800";
    if (status === "Agendado") return "bg-blue-100 text-blue-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const getStatusIcon = (status: string) => {
    if (status === "Publicado") return <CheckCircle className="w-4 h-4" />;
    if (status === "Agendado") return <Clock className="w-4 h-4" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-600" />
            Agendador de Publicação
          </CardTitle>
          <CardDescription>
            Agende publicações em Instagram, TikTok, Facebook e YouTube. Integração com Meta Business Suite e TikTok Creator Center.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Aviso */}
          <Card className="border-l-4 border-l-amber-500 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Publicação automática requer integração de API</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Para publicação automática real, configure as credenciais da Meta Graph API e TikTok API no backend. Por enquanto, registre posts manualmente para acompanhar o calendário editorial.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Plataformas */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Conectar Plataformas</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {PLATAFORMAS.map(p => (
                <Card key={p.id} className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold text-sm mb-1">{p.logo} {p.nome}</h4>
                      <p className="text-xs text-slate-600 mb-2">{p.features.join(", ")}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => window.open(p.url, "_blank")} className="gap-1 text-xs">
                      <ExternalLink className="w-3 h-3" />
                      Acessar
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Estatísticas reais */}
          <div className="grid md:grid-cols-3 gap-3">
            <Card className="bg-blue-50 p-4 text-center">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Agendados</p>
              <p className="text-2xl font-bold text-blue-600">{agendados}</p>
            </Card>
            <Card className="bg-green-50 p-4 text-center">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Publicados</p>
              <p className="text-2xl font-bold text-green-600">{publicados}</p>
            </Card>
            <Card className="bg-red-50 p-4 text-center">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Com Erro</p>
              <p className="text-2xl font-bold text-red-600">{erros}</p>
            </Card>
          </div>

          {/* Botão adicionar */}
          <Button onClick={() => setNovoPost(!novoPost)} className="w-full gap-2 bg-green-600 hover:bg-green-700">
            <Plus className="w-4 h-4" />
            Registrar Post no Calendário
          </Button>

          {/* Formulário */}
          {novoPost && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold block mb-1">Título / Descrição</label>
                  <input type="text" placeholder="Ex: Carol - Meu Primeiro Pedido Chegou!" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Plataforma</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.plataforma} onChange={e => setForm(f => ({ ...f, plataforma: e.target.value }))}>
                      {PLATAFORMA_NOMES.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Tipo</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                      {TIPOS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Persona</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.persona} onChange={e => setForm(f => ({ ...f, persona: e.target.value }))}>
                      {PERSONAS.map(p => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Data</label>
                    <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Hora</label>
                    <input type="time" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.hora} onChange={e => setForm(f => ({ ...f, hora: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={agendarPost} className="flex-1 bg-green-600 hover:bg-green-700">Registrar</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setNovoPost(false)}>Cancelar</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Lista de posts */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Posts Registrados</h3>
            <div className="flex gap-2 mb-3">
              {(["Agendado", "Publicado", "Erro"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedTab(s)}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${selectedTab === s ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {s === 'Agendado' ? `⏰ Agendados (${agendados})` : s === 'Publicado' ? `✅ Publicados (${publicados})` : `⚠️ Erros (${erros})`}
                </button>
              ))}
            </div>

            {filtrados.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-300 rounded-lg">
                <Calendar className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-slate-500 text-sm">Nenhum post {selectedTab === 'Agendado' ? 'agendado' : selectedTab === 'Publicado' ? 'publicado' : 'com erro'}.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtrados.map(post => (
                  <Card key={post.id} className="p-4">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{post.titulo}</h4>
                          <Badge className={getStatusColor(post.status)} variant="outline">
                            {getStatusIcon(post.status)}
                            <span className="ml-1">{post.status}</span>
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                          <span>📱 {post.plataforma}</span>
                          <span>📅 {post.data}</span>
                          {post.hora !== '—' && <span>🕐 {post.hora}</span>}
                          <span>👤 {post.persona}</span>
                          <span>🎬 {post.tipo}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-wrap mt-2 pt-2 border-t border-slate-100">
                      {STATUS_OPCOES.filter(s => s !== post.status).map(s => (
                        <Button key={s} size="sm" variant="outline" className="text-xs" onClick={() => atualizarStatus(post.id, s)}>
                          → {s}
                        </Button>
                      ))}
                      <Button size="sm" variant="outline" className="text-red-600 text-xs" onClick={() => remover(post.id)}>
                        Remover
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Guia */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-green-600" />
              Como Usar o Calendário Editorial
            </h4>
            <ol className="text-sm space-y-2 text-slate-700">
              <li>1. <strong>Gere o vídeo com IA</strong> (aba "Vídeos IA")</li>
              <li>2. <strong>Edite no CapCut</strong> (aba "CapCut")</li>
              <li>3. <strong>Registre o post</strong> com data, hora e persona</li>
              <li>4. <strong>Publique manualmente</strong> nas plataformas acima</li>
              <li>5. <strong>Atualize o status</strong> para "Publicado" após publicar</li>
              <li>6. <strong>Monitore performance</strong> em tempo real (aba "Dashboard")</li>
            </ol>
          </Card>

          {/* Links externos */}
          <div className="grid md:grid-cols-2 gap-3">
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">🎯 Meta Business Suite</h4>
              <p className="text-xs text-slate-600 mb-3">Agende em Instagram, Facebook e WhatsApp de uma vez</p>
              <Button variant="outline" size="sm" onClick={() => window.open("https://business.facebook.com", "_blank")} className="w-full text-xs">
                Acessar
              </Button>
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">🎵 TikTok Creator Center</h4>
              <p className="text-xs text-slate-600 mb-3">Agende vídeos no TikTok com antecedência</p>
              <Button variant="outline" size="sm" onClick={() => window.open("https://www.tiktok.com/creator", "_blank")} className="w-full text-xs">
                Acessar
              </Button>
            </Card>
          </div>

          {/* Dicas */}
          <Card className="bg-yellow-50 border-yellow-200 p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              Dicas Importantes
            </h4>
            <ul className="text-sm space-y-1 text-slate-700">
              <li>✓ Agende com 24-48h de antecedência para melhor performance</li>
              <li>✓ Use os horários otimizados (veja aba "Performance")</li>
              <li>✓ Varie entre personas para manter frescor de conteúdo</li>
              <li>✓ Monitore métricas após publicação (veja aba "Dashboard")</li>
              <li>✓ Responda comentários nos primeiros 30 minutos</li>
            </ul>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
