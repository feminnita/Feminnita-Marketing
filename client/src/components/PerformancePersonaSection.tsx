import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Eye, Heart, AlertCircle } from "lucide-react";
import PersonaAvatar from "./PersonaAvatar";
import { trpc } from "@/lib/trpc";

const PERSONAS = ["Carol", "Renata", "Vanessa", "Luiza"];

export default function PerformancePersonaSection() {
  const { data: campanhas = [], isLoading } = trpc.campaigns.listar.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  // Group campaigns by persona based on campaign name
  const porPersona = PERSONAS.map(persona => {
    const campPersona = campanhas.filter(c =>
      c.nome?.toLowerCase().includes(persona.toLowerCase())
    );
    const totalConversoes = campPersona.reduce((s, c) => s + (Number(c.performance.conversoes) || 0), 0);
    const totalOrcamento = campPersona.reduce((s, c) => s + (Number(c.orcamento) || 0), 0);
    const avgCTR = campPersona.length > 0
      ? campPersona.reduce((s, c) => s + (c.performance.impressoes > 0 ? c.performance.cliques / c.performance.impressoes * 100 : 0), 0) / campPersona.length
      : 0;
    const avgROI = campPersona.length > 0
      ? campPersona.reduce((s, c) => s + (Number(c.performance.roi) || 0), 0) / campPersona.length
      : 0;
    const ativas = campPersona.filter(c => c.status === 'ativa').length;
    return { persona, campPersona, totalConversoes, totalOrcamento, avgCTR, avgROI, ativas };
  }).filter(p => p.campPersona.length > 0);

  const totalConversoes = campanhas.reduce((s, c) => s + (Number(c.performance.conversoes) || 0), 0);
  const totalOrcamento = campanhas.reduce((s, c) => s + (Number(c.orcamento) || 0), 0);
  const avgROI = campanhas.length > 0
    ? campanhas.reduce((s, c) => s + (Number(c.performance.roi) || 0), 0) / campanhas.length
    : 0;
  const avgCTR = campanhas.length > 0
    ? campanhas.reduce((s, c) => s + (c.performance.impressoes > 0 ? c.performance.cliques / c.performance.impressoes * 100 : 0), 0) / campanhas.length
    : 0;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Performance por Persona</h2>
        <p className="text-slate-600">Análise comparativa de conversão, CTR e ROI para cada persona — baseada em campanhas cadastradas</p>
      </div>

      {/* Aviso */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-sm text-slate-600">
              <strong className="text-slate-900">Métricas derivadas das campanhas cadastradas.</strong>{" "}
              Campanhas são agrupadas por persona com base no nome. Para métricas de alcance, seguidores e engajamento reais, integre a Instagram Graph API ou TikTok API.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Campanhas Ativas</p>
                <p className="text-2xl font-bold text-slate-900">{campanhas.filter(c => c.status === 'ativa').length}</p>
              </div>
              <Eye className="w-5 h-5 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">Conversões Totais</p>
                <p className="text-2xl font-bold text-slate-900">{totalConversoes}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">ROI Médio</p>
                <p className="text-2xl font-bold text-slate-900">{avgROI > 0 ? `${avgROI.toFixed(0)}%` : "—"}</p>
              </div>
              <TrendingUp className="w-5 h-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-600">CTR Médio</p>
                <p className="text-2xl font-bold text-slate-900">{avgCTR > 0 ? `${avgCTR.toFixed(2)}%` : "—"}</p>
              </div>
              <Heart className="w-5 h-5 text-pink-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Comparison Table */}
      {isLoading ? (
        <Card><CardContent className="py-8 text-center text-slate-500 text-sm">Carregando campanhas...</CardContent></Card>
      ) : porPersona.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center border border-dashed border-slate-300 rounded-lg">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-slate-500 text-sm">Nenhuma campanha associada a personas.</p>
            <p className="text-xs text-slate-400 mt-1">Crie campanhas com o nome da persona (Carol, Renata, Vanessa, Luiza) para ver métricas aqui.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Comparação de Métricas</CardTitle>
              <CardDescription>Dados das campanhas agrupadas por persona</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 font-semibold text-slate-900">Persona</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-900">Campanhas</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-900">CTR Médio</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-900">ROI Médio</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-900">Conversões</th>
                      <th className="text-center py-3 px-4 font-semibold text-slate-900">Orçamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {porPersona.map(p => (
                      <tr key={p.persona} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <PersonaAvatar name={p.persona} size="sm" />
                            <span className="font-medium text-slate-900">{p.persona}</span>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">{p.campPersona.length} ({p.ativas} ativas)</td>
                        <td className="text-center py-3 px-4 font-semibold text-slate-900">{p.avgCTR.toFixed(2)}%</td>
                        <td className="text-center py-3 px-4 font-semibold text-purple-600">{p.avgROI.toFixed(0)}%</td>
                        <td className="text-center py-3 px-4 font-semibold text-slate-900">{p.totalConversoes}</td>
                        <td className="text-center py-3 px-4 text-slate-600">R$ {p.totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Detailed Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {porPersona.map(p => (
              <Card key={p.persona} className="border-slate-200">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <PersonaAvatar name={p.persona} size="md" />
                    <div>
                      <CardTitle>{p.persona}</CardTitle>
                      <CardDescription>{p.campPersona.length} campanha(s) cadastrada(s)</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-blue-50 rounded p-3 text-center">
                      <p className="text-xs text-slate-600">CTR</p>
                      <p className="text-lg font-bold text-blue-600">{p.avgCTR.toFixed(2)}%</p>
                    </div>
                    <div className="bg-purple-50 rounded p-3 text-center">
                      <p className="text-xs text-slate-600">ROI</p>
                      <p className="text-lg font-bold text-purple-600">{p.avgROI.toFixed(0)}%</p>
                    </div>
                    <div className="bg-green-50 rounded p-3 text-center">
                      <p className="text-xs text-slate-600">Conversões</p>
                      <p className="text-lg font-bold text-green-600">{p.totalConversoes}</p>
                    </div>
                  </div>
                  <div className="space-y-2 border-t border-slate-100 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Orçamento Total</span>
                      <span className="font-semibold text-slate-900">R$ {p.totalOrcamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-600">Campanhas Ativas</span>
                      <span className="font-semibold text-slate-900">{p.ativas} de {p.campPersona.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Budget Allocation */}
          {porPersona.length > 1 && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-900">💰 Distribuição de Orçamento por Persona</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {porPersona.map(p => {
                  const pct = totalOrcamento > 0 ? (p.totalOrcamento / totalOrcamento * 100).toFixed(0) : "0";
                  return (
                    <div key={p.persona}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium text-slate-900">{p.persona}</span>
                        <span className="font-bold text-slate-900">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
                <p className="text-xs text-slate-600 pt-4 border-t border-slate-300">
                  Baseado no orçamento cadastrado por persona. Personas com melhor ROI devem receber mais budget para maximizar retorno.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
