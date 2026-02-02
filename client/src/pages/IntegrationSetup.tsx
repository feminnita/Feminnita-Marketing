import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function IntegrationSetup() {
  const [blingApiKey, setBlingApiKey] = useState("");
  const [canvaClientId, setCanvaClientId] = useState("OC-AZwe5Lb9Mj6o");
  const [canvaClientSecret, setCanvaClientSecret] = useState("CANVA_CLIENT_SECRET_REMOVED");
  const [metaAppId, setMetaAppId] = useState("");
  const [metaAppSecret, setMetaAppSecret] = useState("");

  const { data: integrations, isLoading, refetch } = trpc.integrations.getStatus.useQuery();
  const connectBlingMutation = trpc.integrations.connectBling.useMutation();
  const connectCanvaMutation = trpc.integrations.connectCanva.useMutation();
  const connectMetaMutation = trpc.integrations.connectMeta.useMutation();
  const disconnectMutation = trpc.integrations.disconnect.useMutation();

  const handleConnectBling = async () => {
    if (!blingApiKey.trim()) {
      toast.error("Informe a API Key do Bling");
      return;
    }

    try {
      await connectBlingMutation.mutateAsync({ apiKey: blingApiKey });
      toast.success("Bling conectado com sucesso!");
      setBlingApiKey("");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao conectar Bling");
    }
  };

  const handleConnectCanva = async () => {
    if (!canvaClientId.trim() || !canvaClientSecret.trim()) {
      toast.error("Informe Client ID e Client Secret do Canva");
      return;
    }

    try {
      await connectCanvaMutation.mutateAsync({
        clientId: canvaClientId,
        clientSecret: canvaClientSecret,
      });
      toast.success("Canva conectada com sucesso!");
      setCanvaClientId("");
      setCanvaClientSecret("");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao conectar Canva");
    }
  };

  const handleConnectMeta = async () => {
    if (!metaAppId.trim() || !metaAppSecret.trim()) {
      toast.error("Informe App ID e App Secret do Meta");
      return;
    }

    try {
      await connectMetaMutation.mutateAsync({
        appId: metaAppId,
        appSecret: metaAppSecret,
      });
      toast.success("Meta conectada com sucesso!");
      setMetaAppId("");
      setMetaAppSecret("");
      refetch();
    } catch (error: any) {
      toast.error(error.message || "Erro ao conectar Meta");
    }
  };

  const handleDisconnect = async (platform: "bling" | "canva" | "meta") => {
    try {
      await disconnectMutation.mutateAsync({ platform });
      toast.success(`${platform} desconectado com sucesso`);
      refetch();
    } catch (error: any) {
      toast.error(error.message || `Erro ao desconectar ${platform}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configurar Integrações</h1>
        <p className="text-gray-600 mt-2">Conecte suas contas de diferentes plataformas para automação completa</p>
      </div>

      {/* Bling Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>🔗 Bling ERP</span>
                {integrations?.bling?.connected && (
                  <Badge className="bg-green-500">Conectado</Badge>
                )}
              </CardTitle>
              <CardDescription>Sincronize produtos, pedidos e estoque</CardDescription>
            </div>
            {integrations?.bling?.connected && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDisconnect("bling")}
                disabled={disconnectMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Desconectar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {integrations?.bling?.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Bling conectado com sucesso</p>
                  <p className="text-sm text-green-700">Última sincronização: {integrations.bling.lastSync ? new Date(integrations.bling.lastSync).toLocaleString() : "Nunca"}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Não conectado</p>
                  <p className="text-sm text-yellow-700">Informe sua API Key do Bling para conectar</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">API Key do Bling</label>
                <Input
                  type="password"
                  value={blingApiKey}
                  onChange={(e) => setBlingApiKey(e.target.value)}
                  placeholder="Sua API Key do Bling"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Encontre sua API Key em: Bling → Configurações → Integrações → API
                </p>
              </div>

              <Button
                onClick={handleConnectBling}
                disabled={connectBlingMutation.isPending || !blingApiKey.trim()}
                className="w-full"
              >
                {connectBlingMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  "Conectar Bling"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Canva Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>🎨 Canva</span>
                {integrations?.canva?.connected && (
                  <Badge className="bg-green-500">Conectado</Badge>
                )}
              </CardTitle>
              <CardDescription>Crie designs automaticamente para posts e stories</CardDescription>
            </div>
            {integrations?.canva?.connected && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDisconnect("canva")}
                disabled={disconnectMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Desconectar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {integrations?.canva?.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Canva conectada com sucesso</p>
                  <p className="text-sm text-green-700">Pronto para criar designs automaticamente</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Não conectado</p>
                  <p className="text-sm text-yellow-700">Informe suas credenciais do Canva para conectar</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Client ID</label>
                <Input
                  value={canvaClientId}
                  onChange={(e) => setCanvaClientId(e.target.value)}
                  placeholder="OC-..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Client Secret</label>
                <Input
                  type="password"
                  value={canvaClientSecret}
                  onChange={(e) => setCanvaClientSecret(e.target.value)}
                  placeholder="Seu Client Secret"
                />
              </div>

              <Button
                onClick={handleConnectCanva}
                disabled={connectCanvaMutation.isPending || !canvaClientId.trim() || !canvaClientSecret.trim()}
                className="w-full"
              >
                {connectCanvaMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  "Conectar Canva"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meta Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>📱 Meta (Facebook & Instagram)</span>
                {integrations?.meta?.connected && (
                  <Badge className="bg-green-500">Conectado</Badge>
                )}
              </CardTitle>
              <CardDescription>Gerencie campanhas de anúncios e posts</CardDescription>
            </div>
            {integrations?.meta?.connected && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDisconnect("meta")}
                disabled={disconnectMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Desconectar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {integrations?.meta?.connected ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-4 bg-green-50 rounded-lg border border-green-200">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Meta conectada com sucesso</p>
                  <p className="text-sm text-green-700">Pronto para gerenciar campanhas e posts</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-2 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-900">Não conectado</p>
                  <p className="text-sm text-yellow-700">Informe suas credenciais do Meta para conectar</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">App ID</label>
                <Input
                  value={metaAppId}
                  onChange={(e) => setMetaAppId(e.target.value)}
                  placeholder="Seu App ID do Meta"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">App Secret</label>
                <Input
                  type="password"
                  value={metaAppSecret}
                  onChange={(e) => setMetaAppSecret(e.target.value)}
                  placeholder="Seu App Secret"
                />
              </div>

              <Button
                onClick={handleConnectMeta}
                disabled={connectMetaMutation.isPending || !metaAppId.trim() || !metaAppSecret.trim()}
                className="w-full"
              >
                {connectMetaMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  "Conectar Meta"
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
