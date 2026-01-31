import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Star, TrendingUp, MessageCircle, Heart, Eye, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function ModuloInfluenciadorasSection() {
  const [selectedInfluencer, setSelectedInfluencer] = useState(0);

  const influencers = [
    {
      id: 1,
      name: "Carol Silva",
      persona: "Carol",
      platform: "Instagram + TikTok",
      followers: 45000,
      engagement: 12.8,
      niche: "Renda Extra & Empreendedorismo",
      rate: "R$ 2.5K",
      status: "Parceria Ativa",
      lastPost: "há 2 dias",
      avgViews: 28000,
      avgLikes: 3584,
      audience: "Mulheres 22-35, empreendedoras",
    },
    {
      id: 2,
      name: "Luiza Costa",
      persona: "Luiza",
      platform: "TikTok + Instagram",
      followers: 78000,
      engagement: 14.8,
      niche: "Lifestyle & Moda",
      rate: "R$ 3.5K",
      status: "Parceria Ativa",
      lastPost: "há 1 dia",
      avgViews: 45000,
      avgLikes: 6750,
      audience: "Mulheres 18-28, fashion lovers",
    },
    {
      id: 3,
      name: "Renata Oliveira",
      persona: "Renata",
      platform: "Instagram + YouTube",
      followers: 32000,
      engagement: 11.2,
      niche: "B2B & Negócios",
      rate: "R$ 2K",
      status: "Parceria Ativa",
      lastPost: "há 3 dias",
      avgViews: 18000,
      avgLikes: 2016,
      audience: "Mulheres 28-45, revendedoras",
    },
    {
      id: 4,
      name: "Vanessa Martins",
      persona: "Vanessa",
      platform: "TikTok + Instagram",
      followers: 31000,
      engagement: 13.5,
      niche: "Compra Coletiva & Comunidade",
      rate: "R$ 2.2K",
      status: "Parceria Ativa",
      lastPost: "há 1 dia",
      avgViews: 35000,
      avgLikes: 4725,
      audience: "Mulheres 20-40, comunidade",
    },
  ];

  const currentInfluencer = influencers[selectedInfluencer];

  const campaigns = [
    {
      id: 1,
      name: "Quanto Ganhei Vendendo Pijamas",
      influencer: "Carol",
      status: "Ativo",
      startDate: "01 Feb",
      endDate: "28 Feb",
      budget: "R$ 2.5K",
      views: 125000,
      engagement: 15,
      roi: 380,
    },
    {
      id: 2,
      name: "Transformação Look Dia/Noite",
      influencer: "Luiza",
      status: "Ativo",
      startDate: "01 Feb",
      endDate: "28 Feb",
      budget: "R$ 3.5K",
      views: 185000,
      engagement: 18,
      roi: 420,
    },
    {
      id: 3,
      name: "Por que Feminnita é Melhor",
      influencer: "Renata",
      status: "Planejado",
      startDate: "05 Feb",
      endDate: "28 Feb",
      budget: "R$ 2K",
      views: 0,
      engagement: 0,
      roi: 0,
    },
    {
      id: 4,
      name: "Compra Coletiva Economizando",
      influencer: "Vanessa",
      status: "Ativo",
      startDate: "01 Feb",
      endDate: "28 Feb",
      budget: "R$ 2.2K",
      views: 95000,
      engagement: 16,
      roi: 390,
    },
  ];

  const microInfluencers = [
    {
      name: "Ana Paula",
      followers: 12500,
      engagement: 9.2,
      niche: "Lifestyle",
      rate: "R$ 800",
      status: "Disponível",
    },
    {
      name: "Beatriz Rocha",
      followers: 18000,
      engagement: 10.5,
      niche: "Moda",
      rate: "R$ 1.2K",
      status: "Disponível",
    },
    {
      name: "Camila Santos",
      followers: 15000,
      engagement: 8.8,
      niche: "Comunidade",
      rate: "R$ 900",
      status: "Disponível",
    },
    {
      name: "Daniela Lima",
      followers: 22000,
      engagement: 11.3,
      niche: "Empreendedorismo",
      rate: "R$ 1.5K",
      status: "Disponível",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Módulo de Influenciadores</h2>
        <p className="text-slate-600">Gerencie parcerias com micro-influenciadores para amplificar alcance</p>
      </div>

      {/* Influencer Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Influenciadoras Parceiras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {influencers.map((influencer, idx) => (
              <button
                key={influencer.id}
                onClick={() => setSelectedInfluencer(idx)}
                className={`p-4 rounded-lg border-2 transition text-left ${
                  selectedInfluencer === idx
                    ? "border-pink-500 bg-pink-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{influencer.name}</p>
                    <p className="text-xs text-slate-600">{influencer.platform}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs">Ativa</Badge>
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-600">
                  <Users className="w-3 h-3" />
                  {(influencer.followers / 1000).toFixed(0)}K
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Influencer Details */}
      <Card>
        <CardHeader>
          <CardTitle>{currentInfluencer.name}</CardTitle>
          <CardDescription>{currentInfluencer.persona} • {currentInfluencer.niche}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Seguidores</p>
              <p className="text-2xl font-bold text-slate-900">{(currentInfluencer.followers / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Engajamento</p>
              <p className="text-2xl font-bold text-slate-900">{currentInfluencer.engagement}%</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Média de Views</p>
              <p className="text-2xl font-bold text-slate-900">{(currentInfluencer.avgViews / 1000).toFixed(0)}K</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Taxa por Post</p>
              <p className="text-2xl font-bold text-slate-900">{currentInfluencer.rate}</p>
            </div>
          </div>

          {/* Audience */}
          <div className="border border-slate-200 rounded-lg p-4">
            <p className="font-semibold text-slate-900 mb-2">Público-Alvo</p>
            <p className="text-sm text-slate-600">{currentInfluencer.audience}</p>
          </div>

          {/* Performance */}
          <div className="grid grid-cols-3 gap-4">
            <div className="border border-slate-200 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600 mb-1">Média de Likes</p>
              <p className="text-2xl font-bold text-slate-900">{(currentInfluencer.avgLikes / 1000).toFixed(1)}K</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600 mb-1">Último Post</p>
              <p className="text-sm font-bold text-slate-900">{currentInfluencer.lastPost}</p>
            </div>
            <div className="border border-slate-200 rounded-lg p-4 text-center">
              <p className="text-sm text-slate-600 mb-1">Status</p>
              <Badge className="bg-green-100 text-green-800">{currentInfluencer.status}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Campaigns */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas Ativas</CardTitle>
          <CardDescription>Parcerias em andamento com influenciadores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div key={campaign.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{campaign.name}</p>
                    <p className="text-sm text-slate-600">{campaign.influencer}</p>
                  </div>
                  <Badge className={campaign.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                    {campaign.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-600">Período</p>
                    <p className="font-bold text-slate-900 text-sm">{campaign.startDate} - {campaign.endDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Budget</p>
                    <p className="font-bold text-slate-900 text-sm">{campaign.budget}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Views</p>
                    <p className="font-bold text-slate-900 text-sm">{campaign.views > 0 ? (campaign.views / 1000).toFixed(0) + "K" : "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Engajamento</p>
                    <p className="font-bold text-slate-900 text-sm">{campaign.engagement > 0 ? campaign.engagement + "%" : "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">ROI</p>
                    <p className="font-bold text-green-600 text-sm">{campaign.roi > 0 ? campaign.roi + "%" : "-"}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Micro-Influencers Available */}
      <Card>
        <CardHeader>
          <CardTitle>Micro-Influenciadoras Disponíveis</CardTitle>
          <CardDescription>Oportunidades de parcerias com menor investimento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {microInfluencers.map((micro, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{micro.name}</p>
                    <p className="text-sm text-slate-600">{micro.niche}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800">{micro.status}</Badge>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-600">
                      <strong>{(micro.followers / 1000).toFixed(0)}K</strong> seguidores
                    </span>
                    <span className="text-slate-600">
                      <strong>{micro.engagement}%</strong> engajamento
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{micro.rate}</span>
                    <button className="px-3 py-1 bg-pink-500 text-white rounded hover:bg-pink-600 transition text-sm">
                      Contratar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Partnership */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Nova Parceria</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Influenciadora</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
              <option>Selecionar influenciadora...</option>
              <option>Ana Paula (12.5K)</option>
              <option>Beatriz Rocha (18K)</option>
              <option>Camila Santos (15K)</option>
              <option>Daniela Lima (22K)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Tipo de Campanha</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
              <option>Post Único</option>
              <option>Série de 3 Posts</option>
              <option>Série de 5 Posts</option>
              <option>Parceria Mensal</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Data Início</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Data Fim</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Budget</label>
            <input type="number" placeholder="R$ 1.000" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition font-semibold">
            🤝 Criar Parceria
          </button>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">📊 Performance de Influenciadores</CardTitle>
        </CardHeader>
        <CardContent className="text-green-900 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Parcerias Ativas</p>
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs mt-1">influenciadoras</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Alcance Total</p>
              <p className="text-2xl font-bold">186K</p>
              <p className="text-xs mt-1">seguidores</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Views Geradas</p>
              <p className="text-2xl font-bold">405K</p>
              <p className="text-xs mt-1">este mês</p>
            </div>
            <div>
              <p className="text-sm font-semibold">ROI Médio</p>
              <p className="text-2xl font-bold">397%</p>
              <p className="text-xs mt-1">por campanha</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
