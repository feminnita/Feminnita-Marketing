import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Heart, Eye, MessageCircle, Share2, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";


export default function Analytics() {
  const { user } = useAuth();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");

  // Queries
  const accountsQuery = trpc.instagramAccounts.listAccounts.useQuery();
  const accountInsightsQuery = trpc.metaGraphIntegration.getAccountInsights.useQuery(
    { accountId: parseInt(selectedAccountId) },
    { enabled: !!selectedAccountId }
  );

  // Get influencerId from selected account
  const accounts = accountsQuery.data || [];
  const selectedAccount = accounts.find((a: any) => a.id.toString() === selectedAccountId);
  const influencerId = selectedAccount?.influencerId ?? null;

  // Performance metrics from influencer_performance table
  const performanceQuery = trpc.autonomousInfluencers.getPerformanceMetrics.useQuery(
    { influencerId: influencerId!, days: 30 },
    { enabled: !!influencerId }
  );

  // Mutation para sincronizar métricas
  const syncMetricsMutation = trpc.metaGraphIntegration.syncAllPostMetrics.useMutation({
    onSuccess: () => {
      accountInsightsQuery.refetch();
      performanceQuery.refetch();
    },
  });

  const insights = accountInsightsQuery.data;
  const perfMetrics = performanceQuery.data?.metrics;

  // Build chart data from real performance rows
  const rawData = (perfMetrics?.data ?? []).slice(0, 14).reverse();

  const engagementData = rawData.map((m: any) => ({
    date: String(m.date).slice(5), // MM-DD
    engajamento: m.totalEngagement ?? 0,
    taxa: parseFloat(m.engagementRate ?? "0"),
  }));

  const reachData = rawData.map((m: any) => ({
    date: String(m.date).slice(5),
    alcance: m.totalReach ?? 0,
    impressoes: m.totalImpressions ?? 0,
  }));

  const accountPerformanceData = accounts.map((acc: any) => ({
    name: acc.username,
    followers: acc.followers || 0,
    posts: acc.postsCount || 0,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics de Posts</h1>
          <p className="text-slate-600 mt-2">Acompanhe o desempenho dos seus posts em tempo real</p>
        </div>
        <Button
          onClick={() => syncMetricsMutation.mutate({ accountId: parseInt(selectedAccountId) })}
          disabled={!selectedAccountId || syncMetricsMutation.isPending}
          variant="outline"
        >
          {syncMetricsMutation.isPending ? "Sincronizando..." : "Sincronizar Métricas"}
        </Button>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Selecione uma conta" />
          </SelectTrigger>
          <SelectContent>
            {accounts.map((account: any) => (
              <SelectItem key={account.id} value={account.id.toString()}>
                @{account.username}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedPeriod} onValueChange={(v) => setSelectedPeriod(v as any)}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Última Semana</SelectItem>
            <SelectItem value="month">Último Mês</SelectItem>
            <SelectItem value="year">Último Ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs */}
      {insights && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Seguidores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{insights.followers?.toLocaleString()}</div>
                <Users className="w-8 h-8 text-pink-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Alcance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{insights.reach?.toLocaleString()}</div>
                <Eye className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Impressões</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{insights.impressions?.toLocaleString()}</div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-slate-600">Visualizações de Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold">{insights.profileViews?.toLocaleString()}</div>
                <Eye className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Engajamento */}
        <Card>
          <CardHeader>
            <CardTitle>Engajamento</CardTitle>
            <CardDescription>
              {influencerId ? "Engajamento total por dia (últimos 30 dias)" : "Selecione uma conta para ver dados reais"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="engajamento" stroke="#A63D4A" strokeWidth={2} name="Engajamento" />
                <Line type="monotone" dataKey="taxa" stroke="#E8B4B8" strokeWidth={2} name="Taxa (%)" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alcance e Impressões */}
        <Card>
          <CardHeader>
            <CardTitle>Alcance vs Impressões</CardTitle>
            <CardDescription>
              {influencerId ? "Dados reais de alcance e impressões" : "Selecione uma conta para ver dados reais"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reachData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="alcance" fill="#A63D4A" name="Alcance" />
                <Bar dataKey="impressoes" fill="#E8B4B8" name="Impressões" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance por Conta */}
        <Card>
          <CardHeader>
            <CardTitle>Performance por Conta</CardTitle>
            <CardDescription>Seguidores e posts por influencer</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={accountPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="followers" fill="#A63D4A" />
                <Bar dataKey="posts" fill="#E8B4B8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Métricas de Seguidores */}
        <Card>
          <CardHeader>
            <CardTitle>Crescimento de Seguidores</CardTitle>
            <CardDescription>
              {influencerId
                ? `Atual: ${(perfMetrics?.currentFollowers ?? 0).toLocaleString()} · Crescimento: ${perfMetrics?.followerGrowth ?? 0}`
                : "Selecione uma conta para ver dados reais"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-2xl font-bold">{(perfMetrics?.currentFollowers ?? 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Seguidores Atuais</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className={`text-2xl font-bold ${(perfMetrics?.followerGrowth ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {(perfMetrics?.followerGrowth ?? 0) >= 0 ? "+" : ""}{(perfMetrics?.followerGrowth ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Crescimento (30d)</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-2xl font-bold">{perfMetrics?.avgEngagementRate ?? "0"}%</p>
                <p className="text-xs text-muted-foreground mt-1">Taxa de Engajamento</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-2xl font-bold">{(perfMetrics?.totalEngagement ?? 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Engajamento Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
