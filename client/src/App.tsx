import { useLocation, Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import PublicLayout from "@/components/PublicLayout";
import Home from "@/pages/Home";
import Integrations from "@/pages/Integrations";
import IntegrationGuide from "@/pages/IntegrationGuide";
import Performance from "@/pages/Performance";
import Automations from "@/pages/Automations";
import Campaigns from "@/pages/Campaigns";
import InfluencersDashboard from "@/pages/InfluencersDashboard";
import MetaAdsCampaigns from "@/pages/MetaAdsCampaigns";
import OAuthCredentials from "@/pages/OAuthCredentials";
import CollaboratorsManagement from "@/pages/CollaboratorsManagement";
import ConfigureCredentials from "@/pages/ConfigureCredentials";
import LoginSignup from "@/pages/LoginSignup";
import IntegrationSetup from "@/pages/IntegrationSetup";
import CanvaOAuth from "@/pages/CanvaOAuth";
import MetaCapiSetup from "@/pages/MetaCapiSetup";
import TermosServico from "@/pages/TermosServico";
import Privacidade from "@/pages/Privacidade";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import InstagramDashboard from "@/pages/InstagramDashboard";
import MetaAdsDashboard from "@/pages/MetaAdsDashboard";
import SocialMediaScheduler from "@/pages/SocialMediaScheduler";
import InfluencerBlog from "@/pages/InfluencerBlog";
import Analytics from "@/pages/Analytics";
import InfluencerAccountsPage from "@/pages/InfluencerAccountsPage";
import InfluencerProfilePage from "@/pages/InfluencerProfilePage";
import InfluencerBlogPage from "@/pages/InfluencerBlogPage";

export default function App() {
  const [location] = useLocation();

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
      
      // Rotas de perfis individuais de influenciadoras
      case /^\/influenciadora\/\d+$/.test(location) ? location : "":
        return <InfluencerProfilePage />;
      
      // Rotas de blogs das influenciadoras
      case /^\/blog\/\d+$/.test(location) ? location : "":
        return <InfluencerBlogPage />;

      default:
        return <Home />;
    }
  };

  // Use PublicLayout para rotas públicas, DashboardLayout para o resto
  if (isPublicRoute) {
    return <PublicLayout>{getPageComponent()}</PublicLayout>;
  }

  return (
    <DashboardLayout>
      {getPageComponent()}
    </DashboardLayout>
  );
}
