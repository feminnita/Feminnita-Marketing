import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";

let io: SocketIOServer | null = null;

// Mapa de usuários conectados: userId -> Set de socket IDs
const connectedUsers = new Map<number, Set<string>>();

export function initializeWebSocket(httpServer: HTTPServer) {
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`[WebSocket] Cliente conectado: ${socket.id}`);

    // Quando cliente se conecta, ele envia seu userId
    socket.on("register-user", (userId: number) => {
      if (!connectedUsers.has(userId)) {
        connectedUsers.set(userId, new Set());
      }
      connectedUsers.get(userId)!.add(socket.id);
      console.log(`[WebSocket] Usuário ${userId} registrado (socket: ${socket.id})`);
    });

    // Quando cliente se desconecta
    socket.on("disconnect", () => {
      // Remover socket de todos os usuários
      const entriesToDelete: number[] = [];
      connectedUsers.forEach((sockets, userId) => {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          entriesToDelete.push(userId);
        }
      });
      entriesToDelete.forEach((userId) => connectedUsers.delete(userId));
      console.log(`[WebSocket] Cliente desconectado: ${socket.id}`);
    });
  });

  console.log("[WebSocket] Servidor WebSocket inicializado");
  return io;
}

/**
 * Notificar usuário sobre nova mensagem recebida
 */
export function notifyNewMessage(
  userId: number,
  data: {
    whatsappPhoneNumber: string;
    whatsappContactName: string;
    userMessage: string;
    timestamp: Date;
  }
) {
  if (!io) return;

  const sockets = connectedUsers.get(userId);
  if (!sockets || sockets.size === 0) {
    console.log(`[WebSocket] Usuário ${userId} não conectado`);
    return;
  }

  // Enviar para todos os sockets do usuário
  sockets.forEach((socketId) => {
    io!.to(socketId).emit("new-message", {
      type: "new_message",
      data,
      timestamp: new Date(),
    });
  });

  console.log(`[WebSocket] Notificação enviada para ${userId}: nova mensagem de ${data.whatsappPhoneNumber}`);
}

/**
 * Notificar usuário sobre resposta da IA
 */
export function notifyAIResponse(
  userId: number,
  data: {
    whatsappPhoneNumber: string;
    whatsappContactName: string;
    aiResponse: string;
    timestamp: Date;
  }
) {
  if (!io) return;

  const sockets = connectedUsers.get(userId);
  if (!sockets || sockets.size === 0) {
    console.log(`[WebSocket] Usuário ${userId} não conectado`);
    return;
  }

  sockets.forEach((socketId) => {
    io!.to(socketId).emit("ai-response", {
      type: "ai_response",
      data,
      timestamp: new Date(),
    });
  });

  console.log(`[WebSocket] Notificação enviada para ${userId}: resposta da IA para ${data.whatsappPhoneNumber}`);
}

/**
 * Notificar usuário sobre escalação
 */
export function notifyEscalation(
  userId: number,
  data: {
    whatsappPhoneNumber: string;
    whatsappContactName: string;
    reason: string;
    timestamp: Date;
  }
) {
  if (!io) return;

  const sockets = connectedUsers.get(userId);
  if (!sockets || sockets.size === 0) {
    console.log(`[WebSocket] Usuário ${userId} não conectado`);
    return;
  }

  sockets.forEach((socketId) => {
    io!.to(socketId).emit("escalation", {
      type: "escalation",
      data,
      timestamp: new Date(),
    });
  });

  console.log(`[WebSocket] Notificação de escalação enviada para ${userId}: ${data.whatsappPhoneNumber}`);
}

/**
 * Notificar usuário sobre status de conversa
 */
export function notifyConversationStatus(
  userId: number,
  data: {
    whatsappPhoneNumber: string;
    status: "open" | "closed" | "escalated" | "resolved";
    timestamp: Date;
  }
) {
  if (!io) return;

  const sockets = connectedUsers.get(userId);
  if (!sockets || sockets.size === 0) {
    console.log(`[WebSocket] Usuário ${userId} não conectado`);
    return;
  }

  sockets.forEach((socketId) => {
    io!.to(socketId).emit("conversation-status", {
      type: "conversation_status",
      data,
      timestamp: new Date(),
    });
  });

  console.log(`[WebSocket] Status de conversa atualizado para ${userId}: ${data.whatsappPhoneNumber}`);
}

/**
 * Obter número de usuários conectados
 */
export function getConnectedUsersCount(): number {
  return connectedUsers.size;
}

/**
 * Verificar se usuário está conectado
 */
export function isUserConnected(userId: number): boolean {
  return connectedUsers.has(userId) && (connectedUsers.get(userId)?.size ?? 0) > 0;
}

/**
 * Obter instância do Socket.IO
 */
export function getIO(): SocketIOServer | null {
  return io;
}
