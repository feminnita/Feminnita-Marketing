import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, CheckCircle, AlertCircle, Zap, TrendingUp, Target } from "lucide-react";
import { useState } from "react";

export default function SistemaNotificacoesInteligentesSection() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "trend",
      title: "Nova Trend Viral Detectada!",
      description: "#LoungewearTrend está explodindo no TikTok com 3.2M views",
      persona: "Luiza",
      action: "Usar trend agora",
      time: "há 5 min",
      priority: "high",
      icon: Zap,
    },
    {
      id: 2,
      type: "goal",
      title: "Meta de Conversão Atingida!",
      description: "Carol atingiu 12.5% de conversão (meta era 10%)",
      persona: "Carol",
      action: "Ver detalhes",
      time: "há 12 min",
      priority: "high",
      icon: CheckCircle,
    },
    {
      id: 3,
      type: "opportunity",
      title: "Horário Ideal para Postar",
      description: "19h-22h é o melhor horário para Luiza postar hoje",
      persona: "Luiza",
      action: "Agendar post",
      time: "há 25 min",
      priority: "medium",
      icon: Target,
    },
    {
      id: 4,
      type: "alert",
      title: "Engajamento Caindo",
      description: "Engajamento de Vanessa caiu 15% nos últimos 3 dias",
      persona: "Vanessa",
      action: "Analisar",
      time: "há 1 hora",
      priority: "medium",
      icon: AlertCircle,
    },
    {
      id: 5,
      type: "trend",
      title: "Trend Recomendada para Você",
      description: "#RendaExtraEmCasa cresceu 32% - perfeita para Carol",
      persona: "Carol",
      action: "Explorar",
      time: "há 2 horas",
      priority: "medium",
      icon: TrendingUp,
    },
  ]);

  const notificationRules = [
    {
      id: 1,
      rule: "Trend Viral Detectada",
      condition: "Quando uma trend atinge 1M+ views",
      action: "Notificar persona ideal",
      enabled: true,
    },
    {
      id: 2,
      rule: "Meta de Conversão Atingida",
      condition: "Quando conversão > meta definida",
      action: "Celebrar e sugerir aumento de budget",
      enabled: true,
    },
    {
      id: 3,
      rule: "Melhor Horário para Postar",
      condition: "Diariamente às 17h",
      action: "Notificar horário ideal para cada persona",
      enabled: true,
    },
    {
      id: 4,
      rule: "Engajamento Crítico",
      condition: "Quando engajamento cai > 20%",
      action: "Alertar e sugerir novo conteúdo",
      enabled: true,
    },
    {
      id: 5,
      rule: "Novo Concorrente Detectado",
      condition: "Quando concorrente ganha 1K+ seguidores",
      action: "Analisar estratégia e reportar",
      enabled: true,
    },
    {
      id: 6,
      rule: "Colaboração Oportunidade",
      condition: "Quando detecta influencer com audiência similar",
      action: "Sugerir parceria",
      enabled: false,
    },
  ];

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Sistema de Notificações Inteligentes</h2>
        <p className="text-slate-600">Receba alertas automáticos sobre trends, metas e oportunidades para suas personas</p>
      </div>

      {/* Notifications Center */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Central de Notificações
          </CardTitle>
          <CardDescription>Notificações recentes ({notifications.length})</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <p className="text-center text-slate-600 py-8">Nenhuma notificação no momento</p>
            ) : (
              notifications.map((notif) => {
                const IconComponent = notif.icon;
                return (
                  <div
                    key={notif.id}
                    className={`flex items-start gap-4 p-4 rounded-lg border-l-4 ${
                      notif.priority === "high"
                        ? "bg-red-50 border-red-500"
                        : "bg-blue-50 border-blue-500"
                    }`}
                  >
                    <IconComponent
                      className={`w-5 h-5 flex-shrink-0 mt-1 ${
                        notif.priority === "high" ? "text-red-600" : "text-blue-600"
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold text-slate-900">{notif.title}</h3>
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{notif.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{notif.persona}</Badge>
                          <span className="text-xs text-slate-500">{notif.time}</span>
                        </div>
                        <button className="text-xs bg-pink-500 text-white px-3 py-1 rounded hover:bg-pink-600 transition">
                          {notif.action}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notification Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Regras de Notificação</CardTitle>
          <CardDescription>Configure quais eventos devem gerar alertas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notificationRules.map((rule) => (
              <div key={rule.id} className="flex items-start gap-4 p-4 border border-slate-200 rounded-lg">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  className="w-5 h-5 rounded mt-1 cursor-pointer"
                />
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{rule.rule}</p>
                  <p className="text-sm text-slate-600 mt-1">
                    <strong>Condição:</strong> {rule.condition}
                  </p>
                  <p className="text-sm text-slate-600">
                    <strong>Ação:</strong> {rule.action}
                  </p>
                </div>
                <Badge className={rule.enabled ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}>
                  {rule.enabled ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notification Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferências de Notificação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Notificações por Email</p>
                <p className="text-sm text-slate-600">Receba resumo diário</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded cursor-pointer" />
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Notificações Push</p>
                <p className="text-sm text-slate-600">Alertas em tempo real</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded cursor-pointer" />
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Notificações de Trends</p>
                <p className="text-sm text-slate-600">Apenas trends com alto potencial</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded cursor-pointer" />
            </div>
            <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
              <div>
                <p className="font-medium text-slate-900">Notificações de Performance</p>
                <p className="text-sm text-slate-600">Quando metas são atingidas</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 rounded cursor-pointer" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Smart Alerts Info */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">🤖 Alertas Inteligentes</CardTitle>
        </CardHeader>
        <CardContent className="text-purple-900 space-y-3">
          <p>Nosso sistema monitora continuamente:</p>
          <ul className="list-disc list-inside space-y-2 text-sm">
            <li>Trends em alta em TikTok, Instagram e YouTube</li>
            <li>Performance de cada persona em tempo real</li>
            <li>Horários ideais para postar baseado em dados históricos</li>
            <li>Atividade de concorrentes</li>
            <li>Oportunidades de colaboração</li>
            <li>Mudanças no algoritmo das plataformas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
