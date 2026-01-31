import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function PrevisaoVendasSection() {
  const [metaMensal, setMetaMensal] = useState(3000);
  const [diasRestantes, setDiasRestantes] = useState(28);

  const dados = {
    vendidoAteAgora: 1856,
    mediaDialaria: 66.3,
    projecaoFinal: 2456,
    diferencaMeta: -544,
    percentualMeta: 81.9,
    tendencia: "baixa"
  };

  const [previsoes, setPrevisoes] = useState([
    {
      id: 1,
      cenario: "Conservador",
      descricao: "Mantém média diária atual",
      vendas: 2456,
      probabilidade: 45,
      cor: "bg-yellow-50 border-yellow-200"
    },
    {
      id: 2,
      cenario: "Otimista",
      descricao: "Aumenta 20% com novas campanhas",
      vendas: 3547,
      probabilidade: 25,
      cor: "bg-green-50 border-green-200"
    },
    {
      id: 3,
      cenario: "Pessimista",
      descricao: "Reduz 15% por sazonalidade",
      vendas: 2088,
      probabilidade: 30,
      cor: "bg-red-50 border-red-200"
    }
  ]);

  const [recomendacoes, setRecomendacoes] = useState([
    {
      id: 1,
      titulo: "Aumentar Budget em Google Ads",
      descricao: "Adicione R$ 200/dia para atingir meta",
      impacto: "+450 vendas",
      custo: "R$ 5.600",
      roi: "3.2x"
    },
    {
      id: 2,
      titulo: "Ativar Campanha TikTok",
      descricao: "Novo público com alto engajamento",
      impacto: "+320 vendas",
      custo: "R$ 3.200",
      roi: "2.8x"
    },
    {
      id: 3,
      titulo: "Aumentar Frequência de Posts",
      descricao: "Postar 3x/dia em vez de 2x/dia",
      impacto: "+180 vendas",
      custo: "R$ 0",
      roi: "∞"
    }
  ]);

  const historico = [
    { mes: "Novembro", meta: 2500, realizado: 2340, percentual: 93.6 },
    { mes: "Dezembro", meta: 3000, realizado: 2890, percentual: 96.3 },
    { mes: "Janeiro", meta: 3000, realizado: 1856, percentual: 61.9 }
  ];

  const calcularBudgetNecessario = () => {
    const vendasFaltando = metaMensal - dados.vendidoAteAgora;
    const diasRestantesNum = diasRestantes;
    const vendasDiariasFaltando = vendasFaltando / diasRestantesNum;
    const aumento = vendasDiariasFaltando - dados.mediaDialaria;
    const budgetPorVenda = 50; // R$ 50 por venda em média
    const budgetNecessario = aumento * budgetPorVenda * diasRestantesNum;
    
    return Math.max(0, budgetNecessario);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Previsão de Vendas</h2>
        <p className="text-slate-600">
          Use histórico de 90 dias para prever vendas futuras e sugerir budget ideal para atingir meta mensal.
        </p>
      </div>

      {/* Configurar Meta */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg">Configurar Meta Mensal</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Meta Mensal (unidades)</label>
              <input 
                type="number" 
                value={metaMensal}
                onChange={(e) => setMetaMensal(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Dias Restantes no Mês</label>
              <input 
                type="number" 
                value={diasRestantes}
                onChange={(e) => setDiasRestantes(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumo da Previsão */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Resumo da Previsão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-6 gap-3">
            {[
              { titulo: "Vendido", valor: dados.vendidoAteAgora, icon: "📊", cor: "text-blue-600" },
              { titulo: "Meta", valor: metaMensal, icon: "🎯", cor: "text-purple-600" },
              { titulo: "Média/Dia", valor: dados.mediaDialaria.toFixed(1), icon: "📈", cor: "text-green-600" },
              { titulo: "Projeção", valor: dados.projecaoFinal, icon: "🔮", cor: "text-orange-600" },
              { titulo: "Diferença", valor: dados.diferencaMeta, icon: "📉", cor: "text-red-600" },
              { titulo: "% Meta", valor: `${dados.percentualMeta}%`, icon: "💯", cor: "text-yellow-600" }
            ].map((item, idx) => (
              <div key={idx} className="text-center">
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{item.titulo}</p>
                <p className={`text-xl font-bold ${item.cor}`}>{item.valor}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cenários de Previsão */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Cenários de Previsão</CardTitle>
          <CardDescription>3 cenários baseados em histórico de 90 dias</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {previsoes.map((prev) => (
            <div key={prev.id} className={`border-2 rounded-lg p-4 ${prev.cor}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-bold text-slate-900">{prev.cenario}</h4>
                  <p className="text-xs text-slate-600">{prev.descricao}</p>
                </div>
                <Badge variant="outline">{prev.probabilidade}% prob.</Badge>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <p className="text-xs font-semibold text-slate-600">Vendas Previstas</p>
                  <p className="text-2xl font-bold text-slate-900">{prev.vendas}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">vs Meta</p>
                  <p className={`text-2xl font-bold ${prev.vendas >= metaMensal ? "text-green-600" : "text-red-600"}`}>
                    {prev.vendas >= metaMensal ? "✅" : "❌"} {((prev.vendas / metaMensal) * 100).toFixed(0)}%
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-600">Diferença</p>
                  <p className={`text-2xl font-bold ${prev.vendas >= metaMensal ? "text-green-600" : "text-red-600"}`}>
                    {prev.vendas >= metaMensal ? "+" : ""}{prev.vendas - metaMensal}
                  </p>
                </div>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                disabled={prev.cenario === "Conservador"}
              >
                {prev.cenario === "Conservador" ? "Cenário Atual" : "Ativar Este Cenário"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Recomendações para Atingir Meta */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Recomendações para Atingir Meta
          </CardTitle>
          <CardDescription>Ações necessárias para alcançar {metaMensal} vendas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="p-4 bg-white border border-green-200 rounded-lg mb-4">
            <p className="font-semibold text-slate-900 mb-2">💰 Budget Necessário</p>
            <p className="text-3xl font-bold text-green-600">R$ {calcularBudgetNecessario().toLocaleString('pt-BR', {maximumFractionDigits: 0})}</p>
            <p className="text-xs text-slate-600 mt-1">Investimento total para atingir meta</p>
          </div>

          {recomendacoes.map((rec) => (
            <div key={rec.id} className="border border-green-200 rounded-lg p-4 bg-white hover:border-green-400 transition">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{rec.titulo}</h4>
                  <p className="text-xs text-slate-600">{rec.descricao}</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-3 text-xs">
                <div>
                  <p className="text-slate-600">Impacto</p>
                  <p className="font-bold text-green-600">{rec.impacto}</p>
                </div>
                <div>
                  <p className="text-slate-600">Custo</p>
                  <p className="font-bold text-slate-900">{rec.custo}</p>
                </div>
                <div>
                  <p className="text-slate-600">ROI</p>
                  <p className="font-bold text-green-600">{rec.roi}</p>
                </div>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700 text-xs">
                Implementar
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Histórico de Metas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Metas</CardTitle>
          <CardDescription>Performance dos últimos 3 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {historico.map((hist) => (
              <div key={hist.mes} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900">{hist.mes}</h4>
                    <p className="text-xs text-slate-600">Meta: {hist.meta} | Realizado: {hist.realizado}</p>
                  </div>
                  <Badge variant={hist.percentual >= 90 ? "default" : "secondary"}>
                    {hist.percentual}%
                  </Badge>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${hist.percentual >= 100 ? "bg-green-600" : hist.percentual >= 90 ? "bg-yellow-600" : "bg-red-600"}`}
                    style={{ width: `${Math.min(hist.percentual, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para Atingir Meta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ Aumente budget em campanhas com ROI > 300%",
            "✅ Teste novos públicos em campanhas top",
            "✅ Aumente frequência de posts (3x/dia)",
            "✅ Implemente promoções estratégicas",
            "✅ Ative remarketing para visitantes",
            "✅ Colabore com influenciadores",
            "✅ Monitore previsão diariamente"
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">{dica}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
