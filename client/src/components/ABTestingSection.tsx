import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Zap, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TesteAB {
  id: number;
  nome: string;
  tipo: string;
  dataInicio: string;
  dataFim: string;
  status: "em andamento" | "concluído";
  variacaoA: { nome: string; descricao: string; conversoes: number; taxaConversao: number };
  variacaoB: { nome: string; descricao: string; conversoes: number; taxaConversao: number };
  vencedor: "A" | "B" | null;
}

export default function ABTestingSection() {
  const [testes, setTestes] = useState<TesteAB[]>([]);
  const [novoTeste, setNovoTeste] = useState(false);
  const [form, setForm] = useState({
    nome: "", tipo: "story",
    varA: "", varB: "",
    dataInicio: "", dataFim: "",
  });

  const criarTeste = () => {
    if (!form.nome.trim() || !form.varA.trim() || !form.varB.trim()) {
      toast.error("Preencha nome, Variação A e Variação B.");
      return;
    }
    const novo: TesteAB = {
      id: Date.now(),
      nome: form.nome,
      tipo: form.tipo,
      dataInicio: form.dataInicio || new Date().toISOString().split("T")[0],
      dataFim: form.dataFim,
      status: "em andamento",
      variacaoA: { nome: `Versão A: ${form.varA}`, descricao: form.varA, conversoes: 0, taxaConversao: 0 },
      variacaoB: { nome: `Versão B: ${form.varB}`, descricao: form.varB, conversoes: 0, taxaConversao: 0 },
      vencedor: null,
    };
    setTestes([...testes, novo]);
    setForm({ nome: "", tipo: "story", varA: "", varB: "", dataInicio: "", dataFim: "" });
    setNovoTeste(false);
    toast.success("Teste A/B criado! Atualize as métricas manualmente conforme coleta dados.");
  };

  const concluirTeste = (id: number) => {
    setTestes(testes.map(t => {
      if (t.id !== id) return t;
      const vencedor = t.variacaoA.taxaConversao >= t.variacaoB.taxaConversao ? "A" : "B";
      return { ...t, status: "concluído" as const, vencedor };
    }));
  };

  const atualizarMetrica = (id: number, variacao: "A" | "B", campo: "conversoes" | "taxaConversao", valor: number) => {
    setTestes(testes.map(t => {
      if (t.id !== id) return t;
      const key = variacao === "A" ? "variacaoA" : "variacaoB";
      return { ...t, [key]: { ...t[key], [campo]: valor } };
    }));
  };

  const emAndamento = testes.filter(t => t.status === "em andamento").length;
  const concluidos = testes.filter(t => t.status === "concluído").length;
  const melhoria = (() => {
    const concl = testes.filter(t => t.status === "concluído" && t.vencedor);
    if (concl.length === 0) return null;
    const diffs = concl.map(t => {
      const melhor = t.vencedor === "A" ? t.variacaoA.taxaConversao : t.variacaoB.taxaConversao;
      const pior = t.vencedor === "A" ? t.variacaoB.taxaConversao : t.variacaoA.taxaConversao;
      return pior > 0 ? ((melhor - pior) / pior) * 100 : 0;
    });
    return (diffs.reduce((a, b) => a + b, 0) / diffs.length).toFixed(1);
  })();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sistema de A/B Testing</h2>
        <p className="text-slate-600">
          Compare performance de diferentes versões de roteiros. Crie um teste, publique as variações e insira os resultados para identificar o vencedor.
        </p>
      </div>

      <Button
        onClick={() => setNovoTeste(!novoTeste)}
        className="w-full bg-blue-600 hover:bg-blue-700 gap-2"
        size="lg"
      >
        <Zap className="w-5 h-5" />
        Criar Novo Teste A/B
      </Button>

      {novoTeste && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-lg">Criar Novo Teste A/B</CardTitle>
            <CardDescription>Configure um novo teste para comparar variações</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Nome do Teste</label>
                <input
                  type="text"
                  placeholder="Ex: Story - Renda Extra (Gancho A vs B)"
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Tipo</label>
                <select
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.tipo}
                  onChange={e => setForm({ ...form, tipo: e.target.value })}
                >
                  <option value="story">Story</option>
                  <option value="reels">Reels</option>
                  <option value="tiktok">TikTok</option>
                  <option value="ads">Ads</option>
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Variação A (descreva o gancho/abordagem)</label>
                <input
                  type="text"
                  placeholder="Ex: Gancho Urgência — 'Ganhei R$ 500 em 1 semana'"
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.varA}
                  onChange={e => setForm({ ...form, varA: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Variação B (descreva o gancho/abordagem)</label>
                <input
                  type="text"
                  placeholder="Ex: Gancho Emocional — 'Mudei minha vida financeira'"
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.varB}
                  onChange={e => setForm({ ...form, varB: e.target.value })}
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Data de Início</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.dataInicio}
                  onChange={e => setForm({ ...form, dataInicio: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Data de Fim</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-slate-300 rounded"
                  value={form.dataFim}
                  onChange={e => setForm({ ...form, dataFim: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={criarTeste} className="flex-1 bg-green-600 hover:bg-green-700">Criar Teste</Button>
              <Button variant="outline" className="flex-1" onClick={() => setNovoTeste(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {testes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-10 text-center">
            <BarChart3 className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-500">Nenhum teste A/B criado ainda.</p>
            <p className="text-sm text-slate-400 mt-1">Crie um teste acima para comparar variações de gancho, horário, formato ou copy.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {testes.map((teste) => (
            <Card key={teste.id} className="border-2">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <CardTitle className="text-lg">{teste.nome}</CardTitle>
                    <CardDescription>{teste.dataInicio}{teste.dataFim ? ` a ${teste.dataFim}` : ""} · {teste.tipo}</CardDescription>
                  </div>
                  <Badge variant={teste.status === "em andamento" ? "default" : "secondary"}>
                    {teste.status === "em andamento" ? "🔄 Em Andamento" : "✅ Concluído"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {(["A", "B"] as const).map(v => {
                    const variacao = v === "A" ? teste.variacaoA : teste.variacaoB;
                    const isWinner = teste.vencedor === v;
                    return (
                      <div key={v} className={`border-2 rounded-lg p-4 ${isWinner ? (v === "A" ? "bg-blue-50 border-blue-300" : "bg-green-50 border-green-300") : "bg-slate-50 border-slate-200"}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-bold text-slate-900">{variacao.nome}</h4>
                            <p className="text-xs text-slate-600">{variacao.descricao}</p>
                          </div>
                          {isWinner && <Badge className={v === "A" ? "bg-blue-600" : "bg-green-600"}>🏆 Vencedor</Badge>}
                        </div>
                        {teste.status === "em andamento" ? (
                          <div className="space-y-2">
                            <div>
                              <label className="text-xs text-slate-500">Conversões reais</label>
                              <input
                                type="number"
                                min="0"
                                className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-sm"
                                value={variacao.conversoes}
                                onChange={e => atualizarMetrica(teste.id, v, "conversoes", Number(e.target.value))}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-slate-500">Taxa de conversão (%)</label>
                              <input
                                type="number"
                                min="0"
                                step="0.1"
                                className="w-full mt-1 px-2 py-1 border border-slate-300 rounded text-sm"
                                value={variacao.taxaConversao}
                                onChange={e => atualizarMetrica(teste.id, v, "taxaConversao", Number(e.target.value))}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span className="text-slate-600">Conversões</span>
                              <span className="font-bold">{variacao.conversoes}</span>
                            </div>
                            <div className="flex justify-between border-t pt-1">
                              <span className="font-semibold text-slate-900">Taxa de Conversão</span>
                              <span className={`font-bold ${v === "A" ? "text-blue-600" : "text-green-600"}`}>{variacao.taxaConversao}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {teste.status === "em andamento" && (
                  <Button onClick={() => concluirTeste(teste.id)} className="w-full bg-green-600 hover:bg-green-700 gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Concluir Teste e Declarar Vencedor
                  </Button>
                )}

                {teste.status === "concluído" && teste.vencedor && (
                  <div className="text-sm p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800 font-medium">
                      ✅ Versão {teste.vencedor} venceu com {(teste.vencedor === "A" ? teste.variacaoA : teste.variacaoB).taxaConversao}% de conversão.
                    </p>
                    <p className="text-slate-600 mt-1">Recomendação: Use a Versão {teste.vencedor} em futuras campanhas.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Estatísticas */}
      <Card className="border-l-4 border-l-purple-400 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Estatísticas de Testes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { titulo: "Testes Totais", valor: testes.length, icon: "📊" },
              { titulo: "Em Andamento", valor: emAndamento, icon: "🔄" },
              { titulo: "Concluídos", valor: concluidos, icon: "✅" },
              { titulo: "Melhoria Média", valor: melhoria !== null ? `${melhoria}%` : "—", icon: "📈" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <p className="text-2xl mb-2">{stat.icon}</p>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{stat.titulo}</p>
                <p className="text-2xl font-bold text-slate-900">{stat.valor}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Dicas para A/B Testing Eficaz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "Teste uma variável por vez (gancho, horário, som, etc)",
            "Deixe o teste rodar pelo menos 7 dias para dados significativos",
            "Garanta tamanho de amostra similar para ambas as versões",
            "Foque em taxa de conversão, não apenas visualizações",
            "Documente todos os testes e resultados",
            "Use vencedores como base para próximos testes",
            "Teste continuamente para otimização permanente",
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">✅ {dica}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
