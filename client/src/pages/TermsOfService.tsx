import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function TermsOfService() {
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
                <p className="text-sm text-slate-600">Termos de Serviço</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-12">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-3xl">Termos de Serviço</CardTitle>
            <CardDescription>
              Última atualização: {new Date().toLocaleDateString("pt-BR")}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 text-slate-700 leading-relaxed">
            {/* Introduction */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">1. Aceitação dos Termos</h2>
              <p>
                Bem-vindo à Feminnita Marketing. Estes Termos de Serviço ("Termos") constituem um acordo legal vinculativo entre você ("Usuário", "você" ou "seu") e a Feminnita Marketing ("Empresa", "nós", "nosso" ou "nos"). Ao acessar ou usar nosso Serviço, você concorda em estar vinculado por estes Termos.
              </p>
              <p className="mt-4">
                Se você não concorda com qualquer parte destes Termos, você não pode usar nosso Serviço. Sua utilização contínua do Serviço após a publicação de alterações aos Termos constitui sua aceitação dessas alterações.
              </p>
            </section>

            {/* Service Description */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">2. Descrição do Serviço</h2>
              <p>
                A Feminnita Marketing fornece uma plataforma de estratégia de marketing digital que inclui ferramentas para gerenciar campanhas de publicidade, analisar tendências, criar conteúdo e gerenciar influenciadoras. O Serviço é fornecido "como está" e "conforme disponível".
              </p>
            </section>

            {/* User Responsibilities */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">3. Responsabilidades do Usuário</h2>
              <p className="mb-4">Você concorda em:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Usar o Serviço apenas para fins legais e de acordo com estes Termos</li>
                <li>Não usar o Serviço de forma que viole qualquer lei ou regulamento aplicável</li>
                <li>Não enviar conteúdo que seja ilegal, ofensivo, difamatório ou que viole direitos de terceiros</li>
                <li>Não tentar ganhar acesso não autorizado ao Serviço ou sistemas relacionados</li>
                <li>Manter a confidencialidade de suas credenciais de login</li>
                <li>Notificar-nos imediatamente sobre qualquer uso não autorizado de sua conta</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">4. Propriedade Intelectual</h2>
              <p className="mb-4">
                O Serviço e todo o seu conteúdo, incluindo, mas não limitado a, texto, gráficos, logos, imagens e software, são propriedade da Feminnita Marketing ou de seus fornecedores de conteúdo e são protegidos por leis internacionais de direitos autorais.
              </p>
              <p>
                Você concede à Feminnita Marketing uma licença limitada, não exclusiva e não transferível para usar o conteúdo que você envia através do Serviço para fins de operação e melhoria do Serviço.
              </p>
            </section>

            {/* Limitation of Liability */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">5. Limitação de Responsabilidade</h2>
              <p className="mb-4">
                NA MÁXIMA EXTENSÃO PERMITIDA PELA LEI, A FEMINNITA MARKETING NÃO SERÁ RESPONSÁVEL POR QUALQUER DANO INDIRETO, INCIDENTAL, ESPECIAL, CONSEQUENTE OU PUNITIVO, INCLUINDO PERDA DE LUCROS, DADOS OU USO, MESMO QUE TENHA SIDO AVISADA DA POSSIBILIDADE DE TAIS DANOS.
              </p>
              <p>
                NOSSA RESPONSABILIDADE TOTAL POR QUALQUER RECLAMAÇÃO RELACIONADA AO SERVIÇO NÃO EXCEDERÁ O VALOR QUE VOCÊ PAGOU PELO SERVIÇO NOS ÚLTIMOS 12 MESES.
              </p>
            </section>

            {/* Disclaimer */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">6. Isenção de Garantias</h2>
              <p>
                O SERVIÇO É FORNECIDO "COMO ESTÁ" E "CONFORME DISPONÍVEL" SEM GARANTIAS DE QUALQUER TIPO, EXPRESSAS OU IMPLÍCITAS. A FEMINNITA MARKETING NÃO GARANTE QUE O SERVIÇO SERÁ ININTERRUPTO, SEGURO OU LIVRE DE ERROS. A FEMINNITA MARKETING ISENTA-SE DE TODAS AS GARANTIAS, EXPRESSAS OU IMPLÍCITAS, INCLUINDO, MAS NÃO LIMITADO A, GARANTIAS IMPLÍCITAS DE COMERCIALIZAÇÃO, ADEQUAÇÃO A UM PROPÓSITO ESPECÍFICO E NÃO VIOLAÇÃO.
              </p>
            </section>

            {/* Third Party Services */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">7. Serviços de Terceiros</h2>
              <p className="mb-4">
                O Serviço pode conter links para serviços de terceiros, incluindo Meta Ads, Google Analytics e outras plataformas. Não somos responsáveis pela disponibilidade, precisão ou conteúdo desses serviços de terceiros.
              </p>
              <p>
                Seu uso de serviços de terceiros está sujeito aos seus respectivos termos de serviço e políticas de privacidade. Recomendamos que você revise esses termos antes de usar qualquer serviço de terceiros através do nosso Serviço.
              </p>
            </section>

            {/* Termination */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">8. Rescisão</h2>
              <p className="mb-4">
                Podemos rescindir ou suspender sua conta e acesso ao Serviço imediatamente, sem aviso prévio ou responsabilidade, se você violar qualquer disposição destes Termos ou qualquer lei ou regulamento aplicável.
              </p>
              <p>
                Você pode rescindir sua conta a qualquer momento entrando em contato conosco. Após a rescisão, você perderá o acesso ao Serviço, mas as disposições destes Termos que por sua natureza devem permanecer em vigor permanecerão em vigor.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">9. Lei Aplicável</h2>
              <p>
                Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, sem considerar seus conflitos de disposições legais. Você concorda em se submeter à jurisdição exclusiva dos tribunais localizados no Brasil.
              </p>
            </section>

            {/* Contact Us */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">10. Entre em Contato Conosco</h2>
              <p>
                Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco em:
              </p>
              <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <p><strong>Email:</strong> feminnita@gmail.com</p>
                <p><strong>Empresa:</strong> Feminnita Marketing</p>
                <p><strong>Assunto:</strong> Termos de Serviço</p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section>
              <h2 className="text-2xl font-bold mb-4 text-slate-900">11. Alterações nos Termos</h2>
              <p>
                Podemos atualizar estes Termos de tempos em tempos. Notificaremos você sobre qualquer alteração publicando os novos Termos nesta página e atualizando a data de "Última atualização" no topo desta página. Sua utilização contínua do Serviço após essas alterações constitui sua aceitação dos novos Termos.
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
