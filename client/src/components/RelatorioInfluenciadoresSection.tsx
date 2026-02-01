import { TrendingUp, Users, BarChart3, Calendar, DollarSign, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function RelatorioInfluenciadoresSection() {
  const [periodo, setPeriodo] = useState("30dias");

  const personas = [
    {
      id: 1,
      nome: "Carol",
      descricao: "Jovem, descontraída, moderna",
      cor: "bg-pink-100",
      corTexto: "text-pink-700"
    },
    {
      id: 2,
      nome: "Renata",
      descricao: "Profissional, elegante, sofisticada",
      cor: "bg-purple-100",
      corTexto: "text-purple-700"
    },
    {
      id: 3,
      nome: "Vanessa",
      descricao: "Mãe, acolhedora, prática",
      cor: "bg-blue-100",
      corTexto: "text-blue-700"
    },
    {
      id: 4,
      nome: "Luiza",
      descricao: "Influenciadora, criativa, viral",
      cor: "bg-orange-100",
      corTexto: "text-orange-700"
    }
  ];

  const performancePorPersona = [
    {
      persona: "Carol",
      conversoes: 1.250,
      receita: "R$ 156.250",
      roi: "2.85x",
      canal: "Instagram",
      ltv: "R$ 125",
      churn: "8%"
    },
    {
      persona: "Renata",
      conversoes: 890,
      receita: "R$ 178.000",
      roi: "3.12x",
      canal: "Facebook",
      ltv: "R$ 200",
      churn: "5%"
    },
    {
      persona: "Vanessa",
      conversoes: 2.150,
      receita: "R$ 215.000",
      roi: "2.45x",
      canal: "TikTok",
      ltv: "R$ 100",
      churn: "12%"
    },
    {
      persona: "Luiza",
      conversoes: 1.680,
      receita: "R$ 302.400",
      roi: "3.45x",
      canal: "Email",
      ltv: "R$ 180",
      churn: "6%"
    }
  ];

  const performancaPorCanal = [
    {
      persona: "Carol",
      instagram: { conversoes: 1.250, roi: "2.85x", receita: "R$ 156.250" },
      tiktok: { conversoes: 450, roi: "1.95x", receita: "R$ 45.000" },
      facebook: { conversoes: 320, roi: "1.60x", receita: "R$ 32.000" },
      email: { conversoes: 180, roi: "2.10x", receita: "R$ 18.000" }
    },
    {
      persona: "Renata",
      instagram: { conversoes: 650, roi: "2.50x", receita: "R$ 81.250" },
      tiktok: { conversoes: 200, roi: "1.40x", receita: "R$ 20.000" },
      facebook: { conversoes: 890, roi: "3.12x", receita: "R$ 178.000" },
      email: { conversoes: 420, roi: "2.80x", receita: "R$ 84.000" }
    },
    {
      persona: "Vanessa",
      instagram: { conversoes: 800, roi: "2.10x", receita: "R$ 80.000" },
      tiktok: { conversoes: 2.150, roi: "2.45x", receita: "R$ 215.000" },
      facebook: { conversoes: 500, roi: "1.80x", receita: "R$ 50.000" },
      email: { conversoes: 350, roi: "2.20x", receita: "R$ 35.000" }
    },
    {
      persona: "Luiza",
      instagram: { conversoes: 750, roi: "2.60x", receita: "R$ 93.750" },
      tiktok: { conversoes: 600, roi: "2.15x", receita: "R$ 60.000" },
      facebook: { conversoes: 400, roi: "1.85x", receita: "R$ 40.000" },
      email: { conversoes: 1.680, roi: "3.45x", receita: "R$ 302.400" }
    }
  ];

  const recomendacoes = [
    {
      persona: "Carol",
      acao: "Aumentar investimento em Instagram",
      impacto: "+R$ 50K/mês",
      prioridade: "Alta"
    },
    {
      persona: "Renata",
      acao: "Expandir Facebook Ads para 40% do budget",
      impacto: "+R$ 35K/mês",
      prioridade: "Alta"
    },
    {
      persona: "Vanessa",
      acao: "Dobrar investimento em TikTok",
      impacto: "+R$ 80K/mês",
      prioridade: "Crítica"
    },
    {
      persona: "Luiza",
      acao: "Aumentar frequência de emails",
      impacto: "+R$ 60K/mês",
      prioridade: "Alta"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Período Seletor */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Período de Análise
            </CardTitle>
            <div className="flex gap-2">
              <button
                onClick={() => setPeriodo("7dias")}
                className={`px-3 py-1 rounded text-xs font-medium transition ${
                  periodo === "7dias"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                7 dias
              </button>
              <button
                onClick={() => setPeriodo("30dias")}
                className={`px-3 py-1 rounded text-xs font-medium transition ${
                  periodo === "30dias"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                30 dias
              </button>
              <button
                onClick={() => setPeriodo("90dias")}
                className={`px-3 py-1 rounded text-xs font-medium transition ${
                  periodo === "90dias"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                90 dias
              </button>
              <button
                onClick={() => setPeriodo("custom")}
                className={`px-3 py-1 rounded text-xs font-medium transition ${
                  periodo === "custom"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Personalizado
              </button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Overview por Persona */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {personas.map((persona) => {
          const dados = performancePorPersona.find((p) => p.persona === persona.nome);
          return (
            <Card key={persona.id} className={`border-slate-200/50 ${persona.cor}`}>
              <CardHeader className="pb-3">
                <CardTitle className={`text-lg ${persona.corTexto}`}>{persona.nome}</CardTitle>
                <CardDescription className="text-xs">{persona.descricao}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-slate-600">Conversões</p>
                  <p className="text-2xl font-bold text-slate-900">{dados?.conversoes}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">Receita</p>
                  <p className="text-lg font-bold text-green-600">{dados?.receita}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600">ROI</p>
                  <p className="text-lg font-bold text-blue-600">{dados?.roi}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance por Persona */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Performance por Persona
          </CardTitle>
          <CardDescription>Métricas consolidadas de todas as personas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {performancePorPersona.map((item, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{item.persona}</h4>
                  <Badge variant="secondary">{item.canal}</Badge>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Conversões</p>
                    <p className="font-bold text-slate-900">{item.conversoes}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Receita</p>
                    <p className="font-bold text-green-600">{item.receita}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">ROI</p>
                    <p className="font-bold text-blue-600">{item.roi}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">LTV</p>
                    <p className="font-bold text-slate-900">{item.ltv}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Churn</p>
                    <p className="font-bold text-orange-600">{item.churn}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Ticket Médio</p>
                    <p className="font-bold text-slate-900">R$ 125</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance por Canal */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Performance por Canal (Detalhado)
          </CardTitle>
          <CardDescription>Qual persona funciona melhor em cada canal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {performancaPorCanal.map((item, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">{item.persona}</h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-pink-50 rounded p-3">
                    <p className="text-xs text-slate-600 font-semibold mb-2">📱 Instagram</p>
                    <p className="text-xs text-slate-700">
                      <strong>{item.instagram.conversoes}</strong> conversões
                    </p>
                    <p className="text-xs text-slate-700">
                      ROI: <strong>{item.instagram.roi}</strong>
                    </p>
                    <p className="text-xs text-green-600 font-semibold mt-1">{item.instagram.receita}</p>
                  </div>
                  <div className="bg-purple-50 rounded p-3">
                    <p className="text-xs text-slate-600 font-semibold mb-2">🎵 TikTok</p>
                    <p className="text-xs text-slate-700">
                      <strong>{item.tiktok.conversoes}</strong> conversões
                    </p>
                    <p className="text-xs text-slate-700">
                      ROI: <strong>{item.tiktok.roi}</strong>
                    </p>
                    <p className="text-xs text-green-600 font-semibold mt-1">{item.tiktok.receita}</p>
                  </div>
                  <div className="bg-blue-50 rounded p-3">
                    <p className="text-xs text-slate-600 font-semibold mb-2">👥 Facebook</p>
                    <p className="text-xs text-slate-700">
                      <strong>{item.facebook.conversoes}</strong> conversões
                    </p>
                    <p className="text-xs text-slate-700">
                      ROI: <strong>{item.facebook.roi}</strong>
                    </p>
                    <p className="text-xs text-green-600 font-semibold mt-1">{item.facebook.receita}</p>
                  </div>
                  <div className="bg-green-50 rounded p-3">
                    <p className="text-xs text-slate-600 font-semibold mb-2">📧 Email</p>
                    <p className="text-xs text-slate-700">
                      <strong>{item.email.conversoes}</strong> conversões
                    </p>
                    <p className="text-xs text-slate-700">
                      ROI: <strong>{item.email.roi}</strong>
                    </p>
                    <p className="text-xs text-green-600 font-semibold mt-1">{item.email.receita}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações de Ação */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Recomendações de Investimento
          </CardTitle>
          <CardDescription>Ações para maximizar ROI por persona</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recomendacoes.map((rec, idx) => (
              <div key={idx} className="border border-green-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{rec.persona}</h4>
                  <Badge
                    variant={
                      rec.prioridade === "Crítica"
                        ? "destructive"
                        : rec.prioridade === "Alta"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {rec.prioridade}
                  </Badge>
                </div>
                <p className="text-sm text-slate-700 mb-2">{rec.acao}</p>
                <p className="text-sm font-semibold text-green-600">💰 Impacto: {rec.impacto}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="text-slate-900">🎯 Insights Principais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <span className="text-lg">⭐</span>
            <p><strong>Luiza é a persona mais lucrativa:</strong> R$ 302.400 em receita com ROI 3.45x (melhor do portfólio)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">📈</span>
            <p><strong>Vanessa tem maior volume:</strong> 2.150 conversões via TikTok (maior volume de vendas)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">💼</span>
            <p><strong>Renata é a mais eficiente:</strong> LTV R$ 200 com churn apenas 5% (melhor retenção)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">🎬</span>
            <p><strong>Email é o canal de Luiza:</strong> 1.680 conversões via email (canal mais forte)</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">📱</span>
            <p><strong>TikTok é o canal de Vanessa:</strong> 2.150 conversões (maior volume de vendas)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
