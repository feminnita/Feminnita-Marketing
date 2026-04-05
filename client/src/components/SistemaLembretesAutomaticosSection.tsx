import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock, CheckCircle, AlertCircle, Settings, Plus, Trash2, Edit, Send } from "lucide-react";
import { useState } from "react";

export default function SistemaLembretesAutomaticosSection() {
  const [selectedLembrete, setSelectedLembrete] = useState(0);

  const lembretes = [
    {
      id: 1,
      titulo: "Post Carol - Pijama Conforto",
      persona: "Carol",
      plataforma: "Instagram",
      dataHora: "31 Jan 2026 14:30",
      tempoAntes: "30 minutos",
      status: "Ativo",
      canais: ["Push", "Email", "SMS"],
      proximoLembrete: "31 Jan 14:00",
    },
    {
      id: 2,
      titulo: "Reel Renata - Unboxing",
      persona: "Renata",
      plataforma: "TikTok",
      dataHora: "01 Feb 2026 20:00",
      tempoAntes: "1 hora",
      status: "Ativo",
      canais: ["Push", "Email"],
      proximoLembrete: "01 Feb 19:00",
    },
    {
      id: 3,
      titulo: "Story Vanessa - BTS",
      persona: "Vanessa",
      plataforma: "Instagram",
      dataHora: "02 Feb 2026 18:00",
      tempoAntes: "30 minutos",
      status: "Ativo",
      canais: ["Push", "SMS"],
      proximoLembrete: "02 Feb 17:30",
    },
    {
      id: 4,
      titulo: "Post Luiza - Dica de Estilo",
      persona: "Luiza",
      plataforma: "Instagram",
      dataHora: "03 Feb 2026 19:30",
      tempoAntes: "15 minutos",
      status: "Inativo",
      canais: ["Push"],
      proximoLembrete: "-",
    },
  ];

  const historico = [
    {
      data: "31 Jan 14:00",
      evento: "Post Carol - Pijama Conforto",
      canal: "Push",
      status: "Entregue",
      cliques: 1,
    },
    {
      data: "30 Jan 19:00",
      evento: "Reel Renata - Unboxing",
      canal: "Email",
      status: "Entregue",
      cliques: 3,
    },
    {
      data: "29 Jan 17:30",
      evento: "Story Vanessa - BTS",
      canal: "SMS",
      status: "Entregue",
      cliques: 2,
    },
    {
      data: "28 Jan 09:00",
      evento: "Post Carol - Conforto",
      canal: "Push",
      status: "Entregue",
      cliques: 5,
    },
  ];

  const canaisDisponiveis = [
    { nome: "Push", icone: "🔔", descricao: "Notificação no navegador" },
    { nome: "Email", icone: "📧", descricao: "Envio de email" },
    { nome: "SMS", icone: "💬", descricao: "Mensagem de texto" },
    { nome: "WhatsApp", icone: "📱", descricao: "WhatsApp Business" },
    { nome: "Slack", icone: "💼", descricao: "Notificação no Slack" },
    { nome: "Discord", icone: "🎮", descricao: "Notificação no Discord" },
  ];

  const currentLembrete = lembretes[selectedLembrete];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Sistema de Lembretes Automáticos</h2>
        <p className="text-slate-600">Receba notificações antes de cada post ser publicado</p>
      </div>

      {/* Disclaimer */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Lembretes de exemplo — conecte seus posts para alertas reais</p>
              <p className="text-sm text-slate-600 mt-1">
                Os lembretes e histórico abaixo são ilustrativos com datas de exemplo. Os alertas reais serão baseados nos posts que você agendar na plataforma.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Geral */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <CheckCircle className="w-5 h-5" />
            Lembretes Ativos
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-2">
          <p>✓ 3 lembretes agendados para hoje</p>
          <p>✓ 6 lembretes programados para esta semana</p>
          <p>✓ Taxa de entrega: 98.5%</p>
          <p className="text-sm">Próximo lembrete: 31 Jan 14:00 (Post Carol)</p>
        </CardContent>
      </Card>

      {/* Lista de Lembretes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Lembretes Configurados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lembretes.map((lembrete, idx) => (
              <button
                key={lembrete.id}
                onClick={() => setSelectedLembrete(idx)}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  selectedLembrete === idx
                    ? "border-pink-500 bg-pink-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{lembrete.titulo}</p>
                    <p className="text-sm text-slate-600 mt-1">{lembrete.persona} • {lembrete.plataforma}</p>
                  </div>
                  <Badge className={lembrete.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {lembrete.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Data/Hora</p>
                    <p className="font-bold text-slate-900 text-xs">{lembrete.dataHora}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Tempo Antes</p>
                    <p className="font-bold text-slate-900">{lembrete.tempoAntes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Canais</p>
                    <p className="font-bold text-slate-900 text-xs">{lembrete.canais.length} ativo(s)</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes do Lembrete */}
      <Card>
        <CardHeader>
          <CardTitle>{currentLembrete.titulo}</CardTitle>
          <CardDescription>{currentLembrete.persona} • {currentLembrete.plataforma}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Data/Hora</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{currentLembrete.dataHora}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Tempo Antes</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{currentLembrete.tempoAntes}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Próximo Lembrete</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{currentLembrete.proximoLembrete}</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Status</p>
              <p className="text-sm font-bold text-slate-900 mt-1">{currentLembrete.status}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Canais de Notificação</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {canaisDisponiveis.map((canal) => (
                <label
                  key={canal.nome}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition ${
                    currentLembrete.canais.includes(canal.nome)
                      ? "border-pink-500 bg-pink-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={currentLembrete.canais.includes(canal.nome)}
                      readOnly
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{canal.icone} {canal.nome}</p>
                      <p className="text-xs text-slate-600">{canal.descricao}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button className="py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition font-semibold flex items-center justify-center gap-2">
              <Send className="w-5 h-5" />
              Testar
            </button>
            <button className="py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-semibold flex items-center justify-center gap-2">
              <Edit className="w-5 h-5" />
              Editar
            </button>
            <button className="py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition font-semibold flex items-center justify-center gap-2">
              <Trash2 className="w-5 h-5" />
              Deletar
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Lembretes */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Lembretes Enviados</CardTitle>
          <CardDescription>Últimos lembretes entregues</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {historico.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{item.evento}</p>
                  <p className="text-sm text-slate-600 mt-1">{item.data} • {item.canal}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800 text-xs mb-2">{item.status}</Badge>
                  <p className="text-sm font-bold text-slate-900">{item.cliques} cliques</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Criar Novo Lembrete */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Criar Novo Lembrete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Persona</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
                <option>Carol</option>
                <option>Renata</option>
                <option>Vanessa</option>
                <option>Luiza</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Plataforma</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
                <option>Instagram</option>
                <option>TikTok</option>
                <option>YouTube</option>
                <option>LinkedIn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Título do Post</label>
            <input
              type="text"
              placeholder="Ex: Post Carol - Pijama Conforto"
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Data do Post</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Hora do Post</label>
              <input type="time" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Tempo Antes (minutos)</label>
            <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
              <option>15 minutos</option>
              <option>30 minutos</option>
              <option>1 hora</option>
              <option>2 horas</option>
              <option>1 dia</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-3">Canais de Notificação</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {canaisDisponiveis.map((canal) => (
                <label key={canal.nome} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4" defaultChecked />
                  <span className="text-sm text-slate-900">{canal.icone} {canal.nome}</span>
                </label>
              ))}
            </div>
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition font-semibold flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Criar Lembrete
          </button>
        </CardContent>
      </Card>

      {/* Configurações Globais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações Globais
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" checked readOnly className="w-5 h-5" />
            <span className="text-slate-900 font-medium flex-1">Lembretes Habilitados</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" checked readOnly className="w-5 h-5" />
            <span className="text-slate-900 font-medium flex-1">Notificações Push</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" checked readOnly className="w-5 h-5" />
            <span className="text-slate-900 font-medium flex-1">Lembretes de Email</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" readOnly className="w-5 h-5" />
            <span className="text-slate-900 font-medium flex-1">Lembretes de SMS</span>
          </label>

          <div className="pt-3 border-t border-slate-200">
            <label className="block text-sm font-medium text-slate-900 mb-2">Horário de Silêncio</label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input type="time" placeholder="De" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <input type="time" placeholder="Até" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">📊 Estatísticas de Lembretes</CardTitle>
        </CardHeader>
        <CardContent className="text-green-900 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Lembretes Este Mês</p>
              <p className="text-2xl font-bold">42</p>
              <p className="text-xs mt-1">+18% vs mês anterior</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Taxa de Entrega</p>
              <p className="text-2xl font-bold">98.5%</p>
              <p className="text-xs mt-1">Muito alta</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Taxa de Clique</p>
              <p className="text-2xl font-bold">34.2%</p>
              <p className="text-xs mt-1">Excelente</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Tempo Médio</p>
              <p className="text-2xl font-bold">2.3s</p>
              <p className="text-xs mt-1">Entrega</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
