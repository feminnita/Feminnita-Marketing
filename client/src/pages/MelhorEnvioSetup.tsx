import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Package, Truck } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function MelhorEnvioSetup() {
  const [apiKey, setApiKey] = useState("");
  const [secretToken, setSecretToken] = useState("");
  const [trackingCode, setTrackingCode] = useState("");
  const [orderId, setOrderId] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [destinationCep, setDestinationCep] = useState("");
  const [weight, setWeight] = useState("1");

  // Mutations
  const setCredentialsMutation = trpc.melhorEnvioIntegration.setCredentials.useMutation();
  const validateCredentialsMutation = trpc.melhorEnvioIntegration.validateCredentials.useQuery();
  const getTrackingCodeQuery = trpc.melhorEnvioIntegration.getTrackingCode.useQuery(
    { orderId, trackingNumber: trackingCode },
    { enabled: false }
  );
  const formatTrackingMessageQuery = trpc.melhorEnvioIntegration.formatTrackingMessage.useQuery(
    { orderId, trackingCode, trackingUrl: `https://rastreamento.melhorenvio.com.br/${trackingCode}`, customerName },
    { enabled: false }
  );
  const getShippingOptionsQuery = trpc.melhorEnvioIntegration.getShippingOptions.useQuery(
    { destinationCep, weight: parseFloat(weight), width: 15, height: 10, length: 20 },
    { enabled: false }
  );

  const handleSetCredentials = async () => {
    if (!apiKey || !secretToken) {
      toast.error("Preencha API Key e Secret Token");
      return;
    }

    try {
      await setCredentialsMutation.mutateAsync({
        apiKey,
        secretToken,
      });
      toast.success("Credenciais configuradas com sucesso!");
      validateCredentialsMutation.refetch();
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : "Desconhecido"}`);
    }
  };

  const handleGetTrackingCode = async () => {
    if (!orderId || !trackingCode) {
      toast.error("Preencha ID do pedido e código de rastreio");
      return;
    }

    try {
      const result = await getTrackingCodeQuery.refetch();
      if (result.data) {
        toast.success(`Rastreio obtido: ${result.data.trackingCode}`);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : "Desconhecido"}`);
    }
  };

  const handleFormatMessage = async () => {
    if (!orderId || !trackingCode) {
      toast.error("Preencha ID do pedido e código de rastreio");
      return;
    }

    try {
      const result = await formatTrackingMessageQuery.refetch();
      if (result.data) {
        toast.success("Mensagem formatada!");
        console.log("Mensagem:", result.data.message);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : "Desconhecido"}`);
    }
  };

  const handleGetShippingOptions = async () => {
    if (!destinationCep || !weight) {
      toast.error("Preencha CEP de destino e peso");
      return;
    }

    try {
      const result = await getShippingOptionsQuery.refetch();
      if (result.data) {
        toast.success(`${result.data.options.length} opções de frete encontradas!`);
        console.log("Opções:", result.data.options);
      }
    } catch (error) {
      toast.error(`Erro: ${error instanceof Error ? error.message : "Desconhecido"}`);
    }
  };

  const isConnected = validateCredentialsMutation.data?.valid;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Melhor Envio - Rastreamento de Pedidos</h1>
        <p className="text-gray-600 mt-2">Configure a integração para enviar links de rastreamento via WhatsApp</p>
      </div>

      {/* Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isConnected ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                Conectado
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                Desconectado
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isConnected ? (
            <p className="text-sm text-green-600">✅ Credenciais válidas e conectadas</p>
          ) : (
            <p className="text-sm text-gray-600">Configure suas credenciais para começar</p>
          )}
        </CardContent>
      </Card>

      {/* Configuração */}
      <Card>
        <CardHeader>
          <CardTitle>Configurar Credenciais</CardTitle>
          <CardDescription>
            Obtenha suas credenciais em{" "}
            <a href="https://melhorenvio.com.br" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
              melhorenvio.com.br
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Sua API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="secretToken">Secret Token</Label>
            <Input
              id="secretToken"
              type="password"
              placeholder="Seu Secret Token"
              value={secretToken}
              onChange={(e) => setSecretToken(e.target.value)}
            />
          </div>

          <Button onClick={handleSetCredentials} disabled={setCredentialsMutation.isPending} className="w-full">
            {setCredentialsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Configurando...
              </>
            ) : (
              "Configurar Credenciais"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Testar Rastreio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Testar Rastreamento
          </CardTitle>
          <CardDescription>Teste a obtenção de código de rastreio</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="orderId">ID do Pedido</Label>
            <Input
              id="orderId"
              placeholder="ex: ORD-123456"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="trackingCode">Código de Rastreio</Label>
            <Input
              id="trackingCode"
              placeholder="ex: BR123456789BR"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="customerName">Nome do Cliente (opcional)</Label>
            <Input
              id="customerName"
              placeholder="ex: João Silva"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <Button onClick={handleGetTrackingCode} disabled={getTrackingCodeQuery.isFetching} className="w-full">
            {getTrackingCodeQuery.isFetching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Obtendo...
              </>
            ) : (
              "Obter Código de Rastreio"
            )}
          </Button>

          <Button onClick={handleFormatMessage} disabled={formatTrackingMessageQuery.isFetching} variant="outline" className="w-full">
            {formatTrackingMessageQuery.isFetching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Formatando...
              </>
            ) : (
              "Formatar Mensagem WhatsApp"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Calcular Frete */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="w-5 h-5" />
            Calcular Frete
          </CardTitle>
          <CardDescription>Veja as opções de frete disponíveis</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="destinationCep">CEP de Destino</Label>
            <Input
              id="destinationCep"
              placeholder="ex: 28621130"
              value={destinationCep}
              onChange={(e) => setDestinationCep(e.target.value.replace(/\D/g, "").slice(0, 8))}
              maxLength={8}
            />
          </div>

          <div>
            <Label htmlFor="weight">Peso (kg)</Label>
            <Input
              id="weight"
              type="number"
              placeholder="ex: 1.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              step="0.1"
              min="0.1"
            />
          </div>

          <Button onClick={handleGetShippingOptions} disabled={getShippingOptionsQuery.isFetching} className="w-full">
            {getShippingOptionsQuery.isFetching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Calculando...
              </>
            ) : (
              "Calcular Frete"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Informações */}
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          <strong>Fluxo:</strong> Quando um pedido é enviado no Bling, o sistema obtém o código de rastreio do Melhor Envio e envia automaticamente uma mensagem WhatsApp com o link de rastreamento para o cliente.
        </AlertDescription>
      </Alert>
    </div>
  );
}
