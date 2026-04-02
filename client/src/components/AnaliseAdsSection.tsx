import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, DollarSign, AlertCircle } from "lucide-react";

// Projeções baseadas em benchmarks de mercado para Instagram Reels Brasil (2024-2025)
// Fonte: Meta Ads benchmarks para categoria moda/vestuário
const CENARIOS = [
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

const BENCHMARKS = [
  { metrica: "CPV", padraoBaixo: 0.005, padraoAlto: 0.05, cenario1: 0.0033, cenario2: 0.0027, cenario3: 0.002 },
  { metrica: "CPS", padraoBaixo: 0.3, padraoAlto: 3.0, cenario1: 0.83, cenario2: 0.63, cenario3: 0.48 },
  { metrica: "CPA", padraoBaixo: 0.02, padraoAlto: 0.3, cenario1: 0.045, cenario2: 0.04, cenario3: 0.035 }
];

const ROI_DATA = [
  { cenario: "Conservador", investimento: 500, lucro: 975, roi: 195 },
  { cenario: "Moderado", investimento: 500, lucro: 1350, roi: 270 },
  { cenario: "Agressivo", investimento: 500, lucro: 1725, roi: 345 }
];

export default function AnaliseAdsSection() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Análise de Impulsionamento com R$ 500</h2>
        <p className="text-slate-600">
          Projeções de CPV, CPS e ROI para 3 cenários de impulsionamento baseados em benchmarks de mercado (Instagram Reels, moda/vestuário, Brasil 2024-2025).
        </p>
      </div>

      {/* Aviso de estimativa */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Estes são estimativas baseadas em benchmarks — não resultados garantidos</p>
              <p className="text-sm text-slate-600 mt-1">
                Projeções calculadas com: 2% taxa de conversão, ticket médio R$ 150, margem 50%. Os resultados reais dependerão da qualidade do criativo, segmentação e histórico da conta. Use como referência de planejamento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs dos Cenários */}
      <Tabs defaultValue="cenario2" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1">
          <TabsTrigger value="cenario1" className="text-xs sm:text-sm">Conservador</TabsTrigger>
          <TabsTrigger value="cenario2" className="text-xs sm:text-sm">Moderado ⭐</TabsTrigger>
          <TabsTrigger value="cenario3" className="text-xs sm:text-sm">Agressivo</TabsTrigger>
        </TabsList>

        {CENARIOS.map((cenario, idx) => (
          <TabsContent key={idx} value={`cenario${idx + 1}`} className="space-y-4 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{cenario.nome}</CardTitle>
                <CardDescription>{cenario.recomendacao}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4 text-sm">
                  <div><p className="text-xs font-semibold text-slate-500 uppercase">Investimento</p><p className="font-bold">R$ {cenario.investimento.toLocaleString('pt-BR')}</p></div>
                  <div><p className="text-xs font-semibold text-slate-500 uppercase">Duração</p><p className="font-bold">{cenario.duracao}</p></div>
                  <div><p className="text-xs font-semibold text-slate-500 uppercase">Público-Alvo</p><p className="font-bold">{cenario.publico}</p></div>
                  <div><p className="text-xs font-semibold text-slate-500 uppercase">Objetivo</p><p className="font-bold">{cenario.objetivo}</p></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Métricas Estimadas (benchmark de mercado)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded border border-blue-200">
                    <p className="text-xs font-semibold text-blue-600 uppercase mb-2">Visualizações</p>
                    <p className="font-bold text-lg">{(cenario.metricas.visualizacoes.min / 1000).toFixed(0)}K - {(cenario.metricas.visualizacoes.max / 1000).toFixed(0)}K</p>
                    <p className="text-xs text-slate-600 mt-1">Média: {(cenario.metricas.visualizacoes.media / 1000).toFixed(0)}K</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded border border-purple-200">
                    <p className="text-xs font-semibold text-purple-600 uppercase mb-2">Engajamentos</p>
                    <p className="font-bold text-lg">{(cenario.metricas.engajamentos.min / 1000).toFixed(1)}K - {(cenario.metricas.engajamentos.max / 1000).toFixed(1)}K</p>
                    <p className="text-xs text-slate-600 mt-1">Média: {(cenario.metricas.engajamentos.media / 1000).toFixed(1)}K</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded border border-amber-200">
                    <p className="text-xs font-semibold text-amber-600 uppercase mb-2">Saves</p>
                    <p className="font-bold text-lg">{cenario.metricas.saves.min} - {cenario.metricas.saves.max}</p>
                    <p className="text-xs text-slate-600 mt-1">Média: {cenario.metricas.saves.media}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded border border-green-200">
                    <p className="text-xs font-semibold text-green-600 uppercase mb-2">Novos Seguidores</p>
                    <p className="font-bold text-lg">{cenario.metricas.seguidores.min} - {cenario.metricas.seguidores.max}</p>
                    <p className="text-xs text-slate-600 mt-1">Média: {cenario.metricas.seguidores.media}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  Custos Estimados (CPV, CPS, CPA)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { label: "CPV (Custo por Visualização)", valor: cenario.custos.cpv, cor: "red" },
                    { label: "CPS (Custo por Seguidor)", valor: cenario.custos.cps, cor: "orange" },
                    { label: "CPA (Custo por Engajamento)", valor: cenario.custos.cpa, cor: "yellow" },
                  ].map((custo, cidx) => (
                    <div key={cidx} className={`bg-${custo.cor}-50 p-4 rounded border border-${custo.cor}-200`}>
                      <p className={`text-xs font-semibold text-${custo.cor}-600 uppercase mb-2`}>{custo.label}</p>
                      <p className="font-bold text-lg">R$ {custo.valor.media.toFixed(4)}</p>
                      <p className="text-xs text-slate-600 mt-2">Min: R$ {custo.valor.min.toFixed(4)}<br/>Max: R$ {custo.valor.max.toFixed(4)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-600 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  ROI Estimado (assumindo 2% conversão, ticket R$ 150, margem 50%)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <div><p className="text-xs font-semibold text-slate-500 uppercase">Vendas Estimadas</p><p className="font-bold text-2xl text-green-600">{cenario.roi.vendas}</p></div>
                  <div><p className="text-xs font-semibold text-slate-500 uppercase">Receita Bruta Est.</p><p className="font-bold text-2xl">R$ {cenario.roi.receita.toLocaleString('pt-BR')}</p></div>
                  <div><p className="text-xs font-semibold text-slate-500 uppercase">Lucro Est.</p><p className="font-bold text-2xl text-green-600">R$ {cenario.roi.lucro.toLocaleString('pt-BR')}</p></div>
                  <div className="bg-white p-4 rounded border-2 border-green-600">
                    <p className="text-xs font-semibold text-green-600 uppercase">ROI Estimado</p>
                    <p className="font-bold text-3xl text-green-600">{cenario.roi.percentual}%</p>
                    <p className="text-xs text-slate-500 mt-1">Com premissas acima</p>
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
          <CardTitle className="text-lg">Comparação de ROI Estimado — 3 Cenários</CardTitle>
          <CardDescription>Baseado em benchmarks de mercado, não resultados reais</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={ROI_DATA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="cenario" />
              <YAxis yAxisId="left" label={{ value: 'Lucro (R$)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'ROI (%)', angle: 90, position: 'insideRight' }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="lucro" fill="#10b981" name="Lucro Est. (R$)" />
              <Bar yAxisId="right" dataKey="roi" fill="#3b82f6" name="ROI Est. (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Benchmarks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Comparação com Benchmarks do Instagram</CardTitle>
          <CardDescription>Padrões de mercado 2024-2025 (moda/vestuário Brasil) vs estimativas dos cenários</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-2 font-semibold">Métrica</th>
                  <th className="text-center py-2 px-2 font-semibold">Benchmark Baixo</th>
                  <th className="text-center py-2 px-2 font-semibold">Benchmark Alto</th>
                  <th className="text-center py-2 px-2 font-semibold text-blue-600">Cen. 1 (est.)</th>
                  <th className="text-center py-2 px-2 font-semibold text-green-600">Cen. 2 (est.)</th>
                  <th className="text-center py-2 px-2 font-semibold text-purple-600">Cen. 3 (est.)</th>
                </tr>
              </thead>
              <tbody>
                {BENCHMARKS.map((row, idx) => (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-2 px-2 font-semibold">{row.metrica}</td>
                    <td className="text-center py-2 px-2 text-slate-600">R$ {row.padraoBaixo.toFixed(3)}</td>
                    <td className="text-center py-2 px-2 text-slate-600">R$ {row.padraoAlto.toFixed(3)}</td>
                    <td className="text-center py-2 px-2 text-blue-600 font-bold">R$ {row.cenario1.toFixed(4)}</td>
                    <td className="text-center py-2 px-2 text-green-600 font-bold">R$ {row.cenario2.toFixed(4)}</td>
                    <td className="text-center py-2 px-2 text-purple-600 font-bold">R$ {row.cenario3.toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500 mt-3">Estimativas baseadas em médias de mercado. Resultados reais variam conforme criativo, sazonalidade e histórico da conta.</p>
        </CardContent>
      </Card>

      {/* Próximas ações */}
      <Card className="border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg">Próximas Ações Recomendadas</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="space-y-2 text-sm text-slate-700 list-decimal list-inside">
            <li>Poste o Reels organicamente primeiro e acompanhe performance inicial (2-3h)</li>
            <li>Se CPV orgânico estiver abaixo de R$ 0,005, comece o impulsionamento</li>
            <li>Inicie com Cenário 1 (conservador) para testar audiência</li>
            <li>Monitore CPV e CPS em tempo real no Meta Ads Manager</li>
            <li>Após 7 dias, compile dados reais e compare com estas estimativas</li>
            <li>Use os dados reais para calibrar projeções futuras</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
