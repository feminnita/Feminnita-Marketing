import { trpc } from "@/lib/trpc";
import { TrendingUp, Calendar, AlertCircle, CheckCircle, BarChart3, Zap } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FATORES_SAZONALIDADE = [
  { mes: "Fevereiro", indice: 1.15, descricao: "Pós-Carnaval (alta demanda)" },
  { mes: "Março", indice: 1.08, descricao: "Estabilização" },
  { mes: "Abril", indice: 0.95, descricao: "Período de redução" },
  { mes: "Maio", indice: 1.20, descricao: "Preparação para inverno" },
];

const FATORES_INFLUENCIA = [
  { fator: "Sazonalidade", peso: "35%", impacto: "Alto" },
  { fator: "Tendências Virais", peso: "25%", impacto: "Médio" },
  { fator: "Investimento em Ads", peso: "20%", impacto: "Alto" },
  { fator: "Estoque Disponível", peso: "15%", impacto: "Médio" },
  { fator: "Concorrência", peso: "5%", impacto: "Baixo" },
];

const PLATAFORMAS = [
  { label: "Instagram", keys: ["instagram", "instagram ads", "meta", "meta ads"] },
  { label: "TikTok", keys: ["tiktok", "tiktok ads"] },
  { label: "Facebook", keys: ["facebook"] },
  { label: "Google Ads", keys: ["google", "google ads", "google shopping"] },
];

export function PrevisaoDemandaSection() {
  const { data: campanhasRaw = [] } = trpc.campaigns.listar.useQuery();
  const { data: blingStatus } = trpc.blingOAuth.getStatus.useQuery();
  const blingConectado = (blingStatus as any)?.connected === true;
  const campanhas = campanhasRaw as any[];

  const totalConversoes = campanhas.reduce((s: number, c: any) => s + (c.performance?.conversoes ?? 0), 0);

  const canaisDados = PLATAFORMAS.map(p => {
    const grupo = campanhas.filter((c: any) =>
      p.keys.includes((c.plataforma ?? '').toLowerCase())
    );
    const conversoes = grupo.reduce((s: number, c: any) => s + (c.performance?.conversoes ?? 0), 0);
    const roi = grupo.length > 0 ? grupo.reduce((s: number, c: any) => s + (c.performance?.roi ?? 0), 0) / grupo.length : 0;
    return { canal: p.label, conversoes, roi: parseFloat(roi.toFixed(1)), count: grupo.length };
  }).filter(c => c.count > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold" style={{ color: '#8B2635' }}>Previsão de Demanda</h2>
        <p className="text-slate-500 text-sm mt-1">Sinais de demanda por canal e fatores de sazonalidade</p>
      </div>

      {/* Bling requirement for product-level forecasts */}
      <Card className="border-0 shadow-sm border-l-4 border-amber-400 bg-amber-50">
        <CardContent className="pt-4 pb-4 flex gap-3 items-start">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Previsão por produto (unidades, receita estimada por SKU) requer <strong>Bling ERP</strong> para
            histórico de vendas e estoque.
            {blingConectado
              ? ' Bling conectado — configure exportação de histórico de vendas.'
              : ' Configure a integração em Integrações → Bling.'}
          </p>
        </CardContent>
      </Card>

      {/* Campaign signals */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Conversões totais (campanhas)</p>
            <p className="text-2xl font-bold text-slate-900">{totalConversoes > 0 ? totalConversoes.toLocaleString('pt-BR') : '—'}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Canais com dados</p>
            <p className="text-2xl font-bold text-slate-900">{canaisDados.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="pt-5 pb-5">
            <p className="text-xs text-slate-500">Campanhas ativas</p>
            <p className="text-2xl font-bold text-slate-900">{campanhas.filter((c: any) => c.status === 'ativa').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Canal signal — real data */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="w-4 h-4" style={{ color: '#8B2635' }} />
            Sinais de demanda por canal (campanhas cadastradas)
          </CardTitle>
          <CardDescription className="text-xs">Baseado em conversões reais das campanhas cadastradas</CardDescription>
        </CardHeader>
        <CardContent>
          {canaisDados.length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <BarChart3 className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">Nenhum dado de canal disponível.</p>
              <p className="text-xs">Cadastre campanhas com plataforma definida para ver sinais por canal.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {canaisDados.map((canal, idx) => (
                <div key={idx} className="p-3 border border-slate-200 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm text-slate-900">{canal.canal}</p>
                    <Badge variant="secondary" className="text-xs">{canal.count} campanha(s)</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <span>Conversões: <strong className="text-slate-900">{canal.conversoes.toLocaleString('pt-BR')}</strong></span>
                    <span>ROI médio: <strong className="text-green-700">{canal.roi.toFixed(1)}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sazonalidade — legitimate industry benchmarks */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="w-4 h-4" style={{ color: '#8B2635' }} />
            Índice de Sazonalidade (moda/pijamas Brasil)
          </CardTitle>
          <CardDescription className="text-xs">Padrões típicos de demanda por mês — referência de mercado</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {FATORES_SAZONALIDADE.map((sazon, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="w-20 flex-shrink-0">
                  <p className="font-semibold text-sm text-slate-900">{sazon.mes}</p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-500">{sazon.descricao}</span>
                    <span className="text-sm font-bold text-slate-900">{sazon.indice}x</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{
                      width: `${(sazon.indice / 1.3) * 100}%`,
                      backgroundColor: '#8B2635',
                    }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fatores de Influência — legitimate conceptual model */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Zap className="w-4 h-4" style={{ color: '#8B2635' }} />
            Fatores que Influenciam a Demanda
          </CardTitle>
          <CardDescription className="text-xs">Peso estimado de cada fator na previsão de vendas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {FATORES_INFLUENCIA.map((fator, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm text-slate-900">{fator.fator}</p>
                    <span className="text-sm font-bold text-slate-600">{fator.peso}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="h-2 rounded-full" style={{
                      width: fator.peso,
                      backgroundColor: '#8B2635',
                    }} />
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Impacto: {fator.impacto}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recommendations guide */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Como Agir com a Previsão</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {[
            { icon: <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />, text: 'Use índice de sazonalidade para planejar estoque com 4–6 semanas de antecedência.' },
            { icon: <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />, text: 'Canal com maior ROI médio merece incremento de orçamento no próximo mês.' },
            { icon: <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0" />, text: 'Conecte o Bling ERP para ver previsão real por SKU com histórico de 12 meses.' },
          ].map((tip, i) => (
            <div key={i} className="flex items-start gap-3 p-3 border border-slate-200 rounded-lg">
              {tip.icon}
              <p className="text-slate-700">{tip.text}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
