export default function TermsOfService() {
  const today = "30 de abril de 2026";

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-12">

        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900">Feminnita Pijamas</h1>
          <p className="text-gray-500 mt-1 text-sm">marketing.feminnita.com.br</p>
        </div>

        {/* Termos de Uso */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Termos de Uso</h2>
          <p className="text-sm text-gray-500 mb-6">Última atualização: {today}</p>

          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Sobre a Plataforma</h3>
              <p>Este sistema de marketing digital é uma plataforma interna da Feminnita Pijamas LTDA (CNPJ: a informar), utilizada exclusivamente pela equipe interna para gestão de conteúdo, agendamento e publicação de vídeos nas redes sociais da marca.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Uso Autorizado</h3>
              <p>O acesso à plataforma é restrito a colaboradores autorizados da Feminnita Pijamas. É vedado o uso para fins alheios às atividades de marketing da empresa, bem como o compartilhamento de credenciais de acesso com terceiros não autorizados.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Conteúdo Publicado</h3>
              <p>Todo conteúdo enviado e publicado por meio desta plataforma é de responsabilidade da Feminnita Pijamas. A empresa se compromete a respeitar as diretrizes de conteúdo das plataformas integradas (TikTok, Instagram), incluindo as regras sobre direitos autorais, música, publicidade e transparência em parcerias com criadores de conteúdo.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4. Integração com Redes Sociais</h3>
              <p>A plataforma utiliza APIs oficiais do TikTok e Instagram para publicação de conteúdo orgânico. O acesso às contas é autorizado pelos respectivos titulares por meio de fluxo OAuth oficial. A Feminnita Pijamas não armazena senhas de redes sociais.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">5. Propriedade Intelectual</h3>
              <p>Os vídeos, imagens e textos criados e publicados pela plataforma são de propriedade da Feminnita Pijamas ou utilizados com a devida autorização. A empresa respeita os direitos de terceiros e remove qualquer conteúdo mediante notificação fundamentada.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">6. Responsabilidades</h3>
              <p>A Feminnita Pijamas não se responsabiliza por indisponibilidades temporárias das APIs de terceiros. Os usuários da plataforma devem garantir que o conteúdo publicado esteja em conformidade com a legislação brasileira e as políticas das plataformas de destino.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">7. Alterações nos Termos</h3>
              <p>Estes Termos podem ser atualizados periodicamente. As alterações entram em vigor a partir da data de publicação nesta página.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">8. Contato</h3>
              <p>Para dúvidas sobre estes Termos, entre em contato pelo e-mail: <a href="mailto:feminnita@gmail.com" className="text-pink-600 underline">feminnita@gmail.com</a></p>
            </div>
          </div>
        </section>

        {/* Política de Privacidade */}
        <section>
          <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-2 border-b border-gray-200">Política de Privacidade</h2>
          <p className="text-sm text-gray-500 mb-6">Última atualização: {today}</p>

          <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">1. Dados Coletados</h3>
              <p>Esta plataforma coleta apenas os dados estritamente necessários para seu funcionamento:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                <li>Nome e e-mail dos colaboradores cadastrados</li>
                <li>Tokens de acesso OAuth das contas de redes sociais autorizadas</li>
                <li>Vídeos e imagens enviados para publicação</li>
                <li>Legendas, hashtags e configurações de agendamento</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">2. Uso dos Dados</h3>
              <p>Os dados coletados são utilizados exclusivamente para:</p>
              <ul className="list-disc list-inside mt-2 space-y-1 text-gray-600">
                <li>Autenticação e controle de acesso dos colaboradores</li>
                <li>Publicação e agendamento de conteúdo nas redes sociais da Feminnita Pijamas</li>
                <li>Análise de desempenho de publicações</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">3. Compartilhamento de Dados</h3>
              <p>Os dados <strong>não são vendidos, alugados ou compartilhados</strong> com terceiros para fins comerciais. São transmitidos às APIs do TikTok e Instagram apenas os dados necessários para a publicação do conteúdo autorizado.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">4. Tokens de Acesso OAuth</h3>
              <p>Os tokens de acesso das contas TikTok e Instagram são armazenados de forma segura e utilizados exclusivamente para publicação de conteúdo em nome dos titulares autorizados. O acesso pode ser revogado a qualquer momento diretamente nas configurações de cada plataforma.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">5. Segurança</h3>
              <p>Adotamos medidas técnicas adequadas para proteger os dados contra acesso não autorizado, incluindo autenticação segura, conexões HTTPS e armazenamento criptografado de credenciais.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">6. Retenção de Dados</h3>
              <p>Os dados são mantidos enquanto a conta do colaborador estiver ativa. Após o encerramento, os dados são removidos em até 30 dias, exceto quando exigida retenção por obrigação legal.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">7. Direitos dos Usuários (LGPD)</h3>
              <p>Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), os usuários têm direito a acessar, corrigir e solicitar a exclusão de seus dados pessoais. Solicitações podem ser feitas pelo e-mail: <a href="mailto:feminnita@gmail.com" className="text-pink-600 underline">feminnita@gmail.com</a></p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">8. Cookies</h3>
              <p>A plataforma utiliza cookies de sessão exclusivamente para manter o usuário autenticado. Não são utilizados cookies de rastreamento ou publicidade de terceiros.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">9. Contato — Encarregado de Dados (DPO)</h3>
              <p>Para exercer seus direitos ou esclarecer dúvidas sobre privacidade: <a href="mailto:feminnita@gmail.com" className="text-pink-600 underline">feminnita@gmail.com</a></p>
            </div>
          </div>
        </section>

        <div className="mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Feminnita Pijamas LTDA — Todos os direitos reservados
        </div>
      </div>
    </div>
  );
}
