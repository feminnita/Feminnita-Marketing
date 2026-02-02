import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export default function IntegrationSetup() {
  // Bling
  const [blingApiKey, setBlingApiKey] = useState("");
  const [blingTesting, setBlingTesting] = useState(false);
  const [blingConnected, setBlingConnected] = useState(false);

  // Canva
  const [canvaClientId, setCanvaClientId] = useState("OC-AZwe5Lb9Mj6o");
  const [canvaClientSecret, setCanvaClientSecret] = useState("CANVA_CLIENT_SECRET_REMOVED");
  const [canvaTesting, setCanvaTesting] = useState(false);
  const [canvaConnected, setCanvaConnected] = useState(false);

  // Meta
  const [metaAppId, setMetaAppId] = useState("");
  const [metaAppSecret, setMetaAppSecret] = useState("");
  const [metaTesting, setMetaTesting] = useState(false);
  const [metaConnected, setMetaConnected] = useState(false);

  // tRPC mutations
  const testBlingMutation = trpc.integrations.testBlingConnection.useMutation();
  const testCanvaMutation = trpc.integrations.testCanvaConnection.useMutation();
  const testMetaMutation = trpc.integrations.testMetaConnection.useMutation();

  const connectBlingMutation = trpc.integrations.connectBling.useMutation();
  const connectCanvaMutation = trpc.integrations.connectCanva.useMutation();
  const connectMetaMutation = trpc.integrations.connectMeta.useMutation();

  const disconnectMutation = trpc.integrations.disconnect.useMutation();

  // Test Bling
  const handleTestBling = async () => {
    if (!blingApiKey) {
      toast.error("Preencha a API Key do Bling");
      return;
    }

    setBlingTesting(true);
    try {
      const result = await testBlingMutation.mutateAsync({ apiKey: blingApiKey });
      if (result.success) {
        toast.success(result.message);
        setBlingConnected(true);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao testar Bling");
    } finally {
      setBlingTesting(false);
    }
  };

  // Save Bling
  const handleSaveBling = async () => {
    if (!blingApiKey) {
      toast.error("Preencha a API Key do Bling");
      return;
    }

    try {
      await connectBlingMutation.mutateAsync({ apiKey: blingApiKey });
      toast.success("Bling conectado com sucesso!");
      setBlingConnected(true);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar Bling");
    }
  };

  // Test Canva
  const handleTestCanva = async () => {
    if (!canvaClientId || !canvaClientSecret) {
      toast.error("Preencha Client ID e Client Secret do Canva");
      return;
    }

    setCanvaTesting(true);
    try {
      const result = await testCanvaMutation.mutateAsync({
        clientId: canvaClientId,
        clientSecret: canvaClientSecret,
      });
      if (result.success) {
        toast.success(result.message);
        setCanvaConnected(true);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao testar Canva");
    } finally {
      setCanvaTesting(false);
    }
  };

  // Save Canva
  const handleSaveCanva = async () => {
    if (!canvaClientId || !canvaClientSecret) {
      toast.error("Preencha Client ID e Client Secret do Canva");
      return;
    }

    try {
      await connectCanvaMutation.mutateAsync({
        clientId: canvaClientId,
        clientSecret: canvaClientSecret,
      });
      toast.success("Canva conectada com sucesso!");
      setCanvaConnected(true);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar Canva");
    }
  };

  // Test Meta
  const handleTestMeta = async () => {
    if (!metaAppId || !metaAppSecret) {
      toast.error("Preencha App ID e App Secret do Meta");
      return;
    }

    setMetaTesting(true);
    try {
      const result = await testMetaMutation.mutateAsync({
        appId: metaAppId,
        appSecret: metaAppSecret,
      });
      if (result.success) {
        toast.success(result.message);
        setMetaConnected(true);
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      toast.error(error.message || "Erro ao testar Meta");
    } finally {
      setMetaTesting(false);
    }
  };

  // Save Meta
  const handleSaveMeta = async () => {
    if (!metaAppId || !metaAppSecret) {
      toast.error("Preencha App ID e App Secret do Meta");
      return;
    }

    try {
      await connectMetaMutation.mutateAsync({
        appId: metaAppId,
        appSecret: metaAppSecret,
      });
      toast.success("Meta conectada com sucesso!");
      setMetaConnected(true);
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar Meta");
    }
  };

  // Disconnect
  const handleDisconnect = async (platform: "bling" | "canva" | "meta") => {
    try {
      await disconnectMutation.mutateAsync({ platform });
      toast.success(`${platform} desconectado com sucesso`);
      if (platform === "bling") setBlingConnected(false);
      if (platform === "canva") setCanvaConnected(false);
      if (platform === "meta") setMetaConnected(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao desconectar");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Configurar Integrações</h1>
        <p className="text-gray-600 mt-2">Conecte suas plataformas e teste a conexão antes de salvar</p>
      </div>

      {/* Bling Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>🔗 Bling ERP</span>
                {blingConnected && <Badge className="bg-green-500">Conectado</Badge>}
              </CardTitle>
              <CardDescription>Sincronize produtos, pedidos e estoque</CardDescription>
            </div>
            {blingConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisconnect("bling")}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Desconectar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="bling-api-key">API Key do Bling</Label>
            <Input
              id="bling-api-key"
              placeholder="Insira sua API Key do Bling"
              value={blingApiKey}
              onChange={(e) => setBlingApiKey(e.target.value)}
              disabled={blingConnected}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleTestBling}
              disabled={blingTesting || !blingApiKey}
              variant="outline"
            >
              {blingTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  {blingConnected ? (
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mr-2" />
                  )}
                  Testar Conexão
                </>
              )}
            </Button>

            {!blingConnected && (
              <Button
                onClick={handleSaveBling}
                disabled={!blingApiKey || connectBlingMutation.isPending}
              >
                {connectBlingMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Credenciais"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Canva Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>🎨 Canva</span>
                {canvaConnected && <Badge className="bg-green-500">Conectado</Badge>}
              </CardTitle>
              <CardDescription>Crie designs automaticamente para posts e stories</CardDescription>
            </div>
            {canvaConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisconnect("canva")}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Desconectar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="canva-client-id">Client ID do Canva</Label>
            <Input
              id="canva-client-id"
              placeholder="Insira seu Client ID do Canva"
              value={canvaClientId}
              onChange={(e) => setCanvaClientId(e.target.value)}
              disabled={canvaConnected}
            />
          </div>

          <div>
            <Label htmlFor="canva-client-secret">Client Secret do Canva</Label>
            <Input
              id="canva-client-secret"
              type="password"
              placeholder="Insira seu Client Secret do Canva"
              value={canvaClientSecret}
              onChange={(e) => setCanvaClientSecret(e.target.value)}
              disabled={canvaConnected}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleTestCanva}
              disabled={canvaTesting || !canvaClientId || !canvaClientSecret}
              variant="outline"
            >
              {canvaTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  {canvaConnected ? (
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mr-2" />
                  )}
                  Testar Conexão
                </>
              )}
            </Button>

            {!canvaConnected && (
              <Button
                onClick={handleSaveCanva}
                disabled={!canvaClientId || !canvaClientSecret || connectCanvaMutation.isPending}
              >
                {connectCanvaMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Credenciais"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Meta Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <span>📱 Meta (Facebook & Instagram)</span>
                {metaConnected && <Badge className="bg-green-500">Conectado</Badge>}
              </CardTitle>
              <CardDescription>Gerencie campanhas de anúncios e posts</CardDescription>
            </div>
            {metaConnected && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisconnect("meta")}
                className="text-red-600 hover:text-red-700"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Desconectar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="meta-app-id">App ID do Meta</Label>
            <Input
              id="meta-app-id"
              placeholder="Insira seu App ID do Meta"
              value={metaAppId}
              onChange={(e) => setMetaAppId(e.target.value)}
              disabled={metaConnected}
            />
          </div>

          <div>
            <Label htmlFor="meta-app-secret">App Secret do Meta</Label>
            <Input
              id="meta-app-secret"
              type="password"
              placeholder="Insira seu App Secret do Meta"
              value={metaAppSecret}
              onChange={(e) => setMetaAppSecret(e.target.value)}
              disabled={metaConnected}
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleTestMeta}
              disabled={metaTesting || !metaAppId || !metaAppSecret}
              variant="outline"
            >
              {metaTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  {metaConnected ? (
                    <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mr-2" />
                  )}
                  Testar Conexão
                </>
              )}
            </Button>

            {!metaConnected && (
              <Button
                onClick={handleSaveMeta}
                disabled={!metaAppId || !metaAppSecret || connectMetaMutation.isPending}
              >
                {connectMetaMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Credenciais"
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
