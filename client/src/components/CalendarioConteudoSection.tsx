import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Link2, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function CalendarioConteudoSection() {
  const [integracoes, setIntegracoes] = useState([
    {
      id: 1,
      nome: "Google Calendar",
      status: "conectado",
      icon: "📅",
      descricao: "Sincronize postagens com seu calendário Google",
      eventos: 42,
      ultimaSincronizacao: "2026-01-31 14:30"
    },
    {
      id: 2,
      nome: "Notion",
      status: "desconectado",
      icon: "📝",
      descricao: "Organize conteúdo em banco de dados Notion",
      eventos: 0,
      ultimaSincronizacao: "-"
    },
    {
      id: 3,
      nome: "Asana",
      status: "desconectado",
      icon: "✓",
      descricao: "Crie tarefas de conteúdo no Asana",
      eventos: 0,
      ultimaSincronizacao: "-"
    }
  ]);

  const [eventos] = useState([
    {
      id: 1,
      data: "2026-02-03 (Seg)",
      hora: "09:00",
      tipo: "Story",
      titulo: "Teaser Lançamento",
      persona: "Carol",
      plataforma: "Instagram",
      status: "agendado"
    },
    {
      id: 2,
      data: "2026-02-03 (Seg)",
      hora: "13:00",
      tipo: "Reels",
      titulo: "Bastidores Produção",
      persona: "Vanessa",
      plataforma: "Instagram",
      status: "agendado"
    },
    {
      id: 3,
      data: "2026-02-03 (Seg)",
      hora: "19:00",
      tipo: "Ads",
      titulo: "Renda Extra",
      persona: "Carol",
      plataforma: "TikTok",
      status: "agendado"
    },
    {
      id: 4,
      data: "2026-02-04 (Ter)",
      hora: "09:00",
      tipo: "Story",
      titulo: "Enquete Cores",
      persona: "Renata",
      plataforma: "Instagram",
      status: "agendado"
    },
    {
      id: 5,
      data: "2026-02-04 (Ter)",
      hora: "20:00",
      tipo: "Reels",
      titulo: "Análise Qualidade",
      persona: "Renata",
      plataforma: "Instagram",
      status: "agendado"
    }
  ]);

  const conectarIntegracao = (id: number) => {
    setIntegracoes(integracoes.map(int => 
      int.id === id ? { ...int, status: "conectado", ultimaSincronizacao: new Date().toLocaleString('pt-BR') } : int
    ));
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Integração com Calendário de Conteúdo</h2>
        <p className="text-slate-600">
          Sincronize automaticamente o planejamento semanal com Google Calendar, Notion ou Asana para facilitar coordenação com equipe.
        </p>
      </div>

      {/* Integrações Disponíveis */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Link2 className="w-5 h-5 text-blue-600" />
            Plataformas de Integração
          </CardTitle>
          <CardDescription>Conecte com ferramentas que sua equipe já usa</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {integracoes.map((int) => (
            <div key={int.id} className={`border-2 rounded-lg p-4 ${int.status === "conectado" ? "border-green-200 bg-green-50" : "border-slate-200 bg-white"}`}>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-3xl">{int.icon}</span>
                  <div>
                    <h4 className="font-bold text-slate-900">{int.nome}</h4>
                    <p className="text-xs text-slate-600">{int.descricao}</p>
                  </div>
                </div>
                <Badge className={int.status === "conectado" ? "bg-green-600" : "bg-slate-400"}>
                  {int.status === "conectado" ? "✅ Conectado" : "⚪ Desconectado"}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs">
                <p className="text-slate-600">
                  {int.status === "conectado" 
                    ? `${int.eventos} eventos sincronizados • Última atualização: ${int.ultimaSincronizacao}` 
                    : "Clique para conectar"}
                </p>
                {int.status === "desconectado" && (
                  <Button 
                    size="sm"
                    onClick={() => conectarIntegracao(int.id)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Conectar
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Eventos Sincronizados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-600" />
            Eventos Agendados (Semana)
          </CardTitle>
          <CardDescription>Todos os posts sincronizados com calendário</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {eventos.map((evt) => (
            <div key={evt.id} className="border border-slate-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 transition">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-slate-900">{evt.titulo}</h4>
                  <p className="text-xs text-slate-600">{evt.data} às {evt.hora}</p>
                </div>
                <Badge className="bg-purple-600">{evt.tipo}</Badge>
              </div>

              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-slate-600">Persona</p>
                  <p className="font-bold text-slate-900">{evt.persona}</p>
                </div>
                <div>
                  <p className="text-slate-600">Plataforma</p>
                  <p className="font-bold text-slate-900">{evt.plataforma}</p>
                </div>
                <div>
                  <p className="text-slate-600">Status</p>
                  <p className="font-bold text-green-600">✅ {evt.status}</p>
                </div>
                <div className="text-right">
                  <Button size="sm" variant="outline">Ver Detalhes</Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Como Usar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ Conecte Google Calendar para visualizar posts em seu calendário pessoal",
            "✅ Use Notion para manter banco de dados centralizado de conteúdo",
            "✅ Integre Asana para atribuir tarefas de conteúdo à equipe",
            "✅ Sincronização automática acontece a cada 1 hora",
            "✅ Todos os posts aparecem com data, hora e persona",
            "✅ Equipe pode comentar e colaborar no calendário",
            "✅ Receba notificações quando posts são agendados",
            "✅ Exporte calendário em iCal para qualquer aplicativo"
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">{dica}</p>
          ))}
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Benefícios</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { titulo: "Coordenação em Equipe", descricao: "Todos veem o calendário centralizado" },
            { titulo: "Sem Duplicação", descricao: "Evita posts duplicados ou conflitos" },
            { titulo: "Lembretes Automáticos", descricao: "Receba notificações antes de postar" },
            { titulo: "Histórico Completo", descricao: "Acompanhe tudo que foi postado" },
            { titulo: "Integração Nativa", descricao: "Funciona com ferramentas que já usa" },
            { titulo: "Escalabilidade", descricao: "Gerencie múltiplas contas e equipes" }
          ].map((beneficio, idx) => (
            <div key={idx} className="flex gap-3 p-3 border border-green-200 rounded bg-white">
              <span className="text-lg">✨</span>
              <div>
                <p className="font-semibold text-slate-900">{beneficio.titulo}</p>
                <p className="text-xs text-slate-600">{beneficio.descricao}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
