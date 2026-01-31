import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, AlertCircle, CheckCircle, TrendingUp, Target, Zap, Settings, Trash2 } from "lucide-react";
import { useState } from "react";

export default function SistemaNotificacoesTempoRealSection() {
  const [selectedAlert, setSelectedAlert] = useState(0);
  const [expandedNotification, setExpandedNotification] = useState<number | null>(null);

  const alertas = [
    {
      id: 1,
      nome: "Meta de Conversão Atingida",
      tipo: "Meta",
      condicao: "Conversões > 250/dia",
      status: "Ativo",
      frequencia: "Diária",
      ultimaAtivacao: "31 Jan 14:32",
      proxima: "01 Feb 14:32",
      pessoas: ["seu.email@feminnita.com.br"],
    },
    {
      id: 2,
      nome: "Trend Viral Detectada",
      tipo: "Trend",
      condicao: "Trend crescimento > 50%",
      status: "Ativo",
      frequencia: "Em tempo real",
      ultimaAtivacao: "31 Jan 16:45",
      proxima: "Contínuo",
      pessoas: ["seu.email@feminnita.com.br"],
    },
    {
      id: 3,
      nome: "Anomalia de Performance",
      tipo: "Anomalia",
      condicao: "Performance < média -20%",
      status: "Ativo",
      frequencia: "A cada 1 hora",
      ultimaAtivacao: "30 Jan 09:15",
      proxima: "01 Feb 10:15",
      pessoas: ["seu.email@feminnita.com.br"],
    },
    {
      id: 4,
      nome: "Oportunidade de Influenciador",
      tipo: "Oportunidade",
      condicao: "Micro-influenciador disponível",
      status: "Ativo",
      frequencia: "Conforme surge",
      ultimaAtivacao: "29 Jan 11:22",
      proxima: "Quando disponível",
      pessoas: ["seu.email@feminnita.com.br"],
    },
  ];

  const currentAlert = alertas[selectedAlert];

  const notificacoes = [
    {
      id: 1,
      titulo: "🎉 Meta de Conversão Atingida!",
      descricao: "Você atingiu 285 conversões hoje - 14% acima da meta!",
      tipo: "sucesso",
      timestamp: "há 2 horas",
      persona: "Luiza",
      acao: "Ver detalhes",
    },
    {
      id: 2,
      titulo: "🔥 Trend Viral Detectada",
      descricao: "#PijamaChallenge cresceu 156% em 2 horas - Carol deveria postar agora!",
      tipo: "oportunidade",
      timestamp: "há 3 horas",
      persona: "Carol",
      acao: "Criar post",
    },
    {
      id: 3,
      titulo: "⚠️ Anomalia de Performance",
      descricao: "Performance de Renata caiu 28% - Investigar possível problema com horário",
      tipo: "alerta",
      timestamp: "há 5 horas",
      persona: "Renata",
      acao: "Analisar",
    },
    {
      id: 4,
      titulo: "💡 Oportunidade: Micro-influenciador",
      descricao: "Beatriz Rocha (18K seguidores, 10.5% engajamento) disponível por R$ 1.2K",
      tipo: "oportunidade",
      timestamp: "há 8 horas",
      persona: "Geral",
      acao: "Contratar",
    },
    {
      id: 5,
      titulo: "✅ Teste A/B Finalizado",
      descricao: "Hook 2 venceu com 10.8% taxa de conversão (+8% vs Hook 1)",
      tipo: "sucesso",
      timestamp: "há 12 horas",
      persona: "Carol",
      acao: "Aplicar",
    },
  ];

  const regras = [
    {
      id: 1,
      nome: "Conversão Alta",
      condicao: "Conversões > 250",
      acao: "Email + Push",
      ativo: true,
    },
    {
      id: 2,
      nome: "Trend em Alta",
      condicao: "Crescimento > 50%",
      acao: "Email + Push + SMS",
      ativo: true,
    },
    {
      id: 3,
      nome: "Performance Baixa",
      condicao: "Performance < -20%",
      acao: "Email",
      ativo: true,
    },
    {
      id: 4,
      nome: "ROI Baixo",
      condicao: "ROI < 300%",
      acao: "Email",
      ativo: false,
    },
  ];

  const canais = [
    { nome: "Email", ativo: true, notificacoes: 1250 },
    { nome: "Push", ativo: true, notificacoes: 850 },
    { nome: "SMS", ativo: false, notificacoes: 0 },
    { nome: "WhatsApp", ativo: true, notificacoes: 420 },
    { nome: "Slack", ativo: true, notificacoes: 320 },
    { nome: "Discord", ativo: false, notificacoes: 0 },
  ];

  const getNotificacaoColor = (tipo: string) => {
    if (tipo === "sucesso") return "bg-green-50 border-green-200";
    if (tipo === "alerta") return "bg-red-50 border-red-200";
    if (tipo === "oportunidade") return "bg-blue-50 border-blue-200";
    return "bg-slate-50 border-slate-200";
  };

  const getIconColor = (tipo: string) => {
    if (tipo === "sucesso") return "text-green-600";
    if (tipo === "alerta") return "text-red-600";
    if (tipo === "oportunidade") return "text-blue-600";
    return "text-slate-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Sistema de Notificações em Tempo Real</h2>
        <p className="text-slate-600">Receba alertas automáticos quando metas são atingidas ou anomalias detectadas</p>
      </div>

      {/* Notificações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notificações Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notificacoes.map((notif) => (
              <div
                key={notif.id}
                className={`border-2 rounded-lg p-4 cursor-pointer transition ${getNotificacaoColor(notif.tipo)}`}
                onClick={() => setExpandedNotification(expandedNotification === notif.id ? null : notif.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`text-2xl`}>{notif.titulo.split(" ")[0]}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{notif.titulo}</p>
                      <p className="text-sm text-slate-600 mt-1">{notif.descricao}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="text-xs mb-2">{notif.persona}</Badge>
                    <p className="text-xs text-slate-600">{notif.timestamp}</p>
                  </div>
                </div>

                {expandedNotification === notif.id && (
                  <div className="mt-3 pt-3 border-t border-current border-opacity-20">
                    <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded hover:from-pink-600 hover:to-purple-600 transition font-semibold text-sm">
                      {notif.acao}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alertas Configurados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Alertas Configurados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alertas.map((alerta, idx) => (
              <button
                key={alerta.id}
                onClick={() => setSelectedAlert(idx)}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  selectedAlert === idx
                    ? "border-pink-500 bg-pink-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{alerta.nome}</p>
                    <p className="text-sm text-slate-600">{alerta.condicao}</p>
                  </div>
                  <Badge className={alerta.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"}>
                    {alerta.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Tipo</p>
                    <p className="font-bold text-slate-900">{alerta.tipo}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Frequência</p>
                    <p className="font-bold text-slate-900 text-xs">{alerta.frequencia}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Última</p>
                    <p className="font-bold text-slate-900 text-xs">{alerta.ultimaAtivacao}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes do Alerta */}
      <Card>
        <CardHeader>
          <CardTitle>{currentAlert.nome}</CardTitle>
          <CardDescription>{currentAlert.tipo} • {currentAlert.condicao}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Status</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{currentAlert.status}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Frequência</p>
              <p className="text-lg font-bold text-slate-900 mt-1 text-sm">{currentAlert.frequencia}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Última</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{currentAlert.ultimaAtivacao}</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Próxima</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{currentAlert.proxima}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Destinatários</h3>
            <div className="space-y-2">
              {currentAlert.pessoas.map((pessoa, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="text-slate-900">{pessoa}</span>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition font-semibold">
              ✏️ Editar
            </button>
            <button className="py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition font-semibold flex items-center justify-center gap-2">
              <Trash2 className="w-5 h-5" />
              Deletar
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Regras de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Regras de Notificação</CardTitle>
          <CardDescription>Configure quando e como receber notificações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {regras.map((regra) => (
              <div key={regra.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{regra.nome}</p>
                  <p className="text-sm text-slate-600">{regra.condicao}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-xs">{regra.acao}</Badge>
                  <input
                    type="checkbox"
                    checked={regra.ativo}
                    readOnly
                    className="w-5 h-5"
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Canais de Notificação */}
      <Card>
        <CardHeader>
          <CardTitle>Canais de Notificação</CardTitle>
          <CardDescription>Escolha por quais canais receber notificações</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {canais.map((canal) => (
              <label key={canal.nome} className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={canal.ativo}
                  readOnly
                  className="w-5 h-5"
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{canal.nome}</p>
                  <p className="text-xs text-slate-600">{canal.notificacoes} este mês</p>
                </div>
              </label>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Criar Novo Alerta */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Alerta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Nome do Alerta</label>
            <input
              type="text"
              placeholder="Ex: Conversão Acima de 300"
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Tipo</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
                <option>Meta</option>
                <option>Trend</option>
                <option>Anomalia</option>
                <option>Oportunidade</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Frequência</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
                <option>Em tempo real</option>
                <option>A cada 1 hora</option>
                <option>A cada 6 horas</option>
                <option>Diária</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Condição</label>
            <input
              type="text"
              placeholder="Ex: Conversões > 300"
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition font-semibold flex items-center justify-center gap-2">
            <Bell className="w-5 h-5" />
            Criar Alerta
          </button>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">📊 Performance de Notificações</CardTitle>
        </CardHeader>
        <CardContent className="text-green-900 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Alertas Ativos</p>
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs mt-1">configurados</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Notificações Este Mês</p>
              <p className="text-2xl font-bold">2.8K</p>
              <p className="text-xs mt-1">enviadas</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Taxa de Abertura</p>
              <p className="text-2xl font-bold">78%</p>
              <p className="text-xs mt-1">emails</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Ações Tomadas</p>
              <p className="text-2xl font-bold">156</p>
              <p className="text-xs mt-1">baseadas em alertas</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
