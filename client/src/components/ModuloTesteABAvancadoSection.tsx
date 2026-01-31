import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, BarChart3, CheckCircle, AlertCircle, Target } from "lucide-react";
import { useState } from "react";

export default function ModuloTesteABAvancadoSection() {
  const [selectedTest, setSelectedTest] = useState(0);

  const testes = [
    {
      id: 1,
      nome: "Teste de Hook - Carol",
      persona: "Carol",
      tipo: "Hook de Vídeo",
      status: "Ativo",
      dataInicio: "01 Feb",
      duracao: "14 dias",
      variacoes: 3,
      visualizacoes: 125000,
      conversoes: 1250,
      taxaConversao: 10.0,
      vencedor: "Hook 2",
      confianca: 94,
    },
    {
      id: 2,
      nome: "Teste de Horário - Luiza",
      persona: "Luiza",
      tipo: "Horário de Posting",
      status: "Ativo",
      dataInicio: "05 Feb",
      duracao: "7 dias",
      variacoes: 4,
      visualizacoes: 185000,
      conversoes: 1850,
      taxaConversao: 10.0,
      vencedor: "20:00",
      confianca: 87,
    },
    {
      id: 3,
      nome: "Teste de Descrição - Renata",
      persona: "Renata",
      tipo: "Descrição de Produto",
      status: "Finalizado",
      dataInicio: "15 Jan",
      duracao: "14 dias",
      variacoes: 2,
      visualizacoes: 95000,
      conversoes: 855,
      taxaConversao: 9.0,
      vencedor: "Descrição B",
      confianca: 92,
    },
  ];

  const currentTest = testes[selectedTest];

  const variacoes = [
    {
      id: "A",
      nome: "Variação A (Original)",
      descricao: "Quanto ganhei vendendo pijamas",
      views: 62500,
      conversoes: 625,
      taxa: 10.0,
      ctr: 6.2,
      engajamento: 12.5,
      status: "Controle",
    },
    {
      id: "B",
      nome: "Variação B (Teste)",
      descricao: "Como ganhei R$ 5K em 30 dias",
      views: 62500,
      conversoes: 625,
      taxa: 10.0,
      ctr: 6.8,
      engajamento: 14.2,
      status: "Vencedor",
    },
    {
      id: "C",
      nome: "Variação C (Teste)",
      descricao: "Renda extra com pijamas femininos",
      views: 0,
      conversoes: 0,
      taxa: 0,
      ctr: 0,
      engajamento: 0,
      status: "Pausado",
    },
  ];

  const metricas = [
    {
      titulo: "Visualizações",
      valor: (currentTest.visualizacoes / 1000).toFixed(0) + "K",
      mudanca: "+18%",
      cor: "blue",
    },
    {
      titulo: "Conversões",
      valor: currentTest.conversoes,
      mudanca: "+22%",
      cor: "green",
    },
    {
      titulo: "Taxa de Conversão",
      valor: currentTest.taxaConversao + "%",
      mudanca: "+5%",
      cor: "purple",
    },
    {
      titulo: "Confiança Estatística",
      valor: currentTest.confianca + "%",
      mudanca: "Alta",
      cor: "pink",
    },
  ];

  const historico = [
    { data: "01 Feb", variacaoA: 4500, variacaoB: 5200, variacaoC: 3800 },
    { data: "02 Feb", variacaoA: 4800, variacaoB: 5800, variacaoC: 4200 },
    { data: "03 Feb", variacaoA: 5100, variacaoB: 6200, variacaoC: 4500 },
    { data: "04 Feb", variacaoA: 4900, variacaoB: 6000, variacaoC: 4100 },
    { data: "05 Feb", variacaoA: 5200, variacaoB: 6500, variacaoC: 4300 },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Módulo de Testes A/B Avançado</h2>
        <p className="text-slate-600">Compare diferentes estratégias com significância estatística</p>
      </div>

      {/* Testes Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Testes em Andamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {testes.map((teste, idx) => (
              <button
                key={teste.id}
                onClick={() => setSelectedTest(idx)}
                className={`w-full p-4 rounded-lg border-2 transition text-left ${
                  selectedTest === idx
                    ? "border-pink-500 bg-pink-50"
                    : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{teste.nome}</p>
                    <p className="text-sm text-slate-600">{teste.tipo} • {teste.persona}</p>
                  </div>
                  <Badge className={teste.status === "Ativo" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}>
                    {teste.status}
                  </Badge>
                </div>

                <div className="grid grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-sm">
                  <div>
                    <p className="text-xs text-slate-600">Variações</p>
                    <p className="font-bold text-slate-900">{teste.variacoes}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Views</p>
                    <p className="font-bold text-slate-900">{(teste.visualizacoes / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Taxa</p>
                    <p className="font-bold text-green-600">{teste.taxaConversao}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600">Confiança</p>
                    <p className="font-bold text-slate-900">{teste.confianca}%</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalhes do Teste */}
      <Card>
        <CardHeader>
          <CardTitle>{currentTest.nome}</CardTitle>
          <CardDescription>{currentTest.tipo} • Iniciado em {currentTest.dataInicio}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Métricas Principais */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {metricas.map((metrica, idx) => (
              <div key={idx} className={`bg-${metrica.cor}-50 rounded-lg p-4`}>
                <p className="text-sm text-slate-600">{metrica.titulo}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{metrica.valor}</p>
                <p className={`text-sm font-semibold text-${metrica.cor}-600 mt-1`}>{metrica.mudanca}</p>
              </div>
            ))}
          </div>

          {/* Variações */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3">Variações em Teste</h3>
            <div className="space-y-3">
              {variacoes.map((variacao) => (
                <div key={variacao.id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-slate-900">{variacao.nome}</p>
                      <p className="text-sm text-slate-600 mt-1">"{variacao.descricao}"</p>
                    </div>
                    <Badge className={
                      variacao.status === "Vencedor" ? "bg-green-100 text-green-800" :
                      variacao.status === "Controle" ? "bg-blue-100 text-blue-800" :
                      "bg-slate-100 text-slate-800"
                    }>
                      {variacao.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 md:grid-cols-5 gap-3 pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-600">Views</p>
                      <p className="font-bold text-slate-900">{(variacao.views / 1000).toFixed(0)}K</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Conversões</p>
                      <p className="font-bold text-slate-900">{variacao.conversoes}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Taxa</p>
                      <p className="font-bold text-green-600">{variacao.taxa}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">CTR</p>
                      <p className="font-bold text-slate-900">{variacao.ctr}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-600">Engajamento</p>
                      <p className="font-bold text-slate-900">{variacao.engajamento}%</p>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition"
                        style={{ width: `${(variacao.views / currentTest.visualizacoes) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {((variacao.views / currentTest.visualizacoes) * 100).toFixed(0)}% do tráfego
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Análise Estatística */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-semibold text-blue-900 mb-2">📊 Análise Estatística</p>
            <div className="space-y-2 text-sm text-blue-900">
              <p>✓ Tamanho da amostra: {currentTest.visualizacoes.toLocaleString()} impressões</p>
              <p>✓ Confiança: {currentTest.confianca}% (Altamente significativo)</p>
              <p>✓ Vencedor: {currentTest.vencedor} com +{((variacoes[1].taxa - variacoes[0].taxa) * 100).toFixed(1)}% de melhoria</p>
              <p>✓ Duração: {currentTest.duracao}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Histórico de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Performance</CardTitle>
          <CardDescription>Conversões por dia para cada variação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {historico.map((dia, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-slate-900">{dia.data}</p>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">A: {dia.variacaoA}</Badge>
                    <Badge variant="outline" className="text-xs">B: {dia.variacaoB}</Badge>
                    <Badge variant="outline" className="text-xs">C: {dia.variacaoC}</Badge>
                  </div>
                </div>

                <div className="flex gap-2 h-8">
                  <div
                    className="bg-blue-500 rounded"
                    style={{ width: `${(dia.variacaoA / 6500) * 100}%` }}
                    title={`Variação A: ${dia.variacaoA}`}
                  ></div>
                  <div
                    className="bg-green-500 rounded"
                    style={{ width: `${(dia.variacaoB / 6500) * 100}%` }}
                    title={`Variação B: ${dia.variacaoB}`}
                  ></div>
                  <div
                    className="bg-slate-400 rounded"
                    style={{ width: `${(dia.variacaoC / 6500) * 100}%` }}
                    title={`Variação C: ${dia.variacaoC}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Criar Novo Teste */}
      <Card>
        <CardHeader>
          <CardTitle>Criar Novo Teste A/B</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">Nome do Teste</label>
            <input
              type="text"
              placeholder="Ex: Teste de Hook - Vanessa"
              className="w-full border border-slate-300 rounded-lg px-3 py-2"
            />
          </div>

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
              <label className="block text-sm font-medium text-slate-900 mb-2">Tipo de Teste</label>
              <select className="w-full border border-slate-300 rounded-lg px-3 py-2">
                <option>Hook de Vídeo</option>
                <option>Horário de Posting</option>
                <option>Descrição</option>
                <option>Imagem/Thumbnail</option>
                <option>CTA</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Duração (dias)</label>
              <input type="number" placeholder="14" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Número de Variações</label>
              <input type="number" placeholder="3" className="w-full border border-slate-300 rounded-lg px-3 py-2" />
            </div>
          </div>

          <button className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition font-semibold flex items-center justify-center gap-2">
            <Zap className="w-5 h-5" />
            Criar Teste A/B
          </button>
        </CardContent>
      </Card>

      {/* Performance Summary */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-900">📊 Performance de Testes</CardTitle>
        </CardHeader>
        <CardContent className="text-green-900 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold">Testes Completados</p>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs mt-1">com vencedores</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Melhoria Média</p>
              <p className="text-2xl font-bold">+18%</p>
              <p className="text-xs mt-1">em conversão</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Testes Ativos</p>
              <p className="text-2xl font-bold">3</p>
              <p className="text-xs mt-1">em andamento</p>
            </div>
            <div>
              <p className="text-sm font-semibold">ROI de Testes</p>
              <p className="text-2xl font-bold">+42%</p>
              <p className="text-xs mt-1">acumulado</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
