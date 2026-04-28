import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Copy, ArrowRight, Settings, Zap, AlertCircle } from "lucide-react";
import { useState } from "react";

const PERSONAS = [
  { id: 1, nome: "Carol", imagem: "👩‍💼" },
  { id: 2, nome: "Renata", imagem: "👩‍🎨" },
  { id: 3, nome: "Vanessa", imagem: "👩‍🦰" },
  { id: 4, nome: "Luiza", imagem: "👩‍🔬" },
];

export default function FerramentaClonagemCampanhasSection() {
  const { data: campanhasRaw = [] } = trpc.campaigns.listar.useQuery();
  const campanhas = campanhasRaw as any[];

  const [selectedIdx, setSelectedIdx] = useState(0);
  const [selectedPersonaIdx, setSelectedPersonaIdx] = useState(1);

  const currentCampanha = campanhas[selectedIdx];
  const personaDestino = PERSONAS[selectedPersonaIdx];

  const ajustesAutomaticos = currentCampanha ? [
    {
      campo: "Nome",
      original: currentCampanha.nome,
      ajustado: `${currentCampanha.nome} – ${personaDestino.nome}`,
    },
    {
      campo: "Persona",
      original: currentCampanha.persona ?? "—",
      ajustado: personaDestino.nome,
    },
    {
      campo: "Horário",
      original: "Horário padrão",
      ajustado: `Otimizado para ${personaDestino.nome}`,
    },
  ] : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#6B1D28' }}>Ferramenta de Clonagem de Campanhas</h2>
        <p className="text-slate-500 text-sm mt-1">Copie campanhas bem-sucedidas com ajustes automáticos por persona</p>
      </div>

      {/* Seleção de Campanha */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Selecione a Campanha para Clonar</CardTitle>
          <CardDescription className="text-xs">Campanhas cadastradas neste painel</CardDescription>
        </CardHeader>
        <CardContent>
          {campanhas.length === 0 ? (
            <div className="text-center py-8 text-slate-400 space-y-2">
              <AlertCircle className="w-8 h-8 mx-auto" />
              <p className="text-sm">Nenhuma campanha cadastrada.</p>
              <p className="text-xs">Adicione campanhas na seção de Campanhas para usar esta ferramenta.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {campanhas.map((camp: any, idx: number) => (
                <button
                  key={camp.id ?? idx}
                  onClick={() => setSelectedIdx(idx)}
                  className={`w-full p-4 rounded-lg border-2 transition text-left ${
                    selectedIdx === idx
                      ? "border-slate-800 bg-slate-50"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                  style={selectedIdx === idx ? { borderColor: '#6B1D28' } : {}}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-semibold text-slate-900">{camp.nome}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{camp.persona ?? '—'} • {camp.plataforma ?? '—'}</p>
                    </div>
                    <Badge className={camp.status === 'ativa' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}>
                      {camp.status ?? '—'}
                    </Badge>
                  </div>
                  {camp.performance && (
                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <p className="text-slate-500">Conversões</p>
                        <p className="font-bold text-slate-900">{(camp.performance.conversoes ?? 0).toLocaleString('pt-BR')}</p>
                      </div>
                      <div>
                        <p className="text-slate-500">CTR</p>
                        <p className="font-bold text-slate-900">{(camp.performance.ctr ?? 0).toFixed(2)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-500">ROI</p>
                        <p className="font-bold text-green-600">{(camp.performance.roi ?? 0).toFixed(1)}%</p>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {currentCampanha && (
        <>
          {/* Seleção de Persona Destino */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Selecione a Persona Destino</CardTitle>
              <CardDescription className="text-xs">Para qual persona você deseja clonar esta campanha?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {PERSONAS.map((persona, idx) => (
                  <button
                    key={persona.id}
                    onClick={() => setSelectedPersonaIdx(idx)}
                    disabled={persona.nome === (currentCampanha.persona ?? '')}
                    className={`p-4 rounded-lg border-2 transition text-center ${
                      selectedPersonaIdx === idx
                        ? "border-slate-800 bg-slate-50"
                        : "border-slate-200 hover:border-slate-300"
                    } ${persona.nome === (currentCampanha.persona ?? '') ? "opacity-50 cursor-not-allowed" : ""}`}
                    style={selectedPersonaIdx === idx ? { borderColor: '#6B1D28' } : {}}
                  >
                    <p className="text-2xl mb-2">{persona.imagem}</p>
                    <p className="font-semibold text-sm text-slate-900">{persona.nome}</p>
                    {persona.nome === (currentCampanha.persona ?? '') && (
                      <p className="text-xs text-slate-400 mt-1">Persona original</p>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Ajustes Automáticos */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Zap className="w-4 h-4" style={{ color: '#6B1D28' }} />
                Ajustes Automáticos
              </CardTitle>
              <CardDescription className="text-xs">Elementos que serão adaptados para {personaDestino.nome}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ajustesAutomaticos.map((ajuste, idx) => (
                  <div key={idx} className="space-y-2">
                    <p className="text-sm font-semibold text-slate-700">{ajuste.campo}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-slate-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Original:</p>
                        <p className="text-sm font-medium text-slate-900 mt-0.5">{ajuste.original}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <div className="flex-1 bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-slate-500">Ajustado:</p>
                        <p className="text-sm font-medium text-slate-900 mt-0.5">{ajuste.ajustado}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Settings className="w-4 h-4" style={{ color: '#6B1D28' }} />
                Configurações da Clonagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { label: 'Ajustar nome para Persona', checked: true },
                { label: 'Otimizar Horário de Posting', checked: true },
                { label: 'Adaptar Hashtags', checked: true },
                { label: 'Manter Mesma Duração', checked: false },
                { label: 'Duplicar Orçamento', checked: false },
              ].map((opt, idx) => (
                <label key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 cursor-pointer">
                  <input type="checkbox" defaultChecked={opt.checked} className="w-4 h-4" />
                  <span className="text-sm text-slate-800">{opt.label}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="border-0 shadow-sm border-l-4" style={{ borderLeftColor: '#6B1D28' }}>
            <CardHeader>
              <CardTitle className="text-base">Preview da Campanha Clonada</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-slate-50 rounded-lg p-4 space-y-2 text-sm">
                <div>
                  <p className="text-xs text-slate-500">Nome da Campanha</p>
                  <p className="font-semibold text-slate-900">{currentCampanha.nome} – {personaDestino.nome}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Persona</p>
                  <p className="font-semibold text-slate-900">{personaDestino.imagem} {personaDestino.nome}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Plataforma</p>
                  <p className="font-semibold text-slate-900">{currentCampanha.plataforma ?? '—'}</p>
                </div>
              </div>
              <button
                className="w-full py-3 text-white rounded-lg font-medium flex items-center justify-center gap-2 hover:opacity-90 transition"
                style={{ backgroundColor: '#6B1D28' }}
              >
                <Copy className="w-4 h-4" />
                Clonar Campanha para {personaDestino.nome}
              </button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
