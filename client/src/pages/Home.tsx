import { useState, lazy, Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Video, TrendingUp, MessageCircle, Target, Zap, Play, Film, Activity, FileText, Calculator, Save, Star, Bell, Instagram, BarChart3, Sparkles, Clock, DollarSign, Ticket, Edit, Music, Cloud, MessageSquare, Database, Download, ShoppingCart, Lightbulb, Palette, Brain, Smartphone, CreditCard, Copy, TrendingDown, Share2, Mail, BookOpen, AlertTriangle, Heart } from "lucide-react";
import BarraBuscaAbas from "@/components/BarraBuscaAbas";
import MenuFavoritosAbas from "@/components/MenuFavoritosAbas";
import SidebarNavegacao from '@/components/SidebarNavegacao';

const PersonasSection = lazy(() => import("@/components/PersonasSection"));
const PlanejamentoSection = lazy(() => import("@/components/PlanejamentoSection"));
const RoteiroSection = lazy(() => import("@/components/RoteiroSection"));
const TendenciasSection = lazy(() => import("@/components/TendenciasSection"));
const NovoRoteiroStoriesSection = lazy(() => import("@/components/NovoRoteiroStoriesSection"));
const RoteiroTikTokSection = lazy(() => import("@/components/RoteiroTikTokSection"));
const IdeiasImagensInstagramSection = lazy(() => import("@/components/IdeiasImagensInstagramSection"));
const LegendaPostsSection = lazy(() => import("@/components/LegendaPostsSection"));
const RoteiroanunciaTikTokSection = lazy(() => import("@/components/RoteiroanunciaTikTokSection"));
const RoteiroAnuncioFamiliarSection = lazy(() => import("@/components/RoteiroAnuncioFamiliarSection"));
const RoteiroInstagramReelsSection = lazy(() => import("@/components/RoteiroInstagramReelsSection"));
const TresRoteirosTikTokInvernoSection = lazy(() => import("@/components/TresRoteirosTikTokInvernoSection"));
const PlanoStoriesSemanSection = lazy(() => import("@/components/PlanoStoriesSemanSection"));
const Stories42Section = lazy(() => import("@/components/Stories42Section"));
const AnaliseAdsSection = lazy(() => import("@/components/AnaliseAdsSection"));
const DashboardMonitoramentoSection = lazy(() => import("@/components/DashboardMonitoramentoSection"));
const GeradorRelatorioSection = lazy(() => import("@/components/GeradorRelatorioSection"));
const CalculadoraOrcamentoSection = lazy(() => import("@/components/CalculadoraOrcamentoSection"));
const GoogleAnalyticsSection = lazy(() => import("@/components/GoogleAnalyticsSection"));
const ExportarCalendarioSection = lazy(() => import("@/components/ExportarCalendarioSection"));
const TemplatesReutilizaveisSection = lazy(() => import("@/components/TemplatesReutilizaveisSection"));
const IntegracaoZapierSection = lazy(() => import("@/components/IntegracaoZapierSection"));
const FeedbackRatingsSection = lazy(() => import("@/components/FeedbackRatingsSection"));
const NotificacoesPushSection = lazy(() => import("@/components/NotificacoesPushSection"));
const MetaBusinessSuiteSection = lazy(() => import("@/components/MetaBusinessSuiteSection"));
const ABTestingSection = lazy(() => import("@/components/ABTestingSection"));
const IAOtimizacaoLegendaSection = lazy(() => import("@/components/IAOtimizacaoLegendaSection"));
const GoogleAdsSection = lazy(() => import("@/components/GoogleAdsSection"));
const AgendamentoInteligenteSection = lazy(() => import("@/components/AgendamentoInteligenteSection"));
const DashboardROIConsolidadoSection = lazy(() => import("@/components/DashboardROIConsolidadoSection"));
const IntegracaoSlackEmailSection = lazy(() => import("@/components/IntegracaoSlackEmailSection"));
const PrevisaoVendasSection = lazy(() => import("@/components/PrevisaoVendasSection"));
const ComparativoConcorrentesSection = lazy(() => import("@/components/ComparativoConcorrentesSection"));
const IntegracaoWhatsAppSection = lazy(() => import("@/components/IntegracaoWhatsAppSection").then(m => ({ default: m.IntegracaoWhatsAppSection })));
const AtribuicaoVendasSection = lazy(() => import("@/components/AtribuicaoVendasSection"));
const ChatIASection = lazy(() => import("@/components/ChatIASection"));
const CalendarioConteudoSection = lazy(() => import("@/components/CalendarioConteudoSection"));
const RelatoriosAgendadosSection = lazy(() => import("@/components/RelatoriosAgendadosSection"));
const BibliotecaTemplatesSection = lazy(() => import("@/components/BibliotecaTemplatesSection"));
const IntegracaoWhatsAppAPISection = lazy(() => import("@/components/IntegracaoWhatsAppAPISection"));
const DashboardPerformanceRealtimeSection = lazy(() => import("@/components/DashboardPerformanceRealtimeSection"));
const SistemaCuponsPromocoesSection = lazy(() => import("@/components/SistemaCuponsPromocoesSection"));
const GeracaoVideosIASection = lazy(() => import("@/components/GeracaoVideosIASection"));
const IntegracaoStripeSection = lazy(() => import("@/components/IntegracaoStripeSection"));
const AnaliseConorrentesAutomaticoSection = lazy(() => import("@/components/AnaliseConorrentesAutomaticoSection"));
const GeradorConteudoIASection = lazy(() => import("@/components/GeradorConteudoIASection"));
const IntegracaoCapCutSection = lazy(() => import("@/components/IntegracaoCapCutSection"));
const BibliotecaAudiosSection = lazy(() => import("@/components/BibliotecaAudiosSection"));
const AgendadorPublicacaoSection = lazy(() => import("@/components/AgendadorPublicacaoSection"));
const IntegracaoGoogleDriveSection = lazy(() => import("@/components/IntegracaoGoogleDriveSection"));
const FeedbackClientesSection = lazy(() => import("@/components/FeedbackClientesSection"));
const RelatorioSemanalSection = lazy(() => import("@/components/RelatorioSemanalSection"));
const IntegracaoCRMSection = lazy(() => import("@/components/IntegracaoCRMSection"));
const SistemaRecomendacaoProdutosSection = lazy(() => import("@/components/SistemaRecomendacaoProdutosSection"));
const AnalyticsAvancadoFunilSection = lazy(() => import("@/components/AnalyticsAvancadoFunilSection"));
const NotificacoesRealtimeSection = lazy(() => import("@/components/NotificacoesRealtimeSection"));
const ExportacaoRelatoriosSection = lazy(() => import("@/components/ExportacaoRelatoriosSection"));
const IntegracaoHotjarClaritySection = lazy(() => import("@/components/IntegracaoHotjarClaritySection"));
const SistemaLoyaltyPontosSection = lazy(() => import("@/components/SistemaLoyaltyPontosSection"));
const ChatbotSuportePushSection = lazy(() => import("@/components/ChatbotSuportePushSection"));
const GaleriaLooksPersonasSection = lazy(() => import("@/components/GaleriaLooksPersonasSection"));
const ComparadorPersonasSection = lazy(() => import("@/components/ComparadorPersonasSection"));
const IntegracaoPinterestCanvaSection = lazy(() => import("@/components/IntegracaoPinterestCanvaSection"));
const PerformancePersonaSection = lazy(() => import("@/components/PerformancePersonaSection"));
const AssistenteSelecaoPersonaSection = lazy(() => import("@/components/AssistenteSelecaoPersonaSection"));
const DashboardTendenciasViraisSection = lazy(() => import("@/components/DashboardTendenciasViraisSection"));
const SistemaNotificacoesInteligentesSection = lazy(() => import("@/components/SistemaNotificacoesInteligentesSection"));
const ExportadorRelatoriosPersonaSection = lazy(() => import("@/components/ExportadorRelatoriosPersonaSection"));
const EstrategiaGrowthViralSection = lazy(() => import("@/components/EstrategiaGrowthViralSection"));
const CalendarioConteudoOtimizadoSection = lazy(() => import("@/components/CalendarioConteudoOtimizadoSection"));
const AnaliseConcorrentesSection = lazy(() => import("@/components/AnaliseConcorrentesSection"));
const IntegracaoAPIsSection = lazy(() => import("@/components/IntegracaoAPIsSection"));
const DashboardUnificadoSection = lazy(() => import("@/components/DashboardUnificadoSection"));
const SistemaAutomacaoPostsSection = lazy(() => import("@/components/SistemaAutomacaoPostsSection"));
const IntegracaoAdsSection = lazy(() => import("@/components/IntegracaoAdsSection"));
const SistemaRecomendacaoConteudoSection = lazy(() => import("@/components/SistemaRecomendacaoConteudoSection"));
const ModuloInfluenciadorasSection = lazy(() => import("@/components/ModuloInfluenciadorasSection"));
const SistemaRelatoriosMensaisSection = lazy(() => import("@/components/SistemaRelatoriosMensaisSection"));
const ModuloTesteABAvancadoSection = lazy(() => import("@/components/ModuloTesteABAvancadoSection"));
const SistemaNotificacoesTempoRealSection = lazy(() => import("@/components/SistemaNotificacoesTempoRealSection"));
const IntegracaoGoogleAnalytics4Section = lazy(() => import("@/components/IntegracaoGoogleAnalytics4Section"));
const DashboardMobileResponsivoSection = lazy(() => import("@/components/DashboardMobileResponsivoSection"));
const ExportacaoDadosSection = lazy(() => import("@/components/ExportacaoDadosSection"));
const IntegracaoCalendarioGoogleSection = lazy(() => import("@/components/IntegracaoCalendarioGoogleSection"));
const SistemaLembretesAutomaticosSection = lazy(() => import("@/components/SistemaLembretesAutomaticosSection"));
const SuporteMultiplosCalendariosSection = lazy(() => import("@/components/SuporteMultiplosCalendariosSection"));
const DashboardROIPersonaSection = lazy(() => import("@/components/DashboardROIPersonaSection"));
const FerramentaClonagemCampanhasSection = lazy(() => import("@/components/FerramentaClonagemCampanhasSection"));
const PainelVendasTempoRealSection = lazy(() => import("@/components/PainelVendasTempoRealSection").then(m => ({ default: m.PainelVendasTempoRealSection })));
const SistemaFeedbackClientesSection = lazy(() => import("@/components/SistemaFeedbackClientesSection").then(m => ({ default: m.SistemaFeedbackClientesSection })));
const IntegracaoTawkIntercomSection = lazy(() => import("@/components/IntegracaoTawkIntercomSection").then(m => ({ default: m.IntegracaoTawkIntercomSection })));
const RelatorioCohortAnalysisSection = lazy(() => import("@/components/RelatorioCohortAnalysisSection").then(m => ({ default: m.RelatorioCohortAnalysisSection })));
const PrevisaoChurnIASection = lazy(() => import("@/components/PrevisaoChurnIASection").then(m => ({ default: m.PrevisaoChurnIASection })));
const DashboardLTVPersonaSection = lazy(() => import("@/components/DashboardLTVPersonaSection").then(m => ({ default: m.DashboardLTVPersonaSection })));
const ProgramaReferenciaAutomaticoSection = lazy(() => import("@/components/ProgramaReferenciaAutomaticoSection").then(m => ({ default: m.ProgramaReferenciaAutomaticoSection })));
const IntegracaoEmailMarketingSection = lazy(() => import("@/components/IntegracaoEmailMarketingSection").then(m => ({ default: m.IntegracaoEmailMarketingSection })));
const PrevisaoDemandaIASection = lazy(() => import("@/components/PrevisaoDemandaIASection").then(m => ({ default: m.PrevisaoDemandaIASection })));
const DashboardExecutivoConsolidadoSection = lazy(() => import("@/components/DashboardExecutivoConsolidadoSection").then(m => ({ default: m.DashboardExecutivoConsolidadoSection })));
const AlertasAutomaticosSection = lazy(() => import("@/components/AlertasAutomaticosSection").then(m => ({ default: m.AlertasAutomaticosSection })));
const IntegracaoTikTokAdsSection = lazy(() => import("@/components/IntegracaoTikTokAdsSection").then(m => ({ default: m.IntegracaoTikTokAdsSection })));
const RecomendadorProdutosIASection = lazy(() => import("@/components/RecomendadorProdutosIASection").then(m => ({ default: m.RecomendadorProdutosIASection })));
const ExportacaoGoogleSheetsSection = lazy(() => import("@/components/ExportacaoGoogleSheetsSection").then(m => ({ default: m.ExportacaoGoogleSheetsSection })));
const IntegracaoInstagramAdsSection = lazy(() => import("@/components/IntegracaoInstagramAdsSection").then(m => ({ default: m.IntegracaoInstagramAdsSection })));
const IntegracaoFacebookAdsSection = lazy(() => import("@/components/IntegracaoFacebookAdsSection").then(m => ({ default: m.IntegracaoFacebookAdsSection })));
const SegmentacaoClientesSection = lazy(() => import("@/components/SegmentacaoClientesSection").then(m => ({ default: m.SegmentacaoClientesSection })));
const ComparadorEstrategiasABTestingSection = lazy(() => import("@/components/ComparadorEstrategiasABTestingSection").then(m => ({ default: m.ComparadorEstrategiasABTestingSection })));
const ComparativoMetaGoogleAdsSection = lazy(() => import("@/components/ComparativoMetaGoogleAdsSection").then(m => ({ default: m.ComparativoMetaGoogleAdsSection })));
const AutomacaoSegmentacaoClientesSection = lazy(() => import("@/components/AutomacaoSegmentacaoClientesSection").then(m => ({ default: m.AutomacaoSegmentacaoClientesSection })));
const RelatorioROISegmentoSection = lazy(() => import("@/components/RelatorioROISegmentoSection").then(m => ({ default: m.RelatorioROISegmentoSection })));
const EmailMarketingSection = lazy(() => import("@/components/EmailMarketingSection").then(m => ({ default: m.EmailMarketingSection })));
const CRMClientesSection = lazy(() => import("@/components/CRMClientesSection").then(m => ({ default: m.CRMClientesSection })));
const AtribuicaoMulticanalSection = lazy(() => import("@/components/AtribuicaoMulticanalSection").then(m => ({ default: m.AtribuicaoMulticanalSection })));
const ManualSection = lazy(() => import("@/components/ManualSection").then(m => ({ default: m.ManualSection })));
const AutomacaoBlingSection = lazy(() => import("@/components/AutomacaoBlingSection").then(m => ({ default: m.AutomacaoBlingSection })));
const RelatorioInfluenciadoresSection = lazy(() => import("@/components/RelatorioInfluenciadoresSection").then(m => ({ default: m.RelatorioInfluenciadoresSection })));
const PrevisaoChurnSection = lazy(() => import("@/components/PrevisaoChurnSection").then(m => ({ default: m.PrevisaoChurnSection })));
const IntegracaoTraySection = lazy(() => import("@/components/IntegracaoTraySection").then(m => ({ default: m.IntegracaoTraySection })));
const RentabilidadeProdutoSection = lazy(() => import("@/components/RentabilidadeProdutoSection").then(m => ({ default: m.RentabilidadeProdutoSection })));
const PrevisaoDemandaSection = lazy(() => import("@/components/PrevisaoDemandaSection").then(m => ({ default: m.PrevisaoDemandaSection })));
const AutomacaoEmailInteligenteSection = lazy(() => import("@/components/AutomacaoEmailInteligenteSection").then(m => ({ default: m.AutomacaoEmailInteligenteSection })));
const LifetimeValueDetalhadoSection = lazy(() => import("@/components/LifetimeValueDetalhadoSection").then(m => ({ default: m.LifetimeValueDetalhadoSection })));
const AnalisesCompetitivaSection = lazy(() => import("@/components/AnalisesCompetitivaSection").then(m => ({ default: m.AnalisesCompetitivaSection })));
const GoogleAnalytics4Section = lazy(() => import("@/components/GoogleAnalytics4Section").then(m => ({ default: m.GoogleAnalytics4Section })));
const SistemaRecomendacaoInteligenteSection = lazy(() => import("@/components/SistemaRecomendacaoInteligenteSection").then(m => ({ default: m.SistemaRecomendacaoInteligenteSection })));
const OtimizacaoFunilSection = lazy(() => import("@/components/OtimizacaoFunilSection").then(m => ({ default: m.OtimizacaoFunilSection })));
const AnaliseSentimentoRedesSociaisSection = lazy(() => import("@/components/AnaliseSentimentoRedesSociaisSection").then(m => ({ default: m.AnaliseSentimentoRedesSociaisSection })));
const RecomendacaoOrcamentoCanalSection = lazy(() => import("@/components/RecomendacaoOrcamentoCanalSection").then(m => ({ default: m.RecomendacaoOrcamentoCanalSection })));
const IntegracaoCanvaSection = lazy(() => import("@/components/IntegracaoCanvaSection").then(m => ({ default: m.IntegracaoCanvaSection })));
const PrevisaoDemandaMachineLearningSection = lazy(() => import("@/components/PrevisaoDemandaMachineLearningSection").then(m => ({ default: m.PrevisaoDemandaMachineLearningSection })));
const AutomacaoRespostasRedesSociaisSection = lazy(() => import("@/components/AutomacaoRespostasRedesSociaisSection").then(m => ({ default: m.AutomacaoRespostasRedesSociaisSection })));
const AnaliseConcorrenciaTempoRealSection = lazy(() => import("@/components/AnaliseConcorrenciaTempoRealSection").then(m => ({ default: m.AnaliseConcorrenciaTempoRealSection })));
const RentabilidadeDetalhadaSection = lazy(() => import("@/components/RentabilidadeDetalhadaSection"));
const AutomacaoRelatoriosAgendadosSection = lazy(() => import("@/components/AutomacaoRelatoriosAgendadosSection"));
const IntegracaoAfiliados = lazy(() => import("@/components/IntegracaoAfiliados"));
const DropsPlannerSection = lazy(() => import("@/components/DropsPlannerSection"));
const UGCCollectorSection = lazy(() => import("@/components/UGCCollectorSection"));
const RecuperacaoAbandonoSection = lazy(() => import("@/components/RecuperacaoAbandonoSection"));

const SuspenseFallback = (
  <div className="flex justify-center py-8">
    <div className="w-6 h-6 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function Home() {
  const [activeTab, setActiveTab] = useState("personas");

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Sidebar */}
      <SidebarNavegacao onSelectTab={setActiveTab} activeTab={activeTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200/50 bg-white/80 backdrop-blur-md">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                Feminnita
              </h1>
              <p className="text-sm text-slate-600 mt-1">Estratégia de Marketing Digital Completa</p>
            </div>
            <Badge variant="secondary" className="text-xs">
              Atacado de Pijamas
            </Badge>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container py-12">
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-200/50 p-8">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-3">
              Sua Estratégia de Marketing Digital Personalizada
            </h2>
            <p className="text-slate-700 leading-relaxed mb-6">
              Descubra como captar clientes potenciais através de 4 personas de influenciadoras humanizadas, planejamento semanal de conteúdo, roteiros de vídeos para stories e ads, além de análise de tendências virais do TikTok que já venderam milhares de peças.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 border border-rose-100">
                <Users className="w-5 h-5 text-rose-600 mb-2" />
                <p className="text-sm font-semibold text-slate-900">4 Personas</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-rose-100">
                <Calendar className="w-5 h-5 text-rose-600 mb-2" />
                <p className="text-sm font-semibold text-slate-900">Planejamento Semanal</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-rose-100">
                <Video className="w-5 h-5 text-rose-600 mb-2" />
                <p className="text-sm font-semibold text-slate-900">Roteiros de Vídeos</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-rose-100">
                <TrendingUp className="w-5 h-5 text-rose-600 mb-2" />
                <p className="text-sm font-semibold text-slate-900">Tendências TikTok</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container py-12">
        <div className="mb-6 space-y-4">
          <div className="flex gap-4 items-start">
            <div className="flex-1">
              <BarraBuscaAbas onSelectTab={setActiveTab} />
            </div>
            <MenuFavoritosAbas onSelectTab={setActiveTab} />
          </div>
        </div>
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
              <span className="hidden sm:inline">Tendencias</span>
            </TabsTrigger>
            <TabsTrigger value="novos-roteiros" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Novos Stories</span>
            </TabsTrigger>
            <TabsTrigger value="tiktok" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">TikTok</span>
            </TabsTrigger>
            <TabsTrigger value="imagens" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Imagens IG</span>
            </TabsTrigger>
            <TabsTrigger value="legendas" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Legendas</span>
            </TabsTrigger>
            <TabsTrigger value="anuncio" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Anúncio</span>
            </TabsTrigger>
            <TabsTrigger value="familiar" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Familiar</span>
            </TabsTrigger>
            <TabsTrigger value="reels" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Film className="w-4 h-4" />
              <span className="hidden sm:inline">Reels</span>
            </TabsTrigger>
            <TabsTrigger value="tiktok-inverno" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">TikTok 3x</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
            <TabsTrigger value="stories-42" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">42 Stories</span>
            </TabsTrigger>
            <TabsTrigger value="ads-analise" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Análise Ads</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="relatorio" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Relatório</span>
            </TabsTrigger>
            <TabsTrigger value="calculadora" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Calculadora</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="calendario" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendário</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="zapier" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Zapier</span>
            </TabsTrigger>
            <TabsTrigger value="ratings" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Ratings</span>
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notif.</span>
            </TabsTrigger>
            <TabsTrigger value="meta" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Instagram className="w-4 h-4" />
              <span className="hidden sm:inline">Meta</span>
            </TabsTrigger>
            <TabsTrigger value="abtest" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">A/B Test</span>
            </TabsTrigger>
            <TabsTrigger value="ia" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">IA</span>
            </TabsTrigger>
            <TabsTrigger value="googleads" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Google Ads</span>
            </TabsTrigger>
            <TabsTrigger value="agendamento" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="roi" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">ROI</span>
            </TabsTrigger>
            <TabsTrigger value="slack" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notif</span>
            </TabsTrigger>
            <TabsTrigger value="previsao" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Previsão</span>
            </TabsTrigger>
            <TabsTrigger value="concorrentes" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Concorr</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="atribuicao" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Vendas</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Chat IA</span>
            </TabsTrigger>
            <TabsTrigger value="calendario-conteudo" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendário</span>
            </TabsTrigger>
            <TabsTrigger value="relatorios" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="biblioteca" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Biblioteca</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp-api" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp API</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="cupons" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">Cupons</span>
            </TabsTrigger>
            <TabsTrigger value="videos-ia" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Vídeos IA</span>
            </TabsTrigger>
            <TabsTrigger value="capcut" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Edit className="w-4 h-4" />
              <span className="hidden sm:inline">CapCut</span>
            </TabsTrigger>
            <TabsTrigger value="audios" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Music className="w-4 h-4" />
              <span className="hidden sm:inline">Áudios</span>
            </TabsTrigger>
            <TabsTrigger value="agendador" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Agendador</span>
            </TabsTrigger>
            <TabsTrigger value="drive" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Cloud className="w-4 h-4" />
              <span className="hidden sm:inline">Drive</span>
            </TabsTrigger>
            <TabsTrigger value="feedback" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="relatorio" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Relatório</span>
            </TabsTrigger>
            <TabsTrigger value="crm" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Database className="w-4 h-4" />
              <span className="hidden sm:inline">CRM</span>
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notif.</span>
            </TabsTrigger>
            <TabsTrigger value="exportacao" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Stripe</span>
            </TabsTrigger>
            <TabsTrigger value="concorrentes-auto" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Concorr Auto</span>
            </TabsTrigger>
            <TabsTrigger value="gerador-ia" className="flex items-center gap-2 text-xs sm:text-m whitespace-nowrap min-w-fit">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Gerador IA</span>
            </TabsTrigger>

            <TabsTrigger value="recomendacao" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Recomend.</span>
            </TabsTrigger>
            <TabsTrigger value="funil-analytics" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Funil</span>
            </TabsTrigger>
            <TabsTrigger value="hotjar" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Hotjar</span>
            </TabsTrigger>
            <TabsTrigger value="loyalty" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Loyalty</span>
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chatbot</span>
            </TabsTrigger>
            <TabsTrigger value="galeria-looks" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Galeria Looks</span>
            </TabsTrigger>
            <TabsTrigger value="comparador" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Comparador</span>
            </TabsTrigger>
            <TabsTrigger value="pinterest-canva" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Pinterest/Canva</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Performance</span>
            </TabsTrigger>
            <TabsTrigger value="quiz-persona" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Lightbulb className="w-4 h-4" />
              <span className="hidden sm:inline">Quiz Persona</span>
            </TabsTrigger>
            <TabsTrigger value="tendencias-virais" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Trends Virais</span>
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="exportar-relatorios" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="growth-viral" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Growth Viral</span>
            </TabsTrigger>
            <TabsTrigger value="calendario-conteudo" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendário</span>
            </TabsTrigger>
            <TabsTrigger value="concorrentes" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Concorrentes</span>
            </TabsTrigger>
            <TabsTrigger value="apis-integracao" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Cloud className="w-4 h-4" />
              <span className="hidden sm:inline">APIs</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard-unificado" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="automacao-posts" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Automação</span>
            </TabsTrigger>
            <TabsTrigger value="ads-integracao" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Ads</span>
            </TabsTrigger>
            <TabsTrigger value="recomendacao-ia" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">IA</span>
            </TabsTrigger>
            <TabsTrigger value="influenciadoras" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Influencers</span>
            </TabsTrigger>
            <TabsTrigger value="relatorios-mensais" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="testes-ab" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Testes A/B</span>
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Smartphone className="w-4 h-4" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTrigger>
            <TabsTrigger value="exportacao" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Exportar</span>
            </TabsTrigger>
            <TabsTrigger value="calendario" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendário</span>
            </TabsTrigger>
            <TabsTrigger value="lembretes" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Lembretes</span>
            </TabsTrigger>
            <TabsTrigger value="multiplos" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Compartilhar</span>
            </TabsTrigger>
            <TabsTrigger value="roi" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">ROI</span>
            </TabsTrigger>
            <TabsTrigger value="stripe" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Stripe</span>
            </TabsTrigger>
            <TabsTrigger value="clonagem" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Copy className="w-4 h-4" />
              <span className="hidden sm:inline">Clonar</span>
            </TabsTrigger>
            <TabsTrigger value="vendas-realtime" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Vendas</span>
            </TabsTrigger>
            <TabsTrigger value="feedback-clientes" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Feedback</span>
            </TabsTrigger>
            <TabsTrigger value="chat-tawk" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Chat</span>
            </TabsTrigger>
            <TabsTrigger value="cohort" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Cohort</span>
            </TabsTrigger>
            <TabsTrigger value="churn-ia" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingDown className="w-4 h-4" />
              <span className="hidden sm:inline">Churn IA</span>
            </TabsTrigger>
            <TabsTrigger value="ltv" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">LTV</span>
            </TabsTrigger>
            <TabsTrigger value="referencia" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Referência</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="previsao" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Previsão IA</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard-exec" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>

            <TabsTrigger value="alertas" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="tiktok-ads" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">TikTok Ads</span>
            </TabsTrigger>
            <TabsTrigger value="recomendador" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Recomendador</span>
            </TabsTrigger>
            <TabsTrigger value="google-sheets" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Sheets</span>
            </TabsTrigger>
            <TabsTrigger value="instagram-ads" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Instagram</span>
            </TabsTrigger>
            <TabsTrigger value="facebook-ads" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Facebook</span>
            </TabsTrigger>
            <TabsTrigger value="segmentacao" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Segmentação</span>
            </TabsTrigger>
            <TabsTrigger value="comparador-ab" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Comparador</span>
            </TabsTrigger>
            <TabsTrigger value="meta-vs-google" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Meta vs Google</span>
            </TabsTrigger>
            <TabsTrigger value="automacao-segmentacao" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Auto Segm.</span>
            </TabsTrigger>
            <TabsTrigger value="roi-segmento" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">ROI Segm.</span>
            </TabsTrigger>
            <TabsTrigger value="email-marketing" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="crm-clientes" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">CRM</span>
            </TabsTrigger>
            <TabsTrigger value="atribuicao-multichannel" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Atribuição</span>
            </TabsTrigger>
            <TabsTrigger value="manual" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <BookOpen className="w-4 h-4" />
              <span className="hidden sm:inline">Manual</span>
            </TabsTrigger>
            <TabsTrigger value="automacao-bling" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Bling</span>
            </TabsTrigger>
            <TabsTrigger value="relatorio-influenciadores" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Personas</span>
            </TabsTrigger>
            <TabsTrigger value="previsao-churn" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Churn</span>
            </TabsTrigger>
            <TabsTrigger value="integracao-tray" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Tray</span>
            </TabsTrigger>
            <TabsTrigger value="rentabilidade-produto" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Rentab.</span>
            </TabsTrigger>
            <TabsTrigger value="previsao-demanda" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Demanda</span>
            </TabsTrigger>
            <TabsTrigger value="automacao-email" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Mail className="w-4 h-4" />
              <span className="hidden sm:inline">Email</span>
            </TabsTrigger>
            <TabsTrigger value="ltv-detalhado" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">LTV</span>
            </TabsTrigger>
            <TabsTrigger value="analise-competitiva" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Competitiva</span>
            </TabsTrigger>
            <TabsTrigger value="google-analytics" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">GA4</span>
            </TabsTrigger>
            <TabsTrigger value="recomendacao-ia" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Recomendação</span>
            </TabsTrigger>
            <TabsTrigger value="otimizacao-funil" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Funil</span>
            </TabsTrigger>
            <TabsTrigger value="whatsapp-integracao" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">WhatsApp</span>
            </TabsTrigger>
            <TabsTrigger value="sentimento-redes" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Sentimento</span>
            </TabsTrigger>
            <TabsTrigger value="orcamento-canais" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Orçamento</span>
            </TabsTrigger>
            <TabsTrigger value="canva-integracao" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Palette className="w-4 h-4" />
              <span className="hidden sm:inline">Canva</span>
            </TabsTrigger>
            <TabsTrigger value="demanda-ml" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Brain className="w-4 h-4" />
              <span className="hidden sm:inline">Demanda ML</span>
            </TabsTrigger>
            <TabsTrigger value="respostas-ia" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Respostas IA</span>
            </TabsTrigger>
            <TabsTrigger value="concorrencia-tempo-real" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Concorrência</span>
            </TabsTrigger>
            <TabsTrigger value="rentabilidade-detalhada" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">Rentab. Detalhada</span>
            </TabsTrigger>
            <TabsTrigger value="relatorios-agendados" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="afiliados" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Afiliados</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="personas" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><PersonasSection /></Suspense>
          </TabsContent>

          <TabsContent value="planejamento" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><PlanejamentoSection /></Suspense>
          </TabsContent>

          <TabsContent value="roteiros" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><RoteiroSection /></Suspense>
          </TabsContent>

          <TabsContent value="tendencias" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><TendenciasSection /></Suspense>
          </TabsContent>

          <TabsContent value="novos-roteiros" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><NovoRoteiroStoriesSection /></Suspense>
          </TabsContent>

          <TabsContent value="tiktok" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><RoteiroTikTokSection /></Suspense>
          </TabsContent>

          <TabsContent value="imagens" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IdeiasImagensInstagramSection /></Suspense>
          </TabsContent>

          <TabsContent value="legendas" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><LegendaPostsSection /></Suspense>
          </TabsContent>

          <TabsContent value="anuncio" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><RoteiroanunciaTikTokSection /></Suspense>
          </TabsContent>

          <TabsContent value="familiar" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><RoteiroAnuncioFamiliarSection /></Suspense>
          </TabsContent>

          <TabsContent value="reels" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><RoteiroInstagramReelsSection /></Suspense>
          </TabsContent>

          <TabsContent value="tiktok-inverno" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><TresRoteirosTikTokInvernoSection /></Suspense>
          </TabsContent>

          <TabsContent value="stories" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><PlanoStoriesSemanSection /></Suspense>
          </TabsContent>

          <TabsContent value="stories-42" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><Stories42Section /></Suspense>
          </TabsContent>

          <TabsContent value="ads-analise" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AnaliseAdsSection /></Suspense>
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><DashboardMonitoramentoSection /></Suspense>
          </TabsContent>

          <TabsContent value="relatorio" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><GeradorRelatorioSection /></Suspense>
          </TabsContent>

          <TabsContent value="calculadora" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><CalculadoraOrcamentoSection /></Suspense>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><GoogleAnalyticsSection /></Suspense>
          </TabsContent>

          <TabsContent value="calendario" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><ExportarCalendarioSection /></Suspense>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><TemplatesReutilizaveisSection /></Suspense>
          </TabsContent>

          <TabsContent value="zapier" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoZapierSection /></Suspense>
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><FeedbackRatingsSection /></Suspense>
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><NotificacoesPushSection /></Suspense>
          </TabsContent>

          <TabsContent value="meta" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><MetaBusinessSuiteSection /></Suspense>
          </TabsContent>

          <TabsContent value="abtest" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><ABTestingSection /></Suspense>
          </TabsContent>

          <TabsContent value="ia" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IAOtimizacaoLegendaSection /></Suspense>
          </TabsContent>

          <TabsContent value="googleads" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><GoogleAdsSection /></Suspense>
          </TabsContent>

          <TabsContent value="agendamento" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AgendamentoInteligenteSection /></Suspense>
          </TabsContent>

          <TabsContent value="roi" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><DashboardROIConsolidadoSection /></Suspense>
          </TabsContent>

          <TabsContent value="slack" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoSlackEmailSection /></Suspense>
          </TabsContent>

          <TabsContent value="previsao" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><PrevisaoVendasSection /></Suspense>
          </TabsContent>

          <TabsContent value="concorrentes" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><ComparativoConcorrentesSection /></Suspense>
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoWhatsAppSection /></Suspense>
          </TabsContent>

          <TabsContent value="atribuicao" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AtribuicaoVendasSection /></Suspense>
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><ChatIASection /></Suspense>
          </TabsContent>

          <TabsContent value="calendario-conteudo" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><CalendarioConteudoSection /></Suspense>
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><RelatoriosAgendadosSection /></Suspense>
          </TabsContent>

          <TabsContent value="biblioteca" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><BibliotecaTemplatesSection /></Suspense>
          </TabsContent>

          <TabsContent value="whatsapp-api" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoWhatsAppAPISection /></Suspense>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><DashboardPerformanceRealtimeSection /></Suspense>
          </TabsContent>

          <TabsContent value="cupons" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><SistemaCuponsPromocoesSection /></Suspense>
          </TabsContent>

          <TabsContent value="videos-ia" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><GeracaoVideosIASection /></Suspense>
          </TabsContent>

          <TabsContent value="capcut" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoCapCutSection /></Suspense>
          </TabsContent>

          <TabsContent value="audios" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><BibliotecaAudiosSection /></Suspense>
          </TabsContent>

          <TabsContent value="agendador" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AgendadorPublicacaoSection /></Suspense>
          </TabsContent>

          <TabsContent value="drive" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoGoogleDriveSection /></Suspense>
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><FeedbackClientesSection /></Suspense>
          </TabsContent>

          <TabsContent value="relatorio" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><RelatorioSemanalSection /></Suspense>
          </TabsContent>

          <TabsContent value="crm" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoCRMSection /></Suspense>
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><NotificacoesRealtimeSection /></Suspense>
          </TabsContent>

          <TabsContent value="exportacao" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><ExportacaoRelatoriosSection /></Suspense>
          </TabsContent>

          <TabsContent value="stripe" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoStripeSection /></Suspense>
          </TabsContent>

          <TabsContent value="concorrentes-auto" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AnaliseConorrentesAutomaticoSection /></Suspense>
          </TabsContent>

          <TabsContent value="gerador-ia" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><GeradorConteudoIASection /></Suspense>
          </TabsContent>

          <TabsContent value="recomendacao" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><SistemaRecomendacaoProdutosSection /></Suspense>
          </TabsContent>

          <TabsContent value="funil-analytics" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AnalyticsAvancadoFunilSection /></Suspense>
          </TabsContent>

          <TabsContent value="hotjar" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoHotjarClaritySection /></Suspense>
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><SistemaLoyaltyPontosSection /></Suspense>
          </TabsContent>

          <TabsContent value="chatbot" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><ChatbotSuportePushSection /></Suspense>
          </TabsContent>

          <TabsContent value="galeria-looks" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><GaleriaLooksPersonasSection /></Suspense>
          </TabsContent>

          <TabsContent value="comparador" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><ComparadorPersonasSection /></Suspense>
          </TabsContent>

          <TabsContent value="pinterest-canva" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoPinterestCanvaSection /></Suspense>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><PerformancePersonaSection /></Suspense>
          </TabsContent>

          <TabsContent value="quiz-persona" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AssistenteSelecaoPersonaSection /></Suspense>
          </TabsContent>

          <TabsContent value="tendencias-virais" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><DashboardTendenciasViraisSection /></Suspense>
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><SistemaNotificacoesInteligentesSection /></Suspense>
          </TabsContent>

          <TabsContent value="exportar-relatorios" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><ExportadorRelatoriosPersonaSection /></Suspense>
          </TabsContent>

          <TabsContent value="growth-viral" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><EstrategiaGrowthViralSection /></Suspense>
          </TabsContent>

          <TabsContent value="calendario-conteudo" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><CalendarioConteudoOtimizadoSection /></Suspense>
          </TabsContent>

          <TabsContent value="concorrentes" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AnaliseConcorrentesSection /></Suspense>
          </TabsContent>

          <TabsContent value="apis-integracao" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoAPIsSection /></Suspense>
          </TabsContent>

          <TabsContent value="dashboard-unificado" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><DashboardUnificadoSection /></Suspense>
          </TabsContent>

          <TabsContent value="automacao-posts" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><SistemaAutomacaoPostsSection /></Suspense>
          </TabsContent>

          <TabsContent value="ads-integracao" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoAdsSection /></Suspense>
          </TabsContent>

          <TabsContent value="recomendacao-ia" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><SistemaRecomendacaoConteudoSection /></Suspense>
          </TabsContent>

          <TabsContent value="influenciadoras" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><ModuloInfluenciadorasSection /></Suspense>
          </TabsContent>

          <TabsContent value="relatorios-mensais" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><SistemaRelatoriosMensaisSection /></Suspense>
          </TabsContent>

          <TabsContent value="testes-ab" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><ModuloTesteABAvancadoSection /></Suspense>
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><SistemaNotificacoesTempoRealSection /></Suspense>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoGoogleAnalytics4Section /></Suspense>
          </TabsContent>

          <TabsContent value="mobile" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><DashboardMobileResponsivoSection /></Suspense>
          </TabsContent>

          <TabsContent value="exportacao" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><ExportacaoDadosSection /></Suspense>
          </TabsContent>

          <TabsContent value="calendario" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoCalendarioGoogleSection /></Suspense>
          </TabsContent>

          <TabsContent value="lembretes" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><SistemaLembretesAutomaticosSection /></Suspense>
          </TabsContent>

          <TabsContent value="multiplos" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><SuporteMultiplosCalendariosSection /></Suspense>
          </TabsContent>

          <TabsContent value="roi" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><DashboardROIPersonaSection /></Suspense>
          </TabsContent>

          <TabsContent value="stripe" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoStripeSection /></Suspense>
          </TabsContent>

          <TabsContent value="clonagem" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><FerramentaClonagemCampanhasSection /></Suspense>
          </TabsContent>

          <TabsContent value="vendas-realtime" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><PainelVendasTempoRealSection /></Suspense>
          </TabsContent>

          <TabsContent value="feedback-clientes" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><SistemaFeedbackClientesSection /></Suspense>
          </TabsContent>

          <TabsContent value="chat-tawk" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoTawkIntercomSection /></Suspense>
          </TabsContent>

          <TabsContent value="cohort" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><RelatorioCohortAnalysisSection /></Suspense>
          </TabsContent>

          <TabsContent value="churn-ia" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><PrevisaoChurnIASection /></Suspense>
          </TabsContent>

          <TabsContent value="ltv" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><DashboardLTVPersonaSection /></Suspense>
          </TabsContent>

          <TabsContent value="referencia" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><ProgramaReferenciaAutomaticoSection /></Suspense>
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoEmailMarketingSection /></Suspense>
          </TabsContent>

          <TabsContent value="previsao" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><PrevisaoDemandaIASection /></Suspense>
          </TabsContent>

          <TabsContent value="dashboard-exec" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><DashboardExecutivoConsolidadoSection /></Suspense>
          </TabsContent>

          <TabsContent value="alertas" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AlertasAutomaticosSection /></Suspense>
          </TabsContent>

          <TabsContent value="tiktok-ads" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoTikTokAdsSection /></Suspense>
          </TabsContent>

          <TabsContent value="recomendador" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><RecomendadorProdutosIASection /></Suspense>
          </TabsContent>

          <TabsContent value="google-sheets" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><ExportacaoGoogleSheetsSection /></Suspense>
          </TabsContent>

          <TabsContent value="instagram-ads" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoInstagramAdsSection /></Suspense>
          </TabsContent>

          <TabsContent value="facebook-ads" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoFacebookAdsSection /></Suspense>
          </TabsContent>

          <TabsContent value="segmentacao" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><SegmentacaoClientesSection /></Suspense>
          </TabsContent>

          <TabsContent value="comparador-ab" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><ComparadorEstrategiasABTestingSection /></Suspense>
          </TabsContent>

          <TabsContent value="meta-vs-google" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><ComparativoMetaGoogleAdsSection /></Suspense>
          </TabsContent>

          <TabsContent value="automacao-segmentacao" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AutomacaoSegmentacaoClientesSection /></Suspense>
          </TabsContent>

          <TabsContent value="roi-segmento" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><RelatorioROISegmentoSection /></Suspense>
          </TabsContent>

          <TabsContent value="email-marketing" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><EmailMarketingSection /></Suspense>
          </TabsContent>

          <TabsContent value="crm-clientes" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><CRMClientesSection /></Suspense>
          </TabsContent>

          <TabsContent value="atribuicao-multichannel" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AtribuicaoMulticanalSection /></Suspense>
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><ManualSection /></Suspense>
          </TabsContent>

          <TabsContent value="automacao-bling" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AutomacaoBlingSection /></Suspense>
          </TabsContent>

          <TabsContent value="relatorio-influenciadores" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><RelatorioInfluenciadoresSection /></Suspense>
          </TabsContent>

          <TabsContent value="previsao-churn" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><PrevisaoChurnSection /></Suspense>
          </TabsContent>

          <TabsContent value="integracao-tray" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoTraySection /></Suspense>
          </TabsContent>

          <TabsContent value="rentabilidade-produto" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><RentabilidadeProdutoSection /></Suspense>
          </TabsContent>

          <TabsContent value="previsao-demanda" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><PrevisaoDemandaSection /></Suspense>
          </TabsContent>

          <TabsContent value="automacao-email" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AutomacaoEmailInteligenteSection /></Suspense>
          </TabsContent>

          <TabsContent value="ltv-detalhado" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><LifetimeValueDetalhadoSection /></Suspense>
          </TabsContent>

          <TabsContent value="analise-competitiva" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AnalisesCompetitivaSection /></Suspense>
          </TabsContent>

          <TabsContent value="google-analytics" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><GoogleAnalytics4Section /></Suspense>
          </TabsContent>

          <TabsContent value="recomendacao-ia" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><SistemaRecomendacaoInteligenteSection /></Suspense>
          </TabsContent>

          <TabsContent value="otimizacao-funil" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><OtimizacaoFunilSection /></Suspense>
          </TabsContent>

          <TabsContent value="whatsapp-integracao" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoWhatsAppSection /></Suspense>
          </TabsContent>

          <TabsContent value="sentimento-redes" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AnaliseSentimentoRedesSociaisSection /></Suspense>
          </TabsContent>

          <TabsContent value="orcamento-canais" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><RecomendacaoOrcamentoCanalSection /></Suspense>
          </TabsContent>

          <TabsContent value="canva-integracao" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoCanvaSection /></Suspense>
          </TabsContent>

          <TabsContent value="demanda-ml" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><PrevisaoDemandaMachineLearningSection /></Suspense>
          </TabsContent>

          <TabsContent value="respostas-ia" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AutomacaoRespostasRedesSociaisSection /></Suspense>
          </TabsContent>

          <TabsContent value="concorrencia-tempo-real" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AnaliseConcorrenciaTempoRealSection /></Suspense>
          </TabsContent>

          <TabsContent value="rentabilidade-detalhada" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><RentabilidadeDetalhadaSection /></Suspense>
          </TabsContent>

          <TabsContent value="relatorios-agendados" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><AutomacaoRelatoriosAgendadosSection /></Suspense>
          </TabsContent>

          <TabsContent value="afiliados" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><IntegracaoAfiliados /></Suspense>
          </TabsContent>

          <TabsContent value="drops-planner" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><DropsPlannerSection /></Suspense>
          </TabsContent>

          <TabsContent value="ugc-collector" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><UGCCollectorSection /></Suspense>
          </TabsContent>

          <TabsContent value="abandono-recovery" className="space-y-6">
            <Suspense fallback={SuspenseFallback}><RecuperacaoAbandonoSection /></Suspense>
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
    </div>
  );
}
