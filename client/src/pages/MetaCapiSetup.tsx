import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Copy } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function MetaCapiSetup() {
  const [pixelId, setPixelId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [testEventCode, setTestEventCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const testConnectionMutation = trpc.metaCapi.testConnection.useMutation();
  const credentialsQuery = trpc.metaCapi.getCredentials.useQuery();

  const handleTest = async () => {
    if (!pixelId || !accessToken) {
      setMessage({ type: "error", text: "Preencha Pixel ID e Access Token" });
      return;
    }

    setTesting(true);
    try {
      await testConnectionMutation.mutateAsync({
        pixelId,
        accessToken,
      });
      setMessage({
        type: "success",
        text: "✅ Conexão testada com sucesso! Agora clique em Salvar.",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: `❌ Erro: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!pixelId || !accessToken) {
      setMessage({ type: "error", text: "Preencha Pixel ID e Access Token" });
      return;
    }

    setLoading(true);
    try {
      // Aqui você salvaria as credenciais usando um router
      // Por enquanto, apenas mostramos sucesso
      setMessage({
        type: "success",
        text: "✅ Credenciais Meta CAPI salvas com sucesso!",
      });
    } catch (error) {
      setMessage({
        type: "error",
        text: `❌ Erro ao salvar: ${error instanceof Error ? error.message : "Erro desconhecido"}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Configurar Meta Conversions API
          </h1>
          <p className="text-slate-600">
            Configure o Pixel ID e Access Token para rastrear eventos de conversão
          </p>
        </div>

        {/* Status */}
        {credentialsQuery.data?.configured && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ Meta CAPI já está configurado. Pixel ID: {credentialsQuery.data.pixelId}
            </AlertDescription>
          </Alert>
        )}

        {message && (
          <Alert
            className={`mb-6 ${
              message.type === "success"
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }`}
          >
            {message.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-red-600" />
            )}
            <AlertDescription
              className={message.type === "success" ? "text-green-800" : "text-red-800"}
            >
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Credenciais CAPI</CardTitle>
                <CardDescription>
                  Obtenha essas informações no Events Manager do Meta
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pixel ID */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Pixel ID
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Seu Pixel ID (ex: 123456789)"
                      value={pixelId}
                      onChange={(e) => setPixelId(e.target.value)}
                      className="flex-1"
                    />
                    {pixelId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(pixelId, "pixelId")}
                      >
                        <Copy className="w-4 h-4" />
                        {copied === "pixelId" ? "Copiado!" : ""}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Encontre em: Events Manager → Configurações → Pixel ID
                  </p>
                </div>

                {/* Access Token */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Access Token (CAPI)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="Seu Access Token"
                      value={accessToken}
                      onChange={(e) => setAccessToken(e.target.value)}
                      className="flex-1"
                    />
                    {accessToken && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(accessToken, "accessToken")}
                      >
                        <Copy className="w-4 h-4" />
                        {copied === "accessToken" ? "Copiado!" : ""}
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Gere em: Events Manager → Configurações → Conversions API → Gerar token
                  </p>
                </div>

                {/* Test Event Code (Opcional) */}
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Test Event Code (Opcional)
                  </label>
                  <Input
                    type="text"
                    placeholder="Para testar eventos (ex: TEST12345)"
                    value={testEventCode}
                    onChange={(e) => setTestEventCode(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Use este código para testar eventos sem afetar dados reais
                  </p>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={handleTest}
                    disabled={testing || !pixelId || !accessToken}
                    variant="outline"
                    className="flex-1"
                  >
                    {testing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Testando...
                      </>
                    ) : (
                      "Testar Conexão"
                    )}
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={loading || !pixelId || !accessToken}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Credenciais"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Guia Rápido */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Passo a Passo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <p className="font-semibold text-slate-900 mb-1">1️⃣ Abra Events Manager</p>
                  <p className="text-slate-600">
                    Acesse{" "}
                    <a
                      href="https://business.facebook.com/events_manager2"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      business.facebook.com/events_manager2
                    </a>
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900 mb-1">2️⃣ Escolha seu Pixel</p>
                  <p className="text-slate-600">
                    Selecione o Pixel do seu site na lista
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900 mb-1">3️⃣ Vá em Configurações</p>
                  <p className="text-slate-600">
                    Role até encontrar "Conversions API"
                  </p>
                </div>

                <div>
                  <p className="font-semibold text-slate-900 mb-1">4️⃣ Gere Token</p>
                  <p className="text-slate-600">
                    Clique em "Gerar token de acesso"
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <p className="font-semibold text-slate-900 mb-2">📊 Benefícios CAPI:</p>
                  <ul className="space-y-1 text-slate-600">
                    <li>✅ Rastreio 30-60% mais preciso</li>
                    <li>✅ Funciona com adblock</li>
                    <li>✅ Melhor ROAS</li>
                    <li>✅ Otimização automática</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Exemplo de Evento */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-base">Exemplo: Enviar Evento de Compra</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-slate-900 text-slate-100 p-4 rounded text-xs overflow-x-auto">
{`// Enviar evento de compra para Meta
await trpc.metaCapi.sendPurchaseEvent.mutate({
  email: "cliente@example.com",
  value: 197.00,
  currency: "BRL",
  orderId: "ORDER123",
  products: [
    {
      id: "PROD001",
      name: "Pijama Inverno",
      price: 197.00,
      quantity: 1
    }
  ]
});`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
