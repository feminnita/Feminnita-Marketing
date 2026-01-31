import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Heart, Eye, DollarSign, Target, AlertCircle, CheckCircle, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";

export default function DashboardUnificadoSection() {
  const [timeRange, setTimeRange] = useState("7d");

  const kpis = [
    {
      title: "Seguidores Totais",
      value: "123K",
      change: "+12.5%",
      trend: "up",
      icon: Users,
      color: "blue",
      breakdown: "Instagram: 45K | TikTok: 78K",
    },
    {
      title: "Engajamento Médio",
      value: "13.4%",
      change: "+2.1%",
      trend: "up",
      icon: Heart,
      color: "pink",
      breakdown: "Instagram: 12.5% | TikTok: 14.3%",
    },
    {
      title: "Visualizações (Semana)",
      value: "2.8M",
      change: "+35%",
      trend: "up",
      icon: Eye,
      color: "purple",
      breakdown: "Instagram: 1.2M | TikTok: 1.6M",
    },
    {
      title: "Conversão Estimada",
      value: "8.2%",
      change: "+1.5%",
      trend: "up",
      icon: Target,
      color: "green",
      breakdown: "Leads: 2.3K | Vendas: 189",
    },
    {
      title: "ROI de Marketing",
      value: "340%",
      change: "+45%",
      trend: "up",
      icon: DollarSign,
      color: "emerald",
      breakdown: "Investimento: R$ 5K | Retorno: R$ 17K",
    },
    {
      title: "Crescimento Mensal",
      value: "+15%",
      change: "+3%",
      trend: "up",
      icon: TrendingUp,
      color: "orange",
      breakdown: "Mês anterior: +12% | Tendência: Aceleração",
    },
  ];

  const alerts = [
    {
      type: "success",
      title: "Meta de Seguidores Atingida",
      description: "Você atingiu 123K seguidores! Próxima meta: 150K",
      time: "há 2 horas",
    },
    {
      type: "warning",
      title: "Engajamento em Queda",
      description: "Engajamento caiu 5% nos últimos 2 dias. Verifique conteúdo.",
      time: "há 4 horas",
    },
    {
      type: "success",
      title: "Novo Trend em Alta",
      description: "#PijamaChallenge está em trending. Aproveite agora!",
      time: "há 6 horas",
    },
    {
      type: "info",
      title: "Relatório Semanal Pronto",
      description: "Seu relatório de performance está disponível para download",
      time: "há 1 dia",
    },
  ];

  const performanceByPersona = [
    {
      persona: "Carol",
      followers: 28000,
      engagement: 12.8,
      posts: 45,
      avgLikes: 3584,
      trend: "+18%",
    },
    {
      persona: "Renata",
      followers: 32000,
      engagement: 11.2,
      posts: 38,
      avgLikes: 3584,
      trend: "+12%",
    },
    {
      persona: "Vanessa",
      followers: 31000,
      engagement: 13.5,
      posts: 42,
      avgLikes: 4185,
      trend: "+22%",
    },
    {
      persona: "Luiza",
      followers: 32000,
      engagement: 14.8,
      posts: 48,
      avgLikes: 4736,
      trend: "+28%",
    },
  ];

  const topContent = [
    {
      title: "Transformação Look Dia/Noite",
      platform: "TikTok",
      views: 125000,
      likes: 18750,
      engagement: 15,
      persona: "Luiza",
    },
    {
      title: "Quanto Ganhei em Um Dia",
      platform: "Instagram Reels",
      views: 85000,
      likes: 10625,
      engagement: 12.5,
      persona: "Carol",
    },
    {
      title: "Compra Coletiva Economizando R$ 500",
      platform: "Instagram Reels",
      views: 72000,
      likes: 9720,
      engagement: 13.5,
      persona: "Vanessa",
    },
    {
      title: "Por que Feminnita é Melhor",
      platform: "Instagram Feed",
      views: 45000,
      likes: 4500,
      engagement: 10,
      persona: "Renata",
    },
  ];

  const conversationFunnel = [
    { stage: "Visualizações", value: "2.8M", percentage: 100 },
    { stage: "Cliques no Link", value: "224K", percentage: 8 },
    { stage: "Visitantes Site", value: "156K", percentage: 5.6 },
    { stage: "Leads Capturados", value: "2.3K", percentage: 0.08 },
    { stage: "Vendas Realizadas", value: "189", percentage: 0.007 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard Unificado</h2>
        <p className="text-slate-600">Visão executiva de todos os KPIs e performance</p>
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2">
        {["7d", "30d", "90d", "1y"].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              timeRange === range
                ? "bg-pink-500 text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            {range === "7d" ? "7 dias" : range === "30d" ? "30 dias" : range === "90d" ? "90 dias" : "1 ano"}
          </button>
        ))}
      </div>

      {/* Main KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi, idx) => {
          const IconComponent = kpi.icon;
          return (
            <Card key={idx} className="hover:shadow-lg transition">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">{kpi.title}</p>
                    <p className="text-3xl font-bold text-slate-900">{kpi.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-${kpi.color}-100`}>
                    <IconComponent className={`w-6 h-6 text-${kpi.color}-600`} />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                    <ArrowUp className="w-4 h-4" />
                    {kpi.change}
                  </span>
                  <span className="text-xs text-slate-500">{kpi.breakdown}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts & Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Alertas & Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {alerts.map((alert, idx) => (
            <div key={idx} className={`border-l-4 p-4 rounded ${
              alert.type === "success" ? "border-green-500 bg-green-50" :
              alert.type === "warning" ? "border-yellow-500 bg-yellow-50" :
              "border-blue-500 bg-blue-50"
            }`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{alert.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{alert.description}</p>
                </div>
                {alert.type === "success" && <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />}
              </div>
              <p className="text-xs text-slate-500 mt-2">{alert.time}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Performance by Persona */}
      <Card>
        <CardHeader>
          <CardTitle>Performance por Persona</CardTitle>
          <CardDescription>Comparativo de cada persona</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold">Persona</th>
                  <th className="text-center py-3 px-4 font-semibold">Seguidores</th>
                  <th className="text-center py-3 px-4 font-semibold">Engajamento</th>
                  <th className="text-center py-3 px-4 font-semibold">Posts</th>
                  <th className="text-center py-3 px-4 font-semibold">Média Likes</th>
                  <th className="text-center py-3 px-4 font-semibold">Crescimento</th>
                </tr>
              </thead>
              <tbody>
                {performanceByPersona.map((p, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4 font-semibold">{p.persona}</td>
                    <td className="text-center py-3 px-4">{(p.followers / 1000).toFixed(0)}K</td>
                    <td className="text-center py-3 px-4 font-semibold text-pink-600">{p.engagement}%</td>
                    <td className="text-center py-3 px-4">{p.posts}</td>
                    <td className="text-center py-3 px-4">{(p.avgLikes / 1000).toFixed(1)}K</td>
                    <td className="text-center py-3 px-4 font-semibold text-green-600">{p.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Content */}
      <Card>
        <CardHeader>
          <CardTitle>Conteúdo com Melhor Performance</CardTitle>
          <CardDescription>Top 4 posts da semana</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topContent.map((content, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{content.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{content.platform}</Badge>
                      <Badge className="bg-pink-100 text-pink-800">{content.persona}</Badge>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-green-600">{content.engagement}%</span>
                </div>
                <div className="grid grid-cols-3 gap-4 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-600">Visualizações</p>
                    <p className="font-bold text-slate-900">{(content.views / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Likes</p>
                    <p className="font-bold text-slate-900">{(content.likes / 1000).toFixed(1)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Engajamento</p>
                    <p className="font-bold text-slate-900">{content.engagement}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle>Funil de Conversão</CardTitle>
          <CardDescription>De visualizações a vendas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {conversationFunnel.map((stage, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-slate-900">{stage.stage}</p>
                <span className="text-sm font-bold text-slate-700">{stage.value} ({stage.percentage.toFixed(2)}%)</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full"
                  style={{ width: `${stage.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📊 Exportar Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-3">
          <button className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium">
            📥 Baixar PDF
          </button>
          <button className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium">
            📊 Exportar Excel
          </button>
          <button className="flex-1 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-medium">
            📧 Enviar por Email
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
