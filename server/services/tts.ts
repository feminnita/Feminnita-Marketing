/**
 * Text-to-Speech via ElevenLabs
 * Converte texto em áudio MP3 usando vozes femininas em português brasileiro.
 *
 * Vozes configuráveis via variáveis de ambiente.
 * Para trocar uma voz: copie o Voice ID do ElevenLabs e adicione ao .env do VPS.
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";

// eleven_flash_v2_5 — mais rápido, suporta PT-BR, disponível em todos os planos pagos
// eleven_multilingual_v2 — melhor qualidade mas mais lento
const MODEL_ID = process.env.ELEVENLABS_MODEL_ID || "eleven_flash_v2_5";

// ─── Mapeamento de vozes por agente ──────────────────────────────────────────
// "Sarah" (EXAVITQu4vr4xnSDxMaL) — voz feminina estável disponível em todos os planos.
// Rachel (21m00Tcm4TlvDq8ikWAM) foi descontinuada em alguns planos.
// Para personalizar: copie o Voice ID do elevenlabs.io e adicione ao .env do VPS:
// ELEVENLABS_VOICE_ID=<voice_id>

const DEFAULT_VOICE = process.env.ELEVENLABS_VOICE_ID || "EXAVITQu4vr4xnSDxMaL";

const VOICE_MAP: Record<string, string> = {
  fernanda: process.env.ELEVENLABS_VOICE_ID_FERNANDA || DEFAULT_VOICE,
  carol:    process.env.ELEVENLABS_VOICE_ID_CAROL    || DEFAULT_VOICE,
  renata:   process.env.ELEVENLABS_VOICE_ID_RENATA   || DEFAULT_VOICE,
  vanessa:  process.env.ELEVENLABS_VOICE_ID_VANESSA  || DEFAULT_VOICE,
  luiza:    process.env.ELEVENLABS_VOICE_ID_LUIZA    || DEFAULT_VOICE,
  sofia:    process.env.ELEVENLABS_VOICE_ID_SOFIA    || DEFAULT_VOICE,
  clara:    process.env.ELEVENLABS_VOICE_ID_CLARA    || DEFAULT_VOICE,
  mariana:  process.env.ELEVENLABS_VOICE_ID_MARIANA  || DEFAULT_VOICE,
};

export function getVoiceId(agentName?: string): string {
  if (!agentName) return VOICE_MAP.fernanda;
  return VOICE_MAP[agentName.toLowerCase()] || VOICE_MAP.fernanda;
}

// ─── Conversão de texto em áudio ─────────────────────────────────────────────

function prepareForSpeech(text: string): string {
  return text
    .replace(/R\$\s?([\d.,]+)/g, (_, n) => `${n} reais`)
    .replace(/([\d.,]+)\s?%/g, (_, n) => `${n.replace(".", ",")} por cento`)
    .replace(/(\d+)x/g, (_, n) => `${n} vezes`)
    .replace(/ROAS/g, "rôas")
    .replace(/CPC/g, "C P C")
    .replace(/CPM/g, "C P M")
    .replace(/CTR/g, "C T R")
    .replace(/CPA/g, "C P A")
    .replace(/GMV/g, "G M V")
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#{1,3}\s/g, "");
}

export async function textToSpeech(text: string, agentName?: string): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY não configurado");

  const voiceId = getVoiceId(agentName);
  text = prepareForSpeech(text);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text.slice(0, 4000),
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.3,
          similarity_boost: 0.75,
          style: 0.4,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    console.error(`[TTS] ElevenLabs erro ${res.status} (voice: ${voiceId}, model: ${MODEL_ID}):`, err);
    throw new Error(`ElevenLabs erro ${res.status}: ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
