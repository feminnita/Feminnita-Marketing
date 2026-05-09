import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { Request, Response } from "express";
import * as crypto from "crypto";

const DEPLOY_SECRET = process.env.DEPLOY_SECRET || "";

export function registerDeployWebhook(app: any) {
  app.post("/api/deploy", (req: Request, res: Response) => {
    // Verifica assinatura do GitHub
    if (DEPLOY_SECRET) {
      const sig = req.headers["x-hub-signature-256"] as string;
      if (!sig) return res.status(401).json({ error: "Sem assinatura" });

      const hmac = crypto.createHmac("sha256", DEPLOY_SECRET);
      hmac.update((req as any).rawBody || "");
      const expected = `sha256=${hmac.digest("hex")}`;

      if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) {
        return res.status(401).json({ error: "Assinatura inválida" });
      }
    }

    // Só reage a push na branch main
    const event = req.headers["x-github-event"];
    const branch = req.body?.ref;
    if (event === "push" && branch && !branch.endsWith("/main")) {
      return res.json({ ok: true, msg: "Branch ignorada" });
    }

    // Grava env vars no .env do servidor (se enviadas no payload)
    const envVars = req.body?.envVars as Record<string, string> | undefined;
    if (envVars && typeof envVars === "object") {
      const envPath = path.join("/var/www/feminnita-marketing", ".env");
      try {
        let content = fs.existsSync(envPath) ? fs.readFileSync(envPath, "utf8") : "";
        for (const [key, value] of Object.entries(envVars)) {
          if (!/^[A-Z_][A-Z0-9_]*$/.test(key)) continue;
          const line = `${key}=${value}`;
          const regex = new RegExp(`^${key}=.*$`, "m");
          if (regex.test(content)) {
            content = content.replace(regex, line);
          } else {
            content = content.trimEnd() + "\n" + line + "\n";
          }
        }
        fs.writeFileSync(envPath, content, "utf8");
        console.log("[Deploy] .env atualizado:", Object.keys(envVars).join(", "));
      } catch (e: any) {
        console.error("[Deploy] Erro ao atualizar .env:", e.message);
      }
    }

    res.json({ ok: true, msg: "Deploy iniciado" });

    // Roda deploy em background
    const cmd = "cd /var/www/feminnita-marketing && git pull && npm install --legacy-peer-deps && npx playwright install chromium --with-deps && npm run build && pm2 restart feminnita-marketing";
    exec(cmd, (err, stdout, stderr) => {
      if (err) {
        console.error("[Deploy] Erro:", err.message);
        console.error("[Deploy] stderr:", stderr);
      } else {
        console.log("[Deploy] Concluído:", stdout.slice(-200));
      }
    });
  });

  console.log("[Deploy] Webhook registrado em /api/deploy");
}
