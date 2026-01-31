import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, TrendingUp, Users, Heart, Eye, Zap, Link2, Settings } from "lucide-react";
import { useState } from "react";

export default function IntegracaoAPIsSection() {
  const [connectedAccounts, setConnectedAccounts] = useState([
    {
      id: 1,
      platform: "Instagram",
      account: "feminnita_pijamas",
      followers: 45000,
      engagement: 12.5,
      status: "Conectado",
      lastSync: "há 2 minutos",
      connected: true,
    },
    {
      id: 2,
      platform: "TikTok",
      account: "feminnita.oficial",
      followers: 78000,
      engagement: 14.3,
      status: "Conectado",
      lastSync: "há 5 minutos",
      connected: true,
    },
  ]);

  const realTimeData = [
    {
      metric: "Novos Seguidores Hoje",
      value: 342,
      change: "+12%",
      platform: "Instagram",
      icon: Users,
    },
    {
      metric: "Engajamento Hoje",
      value: "13.2%",
      change: "+2.1%",
      platform: "TikTok",
      icon: Heart,
    },
    {
      metric: "Visualizações Hoje",
      value: "125K",
      change: "+45%",
      platform: "Instagram",
      icon: Eye,
    },
    {
      metric: "Trends em Alta",
      value: 6,
      change: "+2",
      platform: "Ambas",
      icon: TrendingUp,
    },
  ];

  const apiFeatures = [
    {
      id: 1,
      feature: "Monitoramento em Tempo Real",
      description: "Acompanhe seguidores, engajamento e trends ao vivo",
      status: "Ativo",
      data: "Atualizado a cada 5 minutos",
    },
    {
      id: 2,
      feature: "Análise de Trends",
      description: "Identifique trends virais automaticamente",
      status: "Ativo",
      data: "6 trends detectadas hoje",
    },
    {
      id: 3,
      feature: "Recomendações de Posting",
      description: "Sugestões de melhor horário para postar",
      status: "Ativo",
      data: "Baseado em dados históricos",
    },
    {
      id: 4,
      feature: "Análise de Concorrentes",
      description: "Monitore atividade de concorrentes",
      status: "Ativo",
      data: "4 concorrentes monitorados",
    },
    {
      id: 5,
      feature: "Alertas Automáticos",
      description: "Notificações de eventos importantes",
      status: "Ativo",
      data: "5 notificações ativas",
    },
    {
      id: 6,
      feature: "Exportação de Dados",
      description: "Baixe relatórios com dados da API",
      status: "Ativo",
      data: "CSV, PDF, Excel",
    },
  ];

  const instagramMetrics = [
    { name: "Seguidores", value: 45000, change: "+342 hoje" },
    { name: "Engajamento", value: "12.5%", change: "+0.8% hoje" },
    { name: "Alcance Semana", value: "245K", change: "+15%" },
    { name: "Impressões Semana", value: "1.2M", change: "+22%" },
    { name: "Salvos Semana", value: "8.5K", change: "+18%" },
    { name: "Compartilhamentos Semana", value: "3.2K", change: "+12%" },
  ];

  const tiktokMetrics = [
    { name: "Seguidores", value: 78000, change: "+512 hoje" },
    { name: "Engajamento", value: "14.3%", change: "+1.2% hoje" },
    { name: "Visualizações Semana", value: "2.8M", change: "+35%" },
    { name: "Compartilhamentos Semana", value: "125K", change: "+42%" },
    { name: "Comentários Semana", value: "45K", change: "+38%" },
    { name: "Salvos Semana", value: "92K", change: "+28%" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Integração com APIs Instagram/TikTok</h2>
        <p className="text-slate-600">Conecte suas contas e monitore dados em tempo real</p>
      </div>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5" />
            Contas Conectadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectedAccounts.map((account) => (
            <div key={account.id} className="border border-green-200 bg-green-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900">{account.platform}</h3>
                    <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {account.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600">@{account.account}</p>
                </div>
                <button className="text-slate-600 hover:text-slate-900">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-3 border-t border-green-200">
                <div>
                  <p className="text-xs text-slate-600">Seguidores</p>
                  <p className="font-bold text-slate-900">{(account.followers / 1000).toFixed(0)}K</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Engajamento</p>
                  <p className="font-bold text-slate-900">{account.engagement}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Última Sincronização</p>
                  <p className="font-bold text-slate-900">{account.lastSync}</p>
                </div>
              </div>
            </div>
          ))}
          <button className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:text-slate-900 hover:border-slate-400 transition font-medium">
            + Conectar Nova Conta
          </button>
        </CardContent>
      </Card>

      {/* Real-Time Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {realTimeData.map((data) => {
          const IconComponent = data.icon;
          return (
            <Card key={data.metric}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-xs text-slate-600 mb-1">{data.metric}</p>
                    <p className="text-2xl font-bold text-slate-900">{data.value}</p>
                  </div>
                  <IconComponent className="w-5 h-5 text-pink-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-green-600 font-semibold">{data.change}</span>
                  <Badge variant="outline" className="text-xs">{data.platform}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* API Features */}
      <Card>
        <CardHeader>
          <CardTitle>Funcionalidades Ativas</CardTitle>
          <CardDescription>O que você pode fazer com a integração</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {apiFeatures.map((feature) => (
              <div key={feature.id} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{feature.feature}</h3>
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
                <p className="text-sm text-slate-600 mb-2">{feature.description}</p>
                <p className="text-xs text-slate-500">📊 {feature.data}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Instagram Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>📸 Métricas Instagram (Tempo Real)</CardTitle>
          <CardDescription>Dados sincronizados da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {instagramMetrics.map((metric, idx) => (
              <div key={idx} className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
                <p className="text-xs text-slate-600 mb-1">{metric.name}</p>
                <p className="text-xl font-bold text-slate-900">{metric.value}</p>
                <p className="text-xs text-green-600 mt-1">📈 {metric.change}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TikTok Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>🎵 Métricas TikTok (Tempo Real)</CardTitle>
          <CardDescription>Dados sincronizados da sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {tiktokMetrics.map((metric, idx) => (
              <div key={idx} className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-4 border border-blue-200">
                <p className="text-xs text-slate-600 mb-1">{metric.name}</p>
                <p className="text-xl font-bold text-slate-900">{metric.value}</p>
                <p className="text-xs text-green-600 mt-1">📈 {metric.change}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sync Status */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Status de Sincronização
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-3">
          <div className="flex items-center justify-between">
            <span>Instagram</span>
            <Badge className="bg-green-100 text-green-800">Sincronizado (2 min atrás)</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span>TikTok</span>
            <Badge className="bg-green-100 text-green-800">Sincronizado (5 min atrás)</Badge>
          </div>
          <div className="pt-3 border-t border-blue-200">
            <p className="text-sm">Próxima sincronização automática em 3 minutos</p>
            <button className="mt-2 text-sm bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition">
              Sincronizar Agora
            </button>
          </div>
        </CardContent>
      </Card>

      {/* API Documentation */}
      <Card>
        <CardHeader>
          <CardTitle>📖 Documentação da API</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>Endpoints disponíveis:</p>
          <ul className="list-disc list-inside space-y-1 text-slate-600">
            <li><code className="bg-slate-100 px-2 py-1 rounded">/api/instagram/metrics</code> - Métricas do Instagram</li>
            <li><code className="bg-slate-100 px-2 py-1 rounded">/api/tiktok/metrics</code> - Métricas do TikTok</li>
            <li><code className="bg-slate-100 px-2 py-1 rounded">/api/trends/active</code> - Trends em alta</li>
            <li><code className="bg-slate-100 px-2 py-1 rounded">/api/competitors/analysis</code> - Análise de concorrentes</li>
            <li><code className="bg-slate-100 px-2 py-1 rounded">/api/recommendations/posting</code> - Recomendações de posting</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
