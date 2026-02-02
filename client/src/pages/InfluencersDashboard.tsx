import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Users, TrendingUp, MessageCircle, Heart, Share2, Eye, BarChart3, Zap } from "lucide-react";

export default function InfluencersDashboard() {
  const [selectedInfluencer, setSelectedInfluencer] = useState<number | null>(null);

  // Fetch all influencers
  const { data: influencersData, isLoading: loadingInfluencers } =
    trpc.autonomousInfluencers.listInfluencers.useQuery();

  // Fetch performance metrics
  const { data: performanceData, isLoading: loadingMetrics } =
    trpc.autonomousInfluencers.getPerformanceMetrics.useQuery(
      { influencerId: selectedInfluencer || 1, days: 30 },
      { enabled: !!selectedInfluencer }
    );

  // Fetch scheduled posts
  const { data: postsData, isLoading: loadingPosts } =
    trpc.autonomousInfluencers.getScheduledPosts.useQuery(
      { influencerId: selectedInfluencer || 1 },
      { enabled: !!selectedInfluencer }
    );

  useEffect(() => {
    if (influencersData?.influencers && influencersData.influencers.length > 0) {
      setSelectedInfluencer(influencersData.influencers[0].id);
    }
  }, [influencersData]);

  const influencers = influencersData?.influencers || [];
  const currentInfluencer = influencers.find((inf) => inf.id === selectedInfluencer);
  const metrics = performanceData?.metrics;
  const posts = postsData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Dashboard de Influenciadoras
          </h1>
          <p className="text-slate-600">
            Monitore o desempenho em tempo real de suas influenciadoras autônomas
          </p>
        </div>

        {/* Influencers Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {influencers.map((influencer) => (
            <Card
              key={influencer.id}
              className={`cursor-pointer transition-all ${
                selectedInfluencer === influencer.id
                  ? "ring-2 ring-pink-500 bg-pink-50"
                  : "hover:shadow-lg"
              }`}
              onClick={() => setSelectedInfluencer(influencer.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{influencer.name}</CardTitle>
                  {influencer.isActive && (
                    <Badge className="bg-green-500">Ativa</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600">{influencer.personality}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Dashboard */}
        {currentInfluencer && (
          <div className="space-y-6">
            {/* Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    Seguidores
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.currentFollowers?.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    +{metrics?.followerGrowth || 0} este mês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Heart className="w-4 h-4 text-red-500" />
                    Engajamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.avgEngagementRate || "0"}%
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Taxa média de engajamento
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-green-500" />
                    Interações
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.totalEngagement?.toLocaleString() || "0"}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Total de interações
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-purple-500" />
                    Crescimento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metrics?.followerGrowth || 0}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Novos seguidores
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Posts Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status de Postagens</CardTitle>
                <CardDescription>
                  Acompanhe os posts agendados, publicados e em rascunho
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Agendados</p>
                        <p className="text-3xl font-bold text-blue-600">
                          {posts?.scheduled?.length || 0}
                        </p>
                      </div>
                      <Zap className="w-8 h-8 text-blue-500 opacity-50" />
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Publicados</p>
                        <p className="text-3xl font-bold text-green-600">
                          {posts?.published?.length || 0}
                        </p>
                      </div>
                      <Eye className="w-8 h-8 text-green-500 opacity-50" />
                    </div>
                  </div>

                  <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600">Rascunhos</p>
                        <p className="text-3xl font-bold text-amber-600">
                          {posts?.drafts?.length || 0}
                        </p>
                      </div>
                      <BarChart3 className="w-8 h-8 text-amber-500 opacity-50" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Influencer Bio */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre {currentInfluencer.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Personalidade</p>
                    <p className="text-slate-900">{currentInfluencer.personality}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-600">Bio</p>
                    <p className="text-slate-900">{currentInfluencer.bio}</p>
                  </div>
                  <div className="pt-4 border-t">
                    <Button className="w-full bg-pink-600 hover:bg-pink-700">
                      Gerar Novo Conteúdo
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Posts */}
            {posts?.published && posts.published.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Posts Recentes Publicados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {posts.published.slice(0, 5).map((post: any) => (
                      <div
                        key={post.id}
                        className="flex items-start justify-between p-3 bg-slate-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">{post.caption}</p>
                          <div className="flex gap-2 mt-2">
                            {post.hashtags?.map((tag: string) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-xs text-slate-500 mt-2">
                            Plataforma: {post.platform}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {loadingInfluencers && (
          <div className="text-center py-12">
            <p className="text-slate-600">Carregando influenciadoras...</p>
          </div>
        )}
      </div>
    </div>
  );
}
