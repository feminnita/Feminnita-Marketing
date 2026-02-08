import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Heart, MessageCircle, Eye, Share2, TrendingUp, Users, BarChart3, RefreshCw, AlertCircle } from "lucide-react";

interface InstagramPost {
  id: string;
  caption: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM" | "REELS";
  media_url: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
  insights?: {
    engagement?: number;
    impressions?: number;
    reach?: number;
    saved?: number;
    video_views?: number;
    shares?: number;
  };
}

interface AccountMetrics {
  impressions?: number;
  reach?: number;
  follower_count?: number;
  profile_views?: number;
  website_clicks?: number;
}

export default function InstagramDashboard() {
  const { user, isAuthenticated } = useAuth();
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [metrics, setMetrics] = useState<AccountMetrics>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("posts");

  const instagramApi = trpc.instagram;

  // Testar conexão
  const testConnection = async () => {
    if (!businessAccountId || !accessToken) {
      setError("Por favor, preencha o ID da conta e o token de acesso");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await instagramApi.testConnection.mutate({
        businessAccountId,
        accessToken,
      });

      if (result.success) {
        alert(`✅ Conexão estabelecida com sucesso!\nConta: ${result.data.accountName}`);
      } else {
        setError(result.message);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao testar conexão";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Sincronizar posts
  const syncPosts = async () => {
    if (!businessAccountId || !accessToken) {
      setError("Por favor, preencha o ID da conta e o token de acesso");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await instagramApi.syncInstagramPosts.mutate({
        businessAccountId,
        accessToken,
        limit: 25,
      });

      if (result.success) {
        setPosts(result.data);
        alert(`✅ ${result.count} posts sincronizados com sucesso!`);
      } else {
        setError("Erro ao sincronizar posts");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao sincronizar posts";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Obter métricas da conta
  const getMetrics = async () => {
    if (!businessAccountId || !accessToken) {
      setError("Por favor, preencha o ID da conta e o token de acesso");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await instagramApi.getFollowerInsights.query({
        businessAccountId,
        accessToken,
      });

      if (result.success) {
        setMetrics(result.data);
      } else {
        setError("Erro ao obter métricas");
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Erro ao obter métricas";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 to-orange-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Acesso Restrito</CardTitle>
            <CardDescription>Você precisa estar autenticado para acessar o dashboard</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-orange-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard Instagram</h1>
          <p className="text-gray-600">Sincronize e monitore seus posts do Instagram em tempo real</p>
        </div>

        {/* Erro */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="flex items-center gap-3 pt-6">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Configuração */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Configurar Conexão</CardTitle>
            <CardDescription>Insira suas credenciais do Instagram Business</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID da Conta de Negócios
                </label>
                <Input
                  placeholder="ex: 123456789"
                  value={businessAccountId}
                  onChange={(e) => setBusinessAccountId(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token de Acesso
                </label>
                <Input
                  type="password"
                  placeholder="ex: EAAB..."
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                onClick={testConnection}
                disabled={isLoading || !businessAccountId || !accessToken}
                variant="outline"
              >
                {isLoading ? "Testando..." : "Testar Conexão"}
              </Button>
              <Button
                onClick={syncPosts}
                disabled={isLoading || !businessAccountId || !accessToken}
                className="bg-pink-600 hover:bg-pink-700"
              >
                {isLoading ? "Sincronizando..." : "Sincronizar Posts"}
              </Button>
              <Button
                onClick={getMetrics}
                disabled={isLoading || !businessAccountId || !accessToken}
                variant="outline"
              >
                {isLoading ? "Carregando..." : "Atualizar Métricas"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="posts">Posts ({posts.length})</TabsTrigger>
            <TabsTrigger value="metrics">Métricas da Conta</TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-4">
            {posts.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <RefreshCw className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-center">
                    Nenhum post sincronizado ainda. Clique em "Sincronizar Posts" para começar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post) => (
                  <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    {/* Imagem */}
                    <div className="relative bg-gray-100 aspect-square overflow-hidden">
                      <img
                        src={post.media_url}
                        alt={post.caption}
                        className="w-full h-full object-cover"
                      />
                      <Badge className="absolute top-2 right-2 bg-pink-600">
                        {post.media_type === "CAROUSEL_ALBUM" ? "Carrossel" : post.media_type}
                      </Badge>
                    </div>

                    {/* Conteúdo */}
                    <CardContent className="pt-4">
                      <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                        {post.caption || "Sem descrição"}
                      </p>

                      {/* Engajamento */}
                      <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Heart className="w-4 h-4" />
                          <span>{post.like_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.comments_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye className="w-4 h-4" />
                          <span>{post.insights?.impressions || 0}</span>
                        </div>
                      </div>

                      {/* Métricas Detalhadas */}
                      {post.insights && (
                        <div className="space-y-1 text-xs text-gray-600 border-t pt-3">
                          <div className="flex justify-between">
                            <span>Alcance:</span>
                            <span className="font-semibold">{post.insights.reach || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Engajamento:</span>
                            <span className="font-semibold">{post.insights.engagement || 0}</span>
                          </div>
                          {post.insights.video_views && (
                            <div className="flex justify-between">
                              <span>Visualizações:</span>
                              <span className="font-semibold">{post.insights.video_views}</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Link */}
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block mt-3 text-xs text-pink-600 hover:text-pink-700 font-medium"
                      >
                        Ver no Instagram →
                      </a>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Métricas Tab */}
          <TabsContent value="metrics">
            {Object.keys(metrics).length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BarChart3 className="w-12 h-12 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-center">
                    Nenhuma métrica carregada. Clique em "Atualizar Métricas" para começar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Seguidores */}
                {metrics.follower_count && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Users className="w-4 h-4 text-pink-600" />
                        Seguidores
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-gray-900">
                        {(metrics.follower_count || 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Impressões */}
                {metrics.impressions && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Eye className="w-4 h-4 text-blue-600" />
                        Impressões
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-gray-900">
                        {(metrics.impressions || 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Alcance */}
                {metrics.reach && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        Alcance
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-gray-900">
                        {(metrics.reach || 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Visualizações de Perfil */}
                {metrics.profile_views && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-purple-600" />
                        Visualizações de Perfil
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-gray-900">
                        {(metrics.profile_views || 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Cliques no Site */}
                {metrics.website_clicks && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium flex items-center gap-2">
                        <Share2 className="w-4 h-4 text-orange-600" />
                        Cliques no Site
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold text-gray-900">
                        {(metrics.website_clicks || 0).toLocaleString()}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
