import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { BarChart3, Users, Eye, TrendingDown, Wifi, Settings, Link, Unlink, RefreshCw, ExternalLink, Smartphone, Monitor, Tablet, Target, Globe, Map } from "lucide-react";

function fmt(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function fmtDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

const CHANNEL_COLORS: Record<string, string> = {
  "Organic Search": "bg-green-500",
  "Direct": "bg-blue-500",
  "Organic Social": "bg-pink-500",
  "Referral": "bg-purple-500",
  "Paid Search": "bg-yellow-500",
  "Email": "bg-orange-500",
  "Paid Social": "bg-red-500",
  "Paid Other": "bg-amber-500",
  "Organic Shopping": "bg-teal-500",
  "Unassigned": "bg-zinc-500",
  "Cross-network": "bg-indigo-500",
};

const CHANNEL_PT: Record<string, string> = {
  "Organic Search": "Busca Orgânica",
  "Direct": "Direto",
  "Organic Social": "Social Orgânico",
  "Referral": "Referência",
  "Paid Search": "Busca Paga",
  "Email": "E-mail",
  "Paid Social": "Social Pago",
  "Paid Other": "Outro Pago",
  "Organic Shopping": "Shopping Orgânico",
  "Unassigned": "Não classificado",
  "Cross-network": "Cross-network",
};

export default function GA4Page() {
  const [days, setDays] = useState(30);
  const [propertyInput, setPropertyInput] = useState("");
  const [showPropertyForm, setShowPropertyForm] = useState(false);

  const urlParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const justConnected = urlParams?.get("connected") === "1";
  const connectError = urlParams?.get("error");

  const status = trpc.ga4.status.useQuery(undefined, { refetchOnWindowFocus: false });
  const overview = trpc.ga4.overview.useQuery({ days }, { enabled: !!(status.data?.connected && status.data?.propertyId) });
  const sources = trpc.ga4.trafficSources.useQuery({ days }, { enabled: !!(status.data?.connected && status.data?.propertyId) });
  const pages = trpc.ga4.topPages.useQuery({ days }, { enabled: !!(status.data?.connected && status.data?.propertyId) });
  const realtime = trpc.ga4.realtime.useQuery(undefined, {
    enabled: !!(status.data?.connected && status.data?.propertyId),
    refetchInterval: 30_000,
  });
  const conversions = trpc.ga4.conversions.useQuery({ days }, { enabled: !!(status.data?.connected && status.data?.propertyId) });
  const utmCampaigns = trpc.ga4.utmCampaigns.useQuery({ days }, { enabled: !!(status.data?.connected && status.data?.propertyId) });
  const devices = trpc.ga4.devices.useQuery({ days }, { enabled: !!(status.data?.connected && status.data?.propertyId) });
  const geo = trpc.ga4.geo.useQuery({ days }, { enabled: !!(status.data?.connected && status.data?.propertyId) });

  const setPropertyId = trpc.ga4.setPropertyId.useMutation({
    onSuccess: () => {
      setShowPropertyForm(false);
      status.refetch();
    },
  });
  const disconnect = trpc.ga4.disconnect.useMutation({
    onSuccess: () => status.refetch(),
  });

  useEffect(() => {
    if (status.data?.propertyId) {
      setPropertyInput(status.data.propertyId);
    }
  }, [status.data?.propertyId]);

  useEffect(() => {
    if (justConnected || connectError) {
      const url = new URL(window.location.href);
      url.searchParams.delete("connected");
      url.searchParams.delete("error");
      window.history.replaceState({}, "", url.toString());
    }
  }, [justConnected, connectError]);

  const connected = status.data?.connected && status.data?.propertyId;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Google Analytics 4</h1>
              <p className="text-sm text-zinc-400">Tráfego e comportamento do site</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {connected && (
              <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5">
                <Wifi className="w-3.5 h-3.5 text-green-400" />
                <span className="text-xs text-green-400 font-medium">Conectado</span>
              </div>
            )}
            {status.data?.connected && !status.data?.propertyId && (
              <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-1.5">
                <Settings className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs text-yellow-400 font-medium">Property ID pendente</span>
              </div>
            )}
            {!status.data?.connected && (
              <a
                href="/api/ga4/start"
                className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Link className="w-4 h-4" />
                Conectar GA4
              </a>
            )}
            {status.data?.connected && (
              <button
                onClick={() => disconnect.mutate()}
                disabled={disconnect.isPending}
                className="flex items-center gap-2 text-sm text-zinc-400 hover:text-red-400 transition-colors"
              >
                <Unlink className="w-4 h-4" />
                Desconectar
              </button>
            )}
          </div>
        </div>

        {/* Error/Success banners */}
        {justConnected && !status.data?.propertyId && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-green-400 text-sm">
            GA4 conectado com sucesso! Agora configure o Property ID abaixo para começar a ver os dados.
          </div>
        )}
        {connectError && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
            Erro ao conectar: <strong>{connectError}</strong>. Tente novamente.
          </div>
        )}

        {/* Property ID config */}
        {status.data?.connected && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Property ID</p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {status.data.propertyId
                    ? `Propriedade: ${status.data.propertyId}`
                    : "Nenhum property configurado"}
                </p>
              </div>
              <button
                onClick={() => setShowPropertyForm(v => !v)}
                className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" />
                {status.data.propertyId ? "Alterar" : "Configurar"}
              </button>
            </div>
            {showPropertyForm && (
              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={propertyInput}
                  onChange={e => setPropertyInput(e.target.value)}
                  placeholder="ex: 523875765"
                  className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
                <button
                  onClick={() => setPropertyId.mutate({ propertyId: propertyInput })}
                  disabled={!propertyInput || setPropertyId.isPending}
                  className="bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  Salvar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Not connected state */}
        {!status.data?.connected && !status.isLoading && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-orange-500/60" />
            </div>
            <div>
              <p className="text-white font-medium">Google Analytics não conectado</p>
              <p className="text-sm text-zinc-500 mt-1 max-w-sm">
                Conecte sua conta Google para visualizar dados de tráfego, sessões e comportamento dos usuários.
              </p>
            </div>
            <a
              href="/api/ga4/start"
              className="bg-orange-600 hover:bg-orange-500 text-white text-sm font-medium px-6 py-2.5 rounded-xl transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Conectar com Google
            </a>
          </div>
        )}

        {/* Dashboard content */}
        {connected && (
          <>
            {/* Period selector + realtime */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {[7, 30, 90].map(d => (
                  <button
                    key={d}
                    onClick={() => setDays(d)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      days === d
                        ? "bg-orange-600 text-white"
                        : "bg-zinc-800 text-zinc-400 hover:text-white"
                    }`}
                  >
                    {d} dias
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-zinc-400">Agora online:</span>
                <span className="text-white font-semibold">{realtime.data?.activeUsers ?? "—"}</span>
              </div>
            </div>

            {/* Overview cards */}
            {overview.isLoading && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse h-24" />
                ))}
              </div>
            )}
            {overview.data && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard icon={<BarChart3 className="w-4 h-4 text-orange-400" />} label="Sessões" value={fmt(overview.data.sessions)} />
                <MetricCard icon={<Users className="w-4 h-4 text-blue-400" />} label="Usuários" value={fmt(overview.data.users)} />
                <MetricCard icon={<Eye className="w-4 h-4 text-purple-400" />} label="Pageviews" value={fmt(overview.data.pageViews)} />
                <MetricCard icon={<TrendingDown className="w-4 h-4 text-red-400" />} label="Taxa de Rejeição" value={`${overview.data.bounceRate}%`} />
              </div>
            )}
            {overview.error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
                {overview.error.message}
              </div>
            )}

            <div className="flex flex-col gap-6">
              {/* Conversões */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-orange-400" />
                    <h2 className="text-base font-semibold text-white">Conversões por Evento</h2>
                  </div>
                  {conversions.isFetching && <RefreshCw className="w-4 h-4 text-zinc-500 animate-spin" />}
                </div>
                {conversions.isLoading && <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-10 bg-zinc-800 rounded animate-pulse" />)}</div>}
                {conversions.data && conversions.data.length > 0 && (
                  <div className="divide-y divide-zinc-800">
                    {conversions.data.map(c => (
                      <div key={c.event} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-base text-zinc-200 truncate">{c.event}</span>
                        </div>
                        <div className="flex items-center gap-6 flex-shrink-0 ml-4 text-sm text-zinc-400">
                          <span>{c.users} usr</span>
                          <span>{c.eventCount} eventos</span>
                          <span className="text-white font-semibold w-16 text-right">{c.conversions} conv.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {conversions.data?.length === 0 && <p className="text-sm text-zinc-500">Sem conversões no período</p>}
              </div>

              {/* Campanhas UTM */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <h2 className="text-base font-semibold text-white">Campanhas UTM</h2>
                  </div>
                  {utmCampaigns.isFetching && <RefreshCw className="w-4 h-4 text-zinc-500 animate-spin" />}
                </div>
                {utmCampaigns.isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-zinc-800 rounded animate-pulse" />)}</div>}
                {utmCampaigns.data && utmCampaigns.data.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-zinc-500 text-xs border-b border-zinc-800">
                          <th className="text-left pb-2 font-medium">Source / Medium</th>
                          <th className="text-left pb-2 font-medium">Campanha</th>
                          <th className="text-right pb-2 font-medium">Sessões</th>
                          <th className="text-right pb-2 font-medium">Rejeição</th>
                          <th className="text-right pb-2 font-medium">Conv.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800">
                        {utmCampaigns.data.map((c, i) => (
                          <tr key={i}>
                            <td className="py-2.5 text-zinc-300">{c.source} / {c.medium}</td>
                            <td className="py-2.5 text-zinc-400 max-w-[180px] truncate">{c.campaign === "(not set)" ? <span className="text-zinc-600">—</span> : c.campaign}</td>
                            <td className="py-2.5 text-right text-white font-medium">{fmt(c.sessions)}</td>
                            <td className="py-2.5 text-right text-zinc-400">{c.bounceRate}%</td>
                            <td className="py-2.5 text-right text-orange-400 font-semibold">{c.conversions}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {utmCampaigns.data?.length === 0 && <p className="text-sm text-zinc-500">Sem dados de campanhas UTM</p>}
              </div>

              {/* Dispositivos + Geo lado a lado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Dispositivos */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-purple-400" />
                      <h2 className="text-base font-semibold text-white">Dispositivos</h2>
                    </div>
                    {devices.isFetching && <RefreshCw className="w-4 h-4 text-zinc-500 animate-spin" />}
                  </div>
                  {devices.isLoading && <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-zinc-800 rounded animate-pulse" />)}</div>}
                  {devices.data && devices.data.length > 0 && (() => {
                    const total = devices.data.reduce((s, d) => s + d.sessions, 0) || 1;
                    const DEVICE_ICONS: Record<string, React.ReactNode> = {
                      mobile: <Smartphone className="w-4 h-4 text-purple-400" />,
                      desktop: <Monitor className="w-4 h-4 text-blue-400" />,
                      tablet: <Tablet className="w-4 h-4 text-green-400" />,
                    };
                    return (
                      <div className="space-y-4">
                        {devices.data.map(d => (
                          <div key={d.device}>
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                {DEVICE_ICONS[d.device] ?? <Monitor className="w-4 h-4 text-zinc-400" />}
                                <span className="text-sm text-zinc-200 capitalize">{d.device}</span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-zinc-400">
                                <span>{d.bounceRate}% rej.</span>
                                <span className="text-white font-semibold">{fmt(d.sessions)}</span>
                              </div>
                            </div>
                            <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(d.sessions / total) * 100}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                  {devices.data?.length === 0 && <p className="text-sm text-zinc-500">Sem dados de dispositivos</p>}
                </div>

                {/* Geo */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <Map className="w-4 h-4 text-teal-400" />
                      <h2 className="text-base font-semibold text-white">Localização</h2>
                    </div>
                    {geo.isFetching && <RefreshCw className="w-4 h-4 text-zinc-500 animate-spin" />}
                  </div>
                  {geo.isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-zinc-800 rounded animate-pulse" />)}</div>}
                  {geo.data && geo.data.length > 0 && (
                    <div className="divide-y divide-zinc-800">
                      {geo.data.slice(0, 10).map((g, i) => (
                        <div key={i} className="flex items-center justify-between py-2.5">
                          <div className="min-w-0">
                            <p className="text-sm text-zinc-200 truncate">{g.city || "—"}</p>
                            <p className="text-xs text-zinc-500">{g.country}</p>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0 ml-4 text-sm">
                            <span className="text-zinc-400">{fmt(g.users)} usr</span>
                            <span className="text-white font-semibold w-16 text-right">{fmt(g.sessions)} sess.</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {geo.data?.length === 0 && <p className="text-sm text-zinc-500">Sem dados geográficos</p>}
                </div>
              </div>

              {/* Traffic sources */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold text-white">Fontes de Tráfego</h2>
                  {sources.isFetching && <RefreshCw className="w-4 h-4 text-zinc-500 animate-spin" />}
                </div>
                {sources.isLoading && <div className="space-y-4">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-zinc-800 rounded animate-pulse" />)}</div>}
                {sources.data && sources.data.length > 0 && (() => {
                  const maxSessions = Math.max(...sources.data.map(s => s.sessions), 1);
                  return (
                    <div className="space-y-4">
                      {sources.data.map(s => (
                        <div key={s.channel}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${CHANNEL_COLORS[s.channel] ?? "bg-zinc-500"}`} />
                              <span className="text-base text-zinc-200">{CHANNEL_PT[s.channel] ?? s.channel}</span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-zinc-400">
                              <span>{fmt(s.users)} usuários</span>
                              <span className="text-white font-semibold w-20 text-right">{fmt(s.sessions)} sess.</span>
                            </div>
                          </div>
                          <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${CHANNEL_COLORS[s.channel] ?? "bg-zinc-500"}`}
                              style={{ width: `${(s.sessions / maxSessions) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
                {sources.data?.length === 0 && <p className="text-base text-zinc-500">Sem dados de tráfego</p>}
              </div>

              {/* Top pages */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-base font-semibold text-white">Páginas Mais Visitadas</h2>
                  {pages.isFetching && <RefreshCw className="w-4 h-4 text-zinc-500 animate-spin" />}
                </div>
                {pages.isLoading && <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-zinc-800 rounded animate-pulse" />)}</div>}
                {pages.data && pages.data.length > 0 && (
                  <div className="divide-y divide-zinc-800">
                    {pages.data.map((p, i) => (
                      <div key={p.path} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-sm text-zinc-600 w-5 flex-shrink-0 font-medium">{i + 1}</span>
                          <span className="text-base text-zinc-200 truncate">{p.path}</span>
                        </div>
                        <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                          <span className="text-sm text-zinc-400">{fmt(p.users)} usr</span>
                          <span className="text-base text-white font-semibold w-16 text-right">{fmt(p.views)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {pages.data?.length === 0 && <p className="text-base text-zinc-500">Sem dados de páginas</p>}
              </div>
            </div>
          </>
        )}
    </div>
  );
}

function MetricCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <span className="text-sm text-zinc-400">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
