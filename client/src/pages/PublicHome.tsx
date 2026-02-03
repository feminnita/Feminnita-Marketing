/**
 * Página Home pública - sem autenticação necessária
 * Versão simplificada para TikTok validar
 */
export default function PublicHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: '#A63D4A' }}>
                Feminnita
              </h1>
              <p className="text-sm text-slate-600 mt-1">Estratégia de Marketing Digital Completa</p>
            </div>
            <span className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-medium">
              Atacado de Pijamas
            </span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl border border-amber-200 p-12 space-y-8">
          <div className="max-w-3xl">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Sua Estratégia de Marketing Digital Personalizada
            </h2>
            <p className="text-lg text-slate-700 leading-relaxed mb-8">
              Descubra como captar clientes potenciais através de 4 personas de influenciadoras humanizadas, planejamento semanal de conteúdo, roteiros de vídeos para stories e ads, além de análise de tendências virais do TikTok que já venderam milhares de peças.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              <div className="bg-amber-50 rounded-lg p-6 border border-amber-200 text-center">
                <div className="text-2xl mb-2">👥</div>
                <p className="text-sm font-semibold text-slate-900">4 Personas</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-6 border border-amber-200 text-center">
                <div className="text-2xl mb-2">📅</div>
                <p className="text-sm font-semibold text-slate-900">Planejamento Semanal</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-6 border border-amber-200 text-center">
                <div className="text-2xl mb-2">🎬</div>
                <p className="text-sm font-semibold text-slate-900">Roteiros de Vídeos</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-6 border border-amber-200 text-center">
                <div className="text-2xl mb-2">📈</div>
                <p className="text-sm font-semibold text-slate-900">Tendências TikTok</p>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-slate-900">Recursos Principais:</h3>
              <ul className="space-y-3 text-slate-700">
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1">✓</span>
                  <span>Integração com TikTok Ads para publicação de vídeos</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1">✓</span>
                  <span>Rastreamento de campanhas e métricas de performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1">✓</span>
                  <span>Envio de eventos de conversão para otimização</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-amber-600 mt-1">✓</span>
                  <span>Automação de marketing digital para pequenos negócios</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Footer Links */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <div className="flex flex-wrap gap-6 justify-center text-sm text-slate-600">
            <a href="/termos" className="hover:text-amber-600 transition">
              Termos de Serviço
            </a>
            <span className="text-slate-300">•</span>
            <a href="/privacidade" className="hover:text-amber-600 transition">
              Política de Privacidade
            </a>
            <span className="text-slate-300">•</span>
            <span>© 2026 Feminnita. Todos os direitos reservados.</span>
          </div>
        </div>
      </main>
    </div>
  );
}
