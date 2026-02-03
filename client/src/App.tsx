import { useLocation, Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import Home from "@/pages/Home";
import PublicHome from "@/pages/PublicHome";
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
import PublicLayout from "@/components/PublicLayout";


export default function App() {
  const [location] = useLocation();

  // Rotas publicas que nao requerem autenticacao
  const publicRoutes = ["/", "/termos", "/privacidade"];
  const isPublicRoute = publicRoutes.includes(location);

  const getPageComponent = () => {
    switch (location) {
      case "/":
        return isPublicRoute ? <PublicHome /> : <Home />;
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
      case "/termos":
        return <TermosServico />;
      case "/privacidade":
        return <Privacidade />;

      default:
        return <Home />;
    }
  };

  // Se for rota publica, usar PublicLayout (sem autenticacao)
  if (isPublicRoute) {
    return (
      <PublicLayout>
        {getPageComponent()}
      </PublicLayout>
    );
  }

  // Caso contrario, usar DashboardLayout (com autenticacao)
  return (
    <DashboardLayout>
      {getPageComponent()}
    </DashboardLayout>
  );
}
