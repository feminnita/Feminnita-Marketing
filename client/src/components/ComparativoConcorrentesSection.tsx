import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, AlertCircle, BarChart3, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface Concorrente {
  id: number;
  nome: string;
  instagram: string;
  seguidores: number;
  engajamento: number;
  postsPorSemana: number;
  precoMedio: number;
  estrategia: string;
  forca: string;
  fraqueza: string;
  isFeminnita?: boolean;
}

type MetricaKey = "engajamento" | "seguidores" | "posts" | "preco";

const METRICAS: Record<MetricaKey, { titulo: string; unidade: string; campo: keyof Concorrente }> = {
  engajamento: { titulo: "Taxa de Engajamento", unidade: "%", campo: "engajamento" },
  seguidores: { titulo: "Seguidores", unidade: "", campo: "seguidores" },
  posts: { titulo: "Posts por Semana", unidade: "", campo: "postsPorSemana" },
  preco: { titulo: "Preço Médio", unidade: "R$", campo: "precoMedio" },
};

export default function ComparativoConcorrentesSection() {
  const [concorrentes, setConcorrentes] = useState<Concorrente[]>([]);
  const [metricaSelecionada, setMetricaSelecionada] = useState<MetricaKey>("engajamento");
  const [novoConcorrente, setNovoConcorrente] = useState(false);
  const [form, setForm] = useState({
    nome: '', instagram: '', seguidores: '', engajamento: '', postsPorSemana: '',
    precoMedio: '', estrategia: '', forca: '', fraqueza: '', isFeminnita: false,
  });

  const adicionarConcorrente = () => {
    if (!form.nome.trim()) { toast.error('Informe o nome do concorrente.'); return; }
    const novo: Concorrente = {
      id: Date.now(),
      nome: form.nome,
      instagram: form.instagram,
      seguidores: Number(form.seguidores) || 0,
      engajamento: Number(form.engajamento) || 0,
      postsPorSemana: Number(form.postsPorSemana) || 0,
      precoMedio: Number(form.precoMedio) || 0,
      estrategia: form.estrategia,
      forca: form.forca,
      fraqueza: form.fraqueza,
      isFeminnita: form.isFeminnita,
    };
    setConcorrentes(prev => [...prev, novo]);
    setForm({ nome: '', instagram: '', seguidores: '', engajamento: '', postsPorSemana: '', precoMedio: '', estrategia: '', forca: '', fraqueza: '', isFeminnita: false });
    setNovoConcorrente(false);
    toast.success('Concorrente adicionado à análise.');
  };

  const remover = (id: number) => {
    setConcorrentes(prev => prev.filter(c => c.id !== id));
  };

  const ordenados = [...concorrentes].sort((a, b) => {
    const campo = METRICAS[metricaSelecionada].campo;
    return (b[campo] as number) - (a[campo] as number);
  });

  const feminnita = concorrentes.find(c => c.isFeminnita);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Análise Comparativa de Concorrentes</h2>
        <p className="text-slate-600">
          Analise preços, estratégias e performance dos concorrentes para benchmarking contínuo.
        </p>
      </div>

      {/* Aviso */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Dados de concorrentes são inseridos manualmente</p>
              <p className="text-sm text-slate-600 mt-1">
                Para comparação automática de métricas, conecte a API do Instagram (Integrações). Enquanto isso, insira os dados dos concorrentes coletados manualmente do Instagram Insights ou SimilarWeb.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Botão adicionar */}
      <Button onClick={() => setNovoConcorrente(!novoConcorrente)} className="w-full bg-purple-600 hover:bg-purple-700 gap-2" size="lg">
        <Plus className="w-5 h-5" />
        Adicionar Concorrente
      </Button>

      {/* Formulário */}
      {novoConcorrente && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-lg">Novo Concorrente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Nome</label>
                <input type="text" placeholder="Ex: Lua Chic Pijamas" className="w-full px-3 py-2 border border-slate-300 rounded" value={form.nome} onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Instagram</label>
                <input type="text" placeholder="@luachicpijamas" className="w-full px-3 py-2 border border-slate-300 rounded" value={form.instagram} onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Seguidores</label>
                <input type="number" min="0" placeholder="145000" className="w-full px-3 py-2 border border-slate-300 rounded" value={form.seguidores} onChange={e => setForm(f => ({ ...f, seguidores: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Engajamento (%)</label>
                <input type="number" min="0" step="0.1" placeholder="7.2" className="w-full px-3 py-2 border border-slate-300 rounded" value={form.engajamento} onChange={e => setForm(f => ({ ...f, engajamento: e.target.value }))} />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Posts por Semana</label>
                <input type="number" min="0" placeholder="5" className="w-full px-3 py-2 border border-slate-300 rounded" value={form.postsPorSemana} onChange={e => setForm(f => ({ ...f, postsPorSemana: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Preço Médio (R$)</label>
                <input type="number" min="0" step="0.01" placeholder="89.90" className="w-full px-3 py-2 border border-slate-300 rounded" value={form.precoMedio} onChange={e => setForm(f => ({ ...f, precoMedio: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1 block">Estratégia</label>
              <input type="text" placeholder="Ex: Lifestyle + Influenciadores" className="w-full px-3 py-2 border border-slate-300 rounded" value={form.estrategia} onChange={e => setForm(f => ({ ...f, estrategia: e.target.value }))} />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Força</label>
                <input type="text" placeholder="Comunidade forte, conteúdo de qualidade" className="w-full px-3 py-2 border border-slate-300 rounded" value={form.forca} onChange={e => setForm(f => ({ ...f, forca: e.target.value }))} />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-1 block">Fraqueza</label>
                <input type="text" placeholder="Preços altos, menos promoções" className="w-full px-3 py-2 border border-slate-300 rounded" value={form.fraqueza} onChange={e => setForm(f => ({ ...f, fraqueza: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isFeminnita" checked={form.isFeminnita} onChange={e => setForm(f => ({ ...f, isFeminnita: e.target.checked }))} className="w-4 h-4" />
              <label htmlFor="isFeminnita" className="text-sm text-slate-700">Este é você (Feminnita)</label>
            </div>
            <div className="flex gap-2">
              <Button onClick={adicionarConcorrente} className="flex-1 bg-green-600 hover:bg-green-700">Adicionar</Button>
              <Button variant="outline" className="flex-1" onClick={() => setNovoConcorrente(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {concorrentes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500 font-medium">Nenhum concorrente adicionado.</p>
            <p className="text-sm text-slate-400 mt-1">Adicione sua marca e os concorrentes para comparar métricas lado a lado.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Posição da Feminnita */}
          {feminnita && (
            <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  Sua Posição no Mercado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-3">
                  {[
                    { titulo: "Engajamento", valor: `${feminnita.engajamento}%`, cor: "text-green-600" },
                    { titulo: "Preço Médio", valor: `R$ ${feminnita.precoMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, cor: "text-blue-600" },
                    { titulo: "Posts/Semana", valor: String(feminnita.postsPorSemana), cor: "text-orange-600" },
                    { titulo: "Seguidores", valor: feminnita.seguidores >= 1000 ? `${(feminnita.seguidores / 1000).toFixed(0)}K` : String(feminnita.seguidores), cor: "text-purple-600" },
                  ].map((item, idx) => (
                    <div key={idx} className="text-center p-3 bg-white rounded-lg border border-purple-200">
                      <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{item.titulo}</p>
                      <p className={`text-lg font-bold ${item.cor}`}>{item.valor || '—'}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Comparação por métrica */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Comparação por Métrica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {(Object.entries(METRICAS) as [MetricaKey, typeof METRICAS[MetricaKey]][]).map(([key, metrica]) => (
                  <Button
                    key={key}
                    onClick={() => setMetricaSelecionada(key)}
                    variant={metricaSelecionada === key ? "default" : "outline"}
                    className={metricaSelecionada === key ? "bg-purple-600 hover:bg-purple-700" : ""}
                  >
                    {metrica.titulo}
                  </Button>
                ))}
              </div>

              <div className="space-y-2">
                {ordenados.map((conc, idx) => {
                  const campo = METRICAS[metricaSelecionada].campo;
                  const valor = conc[campo] as number;
                  const maxValor = Math.max(...ordenados.map(c => (c[campo] as number) || 0));
                  const percentual = maxValor > 0 ? (valor / maxValor) * 100 : 0;
                  return (
                    <div key={conc.id} className={`border-2 rounded-lg p-3 ${conc.isFeminnita ? "border-purple-300 bg-purple-50" : "border-slate-200 bg-white"}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-bold text-slate-900">{conc.nome}</h4>
                          {conc.instagram && <p className="text-xs text-slate-600">{conc.instagram}</p>}
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${conc.isFeminnita ? "text-purple-600" : "text-slate-900"}`}>
                            {METRICAS[metricaSelecionada].unidade === "R$" ? `R$ ${valor}` : `${valor}${METRICAS[metricaSelecionada].unidade}`}
                          </p>
                          <p className="text-xs text-slate-600">#{idx + 1}</p>
                        </div>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${conc.isFeminnita ? "bg-purple-600" : idx === 0 ? "bg-red-600" : "bg-blue-600"}`}
                          style={{ width: `${percentual}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Análise detalhada */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Análise Detalhada</CardTitle>
              <CardDescription>Estratégias, forças e fraquezas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {concorrentes.map((conc) => (
                <div key={conc.id} className={`border-2 rounded-lg p-4 ${conc.isFeminnita ? "border-purple-300 bg-purple-50" : "border-slate-200"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{conc.nome}</h4>
                      {conc.instagram && <p className="text-xs text-slate-600">{conc.instagram}</p>}
                    </div>
                    <div className="flex gap-2">
                      {conc.isFeminnita && <Badge className="bg-purple-600">Você</Badge>}
                      <Button size="sm" variant="outline" className="text-red-600 text-xs" onClick={() => remover(conc.id)}>Remover</Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-3 mb-3 text-xs">
                    <div><p className="text-slate-500">Seguidores</p><p className="font-bold">{conc.seguidores >= 1000 ? `${(conc.seguidores / 1000).toFixed(0)}K` : conc.seguidores || '—'}</p></div>
                    <div><p className="text-slate-500">Engajamento</p><p className="font-bold">{conc.engajamento ? `${conc.engajamento}%` : '—'}</p></div>
                    <div><p className="text-slate-500">Posts/Semana</p><p className="font-bold">{conc.postsPorSemana || '—'}</p></div>
                    <div><p className="text-slate-500">Preço Médio</p><p className="font-bold">{conc.precoMedio ? `R$ ${conc.precoMedio}` : '—'}</p></div>
                  </div>

                  {conc.estrategia && (
                    <div className="mb-3 p-3 bg-white rounded border border-slate-200">
                      <p className="text-xs font-semibold text-slate-700">Estratégia: {conc.estrategia}</p>
                    </div>
                  )}

                  {(conc.forca || conc.fraqueza) && (
                    <div className="grid md:grid-cols-2 gap-3 text-xs">
                      {conc.forca && <div><p className="font-semibold text-green-700 mb-1">✅ Forças:</p><p className="text-slate-600">{conc.forca}</p></div>}
                      {conc.fraqueza && <div><p className="font-semibold text-red-700 mb-1">⚠️ Fraquezas:</p><p className="text-slate-600">{conc.fraqueza}</p></div>}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </>
      )}

      {/* Recomendações estratégicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader><CardTitle className="text-lg">Recomendações Estratégicas</CardTitle></CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            "Monitore concorrentes mensalmente para identificar mudanças de estratégia",
            "Foque em métricas de engajamento — mais importantes que seguidores",
            "Identifique gaps de conteúdo que concorrentes não cobrem",
            "Teste estratégias dos concorrentes top em escala menor antes de adotar",
            "Mantenha seu diferencial de preço se for uma vantagem competitiva",
            "Use Instagram Insights e SimilarWeb para dados mais precisos",
          ].map((rec, idx) => (
            <p key={idx} className="text-slate-700">✅ {rec}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
