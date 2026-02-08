import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Heart, Eye, MessageCircle, Share2, TrendingUp, Users } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";

const COLORS = ["#A63D4A", "#E8B4B8", "#F5D5D8", "#FFE8EB"];

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

  // Mutation para sincronizar métricas
  const syncMetricsMutation = trpc.metaGraphIntegration.syncAllPostMetrics.useMutation({
    onSuccess: () => {
      accountInsightsQuery.refetch();
    },
  });

  const accounts = accountsQuery.data || [];
  const insights = accountInsightsQuery.data;

  // Dados simulados para gráficos (será substituído por dados reais)
  const engagementData = [
    { date: "01/02", likes: 120, comments: 45, shares: 12 },
    { date: "02/02", likes: 150, comments: 60, shares: 18 },
    { date: "03/02", likes: 180, comments: 75, shares: 25 },
    { date: "04/02", likes: 140, comments: 50, shares: 15 },
    { date: "05/02", likes: 200, comments: 85, shares: 30 },
    { date: "06/02", likes: 220, comments: 95, shares: 35 },
    { date: "07/02", likes: 250, comments: 110, shares: 40 },
  ];

  const reachData = [
    { date: "01/02", reach: 1200, impressions: 1800 },
    { date: "02/02", reach: 1500, impressions: 2100 },
    { date: "03/02", reach: 1800, impressions: 2500 },
    { date: "04/02", reach: 1400, impressions: 2000 },
    { date: "05/02", reach: 2000, impressions: 2800 },
    { date: "06/02", reach: 2200, impressions: 3000 },
    { date: "07/02", reach: 2500, impressions: 3400 },
  ];

  const accountPerformanceData = accounts.map((acc) => ({
    name: acc.username,
    followers: acc.followers || 0,
    posts: acc.postsCount || 0,
  }));

  const contentTypeData = [
    { name: "Imagens", value: 45 },
    { name: "Carrosséis", value: 30 },
    { name: "Reels", value: 25 },
  ];

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
            {accounts.map((account) => (
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
            <CardDescription>Likes, comentários e compartilhamentos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={engagementData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="likes" stroke="#A63D4A" strokeWidth={2} />
                <Line type="monotone" dataKey="comments" stroke="#E8B4B8" strokeWidth={2} />
                <Line type="monotone" dataKey="shares" stroke="#F5D5D8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Alcance e Impressões */}
        <Card>
          <CardHeader>
            <CardTitle>Alcance vs Impressões</CardTitle>
            <CardDescription>Comparativo de alcance e impressões</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reachData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="reach" fill="#A63D4A" />
                <Bar dataKey="impressions" fill="#E8B4B8" />
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

        {/* Tipo de Conteúdo */}
        <Card>
          <CardHeader>
            <CardTitle>Distribuição de Conteúdo</CardTitle>
            <CardDescription>Tipos de posts publicados</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contentTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contentTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recomendações */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">💡 Recomendações</CardTitle>
        </CardHeader>
        <CardContent className="text-amber-800 space-y-2">
          <p>• Seus posts com imagens têm 2.5x mais engajamento que carrosséis</p>
          <p>• Melhor horário para postar: 19:00 - 21:00 (baseado em dados históricos)</p>
          <p>• Hashtags mais efetivas: #pijamas #moda #conforto</p>
          <p>• Considere aumentar frequência de posts para 4-5 por semana</p>
        </CardContent>
      </Card>
    </div>
  );
}
