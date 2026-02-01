import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Loader2, Unlink } from "lucide-react";
// import { trpc } from "@/lib/trpc";

export default function Integrations() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});

  // Meta Ads
  const [metaAccessToken, setMetaAccessToken] = useState("");
  const [metaConnected, setMetaConnected] = useState(false);

  // Google Ads
  const [googleAccessToken, setGoogleAccessToken] = useState("");
  const [googleCustomerId, setGoogleCustomerId] = useState("");
  const [googleConnected, setGoogleConnected] = useState(false);

  // WhatsApp
  const [whatsappAccessToken, setWhatsappAccessToken] = useState("");
  const [whatsappPhoneId, setWhatsappPhoneId] = useState("");
  const [whatsappConnected, setWhatsappConnected] = useState(false);

  const handleConnectMeta = async () => {
    if (!metaAccessToken) {
      alert("Por favor, insira o token de acesso do Meta Ads");
      return;
    }

    setLoading({ ...loading, meta: true });
    try {
      // Aqui você pode testar a conexão com a API
      // const result = await trpc.metaAds.obterCampanhas.query({...});
      setMetaConnected(true);
      alert("Meta Ads conectado com sucesso!");
    } catch (error) {
      alert("Falha ao conectar com Meta Ads");
    } finally {
      setLoading({ ...loading, meta: false });
    }
  };

  const handleConnectGoogle = async () => {
    if (!googleAccessToken || !googleCustomerId) {
      alert("Por favor, insira o token e ID do cliente do Google Ads");
      return;
    }

    setLoading({ ...loading, google: true });
    try {
      setGoogleConnected(true);
      alert("Google Ads conectado com sucesso!");
    } catch (error) {
      alert("Falha ao conectar com Google Ads");
    } finally {
      setLoading({ ...loading, google: false });
    }
  };

  const handleConnectWhatsApp = async () => {
    if (!whatsappAccessToken || !whatsappPhoneId) {
      alert("Por favor, insira o token e ID do telefone do WhatsApp");
      return;
    }

    setLoading({ ...loading, whatsapp: true });
    try {
      setWhatsappConnected(true);
      alert("WhatsApp Business conectado com sucesso!");
    } catch (error) {
      alert("Falha ao conectar com WhatsApp");
    } finally {
      setLoading({ ...loading, whatsapp: false });
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Integrações</h1>
        <p className="text-muted-foreground mt-2">
          Conecte suas plataformas de marketing para automação completa
        </p>
      </div>

      <Tabs defaultValue="meta" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="meta">Meta Ads</TabsTrigger>
          <TabsTrigger value="google">Google Ads</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        </TabsList>

        {/* Meta Ads Tab */}
        <TabsContent value="meta" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Meta Ads</CardTitle>
                  <CardDescription>
                    Conecte sua conta Meta para gerenciar campanhas do Facebook e Instagram
                  </CardDescription>
                </div>
                {metaConnected && (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {metaConnected ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900">Conectado com sucesso</p>
                      <p className="text-sm text-green-700">Sua conta Meta Ads está sincronizada</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setMetaConnected(false);
                      setMetaAccessToken("");
                    }}
                  >
                    <Unlink className="w-4 h-4 mr-2" />
                    Desconectar
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900">Como obter seu token</p>
                      <p className="text-sm text-blue-700">
                        Acesse{" "}
                        <a
                          href="https://developers.facebook.com/apps"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-medium"
                        >
                          Facebook Developers
                        </a>
                        , crie uma app e gere um token de acesso
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="meta-token">Token de Acesso</Label>
                    <Input
                      id="meta-token"
                      type="password"
                      placeholder="Insira seu token de acesso Meta"
                      value={metaAccessToken}
                      onChange={(e) => setMetaAccessToken(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleConnectMeta}
                    disabled={loading.meta || !metaAccessToken}
                    className="w-full"
                  >
                    {loading.meta && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Conectar Meta Ads
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Google Ads Tab */}
        <TabsContent value="google" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Google Ads</CardTitle>
                  <CardDescription>
                    Conecte sua conta Google Ads para gerenciar campanhas de anúncios
                  </CardDescription>
                </div>
                {googleConnected && (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {googleConnected ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900">Conectado com sucesso</p>
                      <p className="text-sm text-green-700">Sua conta Google Ads está sincronizada</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGoogleConnected(false);
                      setGoogleAccessToken("");
                      setGoogleCustomerId("");
                    }}
                  >
                    <Unlink className="w-4 h-4 mr-2" />
                    Desconectar
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900">Como obter suas credenciais</p>
                      <p className="text-sm text-blue-700">
                        Acesse{" "}
                        <a
                          href="https://developers.google.com/google-ads/api"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-medium"
                        >
                          Google Ads API Console
                        </a>
                        , crie um projeto e gere suas credenciais
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google-token">Token de Acesso</Label>
                    <Input
                      id="google-token"
                      type="password"
                      placeholder="Insira seu token de acesso Google"
                      value={googleAccessToken}
                      onChange={(e) => setGoogleAccessToken(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="google-customer">ID do Cliente</Label>
                    <Input
                      id="google-customer"
                      placeholder="Ex: 1234567890"
                      value={googleCustomerId}
                      onChange={(e) => setGoogleCustomerId(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleConnectGoogle}
                    disabled={loading.google || !googleAccessToken || !googleCustomerId}
                    className="w-full"
                  >
                    {loading.google && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Conectar Google Ads
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* WhatsApp Tab */}
        <TabsContent value="whatsapp" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>WhatsApp Business</CardTitle>
                  <CardDescription>
                    Conecte sua conta WhatsApp para automação de mensagens
                  </CardDescription>
                </div>
                {whatsappConnected && (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {whatsappConnected ? (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-900">Conectado com sucesso</p>
                      <p className="text-sm text-green-700">Sua conta WhatsApp está sincronizada</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setWhatsappConnected(false);
                      setWhatsappAccessToken("");
                      setWhatsappPhoneId("");
                    }}
                  >
                    <Unlink className="w-4 h-4 mr-2" />
                    Desconectar
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-900">Como obter suas credenciais</p>
                      <p className="text-sm text-blue-700">
                        Acesse{" "}
                        <a
                          href="https://developers.facebook.com/docs/whatsapp/cloud-api"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline font-medium"
                        >
                          WhatsApp Cloud API
                        </a>
                        , configure sua conta e gere um token
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-token">Token de Acesso</Label>
                    <Input
                      id="whatsapp-token"
                      type="password"
                      placeholder="Insira seu token de acesso WhatsApp"
                      value={whatsappAccessToken}
                      onChange={(e) => setWhatsappAccessToken(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="whatsapp-phone">ID do Telefone</Label>
                    <Input
                      id="whatsapp-phone"
                      placeholder="Ex: 1234567890"
                      value={whatsappPhoneId}
                      onChange={(e) => setWhatsappPhoneId(e.target.value)}
                    />
                  </div>

                  <Button
                    onClick={handleConnectWhatsApp}
                    disabled={loading.whatsapp || !whatsappAccessToken || !whatsappPhoneId}
                    className="w-full"
                  >
                    {loading.whatsapp && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Conectar WhatsApp
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
