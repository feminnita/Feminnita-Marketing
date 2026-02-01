import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import PersonasSection from "@/components/PersonasSection";
import PlanejamentoSection from "@/components/PlanejamentoSection";
import RoteiroSection from "@/components/RoteiroSection";
import TendenciasSection from "@/components/TendenciasSection";
import NovoRoteiroStoriesSection from "@/components/NovoRoteiroStoriesSection";
import RoteiroTikTokSection from "@/components/RoteiroTikTokSection";
import IdeiasImagensInstagramSection from "@/components/IdeiasImagensInstagramSection";
import LegendaPostsSection from "@/components/LegendaPostsSection";
import RoteiroanunciaTikTokSection from "@/components/RoteiroanunciaTikTokSection";
import RoteiroAnuncioFamiliarSection from "@/components/RoteiroAnuncioFamiliarSection";
import RoteiroInstagramReelsSection from "@/components/RoteiroInstagramReelsSection";
import TresRoteirosTikTokInvernoSection from "@/components/TresRoteirosTikTokInvernoSection";
import PlanoStoriesSemanSection from "@/components/PlanoStoriesSemanSection";
import Stories42Section from "@/components/Stories42Section";
import AnaliseAdsSection from "@/components/AnaliseAdsSection";
import DashboardMonitoramentoSection from "@/components/DashboardMonitoramentoSection";
import GeradorRelatorioSection from "@/components/GeradorRelatorioSection";
import CalculadoraOrcamentoSection from "@/components/CalculadoraOrcamentoSection";
import GoogleAnalyticsSection from "@/components/GoogleAnalyticsSection";
import ExportarCalendarioSection from "@/components/ExportarCalendarioSection";
import TemplatesReutilizaveisSection from "@/components/TemplatesReutilizaveisSection";
import IntegracaoZapierSection from "@/components/IntegracaoZapierSection";
import FeedbackRatingsSection from "@/components/FeedbackRatingsSection";
import NotificacoesPushSection from "@/components/NotificacoesPushSection";
import MetaBusinessSuiteSection from "@/components/MetaBusinessSuiteSection";
import ABTestingSection from "@/components/ABTestingSection";
import IAOtimizacaoLegendaSection from "@/components/IAOtimizacaoLegendaSection";
import GoogleAdsSection from "@/components/GoogleAdsSection";
import AgendamentoInteligenteSection from "@/components/AgendamentoInteligenteSection";
import DashboardROIConsolidadoSection from "@/components/DashboardROIConsolidadoSection";
import IntegracaoSlackEmailSection from "@/components/IntegracaoSlackEmailSection";
import PrevisaoVendasSection from "@/components/PrevisaoVendasSection";
import ComparativoConcorrentesSection from "@/components/ComparativoConcorrentesSection";
import { IntegracaoWhatsAppSection } from "@/components/IntegracaoWhatsAppSection";
import AtribuicaoVendasSection from "@/components/AtribuicaoVendasSection";
import ChatIASection from "@/components/ChatIASection";
import CalendarioConteudoSection from "@/components/CalendarioConteudoSection";
import RelatoriosAgendadosSection from "@/components/RelatoriosAgendadosSection";
import BibliotecaTemplatesSection from "@/components/BibliotecaTemplatesSection";
import IntegracaoWhatsAppAPISection from "@/components/IntegracaoWhatsAppAPISection";
import DashboardPerformanceRealtimeSection from "@/components/DashboardPerformanceRealtimeSection";
import SistemaCuponsPromocoesSection from "@/components/SistemaCuponsPromocoesSection";
import GeracaoVideosIASection from "@/components/GeracaoVideosIASection";
import AutomacaoWhatsAppVIPSection from "@/components/AutomacaoWhatsAppVIPSection";
import IntegracaoStripeSection from "@/components/IntegracaoStripeSection";
import AnaliseConorrentesAutomaticoSection from "@/components/AnaliseConorrentesAutomaticoSection";
import GeradorConteudoIASection from "@/components/GeradorConteudoIASection";
import IntegracaoCapCutSection from "@/components/IntegracaoCapCutSection";
import BibliotecaAudiosSection from "@/components/BibliotecaAudiosSection";
import AgendadorPublicacaoSection from "@/components/AgendadorPublicacaoSection";
import IntegracaoGoogleDriveSection from "@/components/IntegracaoGoogleDriveSection";
import FeedbackClientesSection from "@/components/FeedbackClientesSection";
import RelatorioSemanalSection from "@/components/RelatorioSemanalSection";
import IntegracaoCRMSection from "@/components/IntegracaoCRMSection";
import SistemaRecomendacaoProdutosSection from "@/components/SistemaRecomendacaoProdutosSection";
import AnalyticsAvancadoFunilSection from "@/components/AnalyticsAvancadoFunilSection";
import NotificacoesRealtimeSection from "@/components/NotificacoesRealtimeSection";
import ExportacaoRelatoriosSection from "@/components/ExportacaoRelatoriosSection";
import IntegracaoHotjarClaritySection from "@/components/IntegracaoHotjarClaritySection";
import SistemaLoyaltyPontosSection from "@/components/SistemaLoyaltyPontosSection";
import ChatbotSuportePushSection from "@/components/ChatbotSuportePushSection";
import GaleriaLooksPersonasSection from "@/components/GaleriaLooksPersonasSection";
import ComparadorPersonasSection from "@/components/ComparadorPersonasSection";
import IntegracaoPinterestCanvaSection from "@/components/IntegracaoPinterestCanvaSection";
import PerformancePersonaSection from "@/components/PerformancePersonaSection";
import AssistenteSelecaoPersonaSection from "@/components/AssistenteSelecaoPersonaSection";
import DashboardTendenciasViraisSection from "@/components/DashboardTendenciasViraisSection";
import SistemaNotificacoesInteligentesSection from "@/components/SistemaNotificacoesInteligentesSection";
import ExportadorRelatoriosPersonaSection from "@/components/ExportadorRelatoriosPersonaSection";
import EstrategiaGrowthViralSection from "@/components/EstrategiaGrowthViralSection";
import CalendarioConteudoOtimizadoSection from "@/components/CalendarioConteudoOtimizadoSection";
import AnaliseConcorrentesSection from "@/components/AnaliseConcorrentesSection";
import IntegracaoAPIsSection from "@/components/IntegracaoAPIsSection";
import DashboardUnificadoSection from "@/components/DashboardUnificadoSection";
import SistemaAutomacaoPostsSection from "@/components/SistemaAutomacaoPostsSection";
import IntegracaoAdsSection from "@/components/IntegracaoAdsSection";
import SistemaRecomendacaoConteudoSection from "@/components/SistemaRecomendacaoConteudoSection";
import ModuloInfluenciadorasSection from "@/components/ModuloInfluenciadorasSection";
import SistemaRelatoriosMensaisSection from "@/components/SistemaRelatoriosMensaisSection";
import ModuloTesteABAvancadoSection from "@/components/ModuloTesteABAvancadoSection";
import SistemaNotificacoesTempoRealSection from "@/components/SistemaNotificacoesTempoRealSection";
import IntegracaoGoogleAnalytics4Section from "@/components/IntegracaoGoogleAnalytics4Section";
import DashboardMobileResponsivoSection from "@/components/DashboardMobileResponsivoSection";
import ExportacaoDadosSection from "@/components/ExportacaoDadosSection";
import IntegracaoCalendarioGoogleSection from "@/components/IntegracaoCalendarioGoogleSection";
import SistemaLembretesAutomaticosSection from "@/components/SistemaLembretesAutomaticosSection";
import SuporteMultiplosCalendariosSection from "@/components/SuporteMultiplosCalendariosSection";
import DashboardROIPersonaSection from "@/components/DashboardROIPersonaSection";
import FerramentaClonagemCampanhasSection from "@/components/FerramentaClonagemCampanhasSection";
import { PainelVendasTempoRealSection } from "@/components/PainelVendasTempoRealSection";
import { SistemaFeedbackClientesSection } from "@/components/SistemaFeedbackClientesSection";
import { IntegracaoTawkIntercomSection } from "@/components/IntegracaoTawkIntercomSection";
import { RelatorioCohortAnalysisSection } from "@/components/RelatorioCohortAnalysisSection";
import { PrevisaoChurnIASection } from "@/components/PrevisaoChurnIASection";
import { DashboardLTVPersonaSection } from "@/components/DashboardLTVPersonaSection";
import { ProgramaReferenciaAutomaticoSection } from "@/components/ProgramaReferenciaAutomaticoSection";
import { IntegracaoEmailMarketingSection } from "@/components/IntegracaoEmailMarketingSection";
import { PrevisaoDemandaIASection } from "@/components/PrevisaoDemandaIASection";
import { DashboardExecutivoConsolidadoSection } from "@/components/DashboardExecutivoConsolidadoSection";
import { AlertasAutomaticosSection } from "@/components/AlertasAutomaticosSection";
import { IntegracaoTikTokAdsSection } from "@/components/IntegracaoTikTokAdsSection";
import { RecomendadorProdutosIASection } from "@/components/RecomendadorProdutosIASection";
import { ExportacaoGoogleSheetsSection } from "@/components/ExportacaoGoogleSheetsSection";
import { IntegracaoInstagramAdsSection } from "@/components/IntegracaoInstagramAdsSection";
import { IntegracaoFacebookAdsSection } from "@/components/IntegracaoFacebookAdsSection";
import { SegmentacaoClientesSection } from "@/components/SegmentacaoClientesSection";
import { ComparadorEstrategiasABTestingSection } from "@/components/ComparadorEstrategiasABTestingSection";
import { ComparativoMetaGoogleAdsSection } from "@/components/ComparativoMetaGoogleAdsSection";
import { AutomacaoSegmentacaoClientesSection } from "@/components/AutomacaoSegmentacaoClientesSection";
import { RelatorioROISegmentoSection } from "@/components/RelatorioROISegmentoSection";
import { EmailMarketingSection } from "@/components/EmailMarketingSection";
import { CRMClientesSection } from "@/components/CRMClientesSection";
import { AtribuicaoMulticanalSection } from "@/components/AtribuicaoMulticanalSection";
import { ManualSection } from "@/components/ManualSection";
import { AutomacaoBlingSection } from "@/components/AutomacaoBlingSection";
import { RelatorioInfluenciadoresSection } from "@/components/RelatorioInfluenciadoresSection";
import { PrevisaoChurnSection } from "@/components/PrevisaoChurnSection";
import { IntegracaoTraySection } from "@/components/IntegracaoTraySection";
import { RentabilidadeProdutoSection } from "@/components/RentabilidadeProdutoSection";
import { PrevisaoDemandaSection } from "@/components/PrevisaoDemandaSection";
import { AutomacaoEmailInteligenteSection } from "@/components/AutomacaoEmailInteligenteSection";
import { LifetimeValueDetalhadoSection } from "@/components/LifetimeValueDetalhadoSection";
import { AnalisesCompetitivaSection } from "@/components/AnalisesCompetitivaSection";
import { GoogleAnalytics4Section } from "@/components/GoogleAnalytics4Section";
import { SistemaRecomendacaoInteligenteSection } from "@/components/SistemaRecomendacaoInteligenteSection";
import { OtimizacaoFunilSection } from "@/components/OtimizacaoFunilSection";
import { AnaliseSentimentoRedesSociaisSection } from "@/components/AnaliseSentimentoRedesSociaisSection";
import { RecomendacaoOrcamentoCanalSection } from "@/components/RecomendacaoOrcamentoCanalSection";
import { IntegracaoCanvaSection } from "@/components/IntegracaoCanvaSection";
import { PrevisaoDemandaMachineLearningSection } from "@/components/PrevisaoDemandaMachineLearningSection";
import { AutomacaoRespostasRedesSociaisSection } from "@/components/AutomacaoRespostasRedesSociaisSection";
import { AnaliseConcorrenciaTempoRealSection } from "@/components/AnaliseConcorrenciaTempoRealSection";
import RentabilidadeDetalhadaSection from "@/components/RentabilidadeDetalhadaSection";
import AutomacaoRelatoriosAgendadosSection from "@/components/AutomacaoRelatoriosAgendadosSection";
import IntegracaoAfiliados from "@/components/IntegracaoAfiliados";
import MetricasPerformanceRealtimeSection from "@/components/MetricasPerformanceRealtimeSection";
import NotificacoesInteligenteSection from "@/components/NotificacoesInteligenteSection";
import ExportarRelatorioSection from "@/components/ExportarRelatorioSection";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, Video, TrendingUp, Target, Zap } from "lucide-react";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("personas");

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero Section */}
      <section className="container py-12">
        <div className="bg-white rounded-2xl border border-amber-200 p-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Sua Estratégia de Marketing Digital Personalizada
            </h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              Descubra como captar clientes potenciais através de 4 personas de influenciadoras humanizadas, planejamento semanal de conteúdo, roteiros de vídeos para stories e ads, além de análise de tendências virais do TikTok que já venderam milhares de peças.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <Users className="w-5 h-5 mb-2" style={{color: '#A63D4A'}} />
                <p className="text-sm font-semibold text-slate-900">4 Personas</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <Calendar className="w-5 h-5 mb-2" style={{color: '#A63D4A'}} />
                <p className="text-sm font-semibold text-slate-900">Planejamento Semanal</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <Video className="w-5 h-5 mb-2" style={{color: '#A63D4A'}} />
                <p className="text-sm font-semibold text-slate-900">Roteiros de Vídeos</p>
              </div>
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                <TrendingUp className="w-5 h-5 mb-2" style={{color: '#A63D4A'}} />
                <p className="text-sm font-semibold text-slate-900">Tendências TikTok</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-12">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="flex w-full mb-8 bg-slate-100 p-2 overflow-x-auto gap-2 flex-nowrap scroll-smooth">
            <TabsTrigger value="personas" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Personas</span>
            </TabsTrigger>
            <TabsTrigger value="planejamento" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Planejamento</span>
            </TabsTrigger>
            <TabsTrigger value="roteiros" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Roteiros</span>
            </TabsTrigger>
            <TabsTrigger value="tendencias" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Tendências</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="automacao" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Automação</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personas" className="space-y-6">
            <PersonasSection />
          </TabsContent>
          <TabsContent value="planejamento" className="space-y-6">
            <PlanejamentoSection />
          </TabsContent>
          <TabsContent value="roteiros" className="space-y-6">
            <RoteiroSection />
          </TabsContent>
          <TabsContent value="tendencias" className="space-y-6">
            <TendenciasSection />
          </TabsContent>
          <TabsContent value="dashboard" className="space-y-6">
            <DashboardMonitoramentoSection />
          </TabsContent>
          <TabsContent value="automacao" className="space-y-6">
            <SistemaAutomacaoPostsSection />
          </TabsContent>
        </Tabs>
      </section>

      {/* Key Insights Section */}
      <section className="container py-12">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">Principais Insights</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-rose-600" />
                Público-Alvo Segmentado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                4 personas distintas cobrem todos os segmentos: empreendedoras iniciantes, lojistas experientes, líderes de grupos de compra e trendsetters.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-rose-600" />
                Conteúdo Otimizado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Planejamento semanal com mix de promoções, lançamentos, abastecimento de estoque e engajamento para manter a audiência ativa.
              </p>
            </CardContent>
          </Card>

          <Card className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-rose-600" />
                Formatos Virais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600">
                Roteiros baseados em vídeos que já venderam milhares de peças no TikTok: provadores rápidos, transições dinâmicas e ganchos irresistíveis.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50 mt-16">
        <div className="container py-8">
          <p className="text-center text-sm text-slate-600">
            Estratégia de Marketing Digital para Feminnita • Desenvolvida com foco em crescimento e conversão
          </p>
        </div>
      </footer>
    </div>
  );
}
