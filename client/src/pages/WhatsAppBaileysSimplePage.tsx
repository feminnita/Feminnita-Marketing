import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, QrCode, Loader2 } from "lucide-react";

export default function WhatsAppBaileysSimplePage() {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  const handleConnect = async () => {
    setIsLoading(true);
    setError(null);
    setQrCode(null);

    try {
      // 1. Iniciar conexão
      const connectRes = await fetch("/api/debug/baileys/connect");
      const connectData = await connectRes.json();

      if (!connectData.success) {
        throw new Error(connectData.error || "Erro ao conectar");
      }

      console.log("Conexão iniciada:", connectData.message);

      // 2. Aguardar QR Code
      const qrRes = await fetch("/api/debug/baileys/qr");
      const qrData = await qrRes.json();

      if (qrData.success && qrData.qrCode) {
        setQrCode(qrData.qrCode);
        console.log(`QR Code gerado em ${qrData.waitTime}ms`);
      } else {
        throw new Error(qrData.message || "Erro ao gerar QR Code");
      }

      // 3. Verificar status periodicamente
      const checkStatus = setInterval(async () => {
        try {
          const statusRes = await fetch("/api/debug/baileys/status");
          const statusData = await statusRes.json();

          if (statusData.success && statusData.status) {
            const { isConnected: connected, phoneNumber: phone } = statusData.status;

            if (connected) {
              setIsConnected(true);
              setPhoneNumber(phone);
              setQrCode(null);
              clearInterval(checkStatus);
              console.log(`Conectado com sucesso! Número: ${phone}`);
            }
          }
        } catch (err) {
          console.error("Erro ao verificar status:", err);
        }
      }, 1000);

      // Parar de verificar após 2 minutos
      setTimeout(() => clearInterval(checkStatus), 120000);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setError(message);
      console.error("Erro:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsConnected(false);
    setPhoneNumber(null);
    setQrCode(null);
    setError(null);
  };

  return (
    <div className="container py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">WhatsApp Business (Baileys)</h1>
        <p className="text-slate-600">API 100% gratuita - Sem custos da Meta</p>
      </div>

      {/* Status Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              {isConnected ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Conectado
                </>
              ) : (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                  Desconectado
                </>
              )}
            </span>
            <Badge variant={isConnected ? "default" : "secondary"}>
              {isConnected ? "Online" : "Offline"}
            </Badge>
          </CardTitle>
          <CardDescription>
            {phoneNumber ? `Número: ${phoneNumber}` : "Nenhuma sessão ativa"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {!isConnected ? (
              <Button
                onClick={handleConnect}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    Conectar com QR Code
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleDisconnect} variant="destructive">
                Desconectar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Card */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900">Erro</p>
                <p className="text-red-800">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* QR Code Card */}
      {qrCode && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="w-5 h-5" />
              Código QR
            </CardTitle>
            <CardDescription>
              Escaneie com seu telefone para conectar ao WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border">
              <img
                src={qrCode}
                alt="QR Code"
                className="w-64 h-64"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Como funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="font-semibold mb-2">1. Clique em "Conectar com QR Code"</p>
            <p className="text-sm text-slate-600">
              Um código QR será gerado em alguns segundos
            </p>
          </div>
          <div>
            <p className="font-semibold mb-2">2. Escaneie com seu telefone</p>
            <p className="text-sm text-slate-600">
              Abra o WhatsApp no seu celular e escaneie o código QR
            </p>
          </div>
          <div>
            <p className="font-semibold mb-2">3. Confirme a conexão</p>
            <p className="text-sm text-slate-600">
              Após escanear, o status mudará para "Online"
            </p>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm text-blue-900">
              ✅ <strong>100% Gratuito:</strong> Sem custos da Meta ou limites de mensagens
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
