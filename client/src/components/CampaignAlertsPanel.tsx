import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  AlertTriangle,
  Info,
  Check,
  X,
  TrendingDown,
  DollarSign,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState } from "react";

export function CampaignAlertsPanel() {
  const { data: alertsData, isLoading, refetch } = trpc.metaAdsCampaigns.getCampaignAlerts.useQuery({
    limit: 20,
  });

  const markAsReadMutation = trpc.metaAdsCampaigns.markAlertAsRead.useMutation({
    onSuccess: () => refetch(),
  });

  const resolveAlertMutation = trpc.metaAdsCampaigns.resolveAlert.useMutation({
    onSuccess: () => refetch(),
  });

  const [expandedAlertId, setExpandedAlertId] = useState<number | null>(null);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>⚠️ Alertas de Campanhas</CardTitle>
          <CardDescription>Carregando alertas...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "warning":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case "info":
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case "low_roi":
        return <TrendingDown className="w-4 h-4" />;
      case "high_spend":
      case "budget_limit":
        return <DollarSign className="w-4 h-4" />;
      case "high_cpc":
      case "low_ctr":
        return <Zap className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getAlertTypeLabel = (alertType: string) => {
    const labels: Record<string, string> = {
      low_roi: "ROI Baixo",
      high_spend: "Gasto Alto",
      budget_limit: "Limite de Orçamento",
      performance_drop: "Queda de Performance",
      high_cpc: "CPC Alto",
      low_ctr: "CTR Baixo",
    };
    return labels[alertType] || alertType;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              ⚠️ Alertas de Campanhas
            </CardTitle>
            <CardDescription>
              {alertsData?.unreadCount || 0} não lidos • {alertsData?.criticalCount || 0} críticos
            </CardDescription>
          </div>
          {alertsData?.unreadCount ? (
            <Badge variant="destructive" className="text-lg px-3 py-1">
              {alertsData.unreadCount}
            </Badge>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alertsData?.alerts && alertsData.alerts.length > 0 ? (
            alertsData.alerts.map((alert: any) => (
              <div
                key={alert.id}
                className={`border-l-4 rounded-lg p-4 ${getSeverityColor(alert.severity)} ${
                  alert.isRead ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">{getSeverityIcon(alert.severity)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm">{alert.title}</p>
                        <Badge variant="outline" className="text-xs gap-1">
                          {getAlertIcon(alert.alertType)}
                          {getAlertTypeLabel(alert.alertType)}
                        </Badge>
                        {alert.isRead && <Check className="w-4 h-4 text-green-600" />}
                      </div>
                      <p className="text-sm mb-2">{alert.description}</p>

                      {expandedAlertId === alert.id && (
                        <div className="mt-3 pt-3 border-t border-current border-opacity-20 space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <p className="font-medium">Valor Atual:</p>
                              <p>{alert.currentValue}</p>
                            </div>
                            <div>
                              <p className="font-medium">Limite:</p>
                              <p>{alert.threshold}</p>
                            </div>
                          </div>
                          <div>
                            <p className="font-medium text-xs mb-1">Recomendação:</p>
                            <p className="text-xs">{alert.recommendation}</p>
                          </div>
                        </div>
                      )}

                      <p className="text-xs opacity-75 mt-2">
                        {formatDistanceToNow(new Date(alert.createdAt), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => setExpandedAlertId(expandedAlertId === alert.id ? null : alert.id)}
                      className="text-xs"
                    >
                      {expandedAlertId === alert.id ? "Menos" : "Mais"}
                    </Button>
                    {!alert.isRead && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => markAsReadMutation.mutate({ alertId: alert.id })}
                        disabled={markAsReadMutation.isPending}
                        className="text-xs"
                      >
                        ✓
                      </Button>
                    )}
                    {!alert.isResolved && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => resolveAlertMutation.mutate({ alertId: alert.id })}
                        disabled={resolveAlertMutation.isPending}
                        className="text-xs"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Nenhum alerta no momento</p>
              <p className="text-xs">Suas campanhas estão funcionando bem! 🎉</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
