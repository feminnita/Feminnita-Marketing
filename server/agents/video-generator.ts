/**
 * FFmpeg video generator — images + text overlays → 9:16 vertical MP4
 */

import ffmpegLib from "fluent-ffmpeg";
import * as fs from "fs/promises";
import * as path from "path";
import * as os from "os";
import * as crypto from "crypto";
import { storagePut } from "../storage";
import { textToSpeech } from "../services/tts";

// Use bundled ffmpeg-static binary if it exists, otherwise use system ffmpeg
try {
  const ffmpegStatic = require("ffmpeg-static");
  const fsSync = require("fs");
  if (ffmpegStatic && fsSync.existsSync(ffmpegStatic)) {
    ffmpegLib.setFfmpegPath(ffmpegStatic);
  } else {
    // Fall back to system ffmpeg (e.g. /usr/bin/ffmpeg installed via apt)
    const { execSync } = require("child_process");
    try {
      const systemPath = execSync("which ffmpeg 2>/dev/null").toString().trim();
      if (systemPath) ffmpegLib.setFfmpegPath(systemPath);
    } catch { /* let fluent-ffmpeg search PATH */ }
  }
} catch { /* let fluent-ffmpeg search PATH */ }

export interface VideoGenerationParams {
  imageUrls: string[];       // 1–5 image URLs (absolute or /uploads/...)
  hookText?: string;         // Overlay text at the start (first 3s)
  ctaText?: string;          // Overlay text at the end (last 3s)
  durationPerImage?: number; // Seconds per image, default 4
  dubbing?: boolean;         // Se true, gera áudio com ElevenLabs lendo hook + CTA
  voiceId?: string;          // ElevenLabs Voice ID override
}

export async function generateVideoFromImages(params: VideoGenerationParams): Promise<string> {
  const { imageUrls, hookText = "", ctaText = "", durationPerImage = 4, dubbing = false, voiceId } = params;

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "feminnita-vid-"));

  try {
    // Download each image to temp disk — suporta URLs relativas /uploads/
    const uploadsDir = path.resolve(process.cwd(), "uploads");
    const imagePaths: string[] = [];
    for (let i = 0; i < imageUrls.length; i++) {
      const url = imageUrls[i];
      let buf: Buffer;
      let ext = ".jpg";
      if (url.startsWith("/uploads/")) {
        // Leitura direta do disco — evita fetch de URL relativa
        const localPath = path.join(uploadsDir, path.basename(url));
        buf = await fs.readFile(localPath);
        const localExt = path.extname(url).toLowerCase();
        if (localExt) ext = localExt;
      } else {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Imagem ${i + 1} não pôde ser baixada (${res.status})`);
        buf = Buffer.from(await res.arrayBuffer());
        const ct = res.headers.get("content-type") || "image/jpeg";
        ext = ct.includes("png") ? ".png" : ct.includes("webp") ? ".webp" : ".jpg";
      }
      const imgPath = path.join(tmpDir, `img${i}${ext}`);
      await fs.writeFile(imgPath, buf);
      imagePaths.push(imgPath);
    }

    const outputPath = path.join(tmpDir, "output.mp4");
    const totalDuration = imagePaths.length * durationPerImage;

    // Gerar áudio de dublagem se solicitado
    let audioPath: string | undefined;
    if (dubbing && (hookText || ctaText)) {
      try {
        const dubbingText = [hookText, ctaText].filter(Boolean).join(". ");
        const audioBuffer = await textToSpeech(dubbingText, undefined, voiceId);
        audioPath = path.join(tmpDir, "dubbing.mp3");
        await fs.writeFile(audioPath, audioBuffer);
      } catch (err: any) {
        console.warn("[VideoGenerator] Dublagem falhou, gerando sem áudio:", err.message);
        audioPath = undefined;
      }
    }

    // Try rendering with text overlays; fall back to plain slideshow if drawtext fails
    let rendered = false;
    if (hookText || ctaText) {
      try {
        await renderWithText({ imagePaths, hookText, ctaText, durationPerImage, totalDuration, outputPath, audioPath });
        rendered = true;
      } catch {
        // text filter failed (font not found), fall through
      }
    }
    if (!rendered) {
      await renderSlideshow({ imagePaths, durationPerImage, outputPath, audioPath });
    }

    // Salvar vídeo em /uploads/ local e retornar URL relativa
    await fs.mkdir(uploadsDir, { recursive: true });
    const filename = `${Date.now()}-${crypto.randomBytes(8).toString("hex")}.mp4`;
    const destPath = path.join(uploadsDir, filename);
    await fs.copyFile(outputPath, destPath);
    return `/uploads/${filename}`;
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
  }
}

// Escape text for FFmpeg drawtext filter
function esc(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'")
    .replace(/:/g, "\\:")
    .replace(/[[\]]/g, "")
    .slice(0, 70);
}

function buildScaleFilters(n: number): string[] {
  const filters: string[] = [];
  for (let i = 0; i < n; i++) {
    filters.push(
      `[${i}:v]scale=1080:1920:force_original_aspect_ratio=increase,` +
      `crop=1080:1920,setsar=1,setpts=PTS-STARTPTS[v${i}]`
    );
  }
  const concatIn = Array.from({ length: n }, (_, i) => `[v${i}]`).join("");
  filters.push(`${concatIn}concat=n=${n}:v=1:a=0[base]`);
  return filters;
}

function runCommand(cmd: ffmpegLib.FfmpegCommand, outputPath: string, hasAudio: boolean, totalDuration: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const outOpts = ["-c:v", "libx264", "-preset", "fast", "-crf", "23", "-pix_fmt", "yuv420p", "-r", "30", `-t ${totalDuration}`];
    if (hasAudio) {
      outOpts.push("-c:a", "aac", "-b:a", "128k", "-shortest");
    } else {
      outOpts.push("-an");
    }
    cmd
      .outputOptions(outOpts)
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", (err) => reject(err))
      .run();
  });
}

async function renderWithText(opts: {
  imagePaths: string[];
  hookText: string;
  ctaText: string;
  durationPerImage: number;
  totalDuration: number;
  outputPath: string;
  audioPath?: string;
}): Promise<void> {
  const { imagePaths, hookText, ctaText, durationPerImage, totalDuration, outputPath, audioPath } = opts;
  const n = imagePaths.length;

  let cmd = ffmpegLib();
  for (const p of imagePaths) {
    cmd = cmd.input(p).inputOptions([`-loop 1`, `-t ${durationPerImage}`]);
  }
  if (audioPath) cmd = cmd.input(audioPath);

  const filters = buildScaleFilters(n);

  const textParts: string[] = [];
  if (hookText) {
    textParts.push(
      `drawtext=text='${esc(hookText)}':fontsize=54:fontcolor=white:` +
      `shadowcolor=black@0.85:shadowx=3:shadowy=3:` +
      `x=(w-text_w)/2:y=h*0.12:enable='between(t,0,3)'`
    );
  }
  if (ctaText) {
    const t0 = Math.max(0, totalDuration - 3);
    textParts.push(
      `drawtext=text='${esc(ctaText)}':fontsize=54:fontcolor=white:` +
      `shadowcolor=black@0.85:shadowx=3:shadowy=3:` +
      `x=(w-text_w)/2:y=h*0.84:enable='between(t,${t0},${totalDuration})'`
    );
  }

  if (textParts.length > 0) {
    filters.push(`[base]${textParts.join(",")}[out]`);
  } else {
    filters.push(`[base]copy[out]`);
  }

  await runCommand(cmd.complexFilter(filters, "out"), outputPath, !!audioPath, totalDuration);
}

async function renderSlideshow(opts: {
  imagePaths: string[];
  durationPerImage: number;
  outputPath: string;
  audioPath?: string;
}): Promise<void> {
  const { imagePaths, durationPerImage, outputPath, audioPath } = opts;
  const n = imagePaths.length;
  const totalDuration = n * durationPerImage;

  let cmd = ffmpegLib();
  for (const p of imagePaths) {
    cmd = cmd.input(p).inputOptions([`-loop 1`, `-t ${durationPerImage}`]);
  }
  if (audioPath) cmd = cmd.input(audioPath);

  const filters = buildScaleFilters(n);
  filters.push(`[base]copy[out]`);

  await runCommand(cmd.complexFilter(filters, "out"), outputPath, !!audioPath, totalDuration);
}
