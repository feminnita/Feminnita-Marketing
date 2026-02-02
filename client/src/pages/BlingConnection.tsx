import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Loader2, LogOut, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function BlingConnection() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");

  // Get token status
  const { data: tokenStatus, isLoading: statusLoading, refetch: refetchStatus } = trpc.oauthCallbacks.getTokenStatus.useQuery(
    { platform: "bling" },
    { refetchInterval: 5000 } // Refetch every 5 seconds
  );

  // Sync products mutation
  const syncProductsMutation = trpc.blingSync.produtos.useMutation({
    onSuccess: () => {
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 3000);
    },
    onError: () => {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    },
  });

  // Sync orders mutation
  const syncOrdersMutation = trpc.blingSync.pedidos.useMutation({
    onSuccess: () => {
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 3000);
    },
    onError: () => {
      setSyncStatus("error");
      setTimeout(() => setSyncStatus("idle"), 3000);
    },
  });

  // Disconnect mutation
  const disconnectMutation = trpc.oauthCallbacks.disconnectPlatform.useMutation({
    onSuccess: () => {
      refetchStatus();
    },
  });

  const handleConnect = () => {
    setIsConnecting(true);
    // Generate OAuth URL and redirect
    const oauthUrl = `https://bling.com.br/oauth/authorize?client_id=${import.meta.env.VITE_BLING_CLIENT_ID}&redirect_uri=${window.location.origin}/api/oauth/bling/callback&response_type=code&scope=read:products,read:orders,read:contacts`;
    window.location.href = oauthUrl;
  };

  const handleSyncProducts = () => {
    setSyncStatus("syncing");
    syncProductsMutation.mutate({ accessToken: "", limite: 100 });
  };

  const handleSyncOrders = () => {
    setSyncStatus("syncing");
    syncOrdersMutation.mutate({ accessToken: "", limite: 100 });
  };

  const handleDisconnect = () => {
    disconnectMutation.mutate({ platform: "bling" });
  };

  if (statusLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Conexão Bling ERP</h1>
        <p className="text-gray-600 mt-2">
          Conecte sua conta Bling para sincronizar produtos, pedidos e contatos
        </p>
      </div>

      {/* Connection Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                {tokenStatus?.connected ? (
                  <>
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    Bling Conectado
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    Bling Desconectado
                  </>
                )}
              </CardTitle>
              <CardDescription>
                {tokenStatus?.connected
                  ? "Sua conta Bling está autorizada e sincronizada"
                  : "Clique em conectar para autorizar o acesso"}
              </CardDescription>
            </div>
            <Badge variant={tokenStatus?.connected ? "default" : "secondary"}>
              {tokenStatus?.connected ? "Ativo" : "Inativo"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {tokenStatus?.connected ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <p className="text-sm text-gray-600">Último uso</p>
                  <p className="text-lg font-semibold text-green-700">
                    {tokenStatus.lastUsed
                      ? new Date(tokenStatus.lastUsed).toLocaleString("pt-BR")
                      : "Nunca"}
                  </p>
                </div>
                <div className={`p-4 rounded-lg border ${tokenStatus.isExpired ? "bg-red-50 border-red-200" : "bg-blue-50 border-blue-200"}`}>
                  <p className="text-sm text-gray-600">Status do Token</p>
                  <p className={`text-lg font-semibold ${tokenStatus.isExpired ? "text-red-700" : "text-blue-700"}`}>
                    {tokenStatus.isExpired ? "Expirado" : "Válido"}
                  </p>
                </div>
              </div>

              {tokenStatus.isExpired && (
                <Alert className="bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Seu token expirou. Por favor, desconecte e conecte novamente para renovar.
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleDisconnect}
                  variant="destructive"
                  className="flex-1"
                  disabled={disconnectMutation.isPending}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Desconectar
                </Button>
              </div>
            </>
          ) : (
            <Button
              onClick={handleConnect}
              disabled={isConnecting}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Conectando...
                </>
              ) : (
                "Conectar com Bling"
              )}
            </Button>
          )}
        </CardContent>
      </Card>



      {/* Sync Controls Card */}
      {tokenStatus?.connected && (
        <Card>
          <CardHeader>
            <CardTitle>Sincronização de Dados</CardTitle>
            <CardDescription>
              Sincronize seus produtos e pedidos do Bling
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {syncStatus === "success" && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Sincronização concluída com sucesso!
                </AlertDescription>
              </Alert>
            )}

            {syncStatus === "error" && (
              <Alert className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Erro ao sincronizar. Tente novamente.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={handleSyncProducts}
                disabled={syncStatus === "syncing" || syncProductsMutation.isPending}
                variant="outline"
              >
                {syncStatus === "syncing" && syncProductsMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sincronizar Produtos
                  </>
                )}
              </Button>

              <Button
                onClick={handleSyncOrders}
                disabled={syncStatus === "syncing" || syncOrdersMutation.isPending}
                variant="outline"
              >
                {syncStatus === "syncing" && syncOrdersMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sincronizando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Sincronizar Pedidos
                  </>
                )}
              </Button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Dica:</strong> A sincronização também ocorre automaticamente quando novos dados chegam via webhooks do Bling.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Help Card */}
      <Card className="bg-gray-50">
        <CardHeader>
          <CardTitle>❓ Precisa de Ajuda?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-gray-900">Como conectar?</p>
            <p className="text-gray-700">
              Clique em "Conectar com Bling" e autorize o acesso. Você será redirecionado de volta automaticamente.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Meus dados são seguros?</p>
            <p className="text-gray-700">
              Sim! Usamos OAuth 2.0 e seus tokens são criptografados no banco de dados. Nunca armazenamos sua senha.
            </p>
          </div>
          <div>
            <p className="font-semibold text-gray-900">Com que frequência sincroniza?</p>
            <p className="text-gray-700">
              A sincronização é automática via webhooks. Você também pode sincronizar manualmente clicando nos botões acima.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
