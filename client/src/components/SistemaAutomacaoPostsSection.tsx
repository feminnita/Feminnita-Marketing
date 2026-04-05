import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertCircle, Zap, Calendar, Send, Pause, Trash2, Edit } from "lucide-react";
import { useState } from "react";

export default function SistemaAutomacaoPostsSection() {
  const [automatedPosts, setAutomatedPosts] = useState([
    {
      id: 1,
      title: "Quanto Ganhei Hoje Vendendo Pijamas",
      persona: "Carol",
      platform: "Instagram Reels",
      scheduledTime: "2026-02-01 19:00",
      status: "Agendado",
      content: "Roteiro de vídeo + Caption automática",
      hashtags: "#RendaExtra #PrimeiroNegócio #FeminnitaLucro",
      expectedViews: "3.2K",
      expectedEngagement: "11.8%",
    },
    {
      id: 2,
      title: "Transformação Look Dia/Noite",
      persona: "Luiza",
      platform: "TikTok",
      scheduledTime: "2026-02-01 20:00",
      status: "Agendado",
      content: "Vídeo automático + Hook otimizado",
      hashtags: "#Loungewear #ModaTikTok #Viral",
      expectedViews: "15K",
      expectedEngagement: "14.2%",
    },
    {
      id: 3,
      title: "Análise: Por que Feminnita é Melhor",
      persona: "Renata",
      platform: "Instagram Feed",
      scheduledTime: "2026-02-02 09:00",
      status: "Agendado",
      content: "Carrossel + Caption profissional",
      hashtags: "#AtacadoDePijamas #FornecedorConfiável",
      expectedViews: "2.1K",
      expectedEngagement: "10.2%",
    },
    {
      id: 4,
      title: "Compra Coletiva Economizando R$ 500",
      persona: "Vanessa",
      platform: "Instagram Reels",
      scheduledTime: "2026-02-02 14:00",
      status: "Agendado",
      content: "Vídeo + CTA para grupo",
      hashtags: "#CompraColetiva #EconomiaFamiliar",
      expectedViews: "3.8K",
      expectedEngagement: "12.4%",
    },
  ]);

  const automationRules = [
    {
      id: 1,
      rule: "Postar quando trend #PijamaChallenge está em alta",
      frequency: "Automático",
      personas: ["Carol", "Luiza"],
      status: "Ativo",
      lastTriggered: "há 2 horas",
    },
    {
      id: 2,
      rule: "Postar a cada 4 horas (horários otimizados)",
      frequency: "4 em 4 horas",
      personas: ["Todas"],
      status: "Ativo",
      lastTriggered: "há 1 hora",
    },
    {
      id: 3,
      rule: "Postar quando engajamento cai abaixo de 10%",
      frequency: "Automático",
      personas: ["Carol", "Renata"],
      status: "Ativo",
      lastTriggered: "há 6 horas",
    },
    {
      id: 4,
      rule: "Responder comentários com IA em 5 minutos",
      frequency: "Contínuo",
      personas: ["Todas"],
      status: "Ativo",
      lastTriggered: "há 15 minutos",
    },
  ];

  const scheduledToday = automatedPosts.filter(p => p.scheduledTime.includes("2026-02-01"));
  const totalExpectedViews = scheduledToday.reduce((acc, p) => acc + parseInt(p.expectedViews), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Sistema de Automação de Posts</h2>
        <p className="text-slate-600">Agende posts nos horários otimizados e automatize com regras inteligentes</p>
      </div>

      {/* Disclaimer */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Posts de exemplo — conecte suas contas para automação real</p>
              <p className="text-sm text-slate-600 mt-1">
                Os posts agendados, visualizações esperadas e regras de automação abaixo são ilustrativos. Conecte suas contas do Instagram e TikTok para criar automações reais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Today's Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Posts Agendados para Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-sm text-slate-600">Posts Agendados</p>
              <p className="text-2xl font-bold text-slate-900">{scheduledToday.length}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-sm text-slate-600">Visualizações Esperadas</p>
              <p className="text-2xl font-bold text-slate-900">{(totalExpectedViews / 1000).toFixed(1)}K</p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-sm text-slate-600">Engajamento Médio</p>
              <p className="text-2xl font-bold text-slate-900">12.8%</p>
            </div>
          </div>

          <div className="space-y-3">
            {scheduledToday.map((post) => (
              <div key={post.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{post.title}</p>
                    <p className="text-sm text-slate-600 mt-1">{post.persona} • {post.platform}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">
                    <Clock className="w-3 h-3 mr-1" />
                    {post.scheduledTime.split(" ")[1]}
                  </Badge>
                </div>

                <div className="bg-slate-50 rounded p-3 mb-3 text-sm text-slate-700">
                  {post.content}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex gap-4 text-sm">
                    <span className="text-slate-600">👁️ {post.expectedViews}</span>
                    <span className="text-slate-600">❤️ {post.expectedEngagement}</span>
                  </div>
                  <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 rounded transition">
                      <Edit className="w-4 h-4 text-slate-600" />
                    </button>
                    <button className="p-2 hover:bg-slate-100 rounded transition">
                      <Pause className="w-4 h-4 text-slate-600" />
                    </button>
                    <button className="p-2 hover:bg-red-100 rounded transition">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Automation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Regras de Automação Ativas
          </CardTitle>
          <CardDescription>Condições que acionam posts automáticos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {automationRules.map((rule) => (
            <div key={rule.id} className="border border-slate-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-slate-900">{rule.rule}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{rule.frequency}</Badge>
                    <Badge className="bg-green-100 text-green-800">Ativo</Badge>
                  </div>
                </div>
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm">
                <span className="text-slate-600">Personas: {rule.personas.join(", ")}</span>
                <span className="text-slate-500">{rule.lastTriggered}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Schedule Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>Calendário de Posts (Próximos 7 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { date: "01 Feb", posts: 4, views: "22.5K", engagement: "12.8%" },
              { date: "02 Feb", posts: 3, views: "18.2K", engagement: "11.5%" },
              { date: "03 Feb", posts: 5, views: "28.5K", engagement: "13.2%" },
              { date: "04 Feb", posts: 4, views: "21.8K", engagement: "12.1%" },
              { date: "05 Feb", posts: 6, views: "35.2K", engagement: "14.5%" },
              { date: "06 Feb", posts: 4, views: "24.1K", engagement: "12.9%" },
              { date: "07 Feb", posts: 5, views: "29.8K", engagement: "13.8%" },
            ].map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-900">{day.date}</p>
                  <p className="text-sm text-slate-600">{day.posts} posts agendados</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-slate-700">
                    <strong>{day.views}</strong> views
                  </span>
                  <span className="text-slate-700">
                    <strong>{day.engagement}</strong> eng.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create New Automation */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Nova Automação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Tipo de Automação</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
              <option>Postar em horários otimizados</option>
              <option>Postar quando trend está em alta</option>
              <option>Postar quando engajamento cai</option>
              <option>Responder comentários com IA</option>
              <option>Enviar DM automática</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Personas</label>
            <div className="flex gap-2 flex-wrap">
              {["Carol", "Renata", "Vanessa", "Luiza"].map((persona) => (
                <button
                  key={persona}
                  className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                >
                  {persona}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Plataformas</label>
            <div className="flex gap-2 flex-wrap">
              {["Instagram", "TikTok", "WhatsApp"].map((platform) => (
                <button
                  key={platform}
                  className="px-3 py-1 border border-slate-300 rounded-lg hover:bg-slate-100 transition"
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition font-semibold flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" />
            Criar Automação
          </button>
        </CardContent>
      </Card>

      {/* Performance Stats */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">📊 Performance da Automação</CardTitle>
        </CardHeader>
        <CardContent className="text-green-900 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Posts Automatizados</p>
              <p className="text-2xl font-bold">156</p>
              <p className="text-xs mt-1">nos últimos 30 dias</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Taxa de Sucesso</p>
              <p className="text-2xl font-bold">98.7%</p>
              <p className="text-xs mt-1">sem erros</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Tempo Economizado</p>
              <p className="text-2xl font-bold">42h</p>
              <p className="text-xs mt-1">por mês</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Engajamento Médio</p>
              <p className="text-2xl font-bold">13.2%</p>
              <p className="text-xs mt-1">acima da média</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
