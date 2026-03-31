import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleBlingWebhook } from "./bling-webhook";
import { initializeBaileysOnStartup } from "./baileys-startup";
import { setupBaileysDebugRoutes } from "./baileys-debug";
import { initializeWebSocket } from "./websocket-notifications";
import { startAllAgents } from "../agents/index";

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
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
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
  // Bling webhook for real-time inventory sync
  app.post("/api/bling/webhook", handleBlingWebhook);
  
  // Baileys debug routes
  setupBaileysDebugRoutes(app);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
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
}

startServer().catch(console.error);
