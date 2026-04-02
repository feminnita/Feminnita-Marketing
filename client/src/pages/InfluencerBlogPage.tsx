import { useState } from "react";
import { useRoute } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Loader2, ShoppingCart, Heart, MessageCircle, Share2, ArrowRight } from "lucide-react";

const INFLUENCER_PROFILES = {
  1: {
    name: "Carol",
    title: "A Mãe Moderna",
    color: "from-pink-400 to-pink-600",
    bgColor: "bg-pink-50",
    accentColor: "text-pink-600",
    image: "👩‍👧‍👦",
    feminnita_url: "https://www.feminnita.com.br",
  },
  2: {
    name: "Renata",
    title: "A Executiva Elegante",
    color: "from-purple-400 to-purple-600",
    bgColor: "bg-purple-50",
    accentColor: "text-purple-600",
    image: "👩‍💼",
    feminnita_url: "https://www.feminnita.com.br",
  },
  3: {
    name: "Vanessa",
    title: "A Criativa Artística",
    color: "from-blue-400 to-blue-600",
    bgColor: "bg-blue-50",
    accentColor: "text-blue-600",
    image: "🎨",
    feminnita_url: "https://www.feminnita.com.br",
  },
  4: {
    name: "Luiza",
    title: "A Fitness Aventureira",
    color: "from-green-400 to-green-600",
    bgColor: "bg-green-50",
    accentColor: "text-green-600",
    image: "💪",
    feminnita_url: "https://www.feminnita.com.br",
  },
};

interface BlogPost {
  id: number;
  content: string;
  caption: string;
  hashtags: string[];
  publishedAt: Date | null;
  createdAt: Date | null;
  status: string;
  products?: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    url: string;
    description: string;
  }>;
}

const DEFAULT_COSMETICS = {
  color: "from-gray-400 to-gray-600",
  bgColor: "bg-gray-50",
  accentColor: "text-gray-600",
  image: "👤",
  feminnita_url: "https://www.feminnita.com.br",
  name: "",
  title: "",
};

export default function InfluencerBlogPage() {
  const [, params] = useRoute("/blog/:id");
  const influencerId = params?.id ? parseInt(params.id) : 1;
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch live influencer data from DB
  const { data: influencersData } = trpc.autonomousInfluencers.listInfluencers.useQuery();
  const dbInfluencer = influencersData?.influencers?.find((i: any) => i.id === influencerId);

  const cosmetics = INFLUENCER_PROFILES[influencerId as keyof typeof INFLUENCER_PROFILES] ?? DEFAULT_COSMETICS;
  const profile = dbInfluencer
    ? { ...cosmetics, name: dbInfluencer.name, title: dbInfluencer.personality ?? cosmetics.title ?? "" }
    : cosmetics.name
    ? cosmetics
    : null;

  // Get posts for influencer
  const { data: posts = [], isLoading: postsLoading } = trpc.influencerBlog.getPosts.useQuery(
    { influencerId },
    { enabled: !!influencerId }
  );

  const categories = ["all", "dicas", "lifestyle", "produtos", "rotina"];

  const filteredPosts = selectedCategory === "all" 
    ? posts 
    : posts.filter((post: any) => {
        const postHashtags = post.hashtags || [];
        return postHashtags.some((tag: string) => tag.toLowerCase().includes(selectedCategory));
      });

  if (!profile) {
    return <div className="text-center py-8">Influenciadora não encontrada</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Header Blog */}
      <div className={`bg-gradient-to-r ${profile.color} text-white py-16`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-6 mb-6">
            <div className="text-7xl">{profile.image}</div>
            <div>
              <h1 className="text-4xl font-bold">{profile.name}</h1>
              <p className="text-xl opacity-90">Blog de {profile.title}</p>
              <p className="text-sm opacity-75 mt-2">Dicas, lifestyle e produtos Feminnita</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Categories Filter */}
        <div className="mb-12">
          <h2 className="text-xl font-bold mb-4">Categorias</h2>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                onClick={() => setSelectedCategory(cat)}
                className="capitalize"
              >
                {cat === "all" ? "Todos os Posts" : cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Blog Posts */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold">Últimas Postagens</h2>

          {postsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-gray-500">
                <p className="text-lg">Nenhum post nesta categoria</p>
              </CardContent>
            </Card>
          ) : (
            filteredPosts.map((post: any) => (
              <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Post Header */}
                <CardHeader className={`${profile.bgColor}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-600">
                        {post.publishedAt 
                          ? new Date(post.publishedAt).toLocaleDateString("pt-BR", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })
                          : new Date(post.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                      <div className="flex gap-2 mt-2">
                        {post.hashtags && post.hashtags.slice(0, 3).map((tag: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Badge className={`${profile.accentColor} bg-white`}>
                      {post.status === "published" ? "✓ Publicado" : "📝 Rascunho"}
                    </Badge>
                  </div>
                </CardHeader>

                {/* Post Content */}
                <CardContent className="pt-6">
                  <div className="prose prose-sm max-w-none mb-6">
                    <p className="text-gray-900 whitespace-pre-wrap leading-relaxed text-base">
                      {post.content}
                    </p>

                    {post.caption && (
                      <p className="text-sm text-gray-600 italic mt-4 pt-4 border-t">
                        "{post.caption}"
                      </p>
                    )}
                  </div>

                  {/* Featured Products */}
                  {post.products && post.products.length > 0 && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 mb-6 border border-amber-200">
                      <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5" />
                        Produtos Mencionados
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {post.products.map((product: any) => (
                          <div key={product.id} className="bg-white rounded-lg p-4 border border-amber-100">
                            <div className="flex gap-3">
                              <div className="w-16 h-16 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center text-2xl">
                                {product.image}
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold text-sm">{product.name}</p>
                                <p className="text-xs text-gray-600 mb-2">{product.description}</p>
                                <p className="text-lg font-bold text-amber-600">
                                  R$ {product.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                            <a
                              href={product.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="mt-3 w-full inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded text-sm transition-colors"
                            >
                              Comprar na Feminnita
                              <ArrowRight className="w-4 h-4" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA - Feminnita */}
                  <div className={`${profile.bgColor} rounded-lg p-6 border-2 border-dashed ${profile.accentColor}`}>
                    <p className="font-semibold mb-3">
                      Conheça a coleção completa de pijamas Feminnita
                    </p>
                    <a
                      href={profile.feminnita_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 ${profile.accentColor} font-bold hover:underline`}
                    >
                      Visitar Feminnita
                      <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>

                  {/* Engagement */}
                  <div className="flex gap-6 pt-6 border-t text-gray-600 mt-6">
                    <button className="flex items-center gap-2 hover:text-red-600 transition">
                      <Heart className="w-5 h-5" />
                      <span className="text-sm">Curtir</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-blue-600 transition">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-sm">Comentar</span>
                    </button>
                    <button className="flex items-center gap-2 hover:text-green-600 transition">
                      <Share2 className="w-5 h-5" />
                      <span className="text-sm">Compartilhar</span>
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
