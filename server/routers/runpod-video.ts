import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { videoJobs } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

const RUNPOD_BASE = "https://api.runpod.ai/v2";

function getEndpointId() {
  const id = process.env.RUNPOD_ENDPOINT_ID;
  if (!id) throw new Error("RUNPOD_ENDPOINT_ID não configurado no .env");
  return id;
}

function getApiKey() {
  const key = process.env.RUNPOD_API_KEY;
  if (!key) throw new Error("RUNPOD_API_KEY não configurado no .env");
  return key;
}

async function runpodRequest(path: string, body: any) {
  const res = await fetch(`${RUNPOD_BASE}/${getEndpointId()}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`RunPod erro ${res.status}: ${text.slice(0, 300)}`);
  }
  return res.json() as Promise<any>;
}

async function runpodStatus(jobId: string) {
  const res = await fetch(`${RUNPOD_BASE}/${getEndpointId()}/status/${jobId}`, {
    headers: { Authorization: `Bearer ${getApiKey()}` },
  });
  if (!res.ok) throw new Error(`RunPod status erro ${res.status}`);
  return res.json() as Promise<any>;
}

function mapStatus(runpodStatus: string): "queued" | "processing" | "completed" | "failed" | "cancelled" {
  switch (runpodStatus) {
    case "IN_QUEUE": return "queued";
    case "IN_PROGRESS": return "processing";
    case "COMPLETED": return "completed";
    case "FAILED": return "failed";
    case "CANCELLED": return "cancelled";
    default: return "queued";
  }
}

export const runpodVideoRouter = router({
  generate: protectedProcedure
    .input(z.object({
      imageBase64: z.string().min(100),
      videoBase64: z.string().min(100),
      durationSeconds: z.number().int().min(3).max(30).default(15),
    }))
    .mutation(async ({ input, ctx }) => {
      const job = await runpodRequest("/run", {
        input: {
          image_base64: input.imageBase64,
          video_base64: input.videoBase64,
          duration_seconds: input.durationSeconds,
        },
      });

      const db = await getDb();
      if (db) {
        await db.insert(videoJobs).values({
          userId: ctx.user.id,
          runpodJobId: job.id,
          status: "queued",
          durationSeconds: input.durationSeconds,
          createdAt: new Date(),
        }).catch(() => null);
      }

      return { jobId: job.id as string };
    }),

  status: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input, ctx }) => {
      const result = await runpodStatus(input.jobId);
      const status = mapStatus(result.status);

      const db = await getDb();
      if (db && (status === "completed" || status === "failed" || status === "cancelled")) {
        await db.update(videoJobs)
          .set({
            status,
            completedAt: new Date(),
            errorMessage: result.output?.error?.slice(0, 499) ?? null,
          })
          .where(and(
            eq(videoJobs.runpodJobId, input.jobId),
            eq(videoJobs.userId, ctx.user.id)
          ))
          .catch(() => null);
      } else if (db && status === "processing") {
        await db.update(videoJobs)
          .set({ status })
          .where(and(
            eq(videoJobs.runpodJobId, input.jobId),
            eq(videoJobs.userId, ctx.user.id)
          ))
          .catch(() => null);
      }

      return {
        status: result.status as string,
        videoBase64: result.output?.video_base64 as string | undefined,
        error: result.output?.error as string | undefined,
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

  checkConfig: protectedProcedure.query(() => {
    return {
      configured: !!(process.env.RUNPOD_API_KEY && process.env.RUNPOD_ENDPOINT_ID),
    };
  }),
});
