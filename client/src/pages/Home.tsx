import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Calendar, Video, TrendingUp, MessageCircle, Target, Zap, Play, Film, Activity, FileText, Calculator, Save, Star, Bell, Instagram, BarChart3, Sparkles, Clock, DollarSign } from "lucide-react";
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
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-32 mb-8 bg-slate-100 p-1 overflow-x-auto">
            <TabsTrigger value="personas" className="flex items-center gap-2 text-xs sm:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Personas</span>
            </TabsTrigger>
            <TabsTrigger value="planejamento" className="flex items-center gap-2 text-xs sm:text-sm">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Planejamento</span>
            </TabsTrigger>
            <TabsTrigger value="roteiros" className="flex items-center gap-2 text-xs sm:text-sm">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Roteiros</span>
            </TabsTrigger>
            <TabsTrigger value="tendencias" className="flex items-center gap-2 text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Tendencias</span>
            </TabsTrigger>
            <TabsTrigger value="novos-roteiros" className="flex items-center gap-2 text-xs sm:text-sm">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Novos Stories</span>
            </TabsTrigger>
            <TabsTrigger value="tiktok" className="flex items-center gap-2 text-xs sm:text-sm">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">TikTok</span>
            </TabsTrigger>
            <TabsTrigger value="imagens" className="flex items-center gap-2 text-xs sm:text-sm">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">Imagens IG</span>
            </TabsTrigger>
            <TabsTrigger value="legendas" className="flex items-center gap-2 text-xs sm:text-sm">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Legendas</span>
            </TabsTrigger>
            <TabsTrigger value="anuncio" className="flex items-center gap-2 text-xs sm:text-sm">
              <Play className="w-4 h-4" />
              <span className="hidden sm:inline">Anúncio</span>
            </TabsTrigger>
            <TabsTrigger value="familiar" className="flex items-center gap-2 text-xs sm:text-sm">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Familiar</span>
            </TabsTrigger>
            <TabsTrigger value="reels" className="flex items-center gap-2 text-xs sm:text-sm">
              <Film className="w-4 h-4" />
              <span className="hidden sm:inline">Reels</span>
            </TabsTrigger>
            <TabsTrigger value="tiktok-inverno" className="flex items-center gap-2 text-xs sm:text-sm">
              <Video className="w-4 h-4" />
              <span className="hidden sm:inline">TikTok 3x</span>
            </TabsTrigger>
            <TabsTrigger value="stories" className="flex items-center gap-2 text-xs sm:text-sm">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Stories</span>
            </TabsTrigger>
            <TabsTrigger value="stories-42" className="flex items-center gap-2 text-xs sm:text-sm">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">42 Stories</span>
            </TabsTrigger>
            <TabsTrigger value="ads-analise" className="flex items-center gap-2 text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Análise Ads</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center gap-2 text-xs sm:text-sm">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="relatorio" className="flex items-center gap-2 text-xs sm:text-sm">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Relatório</span>
            </TabsTrigger>
            <TabsTrigger value="calculadora" className="flex items-center gap-2 text-xs sm:text-sm">
              <Calculator className="w-4 h-4" />
              <span className="hidden sm:inline">Calculadora</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="calendario" className="flex items-center gap-2 text-xs sm:text-sm">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Calendário</span>
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2 text-xs sm:text-sm">
              <Save className="w-4 h-4" />
              <span className="hidden sm:inline">Templates</span>
            </TabsTrigger>
            <TabsTrigger value="zapier" className="flex items-center gap-2 text-xs sm:text-sm">
              <Zap className="w-4 h-4" />
              <span className="hidden sm:inline">Zapier</span>
            </TabsTrigger>
            <TabsTrigger value="ratings" className="flex items-center gap-2 text-xs sm:text-sm">
              <Star className="w-4 h-4" />
              <span className="hidden sm:inline">Ratings</span>
            </TabsTrigger>
            <TabsTrigger value="notificacoes" className="flex items-center gap-2 text-xs sm:text-sm">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notif.</span>
            </TabsTrigger>
            <TabsTrigger value="meta" className="flex items-center gap-2 text-xs sm:text-sm">
              <Instagram className="w-4 h-4" />
              <span className="hidden sm:inline">Meta</span>
            </TabsTrigger>
            <TabsTrigger value="abtest" className="flex items-center gap-2 text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">A/B Test</span>
            </TabsTrigger>
            <TabsTrigger value="ia" className="flex items-center gap-2 text-xs sm:text-sm">
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">IA</span>
            </TabsTrigger>
            <TabsTrigger value="googleads" className="flex items-center gap-2 text-xs sm:text-sm">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Google Ads</span>
            </TabsTrigger>
            <TabsTrigger value="agendamento" className="flex items-center gap-2 text-xs sm:text-sm">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Agenda</span>
            </TabsTrigger>
            <TabsTrigger value="roi" className="flex items-center gap-2 text-xs sm:text-sm">
              <DollarSign className="w-4 h-4" />
              <span className="hidden sm:inline">ROI</span>
            </TabsTrigger>
            <TabsTrigger value="slack" className="flex items-center gap-2 text-xs sm:text-sm">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Notif</span>
            </TabsTrigger>
            <TabsTrigger value="previsao" className="flex items-center gap-2 text-xs sm:text-sm">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Previsão</span>
            </TabsTrigger>
            <TabsTrigger value="concorrentes" className="flex items-center gap-2 text-xs sm:text-sm">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Concorr</span>
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
