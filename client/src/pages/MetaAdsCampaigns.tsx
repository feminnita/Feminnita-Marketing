import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { BarChart3, Pause, Play, Zap, TrendingUp, Users, Eye, MousePointerClick } from "lucide-react";

export default function MetaAdsCampaigns() {
  const [selectedCampaign, setSelectedCampaign] = useState<string | null>(null);

  // Listar campanhas ativas
  const { data: campaignsData, isLoading: loadingCampaigns } = trpc.metaAdsCampaigns.listActiveCampaigns.useQuery({
    status: "active",
  });

  // Obter métricas da campanha selecionada
  const { data: metricsData, isLoading: loadingMetrics } = trpc.metaAdsCampaigns.getCampaignMetrics.useQuery(
    { campaignId: selectedCampaign || "" },
    { enabled: !!selectedCampaign }
  );

  // Mutations
  const pauseMutation = trpc.metaAdsCampaigns.pauseCampaign.useMutation();
  const resumeMutation = trpc.metaAdsCampaigns.resumeCampaign.useMutation();
  const optimizeMutation = trpc.metaAdsCampaigns.optimizeCampaign.useMutation();

  const handlePauseCampaign = async (campaignId: string) => {
    await pauseMutation.mutateAsync({ campaignId });
  };

  const handleResumeCampaign = async (campaignId: string) => {
    await resumeMutation.mutateAsync({ campaignId });
  };

  const handleOptimizeCampaign = async (campaignId: string) => {
    await optimizeMutation.mutateAsync({ campaignId });
  };

  const campaigns = campaignsData?.campaigns || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Campanhas Meta Ads</h1>
        <p className="text-slate-600 mt-2">Gerencie suas campanhas de publicidade no Facebook e Instagram</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-600">Campanhas Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{campaigns.length}</div>
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
              {loadingCampaigns ? (
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
                          <div className="flex gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              Orçamento: R$ {campaign.budget}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              Duração: {campaign.duration}d
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
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Métricas</CardTitle>
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
                        <span className="font-semibold">{metricsData.impressions?.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                        <div className="flex items-center gap-2">
                          <MousePointerClick className="w-4 h-4 text-slate-600" />
                          <span className="text-sm text-slate-600">Cliques</span>
                        </div>
                        <span className="font-semibold">{metricsData.clicks?.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-slate-600" />
                          <span className="text-sm text-slate-600">Conversões</span>
                        </div>
                        <span className="font-semibold">{metricsData.conversions?.toLocaleString()}</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-slate-600" />
                          <span className="text-sm text-slate-600">CTR</span>
                        </div>
                        <span className="font-semibold">{metricsData.ctr?.toFixed(2)}%</span>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200">
                        <span className="text-sm font-medium text-green-900">ROI</span>
                        <span className="font-bold text-green-600">{metricsData.roi?.toFixed(2)}x</span>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">Ações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => handlePauseCampaign(selectedCampaign)}
                    disabled={pauseMutation.isPending}
                    className="w-full"
                    variant="outline"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pausar Campanha
                  </Button>

                  <Button
                    onClick={() => handleResumeCampaign(selectedCampaign)}
                    disabled={resumeMutation.isPending}
                    className="w-full"
                    variant="outline"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Retomar Campanha
                  </Button>

                  <Button
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
    </div>
  );
}
