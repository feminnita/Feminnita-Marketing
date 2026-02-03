import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle, AlertCircle, Send, MessageSquare } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function EvolutionApiSetup() {
  const [instanceName, setInstanceName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.evolution.ai");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [groupId, setGroupId] = useState("22992910707");
  const [groupMessage, setGroupMessage] = useState("");
  const [messageType, setMessageType] = useState<"promotion" | "launch" | "coupon" | "general">("promotion");

  // Mutations
  const connectMutation = trpc.evolutionApi.connectInstance.useMutation();
  const sendMessageMutation = trpc.evolutionApi.sendMessage.useMutation();
  const sendGroupMessageMutation = trpc.evolutionApi.sendGroupMessage.useMutation();
  const generateAiResponseMutation = trpc.evolutionApi.generateAiResponse.useMutation();
  const transferToHumanMutation = trpc.evolutionApi.transferToHuman.useMutation();
  const getStatusQuery = trpc.evolutionApi.getInstanceStatus.useQuery();

  const handleConnect = async () => {
    if (!instanceName || !apiKey || !baseUrl) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      await connectMutation.mutateAsync({
        instanceName,
        apiKey,
        baseUrl,
      });
      toast.success("Instância conectada com sucesso!");
      getStatusQuery.refetch();
    } catch (error) {
      toast.error(`Erro ao conectar: ${error instanceof Error ? error.message : "Desconhecido"}`);
    }
  };

  const handleSendMessage = async () => {
    if (!phoneNumber || !message) {
      toast.error("Preencha o número e a mensagem");
      return;
    }

    try {
      await sendMessageMutation.mutateAsync({
        phoneNumber,
        message,
      });
      toast.success("Mensagem enviada com sucesso!");
      setMessage("");
    } catch (error) {
      toast.error(`Erro ao enviar: ${error instanceof Error ? error.message : "Desconhecido"}`);
    }
  };

  const handleSendGroupMessage = async () => {
    if (!groupMessage) {
      toast.error("Digite uma mensagem");
      return;
    }

    try {
      await sendGroupMessageMutation.mutateAsync({
        groupId,
        message: groupMessage,
        type: messageType,
      });
      toast.success("Mensagem enviada para o grupo VIP!");
      setGroupMessage("");
    } catch (error) {
      toast.error(`Erro ao enviar: ${error instanceof Error ? error.message : "Desconhecido"}`);
    }
  };

  const handleTestAi = async () => {
    if (!message) {
      toast.error("Digite uma mensagem para testar a IA");
      return;
    }

    try {
      const response = await generateAiResponseMutation.mutateAsync({
        customerMessage: message,
        customerPhone: phoneNumber || "5522999999999",
      });
      toast.success(`IA respondeu: ${response.message}`);
    } catch (error) {
      toast.error(`Erro ao gerar resposta: ${error instanceof Error ? error.message : "Desconhecido"}`);
    }
  };

  const handleTransferToHuman = async () => {
    if (!phoneNumber || !message) {
      toast.error("Preencha o número e a mensagem");
      return;
    }

    try {
      await transferToHumanMutation.mutateAsync({
        customerPhone: phoneNumber,
        customerMessage: message,
        groupId,
      });
      toast.success("Cliente transferido para atendimento humano!");
    } catch (error) {
      toast.error(`Erro ao transferir: ${error instanceof Error ? error.message : "Desconhecido"}`);
    }
  };

  const isConnected = getStatusQuery.data?.connected;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Evolution API - WhatsApp Web</h1>
        <p className="text-gray-600 mt-2">Configure sua integração de WhatsApp sem passar pela Meta</p>
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
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Instância:</strong> {getStatusQuery.data?.instanceName}
              </p>
              <p className="text-sm">
                <strong>Número:</strong> {getStatusQuery.data?.phoneNumber}
              </p>
              <p className="text-sm">
                <strong>Status:</strong> {getStatusQuery.data?.status}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-600">Configure sua instância para começar</p>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="config" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="config">Configuração</TabsTrigger>
          <TabsTrigger value="messages">Mensagens</TabsTrigger>
          <TabsTrigger value="group">Grupo VIP</TabsTrigger>
          <TabsTrigger value="ai">IA Atendimento</TabsTrigger>
        </TabsList>

        {/* Configuração */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conectar Evolution API</CardTitle>
              <CardDescription>
                Obtenha sua API Key em{" "}
                <a href="https://evolution-api.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  evolution-api.com
                </a>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="instanceName">Nome da Instância</Label>
                <Input
                  id="instanceName"
                  placeholder="ex: feminnita-whatsapp"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Sua API Key da Evolution API"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="baseUrl">URL Base</Label>
                <Input
                  id="baseUrl"
                  type="url"
                  placeholder="https://api.evolution.ai"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                />
              </div>

              <Button onClick={handleConnect} disabled={connectMutation.isPending} className="w-full">
                {connectMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  "Conectar Instância"
                )}
              </Button>

              {connectMutation.isError && (
                <Alert variant="destructive">
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>{connectMutation.error.message}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mensagens Individuais */}
        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Mensagem Individual</CardTitle>
              <CardDescription>Envie mensagens para clientes individuais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="phoneNumber">Número de Telefone</Label>
                <Input
                  id="phoneNumber"
                  placeholder="5522999999999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="message">Mensagem</Label>
                <textarea
                  id="message"
                  placeholder="Digite sua mensagem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2 border rounded-md min-h-24"
                />
              </div>

              <Button onClick={handleSendMessage} disabled={sendMessageMutation.isPending} className="w-full">
                {sendMessageMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Mensagem
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Grupo VIP */}
        <TabsContent value="group" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enviar para Grupo VIP</CardTitle>
              <CardDescription>Envie promoções, lançamentos e cupons exclusivos</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="groupId">ID do Grupo</Label>
                <Input
                  id="groupId"
                  placeholder="22992910707"
                  value={groupId}
                  onChange={(e) => setGroupId(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="messageType">Tipo de Mensagem</Label>
                <select
                  id="messageType"
                  value={messageType}
                  onChange={(e) => setMessageType(e.target.value as any)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="promotion">🎉 Promoção</option>
                  <option value="launch">🚀 Lançamento</option>
                  <option value="coupon">🎁 Cupom Exclusivo</option>
                  <option value="general">📢 Geral</option>
                </select>
              </div>

              <div>
                <Label htmlFor="groupMessage">Mensagem</Label>
                <textarea
                  id="groupMessage"
                  placeholder="Digite sua mensagem para o grupo VIP..."
                  value={groupMessage}
                  onChange={(e) => setGroupMessage(e.target.value)}
                  className="w-full p-2 border rounded-md min-h-24"
                />
              </div>

              <Button onClick={handleSendGroupMessage} disabled={sendGroupMessageMutation.isPending} className="w-full">
                {sendGroupMessageMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Enviar para Grupo VIP
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IA de Atendimento */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Testar IA de Atendimento</CardTitle>
              <CardDescription>Teste respostas automáticas da IA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customerMessage">Mensagem do Cliente</Label>
                <textarea
                  id="customerMessage"
                  placeholder="Ex: Qual é o status do meu pedido?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2 border rounded-md min-h-24"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button onClick={handleTestAi} disabled={generateAiResponseMutation.isPending} variant="outline">
                  {generateAiResponseMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    "Testar IA"
                  )}
                </Button>

                <Button onClick={handleTransferToHuman} disabled={transferToHumanMutation.isPending} variant="outline">
                  {transferToHumanMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Transferindo...
                    </>
                  ) : (
                    "Transferir para Humano"
                  )}
                </Button>
              </div>

              <Alert>
                <AlertCircle className="w-4 h-4" />
                <AlertDescription>
                  A IA responde automaticamente perguntas sobre pedidos, produtos e envios. Se o cliente pedir para falar com um humano, a conversa é transferida.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
