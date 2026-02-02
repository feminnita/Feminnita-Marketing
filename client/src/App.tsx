import { useLocation, Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
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


export default function App() {
  const [location] = useLocation();

  const getPageComponent = () => {
    switch (location) {
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

      default:
        return <Home />;
    }
  };

  return (
    <DashboardLayout>
      {getPageComponent()}
    </DashboardLayout>
  );
}
