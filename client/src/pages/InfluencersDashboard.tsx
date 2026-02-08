import { useState } from "react";
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
    facebook: string;
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
    Carol: { instagram: "", tiktok: "", youtube: "", facebook: "", email: "", whatsapp: "" },
    Renata: { instagram: "", tiktok: "", youtube: "", facebook: "", email: "", whatsapp: "" },
    Vanessa: { instagram: "", tiktok: "", youtube: "", facebook: "", email: "", whatsapp: "" },
    Luiza: { instagram: "", tiktok: "", youtube: "", facebook: "", email: "", whatsapp: "" },
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

  // Fetch influencer accounts
  const { data: accountsData, isLoading: accountsLoading } = trpc.influencerAccounts.getAccounts.useQuery(
    { influencerId: selectedInfluencer || 1 },
    { enabled: !!selectedInfluencer }
  );

  // Mutation to save accounts
  const saveAccountsMutation = trpc.influencerAccounts.saveAccounts.useMutation({
    onSuccess: (result) => {
      console.log("[InfluencersDashboard] SUCCESS - Resultado:", result);
      toast.success("✅ Contas salvas com sucesso!", {
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
      toast.error("❌ Erro ao salvar contas: " + (error.message || "Erro desconhecido"), {
        duration: 3000,
        position: "top-right",
      });
    },
  });

  const handleSaveAccounts = async (influencerName: string) => {
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
        ...(influencerAccounts.facebook && { facebook: influencerAccounts.facebook }),
        ...(influencerAccounts.email && { email: influencerAccounts.email }),
        ...(influencerAccounts.whatsapp && { whatsapp: influencerAccounts.whatsapp }),
      };

      console.log("Enviando dados:", accountsData);

      // Chamar a mutacao
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
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciar Influenciadoras</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {(['dashboard', 'contas', 'emails', 'temas'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-pink-600 text-pink-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.keys(INFLUENCER_IDS).map((name) => (
            <Card key={name} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedInfluencer(INFLUENCER_IDS[name])}>
              <CardHeader>
                <CardTitle className="text-lg">{name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Users className="w-4 h-4 text-slate-600" />
                  <span>Seguidores: {performanceData?.metrics?.currentFollowers || 0}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-slate-600" />
                  <span>Engajamento: {performanceData?.metrics?.avgEngagementRate || 0}%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Contas Tab */}
      {activeTab === 'contas' && (
        <div className="space-y-6">
          {Object.keys(INFLUENCER_IDS).map((influencerName) => (
            <Card key={influencerName}>
              <CardHeader>
                <CardTitle>{influencerName}</CardTitle>
                <CardDescription>Gerenciar contas de redes sociais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {['instagram', 'tiktok', 'youtube', 'facebook'].map((platform) => (
                    <div key={platform}>
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {platform === 'facebook' ? 'Facebook/Blog' : platform}
                      </label>
                      <Input
                        placeholder={`@${influencerName.toLowerCase()}_${platform}`}
                        value={accounts[influencerName]?.[platform as keyof typeof accounts[string]] ?? ""}
                        onChange={(e) => handleAccountChange(influencerName, platform, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <Input
                      type="email"
                      placeholder={`${influencerName.toLowerCase()}@email.com`}
                      value={accounts[influencerName]?.email ?? ""}
                      onChange={(e) => handleAccountChange(influencerName, 'email', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">WhatsApp</label>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={accounts[influencerName]?.whatsapp ?? ""}
                      onChange={(e) => handleAccountChange(influencerName, 'whatsapp', e.target.value)}
                    />
                  </div>
                </div>

                <Button
                  onClick={() => handleSaveAccounts(influencerName)}
                  disabled={savingInfluencer === influencerName}
                  className="w-full bg-pink-600 hover:bg-pink-700"
                >
                  {savingInfluencer === influencerName ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Salvando...
                    </>
                  ) : savedInfluencer === influencerName ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Salvo!
                    </>
                  ) : (
                    'Salvar Contas'
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Emails Tab */}
      {activeTab === 'emails' && (
        <div className="space-y-4">
          {Object.keys(INFLUENCER_IDS).map((name) => (
            <Card key={name}>
              <CardHeader>
                <CardTitle className="text-lg">{name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded border">
                  <span className="font-mono text-sm">{accounts[name]?.email || 'Não configurado'}</span>
                  {accounts[name]?.email && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopyEmail(accounts[name].email, name)}
                    >
                      {copiedEmail === name ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Temas Tab */}
      {activeTab === 'temas' && (
        <Card>
          <CardHeader>
            <CardTitle>Temas e Estilos</CardTitle>
            <CardDescription>Personalize a aparência das páginas das influenciadoras</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600">Funcionalidade em desenvolvimento...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
