export default function TermosServico() {
  return (
    <div className="container py-12 max-w-4xl">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">Termos de Serviço</h1>

        <p className="text-muted-foreground mb-6">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Aceitação dos Termos</h2>
          <p>
            Ao acessar e usar a plataforma Feminnita, você concorda em estar vinculado por estes Termos de Serviço.
            Se você não concorda com qualquer parte destes termos, você não pode usar o serviço.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Descrição do Serviço</h2>
          <p>
            A Feminnita fornece uma plataforma de gerenciamento de marketing digital para empresas de pijamas em atacado.
            Nossos serviços incluem:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Gerenciamento de contas de influenciadores</li>
            <li>Agendamento de postagens em redes sociais</li>
            <li>Integração com APIs de redes sociais (Instagram, Facebook, TikTok)</li>
            <li>Rastreamento de envios via Melhor Envio</li>
            <li>Automação de mensagens WhatsApp</li>
            <li>Integração com sistemas de ERP (Bling)</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Uso Aceitável</h2>
          <p>Você concorda em usar a plataforma apenas para fins legítimos e não:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Violar qualquer lei ou regulamento aplicável</li>
            <li>Infringir direitos de propriedade intelectual de terceiros</li>
            <li>Enviar conteúdo abusivo, difamatório ou ilegal</li>
            <li>Tentar acessar áreas restritas da plataforma</li>
            <li>Usar a plataforma para spam ou phishing</li>
            <li>Interferir com o funcionamento da plataforma</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Contas de Usuário</h2>
          <p>
            Você é responsável por manter a confidencialidade de suas credenciais de login e por todas as atividades
            que ocorrem em sua conta. Você concorda em notificar-nos imediatamente sobre qualquer uso não autorizado.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Integração com Redes Sociais</h2>
          <p>
            Ao conectar suas contas de redes sociais à plataforma Feminnita, você autoriza-nos a:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Acessar suas informações de perfil</li>
            <li>Publicar conteúdo em seu nome</li>
            <li>Recuperar dados de desempenho e análises</li>
            <li>Gerenciar suas campanhas publicitárias</li>
          </ul>
          <p className="mt-4">
            Você mantém total controle sobre suas contas e pode revogar o acesso a qualquer momento.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Privacidade e Dados</h2>
          <p>
            Consulte nossa Política de Privacidade para entender como coletamos, usamos e protegemos seus dados.
            Você concorda que podemos coletar e processar dados conforme descrito nessa política.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Limitação de Responsabilidade</h2>
          <p>
            A Feminnita fornece a plataforma "como está" sem garantias de qualquer tipo. Não somos responsáveis por:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Perda de dados ou interrupção de serviço</li>
            <li>Danos indiretos ou consequentes</li>
            <li>Falhas de terceiros (APIs de redes sociais, etc.)</li>
            <li>Conteúdo publicado por você ou seus usuários</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Modificações do Serviço</h2>
          <p>
            Reservamos o direito de modificar ou descontinuar a plataforma a qualquer momento, com ou sem aviso prévio.
            Não seremos responsáveis por qualquer modificação ou descontinuação.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Rescisão</h2>
          <p>
            Podemos rescindir ou suspender sua conta imediatamente, sem aviso prévio, se você violar estes Termos de Serviço
            ou qualquer lei aplicável.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Lei Aplicável</h2>
          <p>
            Estes Termos de Serviço são regidos pelas leis do Brasil. Qualquer disputa será resolvida nos tribunais
            competentes do Brasil.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Contato</h2>
          <p>
            Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco em:
          </p>
          <p className="mt-4">
            <strong>Email:</strong> contato@feminnita.com.br<br />
            <strong>Site:</strong> www.feminnita.com.br
          </p>
        </section>
      </div>
    </div>
  );
}
