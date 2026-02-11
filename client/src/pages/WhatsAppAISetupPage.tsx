import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { MessageCircle, CheckCircle2, AlertCircle, Settings, Send } from "lucide-react";

export default function WhatsAppAISetupPage() {
  const { user } = useAuth();
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [businessAccountId, setBusinessAccountId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [testPhoneNumber, setTestPhoneNumber] = useState("");
  const [testMessage, setTestMessage] = useState("");

  // Queries
  const { data: whatsappStatus } = trpc.whatsappAIIntegration.getWhatsAppStatus.useQuery();
  const { data: activeConversations } = trpc.whatsappAIIntegration.listActiveConversations.useQuery({
    limit: 10,
  });

  // Mutations
  const configureMutation = trpc.whatsappAIIntegration.configureWhatsAppCredentials.useMutation();
  const sendTestMutation = trpc.whatsappAIIntegration.sendMessage.useMutation();

  const handleConfigure = () => {
    configureMutation.mutate({
      phoneNumberId,
      businessAccountId,
      accessToken,
    });
  };

  const handleSendTest = () => {
    sendTestMutation.mutate({
      whatsappPhoneNumber: testPhoneNumber,
      messageText: testMessage,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="w-8 h-8" style={{ color: "#A63D4A" }} />
            <h1 className="text-4xl font-bold text-slate-900">WhatsApp Business Setup</h1>
          </div>
          <p className="text-slate-600">Configure a integração com WhatsApp Business para IA de atendimento</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Status da Conexão */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Status da Conexão</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {whatsappStatus?.connected ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-600">Conectado</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-600">Desconectado</span>
                  </>
                )}
              </div>

              {whatsappStatus?.connected && (
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-slate-500">Número de Telefone</p>
                    <p className="font-medium">{whatsappStatus.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Status</p>
                    <Badge variant="outline">{whatsappStatus.status}</Badge>
                  </div>
                  {whatsappStatus.qualityRating && (
                    <div>
                      <p className="text-slate-500">Classificação de Qualidade</p>
                      <Badge variant="secondary">{whatsappStatus.qualityRating}</Badge>
                    </div>
                  )}
                </div>
              )}

              {whatsappStatus?.message && (
                <p className="text-sm text-slate-600">{whatsappStatus.message}</p>
              )}
            </CardContent>
          </Card>

          {/* Configuração */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Configurar Credenciais</CardTitle>
              <CardDescription>
                Obtenha as credenciais no Meta Business Suite
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Phone Number ID</label>
                <Input
                  placeholder="Seu Phone Number ID do WhatsApp"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Encontre em: Meta Business Suite → WhatsApp → Configurações → Números de Telefone
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Business Account ID</label>
                <Input
                  placeholder="Seu Business Account ID"
                  value={businessAccountId}
                  onChange={(e) => setBusinessAccountId(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Access Token</label>
                <Input
                  type="password"
                  placeholder="Seu Access Token do Meta"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">
                  Gere em: Meta Business Suite → Configurações → Tokens de Acesso
                </p>
              </div>

              <Button
                onClick={handleConfigure}
                disabled={!phoneNumberId || !businessAccountId || !accessToken}
                className="w-full"
                style={{ backgroundColor: "#A63D4A" }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Salvar Configurações
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Testar Envio */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Testar Envio de Mensagem</CardTitle>
            <CardDescription>
              Envie uma mensagem de teste para verificar se a integração está funcionando
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Número de Telefone (com código do país)</label>
                <Input
                  placeholder="+55 11 99999-9999"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Mensagem de Teste</label>
                <Input
                  placeholder="Olá! Esta é uma mensagem de teste."
                  value={testMessage}
                  onChange={(e) => setTestMessage(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <Button
              onClick={handleSendTest}
              disabled={!testPhoneNumber || !testMessage || !whatsappStatus?.connected}
              className="w-full"
              style={{ backgroundColor: "#A63D4A" }}
            >
              <Send className="w-4 h-4 mr-2" />
              Enviar Mensagem de Teste
            </Button>
          </CardContent>
        </Card>

        {/* Conversas Ativas */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Conversas Ativas</CardTitle>
            <CardDescription>
              Últimas conversas com clientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeConversations && activeConversations.length > 0 ? (
              <div className="space-y-3">
                {activeConversations.map((conv, idx) => (
                  <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{conv.phoneNumber}</p>
                        <p className="text-sm text-slate-600 mt-1">{conv.lastMessage}</p>
                      </div>
                      <Badge variant={conv.status === "open" ? "default" : "secondary"}>
                        {conv.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      {conv.messageCount} mensagens
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-slate-500 py-8">Nenhuma conversa ativa</p>
            )}
          </CardContent>
        </Card>

        {/* Documentação */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900">Como Configurar</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-blue-800 space-y-3">
            <div>
              <p className="font-medium mb-1">1. Criar Aplicação Meta</p>
              <p>Acesse meta.com/developers e crie uma nova aplicação com produto WhatsApp Business</p>
            </div>
            <div>
              <p className="font-medium mb-1">2. Configurar Webhook</p>
              <p>Configure o webhook para receber mensagens em: /api/webhooks/whatsapp</p>
            </div>
            <div>
              <p className="font-medium mb-1">3. Obter Credenciais</p>
              <p>Copie o Phone Number ID, Business Account ID e gere um Access Token</p>
            </div>
            <div>
              <p className="font-medium mb-1">4. Testar Integração</p>
              <p>Use a seção "Testar Envio de Mensagem" para verificar se tudo está funcionando</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
