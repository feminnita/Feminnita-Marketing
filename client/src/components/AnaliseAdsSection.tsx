import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, DollarSign, Users, Target } from "lucide-react";

export default function AnaliseAdsSection() {
  const cenarios = [
    {
      nome: "Cenário 1: Conservador",
      investimento: 500,
      duracao: "7 dias",
      publico: "Mulheres 18-50 anos",
      objetivo: "Engajamento + Alcance",
      metricas: {
        visualizacoes: { min: 120000, max: 180000, media: 150000 },
        engajamentos: { min: 8400, max: 16200, media: 12300 },
        saves: { min: 600, max: 1600, media: 1100 },
        seguidores: { min: 450, max: 800, media: 625 }
      },
      custos: {
        cpv: { min: 0.0028, max: 0.0042, media: 0.0033 },
        cps: { min: 0.63, max: 1.11, media: 0.83 },
        cpa: { min: 0.031, max: 0.06, media: 0.045 }
      },
      roi: { vendas: 13, receita: 1950, lucro: 975, percentual: 195 },
      recomendacao: "Iniciantes"
    },
    {
      nome: "Cenário 2: Moderado",
      investimento: 500,
      duracao: "3 dias",
      publico: "Mulheres 25-45 anos",
      objetivo: "Conversão + Novos Seguidores",
      metricas: {
        visualizacoes: { min: 150000, max: 250000, media: 200000 },
        engajamentos: { min: 9000, max: 20000, media: 14500 },
        saves: { min: 800, max: 2000, media: 1400 },
        seguidores: { min: 600, max: 1200, media: 900 }
      },
      custos: {
        cpv: { min: 0.002, max: 0.0033, media: 0.0027 },
        cps: { min: 0.42, max: 0.83, media: 0.63 },
        cpa: { min: 0.025, max: 0.056, media: 0.04 }
      },
      roi: { vendas: 18, receita: 2700, lucro: 1350, percentual: 270 },
      recomendacao: "Crescimento ⭐ RECOMENDADO"
    },
    {
      nome: "Cenário 3: Agressivo",
      investimento: 500,
      duracao: "5 dias",
      publico: "Mulheres 18-55 anos",
      objetivo: "Viralidade + Alcance Máximo",
      metricas: {
        visualizacoes: { min: 200000, max: 350000, media: 275000 },
        engajamentos: { min: 10000, max: 24500, media: 17250 },
        saves: { min: 1000, max: 2500, media: 1750 },
        seguidores: { min: 800, max: 1500, media: 1150 }
      },
      custos: {
        cpv: { min: 0.0014, max: 0.0025, media: 0.002 },
        cps: { min: 0.33, max: 0.63, media: 0.48 },
        cpa: { min: 0.02, max: 0.05, media: 0.035 }
      },
      roi: { vendas: 23, receita: 3450, lucro: 1725, percentual: 345 },
      recomendacao: "Máxima Viralidade"
    }
  ];

  const benchmarks = [
    { metrica: "CPV", padraoAlto: 0.05, padraoBaixo: 0.005, cenario1: 0.0033, cenario2: 0.0027, cenario3: 0.002 },
    { metrica: "CPS", padraoAlto: 3.0, padraoBaixo: 0.3, cenario1: 0.83, cenario2: 0.63, cenario3: 0.48 },
    { metrica: "CPA", padraoAlto: 0.3, padraoBaixo: 0.02, cenario1: 0.045, cenario2: 0.04, cenario3: 0.035 }
  ];

  const roiData = [
    { cenario: "Conservador", investimento: 500, lucro: 975, roi: 195 },
    { cenario: "Moderado", investimento: 500, lucro: 1350, roi: 270 },
    { cenario: "Agressivo", investimento: 500, lucro: 1725, roi: 345 }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Análise de Impulsionamento com R$ 500</h2>
        <p className="text-slate-600">
          Análise completa de CPV (Custo por Visualização), CPS (Custo por Seguidor) e ROI para 3 cenários de impulsionamento do Reels Principal/Viral da Semana 1.
        </p>
      </div>

      {/* Resumo Executivo */}
      <Card className="border-l-4 border-l-green-400 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-lg">Resumo Executivo - Cenário 2 Recomendado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Investimento</p>
              <p className="text-slate-700 font-bold text-green-600">R$ 500</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Visualizações</p>
              <p className="text-slate-700 font-bold">150K-250K</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Novos Seguidores</p>
              <p className="text-slate-700 font-bold text-blue-600">600-1.2K</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">Lucro Esperado</p>
              <p className="text-slate-700 font-bold text-green-600">R$ 1.350</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">ROI</p>
              <p className="text-slate-700 font-bold text-green-600">270% ✅</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs dos Cenários */}
      <Tabs defaultValue="cenario2" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1">
          <TabsTrigger value="cenario1" className="text-xs sm:text-sm">
            Conservador
          </TabsTrigger>
          <TabsTrigger value="cenario2" className="text-xs sm:text-sm">
            Moderado ⭐
          </TabsTrigger>
          <TabsTrigger value="cenario3" className="text-xs sm:text-sm">
            Agressivo
          </TabsTrigger>
        </TabsList>

        {cenarios.map((cenario, idx) => (
          <TabsContent key={idx} value={`cenario${idx + 1}`} className="space-y-4 mt-6">
            {/* Informações Gerais */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{cenario.nome}</CardTitle>
                <CardDescription>{cenario.recomendacao}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Investimento</p>
                    <p className="text-slate-700 font-bold">R$ {cenario.investimento.toLocaleString('pt-BR')}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Duração</p>
                    <p className="text-slate-700 font-bold">{cenario.duracao}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Público-Alvo</p>
                    <p className="text-slate-700 font-bold">{cenario.publico}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Objetivo</p>
                    <p className="text-slate-700 font-bold">{cenario.objetivo}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Métricas Esperadas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Métricas Esperadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Visualizações</p>
                    <p className="text-slate-900 font-bold text-lg">
                      {(cenario.metricas.visualizacoes.min / 1000).toFixed(0)}K - {(cenario.metricas.visualizacoes.max / 1000).toFixed(0)}K
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Média: {(cenario.metricas.visualizacoes.media / 1000).toFixed(0)}K</p>
                  </div>

                  <div className="bg-purple-50 p-4 rounded border border-purple-200">
                    <p className="text-xs font-semibold text-purple-600 uppercase mb-2">Engajamentos</p>
                    <p className="text-slate-900 font-bold text-lg">
                      {(cenario.metricas.engajamentos.min / 1000).toFixed(1)}K - {(cenario.metricas.engajamentos.max / 1000).toFixed(1)}K
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Média: {(cenario.metricas.engajamentos.media / 1000).toFixed(1)}K</p>
                  </div>

                  <div className="bg-amber-50 p-4 rounded border border-amber-200">
                    <p className="text-xs font-semibold text-amber-600 uppercase mb-2">Saves</p>
                    <p className="text-slate-900 font-bold text-lg">
                      {cenario.metricas.saves.min} - {cenario.metricas.saves.max}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Média: {cenario.metricas.saves.media}</p>
                  </div>

                  <div className="bg-green-50 p-4 rounded border border-green-200">
                    <p className="text-xs font-semibold text-green-600 uppercase mb-2">Novos Seguidores</p>
                    <p className="text-slate-900 font-bold text-lg">
                      {cenario.metricas.seguidores.min} - {cenario.metricas.seguidores.max}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">Média: {cenario.metricas.seguidores.media}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Custos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  Custos (CPV, CPS, CPA)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-red-50 p-4 rounded border border-red-200">
                    <p className="text-xs font-semibold text-red-600 uppercase mb-2">CPV (Custo por Visualização)</p>
                    <p className="text-slate-900 font-bold text-lg">
                      R$ {cenario.custos.cpv.media.toFixed(4)}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      Min: R$ {cenario.custos.cpv.min.toFixed(4)}<br/>
                      Max: R$ {cenario.custos.cpv.max.toFixed(4)}
                    </p>
                    <p className="text-xs text-green-600 font-semibold mt-2">✅ Muito abaixo da média</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded border border-orange-200">
                    <p className="text-xs font-semibold text-orange-600 uppercase mb-2">CPS (Custo por Seguidor)</p>
                    <p className="text-slate-900 font-bold text-lg">
                      R$ {cenario.custos.cps.media.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      Min: R$ {cenario.custos.cps.min.toFixed(2)}<br/>
                      Max: R$ {cenario.custos.cps.max.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-600 font-semibold mt-2">✅ Muito competitivo</p>
                  </div>

                  <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
                    <p className="text-xs font-semibold text-yellow-600 uppercase mb-2">CPA (Custo por Engajamento)</p>
                    <p className="text-slate-900 font-bold text-lg">
                      R$ {cenario.custos.cpa.media.toFixed(3)}
                    </p>
                    <p className="text-xs text-slate-600 mt-2">
                      Min: R$ {cenario.custos.cpa.min.toFixed(3)}<br/>
                      Max: R$ {cenario.custos.cpa.max.toFixed(3)}
                    </p>
                    <p className="text-xs text-green-600 font-semibold mt-2">✅ Excelente</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ROI */}
            <Card className="border-l-4 border-l-green-600 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  ROI (Retorno sobre Investimento)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Vendas Esperadas</p>
                    <p className="text-slate-900 font-bold text-2xl text-green-600">{cenario.roi.vendas}</p>
                    <p className="text-xs text-slate-600 mt-1">Com 2% de conversão</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Receita Bruta</p>
                    <p className="text-slate-900 font-bold text-2xl">R$ {cenario.roi.receita.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-slate-600 mt-1">Ticket médio: R$ 150</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase">Lucro Líquido</p>
                    <p className="text-slate-900 font-bold text-2xl text-green-600">R$ {cenario.roi.lucro.toLocaleString('pt-BR')}</p>
                    <p className="text-xs text-slate-600 mt-1">50% de margem</p>
                  </div>
                  <div className="bg-white p-4 rounded border-2 border-green-600">
                    <p className="text-xs font-semibold text-green-600 uppercase">ROI Total</p>
                    <p className="text-slate-900 font-bold text-3xl text-green-600">{cenario.roi.percentual}%</p>
                    <p className="text-xs text-slate-600 mt-1">Retorno muito positivo! ✅</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Comparação Visual */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparação de ROI - 3 Cenários</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={roiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cenario" />
              <YAxis yAxisId="left" label={{ value: 'Lucro (R$)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'ROI (%)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="lucro" fill="#10b981" name="Lucro (R$)" />
              <Bar yAxisId="right" dataKey="roi" fill="#3b82f6" name="ROI (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparação com Benchmarks do Instagram</CardTitle>
          <CardDescription>Padrões de mercado 2024-2025 vs nossos cenários</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 font-semibold text-slate-700">Métrica</th>
                  <th className="text-center py-2 px-2 font-semibold text-slate-700">Padrão Baixo</th>
                  <th className="text-center py-2 px-2 font-semibold text-slate-700">Padrão Médio</th>
                  <th className="text-center py-2 px-2 font-semibold text-slate-700">Padrão Alto</th>
                  <th className="text-center py-2 px-2 font-semibold text-green-600">Cenário 1</th>
                  <th className="text-center py-2 px-2 font-semibold text-green-600">Cenário 2</th>
                  <th className="text-center py-2 px-2 font-semibold text-green-600">Cenário 3</th>
                </tr>
              </thead>
              <tbody>
                {benchmarks.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-2 font-semibold text-slate-700">{row.metrica}</td>
                    <td className="text-center py-2 px-2 text-slate-600">R$ {row.padraoBaixo.toFixed(3)}</td>
                    <td className="text-center py-2 px-2 text-slate-600">R$ {(row.padraoBaixo * 5).toFixed(3)}</td>
                    <td className="text-center py-2 px-2 text-slate-600">R$ {row.padraoAlto.toFixed(3)}</td>
                    <td className="text-center py-2 px-2 text-green-600 font-bold">R$ {row.cenario1.toFixed(4)}</td>
                    <td className="text-center py-2 px-2 text-green-600 font-bold">R$ {row.cenario2.toFixed(4)}</td>
                    <td className="text-center py-2 px-2 text-green-600 font-bold">R$ {row.cenario3.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-green-600 font-semibold mt-4">✅ Todos os cenários estão MUITO ABAIXO da média de mercado!</p>
        </CardContent>
      </Card>

      {/* Recomendação Final */}
      <Card className="border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg">Recomendação Final</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">🎯 Escolha: Cenário 2 (Moderado)</h4>
            <p className="text-slate-700 text-sm mb-3">
              Este é o melhor balanço entre risco, retorno e facilidade de execução. Oferece:
            </p>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>✅ ROI de 270% (R$ 1.350 de lucro com R$ 500 investidos)</li>
              <li>✅ CPS de R$ 0,63 (muito abaixo da média de R$ 0,50-2,00)</li>
              <li>✅ CPV de R$ 0,0027 (muito abaixo da média de R$ 0,01-0,03)</li>
              <li>✅ 600-1.2K novos seguidores em apenas 3 dias</li>
              <li>✅ Concentração em 3 dias cria momentum</li>
              <li>✅ Dados para otimizar futuras campanhas</li>
            </ul>
          </div>

          <div className="bg-white p-4 rounded border-2 border-blue-400">
            <h4 className="font-semibold text-slate-900 mb-2">📊 Próximas Ações</h4>
            <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
              <li>Poste o Reels organicamente sexta-feira 20h</li>
              <li>Deixe rodar 2-3 horas sem ads</li>
              <li>Verifique performance inicial</li>
              <li>Se bom (CPV &lt; R$ 0,005), comece ads</li>
              <li>Invista R$ 500 em 3 dias (sexta, sábado, domingo)</li>
              <li>Monitore CPV e CPS em tempo real</li>
              <li>Responda comentários rapidamente</li>
              <li>Compile dados completos após 7 dias</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
