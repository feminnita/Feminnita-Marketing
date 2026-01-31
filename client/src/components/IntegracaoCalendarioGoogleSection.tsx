import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, CheckCircle, AlertCircle, Zap, Settings, Link2, Trash2, Plus, Eye, Edit } from "lucide-react";
import { useState } from "react";

export default function IntegracaoCalendarioGoogleSection() {
  const [selectedEvento, setSelectedEvento] = useState(0);
  const [expandedEvent, setExpandedEvent] = useState<number | null>(null);

  const eventos = [
    {
      id: 1,
      titulo: "Post Carol - Pijama Conforto",
      persona: "Carol",
      plataforma: "Instagram",
      data: "31 Jan 2026",
      hora: "14:30",
      status: "Agendado",
      sincronizado: true,
      descricao: "Post sobre pijama conforto com dica de styling",
      hashtags: "#PijamaConforto #Moda #Feminnita",
      imagem: "🖼️",
    },
    {
      id: 2,
      titulo: "Reel Renata - Unboxing",
      persona: "Renata",
      plataforma: "TikTok",
      data: "01 Feb 2026",
      hora: "20:00",
      status: "Agendado",
      sincronizado: true,
      descricao: "Vídeo de unboxing de novo modelo",
      hashtags: "#Unboxing #TikTok #Feminnita",
      imagem: "🎥",
    },
    {
      id: 3,
      titulo: "Story Vanessa - Behind the Scenes",
      persona: "Vanessa",
      plataforma: "Instagram",
      data: "02 Feb 2026",
      hora: "18:00",
      status: "Agendado",
      sincronizado: true,
      descricao: "Behind the scenes do dia de gravação",
      hashtags: "#BTS #Instagram #Feminnita",
      imagem: "📸",
    },
    {
      id: 4,
      titulo: "Post Luiza - Dica de Estilo",
      persona: "Luiza",
      plataforma: "Instagram",
      data: "03 Feb 2026",
      hora: "19:30",
      status: "Agendado",
      sincronizado: false,
      descricao: "Dica de como combinar pijamas",
      hashtags: "#Estilo #Moda #Feminnita",
      imagem: "👗",
    },
  ];

  const currentEvent = eventos[selectedEvento];

  const calendarios = [
    {
      nome: "Feminnita - Posts",
      cor: "pink",
      eventos: 24,
      sincronizado: true,
      ultimaSync: "há 5 minutos",
    },
    {
      nome: "Carol - Conteúdo",
      cor: "blue",
      eventos: 8,
      sincronizado: true,
      ultimaSync: "há 10 minutos",
    },
    {
      nome: "Renata - Conteúdo",
      cor: "green",
      eventos: 6,
      sincronizado: true,
      ultimaSync: "há 15 minutos",
    },
    {
      nome: "Vanessa - Conteúdo",
      cor: "purple",
      eventos: 7,
      sincronizado: true,
      ultimaSync: "há 20 minutos",
    },
  ];

  const sincronizacoes = [
    {
      data: "31 Jan 14:32",
      evento: "Post Carol - Pijama Conforto",
      status: "Sucesso",
      detalhes: "Sincronizado com Google Calendar",
    },
    {
      data: "31 Jan 10:15",
      evento: "Reel Renata - Unboxing",
      status: "Sucesso",
      detalhes: "Sincronizado com Google Calendar",
    },
    {
      data: "30 Jan 16:45",
      evento: "Story Vanessa - BTS",
      status: "Sucesso",
      detalhes: "Sincronizado com Google Calendar",
    },
    {
      data: "30 Jan 09:20",
      evento: "Post Luiza - Dica de Estilo",
      status: "Pendente",
      detalhes: "Aguardando sincronização",
    },
  ];

  const configuracoes = [
    { nome: "Sincronização Automática", ativo: true },
    { nome: "Notificações de Posting", ativo: true },
    { nome: "Cores Personalizadas", ativo: true },
    { nome: "Descrição Completa", ativo: true },
    { nome: "Incluir Hashtags", ativo: true },
    { nome: "Sincronizar Imagens", ativo: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Integração com Calendário do Google</h2>
        <p className="text-slate-600">Sincronize posts agendados com seu calendário pessoal</p>
      </div>

      {/* Status de Conexão */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle className="w-5 h-5" />
            Conexão Ativa
          </CardTitle>
        </CardHeader>
        <CardContent className="text-green-900 space-y-2">
          <p>✓ Google Calendar conectado com sucesso</p>
          <p>✓ 4 calendários sincronizados (24 eventos)</p>
          <p>✓ Sincronização em tempo real ativa</p>
          <p className="text-sm">Última sincronização: há 5 minutos</p>
        </CardContent>
      </Card>

      {/* Calendários Sincronizados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendários Sincronizados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {calendarios.map((cal) => (
              <div key={cal.nome} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-4 h-4 rounded-full bg-${cal.cor}-500`}></div>
                  <div>
                    <p className="font-semibold text-slate-900">{cal.nome}</p>
                    <p className="text-xs text-slate-600">{cal.eventos} eventos • {cal.ultimaSync}</p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800">Sincronizado</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Eventos Agendados */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Agendados</CardTitle>
          <CardDescription>Posts sincronizados com Google Calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {eventos.map((evento, idx) => (
              <button
                key={evento.id}
                onClick={() => setSelectedEvento(idx)}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  selectedEvento === idx
                    ? "border-pink-500 bg-pink-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{evento.titulo}</p>
                    <p className="text-sm text-slate-600 mt-1">{evento.descricao}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {evento.sincronizado ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Persona</p>
                    <p className="font-bold text-slate-900">{evento.persona}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Plataforma</p>
                    <p className="font-bold text-slate-900">{evento.plataforma}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Data/Hora</p>
                    <p className="font-bold text-slate-900 text-xs">{evento.data} {evento.hora}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Status</p>
                    <Badge className="text-xs bg-blue-100 text-blue-800">{evento.status}</Badge>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes do Evento */}
      <Card>
        <CardHeader>
          <CardTitle>{currentEvent.titulo}</CardTitle>
          <CardDescription>{currentEvent.persona} • {currentEvent.plataforma}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Data</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{currentEvent.data}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Hora</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{currentEvent.hora}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Status</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{currentEvent.status}</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Sincronizado</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{currentEvent.sincronizado ? "✓ Sim" : "✗ Não"}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Descrição</h3>
            <p className="text-slate-600 bg-slate-50 rounded-lg p-3">{currentEvent.descricao}</p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Hashtags</h3>
            <p className="text-slate-600 bg-slate-50 rounded-lg p-3">{currentEvent.hashtags}</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button className="py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition font-semibold flex items-center justify-center gap-2">
              <Eye className="w-5 h-5" />
              Visualizar
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

      {/* Histórico de Sincronizações */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Sincronizações</CardTitle>
          <CardDescription>Últimas sincronizações com Google Calendar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sincronizacoes.map((sync, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <div className={`mt-1 ${sync.status === "Sucesso" ? "text-green-600" : "text-yellow-600"}`}>
                  {sync.status === "Sucesso" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{sync.evento}</p>
                  <p className="text-sm text-slate-600 mt-1">{sync.detalhes}</p>
                  <p className="text-xs text-slate-500 mt-2">{sync.data}</p>
                </div>
                <Badge className={sync.status === "Sucesso" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                  {sync.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações de Sincronização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {configuracoes.map((config) => (
            <label key={config.nome} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
              <input
                type="checkbox"
                checked={config.ativo}
                readOnly
                className="w-5 h-5"
              />
              <span className="text-slate-900 font-medium flex-1">{config.nome}</span>
              {config.ativo && <CheckCircle className="w-5 h-5 text-green-600" />}
            </label>
          ))}
        </CardContent>
      </Card>

      {/* Criar Novo Evento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Agendar Novo Post
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

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Descrição</label>
            <textarea
              placeholder="Descreva o conteúdo do post..."
              className="w-full border border-slate-300 rounded-lg px-3 py-2 h-24"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Data</label>
              <input type="date" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Hora</label>
              <input type="time" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition font-semibold flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Agendar e Sincronizar
          </button>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">📊 Estatísticas de Sincronização</CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Eventos Sincronizados</p>
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs mt-1">Este mês</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Taxa de Sucesso</p>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs mt-1">Sem erros</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Calendários Ativos</p>
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs mt-1">Personas</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Próximo Evento</p>
              <p className="text-2xl font-bold">31 Jan</p>
              <p className="text-xs mt-1">14:30</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle className="text-slate-900">✨ Benefícios da Integração</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-slate-900">
          <p>✓ Visualize todos os posts agendados em um único calendário</p>
          <p>✓ Receba notificações antes de cada post ser publicado</p>
          <p>✓ Evite conflitos de agendamento entre personas</p>
          <p>✓ Mantenha seu calendário pessoal sincronizado com a estratégia de marketing</p>
          <p>✓ Exporte dados de agendamento para relatórios</p>
        </CardContent>
      </Card>
    </div>
  );
}
