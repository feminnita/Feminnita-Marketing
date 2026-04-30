import { exec } from "child_process";
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

    res.json({ ok: true, msg: "Deploy iniciado" });

    // Roda deploy em background
    const cmd = "cd /opt/marketing && git pull && npm run build && pm2 restart feminnita";
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
