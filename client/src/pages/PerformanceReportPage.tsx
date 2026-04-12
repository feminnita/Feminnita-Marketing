import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, AlertCircle, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function PerformanceReportPage() {
  const [selectedInfluencer, setSelectedInfluencer] = useState<string | null>(null);

  const { data: stats, isLoading, refetch } = trpc.postApproval.getApprovalStats.useQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const byInfluencer = stats?.byInfluencer ?? {};
  const influencerKeys = Object.keys(byInfluencer);

  // Build per-influencer stats from real data
  const influencerStats = influencerKeys.map((key) => {
    const data = byInfluencer[key] ?? { approved: 0, rejected: 0, pending: 0 };
    const total = data.approved + data.rejected + data.pending;
    const approvalRate = total > 0 ? Math.round((data.approved / total) * 100) : 0;
    return { key, name: key.charAt(0).toUpperCase() + key.slice(1), total, approvalRate, ...data };
  });

  const effectiveSelected = selectedInfluencer ?? influencerKeys[0] ?? null;
  const current = influencerStats.find((i) => i.key === effectiveSelected) ?? influencerStats[0] ?? null;

  // Month-over-month from global stats
  const globalTotal = stats?.totalGenerated ?? 0;
  const globalApprovalRate = stats?.approvalRate ?? 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Relatório de Performance</h1>
            <p className="text-slate-600">Análise de aprovação por influenciadora</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Atualizar
          </Button>
        </div>

        {/* Global summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Gerado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{globalTotal}</div>
              <p className="text-xs text-slate-500 mt-1">todos os posts</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Aprovados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{stats?.totalApproved ?? 0}</div>
              <p className="text-xs text-slate-500 mt-1">
                <CheckCircle2 className="inline w-3 h-3 mr-1" />
                {globalApprovalRate}% taxa global
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Rejeitados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{stats?.totalRejected ?? 0}</div>
              <p className="text-xs text-slate-500 mt-1">
                <XCircle className="inline w-3 h-3 mr-1" />
                posts com falha
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Publicados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{stats?.totalPublished ?? 0}</div>
              <p className="text-xs text-slate-500 mt-1">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                no ar
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Empty state */}
        {influencerStats.length === 0 && (
          <div className="flex items-center gap-2 p-6 bg-slate-50 rounded-xl text-slate-500 text-sm mb-8">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            Nenhum post gerado ainda. Crie posts nas influenciadoras para ver o relatório aqui.
          </div>
        )}

        {/* Influencer selector */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {influencerStats.map((inf) => (
            <Button
              key={inf.key}
              variant={effectiveSelected === inf.key ? "default" : "outline"}
              onClick={() => setSelectedInfluencer(inf.key)}
            >
              {inf.name}
              <Badge variant="secondary" className="ml-2 text-xs">
                {inf.approvalRate}%
              </Badge>
            </Button>
          ))}
        </div>

        {/* Per-influencer detail */}
        {current && <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total Gerado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{current.total}</div>
              <p className="text-xs text-slate-500 mt-1">posts de {current.name}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Aprovados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{current.approved}</div>
              <p className="text-xs text-slate-500 mt-1">
                <CheckCircle2 className="inline w-3 h-3 mr-1" />
                {current.approvalRate}% taxa
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Rejeitados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{current.rejected}</div>
              <p className="text-xs text-slate-500 mt-1">
                <XCircle className="inline w-3 h-3 mr-1" />
                {current.total > 0 ? Math.round((current.rejected / current.total) * 100) : 0}% taxa
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Pendentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">{current.pending}</div>
              <p className="text-xs text-slate-500 mt-1">aguardando aprovação</p>
            </CardContent>
          </Card>
        </div>}

        {current && <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="all">Todas as Influenciadoras</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Posts — {current.name}</CardTitle>
                <CardDescription>Distribuição atual dos posts gerados</CardDescription>
              </CardHeader>
              <CardContent>
                {current.total === 0 ? (
                  <div className="flex items-center gap-2 p-4 bg-slate-50 rounded-lg text-slate-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    Nenhum post gerado ainda para {current.name}.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { label: "Aprovados / Publicados", value: current.approved, color: "bg-green-500", total: current.total },
                      { label: "Rejeitados / Falhos", value: current.rejected, color: "bg-red-500", total: current.total },
                      { label: "Pendentes (rascunho)", value: current.pending, color: "bg-amber-400", total: current.total },
                    ].map((row) => (
                      <div key={row.label} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>{row.label}</span>
                          <Badge variant="secondary">{row.value}</Badge>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`${row.color} h-2 rounded-full transition-all`}
                            style={{ width: `${row.total > 0 ? (row.value / row.total) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Comparativo — Todas as Influenciadoras</CardTitle>
                <CardDescription>Taxa de aprovação por influenciadora</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {influencerStats.map((inf) => (
                    <div key={inf.key} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{inf.name}</span>
                        <span className="text-slate-500">
                          {inf.approved}/{inf.total} posts · {inf.approvalRate}% aprovação
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${inf.approvalRate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>}
      </div>
    </div>
  );
}
