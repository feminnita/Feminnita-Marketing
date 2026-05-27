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
import { registerBlogRoutes } from "../services/blog-server";

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
    res.json({ ok: true, version: "2026-05-09-v3", ts: new Date().toISOString() });
  });

  // ML Session bootstrap — Chris faz login manual no browser e faz upload dos cookies
  // curl -X POST http://localhost:3001/api/ml-session/feminnita \
  //   -H "x-session-secret: SEU_SECRET" -H "Content-Type: application/json" -d @cookies.json
  app.post("/api/ml-session/:account", async (req, res) => {
    const secret = req.headers["x-session-secret"];
    if (process.env.ML_SESSION_SECRET && secret !== process.env.ML_SESSION_SECRET) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const account = req.params.account;
    if (!["feminnita", "fnt"].includes(account)) {
      return res.status(400).json({ error: "Conta inválida. Use feminnita ou fnt." });
    }
    const cookies = req.body;
    if (!Array.isArray(cookies) || cookies.length === 0) {
      return res.status(400).json({ error: "Body deve ser array de cookies" });
    }
    try {
      const { importMLSession } = await import("../agents/ml-ads-browser-agent");
      await importMLSession(cookies, account as "feminnita" | "fnt");
      return res.json({ ok: true, account, cookies: cookies.length });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Debug: insere ação de teste no banco (remove após validar o agente)
  app.post("/api/debug/test-action", async (_req, res) => {
    try {
      const { getDb } = await import("../db");
      const { agentActions } = await import("../../drizzle/schema");
      const db = await getDb();
      if (!db) return res.status(503).json({ error: "Banco indisponível" });
      const today = new Date().toISOString().slice(0, 10);
      await db.insert(agentActions).values({
        agentName:       "gabi",
        date:            today,
        title:           "TESTE — Verificar autenticação Playwright",
        description:     "Ação de teste para validar login do agente via token OAuth",
        actionType:      "update_ads_budget",
        priority:        "alta",
        estimatedImpact: "Teste de integração",
        status:          "pending",
        payload: {
          account:      "feminnita",
          action:       "update_ads_budget",
          budget:       50,
          campaignId:   "PIJAMA BERMUDA 26.09",
          campaignName: "PIJAMA BERMUDA 26.09",
          platform:     "ml",
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      return res.json({ ok: true, message: "Ação de teste criada — aguarde até 5min para execução" });
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
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
        actions: rows.map((r: typeof rows[number]) => ({
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

  // Debug: serve último screenshot do browser agent ML
  app.get("/api/debug/screenshot/:label?", async (req, res) => {
    try {
      const fsMod = await import("fs");
      const pathMod = await import("path");
      const dir = "/var/www/feminnita-marketing/debug-screenshots";
      if (!fsMod.default.existsSync(dir)) return res.status(404).json({ error: "Nenhum screenshot ainda" });
      const files = fsMod.default.readdirSync(dir)
        .filter((f: string) => f.endsWith(".png"))
        .map((f: string) => ({ name: f, mtime: fsMod.default.statSync(pathMod.default.join(dir, f)).mtimeMs }))
        .sort((a: any, b: any) => b.mtime - a.mtime);
      if (!files.length) return res.status(404).json({ error: "Nenhum screenshot ainda" });
      const label = req.params.label;
      const match = label ? files.find((f: any) => f.name.includes(label)) : files[0];
      const target = match || files[0];
      res.setHeader("Content-Type", "image/png");
      res.setHeader("X-Screenshot-Name", target.name);
      fsMod.default.createReadStream(pathMod.default.join(dir, target.name)).pipe(res);
    } catch (e: any) {
      return res.status(500).json({ error: e.message });
    }
  });

  // Debug: lista todos os screenshots salvos
  app.get("/api/debug/screenshots", async (_req, res) => {
    try {
      const fsMod = await import("fs");
      const pathMod = await import("path");
      const dir = "/var/www/feminnita-marketing/debug-screenshots";
      if (!fsMod.default.existsSync(dir)) return res.json({ files: [] });
      const files = fsMod.default.readdirSync(dir)
        .filter((f: string) => f.endsWith(".png"))
        .map((f: string) => ({ name: f, mtime: new Date(fsMod.default.statSync(pathMod.default.join(dir, f)).mtimeMs) }))
        .sort((a: any, b: any) => b.mtime.getTime() - a.mtime.getTime())
        .slice(0, 20);
      return res.json({ files });
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

  // Transcrição de reunião/áudio via Whisper
  {
    const multer = (await import("multer")).default;
    const pathMod = await import("path");
    const fsMod = await import("fs");
    const cryptoMod = await import("crypto");
    const uploadsDir = pathMod.default.resolve(process.cwd(), "uploads");
    if (!fsMod.default.existsSync(uploadsDir)) fsMod.default.mkdirSync(uploadsDir, { recursive: true });
    const audioStorage = multer.diskStorage({
      destination: (_req, _file, cb) => cb(null, uploadsDir),
      filename: (_req, file, cb) => {
        const ext = pathMod.default.extname(file.originalname) || ".mp3";
        cb(null, `transcricao-${Date.now()}-${cryptoMod.default.randomBytes(4).toString("hex")}${ext}`);
      },
    });
    const uploadAudio = multer({
      storage: audioStorage,
      limits: { fileSize: 100 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ["audio/", "video/"];
        if (allowed.some(t => file.mimetype.startsWith(t))) cb(null, true);
        else cb(new Error("Formato não suportado. Envie um arquivo de áudio ou vídeo."));
      },
    });
    app.post("/api/transcricao/audio", uploadAudio.single("file"), async (req: any, res: any) => {
      if (!req.file) return res.status(400).json({ error: "Nenhum arquivo enviado" });
      const { transcribeAudio } = await import("./voiceTranscription");
      const fileUrl = `http://localhost:${ENV.port || 3002}/uploads/${req.file.filename}`;
      const language = req.body?.language || "pt";
      const result = await transcribeAudio({ audioUrl: fileUrl, language });
      fsMod.default.unlink(req.file.path, () => {});
      if ("error" in result) return res.status(422).json(result);
      return res.json(result);
    });
  }

  // Blog público — GET /blog, GET /blog/:slug, GET /blog/feed.xml
  registerBlogRoutes(app);

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
