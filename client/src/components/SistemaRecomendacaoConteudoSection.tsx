import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, Zap, Target, Brain, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function SistemaRecomendacaoConteudoSection() {
  const [selectedRecommendation, setSelectedRecommendation] = useState(0);

  const recommendations = [
    {
      id: 1,
      title: "Quanto Ganhei Vendendo Pijamas",
      persona: "Carol",
      platform: "TikTok",
      trend: "#MoneyChallenge",
      confidence: 94,
      expectedViews: "45K",
      expectedEngagement: "14.2%",
      reason: "Alta demanda por conteúdo de renda extra + trend em alta",
      bestTime: "19:00 - 21:00",
      duration: "15-30s",
    },
    {
      id: 2,
      title: "Transformação Look Dia/Noite",
      persona: "Luiza",
      platform: "Instagram Reels",
      trend: "#TransformationChallenge",
      confidence: 91,
      expectedViews: "38K",
      expectedEngagement: "13.8%",
      reason: "Trend viral + persona com alto engajamento",
      bestTime: "20:00 - 22:00",
      duration: "30-45s",
    },
    {
      id: 3,
      title: "Por que Feminnita é Melhor",
      persona: "Renata",
      platform: "Instagram Feed",
      trend: "#ProductComparison",
      confidence: 87,
      expectedViews: "28K",
      expectedEngagement: "11.5%",
      reason: "Conteúdo educativo + público B2B receptivo",
      bestTime: "09:00 - 11:00",
      duration: "Carrossel",
    },
    {
      id: 4,
      title: "Compra Coletiva Economizando R$ 500",
      persona: "Vanessa",
      platform: "TikTok",
      trend: "#GroupBuying",
      confidence: 89,
      expectedViews: "52K",
      expectedEngagement: "15.1%",
      reason: "Trend emergente + persona com comunidade ativa",
      bestTime: "18:00 - 20:00",
      duration: "20-40s",
    },
  ];

  const currentRec = recommendations[selectedRecommendation];

  const trendingNow = [
    { trend: "#PijamaChallenge", platform: "TikTok", views: "2.3M", growth: "+125%", personas: ["Carol", "Luiza"] },
    { trend: "#ComfyStyle", platform: "Instagram", views: "1.8M", growth: "+89%", personas: ["Vanessa", "Renata"] },
    { trend: "#MoneyChallenge", platform: "TikTok", views: "3.1M", growth: "+156%", personas: ["Carol"] },
    { trend: "#TransformationChallenge", platform: "Instagram", views: "2.5M", growth: "+112%", personas: ["Luiza"] },
    { trend: "#GroupBuying", platform: "TikTok", views: "890K", growth: "+234%", personas: ["Vanessa"] },
    { trend: "#ProductReview", platform: "YouTube", views: "1.2M", growth: "+78%", personas: ["Renata"] },
  ];

  const performanceHistory = [
    { date: "01 Feb", posted: 4, avgViews: "32K", avgEngagement: "12.8%", topPerformer: "Luiza" },
    { date: "02 Feb", posted: 3, avgViews: "28K", avgEngagement: "11.5%", topPerformer: "Carol" },
    { date: "03 Feb", posted: 5, avgViews: "35K", avgEngagement: "13.2%", topPerformer: "Vanessa" },
    { date: "04 Feb", posted: 4, avgViews: "31K", avgEngagement: "12.1%", topPerformer: "Luiza" },
    { date: "05 Feb", posted: 6, avgViews: "42K", avgEngagement: "14.5%", topPerformer: "Luiza" },
  ];

  const aiInsights = [
    {
      icon: "🎯",
      title: "Melhor Hora para Postar",
      description: "Baseado em análise de 500+ posts anteriores",
      data: currentRec.bestTime,
    },
    {
      icon: "📊",
      title: "Duração Ideal",
      description: "Otimizada para máximo engajamento",
      data: currentRec.duration,
    },
    {
      icon: "🔥",
      title: "Confiança da IA",
      description: "Probabilidade de sucesso",
      data: `${currentRec.confidence}%`,
    },
    {
      icon: "👥",
      title: "Público-Alvo",
      description: "Pessoas mais prováveis de engajar",
      data: "Mulheres 18-45 anos",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Sistema de Recomendação de Conteúdo com IA</h2>
        <p className="text-slate-600">IA sugere qual persona/conteúdo postar baseado em trends e performance histórica</p>
      </div>

      {/* Disclaimer */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Recomendações de exemplo — conecte sua conta para sugestões reais</p>
              <p className="text-sm text-slate-600 mt-1">
                As visualizações esperadas, taxas de engajamento e scores de confiança abaixo são estimativas ilustrativas. Conecte suas contas de redes sociais para recomendações baseadas nos seus dados reais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            Recomendações de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec, idx) => (
              <button
                key={rec.id}
                onClick={() => setSelectedRecommendation(idx)}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  selectedRecommendation === idx
                    ? "border-pink-500 bg-pink-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{rec.title}</p>
                    <p className="text-sm text-slate-600">{rec.persona} • {rec.platform}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{rec.confidence}%</Badge>
                </div>
                <p className="text-xs text-slate-500">Trend: {rec.trend}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Selected Recommendation Details */}
      <Card>
        <CardHeader>
          <CardTitle>{currentRec.title}</CardTitle>
          <CardDescription>{currentRec.persona} • {currentRec.platform}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Why This Recommendation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-1">💡 Por que esta recomendação?</p>
            <p className="text-sm text-blue-800">{currentRec.reason}</p>
          </div>

          {/* AI Insights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {aiInsights.map((insight, idx) => (
              <div key={idx} className="bg-slate-50 rounded-lg p-4 text-center">
                <p className="text-2xl mb-1">{insight.icon}</p>
                <p className="text-xs text-slate-600 mb-2">{insight.title}</p>
                <p className="font-bold text-slate-900">{insight.data}</p>
              </div>
            ))}
          </div>

          {/* Expected Performance */}
          <div className="grid grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Visualizações Esperadas</p>
              <p className="text-2xl font-bold text-slate-900">{currentRec.expectedViews}</p>
              <p className="text-xs text-green-600 mt-1">+18% vs média</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Engajamento Esperado</p>
              <p className="text-2xl font-bold text-slate-900">{currentRec.expectedEngagement}</p>
              <p className="text-xs text-green-600 mt-1">+12% vs média</p>
            </div>
          </div>

          {/* Action Button */}
          <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition font-semibold flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" />
            Usar Esta Recomendação
          </button>
        </CardContent>
      </Card>

      {/* Trending Now */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trends em Alta Agora
          </CardTitle>
          <CardDescription>Oportunidades para cada persona</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trendingNow.map((trend, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{trend.trend}</p>
                    <p className="text-sm text-slate-600">{trend.platform}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{trend.growth}</Badge>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm">
                  <span className="text-slate-600">
                    <strong>{trend.views}</strong> views
                  </span>
                  <div className="flex gap-1">
                    {trend.personas.map((persona) => (
                      <Badge key={persona} variant="outline" className="text-xs">
                        {persona}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Performance</CardTitle>
          <CardDescription>Últimos 5 dias com recomendações IA</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performanceHistory.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-900">{day.date}</p>
                  <p className="text-sm text-slate-600">{day.posted} posts com IA</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-slate-700">
                    <strong>{day.avgViews}</strong> views
                  </span>
                  <span className="text-slate-700">
                    <strong>{day.avgEngagement}</strong> eng.
                  </span>
                  <span className="text-slate-700">
                    Top: <strong>{day.topPerformer}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações da IA</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5" />
              <div>
                <p className="font-medium text-slate-900">Recomendações em Tempo Real</p>
                <p className="text-sm text-slate-600">Receba sugestões conforme trends surgem</p>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5" />
              <div>
                <p className="font-medium text-slate-900">Notificações de Oportunidades</p>
                <p className="text-sm text-slate-600">Alerta quando trend está em pico de crescimento</p>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5" />
              <div>
                <p className="font-medium text-slate-900">Análise Automática de Concorrentes</p>
                <p className="text-sm text-slate-600">Monitore o que concorrentes estão postando</p>
              </div>
            </label>
          </div>

          <div>
            <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-5 h-5" />
              <div>
                <p className="font-medium text-slate-900">Sugestões Personalizadas por Persona</p>
                <p className="text-sm text-slate-600">IA aprende preferências de cada persona</p>
              </div>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* AI Performance */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">📊 Performance da IA</CardTitle>
        </CardHeader>
        <CardContent className="text-purple-900 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Acurácia de Recomendações</p>
              <p className="text-2xl font-bold">92.3%</p>
              <p className="text-xs mt-1">posts com sucesso</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Tempo Economizado</p>
              <p className="text-2xl font-bold">15h</p>
              <p className="text-xs mt-1">por mês em planejamento</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Aumento de Engajamento</p>
              <p className="text-2xl font-bold">+34%</p>
              <p className="text-xs mt-1">vs sem recomendações</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Trends Identificadas</p>
              <p className="text-2xl font-bold">127</p>
              <p className="text-xs mt-1">este mês</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
