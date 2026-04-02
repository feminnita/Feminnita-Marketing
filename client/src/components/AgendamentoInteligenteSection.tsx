import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Zap, TrendingUp, Calendar, AlertCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const RECOMENDACOES = [
  {
    id: 1,
    persona: "Carol (Renda Extra)",
    tipo: "story",
    horarioRecomendado: "19:30",
    motivo: "Pessoas buscam renda extra após o trabalho — pico de atenção ao conteúdo de renda",
    melhorHorario: "19:00–20:00",
    diasMelhores: ["Terça", "Quinta", "Sexta"],
    frequenciaOtima: "2x por dia",
  },
  {
    id: 2,
    persona: "Renata (Lojista)",
    tipo: "reels",
    horarioRecomendado: "09:00",
    motivo: "Lojistas checam redes sociais pela manhã antes de abrir a loja",
    melhorHorario: "08:30–10:00",
    diasMelhores: ["Segunda", "Quarta", "Sexta"],
    frequenciaOtima: "1x por dia",
  },
  {
    id: 3,
    persona: "Vanessa (Compra Coletiva)",
    tipo: "tiktok",
    horarioRecomendado: "20:00",
    motivo: "Famílias se reúnem à noite para decidir compras coletivas",
    melhorHorario: "19:30–21:00",
    diasMelhores: ["Quinta", "Sexta", "Sábado"],
    frequenciaOtima: "1x por dia",
  },
  {
    id: 4,
    persona: "Luiza (Trendsetter)",
    tipo: "reels",
    horarioRecomendado: "18:00",
    motivo: "Trendsetters acompanham redes sociais no final da tarde para ver novidades",
    melhorHorario: "17:30–19:00",
    diasMelhores: ["Terça", "Quarta", "Quinta"],
    frequenciaOtima: "1x por dia",
  },
];

interface Agendamento {
  id: number;
  titulo: string;
  persona: string;
  tipo: string;
  horarioAgendado: string;
  data: string;
  status: string;
}

export default function AgendamentoInteligenteSection() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);

  const agendar = (rec: typeof RECOMENDACOES[0]) => {
    const amanha = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const dataFormatada = amanha.toISOString().split("T")[0];
    setAgendamentos(prev => [...prev, {
      id: Date.now(),
      titulo: `${rec.tipo.charAt(0).toUpperCase() + rec.tipo.slice(1)} - ${rec.persona}`,
      persona: rec.persona,
      tipo: rec.tipo,
      horarioAgendado: rec.horarioRecomendado,
      data: dataFormatada,
      status: "agendado",
    }]);
    toast.success(`Agendado para amanhã às ${rec.horarioRecomendado}. Lembre de criar o conteúdo no app de agendamento.`);
  };

  const cancelar = (id: number) => {
    setAgendamentos(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Agendamento Inteligente</h2>
        <p className="text-slate-600">
          Horários recomendados baseados no comportamento de cada persona. Use como guia para agendar posts no app de sua preferência.
        </p>
      </div>

      {/* Recomendações */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Horários Recomendados por Persona</h3>

        {RECOMENDACOES.map((rec) => (
          <Card key={rec.id} className="border-l-4 border-l-purple-400 hover:border-l-purple-600 transition">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <CardTitle className="text-base">{rec.persona} — {rec.tipo.toUpperCase()}</CardTitle>
                  <CardDescription>{rec.motivo}</CardDescription>
                </div>
                <Badge variant="outline" className="text-purple-700 border-purple-300">
                  {rec.tipo}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
                <div className="grid md:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">Melhor Horário</p>
                    <p className="text-purple-700 font-bold text-lg">{rec.horarioRecomendado}</p>
                    <p className="text-slate-500 text-xs">{rec.melhorHorario}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Dias Recomendados</p>
                    <p className="text-slate-600">{rec.diasMelhores.join(", ")}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Frequência Ideal</p>
                    <p className="text-slate-600">{rec.frequenciaOtima}</p>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => agendar(rec)}
                className="w-full bg-purple-600 hover:bg-purple-700 gap-2"
              >
                <Calendar className="w-4 h-4" />
                Marcar para Amanhã às {rec.horarioRecomendado}
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
            Agendamentos Anotados
          </CardTitle>
          <CardDescription>Lembretes de posts — crie o conteúdo no app de agendamento</CardDescription>
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
                  <Badge className="bg-green-100 text-green-800 text-xs">agendado</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => cancelar(ag.id)}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-600 text-center py-4">Nenhum agendamento anotado. Use os botões acima para marcar um horário.</p>
          )}
        </CardContent>
      </Card>

      {/* Análise de Padrões */}
      <Card className="border-l-4 border-l-green-400 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Padrões Gerais de Engajamento
          </CardTitle>
          <CardDescription>Benchmarks do Instagram e comportamento do público feminino brasileiro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { titulo: "Melhor Horário Geral", valor: "19:00–20:00", descricao: "Pico de atividade após trabalho", icon: "⏰" },
              { titulo: "Melhor Dia da Semana", valor: "Sexta-feira", descricao: "Maior engajamento e conversões", icon: "📅" },
              { titulo: "Tipo de Conteúdo Top", valor: "Reels", descricao: "Maior taxa de compartilhamento", icon: "🎬" },
            ].map((item, idx) => (
              <div key={idx} className="border border-green-200 rounded-lg p-4 bg-white">
                <p className="text-2xl mb-2">{item.icon}</p>
                <p className="font-bold text-slate-900">{item.titulo}</p>
                <p className="text-lg font-bold text-green-600 my-1">{item.valor}</p>
                <p className="text-xs text-slate-600">{item.descricao}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Aviso */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            Como Usar Este Guia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <p>Os horários acima são baseados em <strong>benchmarks de mercado</strong> para o público feminino brasileiro. Para recomendações baseadas no seu histórico real:</p>
          <ul className="space-y-2">
            <li>📊 Verifique <strong>Instagram Insights</strong> → "Audiência" → horários mais ativos dos seus seguidores</li>
            <li>📈 Analise posts anteriores com maior engajamento para identificar padrões próprios</li>
            <li>⏰ Poste consistentemente por 2-3 semanas e compare o engajamento por horário</li>
            <li>🎯 Conecte a API do Instagram (Integrações) para sincronização automática de métricas</li>
          </ul>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para Máximo Engajamento</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "Varie entre dias da semana para testar padrões do seu público específico",
            "Poste com consistência (mesma hora, dias específicos)",
            "Monitore engajamento nos primeiros 30 minutos após publicar",
            "Use a frequência ideal — não poste em excesso",
            "Acompanhe padrões sazonais (feriados, datas especiais)",
            "Responda comentários rapidamente para o algoritmo favorecer o post",
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">✅ {dica}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
