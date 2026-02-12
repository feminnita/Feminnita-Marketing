import { useEffect, useState, useCallback } from "react";
import { useAuth } from "./useAuth";
import io, { Socket } from "socket.io-client";

export interface WhatsAppNotification {
  type: "new_message" | "ai_response" | "escalation" | "conversation_status";
  data: any;
  timestamp: Date;
}

export function useWhatsAppNotifications() {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<WhatsAppNotification[]>([]);

  useEffect(() => {
    if (!user) return;

    // Conectar ao WebSocket
    const newSocket = io(window.location.origin, {
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("[WebSocket] Conectado ao servidor");
      setIsConnected(true);
      // Registrar usuário
      newSocket.emit("register-user", user.id);
    });

    newSocket.on("disconnect", () => {
      console.log("[WebSocket] Desconectado do servidor");
      setIsConnected(false);
    });

    // Ouvir notificações de nova mensagem
    newSocket.on("new-message", (notification: WhatsAppNotification) => {
      console.log("[WebSocket] Nova mensagem:", notification.data);
      setNotifications((prev) => [...prev, notification]);
      // Mostrar notificação do navegador se permitido
      showBrowserNotification("Nova Mensagem", notification.data.whatsappContactName, notification.data.userMessage);
    });

    // Ouvir notificações de resposta da IA
    newSocket.on("ai-response", (notification: WhatsAppNotification) => {
      console.log("[WebSocket] Resposta da IA:", notification.data);
      setNotifications((prev) => [...prev, notification]);
      showBrowserNotification("Resposta da IA", notification.data.whatsappContactName, notification.data.aiResponse);
    });

    // Ouvir notificações de escalação
    newSocket.on("escalation", (notification: WhatsAppNotification) => {
      console.log("[WebSocket] Escalação:", notification.data);
      setNotifications((prev) => [...prev, notification]);
      showBrowserNotification("Conversa Escalada", notification.data.whatsappContactName, notification.data.reason);
    });

    // Ouvir notificações de status de conversa
    newSocket.on("conversation-status", (notification: WhatsAppNotification) => {
      console.log("[WebSocket] Status da conversa:", notification.data);
      setNotifications((prev) => [...prev, notification]);
      showBrowserNotification("Status Atualizado", notification.data.whatsappPhoneNumber, `Status: ${notification.data.status}`);
    });

    newSocket.on("error", (error: any) => {
      console.error("[WebSocket] Erro:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return {
    socket,
    isConnected,
    notifications,
    clearNotifications,
    removeNotification,
  };
}

/**
 * Mostrar notificação do navegador
 */
function showBrowserNotification(title: string, tag: string, message: string) {
  if (!("Notification" in window)) {
    console.log("[Notification] Navegador não suporta notificações");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification(title, {
      body: `${tag}: ${message}`,
      tag: `whatsapp-${tag}`,
      icon: "/favicon.ico",
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(title, {
          body: `${tag}: ${message}`,
          tag: `whatsapp-${tag}`,
          icon: "/favicon.ico",
        });
      }
    });
  }
}
