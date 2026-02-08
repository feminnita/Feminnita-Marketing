import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle, Share2, Calendar, User } from "lucide-react";

interface PublicBlogPost {
  id: number;
  title: string;
  content: string;
  caption?: string;
  image?: string;
  likes?: number;
  comments?: number;
  shares?: number;
  createdAt: Date;
  influencerName: string;
  influencerImage?: string;
}

export default function PublicInfluencerBlog() {
  const [location] = useLocation();
  const [influencerId, setInfluencerId] = useState<number | null>(null);
  const [posts, setPosts] = useState<PublicBlogPost[]>([]);

  // Extrair ID da influencer da URL
  useEffect(() => {
    const pathParts = location.split("/");
    const id = pathParts[pathParts.length - 1];
    if (id && !isNaN(parseInt(id))) {
      setInfluencerId(parseInt(id));
    }
  }, [location]);

  // Query para obter posts da influencer
  const postsQuery = trpc.influencerBlog.getPosts.useQuery(
    { influencerId: influencerId || 0 },
    { enabled: !!influencerId }
  );

  useEffect(() => {
    if (postsQuery.data) {
      setPosts(postsQuery.data as any);
    }
  }, [postsQuery.data]);

  if (!influencerId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-600">Influencer não encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Blog de Moda</h1>
              <p className="text-slate-600 mt-1">Dicas e inspirações de estilo</p>
            </div>
            <Button variant="outline" asChild>
              <a href="https://feminnita.com">← Voltar para Feminnita</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">Nenhum post publicado ainda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <CardHeader>
                  <div className="flex items-center gap-3 mb-3">
                    {post.influencerImage && (
                      <img
                        src={post.influencerImage}
                        alt={post.influencerName}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-sm">{post.influencerName}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(post.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                  <CardTitle className="text-lg">{post.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{post.caption}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-700 text-sm line-clamp-3 mb-4">{post.content}</p>
                  <div className="flex items-center justify-between text-sm text-slate-500">
                    <div className="flex gap-4">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" /> {post.likes || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" /> {post.comments || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Share2 className="w-4 h-4" /> {post.shares || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="font-semibold mb-4">Sobre</h3>
              <p className="text-slate-400">
                Blog oficial de moda e estilo da Feminnita Pijamas
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Links Rápidos</h3>
              <ul className="space-y-2 text-slate-400">
                <li><a href="#" className="hover:text-white">Home</a></li>
                <li><a href="#" className="hover:text-white">Produtos</a></li>
                <li><a href="#" className="hover:text-white">Contato</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Redes Sociais</h3>
              <div className="flex gap-4">
                <a href="#" className="text-slate-400 hover:text-white">Instagram</a>
                <a href="#" className="text-slate-400 hover:text-white">TikTok</a>
                <a href="#" className="text-slate-400 hover:text-white">Facebook</a>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 text-center text-slate-400">
            <p>&copy; 2026 Feminnita Pijamas. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
