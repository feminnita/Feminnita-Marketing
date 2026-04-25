import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Heart, Eye, MessageCircle, TrendingUp, Users, Instagram, Link, AlertCircle, ExternalLink, Film, Image, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";


// ─── Componente de Diagnóstico ────────────────────────────────────────────────

function DiagnosticPanel() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/instagram/diagnostic");
      const json = await res.json();
      setData(json);
      setExpanded(true);
    } catch (e: any) {
      setData({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => { if (!data) run(); else setExpanded(!expanded); }}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 hover:bg-slate-100 transition-colors text-sm font-medium text-slate-700"
      >
        <span className="flex items-center gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertCircle className="w-4 h-4 text-slate-500" />}
          Diagnóstico de conexão
        </span>
        {data && (expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />)}
      </button>

      {expanded && data && !data.error && (
        <div className="px-4 py-3 space-y-3 text-xs">
          {/* Env vars */}
          <div>
            <p className="font-semibold text-slate-700 mb-1.5">Variáveis de ambiente (.env)</p>
            <div className="space-y-1">
              {Object.entries(data.env || {}).map(([k, v]: [string, any]) => (
                <div key={k} className="flex gap-2">
                  <span className="font-mono text-slate-500 w-48 shrink-0">{k}:</span>
                  <span className={String(v).startsWith("❌") ? "text-red-700 font-medium" : "text-green-700"}>{String(v)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* API results */}
          {data.api && (
            <div>
              <p className="font-semibold text-slate-700 mb-1.5">Resultados da API Meta</p>
              <div className="space-y-2">
                {Object.entries(data.api).map(([k, v]: [string, any]) => (
                  <div key={k}>
                    <p className="font-mono text-slate-500 mb-0.5">{k}:</p>
                    <pre className="bg-slate-50 border border-slate-200 rounded p-2 overflow-x-auto text-[10px] text-slate-700">
                      {typeof v === "string" ? v : JSON.stringify(v, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diagnóstico */}
          {data.diagnostico?.causa?.length > 0 && (
            <div>
              <p className="font-semibold text-red-700 mb-1.5">Causas identificadas</p>
              <ul className="space-y-1">
                {data.diagnostico.causa.map((c: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5 text-red-700">
                    <XCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {c}
                  </li>
                ))}
              </ul>
              <p className="font-semibold text-green-700 mt-2 mb-1.5">Soluções</p>
              <ul className="space-y-1">
                {data.diagnostico.solucao.map((s: string, i: number) => (
                  <li key={i} className="flex items-start gap-1.5 text-green-800">
                    <CheckCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Analytics() {
  const { user } = useAuth();
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month" | "year">("month");
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectToken, setConnectToken] = useState("");
  const [connectIgId, setConnectIgId] = useState("");
  const [autoConnecting, setAutoConnecting] = useState(false);

  // Detectar retorno do OAuth do Instagram
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const igStatus = params.get("instagram");
    if (igStatus === "connected") {
      toast.success("Instagram conectado com sucesso!");
      accountsQuery.refetch();
      window.history.replaceState({}, "", "/analytics");
    } else if (igStatus === "error") {
      const msg = params.get("msg") || "Erro desconhecido";
      toast.error(`Erro ao conectar Instagram: ${msg}`);
      window.history.replaceState({}, "", "/analytics");
    }
  }, []);

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

  // Auto-selecionar a primeira conta quando carregar
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      setSelectedAccountId(accounts[0].id.toString());
    }
  }, [accounts, selectedAccountId]);

  // Performance metrics from influencer_performance table
  const performanceQuery = trpc.autonomousInfluencers.getPerformanceMetrics.useQuery(
    { influencerId: influencerId!, days: 30 },
    { enabled: !!influencerId }
  );

  // Posts reais do Instagram via REST endpoint direto (bypass tRPC cache issue)
  const [igPostsData, setIgPostsData] = useState<{ posts: any[]; error: string | null; profile?: any } | null>(null);
  const [igPostsLoading, setIgPostsLoading] = useState(false);
  useEffect(() => {
    if (!selectedAccountId) return;
    setIgPostsLoading(true);
    fetch(`/api/instagram/posts-data?accountId=${selectedAccountId}&limit=24`, { credentials: "include" })
      .then(r => r.json())
      .then(d => { setIgPostsData(d); setIgPostsLoading(false); })
      .catch(e => { setIgPostsData({ posts: [], error: e.message }); setIgPostsLoading(false); });
  }, [selectedAccountId]);
  // Compatibilidade com código existente que usa instagramPostsQuery
  const instagramPostsQuery = {
    isLoading: igPostsLoading,
    data: igPostsData,
  };

  // Mutation para sincronizar métricas
  const syncMetricsMutation = trpc.metaGraphIntegration.syncAllPostMetrics.useMutation({
    onSuccess: (data) => {
      toast.success(`Métricas sincronizadas: ${(data as any)?.synced ?? 0} posts atualizados`);
      accountInsightsQuery.refetch();
      performanceQuery.refetch();
    },
    onError: (err) => {
      toast.error(`Erro ao sincronizar: ${err.message}`);
    },
  });

  const [connectError, setConnectError] = useState<string>("");

  // Mutation para conectar automaticamente via token do servidor
  const autoConnectMutation = trpc.instagramAccounts.autoConnectFeminnita.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setAutoConnecting(false);
      setConnectError("");
      accountsQuery.refetch();
    },
    onError: (err) => {
      setAutoConnecting(false);
      setConnectError(err.message);
      setShowConnectModal(true);
    },
  });

  // Mutation para conectar conta Instagram
  const connectMutation = trpc.instagramAccounts.connectFeminnita.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowConnectModal(false);
      setConnectToken("");
      setConnectIgId("");
      accountsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  // Mutation para conectar diretamente pelo ID (sem validação API)
  const forceConnectMutation = trpc.instagramAccounts.forceConnectFeminnita.useMutation({
    onSuccess: (data) => {
      toast.success(data.message);
      setShowConnectModal(false);
      setConnectToken("");
      setConnectIgId("");
      accountsQuery.refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const insights = accountInsightsQuery.data;
  const perfMetrics = performanceQuery.data?.metrics;

  // Dados dia a dia: prioriza performance histórica do DB, fallback para insights da API
  const rawData = (perfMetrics?.data ?? []).slice(0, 14).reverse();
  const apiDailyData: any[] = (insights as any)?.insightsByDay ?? [];

  const engagementData = rawData.length > 0
    ? rawData.map((m: any) => ({
        date: String(m.date).slice(5),
        engajamento: m.totalEngagement ?? 0,
        taxa: parseFloat(m.engagementRate ?? "0"),
      }))
    : apiDailyData.map((d: any) => ({
        date: d.date,
        engajamento: (d.impressions || 0) + (d.reach || 0),
        taxa: 0,
      }));

  const reachData = rawData.length > 0
    ? rawData.map((m: any) => ({
        date: String(m.date).slice(5),
        alcance: m.totalReach ?? 0,
        impressoes: m.totalImpressions ?? 0,
      }))
    : apiDailyData.map((d: any) => ({
        date: d.date,
        alcance: d.reach ?? 0,
        impressoes: d.impressions ?? 0,
      }));

  const accountPerformanceData = accounts.map((acc: any) => ({
    name: acc.username,
    followers: acc.followers || 0,
    posts: acc.postsCount || 0,
  }));

  return (
    <div className="space-y-8">
      {/* Modal conectar Instagram */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shrink-0">
                  <Instagram className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-900">Conectar Instagram da Feminnita</h2>
                  <p className="text-sm text-slate-500">Escolha uma das opções abaixo</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowConnectModal(false)}>✕</Button>
            </div>

            {connectError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs text-red-800 whitespace-pre-wrap">{connectError}</div>
                </div>
              </div>
            )}

            <div className="space-y-4">

              {/* ── Opção A: Instagram Login OAuth ── */}
              <div className="border border-purple-200 rounded-xl p-4 bg-purple-50">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded">A</span>
                  <p className="font-semibold text-slate-800 text-sm">Login direto pelo Instagram</p>
                  <span className="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">Recomendado</span>
                </div>
                <p className="text-xs text-slate-600 mb-3">
                  Requer <code className="bg-white px-1 rounded">META_APP_ID</code> e <code className="bg-white px-1 rounded">META_APP_SECRET</code> no <code className="bg-white px-1 rounded">.env</code> do servidor.
                  Se ainda não configurou, veja o passo 1 abaixo.
                </p>
                <a
                  href="/api/instagram/start"
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-all text-sm"
                >
                  <Instagram className="w-4 h-4" />
                  Entrar com Instagram (@feminnita)
                </a>
              </div>

              {/* ── Opção B: Token manual do Graph Explorer ── */}
              <div className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-slate-600 text-white text-xs font-bold px-2 py-0.5 rounded">B</span>
                  <p className="font-semibold text-slate-800 text-sm">Token manual (Graph API Explorer)</p>
                </div>
                <details className="text-xs text-slate-600 mb-3 cursor-pointer">
                  <summary className="font-medium text-blue-700 hover:underline">Ver passo a passo →</summary>
                  <ol className="list-decimal list-inside space-y-1.5 mt-2 pl-1">
                    <li>Acesse <strong>developers.facebook.com/tools/explorer</strong></li>
                    <li>Selecione seu app <strong>Feminnita Marketing</strong></li>
                    <li>Clique em <strong>"Gerar Token de Acesso"</strong></li>
                    <li>Marque <strong>todas</strong> estas permissões:
                      <div className="mt-1 flex flex-wrap gap-1">
                        {["instagram_basic","instagram_manage_insights","pages_show_list","pages_read_engagement","business_management"].map(p => (
                          <code key={p} className="bg-slate-100 px-1 rounded text-[10px]">{p}</code>
                        ))}
                      </div>
                    </li>
                    <li>Copie o token gerado e cole abaixo</li>
                    <li className="text-amber-700"><strong>Se aparecer "instagram_business_account não encontrado":</strong> a conta @feminnita precisa estar vinculada à Página do Facebook como conta Business (veja Opção C)</li>
                  </ol>
                </details>
                <textarea
                  value={connectToken}
                  onChange={(e) => setConnectToken(e.target.value)}
                  placeholder="Cole o token aqui (começa com EAA...)"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono resize-none focus:outline-none focus:ring-2 focus:ring-pink-300 mb-2"
                  rows={2}
                />
                <Button
                  onClick={() => connectMutation.mutate({ pageAccessToken: connectToken })}
                  disabled={!connectToken.trim() || connectMutation.isPending}
                  className="w-full bg-slate-700 hover:bg-slate-800 text-white text-sm"
                >
                  {connectMutation.isPending ? "Conectando..." : "Conectar com token"}
                </Button>
              </div>

              {/* ── Opção C: Force connect com ID direto ── */}
              <div className="border border-slate-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="bg-slate-600 text-white text-xs font-bold px-2 py-0.5 rounded">C</span>
                  <p className="font-semibold text-slate-800 text-sm">Bypass — informar ID diretamente</p>
                  <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">Avançado</span>
                </div>
                <details className="text-xs text-slate-600 mb-3 cursor-pointer">
                  <summary className="font-medium text-blue-700 hover:underline">Como encontrar o ID da conta Instagram →</summary>
                  <ol className="list-decimal list-inside space-y-1.5 mt-2 pl-1">
                    <li>Acesse <strong>developers.facebook.com/tools/explorer</strong></li>
                    <li>Gere um token com <code>pages_show_list</code> + <code>instagram_basic</code></li>
                    <li>Execute: <code className="bg-slate-100 px-1 rounded">GET /me/accounts?fields=name,instagram_business_account</code></li>
                    <li>Se não aparecer <code>instagram_business_account</code>: <span className="text-amber-700 font-medium">vincule o Instagram à Página primeiro</span></li>
                    <li>Para vincular: <strong>Configurações da Página do Facebook → Instagram → Conectar conta</strong> → faça login com @feminnita</li>
                    <li>OU: tente <code className="bg-slate-100 px-1 rounded">GET /105625695870914?fields=instagram_business_account,connected_instagram_account</code></li>
                    <li>Copie o ID da conta Instagram (número longo, ex: 17841459735732076)</li>
                  </ol>
                </details>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={connectIgId}
                    onChange={(e) => setConnectIgId(e.target.value)}
                    placeholder="ID da conta IG (ex: 17841459735732076)"
                    className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-pink-300"
                  />
                </div>
                <input
                  type="text"
                  value={connectToken}
                  onChange={(e) => setConnectToken(e.target.value)}
                  placeholder="Token (opcional mas recomendado para ler dados)"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-pink-300 mb-2"
                />
                <Button
                  onClick={() => forceConnectMutation.mutate({
                    instagramId: connectIgId.trim(),
                    username: "feminnita",
                    ...(connectToken.trim() ? { accessToken: connectToken.trim() } : {}),
                  })}
                  disabled={!connectIgId.trim() || forceConnectMutation.isPending}
                  variant="outline"
                  className="w-full text-sm"
                >
                  {forceConnectMutation.isPending ? "Conectando..." : "Conectar pelo ID"}
                </Button>
              </div>

              {/* ── Diagnóstico ── */}
              <DiagnosticPanel />

            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Analytics de Posts</h1>
          <p className="text-slate-600 mt-2">Acompanhe o desempenho dos seus posts em tempo real</p>
        </div>
        <div className="flex gap-2">
          {accounts.length === 0 ? (
            <Button
              onClick={() => { setAutoConnecting(true); autoConnectMutation.mutate(); }}
              disabled={autoConnecting}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2"
            >
              <Link className="w-4 h-4" />
              {autoConnecting ? "Conectando..." : "Conectar Instagram"}
            </Button>
          ) : (
            <>
              <Button
                onClick={() => syncMetricsMutation.mutate({ accountId: parseInt(selectedAccountId) })}
                disabled={!selectedAccountId || syncMetricsMutation.isPending}
                variant="outline"
              >
                {syncMetricsMutation.isPending ? "Sincronizando..." : "Sincronizar Métricas"}
              </Button>
              <Button
                onClick={() => { setConnectError(""); setShowConnectModal(true); }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2"
              >
                <Link className="w-4 h-4" />
                Reconectar Instagram
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Banner quando não há contas */}
      {accounts.length === 0 && !accountsQuery.isLoading && (
        <div className="border-2 border-dashed border-pink-200 rounded-2xl p-10 text-center bg-pink-50">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4">
            <Instagram className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Instagram não conectado</h3>
          <p className="text-slate-500 text-sm mb-4 max-w-md mx-auto">
            Conecte a conta Instagram da Feminnita para ver alcance, curtidas, comentários e engajamento dos posts.
          </p>
          <Button
            onClick={() => { setAutoConnecting(true); autoConnectMutation.mutate(); }}
            disabled={autoConnecting}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white gap-2"
          >
            <Link className="w-4 h-4" />
            {autoConnecting ? "Conectando..." : "Conectar Instagram Agora"}
          </Button>
        </div>
      )}

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

      {/* Aviso de erro de API */}
      {insights && (insights as any).apiError && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900">Exibindo dados salvos — Instagram API indisponível</p>
            <p className="text-xs text-amber-700 mt-0.5">{(insights as any).apiError}</p>
            <p className="text-xs text-amber-700 mt-1">
              Para resolver: no Facebook, acesse <strong>Configurações da Página → Instagram → Conectar conta</strong> e vincule @feminnita à página diretamente. Depois clique em <strong>Reconectar Instagram</strong> com um novo token.
            </p>
          </div>
        </div>
      )}

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
              {influencerId ? "Engajamento total por dia (últimos 30 dias)" : "Últimos 7 dias"}
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
              {influencerId ? "Dados reais de alcance e impressões" : "Últimos 7 dias"}
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
                : "Últimos 7 dias"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-2xl font-bold">{(perfMetrics?.currentFollowers ?? insights?.followers ?? 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Seguidores Atuais</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {(insights?.reach ?? (perfMetrics as any)?.totalReach ?? 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Alcance (7 dias)</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">{(insights?.impressions ?? 0).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Impressões (7 dias)</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg text-center">
                <p className="text-2xl font-bold">{(perfMetrics?.totalEngagement ?? apiDailyData.reduce((s: number, d: any) => s + (d.impressions || 0), 0)).toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Engajamento Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts do Instagram */}
      {selectedAccountId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Instagram className="w-5 h-5 text-pink-500" />
              Posts do Instagram
            </CardTitle>
            <CardDescription>
              {instagramPostsQuery.isLoading
                ? "Carregando posts..."
                : instagramPostsQuery.data?.error
                ? `Erro: ${instagramPostsQuery.data.error}`
                : `${instagramPostsQuery.data?.posts?.length ?? 0} posts mais recentes`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {instagramPostsQuery.data?.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium mb-1">Não foi possível carregar os posts</p>
                  <p className="text-xs">{instagramPostsQuery.data.error}</p>
                  <p className="text-xs mt-2">O token pode precisar de permissão <code>instagram_basic</code>. Reconecte a conta com um novo token.</p>
                </div>
              </div>
            )}

            {instagramPostsQuery.isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="aspect-square bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            )}

            {!instagramPostsQuery.isLoading && (instagramPostsQuery.data?.posts?.length ?? 0) > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {(instagramPostsQuery.data?.posts ?? []).map((post: any) => (
                  <a
                    key={post.id}
                    href={post.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative aspect-square rounded-xl overflow-hidden bg-slate-100 block"
                  >
                    {post.mediaUrl ? (
                      <img
                        src={post.mediaUrl}
                        alt={post.caption || "Post"}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        {post.mediaType === "VIDEO" ? (
                          <Film className="w-8 h-8 text-slate-400" />
                        ) : (
                          <Image className="w-8 h-8 text-slate-400" />
                        )}
                      </div>
                    )}

                    {/* Overlay com métricas */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="text-white text-center">
                        <div className="flex items-center justify-center gap-3 text-sm font-semibold">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3.5 h-3.5" /> {post.likes.toLocaleString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3.5 h-3.5" /> {post.comments.toLocaleString()}
                          </span>
                        </div>
                        <div className="mt-1">
                          <ExternalLink className="w-3 h-3 mx-auto opacity-70" />
                        </div>
                      </div>
                    </div>

                    {/* Badge tipo de mídia */}
                    {post.mediaType === "VIDEO" && (
                      <div className="absolute top-1.5 right-1.5 bg-black/60 rounded-md px-1 py-0.5">
                        <Film className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {post.mediaType === "CAROUSEL_ALBUM" && (
                      <div className="absolute top-1.5 right-1.5 bg-black/60 rounded-md px-1 py-0.5">
                        <span className="text-white text-[10px] font-bold">+</span>
                      </div>
                    )}
                  </a>
                ))}
              </div>
            )}

            {!instagramPostsQuery.isLoading && !instagramPostsQuery.data?.error && (instagramPostsQuery.data?.posts?.length ?? 0) === 0 && (
              <div className="text-center py-10 text-slate-400">
                <Instagram className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Nenhum post encontrado nesta conta</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
