import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Plug,
  CheckCircle,
  AlertCircle,
  Trash2,
  Eye,
  EyeOff,
  Facebook,
  Music,
  HardDrive,
  Zap,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface PlatformIntegration {
  plataforma: string;
  nome: string;
  descricao: string;
  icon: string;
  isConnected: boolean;
  lastValidated?: string;
  tipo: "oauth" | "apikey";
}

const PLATAFORMAS: PlatformIntegration[] = [
  // OAuth Integrations
  {
    plataforma: "meta",
    nome: "Meta (Facebook & Instagram)",
    descricao: "Gerencie campanhas no Facebook e Instagram",
    icon: "📱",
    isConnected: false,
    tipo: "oauth",
  },
  {
    plataforma: "tiktok",
    nome: "TikTok",
    descricao: "Gerencie sua conta do TikTok",
    icon: "🎵",
    isConnected: false,
    tipo: "oauth",
  },
  {
    plataforma: "google_drive",
    nome: "Google Drive",
    descricao: "Sincronize arquivos e documentos do Google Drive",
    icon: "📁",
    isConnected: false,
    tipo: "oauth",
  },
  {
    plataforma: "bling",
    nome: "Bling ERP",
    descricao: "Sincronize dados com Bling ERP",
    icon: "📊",
    isConnected: false,
    tipo: "oauth",
  },
  // API Key Integrations
  {
    plataforma: "tray",
    nome: "Tray",
    descricao: "Integração com plataforma de e-commerce Tray",
    icon: "🛍️",
    isConnected: false,
    tipo: "apikey",
  },
  {
    plataforma: "email_marketing",
    nome: "Email Marketing",
    descricao: "Integração com plataforma de email marketing",
    icon: "📧",
    isConnected: false,
    tipo: "apikey",
  },
  {
    plataforma: "whatsapp",
    nome: "WhatsApp Business",
    descricao: "Integração com WhatsApp Business API",
    icon: "💬",
    isConnected: false,
    tipo: "apikey",
  },
  {
    plataforma: "canva",
    nome: "Canva",
    descricao: "Integração com Canva para criar designs",
    icon: "🎨",
    isConnected: false,
    tipo: "apikey",
  },
  {
    plataforma: "instagram",
    nome: "Instagram",
    descricao: "Conecte sua conta do Instagram",
    icon: "📸",
    isConnected: false,
    tipo: "apikey",
  },
  {
    plataforma: "facebook",
    nome: "Facebook",
    descricao: "Conecte sua página do Facebook",
    icon: "👍",
    isConnected: false,
    tipo: "apikey",
  }
];

export default function Integrations() {
  const [integracoes, setIntegracoes] = useState<PlatformIntegration[]>(PLATAFORMAS);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [validating, setValidating] = useState<Record<string, boolean>>({});
  const [showToken, setShowToken] = useState<Record<string, boolean>>({});
  const [oauthLoading, setOAuthLoading] = useState<Record<string, boolean>>({});

  // OAuth URLs
  const { data: metaUrl } = trpc.oauthIntegrations.getMetaAuthUrl.useQuery();
  const { data: tiktokUrl } = trpc.oauthIntegrations.getTikTokAuthUrl.useQuery();
  const { data: googleDriveUrl } = trpc.oauthIntegrations.getGoogleDriveAuthUrl.useQuery();
  const { data: blingUrl } = trpc.oauthIntegrations.getBlingAuthUrl.useQuery();

  const validarConexaoMutation = trpc.integrations.validarConexao.useMutation({
    onSuccess: (result: any) => {
      if (result.conectado) {
        setIntegracoes(
          integracoes.map((i) =>
            i.plataforma === result.plataforma
              ? { ...i, isConnected: true, lastValidated: new Date().toLocaleString() }
              : i
          )
        );
        alert(result.mensagem);
      } else {
        alert(result.mensagem);
      }
    },
    onError: () => {
      alert("Erro ao validar conexão");
    },
  });

  const desconectarMutation = trpc.integrations.desconectar.useMutation({
    onSuccess: (result: any) => {
      alert(result.mensagem);
    },
  });

  const handleOAuthConnect = (plataforma: string, url: string | undefined) => {
    if (!url) {
      alert("URL de autenticação não disponível");
      return;
    }
    setOAuthLoading({ ...oauthLoading, [plataforma]: true });
    window.location.href = url;
  };

  const handleValidarConexao = (plataforma: string) => {
    const token = tokens[plataforma];
    if (!token) {
      alert("Por favor, cole o token primeiro");
      return;
    }

    setValidating({ ...validating, [plataforma]: true });
    validarConexaoMutation.mutate({ plataforma: plataforma as any, token });
    setTimeout(() => setValidating({ ...validating, [plataforma]: false }), 2000);
  };

  const handleDesconectar = (plataforma: string) => {
    if (confirm(`Tem certeza que deseja desconectar ${plataforma}?`)) {
      desconectarMutation.mutate({ plataforma: plataforma as any });
      setIntegracoes(
        integracoes.map((i) =>
          i.plataforma === plataforma ? { ...i, isConnected: false } : i
        )
      );
      setTokens({ ...tokens, [plataforma]: "" });
    }
  };

  const oauthPlatforms = integracoes.filter((p) => p.tipo === "oauth");
  const apikeyPlatforms = integracoes.filter((p) => p.tipo === "apikey");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Plug className="w-8 h-8" />
            Integrações de Plataformas
          </h1>
          <p className="text-gray-600 mt-2">
            Conecte suas contas de diferentes plataformas para automação completa
          </p>
        </div>
      </div>

      {/* OAuth Integrations Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Zap className="w-6 h-6" />
          Conectar com OAuth
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {oauthPlatforms.map((plataforma) => (
            <Card key={plataforma.plataforma} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{plataforma.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{plataforma.nome}</CardTitle>
                      <CardDescription>{plataforma.descricao}</CardDescription>
                    </div>
                  </div>
                  {plataforma.isConnected ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-gray-400" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {plataforma.isConnected ? (
                  <>
                    <Badge className="bg-green-100 text-green-800">Conectado</Badge>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => handleDesconectar(plataforma.plataforma)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Desconectar
                    </Button>
                  </>
                ) : (
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      if (plataforma.plataforma === "meta") {
                        handleOAuthConnect(plataforma.plataforma, metaUrl?.url);
                      } else if (plataforma.plataforma === "tiktok") {
                        handleOAuthConnect(plataforma.plataforma, tiktokUrl?.url);
                      } else if (plataforma.plataforma === "google_drive") {
                        handleOAuthConnect(plataforma.plataforma, googleDriveUrl?.url);
                      } else if (plataforma.plataforma === "bling") {
                        handleOAuthConnect(plataforma.plataforma, blingUrl?.url);
                      }
                    }}
                    disabled={oauthLoading[plataforma.plataforma]}
                  >
                    {oauthLoading[plataforma.plataforma] ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Redirecionando...
                      </>
                    ) : (
                      `Conectar com ${plataforma.nome}`
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* API Key Integrations Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Key className="w-6 h-6" />
          Conectar com API Key
        </h2>
        <div className="grid gap-3">
          {apikeyPlatforms.map((plataforma) => (
            <Card
              key={plataforma.plataforma}
              className={`cursor-pointer transition-all ${
                expandedPlatform === plataforma.plataforma
                  ? "border-blue-500 bg-blue-50"
                  : "hover:border-gray-400"
              }`}
            >
              <div
                onClick={() =>
                  setExpandedPlatform(
                    expandedPlatform === plataforma.plataforma ? null : plataforma.plataforma
                  )
                }
                className="p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{plataforma.icon}</span>
                    <div>
                      <h3 className="font-semibold text-lg">{plataforma.nome}</h3>
                      <p className="text-sm text-gray-600">{plataforma.descricao}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {plataforma.isConnected ? (
                      <div className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">Conectado</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-gray-500">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">Desconectado</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {expandedPlatform === plataforma.plataforma && (
                <CardContent className="border-t pt-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`token-${plataforma.plataforma}`}>
                      Token / API Key / Access Token
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`token-${plataforma.plataforma}`}
                        type={showToken[plataforma.plataforma] ? "text" : "password"}
                        placeholder="Cole seu token aqui..."
                        value={tokens[plataforma.plataforma] || ""}
                        onChange={(e) =>
                          setTokens({
                            ...tokens,
                            [plataforma.plataforma]: e.target.value,
                          })
                        }
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          setShowToken({
                            ...showToken,
                            [plataforma.plataforma]: !showToken[plataforma.plataforma],
                          })
                        }
                      >
                        {showToken[plataforma.plataforma] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Seu token será armazenado de forma segura e criptografada
                    </p>
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => handleValidarConexao(plataforma.plataforma)}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={
                        validating[plataforma.plataforma] || !tokens[plataforma.plataforma]
                      }
                    >
                      {validating[plataforma.plataforma] ? "Validando..." : "Validar Conexão"}
                    </Button>

                    {plataforma.isConnected && (
                      <Button
                        onClick={() => handleDesconectar(plataforma.plataforma)}
                        variant="destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Desconectar
                      </Button>
                    )}
                  </div>

                  {plataforma.lastValidated && (
                    <p className="text-xs text-green-600">
                      Última validação: {plataforma.lastValidated}
                    </p>
                  )}
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Como obter seus tokens?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-3">
          <div>
            <strong>Meta (Facebook/Instagram):</strong> Clique em "Conectar com Meta" e autorize
            sua conta
          </div>
          <div>
            <strong>TikTok:</strong> Clique em "Conectar com TikTok" e autorize sua conta
          </div>
          <div>
            <strong>Google Drive:</strong> Clique em "Conectar com Google Drive" e autorize sua
            conta
          </div>
          <div>
            <strong>Bling:</strong> Clique em "Conectar com Bling" e autorize sua conta
          </div>
          <div>
            <strong>Tray:</strong> Acesse Configurações → Integrações → API e copie sua chave
          </div>
          <div>
            <strong>Email Marketing:</strong> Acesse sua plataforma de email e gere uma API Key
          </div>
          <div>
            <strong>WhatsApp Business:</strong> Configure via Meta Business Suite com seu
            Business Account
          </div>
          <div>
            <strong>Canva:</strong> Acesse Canva Developer → Aplicações e gere um token
          </div>
          <div>
            <strong>Instagram:</strong> Use o Graph API Explorer para gerar tokens
          </div>
          <div>
            <strong>Facebook:</strong> Use o Graph API Explorer para gerar tokens
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Import Key icon
import { Key } from "lucide-react";
