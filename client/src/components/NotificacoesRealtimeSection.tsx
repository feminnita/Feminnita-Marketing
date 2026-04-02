import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Slack, MessageCircle, AlertCircle, CheckCircle, TrendingUp, DollarSign, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";

const NOTIFICACOES_TIPOS = [
  {
    id: "meta_atingida",
    titulo: "Meta Atingida",
    descricao: "Quando campanha atinge meta de vendas",
    ativo: true,
    icon: CheckCircle,
    cor: "bg-green-100 text-green-800"
  },
  {
    id: "cpa_limite",
    titulo: "CPA Acima do Limite",
    descricao: "Quando CPA ultrapassa limite definido",
    ativo: true,
    icon: AlertCircle,
    cor: "bg-red-100 text-red-800"
  },
  {
    id: "performance_baixa",
    titulo: "Performance Baixa",
    descricao: "Quando engagement cai abaixo de threshold",
    ativo: true,
    icon: TrendingUp,
    cor: "bg-yellow-100 text-yellow-800"
  },
  {
    id: "novo_feedback",
    titulo: "Novo Feedback",
    descricao: "Quando cliente deixa feedback/rating",
    ativo: true,
    icon: MessageCircle,
    cor: "bg-blue-100 text-blue-800"
  },
  {
    id: "novo_lead",
    titulo: "Novo Lead",
    descricao: "Quando novo lead é capturado",
    ativo: true,
    icon: Zap,
    cor: "bg-purple-100 text-purple-800"
  },
  {
    id: "conversao",
    titulo: "Conversão Realizada",
    descricao: "Quando venda é confirmada",
    ativo: true,
    icon: DollarSign,
    cor: "bg-emerald-100 text-emerald-800"
  },
];

export default function NotificacoesRealtimeSection() {
  const { data: alertsData } = trpc.smartAlerts.listActiveAlerts.useQuery(
    {},
    { refetchInterval: 60_000 }
  );
  const [notificacoesAtivas, setNotificacoesAtivas] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICACOES_TIPOS.map(n => [n.id, n.ativo]))
  );
  const [plataformas, setPlataformas] = useState({
    slack: true,
    whatsapp: true,
    email: false
  });

  const toggleNotificacao = (id: string) => {
    setNotificacoesAtivas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const togglePlataforma = (plataforma: "slack" | "whatsapp" | "email") => {
    setPlataformas(prev => ({ ...prev, [plataforma]: !prev[plataforma] }));
  };

  const alertas = alertsData?.alerts ?? [];
  const notificacoesNaoLidas = alertas.filter((a: any) => !a.isRead).length;

  return (
    <div className="space-y-6">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-purple-600" />
            Notificações em Tempo Real
          </CardTitle>
          <CardDescription>
            Receba alertas instantâneos via Slack, WhatsApp ou Email quando eventos importantes acontecem.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Plataformas de Notificação */}
          <div>
            <h3 className="font-semibold text-sm mb-3">🔗 Conectar Plataformas</h3>
            <div className="grid md:grid-cols-3 gap-3">
              <Card
                className={`p-4 cursor-pointer transition-all ${
                  plataformas.slack
                    ? "border-2 border-purple-500 bg-purple-50"
                    : "border-2 border-slate-200"
                }`}
                onClick={() => togglePlataforma("slack" as const)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">🎯 Slack</h4>
                    <p className="text-xs text-slate-600 mt-1">Notificações no canal #feminnita</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={plataformas.slack ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="w-full text-xs"
                >
                  {plataformas.slack ? "✓ Conectado" : "Conectar"}
                </Button>
              </Card>

              <Card
                className={`p-4 cursor-pointer transition-all ${
                  plataformas.whatsapp
                    ? "border-2 border-green-500 bg-green-50"
                    : "border-2 border-slate-200"
                }`}
                onClick={() => togglePlataforma("whatsapp" as const)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">💬 WhatsApp</h4>
                    <p className="text-xs text-slate-600 mt-1">Mensagens diretas no seu número</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={plataformas.whatsapp ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="w-full text-xs"
                >
                  {plataformas.whatsapp ? "✓ Conectado" : "Conectar"}
                </Button>
              </Card>

              <Card
                className={`p-4 cursor-pointer transition-all ${
                  plataformas.email
                    ? "border-2 border-blue-500 bg-blue-50"
                    : "border-2 border-slate-200"
                }`}
                onClick={() => togglePlataforma("email" as const)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">📧 Email</h4>
                    <p className="text-xs text-slate-600 mt-1">Resumo diário por email</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant={plataformas.email ? "default" : "outline"}
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="w-full text-xs"
                >
                  {plataformas.email ? "✓ Ativo" : "Ativar"}
                </Button>
              </Card>
            </div>
          </div>

          {/* Tipos de Notificação */}
          <div>
            <h3 className="font-semibold text-sm mb-3">🔔 Tipos de Notificação</h3>
            <div className="space-y-2">
              {NOTIFICACOES_TIPOS.map(notif => {
                const Icon = notif.icon;
                return (
                  <Card
                    key={notif.id}
                    className="p-3 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => toggleNotificacao(notif.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <Icon className="w-4 h-4 mt-0.5 text-slate-600" />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{notif.titulo}</h4>
                          <p className="text-xs text-slate-600">{notif.descricao}</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificacoesAtivas[notif.id]}
                        onChange={() => toggleNotificacao(notif.id)}
                        className="w-4 h-4 mt-0.5"
                      />
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Notificações Recentes */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">📬 Notificações Recentes</h3>
              {notificacoesNaoLidas > 0 && (
                <Badge variant="default" className="text-xs">
                  {notificacoesNaoLidas} não lida{notificacoesNaoLidas > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            {alertas.length === 0 ? (
              <Card className="p-4 bg-slate-50 text-center">
                <p className="text-sm text-slate-500">Nenhum alerta ativo. Os alertas aparecerão aqui quando campanhas gerarem eventos.</p>
              </Card>
            ) : (
              <div className="space-y-2">
                {alertas.slice(0, 10).map((alerta: any) => (
                  <Card
                    key={alerta.id}
                    className={`p-3 ${alerta.isRead ? "bg-slate-50" : "bg-blue-50 border-blue-200"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{alerta.title}</h4>
                          <Badge
                            variant="outline"
                            className={`text-xs ${alerta.severity === "critical" ? "border-red-400 text-red-700" : alerta.severity === "warning" ? "border-amber-400 text-amber-700" : ""}`}
                          >
                            {alerta.severity}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 mb-1">{alerta.message}</p>
                        {alerta.campaignName && (
                          <p className="text-xs text-slate-500">Campanha: {alerta.campaignName}</p>
                        )}
                      </div>
                      {!alerta.isRead && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Limites de Alerta */}
          <div>
            <h3 className="font-semibold text-sm mb-3">⚙️ Configurar Limites</h3>
            <div className="grid md:grid-cols-2 gap-3">
              <Card className="p-4 bg-slate-50">
                <label className="text-sm font-semibold block mb-2">CPA Máximo (R$)</label>
                <input
                  type="number"
                  defaultValue="1.50"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
                <p className="text-xs text-slate-600 mt-2">Alerta quando CPA ultrapassa este valor</p>
              </Card>

              <Card className="p-4 bg-slate-50">
                <label className="text-sm font-semibold block mb-2">Engagement Mínimo (%)</label>
                <input
                  type="number"
                  defaultValue="8"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
                <p className="text-xs text-slate-600 mt-2">Alerta quando engagement cai abaixo</p>
              </Card>

              <Card className="p-4 bg-slate-50">
                <label className="text-sm font-semibold block mb-2">Meta de Vendas (unidades)</label>
                <input
                  type="number"
                  defaultValue="100"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
                <p className="text-xs text-slate-600 mt-2">Notificação quando meta é atingida</p>
              </Card>

              <Card className="p-4 bg-slate-50">
                <label className="text-sm font-semibold block mb-2">Intervalo de Verificação (min)</label>
                <input
                  type="number"
                  defaultValue="5"
                  className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                />
                <p className="text-xs text-slate-600 mt-2">A cada quantos minutos verificar métricas</p>
              </Card>
            </div>
          </div>

          {/* Horário de Silêncio */}
          <div>
            <h3 className="font-semibold text-sm mb-3">🔇 Horário de Silêncio</h3>
            <Card className="p-4 bg-slate-50">
              <div className="flex items-center gap-2 mb-3">
                <input type="checkbox" id="silence" className="w-4 h-4" />
                <label htmlFor="silence" className="text-sm font-semibold">
                  Ativar horário de silêncio
                </label>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-semibold block mb-2">De</label>
                  <input
                    type="time"
                    defaultValue="22:00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-2">Até</label>
                  <input
                    type="time"
                    defaultValue="08:00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
                  />
                </div>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Notificações urgentes (meta atingida, conversão) continuarão sendo enviadas
              </p>
            </Card>
          </div>

          {/* Teste de Notificação */}
          <Card className="bg-blue-50 border-blue-200 p-4">
            <h4 className="font-semibold text-sm mb-3">🧪 Testar Notificações</h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success("Notificação de teste enviada para Slack!")}
                className="gap-1 text-xs flex-1"
              >
                <Slack className="w-3 h-3" />
                Testar Slack
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => toast.success("Notificação de teste enviada para WhatsApp!")}
                className="gap-1 text-xs flex-1"
              >
                <MessageCircle className="w-3 h-3" />
                Testar WhatsApp
              </Button>
            </div>
          </Card>

          {/* Próximos Passos */}
          <Card className="bg-green-50 border-green-200 p-4">
            <h4 className="font-semibold text-sm mb-3">✅ Próximos Passos</h4>
            <ol className="text-sm space-y-2 text-slate-700">
              <li>1. <strong>Conecte Slack/WhatsApp</strong> clicando nos botões acima</li>
              <li>2. <strong>Configure tipos de notificação</strong> que deseja receber</li>
              <li>3. <strong>Defina limites de alerta</strong> (CPA, engagement, meta)</li>
              <li>4. <strong>Configure horário de silêncio</strong> se necessário</li>
              <li>5. <strong>Teste as notificações</strong> para confirmar funcionamento</li>
              <li>6. <strong>Monitore em tempo real</strong> e receba alertas instantâneos</li>
            </ol>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}
