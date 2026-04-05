import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Eye, Heart, MessageCircle, Zap, AlertCircle } from "lucide-react";
import { useState } from "react";
import PersonaAvatar from "./PersonaAvatar";

export default function CalendarioConteudoOtimizadoSection() {
  const [selectedDay, setSelectedDay] = useState("segunda");

  const weekSchedule = {
    segunda: [
      {
        time: "09:00",
        persona: "Renata",
        platform: "Instagram Feed",
        content: "Post: Análise de Lucro Semanal",
        expectedViews: "2.5K",
        expectedEngagement: "8.3%",
        status: "Agendado",
      },
      {
        time: "10:30",
        persona: "Carol",
        platform: "Instagram Stories",
        content: "Story: Unboxing Pijamas Novos",
        expectedViews: "1.8K",
        expectedEngagement: "12.5%",
        status: "Agendado",
      },
      {
        time: "14:00",
        persona: "Vanessa",
        platform: "WhatsApp Status",
        content: "Status: Chamada para Compra Coletiva",
        expectedViews: "800",
        expectedEngagement: "15.2%",
        status: "Agendado",
      },
      {
        time: "19:00",
        persona: "Luiza",
        platform: "TikTok",
        content: "Vídeo: Transformação Look Dia/Noite",
        expectedViews: "15K",
        expectedEngagement: "14.2%",
        status: "Agendado",
      },
      {
        time: "20:30",
        persona: "Carol",
        platform: "Instagram Reels",
        content: "Reel: Quanto Ganhei Hoje",
        expectedViews: "3.2K",
        expectedEngagement: "11.8%",
        status: "Agendado",
      },
    ],
    terca: [
      {
        time: "10:00",
        persona: "Renata",
        platform: "Instagram Stories",
        content: "Story: Dica de Fornecedor",
        expectedViews: "1.5K",
        expectedEngagement: "9.1%",
        status: "Agendado",
      },
      {
        time: "14:30",
        persona: "Vanessa",
        platform: "Instagram Reels",
        content: "Reel: Momento Família",
        expectedViews: "4.2K",
        expectedEngagement: "13.7%",
        status: "Agendado",
      },
      {
        time: "18:00",
        persona: "Luiza",
        platform: "Instagram Stories",
        content: "Story: Trend Atual",
        expectedViews: "2.8K",
        expectedEngagement: "16.3%",
        status: "Agendado",
      },
      {
        time: "22:00",
        persona: "Luiza",
        platform: "TikTok",
        content: "Vídeo: Desafio #PijamaChallenge",
        expectedViews: "25K",
        expectedEngagement: "18.5%",
        status: "Agendado",
      },
    ],
    quarta: [
      {
        time: "09:30",
        persona: "Carol",
        platform: "Instagram Feed",
        content: "Post: Testemunho Cliente",
        expectedViews: "2.1K",
        expectedEngagement: "10.2%",
        status: "Agendado",
      },
      {
        time: "15:00",
        persona: "Renata",
        platform: "Instagram Feed",
        content: "Carrossel: 5 Dicas de Venda",
        expectedViews: "3.5K",
        expectedEngagement: "9.8%",
        status: "Agendado",
      },
      {
        time: "19:30",
        persona: "Carol",
        platform: "Instagram Stories",
        content: "Story: Live Q&A",
        expectedViews: "2.2K",
        expectedEngagement: "14.1%",
        status: "Agendado",
      },
      {
        time: "21:00",
        persona: "Vanessa",
        platform: "Instagram Reels",
        content: "Reel: Compra Coletiva Realizada",
        expectedViews: "3.8K",
        expectedEngagement: "12.4%",
        status: "Agendado",
      },
    ],
    quinta: [
      {
        time: "10:00",
        persona: "Luiza",
        platform: "TikTok",
        content: "Vídeo: OOTD (Outfit of the Day)",
        expectedViews: "18K",
        expectedEngagement: "15.9%",
        status: "Agendado",
      },
      {
        time: "14:00",
        persona: "Carol",
        platform: "Instagram Stories",
        content: "Story: Promoção Flash",
        expectedViews: "1.9K",
        expectedEngagement: "13.2%",
        status: "Agendado",
      },
      {
        time: "20:00",
        persona: "Renata",
        platform: "Instagram Live",
        content: "Live: Atendimento ao Vivo",
        expectedViews: "4.5K",
        expectedEngagement: "22.1%",
        status: "Agendado",
      },
    ],
    sexta: [
      {
        time: "11:00",
        persona: "Vanessa",
        platform: "Instagram Feed",
        content: "Post: Fim de Semana em Família",
        expectedViews: "2.8K",
        expectedEngagement: "11.5%",
        status: "Agendado",
      },
      {
        time: "19:00",
        persona: "Luiza",
        platform: "Instagram Reels",
        content: "Reel: Preparação para Sábado",
        expectedViews: "6.2K",
        expectedEngagement: "16.8%",
        status: "Agendado",
      },
      {
        time: "22:30",
        persona: "Luiza",
        platform: "TikTok",
        content: "Vídeo: Trend Viral Noturno",
        expectedViews: "32K",
        expectedEngagement: "19.2%",
        status: "Agendado",
      },
    ],
    sabado: [
      {
        time: "14:00",
        persona: "Vanessa",
        platform: "WhatsApp Status",
        content: "Status: Promoção Fim de Semana",
        expectedViews: "1.2K",
        expectedEngagement: "18.5%",
        status: "Agendado",
      },
      {
        time: "19:00",
        persona: "Carol",
        platform: "Instagram Stories",
        content: "Story: Sábado Relaxante",
        expectedViews: "1.5K",
        expectedEngagement: "11.3%",
        status: "Agendado",
      },
      {
        time: "20:30",
        persona: "Luiza",
        platform: "TikTok",
        content: "Vídeo: Sábado à Noite",
        expectedViews: "28K",
        expectedEngagement: "17.6%",
        status: "Agendado",
      },
    ],
    domingo: [
      {
        time: "10:00",
        persona: "Vanessa",
        platform: "Instagram Feed",
        content: "Post: Domingo em Família",
        expectedViews: "2.3K",
        expectedEngagement: "10.8%",
        status: "Agendado",
      },
      {
        time: "15:00",
        persona: "Carol",
        platform: "Instagram Reels",
        content: "Reel: Resumo da Semana",
        expectedViews: "2.9K",
        expectedEngagement: "12.1%",
        status: "Agendado",
      },
      {
        time: "20:00",
        persona: "Renata",
        platform: "Instagram Feed",
        content: "Post: Planejamento Semanal",
        expectedViews: "2.1K",
        expectedEngagement: "8.9%",
        status: "Agendado",
      },
    ],
  };

  const days = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"];
  const dayLabels: Record<string, string> = {
    segunda: "Segunda-feira",
    terca: "Terça-feira",
    quarta: "Quarta-feira",
    quinta: "Quinta-feira",
    sexta: "Sexta-feira",
    sabado: "Sábado",
    domingo: "Domingo",
  };

  const todaySchedule = weekSchedule[selectedDay as keyof typeof weekSchedule];

  const totalExpectedViews = todaySchedule.reduce((acc, post) => {
    const views = parseInt(post.expectedViews.replace("K", "000"));
    return acc + views;
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Calendário de Conteúdo Otimizado</h2>
        <p className="text-slate-600">Posts agendados nos melhores horários para máximo alcance e engajamento</p>
      </div>

      {/* Disclaimer */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Calendário de exemplo — conecte suas contas para ver dados reais</p>
              <p className="text-sm text-slate-600 mt-1">
                As visualizações esperadas e taxas de engajamento são estimativas baseadas em benchmarks. Os posts agendados abaixo são ilustrativos; conecte sua conta para gerenciar posts reais.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Day Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione o Dia</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
            {days.map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`p-3 rounded-lg border-2 transition text-center font-medium ${
                  selectedDay === day
                    ? "border-pink-500 bg-pink-50 text-pink-900"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {day.charAt(0).toUpperCase() + day.slice(1, 3)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Posts Agendados</p>
                <p className="text-2xl font-bold text-slate-900">{todaySchedule.length}</p>
              </div>
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Visualizações Esperadas</p>
                <p className="text-2xl font-bold text-slate-900">{(totalExpectedViews / 1000).toFixed(0)}K</p>
              </div>
              <Eye className="w-5 h-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Personas Ativas</p>
                <p className="text-2xl font-bold text-slate-900">
                  {new Set(todaySchedule.map((p) => p.persona)).size}
                </p>
              </div>
              <Zap className="w-5 h-5 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Timeline de {dayLabels[selectedDay]}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todaySchedule.map((post, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-pink-100 text-pink-700 rounded-lg px-3 py-2 font-bold text-sm">
                      {post.time}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{post.content}</p>
                      <p className="text-sm text-slate-600">{post.platform}</p>
                    </div>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{post.status}</Badge>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex items-center gap-4">
                    <PersonaAvatar name={post.persona} size="sm" />
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Eye className="w-4 h-4" /> {post.expectedViews}
                      </span>
                      <span className="flex items-center gap-1 text-slate-600">
                        <Heart className="w-4 h-4" /> {post.expectedEngagement}
                      </span>
                    </div>
                  </div>
                  <button className="text-xs bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600 transition">
                    Editar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Visão Geral da Semana</CardTitle>
          <CardDescription>Performance esperada por dia</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {days.map((day) => {
              const dayPosts = weekSchedule[day as keyof typeof weekSchedule];
              const dayViews = dayPosts.reduce((acc, post) => {
                const views = parseInt(post.expectedViews.replace("K", "000"));
                return acc + views;
              }, 0);
              const avgEngagement = (
                dayPosts.reduce((acc, post) => acc + parseFloat(post.expectedEngagement), 0) / dayPosts.length
              ).toFixed(1);

              return (
                <div key={day} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-slate-900">{dayLabels[day]}</p>
                    <p className="text-sm text-slate-600">{dayPosts.length} posts agendados</p>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <span className="text-slate-700">
                      <strong>{(dayViews / 1000).toFixed(0)}K</strong> visualizações
                    </span>
                    <span className="text-slate-700">
                      <strong>{avgEngagement}%</strong> engajamento
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Best Times Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">⏰ Horários Otimizados</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-3">
          <p>Nosso calendário é baseado em dados de melhor performance:</p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li><strong>Carol (Stories):</strong> 10h-12h (café), 19h-21h (noite)</li>
            <li><strong>Renata (Feed):</strong> 9h-11h (trabalho), 14h-16h (pausa), 19h-20h (pós-trabalho)</li>
            <li><strong>Vanessa (Grupos):</strong> 14h-16h (tarde), 20h-21h (noite)</li>
            <li><strong>Luiza (TikTok/Reels):</strong> 18h-20h (pré-noite), 22h-23h (noite viral)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
