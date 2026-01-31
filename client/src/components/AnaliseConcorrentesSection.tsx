import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Heart, MessageCircle, Share2, Target, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function AnaliseConcorrentesSection() {
  const [selectedMetric, setSelectedMetric] = useState("followers");

  const competitors = [
    {
      id: 1,
      name: "Feminnita (Você)",
      platform: "Instagram",
      followers: 45000,
      engagement: 12.5,
      avgLikes: 5625,
      avgComments: 1125,
      avgShares: 450,
      postFrequency: "3-5x/dia",
      bestContent: "Stories + Reels",
      strategy: "Personas + Trends",
      trend: "📈 +15% mês",
      strength: "Estratégia Personalizada",
    },
    {
      id: 2,
      name: "Concorrente A",
      platform: "Instagram",
      followers: 32000,
      engagement: 8.2,
      avgLikes: 2624,
      avgComments: 525,
      avgShares: 210,
      postFrequency: "1-2x/dia",
      bestContent: "Feed Posts",
      strategy: "Genérico",
      trend: "📉 -5% mês",
      strength: "Qualidade Visual",
    },
    {
      id: 3,
      name: "Concorrente B",
      platform: "TikTok",
      followers: 78000,
      engagement: 14.3,
      avgLikes: 11154,
      avgComments: 2232,
      avgShares: 892,
      postFrequency: "2x/dia",
      bestContent: "Trends + Dança",
      strategy: "Viral Focus",
      trend: "📈 +25% mês",
      strength: "Viralidade",
    },
    {
      id: 4,
      name: "Concorrente C",
      platform: "Instagram",
      followers: 28000,
      engagement: 6.5,
      avgLikes: 1820,
      avgComments: 364,
      avgShares: 146,
      postFrequency: "3x/semana",
      bestContent: "Carrossel",
      strategy: "Educativo",
      trend: "📊 Estável",
      strength: "Conteúdo Informativo",
    },
  ];

  const benchmarks = [
    {
      metric: "Seguidores",
      you: 45000,
      average: 35750,
      leader: 78000,
      performance: "Acima da média",
    },
    {
      metric: "Engajamento",
      you: 12.5,
      average: 10.3,
      leader: 14.3,
      performance: "Bom",
    },
    {
      metric: "Likes por Post",
      you: 5625,
      average: 4050,
      leader: 11154,
      performance: "Acima da média",
    },
    {
      metric: "Comentários por Post",
      you: 1125,
      average: 771,
      leader: 2232,
      performance: "Acima da média",
    },
  ];

  const opportunities = [
    {
      id: 1,
      title: "Aumentar Frequência de Posts",
      description: "Concorrente B posta 2x/dia e tem 25% de crescimento",
      impact: "Alto",
      effort: "Médio",
      action: "Implementar",
    },
    {
      id: 2,
      title: "Focar em TikTok",
      description: "Concorrente B tem 78K seguidores no TikTok",
      impact: "Alto",
      effort: "Alto",
      action: "Explorar",
    },
    {
      id: 3,
      title: "Melhorar Qualidade Visual",
      description: "Concorrente A destaca-se em qualidade de imagem",
      impact: "Médio",
      effort: "Médio",
      action: "Melhorar",
    },
    {
      id: 4,
      title: "Criar Conteúdo Educativo",
      description: "Concorrente C tem alto engajamento com dicas",
      impact: "Médio",
      effort: "Baixo",
      action: "Testar",
    },
  ];

  const threats = [
    {
      id: 1,
      threat: "Concorrente B crescendo 25% ao mês",
      severity: "Alta",
      mitigation: "Aumentar frequência e viralidade",
    },
    {
      id: 2,
      threat: "Saturação de conteúdo genérico",
      severity: "Média",
      mitigation: "Manter foco em personas únicas",
    },
    {
      id: 3,
      threat: "Algoritmo favorecendo TikTok",
      severity: "Alta",
      mitigation: "Expandir presença no TikTok",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Análise de Concorrentes</h2>
        <p className="text-slate-600">Compare sua performance com concorrentes e identifique oportunidades</p>
      </div>

      {/* Competitive Landscape */}
      <Card>
        <CardHeader>
          <CardTitle>Panorama Competitivo</CardTitle>
          <CardDescription>Comparação com principais concorrentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Marca</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Plataforma</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Seguidores</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Engajamento</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Frequência</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Tendência</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((comp) => (
                  <tr key={comp.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-slate-900">{comp.name}</p>
                        <p className="text-xs text-slate-600">{comp.strategy}</p>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <Badge variant="outline">{comp.platform}</Badge>
                    </td>
                    <td className="text-center py-3 px-4 font-semibold text-slate-900">
                      {(comp.followers / 1000).toFixed(0)}K
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={comp.engagement > 12 ? "text-green-600 font-semibold" : "text-slate-700"}>
                        {comp.engagement}%
                      </span>
                    </td>
                    <td className="text-center py-3 px-4 text-slate-600">{comp.postFrequency}</td>
                    <td className="text-center py-3 px-4">{comp.trend}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle>Benchmarks de Performance</CardTitle>
          <CardDescription>Como você se compara com a média e líderes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {benchmarks.map((bench, idx) => (
            <div key={idx} className="space-y-2">
              <div className="flex justify-between items-center mb-1">
                <p className="font-semibold text-slate-900">{bench.metric}</p>
                <Badge
                  className={
                    bench.performance === "Acima da média"
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }
                >
                  {bench.performance}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-slate-600 w-20">Você:</span>
                <div className="flex-1 bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-pink-500 h-2 rounded-full"
                    style={{
                      width: `${(bench.you / bench.leader) * 100}%`,
                    }}
                  />
                </div>
                <span className="font-semibold text-slate-900 w-16 text-right">{bench.you}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-20">Média:</span>
                <span>{bench.average}</span>
                <span className="ml-auto">Líder: {bench.leader}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Opportunities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Oportunidades Identificadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {opportunities.map((opp) => (
              <div key={opp.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{opp.title}</h3>
                  <div className="flex gap-2">
                    <Badge className="bg-blue-100 text-blue-800">
                      Impacto: {opp.impact}
                    </Badge>
                    <Badge className="bg-purple-100 text-purple-800">
                      Esforço: {opp.effort}
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-slate-600 mb-3">{opp.description}</p>
                <button className="text-sm bg-pink-500 text-white px-4 py-1 rounded hover:bg-pink-600 transition">
                  {opp.action}
                </button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Threats & Mitigation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Ameaças & Mitigação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {threats.map((threat) => (
              <div key={threat.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-slate-900">{threat.threat}</h3>
                  <Badge
                    className={
                      threat.severity === "Alta"
                        ? "bg-red-200 text-red-800"
                        : "bg-yellow-200 text-yellow-800"
                    }
                  >
                    {threat.severity}
                  </Badge>
                </div>
                <p className="text-sm text-slate-700">
                  <strong>Mitigação:</strong> {threat.mitigation}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Strengths Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">✅ Seus Diferenciais</CardTitle>
        </CardHeader>
        <CardContent className="text-green-900 space-y-2">
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Estratégia de personas humanizadas (diferencial único)</li>
            <li>Engajamento 12.5% acima da média do mercado</li>
            <li>Crescimento consistente de 15% ao mês</li>
            <li>Conteúdo diversificado (Stories, Reels, Feed)</li>
            <li>Foco em múltiplas plataformas (Instagram + TikTok)</li>
          </ul>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📋 Plano de Ação Recomendado</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-3 text-sm">
          <p className="font-semibold">Próximos 30 dias:</p>
          <ol className="list-decimal list-inside space-y-2">
            <li>Aumentar frequência de posts para 2x/dia (especialmente TikTok)</li>
            <li>Implementar conteúdo educativo 1x/semana</li>
            <li>Melhorar qualidade visual dos posts (filtros, edição)</li>
            <li>Expandir presença no TikTok com 3-4 vídeos/dia</li>
            <li>Monitorar crescimento de Concorrente B e adaptar estratégia</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
