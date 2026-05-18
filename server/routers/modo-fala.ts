import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { videoJobs } from "../../drizzle/schema";
import { debitCredits } from "./video-credits";
import { eq, desc } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";
import path from "path";
import fs from "fs";
import { execFile } from "child_process";
import { promisify } from "util";

const execFileAsync = promisify(execFile);
const UPLOADS_DIR = path.resolve(process.cwd(), "uploads");
const APP_URL = process.env.APP_URL || "https://marketing.feminnita.com.br";
const SF_BASE = "https://api.siliconflow.com/v1";

// ── Vozes predefinidas ────────────────────────────────────────────────────────
export const PRESET_VOICES = [
  { id: "fernanda", name: "Fernanda", description: "Natural, feminina",       voiceId: () => process.env.ELEVENLABS_VOICE_ID_FERNANDA || "RGymW84CSmfVugnA5tvA" },
  { id: "sofia",    name: "Sofia",    description: "Jovem, animada",          voiceId: () => "EXAVITQu4vr4xnSDxMaL" },
  { id: "beatriz",  name: "Beatriz",  description: "Madura, elegante",        voiceId: () => "XB0fDUnXU5powFXDhCwa" },
  { id: "camila",   name: "Camila",   description: "Calorosa, simpática",     voiceId: () => "Xb7hH8MSUJpSbSDYk0k2" },
  { id: "rafael",   name: "Rafael",   description: "Masculino, profissional", voiceId: () => "JBFqnCBsd6RMkjVDRZzb" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function getElKey() {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ELEVENLABS_API_KEY não configurado." });
  return key;
}

function getSfKey() {
  const key = process.env.SILICONFLOW_API_KEY;
  if (!key) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "SILICONFLOW_API_KEY não configurado." });
  return key;
}

function ensureUploads() {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// ── Extrair fala e movimento do prompt combinado ──────────────────────────────
async function extractSceneComponents(prompt: string): Promise<{ speech: string; movementPrompt: string }> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return { speech: prompt, movementPrompt: prompt };
  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      messages: [{
        role: "user",
        content: `You are a video production assistant for a Brazilian pajama/fashion brand.
Analyze the scene description and return a JSON with two fields:

1. "speech": The exact dialogue the model should say in Portuguese. If no dialogue is specified, create a natural, enthusiastic short phrase (1-2 sentences) about the pajama/product.
2. "movementPrompt": A detailed English prompt for AI video generation describing: full body shot showing the complete outfit, the model's movement (walking, turning, posing), fabric texture visible, camera angle, lighting. Style: professional fashion video, high quality.

Scene description (may be in Portuguese): "${prompt}"

Return ONLY valid JSON: {"speech": "...", "movementPrompt": "..."}`,
      }],
    });
    const text = (msg.content[0] as any).text?.trim() || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch?.[0] || text);
    return {
      speech: parsed.speech || prompt,
      movementPrompt: parsed.movementPrompt || prompt,
    };
  } catch { return { speech: prompt, movementPrompt: prompt }; }
}

// ── Pré-processar números para melhor pronúncia PT-BR ─────────────────────────
async function preprocessNumbers(text: string): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return text;
  try {
    const client = new Anthropic({ apiKey: key });
    const msg = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 500,
      messages: [{
        role: "user",
        content: `Você é um pré-processador de texto para síntese de voz em português brasileiro.
Converta APENAS números, valores monetários e abreviações para texto por extenso.
Mantenha o restante do texto idêntico.
Retorne APENAS o texto convertido, sem explicações.

Exemplos:
"R$ 49,90" → "quarenta e nove reais e noventa centavos"
"3x de R$20" → "três vezes de vinte reais"
"15%" → "quinze por cento"

Texto: "${text}"`,
      }],
    });
    return (msg.content[0] as any).text?.trim() || text;
  } catch { return text; }
}

// ── SiliconFlow: submeter vídeo ───────────────────────────────────────────────
async function sfSubmit(imageBase64: string, mimeType: string, prompt: string): Promise<string> {
  const key = getSfKey();
  const res = await fetch(`${SF_BASE}/video/submit`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "Wan-AI/Wan2.2-I2V-A14B",
      prompt,
      image: `data:${mimeType};base64,${imageBase64}`,
      negative_prompt: "blurry, low quality, text, watermark, cropped, face only, close up face",
      seed: Math.floor(Math.random() * 2147483647),
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `SiliconFlow submit ${res.status}: ${t.slice(0, 200)}` });
  }
  const data = await res.json() as any;
  return data.requestId as string;
}

// ── SiliconFlow: status ───────────────────────────────────────────────────────
async function sfGetStatus(requestId: string): Promise<{ status: string; videoUrl?: string }> {
  const key = getSfKey();
  const res = await fetch(`${SF_BASE}/video/status`, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ requestId }),
  });
  if (!res.ok) throw new Error(`SiliconFlow status ${res.status}`);
  const data = await res.json() as any;
  if (data.status === "Succeed") return { status: "COMPLETED", videoUrl: data.results?.videos?.[0]?.url };
  if (data.status === "Failed")  return { status: "FAILED" };
  return { status: "IN_PROGRESS" };
}

// ── ElevenLabs: TTS com timestamps ────────────────────────────────────────────
async function elevenLabsWithTimestamps(text: string, voiceId: string): Promise<{
  audioBase64: string;
  alignment: { characters: string[]; character_start_times_seconds: number[]; character_end_times_seconds: number[] };
}> {
  const key = getElKey();
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/with-timestamps`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`ElevenLabs timestamps ${res.status}: ${t.slice(0, 200)}`);
  }
  const data = await res.json() as any;
  return { audioBase64: data.audio_base64, alignment: data.alignment };
}

// ── ElevenLabs: TTS simples ───────────────────────────────────────────────────
async function elevenLabsAudio(text: string, voiceId: string): Promise<string> {
  const key = getElKey();
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: "POST",
    headers: { "xi-api-key": key, "Content-Type": "application/json" },
    body: JSON.stringify({
      text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`ElevenLabs TTS ${res.status}: ${t.slice(0, 200)}`);
  }
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

// ── Converter alignment → SRT ─────────────────────────────────────────────────
function alignmentToSrt(alignment: {
  characters: string[];
  character_start_times_seconds: number[];
  character_end_times_seconds: number[];
}): string {
  const { characters, character_start_times_seconds: starts, character_end_times_seconds: ends } = alignment;
  const words: { text: string; start: number; end: number }[] = [];
  let word = ""; let wStart = 0;
  for (let i = 0; i < characters.length; i++) {
    const c = characters[i];
    if (c === " " || c === "\n") {
      if (word) { words.push({ text: word, start: wStart, end: ends[i - 1] }); word = ""; }
    } else {
      if (!word) wStart = starts[i];
      word += c;
    }
  }
  if (word) words.push({ text: word, start: wStart, end: ends[ends.length - 1] });

  const lines: { text: string; start: number; end: number }[] = [];
  let group: typeof words = [];
  for (const w of words) {
    group.push(w);
    if (group.length >= 6 || w.end - group[0].start >= 3) {
      lines.push({ text: group.map(x => x.text).join(" "), start: group[0].start, end: w.end });
      group = [];
    }
  }
  if (group.length) lines.push({ text: group.map(x => x.text).join(" "), start: group[0].start, end: group[group.length - 1].end });

  function ts(s: number) {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60), ms = Math.round((s % 1) * 1000);
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")},${String(ms).padStart(3,"0")}`;
  }
  return lines.map((l, i) => `${i + 1}\n${ts(l.start)} --> ${ts(l.end)}\n${l.text}`).join("\n\n");
}

// ── Salvar arquivos ───────────────────────────────────────────────────────────
function saveAudio(audioBase64: string, requestId: string): string {
  ensureUploads();
  const filePath = path.join(UPLOADS_DIR, `fala-audio-${requestId}.mp3`);
  fs.writeFileSync(filePath, Buffer.from(audioBase64, "base64"));
  return filePath;
}

function saveSrt(srtContent: string, requestId: string): string {
  ensureUploads();
  const filePath = path.join(UPLOADS_DIR, `fala-srt-${requestId}.srt`);
  fs.writeFileSync(filePath, srtContent, "utf8");
  return filePath;
}

// ── FFmpeg: merge vídeo + áudio (+ legenda opcional) ─────────────────────────
async function mergeVideoAudio(
  videoUrl: string,
  audioPath: string,
  srtPath: string | null,
  requestId: string,
): Promise<string> {
  ensureUploads();
  const rawPath = path.join(UPLOADS_DIR, `fala-raw-${requestId}.mp4`);
  const outPath = path.join(UPLOADS_DIR, `fala-video-${requestId}.mp4`);

  if (fs.existsSync(outPath)) return `${APP_URL}/uploads/fala-video-${requestId}.mp4`;

  const videoRes = await fetch(videoUrl);
  if (!videoRes.ok) throw new Error(`Download vídeo falhou: ${videoRes.status}`);
  fs.writeFileSync(rawPath, Buffer.from(await videoRes.arrayBuffer()));

  if (srtPath && fs.existsSync(srtPath)) {
    await execFileAsync("ffmpeg", [
      "-i", rawPath,
      "-i", audioPath,
      "-vf", `subtitles=${srtPath}:force_style='FontName=Arial,FontSize=20,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,Outline=2,Shadow=1,Alignment=2'`,
      "-c:a", "aac",
      "-map", "0:v:0",
      "-map", "1:a:0",
      "-shortest",
      "-y", outPath,
    ]);
  } else {
    await execFileAsync("ffmpeg", [
      "-i", rawPath,
      "-i", audioPath,
      "-c:v", "copy",
      "-c:a", "aac",
      "-map", "0:v:0",
      "-map", "1:a:0",
      "-shortest",
      "-y", outPath,
    ]);
  }

  fs.unlink(rawPath, () => {});
  return `${APP_URL}/uploads/fala-video-${requestId}.mp4`;
}

// ── Router ────────────────────────────────────────────────────────────────────
export const modoFalaRouter = router({

  getVoices: protectedProcedure.query(() =>
    PRESET_VOICES.map(v => ({ id: v.id, name: v.name, description: v.description }))
  ),

  previewVoice: protectedProcedure
    .input(z.object({ voiceId: z.string() }))
    .mutation(async ({ input }) => {
      const voice = PRESET_VOICES.find(v => v.id === input.voiceId) ?? PRESET_VOICES[0];
      const sampleText = "Olá! Confira essa novidade incrível da nossa coleção. Você vai se apaixonar!";
      const audioBase64 = await elevenLabsAudio(sampleText, voice.voiceId());
      return { audioBase64 };
    }),

  checkConfig: protectedProcedure.query(() => ({
    didConfigured: !!process.env.SILICONFLOW_API_KEY,
    elConfigured:  !!process.env.ELEVENLABS_API_KEY,
  })),

  generate: protectedProcedure
    .input(z.object({
      imageBase64:   z.string().min(100),
      imageMimeType: z.string().default("image/jpeg"),
      text:          z.string().min(5).max(2000),
      voiceId:       z.string().default("fernanda"),
      withSubtitles: z.boolean().default(true),
    }))
    .mutation(async ({ input, ctx }) => {
      const voice = PRESET_VOICES.find(v => v.id === input.voiceId) ?? PRESET_VOICES[0];

      // Debitar créditos antes de processar
      const dbConn = await getDb();
      if (dbConn) await debitCredits(ctx.user.id, "fala", dbConn);

      // 1. Extrair fala e descrição de movimento do prompt combinado
      const { speech, movementPrompt } = await extractSceneComponents(input.text);

      // 2. Pré-processar números na fala
      const processedSpeech = await preprocessNumbers(speech);

      // 3. Submeter SiliconFlow (corpo inteiro + movimento) — retorna requestId imediatamente
      const requestId = await sfSubmit(input.imageBase64, input.imageMimeType, movementPrompt);

      // 4. Gerar áudio ElevenLabs (com ou sem timestamps para legenda)
      let audioBase64: string;
      let srtContent: string | null = null;

      if (input.withSubtitles) {
        const result = await elevenLabsWithTimestamps(processedSpeech, voice.voiceId());
        audioBase64 = result.audioBase64;
        srtContent = alignmentToSrt(result.alignment);
      } else {
        audioBase64 = await elevenLabsAudio(processedSpeech, voice.voiceId());
      }

      // 5. Salvar áudio e SRT
      saveAudio(audioBase64, requestId);
      if (srtContent) saveSrt(srtContent, requestId);

      // 6. Registrar no banco
      const db = await getDb();
      if (db) {
        await db.insert(videoJobs).values({
          userId: ctx.user.id,
          runpodJobId: requestId,
          mode: "livre",
          status: "queued",
          durationSeconds: 0,
          createdAt: new Date(),
        }).catch(() => null);
      }

      return { talkId: requestId };
    }),

  status: protectedProcedure
    .input(z.object({ talkId: z.string() }))
    .query(async ({ input }) => {
      const result = await sfGetStatus(input.talkId);

      if (result.status === "COMPLETED" && result.videoUrl) {
        const audioPath = path.join(UPLOADS_DIR, `fala-audio-${input.talkId}.mp3`);
        const srtPath   = path.join(UPLOADS_DIR, `fala-srt-${input.talkId}.srt`);
        const outPath   = path.join(UPLOADS_DIR, `fala-video-${input.talkId}.mp4`);

        if (fs.existsSync(outPath)) {
          return { status: "COMPLETED", videoUrl: `${APP_URL}/uploads/fala-video-${input.talkId}.mp4` };
        }

        if (fs.existsSync(audioPath)) {
          try {
            const finalUrl = await mergeVideoAudio(
              result.videoUrl,
              audioPath,
              fs.existsSync(srtPath) ? srtPath : null,
              input.talkId,
            );
            return { status: "COMPLETED", videoUrl: finalUrl };
          } catch (e: any) {
            return { status: "COMPLETED", videoUrl: result.videoUrl, error: `Merge falhou: ${e.message}` };
          }
        }

        return { status: "COMPLETED", videoUrl: result.videoUrl };
      }

      if (result.status === "FAILED") return { status: "FAILED", error: "Geração falhou." };
      return { status: "IN_PROGRESS" };
    }),

  history: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(20) }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { jobs: [] };
      const jobs = await db.select({
        id:          videoJobs.id,
        runpodJobId: videoJobs.runpodJobId,
        status:      videoJobs.status,
        createdAt:   videoJobs.createdAt,
      })
        .from(videoJobs)
        .where(eq(videoJobs.userId, ctx.user.id))
        .orderBy(desc(videoJobs.createdAt))
        .limit(input.limit);
      return { jobs };
    }),
});
