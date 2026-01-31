import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Zap, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function ABTestingSection() {
  const [testes, setTestes] = useState([
    {
      id: 1,
      nome: "Story - Renda Extra (Versão A vs B)",
      tipo: "story",
      dataInicio: "2026-01-28",
      dataFim: "2026-02-04",
      status: "em andamento",
      variacaoA: {
        nome: "Versão A: Gancho Urgência",
        descricao: "Foco em 'Ganhei R$ 500 em 1 semana'",
        visualizacoes: 5230,
        engajamento: 456,
        cliques: 123,
        conversoes: 34,
        taxaConversao: 6.5
      },
      variacaoB: {
        nome: "Versão B: Gancho Emocional",
        descricao: "Foco em 'Mudei minha vida financeira'",
        visualizacoes: 4890,
        engajamento: 612,
        cliques: 156,
        conversoes: 42,
        taxaConversao: 8.6
      },
      vencedor: "B"
    },
    {
      id: 2,
      nome: "Reels - Bastidores (Horário A vs B)",
      tipo: "reels",
      dataInicio: "2026-01-25",
      dataFim: "2026-02-01",
      status: "concluído",
      variacaoA: {
        nome: "Versão A: 19h (Quinta)",
        descricao: "Publicado quinta-feira às 19h",
        visualizacoes: 12450,
        engajamento: 1234,
        cliques: 345,
        conversoes: 67,
        taxaConversao: 5.4
      },
      variacaoB: {
        nome: "Versão B: 20h (Sexta)",
        descricao: "Publicado sexta-feira às 20h",
        visualizacoes: 18950,
        engajamento: 2156,
        cliques: 567,
        conversoes: 134,
        taxaConversao: 7.1
      },
      vencedor: "B"
    },
    {
      id: 3,
      nome: "TikTok - ASMR (Som A vs B)",
      tipo: "tiktok",
      dataInicio: "2026-01-30",
      dataFim: "2026-02-06",
      status: "em andamento",
      variacaoA: {
        nome: "Versão A: Som Viral Trending",
        descricao: "Usa som mais popular do momento",
        visualizacoes: 45230,
        engajamento: 5234,
        cliques: 876,
        conversoes: 156,
        taxaConversao: 3.4
      },
      variacaoB: {
        nome: "Versão B: Som Original",
        descricao: "Som menos popular mas único",
        visualizacoes: 32150,
        engajamento: 4567,
        cliques: 789,
        conversoes: 178,
        taxaConversao: 5.5
      },
      vencedor: null
    }
  ]);

  const [novoTeste, setNovoTeste] = useState(false);

  const calcularMelhor = (testeId: number) => {
    const teste = testes.find(t => t.id === testeId);
    if (!teste) return null;
    
    const scoreA = teste.variacaoA.taxaConversao;
    const scoreB = teste.variacaoB.taxaConversao;
    
    if (scoreA > scoreB) return "A";
    if (scoreB > scoreA) return "B";
    return "empate";
  };

  const getVencedorColor = (vencedor: string | null) => {
    if (vencedor === "A") return "bg-blue-50 border-blue-200";
    if (vencedor === "B") return "bg-green-50 border-green-200";
    return "bg-slate-50 border-slate-200";
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Sistema de A/B Testing</h2>
        <p className="text-slate-600">
          Compare performance de diferentes versões de roteiros e identifique automaticamente qual funciona melhor.
        </p>
      </div>

      {/* Botão Criar Novo Teste */}
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
                <input type="text" placeholder="Ex: Story - Renda Extra (Versão A vs B)" className="w-full px-3 py-2 border border-slate-300 rounded" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Tipo</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded">
                  <option>Story</option>
                  <option>Reels</option>
                  <option>TikTok</option>
                  <option>Ads</option>
                </select>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Variável A Testar</label>
                <input type="text" placeholder="Ex: Gancho Urgência" className="w-full px-3 py-2 border border-slate-300 rounded" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Variável B Testar</label>
                <input type="text" placeholder="Ex: Gancho Emocional" className="w-full px-3 py-2 border border-slate-300 rounded" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Data de Início</label>
                <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded" />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 mb-2 block">Data de Fim</label>
                <input type="date" className="w-full px-3 py-2 border border-slate-300 rounded" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 bg-green-600 hover:bg-green-700">Criar Teste</Button>
              <Button variant="outline" className="flex-1" onClick={() => setNovoTeste(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Testes Ativos */}
      <div className="space-y-6">
        {testes.map((teste) => (
          <Card key={teste.id} className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <CardTitle className="text-lg">{teste.nome}</CardTitle>
                  <CardDescription>{teste.dataInicio} a {teste.dataFim}</CardDescription>
                </div>
                <Badge variant={teste.status === "em andamento" ? "default" : "secondary"}>
                  {teste.status === "em andamento" ? "🔄 Em Andamento" : "✅ Concluído"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Comparação Visual */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Variação A */}
                <div className={`border-2 rounded-lg p-4 ${teste.vencedor === "A" ? "bg-blue-50 border-blue-300" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{teste.variacaoA.nome}</h4>
                      <p className="text-xs text-slate-600">{teste.variacaoA.descricao}</p>
                    </div>
                    {teste.vencedor === "A" && <Badge className="bg-blue-600">🏆 Vencedor</Badge>}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Visualizações</span>
                      <span className="font-bold text-slate-900">{teste.variacaoA.visualizacoes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Engajamentos</span>
                      <span className="font-bold text-slate-900">{teste.variacaoA.engajamento.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cliques</span>
                      <span className="font-bold text-slate-900">{teste.variacaoA.cliques.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Conversões</span>
                      <span className="font-bold text-slate-900">{teste.variacaoA.conversoes}</span>
                    </div>
                    <div className="border-t border-slate-300 pt-2 flex justify-between">
                      <span className="font-semibold text-slate-900">Taxa de Conversão</span>
                      <span className="font-bold text-blue-600">{teste.variacaoA.taxaConversao}%</span>
                    </div>
                  </div>
                </div>

                {/* Variação B */}
                <div className={`border-2 rounded-lg p-4 ${teste.vencedor === "B" ? "bg-green-50 border-green-300" : "bg-slate-50 border-slate-200"}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-slate-900">{teste.variacaoB.nome}</h4>
                      <p className="text-xs text-slate-600">{teste.variacaoB.descricao}</p>
                    </div>
                    {teste.vencedor === "B" && <Badge className="bg-green-600">🏆 Vencedor</Badge>}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Visualizações</span>
                      <span className="font-bold text-slate-900">{teste.variacaoB.visualizacoes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Engajamentos</span>
                      <span className="font-bold text-slate-900">{teste.variacaoB.engajamento.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Cliques</span>
                      <span className="font-bold text-slate-900">{teste.variacaoB.cliques.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Conversões</span>
                      <span className="font-bold text-slate-900">{teste.variacaoB.conversoes}</span>
                    </div>
                    <div className="border-t border-slate-300 pt-2 flex justify-between">
                      <span className="font-semibold text-slate-900">Taxa de Conversão</span>
                      <span className="font-bold text-green-600">{teste.variacaoB.taxaConversao}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights */}
              <div className="border-t border-slate-200 pt-4">
                <h5 className="font-bold text-slate-900 mb-3">📊 Insights do Teste</h5>
                <div className="space-y-2 text-sm">
                  {teste.vencedor === "B" && (
                    <>
                      <p className="text-green-700">✅ <strong>Versão B é melhor!</strong> Taxa de conversão {((teste.variacaoB.taxaConversao - teste.variacaoA.taxaConversao) / teste.variacaoA.taxaConversao * 100).toFixed(1)}% superior</p>
                      <p className="text-slate-600">Recomendação: Use a Versão B em futuras campanhas</p>
                    </>
                  )}
                  {teste.vencedor === "A" && (
                    <>
                      <p className="text-blue-700">✅ <strong>Versão A é melhor!</strong> Taxa de conversão {((teste.variacaoA.taxaConversao - teste.variacaoB.taxaConversao) / teste.variacaoB.taxaConversao * 100).toFixed(1)}% superior</p>
                      <p className="text-slate-600">Recomendação: Use a Versão A em futuras campanhas</p>
                    </>
                  )}
                  {teste.vencedor === null && (
                    <p className="text-amber-700">⏳ Teste ainda em andamento. Dados serão analisados ao final.</p>
                  )}
                </div>
              </div>

              {teste.status === "concluído" && (
                <Button className="w-full bg-green-600 hover:bg-green-700 gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Usar Versão Vencedora
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Estatísticas Gerais */}
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
              { titulo: "Em Andamento", valor: testes.filter(t => t.status === "em andamento").length, icon: "🔄" },
              { titulo: "Concluídos", valor: testes.filter(t => t.status === "concluído").length, icon: "✅" },
              { titulo: "Melhoria Média", valor: "6.2%", icon: "📈" }
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
            "✅ Teste uma variável por vez (gancho, horário, som, etc)",
            "✅ Deixe o teste rodar pelo menos 7 dias para dados significativos",
            "✅ Garanta tamanho de amostra similar para ambas as versões",
            "✅ Foque em taxa de conversão, não apenas visualizações",
            "✅ Documente todos os testes e resultados",
            "✅ Use vencedores como base para próximos testes",
            "✅ Teste continuamente para otimização permanente"
          ].map((dica, idx) => (
            <p key={idx} className="text-slate-700">{dica}</p>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
