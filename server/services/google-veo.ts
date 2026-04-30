/**
 * Google Veo (via Gemini API) — Image-to-Video generation
 * Model: veo-3.1-generate-preview (9:16, até 1080p)
 *
 * Flow:
 *  1. POST /v1beta/models/veo-3.1-generate-preview:predictLongRunning
 *  2. Poll GET /v1beta/{operationName} until done === true
 *  3. Download videoUri → salva em /uploads/
 */

const API_KEY = process.env.GOOGLE_AI_API_KEY || "";
const BASE = "https://generativelanguage.googleapis.com/v1beta";
const MODEL = "veo-3.1-generate-preview";

export interface VeoVideoParams {
  /** URL pública ou caminho /uploads/... da imagem de partida */
  imageUrl: string;
  /** Prompt descrevendo o movimento desejado */
  prompt?: string;
  /** "720p" | "1080p" — default 1080p */
  resolution?: "720p" | "1080p";
  /** Duração em segundos: "4" | "6" | "8" — default "8" */
  durationSeconds?: "4" | "6" | "8";
}

/** Submete tarefa e retorna o operationName */
async function submitVeoTask(params: VeoVideoParams): Promise<string> {
  if (!API_KEY) throw new Error("GOOGLE_AI_API_KEY não configurado");

  const resolution = params.resolution || "1080p";
  const durationSeconds = params.durationSeconds || "8";

  // Lê a imagem e converte para base64
  const { imageBase64, mimeType } = await readImageAsBase64(params.imageUrl);

  const body = {
    instances: [{
      prompt: params.prompt || "A person wearing the clothing moves naturally",
      image: {
        inlineData: {
          mimeType,
          data: imageBase64,
        },
      },
    }],
    parameters: {
      aspectRatio: "9:16",
      resolution,
      durationSeconds,
    },
  };

  const res = await fetch(`${BASE}/models/${MODEL}:predictLongRunning`, {
    method: "POST",
    headers: {
      "x-goog-api-key": API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Veo submit error ${res.status}: ${err}`);
  }

  const data = await res.json();
  if (!data.name) throw new Error("Veo não retornou operation name");
  return data.name as string;
}

/** Poll status da operação */
async function pollVeoOperation(operationName: string): Promise<{ done: boolean; videoUri?: string; error?: string }> {
  const res = await fetch(`${BASE}/${operationName}`, {
    headers: { "x-goog-api-key": API_KEY },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Veo poll error ${res.status}: ${err}`);
  }

  const data = await res.json();

  if (data.error) {
    return { done: true, error: data.error.message || "Erro desconhecido" };
  }

  if (!data.done) return { done: false };

  const samples = data.response?.generateVideoResponse?.generatedSamples;
  if (!samples?.length) return { done: true, error: "Nenhum vídeo gerado" };

  const videoUri = samples[0]?.video?.uri as string;
  return { done: true, videoUri };
}

/**
 * Gera vídeo completo: submit → poll → download → /uploads/
 * Timeout: 10 minutos
 */
export async function generateVideoFromImageVeo(
  params: VeoVideoParams,
  onProgress?: (msg: string) => void
): Promise<string> {
  const fs = await import("fs/promises");
  const path = await import("path");
  const crypto = await import("crypto");

  onProgress?.("Enviando para Google Veo...");
  const operationName = await submitVeoTask(params);
  onProgress?.(`Operação iniciada: ${operationName}`);

  const maxAttempts = 120; // 10 min (5s * 120)
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(5000);
    const result = await pollVeoOperation(operationName);
    onProgress?.(`Aguardando Veo... tentativa ${i + 1}`);

    if (result.error) throw new Error(result.error);

    if (result.done && result.videoUri) {
      onProgress?.("Baixando vídeo do Google...");
      const videoRes = await fetch(result.videoUri);
      if (!videoRes.ok) throw new Error(`Erro ao baixar vídeo Veo: ${videoRes.status}`);
      const buf = Buffer.from(await videoRes.arrayBuffer());

      const uploadsDir = path.default.resolve(process.cwd(), "uploads");
      await fs.default.mkdir(uploadsDir, { recursive: true });
      const filename = `veo-${Date.now()}-${crypto.default.randomBytes(8).toString("hex")}.mp4`;
      const destPath = path.default.join(uploadsDir, filename);
      await fs.default.writeFile(destPath, buf);

      onProgress?.(`Vídeo salvo: /uploads/${filename}`);
      return `/uploads/${filename}`;
    }
  }

  throw new Error("Timeout: Google Veo demorou mais de 10 minutos");
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function readImageAsBase64(imageUrl: string): Promise<{ imageBase64: string; mimeType: string }> {
  const fs = await import("fs/promises");
  const path = await import("path");

  let buf: Buffer;
  let mimeType = "image/jpeg";

  if (imageUrl.startsWith("/uploads/")) {
    const localPath = path.default.join(path.default.resolve(process.cwd(), "uploads"), path.default.basename(imageUrl));
    buf = await fs.default.readFile(localPath);
    const ext = path.default.extname(imageUrl).toLowerCase();
    if (ext === ".png") mimeType = "image/png";
    else if (ext === ".webp") mimeType = "image/webp";
  } else {
    const res = await fetch(imageUrl);
    if (!res.ok) throw new Error(`Não foi possível baixar imagem: ${res.status}`);
    buf = Buffer.from(await res.arrayBuffer());
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("png")) mimeType = "image/png";
    else if (ct.includes("webp")) mimeType = "image/webp";
  }

  return { imageBase64: buf.toString("base64"), mimeType };
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
