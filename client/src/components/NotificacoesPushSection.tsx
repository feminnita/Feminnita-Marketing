import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Bell, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

export default function NotificacoesPushSection() {
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(false);
  const [lembretes, setLembretes] = useState([
    {
      id: 1,
      titulo: "Story - Renda Extra",
      horario: "09:00",
      rede: "Instagram",
      tipo: "story",
      ativo: true,
      proxima: "Hoje às 09:00",
      status: "agendado"
    },
    {
      id: 2,
      titulo: "Reels - Bastidores",
      horario: "20:00",
      rede: "Instagram",
      tipo: "reels",
      ativo: true,
      proxima: "Hoje às 20:00",
      status: "agendado"
    },
    {
      id: 3,
      titulo: "TikTok - ASMR",
      horario: "14:00",
      rede: "TikTok",
      tipo: "tiktok",
      ativo: true,
      proxima: "Amanhã às 14:00",
      status: "agendado"
    },
    {
      id: 4,
      titulo: "Ads - Compra Familiar",
      horario: "18:00",
      rede: "Instagram",
      tipo: "ads",
      ativo: false,
      proxima: "Desativado",
      status: "desativado"
    }
  ]);

  const [notificacoes, setNotificacoes] = useState([
    {
      id: 1,
      titulo: "🔔 Hora de Postar!",
      descricao: "Story - Renda Extra está pronto para publicar",
      horario: "09:00",
      tipo: "lembrete",
      lida: false
    },
    {
      id: 2,
      titulo: "✅ Publicado com Sucesso",
      descricao: "Seu Reels foi publicado no Instagram",
      horario: "20:15",
      tipo: "sucesso",
      lida: false
    },
    {
      id: 3,
      titulo: "⚠️ Falha na Publicação",
      descricao: "Erro ao publicar no TikTok. Tente novamente.",
      horario: "14:05",
      tipo: "erro",
      lida: true
    }
  ]);

  const configuracoes = [
    { id: "lembrete-15min", titulo: "Lembrete 15 minutos antes", descricao: "Receba notificação 15 min antes de postar", ativo: true },
    { id: "lembrete-1hora", titulo: "Lembrete 1 hora antes", descricao: "Receba notificação 1 hora antes de postar", ativo: true },
    { id: "sucesso", titulo: "Notificação de Sucesso", descricao: "Notifique quando publicar com sucesso", ativo: true },
    { id: "erro", titulo: "Notificação de Erro", descricao: "Notifique quando houver erro na publicação", ativo: true },
    { id: "som", titulo: "Som de Notificação", descricao: "Reproduzir som ao receber notificação", ativo: false },
    { id: "desktop", titulo: "Notificações Desktop", descricao: "Mostrar notificações no desktop", ativo: true }
  ];

  const ativarNotificacoes = () => {
    setNotificacoesAtivas(true);
    // Aqui você faria a requisição para ativar notificações push
  };

  const desativarLembrete = (id: number) => {
    setLembretes(lembretes.map(l => 
      l.id === id ? { ...l, ativo: !l.ativo, status: !l.ativo ? "agendado" : "desativado" } : l
    ));
  };

  const marcarComoLida = (id: number) => {
    setNotificacoes(notificacoes.map(n => 
      n.id === id ? { ...n, lida: true } : n
    ));
  };

  const publicarAgora = (id: number) => {
    const lembrete = lembretes.find(l => l.id === id);
    if (lembrete) {
      setNotificacoes([
        {
          id: notificacoes.length + 1,
          titulo: "✅ Publicado com Sucesso",
          descricao: `${lembrete.titulo} foi publicado no ${lembrete.rede}`,
          horario: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
          tipo: "sucesso",
          lida: false
        },
        ...notificacoes
      ]);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Notificações Push com Lembretes</h2>
        <p className="text-slate-600">
          Receba lembretes automáticos quando chegar a hora de postar. Publique diretamente da notificação!
        </p>
      </div>

      {/* Ativar Notificações */}
      <Card className="border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Ativar Notificações Push
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!notificacoesAtivas ? (
            <>
              <p className="text-sm text-slate-700">
                Ative notificações push para receber lembretes de postagem em tempo real.
              </p>
              <Button 
                onClick={ativarNotificacoes}
                className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
                size="lg"
              >
                <Bell className="w-5 h-5" />
                Ativar Notificações
              </Button>
            </>
          ) : (
            <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded">
              <div>
                <p className="font-semibold text-green-900">✅ Notificações Ativas</p>
                <p className="text-sm text-green-700">Você receberá lembretes de postagem</p>
              </div>
              <Badge className="bg-green-600">Ativo</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {notificacoesAtivas && (
        <>
          {/* Lembretes Agendados */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Lembretes Agendados
              </CardTitle>
              <CardDescription>Suas postagens programadas para hoje</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {lembretes.map((lembrete) => (
                <div key={lembrete.id} className={`border rounded-lg p-4 ${lembrete.ativo ? "border-blue-200 bg-blue-50" : "border-slate-200 bg-slate-50 opacity-60"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900">{lembrete.titulo}</h4>
                      <p className="text-sm text-slate-600">{lembrete.rede} • {lembrete.tipo}</p>
                    </div>
                    <Badge variant={lembrete.ativo ? "default" : "secondary"}>
                      {lembrete.ativo ? "✅ Ativo" : "⏸️ Inativo"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">{lembrete.horario}</span>
                      <span>•</span>
                      <span>{lembrete.proxima}</span>
                    </div>

                    <div className="flex gap-2">
                      {lembrete.ativo && (
                        <Button 
                          size="sm"
                          onClick={() => publicarAgora(lembrete.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Publicar Agora
                        </Button>
                      )}
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => desativarLembrete(lembrete.id)}
                      >
                        {lembrete.ativo ? "Desativar" : "Ativar"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Centro de Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Centro de Notificações
              </CardTitle>
              <CardDescription>Suas notificações recentes</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notificacoes.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`border rounded-lg p-4 cursor-pointer transition ${
                    notif.lida 
                      ? "border-slate-200 bg-slate-50" 
                      : "border-blue-200 bg-blue-50 hover:border-blue-300"
                  }`}
                  onClick={() => marcarComoLida(notif.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{notif.titulo}</p>
                      <p className="text-sm text-slate-600">{notif.descricao}</p>
                    </div>
                    {!notif.lida && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-slate-600">{notif.horario}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Configurações de Notificações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Configurações de Notificações</CardTitle>
              <CardDescription>Personalize como você recebe notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {configuracoes.map((config) => (
                <div key={config.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900">{config.titulo}</p>
                    <p className="text-xs text-slate-600">{config.descricao}</p>
                  </div>
                  <Switch defaultChecked={config.ativo} />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Dicas */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg">Dicas para Máximo Engajamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                { titulo: "Ative Lembrete 15 Min Antes", descricao: "Tenha tempo para revisar antes de publicar" },
                { titulo: "Use Som de Notificação", descricao: "Nunca perca um lembrete importante" },
                { titulo: "Publique Nos Horários Ideais", descricao: "Agende para 19h-21h para máximo engajamento" },
                { titulo: "Revise Antes de Publicar", descricao: "Verifique imagens e textos antes de ir ao ar" },
                { titulo: "Responda Comentários Rápido", descricao: "Ative notificações de comentários também" },
                { titulo: "Acompanhe Métricas", descricao: "Veja performance de cada postagem" }
              ].map((dica, idx) => (
                <div key={idx} className="flex gap-3">
                  <span className="text-green-600 font-bold">{idx + 1}.</span>
                  <div>
                    <p className="font-semibold text-slate-900">{dica.titulo}</p>
                    <p className="text-xs text-slate-600">{dica.descricao}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Próximas Ações */}
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-lg">Próximas Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>✅ Notificações push ativadas</p>
              <p>🔔 Configure lembretes para seus horários ideais</p>
              <p>🔊 Ative som de notificação para não perder</p>
              <p>📱 Permita notificações no seu navegador/dispositivo</p>
              <p>⏰ Revise a configuração de lembretes</p>
              <p>🚀 Publique seus primeiros conteúdos com lembretes</p>
            </CardContent>
          </Card>
        </>
      )}

      {!notificacoesAtivas && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle className="text-lg">Por que usar Notificações Push?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {[
              { titulo: "Nunca Perca um Horário", descricao: "Receba lembretes automáticos no horário certo" },
              { titulo: "Publique em Segundos", descricao: "Botão de publicação direto na notificação" },
              { titulo: "Máximo Engajamento", descricao: "Poste nos horários ideais sem esquecer" },
              { titulo: "Acompanhamento em Tempo Real", descricao: "Veja sucesso ou erro de cada publicação" },
              { titulo: "Produtividade", descricao: "Foque em outras tarefas enquanto recebe lembretes" },
              { titulo: "Consistência", descricao: "Mantenha cronograma de postagens sem falhas" }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <span className="text-amber-600">✓</span>
                <div>
                  <p className="font-semibold text-slate-900">{item.titulo}</p>
                  <p className="text-xs text-slate-600">{item.descricao}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
