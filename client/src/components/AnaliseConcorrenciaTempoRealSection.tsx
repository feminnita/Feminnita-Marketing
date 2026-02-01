import { TrendingUp, AlertCircle, CheckCircle, Target, BarChart3, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AnaliseConcorrenciaTempoRealSection() {
  const metricas = [
    {
      titulo: "Concorrentes Monitorados",
      valor: "3",
      descricao: "Principais players",
      cor: "text-blue-600"
    },
    {
      titulo: "Atualizações/Dia",
      valor: "48",
      descricao: "Preços, promoções, posts",
      cor: "text-orange-600"
    },
    {
      titulo: "Vantagem Competitiva",
      valor: "+28%",
      descricao: "Vs concorrentes",
      cor: "text-green-600"
    },
    {
      titulo: "Oportunidades",
      valor: "12",
      descricao: "Identificadas este mês",
      cor: "text-purple-600"
    }
  ];

  const concorrentes = [
    {
      nome: "Concorrente A - Pijamas Premium",
      site: "www.concorrente-a.com.br",
      preco_medio: "R$ 185",
      seu_preco: "R$ 125",
      diferenca: "-32%",
      posicao: "🥇 Feminnita lidera"
    },
    {
      nome: "Concorrente B - Pijamas Acessíveis",
      site: "www.concorrente-b.com.br",
      preco_medio: "R$ 95",
      seu_preco: "R$ 125",
      diferenca: "+32%",
      posicao: "⚠️ Preço mais alto"
    },
    {
      nome: "Concorrente C - Pijamas Luxo",
      site: "www.concorrente-c.com.br",
      preco_medio: "R$ 250",
      seu_preco: "R$ 125",
      diferenca: "-50%",
      posicao: "🥇 Feminnita lidera"
    }
  ];

  const comparativoPrecos = [
    {
      produto: "Pijama Carol",
      feminnita: "R$ 125",
      concorrente_a: "R$ 185",
      concorrente_b: "R$ 89",
      concorrente_c: "R$ 220",
      posicao: "Competitivo"
    },
    {
      produto: "Robe Renata",
      feminnita: "R$ 150",
      concorrente_a: "R$ 210",
      concorrente_b: "R$ 110",
      concorrente_c: "R$ 280",
      posicao: "Competitivo"
    },
    {
      produto: "Pijama Vanessa",
      feminnita: "R$ 100",
      concorrente_a: "R$ 145",
      concorrente_b: "R$ 75",
      concorrente_c: "R$ 180",
      posicao: "Competitivo"
    },
    {
      produto: "Pijama Luiza",
      feminnita: "R$ 130",
      concorrente_a: "R$ 175",
      concorrente_b: "R$ 95",
      concorrente_c: "R$ 240",
      posicao: "Competitivo"
    }
  ];

  const promocoesMonitoradas = [
    {
      concorrente: "Concorrente A",
      promocao: "Black Friday Antecipada",
      desconto: "-25%",
      validade: "Até 31/01",
      impacto: "Alto",
      acao: "Criar promoção similar"
    },
    {
      concorrente: "Concorrente B",
      promocao: "Frete Grátis",
      desconto: "Frete 0",
      validade: "Indefinido",
      impacto: "Médio",
      acao: "Monitorar"
    },
    {
      concorrente: "Concorrente C",
      promocao: "Cupom 20% OFF",
      desconto: "-20%",
      validade: "Até 28/02",
      impacto: "Alto",
      acao: "Oferecer 25% OFF"
    },
    {
      concorrente: "Concorrente A",
      promocao: "Combo 2+1",
      desconto: "Compre 2, leve 3",
      validade: "Até 15/02",
      impacto: "Alto",
      acao: "Criar promoção bundle"
    }
  ];

  const estrategiasConteudo = [
    {
      concorrente: "Concorrente A",
      estrategia: "Influenciadores Premium",
      canais: "Instagram, TikTok",
      frequencia: "3-4 posts/dia",
      engajamento: "8.5%",
      nossa_estrategia: "Aumentar influenciadores em 40%"
    },
    {
      concorrente: "Concorrente B",
      estrategia: "Conteúdo UGC",
      canais: "Instagram, Pinterest",
      frequencia: "2-3 posts/dia",
      engajamento: "6.2%",
      nossa_estrategia: "Manter UGC atual"
    },
    {
      concorrente: "Concorrente C",
      estrategia: "Vídeos Longos",
      canais: "YouTube, TikTok",
      frequencia: "1-2 vídeos/dia",
      engajamento: "12.1%",
      nossa_estrategia: "Criar série de vídeos"
    }
  ];

  const alertasCompetitivos = [
    {
      alerta: "Concorrente A lança nova linha",
      data: "Hoje",
      impacto: "Alto",
      acao: "Analisar posicionamento",
      status: "Crítico"
    },
    {
      alerta: "Concorrente B reduz preço em 15%",
      data: "Ontem",
      impacto: "Médio",
      acao: "Avaliar resposta",
      status: "Médio"
    },
    {
      alerta: "Concorrente C faz parceria com influenciador",
      data: "3 dias",
      impacto: "Alto",
      acao: "Buscar influenciadores similares",
      status: "Crítico"
    },
    {
      alerta: "Concorrente A aumenta investimento em ads",
      data: "1 semana",
      impacto: "Médio",
      acao: "Aumentar budget Meta",
      status: "Médio"
    }
  ];

  const vantagensCompetitivas = [
    {
      vantagem: "Preço",
      feminnita: "R$ 125 (média)",
      concorrentes: "R$ 165 (média)",
      diferenca: "-24%",
      impacto: "Alto"
    },
    {
      vantagem: "Personas Humanizadas",
      feminnita: "4 personas",
      concorrentes: "Genérico",
      diferenca: "Exclusiva",
      impacto: "Alto"
    },
    {
      vantagem: "Engajamento",
      feminnita: "14.2%",
      concorrentes: "8.9%",
      diferenca: "+60%",
      impacto: "Alto"
    },
    {
      vantagem: "Inovação",
      feminnita: "IA, ML, Automação",
      concorrentes: "Básico",
      diferenca: "Avançada",
      impacto: "Médio"
    }
  ];

  const oportunidadesGap = [
    {
      oportunidade: "Concorrente A não tem WhatsApp",
      gap: "Implementar WhatsApp +R$ 500K/mês",
      prazo: "Imediato",
      impacto: "Alto"
    },
    {
      oportunidade: "Concorrente B não faz email marketing",
      gap: "Email marketing +R$ 200K/mês",
      prazo: "1 semana",
      impacto: "Médio"
    },
    {
      oportunidade: "Concorrente C não usa IA para SAC",
      gap: "Automação IA +R$ 85K/mês",
      prazo: "2 semanas",
      impacto: "Alto"
    },
    {
      oportunidade: "Ninguém faz previsão de demanda com ML",
      gap: "ML +R$ 150K/mês",
      prazo: "Contínuo",
      impacto: "Alto"
    }
  ];

  const analiseForçasFraquezas = [
    {
      aspecto: "Preço",
      feminnita: "🟢 Forte",
      concorrente_a: "🔴 Fraco",
      concorrente_b: "🟢 Forte",
      concorrente_c: "🔴 Fraco"
    },
    {
      aspecto: "Engajamento",
      feminnita: "🟢 Forte",
      concorrente_a: "🟡 Médio",
      concorrente_b: "🟡 Médio",
      concorrente_c: "🟢 Forte"
    },
    {
      aspecto: "Inovação",
      feminnita: "🟢 Forte",
      concorrente_a: "🟡 Médio",
      concorrente_b: "🔴 Fraco",
      concorrente_c: "🟡 Médio"
    },
    {
      aspecto: "Atendimento",
      feminnita: "🟢 Forte",
      concorrente_a: "🟡 Médio",
      concorrente_b: "🟡 Médio",
      concorrente_c: "🟡 Médio"
    }
  ];

  const recomendacoesEstrategicas = [
    {
      recomendacao: "Manter Liderança em Preço",
      acao: "Monitorar preços diariamente, responder em 24h",
      impacto: "Manter +24% vantagem",
      prazo: "Contínuo"
    },
    {
      recomendacao: "Aumentar Diferenciação",
      acao: "Enfatizar personas, IA, automação",
      impacto: "Aumentar brand value",
      prazo: "30 dias"
    },
    {
      recomendacao: "Explorar Gaps",
      acao: "Implementar WhatsApp, Email, IA",
      impacto: "+R$ 785K/mês",
      prazo: "60 dias"
    },
    {
      recomendacao: "Acelerar Inovação",
      acao: "Lançar ML, previsão, automação",
      impacto: "Criar moat competitivo",
      prazo: "90 dias"
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

      {/* Concorrentes */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            3 Concorrentes Monitorados
          </CardTitle>
          <CardDescription>Análise atualizada a cada 6 horas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {concorrentes.map((conc, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{conc.nome}</h4>
                  <Badge className="bg-blue-100 text-blue-700">{conc.posicao}</Badge>
                </div>

                <p className="text-xs text-slate-500 mb-3">{conc.site}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Preço Médio</p>
                    <p className="font-bold text-slate-900">{conc.preco_medio}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Seu Preço</p>
                    <p className="font-bold text-green-600">{conc.seu_preco}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-500 text-xs">Diferença</p>
                    <p className="font-bold text-green-600">{conc.diferenca}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparativo de Preços */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-green-600" />
            Comparativo de Preços por Produto
          </CardTitle>
          <CardDescription>Feminnita vs 3 concorrentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {comparativoPrecos.map((comp, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 bg-white">
                <h4 className="font-semibold text-slate-900 mb-3">{comp.produto}</h4>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div className="bg-green-50 rounded p-2">
                    <p className="text-slate-500 text-xs">Feminnita</p>
                    <p className="font-bold text-green-600">{comp.feminnita}</p>
                  </div>
                  <div className="bg-slate-50 rounded p-2">
                    <p className="text-slate-500 text-xs">Conc. A</p>
                    <p className="font-bold text-slate-600">{comp.concorrente_a}</p>
                  </div>
                  <div className="bg-slate-50 rounded p-2">
                    <p className="text-slate-500 text-xs">Conc. B</p>
                    <p className="font-bold text-slate-600">{comp.concorrente_b}</p>
                  </div>
                  <div className="bg-slate-50 rounded p-2">
                    <p className="text-slate-500 text-xs">Conc. C</p>
                    <p className="font-bold text-slate-600">{comp.concorrente_c}</p>
                  </div>
                  <div className="bg-blue-50 rounded p-2">
                    <p className="text-slate-500 text-xs">Posição</p>
                    <p className="font-bold text-blue-600 text-xs">{comp.posicao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Promoções Monitoradas */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-600" />
            4 Promoções Monitoradas
          </CardTitle>
          <CardDescription>Atualizadas em tempo real</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {promocoesMonitoradas.map((promo, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{promo.concorrente}</h4>
                  <Badge className={
                    promo.impacto === "Alto" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }>
                    {promo.impacto}
                  </Badge>
                </div>

                <p className="text-sm text-slate-600 mb-2">{promo.promocao}</p>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Desconto</p>
                    <p className="font-bold text-slate-900">{promo.desconto}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Validade</p>
                    <p className="font-bold text-slate-900 text-xs">{promo.validade}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-500 text-xs">Ação Recomendada</p>
                    <p className="font-bold text-blue-600 text-xs">{promo.acao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estratégias de Conteúdo */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            3 Estratégias de Conteúdo
          </CardTitle>
          <CardDescription>Como concorrentes estão atuando</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {estrategiasConteudo.map((est, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">{est.concorrente}</h4>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-2">
                  <div>
                    <p className="text-slate-500 text-xs">Estratégia</p>
                    <p className="font-bold text-slate-900 text-xs">{est.estrategia}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Canais</p>
                    <p className="font-bold text-slate-900 text-xs">{est.canais}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Frequência</p>
                    <p className="font-bold text-slate-900 text-xs">{est.frequencia}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Engajamento</p>
                    <p className="font-bold text-purple-600">{est.engajamento}</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded p-2 text-xs text-blue-700">
                  <p className="font-semibold">Nossa estratégia: {est.nossa_estrategia}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Competitivos */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            4 Alertas Competitivos
          </CardTitle>
          <CardDescription>Ações dos concorrentes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertasCompetitivos.map((alerta, idx) => (
              <div key={idx} className="border border-red-200 rounded-lg p-4 bg-red-50/30">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{alerta.alerta}</h4>
                  <Badge className={
                    alerta.status === "Crítico" ? "bg-red-100 text-red-700" :
                    "bg-yellow-100 text-yellow-700"
                  }>
                    {alerta.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Data</p>
                    <p className="font-bold text-slate-900">{alerta.data}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Impacto</p>
                    <p className="font-bold text-red-600">{alerta.impacto}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-500 text-xs">Ação</p>
                    <p className="font-bold text-slate-900 text-xs">{alerta.acao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Vantagens Competitivas */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            4 Vantagens Competitivas
          </CardTitle>
          <CardDescription>Onde Feminnita lidera</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {vantagensCompetitivas.map((vant, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{vant.vantagem}</h4>
                  <Badge className="bg-green-100 text-green-700">{vant.impacto}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Feminnita</p>
                    <p className="font-bold text-green-600">{vant.feminnita}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Concorrentes</p>
                    <p className="font-bold text-slate-600">{vant.concorrentes}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Diferença</p>
                    <p className="font-bold text-green-600">{vant.diferenca}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Oportunidades de Gap */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-slate-900">4 Oportunidades de Gap</CardTitle>
          <CardDescription>O que concorrentes não fazem</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {oportunidadesGap.map((oportun, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-2">{oportun.oportunidade}</h4>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Gap</p>
                    <p className="font-bold text-green-600 text-xs">{oportun.gap}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Prazo</p>
                    <p className="font-bold text-slate-900">{oportun.prazo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Impacto</p>
                    <p className="font-bold text-green-600">{oportun.impacto}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise Forças/Fraquezas */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-slate-900">Análise de Forças e Fraquezas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analiseForçasFraquezas.map((analise, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">{analise.aspecto}</h4>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Feminnita</p>
                    <p className="font-bold text-slate-900">{analise.feminnita}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Conc. A</p>
                    <p className="font-bold text-slate-900">{analise.concorrente_a}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Conc. B</p>
                    <p className="font-bold text-slate-900">{analise.concorrente_b}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Conc. C</p>
                    <p className="font-bold text-slate-900">{analise.concorrente_c}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendações Estratégicas */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-slate-900">✅ 4 Recomendações Estratégicas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recomendacoesEstrategicas.map((rec, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 bg-white">
                <h4 className="font-semibold text-slate-900 mb-2">{rec.recomendacao}</h4>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Ação</p>
                    <p className="font-bold text-slate-900 text-xs">{rec.acao}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Impacto</p>
                    <p className="font-bold text-green-600 text-xs">{rec.impacto}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Prazo</p>
                    <p className="font-bold text-slate-900">{rec.prazo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
