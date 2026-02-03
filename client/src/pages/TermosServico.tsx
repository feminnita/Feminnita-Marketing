import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermosServico() {
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
              <p className="text-sm text-slate-600 mt-1">Termos de Serviço</p>
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
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Termos de Serviço</h2>
            <p className="text-slate-700 leading-relaxed">
              Última atualização: {new Date().toLocaleDateString('pt-BR')}
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">1. Descrição do Serviço</h3>
            <p className="text-slate-700 leading-relaxed">
              A plataforma Feminnita conecta contas do TikTok Ads para publicação de vídeos, rastreamento de campanhas e envio de eventos de conversão. Oferecemos ferramentas de automação de marketing digital para pequenos negócios.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">2. Autorização de API</h3>
            <p className="text-slate-700 leading-relaxed">
              Ao usar nossa plataforma, você autoriza a Feminnita a:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-2">
              <li>Conectar sua conta do TikTok Ads</li>
              <li>Publicar vídeos em suas campanhas</li>
              <li>Rastrear métricas de performance</li>
              <li>Enviar eventos de conversão para otimização de campanhas</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">3. Responsabilidades do Usuário</h3>
            <p className="text-slate-700 leading-relaxed">
              Você é responsável por:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-2">
              <li>Manter a confidencialidade de suas credenciais de login</li>
              <li>Garantir que possui autorização para usar as contas conectadas</li>
              <li>Cumprir com os termos de serviço do TikTok</li>
              <li>Usar a plataforma de forma legal e ética</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">4. Limitações de Responsabilidade</h3>
            <p className="text-slate-700 leading-relaxed">
              A Feminnita não é responsável por:
            </p>
            <ul className="list-disc list-inside text-slate-700 space-y-2 ml-2">
              <li>Perda de dados ou interrupção de serviço</li>
              <li>Decisões de publicação ou conteúdo</li>
              <li>Resultados de campanhas ou ROI</li>
              <li>Ações tomadas pelo TikTok ou outras plataformas</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">5. Modificações do Serviço</h3>
            <p className="text-slate-700 leading-relaxed">
              Reservamos o direito de modificar ou descontinuar o serviço a qualquer momento, com ou sem aviso prévio.
            </p>
          </section>

          <section className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900">6. Contato</h3>
            <p className="text-slate-700 leading-relaxed">
              Para dúvidas sobre estes termos, entre em contato conosco através do email ou formulário de contato no site.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-200">
            <p className="text-sm text-slate-600">
              Ao usar a plataforma Feminnita, você concorda com estes termos de serviço.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
