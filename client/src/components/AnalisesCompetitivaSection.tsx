import { BarChart3, TrendingUp, AlertCircle, CheckCircle, Target, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AnalisesCompetitivaSection() {
  const competidores = [
    {
      nome: "Feminnita (Você)",
      preco: "R$ 125",
      promocao: "10-20%",
      entrega: "2-3 dias",
      satisfacao: "4.8/5",
      redes: "Instagram, TikTok, Facebook, Email",
      vantagem: "Personalização, Personas, Automação",
      roi: "2.85x"
    },
    {
      nome: "Concorrente A",
      preco: "R$ 135",
      promocao: "5-10%",
      entrega: "3-5 dias",
      satisfacao: "4.2/5",
      redes: "Instagram, Facebook",
      vantagem: "Marca consolidada",
      roi: "1.85x"
    },
    {
      nome: "Concorrente B",
      preco: "R$ 115",
      promocao: "15-25%",
      entrega: "4-7 dias",
      satisfacao: "3.9/5",
      redes: "Instagram, Marketplace",
      vantagem: "Preço baixo",
      roi: "1.45x"
    },
    {
      nome: "Concorrente C",
      preco: "R$ 140",
      promocao: "8-12%",
      entrega: "2-4 dias",
      satisfacao: "4.5/5",
      redes: "Facebook, Email",
      vantagem: "Qualidade premium",
      roi: "2.15x"
    }
  ];

  const analisePreco = [
    { faixa: "R$ 100-120", concorrentes: 2, posicao: "Baixo custo", estrategia: "Não compete aqui" },
    { faixa: "R$ 121-135", concorrentes: 3, posicao: "Você está aqui", estrategia: "Melhor custo-benefício" },
    { faixa: "R$ 136-150", concorrentes: 1, posicao: "Premium", estrategia: "Oportunidade" }
  ];

  const analiseCanais = [
    {
      canal: "Instagram",
      feminnita: "85%",
      concA: "90%",
      concB: "75%",
      concC: "60%",
      recomendacao: "Aumentar conteúdo em 20%"
    },
    {
      canal: "TikTok",
      feminnita: "92%",
      concA: "30%",
      concB: "45%",
      concC: "15%",
      recomendacao: "Você lidera! Manter investimento"
    },
    {
      canal: "Facebook",
      feminnita: "78%",
      concA: "85%",
      concB: "70%",
      concC: "88%",
      recomendacao: "Aumentar em 25%"
    },
    {
      canal: "Email",
      feminnita: "82%",
      concA: "60%",
      concB: "40%",
      concC: "75%",
      recomendacao: "Você lidera! Explorar mais"
    }
  ];

  const metricas = [
    {
      titulo: "Posição de Preço",
      valor: "Competitivo",
      descricao: "R$ 125 vs R$ 115-140",
      cor: "text-green-600"
    },
    {
      titulo: "Satisfação do Cliente",
      valor: "4.8/5",
      descricao: "Melhor que concorrentes",
      cor: "text-green-600"
    },
    {
      titulo: "Velocidade de Entrega",
      valor: "2-3 dias",
      descricao: "Melhor da categoria",
      cor: "text-green-600"
    },
    {
      titulo: "Presença em Canais",
      valor: "4 canais",
      descricao: "Mais que concorrentes",
      cor: "text-green-600"
    }
  ];

  const oportunidades = [
    {
      oportunidade: "Expandir para Marketplace",
      impacto: "R$ 250K/mês",
      esforço: "Médio",
      prazo: "30 dias",
      acao: "Integrar com Amazon, Mercado Livre"
    },
    {
      oportunidade: "Programa de Afiliados",
      impacto: "R$ 180K/mês",
      esforço: "Baixo",
      prazo: "15 dias",
      acao: "Criar programa com influenciadores"
    },
    {
      oportunidade: "Loja Física Pop-up",
      impacto: "R$ 120K/mês",
      esforço: "Alto",
      prazo: "60 dias",
      acao: "Eventos em shoppings"
    },
    {
      oportunidade: "Programa de Fidelidade",
      impacto: "R$ 95K/mês",
      esforço: "Médio",
      prazo: "45 dias",
      acao: "Pontos, cashback, VIP"
    }
  ];

  const ameacas = [
    {
      ameaca: "Concorrente B com preço 8% menor",
      impacto: "Perder 15% de clientes",
      probabilidade: "Alta",
      mitigacao: "Aumentar valor percebido com automação"
    },
    {
      ameaca: "Concorrente A expandindo em TikTok",
      impacto: "Reduzir liderança em TikTok",
      probabilidade: "Média",
      mitigacao: "Dobrar conteúdo viral em TikTok"
    },
    {
      ameaca: "Marketplace com comissão menor",
      impacto: "Clientes migrarem",
      probabilidade: "Média",
      mitigacao: "Oferecer desconto exclusivo no site"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metricas.map((metrica, idx) => (
          <Card key={idx} className="border-slate-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">{metrica.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${metrica.cor}`}>{metrica.valor}</div>
              <p className="text-xs text-slate-500 mt-1">{metrica.descricao}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Comparação com Concorrentes */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Comparação com Concorrentes
          </CardTitle>
          <CardDescription>Análise de preço, entrega, satisfação e canais</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {competidores.map((comp, idx) => (
              <div key={idx} className={`border rounded-lg p-4 hover:bg-slate-50/50 transition ${
                idx === 0 ? "border-green-300 bg-green-50/30" : "border-slate-200/50"
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{comp.nome}</h4>
                  {idx === 0 && <Badge className="bg-green-100 text-green-700">Você</Badge>}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Preço</p>
                    <p className="font-bold text-slate-900">{comp.preco}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Promoção</p>
                    <p className="font-bold text-slate-900">{comp.promocao}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Entrega</p>
                    <p className="font-bold text-slate-900">{comp.entrega}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Satisfação</p>
                    <p className="font-bold text-blue-600">{comp.satisfacao}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                  <div>
                    <p className="text-slate-500">Canais</p>
                    <p className="text-slate-700">{comp.redes}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-500">Vantagem</p>
                    <p className="font-bold text-slate-900">{comp.vantagem}</p>
                  </div>
                  <div className="flex items-center justify-between bg-slate-100 rounded p-2">
                    <p className="text-slate-500">ROI</p>
                    <p className="font-bold text-green-600">{comp.roi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise de Canais */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            Performance por Canal
          </CardTitle>
          <CardDescription>Onde você está ganhando vs concorrentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analiseCanais.map((canal, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">{canal.canal}</h4>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 text-sm">
                  <div className="bg-green-50 rounded p-2">
                    <p className="text-slate-500 text-xs">Feminnita</p>
                    <p className="font-bold text-green-600">{canal.feminnita}</p>
                  </div>
                  <div className="bg-slate-100 rounded p-2">
                    <p className="text-slate-500 text-xs">Conc. A</p>
                    <p className="font-bold text-slate-900">{canal.concA}</p>
                  </div>
                  <div className="bg-slate-100 rounded p-2">
                    <p className="text-slate-500 text-xs">Conc. B</p>
                    <p className="font-bold text-slate-900">{canal.concB}</p>
                  </div>
                  <div className="bg-slate-100 rounded p-2">
                    <p className="text-slate-500 text-xs">Conc. C</p>
                    <p className="font-bold text-slate-900">{canal.concC}</p>
                  </div>
                  <div className="bg-blue-50 rounded p-2">
                    <p className="text-slate-500 text-xs">Ação</p>
                    <p className="font-bold text-blue-600 text-xs">{canal.recomendacao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Oportunidades */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Oportunidades de Crescimento
          </CardTitle>
          <CardDescription>Onde você pode ganhar mercado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {oportunidades.map((op, idx) => (
              <div key={idx} className="border border-green-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{op.oportunidade}</h4>
                  <Badge className="bg-green-100 text-green-700">{op.impacto}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-2 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Esforço</p>
                    <p className="font-bold text-slate-900">{op.esforço}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Prazo</p>
                    <p className="font-bold text-slate-900">{op.prazo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Ação</p>
                    <p className="font-bold text-blue-600 text-xs">{op.acao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ameaças */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-red-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Ameaças Competitivas
          </CardTitle>
          <CardDescription>Riscos a monitorar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {ameacas.map((ameaca, idx) => (
              <div key={idx} className="border border-red-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{ameaca.ameaca}</h4>
                  <Badge variant={ameaca.probabilidade === "Alta" ? "destructive" : "secondary"}>
                    {ameaca.probabilidade}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Impacto</p>
                    <p className="font-bold text-red-600">{ameaca.impacto}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Mitigação</p>
                    <p className="font-bold text-blue-600 text-xs">{ameaca.mitigacao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="text-slate-900">🎯 Recomendações Estratégicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <span className="text-lg">1️⃣</span>
            <p><strong>Dobrar investimento em TikTok:</strong> Você lidera com 92% vs 30% do concorrente mais próximo</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">2️⃣</span>
            <p><strong>Expandir para Marketplace:</strong> Concorrentes não estão lá - oportunidade de R$ 250K/mês</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">3️⃣</span>
            <p><strong>Programa de Fidelidade:</strong> Diferenciar de concorrentes com automação inteligente</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-lg">4️⃣</span>
            <p><strong>Monitorar Concorrente B:</strong> Preço 8% menor - responder com valor agregado, não preço</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
