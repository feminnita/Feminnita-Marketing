import { Server as HTTPServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { getDb } from "../db";
import { pushSubscriptions } from "../../drizzle/schema";
import { sendPush } from "../services/webPush";
import { eq, ne } from "drizzle-orm";

let io: SocketIOServer | null = null;

// Mapa de usuários conectados: userId -> Set de socket IDs
const connectedUsers = new Map<number, Set<string>>();

// ── Chat interno ──────────────────────────────────────────────────────────────
const CHAT_COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e67e22','#e91e63','#00bcd4','#ff5722'];
let chatColorIdx = 0;
const MAX_CHAT_HISTORY = 100;

interface ChatMessage {
  type: 'message' | 'system';
  id: string;
  name?: string;
  color?: string;
  text: string;
  ts: number;
}

const chatHistory: ChatMessage[] = [];
const chatUsers = new Map<string, { name: string; color: string; userId: number }>();

function broadcastChatUsers() {
  if (!io) return;
  const users = [...chatUsers.values()].map(u => ({ name: u.name, color: u.color }));
  io.emit('chat:users', users);
}

function pushChatMessage(msg: ChatMessage) {
  chatHistory.push(msg);
  if (chatHistory.length > MAX_CHAT_HISTORY) chatHistory.shift();
  if (io) io.emit('chat:message', msg);

  // Enviar push para usuários offline (apenas mensagens reais)
  if (msg.type === "message") {
    sendChatPushToOfflineUsers(msg).catch(() => {});
  }
}

async function sendChatPushToOfflineUsers(msg: ChatMessage) {
  const db = await getDb();
  if (!db) return;

  const subs = await db.select().from(pushSubscriptions);
  for (const sub of subs) {
    // Pular usuários online (já recebem via socket)
    if (isUserConnected(sub.userId)) continue;

    try {
      await sendPush(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        { title: `Chat — ${msg.name ?? "Equipe"}`, body: msg.text.slice(0, 120), url: "/" }
      );
    } catch (err: any) {
      if (err.expired) {
        await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
      }
    }
  }
}

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
      socket.join(`user_${userId}`);
      console.log(`[WebSocket] Usuário ${userId} registrado (socket: ${socket.id})`);
    });

    // Chat: join
    socket.on("chat:join", ({ userId, name }: { userId: number; name: string }) => {
      const safeName = String(name || "Usuário").trim().slice(0, 30);
      const color = CHAT_COLORS[chatColorIdx % CHAT_COLORS.length];
      chatColorIdx++;
      chatUsers.set(socket.id, { name: safeName, color, userId });
      socket.emit("chat:history", chatHistory);
      broadcastChatUsers();
      pushChatMessage({ type: "system", id: `${Date.now()}`, text: `${safeName} entrou`, ts: Date.now() });
    });

    // DM: mensagem direta entre humanos
    socket.on("dm:send", ({ toUserId, text }: { toUserId: number; text: unknown }) => {
      const sender = chatUsers.get(socket.id);
      if (!sender) return;
      const safe = String(text ?? "").trim().slice(0, 1000);
      if (!safe) return;
      const msg = {
        id: `${Date.now()}-${Math.random()}`,
        fromUserId: sender.userId,
        fromName: sender.name,
        color: sender.color,
        text: safe,
        ts: Date.now(),
      };
      const recipientSockets = connectedUsers.get(toUserId);
      if (recipientSockets) {
        recipientSockets.forEach(sid => io!.to(sid).emit("dm:receive", msg));
      }
    });

    // Chat: send message
    socket.on("chat:send", (text: unknown) => {
      const user = chatUsers.get(socket.id);
      if (!user) return;
      const safe = String(text ?? "").trim().slice(0, 1000);
      if (!safe) return;
      pushChatMessage({ type: "message", id: `${Date.now()}-${Math.random()}`, name: user.name, color: user.color, text: safe, ts: Date.now() });
    });

    // Quando cliente se desconecta
    socket.on("disconnect", () => {
      // Chat: remover do chat
      const chatUser = chatUsers.get(socket.id);
      if (chatUser) {
        chatUsers.delete(socket.id);
        broadcastChatUsers();
        pushChatMessage({ type: "system", id: `${Date.now()}`, text: `${chatUser.name} saiu`, ts: Date.now() });
      }
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

export function notifyNewAlert(userId: number, alert: {
  id?: number;
  alertType: string;
  severity: string;
  title: string;
  campaignId?: string;
  campaignName?: string;
  currentValue?: string;
  threshold?: string;
  recommendation?: string;
}): void {
  const io = getIO();
  if (!io) return;
  io.to(`user_${userId}`).emit("new_alert", {
    ...alert,
    timestamp: new Date().toISOString(),
  });
}

export function notifyPerformanceUpdate(userId: number, data: {
  influencerId: number;
  followers: number;
  engagementRate: number;
  platform: string;
}): void {
  const io = getIO();
  if (!io) return;
  io.to(`user_${userId}`).emit("performance_update", {
    ...data,
    timestamp: new Date().toISOString(),
  });
}
