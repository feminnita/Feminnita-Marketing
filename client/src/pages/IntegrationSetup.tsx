import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2, Loader2, LogOut, ExternalLink } from "lucide-react";
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
  const handleDisconnect = async (platform: string) => {
    try {
      await disconnectMutation.mutateAsync({ platform: platform as any });
      toast.success(`${platform} desconectado com sucesso!`);
      if (platform === "bling") setBlingConnected(false);
      if (platform === "canva") setCanvaConnected(false);
      if (platform === "meta") setMetaConnected(false);
    } catch (error: any) {
      toast.error(error.message || "Erro ao desconectar");
    }
  };

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold">Configurar Integrações</h1>
        <p className="text-muted-foreground mt-2">Teste e configure suas integrações com Bling, Canva e Meta</p>
      </div>

      {/* Bling Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Bling ERP</CardTitle>
              <CardDescription>Sincronize produtos, pedidos e estoque</CardDescription>
            </div>
            {blingConnected && <Badge className="bg-green-500">Conectado</Badge>}
            {!blingConnected && <Badge variant="outline">Desconectado</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Como gerar a API Key do Bling:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Acesse <a href="https://www.bling.com.br" target="_blank" rel="noopener noreferrer" className="underline font-semibold">bling.com.br</a></li>
                <li>Vá em <strong>Preferências → Sistema → Usuários</strong></li>
                <li>Crie um novo <strong>"Usuário API"</strong></li>
                <li>Copie a <strong>chave de integração</strong> gerada</li>
                <li>Cole aqui e clique em "Testar Conexão"</li>
              </ol>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bling-key">API Key do Bling</Label>
            <Input
              id="bling-key"
              type="password"
              placeholder="Cole sua API Key aqui"
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
              {blingTesting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Testar Conexão
            </Button>
            {!blingConnected && (
              <Button onClick={handleSaveBling} disabled={!blingApiKey || blingTesting}>
                Salvar Credenciais
              </Button>
            )}
            {blingConnected && (
              <Button
                onClick={() => handleDisconnect("bling")}
                variant="destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Desconectar
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
              <CardTitle>Canva</CardTitle>
              <CardDescription>Crie designs automaticamente</CardDescription>
            </div>
            {canvaConnected && <Badge className="bg-green-500">Conectado</Badge>}
            {!canvaConnected && <Badge variant="outline">Desconectado</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-purple-800">
              <p className="font-semibold mb-1">Credenciais do Canva:</p>
              <p>Use as credenciais fornecidas ou obtenha novas em <a href="https://www.canva.dev" target="_blank" rel="noopener noreferrer" className="underline font-semibold">canva.dev</a></p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="canva-id">Client ID</Label>
            <Input
              id="canva-id"
              type="text"
              placeholder="OC-AZwe5Lb9Mj6o"
              value={canvaClientId}
              onChange={(e) => setCanvaClientId(e.target.value)}
              disabled={canvaConnected}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="canva-secret">Client Secret</Label>
            <Input
              id="canva-secret"
              type="password"
              placeholder="Cole seu Client Secret"
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
              {canvaTesting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Testar Conexão
            </Button>
            {!canvaConnected && (
              <Button
                onClick={handleSaveCanva}
                disabled={!canvaClientId || !canvaClientSecret || canvaTesting}
              >
                Salvar Credenciais
              </Button>
            )}
            {canvaConnected && (
              <Button
                onClick={() => handleDisconnect("canva")}
                variant="destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Desconectar
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
              <CardTitle>Meta (Facebook & Instagram)</CardTitle>
              <CardDescription>Gerencie campanhas de anúncios</CardDescription>
            </div>
            {metaConnected && <Badge className="bg-green-500">Conectado</Badge>}
            {!metaConnected && <Badge variant="outline">Desconectado</Badge>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">Como obter credenciais do Meta:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Acesse <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">developers.facebook.com</a></li>
                <li>Crie ou acesse seu aplicativo</li>
                <li>Copie o <strong>App ID</strong> e <strong>App Secret</strong></li>
                <li>Cole aqui e clique em "Testar Conexão"</li>
              </ol>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-id">App ID</Label>
            <Input
              id="meta-id"
              type="text"
              placeholder="Cole seu App ID"
              value={metaAppId}
              onChange={(e) => setMetaAppId(e.target.value)}
              disabled={metaConnected}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="meta-secret">App Secret</Label>
            <Input
              id="meta-secret"
              type="password"
              placeholder="Cole seu App Secret"
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
              {metaTesting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Testar Conexão
            </Button>
            {!metaConnected && (
              <Button
                onClick={handleSaveMeta}
                disabled={!metaAppId || !metaAppSecret || metaTesting}
              >
                Salvar Credenciais
              </Button>
            )}
            {metaConnected && (
              <Button
                onClick={() => handleDisconnect("meta")}
                variant="destructive"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Desconectar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
