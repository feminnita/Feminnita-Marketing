import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function SyncHistoryPanel() {
  const { data: syncHistory, isLoading } = trpc.metaAdsCampaigns.getSyncHistory.useQuery({
    limit: 10,
    offset: 0,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📋 Histórico de Sincronizações</CardTitle>
          <CardDescription>Carregando histórico...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "bg-green-100 text-green-800";
      case "partial":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4" />;
      case "partial":
        return <AlertCircle className="w-4 h-4" />;
      case "failed":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getSyncTypeLabel = (syncType: string) => {
    const labels: Record<string, string> = {
      campaigns: "Campanhas",
      metrics: "Métricas",
      ads: "Anúncios",
      audiences: "Públicos",
      full: "Completa",
    };
    return labels[syncType] || syncType;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          📋 Histórico de Sincronizações
        </CardTitle>
        <CardDescription>
          Últimas {syncHistory?.total || 0} sincronizações com Meta Ads
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {syncHistory?.history && syncHistory.history.length > 0 ? (
            syncHistory.history.map((sync: any) => (
              <div
                key={sync.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className={`p-2 rounded-full ${getStatusColor(sync.status)}`}>
                    {getStatusIcon(sync.status)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      Sincronização {getSyncTypeLabel(sync.syncType)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {sync.totalCampaigns} campanhas • {sync.updatedCampaigns} atualizadas
                      {sync.failedCampaigns > 0 && ` • ${sync.failedCampaigns} falhadas`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge variant="outline" className={getStatusColor(sync.status)}>
                      {sync.status === "success"
                        ? "✓ Sucesso"
                        : sync.status === "partial"
                          ? "⚠ Parcial"
                          : "✗ Falha"}
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(sync.createdAt), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <p>Nenhuma sincronização registrada</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
