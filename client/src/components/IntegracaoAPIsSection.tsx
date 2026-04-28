import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, Link2, Users, Heart, Eye, TrendingUp, Zap } from "lucide-react";

const PLATFORMS = [
  {
    name: "Instagram",
    handle: "@feminnita_pijamas",
    setupSteps: [
      "Acesse Meta for Developers → Create App → Business",
      "Ative Instagram Graph API, obtenha User Access Token",
      "Scopes necessários: instagram_basic, instagram_content_publish, pages_read_engagement",
    ],
    color: "pink",
  },
  {
    name: "TikTok",
    handle: "@feminnita.oficial",
    setupSteps: [
      "Acesse developers.tiktok.com → Create App",
      "Habilite Login Kit e Content Posting API",
      "Obtenha Client Key e Client Secret, configure redirect URI",
    ],
    color: "blue",
  },
];

const API_FEATURES = [
  { icon: <Users className="w-4 h-4 text-pink-600" />, titulo: "Seguidores em Tempo Real", desc: "Acompanhe crescimento diário de seguidores por plataforma" },
  { icon: <Heart className="w-4 h-4 text-red-600" />, titulo: "Taxa de Engajamento", desc: "Likes, comentários e saves — calculados automaticamente" },
  { icon: <Eye className="w-4 h-4 text-blue-600" />, titulo: "Alcance e Impressões", desc: "Visualizações semanais e alcance orgânico" },
  { icon: <TrendingUp className="w-4 h-4 text-green-600" />, titulo: "Trends em Alta", desc: "Hashtags e sons virais detectados automaticamente" },
];

export default function IntegracaoAPIsSection() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Integração Instagram / TikTok API</h2>
        <p className="text-slate-500 text-sm mt-1">Conecte suas contas e monitore dados em tempo real</p>
      </div>

      {/* Not connected notice */}
      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Métricas em tempo real (seguidores, engajamento, alcance) requerem conexão direta com a
            <strong> Instagram Graph API</strong> e <strong>TikTok API</strong>. Configure as credenciais abaixo para ativar.
          </p>
        </CardContent>
      </Card>

      {/* Platform setup guides */}
      <div className="grid md:grid-cols-2 gap-4">
        {PLATFORMS.map((platform) => (
          <Card key={platform.name} className="border-0 shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Link2 className="w-4 h-4" />
                  {platform.name}
                </CardTitle>
                <Badge variant="outline" className="text-xs text-slate-500">Não conectado</Badge>
              </div>
              <CardDescription className="text-xs">{platform.handle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                {platform.setupSteps.map((step, idx) => (
                  <div key={idx} className="flex gap-2 text-xs text-slate-600">
                    <span className="font-bold text-slate-400 flex-shrink-0">{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full text-sm" size="sm">
                Conectar {platform.name}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* What you get after connecting */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4" style={{ color: '#6B1D28' }} />
            O que você terá após conectar
          </CardTitle>
          <CardDescription className="text-xs">Dados sincronizados a cada 5 minutos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-3">
            {API_FEATURES.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
                {item.icon}
                <div>
                  <p className="text-sm font-medium text-slate-900">{item.titulo}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Endpoints disponíveis após conexão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            "/api/instagram/metrics — Seguidores, engajamento, alcance",
            "/api/tiktok/metrics — Visualizações, compartilhamentos, seguidores",
            "/api/trends/active — Hashtags e sons virais em alta",
            "/api/recommendations/posting — Melhor horário para publicar",
          ].map((endpoint, idx) => (
            <p key={idx} className="text-xs text-slate-600 font-mono bg-slate-50 px-3 py-2 rounded border border-slate-200">{endpoint}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
