import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { videoJobs } from "../../drizzle/schema";
import { eq, desc } from "drizzle-orm";

const FAL_BASE = "https://queue.fal.run";
const FAL_MODEL = "fal-ai/wan/v2.2/i2v";
const FAL_UPLOAD = "https://fal.run/files/upload";

function getFalKey() {
  const key = process.env.FAL_API_KEY;
  if (!key) throw new Error("FAL_API_KEY não configurado no .env");
  return key;
}

async function uploadToFal(base64: string, mimeType: string): Promise<string> {
  const buffer = Buffer.from(base64, "base64");
  const res = await fetch(FAL_UPLOAD, {
    method: "POST",
    headers: { Authorization: `Key ${getFalKey()}`, "Content-Type": mimeType },
    body: buffer,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`fal.ai upload ${res.status}: ${text.slice(0, 200)}`);
  }
  const data = await res.json() as any;
  return data.url as string;
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

function mapStatus(s: string): "queued" | "processing" | "completed" | "failed" | "cancelled" {
  switch (s) {
    case "IN_QUEUE": return "queued";
    case "IN_PROGRESS": return "processing";
    case "COMPLETED": return "completed";
    case "FAILED": return "failed";
    default: return "queued";
  }
}

export const runpodVideoRouter = router({
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
    .query(async ({ input, ctx }) => {
      const result = await getFalStatus(input.jobId);
      const dbStatus = mapStatus(result.status);

      const db = await getDb();
      if (db && (dbStatus === "completed" || dbStatus === "failed")) {
        await db.update(videoJobs)
          .set({ status: dbStatus, completedAt: new Date(), errorMessage: result.error?.slice(0, 499) ?? null })
          .where(eq(videoJobs.runpodJobId, input.jobId))
          .catch(() => null);
      } else if (db && dbStatus === "processing") {
        await db.update(videoJobs).set({ status: "processing" })
          .where(eq(videoJobs.runpodJobId, input.jobId)).catch(() => null);
      }

      return {
        status: result.status,
        videoUrl: result.videoUrl,
        error: result.error,
      };
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
    configured: !!process.env.FAL_API_KEY,
  })),
});
