import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, ShoppingCart, Users, DollarSign, Zap, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function MetricasPerformanceRealtimeSection() {
  const { data: campaigns = [], dataUpdatedAt } = trpc.campaigns.listar.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  const ativas = campaigns.filter((c: any) => c.status === "ativa");
  const todas = campaigns as any[];

  const totalOrcamento = ativas.reduce((s: number, c: any) => s + parseFloat(c.orcamento ?? "0"), 0);
  const totalConversoes = ativas.reduce((s: number, c: any) => s + (c.performance?.conversoes ?? 0), 0);
  const totalImpressoes = ativas.reduce((s: number, c: any) => s + (c.performance?.impressoes ?? 0), 0);
  const totalCliques = ativas.reduce((s: number, c: any) => s + (c.performance?.cliques ?? 0), 0);

  const taxaConversao = totalCliques > 0
    ? parseFloat(((totalConversoes / totalCliques) * 100).toFixed(1))
    : 0;

  const ticketMedio = totalConversoes > 0
    ? parseFloat((totalOrcamento / totalConversoes).toFixed(2))
    : 0;

  const ultimaAtualizacao = dataUpdatedAt
    ? new Date(dataUpdatedAt).toLocaleTimeString("pt-BR")
    : "—";

  // Canal breakdown: group active campaigns by platform
  const porPlataforma: Record<string, { orcamento: number; cliques: number; conversoes: number }> = {};
  for (const c of ativas) {
    const p = c.plataforma ?? "outro";
    if (!porPlataforma[p]) porPlataforma[p] = { orcamento: 0, cliques: 0, conversoes: 0 };
    porPlataforma[p].orcamento += Number(c.orcamento) || 0;
    porPlataforma[p].cliques += c.performance?.cliques ?? 0;
    porPlataforma[p].conversoes += c.performance?.conversoes ?? 0;
  }

  const MetricaCard = ({ titulo, valor, unidade, icon: Icon, trend }: {
    titulo: string; valor: string; unidade?: string; icon: any; trend?: "up" | "down" | "neutral";
  }) => (
    <Card className="border-amber-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-slate-600">{titulo}</CardTitle>
          <div className="p-2 bg-amber-100 rounded-lg">
            <Icon className="w-4 h-4 text-amber-700" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-slate-900">
          {valor}
          {unidade && <span className="text-lg text-slate-500 ml-1">{unidade}</span>}
        </div>
        {trend && (
          <div className="flex items-center gap-1 mt-2">
            {trend === "up" ? (
              <TrendingUp className="w-4 h-4 text-green-600" />
            ) : trend === "down" ? (
              <TrendingDown className="w-4 h-4 text-red-600" />
            ) : null}
            <span className="text-xs text-slate-500">
              {ativas.length} campanha{ativas.length !== 1 ? "s" : ""} ativa{ativas.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Métricas em Tempo Real</h2>
          <p className="text-sm text-slate-600 mt-1">Campanhas ativas · atualiza a cada 60s</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse" />
          <span className="text-sm text-slate-600 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" />
            {ultimaAtualizacao}
          </span>
        </div>
      </div>

      {ativas.length === 0 ? (
        <Card className="border-amber-200">
          <CardContent className="py-12 text-center text-slate-500">
            Nenhuma campanha ativa. Crie uma campanha na seção Campanhas para ver métricas aqui.
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <MetricaCard
              titulo="Orçamento Total"
              valor={`R$ ${totalOrcamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={ShoppingCart}
              trend="up"
            />
            <MetricaCard
              titulo="Taxa de Conversão"
              valor={taxaConversao.toString()}
              unidade="%"
              icon={Zap}
              trend={taxaConversao > 0 ? "up" : "neutral"}
            />
            <MetricaCard
              titulo="Ticket Médio"
              valor={`R$ ${ticketMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
              icon={DollarSign}
              trend={ticketMedio > 0 ? "up" : "neutral"}
            />
            <MetricaCard
              titulo="Total Conversões"
              valor={totalConversoes.toString()}
              icon={Users}
              trend={totalConversoes > 0 ? "up" : "neutral"}
            />
          </div>

          {Object.keys(porPlataforma).length > 0 && (
            <Card className="border-amber-200">
              <CardHeader>
                <CardTitle>Performance por Canal</CardTitle>
                <CardDescription>Orçamento e conversões por plataforma (campanhas ativas)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(porPlataforma)
                    .sort(([, a], [, b]) => b.orcamento - a.orcamento)
                    .map(([canal, data]) => (
                      <div key={canal} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div>
                          <p className="font-semibold text-slate-900 capitalize">{canal}</p>
                          <p className="text-sm text-slate-600">
                            R$ {data.orcamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-900">
                            {data.conversoes} conversões
                          </div>
                          <div className="text-xs text-slate-500">
                            {data.cliques} cliques
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
