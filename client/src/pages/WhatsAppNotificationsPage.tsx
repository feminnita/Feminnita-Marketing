import { useWhatsAppNotifications } from "@/_core/hooks/useWhatsAppNotifications";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, MessageCircle, AlertTriangle, CheckCircle2, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function WhatsAppNotificationsPage() {
  const { isConnected, notifications, clearNotifications, removeNotification } = useWhatsAppNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "new_message":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "ai_response":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "escalation":
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case "conversation_status":
        return <Bell className="w-5 h-5 text-purple-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationLabel = (type: string) => {
    switch (type) {
      case "new_message":
        return "Nova Mensagem";
      case "ai_response":
        return "Resposta da IA";
      case "escalation":
        return "Escalação";
      case "conversation_status":
        return "Status Atualizado";
      default:
        return "Notificação";
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "new_message":
        return "bg-blue-50 border-blue-200";
      case "ai_response":
        return "bg-green-50 border-green-200";
      case "escalation":
        return "bg-orange-50 border-orange-200";
      case "conversation_status":
        return "bg-purple-50 border-purple-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Notificações de WhatsApp</h1>
        <p className="text-gray-600">Acompanhe mensagens e eventos em tempo real</p>
      </div>

      {/* Status de Conexão */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Status da Conexão
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
            />
            <span className="text-sm font-medium">
              {isConnected ? "Conectado ao servidor de notificações" : "Desconectado"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Notificações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Notificações Recentes</CardTitle>
            <CardDescription>{notifications.length} notificação(ões)</CardDescription>
          </div>
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearNotifications}>
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar Tudo
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Nenhuma notificação ainda</p>
              <p className="text-sm text-gray-400 mt-2">
                Notificações aparecerão aqui quando clientes enviarem mensagens
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification, index) => (
                <div
                  key={index}
                  className={`p-4 border rounded-lg flex items-start justify-between ${getNotificationColor(
                    notification.type
                  )}`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="secondary" className="text-xs">
                          {getNotificationLabel(notification.type)}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(notification.timestamp), {
                            locale: ptBR,
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {notification.data.whatsappContactName && (
                          <p className="text-sm font-medium">{notification.data.whatsappContactName}</p>
                        )}
                        {notification.data.whatsappPhoneNumber && (
                          <p className="text-xs text-gray-600">{notification.data.whatsappPhoneNumber}</p>
                        )}
                        {notification.data.userMessage && (
                          <p className="text-sm text-gray-700 mt-2 italic">"{notification.data.userMessage}"</p>
                        )}
                        {notification.data.aiResponse && (
                          <p className="text-sm text-gray-700 mt-2 bg-white bg-opacity-50 p-2 rounded">
                            <strong>IA:</strong> {notification.data.aiResponse}
                          </p>
                        )}
                        {notification.data.reason && (
                          <p className="text-sm text-gray-700 mt-2">
                            <strong>Motivo:</strong> {notification.data.reason}
                          </p>
                        )}
                        {notification.data.status && (
                          <p className="text-sm text-gray-700 mt-2">
                            <strong>Status:</strong> {notification.data.status}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeNotification(index)}
                    className="ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Informações */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2 text-gray-600">
          <p>
            • Esta página se conecta em tempo real ao servidor via WebSocket para receber notificações instantâneas
          </p>
          <p>• Você receberá alertas quando clientes enviarem mensagens no WhatsApp</p>
          <p>• A IA processará automaticamente as mensagens e gerará respostas</p>
          <p>• Conversas serão escaladas para você quando necessário</p>
          <p>• Mantenha esta página aberta para receber notificações em tempo real</p>
        </CardContent>
      </Card>
    </div>
  );
}
