import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function AgendamentoInteligenteSection() {
  const [recomendacoes, setRecomendacoes] = useState([
    {
      id: 1,
      persona: "Carol (Renda Extra)",
      tipo: "story",
      horarioRecomendado: "19:30",
      confianca: 94,
      engajamentoEstimado: 12.5,
      conversoeEstimadas: 156,
      motivo: "Pessoas buscam renda extra após trabalho",
      dados: {
        melhorHorario: "19:00-20:00",
        diasMelhores: ["Terça", "Quinta", "Sexta"],
        frequenciaOtima: "2x por dia",
        taxaConversaoMedia: "8.2%"
      }
    },
    {
      id: 2,
      persona: "Renata (Lojista)",
      tipo: "reels",
      horarioRecomendado: "09:00",
      confianca: 88,
      engajamentoEstimado: 9.8,
      conversoeEstimadas: 134,
      motivo: "Lojistas checam redes sociais pela manhã",
      dados: {
        melhorHorario: "08:30-10:00",
        diasMelhores: ["Segunda", "Quarta", "Sexta"],
        frequenciaOtima: "1x por dia",
        taxaConversaoMedia: "6.5%"
      }
    },
    {
      id: 3,
      persona: "Vanessa (Compra Coletiva)",
      tipo: "tiktok",
      horarioRecomendado: "20:00",
      confianca: 91,
      engajamentoEstimado: 15.3,
      conversoeEstimadas: 189,
      motivo: "Famílias se reúnem à noite para decidir compras",
      dados: {
        melhorHorario: "19:30-21:00",
        diasMelhores: ["Quinta", "Sexta", "Sábado"],
        frequenciaOtima: "1x por dia",
        taxaConversaoMedia: "7.8%"
      }
    },
    {
      id: 4,
      persona: "Luiza (Trendsetter)",
      tipo: "reels",
      horarioRecomendado: "18:00",
      confianca: 86,
      engajamentoEstimado: 11.2,
      conversoeEstimadas: 145,
      motivo: "Trendsetters acompanham redes sociais no final da tarde",
      dados: {
        melhorHorario: "17:30-19:00",
        diasMelhores: ["Terça", "Quarta", "Quinta"],
        frequenciaOtima: "1x por dia",
        taxaConversaoMedia: "7.1%"
      }
    }
  ]);

  const [agendamentos, setAgendamentos] = useState([
    {
      id: 1,
      titulo: "Story - Renda Extra Carol",
      persona: "Carol",
      tipo: "story",
      horarioAgendado: "19:30",
      data: "2026-02-03",
      status: "agendado",
      confianca: 94
    },
    {
      id: 2,
      titulo: "Reels - Bastidores Renata",
      persona: "Renata",
      tipo: "reels",
      horarioAgendado: "09:00",
      data: "2026-02-04",
      status: "agendado",
      confianca: 88
    }
  ]);

  const [novoAgendamento, setNovoAgendamento] = useState(false);

  const agendar = (rec: any) => {
    const hoje = new Date();
    const amanha = new Date(hoje.getTime() + 24 * 60 * 60 * 1000);
    const dataFormatada = amanha.toISOString().split('T')[0];

    setAgendamentos([...agendamentos, {
      id: agendamentos.length + 1,
      titulo: `${rec.tipo.charAt(0).toUpperCase() + rec.tipo.slice(1)} - ${rec.persona}`,
      persona: rec.persona,
      tipo: rec.tipo,
      horarioAgendado: rec.horarioRecomendado,
      data: dataFormatada,
      status: "agendado",
      confianca: rec.confianca
    }]);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Agendamento Inteligente</h2>
        <p className="text-slate-600">
          Use machine learning para sugerir melhor horário de postagem baseado em histórico de engajamento de cada persona.
        </p>
      </div>

      {/* Recomendações Inteligentes */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">🤖 Recomendações Inteligentes</h3>
        
        {recomendacoes.map((rec) => (
          <Card key={rec.id} className="border-l-4 border-l-purple-400 hover:border-l-purple-600 transition">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <CardTitle className="text-base">{rec.persona} - {rec.tipo.toUpperCase()}</CardTitle>
                  <CardDescription>{rec.motivo}</CardDescription>
                </div>
                <Badge className="bg-purple-600">
                  {rec.confianca}% confiança
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Horário Recomendado */}
              <div className="grid md:grid-cols-4 gap-3">
                <div className="border border-purple-200 rounded-lg p-3 bg-purple-50">
                  <p className="text-xs font-semibold text-purple-600 uppercase mb-1">Horário Ideal</p>
                  <p className="text-2xl font-bold text-purple-900">{rec.horarioRecomendado}</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Engajamento Est.</p>
                  <p className="text-2xl font-bold text-blue-600">{rec.engajamentoEstimado}%</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Conversões Est.</p>
                  <p className="text-2xl font-bold text-green-600">{rec.conversoeEstimadas}</p>
                </div>
                <div className="border border-slate-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-slate-600 uppercase mb-1">Taxa Conv.</p>
                  <p className="text-2xl font-bold text-orange-600">{rec.dados.taxaConversaoMedia}</p>
                </div>
              </div>

              {/* Dados Detalhados */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-2">
                <div className="grid md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">Melhor Horário</p>
                    <p className="text-slate-600">{rec.dados.melhorHorario}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Dias Melhores</p>
                    <p className="text-slate-600">{rec.dados.diasMelhores.join(", ")}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Frequência Ótima</p>
                    <p className="text-slate-600">{rec.dados.frequenciaOtima}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Taxa de Conversão</p>
                    <p className="text-slate-600">{rec.dados.taxaConversaoMedia}</p>
                  </div>
                </div>
              </div>

              {/* Botão Agendar */}
              <Button 
                onClick={() => agendar(rec)}
                className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
              >
                <Calendar className="w-4 h-4" />
                Agendar para Amanhã
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agendamentos Confirmados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Agendamentos Confirmados
          </CardTitle>
          <CardDescription>Posts agendados para publicação automática</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {agendamentos.length > 0 ? (
            agendamentos.map((ag) => (
              <div key={ag.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900">{ag.titulo}</h4>
                    <p className="text-xs text-slate-600">{ag.data} às {ag.horarioAgendado}</p>
                  </div>
                  <Badge className="bg-green-600">✅ {ag.status}</Badge>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 text-xs">
                    <p className="text-slate-600">Confiança: <span className="font-bold text-slate-900">{ag.confianca}%</span></p>
                  </div>
                  <Button size="sm" variant="outline">Editar</Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">Cancelar</Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600 text-center py-4">Nenhum agendamento confirmado. Agende um post acima!</p>
          )}
        </CardContent>
      </Card>

      {/* Análise de Padrões */}
      <Card className="border-l-4 border-l-green-400 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Análise de Padrões
          </CardTitle>
          <CardDescription>Padrões de engajamento por persona e tipo de conteúdo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              {
                titulo: "Melhor Horário Geral",
                valor: "19:00-20:00",
                descricao: "Pico de atividade após trabalho",
                icon: "⏰"
              },
              {
                titulo: "Melhor Dia da Semana",
                valor: "Sexta-feira",
                descricao: "Maior engajamento e conversões",
                icon: "📅"
              },
              {
                titulo: "Tipo de Conteúdo Top",
                valor: "Reels",
                descricao: "Maior taxa de compartilhamento",
                icon: "🎬"
              },
              {
                titulo: "Engajamento Médio",
                valor: "12.2%",
                descricao: "Acima da média do Instagram",
                icon: "📊"
              }
            ].map((item, idx) => (
              <div key={idx} className="border border-green-200 rounded-lg p-4 bg-white">
                <p className="text-2xl mb-2">{item.icon}</p>
                <p className="font-bold text-slate-900">{item.titulo}</p>
                <p className="text-2xl font-bold text-green-600 my-1">{item.valor}</p>
                <p className="text-xs text-slate-600">{item.descricao}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dicas de Agendamento */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para Máximo Engajamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ Sempre respeite o horário recomendado pela IA",
            "✅ Varie entre dias da semana para testar padrões",
            "✅ Poste com consistência (mesma hora, dias específicos)",
            "✅ Monitore engajamento nos primeiros 30 minutos",
            "✅ Ajuste horário se engajamento cair abaixo de 8%",
            "✅ Use a frequência ótima (não poste demais)",
            "✅ Acompanhe padrões sazonais (feriados, datas especiais)"
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">{dica}</p>
          ))}
        </CardContent>
      </Card>

      {/* Aviso de Otimização */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Como Funciona a IA de Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="text-slate-700">
            Nossa IA analisa <strong>histórico de 90 dias</strong> de engajamento para cada persona e tipo de conteúdo, considerando:
          </p>
          <ul className="space-y-2 text-slate-700">
            <li>📊 Taxa de engajamento por horário</li>
            <li>📈 Conversões por dia da semana</li>
            <li>⏰ Padrões de atividade do público</li>
            <li>🎯 Performance por tipo de conteúdo</li>
            <li>🔄 Sazonalidade e eventos especiais</li>
          </ul>
          <p className="text-xs text-amber-700 mt-3">
            Quanto mais dados históricos, mais precisa a recomendação. Comece com as sugestões da IA e ajuste conforme aprende padrões específicos do seu público.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
