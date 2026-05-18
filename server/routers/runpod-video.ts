import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { videoJobs, videoPlans } from "../../drizzle/schema";
import { eq, desc, and, gte, count } from "drizzle-orm";
import { debitCredits } from "./video-credits";
import Anthropic from "@anthropic-ai/sdk";

// ── Prompt optimizer (Claude Haiku) ──────────────────────────────────────────
async function optimizeVideoPrompt(userPrompt: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return userPrompt;
  try {
    const client = new Anthropic({ apiKey });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      messages: [{
        role: "user",
        content: `You are a video generation prompt engineer for WanVideo I2V model.
Convert the user's description into a precise, detailed English prompt optimized for realistic fashion/clothing video generation.

Rules:
- Be specific about body parts, movement direction, speed, and garment behavior
- Use cinematic language: "smooth motion", "natural fabric movement", "realistic physics"
- Include lighting and camera style: "studio lighting, static camera"
- Keep it under 150 words
- Return ONLY the optimized prompt, no explanation

User request (in any language): "${userPrompt}"`,
      }],
    });
    const text = (msg.content[0] as any).text?.trim();
    return text || userPrompt;
  } catch {
    return userPrompt;
  }
}

// ── SiliconFlow — Modo Livre (WanVideo I2V) ───────────────────────────────────
const SF_BASE = "https://api.siliconflow.com/v1";

function getSfKey() {
  const key = process.env.SILICONFLOW_API_KEY;
  if (!key) throw new Error("SILICONFLOW_API_KEY não configurado no .env");
  return key;
}

async function sfSubmit(imageBase64: string, mimeType: string, prompt: string): Promise<string> {
  const res = await fetch(`${SF_BASE}/video/submit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getSfKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "Wan-AI/Wan2.2-I2V-A14B",
      prompt,
      image: `data:${mimeType};base64,${imageBase64}`,
      negative_prompt: "low quality, blurry, distorted, watermark",
      seed: Math.floor(Math.random() * 9999999999),
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`SiliconFlow submit ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json() as any;
  if (!data.requestId) throw new Error(`SiliconFlow: ${JSON.stringify(data).slice(0, 200)}`);
  return data.requestId as string;
}

async function sfGetStatus(requestId: string): Promise<{ status: string; videoUrl?: string; error?: string }> {
  const res = await fetch(`${SF_BASE}/video/status`, {
    method: "POST",
    headers: { Authorization: `Bearer ${getSfKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requestId }),
  });
  if (!res.ok) throw new Error(`SiliconFlow status ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  const data = await res.json() as any;
  if (data.status === "Succeed") {
    return { status: "COMPLETED", videoUrl: data.results?.videos?.[0]?.url };
  }
  if (data.status === "Failed") {
    return { status: "FAILED", error: data.reason ?? "Falha na geração SiliconFlow" };
  }
  return { status: "IN_PROGRESS" };
}

// ── RunningHub — Running Up (WanVideo Animate + ViTPose) ─────────────────────
const RH_BASE = "https://www.runninghub.ai/task/openapi";
const RH_WORKFLOW_ID = "2055765881283727362";

function getRhKey() {
  const key = process.env.RUNNINGHUB_API_KEY;
  if (!key) throw new Error("RUNNINGHUB_API_KEY não configurado no .env");
  return key;
}

async function rhUpload(base64: string, fileName: string, mimeType: string): Promise<{ fileName: string; fileUrl: string }> {
  const apiKey = getRhKey();
  const buffer = Buffer.from(base64, "base64");
  const blob = new Blob([buffer], { type: mimeType });

  const form = new FormData();
  form.append("apiKey", apiKey);
  form.append("fileType", "input");
  form.append("file", blob, fileName);

  const res = await fetch(`${RH_BASE}/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });
  if (!res.ok) throw new Error(`RunningHub upload ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  const data = await res.json() as any;
  if (data.code !== 0) throw new Error(`RunningHub upload: ${data.msg}`);
  const uploadedName = data.data.fileName as string;
  // uploadedName vem como "api/hash.jpg" — URL pública é https://www.runninghub.ai/{uploadedName}
  const fileUrl = `https://www.runninghub.ai/${uploadedName}`;
  return { fileName: uploadedName, fileUrl };
}

async function rhCreateTask(imageFileName: string, videoFileName: string): Promise<string> {
  const apiKey = getRhKey();
  const res = await fetch(`${RH_BASE}/create`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey,
      workflowId: RH_WORKFLOW_ID,
      nodeInfoList: [
        { nodeId: "391", fieldName: "image", fieldValue: imageFileName },
        { nodeId: "392", fieldName: "video", fieldValue: videoFileName },
      ],
    }),
  });
  if (!res.ok) throw new Error(`RunningHub create ${res.status}`);
  const data = await res.json() as any;
  if (data.code !== 0) throw new Error(`RunningHub create: ${data.msg}`);
  return data.data.taskId as string;
}

async function rhGetStatus(taskId: string): Promise<{ status: string; videoUrl?: string; error?: string }> {
  const apiKey = getRhKey();

  const statusRes = await fetch(`${RH_BASE}/status`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey, taskId }),
  });
  if (!statusRes.ok) throw new Error(`RunningHub status ${statusRes.status}`);
  const statusData = await statusRes.json() as any;
  const taskStatus: string = typeof statusData.data === "string"
    ? statusData.data
    : (statusData.data?.taskStatus ?? "RUNNING");

  if (taskStatus === "SUCCESS") {
    const outputRes = await fetch(`${RH_BASE}/outputs`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey, taskId }),
    });
    if (outputRes.ok) {
      const outputData = await outputRes.json() as any;
      const outputs: Array<{ fileUrl: string; fileType: string }> = outputData.data ?? [];
      const videoOutput = outputs.find(o => ["mp4", "webm", "mov"].includes((o.fileType ?? "").toLowerCase())) ?? outputs[0];
      return { status: "SUCCESS", videoUrl: videoOutput?.fileUrl };
    }
  }

  if (taskStatus === "FAILED" || taskStatus === "ERROR") {
    return { status: "FAILED", error: statusData.msg ?? "Erro no RunningHub" };
  }

  return { status: taskStatus };
}

// ── Quota helpers ─────────────────────────────────────────────────────────────
async function getOrCreatePlan(userId: number, db: any) {
  const rows = await db.select().from(videoPlans).where(eq(videoPlans.userId, userId)).limit(1);
  if (rows.length > 0) return rows[0];
  await db.insert(videoPlans).values({
    userId,
    livreMonthlyLimit: 30,
    runningUpMonthlyLimit: 30,
    livreExtraCredits: 0,
    runningUpExtraCredits: 0,
  });
  const newRows = await db.select().from(videoPlans).where(eq(videoPlans.userId, userId)).limit(1);
  return newRows[0];
}

async function getMonthCount(userId: number, mode: "livre" | "runningup", db: any): Promise<number> {
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const rows = await db.select({ cnt: count() }).from(videoJobs).where(
    and(eq(videoJobs.userId, userId), eq(videoJobs.mode, mode), gte(videoJobs.createdAt, monthStart))
  );
  return Number(rows[0]?.cnt ?? 0);
}

async function assertQuota(userId: number, mode: "livre" | "runningup", db: any) {
  const plan = await getOrCreatePlan(userId, db);
  const used = await getMonthCount(userId, mode, db);
  const limit = mode === "livre"
    ? plan.livreMonthlyLimit + plan.livreExtraCredits
    : plan.runningUpMonthlyLimit + plan.runningUpExtraCredits;
  if (used >= limit) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: `Quota esgotada: ${used}/${limit} vídeos este mês. Adquira créditos adicionais.`,
    });
  }
}

// ── Router ────────────────────────────────────────────────────────────────────
export const runpodVideoRouter = router({

  // Modo Livre: foto + prompt → MiniMax Hailuo I2V
  generate: protectedProcedure
    .input(z.object({
      imageBase64: z.string().min(100),
      imageMimeType: z.string().default("image/jpeg"),
      prompt: z.string().min(5).max(2000),
      durationSeconds: z.number().int().min(5).max(15).default(6),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (db) await debitCredits(ctx.user.id, "livre", db);
      const optimizedPrompt = await optimizeVideoPrompt(input.prompt);
      const taskId = await sfSubmit(input.imageBase64, input.imageMimeType, optimizedPrompt);
      if (db) {
        await db.insert(videoJobs).values({
          userId: ctx.user.id,
          runpodJobId: taskId,
          mode: "livre",
          status: "queued",
          durationSeconds: input.durationSeconds,
          createdAt: new Date(),
        }).catch(() => null);
      }
      return { jobId: taskId };
    }),

  status: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      const result = await sfGetStatus(input.jobId);
      const db = await getDb();
      if (db && result.status === "COMPLETED") {
        await db.update(videoJobs)
          .set({ status: "completed", completedAt: new Date() })
          .where(eq(videoJobs.runpodJobId, input.jobId)).catch(() => null);
      } else if (db && result.status === "FAILED") {
        await db.update(videoJobs)
          .set({ status: "failed", completedAt: new Date() })
          .where(eq(videoJobs.runpodJobId, input.jobId)).catch(() => null);
      }
      return { status: result.status, videoUrl: result.videoUrl, error: result.error };
    }),

  history: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { jobs: [] };
      const jobs = await db.select({
        id: videoJobs.id,
        runpodJobId: videoJobs.runpodJobId,
        status: videoJobs.status,
        durationSeconds: videoJobs.durationSeconds,
        errorMessage: videoJobs.errorMessage,
        completedAt: videoJobs.completedAt,
        createdAt: videoJobs.createdAt,
      })
        .from(videoJobs)
        .where(eq(videoJobs.userId, ctx.user.id))
        .orderBy(desc(videoJobs.createdAt))
        .limit(input.limit);
      return { jobs };
    }),

  checkConfig: protectedProcedure.query(() => ({
    falConfigured: !!process.env.SILICONFLOW_API_KEY,
    rhConfigured: !!process.env.RUNNINGHUB_API_KEY,
  })),

  getQuota: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return {
      livre:     { used: 0, limit: 30, extra: 0 },
      runningup: { used: 0, limit: 30, extra: 0 },
    };
    const plan = await getOrCreatePlan(ctx.user.id, db);
    const [livreUsed, ruUsed] = await Promise.all([
      getMonthCount(ctx.user.id, "livre", db),
      getMonthCount(ctx.user.id, "runningup", db),
    ]);
    return {
      livre:     { used: livreUsed, limit: plan.livreMonthlyLimit,     extra: plan.livreExtraCredits },
      runningup: { used: ruUsed,    limit: plan.runningUpMonthlyLimit,  extra: plan.runningUpExtraCredits },
    };
  }),

  adminAddCredits: protectedProcedure
    .input(z.object({
      userId: z.number().int(),
      mode: z.enum(["livre", "runningup"]),
      credits: z.number().int().min(1).max(1000),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new Error("DB não disponível");
      const plan = await getOrCreatePlan(input.userId, db);
      const update = input.mode === "livre"
        ? { livreExtraCredits: plan.livreExtraCredits + input.credits }
        : { runningUpExtraCredits: plan.runningUpExtraCredits + input.credits };
      await db.update(videoPlans).set(update).where(eq(videoPlans.userId, input.userId));
      return { ok: true };
    }),

  // Running Up: foto + vídeo referência → RunningHub WanVideo Animate + ViTPose
  runningUpGenerate: protectedProcedure
    .input(z.object({
      imageBase64: z.string().min(100),
      videoBase64: z.string().min(100),
      imageName: z.string().default("produto.jpg"),
      videoName: z.string().default("referencia.mp4"),
      imageMimeType: z.string().default("image/jpeg"),
      videoMimeType: z.string().default("video/mp4"),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (db) await debitCredits(ctx.user.id, "runningup", db);
      const [imageUp, videoUp] = await Promise.all([
        rhUpload(input.imageBase64, input.imageName, input.imageMimeType),
        rhUpload(input.videoBase64, input.videoName, input.videoMimeType),
      ]);

      const taskId = await rhCreateTask(imageUp.fileName, videoUp.fileName);

      if (db) {
        await db.insert(videoJobs).values({
          userId: ctx.user.id,
          runpodJobId: taskId,
          mode: "runningup",
          status: "queued",
          durationSeconds: 0,
          createdAt: new Date(),
        }).catch(() => null);
      }
      return { taskId };
    }),

  runningUpStatus: protectedProcedure
    .input(z.object({ taskId: z.string() }))
    .query(async ({ input }) => {
      const result = await rhGetStatus(input.taskId);
      return {
        status: result.status,
        videoUrl: result.videoUrl,
        error: result.error,
      };
    }),

  // Geração de voz Fernanda via ElevenLabs
  generateVoice: protectedProcedure
    .input(z.object({ text: z.string().min(5).max(1000) }))
    .mutation(async ({ input }) => {
      const voiceId = process.env.ELEVENLABS_VOICE_ID_FERNANDA || "RGymW84CSmfVugnA5tvA";
      const apiKey = process.env.ELEVENLABS_API_KEY;
      if (!apiKey) throw new Error("ELEVENLABS_API_KEY não configurado");

      const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: "POST",
        headers: { "xi-api-key": apiKey, "Content-Type": "application/json", Accept: "audio/mpeg" },
        body: JSON.stringify({
          text: input.text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });
      if (!res.ok) throw new Error(`ElevenLabs ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
      const buffer = await res.arrayBuffer();
      return { audioBase64: Buffer.from(buffer).toString("base64"), mimeType: "audio/mpeg" };
    }),
});
