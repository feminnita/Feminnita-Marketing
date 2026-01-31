import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Eye, Heart, MessageCircle, Share2, Clock, Target } from "lucide-react";

export default function DashboardTendenciasViraisSection() {
  const trends = [
    {
      id: 1,
      trend: "#PijamaChallenge",
      platform: "TikTok",
      views: 2500000,
      engagement: 12.5,
      growth: "+45%",
      persona: "Luiza",
      status: "🔥 Viral",
      description: "Desafio de dança com pijama - pessoas mostram transformação",
      bestTime: "19h-22h",
      duration: "15-30 seg",
      cta: "Participe do desafio!",
    },
    {
      id: 2,
      trend: "#RendaExtraEmCasa",
      platform: "Instagram",
      views: 1800000,
      engagement: 8.3,
      growth: "+32%",
      persona: "Carol",
      status: "🔥 Viral",
      description: "Histórias de sucesso de mulheres ganhando renda extra",
      bestTime: "10h-12h",
      duration: "30-60 seg",
      cta: "Veja minha história!",
    },
    {
      id: 3,
      trend: "#FamiliaUnida",
      platform: "Instagram",
      views: 1200000,
      engagement: 9.7,
      growth: "+28%",
      persona: "Vanessa",
      status: "📈 Crescendo",
      description: "Momentos em família usando pijamas coordenados",
      bestTime: "20h-21h",
      duration: "45-90 seg",
      cta: "Compartilhe seu momento!",
    },
    {
      id: 4,
      trend: "#LoungewearTrend",
      platform: "TikTok",
      views: 3200000,
      engagement: 14.2,
      growth: "+67%",
      persona: "Luiza",
      status: "🔥 Viral",
      description: "Pijama que você pode usar na rua - moda conforto",
      bestTime: "18h-20h",
      duration: "20-45 seg",
      cta: "Mostre seu look!",
    },
    {
      id: 5,
      trend: "#AcabeiDeRicoDePijama",
      platform: "TikTok",
      views: 890000,
      engagement: 11.3,
      growth: "+52%",
      persona: "Carol",
      status: "🔥 Viral",
      description: "Mulheres mostrando quanto ganharam vendendo pijamas",
      bestTime: "19h-21h",
      duration: "15-30 seg",
      cta: "Veja quanto ganhei!",
    },
    {
      id: 6,
      trend: "#CompraColetivaPijama",
      platform: "Instagram",
      views: 650000,
      engagement: 7.8,
      growth: "+18%",
      persona: "Vanessa",
      status: "📈 Crescendo",
      description: "Grupos de amigas fazendo compra coletiva",
      bestTime: "14h-16h",
      duration: "60-120 seg",
      cta: "Junte-se ao grupo!",
    },
  ];

  const viralTips = [
    {
      tip: "Poste nos horários de pico",
      description: "19h-22h (TikTok) e 10h-12h + 20h-21h (Instagram)",
    },
    {
      tip: "Use sons virais",
      description: "Acompanhe sons que estão em alta no TikTok",
    },
    {
      tip: "Crie hooks nos primeiros 3 segundos",
      description: "Capture atenção imediatamente",
    },
    {
      tip: "Use hashtags estratégicas",
      description: "Misture hashtags virais com nichos específicos",
    },
    {
      tip: "Responda comentários rápido",
      description: "Aumenta engajamento e algoritmo favorece",
    },
    {
      tip: "Faça colaborações",
      description: "Parcerias com outras contas aumentam alcance",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard de Tendências Virais</h2>
        <p className="text-slate-600">Acompanhe trends em tempo real e saiba qual persona deveria aproveitar cada uma</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Trends Ativos</p>
                <p className="text-2xl font-bold text-slate-900">6</p>
              </div>
              <TrendingUp className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Visualizações</p>
                <p className="text-2xl font-bold text-slate-900">9.3M</p>
              </div>
              <Eye className="w-5 h-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Engajamento Médio</p>
                <p className="text-2xl font-bold text-slate-900">10.6%</p>
              </div>
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Crescimento Médio</p>
                <p className="text-2xl font-bold text-slate-900">+40%</p>
              </div>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trends em Alta Agora
          </CardTitle>
          <CardDescription>Classifique por plataforma e persona</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.map((trend) => (
              <div key={trend.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-bold text-slate-900">{trend.trend}</h3>
                      <Badge className="bg-pink-100 text-pink-800">{trend.status}</Badge>
                      <Badge variant="outline">{trend.platform}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{trend.description}</p>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-4 mb-4 py-3 border-y border-slate-100">
                  <div>
                    <p className="text-xs text-slate-600">Visualizações</p>
                    <p className="font-bold text-slate-900">{(trend.views / 1000000).toFixed(1)}M</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Engajamento</p>
                    <p className="font-bold text-slate-900">{trend.engagement}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Crescimento</p>
                    <p className="font-bold text-green-600">{trend.growth}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Persona Ideal</p>
                    <p className="font-bold text-slate-900">{trend.persona}</p>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span className="text-slate-700">Melhor horário: {trend.bestTime}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-500" />
                    <span className="text-slate-700">Duração: {trend.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Share2 className="w-4 h-4 text-green-500" />
                    <span className="text-slate-700">CTA: {trend.cta}</span>
                  </div>
                </div>

                {/* Action */}
                <button className="w-full py-2 bg-pink-500 text-white rounded hover:bg-pink-600 transition font-medium text-sm">
                  Usar este Trend
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Viral Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Dicas para Viralizar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {viralTips.map((item, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <p className="font-semibold text-slate-900 mb-2">💡 {item.tip}</p>
                <p className="text-sm text-slate-600">{item.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">✨ Fórmula do Sucesso Viral</CardTitle>
        </CardHeader>
        <CardContent className="text-green-900 space-y-3">
          <div className="space-y-2">
            <p className="font-semibold">1. Hook Irresistível (0-3 seg)</p>
            <p className="text-sm">Capture atenção com pergunta, estatística ou visual impactante</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">2. Conteúdo Autêntico (3-20 seg)</p>
            <p className="text-sm">Mostre resultado real, história verdadeira ou transformação</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">3. Call-to-Action Claro (20-30 seg)</p>
            <p className="text-sm">Peça para comentar, compartilhar, seguir ou clicar no link</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">4. Engajamento Imediato</p>
            <p className="text-sm">Responda comentários nos primeiros 30 minutos</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
