import { lazy, Suspense } from "react";
import { useLocation } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import PublicLayout from "@/components/PublicLayout";

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
const MarketingTeamPage       = lazy(() => import("@/pages/MarketingTeamPage"));
const AfiliadasPage           = lazy(() => import("@/pages/AfiliadasPage"));
const BrandBookPage           = lazy(() => import("@/pages/BrandBookPage"));
const TiktokLivePage          = lazy(() => import("@/pages/TiktokLivePage"));
const AdsManagerPage          = lazy(() => import("@/pages/AdsManagerPage"));

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

  // Rotas de autenticação (sem layout)
  if (location === "/login" || location === "/signup") {
    return <LoginSignup />;
  }

  // Rotas públicas que não requerem autenticação
  const publicRoutes = ["/termos", "/privacidade", "/privacy", "/terms"];
  const isPublicRoute = publicRoutes.includes(location);

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
      case "/banco-imagens":
        return <AssetLibraryPage />;
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
      default: {
        if (/^\/influenciadora\/\d+$/.test(location)) {
          return <InfluencerProfilePage />;
        }
        if (/^\/blog\/\d+$/.test(location)) {
          return <InfluencerBlogPage />;
        }
        return <Home />;
      }
    }
  };

  if (isPublicRoute) {
    return (
      <PublicLayout>
        <Suspense fallback={<PageLoader />}>
          {getPageComponent()}
        </Suspense>
      </PublicLayout>
    );
  }

  return (
    <DashboardLayout>
      <Suspense fallback={<PageLoader />}>
        {getPageComponent()}
      </Suspense>
    </DashboardLayout>
  );
}
