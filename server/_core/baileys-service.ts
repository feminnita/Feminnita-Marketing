import { WASocket, DisconnectReason, useMultiFileAuthState } from "@whiskeysockets/baileys";
import makeWASocket from "@whiskeysockets/baileys";
import { Boom } from "@hapi/boom";
import path from "path";
import fs from "fs";
import qrcode from "qrcode";
import { processWhatsAppMessage } from "../agents/whatsapp-ai-agent";

interface WhatsAppSession {
  socket: WASocket | null;
  isConnected: boolean;
  qrCode: string | null;
  phoneNumber: string | null;
  userId: number;
}

// Armazenar sessões em memória (em produção, usar banco de dados)
const sessions: Map<number, WhatsAppSession> = new Map();

/**
 * Inicializar conexão WhatsApp com Baileys
 */
export async function initializeWhatsApp(userId: number): Promise<string> {
  try {
    // Verificar se já existe sessão ativa
    if (sessions.has(userId) && sessions.get(userId)?.isConnected) {
      return "Já conectado";
    }

    // Diretório de autenticação
    const authDir = path.join(process.cwd(), ".auth", `user_${userId}`);
    if (!fs.existsSync(authDir)) {
      fs.mkdirSync(authDir, { recursive: true });
    }

    // Carregar estado de autenticação
    const { state, saveCreds } = await useMultiFileAuthState(authDir);

    // Criar socket
    const socket = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      browser: ["Feminnita", "Chrome", "1.0.0"],
      syncFullHistory: false,
      markOnlineOnConnect: true,
      generateHighQualityLinkPreview: true,
    });

    // Evento: QR Code
    socket.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr } = update;

      if (qr) {
        // Gerar QR Code como imagem base64
        const qrImage = await qrcode.toDataURL(qr);
        const session = sessions.get(userId);
        if (session) {
          session.qrCode = qrImage;
        }
        console.log(`[WhatsApp QR] User ${userId}: Escaneie o QR Code`);
      }

      if (connection === "connecting") {
        console.log(`[WhatsApp] User ${userId}: Conectando...`);
      }

      if (connection === "open") {
        console.log(`[WhatsApp] User ${userId}: Conectado com sucesso!`);
        const session = sessions.get(userId);
        if (session) {
          session.isConnected = true;
          session.qrCode = null;
          // Obter número do telefone
          const jid = socket.user?.id;
          if (jid) {
            session.phoneNumber = jid.split(":")[0];
          }
        }
      }

      if (connection === "close") {
        const shouldReconnect =
          (lastDisconnect?.error as Boom)?.output?.statusCode !==
          DisconnectReason.loggedOut;

        console.log(
          `[WhatsApp] User ${userId}: Desconectado. Reconectar: ${shouldReconnect}`
        );

        const session = sessions.get(userId);
        if (session) {
          session.isConnected = false;
          session.socket = null;
        }

        if (shouldReconnect) {
          // Reconectar automaticamente
          setTimeout(() => initializeWhatsApp(userId), 3000);
        }
      }
    });

    // Salvar credenciais quando atualizadas
    socket.ev.on("creds.update", saveCreds);

    // Evento: Mensagens recebidas
    socket.ev.on("messages.upsert", async (m) => {
      const msg = m.messages[0];
      if (!msg.key.fromMe && msg.message) {
        const remoteJid = msg.key.remoteJid ?? "";
        const textContent =
          msg.message.conversation ||
          msg.message.extendedTextMessage?.text ||
          "";

        console.log(`[WhatsApp Message] De ${remoteJid}: ${textContent || "[Mídia]"}`);

        if (!textContent) return; // Ignora mensagens sem texto (mídia, stickers, etc.)

        // Extrair número limpo (sem sufixo @s.whatsapp.net)
        const phoneNumber = remoteJid.split("@")[0];

        // Obter nome do contato, se disponível
        const contactName =
          (msg as any).pushName ||
          (msg as any).notifyName ||
          phoneNumber;

        // Processar com IA e enviar resposta se disponível
        const aiResponse = await processWhatsAppMessage(
          userId,
          phoneNumber,
          contactName,
          textContent
        );

        if (aiResponse) {
          const session = sessions.get(userId);
          if (session?.socket && session.isConnected) {
            await session.socket.sendMessage(remoteJid, { text: aiResponse });
            console.log(`[WhatsApp AI] Resposta enviada para ${remoteJid}`);
          }
        }
      }
    });

    // Armazenar sessão
    sessions.set(userId, {
      socket,
      isConnected: false,
      qrCode: null,
      phoneNumber: null,
      userId,
    });

    return "Inicializado. Aguardando QR Code...";
  } catch (error) {
    console.error(`[WhatsApp Error] User ${userId}:`, error);
    throw error;
  }
}

/**
 * Obter QR Code para escanear
 */
export function getQRCode(userId: number): string | null {
  const session = sessions.get(userId);
  return session?.qrCode || null;
}

/**
 * Verificar status de conexão
 */
export function getConnectionStatus(userId: number): {
  isConnected: boolean;
  phoneNumber: string | null;
  qrCode: string | null;
} {
  const session = sessions.get(userId);
  return {
    isConnected: session?.isConnected || false,
    phoneNumber: session?.phoneNumber || null,
    qrCode: session?.qrCode || null,
  };
}

/**
 * Enviar mensagem de texto
 */
export async function sendTextMessage(
  userId: number,
  phoneNumber: string,
  message: string
): Promise<boolean> {
  try {
    const session = sessions.get(userId);
    if (!session?.socket || !session.isConnected) {
      throw new Error("WhatsApp não conectado");
    }

    const jid = phoneNumber.includes("@") ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
    await session.socket.sendMessage(jid, { text: message });
    console.log(`[WhatsApp Send] Para ${phoneNumber}: ${message}`);
    return true;
  } catch (error) {
    console.error(`[WhatsApp Send Error] User ${userId}:`, error);
    return false;
  }
}

/**
 * Enviar mídia (imagem, vídeo, áudio, documento)
 */
export async function sendMediaMessage(
  userId: number,
  phoneNumber: string,
  mediaPath: string,
  caption?: string
): Promise<boolean> {
  try {
    const session = sessions.get(userId);
    if (!session?.socket || !session.isConnected) {
      throw new Error("WhatsApp não conectado");
    }

    const jid = phoneNumber.includes("@") ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
    const fileBuffer = fs.readFileSync(mediaPath);
    const mimeType = getMimeType(mediaPath);

    if (mimeType.startsWith("image/")) {
      await session.socket.sendMessage(jid, {
        image: fileBuffer,
        caption: caption || "",
      });
    } else if (mimeType.startsWith("video/")) {
      await session.socket.sendMessage(jid, {
        video: fileBuffer,
        caption: caption || "",
      });
    } else if (mimeType.startsWith("audio/")) {
      await session.socket.sendMessage(jid, {
        audio: fileBuffer,
        mimetype: mimeType,
      });
    } else {
      await session.socket.sendMessage(jid, {
        document: fileBuffer,
        mimetype: mimeType,
        fileName: path.basename(mediaPath),
      });
    }

    console.log(`[WhatsApp Send Media] Para ${phoneNumber}: ${mediaPath}`);
    return true;
  } catch (error) {
    console.error(`[WhatsApp Send Media Error] User ${userId}:`, error);
    return false;
  }
}

/**
 * Obter contatos
 */
export async function getContacts(userId: number): Promise<any[]> {
  try {
    const session = sessions.get(userId);
    if (!session?.socket || !session.isConnected) {
      return [];
    }

    const contacts = await session.socket.fetchStatus();
    return contacts ? [contacts] : [];
  } catch (error) {
    console.error(`[WhatsApp Get Contacts Error] User ${userId}:`, error);
    return [];
  }
}

/**
 * Desconectar WhatsApp
 */
export async function disconnectWhatsApp(userId: number): Promise<void> {
  try {
    const session = sessions.get(userId);
    if (session?.socket) {
      await session.socket.logout();
      session.isConnected = false;
      session.socket = null;
      console.log(`[WhatsApp] User ${userId}: Desconectado`);
    }
  } catch (error) {
    console.error(`[WhatsApp Disconnect Error] User ${userId}:`, error);
  }
}

/**
 * Obter tipo MIME do arquivo
 */
function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  const mimeTypes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".mp4": "video/mp4",
    ".avi": "video/avi",
    ".mov": "video/quicktime",
    ".mp3": "audio/mpeg",
    ".wav": "audio/wav",
    ".m4a": "audio/mp4",
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  };

  return mimeTypes[ext] || "application/octet-stream";
}

/**
 * Obter todas as sessões ativas
 */
export function getActiveSessions(): WhatsAppSession[] {
  return Array.from(sessions.values()).filter((s) => s.isConnected);
}
