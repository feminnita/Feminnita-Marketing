import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { BarChart3, Pause, Play, Zap, TrendingUp, Users, Eye, MousePointerClick, RefreshCw, Clock, Target, Megaphone } from "lucide-react";
import { toast } from "sonner";

export default function MetaAdsCampaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "metrics" | "ads" | "audiences" | "history">("overview");
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Listar campanhas ativas
  const { data: campaignsData, isLoading: loadingCampaigns, refetch: refetchCampaigns } = trpc.metaAdsCampaigns.listActiveCampaigns.useQuery({
    status: "active",
  });

  // Importar campanhas reais do Meta
  const { data: realCampaignsData, isLoading: loadingRealCampaigns } = trpc.metaAdsCampaigns.importarCampanhasReais.useQuery(
    undefined,
    { enabled: autoRefresh }
  );

  // Obter métricas da campanha selecionada
  const { data: metricsData, isLoading: loadingMetrics } = trpc.metaAdsCampaigns.getCampaignMetrics.useQuery(
    { campaignId: selectedCampaign || "" },
    { enabled: !!selectedCampaign }
  );

  // Obter métricas detalhadas
  const { data: detailedMetricsData } = trpc.metaAdsCampaigns.obterMetricasDetalhadas.useQuery(
    { campaignId: selectedCampaign || "" },
    { enabled: !!selectedCampaign && activeTab === "metrics" }
  );

  // Obter anúncios da campanha
  const { data: adsData } = trpc.metaAdsCampaigns.obterAnuncios.useQuery(
    { campaignId: selectedCampaign || "" },
    { enabled: !!selectedCampaign && activeTab === "ads" }
  );

  // Obter públicos-alvo
  const { data: audiencesData } = trpc.metaAdsCampaigns.obterPublicosAlvo.useQuery(
    { campaignId: selectedCampaign || "" },
    { enabled: !!selectedCampaign && activeTab === "audiences" }
  );

  // Obter histórico
  const { data: historyData } = trpc.metaAdsCampaigns.obterHistorico.useQuery(
    { dias: 30 },
    { enabled: activeTab === "history" }
  );

  // Mutations
  const pauseMutation = trpc.metaAdsCampaigns.pauseCampaign.useMutation();
  const resumeMutation = trpc.metaAdsCampaigns.resumeCampaign.useMutation();
  const optimizeMutation = trpc.metaAdsCampaigns.optimizeCampaign.useMutation();
  const syncMutation = trpc.metaAdsCampaigns.sincronizarTempoReal.useMutation();

  const handlePauseCampaign = async (campaignId: string) => {
    try {
      await pauseMutation.mutateAsync({ campaignId });
      toast.success("Campanha pausada com sucesso");
      refetchCampaigns();
    } catch (error) {
      toast.error("Erro ao pausar campanha");
    }
  };

  const handleResumeCampaign = async (campaignId: string) => {
    try {
      await resumeMutation.mutateAsync({ campaignId });
      toast.success("Campanha retomada com sucesso");
      refetchCampaigns();
    } catch (error) {
      toast.error("Erro ao retomar campanha");
    }
  };

  const handleOptimizeCampaign = async (campaignId: string) => {
    try {
      await optimizeMutation.mutateAsync({ campaignId });
      toast.success("Campanha otimizada com sucesso");
    } catch (error) {
      toast.error("Erro ao otimizar campanha");
    }
  };

  const handleSyncRealtime = async () => {
    try {
      await syncMutation.mutateAsync({});
      toast.success("Dados sincronizados em tempo real");
      refetchCampaigns();
    } catch (error) {
      toast.error("Erro ao sincronizar dados");
    }
  };

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      refetchCampaigns();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh, refetchCampaigns]);

  const campaigns = campaignsData?.campaigns || [];
  const realCampaigns = realCampaignsData?.campanhas || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Campanhas Meta Ads</h1>
          <p className="text-slate-600 mt-2">Gerencie suas campanhas de publicidade no Facebook e Instagram em tempo real</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {autoRefresh ? "Auto-refresh ON" : "Auto-refresh OFF"}
          </Button>
          <Button
            onClick={handleSyncRealtime}
            disabled={syncMutation.isPending}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Clock className="w-4 h-4" />
            Sincronizar Agora
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Campanhas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{campaigns.length}</div>
            <p className="text-xs text-slate-500 mt-1">{realCampaigns.length} do Meta</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Impressões Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {campaigns.reduce((sum, c: any) => sum + (c.metrics?.impressions || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Cliques Totais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">
              {campaigns.reduce((sum, c: any) => sum + (c.metrics?.clicks || 0), 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">ROI Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(campaigns.reduce((sum, c: any) => sum + (c.metrics?.roi || 0), 0) / Math.max(campaigns.length, 1)).toFixed(1)}x
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campanhas List */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Campanhas Ativas</CardTitle>
              <CardDescription>Clique em uma campanha para ver detalhes</CardDescription>
            </CardHeader>
            <CardContent>
              {loadingCampaigns || loadingRealCampaigns ? (
                <div className="text-center py-8 text-slate-500">Carregando campanhas...</div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8 text-slate-500">Nenhuma campanha ativa</div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map((campaign: any) => (
                    <div
                      key={campaign.id}
                      onClick={() => setSelectedCampaign(campaign.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition ${
                        selectedCampaign === campaign.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900">{campaign.name}</h3>
                          <p className="text-sm text-slate-600 mt-1">{campaign.description}</p>
                          <div className="flex gap-2 mt-2 flex-wrap">
                            <Badge variant="outline" className="text-xs">
                              Orçamento: R$ {campaign.budget}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Gasto: R$ {campaign.spent}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Status: {campaign.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-2xl font-bold text-slate-900">{campaign.metrics?.roi || 0}x</div>
                          <div className="text-xs text-slate-600">ROI</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Detalhes da Campanha */}
        <div>
          {selectedCampaign ? (
            <>
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                  <TabsTrigger value="metrics">Métricas</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Métricas Rápidas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingMetrics ? (
                        <div className="text-center py-8 text-slate-500">Carregando métricas...</div>
                      ) : metricsData ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                            <div className="flex items-center gap-2">
                              <Eye className="w-4 h-4 text-slate-600" />
                              <span className="text-sm text-slate-600">Impressões</span>
                            </div>
                            <span className="font-semibold">{metricsData?.impressions?.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                            <div className="flex items-center gap-2">
                              <MousePointerClick className="w-4 h-4 text-slate-600" />
                              <span className="text-sm text-slate-600">Cliques</span>
                            </div>
                            <span className="font-semibold">{metricsData?.clicks?.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                            <div className="flex items-center gap-2">
                              <TrendingUp className="w-4 h-4 text-slate-600" />
                              <span className="text-sm text-slate-600">Conversões</span>
                            </div>
                            <span className="font-semibold">{metricsData?.conversions?.toLocaleString()}</span>
                          </div>

                          <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                            <span className="text-sm font-medium text-green-900">ROI</span>
                            <span className="font-bold text-green-600">{metricsData?.roi?.toFixed(2)}x</span>
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="metrics" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Métricas Detalhadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {loadingMetrics ? (
                        <div className="text-center py-8 text-slate-500">Carregando métricas...</div>
                      ) : detailedMetricsData?.metricas ? (
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-600">CTR:</span>
                            <span className="font-semibold">{metricsData?.ctr?.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">CPC:</span>
                            <span className="font-semibold">R$ {metricsData?.cpc?.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Taxa de Conversão:</span>
                            <span className="font-semibold">{metricsData?.conversionRate?.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Gasto Total:</span>
                            <span className="font-semibold">R$ {metricsData?.spend?.toFixed(2)}</span>
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    type="button"
                    onClick={() => handlePauseCampaign(selectedCampaign)}
                    disabled={pauseMutation.isPending}
                    className="w-full"
                    variant="outline"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar Campanha
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleResumeCampaign(selectedCampaign)}
                    disabled={resumeMutation.isPending}
                    className="w-full"
                    variant="outline"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Retomar Campanha
                  </Button>

                  <Button
                    type="button"
                    onClick={() => handleOptimizeCampaign(selectedCampaign)}
                    disabled={optimizeMutation.isPending}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Otimizar Campanha
                  </Button>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-slate-500 py-8">
                  <p>Selecione uma campanha para ver detalhes</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Anúncios, Públicos-alvo e Histórico */}
      {selectedCampaign && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Anúncios */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Megaphone className="w-5 h-5" />
                Anúncios da Campanha
              </CardTitle>
            </CardHeader>
            <CardContent>
              {adsData?.anuncios && adsData.anuncios.length > 0 ? (
                <div className="space-y-2">
                  {adsData.anuncios.map((ad: any) => (
                    <div key={ad.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                      <p className="font-medium text-sm">{ad.name}</p>
                      <p className="text-xs text-slate-600">Status: {ad.status}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Nenhum anúncio encontrado</p>
              )}
            </CardContent>
          </Card>

          {/* Públicos-alvo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Públicos-alvo
              </CardTitle>
            </CardHeader>
            <CardContent>
              {audiencesData?.publicosAlvo && audiencesData.publicosAlvo.length > 0 ? (
                <div className="space-y-2">
                  {audiencesData.publicosAlvo.map((audience: any) => (
                    <div key={audience.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                      <p className="font-medium text-sm">{audience.name}</p>
                      <p className="text-xs text-slate-600">{audience.size.toLocaleString()} pessoas</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Nenhum público-alvo encontrado</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Histórico */}
      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Histórico de Campanhas (Últimos 30 dias)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {historyData?.historico && historyData.historico.length > 0 ? (
              <div className="space-y-2">
                {historyData.historico.map((campaign: any) => (
                  <div key={campaign.id} className="p-3 bg-slate-50 rounded border border-slate-200">
                    <p className="font-medium text-sm">{campaign.name}</p>
                    <p className="text-xs text-slate-600">Criada em: {new Date(campaign.created_time).toLocaleDateString('pt-BR')}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Nenhuma campanha no histórico</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
