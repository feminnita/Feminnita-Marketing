import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Users, ShoppingCart, DollarSign } from "lucide-react";

export default function AnalyticsAvancadoFunilSection() {
  const funilData = [
    {
      stage: "Impressões",
      value: 125400,
      percentage: 100,
      color: "bg-blue-500",
      icon: "👁️"
    },
    {
      stage: "Cliques",
      value: 45230,
      percentage: 36.1,
      color: "bg-blue-400",
      icon: "🖱️"
    },
    {
      stage: "Visitas ao Site",
      value: 38450,
      percentage: 30.7,
      color: "bg-blue-300",
      icon: "🌐"
    },
    {
      stage: "Carrinho Adicionado",
      value: 12340,
      percentage: 9.8,
      color: "bg-amber-400",
      icon: "🛒"
    },
    {
      stage: "Checkout Iniciado",
      value: 8560,
      percentage: 6.8,
      color: "bg-orange-400",
      icon: "💳"
    },
    {
      stage: "Compra Concluída",
      value: 5230,
      percentage: 4.2,
      color: "bg-green-500",
      icon: "✅"
    }
  ];

  const personaMetrics = [
    {
      persona: "Carol",
      impressions: 32100,
      clicks: 11520,
      visits: 9845,
      purchases: 1240,
      conversionRate: "3.86%",
      ltv: "R$ 1.240",
      roi: "245%"
    },
    {
      persona: "Renata",
      impressions: 28900,
      clicks: 10410,
      visits: 8934,
      purchases: 1560,
      conversionRate: "5.40%",
      ltv: "R$ 1.560",
      roi: "312%"
    },
    {
      persona: "Vanessa",
      impressions: 35200,
      clicks: 12690,
      visits: 10870,
      purchases: 1890,
      conversionRate: "5.37%",
      ltv: "R$ 1.890",
      roi: "298%"
    },
    {
      persona: "Luiza",
      impressions: 29200,
      clicks: 10610,
      visits: 8801,
      purchases: 540,
      conversionRate: "1.85%",
      ltv: "R$ 540",
      roi: "108%"
    }
  ];

  const conversionByChannel = [
    { channel: "Instagram", rate: "4.2%", roi: "245%", revenue: "R$ 12.450" },
    { channel: "TikTok", rate: "5.8%", roi: "312%", revenue: "R$ 18.670" },
    { channel: "Google Ads", rate: "3.1%", roi: "156%", revenue: "R$ 8.920" },
    { channel: "Facebook", rate: "2.9%", roi: "145%", revenue: "R$ 7.340" },
    { channel: "WhatsApp", rate: "6.4%", roi: "380%", revenue: "R$ 22.100" }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            Analytics Avançado - Funil de Conversão
          </CardTitle>
          <CardDescription>
            Rastreie o funil completo: impressão → clique → carrinho → compra
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Funil de Conversão */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Funil de Conversão Completo</h3>
            <div className="space-y-2">
              {funilData.map((stage, idx) => (
                <div key={stage.stage} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span>{stage.icon}</span>
                      <span className="font-semibold text-slate-900">{stage.stage}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-semibold text-slate-900">{stage.value.toLocaleString()}</span>
                      <span className="text-slate-600 text-xs ml-2">({stage.percentage.toFixed(1)}%)</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className={`${stage.color} h-full rounded-full transition-all`}
                      style={{ width: `${stage.percentage}%` }}
                    />
                  </div>
                  {idx < funilData.length - 1 && (
                    <p className="text-xs text-slate-500">
                      Drop-off: {((funilData[idx].value - funilData[idx + 1].value) / funilData[idx].value * 100).toFixed(1)}%
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Métricas por Persona */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Performance por Persona</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2 font-semibold">Persona</th>
                    <th className="text-right py-2 px-2 font-semibold">Impressões</th>
                    <th className="text-right py-2 px-2 font-semibold">Cliques</th>
                    <th className="text-right py-2 px-2 font-semibold">Compras</th>
                    <th className="text-right py-2 px-2 font-semibold">Taxa Conv.</th>
                    <th className="text-right py-2 px-2 font-semibold">LTV</th>
                    <th className="text-right py-2 px-2 font-semibold">ROI</th>
                  </tr>
                </thead>
                <tbody>
                  {personaMetrics.map((pm) => (
                    <tr key={pm.persona} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-2 font-semibold">{pm.persona}</td>
                      <td className="text-right py-2 px-2">{pm.impressions.toLocaleString()}</td>
                      <td className="text-right py-2 px-2">{pm.clicks.toLocaleString()}</td>
                      <td className="text-right py-2 px-2 font-semibold text-green-600">{pm.purchases.toLocaleString()}</td>
                      <td className="text-right py-2 px-2">
                        <Badge variant="outline" className="bg-blue-50">{pm.conversionRate}</Badge>
                      </td>
                      <td className="text-right py-2 px-2 font-semibold">{pm.ltv}</td>
                      <td className="text-right py-2 px-2 font-semibold text-green-600">{pm.roi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Conversão por Canal */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">Taxa de Conversão por Canal</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {conversionByChannel.map((channel) => (
                <div key={channel.channel} className="border rounded-lg p-4 space-y-2">
                  <p className="font-semibold text-slate-900">{channel.channel}</p>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-blue-50 rounded p-2">
                      <p className="text-slate-600 text-xs">Taxa Conv.</p>
                      <p className="font-semibold text-blue-600">{channel.rate}</p>
                    </div>
                    <div className="bg-green-50 rounded p-2">
                      <p className="text-slate-600 text-xs">ROI</p>
                      <p className="font-semibold text-green-600">{channel.roi}</p>
                    </div>
                    <div className="bg-purple-50 rounded p-2">
                      <p className="text-slate-600 text-xs">Receita</p>
                      <p className="font-semibold text-purple-600">{channel.revenue}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo de KPIs */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Impressões Totais</p>
              <p className="text-2xl font-bold text-blue-600">125.4K</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <ShoppingCart className="w-6 h-6 text-amber-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Taxa Conversão Média</p>
              <p className="text-2xl font-bold text-amber-600">4.2%</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">Receita Total</p>
              <p className="text-2xl font-bold text-green-600">R$ 69.5K</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-slate-600">ROI Médio</p>
              <p className="text-2xl font-bold text-purple-600">240%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
