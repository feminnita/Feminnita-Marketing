import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  BookOpen, Plus, Sparkles, Lightbulb, Edit3, Trash2,
  Eye, Send, Clock, FileText, Search, RefreshCw, Save,
  CheckCircle, Loader2, ChevronRight, Tag, Calendar
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type PostStatus = "draft" | "review" | "published" | "scheduled";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  category: string | null;
  tags: string | null;
  status: PostStatus;
  seoTitle: string | null;
  seoDescription: string | null;
  generatedByAI: boolean;
  publishedAt: Date | string | null;
  updatedAt: Date | string;
}

interface BlogDraft {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  seoTitle: string;
  seoDescription: string;
  category: string;
  tags: string[];
  coverImageSuggestion: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusConfig: Record<PostStatus, { label: string; color: string }> = {
  draft:     { label: "Rascunho",   color: "bg-slate-100 text-slate-700" },
  review:    { label: "Em revisão", color: "bg-yellow-100 text-yellow-800" },
  published: { label: "Publicado",  color: "bg-green-100 text-green-800" },
  scheduled: { label: "Agendado",   color: "bg-blue-100 text-blue-800" },
};

function fmtDate(d: Date | string | null): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR");
}

// ─── Visualizador de markdown simples ────────────────────────────────────────

function MarkdownPreview({ content }: { content: string }) {
  const html = content
    .replace(/^### (.+)$/gm, '<h3 class="text-lg font-semibold mt-4 mb-2 text-slate-800">$1</h3>')
    .replace(/^## (.+)$/gm, '<h2 class="text-xl font-bold mt-6 mb-3 text-slate-900">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-2xl font-bold mt-6 mb-3 text-slate-900">$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/^(?!<[h|l])/gm, '');

  return (
    <div
      className="prose prose-slate max-w-none text-sm leading-relaxed"
      dangerouslySetInnerHTML={{ __html: `<p class="mb-3">${html}</p>` }}
    />
  );
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function BlogFeminnitaPage() {
  const [view, setView] = useState<"list" | "editor" | "ideas">("list");
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [draft, setDraft] = useState<BlogDraft | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  // Form states
  const [genTopic, setGenTopic] = useState("");
  const [genKeywords, setGenKeywords] = useState("");
  const [genTone, setGenTone] = useState<"informativo" | "inspiracional" | "educativo" | "tendência">("inspiracional");
  const [searchTerm, setSearchTerm] = useState("");

  // Current edited post fields
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editExcerpt, setEditExcerpt] = useState("");
  const [editSeoTitle, setEditSeoTitle] = useState("");
  const [editSeoDesc, setEditSeoDesc] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editTags, setEditTags] = useState("");
  const [improveInstructions, setImproveInstructions] = useState("");

  // tRPC
  const { data: posts, refetch: refetchPosts } = trpc.blog.list.useQuery({});
  const generateMutation = trpc.blog.generateWithAI.useMutation();
  const ideasMutation = trpc.blog.generateIdeas.useMutation();
  const saveMutation = trpc.blog.save.useMutation();
  const publishMutation = trpc.blog.publish.useMutation();
  const publishLiveMutation = trpc.blog.publishToLiveBlog.useMutation();
  const deleteMutation = trpc.blog.delete.useMutation();
  const improveMutation = trpc.blog.improve.useMutation();

  // ─── Handlers ─────────────────────────────────────────────────────────────

  async function handleGenerate() {
    if (!genTopic.trim()) { toast.error("Informe o tema do post"); return; }
    try {
      const result = await generateMutation.mutateAsync({
        topic: genTopic,
        targetKeywords: genKeywords.split(",").map(k => k.trim()).filter(Boolean),
        tone: genTone,
        wordCount: 1000,
      });
      setDraft(result);
      setEditTitle(result.title);
      setEditContent(result.content);
      setEditExcerpt(result.excerpt);
      setEditSeoTitle(result.seoTitle);
      setEditSeoDesc(result.seoDescription);
      setEditCategory(result.category);
      setEditTags(result.tags.join(", "));
      setView("editor");
      setEditingPost(null);
      toast.success("Post gerado com sucesso!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao gerar post");
    }
  }

  function openEditor(post: BlogPost) {
    setEditingPost(post);
    setEditTitle(post.title);
    setEditContent(post.content);
    setEditExcerpt(post.excerpt ?? "");
    setEditSeoTitle(post.seoTitle ?? "");
    setEditSeoDesc(post.seoDescription ?? "");
    setEditCategory(post.category ?? "");
    setEditTags(post.tags ? JSON.parse(post.tags).join(", ") : "");
    setDraft(null);
    setView("editor");
  }

  async function handleSave(status: PostStatus = "draft") {
    if (!editTitle.trim()) { toast.error("Título obrigatório"); return; }
    try {
      const slug = editTitle.toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);

      await saveMutation.mutateAsync({
        id: editingPost?.id,
        title: editTitle,
        slug: draft?.slug ?? slug,
        content: editContent,
        excerpt: editExcerpt,
        category: editCategory,
        tags: editTags.split(",").map(t => t.trim()).filter(Boolean),
        status,
        seoTitle: editSeoTitle,
        seoDescription: editSeoDesc,
        generatedByAI: !!draft,
      });
      toast.success(status === "published" ? "Post publicado!" : "Post salvo!");
      refetchPosts();
      setView("list");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar");
    }
  }

  async function handlePublish(id: number) {
    try {
      await publishMutation.mutateAsync({ id });
      toast.success("Post publicado!");
      refetchPosts();
    } catch (e: any) {
      toast.error(e.message || "Erro ao publicar");
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Deletar este post?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Post deletado");
      refetchPosts();
    } catch (e: any) {
      toast.error(e.message || "Erro ao deletar");
    }
  }

  async function handleImprove() {
    if (!editingPost || !improveInstructions.trim()) return;
    try {
      const result = await improveMutation.mutateAsync({
        id: editingPost.id,
        instructions: improveInstructions,
      });
      setEditContent(result.content);
      setImproveInstructions("");
      toast.success("Post melhorado pela IA!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao melhorar");
    }
  }

  const filteredPosts = (posts || []).filter((p: BlogPost) =>
    !searchTerm || p.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ─── Views ────────────────────────────────────────────────────────────────

  // LISTA DE POSTS
  if (view === "list") return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-rose-100">
            <BookOpen className="w-6 h-6 text-rose-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Blog Feminnita</h1>
            <p className="text-sm text-slate-500">Gerencie e publique conteúdo com IA</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setView("ideas")} className="gap-2">
            <Lightbulb className="w-4 h-4" /> Ideias IA
          </Button>
          <Button onClick={() => { setView("editor"); setEditingPost(null); setDraft(null); setEditTitle(""); setEditContent(""); setEditExcerpt(""); setEditSeoTitle(""); setEditSeoDesc(""); setEditCategory(""); setEditTags(""); }} className="gap-2 bg-rose-600 hover:bg-rose-700">
            <Plus className="w-4 h-4" /> Novo Post
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {(["draft", "review", "published", "scheduled"] as PostStatus[]).map(s => (
          <div key={s} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs text-slate-500 mb-1">{statusConfig[s].label}</p>
            <p className="text-2xl font-bold text-slate-900">
              {(posts || []).filter((p: BlogPost) => p.status === s).length}
            </p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
        <Input placeholder="Buscar posts..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
      </div>

      {/* Gerador rápido */}
      <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-rose-500" /> Gerar Post com IA
        </h3>
        <div className="flex gap-2">
          <Input placeholder="Tema do post (ex: Pijamas para o inverno 2025)" value={genTopic} onChange={e => setGenTopic(e.target.value)} className="flex-1" onKeyDown={e => e.key === "Enter" && handleGenerate()} />
          <select value={genTone} onChange={e => setGenTone(e.target.value as any)} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white">
            <option value="inspiracional">Inspiracional</option>
            <option value="informativo">Informativo</option>
            <option value="educativo">Educativo</option>
            <option value="tendência">Tendência</option>
          </select>
          <Button onClick={handleGenerate} disabled={generateMutation.isPending} className="bg-rose-600 hover:bg-rose-700 gap-2 whitespace-nowrap">
            {generateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generateMutation.isPending ? "Gerando..." : "Gerar"}
          </Button>
        </div>
        <Input placeholder="Palavras-chave (opcional, separadas por vírgula)" value={genKeywords} onChange={e => setGenKeywords(e.target.value)} className="mt-2" />
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Nenhum post ainda. Gere o primeiro com IA!</p>
          </div>
        ) : filteredPosts.map((post: BlogPost) => (
          <div key={post.id} className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 hover:border-rose-200 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusConfig[post.status as PostStatus]?.color ?? ""}`}>
                  {statusConfig[post.status as PostStatus]?.label ?? post.status}
                </span>
                {post.generatedByAI && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium">
                    ✨ IA
                  </span>
                )}
                {post.category && <span className="text-xs text-slate-400">{post.category}</span>}
              </div>
              <h3 className="font-semibold text-slate-900 truncate">{post.title}</h3>
              {post.excerpt && <p className="text-sm text-slate-500 truncate mt-0.5">{post.excerpt}</p>}
              <p className="text-xs text-slate-400 mt-1">Atualizado {fmtDate(post.updatedAt)}</p>
            </div>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={() => openEditor(post)}>
                <Edit3 className="w-4 h-4" />
              </Button>
              <Button
                size="sm" variant="ghost"
                title="Publicar no blog.feminnita.com.br"
                disabled={publishLiveMutation.isPending}
                onClick={async () => {
                  try {
                    const r = await publishLiveMutation.mutateAsync({ id: post.id });
                    toast.success("Publicado no blog! " + r.url);
                    refetchPosts();
                  } catch (e: any) { toast.error(e.message); }
                }}
                className="text-rose-600 hover:text-rose-700"
              >
                {publishLiveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => handleDelete(post.id)} className="text-red-500 hover:text-red-600">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // EDITOR
  if (view === "editor") return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setView("list")} className="text-slate-500">
            ← Voltar
          </Button>
          <h2 className="text-xl font-bold text-slate-900">
            {editingPost ? "Editar Post" : draft ? "Post Gerado por IA" : "Novo Post"}
          </h2>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="w-4 h-4 mr-1" /> {previewMode ? "Editar" : "Preview"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleSave("draft")} disabled={saveMutation.isPending}>
            <Save className="w-4 h-4 mr-1" /> Salvar Rascunho
          </Button>
          <Button size="sm" onClick={() => handleSave("published")} disabled={saveMutation.isPending} className="bg-green-600 hover:bg-green-700">
            {saveMutation.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Send className="w-4 h-4 mr-1" />}
            Publicar
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <Input placeholder="Título do post" value={editTitle} onChange={e => setEditTitle(e.target.value)} className="text-lg font-semibold" />

        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="Categoria" value={editCategory} onChange={e => setEditCategory(e.target.value)} />
          <Input placeholder="Tags (separadas por vírgula)" value={editTags} onChange={e => setEditTags(e.target.value)} />
        </div>

        <Textarea placeholder="Resumo / excerpt" value={editExcerpt} onChange={e => setEditExcerpt(e.target.value)} rows={2} />

        {previewMode ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 min-h-64">
            <MarkdownPreview content={editContent} />
          </div>
        ) : (
          <Textarea
            placeholder="Conteúdo em markdown..."
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            rows={20}
            className="font-mono text-sm"
          />
        )}

        {/* SEO */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
          <h3 className="font-semibold text-sm text-slate-700">SEO</h3>
          <Input placeholder="Título SEO (máx 60 chars)" value={editSeoTitle} onChange={e => setEditSeoTitle(e.target.value)} maxLength={60} />
          <Textarea placeholder="Meta description (140-160 chars)" value={editSeoDesc} onChange={e => setEditSeoDesc(e.target.value)} rows={2} maxLength={160} />
          {editSeoTitle && (
            <div className="bg-white border border-slate-200 rounded p-3 text-xs">
              <p className="text-blue-600 font-medium truncate">{editSeoTitle}</p>
              <p className="text-green-700">marketing.feminnita.com.br/blog/{draft?.slug ?? "post-url"}</p>
              <p className="text-slate-500 line-clamp-2">{editSeoDesc}</p>
            </div>
          )}
        </div>

        {/* Melhorar com IA */}
        {editingPost && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 space-y-2">
            <h3 className="font-semibold text-sm text-purple-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Melhorar com IA
            </h3>
            <div className="flex gap-2">
              <Input placeholder="Ex: torne mais envolvente, adicione mais exemplos, melhore o SEO..." value={improveInstructions} onChange={e => setImproveInstructions(e.target.value)} />
              <Button onClick={handleImprove} disabled={improveMutation.isPending} size="sm" className="bg-purple-600 hover:bg-purple-700 whitespace-nowrap">
                {improveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Melhorar"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // IDEIAS
  if (view === "ideas") return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setView("list")} className="text-slate-500">← Voltar</Button>
          <h2 className="text-xl font-bold text-slate-900">Ideias de Posts com IA</h2>
        </div>
        <Button
          onClick={async () => {
            const toastId = toast.loading("Gerando ideias...");
            try {
              const result = await ideasMutation.mutateAsync({ count: 8 });
              toast.dismiss(toastId);
              toast.success(`${result.ideas?.length ?? 0} ideias geradas!`);
            } catch (e: any) {
              toast.dismiss(toastId);
              const msg = e?.data?.message ?? e?.message ?? "Erro ao gerar ideias";
              toast.error(msg);
            }
          }}
          disabled={ideasMutation.isPending}
          className="gap-2"
        >
          {ideasMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Gerar Ideias
        </Button>
      </div>

      {!ideasMutation.data && !ideasMutation.isPending && (
        <div className="text-center py-12 text-slate-400">
          <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Clique em "Gerar Ideias" para obter sugestões de posts personalizadas para a Feminnita.</p>
        </div>
      )}

      {ideasMutation.isPending && (
        <div className="text-center py-12 text-slate-500">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" />
          <p>Gerando ideias criativas...</p>
        </div>
      )}

      <div className="space-y-3">
        {(ideasMutation.data?.ideas || []).map((idea, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 hover:border-rose-200 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full">{idea.category}</span>
                  {idea.keywords.slice(0, 2).map(k => (
                    <span key={k} className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">{k}</span>
                  ))}
                </div>
                <h3 className="font-semibold text-slate-900">{idea.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{idea.rationale}</p>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => {
                  setGenTopic(idea.title);
                  setGenKeywords(idea.keywords.join(", "));
                  setView("list");
                }}
              >
                Usar <ChevronRight className="w-3 h-3 ml-1" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return null;
}
