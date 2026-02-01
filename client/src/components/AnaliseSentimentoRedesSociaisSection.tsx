import { Heart, TrendingUp, AlertCircle, MessageCircle, Zap, CheckCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AnaliseSentimentoRedesSociaisSection() {
  const metricas = [
    {
      titulo: "Menções/Dia",
      valor: "2.450",
      descricao: "Marca Feminnita",
      cor: "text-blue-600"
    },
    {
      titulo: "Sentimento Positivo",
      valor: "78.5%",
      descricao: "Vs 65% concorrentes",
      cor: "text-green-600"
    },
    {
      titulo: "Oportunidades Virais",
      valor: "12",
      descricao: "Identificadas este mês",
      cor: "text-purple-600"
    },
    {
      titulo: "Impacto Potencial",
      valor: "R$ 850K",
      descricao: "Se explorar virais",
      cor: "text-emerald-600"
    }
  ];

  const sentimentoPorRede = [
    {
      rede: "TikTok",
      mencoes: 1.250,
      positivo: "82%",
      neutro: "12%",
      negativo: "6%",
      engajamento: "8.5%",
      trending: "🔥 Muito Alto"
    },
    {
      rede: "Instagram",
      mencoes: 850,
      positivo: "76%",
      neutro: "15%",
      negativo: "9%",
      engajamento: "6.2%",
      trending: "🟢 Alto"
    },
    {
      rede: "Facebook",
      mencoes: 280,
      positivo: "72%",
      neutro: "18%",
      negativo: "10%",
      engajamento: "4.1%",
      trending: "🟡 Médio"
    },
    {
      rede: "YouTube",
      mencoes: 70,
      positivo: "85%",
      neutro: "10%",
      negativo: "5%",
      engajamento: "12.3%",
      trending: "🟢 Alto"
    }
  ];

  const oportunidadesVirais = [
    {
      titulo: "#PijamaChallenge",
      rede: "TikTok",
      mencoes: 45.230,
      engajamento: "18.5%",
      alcance: "2.1M",
      sentimento: "Positivo",
      acao: "Criar resposta oficial",
      impacto: "R$ 250K"
    },
    {
      titulo: "Pijama Carol em Trending",
      rede: "TikTok",
      mencoes: 32.150,
      engajamento: "15.2%",
      alcance: "1.8M",
      sentimento: "Positivo",
      acao: "Amplificar com ads",
      impacto: "R$ 180K"
    },
    {
      titulo: "Review Influencer Luiza",
      rede: "Instagram",
      mencoes: 18.900,
      engajamento: "22.3%",
      alcance: "950K",
      sentimento: "Positivo",
      acao: "Fazer parceria",
      impacto: "R$ 220K"
    },
    {
      titulo: "Meme Robe Renata",
      rede: "TikTok",
      mencoes: 12.340,
      engajamento: "16.8%",
      alcance: "680K",
      sentimento: "Positivo",
      acao: "Repostar e engajar",
      impacto: "R$ 120K"
    },
    {
      titulo: "Conteúdo UGC Vanessa",
      rede: "Instagram",
      mencoes: 8.560,
      engajamento: "19.5%",
      alcance: "420K",
      sentimento: "Positivo",
      acao: "Repostar e dar crédito",
      impacto: "R$ 95K"
    }
  ];

  const alertasNegativosRiscos = [
    {
      alerta: "Reclamação sobre Entrega",
      rede: "Twitter/X",
      mencoes: 45,
      sentimento: "Negativo",
      severidade: "🔴 Alta",
      acao: "Responder em 2h",
      status: "Monitorando"
    },
    {
      alerta: "Qualidade Questionada",
      rede: "Instagram",
      mencoes: 28,
      sentimento: "Negativo",
      severidade: "🟡 Média",
      acao: "Enviar amostra",
      status: "Respondido"
    },
    {
      alerta: "Comparação com Concorrente",
      rede: "TikTok",
      mencoes: 15,
      sentimento: "Negativo",
      severidade: "🟢 Baixa",
      acao: "Monitorar",
      status: "Monitorando"
    }
  ];

  const influenciadoresChave = [
    {
      influenciador: "Carol Influencer",
      rede: "TikTok",
      seguidores: "850K",
      engajamento: "12.5%",
      sentimento: "Positivo",
      mencoes: 156,
      ultimaMencao: "Ontem",
      acao: "Parceria"
    },
    {
      influenciador: "Renata Beauty",
      rede: "Instagram",
      seguidores: "320K",
      engajamento: "8.3%",
      sentimento: "Positivo",
      mencoes: 89,
      ultimaMencao: "3 dias",
      acao: "Enviar amostra"
    },
    {
      influenciador: "Vanessa Lifestyle",
      rede: "YouTube",
      seguidores: "180K",
      engajamento: "15.2%",
      sentimento: "Positivo",
      mencoes: 42,
      ultimaMencao: "1 semana",
      acao: "Contato"
    },
    {
      influenciador: "Luiza Trends",
      rede: "TikTok",
      seguidores: "520K",
      engajamento: "14.8%",
      sentimento: "Positivo",
      mencoes: 203,
      ultimaMencao: "Hoje",
      acao: "Oferta Exclusiva"
    }
  ];

  const tendenciasConteudo = [
    {
      tendencia: "Unboxing Pijama",
      rede: "TikTok",
      videos: 2.340,
      views: "125M",
      crescimento: "+45%",
      sentimento: "Positivo",
      recomendacao: "Criar série de unboxing"
    },
    {
      tendencia: "Pijama Party",
      rede: "Instagram",
      posts: 890,
      engagement: "18.5%",
      crescimento: "+32%",
      sentimento: "Positivo",
      recomendacao: "Criar conteúdo temático"
    },
    {
      tendencia: "Conforto em Casa",
      rede: "Pinterest",
      pins: 1.250,
      clicks: "45K",
      crescimento: "+28%",
      sentimento: "Positivo",
      recomendacao: "Amplificar em Pinterest"
    },
    {
      tendencia: "Moda Sustentável",
      rede: "Instagram",
      posts: 560,
      engagement: "22.3%",
      crescimento: "+18%",
      sentimento: "Positivo",
      recomendacao: "Destacar materiais eco"
    }
  ];

  const comparativoComConcorrentes = [
    {
      metrica: "Sentimento Positivo",
      feminnita: "78.5%",
      concorrente1: "65.2%",
      concorrente2: "71.8%",
      posicao: "🥇 1º lugar"
    },
    {
      metrica: "Engajamento Médio",
      feminnita: "9.2%",
      concorrente1: "6.8%",
      concorrente2: "7.5%",
      posicao: "🥇 1º lugar"
    },
    {
      metrica: "Menções/Dia",
      feminnita: "2.450",
      concorrente1: "1.820",
      concorrente2: "1.950",
      posicao: "🥇 1º lugar"
    },
    {
      metrica: "Influenciadores Ativos",
      feminnita: "156",
      concorrente1: "89",
      concorrente2: "112",
      posicao: "🥇 1º lugar"
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

      {/* Sentimento por Rede */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-600" />
            Sentimento por Rede Social
          </CardTitle>
          <CardDescription>Análise de 2.450 menções diárias</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sentimentoPorRede.map((rede, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{rede.rede}</h4>
                  <Badge className="bg-blue-100 text-blue-700">{rede.trending}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Menções</p>
                    <p className="font-bold text-slate-900">{rede.mencoes.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Positivo</p>
                    <p className="font-bold text-green-600">{rede.positivo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Neutro</p>
                    <p className="font-bold text-slate-600">{rede.neutro}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Negativo</p>
                    <p className="font-bold text-red-600">{rede.negativo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Engajamento</p>
                    <p className="font-bold text-purple-600">{rede.engajamento}</p>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{width: rede.positivo}}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Oportunidades Virais */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            5 Oportunidades Virais Identificadas
          </CardTitle>
          <CardDescription>Impacto potencial: R$ 850K</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {oportunidadesVirais.map((oport, idx) => (
              <div key={idx} className="border border-purple-200 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{oport.titulo}</h4>
                  <Badge className="bg-purple-100 text-purple-700">{oport.rede}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Menções</p>
                    <p className="font-bold text-slate-900">{oport.mencoes.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Engajamento</p>
                    <p className="font-bold text-purple-600">{oport.engajamento}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Alcance</p>
                    <p className="font-bold text-slate-900">{oport.alcance}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Impacto</p>
                    <p className="font-bold text-green-600">{oport.impacto}</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded p-2 text-xs text-green-700">
                  <p className="font-semibold">Ação: {oport.acao}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Negativos */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Alertas de Riscos (Monitoramento)
          </CardTitle>
          <CardDescription>3 alertas negativos identificados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertasNegativosRiscos.map((alerta, idx) => (
              <div key={idx} className="border border-red-200 rounded-lg p-4 bg-red-50/30">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{alerta.alerta}</h4>
                  <Badge className="bg-red-100 text-red-700">{alerta.severidade}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Rede</p>
                    <p className="font-bold text-slate-900">{alerta.rede}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Menções</p>
                    <p className="font-bold text-red-600">{alerta.mencoes}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Ação</p>
                    <p className="font-bold text-blue-600 text-xs">{alerta.acao}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Status</p>
                    <p className="font-bold text-slate-900">{alerta.status}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Influenciadores Chave */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            4 Influenciadores Chave
          </CardTitle>
          <CardDescription>Menções positivas e oportunidades de parceria</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {influenciadoresChave.map((inf, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{inf.influenciador}</h4>
                  <Badge className="bg-blue-100 text-blue-700">{inf.rede}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Seguidores</p>
                    <p className="font-bold text-slate-900">{inf.seguidores}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Engajamento</p>
                    <p className="font-bold text-purple-600">{inf.engajamento}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Menções</p>
                    <p className="font-bold text-green-600">{inf.mencoes}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Última Menção</p>
                    <p className="font-bold text-slate-900">{inf.ultimaMencao}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Ação</p>
                    <p className="font-bold text-blue-600">{inf.acao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tendências de Conteúdo */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            4 Tendências de Conteúdo em Alta
          </CardTitle>
          <CardDescription>Oportunidades de conteúdo para explorar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tendenciasConteudo.map((tend, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{tend.tendencia}</h4>
                  <Badge className="bg-green-100 text-green-700">{tend.crescimento}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Rede</p>
                    <p className="font-bold text-slate-900">{tend.rede}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Volume</p>
                    <p className="font-bold text-slate-900">
                      {tend.videos || tend.posts || tend.pins}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Alcance</p>
                    <p className="font-bold text-purple-600">
                      {tend.views || tend.engagement || tend.clicks}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded p-2 text-xs text-blue-700 mt-2">
                  <p className="font-semibold">💡 {tend.recomendacao}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparativo com Concorrentes */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Posicionamento vs Concorrentes
          </CardTitle>
          <CardDescription>Feminnita lidera em todas as métricas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {comparativoComConcorrentes.map((comp, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 bg-white">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{comp.metrica}</h4>
                  <Badge className="bg-gold-100 text-yellow-700">{comp.posicao}</Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div className="bg-green-50 rounded p-2">
                    <p className="text-slate-500 text-xs">Feminnita</p>
                    <p className="font-bold text-green-600">{comp.feminnita}</p>
                  </div>
                  <div className="bg-slate-50 rounded p-2">
                    <p className="text-slate-500 text-xs">Concorrente 1</p>
                    <p className="font-bold text-slate-600">{comp.concorrente1}</p>
                  </div>
                  <div className="bg-slate-50 rounded p-2">
                    <p className="text-slate-500 text-xs">Concorrente 2</p>
                    <p className="font-bold text-slate-600">{comp.concorrente2}</p>
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
          <CardTitle className="text-slate-900">✅ Recomendações Imediatas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Explorar #PijamaChallenge</p>
              <p className="text-slate-600">45K menções, 18.5% engajamento - Criar resposta oficial em 24h</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Parceria com Luiza Trends</p>
              <p className="text-slate-600">520K seguidores, 203 menções - Oferta exclusiva para collab</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Responder Alerta de Entrega</p>
              <p className="text-slate-600">45 menções negativas - Resolver em 2h para evitar escalação</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
