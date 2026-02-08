import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Users, TrendingUp, Heart, BarChart3, Loader2, Mail, Copy, Check, MessageCircle } from "lucide-react";
import { toast } from "sonner";

interface InfluencerAccounts {
  [key: string]: {
    instagram: string;
    tiktok: string;
    youtube: string;
    blog: string;
    email: string;
    whatsapp: string;
  };
}

// Mapeamento de nomes para IDs das influenciadoras
const INFLUENCER_IDS: { [key: string]: number } = {
  Carol: 1,
  Renata: 2,
  Vanessa: 3,
  Luiza: 4,
};

export default function InfluencersDashboard() {
  const [selectedInfluencer, setSelectedInfluencer] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'contas' | 'emails' | 'temas'>('dashboard');
  const [accounts, setAccounts] = useState<InfluencerAccounts>({
    Carol: { instagram: "", tiktok: "", youtube: "", blog: "", email: "", whatsapp: "" },
    Renata: { instagram: "", tiktok: "", youtube: "", blog: "", email: "", whatsapp: "" },
    Vanessa: { instagram: "", tiktok: "", youtube: "", blog: "", email: "", whatsapp: "" },
    Luiza: { instagram: "", tiktok: "", youtube: "", blog: "", email: "", whatsapp: "" },
  });
  const [savingInfluencer, setSavingInfluencer] = useState<string | null>(null);
  const [savedInfluencer, setSavedInfluencer] = useState<string | null>(null);
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
  const saveAccountsMutation = trpc.influencerAccounts.saveAccounts.useMutation({
    onSuccess: (result) => {
      console.log("[InfluencersDashboard] SUCCESS - Resultado:", result);
      toast.success(" Contas salvas com sucesso!", {
        duration: 3000,
        position: "top-right",
      });
      // Mostrar indicador visual de sucesso
      if (savingInfluencer) {
        setSavedInfluencer(savingInfluencer);
        setTimeout(() => setSavedInfluencer(null), 2000);
      }
    },
    onError: (error) => {
      console.error("[InfluencersDashboard] ERROR - Erro:", error);
      toast.error(" Erro ao salvar contas: " + (error.message || "Erro desconhecido"), {
        duration: 3000,
        position: "top-right",
      });
    },
  });

  const handleSaveAccounts = async (influencerName: string) => {
    // Prevenir comportamento padrão
    setSavingInfluencer(influencerName);
    
    try {
      const influencerAccounts = accounts[influencerName];
      
      if (!influencerAccounts) {
        toast.error("Influenciadora não encontrada");
        setSavingInfluencer(null);
        return;
      }

      // Verificar se pelo menos um campo foi preenchido
      const hasAnyValue = Object.values(influencerAccounts).some(v => v && v.trim());
      if (!hasAnyValue) {
        toast.error("Preencha pelo menos uma conta");
        setSavingInfluencer(null);
        return;
      }

      // Obter o ID da influenciadora
      const influencerId = INFLUENCER_IDS[influencerName];
      if (!influencerId) {
        toast.error(`Influenciadora "${influencerName}" não encontrada`);
        setSavingInfluencer(null);
        return;
      }

      // Preparar dados para enviar (apenas campos preenchidos)
      const accountsData = {
        influencerId,
        ...(influencerAccounts.instagram && { instagram: influencerAccounts.instagram }),
        ...(influencerAccounts.tiktok && { tiktok: influencerAccounts.tiktok }),
        ...(influencerAccounts.youtube && { youtube: influencerAccounts.youtube }),
        ...(influencerAccounts.blog && { blog: influencerAccounts.blog }),
        ...(influencerAccounts.email && { email: influencerAccounts.email }),
        ...(influencerAccounts.whatsapp && { whatsapp: influencerAccounts.whatsapp }),
      };

      console.log("Enviando dados:", accountsData);

      // Chamar a mutação
      await saveAccountsMutation.mutateAsync(accountsData);

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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Dashboard de Influenciadoras</h1>
            <p className="text-slate-600 mt-1">Monitore o desempenho em tempo real de suas influenciadoras autônomas</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-200">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'contas', label: 'Conectar Contas', icon: Users },
            { id: 'emails', label: 'Gerenciar Emails', icon: Mail },
            { id: 'temas', label: 'Aprovar Temas', icon: MessageCircle },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 font-medium flex items-center gap-2 border-b-2 transition ${
                activeTab === tab.id
                  ? 'border-pink-600 text-pink-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Dashboard de Influenciadoras
              </CardTitle>
              <CardDescription>
                Monitore o desempenho em tempo real de suas influenciadoras autônomas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Influencer Selection */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Selecione uma Influenciadora
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {influencers.map((influencer) => (
                      <button
                        key={influencer.id}
                        onClick={() => setSelectedInfluencer(influencer.id)}
                        className={`p-3 rounded-lg border-2 transition font-medium ${
                          selectedInfluencer === influencer.id
                            ? 'border-pink-600 bg-pink-50 text-pink-600'
                            : 'border-slate-200 bg-white text-slate-900 hover:border-pink-300'
                        }`}
                      >
                        {influencer.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Metrics Grid */}
                {currentInfluencer && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-600">Seguidores</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {metrics?.followers?.toLocaleString() || "N/A"}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <Heart className="w-8 h-8 text-pink-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-600">Engajamento</p>
                          <p className="text-2xl font-bold text-pink-600">
                            {metrics?.engagement?.toFixed(1) || "N/A"}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-600">Posts</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {posts?.length || 0}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="pt-6">
                        <div className="text-center">
                          <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="text-sm text-slate-600">Taxa de Crescimento</p>
                          <p className="text-2xl font-bold text-green-600">
                            {metrics?.growthRate?.toFixed(1) || "N/A"}%
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Conectar Contas Tab */}
        {activeTab === 'contas' && (
          <Card>
            <CardHeader>
              <CardTitle>Conectar Contas das Influenciadoras</CardTitle>
              <CardDescription>
                Registre as contas reais de Instagram, TikTok, YouTube, Blog, Email e WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900">
                    <strong>Como conectar:</strong> Forneça o nome da conta (@username) de cada plataforma, email e WhatsApp. Os dados são armazenados com segurança.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['Carol', 'Renata', 'Vanessa', 'Luiza'].map((name) => (
                    <div key={name} className="p-4 border border-slate-200 rounded-lg bg-white">
                      <h3 className="font-semibold text-slate-900 mb-3">{name}</h3>
                      <div className="space-y-3">
                        {['instagram', 'tiktok', 'youtube', 'blog', 'email', 'whatsapp'].map((platform) => (
                          <div key={platform}>
                            <label className="text-xs font-semibold text-slate-600 mb-1 block">
                              {platform === 'email' ? 'Email' : platform === 'whatsapp' ? 'WhatsApp' : platform.charAt(0).toUpperCase() + platform.slice(1)}
                            </label>
                            <Input
                              type={platform === 'email' ? 'email' : platform === 'whatsapp' ? 'tel' : 'text'}
                              placeholder={
                                platform === 'email'
                                  ? `${name.toLowerCase()}@email.com`
                                  : platform === 'whatsapp'
                                  ? '+55 11 9 9999-9999'
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
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSaveAccounts(name);
                        }}
                        disabled={savingInfluencer === name || saveAccountsMutation.isPending}
                        className={`w-full mt-4 text-white transition ${
                          savedInfluencer === name
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-pink-600 hover:bg-pink-700'
                        }`}
                      >
                        {savingInfluencer === name ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Salvando...
                          </>
                        ) : savedInfluencer === name ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                             Salvo!
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
                Gerenciar Contatos das Influenciadoras
              </CardTitle>
              <CardDescription>
                Visualize e copie todos os emails e WhatsApp das influenciadoras em um só lugar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Carol', 'Renata', 'Vanessa', 'Luiza'].map((name) => {
                  const email = accounts[name]?.email;
                  const whatsapp = accounts[name]?.whatsapp;
                  return (
                    <div key={name} className="p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition">
                      <div className="mb-3">
                        <p className="font-semibold text-slate-900">{name}</p>
                      </div>
                      <div className="space-y-2">
                        {/* Email */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-600">Email</p>
                            <p className="font-mono text-sm text-slate-900">{email || "Não configurado"}</p>
                          </div>
                          {email && (
                            <button
                              onClick={() => handleCopyEmail(email, name)}
                              className="p-2 hover:bg-slate-100 rounded transition"
                            >
                              {copiedEmail === name ? (
                                <Check className="w-5 h-5 text-green-600" />
                              ) : (
                                <Copy className="w-5 h-5 text-slate-400" />
                              )}
                            </button>
                          )}
                        </div>

                        {/* WhatsApp */}
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-slate-600">WhatsApp</p>
                            <p className="font-mono text-sm text-slate-900">{whatsapp || "Não configurado"}</p>
                          </div>
                          {whatsapp && (
                            <button
                              onClick={() => handleCopyEmail(whatsapp, `${name}-wa`)}
                              className="p-2 hover:bg-slate-100 rounded transition"
                            >
                              {copiedEmail === `${name}-wa` ? (
                                <Check className="w-5 h-5 text-green-600" />
                              ) : (
                                <Copy className="w-5 h-5 text-slate-400" />
                              )}
                            </button>
                          )}
                        </div>
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
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Aprovar Temas de Conteúdo
              </CardTitle>
              <CardDescription>
                Revise e aprove os temas de conteúdo propostos pelas influenciadoras
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <MessageCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">Funcionalidade em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
