import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, CheckCircle, ArrowRight, Settings, Zap, TrendingUp } from "lucide-react";
import { useState } from "react";

export default function FerramentaClonagemCampanhasSection() {
  const [selectedCampanha, setSelectedCampanha] = useState(0);
  const [selectedPersonaDestino, setSelectedPersonaDestino] = useState(1);

  const campanhas = [
    {
      id: 1,
      nome: "Pijama Conforto - Verão",
      persona: "Carol",
      data: "15 Jan - 31 Jan",
      conversoes: 340,
      vendas: "R$ 612.000",
      roi: "156%",
      status: "Ativa",
      descricao: "Campanha de pijama conforto com foco em verão",
      hook: "Durma confortável neste verão!",
      hashtags: "#PijamaConforto #Verão #Feminnita",
      plataforma: "Instagram + TikTok",
    },
    {
      id: 2,
      nome: "Coleção Premium",
      persona: "Vanessa",
      data: "01 Jan - 14 Jan",
      conversoes: 450,
      vendas: "R$ 945.000",
      roi: "142%",
      status: "Finalizada",
      descricao: "Lançamento da coleção premium",
      hook: "Luxo e conforto em um só lugar",
      hashtags: "#ColecaoPremium #Feminnita #Luxo",
      plataforma: "Instagram + TikTok",
    },
    {
      id: 3,
      nome: "Flash Sale",
      persona: "Renata",
      data: "20 Jan - 22 Jan",
      conversoes: 280,
      vendas: "R$ 504.000",
      roi: "168%",
      status: "Finalizada",
      descricao: "Promoção relâmpago de 48 horas",
      hook: "Apenas 48 horas de desconto!",
      hashtags: "#FlashSale #Desconto #Feminnita",
      plataforma: "Instagram",
    },
  ];

  const personas = [
    { id: 1, nome: "Carol", imagem: "👩‍💼", cor: "blue" },
    { id: 2, nome: "Renata", imagem: "👩‍🎨", cor: "green" },
    { id: 3, nome: "Vanessa", imagem: "👩‍🦰", cor: "purple" },
    { id: 4, nome: "Luiza", imagem: "👩‍🔬", cor: "pink" },
  ];

  const currentCampanha = campanhas[selectedCampanha];
  const personaDestino = personas[selectedPersonaDestino];

  const ajustesAutomaticos = [
    { campo: "Hook", original: currentCampanha.hook, ajustado: `${personaDestino.nome}, ${currentCampanha.hook.toLowerCase()}` },
    { campo: "Hashtags", original: currentCampanha.hashtags, ajustado: `${currentCampanha.hashtags} #${personaDestino.nome}` },
    { campo: "Horário", original: "14:30", ajustado: "20:00 (melhor para " + personaDestino.nome + ")" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Ferramenta de Clonagem de Campanhas</h2>
        <p className="text-slate-600">Copie campanhas bem-sucedidas com ajustes automáticos por persona</p>
      </div>

      {/* Status */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-900">
            <CheckCircle className="w-5 h-5" />
            Clonagem Inteligente
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-900 space-y-2">
          <p>✓ 3 campanhas disponíveis para clonar</p>
          <p>✓ Ajustes automáticos por persona</p>
          <p>✓ 12 clonagens realizadas este mês</p>
          <p className="text-sm">Taxa de sucesso: 94.2%</p>
        </CardContent>
      </Card>

      {/* Seleção de Campanha */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione a Campanha para Clonar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campanhas.map((camp, idx) => (
              <button
                key={camp.id}
                onClick={() => setSelectedCampanha(idx)}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  selectedCampanha === idx
                    ? "border-pink-500 bg-pink-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{camp.nome}</p>
                    <p className="text-sm text-slate-600 mt-1">{camp.persona} • {camp.plataforma}</p>
                  </div>
                  <Badge className={camp.status === "Ativa" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                    {camp.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Conversões</p>
                    <p className="font-bold text-slate-900">{camp.conversoes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Vendas</p>
                    <p className="font-bold text-slate-900">{camp.vendas}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">ROI</p>
                    <p className="font-bold text-green-600">{camp.roi}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Período</p>
                    <p className="font-bold text-slate-900 text-xs">{camp.data}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes da Campanha */}
      <Card>
        <CardHeader>
          <CardTitle>{currentCampanha.nome}</CardTitle>
          <CardDescription>{currentCampanha.persona} • {currentCampanha.plataforma}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Conversões</p>
              <p className="text-lg font-bold text-slate-900 mt-2">{currentCampanha.conversoes}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Vendas</p>
              <p className="text-lg font-bold text-slate-900 mt-2">{currentCampanha.vendas}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">ROI</p>
              <p className="text-lg font-bold text-green-600 mt-2">{currentCampanha.roi}</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-sm text-slate-600">Período</p>
              <p className="text-lg font-bold text-slate-900 mt-2 text-sm">{currentCampanha.data}</p>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Descrição</h3>
            <p className="text-slate-600 bg-slate-50 rounded-lg p-3">{currentCampanha.descricao}</p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Hook Principal</h3>
            <p className="text-slate-600 bg-slate-50 rounded-lg p-3">{currentCampanha.hook}</p>
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 mb-2">Hashtags</h3>
            <p className="text-slate-600 bg-slate-50 rounded-lg p-3">{currentCampanha.hashtags}</p>
          </div>
        </CardContent>
      </Card>

      {/* Seleção de Persona Destino */}
      <Card>
        <CardHeader>
          <CardTitle>Selecione a Persona Destino</CardTitle>
          <CardDescription>Para qual persona você deseja clonar esta campanha?</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {personas.map((persona, idx) => (
              <button
                key={persona.id}
                onClick={() => setSelectedPersonaDestino(idx)}
                disabled={persona.nome === currentCampanha.persona}
                className={`p-4 rounded-lg border-2 transition text-center ${
                  selectedPersonaDestino === idx
                    ? "border-pink-500 bg-pink-50"
                    : "border-slate-200 hover:border-slate-300"
                } ${persona.nome === currentCampanha.persona ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                <p className="text-2xl mb-2">{persona.imagem}</p>
                <p className="font-semibold text-slate-900">{persona.nome}</p>
                {persona.nome === currentCampanha.persona && (
                  <p className="text-xs text-slate-600 mt-1">Persona original</p>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Ajustes Automáticos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Ajustes Automáticos
          </CardTitle>
          <CardDescription>Elementos que serão adaptados para {personaDestino.nome}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ajustesAutomaticos.map((ajuste, idx) => (
              <div key={idx} className="space-y-2">
                <p className="font-semibold text-slate-900">{ajuste.campo}</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-slate-50 rounded-lg p-3">
                    <p className="text-sm text-slate-600">Original:</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{ajuste.original}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400" />
                  <div className="flex-1 bg-green-50 rounded-lg p-3">
                    <p className="text-sm text-slate-600">Ajustado:</p>
                    <p className="text-sm font-semibold text-slate-900 mt-1">{ajuste.ajustado}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configurações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configurações da Clonagem
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" checked readOnly className="w-5 h-5" />
            <span className="text-slate-900 font-medium flex-1">Ajustar Hook para Persona</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" checked readOnly className="w-5 h-5" />
            <span className="text-slate-900 font-medium flex-1">Otimizar Horário de Posting</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" checked readOnly className="w-5 h-5" />
            <span className="text-slate-900 font-medium flex-1">Adaptar Hashtags</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" readOnly className="w-5 h-5" />
            <span className="text-slate-900 font-medium flex-1">Manter Mesma Duração</span>
          </label>

          <label className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
            <input type="checkbox" readOnly className="w-5 h-5" />
            <span className="text-slate-900 font-medium flex-1">Duplicar Orçamento</span>
          </label>
        </CardContent>
      </Card>

      {/* Preview da Campanha Clonada */}
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 border-pink-200">
        <CardHeader>
          <CardTitle>Preview da Campanha Clonada</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm font-semibold text-slate-600">Nome da Campanha</p>
              <p className="text-slate-900 font-bold">{currentCampanha.nome.replace(currentCampanha.persona, personaDestino.nome)}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">Persona</p>
              <p className="text-slate-900 font-bold">{personaDestino.imagem} {personaDestino.nome}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">Hook</p>
              <p className="text-slate-900 font-bold">{personaDestino.nome}, {currentCampanha.hook.toLowerCase()}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">Hashtags</p>
              <p className="text-slate-900 font-bold">{currentCampanha.hashtags} #{personaDestino.nome}</p>
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-600">Plataforma</p>
              <p className="text-slate-900 font-bold">{currentCampanha.plataforma}</p>
            </div>
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition font-semibold flex items-center justify-center gap-2">
            <Copy className="w-5 h-5" />
            Clonar Campanha para {personaDestino.nome}
          </button>
        </CardContent>
      </Card>

      {/* Histórico de Clonagens */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Clonagens</CardTitle>
          <CardDescription>Últimas campanhas clonadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { original: "Flash Sale", origem: "Renata", destino: "Vanessa", data: "28 Jan", status: "Sucesso", roi: "172%" },
              { original: "Coleção Premium", origem: "Vanessa", destino: "Carol", data: "25 Jan", status: "Sucesso", roi: "158%" },
              { original: "Pijama Conforto", origem: "Carol", destino: "Luiza", data: "22 Jan", status: "Sucesso", roi: "134%" },
            ].map((clone, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{clone.original}</p>
                  <p className="text-sm text-slate-600 mt-1">{clone.origem} → {clone.destino}</p>
                  <p className="text-xs text-slate-500">{clone.data}</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-green-100 text-green-800 text-xs mb-2">{clone.status}</Badge>
                  <p className="text-sm font-bold text-green-600">{clone.roi}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">📊 Estatísticas de Clonagem</CardTitle>
        </CardHeader>
        <CardContent className="text-purple-900 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Clonagens Este Mês</p>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs mt-1">+40% vs mês anterior</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Taxa de Sucesso</p>
              <p className="text-2xl font-bold">94.2%</p>
              <p className="text-xs mt-1">Muito alta</p>
            </div>
            <div>
              <p className="text-sm font-semibold">ROI Médio Clonado</p>
              <p className="text-2xl font-bold">154%</p>
              <p className="text-xs mt-1">Excelente</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Tempo Economizado</p>
              <p className="text-2xl font-bold">48h</p>
              <p className="text-xs mt-1">Este mês</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
