import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2, Edit, CheckCircle, AlertCircle, Users, Share2, Settings } from "lucide-react";
import { useState } from "react";

export default function SuporteMultiplosCalendariosSection() {
  const [selectedCalendario, setSelectedCalendario] = useState(0);

  const calendarios = [
    {
      id: 1,
      nome: "Feminnita - Posts Principais",
      email: "feminnita.posts@gmail.com",
      cor: "pink",
      eventos: 24,
      sincronizado: true,
      ultimaSync: "há 5 minutos",
      compartilhado: false,
      permissoes: "Proprietário",
      membros: 1,
    },
    {
      id: 2,
      nome: "Carol - Conteúdo Pessoal",
      email: "carol.content@gmail.com",
      cor: "blue",
      eventos: 8,
      sincronizado: true,
      ultimaSync: "há 10 minutos",
      compartilhado: true,
      permissoes: "Editor",
      membros: 2,
    },
    {
      id: 3,
      nome: "Equipe Feminnita - Colaborativo",
      email: "team.feminnita@gmail.com",
      cor: "purple",
      eventos: 15,
      sincronizado: true,
      ultimaSync: "há 15 minutos",
      compartilhado: true,
      permissoes: "Visualizador",
      membros: 4,
    },
    {
      id: 4,
      nome: "Renata - Conteúdo",
      email: "renata.content@gmail.com",
      cor: "green",
      eventos: 6,
      sincronizado: true,
      ultimaSync: "há 20 minutos",
      compartilhado: false,
      permissoes: "Proprietário",
      membros: 1,
    },
  ];

  const currentCalendario = calendarios[selectedCalendario];

  const membrosCompartilhados: Array<{ nome: string; email: string; permissao: string; adicionado: string }> = [];

  const eventosCompartilhados = [
    {
      titulo: "Post Carol - Pijama Conforto",
      data: "31 Jan 14:30",
      criador: "Carol",
      compartilhadoCom: 3,
    },
    {
      titulo: "Reel Renata - Unboxing",
      data: "01 Feb 20:00",
      criador: "Renata",
      compartilhadoCom: 2,
    },
    {
      titulo: "Story Vanessa - BTS",
      data: "02 Feb 18:00",
      criador: "Vanessa",
      compartilhadoCom: 4,
    },
  ];

  const permissoes = [
    { nome: "Proprietário", descricao: "Controle total do calendário", icone: "👑" },
    { nome: "Editor", descricao: "Pode criar e editar eventos", icone: "✏️" },
    { nome: "Visualizador", descricao: "Pode apenas visualizar eventos", icone: "👁️" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Suporte a Múltiplos Calendários Google</h2>
        <p className="text-slate-600">Sincronize com calendários compartilhados da equipe</p>
      </div>

      {/* Status Geral */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <CheckCircle className="w-5 h-5" />
            Calendários Conectados
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-2">
          <p>Configure calendários Google abaixo e convide membros da equipe para compartilhar.</p>
          <p className="text-sm">Membros adicionados aparecerão na lista "Membros Compartilhados".</p>
        </CardContent>
      </Card>

      {/* Lista de Calendários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Calendários Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {calendarios.map((cal, idx) => (
              <button
                key={cal.id}
                onClick={() => setSelectedCalendario(idx)}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  selectedCalendario === idx
                    ? "border-pink-500 bg-pink-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-4 h-4 rounded-full bg-${cal.cor}-500 mt-1`}></div>
                    <div>
                      <p className="font-semibold text-slate-900">{cal.nome}</p>
                      <p className="text-xs text-slate-600 mt-1">{cal.email}</p>
                    </div>
                  </div>
                  <Badge className={cal.sincronizado ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                    {cal.sincronizado ? "Sincronizado" : "Erro"}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Eventos</p>
                    <p className="font-bold text-slate-900">{cal.eventos}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Membros</p>
                    <p className="font-bold text-slate-900">{cal.membros}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Permissão</p>
                    <p className="font-bold text-slate-900 text-xs">{cal.permissoes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Última Sync</p>
                    <p className="font-bold text-slate-900 text-xs">{cal.ultimaSync}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes do Calendário */}
      <Card>
        <CardHeader>
          <CardTitle>{currentCalendario.nome}</CardTitle>
          <CardDescription>{currentCalendario.email}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Eventos</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{currentCalendario.eventos}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Membros</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{currentCalendario.membros}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Permissão</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{currentCalendario.permissoes}</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Compartilhado</p>
              <p className="text-lg font-bold text-slate-900 mt-1">{currentCalendario.compartilhado ? "Sim" : "Não"}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button className="py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition font-semibold flex items-center justify-center gap-2">
              <Share2 className="w-5 h-5" />
              Compartilhar
            </button>
            <button className="py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition font-semibold flex items-center justify-center gap-2">
              <Edit className="w-5 h-5" />
              Editar
            </button>
            <button className="py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition font-semibold flex items-center justify-center gap-2">
              <Trash2 className="w-5 h-5" />
              Desconectar
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Membros Compartilhados */}
      {currentCalendario.compartilhado && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Membros Compartilhados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {membrosCompartilhados.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Nenhum membro adicionado ainda. Use o formulário abaixo para convidar a equipe.</p>
            ) : (
              <div className="space-y-3">
                {membrosCompartilhados.map((membro) => (
                  <div key={membro.email} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{membro.nome}</p>
                      <p className="text-sm text-slate-600 mt-1">{membro.email}</p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-blue-100 text-blue-800 text-xs mb-2">{membro.permissao}</Badge>
                      <p className="text-xs text-slate-600">Adicionado {membro.adicionado}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Eventos Compartilhados */}
      <Card>
        <CardHeader>
          <CardTitle>Eventos Compartilhados</CardTitle>
          <CardDescription>Eventos sincronizados com a equipe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {eventosCompartilhados.map((evento, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{evento.titulo}</p>
                  <p className="text-sm text-slate-600 mt-1">{evento.data} • Criado por {evento.criador}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800 text-xs mb-2">Compartilhado</Badge>
                  <p className="text-sm font-bold text-slate-900">{evento.compartilhadoCom} pessoas</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Adicionar Novo Calendário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Conectar Novo Calendário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Email do Calendário Google</label>
            <input
              type="email"
              placeholder="Ex: team.calendar@gmail.com"
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Nome do Calendário</label>
            <input
              type="text"
              placeholder="Ex: Equipe Feminnita - Colaborativo"
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Cor</label>
            <div className="flex gap-2">
              {["pink", "blue", "green", "purple", "red", "yellow"].map((cor) => (
                <button
                  key={cor}
                  className={`w-10 h-10 rounded-full bg-${cor}-500 hover:ring-2 ring-offset-2 ring-slate-300 transition`}
                ></button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Tipo de Acesso</label>
            <div className="space-y-2">
              {permissoes.map((perm) => (
                <label key={perm.nome} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <input type="radio" name="permissao" className="w-4 h-4" />
                  <div>
                    <p className="font-semibold text-slate-900">{perm.icone} {perm.nome}</p>
                    <p className="text-xs text-slate-600">{perm.descricao}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition font-semibold flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Conectar Calendário
          </button>
        </CardContent>
      </Card>

      {/* Gerenciar Membros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Gerenciar Membros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Adicionar Novo Membro</label>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email do membro"
                className="flex-1 border border-slate-300 rounded-lg px-3 py-2"
              />
              <select className="border border-slate-300 rounded-lg px-3 py-2">
                <option>Editor</option>
                <option>Visualizador</option>
              </select>
              <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition font-semibold">
                Adicionar
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm font-medium text-slate-900 mb-3">Membros Atuais</p>
            {membrosCompartilhados.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">Nenhum membro adicionado.</p>
            ) : (
            <div className="space-y-2">
              {membrosCompartilhados.map((membro) => (
                <div key={membro.email} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{membro.nome}</p>
                    <p className="text-xs text-slate-600">{membro.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select className="text-xs border border-slate-300 rounded px-2 py-1">
                      <option>Editor</option>
                      <option>Visualizador</option>
                    </select>
                    <button className="text-red-600 hover:text-red-700">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Configurações de Sincronização */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações de Sincronização
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" checked readOnly className="w-5 h-5" />
            <span className="text-slate-900 font-medium flex-1">Sincronizar Automaticamente</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" checked readOnly className="w-5 h-5" />
            <span className="text-slate-900 font-medium flex-1">Notificar sobre Mudanças</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" checked readOnly className="w-5 h-5" />
            <span className="text-slate-900 font-medium flex-1">Permitir Edição em Tempo Real</span>
            <CheckCircle className="w-5 h-5 text-green-600" />
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" readOnly className="w-5 h-5" />
            <span className="text-slate-900 font-medium flex-1">Sincronizar Anexos</span>
          </label>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">📊 Estatísticas de Compartilhamento</CardTitle>
        </CardHeader>
        <CardContent className="text-purple-900 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Calendários Ativos</p>
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs mt-1">Sincronizados</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Membros da Equipe</p>
              <p className="text-2xl font-bold">4</p>
              <p className="text-xs mt-1">Compartilhando</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Eventos Compartilhados</p>
              <p className="text-2xl font-bold">53</p>
              <p className="text-xs mt-1">Total</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Taxa de Sincronização</p>
              <p className="text-2xl font-bold">100%</p>
              <p className="text-xs mt-1">Perfeita</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
