import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, AlertCircle, CheckCircle, BarChart3 } from "lucide-react";
import { useState } from "react";

export default function ComparativoConcorrentesSection() {
  const [concorrentes] = useState([
    {
      id: 1,
      nome: "Lua Chic Pijamas",
      instagram: "@luachicpijamas",
      seguidores: 145000,
      engajamento: 7.2,
      postsPorSemana: 5,
      precoMedio: 89.90,
      estrategia: "Lifestyle + Influenciadores",
      forca: "Comunidade forte, conteúdo de qualidade",
      fraqueza: "Preços altos, menos promoções"
    },
    {
      id: 2,
      nome: "Levezza Pijamas",
      instagram: "@levezza.pijamas",
      seguidores: 98000,
      engajamento: 8.5,
      postsPorSemana: 6,
      precoMedio: 79.90,
      estrategia: "Conforto + Qualidade",
      forca: "Engajamento alto, bom posicionamento",
      fraqueza: "Menos inovação, conteúdo repetitivo"
    },
    {
      id: 3,
      nome: "Mania Pijamas",
      instagram: "@maniapijamas",
      seguidores: 234000,
      engajamento: 5.8,
      postsPorSemana: 4,
      precoMedio: 74.90,
      estrategia: "Volume + Preço Baixo",
      forca: "Maior alcance, preços competitivos",
      fraqueza: "Engajamento baixo, conteúdo genérico"
    },
    {
      id: 4,
      nome: "Use Mi's Pijama",
      instagram: "@usemisspijama",
      seguidores: 67000,
      engajamento: 9.2,
      postsPorSemana: 7,
      precoMedio: 84.90,
      estrategia: "Comunidade + Engagement",
      forca: "Maior engajamento, comunidade leal",
      fraqueza: "Menor alcance, crescimento lento"
    },
    {
      id: 5,
      nome: "Pink Dream Pijamas",
      instagram: "@pinkdreampijamas",
      seguidores: 112000,
      engajamento: 6.9,
      postsPorSemana: 5,
      precoMedio: 94.90,
      estrategia: "Premium + Design",
      forca: "Designs exclusivos, posicionamento premium",
      fraqueza: "Público limitado, preços muito altos"
    },
    {
      id: 6,
      nome: "Tutti Ami Pijamas",
      instagram: "@tuttiamipijamas",
      seguidores: 156000,
      engajamento: 7.5,
      postsPorSemana: 5,
      precoMedio: 82.90,
      estrategia: "Familiar + Inclusão",
      forca: "Conteúdo familiar, bom engajamento",
      fraqueza: "Menos inovação, conteúdo previsível"
    },
    {
      id: 7,
      nome: "Feminnita (Você)",
      instagram: "@feminnita",
      seguidores: 45000,
      engajamento: 10.5,
      postsPorSemana: 6,
      precoMedio: 49.90,
      estrategia: "Renda Extra + Atacado",
      forca: "Melhor engajamento, melhor preço",
      fraqueza: "Menor alcance, marca em crescimento"
    }
  ]);

  const [metricaSelecionada, setMetricaSelecionada] = useState<"engajamento" | "seguidores" | "posts" | "preco">("engajamento");

  const metricas: Record<string, { titulo: string; unidade: string; campo: keyof typeof concorrentes[0] }> = {
    engajamento: { titulo: "Taxa de Engajamento", unidade: "%", campo: "engajamento" },
    seguidores: { titulo: "Seguidores", unidade: "", campo: "seguidores" },
    posts: { titulo: "Posts por Semana", unidade: "", campo: "postsPorSemana" },
    preco: { titulo: "Preço Médio", unidade: "R$", campo: "precoMedio" }
  };

  const ordenados = [...concorrentes].sort((a, b) => {
    const campo = metricas[metricaSelecionada].campo as keyof typeof concorrentes[0];
    const aVal = a[campo] as number;
    const bVal = b[campo] as number;
    return bVal - aVal;
  });

  const feminnita = concorrentes.find(c => c.nome === "Feminnita (Você)");
  const posicao = ordenados.findIndex(c => c.nome === "Feminnita (Você)") + 1;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Análise Comparativa de Concorrentes</h2>
        <p className="text-slate-600">
          Analise preços, estratégias e performance dos 7 concorrentes para benchmarking contínuo.
        </p>
      </div>

      {/* Resumo Executivo */}
      <Card className="border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50 to-pink-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Sua Posição no Mercado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-3">
            {[
              { titulo: "Posição", valor: `${posicao}º de 7`, icon: "🏆", cor: "text-purple-600" },
              { titulo: "Engajamento", valor: `${feminnita?.engajamento ?? 0}%`, icon: "📈", cor: "text-green-600", destaque: true },
              { titulo: "Preço", valor: `R$ ${feminnita?.precoMedio ?? 0}`, icon: "💰", cor: "text-blue-600", destaque: true },
              { titulo: "Posts/Semana", valor: feminnita?.postsPorSemana ?? 0, icon: "📱", cor: "text-orange-600" },
              { titulo: "Seguidores", valor: `${((feminnita?.seguidores ?? 0) / 1000).toFixed(0)}K`, icon: "👥", cor: "text-red-600" }
            ].map((item, idx) => (
              <div key={idx} className={`text-center p-3 rounded-lg ${item.destaque ? "bg-white border-2 border-purple-300" : "bg-white border border-slate-200"}`}>
                <p className="text-2xl mb-1">{item.icon}</p>
                <p className="text-xs font-semibold text-slate-600 uppercase mb-1">{item.titulo}</p>
                <p className={`text-lg font-bold ${item.cor}`}>{item.valor}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Seletor de Métrica */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparação por Métrica</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap">
            {Object.entries(metricas).map(([key, metrica]) => (
              <Button
                key={key}
                onClick={() => setMetricaSelecionada(key as "engajamento" | "seguidores" | "posts" | "preco")}
                variant={metricaSelecionada === key ? "default" : "outline"}
                className={metricaSelecionada === key ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                {metrica.titulo}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            {ordenados.map((conc, idx) => {
              const campo = metricas[metricaSelecionada]?.campo as keyof typeof conc;
              const valor = conc[campo] as number;
              const maxValor = Math.max(...ordenados.map(c => {
                const v = c[campo];
                return typeof v === 'number' ? v : 0;
              }));
              const percentual = maxValor > 0 ? (valor / maxValor) * 100 : 0;
              const isFeminnita = conc.nome === "Feminnita (Você)";

              return (
                <div key={conc.id} className={`border-2 rounded-lg p-3 ${isFeminnita ? "border-purple-300 bg-purple-50" : "border-slate-200 bg-white"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900">{conc.nome}</h4>
                      <p className="text-xs text-slate-600">{conc.instagram}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${isFeminnita ? "text-purple-600" : "text-slate-900"}`}>
                        {valor}{metricas[metricaSelecionada].unidade}
                      </p>
                      <p className="text-xs text-slate-600">#{idx + 1}</p>
                    </div>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${isFeminnita ? "bg-purple-600" : idx === 0 ? "bg-red-600" : "bg-blue-600"}`}
                      style={{ width: `${percentual}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Análise Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Análise Detalhada dos Concorrentes</CardTitle>
          <CardDescription>Estratégias, forças e fraquezas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {concorrentes.map((conc) => {
            const isFeminnita = conc.nome === "Feminnita (Você)";
            return (
              <div key={conc.id} className={`border-2 rounded-lg p-4 ${isFeminnita ? "border-purple-300 bg-purple-50" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition"}`}>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-bold text-slate-900">{conc.nome}</h4>
                    <p className="text-xs text-slate-600">{conc.instagram}</p>
                  </div>
                  {isFeminnita && <Badge className="bg-purple-600">Você</Badge>}
                </div>

                <div className="grid md:grid-cols-4 gap-3 mb-3 text-xs">
                  <div>
                    <p className="text-slate-600">Seguidores</p>
                    <p className="font-bold text-slate-900">{(conc.seguidores / 1000).toFixed(0)}K</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Engajamento</p>
                    <p className="font-bold text-slate-900">{conc.engajamento}%</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Posts/Semana</p>
                    <p className="font-bold text-slate-900">{conc.postsPorSemana}</p>
                  </div>
                  <div>
                    <p className="text-slate-600">Preço Médio</p>
                    <p className="font-bold text-slate-900">R$ {conc.precoMedio}</p>
                  </div>
                </div>

                <div className="mb-3 p-3 bg-white rounded border border-slate-200">
                  <p className="text-xs font-semibold text-slate-700 mb-1">Estratégia: {conc.estrategia}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-3 mb-3 text-xs">
                  <div>
                    <p className="font-semibold text-green-700 mb-1">✅ Forças:</p>
                    <p className="text-slate-600">{conc.forca}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-red-700 mb-1">⚠️ Fraquezas:</p>
                    <p className="text-slate-600">{conc.fraqueza}</p>
                  </div>
                </div>

                {isFeminnita && (
                  <div className="p-3 bg-white border border-purple-300 rounded">
                    <p className="text-xs font-semibold text-purple-900 mb-2">🎯 Oportunidades:</p>
                    <ul className="text-xs text-purple-700 space-y-1 list-disc list-inside">
                      <li>Aumentar seguidores com campanhas virais</li>
                      <li>Manter engajamento alto (já é o melhor)</li>
                      <li>Oferecer melhor preço (vantagem competitiva)</li>
                      <li>Aumentar frequência de posts para 7x/semana</li>
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Matriz de Posicionamento */}
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="text-lg">Matriz de Posicionamento</CardTitle>
          <CardDescription>Preço vs Engajamento</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="border-2 border-green-300 rounded-lg p-4 text-center bg-white">
                <p className="font-bold text-slate-900 mb-2">Premium + Alto Engajamento</p>
                <p className="text-xs text-slate-600">Pink Dream, Lua Chic</p>
              </div>
              <div className="border-2 border-purple-300 rounded-lg p-4 text-center bg-purple-50">
                <p className="font-bold text-purple-900 mb-2">Econômico + Alto Engajamento</p>
                <p className="text-xs text-purple-700">✅ Feminnita, Use Mi's</p>
              </div>
              <div className="border-2 border-slate-300 rounded-lg p-4 text-center bg-white">
                <p className="font-bold text-slate-900 mb-2">Premium + Baixo Engajamento</p>
                <p className="text-xs text-slate-600">Levezza</p>
              </div>
              <div className="border-2 border-slate-300 rounded-lg p-4 text-center bg-white">
                <p className="font-bold text-slate-900 mb-2">Econômico + Baixo Engajamento</p>
                <p className="text-xs text-slate-600">Mania, Tutti Ami</p>
              </div>
            </div>

            <div className="p-4 bg-white border border-green-300 rounded">
              <p className="font-semibold text-green-900 mb-2">🎯 Sua Vantagem:</p>
              <p className="text-sm text-green-700">Você está na posição ideal: preço mais baixo + maior engajamento. Isso é raro e muito valioso!</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recomendações Estratégicas */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg">Recomendações Estratégicas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {[
            "✅ Mantenha engajamento alto (sua maior vantagem)",
            "✅ Aumente seguidores com campanhas virais (crescer 2-3x)",
            "✅ Mantenha preço baixo (diferencial competitivo)",
            "✅ Aumente frequência de posts para 7x/semana",
            "✅ Crie conteúdo exclusivo que concorrentes não têm",
            "✅ Monitore concorrentes mensalmente",
            "✅ Teste estratégias dos concorrentes top",
            "✅ Foque em renda extra (nicho único)"
          ].map((rec, idx) => (
            <p key={idx} className="text-slate-700">{rec}</p>
          ))}
        </CardContent>
      </Card>

      {/* Próxima Atualização */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-lg">Próxima Análise</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-amber-700 mb-3">
            Próxima atualização automática: <strong>7 de fevereiro de 2026</strong>
          </p>
          <Button className="w-full bg-amber-600 hover:bg-amber-700">
            Atualizar Agora
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
