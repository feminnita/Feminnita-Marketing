import { TrendingUp, AlertCircle, CheckCircle, Zap, Target, BarChart3 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function OtimizacaoFunilSection() {
  const etapasFunil = [
    {
      etapa: "Awareness (Descoberta)",
      usuarios: 125.450,
      taxa: "100%",
      tempo: "0-1h",
      gargalo: "Não",
      saude: "🟢 Saudável",
      metricas: "CTR 12%, Bounce 35%",
      recomendacao: "Manter investimento"
    },
    {
      etapa: "Consideration (Consideração)",
      usuarios: 45.230,
      taxa: "36%",
      tempo: "1-7 dias",
      gargalo: "Sim - 64% saem",
      saude: "🔴 Crítico",
      metricas: "Tempo médio 3.2 dias, Taxa saída 64%",
      recomendacao: "Retargeting urgente (+40% budget)"
    },
    {
      etapa: "Conversion (Conversão)",
      usuarios: 8.450,
      taxa: "19%",
      tempo: "Média 4 dias",
      gargalo: "Sim - 81% abandonam",
      saude: "🟡 Crítico",
      metricas: "Carrinho 12%, Checkout 68%",
      recomendacao: "Simplificar checkout (2 etapas)"
    },
    {
      etapa: "Retention (Retenção)",
      usuarios: 6.340,
      taxa: "75%",
      tempo: "Após compra",
      gargalo: "Não",
      saude: "🟢 Saudável",
      metricas: "Compra repetida 75%, LTV R$ 1.950",
      recomendacao: "Programa de fidelidade"
    }
  ];

  const gargalos = [
    {
      gargalo: "Consideration → Conversion",
      perda: "36.780 usuários",
      taxa: "81%",
      impacto: "R$ 5.5M/ano",
      causa: "Carrinho abandonado, falta de confiança",
      solucao: "Email de lembrete + Cupom 10%",
      roi: "12x",
      prazo: "7 dias"
    },
    {
      gargalo: "Awareness → Consideration",
      perda: "80.220 usuários",
      taxa: "64%",
      impacto: "R$ 3.2M/ano",
      causa: "Falta de retargeting, conteúdo genérico",
      solucao: "Retargeting dinâmico + Email nurture",
      roi: "8x",
      prazo: "14 dias"
    },
    {
      gargalo: "Checkout",
      perda: "2.644 usuários",
      taxa: "31%",
      impacto: "R$ 1.8M/ano",
      causa: "Muitas etapas, falta de segurança",
      solucao: "One-page checkout + Badges de confiança",
      roi: "15x",
      prazo: "30 dias"
    }
  ];

  const metricas = [
    {
      titulo: "Taxa de Conversão",
      valor: "6.7%",
      descricao: "Atual vs 3% mercado",
      cor: "text-green-600"
    },
    {
      titulo: "Gargalo Principal",
      valor: "81%",
      descricao: "Perda em Consideration",
      cor: "text-red-600"
    },
    {
      titulo: "Potencial de Melhoria",
      valor: "R$ 10.5M",
      descricao: "Anual se otimizar gargalos",
      cor: "text-purple-600"
    },
    {
      titulo: "ROI Médio Otimizações",
      valor: "11.7x",
      descricao: "Retorno esperado",
      cor: "text-emerald-600"
    }
  ];

  const otimizacoes = [
    {
      prioridade: "🔴 URGENTE",
      otimizacao: "Email de Carrinho Abandonado",
      etapa: "Consideration → Conversion",
      impacto: "R$ 2.1M/ano",
      roi: "12x",
      esforço: "Baixo",
      prazo: "7 dias",
      acao: "Configurar fluxo automático"
    },
    {
      prioridade: "🔴 URGENTE",
      otimizacao: "Simplificar Checkout",
      etapa: "Conversion",
      impacto: "R$ 1.8M/ano",
      roi: "15x",
      esforço: "Médio",
      prazo: "30 dias",
      acao: "Reduzir de 5 para 2 etapas"
    },
    {
      prioridade: "🟡 ALTO",
      otimizacao: "Retargeting Dinâmico",
      etapa: "Awareness → Consideration",
      impacto: "R$ 2.4M/ano",
      roi: "8x",
      esforço: "Médio",
      prazo: "14 dias",
      acao: "Criar públicos por produto visualizado"
    },
    {
      prioridade: "🟡 ALTO",
      otimizacao: "Programa de Fidelidade",
      etapa: "Retention",
      impacto: "R$ 1.8M/ano",
      roi: "10x",
      esforço: "Alto",
      prazo: "45 dias",
      acao: "Pontos, cashback, VIP"
    },
    {
      prioridade: "🟢 MÉDIO",
      otimizacao: "Badges de Confiança",
      etapa: "Conversion",
      impacto: "R$ 850K/ano",
      roi: "9x",
      esforço: "Baixo",
      prazo: "3 dias",
      acao: "SSL, Garantia, Reviews"
    },
    {
      prioridade: "🟢 MÉDIO",
      otimizacao: "Teste de Headlines",
      etapa: "Awareness",
      impacto: "R$ 620K/ano",
      roi: "7x",
      esforço: "Baixo",
      prazo: "14 dias",
      acao: "A/B testar 3 variações"
    }
  ];

  const analiseComportamento = [
    {
      comportamento: "Visitou 3+ páginas",
      usuarios: 28.450,
      taxa: "23%",
      tempo: "8.5 min",
      conversao: "18%",
      acao: "Email com recomendação"
    },
    {
      comportamento: "Adicionou ao carrinho",
      usuarios: 5.670,
      taxa: "4.5%",
      tempo: "12.3 min",
      conversao: "68%",
      acao: "Lembrete em 2h"
    },
    {
      comportamento: "Visualizou 1 página",
      usuarios: 97.000,
      taxa: "77%",
      tempo: "1.2 min",
      conversao: "2%",
      acao: "Retargeting com cupom"
    },
    {
      comportamento: "Visitou FAQ/Reviews",
      usuarios: 8.920,
      taxa: "7%",
      tempo: "4.8 min",
      conversao: "35%",
      acao: "Email com depoimentos"
    }
  ];

  const touchpointsOtimizacao = [
    {
      touchpoint: "Landing Page",
      taxa: "8.2%",
      problema: "Headline genérico",
      solucao: "Testar 3 headlines",
      impacto: "+15%",
      roi: "8x"
    },
    {
      touchpoint: "Página de Produto",
      taxa: "24%",
      problema: "Falta de reviews",
      solucao: "Adicionar 50+ reviews",
      impacto: "+22%",
      roi: "12x"
    },
    {
      touchpoint: "Carrinho",
      taxa: "12%",
      problema: "5 etapas de checkout",
      solucao: "Reduzir para 2 etapas",
      impacto: "+31%",
      roi: "15x"
    },
    {
      touchpoint: "Email Pós-Compra",
      taxa: "32%",
      problema: "Genérico",
      solucao: "Personalizar por persona",
      impacto: "+18%",
      roi: "10x"
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

      {/* Funil Completo */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Análise Completa do Funil
          </CardTitle>
          <CardDescription>Identificação de gargalos e saúde de cada etapa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {etapasFunil.map((etapa, idx) => (
              <div key={idx} className={`border rounded-lg p-4 hover:bg-slate-50/50 transition ${
                etapa.gargalo === "Sim - 64% saem" || etapa.gargalo === "Sim - 81% abandonam" 
                  ? "border-red-300 bg-red-50/30" 
                  : "border-slate-200/50"
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{etapa.etapa}</h4>
                  <Badge className={etapa.saude.includes("🟢") ? "bg-green-100 text-green-700" : etapa.saude.includes("🟡") ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}>
                    {etapa.saude}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Usuários</p>
                    <p className="font-bold text-slate-900">{etapa.usuarios.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Taxa</p>
                    <p className="font-bold text-slate-900">{etapa.taxa}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Tempo</p>
                    <p className="font-bold text-slate-900">{etapa.tempo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Gargalo</p>
                    <p className="font-bold text-red-600">{etapa.gargalo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Recomendação</p>
                    <p className="font-bold text-blue-600 text-xs">{etapa.recomendacao}</p>
                  </div>
                </div>

                <div className="bg-slate-100 rounded p-2 text-xs text-slate-600">
                  <p>{etapa.metricas}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Gargalos Críticos */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-red-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            3 Gargalos Críticos
          </CardTitle>
          <CardDescription>Onde estão as maiores perdas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {gargalos.map((garc, idx) => (
              <div key={idx} className="border border-red-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{garc.gargalo}</h4>
                  <Badge className="bg-red-100 text-red-700">{garc.taxa}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Perda</p>
                    <p className="font-bold text-red-600">{garc.perda}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Impacto/Ano</p>
                    <p className="font-bold text-red-600">{garc.impacto}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">ROI Solução</p>
                    <p className="font-bold text-green-600">{garc.roi}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Prazo</p>
                    <p className="font-bold text-slate-900">{garc.prazo}</p>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                  <div>
                    <p className="text-slate-500">Causa</p>
                    <p className="text-slate-700">{garc.causa}</p>
                  </div>
                  <div className="bg-green-50 rounded p-2">
                    <p className="text-green-700 font-semibold">Solução: {garc.solucao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Otimizações Recomendadas */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            6 Otimizações Prioritárias
          </CardTitle>
          <CardDescription>Ordenadas por impacto e esforço</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {otimizacoes.map((otim, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">{otim.otimizacao}</h4>
                    <p className="text-xs text-slate-500 mt-1">{otim.prioridade}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-700">{otim.roi}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Impacto/Ano</p>
                    <p className="font-bold text-green-600">{otim.impacto}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Esforço</p>
                    <p className="font-bold text-slate-900">{otim.esforço}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Prazo</p>
                    <p className="font-bold text-slate-900">{otim.prazo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Etapa</p>
                    <p className="font-bold text-slate-900 text-xs">{otim.etapa}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Ação</p>
                    <p className="font-bold text-blue-600 text-xs">{otim.acao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise de Comportamento */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Análise de Comportamento
          </CardTitle>
          <CardDescription>Padrões de usuários em cada etapa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analiseComportamento.map((comp, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{comp.comportamento}</h4>
                  <Badge className="bg-purple-100 text-purple-700">{comp.taxa}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Usuários</p>
                    <p className="font-bold text-slate-900">{comp.usuarios.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Tempo</p>
                    <p className="font-bold text-slate-900">{comp.tempo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Conversão</p>
                    <p className="font-bold text-green-600">{comp.conversao}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-500 text-xs">Ação Recomendada</p>
                    <p className="font-bold text-blue-600 text-xs">{comp.acao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Touchpoints para Otimização */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Touchpoints Críticos para Otimizar
          </CardTitle>
          <CardDescription>Maior impacto com menor esforço</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {touchpointsOtimizacao.map((touch, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{touch.touchpoint}</h4>
                  <Badge className="bg-green-100 text-green-700">{touch.impacto}</Badge>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Taxa Atual</p>
                    <p className="font-bold text-slate-900">{touch.taxa}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Problema</p>
                    <p className="font-bold text-red-600 text-xs">{touch.problema}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Solução</p>
                    <p className="font-bold text-blue-600 text-xs">{touch.solucao}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">ROI</p>
                    <p className="font-bold text-green-600">{touch.roi}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações Finais */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-slate-900">✅ Plano de Ação Imediato</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Semana 1: Email Carrinho Abandonado</p>
              <p className="text-slate-600">Implementar fluxo automático - Impacto: R$ 2.1M/ano</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Semana 2-3: Retargeting Dinâmico</p>
              <p className="text-slate-600">Criar públicos por produto - Impacto: R$ 2.4M/ano</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Semana 4: Simplificar Checkout</p>
              <p className="text-slate-600">Reduzir de 5 para 2 etapas - Impacto: R$ 1.8M/ano</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Impacto Total em 30 Dias: R$ 6.3M/ano</p>
              <p className="text-slate-600">ROI médio 12x - Investimento: ~R$ 50K</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
