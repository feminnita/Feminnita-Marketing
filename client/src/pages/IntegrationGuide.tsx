import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, CheckCircle, AlertCircle } from "lucide-react";

interface GuideStep {
  numero: number;
  titulo: string;
  descricao: string;
  passos: string[];
  dicas?: string[];
  link?: string;
}

const GUIDES: Record<string, GuideStep> = {
  bling: {
    numero: 1,
    titulo: "Bling ERP - OAuth",
    descricao: "Conecte sua conta Bling usando OAuth (recomendado)",
    passos: [
      "Clique em 'Conectar com Bling ERP' na página de Integrações",
      "Você será redirecionado para o Bling",
      "Faça login com sua conta Bling",
      "Autorize o acesso clicando em 'Autorizar'",
      "Você será redirecionado de volta para Feminnita",
      "Pronto! Bling está conectado",
    ],
    dicas: [
      "OAuth é mais seguro - seu token é armazenado criptografado",
      "O token será renovado automaticamente quando expirar",
      "Você pode desconectar a qualquer momento",
    ],
    link: "https://bling.com.br",
  },
  meta: {
    numero: 2,
    titulo: "Meta (Facebook & Instagram) - OAuth",
    descricao: "Conecte suas contas do Facebook e Instagram",
    passos: [
      "Clique em 'Conectar com Meta' na página de Integrações",
      "Você será redirecionado para Meta Business",
      "Faça login com sua conta Meta",
      "Selecione a página do Facebook ou conta Instagram",
      "Autorize o acesso clicando em 'Continuar'",
      "Você será redirecionado de volta para Feminnita",
      "Pronto! Meta está conectada",
    ],
    dicas: [
      "Você pode conectar múltiplas páginas/contas",
      "Certifique-se de ter permissões de administrador",
      "Os escopos incluem: gerenciamento de campanhas, leitura de insights, etc",
    ],
    link: "https://business.facebook.com",
  },
  tiktok: {
    numero: 3,
    titulo: "TikTok - OAuth",
    descricao: "Conecte sua conta TikTok Business",
    passos: [
      "Clique em 'Conectar com TikTok' na página de Integrações",
      "Você será redirecionado para TikTok",
      "Faça login com sua conta TikTok Business",
      "Autorize o acesso clicando em 'Autorizar'",
      "Você será redirecionado de volta para Feminnita",
      "Pronto! TikTok está conectado",
    ],
    dicas: [
      "Você precisa de uma conta TikTok Business",
      "Contas pessoais não funcionam com a API",
      "Você pode gerenciar vídeos e visualizar analytics",
    ],
    link: "https://business.tiktok.com",
  },
  google_drive: {
    numero: 4,
    titulo: "Google Drive - OAuth",
    descricao: "Sincronize arquivos do Google Drive",
    passos: [
      "Clique em 'Conectar com Google Drive' na página de Integrações",
      "Você será redirecionado para Google",
      "Faça login com sua conta Google",
      "Autorize o acesso aos seus arquivos",
      "Você será redirecionado de volta para Feminnita",
      "Pronto! Google Drive está conectado",
    ],
    dicas: [
      "Você pode compartilhar arquivos e pastas",
      "Os arquivos sincronizados aparecem em uma pasta especial",
      "Você pode revogar o acesso a qualquer momento",
    ],
    link: "https://drive.google.com",
  },
  tray: {
    numero: 5,
    titulo: "Tray - API Key",
    descricao: "Integração com plataforma de e-commerce Tray",
    passos: [
      "Acesse https://www.tray.com.br",
      "Faça login com sua conta Tray",
      "Vá para Configurações → Integrações",
      "Procure por 'API' ou 'Chaves de Acesso'",
      "Clique em 'Gerar Nova Chave'",
      "Copie a chave gerada",
      "Volte para Feminnita e cole a chave no campo 'Token'",
      "Clique em 'Validar Conexão'",
    ],
    dicas: [
      "Guarde a chave em um local seguro",
      "Você pode gerar múltiplas chaves",
      "Revogue chaves antigas quando não precisar mais",
    ],
    link: "https://www.tray.com.br",
  },
  email_marketing: {
    numero: 6,
    titulo: "Email Marketing (RD Station / Mailchimp) - API Key",
    descricao: "Integração com plataforma de email marketing",
    passos: [
      "Escolha sua plataforma (RD Station, Mailchimp, etc)",
      "Acesse as configurações da sua conta",
      "Procure por 'Chaves de API' ou 'API Keys'",
      "Gere uma nova chave se necessário",
      "Copie a chave",
      "Volte para Feminnita e cole a chave no campo 'Token'",
      "Clique em 'Validar Conexão'",
    ],
    dicas: [
      "Diferentes plataformas têm processos diferentes",
      "Certifique-se de copiar a chave corretamente",
      "Teste a conexão antes de usar em produção",
    ],
    link: "https://www.rdstation.com",
  },
  whatsapp: {
    numero: 7,
    titulo: "WhatsApp Business - API Key",
    descricao: "Integração com WhatsApp Business API",
    passos: [
      "Acesse Meta Business Suite: https://business.facebook.com",
      "Vá para Configurações → Integrações → WhatsApp",
      "Clique em 'Começar'",
      "Siga o processo de verificação de número",
      "Gere um token de acesso permanente",
      "Copie o token",
      "Volte para Feminnita e cole o token no campo 'Token'",
      "Clique em 'Validar Conexão'",
    ],
    dicas: [
      "Você precisa de uma conta Meta Business",
      "O número deve ser verificado",
      "Tokens de acesso expiram - gere um permanente",
    ],
    link: "https://business.facebook.com",
  },
  instagram: {
    numero: 8,
    titulo: "Instagram - API Key (Graph API)",
    descricao: "Conecte sua conta do Instagram",
    passos: [
      "Acesse https://developers.facebook.com",
      "Crie um aplicativo ou use um existente",
      "Vá para Ferramentas → Graph API Explorer",
      "Selecione sua conta Instagram",
      "Gere um token de acesso",
      "Copie o token",
      "Volte para Feminnita e cole o token no campo 'Token'",
      "Clique em 'Validar Conexão'",
    ],
    dicas: [
      "Use o Graph API Explorer para testes",
      "Tokens de curta duração expiram em 1 hora",
      "Gere tokens de longa duração para produção",
    ],
    link: "https://developers.facebook.com",
  },
  facebook: {
    numero: 9,
    titulo: "Facebook - API Key (Graph API)",
    descricao: "Conecte sua página do Facebook",
    passos: [
      "Acesse https://developers.facebook.com",
      "Crie um aplicativo ou use um existente",
      "Vá para Ferramentas → Graph API Explorer",
      "Selecione sua página Facebook",
      "Gere um token de acesso",
      "Copie o token",
      "Volte para Feminnita e cole o token no campo 'Token'",
      "Clique em 'Validar Conexão'",
    ],
    dicas: [
      "Você precisa ser administrador da página",
      "Tokens de curta duração expiram em 1 hora",
      "Use tokens de longa duração para produção",
    ],
    link: "https://developers.facebook.com",
  },
};

export default function IntegrationGuide() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Guia de Integrações</h1>
          <p className="text-gray-600 mt-2">
            Siga os passos para conectar cada plataforma
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {Object.entries(GUIDES).map(([key, guide]) => (
          <Card key={key} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className="bg-blue-100 text-blue-800 text-lg px-3 py-1">
                    {guide.numero}
                  </Badge>
                  <div>
                    <CardTitle>{guide.titulo}</CardTitle>
                    <CardDescription>{guide.descricao}</CardDescription>
                  </div>
                </div>
                {guide.link && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(guide.link, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Acessar
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Passos
                </h4>
                <ol className="space-y-2 ml-7">
                  {guide.passos.map((passo, idx) => (
                    <li key={idx} className="text-sm text-gray-700">
                      <span className="font-semibold">{idx + 1}.</span> {passo}
                    </li>
                  ))}
                </ol>
              </div>

              {guide.dicas && guide.dicas.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-600" />
                    Dicas Importantes
                  </h4>
                  <ul className="space-y-1 ml-7">
                    {guide.dicas.map((dica, idx) => (
                      <li key={idx} className="text-sm text-gray-700">
                        • {dica}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">❓ Dúvidas Frequentes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="font-semibold text-blue-900">
              Qual é a diferença entre OAuth e API Key?
            </p>
            <p className="text-blue-800 mt-1">
              OAuth é mais seguro e permite que você autorize sem compartilhar sua senha.
              API Keys são mais simples mas requerem que você as guarde com segurança.
            </p>
          </div>
          <div>
            <p className="font-semibold text-blue-900">
              Meus tokens são armazenados com segurança?
            </p>
            <p className="text-blue-800 mt-1">
              Sim! Todos os tokens são criptografados no banco de dados e nunca são
              exibidos em texto plano.
            </p>
          </div>
          <div>
            <p className="font-semibold text-blue-900">
              Posso conectar múltiplas contas da mesma plataforma?
            </p>
            <p className="text-blue-800 mt-1">
              Atualmente, você pode conectar uma conta por plataforma. Para múltiplas
              contas, entre em contato com o suporte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
