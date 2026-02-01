import { useLocation, Link } from "wouter";
import DashboardLayout from "@/components/DashboardLayout";
import Home from "@/pages/Home";
import Integrations from "@/pages/Integrations";
import Performance from "@/pages/Performance";
import Automations from "@/pages/Automations";

export default function App() {
  const [location] = useLocation();

  const getPageComponent = () => {
    switch (location) {
      case "/":
        return <Home />;
      case "/integraciones":
        return <Integrations />;
      case "/performance":
        return <Performance />;
      case "/automaciones":
        return <Automations />;
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
