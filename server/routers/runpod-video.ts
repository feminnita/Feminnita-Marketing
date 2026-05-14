import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";

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

export const runpodVideoRouter = router({
  generate: protectedProcedure
    .input(z.object({
      imageBase64: z.string().min(100),
      videoBase64: z.string().min(100),
      durationSeconds: z.number().min(3).max(30).default(15),
    }))
    .mutation(async ({ input }) => {
      // Enfileira o job no RunPod
      const job = await runpodRequest("/run", {
        input: {
          image_base64: input.imageBase64,
          video_base64: input.videoBase64,
          duration_seconds: input.durationSeconds,
        },
      });

      return { jobId: job.id as string };
    }),

  status: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .query(async ({ input }) => {
      const result = await runpodStatus(input.jobId);
      // status: IN_QUEUE | IN_PROGRESS | COMPLETED | FAILED | CANCELLED
      return {
        status: result.status as string,
        videoBase64: result.output?.video_base64 as string | undefined,
        error: result.output?.error as string | undefined,
      };
    }),

  checkConfig: protectedProcedure.query(() => {
    return {
      configured: !!(process.env.RUNPOD_API_KEY && process.env.RUNPOD_ENDPOINT_ID),
    };
  }),
});
