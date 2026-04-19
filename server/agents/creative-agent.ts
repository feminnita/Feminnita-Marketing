/**
 * Creative Agent — Agente Criativo de Banners/Artes para Meta Ads
 *
 * Fluxo:
 * 1. Fernanda solicita um criativo com brief detalhado
 * 2. O agente busca imagens de referência no Google Drive (se configurado)
 * 3. Gera o banner via Gemini Imagen (ou gera brief visual detalhado como fallback)
 * 4. Gera headline e body via LLM (Beatriz-style)
 * 5. Salva na tabela ad_creatives com status "pending_approval"
 * 6. Usuário aprova → Fernanda executa (upload → Meta Ads)
 */

import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { adCreatives } from "../../drizzle/schema";
import { listFolderFiles, downloadFileAsBase64, isDriveConfigured } from "../services/googleDrive";

const GEMINI_API_KEY = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || "";
const IMAGEN_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict";

// Pasta padrão de imagens de referência no Drive
const DEFAULT_REFERENCE_FOLDER = process.env.GOOGLE_DRIVE_REFERENCE_FOLDER || "";
// Pasta de artes prontas
const ARTES_ADS_FOLDER = process.env.GOOGLE_DRIVE_ARTES_FOLDER || "17-n_9HAqa69yqF7EOKOJ9wTptHfJn47D";

export interface CreativeBrief {
  title: string;
  description: string;
  campaignType?: string;    // "remarketing" | "prospeccao" | "revenda_sul_sudeste"
  targetAudience?: string;  // "revendedoras Sul/Sudeste" | "visitantes site"
  product?: string;         // nome do produto/coleção
  colorPalette?: string;    // "rose, branco, dourado"
  textOverlay?: string;     // "Kit Família a partir de R$89"
  referenceFileId?: string; // ID de arquivo específico no Drive
  campaignId?: string;      // campanha Meta onde publicar
  adSetId?: string;         // conjunto de anúncios
}

export interface CreativeResult {
  id: number;
  status: string;
  imageBase64?: string;
  headline?: string;
  body?: string;
  message: string;
}

// ─── Geração de imagem via Gemini Imagen ──────────────────────────────────────

async function generateImageWithImagen(prompt: string): Promise<string | null> {
  if (!GEMINI_API_KEY) return null;

  try {
    const res = await fetch(`${IMAGEN_ENDPOINT}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          safetyFilterLevel: "block_few",
          personGeneration: "allow_adult",
        },
      }),
    });

    const data = await res.json() as any;
    if (data.predictions?.[0]?.bytesBase64Encoded) {
      return data.predictions[0].bytesBase64Encoded as string;
    }
    console.warn("[CreativeAgent] Imagen não retornou imagem:", data.error?.message || "sem dados");
    return null;
  } catch (err: any) {
    console.warn("[CreativeAgent] Falha Imagen API:", err.message);
    return null;
  }
}

// ─── Prompt Imagen especializado em banners Feminnita ─────────────────────────

function buildImagenPrompt(brief: CreativeBrief, referenceDescription?: string): string {
  const colors = brief.colorPalette || "rose escuro #8B2635, branco, tons quentes femininos";
  const product = brief.product || "pijama feminino de qualidade";
  const text = brief.textOverlay || "";
  const audience = brief.targetAudience || "mulheres revendedoras de moda";

  return `Professional fashion advertising banner for Brazilian women's clothing brand Feminnita.
Product: ${product}. Target: ${audience}.
Style: elegant, warm, feminine, high-end boutique look.
Colors: ${colors}.
${text ? `Text overlay in Portuguese: "${text}". Clean sans-serif font, white or gold color.` : "No text overlay."}
Background: soft gradient or lifestyle setting (bedroom, cozy home environment).
${referenceDescription ? `Reference style: ${referenceDescription}` : ""}
Format: square social media ad (1:1). Sharp, professional photography style. High contrast, vibrant but tasteful.
Campaign type: ${brief.campaignType || "brand awareness"}.
Do NOT include logos. Do NOT include watermarks. High quality, suitable for Meta Ads.`.trim();
}

// ─── Geração de copy (headline + body) ───────────────────────────────────────

async function generateAdCopy(brief: CreativeBrief): Promise<{ headline: string; body: string }> {
  const prompt = `Você é a Beatriz Santos, copywriter especialista em Meta Ads para atacado de moda brasileira (Feminnita Pijamas).

BRIEF DO CRIATIVO:
- Produto: ${brief.product || "pijamas femininos"}
- Campanha: ${brief.campaignType || "conversão"}
- Público: ${brief.targetAudience || "revendedoras de moda"}
- Texto no banner: ${brief.textOverlay || "sem texto definido"}
- Descrição: ${brief.description}

Gere copy para anúncio Meta Ads (Facebook/Instagram). Retorne APENAS JSON:
{
  "headline": "título do anúncio (máx 40 caracteres, impactante, urgência ou benefício claro)",
  "body": "texto do anúncio (máx 120 caracteres, foca no benefício da revendedora, inclui CTA)"
}`;

  try {
    const result = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
      maxTokens: 200,
    });
    const rawContent = result.choices[0]?.message?.content;
    const content = typeof rawContent === "string" ? rawContent : "";
    const stripped = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const m = stripped.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(m ? m[0] : stripped);
    return {
      headline: parsed.headline || "Revenda Feminnita — Lucro Garantido",
      body: parsed.body || "Pijamas exclusivos para revendedoras. Peça seu catálogo agora!",
    };
  } catch {
    return {
      headline: "Revenda Feminnita — Lucro Garantido",
      body: "Pijamas exclusivos para revendedoras. Peça seu catálogo agora!",
    };
  }
}

// ─── Função principal ─────────────────────────────────────────────────────────

export async function requestCreative(userId: number, brief: CreativeBrief): Promise<CreativeResult> {
  const db = await getDb();
  if (!db) throw new Error("Database não disponível");

  console.log(`[CreativeAgent] Iniciando criativo: "${brief.title}"`);

  // 1. Inserir registro inicial
  const insertResult = await db.insert(adCreatives).values({
    userId,
    briefTitle: brief.title,
    briefDescription: brief.description,
    campaignType: brief.campaignType,
    targetAudience: brief.targetAudience,
    product: brief.product,
    colorPalette: brief.colorPalette,
    textOverlay: brief.textOverlay,
    driveReferenceFolder: brief.referenceFileId ? undefined : DEFAULT_REFERENCE_FOLDER,
    driveReferenceFileId: brief.referenceFileId,
    campaignId: brief.campaignId,
    adSetId: brief.adSetId,
    status: "pending_generation",
  });

  const creativeId = (insertResult[0] as any).insertId as number;

  // 2. Buscar imagem de referência no Drive (se disponível)
  let referenceDescription: string | undefined;
  if (isDriveConfigured()) {
    try {
      const folderId = DEFAULT_REFERENCE_FOLDER || ARTES_ADS_FOLDER;
      if (folderId) {
        const files = await listFolderFiles(folderId);
        const imageFiles = files.filter(f => f.mimeType.startsWith("image/"));
        if (imageFiles.length > 0) {
          // Usa a imagem mais recente como referência de estilo
          const refFile = brief.referenceFileId
            ? imageFiles.find(f => f.id === brief.referenceFileId) || imageFiles[0]
            : imageFiles[0];
          referenceDescription = `inspired by the brand's existing creative style (file: ${refFile.name})`;
          console.log(`[CreativeAgent] Usando referência do Drive: ${refFile.name}`);
        }
      }
    } catch (err: any) {
      console.warn("[CreativeAgent] Falha ao buscar referência do Drive:", err.message);
    }
  }

  // 3. Gerar copy (headline + body)
  const copy = await generateAdCopy(brief);
  console.log(`[CreativeAgent] Copy gerado: "${copy.headline}"`);

  // 4. Gerar imagem via Imagen
  const imagenPrompt = buildImagenPrompt(brief, referenceDescription);
  const imageBase64 = await generateImageWithImagen(imagenPrompt);

  const finalStatus = imageBase64 ? "pending_approval" : "generated";
  const message = imageBase64
    ? "Banner gerado com sucesso! Aguardando sua aprovação."
    : "Copy gerado. Imagem requer configuração do Gemini Imagen (adicione LLM_API_KEY ao .env).";

  // 5. Salvar resultado
  const { eq } = await import("drizzle-orm");
  await db.update(adCreatives)
    .set({
      imageBase64: imageBase64 || undefined,
      generatedHeadline: copy.headline,
      generatedBody: copy.body,
      status: finalStatus,
      updatedAt: new Date(),
    })
    .where(eq(adCreatives.id, creativeId));

  console.log(`[CreativeAgent] Criativo #${creativeId} → ${finalStatus}`);

  return {
    id: creativeId,
    status: finalStatus,
    imageBase64: imageBase64 || undefined,
    headline: copy.headline,
    body: copy.body,
    message,
  };
}

// ─── Listar arquivos disponíveis no Drive (para UI) ───────────────────────────

export async function listDriveReferenceFiles(): Promise<Array<{ id: string; name: string; folder: string }>> {
  if (!isDriveConfigured()) return [];

  const result: Array<{ id: string; name: string; folder: string }> = [];

  for (const [label, folderId] of [
    ["Artes Prontas", ARTES_ADS_FOLDER],
    ["Referências", DEFAULT_REFERENCE_FOLDER],
  ] as const) {
    if (!folderId) continue;
    const files = await listFolderFiles(folderId);
    for (const f of files.filter(f => f.mimeType.startsWith("image/"))) {
      result.push({ id: f.id, name: f.name, folder: label });
    }
  }

  return result;
}
