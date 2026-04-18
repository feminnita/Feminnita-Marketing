/**
 * Text-to-Speech via ElevenLabs
 * Converte texto em áudio MP3 usando voz feminina em português brasileiro.
 */

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || "";

// Voz padrão: "Laura" — voz feminina brasileira natural no modelo multilingual v2
// Pode ser trocada via env ELEVENLABS_VOICE_ID
const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || "FGY2WhTYpPnrIDTdsKH5";
const MODEL_ID = "eleven_multilingual_v2";

export async function textToSpeech(text: string): Promise<Buffer> {
  if (!ELEVENLABS_API_KEY) throw new Error("ELEVENLABS_API_KEY não configurado");

  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: text.slice(0, 2500), // limite de segurança
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
