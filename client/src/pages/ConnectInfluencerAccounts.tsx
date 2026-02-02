import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle2, Instagram, Music, Youtube, Globe, Loader2, Plus, Trash2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const INFLUENCERS = [
  { id: 1, name: "Carol", color: "bg-pink-100", textColor: "text-pink-700" },
  { id: 2, name: "Renata", color: "bg-purple-100", textColor: "text-purple-700" },
  { id: 3, name: "Vanessa", color: "bg-blue-100", textColor: "text-blue-700" },
  { id: 4, name: "Luiza", color: "bg-amber-100", textColor: "text-amber-700" },
];

const PLATFORMS = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-600" },
  { id: "tiktok", name: "TikTok", icon: Music, color: "text-black" },
  { id: "youtube", name: "YouTube", icon: Youtube, color: "text-red-600" },
  { id: "blog", name: "Blog", icon: Globe, color: "text-blue-600" },
];

export default function ConnectInfluencerAccounts() {
  const [selectedInfluencer, setSelectedInfluencer] = useState<number>(1);
  const [newAccount, setNewAccount] = useState({
    platform: "instagram",
    handle: "",
    token: "",
  });
  const [loading, setLoading] = useState(false);

  const influencer = INFLUENCERS.find((inf) => inf.id === selectedInfluencer);

  // Fetch accounts for selected influencer
  const { data: accountsData, isLoading: loadingAccounts, refetch } =
    trpc.influencerAccounts.getInfluencerAccounts.useQuery(
      { influencerId: selectedInfluencer },
      { enabled: !!selectedInfluencer }
    );

  // Add account mutation
  const addAccountMutation = trpc.influencerAccounts.addAccount.useMutation({
    onSuccess: () => {
      setNewAccount({ platform: "instagram", handle: "", token: "" });
      refetch();
    },
  });

  // Get connection status
  const { data: statusData } = trpc.influencerAccounts.getConnectionStatus.useQuery(
    { influencerId: selectedInfluencer },
    { enabled: !!selectedInfluencer }
  );

  const handleAddAccount = async () => {
    if (!newAccount.handle || !newAccount.token) {
      alert("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      await addAccountMutation.mutateAsync({
        influencerId: selectedInfluencer,
        platform: newAccount.platform as "instagram" | "tiktok" | "youtube" | "blog",
        accountHandle: newAccount.handle,
        accessToken: newAccount.token,
        accountId: `${newAccount.platform}_${Date.now()}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const accounts = accountsData?.accounts || [];
  const status = statusData?.platforms || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            Conectar Contas das Influenciadoras
          </h1>
          <p className="text-slate-600">
            Registre as contas reais de Instagram, TikTok, YouTube e Blog para cada influenciadora
          </p>
        </div>

        {/* Influencer Selection */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {INFLUENCERS.map((inf) => (
            <Card
              key={inf.id}
              className={`cursor-pointer transition-all ${
                selectedInfluencer === inf.id
                  ? "ring-2 ring-pink-500 bg-pink-50"
                  : "hover:shadow-lg"
              }`}
              onClick={() => setSelectedInfluencer(inf.id)}
            >
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg ${inf.textColor}`}>{inf.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">
                    {accounts.length} conta{accounts.length !== 1 ? "s" : ""}
                  </span>
                  {status.some((s) => s.isConnected) && (
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Connection Status */}
        {status && status.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Status de Conexão</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {status.map((platform) => (
                  <div
                    key={platform.platform}
                    className={`p-4 rounded-lg border-2 ${
                      platform.isConnected
                        ? "border-green-200 bg-green-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold capitalize text-sm">
                        {platform.platform}
                      </span>
                      {platform.isConnected ? (
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    {platform.isConnected && (
                      <>
                        <p className="text-xs text-slate-600">
                          {platform.followers.toLocaleString()} seguidores
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Sincronizado há {getTimeAgo(platform.lastSync)}
                        </p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Current Accounts */}
        {accounts.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Contas Conectadas de {influencer?.name}</CardTitle>
              <CardDescription>
                {accounts.length} conta{accounts.length !== 1 ? "s" : ""} registrada{accounts.length !== 1 ? "s" : ""}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map((account: any) => (
                  <div
                    key={account.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">
                          @{account.accountHandle}
                        </p>
                        <p className="text-sm text-slate-600 capitalize">
                          {account.platform}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          Conectado em {new Date(account.connectedAt).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                      {account.followers && (
                        <div className="text-right">
                          <p className="text-2xl font-bold text-pink-600">
                            {(account.followers / 1000).toFixed(1)}K
                          </p>
                          <p className="text-xs text-slate-600">seguidores</p>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add New Account */}
        <Card>
          <CardHeader>
            <CardTitle>Adicionar Nova Conta</CardTitle>
            <CardDescription>
              Conecte uma nova conta de rede social para {influencer?.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Platform Selection */}
            <div>
              <label className="text-sm font-semibold text-slate-900 mb-3 block">
                Plataforma
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PLATFORMS.map((platform) => {
                  const Icon = platform.icon;
                  return (
                    <button
                      key={platform.id}
                      onClick={() =>
                        setNewAccount({ ...newAccount, platform: platform.id })
                      }
                      className={`p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                        newAccount.platform === platform.id
                          ? "border-pink-500 bg-pink-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${platform.color}`} />
                      <span className="text-sm font-medium">{platform.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Account Handle */}
            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">
                Nome da Conta (@username)
              </label>
              <Input
                placeholder={`Ex: ${influencer?.name.toLowerCase()}_feminnita`}
                value={newAccount.handle}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, handle: e.target.value })
                }
                className="border-slate-300"
              />
            </div>

            {/* Access Token */}
            <div>
              <label className="text-sm font-semibold text-slate-900 mb-2 block">
                Token de Acesso
              </label>
              <Input
                type="password"
                placeholder="Cole o token de acesso da API"
                value={newAccount.token}
                onChange={(e) =>
                  setNewAccount({ ...newAccount, token: e.target.value })
                }
                className="border-slate-300 font-mono text-xs"
              />
              <p className="text-xs text-slate-500 mt-2">
                Obtenha o token nas configurações de desenvolvedor da plataforma
              </p>
            </div>

            {/* Info Alert */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Os tokens são armazenados com segurança e nunca são exibidos após o registro.
                Você pode desconectar a conta a qualquer momento.
              </AlertDescription>
            </Alert>

            {/* Add Button */}
            <Button
              onClick={handleAddAccount}
              disabled={loading || !newAccount.handle || !newAccount.token}
              className="w-full bg-pink-600 hover:bg-pink-700"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Conectar Conta
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">Como Obter Tokens de Acesso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-blue-900">
            <div>
              <p className="font-semibold mb-1">Instagram:</p>
              <p>Acesse Meta Business Suite → Configurações → Tokens de Desenvolvedor</p>
            </div>
            <div>
              <p className="font-semibold mb-1">TikTok:</p>
              <p>Acesse TikTok Developer Portal → Criar Aplicativo → Gerar Token</p>
            </div>
            <div>
              <p className="font-semibold mb-1">YouTube:</p>
              <p>Acesse Google Cloud Console → Criar Credenciais OAuth 2.0</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Blog:</p>
              <p>Gere uma chave de API no painel de administração do seu blog</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (hours < 1) return "menos de 1 hora";
  if (hours < 24) return `${hours}h atrás`;
  if (days < 7) return `${days}d atrás`;
  return "mais de 1 semana";
}
