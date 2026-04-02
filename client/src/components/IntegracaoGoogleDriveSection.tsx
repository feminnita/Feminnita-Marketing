import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Cloud, Share2, Download, Folder, Lock, ExternalLink, Zap, AlertCircle, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Video {
  id: number;
  nome: string;
  tipo: string;
  duracao: string;
  data: string;
  link: string;
  compartilhado: boolean;
}

const TIPOS = ["Story", "Reels", "TikTok", "Feed", "Shorts", "Live"];

export default function IntegracaoGoogleDriveSection() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const [novoVideo, setNovoVideo] = useState(false);
  const [form, setForm] = useState({ nome: '', tipo: TIPOS[0], duracao: '', data: '', link: '' });

  const adicionarVideo = () => {
    if (!form.nome.trim()) { toast.error('Informe o nome do vídeo.'); return; }
    const novo: Video = {
      id: Date.now(),
      nome: form.nome,
      tipo: form.tipo,
      duracao: form.duracao || '—',
      data: form.data || new Date().toISOString().split('T')[0],
      link: form.link,
      compartilhado: false,
    };
    setVideos(prev => [novo, ...prev]);
    setForm({ nome: '', tipo: TIPOS[0], duracao: '', data: '', link: '' });
    setNovoVideo(false);
    toast.success('Vídeo registrado.');
  };

  const toggleCompartilhado = (id: number) => {
    setVideos(prev => prev.map(v => v.id === id ? { ...v, compartilhado: !v.compartilhado } : v));
  };

  const remover = (id: number) => {
    setVideos(prev => prev.filter(v => v.id !== id));
    setSelectedVideo(null);
  };

  const compartilhados = videos.filter(v => v.compartilhado).length;

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            Integração com Google Drive
          </CardTitle>
          <CardDescription>
            Armazene e compartilhe vídeos gerados diretamente no Google Drive. Acesso fácil para toda a equipe com controle de permissões.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Aviso */}
          <Card className="border-l-4 border-l-amber-500 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-slate-900">Sincronização automática requer configuração de API</p>
                  <p className="text-sm text-slate-600 mt-1">
                    Para upload automático ao Google Drive, configure a Google Drive API no backend. Por enquanto, acesse o Drive manualmente e registre aqui os links dos vídeos armazenados.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acesso ao Drive */}
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-600" />
              Acessar Google Drive
            </h3>
            <p className="text-sm text-slate-600 mb-3">
              Acesse seu Google Drive para fazer upload, organizar e compartilhar seus vídeos com a equipe.
            </p>
            <Button onClick={() => window.open("https://drive.google.com", "_blank")} className="gap-2">
              <ExternalLink className="w-4 h-4" />
              Abrir Google Drive
            </Button>
          </div>

          {/* Estatísticas reais */}
          <div className="grid md:grid-cols-3 gap-3">
            <Card className="bg-blue-50 p-4 text-center">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Vídeos Registrados</p>
              <p className="text-2xl font-bold text-blue-600">{videos.length}</p>
            </Card>
            <Card className="bg-green-50 p-4 text-center">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Compartilhados</p>
              <p className="text-2xl font-bold text-green-600">{compartilhados}</p>
            </Card>
            <Card className="bg-purple-50 p-4 text-center">
              <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Armazenamento</p>
              <p className="text-2xl font-bold text-purple-600">—</p>
              <p className="text-xs text-slate-500">Verificar no Drive</p>
            </Card>
          </div>

          {/* Botão adicionar */}
          <Button onClick={() => setNovoVideo(!novoVideo)} className="w-full gap-2 bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4" />
            Registrar Vídeo do Drive
          </Button>

          {/* Formulário */}
          {novoVideo && (
            <Card className="p-4 bg-blue-50 border-blue-200">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-semibold block mb-1">Nome do Vídeo</label>
                  <input type="text" placeholder="Ex: Carol - Meu Primeiro Pedido Chegou!" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-semibold block mb-1">Tipo</label>
                    <select className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.tipo} onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}>
                      {TIPOS.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Duração</label>
                    <input type="text" placeholder="Ex: 15s" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.duracao} onChange={e => setForm(f => ({ ...f, duracao: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Data</label>
                    <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.data} onChange={e => setForm(f => ({ ...f, data: e.target.value }))} />
                  </div>
                  <div>
                    <label className="text-sm font-semibold block mb-1">Link do Drive (opcional)</label>
                    <input type="url" placeholder="https://drive.google.com/..." className="w-full px-3 py-2 border border-slate-300 rounded text-sm" value={form.link} onChange={e => setForm(f => ({ ...f, link: e.target.value }))} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={adicionarVideo} className="flex-1 bg-blue-600 hover:bg-blue-700">Registrar</Button>
                  <Button variant="outline" className="flex-1" onClick={() => setNovoVideo(false)}>Cancelar</Button>
                </div>
              </div>
            </Card>
          )}

          {/* Lista de vídeos */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Vídeos Registrados</h3>
            {videos.length === 0 ? (
              <div className="py-8 text-center border border-dashed border-slate-300 rounded-lg">
                <Cloud className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                <p className="text-slate-500 text-sm">Nenhum vídeo registrado.</p>
                <p className="text-xs text-slate-400 mt-1">Faça upload no Google Drive e registre o link aqui.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {videos.map(video => (
                  <Card
                    key={video.id}
                    className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => setSelectedVideo(selectedVideo === video.id ? null : video.id)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Folder className="w-4 h-4 text-blue-600" />
                          <h4 className="font-semibold text-sm">{video.nome}</h4>
                          {video.compartilhado && <Badge variant="outline" className="text-xs text-green-700">Compartilhado</Badge>}
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs text-slate-600">
                          <span>📊 {video.tipo}</span>
                          {video.duracao !== '—' && <span>⏱️ {video.duracao}</span>}
                          <span>📅 {video.data}</span>
                        </div>
                        {selectedVideo === video.id && (
                          <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200 flex-wrap">
                            {video.link && (
                              <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); window.open(video.link, "_blank"); }} className="gap-1 text-xs">
                                <ExternalLink className="w-3 h-3" />
                                Abrir
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={e => { e.stopPropagation(); toggleCompartilhado(video.id); }} className="gap-1 text-xs">
                              <Share2 className="w-3 h-3" />
                              {video.compartilhado ? 'Desmarcar' : 'Compartilhado'}
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600 text-xs" onClick={e => { e.stopPropagation(); remover(video.id); }}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Guia */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3">📋 Como Usar</h4>
            <ol className="text-sm space-y-2 text-slate-700">
              <li>1. <strong>Gere vídeos com IA</strong> (aba "Vídeos IA")</li>
              <li>2. <strong>Edite no CapCut</strong> (aba "CapCut")</li>
              <li>3. <strong>Faça upload manualmente</strong> no Google Drive</li>
              <li>4. <strong>Registre o link</strong> aqui para rastreamento</li>
              <li>5. <strong>Marque como "Compartilhado"</strong> quando compartilhar com a equipe</li>
              <li>6. <strong>Agende publicação</strong> (aba "Agendador")</li>
            </ol>
          </Card>

          {/* Permissões */}
          <Card className="bg-yellow-50 border-yellow-200 p-4">
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Lock className="w-4 h-4 text-yellow-600" />
              Controle de Permissões no Drive
            </h4>
            <ul className="text-sm space-y-1 text-slate-700">
              <li>✓ <strong>Visualizador:</strong> Apenas visualizar vídeos</li>
              <li>✓ <strong>Comentarista:</strong> Visualizar e comentar</li>
              <li>✓ <strong>Editor:</strong> Visualizar, comentar e editar</li>
              <li>✓ <strong>Proprietário:</strong> Acesso total (apenas você)</li>
            </ul>
          </Card>

          {/* Links */}
          <div className="grid md:grid-cols-2 gap-3">
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">📚 Documentação</h4>
              <p className="text-xs text-slate-600 mb-3">Guia completo de Google Drive API</p>
              <Button variant="outline" size="sm" onClick={() => window.open("https://developers.google.com/drive", "_blank")} className="w-full text-xs">
                Acessar Docs
              </Button>
            </Card>
            <Card className="p-4">
              <h4 className="font-semibold text-sm mb-2">🎓 Tutoriais</h4>
              <p className="text-xs text-slate-600 mb-3">Como compartilhar e colaborar no Drive</p>
              <Button variant="outline" size="sm" onClick={() => window.open("https://support.google.com/drive", "_blank")} className="w-full text-xs">
                Ver Tutoriais
              </Button>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
