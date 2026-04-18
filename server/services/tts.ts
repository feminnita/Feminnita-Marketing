/**
 * Text-to-Speech via ElevenLabs
 * Converte texto em áudio MP3 usando vozes femininas em português brasileiro.
 *
 * Vozes configuráveis via variáveis de ambiente.
 * Para trocar uma voz: copie o Voice ID do ElevenLabs e adicione ao .env do VPS.
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";
const MODEL_ID = "eleven_multilingual_v2";

// ─── Mapeamento de vozes por agente ──────────────────────────────────────────
// Voice IDs padrão — todos usam multilingual v2, que fala português BR naturalmente.
// Para personalizar: acesse elevenlabs.io/app/voice-library, escolha uma voz,
// copie o Voice ID e adicione ao .env: ELEVENLABS_VOICE_ID_CAROL=xxxx

const VOICE_MAP: Record<string, string> = {
  // Todas as vozes usam "Rachel" (21m00Tcm4TlvDq8ikWAM) por padrão — disponível em todos os planos ElevenLabs.
  // Para personalizar cada agente, adicione no .env do VPS:
  // ELEVENLABS_VOICE_ID_CAROL=<voice_id>  etc.
  fernanda: process.env.ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM",
  carol:    process.env.ELEVENLABS_VOICE_ID_CAROL    || "21m00Tcm4TlvDq8ikWAM",
  renata:   process.env.ELEVENLABS_VOICE_ID_RENATA   || "21m00Tcm4TlvDq8ikWAM",
  vanessa:  process.env.ELEVENLABS_VOICE_ID_VANESSA  || "21m00Tcm4TlvDq8ikWAM",
  luiza:    process.env.ELEVENLABS_VOICE_ID_LUIZA    || "21m00Tcm4TlvDq8ikWAM",
  sofia:    process.env.ELEVENLABS_VOICE_ID_SOFIA    || "21m00Tcm4TlvDq8ikWAM",
  beatriz:  process.env.ELEVENLABS_VOICE_ID_BEATRIZ  || "21m00Tcm4TlvDq8ikWAM",
  clara:    process.env.ELEVENLABS_VOICE_ID_CLARA    || "21m00Tcm4TlvDq8ikWAM",
  mariana:  process.env.ELEVENLABS_VOICE_ID_MARIANA  || "21m00Tcm4TlvDq8ikWAM",
};

export function getVoiceId(agentName?: string): string {
  if (!agentName) return VOICE_MAP.fernanda;
  return VOICE_MAP[agentName.toLowerCase()] || VOICE_MAP.fernanda;
}

// ─── Conversão de texto em áudio ─────────────────────────────────────────────

export async function textToSpeech(text: string, agentName?: string): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY não configurado");

  const voiceId = getVoiceId(agentName);

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text.slice(0, 2500),
        model_id: MODEL_ID,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.3,
          use_speaker_boost: true,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs erro ${res.status}: ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
