import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Gift, TrendingUp, Users, Zap, AlertCircle } from "lucide-react";

export default function SistemaLoyaltyPontosSection() {
  const loyaltyTiers = [
    { name: "Bronze", minPoints: 0, maxPoints: 499, benefits: ["5% desconto", "Frete grátis acima R$100"], members: 1245 },
    { name: "Prata", minPoints: 500, maxPoints: 999, benefits: ["10% desconto", "Frete grátis", "Acesso antecipado"], members: 456 },
    { name: "Ouro", minPoints: 1000, maxPoints: 1999, benefits: ["15% desconto", "Frete grátis", "Atendimento VIP", "Brinde exclusivo"], members: 123 },
    { name: "Platina", minPoints: 2000, maxPoints: Infinity, benefits: ["20% desconto", "Frete grátis", "Atendimento VIP", "Brinde mensal", "Cashback 5%"], members: 28 },
  ];

  const pointsRules = [
    { action: "Compra (R$1)", points: 1, frequency: "Cada compra" },
    { action: "Indicação aceita", points: 50, frequency: "Por indicação" },
    { action: "Referência de amiga", points: 25, frequency: "Por amiga que compra" },
    { action: "Avaliação de produto", points: 10, frequency: "Por avaliação" },
    { action: "Compartilhamento em redes", points: 15, frequency: "Por compartilhamento" },
    { action: "Aniversário", points: 100, frequency: "Uma vez ao ano" },
  ];

  const topMembers = [
    { name: "Maria Silva", points: 2845, tier: "Platina", purchases: 28, referrals: 12 },
    { name: "Ana Costa", points: 1923, tier: "Ouro", purchases: 19, referrals: 8 },
    { name: "Juliana Santos", points: 1456, tier: "Ouro", purchases: 15, referrals: 6 },
    { name: "Fernanda Oliveira", points: 892, tier: "Prata", purchases: 9, referrals: 4 },
    { name: "Beatriz Martins", points: 745, tier: "Prata", purchases: 8, referrals: 3 },
  ];

  const campaignIdeas = [
    { name: "Double Points Weekend", description: "Fim de semana com 2x pontos em todas as compras", expectedLift: "+35%" },
    { name: "Referral Bonus", description: "Ganhe 100 pontos para cada amiga que se cadastrar", expectedLift: "+28%" },
    { name: "Birthday Month Special", description: "20% extra em pontos no mês de aniversário", expectedLift: "+18%" },
    { name: "Seasonal Challenges", description: "Desafios mensais com prêmios em pontos", expectedLift: "+22%" },
  ];

  const metrics = [
    { label: "Membros Ativos", value: "1,852", change: "+12%" },
    { label: "Pontos Distribuídos (mês)", value: "45,230", change: "+8%" },
    { label: "Taxa de Retenção", value: "78.5%", change: "+5%" },
    { label: "Lifetime Value (LTV)", value: "R$ 2,450", change: "+18%" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Sistema de Loyalty & Pontos</h2>
        <p className="text-slate-600">Programa de fidelização com pontos por compra e referência - aumenta lifetime value e repeat purchase</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metrics.map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">{metric.label}</p>
                  <p className="text-2xl font-bold text-slate-900">{metric.value}</p>
                </div>
                <Badge className="bg-green-100 text-green-800">{metric.change}</Badge>
              </div>
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
            {loyaltyTiers.map((tier, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg text-slate-900">{tier.name}</h3>
                  <Badge variant="outline">{tier.members} membros</Badge>
                </div>
                <p className="text-sm text-slate-600">
                  {tier.minPoints.toLocaleString()} - {tier.maxPoints === Infinity ? "∞" : tier.maxPoints.toLocaleString()} pontos
                </p>
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
          <CardDescription>Diferentes formas de acumular pontos</CardDescription>
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
                {pointsRules.map((rule, idx) => (
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

      {/* Top Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Top Membros
          </CardTitle>
          <CardDescription>Clientes mais fiéis do programa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topMembers.map((member, idx) => (
              <div key={idx} className="flex items-center justify-between border-b border-slate-100 pb-3 last:border-0">
                <div>
                  <p className="font-medium text-slate-900">{member.name}</p>
                  <p className="text-xs text-slate-600">{member.purchases} compras • {member.referrals} indicações</p>
                </div>
                <div className="text-right">
                  <Badge className="bg-yellow-100 text-yellow-800 mb-1">{member.tier}</Badge>
                  <p className="font-bold text-slate-900">{member.points} pts</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campaign Ideas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Ideias de Campanhas
          </CardTitle>
          <CardDescription>Estratégias para aumentar engajamento no programa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {campaignIdeas.map((campaign, idx) => (
              <div key={idx} className="border border-slate-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900">{campaign.name}</p>
                    <p className="text-sm text-slate-600 mt-1">{campaign.description}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">{campaign.expectedLift}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Implementation Guide */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-900">
            <AlertCircle className="w-5 h-5" />
            Próximos Passos
          </CardTitle>
        </CardHeader>
        <CardContent className="text-purple-900 space-y-3">
          <ol className="list-decimal list-inside space-y-2">
            <li>Integrar com plataforma de e-commerce (Shopify, WooCommerce)</li>
            <li>Configurar automações de pontos por compra</li>
            <li>Criar página de resgate de pontos</li>
            <li>Enviar email de boas-vindas ao programa</li>
            <li>Lançar campanha de referência</li>
            <li>Monitorar métricas de engajamento</li>
            <li>Ajustar regras baseado em dados</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
