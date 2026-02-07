import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Users, TrendingUp, Heart, BarChart3, Loader2, Mail, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface InfluencerAccounts {
  [key: string]: {
    instagram: string;
    tiktok: string;
    youtube: string;
    blog: string;
    email: string;
  };
}

export default function InfluencersDashboard() {
  const [selectedInfluencer, setSelectedInfluencer] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contas' | 'emails' | 'temas'>('dashboard');
  const [accounts, setAccounts] = useState<InfluencerAccounts>({
    Carol: { instagram: "", tiktok: "", youtube: "", blog: "", email: "" },
    Renata: { instagram: "", tiktok: "", youtube: "", blog: "", email: "" },
    Vanessa: { instagram: "", tiktok: "", youtube: "", blog: "", email: "" },
    Luiza: { instagram: "", tiktok: "", youtube: "", blog: "", email: "" },
  });
  const [savingInfluencer, setSavingInfluencer] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

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

      // Prepare account data - only include fields that are not empty
      const accountsData: any = {
        influencerId: influencer.id,
      };

      // Map field names to match the backend schema
      if (influencerAccounts.instagram) accountsData.instagram = influencerAccounts.instagram;
      if (influencerAccounts.tiktok) accountsData.tiktok = influencerAccounts.tiktok;
      if (influencerAccounts.youtube) accountsData.youtube = influencerAccounts.youtube;
      if (influencerAccounts.blog) accountsData.blog = influencerAccounts.blog;
      if (influencerAccounts.email) accountsData.email = influencerAccounts.email;

      console.log("Saving accounts data:", accountsData);

      try {
        const result = await saveAccountsMutation.mutateAsync(accountsData);
        console.log("Save result:", result);
        toast.success(`Contas salvas com sucesso!`);
        // Clear the form
        setAccounts(prev => ({
          ...prev,
          [influencerName]: { instagram: "", tiktok: "", youtube: "", blog: "", email: "" }
        }));
      } catch (error) {
        console.error("Error saving accounts:", error);
        const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
        toast.error(`Erro ao salvar: ${errorMessage}`);
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

  const handleCopyEmail = (email: string, influencerName: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(influencerName);
    toast.success("Email copiado!");
    setTimeout(() => setCopiedEmail(null), 2000);
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
        <div className="flex gap-2 mb-8 border-b border-slate-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 font-semibold transition whitespace-nowrap ${activeTab === 'dashboard' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('contas')}
            className={`px-4 py-2 font-semibold transition whitespace-nowrap ${activeTab === 'contas' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Conectar Contas
          </button>
          <button
            onClick={() => setActiveTab('emails')}
            className={`px-4 py-2 font-semibold transition whitespace-nowrap ${activeTab === 'emails' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-slate-600 hover:text-slate-900'}`}
          >
            Gerenciar Emails
          </button>
          <button
            onClick={() => setActiveTab('temas')}
            className={`px-4 py-2 font-semibold transition whitespace-nowrap ${activeTab === 'temas' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-slate-600 hover:text-slate-900'}`}
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
                Registre as contas reais de Instagram, TikTok, YouTube, Blog e Email
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Como conectar:</strong> Forneça o nome da conta (@username) de cada plataforma e o email. Os dados são armazenados com segurança.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Carol', 'Renata', 'Vanessa', 'Luiza'].map((name) => (
                    <div key={name} className="p-4 border border-slate-200 rounded-lg bg-white">
                      <h3 className="font-semibold text-slate-900 mb-3">{name}</h3>
                      <div className="space-y-3">
                        {['instagram', 'tiktok', 'youtube', 'blog', 'email'].map((platform) => (
                          <div key={platform}>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">
                              {platform === 'email' ? 'Email' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </label>
                            <Input
                              type={platform === 'email' ? 'email' : 'text'}
                              placeholder={
                                platform === 'email'
                                  ? `${name.toLowerCase()}@email.com`
                                  : `@${name.toLowerCase()}_${platform}`
                              }
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

        {/* Gerenciar Emails Tab */}
        {activeTab === 'emails' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Gerenciar Emails das Influenciadoras
              </CardTitle>
              <CardDescription>
                Visualize e copie todos os emails das influenciadoras em um só lugar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Carol', 'Renata', 'Vanessa', 'Luiza'].map((name) => {
                  const email = accounts[name]?.email;
                  return (
                    <div key={name} className="p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900">{name}</h3>
                          <p className="text-sm text-slate-600 mt-1">
                            {email ? email : <span className="text-slate-400 italic">Email não configurado</span>}
                          </p>
                        </div>
                        {email && (
                          <Button
                            onClick={() => handleCopyEmail(email, name)}
                            variant="outline"
                            size="sm"
                            className="ml-4"
                          >
                            {copiedEmail === name ? (
                              <>
                                <Check className="w-4 h-4 mr-2 text-green-600" />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy className="w-4 h-4 mr-2" />
                                Copiar
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Aprovar Temas Tab */}
        {activeTab === 'temas' && (
          <Card>
            <CardHeader>
              <CardTitle>Aprovar Temas de Conteúdo</CardTitle>
              <CardDescription>
                Revise e aprove os temas propostos pelas influenciadoras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-slate-600">Funcionalidade em desenvolvimento...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
