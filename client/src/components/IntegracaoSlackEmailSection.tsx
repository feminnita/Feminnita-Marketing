import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Bell, Mail, MessageSquare, CheckCircle, AlertCircle, Zap } from "lucide-react";
import { useState } from "react";

export default function IntegracaoSlackEmailSection() {
  const [slackConectado, setSlackConectado] = useState(false);
  const [emailConectado, setEmailConectado] = useState(true);
  const [slackWebhook, setSlackWebhook] = useState("");
  const [email, setEmail] = useState("seu@email.com");

  const [notificacoes, setNotificacoes] = useState([
    {
      id: 1,
      titulo: "Meta de Vendas Atingida",
      descricao: "Notifique quando atingir 100 vendas/dia",
      ativo: true,
      canais: ["slack", "email"]
    },
    {
      id: 2,
      titulo: "CPA Acima do Limite",
      descricao: "Alerta quando CPA > R$ 15",
      ativo: true,
      canais: ["slack", "email"]
    },
    {
      id: 3,
      titulo: "ROI Abaixo do Esperado",
      descricao: "Alerta quando ROI < 200%",
      ativo: true,
      canais: ["slack"]
    },
    {
      id: 4,
      titulo: "Novo Comentário em Post",
      descricao: "Notifique sobre comentários em posts",
      ativo: false,
      canais: ["email"]
    },
    {
      id: 5,
      titulo: "Campanha Pausada",
      descricao: "Alerta quando campanha é pausada",
      ativo: true,
      canais: ["slack", "email"]
    },
    {
      id: 6,
      titulo: "Relatório Diário",
      descricao: "Envie resumo diário às 20h",
      ativo: true,
      canais: ["email"]
    }
  ]);

  const [historico, setHistorico] = useState([
    {
      id: 1,
      tipo: "sucesso",
      titulo: "Meta de Vendas Atingida! 🎉",
      descricao: "Você atingiu 156 vendas hoje (meta: 100)",
      data: "2026-01-31 18:45",
      canais: ["slack", "email"]
    },
    {
      id: 2,
      tipo: "alerta",
      titulo: "CPA Acima do Limite",
      descricao: "CPA em Google Ads: R$ 16,50 (limite: R$ 15)",
      data: "2026-01-31 15:30",
      canais: ["slack", "email"]
    },
    {
      id: 3,
      tipo: "info",
      titulo: "Relatório Diário - 30 de Janeiro",
      descricao: "Vendas: 134 | Receita: R$ 5.360 | ROI: 320%",
      data: "2026-01-30 20:00",
      canais: ["email"]
    },
    {
      id: 4,
      tipo: "alerta",
      titulo: "ROI Abaixo do Esperado",
      descricao: "Facebook Ads ROI: 150% (esperado: 200%)",
      data: "2026-01-30 14:15",
      canais: ["slack"]
    }
  ]);

  const conectarSlack = () => {
    if (slackWebhook.trim()) {
      setSlackConectado(true);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Integração Slack/Email</h2>
        <p className="text-slate-600">
          Receba notificações automáticas quando campanhas atingem metas ou quando CPA ultrapassa limite, mantendo equipe atualizada em tempo real.
        </p>
      </div>

      {/* Conexões */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Slack */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-600" />
              Slack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!slackConectado ? (
              <>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Webhook URL</label>
                  <Input 
                    placeholder="https://hooks.slack.com/services/..."
                    value={slackWebhook}
                    onChange={(e) => setSlackWebhook(e.target.value)}
                    type="password"
                    className="mb-2"
                  />
                  <Button 
                    onClick={conectarSlack}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                  >
                    Conectar Slack
                  </Button>
                </div>
                <div className="p-3 bg-purple-50 border border-purple-200 rounded text-xs text-purple-700">
                  <p className="font-semibold mb-1">Como obter Webhook:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Acesse api.slack.com/apps</li>
                    <li>Clique em "Create New App"</li>
                    <li>Ative "Incoming Webhooks"</li>
                    <li>Copie a URL do webhook</li>
                  </ol>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded">
                <div>
                  <p className="font-semibold text-purple-900">✅ Conectado</p>
                  <p className="text-xs text-purple-700">Pronto para receber notificações</p>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSlackConectado(false);
                    setSlackWebhook("");
                  }}
                >
                  Desconectar
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-600" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {emailConectado ? (
              <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded">
                <div>
                  <p className="font-semibold text-blue-900">✅ Conectado</p>
                  <p className="text-xs text-blue-700">{email}</p>
                </div>
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setEmailConectado(false)}
                >
                  Desconectar
                </Button>
              </div>
            ) : (
              <>
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">Email</label>
                  <Input 
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="mb-2"
                  />
                  <Button 
                    onClick={() => setEmailConectado(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Conectar Email
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Configurar Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            Configurar Notificações
          </CardTitle>
          <CardDescription>Escolha quais eventos geram notificações</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {notificacoes.map((notif) => (
            <div key={notif.id} className="border border-slate-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h4 className="font-bold text-slate-900">{notif.titulo}</h4>
                  <p className="text-xs text-slate-600">{notif.descricao}</p>
                </div>
                <input 
                  type="checkbox" 
                  checked={notif.ativo}
                  onChange={() => {
                    setNotificacoes(notificacoes.map(n => 
                      n.id === notif.id ? { ...n, ativo: !n.ativo } : n
                    ));
                  }}
                  className="w-5 h-5 cursor-pointer"
                />
              </div>
              <div className="flex gap-2">
                {notif.canais.map((canal) => (
                  <Badge key={canal} variant="outline" className="text-xs">
                    {canal === "slack" ? "💬 Slack" : "📧 Email"}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Histórico de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Histórico de Notificações</CardTitle>
          <CardDescription>Notificações enviadas recentemente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {historico.map((notif) => (
            <div key={notif.id} className={`border-l-4 rounded-lg p-4 ${
              notif.tipo === "sucesso" ? "border-l-green-500 bg-green-50" :
              notif.tipo === "alerta" ? "border-l-red-500 bg-red-50" :
              "border-l-blue-500 bg-blue-50"
            }`}>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-bold text-slate-900">{notif.titulo}</h4>
                  <p className="text-xs text-slate-600">{notif.descricao}</p>
                </div>
                <span className="text-xs text-slate-600">{notif.data}</span>
              </div>
              <div className="flex gap-2">
                {notif.canais.map((canal) => (
                  <Badge key={canal} variant="outline" className="text-xs">
                    {canal === "slack" ? "💬 Slack" : "📧 Email"}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para Máxima Eficiência</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ Configure alertas para métricas críticas (CPA, ROI, conversões)",
            "✅ Use Slack para alertas urgentes (CPA acima do limite)",
            "✅ Use Email para relatórios diários e resumos",
            "✅ Ative notificações de meta atingida para motivação da equipe",
            "✅ Desative notificações de baixa prioridade para evitar ruído",
            "✅ Configure horários específicos para relatórios (ex: 20h)",
            "✅ Teste as notificações antes de confiar nelas"
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">{dica}</p>
          ))}
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Benefícios das Notificações Automáticas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { titulo: "Reação Rápida", descricao: "Identifique problemas em minutos, não em horas" },
            { titulo: "Equipe Alinhada", descricao: "Todos recebem atualizações em tempo real" },
            { titulo: "Menos Stress", descricao: "Não precisa checar dashboard constantemente" },
            { titulo: "Melhor ROI", descricao: "Pause campanhas ruins antes de gastar muito" },
            { titulo: "Celebre Vitórias", descricao: "Receba alertas quando atinge metas" },
            { titulo: "Dados Históricos", descricao: "Acompanhe padrões de notificações" }
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
