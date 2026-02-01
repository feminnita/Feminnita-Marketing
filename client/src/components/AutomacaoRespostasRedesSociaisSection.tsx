import { MessageCircle, Zap, CheckCircle, TrendingUp, AlertCircle, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AutomacaoRespostasRedesSociaisSection() {
  const metricas = [
    {
      titulo: "Respostas Automáticas/Dia",
      valor: "1.250",
      descricao: "Comentários e DMs",
      cor: "text-blue-600"
    },
    {
      titulo: "Taxa de Satisfação",
      valor: "92.5%",
      descricao: "Clientes satisfeitos",
      cor: "text-green-600"
    },
    {
      titulo: "Tempo Médio Resposta",
      valor: "2.3 min",
      descricao: "Vs 4h manual",
      cor: "text-purple-600"
    },
    {
      titulo: "SAC Reduzido",
      valor: "-68%",
      descricao: "Menos tickets",
      cor: "text-emerald-600"
    }
  ];

  const fluxosAutomacao = [
    {
      fluxo: "Pergunta sobre Produto",
      trigger: "Comentário com 'qual é', 'qual tamanho', 'qual preço'",
      resposta: "Olá [Nome]! 👋 Ótima pergunta! O Pijama Carol tem [detalhes]. Clique aqui para saber mais: [link]",
      taxa: "94%",
      satisfacao: "95%",
      status: "Ativo"
    },
    {
      fluxo: "Pergunta sobre Entrega",
      trigger: "Comentário com 'quanto tempo', 'quando chega', 'frete'",
      resposta: "Oi [Nome]! 📦 Entregamos em [prazo] dias úteis. Frete: [valor]. Rastreie aqui: [link]",
      taxa: "91%",
      satisfacao: "93%",
      status: "Ativo"
    },
    {
      fluxo: "Reclamação/Problema",
      trigger: "Palavras-chave: 'problema', 'defeito', 'não gostei', 'ruim'",
      resposta: "Desculpa! 😞 Queremos resolver isso. Envie DM com foto/detalhes. Nosso time responde em 2h.",
      taxa: "87%",
      satisfacao: "88%",
      status: "Ativo"
    },
    {
      fluxo: "Elogio/Feedback Positivo",
      trigger: "Palavras-chave: 'amei', 'adorei', 'perfeito', 'muito bom'",
      resposta: "Que alegria! 🎉 Muito obrigada! Compartilhe sua foto com #Feminnita para aparecer em nosso feed!",
      taxa: "96%",
      satisfacao: "98%",
      status: "Ativo"
    },
    {
      fluxo: "Pedido de Cupom/Desconto",
      trigger: "Comentário com 'cupom', 'desconto', 'promoção'",
      resposta: "Ótimo timing! 🎁 Use BEMVINDA15 para 15% OFF na primeira compra. Válido até [data].",
      taxa: "89%",
      satisfacao: "91%",
      status: "Ativo"
    },
    {
      fluxo: "Pergunta sobre Persona",
      trigger: "Comentário com 'qual é melhor', 'qual escolher', 'diferença'",
      resposta: "Ótima dúvida! 🤔 Carol é mais descontraída, Renata é premium, Vanessa é acessível. Qual seu estilo?",
      taxa: "90%",
      satisfacao: "92%",
      status: "Ativo"
    }
  ];

  const canaisIntegrados = [
    {
      canal: "Instagram Comments",
      mencoes_dia: 450,
      respostas_auto: 423,
      taxa_auto: "94%",
      satisfacao: "95%",
      tempo_medio: "1.8 min"
    },
    {
      canal: "Instagram DMs",
      mencoes_dia: 380,
      respostas_auto: 342,
      taxa_auto: "90%",
      satisfacao: "92%",
      tempo_medio: "2.5 min"
    },
    {
      canal: "TikTok Comments",
      mencoes_dia: 280,
      respostas_auto: 268,
      taxa_auto: "96%",
      satisfacao: "94%",
      tempo_medio: "1.5 min"
    },
    {
      canal: "Facebook Comments",
      mencoes_dia: 140,
      respostas_auto: 125,
      taxa_auto: "89%",
      satisfacao: "90%",
      tempo_medio: "3.2 min"
    }
  ];

  const analiseIA = [
    {
      aspecto: "Detecção de Intenção",
      acuracia: "96%",
      descricao: "Identifica pergunta, reclamação, elogio, etc"
    },
    {
      aspecto: "Extração de Contexto",
      acuracia: "94%",
      descricao: "Entende qual produto, persona, problema"
    },
    {
      aspecto: "Geração de Resposta",
      acuracia: "92%",
      descricao: "Cria resposta personalizada e natural"
    },
    {
      aspecto: "Detecção de Escalação",
      acuracia: "98%",
      descricao: "Identifica quando precisa de humano"
    }
  ];

  const casosEscalacao = [
    {
      caso: "Reclamação Severa",
      frequencia: "45/mês",
      tempo_resposta: "15 min",
      satisfacao: "87%",
      acao: "Encaminhar para gerente"
    },
    {
      caso: "Pergunta Complexa",
      frequencia: "32/mês",
      tempo_resposta: "30 min",
      satisfacao: "89%",
      acao: "Encaminhar para especialista"
    },
    {
      caso: "Pedido de Parceria",
      frequencia: "8/mês",
      tempo_resposta: "2h",
      satisfacao: "92%",
      acao: "Encaminhar para marketing"
    },
    {
      caso: "Informação Sensível",
      frequencia: "12/mês",
      tempo_resposta: "1h",
      satisfacao: "90%",
      acao: "Encaminhar para SAC"
    }
  ];

  const impactoNegocio = [
    {
      metrica: "Tempo Economizado",
      valor: "240h/mês",
      descricao: "Vs responder manualmente",
      impacto: "R$ 24K/mês em custos"
    },
    {
      metrica: "Satisfação Cliente",
      valor: "+18%",
      descricao: "Respostas mais rápidas",
      impacto: "+8% retenção"
    },
    {
      metrica: "Conversão de Comentários",
      valor: "+12%",
      descricao: "Mais clientes convertidos",
      impacto: "+R$ 85K/mês"
    },
    {
      metrica: "Redução de SAC",
      valor: "-68%",
      descricao: "Menos tickets",
      impacto: "R$ 18K/mês economia"
    }
  ];

  const sentimentoRespostas = [
    {
      tipo: "Muito Positivo",
      percentual: "45%",
      exemplo: "Amei! Adorei! Perfeito!",
      acao: "Pedir compartilhamento"
    },
    {
      tipo: "Positivo",
      percentual: "35%",
      exemplo: "Gostei, bom produto",
      acao: "Agradecer, oferecer cupom"
    },
    {
      tipo: "Neutro",
      percentual: "15%",
      exemplo: "Qual é o preço?",
      acao: "Responder informação"
    },
    {
      tipo: "Negativo",
      percentual: "5%",
      exemplo: "Não gostei, defeito",
      acao: "Escalar para humano"
    }
  ];

  const comparativoManualVsAuto = [
    {
      aspecto: "Tempo Resposta",
      manual: "4-8 horas",
      automatico: "1-3 minutos",
      melhoria: "99%"
    },
    {
      aspecto: "Disponibilidade",
      manual: "9-18h (horário comercial)",
      automatico: "24/7",
      melhoria: "100%"
    },
    {
      aspecto: "Consistência",
      manual: "Varia por pessoa",
      automatico: "100% consistente",
      melhoria: "95%"
    },
    {
      aspecto: "Custo",
      manual: "R$ 24K/mês",
      automatico: "R$ 2K/mês",
      melhoria: "92%"
    }
  ];

  const exemplosRespostas = [
    {
      comentario: "Oi, qual é o tamanho do Pijama Carol?",
      resposta_ia: "Olá! 👋 O Pijama Carol vem nos tamanhos P, M, G, GG. Qual é seu tamanho? Clique aqui para ver tabela: [link]",
      satisfacao: "95%",
      tempo: "1.2 min"
    },
    {
      comentario: "Quanto tempo demora a entrega?",
      resposta_ia: "Oi! 📦 Entregamos em 7-10 dias úteis para todo Brasil. Frete a partir de R$ 15. Rastreie seu pedido: [link]",
      satisfacao: "93%",
      tempo: "1.5 min"
    },
    {
      comentario: "Adorei! Que pijama lindo!",
      resposta_ia: "Que alegria! 🎉 Muito obrigada! Compartilhe sua foto com #Feminnita para aparecer em nosso feed! 💕",
      satisfacao: "98%",
      tempo: "0.8 min"
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

      {/* Fluxos de Automação */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            6 Fluxos de Automação
          </CardTitle>
          <CardDescription>IA responde comentários e DMs 24/7</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fluxosAutomacao.map((fluxo, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-slate-900">{fluxo.fluxo}</h4>
                  <Badge className="bg-green-100 text-green-700">{fluxo.status}</Badge>
                </div>

                <p className="text-sm text-slate-600 mb-2">Trigger: {fluxo.trigger}</p>
                <div className="bg-slate-100 rounded p-3 mb-3 text-sm text-slate-700">
                  <p className="italic">"{fluxo.resposta}"</p>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Taxa</p>
                    <p className="font-bold text-green-600">{fluxo.taxa}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Satisfação</p>
                    <p className="font-bold text-green-600">{fluxo.satisfacao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Canais Integrados */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            4 Canais Integrados
          </CardTitle>
          <CardDescription>1.250 respostas automáticas/dia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {canaisIntegrados.map((canal, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 bg-white">
                <h4 className="font-semibold text-slate-900 mb-3">{canal.canal}</h4>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Menções/Dia</p>
                    <p className="font-bold text-slate-900">{canal.mencoes_dia}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Respostas Auto</p>
                    <p className="font-bold text-green-600">{canal.respostas_auto}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Taxa Auto</p>
                    <p className="font-bold text-green-600">{canal.taxa_auto}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Satisfação</p>
                    <p className="font-bold text-green-600">{canal.satisfacao}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Tempo Médio</p>
                    <p className="font-bold text-slate-900">{canal.tempo_medio}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Análise de IA */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            4 Capacidades de IA
          </CardTitle>
          <CardDescription>Acurácia média: 95%</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {analiseIA.map((ia, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{ia.aspecto}</h4>
                  <Badge className="bg-green-100 text-green-700">{ia.acuracia}</Badge>
                </div>
                <p className="text-sm text-slate-600">{ia.descricao}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Casos de Escalação */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            4 Casos de Escalação
          </CardTitle>
          <CardDescription>Quando IA encaminha para humano</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {casosEscalacao.map((caso, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{caso.caso}</h4>
                  <Badge className="bg-orange-100 text-orange-700">{caso.satisfacao}</Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Frequência</p>
                    <p className="font-bold text-slate-900">{caso.frequencia}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Tempo Resposta</p>
                    <p className="font-bold text-slate-900">{caso.tempo_resposta}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-slate-500 text-xs">Ação</p>
                    <p className="font-bold text-slate-900 text-xs">{caso.acao}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impacto de Negócio */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            4 Impactos de Negócio
          </CardTitle>
          <CardDescription>Resultados da automação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {impactoNegocio.map((imp, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 bg-white">
                <h4 className="font-semibold text-slate-900 mb-2">{imp.metrica}</h4>
                <div className="text-3xl font-bold text-green-600 mb-2">{imp.valor}</div>
                <p className="text-sm text-slate-600 mb-2">{imp.descricao}</p>
                <div className="bg-green-50 rounded p-2 text-xs text-green-700">
                  <p className="font-semibold">→ {imp.impacto}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sentimento de Respostas */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Distribuição de Sentimento
          </CardTitle>
          <CardDescription>Tipos de comentários recebidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sentimentoRespostas.map((sent, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{sent.tipo}</h4>
                  <Badge className="bg-purple-100 text-purple-700">{sent.percentual}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Exemplo</p>
                    <p className="font-bold text-slate-900 text-xs">{sent.exemplo}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Ação IA</p>
                    <p className="font-bold text-slate-900 text-xs">{sent.acao}</p>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{width: sent.percentual}}></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Comparativo Manual vs Automático */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="text-slate-900">Manual vs Automático</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {comparativoManualVsAuto.map((comp, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4">
                <h4 className="font-semibold text-slate-900 mb-3">{comp.aspecto}</h4>

                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Manual</p>
                    <p className="font-bold text-red-600">{comp.manual}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Automático</p>
                    <p className="font-bold text-green-600">{comp.automatico}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Melhoria</p>
                    <p className="font-bold text-green-600">{comp.melhoria}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Exemplos de Respostas */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-slate-900">3 Exemplos de Respostas IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {exemplosRespostas.map((ex, idx) => (
              <div key={idx} className="border border-purple-200 rounded-lg p-4 bg-white">
                <div className="bg-slate-100 rounded p-2 mb-2 text-sm text-slate-700">
                  <p className="font-semibold">Comentário:</p>
                  <p className="italic">"{ex.comentario}"</p>
                </div>

                <div className="bg-green-50 rounded p-2 mb-2 text-sm text-green-700">
                  <p className="font-semibold">Resposta IA:</p>
                  <p className="italic">"{ex.resposta_ia}"</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Satisfação</p>
                    <p className="font-bold text-green-600">{ex.satisfacao}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Tempo</p>
                    <p className="font-bold text-slate-900">{ex.tempo}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recomendação Final */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="text-slate-900">✅ Benefícios da Automação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">240h/mês economizadas</p>
              <p className="text-slate-600">Reduz custos em R$ 24K/mês</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Respostas 24/7</p>
              <p className="text-slate-600">Disponível mesmo fora do horário comercial</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">+18% satisfação</p>
              <p className="text-slate-600">Respostas mais rápidas e consistentes</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">+R$ 85K/mês receita</p>
              <p className="text-slate-600">Mais conversões de comentários</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
