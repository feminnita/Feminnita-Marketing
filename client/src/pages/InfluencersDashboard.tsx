import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Users, TrendingUp, Heart, BarChart3, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InfluencerAccounts {
  [key: string]: {
    instagram: string;
    tiktok: string;
    youtube: string;
    blog: string;
  };
}

export default function InfluencersDashboard() {
  const [selectedInfluencer, setSelectedInfluencer] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contas' | 'temas'>('dashboard');
  const [accounts, setAccounts] = useState<InfluencerAccounts>({
    Carol: { instagram: "", tiktok: "", youtube: "", blog: "" },
    Renata: { instagram: "", tiktok: "", youtube: "", blog: "" },
    Vanessa: { instagram: "", tiktok: "", youtube: "", blog: "" },
    Luiza: { instagram: "", tiktok: "", youtube: "", blog: "" },
  });
  const [savingInfluencer, setSavingInfluencer] = useState<string | null>(null);

  // Fetch all influencers
  const { data: influencersData, isLoading: influencersLoading } = trpc.autonomousInfluencers.listInfluencers.useQuery();

  // Fetch performance metrics
  const { data: performanceData } = trpc.autonomousInfluencers.getPerformanceMetrics.useQuery(
    { influencerId: selectedInfluencer || 1, days: 30 },
    { enabled: !!selectedInfluencer }
  );

  // Fetch scheduled posts
  const { data: postsData } = trpc.autonomousInfluencers.getScheduledPosts.useQuery(
    { influencerId: selectedInfluencer || 1 },
    { enabled: !!selectedInfluencer }
  );

  // Mutation to save accounts
  const saveAccountsMutation = trpc.influencerAccounts.saveAccounts.useMutation();

  const handleSaveAccounts = async (influencerName: string) => {
    setSavingInfluencer(influencerName);
    try {
      const influencerAccounts = accounts[influencerName];
      
      if (!influencerAccounts) {
        toast.error("Influenciadora não encontrada");
        setSavingInfluencer(null);
        return;
      }

      if (Object.values(influencerAccounts).every(v => !v)) {
        toast.error("Preencha pelo menos uma conta");
        setSavingInfluencer(null);
        return;
      }

      // Get influencer ID from the data
      const influencers = influencersData?.influencers || [];
      const influencer = influencers.find(inf => inf.name === influencerName);
      
      if (!influencer) {
        toast.error(`Influenciadora "${influencerName}" não encontrada no sistema`);
        setSavingInfluencer(null);
        return;
      }

      // Save each account
      let savedCount = 0;
      const accountsData: any = {
        influencerId: influencer.id,
      };

      for (const [platform, username] of Object.entries(influencerAccounts)) {
        if (username) {
          accountsData[platform.toLowerCase()] = username;
        }
      }

      try {
        await saveAccountsMutation.mutateAsync(accountsData);
        savedCount++;
      } catch (error) {
        console.error("Error saving accounts:", error);
      }

      if (savedCount > 0) {
        toast.success(`${savedCount} conta(s) salva(s) com sucesso!`);
        // Clear the form
        setAccounts(prev => ({
          ...prev,
          [influencerName]: { instagram: "", tiktok: "", youtube: "", blog: "" }
        }));
      } else {
        toast.error("Nenhuma conta foi salva");
      }
    } catch (error: any) {
      console.error("Erro ao salvar contas:", error);
      toast.error(`Erro ao salvar: ${error.message || "Erro desconhecido"}`);
    } finally {
      setSavingInfluencer(null);
    }
  };

  const handleAccountChange = (influencerName: string, platform: string, value: string) => {
    setAccounts(prev => ({
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
            className={`px-4 py-2 font-semibold transition ${activeTab === 'dashboard' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('contas')}
            className={`px-4 py-2 font-semibold transition ${activeTab === 'contas' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Conectar Contas
          </button>
          <button
            onClick={() => setActiveTab('temas')}
            className={`px-4 py-2 font-semibold transition ${activeTab === 'temas' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Aprovar Temas
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <Card>
            <CardHeader>
              <CardTitle>Dashboard de Influenciadoras</CardTitle>
              <CardDescription>
                Monitore o desempenho em tempo real de suas influenciadoras autônomas
              </CardDescription>
            </CardHeader>
            <CardContent>
              {influencersLoading ? (
                <div className="text-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-slate-400" />
                  <p className="text-slate-600 mt-2">Carregando influenciadoras...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    {influencers.map((inf) => (
                      <button
                        key={inf.id}
                        onClick={() => setSelectedInfluencer(inf.id)}
                        className={`p-4 rounded-lg border-2 transition ${
                          selectedInfluencer === inf.id
                            ? 'border-pink-600 bg-pink-50'
                            : 'border-slate-200 bg-white hover:border-pink-300'
                        }`}
                      >
                        <h3 className="font-semibold text-slate-900">{inf.name}</h3>
                        <p className="text-sm text-slate-600">{inf.personality}</p>
                      </button>
                    ))}
                  </div>

                  {currentInfluencer && (
                    <div className="space-y-4">
                      <div className="p-4 bg-gradient-to-r from-pink-50 to-orange-50 rounded-lg">
                        <h3 className="font-semibold text-slate-900 mb-2">{currentInfluencer.name}</h3>
                        <p className="text-sm text-slate-600">{currentInfluencer.personality}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-600">Seguidores</p>
                                <p className="text-2xl font-bold text-blue-600">{metrics?.currentFollowers || 0}</p>
                              </div>
                              <Users className="w-8 h-8 text-blue-400" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-red-50 to-red-100">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-600">Engajamento</p>
                                <p className="text-2xl font-bold text-red-600">{metrics?.totalEngagement || 0}</p>
                              </div>
                              <Heart className="w-8 h-8 text-red-400" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-green-50 to-green-100">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-600">Crescimento</p>
                                <p className="text-2xl font-bold text-green-600">{metrics?.followerGrowth || 0}%</p>
                              </div>
                              <TrendingUp className="w-8 h-8 text-green-400" />
                            </div>
                          </CardContent>
                        </Card>

                        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-slate-600">Posts</p>
                                <p className="text-2xl font-bold text-orange-600">{posts?.scheduled?.length || 0}</p>
                              </div>
                              <BarChart3 className="w-8 h-8 text-orange-400" />
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
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
                    <strong>Como conectar:</strong> Forneça o nome da conta (@username) de cada plataforma. Os dados são armazenados com segurança.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Carol', 'Renata', 'Vanessa', 'Luiza'].map((name) => (
                    <div key={name} className="p-4 border border-slate-200 rounded-lg bg-white">
                      <h3 className="font-semibold text-slate-900 mb-3">{name}</h3>
                      <div className="space-y-3">
                        {['instagram', 'tiktok', 'youtube', 'blog'].map((platform) => (
                          <div key={platform}>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">
                              {platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </label>
                            <Input
                              type="text"
                              placeholder={`@${name.toLowerCase()}_${platform}`}
                              value={accounts[name]?.[platform as keyof typeof accounts[string]] || ""}
                              onChange={(e) => handleAccountChange(name, platform, e.target.value)}
                              className="w-full"
                            />
                          </div>
                        ))}
                      </div>
                      <Button
                        onClick={() => handleSaveAccounts(name)}
                        disabled={savingInfluencer === name}
                        className="w-full mt-4 bg-pink-600 hover:bg-pink-700 text-white"
                      >
                        {savingInfluencer === name ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : (
                          "Salvar Contas"
                        )}
                      </Button>
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
              <p className="text-slate-600">Nenhum tema pendente de aprovação no momento.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
