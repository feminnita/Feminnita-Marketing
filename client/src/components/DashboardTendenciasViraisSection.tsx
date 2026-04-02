import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Zap, Clock, Target, Share2, AlertCircle } from "lucide-react";

const trends = [
  {
    id: 1,
    trend: "#PijamaChallenge",
    platform: "TikTok",
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
    persona: "Vanessa",
    status: "📈 Crescendo",
    description: "Grupos de amigas fazendo compra coletiva",
    bestTime: "14h-16h",
    duration: "60-120 seg",
    cta: "Junte-se ao grupo!",
  },
];

const viralTips = [
  { tip: "Poste nos horários de pico", description: "19h-22h (TikTok) e 10h-12h + 20h-21h (Instagram)" },
  { tip: "Use sons virais", description: "Acompanhe sons que estão em alta no TikTok" },
  { tip: "Crie hooks nos primeiros 3 segundos", description: "Capture atenção imediatamente" },
  { tip: "Use hashtags estratégicas", description: "Misture hashtags virais com nichos específicos" },
  { tip: "Responda comentários rápido", description: "Aumenta engajamento e algoritmo favorece" },
  { tip: "Faça colaborações", description: "Parcerias com outras contas aumentam alcance" },
];

export default function DashboardTendenciasViraisSection() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard de Tendências Virais</h2>
        <p className="text-slate-600">Acompanhe trends relevantes para pijamas e saiba qual persona deveria aproveitar cada uma</p>
      </div>

      {/* Aviso */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Tendências de referência — verifique o status atual nas plataformas</p>
              <p className="text-sm text-slate-600 mt-1">
                As hashtags abaixo são exemplos de trends relevantes para o nicho de pijamas. Verifique no TikTok Creative Center e Instagram Trends quais estão realmente em alta agora antes de usar.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trending Topics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Trends de Referência
          </CardTitle>
          <CardDescription>Hashtags e formatos relevantes para o nicho de pijamas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {trends.map(trend => (
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

                <div className="grid grid-cols-3 gap-4 text-sm mb-4 border-t border-slate-100 pt-3">
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

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">👤 Persona ideal: <strong>{trend.persona}</strong></span>
                  <a
                    href={`https://www.tiktok.com/tag/${trend.trend.replace('#', '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Ver no TikTok →
                  </a>
                </div>
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

      {/* Links */}
      <div className="grid md:grid-cols-2 gap-3">
        <Card className="p-4">
          <h4 className="font-semibold text-sm mb-2">🎵 TikTok Creative Center</h4>
          <p className="text-xs text-slate-600 mb-3">Veja trends em alta agora no TikTok</p>
          <a href="https://ads.tiktok.com/business/creativecenter/inspiration/popular/hashtag/pc/en" target="_blank" rel="noopener noreferrer" className="block w-full text-center py-1.5 px-3 border border-slate-300 rounded text-xs hover:bg-slate-50 transition">
            Acessar →
          </a>
        </Card>
        <Card className="p-4">
          <h4 className="font-semibold text-sm mb-2">📷 Instagram Trends</h4>
          <p className="text-xs text-slate-600 mb-3">Explore reels e hashtags em alta no Instagram</p>
          <a href="https://www.instagram.com/explore/" target="_blank" rel="noopener noreferrer" className="block w-full text-center py-1.5 px-3 border border-slate-300 rounded text-xs hover:bg-slate-50 transition">
            Acessar →
          </a>
        </Card>
      </div>
    </div>
  );
}
