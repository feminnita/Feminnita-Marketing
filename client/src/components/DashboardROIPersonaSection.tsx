import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, DollarSign, Users, Target, Zap, BarChart3, ArrowUp, ArrowDown } from "lucide-react";
import { useState } from "react";

export default function DashboardROIPersonaSection() {
  const [selectedPersona, setSelectedPersona] = useState(0);

  const personas = [
    {
      id: 1,
      nome: "Carol",
      imagem: "👩‍💼",
      conversoes: 1240,
      custoPorLead: "R$ 12,50",
      lifetimeValue: "R$ 1.850",
      roi: "148%",
      vendas: "R$ 2.294.000",
      crescimento: "+32%",
      seguidores: 45200,
      engajamento: "8.2%",
    },
    {
      id: 2,
      nome: "Renata",
      imagem: "👩‍🎨",
      conversoes: 980,
      custoPorLead: "R$ 15,80",
      lifetimeValue: "R$ 1.620",
      roi: "102%",
      vendas: "R$ 1.587.600",
      crescimento: "+18%",
      seguidores: 32100,
      engajamento: "7.5%",
    },
    {
      id: 3,
      nome: "Vanessa",
      imagem: "👩‍🦰",
      conversoes: 1120,
      custoPorLead: "R$ 11,20",
      lifetimeValue: "R$ 1.950",
      roi: "174%",
      vendas: "R$ 2.184.000",
      crescimento: "+45%",
      seguidores: 52800,
      engajamento: "9.1%",
    },
    {
      id: 4,
      nome: "Luiza",
      imagem: "👩‍🔬",
      conversoes: 850,
      custoPorLead: "R$ 18,50",
      lifetimeValue: "R$ 1.450",
      roi: "78%",
      vendas: "R$ 1.232.500",
      crescimento: "+12%",
      seguidores: 28900,
      engajamento: "6.8%",
    },
  ];

  const currentPersona = personas[selectedPersona];

  const metricas = [
    { titulo: "Conversões", valor: currentPersona.conversoes, icone: "📊", cor: "blue" },
    { titulo: "Custo por Lead", valor: currentPersona.custoPorLead, icone: "💰", cor: "green" },
    { titulo: "Lifetime Value", valor: currentPersona.lifetimeValue, icone: "💎", cor: "purple" },
    { titulo: "ROI", valor: currentPersona.roi, icone: "📈", cor: "pink" },
  ];

  const campanhas = [
    {
      nome: "Pijama Conforto - Verão",
      data: "15 Jan - 31 Jan",
      conversoes: 340,
      vendas: "R$ 612.000",
      roi: "156%",
      status: "Ativa",
    },
    {
      nome: "Coleção Premium",
      data: "01 Jan - 14 Jan",
      conversoes: 450,
      vendas: "R$ 945.000",
      roi: "142%",
      status: "Finalizada",
    },
    {
      nome: "Flash Sale",
      data: "20 Jan - 22 Jan",
      conversoes: 280,
      vendas: "R$ 504.000",
      roi: "168%",
      status: "Finalizada",
    },
    {
      nome: "Programa de Referência",
      data: "Contínuo",
      conversoes: 170,
      vendas: "R$ 233.000",
      roi: "134%",
      status: "Ativa",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Dashboard de ROI por Persona</h2>
        <p className="text-slate-600">Análise completa de performance e retorno financeiro</p>
      </div>

      {/* Seleção de Personas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {personas.map((persona, idx) => (
          <button
            key={persona.id}
            onClick={() => setSelectedPersona(idx)}
            className={`p-4 rounded-lg border-2 transition text-center ${
              selectedPersona === idx
                ? "border-pink-500 bg-pink-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <p className="text-2xl mb-2">{persona.imagem}</p>
            <p className="font-semibold text-slate-900">{persona.nome}</p>
            <p className="text-xs text-slate-600 mt-1">{persona.seguidores.toLocaleString()} seguidores</p>
          </button>
        ))}
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metricas.map((metrica) => (
          <Card key={metrica.titulo} className={`bg-${metrica.cor}-50 border-${metrica.cor}-200`}>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600 mb-2">{metrica.titulo}</p>
              <p className="text-2xl font-bold text-slate-900">{metrica.valor}</p>
              <p className="text-xs text-slate-600 mt-2">{metrica.icone}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detalhes da Persona */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {currentPersona.imagem} {currentPersona.nome}
          </CardTitle>
          <CardDescription>Análise detalhada de performance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Vendas Totais</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{currentPersona.vendas}</p>
              <div className="flex items-center gap-1 mt-2 text-green-600">
                <ArrowUp className="w-4 h-4" />
                <span className="text-sm font-semibold">{currentPersona.crescimento}</span>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Engajamento</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{currentPersona.engajamento}</p>
              <p className="text-xs text-slate-600 mt-2">Taxa média</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Seguidores</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{currentPersona.seguidores.toLocaleString()}</p>
              <p className="text-xs text-slate-600 mt-2">Instagram + TikTok</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-200">
            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Custo por Lead</p>
              <p className="text-3xl font-bold text-slate-900">{currentPersona.custoPorLead}</p>
              <p className="text-xs text-green-600 mt-1">↓ 8% vs mês anterior</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">Lifetime Value</p>
              <p className="text-3xl font-bold text-slate-900">{currentPersona.lifetimeValue}</p>
              <p className="text-xs text-green-600 mt-1">↑ 12% vs mês anterior</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900 mb-2">ROI</p>
              <p className="text-3xl font-bold text-green-600">{currentPersona.roi}</p>
              <p className="text-xs text-green-600 mt-1">Excelente performance</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Campanhas por Persona */}
      <Card>
        <CardHeader>
          <CardTitle>Campanhas de {currentPersona.nome}</CardTitle>
          <CardDescription>Performance de cada campanha</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campanhas.map((campanha, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-slate-900">{campanha.nome}</p>
                    <p className="text-sm text-slate-600 mt-1">{campanha.data}</p>
                  </div>
                  <Badge className={campanha.status === "Ativa" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {campanha.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-200 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Conversões</p>
                    <p className="font-bold text-slate-900">{campanha.conversoes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Vendas</p>
                    <p className="font-bold text-slate-900">{campanha.vendas}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">ROI</p>
                    <p className="font-bold text-green-600">{campanha.roi}</p>
                  </div>
                  <div>
                    <button className="px-3 py-1 bg-pink-500 text-white rounded hover:bg-pink-600 transition text-xs font-semibold">
                      Clonar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparação entre Personas */}
      <Card>
        <CardHeader>
          <CardTitle>Comparação de ROI - Todas as Personas</CardTitle>
          <CardDescription>Performance relativa de cada persona</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {personas.map((persona) => (
              <div key={persona.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-slate-900">{persona.imagem} {persona.nome}</p>
                  <p className="font-bold text-slate-900">{persona.roi}</p>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      persona.roi === "174%" ? "bg-green-500" :
                      persona.roi === "148%" ? "bg-blue-500" :
                      persona.roi === "102%" ? "bg-purple-500" :
                      "bg-orange-500"
                    }`}
                    style={{ width: `${parseInt(persona.roi)}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">💡 Recomendações Estratégicas</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-2">
          <p>✓ Vanessa tem o melhor ROI (174%) - Aumentar investimento em suas campanhas</p>
          <p>✓ Carol tem o maior volume de vendas - Manter estratégia atual</p>
          <p>✓ Luiza tem menor ROI (78%) - Testar novos formatos de conteúdo</p>
          <p>✓ Oportunidade: Clonar campanhas de Vanessa para Luiza</p>
        </CardContent>
      </Card>

      {/* Estatísticas Gerais */}
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="text-slate-900">📊 Estatísticas Consolidadas</CardTitle>
        </CardHeader>
        <CardContent className="text-slate-900 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Conversões Totais</p>
              <p className="text-2xl font-bold">4.190</p>
              <p className="text-xs mt-1">Todas as personas</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Vendas Totais</p>
              <p className="text-2xl font-bold">R$ 7.298.100</p>
              <p className="text-xs mt-1">Janeiro 2026</p>
            </div>
            <div>
              <p className="text-sm font-semibold">ROI Médio</p>
              <p className="text-2xl font-bold">125.5%</p>
              <p className="text-xs mt-1">Excelente</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Custo Médio por Lead</p>
              <p className="text-2xl font-bold">R$ 14,50</p>
              <p className="text-xs mt-1">Otimizado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
