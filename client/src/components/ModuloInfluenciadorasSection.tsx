import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Instagram, Music2, Send, Trash2, Clock, CheckCircle2, FileText } from "lucide-react";

const ACCENT_COLORS = ['#8B2635', '#A63D4A', '#6B7A3A', '#3A5A6B'];
const BG_COLORS = ['#fdf0e8', '#fce8ea', '#eef5e8', '#e8f2f5'];

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  tiktok: 'TikTok',
  youtube: 'YouTube',
  blog: 'Blog',
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Rascunho', color: 'bg-slate-100 text-slate-600' },
  scheduled: { label: 'Agendado', color: 'bg-blue-100 text-blue-700' },
  published: { label: 'Publicado', color: 'bg-green-100 text-green-700' },
  failed: { label: 'Falhou', color: 'bg-red-100 text-red-700' },
};

type ContentForm = {
  theme: string;
  platform: "instagram" | "tiktok" | "youtube" | "blog";
  contentType: "image" | "video" | "carousel" | "story";
  style: string;
};

export default function ModuloInfluenciadorasSection() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState<ContentForm>({
    theme: "",
    platform: "instagram",
    contentType: "video",
    style: "",
  });
  const [generatedContent, setGeneratedContent] = useState<any>(null);

  const { data: influencers = [], isLoading } = trpc.influencers.list.useQuery();
  type Inf = (typeof influencers)[number];
  const selected = influencers.find((i: Inf) => i.id === selectedId) ?? null;
  const selectedIdx = influencers.findIndex((i: Inf) => i.id === selectedId);

  const { data: posts = [], refetch: refetchPosts } = trpc.influencers.getPosts.useQuery(
    { influencerId: selectedId!, limit: 10 },
    { enabled: selectedId !== null }
  );

  const generate = trpc.autonomousInfluencers.generateContent.useMutation({
    onSuccess: (data) => {
      setGeneratedContent(data.content);
      refetchPosts();
    },
  });

  const deletePost = trpc.influencers.deletePost.useMutation({
    onSuccess: () => refetchPosts(),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: '#8B2635' }} />
      </div>
    );
  }

  if (influencers.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-4xl mb-3">👤</div>
        <p className="text-slate-600">Vá em <strong>Personas</strong> e crie as influencers primeiro.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Módulo Influenciadoras</h2>
        <p className="text-slate-500 text-sm mt-1">Selecione uma influencer para gerar conteúdo com a voz dela usando IA.</p>
      </div>

      {/* Seletor de influencer */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {influencers.map((inf: Inf, idx: number) => (
          <button
            key={inf.id}
            onClick={() => { setSelectedId(inf.id); setGeneratedContent(null); }}
            className={`rounded-xl p-4 text-left transition-all border-2 ${
              selectedId === inf.id ? 'border-current shadow-md' : 'border-transparent hover:border-slate-200'
            }`}
            style={selectedId === inf.id
              ? { backgroundColor: BG_COLORS[idx % BG_COLORS.length], borderColor: ACCENT_COLORS[idx % ACCENT_COLORS.length] }
              : { backgroundColor: '#f8f8f8' }
            }
          >
            <div className="w-10 h-10 rounded-full overflow-hidden mb-2 border-2"
              style={{ borderColor: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}>
              {inf.avatar ? (
                <img src={inf.avatar} alt={inf.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-sm font-bold text-white"
                  style={{ backgroundColor: ACCENT_COLORS[idx % ACCENT_COLORS.length] }}>
                  {inf.name[0]}
                </div>
              )}
            </div>
            <p className="font-semibold text-sm text-slate-800">{inf.name}</p>
            {inf.instagramHandle && (
              <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                <Instagram className="w-3 h-3" />{inf.instagramHandle}
              </p>
            )}
          </button>
        ))}
      </div>

      {selected && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário de geração */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: ACCENT_COLORS[selectedIdx % ACCENT_COLORS.length] }} />
                Gerar conteúdo como {selected.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Tema do conteúdo</label>
                <Input
                  value={form.theme}
                  onChange={e => setForm(f => ({ ...f, theme: e.target.value }))}
                  placeholder="Ex: lançamento pijama inverno, dica de look noturno..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Plataforma</label>
                  <select
                    value={form.platform}
                    onChange={e => setForm(f => ({ ...f, platform: e.target.value as ContentForm['platform'] }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': ACCENT_COLORS[selectedIdx % ACCENT_COLORS.length] } as any}
                  >
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="youtube">YouTube</option>
                    <option value="blog">Blog</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 block mb-1">Tipo</label>
                  <select
                    value={form.contentType}
                    onChange={e => setForm(f => ({ ...f, contentType: e.target.value as ContentForm['contentType'] }))}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none"
                  >
                    <option value="video">Vídeo / Reel</option>
                    <option value="image">Imagem</option>
                    <option value="carousel">Carrossel</option>
                    <option value="story">Story</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Estilo (opcional)</label>
                <Input
                  value={form.style}
                  onChange={e => setForm(f => ({ ...f, style: e.target.value }))}
                  placeholder="Ex: divertido, emocionante, educativo..."
                />
              </div>

              <Button
                className="w-full text-white"
                style={{ backgroundColor: ACCENT_COLORS[selectedIdx % ACCENT_COLORS.length] }}
                disabled={generate.isPending || !form.theme.trim()}
                onClick={() => generate.mutate({
                  influencerId: selected.id,
                  theme: form.theme,
                  platform: form.platform,
                  contentType: form.contentType,
                  style: form.style || undefined,
                })}
              >
                {generate.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Gerando com IA...</>
                  : <><Sparkles className="w-4 h-4 mr-2" /> Gerar Conteúdo</>
                }
              </Button>

              {generate.isError && (
                <p className="text-sm text-red-500 text-center">Erro ao gerar. Verifique se a chave de IA está configurada.</p>
              )}

              {/* Resultado gerado */}
              {generatedContent && (
                <div className="mt-2 rounded-xl p-4 space-y-3 border"
                  style={{ backgroundColor: BG_COLORS[selectedIdx % BG_COLORS.length], borderColor: ACCENT_COLORS[selectedIdx % ACCENT_COLORS.length] + '40' }}>
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: ACCENT_COLORS[selectedIdx % ACCENT_COLORS.length] }}>
                    Conteúdo gerado
                  </p>
                  {generatedContent.caption && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Legenda</p>
                      <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{generatedContent.caption}</p>
                    </div>
                  )}
                  {generatedContent.hashtags?.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-slate-600 mb-1">Hashtags</p>
                      <p className="text-sm text-blue-600">{generatedContent.hashtags.join(' ')}</p>
                    </div>
                  )}
                  {generatedContent.bestTimeToPost && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      Melhor horário: {generatedContent.bestTimeToPost}
                    </div>
                  )}
                  {generatedContent.estimatedReach && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CheckCircle2 className="w-3 h-3" />
                      Alcance estimado: {generatedContent.estimatedReach.toLocaleString('pt-BR')} pessoas
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Posts salvos */}
          <Card className="border-0 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-400" />
                Posts de {selected.name}
                {posts.length > 0 && <Badge variant="secondary">{posts.length}</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Nenhum post ainda. Gere o primeiro conteúdo ao lado.
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  {posts.map((post: (typeof posts)[number]) => {
                    const statusInfo = STATUS_LABELS[post.status ?? 'draft'] ?? STATUS_LABELS.draft;
                    return (
                      <div key={post.id} className="border border-slate-100 rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={statusInfo.color + ' border-0 text-xs'}>{statusInfo.label}</Badge>
                            {post.platform && (
                              <span className="text-xs text-slate-400">{PLATFORM_LABELS[post.platform] ?? post.platform}</span>
                            )}
                          </div>
                          <button
                            onClick={() => deletePost.mutate({ postId: post.id })}
                            className="p-1 hover:bg-red-50 rounded transition-colors text-slate-300 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {post.caption && (
                          <p className="text-sm text-slate-700 leading-relaxed line-clamp-3">{post.caption}</p>
                        )}
                        {post.createdAt && (
                          <p className="text-xs text-slate-400">
                            {new Date(post.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {!selected && (
        <div className="text-center py-8 text-slate-400">
          Selecione uma influencer acima para começar.
        </div>
      )}
    </div>
  );
}
