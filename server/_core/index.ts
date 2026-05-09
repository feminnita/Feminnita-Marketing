import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes, registerDebugRoutes } from "./oauth";
import { registerMLOAuthRoutes } from "../routers/ml-oauth";
import { registerShopeeOAuthRoutes } from "../routers/shopee-oauth";
import { registerTiktokShopOAuthRoutes } from "../routers/tiktok-shop-oauth";
import { registerTiktokOAuthRoutes } from "../routers/tiktok-oauth";
import { registerInstagramWebhook } from "../routers/instagram-comments";
import { registerWhatsAppFunnelWebhook } from "../routers/whatsapp-funnel-webhook";
import { registerCartRecoveryWebhook, scheduleCartFollowUps } from "../routers/whatsapp-cart-recovery";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { handleBlingWebhook } from "./bling-webhook";
import { registerDeployWebhook } from "./deploy-webhook";
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

  // Auto-deploy via GitHub webhook
  registerDeployWebhook(app);

  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  registerDebugRoutes(app);
  // ML OAuth routes: /api/ml/start and /api/ml/callback
  registerMLOAuthRoutes(app);
  // Shopee OAuth routes: /api/shopee/start, /api/shopee/callback, /api/shopee/status
  registerShopeeOAuthRoutes(app);
  // TikTok Shop OAuth routes: /api/tiktok-shop/start, /api/tiktok-shop/callback, /api/tiktok-shop/status
  registerTiktokShopOAuthRoutes(app);
  // TikTok Login Kit OAuth routes: /api/tiktok/start, /api/tiktok/callback
  registerTiktokOAuthRoutes(app);
  // GA4 OAuth routes: /api/ga4/start, /api/ga4/callback
  const { registerGA4OAuthRoutes } = await import("../routers/ga4-oauth");
  registerGA4OAuthRoutes(app);
  // Meta OAuth routes: /api/meta/start, /api/meta/callback
  const { registerMetaOAuthRoutes } = await import("../routers/meta-oauth");
  registerMetaOAuthRoutes(app);

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
  // WhatsApp Funnel webhook (GET = verificação Meta, POST = mensagens)
  registerWhatsAppFunnelWebhook(app);
  // WhatsApp Cart Recovery — recebe webhook Tray e envia mensagens de recuperação
  registerCartRecoveryWebhook(app);
  scheduleCartFollowUps();
  
  // Baileys debug routes
  setupBaileysDebugRoutes(app);

  // Health check — confirma versão deployada
  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, version: "2026-05-09-v2", ts: new Date().toISOString() });
  });

  // Debug endpoint — últimas ações da Gabi (sem auth, VPS interno)
  app.get("/api/debug/agent-actions", async (_req, res) => {
    try {
      const { getDb } = await import("../db");
      const { desc, eq } = await import("drizzle-orm");
      const { agentActions } = await import("../../drizzle/schema");
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Banco indisponível" });
      const rows = await db
        .select()
        .from(agentActions)
        .where(eq(agentActions.agentName, "gabi"))
        .orderBy(desc(agentActions.createdAt))
        .limit(20);
      return res.json({
        count: rows.length,
        actions: rows.map(r => ({
          id: r.id,
          status: r.status,
          actionType: r.actionType,
          title: r.title,
          createdAt: r.createdAt,
          executedAt: r.executedAt,
          executionLog: r.executionLog,
          payload: r.payload,
        })),
      });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Upload de mídias (imagens/vídeos) para o Studio
  {
    const multer = (await import("multer")).default;
    const pathMod = await import("path");
    const fsMod = await import("fs");
    const cryptoMod = await import("crypto");
    const uploadsDir = pathMod.default.resolve(process.cwd(), "uploads");
    if (!fsMod.default.existsSync(uploadsDir)) fsMod.default.mkdirSync(uploadsDir, { recursive: true });
    const storage = multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadsDir),
      filename: (_req, file, cb) => {
        const ext = pathMod.default.extname(file.originalname) || ".jpg";
        cb(null, `${Date.now()}-${cryptoMod.default.randomBytes(6).toString("hex")}${ext}`);
      },
    });
    const upload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });
    app.post("/api/upload/media", upload.single("file"), (req: any, res: any) => {
      if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });
      res.json({ url: `/uploads/${req.file.filename}`, name: req.file.originalname });
    });
  }

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
  // Serve uploaded assets (product images, etc.)
  const { default: fs } = await import("fs");
  const { default: pathMod } = await import("path");
  const uploadsPath = pathMod.resolve(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
  app.use("/uploads", express.static(uploadsPath));

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
