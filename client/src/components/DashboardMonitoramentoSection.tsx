import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, TrendingUp, Users, Eye, Heart, MessageCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function DashboardMonitoramentoSection() {
  const [isSimulando, setIsSimulando] = useState(false);
  const [tempoDecorrido, setTempoDecorrido] = useState(0);

  // Dados simulados de monitoramento em tempo real
  const dadosMonitoramento = [
    { tempo: "0h", visualizacoes: 0, engajamentos: 0, seguidores: 0, cpv: 0, cps: 0 },
    { tempo: "1h", visualizacoes: 8500, engajamentos: 850, seguidores: 42, cpv: 0.0059, cps: 11.9 },
    { tempo: "2h", visualizacoes: 22000, engajamentos: 2200, seguidores: 110, cpv: 0.0045, cps: 4.55 },
    { tempo: "3h", visualizacoes: 45000, engajamentos: 4500, seguidores: 225, cpv: 0.0033, cps: 2.22 },
    { tempo: "4h", visualizacoes: 65000, engajamentos: 6500, seguidores: 325, cpv: 0.0031, cps: 1.54 },
    { tempo: "6h", visualizacoes: 95000, engajamentos: 9500, seguidores: 475, cpv: 0.0026, cps: 1.05 },
    { tempo: "12h", visualizacoes: 145000, engajamentos: 14500, seguidores: 725, cpv: 0.0021, cps: 0.69 },
    { tempo: "24h", visualizacoes: 180000, engajamentos: 18000, seguidores: 900, cpv: 0.0028, cps: 0.56 },
  ];

  const metricsAtuais = dadosMonitoramento[tempoDecorrido] || dadosMonitoramento[dadosMonitoramento.length - 1];

  const iniciarSimulacao = () => {
    setIsSimulando(!isSimulando);
    if (!isSimulando) {
      setTempoDecorrido(0);
      const interval = setInterval(() => {
        setTempoDecorrido(prev => {
          if (prev >= dadosMonitoramento.length - 1) {
            setIsSimulando(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  };

  const metricsCards: Array<any> = [
    {
      titulo: "Visualizações",
      valor: metricsAtuais.visualizacoes.toLocaleString('pt-BR'),
      meta: "180K",
      percentual: ((metricsAtuais.visualizacoes / 180000) * 100).toFixed(1),
      icon: Eye,
      cor: "blue"
    },
    {
      titulo: "Engajamentos",
      valor: metricsAtuais.engajamentos.toLocaleString('pt-BR'),
      meta: "18K",
      percentual: ((metricsAtuais.engajamentos / 18000) * 100).toFixed(1),
      icon: Heart,
      cor: "red"
    },
    {
      titulo: "Novos Seguidores",
      valor: metricsAtuais.seguidores.toLocaleString('pt-BR'),
      meta: "900",
      percentual: ((metricsAtuais.seguidores / 900) * 100).toFixed(1),
      icon: Users,
      cor: "green"
    },
    {
      titulo: "CPV (Custo/Vis)",
      valor: `R$ ${metricsAtuais.cpv.toFixed(4)}`,
      meta: "R$ 0.0027",
      status: metricsAtuais.cpv <= 0.0027 ? "✅ Bom" : "⚠️ Alto",
      icon: TrendingUp,
      cor: "purple"
    }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Dashboard de Monitoramento em Tempo Real</h2>
        <p className="text-slate-600">
          Simule e acompanhe as métricas da campanha ao vivo. Veja como os números evoluem nas primeiras 24 horas.
        </p>
      </div>

      {/* Aviso de simulação */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Simulador com benchmarks de mercado — não dados reais</p>
              <p className="text-sm text-slate-600 mt-1">
                Os números abaixo (visualizações, engajamentos, CPV, CPS) são valores de referência baseados em médias de mercado para campanhas de pijamas/moda. Para monitorar dados reais da sua campanha, integre a Meta Ads API ou TikTok Ads API.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Controles de Simulação */}
      <Card className="border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-600" />
            Simulador de Campanha em Tempo Real
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={iniciarSimulacao}
              className={isSimulando ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}
            >
              {isSimulando ? "⏸ Pausar Simulação" : "▶ Iniciar Simulação"}
            </Button>
            <div>
              <p className="text-sm font-semibold text-slate-700">Tempo Decorrido: {dadosMonitoramento[tempoDecorrido].tempo}</p>
              <p className="text-xs text-slate-600">Progresso: {((tempoDecorrido / (dadosMonitoramento.length - 1)) * 100).toFixed(0)}%</p>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(tempoDecorrido / (dadosMonitoramento.length - 1)) * 100}%` }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Métricas em Tempo Real */}
      <div className="grid md:grid-cols-4 gap-4">
        {metricsCards.map((card, idx) => {
          const Icon = card.icon;
          const corClasses: Record<string, string> = {
            blue: "bg-blue-50 border-blue-200 text-blue-600",
            red: "bg-red-50 border-red-200 text-red-600",
            green: "bg-green-50 border-green-200 text-green-600",
            purple: "bg-purple-50 border-purple-200 text-purple-600"
          };

          const corClass = corClasses[card.cor] || corClasses.blue;
          return (
            <Card key={idx} className={`border-2 ${corClass}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase mb-2">{card.titulo}</p>
                    <p className="text-2xl font-bold text-slate-900">{card.valor}</p>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-600">Meta: {card.meta}</span>
                        <span className="font-semibold text-slate-700">{card.percentual}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-1.5 rounded-full"
                          style={{ width: `${Math.min(parseFloat(card.percentual), 100)}%` }}
                        />
                      </div>
                    </div>
                    {card.status && (
                      <p className="text-xs font-semibold mt-2">{card.status}</p>
                    )}
                  </div>
                  <Icon className="w-8 h-8 opacity-20" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Gráfico de Evolução */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evolução de Visualizações e Engajamentos</CardTitle>
          <CardDescription>Acompanhe o crescimento ao longo das 24 horas</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dadosMonitoramento.slice(0, tempoDecorrido + 1)}>
              <defs>
                <linearGradient id="colorVis" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tempo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="visualizacoes" stroke="#3b82f6" fillOpacity={1} fill="url(#colorVis)" name="Visualizações" />
              <Area type="monotone" dataKey="engajamentos" stroke="#ef4444" fillOpacity={1} fill="url(#colorEng)" name="Engajamentos" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico de Custos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Evolução de Custos (CPV e CPS)</CardTitle>
          <CardDescription>CPV e CPS tendem a melhorar com o tempo</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dadosMonitoramento.slice(0, tempoDecorrido + 1)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tempo" />
              <YAxis yAxisId="left" label={{ value: 'CPV (R$)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'CPS (R$)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="cpv" stroke="#8b5cf6" name="CPV" strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="cps" stroke="#f59e0b" name="CPS" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Dicas de Monitoramento */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg">10 Dicas para Monitorar sua Campanha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            { titulo: "Primeiros 30 Minutos", descricao: "Responda TODOS os comentários. Isso aumenta engajamento em 20-30%." },
            { titulo: "CPV Alto?", descricao: "Se CPV > R$ 0,005, ajuste o público-alvo. Tente idade, localização ou interesses diferentes." },
            { titulo: "CPS Alto?", descricao: "Se CPS > R$ 1,50, o criativo (vídeo) pode não estar resonando. Teste variações." },
            { titulo: "Engagement Rate", descricao: "Meta: 8-10%. Se < 6%, considere pausar e otimizar. Se > 12%, escale o orçamento." },
            { titulo: "Saves são Ouro", descricao: "Saves indicam intenção de compra. Se > 200 em 24h, a campanha está indo bem." },
            { titulo: "Horários de Pico", descricao: "Monitore qual hora do dia tem mais engajamento. Concentre orçamento nesses horários." },
            { titulo: "Compartilhamentos", descricao: "Se > 100 shares em 24h, o vídeo está viralizando. Deixe rodar mais!" },
            { titulo: "Cliques para Bio", descricao: "Acompanhe cliques para sua bio/link. Isso indica intenção de compra real." },
            { titulo: "Ajustes em Tempo Real", descricao: "Não espere 24h. Ajuste público-alvo a cada 2-3 horas se performance cair." },
            { titulo: "Compile Dados", descricao: "Ao final, salve todos os dados. Use para otimizar próximas campanhas." }
          ].map((tip, idx) => (
            <div key={idx} className="flex gap-3 pb-3 border-b border-amber-200 last:border-0">
              <div className="w-1 bg-amber-600 rounded-full flex-shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">{tip.titulo}</p>
                <p className="text-xs text-slate-600">{tip.descricao}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
