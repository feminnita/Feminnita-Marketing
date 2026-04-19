import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, Loader2, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";

export default function CanvaOAuth() {
  const [, setLocation] = useLocation();
  const [codeVerifier, setCodeVerifier] = useState<string | null>(null);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Get authorization URL
  const getAuthUrlQuery = trpc.canvaOAuth.getAuthorizationUrl.useQuery();
  const handleCallbackMutation = trpc.canvaOAuth.handleCallback.useMutation();
  const meQuery = trpc.auth.me.useQuery();

  // Check if we're returning from Canva OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const error = params.get("error");

    if (error) {
      toast.error(`Erro do Canva: ${error}`);
      return;
    }

    if (code) {
      const storedVerifier = sessionStorage.getItem("canva_code_verifier");
      if (!storedVerifier) {
        toast.error("Code verifier não encontrado. Por favor, tente novamente.");
        return;
      }

      handleCallback(code, storedVerifier);
    }
  }, []);

  // Handle OAuth callback
  const handleCallback = async (code: string, verifier: string) => {
    try {
      setIsAuthorizing(true);
      const result = await handleCallbackMutation.mutateAsync({
        code,
        codeVerifier: verifier,
        userId: meQuery.data?.id?.toString() || "1",
      });

      toast.success(result.message);
      setIsConnected(true);
      sessionStorage.removeItem("canva_code_verifier");
      
      // Redirect back to integrations page after 2 seconds
      setTimeout(() => {
        setLocation("/testar-integrações");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "Erro ao conectar Canva");
    } finally {
      setIsAuthorizing(false);
    }
  };

  // Start OAuth flow
  const handleAuthorize = async () => {
    try {
      setIsAuthorizing(true);
      const result = getAuthUrlQuery.data;
      if (!result) {
        toast.error("Erro ao gerar URL de autorização");
        setIsAuthorizing(false);
        return;
      }
      
      // Store code_verifier in session storage
      sessionStorage.setItem("canva_code_verifier", result.codeVerifier);
      setCodeVerifier(result.codeVerifier);

      // Redirect to Canva authorization URL
      window.location.href = result.authUrl;
    } catch (error: any) {
      toast.error(error.message || "Erro ao gerar URL de autorização");
      setIsAuthorizing(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Autorizar Canva</h1>
        <p className="text-muted-foreground mt-2">
          Conecte sua conta Canva para criar designs automaticamente
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Autorização OAuth do Canva</CardTitle>
              <CardDescription>
                Clique no botão abaixo para autorizar o acesso à sua conta Canva
              </CardDescription>
            </div>
            {isConnected && <Badge className="bg-green-500">Conectado</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Como funciona:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Clique em "Autorizar com Canva"</li>
                <li>Você será redirecionado para o Canva</li>
                <li>Faça login e autorize o acesso</li>
                <li>Você será redirecionado de volta automaticamente</li>
              </ol>
            </div>
          </div>

          {isAuthorizing && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
              <Loader2 className="w-5 h-5 text-yellow-600 animate-spin flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-semibold">Processando autorização...</p>
                <p>Aguarde enquanto conectamos sua conta Canva</p>
              </div>
            </div>
          )}

          {isConnected && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-green-800">
                <p className="font-semibold">Canva conectado com sucesso!</p>
                <p>Você será redirecionado em breve...</p>
              </div>
            </div>
          )}

          <Button
            onClick={handleAuthorize}
            disabled={isAuthorizing || isConnected}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {isAuthorizing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <ExternalLink className="w-4 h-4 mr-2" />
                Autorizar com Canva
              </>
            )}
          </Button>

          <div className="text-sm text-muted-foreground">
            <p>
              Você será redirecionado para o site do Canva para autorizar o acesso. Nenhuma senha será compartilhada conosco.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
