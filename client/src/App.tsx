import { lazy, Suspense } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import PublicLayout from "@/components/PublicLayout";
import { Toaster } from "@/components/ui/sonner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Páginas carregadas imediatamente (rota inicial + login)
import Home from "@/pages/Home";
import LoginSignup from "@/pages/LoginSignup";

// Todas as outras páginas em lazy para code splitting
const Integrations            = lazy(() => import("@/pages/Integrations"));
const IntegrationGuide        = lazy(() => import("@/pages/IntegrationGuide"));
const Performance             = lazy(() => import("@/pages/Performance"));
const Automations             = lazy(() => import("@/pages/Automations"));
const Campaigns               = lazy(() => import("@/pages/Campaigns"));
const InfluencersDashboard    = lazy(() => import("@/pages/InfluencersDashboard"));
const MetaAdsCampaigns        = lazy(() => import("@/pages/MetaAdsCampaigns"));
const OAuthCredentials        = lazy(() => import("@/pages/OAuthCredentials"));
const CollaboratorsManagement = lazy(() => import("@/pages/CollaboratorsManagement"));
const ConfigureCredentials    = lazy(() => import("@/pages/ConfigureCredentials"));
const IntegrationSetup        = lazy(() => import("@/pages/IntegrationSetup"));
const CanvaOAuth              = lazy(() => import("@/pages/CanvaOAuth"));
const KnowledgeCenterPage     = lazy(() => import("@/pages/KnowledgeCenterPage"));
const MetaCapiSetup           = lazy(() => import("@/pages/MetaCapiSetup"));
const TermosServico           = lazy(() => import("@/pages/TermosServico"));
const Privacidade             = lazy(() => import("@/pages/Privacidade"));
const PrivacyPolicy           = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService          = lazy(() => import("@/pages/TermsOfService"));
const InstagramDashboard      = lazy(() => import("@/pages/InstagramDashboard"));
const MetaAdsDashboard        = lazy(() => import("@/pages/MetaAdsDashboard"));
const SocialMediaScheduler    = lazy(() => import("@/pages/SocialMediaScheduler"));
const InfluencerBlog          = lazy(() => import("@/pages/InfluencerBlog"));
const Analytics               = lazy(() => import("@/pages/Analytics"));
const InfluencerAccountsPage  = lazy(() => import("@/pages/InfluencerAccountsPage"));
const InfluencerProfilePage   = lazy(() => import("@/pages/InfluencerProfilePage"));
const InfluencerBlogPage      = lazy(() => import("@/pages/InfluencerBlogPage"));
const InfluencerBlogsLinksPage= lazy(() => import("@/pages/InfluencerBlogsLinksPage"));
const SchedulePostsPage       = lazy(() => import("@/pages/SchedulePostsPage"));
const ApprovalDashboardPage   = lazy(() => import("@/pages/ApprovalDashboardPage"));
const PerformanceReportPage   = lazy(() => import("@/pages/PerformanceReportPage"));
const AITrainingDashboardPage = lazy(() => import("@/pages/AITrainingDashboardPage"));
const WhatsAppAISetupPage     = lazy(() => import("@/pages/WhatsAppAISetupPage"));
const WhatsAppBaileysSimplePage  = lazy(() => import("./pages/WhatsAppBaileysSimplePage"));
const WhatsAppNotificationsPage  = lazy(() => import("./pages/WhatsAppNotificationsPage"));
const AssetLibraryPage        = lazy(() => import("@/pages/AssetLibraryPage"));
const TrayDudaPage            = lazy(() => import("@/pages/TrayDudaPage"));
const HailuoImagePage         = lazy(() => import("@/pages/HailuoImagePage"));
const GerarVideoPage          = lazy(() => import("@/pages/GerarVideoPage"));
const MlGabiPage              = lazy(() => import("@/pages/MlGabiPage"));
const ShopeeLuizaPage         = lazy(() => import("@/pages/ShopeeLuizaPage"));
const AmazonAlicePage         = lazy(() => import("@/pages/AmazonAlicePage"));
const SheinIsabelaPage        = lazy(() => import("@/pages/SheinIsabelaPage"));
const TrayAnyPage             = lazy(() => import("@/pages/TrayAnyPage"));
const MarketingTeamPage       = lazy(() => import("@/pages/MarketingTeamPage"));
const AfiliadasPage           = lazy(() => import("@/pages/AfiliadasPage"));
const BrandBookPage           = lazy(() => import("@/pages/BrandBookPage"));
const TiktokLivePage          = lazy(() => import("@/pages/TiktokLivePage"));
const AdsManagerPage          = lazy(() => import("@/pages/AdsManagerPage"));
const MlAdsManagerPage        = lazy(() => import("@/pages/MlAdsManagerPage"));
const BlogFeminnitaPage       = lazy(() => import("@/pages/BlogFeminnitaPage"));
const TrafficManagerPage      = lazy(() => import("@/pages/TrafficManagerPage"));
const GA4Page                 = lazy(() => import("@/pages/GA4Page"));
const AgentActionsPage        = lazy(() => import("@/pages/AgentActionsPage"));
const AgentDetailPage         = lazy(() => import("@/pages/AgentDetailPage"));
const WhatsAppDisparosPage    = lazy(() => import("@/pages/WhatsAppDisparosPage"));
const WhatsAppFunnelPage      = lazy(() => import("@/pages/WhatsAppFunnelPage"));
const ShopeeAdsManagerPage    = lazy(() => import("@/pages/ShopeeAdsManagerPage"));
const TiktokShopPage          = lazy(() => import("@/pages/TiktokShopPage"));
const TiktokTeamPage          = lazy(() => import("@/pages/TiktokTeamPage"));
const TiktokAffiliateCRMPage  = lazy(() => import("@/pages/TiktokAffiliateCRMPage"));
const TranscricaoReuniaoPage  = lazy(() => import("@/pages/TranscricaoReuniaoPage"));
const AmazonPage              = lazy(() => import("@/pages/AmazonPage"));
const SpecialistsPage         = lazy(() => import("@/pages/SpecialistsPage"));
const PublicInfluencerBlog    = lazy(() => import("@/pages/PublicInfluencerBlog"));
const MorningBriefingPage     = lazy(() => import("@/pages/MorningBriefingPage"));
const TiktokAgentPage         = lazy(() => import("@/pages/TiktokAgentPage"));
const ChatPage                = lazy(() => import("@/pages/ChatPage"));
const PortalLoginPage         = lazy(() => import("@/pages/PortalLoginPage"));
const PortalSolicitarAcessoPage = lazy(() => import("@/pages/PortalSolicitarAcessoPage"));
const PortalMateriaisPage     = lazy(() => import("@/pages/PortalMateriaisPage"));
const GestaoPortalPage        = lazy(() => import("@/pages/GestaoPortalPage"));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-500">Carregando...</p>
      </div>
    </div>
  );
}

export default function App() {
  const [location] = useLocation();

  // Rota de chat popup (sem sidebar)
  if (location === "/chat") {
    return (
      <Suspense fallback={<div style={{ height: "100vh", background: "#0f172a" }} />}>
        <ChatPage />
      </Suspense>
    );
  }

  // Rotas de autenticação (sem layout)
  if (location === "/login" || location === "/signup") {
    return (
      <>
        <LoginSignup />
        <Toaster />
      </>
    );
  }

  // Rotas do portal (sem layout do dashboard)
  if (location === "/portal/login" || location === "/portal/solicitar-acesso" || location === "/portal/materiais") {
    const portalPage = () => {
      if (location === "/portal/login") return <PortalLoginPage />;
      if (location === "/portal/solicitar-acesso") return <PortalSolicitarAcessoPage />;
      return <PortalMateriaisPage />;
    };
    return (
      <Suspense fallback={<div style={{ height: "100vh", background: "#fff5f5" }} />}>
        {portalPage()}
        <Toaster />
      </Suspense>
    );
  }

  // Rotas públicas que não requerem autenticação
  const publicRoutes = ["/termos", "/privacidade", "/privacy", "/terms", "/blog-publico"];
  const isPublicRoute =
    publicRoutes.includes(location) ||
    /^\/blog-publico(\/\d+)?$/.test(location);

  const getPageComponent = () => {
    switch (location) {
      // Rotas públicas
      case "/termos":
        return <TermosServico />;
      case "/privacidade":
        return <Privacidade />;
      case "/privacy":
        return <PrivacyPolicy />;
      case "/terms":
        return <TermsOfService />;
      case "/blog-publico":
        return <InfluencerBlogsLinksPage />;
      // Rotas autenticadas
      case "/":
        return <Home />;
      case "/integraciones":
        return <Integrations />;
      case "/integration-guide":
        return <IntegrationGuide />;
      case "/performance":
        return <Performance />;
      case "/automaciones":
        return <Automations />;
      case "/campanhas":
        return <Campaigns />;
      case "/influenciadoras":
        return <InfluencersDashboard />;
      case "/meta-ads-campaigns":
        return <MetaAdsCampaigns />;
      case "/instagram":
        return <InstagramDashboard />;
      case "/meta-ads-dashboard":
        return <MetaAdsDashboard />;
      case "/agendador-postagens":
        return <SocialMediaScheduler />;
      case "/oauth-credentials":
        return <OAuthCredentials />;
      case "/colaboradores":
        return <CollaboratorsManagement />;
      case "/configurar-credenciais":
        return <ConfigureCredentials />;
      case "/login":
        return <LoginSignup />;
      case "/signup":
        return <LoginSignup />;
      case "/configurar-integracao":
        return <IntegrationSetup />;
      case "/canva-oauth":
        return <CanvaOAuth />;
      case "/api/canva/callback":
        return <CanvaOAuth />;
      case "/knowledge-center":
        return <KnowledgeCenterPage />;
      case "/meta-capi-setup":
        return <MetaCapiSetup />;
      case "/social-media-scheduler":
        return <SocialMediaScheduler />;
      case "/blog-influencers":
        return <InfluencerBlog />;
      case "/analytics":
        return <Analytics />;
      case "/contas-influenciadoras":
        return <InfluencerAccountsPage />;
      case "/blogs-externos":
        return <InfluencerBlogsLinksPage />;
      case "/agendar-posts":
        return <SchedulePostsPage />;
      case "/dashboard-aprovacao":
        return <ApprovalDashboardPage />;
      case "/relatorio-performance":
        return <PerformanceReportPage />;
      case "/ia-treinamento":
        return <AITrainingDashboardPage />;
      case "/whatsapp-setup":
        return <WhatsAppAISetupPage />;
      case "/whatsapp-baileys":
        return <WhatsAppBaileysSimplePage />;
      case "/whatsapp-notifications":
        return <WhatsAppNotificationsPage />;
      case "/whatsapp-disparos":
        return <WhatsAppDisparosPage />;
      case "/whatsapp-funnel":
        return <WhatsAppFunnelPage />;

      case "/duda-seo":
        return <TrayDudaPage />;
      case "/ml-gabi":
        return <MlGabiPage />;
      case "/shopee-luiza":
        return <ShopeeLuizaPage />;
      case "/amazon-alice":
        return <AmazonAlicePage />;
      case "/shein-isabela":
        return <SheinIsabelaPage />;
      case "/any-afiliadas":
        return <TrayAnyPage />;
      case "/equipe-marketing":
        return <MarketingTeamPage />;
      case "/afiliadas":
        return <AfiliadasPage />;
      case "/brand-book":
        return <BrandBookPage />;
      case "/tiktok-live":
        return <TiktokLivePage />;
      case "/gestor-trafego":
        return <AdsManagerPage />;
      case "/ml-ads":
        return <MlAdsManagerPage />;
      case "/blog-feminnita":
        return <BlogFeminnitaPage />;
      case "/traffic-manager":
        return <TrafficManagerPage />;
      case "/ga4":
        return <GA4Page />;
      case "/acoes-agentes":
        return <AgentActionsPage />;
      case "/shopee-ads":
        return <ShopeeAdsManagerPage />;
      case "/tiktok-shop":
        return <TiktokShopPage />;
      case "/tiktok-team":
        return <TiktokTeamPage />;
      case "/tiktok-afiliados":
        return <TiktokAffiliateCRMPage />;
      case "/transcricao-reuniao":
        return <TranscricaoReuniaoPage />;
      case "/amazon":
        return <AmazonPage />;
      case "/especialistas":
        return <SpecialistsPage />;
      case "/briefing":
        return <MorningBriefingPage />;
      case "/gerar-imagem":
        return <HailuoImagePage />;
      case "/gerar-video":
        return <GerarVideoPage />;
      case "/chat":
        return <ChatPage />;
      case "/asset-library":
        return <AssetLibraryPage />;
      case "/gestao-portal":
        return <GestaoPortalPage />;
      default: {
        if (/^\/influenciadora\/\d+$/.test(location)) {
          return <InfluencerProfilePage />;
        }
        if (/^\/blog\/\d+$/.test(location)) {
          return <InfluencerBlogPage />;
        }
        if (/^\/blog-publico\/\d+$/.test(location)) {
          return <PublicInfluencerBlog />;
        }
        if (/^\/agente\/(sofia|clara|mariana)$/.test(location)) {
          const agentName = location.split("/").pop()!;
          return <AgentDetailPage agentName={agentName} />;
        }
        if (/^\/tiktok\/(luna|maya|zara|nina|marcela)$/.test(location)) {
          const agentName = location.split("/").pop()!;
          return <TiktokAgentPage agentName={agentName} />;
        }
        return <Home />;
      }
    }
  };

  if (isPublicRoute) {
    return (
      <>
        <PublicLayout>
          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              {getPageComponent()}
            </Suspense>
          </ErrorBoundary>
        </PublicLayout>
        <Toaster />
      </>
    );
  }

  return (
    <>
      <DashboardLayout>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader />}>
            {getPageComponent()}
          </Suspense>
        </ErrorBoundary>
      </DashboardLayout>
      <Toaster />
    </>
  );
}
