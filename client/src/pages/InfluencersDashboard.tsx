import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { Users, TrendingUp, MessageCircle, Heart, Share2, Eye, BarChart3, Zap } from "lucide-react";

export default function InfluencersDashboard() {
  const [selectedInfluencer, setSelectedInfluencer] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contas' | 'temas'>('dashboard');
  const [accountsData, setAccountsData] = useState<Record<string, Record<string, string>>>({});
  const [savingInfluencer, setSavingInfluencer] = useState<string | null>(null);

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

  // Mutation to save accounts
  const saveAccountsMutation = trpc.influencerAccounts.addAccount.useMutation();

  const handleSaveAccounts = async (influencerName: string) => {
    setSavingInfluencer(influencerName);
    try {
      const accounts = accountsData[influencerName];
      if (!accounts || Object.values(accounts).every(v => !v)) {
        alert("Preencha pelo menos uma conta");
        setSavingInfluencer(null);
        return;
      }

      const influencer = influencers.find(inf => inf.name === influencerName);
      if (!influencer) {
        alert("Influenciadora não encontrada");
        setSavingInfluencer(null);
        return;
      }

      for (const [platform, username] of Object.entries(accounts)) {
        if (username) {
          await saveAccountsMutation.mutateAsync({
            influencerId: influencer.id,
            platform: platform.toLowerCase() as any,
            accountHandle: username,
            accountId: `${platform}_${Date.now()}`,
            accessToken: `token_${platform}_${Date.now()}`,
          });
        }
      }

      alert(`Contas de ${influencerName} salvas com sucesso!`);
      setAccountsData(prev => ({ ...prev, [influencerName]: {} }));
    } catch (error: any) {
      alert(error.message || "Erro ao salvar contas");
    } finally {
      setSavingInfluencer(null);
    }
  };

  const handleAccountChange = (influencerName: string, platform: string, value: string) => {
    setAccountsData(prev => ({
      ...prev,
      [influencerName]: {
        ...prev[influencerName],
        [platform]: value,
      },
    }));
  };

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
        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'dashboard'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('contas')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'contas'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Conectar Contas
          </button>
          <button
            onClick={() => setActiveTab('temas')}
            className={`px-4 py-2 font-semibold transition-colors ${
              activeTab === 'temas'
                ? 'text-pink-600 border-b-2 border-pink-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Aprovar Temas
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
        <>
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
        </>
        )}

        {/* Conectar Contas Tab */}
        {activeTab === 'contas' && (
          <Card>
            <CardHeader>
              <CardTitle>Conectar Contas das Influenciadoras</CardTitle>
              <CardDescription>
                Registre as contas reais de Instagram, TikTok, YouTube e Blog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Como conectar:</strong> Forneça o nome da conta (@username) e o token de acesso de cada plataforma. Os tokens são armazenados com segurança.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Carol', 'Renata', 'Vanessa', 'Luiza'].map((name) => (
                    <div key={name} className="p-4 border border-slate-200 rounded-lg">
                      <h3 className="font-semibold text-slate-900 mb-3">{name}</h3>
                      <div className="space-y-3">
                        {['Instagram', 'TikTok', 'YouTube', 'Blog'].map((platform) => (
                          <div key={platform}>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">
                              {platform}
                            </label>
                            <input
                              type="text"
                              placeholder={`@${name.toLowerCase()}_${platform.toLowerCase()}`}
                              value={accountsData[name]?.[platform] || ""}
                              onChange={(e) => handleAccountChange(name, platform, e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-slate-300 rounded"
                            />
                          </div>
                        ))}
                      </div>
                      <button 
                        onClick={() => handleSaveAccounts(name)}
                        disabled={savingInfluencer === name}
                        className="w-full mt-4 px-3 py-2 bg-pink-600 text-white text-sm font-semibold rounded hover:bg-pink-700 disabled:opacity-50"
                      >
                        {savingInfluencer === name ? "Salvando..." : "Salvar Contas"}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aprovar Temas Tab */}
        {activeTab === 'temas' && (
          <Card>
            <CardHeader>
              <CardTitle>Aprovar Temas e Modelos</CardTitle>
              <CardDescription>
                Revise e aprove os temas para postagem das influenciadoras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-900">
                    <strong>Próximas postagens:</strong> Terças e sextas às 14:00
                  </p>
                </div>
                <div className="space-y-3">
                  {[
                    { theme: 'Verão 2026', model: 'Coleção Premium', influencer: 'Carol', status: 'pending' },
                    { theme: 'Conforto e Estilo', model: 'Básico', influencer: 'Renata', status: 'approved' },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border-2 ${
                        item.status === 'approved'
                          ? 'border-green-200 bg-green-50'
                          : 'border-amber-200 bg-amber-50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-semibold text-slate-900">{item.theme}</h4>
                          <p className="text-sm text-slate-600 mt-1">
                            Modelo: {item.model} | {item.influencer}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            item.status === 'approved'
                              ? 'bg-green-200 text-green-800'
                              : 'bg-amber-200 text-amber-800'
                          }`}
                        >
                          {item.status === 'approved' ? 'Aprovado' : 'Pendente'}
                        </span>
                      </div>
                      {item.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button className="flex-1 px-3 py-2 bg-green-600 text-white text-sm font-semibold rounded hover:bg-green-700">
                            Aprovar
                          </button>
                          <button className="flex-1 px-3 py-2 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700">
                            Rejeitar
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
