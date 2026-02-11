import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, QrCode, Send, Power, AlertCircle, CheckCircle } from "lucide-react";

export default function WhatsAppBaileysPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [showQR, setShowQR] = useState(false);

  // Queries
  const statusQuery = trpc.whatsappBaileys.getStatus.useQuery();
  const qrQuery = trpc.whatsappBaileys.getQRCode.useQuery();
  const sessionsQuery = trpc.whatsappBaileys.getActiveSessions.useQuery();

  // Mutations
  const initializeMutation = trpc.whatsappBaileys.initialize.useMutation({
    onSuccess: () => {
      statusQuery.refetch();
      setShowQR(true);
    },
  });

  const sendMessageMutation = trpc.whatsappBaileys.sendMessage.useMutation({
    onSuccess: () => {
      setMessage("");
      setPhoneNumber("");
    },
  });

  const disconnectMutation = trpc.whatsappBaileys.disconnect.useMutation({
    onSuccess: () => {
      statusQuery.refetch();
      setShowQR(false);
    },
  });

  const status = statusQuery.data;
  const qrCode = qrQuery.data;
  const sessions = sessionsQuery.data;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">WhatsApp Business (Baileys)</h1>
        <p className="text-slate-600">API gratuita de WhatsApp sem custos da Meta</p>
      </div>

      {/* Status Card */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {status?.isConnected ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-600" />
                Conectado
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Desconectado
              </>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Número do Telefone</p>
              <p className="font-mono text-lg">{status?.phoneNumber || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Status</p>
              <Badge variant={status?.isConnected ? "default" : "secondary"}>
                {status?.isConnected ? "Online" : "Offline"}
              </Badge>
            </div>
          </div>

          <div className="flex gap-2">
            {!status?.isConnected ? (
              <Button
                onClick={() => initializeMutation.mutate()}
                disabled={initializeMutation.isPending}
                className="gap-2"
              >
                <QrCode className="w-4 h-4" />
                Conectar com QR Code
              </Button>
            ) : (
              <Button
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
                variant="destructive"
                className="gap-2"
              >
                <Power className="w-4 h-4" />
                Desconectar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* QR Code */}
      {showQR && qrCode?.hasQRCode && (
        <Card className="mb-6 border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Escaneie o QR Code
            </CardTitle>
            <CardDescription>
              Use seu telefone para escanear este código e conectar ao WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent>
            {qrCode.qrCode && (
              <div className="flex justify-center bg-white p-4 rounded-lg">
                <img src={qrCode.qrCode} alt="QR Code" className="w-64 h-64" />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="send">Enviar Mensagem</TabsTrigger>
          <TabsTrigger value="sessions">Sessões Ativas</TabsTrigger>
          <TabsTrigger value="info">Informações</TabsTrigger>
        </TabsList>

        {/* Enviar Mensagem */}
        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle>Enviar Mensagem</CardTitle>
              <CardDescription>
                Envie mensagens de texto para contatos do WhatsApp
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!status?.isConnected && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800">
                  Conecte seu WhatsApp primeiro para enviar mensagens
                </div>
              )}

              <div>
                <label className="text-sm font-medium">Número do Telefone</label>
                <Input
                  placeholder="55 11 99999-9999"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={!status?.isConnected}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Mensagem</label>
                <Textarea
                  placeholder="Digite sua mensagem..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={!status?.isConnected}
                  rows={4}
                />
              </div>

              <Button
                onClick={() =>
                  sendMessageMutation.mutate({
                    phoneNumber,
                    message,
                  })
                }
                disabled={
                  !status?.isConnected ||
                  !phoneNumber ||
                  !message ||
                  sendMessageMutation.isPending
                }
                className="w-full gap-2"
              >
                <Send className="w-4 h-4" />
                Enviar Mensagem
              </Button>

              {sendMessageMutation.isSuccess && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
                  ✓ Mensagem enviada com sucesso!
                </div>
              )}

              {sendMessageMutation.isError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
                  ✗ Erro ao enviar mensagem
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sessões Ativas */}
        <TabsContent value="sessions">
          <Card>
            <CardHeader>
              <CardTitle>Sessões Ativas</CardTitle>
              <CardDescription>
                Conexões WhatsApp ativas no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessions && sessions.count > 0 ? (
                <div className="space-y-3">
                  {sessions.sessions.map((session: any) => (
                    <div
                      key={session.userId}
                      className="p-4 border rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium">{session.phoneNumber || "Conectando..."}</p>
                        <p className="text-sm text-slate-600">Usuário ID: {session.userId}</p>
                      </div>
                      <Badge variant={session.isConnected ? "default" : "secondary"}>
                        {session.isConnected ? "Online" : "Offline"}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma sessão ativa</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Informações */}
        <TabsContent value="info">
          <Card>
            <CardHeader>
              <CardTitle>Sobre Baileys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">O que é Baileys?</h3>
                <p className="text-sm text-slate-700">
                  Baileys é uma biblioteca JavaScript que simula o cliente do WhatsApp Web,
                  permitindo enviar e receber mensagens sem custos. É totalmente gratuito e
                  não requer aprovação da Meta.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Vantagens</h3>
                <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
                  <li>100% gratuito - sem custos da Meta</li>
                  <li>Sem limites de mensagens</li>
                  <li>Suporte a mídia (imagens, vídeos, áudio, documentos)</li>
                  <li>Fácil de integrar com IA</li>
                  <li>Funciona com qualquer conta WhatsApp</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Como Funciona</h3>
                <ol className="text-sm text-slate-700 space-y-1 list-decimal list-inside">
                  <li>Clique em "Conectar com QR Code"</li>
                  <li>Escaneie o código com seu telefone</li>
                  <li>Confirme a conexão no WhatsApp</li>
                  <li>Comece a enviar mensagens!</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
