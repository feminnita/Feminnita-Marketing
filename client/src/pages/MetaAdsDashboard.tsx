import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, TrendingUp } from 'lucide-react';
import { trpc } from '@/lib/trpc';

interface Campaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  spend?: number;
  impressions?: number;
  clicks?: number;
  conversions?: number;
}

export default function MetaAdsDashboard() {
  const [refetchInterval, setRefetchInterval] = useState<number | false>(false);

  // Use useQuery para buscar campanhas
  const { data, isLoading, error, refetch } = trpc.metaAdsCampaigns.importarCampanhasReais.useQuery(
    undefined,
    {
      refetchInterval: refetchInterval,
    }
  );

  const campaigns: Campaign[] = data?.campanhas || [];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'ativa':
        return 'bg-green-100 text-green-800';
      case 'paused':
      case 'pausada':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
      case 'arquivada':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const getObjectiveLabel = (objective: string) => {
    const labels: Record<string, string> = {
      'LINK_CLICKS': 'Cliques no Link',
      'PAGE_LIKES': 'Curtidas na Página',
      'POST_ENGAGEMENT': 'Engajamento',
      'LEAD_GENERATION': 'Geração de Leads',
      'CONVERSIONS': 'Conversões',
      'VIDEO_VIEWS': 'Visualizações de Vídeo',
      'REACH': 'Alcance',
      'BRAND_AWARENESS': 'Reconhecimento de Marca',
    };
    return labels[objective] || objective;
  };

  const toggleAutoRefresh = () => {
    setRefetchInterval(refetchInterval ? false : 30000); // 30 segundos
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Campanhas Meta Ads</h1>
          <p className="text-slate-600">Gerencie e monitore suas campanhas de anúncios do Meta em tempo real</p>
        </div>

        {/* Actions */}
        <div className="mb-6 flex gap-3">
          <Button
            onClick={() => refetch()}
            disabled={isLoading}
            className="bg-pink-600 hover:bg-pink-700"
            type="button"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importando...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Importar Campanhas
              </>
            )}
          </Button>

          <Button
            onClick={toggleAutoRefresh}
            variant={refetchInterval ? 'default' : 'outline'}
            className={refetchInterval ? 'bg-blue-600 hover:bg-blue-700' : ''}
            type="button"
          >
            Auto-refresh {refetchInterval ? 'ON' : 'OFF'}
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">
                {error instanceof Error ? error.message : 'Erro ao importar campanhas'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Campaigns Grid */}
        {campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <CardTitle className="text-lg text-slate-900">{campaign.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        ID: {campaign.id}
                      </CardDescription>
                    </div>
                    <Badge className={getStatusColor(campaign.status)}>
                      {campaign.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Objetivo:</span>
                      <span className="font-medium text-slate-900">
                        {getObjectiveLabel(campaign.objective)}
                      </span>
                    </div>

                    {campaign.spend !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Gasto:</span>
                        <span className="font-medium text-slate-900">
                          R$ {campaign.spend.toFixed(2)}
                        </span>
                      </div>
                    )}

                    {campaign.impressions !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Impressões:</span>
                        <span className="font-medium text-slate-900">
                          {campaign.impressions.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}

                    {campaign.clicks !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Cliques:</span>
                        <span className="font-medium text-slate-900">
                          {campaign.clicks.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}

                    {campaign.conversions !== undefined && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-600">Conversões:</span>
                        <span className="font-medium text-slate-900">
                          {campaign.conversions.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !isLoading && !error ? (
          <Card className="text-center py-12">
            <CardContent>
              <TrendingUp className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-600">Nenhuma campanha encontrada</p>
              <p className="text-sm text-slate-500 mt-2">
                Clique em "Importar Campanhas" para sincronizar suas campanhas do Meta Ads
              </p>
            </CardContent>
          </Card>
        ) : isLoading ? (
          <Card className="text-center py-12">
            <CardContent>
              <Loader2 className="w-12 h-12 mx-auto text-slate-400 mb-4 animate-spin" />
              <p className="text-slate-600">Carregando campanhas...</p>
            </CardContent>
          </Card>
        ) : null}

        {/* Stats Summary */}
        {campaigns.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Total de Campanhas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">{campaigns.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Campanhas Ativas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {campaigns.filter(c => c.status.toLowerCase() === 'active' || c.status.toLowerCase() === 'ativa').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Gasto Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  R$ {campaigns.reduce((sum, c) => sum + (c.spend || 0), 0).toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600">
                  Impressões Totais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900">
                  {campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0).toLocaleString('pt-BR')}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
