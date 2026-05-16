import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { videoJobs } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";
import { fal } from "@fal-ai/client";

// ── fal.ai — Modo Livre (WanVideo I2V) ───────────────────────────────────────
const FAL_BASE = "https://queue.fal.run";
const FAL_MODEL = "fal-ai/wan/v2.2/i2v";

function getFalKey() {
  const key = process.env.FAL_API_KEY;
  if (!key) throw new Error("FAL_API_KEY não configurado no .env");
  return key;
}

async function uploadToFal(base64: string, mimeType: string): Promise<string> {
  fal.config({ credentials: getFalKey() });
  const buffer = Buffer.from(base64, "base64");
  const blob = new Blob([buffer], { type: mimeType });
  return await fal.storage.upload(blob);
}

async function submitFalJob(imageUrl: string, prompt: string, durationSeconds: number): Promise<string> {
  const fps = 16;
  const numFrames = Math.max(16, Math.round(durationSeconds * fps));
  const res = await fetch(`${FAL_BASE}/${FAL_MODEL}`, {
    method: "POST",
    headers: { Authorization: `Key ${getFalKey()}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      image_url: imageUrl,
      prompt,
      negative_prompt: "blurry, distorted, low quality, static, frozen, watermark",
      num_frames: numFrames,
      frames_per_second: fps,
      guidance_scale: 5,
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fal.ai submit ${res.status}: ${text.slice(0, 300)}`);
  }
  const data = await res.json() as any;
  return data.request_id as string;
}

async function getFalStatus(requestId: string): Promise<{ status: string; videoUrl?: string; error?: string }> {
  const res = await fetch(`${FAL_BASE}/${FAL_MODEL}/requests/${requestId}/status`, {
    headers: { Authorization: `Key ${getFalKey()}` },
  });
  if (!res.ok) throw new Error(`fal.ai status ${res.status}`);
  const data = await res.json() as any;

  if (data.status === "COMPLETED") {
    const resultRes = await fetch(`${FAL_BASE}/${FAL_MODEL}/requests/${requestId}`, {
      headers: { Authorization: `Key ${getFalKey()}` },
    });
    if (resultRes.ok) {
      const result = await resultRes.json() as any;
      return { status: "COMPLETED", videoUrl: result.video?.url };
    }
  }
  return {
    status: data.status as string,
    error: typeof data.error === "string" ? data.error : data.error?.message,
  };
}

// ── RunningHub — Running Up (WanVideo Animate + ViTPose) ─────────────────────
const RH_BASE = "https://www.runninghub.ai/task/openapi";
const RH_WORKFLOW_ID = "2055765881283727362";

function getRhKey() {
  const key = process.env.RUNNINGHUB_API_KEY;
  if (!key) throw new Error("RUNNINGHUB_API_KEY não configurado no .env");
  return key;
}

async function rhUpload(base64: string, fileName: string, mimeType: string): Promise<string> {
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
  return data.data.fileName as string;
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
  const taskStatus: string = statusData.data?.taskStatus ?? "RUNNING";

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

function mapFalStatus(s: string): "queued" | "processing" | "completed" | "failed" | "cancelled" {
  switch (s) {
    case "IN_QUEUE": return "queued";
    case "IN_PROGRESS": return "processing";
    case "COMPLETED": return "completed";
    case "FAILED": return "failed";
    default: return "queued";
  }
}

// ── Router ────────────────────────────────────────────────────────────────────
export const runpodVideoRouter = router({

  // Modo Livre: foto + prompt → fal.ai WanVideo
  generate: protectedProcedure
    .input(z.object({
      imageBase64: z.string().min(100),
      prompt: z.string().min(5).max(500),
      durationSeconds: z.number().int().min(3).max(30).default(15),
    }))
    .mutation(async ({ input, ctx }) => {
      const imageUrl = await uploadToFal(input.imageBase64, "image/jpeg");
      const requestId = await submitFalJob(imageUrl, input.prompt, input.durationSeconds);

      const db = await getDb();
      if (db) {
        await db.insert(videoJobs).values({
          userId: ctx.user.id,
          runpodJobId: requestId,
          status: "queued",
          durationSeconds: input.durationSeconds,
          createdAt: new Date(),
        }).catch(() => null);
      }
      return { jobId: requestId };
    }),

  status: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      const result = await getFalStatus(input.jobId);
      const dbStatus = mapFalStatus(result.status);
      const db = await getDb();
      if (db && (dbStatus === "completed" || dbStatus === "failed")) {
        await db.update(videoJobs)
          .set({ status: dbStatus, completedAt: new Date(), errorMessage: result.error?.slice(0, 499) ?? null })
          .where(eq(videoJobs.runpodJobId, input.jobId)).catch(() => null);
      } else if (db && dbStatus === "processing") {
        await db.update(videoJobs).set({ status: "processing" })
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
    falConfigured: !!process.env.FAL_API_KEY,
    rhConfigured: !!process.env.RUNNINGHUB_API_KEY,
  })),

  // Running Up: foto + vídeo referência → fal.ai Champ (pose transfer)
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
      const [imageUrl, videoUrl] = await Promise.all([
        uploadToFal(input.imageBase64, input.imageMimeType),
        uploadToFal(input.videoBase64, input.videoMimeType),
      ]);

      const res = await fetch(`${FAL_BASE}/fal-ai/champ`, {
        method: "POST",
        headers: { Authorization: `Key ${getFalKey()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ image_url: imageUrl, video_url: videoUrl }),
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`fal.ai champ submit ${res.status}: ${text.slice(0, 300)}`);
      }
      const data = await res.json() as any;
      const taskId: string = data.request_id;

      const db = await getDb();
      if (db) {
        await db.insert(videoJobs).values({
          userId: ctx.user.id,
          runpodJobId: taskId,
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
      const statusRes = await fetch(`${FAL_BASE}/fal-ai/champ/requests/${input.taskId}/status`, {
        headers: { Authorization: `Key ${getFalKey()}` },
      });
      if (!statusRes.ok) throw new Error(`fal.ai champ status ${statusRes.status}`);
      const data = await statusRes.json() as any;

      if (data.status === "COMPLETED") {
        const resultRes = await fetch(`${FAL_BASE}/fal-ai/champ/requests/${input.taskId}`, {
          headers: { Authorization: `Key ${getFalKey()}` },
        });
        if (resultRes.ok) {
          const result = await resultRes.json() as any;
          return { status: "COMPLETED", videoUrl: result.video?.url ?? result.video_url };
        }
      }
      return {
        status: data.status as string,
        error: typeof data.error === "string" ? data.error : data.error?.message,
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
