import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Heart, MessageCircle, Share2, Hash, Calendar, ArrowLeft, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PERSONA_CONFIG: Record<string, { color: string; bg: string; emoji: string; tagline: string }> = {
  carol:   { color: "#D97706", bg: "#FEF3C7", emoji: "👩‍👧‍👦", tagline: "A Mãe Moderna" },
  renata:  { color: "#7C3AED", bg: "#EDE9FE", emoji: "👩‍💼", tagline: "A Executiva Elegante" },
  vanessa: { color: "#DB2777", bg: "#FCE7F3", emoji: "🎨", tagline: "A Criativa Artística" },
  luiza:   { color: "#059669", bg: "#D1FAE5", emoji: "💪", tagline: "A Fitness Aventureira" },
};

function getPersonaConfig(name: string) {
  const key = name.toLowerCase().split(" ")[0];
  return PERSONA_CONFIG[key] ?? { color: "#8B2635", bg: "#FFF1F2", emoji: "✨", tagline: "Influenciadora Feminnita" };
}

function formatDate(date: Date | string | null) {
  if (!date) return "";
  return new Date(date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" });
}

export default function PublicInfluencerBlog() {
  const [location] = useLocation();
  const [search, setSearch] = useState("");

  const idStr = location.split("/").pop();
  const influencerId = idStr ? parseInt(idStr, 10) : NaN;

  const { data, isLoading } = trpc.publicBlogs.getInfluencerBlog.useQuery(
    { influencerId, limit: 50, offset: 0 },
    { enabled: !isNaN(influencerId) }
  );

  const { data: allInfluencers } = trpc.publicBlogs.listInfluencers.useQuery();

  const influencer = data?.influencer;
  const posts = (data?.posts ?? []).filter((p: any) =>
    search
      ? p.content?.toLowerCase().includes(search.toLowerCase()) ||
        p.caption?.toLowerCase().includes(search.toLowerCase())
      : true
  );

  const persona = influencer ? getPersonaConfig(influencer.name) : getPersonaConfig("");

  if (!isNaN(influencerId) && !isLoading && !influencer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50 text-slate-500">
        <BookOpen className="w-12 h-12 opacity-30" />
        <p className="text-lg font-medium">Blog não encontrado.</p>
        <a href="/blog-publico">
          <Button variant="outline">Ver todas as influenciadoras</Button>
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-lg" style={{ color: "#8B2635" }}>Feminnita</span>
            {influencer && (
              <span className="text-sm text-slate-400 hidden sm:inline">/ {influencer.name}</span>
            )}
          </div>
          <a href="/blog-publico">
            <Button variant="ghost" size="sm" className="gap-2 text-slate-600">
              <ArrowLeft className="w-4 h-4" />
              Todas as influenciadoras
            </Button>
          </a>
        </div>
      </header>

      {/* Hero da influenciadora */}
      {isLoading ? (
        <div className="h-48 bg-slate-100 animate-pulse" />
      ) : influencer && (
        <div className="w-full py-12 px-4" style={{ backgroundColor: persona.bg }}>
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-6">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center text-4xl border-4 border-white shadow-lg flex-shrink-0 overflow-hidden"
              style={{ backgroundColor: persona.color }}
            >
              {influencer.avatar
                ? <img src={influencer.avatar} alt={influencer.name} className="w-full h-full object-cover" />
                : <span>{persona.emoji}</span>
              }
            </div>
            <div className="text-center sm:text-left">
              <p className="text-sm font-medium uppercase tracking-widest mb-1" style={{ color: persona.color }}>
                {persona.tagline}
              </p>
              <h1 className="text-3xl font-bold text-slate-900">{influencer.name}</h1>
              {influencer.bio && (
                <p className="text-slate-600 mt-2 max-w-xl leading-relaxed">{influencer.bio}</p>
              )}
              <div className="flex items-center gap-4 mt-3 justify-center sm:justify-start text-sm text-slate-500">
                <span>{posts.length} {posts.length === 1 ? "post" : "posts"}</span>
                {influencer.instagramHandle && (
                  <a
                    href={`https://instagram.com/${influencer.instagramHandle.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline"
                    style={{ color: persona.color }}
                  >
                    @{influencer.instagramHandle.replace("@", "")}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo principal */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Barra de busca */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar posts..."
            className="pl-9"
          />
        </div>

        {/* Posts */}
        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-2xl h-64 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg">
              {search ? "Nenhum post encontrado para esta busca." : "Nenhum post publicado ainda."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {posts.map((post: any) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {(post.mediaUrls as string[] | null)?.[0] && (
                  <img
                    src={(post.mediaUrls as string[])[0]}
                    alt={post.caption ?? ""}
                    className="w-full h-48 object-cover"
                  />
                )}

                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    {post.platform && (
                      <Badge variant="secondary" className="text-xs capitalize">{post.platform}</Badge>
                    )}
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(post.publishedAt ?? post.createdAt)}
                    </span>
                  </div>

                  {post.caption && (
                    <p className="font-medium text-slate-800 mb-2 line-clamp-2 leading-snug">{post.caption}</p>
                  )}

                  {post.content && (
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-4">{post.content}</p>
                  )}

                  {(post.hashtags as string[] | null)?.length ? (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {(post.hashtags as string[]).slice(0, 5).map((tag: string) => (
                        <span key={tag} className="text-xs flex items-center gap-0.5" style={{ color: persona.color }}>
                          <Hash className="w-2.5 h-2.5" />{tag.replace("#", "")}
                        </span>
                      ))}
                    </div>
                  ) : null}

                  {post.engagementMetrics && (
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-400">
                      {(post.engagementMetrics as any).likes != null && (
                        <span className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5" /> {(post.engagementMetrics as any).likes.toLocaleString()}
                        </span>
                      )}
                      {(post.engagementMetrics as any).comments != null && (
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" /> {(post.engagementMetrics as any).comments.toLocaleString()}
                        </span>
                      )}
                      {(post.engagementMetrics as any).shares != null && (
                        <span className="flex items-center gap-1">
                          <Share2 className="w-3.5 h-3.5" /> {(post.engagementMetrics as any).shares.toLocaleString()}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Outras influenciadoras */}
        {allInfluencers && allInfluencers.length > 1 && (
          <div className="mt-16 pt-8 border-t border-slate-200">
            <h2 className="text-lg font-semibold text-slate-700 mb-4">Outras influenciadoras</h2>
            <div className="flex flex-wrap gap-3">
              {allInfluencers
                .filter((inf: any) => inf.id !== influencerId)
                .map((inf: any) => {
                  const p = getPersonaConfig(inf.name);
                  return (
                    <a key={inf.id} href={`/blog-publico/${inf.id}`}>
                      <Button variant="outline" size="sm" className="gap-2">
                        <span>{p.emoji}</span> {inf.name}
                      </Button>
                    </a>
                  );
                })}
            </div>
          </div>
        )}
      </main>

      <footer className="bg-slate-900 text-white mt-16 py-8 text-center text-sm text-slate-400">
        <p>
          © {new Date().getFullYear()} Feminnita Pijamas. Todos os direitos reservados.
          {" · "}
          <a href="https://feminnita.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-white">
            feminnita.com.br
          </a>
        </p>
      </footer>
    </div>
  );
}
