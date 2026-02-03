import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Privacidade() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#A63D4A' }}>
                Feminnita
              </h1>
              <p className="text-sm text-slate-600 mt-1">Política de Privacidade</p>
            </div>
            <Link href="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Política de Privacidade</h2>
            <p className="text-slate-700 leading-relaxed">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">1. Coleta de Dados</h3>
            <p className="text-slate-700 leading-relaxed">
              A Feminnita coleta apenas os dados necessários para fornecer o serviço de integração com TikTok Ads. Não armazenamos dados pessoais além do necessário para operação da plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">2. Tokens de Autorização</h3>
            <p className="text-slate-700 leading-relaxed">
              Armazenamos apenas tokens de autorização da API do TikTok para integração da sua conta. Estes tokens são:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-2">
              <li>Armazenados de forma segura em nosso banco de dados</li>
              <li>Utilizados apenas para executar ações que você autoriza</li>
              <li>Nunca compartilhados com terceiros</li>
              <li>Deletados quando você desconecta sua conta</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">3. Dados Pessoais</h3>
            <p className="text-slate-700 leading-relaxed">
              Não armazenamos informações pessoais como:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-2">
              <li>Senhas ou credenciais de login</li>
              <li>Dados de cartão de crédito</li>
              <li>Informações de contato pessoais</li>
              <li>Histórico de navegação</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">4. Segurança</h3>
            <p className="text-slate-700 leading-relaxed">
              Implementamos medidas de segurança para proteger seus dados:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-2">
              <li>Criptografia de dados em trânsito (HTTPS)</li>
              <li>Armazenamento seguro de tokens</li>
              <li>Acesso restrito a dados</li>
              <li>Auditorias regulares de segurança</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">5. Compartilhamento de Dados</h3>
            <p className="text-slate-700 leading-relaxed">
              Seus dados não são compartilhados com terceiros, exceto:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-2">
              <li>TikTok (através de sua autorização explícita)</li>
              <li>Quando exigido por lei</li>
              <li>Para proteger direitos e segurança</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">6. Seus Direitos</h3>
            <p className="text-slate-700 leading-relaxed">
              Você tem o direito de:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-2">
              <li>Acessar seus dados</li>
              <li>Corrigir informações incorretas</li>
              <li>Deletar sua conta e dados associados</li>
              <li>Revogar autorização de integração</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">7. Cookies</h3>
            <p className="text-slate-700 leading-relaxed">
              Utilizamos cookies apenas para autenticação e sessão do usuário. Não utilizamos cookies de rastreamento ou publicidade.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">8. Alterações na Política</h3>
            <p className="text-slate-700 leading-relaxed">
              Podemos atualizar esta política de privacidade periodicamente. Notificaremos sobre mudanças significativas através do email ou aviso no site.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">9. Contato</h3>
            <p className="text-slate-700 leading-relaxed">
              Para dúvidas sobre privacidade, entre em contato conosco através do email ou formulário de contato no site.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Ao usar a plataforma Feminnita, você concorda com esta política de privacidade.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
