import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plug, CheckCircle, AlertCircle, Trash2, Eye, EyeOff } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface PlatformIntegration {
  plataforma: string;
  nome: string;
  descricao: string;
  icon: string;
  isConnected: boolean;
  lastValidated?: string;
}

const PLATAFORMAS: PlatformIntegration[] = [
  {
    plataforma: "tray",
    nome: "Tray",
    descricao: "Integração com plataforma de e-commerce Tray",
    icon: "🛍️",
    isConnected: false,
  },
  {
    plataforma: "google_drive",
    nome: "Google Drive",
    descricao: "Sincronize arquivos e documentos do Google Drive",
    icon: "📁",
    isConnected: false,
  },
  {
    plataforma: "meta",
    nome: "Meta (Facebook & Instagram)",
    descricao: "Gerencie campanhas no Facebook e Instagram",
    icon: "📱",
    isConnected: false,
  },
  {
    plataforma: "email_marketing",
    nome: "Email Marketing",
    descricao: "Integração com plataforma de email marketing",
    icon: "📧",
    isConnected: false,
  },
  {
    plataforma: "instagram",
    nome: "Instagram",
    descricao: "Conecte sua conta do Instagram",
    icon: "📸",
    isConnected: false,
  },
  {
    plataforma: "tiktok",
    nome: "TikTok",
    descricao: "Gerencie sua conta do TikTok",
    icon: "🎵",
    isConnected: false,
  },
  {
    plataforma: "facebook",
    nome: "Facebook",
    descricao: "Conecte sua página do Facebook",
    icon: "👍",
    isConnected: false,
  },
  {
    plataforma: "whatsapp",
    nome: "WhatsApp Business",
    descricao: "Integração com WhatsApp Business API",
    icon: "💬",
    isConnected: false,
  },
  {
    plataforma: "bling",
    nome: "Bling ERP",
    descricao: "Sincronize dados com Bling ERP",
    icon: "📊",
    isConnected: false,
  },
];

export default function Integrations() {
  const [integracoes, setIntegracoes] = useState<PlatformIntegration[]>(PLATAFORMAS);
  const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [validating, setValidating] = useState<Record<string, boolean>>({});
  const [showToken, setShowToken] = useState<Record<string, boolean>>({});

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

      <div className="grid gap-3">
        {integracoes.map((plataforma) => (
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
                    disabled={validating[plataforma.plataforma] || !tokens[plataforma.plataforma]}
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

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Como obter seus tokens?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-3">
          <div>
            <strong>Tray:</strong> Acesse Configurações → Integrações → API e copie sua chave
          </div>
          <div>
            <strong>Google Drive:</strong> Use Google Cloud Console para gerar um token OAuth
          </div>
          <div>
            <strong>Meta:</strong> Acesse Meta Business Suite → Configurações → Tokens de acesso
          </div>
          <div>
            <strong>Email Marketing:</strong> Acesse sua plataforma de email e gere uma API Key
          </div>
          <div>
            <strong>Instagram:</strong> Use o Graph API Explorer para gerar tokens
          </div>
          <div>
            <strong>TikTok:</strong> Acesse TikTok for Business → Configurações → API
          </div>
          <div>
            <strong>Facebook:</strong> Use o Graph API Explorer para gerar tokens
          </div>
          <div>
            <strong>WhatsApp:</strong> Configure via Meta Business Suite com seu Business Account
          </div>
          <div>
            <strong>Bling:</strong> Acesse Configurações → Integrações → API e gere um novo token
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
