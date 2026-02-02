import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertCircle, Copy } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface OAuthCredential {
  platform: string;
  clientId: string;
  clientSecret: string;
  redirectUri?: string;
}

export default function OAuthCredentials() {
  const [credentials, setCredentials] = useState<Record<string, OAuthCredential>>({
    meta: { platform: 'Meta (Facebook/Instagram)', clientId: '', clientSecret: '', redirectUri: '' },
    tiktok: { platform: 'TikTok', clientId: '', clientSecret: '', redirectUri: '' },
    google: { platform: 'Google Drive', clientId: '', clientSecret: '', redirectUri: '' },
    bling: { platform: 'Bling ERP', clientId: '', clientSecret: '', redirectUri: '' },
    emailMarketing: { platform: 'Email Marketing', clientId: '', clientSecret: '', redirectUri: '' },
    canva: { platform: 'Canva', clientId: '', clientSecret: '', redirectUri: '' },
  });

  const [savedCredentials, setSavedCredentials] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const saveMutation = trpc.oauthIntegrations.saveCredentials.useMutation();

  const handleInputChange = (platform: string, field: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        [field]: value
      }
    }));
  };

  const handleSaveCredentials = async (platform: string) => {
    const cred = credentials[platform];
    
    if (!cred.clientId || !cred.clientSecret) {
      setMessage(`Por favor, preencha Client ID e Client Secret para ${cred.platform}`);
      return;
    }

    setLoading(true);
    try {
      await saveMutation.mutateAsync({
        platform,
        clientId: cred.clientId,
        clientSecret: cred.clientSecret,
        redirectUri: cred.redirectUri || `${window.location.origin}/api/oauth/${platform}/callback`
      });

      setSavedCredentials(prev => ({
        ...prev,
        [platform]: true
      }));

      setMessage(`✅ Credenciais de ${cred.platform} salvas com sucesso!`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`❌ Erro ao salvar credenciais: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Configurar Credenciais OAuth</h1>
        <p className="text-gray-600">
          Adicione as credenciais de cada plataforma para ativar as integrações
        </p>
      </div>

      {message && (
        <Alert className="mb-6" variant={message.includes('✅') ? 'default' : 'destructive'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {Object.entries(credentials).map(([key, cred]) => (
          <Card key={key} className={savedCredentials[key] ? 'border-green-500' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {cred.platform}
                    {savedCredentials[key] && <CheckCircle className="w-5 h-5 text-green-500" />}
                  </CardTitle>
                  <CardDescription>
                    Obtenha as credenciais no painel de desenvolvedor da plataforma
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor={`${key}-clientId`}>Client ID</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id={`${key}-clientId`}
                    type="password"
                    placeholder="Cole seu Client ID aqui"
                    value={cred.clientId}
                    onChange={(e) => handleInputChange(key, 'clientId', e.target.value)}
                    disabled={savedCredentials[key]}
                  />
                  {cred.clientId && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(cred.clientId)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor={`${key}-clientSecret`}>Client Secret</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id={`${key}-clientSecret`}
                    type="password"
                    placeholder="Cole seu Client Secret aqui"
                    value={cred.clientSecret}
                    onChange={(e) => handleInputChange(key, 'clientSecret', e.target.value)}
                    disabled={savedCredentials[key]}
                  />
                  {cred.clientSecret && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(cred.clientSecret)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>

              <div>
                <Label htmlFor={`${key}-redirectUri`}>Redirect URI (opcional)</Label>
                <Input
                  id={`${key}-redirectUri`}
                  type="text"
                  placeholder={`${window.location.origin}/api/oauth/${key}/callback`}
                  value={cred.redirectUri}
                  onChange={(e) => handleInputChange(key, 'redirectUri', e.target.value)}
                  disabled={savedCredentials[key]}
                  className="text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use este URI no painel de desenvolvedor da plataforma
                </p>
              </div>

              <Button
                onClick={() => handleSaveCredentials(key)}
                disabled={loading || savedCredentials[key]}
                className="w-full"
              >
                {savedCredentials[key] ? '✅ Salvo' : 'Salvar Credenciais'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg">Guia Rápido</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="font-semibold text-blue-900">Meta (Facebook/Instagram):</p>
            <p className="text-blue-800">Acesse <a href="https://developers.facebook.com" target="_blank" rel="noopener noreferrer" className="underline">developers.facebook.com</a>, crie um app e obtenha o App ID e App Secret</p>
          </div>
          <div>
            <p className="font-semibold text-blue-900">TikTok:</p>
            <p className="text-blue-800">Acesse <a href="https://developers.tiktok.com" target="_blank" rel="noopener noreferrer" className="underline">developers.tiktok.com</a>, crie um app e obtenha as credenciais</p>
          </div>
          <div>
            <p className="font-semibold text-blue-900">Google Drive:</p>
            <p className="text-blue-800">Acesse <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">console.cloud.google.com</a>, crie um projeto OAuth 2.0 e obtenha as credenciais</p>
          </div>
          <div>
            <p className="font-semibold text-blue-900">Bling ERP:</p>
            <p className="text-blue-800">Acesse <a href="https://bling.com.br" target="_blank" rel="noopener noreferrer" className="underline">bling.com.br</a>, vá em Configurações → Integrações e obtenha as credenciais</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
