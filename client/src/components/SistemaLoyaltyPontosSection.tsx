import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Gift, TrendingUp, Zap, AlertCircle } from "lucide-react";

const LOYALTY_TIERS = [
  { name: "Bronze", minPoints: 0, maxPoints: 499, benefits: ["5% desconto", "Frete grátis acima R$100"] },
  { name: "Prata", minPoints: 500, maxPoints: 999, benefits: ["10% desconto", "Frete grátis", "Acesso antecipado"] },
  { name: "Ouro", minPoints: 1000, maxPoints: 1999, benefits: ["15% desconto", "Frete grátis", "Atendimento VIP", "Brinde exclusivo"] },
  { name: "Platina", minPoints: 2000, maxPoints: Infinity, benefits: ["20% desconto", "Frete grátis", "Atendimento VIP", "Brinde mensal", "Cashback 5%"] },
];

const POINTS_RULES = [
  { action: "Compra (R$1)", points: 1, frequency: "Cada compra" },
  { action: "Indicação aceita", points: 50, frequency: "Por indicação" },
  { action: "Referência de amiga", points: 25, frequency: "Por amiga que compra" },
  { action: "Avaliação de produto", points: 10, frequency: "Por avaliação" },
  { action: "Compartilhamento em redes", points: 15, frequency: "Por compartilhamento" },
  { action: "Aniversário", points: 100, frequency: "Uma vez ao ano" },
];

const CAMPAIGN_IDEAS = [
  { name: "Double Points Weekend", description: "Fim de semana com 2x pontos em todas as compras" },
  { name: "Referral Bonus", description: "Ganhe 100 pontos para cada amiga que se cadastrar" },
  { name: "Birthday Month Special", description: "20% extra em pontos no mês de aniversário" },
  { name: "Seasonal Challenges", description: "Desafios mensais com prêmios em pontos" },
];

export default function SistemaLoyaltyPontosSection() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Sistema de Loyalty & Pontos</h2>
        <p className="text-slate-600">Programa de fidelização com pontos por compra e referência — aumenta lifetime value e repeat purchase</p>
      </div>

      {/* Integração necessária */}
      <Card className="border-l-4 border-l-amber-500 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Métricas de membros requerem integração com e-commerce</p>
              <p className="text-sm text-slate-600 mt-1">
                Para exibir total de membros, pontos distribuídos, taxa de retenção e LTV real, conecte o Bling ERP e configure as regras de pontuação abaixo no seu sistema de e-commerce.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Placeholders KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Membros Ativos", descricao: "Via Bling ERP" },
          { label: "Pontos Distribuídos", descricao: "Este mês" },
          { label: "Taxa de Retenção", descricao: "Via histórico de pedidos" },
          { label: "LTV Médio", descricao: "Via histórico de pedidos" },
        ].map((kpi, idx) => (
          <Card key={idx} className="border-dashed border-slate-300 bg-slate-50">
            <CardContent className="pt-4 text-center">
              <p className="text-xs font-medium text-slate-500 mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-slate-300">—</p>
              <p className="text-xs text-slate-400 mt-1">{kpi.descricao}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Loyalty Tiers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-5 h-5" />
            Níveis de Fidelização
          </CardTitle>
          <CardDescription>4 tiers com benefícios progressivos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {LOYALTY_TIERS.map((tier, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900">{tier.name}</h3>
                  <Badge variant="outline" className="text-xs">
                    {tier.minPoints.toLocaleString()} - {tier.maxPoints === Infinity ? "∞" : tier.maxPoints.toLocaleString()} pts
                  </Badge>
                </div>
                <div className="space-y-1">
                  {tier.benefits.map((benefit, bidx) => (
                    <p key={bidx} className="text-sm text-slate-700 flex items-center gap-2">
                      <Gift className="w-3 h-3 text-pink-500" />
                      {benefit}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Points Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Como Ganhar Pontos
          </CardTitle>
          <CardDescription>Configure estas regras no seu sistema de e-commerce</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 font-semibold text-slate-900">Ação</th>
                  <th className="text-center py-2 px-3 font-semibold text-slate-900">Pontos</th>
                  <th className="text-left py-2 px-3 font-semibold text-slate-900">Frequência</th>
                </tr>
              </thead>
              <tbody>
                {POINTS_RULES.map((rule, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-3 px-3 text-slate-700">{rule.action}</td>
                    <td className="py-3 px-3 text-center font-bold text-pink-600">{rule.points}</td>
                    <td className="py-3 px-3 text-slate-600">{rule.frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Campaign Ideas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ideias de Campanhas de Pontos
          </CardTitle>
          <CardDescription>Estratégias para aumentar engajamento no programa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CAMPAIGN_IDEAS.map((campaign, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4">
                <p className="font-semibold text-slate-900">{campaign.name}</p>
                <p className="text-sm text-slate-600 mt-1">{campaign.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-purple-900">Próximos Passos</CardTitle>
        </CardHeader>
        <CardContent className="text-purple-900 space-y-3">
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Integrar com Bling ERP para rastrear pedidos por cliente</li>
            <li>Configurar automações de pontos por compra</li>
            <li>Criar página de resgate de pontos no site</li>
            <li>Enviar email de boas-vindas ao programa</li>
            <li>Lançar campanha de referência com cupons rastreáveis</li>
            <li>Monitorar métricas de engajamento via aba Relatórios</li>
            <li>Ajustar regras baseado em dados reais de retenção</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
