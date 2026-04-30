/**
 * MiniMax (Hailuo AI) — Image-to-Video generation
 * Docs: https://www.minimaxi.com/document/video-generation
 *
 * Flow:
 *  1. POST /v1/video_generation  → task_id
 *  2. Poll GET /v1/query/video_generation?task_id=... until status = "Success"
 *  3. Download the file_id and return a public URL
 */

const API_KEY = process.env.MINIMAX_API_KEY || "";
const GROUP_ID = process.env.MINIMAX_GROUP_ID || "";
const BASE = "https://api.minimaxi.chat";

export interface MinimaxVideoParams {
  /** Base64-encoded image OR a public image URL */
  imageUrl: string;
  /** Optional text prompt to guide motion/style */
  prompt?: string;
  /** Model: "video-01" (default) or "video-01-live2d" */
  model?: string;
}

export interface MinimaxVideoResult {
  taskId: string;
  status: "pending" | "processing" | "done" | "error";
  videoUrl?: string;
  error?: string;
}

/** Submit a video generation task, returns the task_id immediately */
export async function submitVideoTask(params: MinimaxVideoParams): Promise<string> {
  if (!API_KEY) throw new Error("MINIMAX_API_KEY não configurado");
  if (!GROUP_ID) throw new Error("MINIMAX_GROUP_ID não configurado");

  const body: Record<string, any> = {
    model: params.model || "video-01",
    prompt: params.prompt || "",
  };

  // If imageUrl is a data URI keep as-is; otherwise treat as URL
  if (params.imageUrl.startsWith("data:")) {
    body.first_frame_image = params.imageUrl;
  } else {
    body.first_frame_image = params.imageUrl;
  }

  const res = await fetch(`${BASE}/v1/video_generation?GroupId=${GROUP_ID}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MiniMax submit error ${res.status}: ${err}`);
  }

  const data = await res.json();
  if (data.base_resp?.status_code !== 0) {
    throw new Error(`MiniMax error: ${data.base_resp?.status_msg}`);
  }

  return data.task_id as string;
}

/** Poll task status. Returns "pending" | "processing" | "done" | "error" + optional file_id */
export async function queryVideoTask(taskId: string): Promise<{ status: string; fileId?: string; error?: string }> {
  if (!API_KEY) throw new Error("MINIMAX_API_KEY não configurado");

  const res = await fetch(`${BASE}/v1/query/video_generation?task_id=${taskId}&GroupId=${GROUP_ID}`, {
    headers: { "Authorization": `Bearer ${API_KEY}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MiniMax query error ${res.status}: ${err}`);
  }

  const data = await res.json();
  if (data.base_resp?.status_code !== 0) {
    throw new Error(`MiniMax query error: ${data.base_resp?.status_msg}`);
  }

  const status: string = data.status; // "Queueing" | "Processing" | "Success" | "Fail"

  if (status === "Success") {
    return { status: "done", fileId: data.file_id as string };
  }
  if (status === "Fail") {
    return { status: "error", error: data.base_resp?.status_msg || "Geração falhou" };
  }
  // Queueing or Processing
  return { status: "processing" };
}

/** Download video by file_id and return the download URL */
export async function getVideoDownloadUrl(fileId: string): Promise<string> {
  if (!API_KEY) throw new Error("MINIMAX_API_KEY não configurado");

  const res = await fetch(`${BASE}/v1/files/retrieve?file_id=${fileId}&GroupId=${GROUP_ID}`, {
    headers: { "Authorization": `Bearer ${API_KEY}` },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`MiniMax file retrieve error ${res.status}: ${err}`);
  }

  const data = await res.json();
  if (data.base_resp?.status_code !== 0) {
    throw new Error(`MiniMax file error: ${data.base_resp?.status_msg}`);
  }

  return data.file?.download_url as string;
}

/**
 * High-level helper: submit + poll until done, then download to local /uploads/.
 * Polls every 5 seconds for up to 5 minutes.
 */
export async function generateVideoFromImage(
  params: MinimaxVideoParams,
  onProgress?: (msg: string) => void
): Promise<string> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const crypto = await import("crypto");

  onProgress?.("Enviando para MiniMax...");
  const taskId = await submitVideoTask(params);
  onProgress?.(`Task criada: ${taskId}`);

  // Poll for up to 5 minutes
  const maxAttempts = 60;
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(5000);
    const result = await queryVideoTask(taskId);
    onProgress?.(`Status: ${result.status} (tentativa ${i + 1})`);

    if (result.status === "error") {
      throw new Error(result.error || "Geração falhou no MiniMax");
    }

    if (result.status === "done" && result.fileId) {
      onProgress?.("Obtendo URL do vídeo...");
      const downloadUrl = await getVideoDownloadUrl(result.fileId);

      onProgress?.("Baixando vídeo...");
      const videoRes = await fetch(downloadUrl);
      if (!videoRes.ok) throw new Error(`Erro ao baixar vídeo: ${videoRes.status}`);
      const buf = Buffer.from(await videoRes.arrayBuffer());

      const uploadsDir = path.default.resolve(process.cwd(), "uploads");
      await fs.default.mkdir(uploadsDir, { recursive: true });
      const filename = `${Date.now()}-${crypto.default.randomBytes(8).toString("hex")}.mp4`;
      const destPath = path.default.join(uploadsDir, filename);
      await fs.default.writeFile(destPath, buf);

      onProgress?.(`Vídeo salvo: /uploads/${filename}`);
      return `/uploads/${filename}`;
    }
  }

  throw new Error("Timeout: MiniMax demorou mais de 5 minutos");
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
