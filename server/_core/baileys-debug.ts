/**
 * Endpoints de debug para Baileys
 * Útil para testar a conexão sem passar pelo tRPC
 */

import { Express } from "express";
import { initializeWhatsApp, getQRCode, getConnectionStatus } from "./baileys-service";

export function setupBaileysDebugRoutes(app: Express): void {
  // Endpoint para iniciar conexão
  app.get("/api/debug/baileys/connect", async (req, res) => {
    try {
      const userId = 1;
      console.log(`[Debug] Iniciando conexão Baileys para usuário ${userId}`);
      
      const result = await initializeWhatsApp(userId);
      
      res.json({
        success: true,
        message: result,
        userId,
      });
    } catch (error) {
      console.error("[Debug] Erro ao conectar:", error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  });

  // Endpoint para obter QR Code (com polling)
  app.get("/api/debug/baileys/qr", async (req, res) => {
    try {
      const userId = 1;
      const maxWait = 30000;
      const pollInterval = 500;
      const startTime = Date.now();
      
      console.log(`[Debug] QR Code solicitado para usuário ${userId}`);
      
      // Polling para aguardar QR Code
      while (Date.now() - startTime < maxWait) {
        const qrCode = getQRCode(userId);
        
        if (qrCode) {
          console.log(`[Debug] QR Code encontrado após ${Date.now() - startTime}ms`);
          return res.json({
            success: true,
            hasQRCode: true,
            qrCode,
            waitTime: Date.now() - startTime,
          });
        }
        
        // Aguardar antes de tentar novamente
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
      
      // Timeout
      console.log(`[Debug] Timeout aguardando QR Code`);
      res.json({
        success: false,
        message: "Timeout aguardando QR Code. Tente novamente.",
        hasQRCode: false,
        waitTime: maxWait,
      });
    } catch (error) {
      console.error("[Debug] Erro ao obter QR Code:", error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  });

  // Endpoint para obter status
  app.get("/api/debug/baileys/status", async (req, res) => {
    try {
      const userId = 1;
      const status = getConnectionStatus(userId);
      
      console.log(`[Debug] Status solicitado para usuário ${userId}:`, status);
      
      res.json({
        success: true,
        status,
      });
    } catch (error) {
      console.error("[Debug] Erro ao obter status:", error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  });

  // Endpoint para testar tudo
  app.get("/api/debug/baileys/test-full", async (req, res) => {
    try {
      const userId = 1;
      
      console.log("[Debug] Teste completo iniciado");
      
      // 1. Conectar
      const connectResult = await initializeWhatsApp(userId);
      console.log("[Debug] Conectado:", connectResult);
      
      // 2. Aguardar QR Code com polling
      const maxWait = 30000;
      const pollInterval = 500;
      const startTime = Date.now();
      let qrCode = null;
      
      while (Date.now() - startTime < maxWait && !qrCode) {
        qrCode = getQRCode(userId);
        if (!qrCode) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      }
      
      console.log("[Debug] QR Code gerado:", !!qrCode);
      
      // 3. Obter status
      const status = getConnectionStatus(userId);
      console.log("[Debug] Status:", status);
      
      res.json({
        success: true,
        message: "Teste concluído",
        steps: {
          connect: connectResult,
          qrGenerated: !!qrCode,
          qrCode: qrCode,
          status,
          waitTime: Date.now() - startTime,
        },
      });
    } catch (error) {
      console.error("[Debug] Erro no teste:", error);
      res.status(500).json({
        success: false,
        error: (error as Error).message,
      });
    }
  });
}
