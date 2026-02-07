import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function PrivacyPolicy() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setLocation("/")}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold" style={{ color: "#A63D4A" }}>
                  Feminnita
                </h1>
                <p className="text-sm text-slate-600">Política de Privacidade</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Política de Privacidade</CardTitle>
            <CardDescription>
              Última atualização: {new Date().toLocaleDateString("pt-BR")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-slate-700 leading-relaxed">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">1. Introdução</h2>
              <p>
                A Feminnita Marketing ("nós", "nosso" ou "a Empresa") opera a plataforma de estratégia de marketing digital (o "Serviço"). Esta página informa você sobre nossas políticas sobre a coleta, uso e divulgação de dados pessoais quando você usa nosso Serviço e as escolhas que você tem associadas a esses dados.
              </p>
              <p className="mt-4">
                Usamos seus dados para fornecer e melhorar o Serviço. Ao usar o Serviço, você concorda com a coleta e uso de informações de acordo com esta política.
              </p>
            </section>

            {/* Data Collection */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">2. Coleta de Dados</h2>
              <p className="mb-4">Coletamos vários tipos de informações para diversos fins para fornecer e melhorar nosso Serviço:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Dados de Identificação:</strong> Nome, endereço de e-mail, número de telefone, endereço postal</li>
                <li><strong>Dados de Uso:</strong> Informações sobre como você interage com nosso Serviço, incluindo cliques, páginas visitadas, tempo gasto</li>
                <li><strong>Dados de Dispositivo:</strong> Tipo de dispositivo, sistema operacional, navegador, endereço IP</li>
                <li><strong>Dados de Campanhas:</strong> Informações sobre suas campanhas de marketing, públicos-alvo, métricas de desempenho</li>
                <li><strong>Dados de Redes Sociais:</strong> Informações conectadas ao Meta Ads, incluindo IDs de conta, dados de campanhas</li>
              </ul>
            </section>

            {/* Data Usage */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">3. Uso dos Dados</h2>
              <p className="mb-4">Usamos os dados coletados para:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Fornecer, manter e melhorar nosso Serviço</li>
                <li>Notificar você sobre mudanças em nosso Serviço</li>
                <li>Permitir que você participe de recursos interativos do Serviço</li>
                <li>Fornecer suporte ao cliente</li>
                <li>Coletar análises e informações para melhorar nosso Serviço</li>
                <li>Monitorar o uso do Serviço para fins de segurança</li>
                <li>Detectar, prevenir e resolver problemas técnicos e fraudes</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">4. Segurança dos Dados</h2>
              <p>
                A segurança de seus dados é importante para nós, mas lembre-se de que nenhum método de transmissão pela Internet ou método de armazenamento eletrônico é 100% seguro. Embora nos esforcemos para usar meios comercialmente aceitáveis para proteger seus dados pessoais, não podemos garantir sua segurança absoluta.
              </p>
            </section>

            {/* Third Party Services */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">5. Serviços de Terceiros</h2>
              <p className="mb-4">
                Nosso Serviço pode conter links para sites de terceiros que não são operados por nós. Esta Política de Privacidade não se aplica a esses sites externos, e não somos responsáveis por suas práticas de privacidade. Recomendamos que você revise a política de privacidade de qualquer site de terceiros antes de fornecer seus dados pessoais.
              </p>
              <p>
                Integramos com o Meta Ads para gerenciar suas campanhas de publicidade. Seus dados podem ser compartilhados com o Meta de acordo com seus termos de serviço.
              </p>
            </section>

            {/* User Rights */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">6. Seus Direitos</h2>
              <p className="mb-4">Você tem direitos em relação aos seus dados pessoais, incluindo:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>O direito de acessar seus dados pessoais</li>
                <li>O direito de corrigir dados imprecisos</li>
                <li>O direito de solicitar a exclusão de seus dados</li>
                <li>O direito de se opor ao processamento de seus dados</li>
                <li>O direito de solicitar a restrição do processamento</li>
              </ul>
              <p className="mt-4">
                Para exercer qualquer desses direitos, entre em contato conosco usando as informações de contato fornecidas abaixo.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">7. Entre em Contato Conosco</h2>
              <p>
                Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco em:
              </p>
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p><strong>Email:</strong> feminnita@gmail.com</p>
                <p><strong>Empresa:</strong> Feminnita Marketing</p>
                <p><strong>Assunto:</strong> Política de Privacidade</p>
              </div>
            </section>

            {/* Changes to Policy */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">8. Alterações nesta Política</h2>
              <p>
                Podemos atualizar nossa Política de Privacidade de tempos em tempos. Notificaremos você sobre qualquer alteração publicando a nova Política de Privacidade nesta página e atualizando a data de "Última atualização" no topo desta página.
              </p>
              <p className="mt-4">
                Recomendamos que você revise esta Política de Privacidade periodicamente para estar ciente de qualquer alteração. Suas alterações nesta Política de Privacidade são efetivas quando postadas nesta página.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
