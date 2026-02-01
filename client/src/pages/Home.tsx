import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Video, TrendingUp, MessageCircle, Target, Zap, Play, Film, Activity, FileText, Calculator, Save, Star, Bell, Instagram, BarChart3, Sparkles, Clock, DollarSign, Ticket, Edit, Music, Cloud, MessageSquare, Database, Download, ShoppingCart, Lightbulb, Palette, Brain, Smartphone, CreditCard, Copy, TrendingDown, Share2, Mail, BookOpen } from "lucide-react";
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
import IntegracaoWhatsAppSection from "@/components/IntegracaoWhatsAppSection";
import AtribuicaoVendasSection from "@/components/AtribuicaoVendasSection";
import ChatIASection from "@/components/ChatIASection";
import CalendarioConteudoSection from "@/components/CalendarioConteudoSection";
import RelatoriosAgendadosSection from "@/components/RelatoriosAgendadosSection";
import BibliotecaTemplatesSection from "@/components/BibliotecaTemplatesSection";
import IntegracaoWhatsAppAPISection from "@/components/IntegracaoWhatsAppAPISection";
import DashboardPerformanceRealtimeSection from "@/components/DashboardPerformanceRealtimeSection";
import SistemaCuponsPromocoesSection from "@/components/SistemaCuponsPromocoesSection";
import BarraBuscaAbas from "@/components/BarraBuscaAbas";
import MenuFavoritosAbas from "@/components/MenuFavoritosAbas";
import GeracaoVideosIASection from "@/components/GeracaoVideosIASection";
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
import { IntegracaoShopifySection } from "@/components/IntegracaoShopifySection";
import { AlertasAutomaticosSection } from "@/components/AlertasAutomaticosSection";
import { IntegracaoTikTokAdsSection } from "@/components/IntegracaoTikTokAdsSection";
import { RecomendadorProdutosIASection } from "@/components/RecomendadorProdutosIASection";
import { ExportacaoGoogleSheetsSection } from "@/components/ExportacaoGoogleSheetsSection";
import { IntegracaoInstagramAdsSection } from '@/components/IntegracaoInstagramAdsSection';
import { IntegracaoFacebookAdsSection } from '@/components/IntegracaoFacebookAdsSection';
import { SegmentacaoClientesSection } from '@/components/SegmentacaoClientesSection';
import { ComparadorEstrategiasABTestingSection } from '@/components/ComparadorEstrategiasABTestingSection';
import { ComparativoMetaGoogleAdsSection } from '@/components/ComparativoMetaGoogleAdsSection';
import { AutomacaoSegmentacaoClientesSection } from '@/components/AutomacaoSegmentacaoClientesSection';
import { RelatorioROISegmentoSection } from '@/components/RelatorioROISegmentoSection';
import { EmailMarketingSection } from '@/components/EmailMarketingSection';
import { CRMClientesSection } from '@/components/CRMClientesSection';
import { AtribuicaoMulticanalSection } from '@/components/AtribuicaoMulticanalSection';
import { ManualSection } from '@/components/ManualSection';
import { AutomacaoBlingSection } from '@/components/AutomacaoBlingSection';
import { RelatorioInfluenciadoresSection } from '@/components/RelatorioInfluenciadoresSection';

export default function Home() {
  const [activeTab, setActiveTab] = useState("personas");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
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
            <TabsTrigger value="shopify" className="flex items-center gap-2 text-xs sm:text-sm whitespace-nowrap min-w-fit">
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Shopify</span>
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

          <TabsContent value="novos-roteiros" className="space-y-6">
            <NovoRoteiroStoriesSection />
          </TabsContent>

          <TabsContent value="tiktok" className="space-y-6">
            <RoteiroTikTokSection />
          </TabsContent>

          <TabsContent value="imagens" className="space-y-6">
            <IdeiasImagensInstagramSection />
          </TabsContent>

          <TabsContent value="legendas" className="space-y-6">
            <LegendaPostsSection />
          </TabsContent>

          <TabsContent value="anuncio" className="space-y-6">
            <RoteiroanunciaTikTokSection />
          </TabsContent>

          <TabsContent value="familiar" className="space-y-6">
            <RoteiroAnuncioFamiliarSection />
          </TabsContent>

          <TabsContent value="reels" className="space-y-6">
            <RoteiroInstagramReelsSection />
          </TabsContent>

          <TabsContent value="tiktok-inverno" className="space-y-6">
            <TresRoteirosTikTokInvernoSection />
          </TabsContent>

          <TabsContent value="stories" className="space-y-6">
            <PlanoStoriesSemanSection />
          </TabsContent>

          <TabsContent value="stories-42" className="space-y-6">
            <Stories42Section />
          </TabsContent>

          <TabsContent value="ads-analise" className="space-y-6">
            <AnaliseAdsSection />
          </TabsContent>

          <TabsContent value="dashboard" className="space-y-6">
            <DashboardMonitoramentoSection />
          </TabsContent>

          <TabsContent value="relatorio" className="space-y-6">
            <GeradorRelatorioSection />
          </TabsContent>

          <TabsContent value="calculadora" className="space-y-6">
            <CalculadoraOrcamentoSection />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <GoogleAnalyticsSection />
          </TabsContent>

          <TabsContent value="calendario" className="space-y-6">
            <ExportarCalendarioSection />
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <TemplatesReutilizaveisSection />
          </TabsContent>

          <TabsContent value="zapier" className="space-y-6">
            <IntegracaoZapierSection />
          </TabsContent>

          <TabsContent value="ratings" className="space-y-6">
            <FeedbackRatingsSection />
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-6">
            <NotificacoesPushSection />
          </TabsContent>

          <TabsContent value="meta" className="space-y-6">
            <MetaBusinessSuiteSection />
          </TabsContent>

          <TabsContent value="abtest" className="space-y-6">
            <ABTestingSection />
          </TabsContent>

          <TabsContent value="ia" className="space-y-6">
            <IAOtimizacaoLegendaSection />
          </TabsContent>

          <TabsContent value="googleads" className="space-y-6">
            <GoogleAdsSection />
          </TabsContent>

          <TabsContent value="agendamento" className="space-y-6">
            <AgendamentoInteligenteSection />
          </TabsContent>

          <TabsContent value="roi" className="space-y-6">
            <DashboardROIConsolidadoSection />
          </TabsContent>

          <TabsContent value="slack" className="space-y-6">
            <IntegracaoSlackEmailSection />
          </TabsContent>

          <TabsContent value="previsao" className="space-y-6">
            <PrevisaoVendasSection />
          </TabsContent>

          <TabsContent value="concorrentes" className="space-y-6">
            <ComparativoConcorrentesSection />
          </TabsContent>

          <TabsContent value="whatsapp" className="space-y-6">
            <IntegracaoWhatsAppSection />
          </TabsContent>

          <TabsContent value="atribuicao" className="space-y-6">
            <AtribuicaoVendasSection />
          </TabsContent>

          <TabsContent value="chat" className="space-y-6">
            <ChatIASection />
          </TabsContent>

          <TabsContent value="calendario-conteudo" className="space-y-6">
            <CalendarioConteudoSection />
          </TabsContent>

          <TabsContent value="relatorios" className="space-y-6">
            <RelatoriosAgendadosSection />
          </TabsContent>

          <TabsContent value="biblioteca" className="space-y-6">
            <BibliotecaTemplatesSection />
          </TabsContent>

          <TabsContent value="whatsapp-api" className="space-y-6">
            <IntegracaoWhatsAppAPISection />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <DashboardPerformanceRealtimeSection />
          </TabsContent>

          <TabsContent value="cupons" className="space-y-6">
            <SistemaCuponsPromocoesSection />
          </TabsContent>

          <TabsContent value="videos-ia" className="space-y-6">
            <GeracaoVideosIASection />
          </TabsContent>

          <TabsContent value="capcut" className="space-y-6">
            <IntegracaoCapCutSection />
          </TabsContent>

          <TabsContent value="audios" className="space-y-6">
            <BibliotecaAudiosSection />
          </TabsContent>

          <TabsContent value="agendador" className="space-y-6">
            <AgendadorPublicacaoSection />
          </TabsContent>

          <TabsContent value="drive" className="space-y-6">
            <IntegracaoGoogleDriveSection />
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6">
            <FeedbackClientesSection />
          </TabsContent>

          <TabsContent value="relatorio" className="space-y-6">
            <RelatorioSemanalSection />
          </TabsContent>

          <TabsContent value="crm" className="space-y-6">
            <IntegracaoCRMSection />
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-6">
            <NotificacoesRealtimeSection />
          </TabsContent>

          <TabsContent value="exportacao" className="space-y-6">
            <ExportacaoRelatoriosSection />
          </TabsContent>

          <TabsContent value="stripe" className="space-y-6">
            <IntegracaoStripeSection />
          </TabsContent>

          <TabsContent value="concorrentes-auto" className="space-y-6">
            <AnaliseConorrentesAutomaticoSection />
          </TabsContent>

          <TabsContent value="gerador-ia" className="space-y-6">
            <GeradorConteudoIASection />
          </TabsContent>

          <TabsContent value="recomendacao" className="space-y-6">
            <SistemaRecomendacaoProdutosSection />
          </TabsContent>

          <TabsContent value="funil-analytics" className="space-y-6">
            <AnalyticsAvancadoFunilSection />
          </TabsContent>

          <TabsContent value="hotjar" className="space-y-6">
            <IntegracaoHotjarClaritySection />
          </TabsContent>

          <TabsContent value="loyalty" className="space-y-6">
            <SistemaLoyaltyPontosSection />
          </TabsContent>

          <TabsContent value="chatbot" className="space-y-6">
            <ChatbotSuportePushSection />
          </TabsContent>

          <TabsContent value="galeria-looks" className="space-y-6">
            <GaleriaLooksPersonasSection />
          </TabsContent>

          <TabsContent value="comparador" className="space-y-6">
            <ComparadorPersonasSection />
          </TabsContent>

          <TabsContent value="pinterest-canva" className="space-y-6">
            <IntegracaoPinterestCanvaSection />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformancePersonaSection />
          </TabsContent>

          <TabsContent value="quiz-persona" className="space-y-6">
            <AssistenteSelecaoPersonaSection />
          </TabsContent>

          <TabsContent value="tendencias-virais" className="space-y-6">
            <DashboardTendenciasViraisSection />
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-6">
            <SistemaNotificacoesInteligentesSection />
          </TabsContent>

          <TabsContent value="exportar-relatorios" className="space-y-6">
            <ExportadorRelatoriosPersonaSection />
          </TabsContent>

          <TabsContent value="growth-viral" className="space-y-6">
            <EstrategiaGrowthViralSection />
          </TabsContent>

          <TabsContent value="calendario-conteudo" className="space-y-6">
            <CalendarioConteudoOtimizadoSection />
          </TabsContent>

          <TabsContent value="concorrentes" className="space-y-6">
            <AnaliseConcorrentesSection />
          </TabsContent>

          <TabsContent value="apis-integracao" className="space-y-6">
            <IntegracaoAPIsSection />
          </TabsContent>

          <TabsContent value="dashboard-unificado" className="space-y-6">
            <DashboardUnificadoSection />
          </TabsContent>

          <TabsContent value="automacao-posts" className="space-y-6">
            <SistemaAutomacaoPostsSection />
          </TabsContent>

          <TabsContent value="ads-integracao" className="space-y-6">
            <IntegracaoAdsSection />
          </TabsContent>

          <TabsContent value="recomendacao-ia" className="space-y-6">
            <SistemaRecomendacaoConteudoSection />
          </TabsContent>

          <TabsContent value="influenciadoras" className="space-y-6">
            <ModuloInfluenciadorasSection />
          </TabsContent>

          <TabsContent value="relatorios-mensais" className="space-y-6">
            <SistemaRelatoriosMensaisSection />
          </TabsContent>

          <TabsContent value="testes-ab" className="space-y-6">
            <ModuloTesteABAvancadoSection />
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-6">
            <SistemaNotificacoesTempoRealSection />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <IntegracaoGoogleAnalytics4Section />
          </TabsContent>

          <TabsContent value="mobile" className="space-y-6">
            <DashboardMobileResponsivoSection />
          </TabsContent>

          <TabsContent value="exportacao" className="space-y-6">
            <ExportacaoDadosSection />
          </TabsContent>

          <TabsContent value="calendario" className="space-y-6">
            <IntegracaoCalendarioGoogleSection />
          </TabsContent>

          <TabsContent value="lembretes" className="space-y-6">
            <SistemaLembretesAutomaticosSection />
          </TabsContent>

          <TabsContent value="multiplos" className="space-y-6">
            <SuporteMultiplosCalendariosSection />
          </TabsContent>

          <TabsContent value="roi" className="space-y-6">
            <DashboardROIPersonaSection />
          </TabsContent>

          <TabsContent value="stripe" className="space-y-6">
            <IntegracaoStripeSection />
          </TabsContent>

          <TabsContent value="clonagem" className="space-y-6">
            <FerramentaClonagemCampanhasSection />
          </TabsContent>

          <TabsContent value="vendas-realtime" className="space-y-6">
            <PainelVendasTempoRealSection />
          </TabsContent>

          <TabsContent value="feedback-clientes" className="space-y-6">
            <SistemaFeedbackClientesSection />
          </TabsContent>

          <TabsContent value="chat-tawk" className="space-y-6">
            <IntegracaoTawkIntercomSection />
          </TabsContent>

          <TabsContent value="cohort" className="space-y-6">
            <RelatorioCohortAnalysisSection />
          </TabsContent>

          <TabsContent value="churn-ia" className="space-y-6">
            <PrevisaoChurnIASection />
          </TabsContent>

          <TabsContent value="ltv" className="space-y-6">
            <DashboardLTVPersonaSection />
          </TabsContent>

          <TabsContent value="referencia" className="space-y-6">
            <ProgramaReferenciaAutomaticoSection />
          </TabsContent>

          <TabsContent value="email" className="space-y-6">
            <IntegracaoEmailMarketingSection />
          </TabsContent>

          <TabsContent value="previsao" className="space-y-6">
            <PrevisaoDemandaIASection />
          </TabsContent>

          <TabsContent value="dashboard-exec" className="space-y-6">
            <DashboardExecutivoConsolidadoSection />
          </TabsContent>

          <TabsContent value="shopify" className="space-y-6">
            <IntegracaoShopifySection />
          </TabsContent>

          <TabsContent value="alertas" className="space-y-6">
            <AlertasAutomaticosSection />
          </TabsContent>

          <TabsContent value="tiktok-ads" className="space-y-6">
            <IntegracaoTikTokAdsSection />
          </TabsContent>

          <TabsContent value="recomendador" className="space-y-6">
            <RecomendadorProdutosIASection />
          </TabsContent>

          <TabsContent value="google-sheets" className="space-y-6">
            <ExportacaoGoogleSheetsSection />
          </TabsContent>

          <TabsContent value="instagram-ads" className="space-y-6">
            <IntegracaoInstagramAdsSection />
          </TabsContent>

          <TabsContent value="facebook-ads" className="space-y-6">
            <IntegracaoFacebookAdsSection />
          </TabsContent>

          <TabsContent value="segmentacao" className="space-y-6">
            <SegmentacaoClientesSection />
          </TabsContent>

          <TabsContent value="comparador-ab" className="space-y-6">
            <ComparadorEstrategiasABTestingSection />
          </TabsContent>

          <TabsContent value="meta-vs-google" className="space-y-6">
            <ComparativoMetaGoogleAdsSection />
          </TabsContent>

          <TabsContent value="automacao-segmentacao" className="space-y-6">
            <AutomacaoSegmentacaoClientesSection />
          </TabsContent>

          <TabsContent value="roi-segmento" className="space-y-6">
            <RelatorioROISegmentoSection />
          </TabsContent>

          <TabsContent value="email-marketing" className="space-y-6">
            <EmailMarketingSection />
          </TabsContent>

          <TabsContent value="crm-clientes" className="space-y-6">
            <CRMClientesSection />
          </TabsContent>

          <TabsContent value="atribuicao-multichannel" className="space-y-6">
            <AtribuicaoMulticanalSection />
          </TabsContent>

          <TabsContent value="manual" className="space-y-6">
            <ManualSection />
          </TabsContent>

          <TabsContent value="automacao-bling" className="space-y-6">
            <AutomacaoBlingSection />
          </TabsContent>

          <TabsContent value="relatorio-influenciadores" className="space-y-6">
            <RelatorioInfluenciadoresSection />
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
