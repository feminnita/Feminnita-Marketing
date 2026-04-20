import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes, registerDebugRoutes } from "./oauth";
import { registerMLOAuthRoutes } from "../routers/ml-oauth";
import { registerShopeeOAuthRoutes } from "../routers/shopee-oauth";
import { registerTiktokShopOAuthRoutes } from "../routers/tiktok-shop-oauth";
import { registerInstagramWebhook } from "../routers/instagram-comments";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleBlingWebhook } from "./bling-webhook";
import { handleTrayWebhook } from "./tray-webhook";
import { initializeBaileysOnStartup } from "./baileys-startup";
import { setupBaileysDebugRoutes } from "./baileys-debug";
import { initializeWebSocket } from "./websocket-notifications";
import { startAllAgents } from "../agents/index";
import { updateMarketKnowledge } from "../agents/knowledge-updater";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser — captura raw body para validação X-Hub-Signature-256
  app.use(express.json({
    limit: "50mb",
    verify: (req: any, _res, buf) => { req.rawBody = buf; },
  }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Inicializar WebSocket para notificações em tempo real
  try {
    initializeWebSocket(server);
    console.log("[WebSocket] Inicializado com sucesso");
  } catch (error) {
    console.error("[WebSocket] Erro ao inicializar:", error);
  }
  
  // Inicializar Baileys no startup
  try {
    await initializeBaileysOnStartup();
    console.log("[Baileys] Inicializado com sucesso no startup");
  } catch (error) {
    console.error("[Baileys] Erro ao inicializar:", error);
  }

  // Inicializar agentes de automação
  try {
    startAllAgents();
    console.log("[Agents] Agentes de automação iniciados com sucesso");
  } catch (error) {
    console.error("[Agents] Erro ao iniciar agentes:", error);
  }

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  registerDebugRoutes(app);
  // ML OAuth routes: /api/ml/start and /api/ml/callback
  registerMLOAuthRoutes(app);
  // Shopee OAuth routes: /api/shopee/start, /api/shopee/callback, /api/shopee/status
  registerShopeeOAuthRoutes(app);
  // TikTok Shop OAuth routes: /api/tiktok-shop/start, /api/tiktok-shop/callback, /api/tiktok-shop/status
  registerTiktokShopOAuthRoutes(app);

  // Google Drive OAuth: /api/google/start e /api/google/callback
  const { getGoogleOAuthUrl, exchangeCodeForTokens } = await import("../services/googleDrive");
  const googleRedirect = (process.env.APP_URL || "http://localhost:3001") + "/api/google/callback";
  app.get("/api/google/start", (_req, res) => {
    const url = getGoogleOAuthUrl(googleRedirect);
    res.redirect(url);
  });
  app.get("/api/google/callback", async (req, res) => {
    const code = req.query.code as string;
    if (!code) return res.status(400).send("Código ausente");
    const tokens = await exchangeCodeForTokens(code, googleRedirect);
    if (!tokens) return res.status(500).send("Falha ao obter tokens do Google");
    res.send(`<h2>Google Drive conectado!</h2><p>Refresh token obtido. Adicione ao .env:</p><pre>GOOGLE_DRIVE_REFRESH_TOKEN=${tokens.refreshToken}</pre><p><a href="/">Voltar ao sistema</a></p>`);
  });
  // Bling webhook for real-time inventory sync
  app.post("/api/bling/webhook", handleBlingWebhook);
  // Tray webhook for FNT website order events → Meta CAPI
  app.post("/api/tray/webhook", handleTrayWebhook);
  // Instagram comments webhook (GET = verificação, POST = eventos)
  registerInstagramWebhook(app);
  
  // Baileys debug routes
  setupBaileysDebugRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
      onError({ path, error }) {
        console.error(`[tRPC Error] ${path}:`, error.message);
      },
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });

  // Weekly market knowledge update — every Sunday at 08:00
  scheduleWeeklyKnowledgeUpdate();
}

function scheduleWeeklyKnowledgeUpdate() {
  const checkAndRun = () => {
    const now = new Date();
    const isSunday = now.getDay() === 0;
    const isEightAM = now.getHours() === 8 && now.getMinutes() < 5;
    if (isSunday && isEightAM) {
      console.log("[KnowledgeUpdater] Iniciando atualização semanal...");
      updateMarketKnowledge().then((r) =>
        console.log(`[KnowledgeUpdater] Concluído: ${r.updated.join(", ")}`)
      ).catch(console.error);
    }
  };
  // Check every 5 minutes
  setInterval(checkAndRun, 5 * 60 * 1000);
}

startServer().catch(console.error);
