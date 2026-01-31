import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Target, Eye, MousePointerClick, ShoppingCart, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function IntegracaoAdsSection() {
  const [selectedCampaign, setSelectedCampaign] = useState(0);

  const adsStats = [
    {
      title: "Gasto Total",
      value: "R$ 15.2K",
      change: "+22%",
      icon: DollarSign,
      color: "green",
    },
    {
      title: "Impressões",
      value: "2.8M",
      change: "+35%",
      icon: Eye,
      color: "blue",
    },
    {
      title: "Cliques",
      value: "156K",
      change: "+28%",
      icon: MousePointerClick,
      color: "purple",
    },
    {
      title: "Conversões",
      value: "2.3K",
      change: "+42%",
      icon: ShoppingCart,
      color: "pink",
    },
  ];

  const campaigns = [
    {
      id: 1,
      name: "Carol - Renda Extra (Google Ads)",
      platform: "Google Ads",
      persona: "Carol",
      budget: "R$ 2.5K",
      spent: "R$ 2.1K",
      impressions: 450000,
      clicks: 28500,
      conversions: 285,
      ctr: 6.3,
      cpc: 7.4,
      roi: 380,
      status: "Ativo",
    },
    {
      id: 2,
      name: "Luiza - Trend Viral (Meta Ads)",
      platform: "Meta Ads",
      persona: "Luiza",
      budget: "R$ 3.2K",
      spent: "R$ 2.8K",
      impressions: 850000,
      clicks: 68000,
      conversions: 612,
      ctr: 8.0,
      cpc: 4.1,
      roi: 420,
      status: "Ativo",
    },
    {
      id: 3,
      name: "Renata - B2B (Google Ads)",
      platform: "Google Ads",
      persona: "Renata",
      budget: "R$ 2.0K",
      spent: "R$ 1.8K",
      impressions: 320000,
      clicks: 19200,
      conversions: 156,
      ctr: 6.0,
      cpc: 9.4,
      roi: 340,
      status: "Ativo",
    },
    {
      id: 4,
      name: "Vanessa - Compra Coletiva (Meta Ads)",
      platform: "Meta Ads",
      persona: "Vanessa",
      budget: "R$ 1.8K",
      spent: "R$ 1.5K",
      impressions: 620000,
      clicks: 40300,
      conversions: 301,
      ctr: 6.5,
      cpc: 3.7,
      roi: 390,
      status: "Ativo",
    },
  ];

  const currentCampaign = campaigns[selectedCampaign];

  const dailyPerformance = [
    { date: "01 Feb", impressions: 125000, clicks: 7875, conversions: 79, spend: 585 },
    { date: "02 Feb", impressions: 142000, clicks: 9128, conversions: 95, spend: 672 },
    { date: "03 Feb", impressions: 158000, clicks: 10608, conversions: 112, spend: 748 },
    { date: "04 Feb", impressions: 135000, clicks: 8505, conversions: 88, spend: 630 },
    { date: "05 Feb", impressions: 168000, clicks: 11424, conversions: 128, spend: 784 },
    { date: "06 Feb", impressions: 152000, clicks: 9728, conversions: 105, spend: 712 },
    { date: "07 Feb", impressions: 148000, clicks: 9408, conversions: 98, spend: 691 },
  ];

  const adCreatives = [
    {
      id: 1,
      title: "Quanto Ganhei em Um Dia",
      persona: "Carol",
      platform: "Google Ads",
      ctr: 7.2,
      conversions: 45,
      status: "Top Performer",
    },
    {
      id: 2,
      title: "Transformação Look Dia/Noite",
      persona: "Luiza",
      platform: "Meta Ads",
      ctr: 9.1,
      conversions: 89,
      status: "Top Performer",
    },
    {
      id: 3,
      title: "Por que Feminnita é Melhor",
      persona: "Renata",
      platform: "Google Ads",
      ctr: 5.8,
      conversions: 28,
      status: "Bom",
    },
    {
      id: 4,
      title: "Compra Coletiva Economizando",
      persona: "Vanessa",
      platform: "Meta Ads",
      ctr: 6.9,
      conversions: 52,
      status: "Bom",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Integração Google Ads & Meta Ads</h2>
        <p className="text-slate-600">Gerencie campanhas pagas e rastreie ROI completo por persona</p>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {adsStats.map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <Card key={idx}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-slate-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg bg-${stat.color}-100`}>
                    <IconComponent className={`w-5 h-5 text-${stat.color}-600`} />
                  </div>
                </div>
                <p className="text-sm font-semibold text-green-600">{stat.change}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Campaign Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {campaigns.map((campaign, idx) => (
              <button
                key={campaign.id}
                onClick={() => setSelectedCampaign(idx)}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  selectedCampaign === idx
                    ? "border-pink-500 bg-pink-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{campaign.name}</p>
                    <p className="text-sm text-slate-600">{campaign.platform}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{campaign.status}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-700">
                    <strong>ROI:</strong> {campaign.roi}%
                  </span>
                  <span className="text-slate-700">
                    <strong>Gasto:</strong> {campaign.spent}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Details */}
      <Card>
        <CardHeader>
          <CardTitle>{currentCampaign.name}</CardTitle>
          <CardDescription>{currentCampaign.platform} • {currentCampaign.persona}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Impressões</p>
              <p className="text-2xl font-bold text-slate-900">{(currentCampaign.impressions / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Cliques</p>
              <p className="text-2xl font-bold text-slate-900">{(currentCampaign.clicks / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Conversões</p>
              <p className="text-2xl font-bold text-slate-900">{currentCampaign.conversions}</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">ROI</p>
              <p className="text-2xl font-bold text-slate-900">{currentCampaign.roi}%</p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">CTR</p>
              <p className="text-2xl font-bold text-slate-900">{currentCampaign.ctr}%</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">CPC</p>
              <p className="text-2xl font-bold text-slate-900">R$ {currentCampaign.cpc}</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4">
              <p className="text-sm text-slate-600 mb-1">Budget Restante</p>
              <p className="text-2xl font-bold text-slate-900">R$ {(parseFloat(currentCampaign.budget.replace('R$ ', '').replace('K', '000')) - parseFloat(currentCampaign.spent.replace('R$ ', '').replace('K', '000'))).toFixed(0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Diária</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dailyPerformance.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-semibold text-slate-900">{day.date}</p>
                  <p className="text-sm text-slate-600">{day.impressions.toLocaleString()} impressões</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <span className="text-slate-700">
                    <strong>{day.clicks.toLocaleString()}</strong> cliques
                  </span>
                  <span className="text-slate-700">
                    <strong>{day.conversions}</strong> conversões
                  </span>
                  <span className="text-slate-700">
                    <strong>R$ {day.spend}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Performing Ads */}
      <Card>
        <CardHeader>
          <CardTitle>Anúncios com Melhor Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {adCreatives.map((ad) => (
              <div key={ad.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{ad.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{ad.platform}</Badge>
                      <Badge className="bg-pink-100 text-pink-800">{ad.persona}</Badge>
                    </div>
                  </div>
                  <Badge className={ad.status === "Top Performer" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                    {ad.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm">
                  <span className="text-slate-600">CTR: <strong>{ad.ctr}%</strong></span>
                  <span className="text-slate-600">Conversões: <strong>{ad.conversions}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Dicas de Otimização</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-2 text-sm">
          <p>✅ Aumentar budget para Luiza (Meta Ads) - ROI 420%, CTR 8.0%</p>
          <p>✅ Testar novos criativos para Renata - CTR 5.8% está abaixo da média</p>
          <p>✅ Replicar estratégia de Luiza para outras personas</p>
          <p>✅ Pausar anúncios com CPC acima de R$ 10</p>
          <p>✅ A/B testar landing pages para melhorar conversão</p>
        </CardContent>
      </Card>

      {/* Create Campaign */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Nova Campanha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Plataforma</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
                <option>Google Ads</option>
                <option>Meta Ads</option>
                <option>TikTok Ads</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Persona</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
                <option>Carol</option>
                <option>Renata</option>
                <option>Vanessa</option>
                <option>Luiza</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Budget Diário</label>
            <input type="number" placeholder="R$ 100" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </div>
          <button className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition font-semibold">
            🚀 Criar Campanha
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
