import { AlertTriangle, TrendingDown, Clock, Users, CheckCircle, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PrevisaoChurnSection() {
  const clientesEmRisco = [
    {
      id: 1,
      nome: "Fernanda Costa",
      email: "fernanda@email.com",
      risco: "95%",
      diasSemCompra: 28,
      ultimaCompra: "04/01/2026",
      ltv: "R$ 2.800",
      acao: "Cupom 20%",
      impacto: "R$ 560"
    },
    {
      id: 2,
      nome: "Beatriz Silva",
      email: "beatriz@email.com",
      risco: "92%",
      diasSemCompra: 26,
      ultimaCompra: "06/01/2026",
      ltv: "R$ 1.500",
      acao: "Email exclusivo",
      impacto: "R$ 300"
    },
    {
      id: 3,
      nome: "Camila Oliveira",
      email: "camila@email.com",
      risco: "88%",
      diasSemCompra: 24,
      ultimaCompra: "08/01/2026",
      ltv: "R$ 3.200",
      acao: "Cupom 15% + Frete",
      impacto: "R$ 800"
    },
    {
      id: 4,
      nome: "Daniela Mendes",
      email: "daniela@email.com",
      risco: "85%",
      diasSemCompra: 22,
      ultimaCompra: "10/01/2026",
      ltv: "R$ 2.100",
      acao: "Resgate VIP",
      impacto: "R$ 630"
    },
    {
      id: 5,
      nome: "Elisa Santos",
      email: "elisa@email.com",
      risco: "82%",
      diasSemCompra: 20,
      ultimaCompra: "12/01/2026",
      ltv: "R$ 1.800",
      acao: "Cupom 10%",
      impacto: "R$ 180"
    }
  ];

  const metricas = [
    {
      titulo: "Clientes em Risco",
      valor: "156",
      descricao: "Próximos 30 dias",
      cor: "text-red-600"
    },
    {
      titulo: "LTV em Risco",
      valor: "R$ 312K",
      descricao: "Potencial de perda",
      cor: "text-orange-600"
    },
    {
      titulo: "Taxa de Recuperação",
      valor: "68%",
      descricao: "Com ações preventivas",
      cor: "text-green-600"
    },
    {
      titulo: "Impacto Potencial",
      valor: "R$ 212K",
      descricao: "Se recuperar 68%",
      cor: "text-blue-600"
    }
  ];

  const fatoresRisco = [
    { fator: "Sem compra há 20+ dias", peso: "40%", clientes: 89 },
    { fator: "Redução em frequência", peso: "25%", clientes: 45 },
    { fator: "Ticket médio caiu", peso: "20%", clientes: 32 },
    { fator: "Não abriu emails", peso: "15%", clientes: 28 }
  ];

  const acoesCampanhas = [
    {
      nome: "Cupom 20% - Urgente",
      segmento: "Risco 90%+",
      clientes: 45,
      roi: "3.2x",
      status: "Ativa"
    },
    {
      nome: "Email Exclusivo",
      segmento: "Risco 80-89%",
      clientes: 67,
      roi: "2.1x",
      status: "Ativa"
    },
    {
      nome: "Frete Grátis",
      segmento: "Risco 70-79%",
      clientes: 89,
      roi: "1.8x",
      status: "Agendada"
    },
    {
      nome: "Programa VIP",
      segmento: "Risco 60-69%",
      clientes: 112,
      roi: "2.5x",
      status: "Agendada"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {metricas.map((metrica, idx) => (
          <Card key={idx} className="border-slate-200/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">{metrica.titulo}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${metrica.cor}`}>{metrica.valor}</div>
              <p className="text-xs text-slate-500 mt-1">{metrica.descricao}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Clientes em Risco */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Top 5 Clientes em Risco Imediato
          </CardTitle>
          <CardDescription>Próximos 30 dias - Ação recomendada agora</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {clientesEmRisco.map((cliente) => (
              <div key={cliente.id} className="border border-red-200/50 rounded-lg p-4 bg-red-50/30 hover:bg-red-50/50 transition">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-slate-900">{cliente.nome}</h4>
                    <p className="text-xs text-slate-500">{cliente.email}</p>
                  </div>
                  <Badge className="bg-red-100 text-red-700 text-lg px-3 py-1">
                    {cliente.risco}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Sem Compra</p>
                    <p className="font-bold text-slate-900">{cliente.diasSemCompra} dias</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Última Compra</p>
                    <p className="font-bold text-slate-900">{cliente.ultimaCompra}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">LTV</p>
                    <p className="font-bold text-slate-900">{cliente.ltv}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Ação</p>
                    <p className="font-bold text-blue-600">{cliente.acao}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Impacto</p>
                    <p className="font-bold text-green-600">{cliente.impacto}</p>
                  </div>
                  <div className="flex items-end">
                    <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 flex items-center gap-1 w-full justify-center">
                      <Send className="w-3 h-3" />
                      Enviar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fatores de Risco */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-orange-600" />
            Fatores de Risco
          </CardTitle>
          <CardDescription>O que mais contribui para churn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {fatoresRisco.map((fator, idx) => (
              <div key={idx} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-slate-900">{fator.fator}</p>
                    <span className="text-sm font-bold text-slate-600">{fator.peso}</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                      style={{ width: fator.peso }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{fator.clientes} clientes</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Campanhas de Retenção */}
      <Card className="border-slate-200/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Campanhas de Retenção Automáticas
          </CardTitle>
          <CardDescription>Ações automáticas por nível de risco</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {acoesCampanhas.map((campanha, idx) => (
              <div key={idx} className="border border-slate-200/50 rounded-lg p-4 hover:bg-slate-50/50 transition">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-slate-900">{campanha.nome}</h4>
                    <p className="text-xs text-slate-500">{campanha.segmento}</p>
                  </div>
                  <Badge variant={campanha.status === "Ativa" ? "default" : "secondary"}>
                    {campanha.status}
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500 text-xs">Clientes</p>
                    <p className="font-bold text-slate-900">{campanha.clientes}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">ROI</p>
                    <p className="font-bold text-green-600">{campanha.roi}</p>
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs">Impacto Esperado</p>
                    <p className="font-bold text-blue-600">R$ {Math.round(campanha.clientes * 125)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Timeline de Previsão */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-600" />
            Timeline de Previsão
          </CardTitle>
          <CardDescription>Quando os clientes devem fazer churn</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { dias: "0-7 dias", clientes: 45, risco: "Crítico", acao: "Cupom 20% + Urgente" },
              { dias: "7-14 dias", clientes: 67, risco: "Alto", acao: "Email exclusivo" },
              { dias: "14-21 dias", clientes: 89, risco: "Médio", acao: "Frete grátis" },
              { dias: "21-30 dias", clientes: 112, risco: "Baixo", acao: "Programa VIP" }
            ].map((timeline, idx) => (
              <div key={idx} className="flex items-start gap-4">
                <div className="bg-white rounded-full w-10 h-10 flex items-center justify-center flex-shrink-0 font-bold text-blue-600 border-2 border-blue-200">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-slate-900">{timeline.dias}</h4>
                    <Badge variant={timeline.risco === "Crítico" ? "destructive" : "secondary"}>
                      {timeline.risco}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{timeline.clientes} clientes | {timeline.acao}</p>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full"
                      style={{ width: `${(timeline.clientes / 112) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Benefícios */}
      <Card className="border-slate-200/50 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardHeader>
          <CardTitle className="text-slate-900">✅ Impacto da Previsão de Churn</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Recuperar R$ 212K em LTV</p>
              <p className="text-slate-600">68% de taxa de recuperação com ações preventivas</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Reduzir churn em 50%</p>
              <p className="text-slate-600">Agir 30 dias antes vs. depois que cliente saiu</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">ROI médio 2.4x</p>
              <p className="text-slate-600">Cada R$ 1 gasto em retenção retorna R$ 2,40</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Automação 24/7</p>
              <p className="text-slate-600">Campanhas disparam automaticamente por nível de risco</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
