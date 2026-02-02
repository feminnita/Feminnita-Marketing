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
  Copy,
  Loader2,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  isConnected: boolean;
  lastValidated?: string;
  type: "oauth" | "apikey";
}

const INTEGRATIONS: Integration[] = [
  {
    id: "bling",
    name: "Bling ERP",
    description: "Sincronize dados com Bling ERP",
    icon: "📊",
    isConnected: false,
    type: "oauth",
  },
  {
    id: "canva",
    name: "Canva",
    description: "Integração com Canva para criar designs",
    icon: "🎨",
    isConnected: false,
    type: "apikey",
  },
  {
    id: "meta",
    name: "Meta (Facebook & Instagram)",
    description: "Gerencie campanhas no Facebook e Instagram",
    icon: "📱",
    isConnected: false,
    type: "oauth",
  },
  {
    id: "tiktok",
    name: "TikTok",
    description: "Gerencie sua conta do TikTok",
    icon: "🎵",
    isConnected: false,
    type: "oauth",
  },
  {
    id: "google_drive",
    name: "Google Drive",
    description: "Sincronize arquivos e documentos",
    icon: "📁",
    isConnected: false,
    type: "oauth",
  },
  {
    id: "whatsapp",
    name: "WhatsApp Business",
    description: "Integração com WhatsApp Business API",
    icon: "💬",
    isConnected: false,
    type: "apikey",
  },
  {
    id: "email",
    name: "Email Marketing",
    description: "Integração com plataforma de email marketing",
    icon: "📧",
    isConnected: false,
    type: "apikey",
  },
  {
    id: "tray",
    name: "Tray",
    description: "Integração com plataforma de e-commerce Tray",
    icon: "🛍️",
    isConnected: false,
    type: "apikey",
  },
];

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>(INTEGRATIONS);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Record<string, string>>({});
  const [showToken, setShowToken] = useState<Record<string, boolean>>({});
  const [validating, setValidating] = useState<Record<string, boolean>>({});

  const validarConexaoMutation = trpc.integrations.validarConexao.useMutation({
    onSuccess: (result: any) => {
      if (result.conectado) {
        setIntegrations(
          integrations.map((i) =>
            i.id === result.plataforma
              ? { ...i, isConnected: true, lastValidated: new Date().toLocaleString() }
              : i
          )
        );
        alert(`✅ ${result.plataforma} conectado com sucesso!`);
      } else {
        alert(`❌ ${result.mensagem}`);
      }
    },
    onError: () => {
      alert("❌ Erro ao validar conexão");
    },
  });

  const desconectarMutation = trpc.integrations.desconectar.useMutation({
    onSuccess: (result: any) => {
      alert(`✅ ${result.mensagem}`);
    },
  });

  const handleValidarConexao = (id: string) => {
    const token = tokens[id];
    if (!token) {
      alert("Por favor, cole o token primeiro");
      return;
    }

    setValidating({ ...validating, [id]: true });
    validarConexaoMutation.mutate({ plataforma: id as any, token });
    setTimeout(() => setValidating({ ...validating, [id]: false }), 2000);
  };

  const handleDesconectar = (id: string) => {
    if (confirm(`Tem certeza que deseja desconectar ${id}?`)) {
      desconectarMutation.mutate({ plataforma: id as any });
      setIntegrations(
        integrations.map((i) =>
          i.id === id ? { ...i, isConnected: false } : i
        )
      );
      setTokens({ ...tokens, [id]: "" });
    }
  };

  const handleCopyToken = (id: string) => {
    const token = tokens[id];
    if (token) {
      navigator.clipboard.writeText(token);
      alert("Token copiado para a área de transferência!");
    }
  };

  const oauthIntegrations = integrations.filter((p) => p.type === "oauth");
  const apikeyIntegrations = integrations.filter((p) => p.type === "apikey");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Plug className="w-8 h-8" />
            Integrações de Plataformas
          </h1>
          <p className="text-slate-600 mt-2">
            Conecte suas contas de diferentes plataformas para automação completa
          </p>
        </div>
      </div>

      {/* OAuth Integrations */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-blue-500" />
          Integrações OAuth
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {oauthIntegrations.map((integration) => (
            <Card key={integration.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{integration.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                  </div>
                  {integration.isConnected ? (
                    <Badge className="bg-green-500">Conectado</Badge>
                  ) : (
                    <Badge variant="secondary">Desconectado</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {integration.isConnected ? (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-900">
                        Última validação: {integration.lastValidated}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <span className="text-sm text-amber-900">
                        Não conectado. Clique em "Conectar" para iniciar.
                      </span>
                    </div>
                  )}

                  {integration.isConnected && (
                    <Button
                      onClick={() => handleDesconectar(integration.id)}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Desconectar
                    </Button>
                  )}

                  {!integration.isConnected && (
                    <Button
                      onClick={() => setExpandedId(expandedId === integration.id ? null : integration.id)}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Conectar {integration.name}
                    </Button>
                  )}

                  {expandedId === integration.id && !integration.isConnected && (
                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-xs text-slate-600">
                        Cole seu token de acesso abaixo:
                      </p>
                      <div className="flex gap-2">
                        <Input
                          type={showToken[integration.id] ? "text" : "password"}
                          placeholder="Cole seu token aqui..."
                          value={tokens[integration.id] || ""}
                          onChange={(e) =>
                            setTokens({ ...tokens, [integration.id]: e.target.value })
                          }
                          className="flex-1"
                        />
                        <Button
                          onClick={() =>
                            setShowToken({
                              ...showToken,
                              [integration.id]: !showToken[integration.id],
                            })
                          }
                          variant="outline"
                          size="sm"
                        >
                          {showToken[integration.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleValidarConexao(integration.id)}
                        disabled={validating[integration.id]}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {validating[integration.id] ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Validando...
                          </>
                        ) : (
                          "Validar Conexão"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* API Key Integrations */}
      <div>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          Integrações com API Key
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {apikeyIntegrations.map((integration) => (
            <Card key={integration.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{integration.icon}</span>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                  </div>
                  {integration.isConnected ? (
                    <Badge className="bg-green-500">Conectado</Badge>
                  ) : (
                    <Badge variant="secondary">Desconectado</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {integration.isConnected ? (
                    <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-green-900">
                        Última validação: {integration.lastValidated}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <AlertCircle className="w-5 h-5 text-amber-600" />
                      <span className="text-sm text-amber-900">
                        Não conectado. Cole sua chave de API.
                      </span>
                    </div>
                  )}

                  {integration.isConnected && (
                    <Button
                      onClick={() => handleDesconectar(integration.id)}
                      variant="destructive"
                      size="sm"
                      className="w-full"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Desconectar
                    </Button>
                  )}

                  {!integration.isConnected && (
                    <Button
                      onClick={() => setExpandedId(expandedId === integration.id ? null : integration.id)}
                      className="w-full bg-amber-600 hover:bg-amber-700"
                    >
                      Configurar {integration.name}
                    </Button>
                  )}

                  {expandedId === integration.id && !integration.isConnected && (
                    <div className="space-y-2 pt-2 border-t">
                      <p className="text-xs text-slate-600">
                        Cole sua chave de API abaixo:
                      </p>
                      <div className="flex gap-2">
                        <Input
                          type={showToken[integration.id] ? "text" : "password"}
                          placeholder="Cole sua chave de API aqui..."
                          value={tokens[integration.id] || ""}
                          onChange={(e) =>
                            setTokens({ ...tokens, [integration.id]: e.target.value })
                          }
                          className="flex-1"
                        />
                        <Button
                          onClick={() =>
                            setShowToken({
                              ...showToken,
                              [integration.id]: !showToken[integration.id],
                            })
                          }
                          variant="outline"
                          size="sm"
                        >
                          {showToken[integration.id] ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          onClick={() => handleCopyToken(integration.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button
                        onClick={() => handleValidarConexao(integration.id)}
                        disabled={validating[integration.id]}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {validating[integration.id] ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Validando...
                          </>
                        ) : (
                          "Validar Chave"
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Como obter seus tokens?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-900 space-y-2">
          <p>
            <strong>Bling ERP:</strong> Acesse sua conta Bling → Configurações → Integrações → Gere um token OAuth
          </p>
          <p>
            <strong>Canva:</strong> Acesse Canva Developer → Aplicações → Crie uma aplicação e gere as credenciais
          </p>
          <p>
            <strong>Meta (Facebook/Instagram):</strong> Acesse Meta Developers → Meus Aplicativos → Crie um app
          </p>
          <p>
            <strong>TikTok:</strong> Acesse TikTok Developer → Crie uma aplicação e gere as credenciais
          </p>
          <p>
            <strong>Google Drive:</strong> Acesse Google Cloud Console → Crie um projeto → Gere credenciais OAuth
          </p>
          <p>
            <strong>WhatsApp Business:</strong> Configure via Meta Business Suite com seu Business Account
          </p>
          <p>
            <strong>Email Marketing:</strong> Acesse sua plataforma de email e gere uma API Key
          </p>
          <p>
            <strong>Tray:</strong> Acesse Configurações → Integrações → API e copie sua chave
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
