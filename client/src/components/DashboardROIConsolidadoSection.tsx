import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, DollarSign, Target, Download, Filter } from "lucide-react";
import { useState } from "react";

export default function DashboardROIConsolidadoSection() {
  const [periodo, setPeriodo] = useState("7dias");
  const [plataformaSelecionada, setPlataformaSelecionada] = useState("todas");

  const dados = {
    instagram: {
      investimento: 1200,
      receita: 4800,
      roi: 300,
      conversoes: 145,
      cpa: 8.28,
      engajamento: 8.5
    },
    tiktok: {
      investimento: 800,
      receita: 3200,
      roi: 300,
      conversoes: 98,
      cpa: 8.16,
      engajamento: 12.3
    },
    googleAds: {
      investimento: 500,
      receita: 2500,
      roi: 400,
      conversoes: 67,
      cpa: 7.46,
      engajamento: 5.2
    },
    facebook: {
      investimento: 600,
      receita: 1800,
      roi: 200,
      conversoes: 42,
      cpa: 14.29,
      engajamento: 3.8
    }
  };

  const campanhas = [
    {
      id: 1,
      nome: "Renda Extra - Instagram Stories",
      plataforma: "instagram",
      investimento: 400,
      receita: 1600,
      roi: 300,
      conversoes: 48,
      cpa: 8.33,
      status: "ativa"
    },
    {
      id: 2,
      nome: "Compra Familiar - TikTok Ads",
      plataforma: "tiktok",
      investimento: 300,
      receita: 1200,
      roi: 300,
      conversoes: 35,
      cpa: 8.57,
      status: "ativa"
    },
    {
      id: 3,
      nome: "Lançamento Inverno - Google Search",
      plataforma: "googleAds",
      investimento: 250,
      receita: 1250,
      roi: 400,
      conversoes: 32,
      cpa: 7.81,
      status: "ativa"
    },
    {
      id: 4,
      nome: "Bastidores - Instagram Reels",
      plataforma: "instagram",
      investimento: 300,
      receita: 1200,
      roi: 300,
      conversoes: 45,
      cpa: 6.67,
      status: "ativa"
    },
    {
      id: 5,
      nome: "Educacional - Facebook Ads",
      plataforma: "facebook",
      investimento: 300,
      receita: 600,
      roi: 100,
      conversoes: 20,
      cpa: 15.0,
      status: "pausada"
    },
    {
      id: 6,
      nome: "ASMR - TikTok Organic",
      plataforma: "tiktok",
      investimento: 200,
      receita: 1000,
      roi: 400,
      conversoes: 30,
      cpa: 6.67,
      status: "ativa"
    }
  ];

  const totalInvestimento = Object.values(dados).reduce((a, d) => a + d.investimento, 0);
  const totalReceita = Object.values(dados).reduce((a, d) => a + d.receita, 0);
  const totalROI = ((totalReceita - totalInvestimento) / totalInvestimento * 100).toFixed(0);
  const totalConversoes = Object.values(dados).reduce((a, d) => a + d.conversoes, 0);

  const campanhasFiltradas = plataformaSelecionada === "todas" 
    ? campanhas 
    : campanhas.filter(c => c.plataforma === plataformaSelecionada);

  const exportarRelatorio = () => {
    const relatorio = `
RELATÓRIO DE ROI CONSOLIDADO - FEMINNITA PIJAMAS
Data: ${new Date().toLocaleDateString('pt-BR')}
Período: Últimos ${periodo === "7dias" ? "7 dias" : periodo === "30dias" ? "30 dias" : "90 dias"}

=== RESUMO EXECUTIVO ===
Investimento Total: R$ ${totalInvestimento.toLocaleString()}
Receita Total: R$ ${totalReceita.toLocaleString()}
ROI Total: ${totalROI}%
Conversões: ${totalConversoes}

=== POR PLATAFORMA ===
${Object.entries(dados).map(([plat, d]) => `
${plat.toUpperCase()}:
- Investimento: R$ ${d.investimento.toLocaleString()}
- Receita: R$ ${d.receita.toLocaleString()}
- ROI: ${d.roi}%
- Conversões: ${d.conversoes}
- CPA: R$ ${d.cpa.toFixed(2)}
- Engajamento: ${d.engajamento}%
`).join('')}

=== CAMPANHAS ATIVAS ===
${campanhasFiltradas.filter(c => c.status === "ativa").map(c => `
${c.nome}:
- Investimento: R$ ${c.investimento}
- Receita: R$ ${c.receita}
- ROI: ${c.roi}%
- CPA: R$ ${c.cpa.toFixed(2)}
`).join('')}
    `;
    
    const blob = new Blob([relatorio], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-roi-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard de ROI Consolidado</h2>
        <p className="text-slate-600">
          Unifique dados de todas as plataformas (Instagram, TikTok, Google Ads, Facebook) em um único dashboard com ROI por campanha.
        </p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Período</label>
          <select 
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded"
          >
            <option value="7dias">Últimos 7 dias</option>
            <option value="30dias">Últimos 30 dias</option>
            <option value="90dias">Últimos 90 dias</option>
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-semibold text-slate-700 mb-2 block">Plataforma</label>
          <select 
            value={plataformaSelecionada}
            onChange={(e) => setPlataformaSelecionada(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded"
          >
            <option value="todas">Todas as Plataformas</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok</option>
            <option value="googleAds">Google Ads</option>
            <option value="facebook">Facebook</option>
          </select>
        </div>
        <div className="flex items-end">
          <Button 
            onClick={exportarRelatorio}
            className="w-full bg-green-600 hover:bg-green-700 gap-2"
          >
            <Download className="w-4 h-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Resumo Executivo */}
      <Card className="border-l-4 border-l-green-500 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Resumo Executivo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            {[
              { titulo: "Investimento", valor: `R$ ${totalInvestimento.toLocaleString()}`, icon: "💰", cor: "text-blue-600" },
              { titulo: "Receita", valor: `R$ ${totalReceita.toLocaleString()}`, icon: "💵", cor: "text-green-600" },
              { titulo: "Lucro", valor: `R$ ${(totalReceita - totalInvestimento).toLocaleString()}`, icon: "📈", cor: "text-emerald-600" },
              { titulo: "ROI", valor: `${totalROI}%`, icon: "🎯", cor: "text-purple-600" },
              { titulo: "Conversões", valor: totalConversoes, icon: "✅", cor: "text-orange-600" }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <p className="text-2xl mb-2">{item.icon}</p>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{item.titulo}</p>
                <p className={`text-2xl font-bold ${item.cor}`}>{item.valor}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance por Plataforma */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Performance por Plataforma</CardTitle>
          <CardDescription>Comparação de ROI, CPA e engajamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(dados).map(([plat, d]) => (
              <div key={plat} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900 capitalize">{plat}</h4>
                    <p className="text-xs text-slate-600">{d.conversoes} conversões</p>
                  </div>
                  <Badge className={d.roi >= 300 ? "bg-green-600" : d.roi >= 200 ? "bg-yellow-600" : "bg-red-600"}>
                    {d.roi}% ROI
                  </Badge>
                </div>

                <div className="grid grid-cols-5 gap-2 text-xs">
                  <div>
                    <p className="text-slate-600">Investimento</p>
                    <p className="font-bold text-slate-900">R$ {d.investimento}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Receita</p>
                    <p className="font-bold text-slate-900">R$ {d.receita}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">CPA</p>
                    <p className="font-bold text-slate-900">R$ {d.cpa.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Engajamento</p>
                    <p className="font-bold text-slate-900">{d.engajamento}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Lucro</p>
                    <p className="font-bold text-green-600">R$ {d.receita - d.investimento}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campanhas Detalhadas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Campanhas Detalhadas
          </CardTitle>
          <CardDescription>Performance de cada campanha</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campanhasFiltradas.map((camp) => (
              <div key={camp.id} className={`border-2 rounded-lg p-4 ${camp.status === "ativa" ? "border-green-200 bg-green-50" : "border-slate-200 bg-slate-50"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900">{camp.nome}</h4>
                    <p className="text-xs text-slate-600">{camp.plataforma}</p>
                  </div>
                  <Badge variant={camp.status === "ativa" ? "default" : "secondary"}>
                    {camp.status === "ativa" ? "✅ Ativa" : "⏸️ Pausada"}
                  </Badge>
                </div>

                <div className="grid grid-cols-6 gap-2 text-xs mb-3">
                  <div>
                    <p className="text-slate-600">Investimento</p>
                    <p className="font-bold text-slate-900">R$ {camp.investimento}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Receita</p>
                    <p className="font-bold text-slate-900">R$ {camp.receita}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">ROI</p>
                    <p className={`font-bold ${camp.roi >= 300 ? "text-green-600" : camp.roi >= 200 ? "text-yellow-600" : "text-red-600"}`}>{camp.roi}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Conversões</p>
                    <p className="font-bold text-slate-900">{camp.conversoes}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">CPA</p>
                    <p className="font-bold text-slate-900">R$ {camp.cpa.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Lucro</p>
                    <p className="font-bold text-green-600">R$ {camp.receita - camp.investimento}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1">Ver Detalhes</Button>
                  <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">Otimizar</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="border-purple-200 bg-purple-50">
        <CardHeader>
          <CardTitle className="text-lg">💡 Recomendações de Otimização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            {
              titulo: "Google Ads - Melhor ROI",
              descricao: "Aumentar budget em 50% (melhor ROI: 400%)",
              acao: "Aumentar"
            },
            {
              titulo: "TikTok - Alto Engajamento",
              descricao: "Manter investimento (engajamento: 12.3%)",
              acao: "Manter"
            },
            {
              titulo: "Facebook - Baixo ROI",
              descricao: "Reduzir budget em 30% (ROI: 100%)",
              acao: "Reduzir"
            },
            {
              titulo: "Instagram - Balanceado",
              descricao: "Manter estratégia atual (ROI: 300%)",
              acao: "Manter"
            }
          ].map((rec, idx) => (
            <div key={idx} className="border border-purple-200 rounded-lg p-3 bg-white">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-slate-900">{rec.titulo}</p>
                  <p className="text-xs text-slate-600">{rec.descricao}</p>
                </div>
                <Badge variant="outline">{rec.acao}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para Maximizar ROI</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ Priorize campanhas com ROI > 300%",
            "✅ Pause campanhas com ROI < 150%",
            "✅ Realoque budget de baixo para alto ROI",
            "✅ Teste novas audiências em campanhas top",
            "✅ Monitore CPA diariamente",
            "✅ Aumente budget gradualmente (+10-20%)",
            "✅ Mantenha histórico de 90 dias para análise"
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">{dica}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
