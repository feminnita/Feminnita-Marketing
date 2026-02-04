export default function Privacidade() {
  return (
    <div className="container py-12 max-w-4xl">
      <div className="prose prose-sm dark:prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-8">Política de Privacidade</h1>

        <p className="text-muted-foreground mb-6">
          Última atualização: {new Date().toLocaleDateString("pt-BR")}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">1. Introdução</h2>
          <p>
            A Feminnita ("nós", "nosso" ou "empresa") está comprometida em proteger sua privacidade.
            Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">2. Informações que Coletamos</h2>
          <p>Coletamos informações que você nos fornece diretamente, incluindo:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Nome, email e informações de contato</li>
            <li>Informações de conta de redes sociais (quando você conecta)</li>
            <li>Tokens de API e credenciais de autenticação</li>
            <li>Conteúdo que você cria ou publica</li>
            <li>Informações de pagamento (processadas de forma segura)</li>
            <li>Dados de uso e comportamento na plataforma</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">3. Como Usamos Suas Informações</h2>
          <p>Usamos as informações coletadas para:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Fornecer e melhorar nossos serviços</li>
            <li>Autenticar sua conta e gerenciar seu acesso</li>
            <li>Comunicar-nos com você sobre atualizações e suporte</li>
            <li>Analisar o uso da plataforma e tendências</li>
            <li>Cumprir obrigações legais</li>
            <li>Prevenir fraude e abuso</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">4. Armazenamento de Tokens e Credenciais</h2>
          <p>
            Quando você conecta suas contas de redes sociais ou serviços de terceiros à Feminnita:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Seus tokens de acesso são armazenados de forma criptografada em nossos servidores</li>
            <li>Usamos esses tokens apenas para executar as ações que você autoriza</li>
            <li>Nunca compartilhamos seus tokens com terceiros</li>
            <li>Você pode revogar o acesso a qualquer momento</li>
            <li>Implementamos medidas de segurança de nível empresarial</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">5. Compartilhamento de Dados</h2>
          <p>
            Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, exceto:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Quando necessário para fornecer nossos serviços (ex: APIs de redes sociais)</li>
            <li>Para cumprir com a lei ou autoridades competentes</li>
            <li>Para proteger nossos direitos e segurança</li>
            <li>Com seu consentimento explícito</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">6. Segurança de Dados</h2>
          <p>
            Implementamos medidas de segurança técnicas, administrativas e físicas para proteger suas informações:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Criptografia SSL/TLS para transmissão de dados</li>
            <li>Criptografia de dados em repouso</li>
            <li>Autenticação de dois fatores (quando disponível)</li>
            <li>Monitoramento regular de segurança</li>
            <li>Acesso restrito a dados sensíveis</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">7. Retenção de Dados</h2>
          <p>
            Mantemos suas informações pelo tempo necessário para fornecer nossos serviços e cumprir obrigações legais.
            Você pode solicitar a exclusão de seus dados a qualquer momento, sujeito a obrigações legais de retenção.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">8. Seus Direitos</h2>
          <p>Você tem direito a:</p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Acessar suas informações pessoais</li>
            <li>Corrigir informações imprecisas</li>
            <li>Solicitar a exclusão de seus dados</li>
            <li>Optar por não receber comunicações de marketing</li>
            <li>Exportar seus dados em formato legível</li>
          </ul>
          <p className="mt-4">
            Para exercer esses direitos, entre em contato conosco em contato@feminnita.com.br
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">9. Cookies e Rastreamento</h2>
          <p>
            Usamos cookies e tecnologias similares para melhorar sua experiência. Você pode controlar as preferências
            de cookies em seu navegador. Alguns cookies são essenciais para o funcionamento da plataforma.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">10. Integração com Serviços de Terceiros</h2>
          <p>
            Nossa plataforma integra-se com serviços de terceiros como:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-2">
            <li>Instagram, Facebook, TikTok (Meta)</li>
            <li>Bling ERP</li>
            <li>Melhor Envio</li>
            <li>Evolution API (WhatsApp Web)</li>
          </ul>
          <p className="mt-4">
            Essas integrações estão sujeitas às políticas de privacidade desses serviços. Recomendamos revisar suas políticas.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">11. Mudanças nesta Política</h2>
          <p>
            Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas
            por email ou através de um aviso na plataforma.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">12. Contato</h2>
          <p>
            Se você tiver dúvidas sobre esta Política de Privacidade ou nossas práticas de privacidade, entre em contato:
          </p>
          <p className="mt-4">
            <strong>Email:</strong> contato@feminnita.com.br<br />
            <strong>Site:</strong> www.feminnita.com.br<br />
            <strong>Endereço:</strong> Feminnita, Brasil
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">13. Conformidade com LGPD</h2>
          <p>
            A Feminnita está em conformidade com a Lei Geral de Proteção de Dados (LGPD) do Brasil.
            Você tem direitos específicos sob a LGPD, incluindo o direito de acessar, corrigir e deletar seus dados pessoais.
          </p>
        </section>
      </div>
    </div>
  );
}
