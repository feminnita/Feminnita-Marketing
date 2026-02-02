import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Trash2, Eye, EyeOff } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const PLATFORMS = [
  { id: "bling", name: "Bling ERP", icon: "📦", color: "bg-blue-50 border-blue-200" },
  { id: "canva", name: "Canva", icon: "🎨", color: "bg-purple-50 border-purple-200" },
  { id: "meta", name: "Meta (Facebook & Instagram)", icon: "📱", color: "bg-blue-50 border-blue-200" },
  { id: "tiktok", name: "TikTok", icon: "🎵", color: "bg-black/5 border-black/10" },
  { id: "google_drive", name: "Google Drive", icon: "☁️", color: "bg-yellow-50 border-yellow-200" },
  { id: "whatsapp", name: "WhatsApp Business", icon: "💬", color: "bg-green-50 border-green-200" },
  { id: "email_marketing", name: "Email Marketing", icon: "📧", color: "bg-red-50 border-red-200" },
  { id: "tray", name: "Tray", icon: "🛒", color: "bg-orange-50 border-orange-200" },
];

export default function ConfigureCredentials() {
  const { user } = useAuth();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [showSecrets, setShowSecrets] = useState(false);
  const [formData, setFormData] = useState({
    clientId: "",
    clientSecret: "",
    accessToken: "",
  });

  const { data: credentials } = trpc.oauthCredentials.listCredentials.useQuery();
  const saveCredentialsMutation = trpc.oauthCredentials.saveCredentials.useMutation();
  const deleteCredentialsMutation = trpc.oauthCredentials.deleteCredentials.useMutation();
  const validateCredentialsMutation = trpc.oauthCredentials.validateCredentials.useMutation();

  const handlePlatformSelect = (platformId: string) => {
    setSelectedPlatform(platformId);
    setFormData({ clientId: "", clientSecret: "", accessToken: "" });
  };

  const handleSaveCredentials = async () => {
    if (!selectedPlatform) return;

    try {
      await saveCredentialsMutation.mutateAsync({
        platform: selectedPlatform as any,
        clientId: formData.clientId || undefined,
        clientSecret: formData.clientSecret || undefined,
        accessToken: formData.accessToken || undefined,
      });

      setFormData({ clientId: "", clientSecret: "", accessToken: "" });
      setSelectedPlatform(null);
    } catch (error) {
      console.error("Erro ao salvar credenciais:", error);
    }
  };

  const handleDeleteCredentials = async (platform: string) => {
    if (confirm(`Deseja deletar as credenciais de ${platform}?`)) {
      try {
        await deleteCredentialsMutation.mutateAsync({
          platform: platform as any,
        });
      } catch (error) {
        console.error("Erro ao deletar credenciais:", error);
      }
    }
  };

  const handleValidateCredentials = async (platform: string) => {
    try {
      await validateCredentialsMutation.mutateAsync({
        platform: platform as any,
      });
    } catch (error) {
      console.error("Erro ao validar credenciais:", error);
    }
  };

  const platformData = PLATFORMS.find((p) => p.id === selectedPlatform);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Configurar Credenciais</h1>
          <p className="text-slate-600">Gerencie as credenciais OAuth de suas integrações</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Plataformas */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Plataformas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {PLATFORMS.map((platform) => {
                  const isConnected = credentials?.some((c) => c.platform === platform.id && c.isConnected);
                  return (
                    <button
                      key={platform.id}
                      onClick={() => handlePlatformSelect(platform.id)}
                      className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                        selectedPlatform === platform.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">{platform.icon}</span>
                          <span className="font-medium text-sm">{platform.name}</span>
                        </div>
                        {isConnected && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      </div>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-2">
            {selectedPlatform && platformData ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{platformData.icon}</span>
                    <div>
                      <CardTitle>{platformData.name}</CardTitle>
                      <CardDescription>Configure as credenciais OAuth</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Guia de instrução */}
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {selectedPlatform === "bling" && (
                        <>
                          Para obter as credenciais do Bling, acesse{" "}
                          <a href="https://bling.com.br" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                            bling.com.br
                          </a>
                          , vá em Desenvolvedor/API e crie uma nova aplicação.
                        </>
                      )}
                      {selectedPlatform === "canva" && (
                        <>
                          Para obter as credenciais do Canva, acesse{" "}
                          <a href="https://www.canva.com/developers" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                            Canva Developers
                          </a>
                          .
                        </>
                      )}
                      {selectedPlatform === "meta" && (
                        <>
                          Para obter as credenciais do Meta, acesse{" "}
                          <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline font-medium">
                            Meta Developers
                          </a>
                          .
                        </>
                      )}
                      {!["bling", "canva", "meta"].includes(selectedPlatform) && (
                        <>Insira as credenciais OAuth para {platformData.name}</>
                      )}
                    </AlertDescription>
                  </Alert>

                  {/* Client ID */}
                  <div>
                    <Label htmlFor="clientId">Client ID</Label>
                    <Input
                      id="clientId"
                      placeholder="Cole seu Client ID aqui..."
                      value={formData.clientId}
                      onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  {/* Client Secret */}
                  <div>
                    <Label htmlFor="clientSecret">Client Secret</Label>
                    <div className="relative mt-1">
                      <Input
                        id="clientSecret"
                        type={showSecrets ? "text" : "password"}
                        placeholder="Cole seu Client Secret aqui..."
                        value={formData.clientSecret}
                        onChange={(e) => setFormData({ ...formData, clientSecret: e.target.value })}
                      />
                      <button
                        onClick={() => setShowSecrets(!showSecrets)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                      >
                        {showSecrets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Access Token (opcional) */}
                  <div>
                    <Label htmlFor="accessToken">Access Token (opcional)</Label>
                    <Input
                      id="accessToken"
                      type={showSecrets ? "text" : "password"}
                      placeholder="Cole seu Access Token aqui..."
                      value={formData.accessToken}
                      onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                      className="mt-1"
                    />
                  </div>

                  {/* Botões */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={handleSaveCredentials}
                      disabled={saveCredentialsMutation.isPending}
                      className="flex-1"
                    >
                      {saveCredentialsMutation.isPending ? "Salvando..." : "Salvar Credenciais"}
                    </Button>
                    <Button
                      onClick={() => handleValidateCredentials(selectedPlatform)}
                      disabled={validateCredentialsMutation.isPending}
                      variant="outline"
                    >
                      {validateCredentialsMutation.isPending ? "Validando..." : "Validar"}
                    </Button>
                  </div>

                  {/* Mensagens de sucesso/erro */}
                  {saveCredentialsMutation.isSuccess && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        {saveCredentialsMutation.data?.message}
                      </AlertDescription>
                    </Alert>
                  )}
                  {validateCredentialsMutation.isSuccess && (
                    <Alert className="bg-green-50 border-green-200">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        {validateCredentialsMutation.data?.message}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-slate-500">Selecione uma plataforma para configurar suas credenciais</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Credenciais Salvas */}
        {credentials && credentials.length > 0 && (
          <div className="mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Credenciais Configuradas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {credentials.map((cred) => {
                const platform = PLATFORMS.find((p) => p.id === cred.platform);
                return (
                  <Card key={cred.id} className={`border-2 ${platform?.color}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{platform?.icon}</span>
                          <div>
                            <CardTitle className="text-base">{platform?.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {cred.isConnected ? (
                                <span className="text-green-600 flex items-center gap-1">
                                  <CheckCircle2 className="w-3 h-3" /> Conectado
                                </span>
                              ) : (
                                <span className="text-amber-600">Não conectado</span>
                              )}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <p className="text-xs text-slate-600">
                        <strong>Client ID:</strong> {cred.clientId}
                      </p>
                      <p className="text-xs text-slate-600">
                        <strong>Criado em:</strong> {new Date(cred.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                      {cred.lastValidated && (
                        <p className="text-xs text-slate-600">
                          <strong>Validado em:</strong> {new Date(cred.lastValidated).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                      <Button
                        onClick={() => handleDeleteCredentials(cred.platform)}
                        disabled={deleteCredentialsMutation.isPending}
                        variant="destructive"
                        size="sm"
                        className="w-full mt-2"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Deletar
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
