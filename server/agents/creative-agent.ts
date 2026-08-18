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
import { adCreatives, oauthCredentials } from "../../drizzle/schema";
import { listFolderFiles, downloadFileAsBase64, isDriveConfigured } from "../services/googleDrive";
import { FEMINNITA_CONTEXT } from "./doctrines/feminnita-context";
import { COPY_ARTE_DOCTRINE } from "./doctrines/copy-arte-doctrine";
import { COPY_DEEP_DOCTRINE } from "./doctrines/copy-deep-doctrine";
import { ARTE_CRIATIVO_DOCTRINE } from "./doctrines/arte-criativo-doctrine";
import { LIGHT_COPY_LADEIRA_DOCTRINE } from "./doctrines/light-copy-ladeira-doctrine";

// Doutrina criativa (destilada): regras que o copy/arte deve seguir. Tem PRECEDÊNCIA
// sobre números antigos em prompts legados (ex.: ticket "R$400" desatualizado).
const CREATIVE_DOCTRINE = `
━━━ DOUTRINA CRIATIVA (regras de ouro — seguir ao gerar copy e arte) ━━━
- ESTRUTURA FGC: Formato · Gancho · Corpo. O criativo é 99% do resultado.
- HOOK nos primeiros 3 segundos / primeiro frame: tem que parar o scroll. Meta de hook rate (views 3s ÷ impressões) > 60%. Deixe claro do que se trata já no início — nada de tela em branco/logo.
- NATIVO vence PANFLETEIRO: o anúncio que NÃO parece anúncio (parece conteúdo orgânico de moda/lifestyle, depoimento, dica) retém atenção e baixa o CPM. Evite cara de catálogo/banner colorido com preço gigante.
- 1 dor/desejo por criativo (foco único). Cada ângulo = um público; a Meta acha quem converte.
- Texto na arte CENTRALIZADO (o feed corta topo e base) — nunca colado em cima/embaixo.
- Sempre pensar em VARIAÇÕES: do criativo vencedor, gerar variações de gancho (mesmo corpo, troca os 3s iniciais). Regra: ter sempre 6 rodando + 6 prontos.
- ECONOMIA DE PRODUTO FÍSICO: margem é apertada (não é infoproduto). A oferta destrava preço; ticket médio sobe com mais peças no pedido (revenda: a partir do mínimo de R$199, com CPF ou CNPJ). Use os NÚMEROS REAIS do contexto acima (ticket B2C ~R$75–82, revenda AOV ~R$435 — NÃO R$400).
`;

const GEMINI_API_KEY = process.env.LLM_API_KEY || process.env.GEMINI_API_KEY || "";
const IMAGEN_ENDPOINT = "https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-002:predict";

// Pasta padrão de imagens de referência no Drive
const DEFAULT_REFERENCE_FOLDER = process.env.GOOGLE_DRIVE_REFERENCE_FOLDER || "";
// Pasta de artes prontas
const ARTES_ADS_FOLDER = process.env.GOOGLE_DRIVE_ARTES_FOLDER || "17-n_9HAqa69yqF7EOKOJ9wTptHfJn47D";

export interface CreativeBrief {
  title: string;
  description: string;
  campaignType?: string;
  targetAudience?: string;
  product?: string;
  colorPalette?: string;
  textOverlay?: string;
  referenceFileId?: string;
  campaignId?: string;
  adSetId?: string;
  imageBase64Input?: string; // imagem enviada pelo usuário — pula geração Imagen
}

export interface CreativeResult {
  id: number;
  status: string;
  imageBase64?: string;
  headline?: string;
  body?: string;
  message: string;
}

// ─── Canva Autofill Integration ───────────────────────────────────────────────

const CANVA_API = "https://api.canva.com/rest/v1";

async function getCanvaToken(userId: number): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  const { eq, and } = await import("drizzle-orm");
  const rows = await db.select().from(oauthCredentials)
    .where(and(eq(oauthCredentials.platform, "canva"), eq(oauthCredentials.userId, userId)));
  return rows[0]?.accessToken ?? null;
}

async function uploadImageToCanva(token: string, imageBase64: string): Promise<string | null> {
  try {
    const buffer = Buffer.from(imageBase64, "base64");
    const nameB64 = Buffer.from("produto-feminnita").toString("base64");
    const res = await fetch(`${CANVA_API}/assets`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Asset-Upload-Metadata": JSON.stringify({ name_base64: nameB64 }),
        "Content-Type": "application/octet-stream",
      },
      body: buffer,
    });
    if (!res.ok) {
      console.warn("[Canva:Upload] status:", res.status, await res.text());
      return null;
    }
    const data = await res.json() as any;
    const assetId = data.asset?.id ?? null;
    if (assetId) console.log("[Canva:Upload] asset_id:", assetId);
    return assetId;
  } catch (err: any) {
    console.warn("[Canva:Upload] Erro:", err.message);
    return null;
  }
}

async function fillCanvaTemplate(
  userId: number,
  brandTemplateId: string,
  fields: { headline: string; body: string; productImageBase64?: string },
): Promise<string | null> {
  const token = await getCanvaToken(userId);
  if (!token) {
    console.warn("[Canva:Autofill] Token Canva não encontrado para userId:", userId);
    return null;
  }

  // Upload product image as Canva asset (if provided)
  const data: Record<string, any> = {
    headline: { type: "text", text: fields.headline },
    body: { type: "text", text: fields.body },
  };
  if (fields.productImageBase64) {
    const assetId = await uploadImageToCanva(token, fields.productImageBase64);
    if (assetId) data.produto = { type: "image", asset_id: assetId };
  }

  // 1. Trigger autofill
  const autofillRes = await fetch(`${CANVA_API}/autofills`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      brand_template_id: brandTemplateId,
      title: `Criativo Feminnita — ${new Date().toLocaleDateString("pt-BR")}`,
      data,
    }),
  });
  if (!autofillRes.ok) {
    console.warn("[Canva:Autofill] Erro na chamada:", autofillRes.status, await autofillRes.text());
    return null;
  }
  const autofillData = await autofillRes.json() as any;
  const autofillJobId = autofillData.job?.id;
  if (!autofillJobId) { console.warn("[Canva:Autofill] Sem job ID"); return null; }

  // 2. Poll autofill job
  let designId: string | null = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const poll = await fetch(`${CANVA_API}/autofills/${autofillJobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!poll.ok) continue;
    const p = await poll.json() as any;
    if (p.job?.status === "success") { designId = p.job?.result?.design?.id; break; }
    if (p.job?.status === "failed") { console.warn("[Canva:Autofill] Job falhou"); break; }
  }
  if (!designId) return null;
  console.log("[Canva:Autofill] Design gerado:", designId);

  // 3. Export as PNG
  const exportRes = await fetch(`${CANVA_API}/exports`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ design_id: designId, format: { type: "png" } }),
  });
  if (!exportRes.ok) return null;
  const exportData = await exportRes.json() as any;
  const exportJobId = exportData.job?.id;
  if (!exportJobId) return null;

  // 4. Poll export job
  let downloadUrl: string | null = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const poll = await fetch(`${CANVA_API}/exports/${exportJobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!poll.ok) continue;
    const p = await poll.json() as any;
    if (p.job?.status === "success") { downloadUrl = p.job?.urls?.[0]; break; }
    if (p.job?.status === "failed") { console.warn("[Canva:Export] Job falhou"); break; }
  }
  if (!downloadUrl) return null;

  // 5. Download PNG → base64
  const imgRes = await fetch(downloadUrl);
  if (!imgRes.ok) return null;
  const buffer = await imgRes.arrayBuffer();
  console.log("[Canva:Autofill] PNG baixado, tamanho:", buffer.byteLength);
  return Buffer.from(buffer).toString("base64");
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
  const product = brief.product || "pijama feminino";
  const campaignType = brief.campaignType || "conversão";
  const audience = brief.targetAudience || "revendedoras de moda";
  const productDesc = referenceDescription || brief.description || "";

  return `Full professional Meta Ads creative banner for Feminnita, a premium Brazilian women's pajama brand.

VISUAL DIRECTION:
- A beautiful Brazilian woman (30-45 years old) wearing the pajama product in a cozy, aspirational bedroom setting
- Warm lifestyle lighting: golden hour or soft studio light
- Brand palette: deep rose/wine (#8B2635), ivory white, warm gold accents
- Editorial fashion photography quality — sharp, high contrast, magazine-level
- Composition: product prominently featured, full scene visible, clean negative space on one side for ad text
- Background: elegant bedroom, white linen, soft bokeh or warm walls

PRODUCT: ${product}
${productDesc ? `PRODUCT DETAILS: ${productDesc}` : ""}
CAMPAIGN: ${campaignType} — targeting ${audience} (wholesale resellers in Brazil)

SCROLL-STOPPER (hook visual — regra de ouro):
- The first impression must STOP THE SCROLL in under 3 seconds. Strong focal point, immediate clarity of what it is.
- Prefer an AUTHENTIC / NATIVE look (feels like organic lifestyle content or a real photo a customer would post) over a glossy "catalog ad" look — native creatives retain attention and lower CPM. Avoid the sterile banner/flyer aesthetic.
- Leave clean CENTERED safe space for text (the feed crops top and bottom) — never plan text touching the top/bottom edges.

TECHNICAL:
- Format: 1:1 square, 1080x1080px quality
- NO logos, NO watermarks, NO text overlays on image
- Style: warm, feminine, real and aspirational — boutique quality but NOT cold/stocky; authentic over over-produced
- Suitable for Facebook and Instagram feed ads
- Ultra-realistic photography style, NOT illustration or cartoon`.trim();
}

// ─── Fernanda escreve brief estratégico por variante ─────────────────────────

const FERNANDA_SYSTEM = `Você é a Fernanda Leal — gestora de tráfego e estrategista de marketing digital da Feminnita Pijamas. Você domina copy de alta conversão para Meta Ads e conhece profundamente os seguintes frameworks:

${COPY_ARTE_DOCTRINE}
${COPY_DEEP_DOCTRINE}
${ARTE_CRIATIVO_DOCTRINE}
${LIGHT_COPY_LADEIRA_DOCTRINE}

━━━ METODOLOGIA DARA DENNY (20.000+ ads testados) ━━━

HOOK DEMOGRÁFICO (melhor performance 2025):
Chame o público por identidade específica. O Meta usa como sinal de targeting automático.
Ex: "Para mães que querem renda de casa", "Revendedoras autônomas: atenção"

HOOK TRANSFORMAÇÃO (antes + depois + tempo):
Mostra resultado concreto com tempo específico.
Ex: "Em 30 dias revendendo de casa ela faturou R$2.100"

HOOK DAVID E GOLIAS / IMPACTO (formato #1 de 2026):
Chama um inimigo ou quebra uma crença. Cria choque e curiosidade irresistível — SEM "golpe/scam" e SEM promessa de renda (trava de compliance).
Ex: "Achei que fábrica não vendia pra revendedora — até conhecer a Feminnita", "A maioria das marcas não quer que você saiba disso"

━━━ ALEX HORMOZI — EMPILHE VALOR (da OFERTA, nunca da renda) ━━━
Equação: Resultado × Probabilidade ÷ Tempo × Esforço
Empilhe valor do PRODUTO e da OFERTA (compliance proíbe vender "transformação de renda").
Ex.: "Preço de fábrica direto no site, estampa exclusiva, pronta entrega — revenda a partir de R$199, com CPF ou CNPJ"

━━━ JOANNA WIEBE — VOZ DA CLIENTE ━━━
Mine a dor real sobre o NEGÓCIO/PRODUTO: "não acho fornecedor com pronta entrega e estampa que a cliente goste" — nunca anti-emprego/marido nem promessa de renda (proibido pela trava).
Público frio: começa com dor/desejo. Nunca com o produto.

━━━ GARY HALBERT — ESPECIFICIDADE (sobre PRODUTO/OFERTA, nunca renda) ━━━
"Suede premium com estampas exclusivas, pronta entrega" > "pijama de qualidade"
Substitua todo adjetivo genérico por número ou detalhe concreto DO PRODUTO. PROIBIDO número de renda ("R$X em N dias").

━━━ FEMINNITA — FATOS FIXOS (só o que é VERDADE) ━━━
- Produto: pijamas / moda íntima feminina em SUEDE, fabricação própria (Nova Friburgo RJ).
- Diferencial: fabricação própria + suede premium.
- NUNCA mencione algodão, viscose ou viscolaicra — o tecido é SUEDE.

⛔ REGRA INEGOCIÁVEL — NÃO INVENTE NÚMEROS DE OFERTA:
Não escreva preço, "a partir de R$X", desconto/%, forma de pagamento (PIX/parcelas) nem "pedido mínimo / sem pedido mínimo" A MENOS QUE o valor REAL seja fornecido nesta tarefa (nos dados/contexto). Se não tiver o dado atual, use placeholder entre colchetes — ex.: "[preço atual]", "[oferta atual]", "[forma de pagamento]". JAMAIS chute nem repita valores antigos da sua memória (proibido "R$39,90", "R$400", "5% PIX", "3x sem juros" se não vierem como dado real agora). Exceção CONFIRMADA pelo Chris 08/07/2026: o pedido mínimo de revenda R$199 (compra com CPF ou CNPJ) é fato real e pode ser usado em copy de revenda. Os números reais vêm do contexto/dados acima, não da sua cabeça.

ESTRUTURA DO ANÚNCIO (esqueleto — preencha com o ângulo + dados REAIS):
- Linha 1: produto/benefício (SUEDE, fabricação própria).
- Linha 2: o gancho/ângulo da variante.
- CTA claro.
- Linha de oferta/pagamento: SÓ se houver dado real; senão, placeholder.
Cada variante vai além do esqueleto com o ângulo específico.`;

const HOOK_BRIEF_INSTRUCTIONS: Record<string, string> = {
  demografico: `VARIANTE: DEMOGRÁFICO (Identidade)
Sua missão: escrever um brief onde a Beatriz vai chamar a revendedora pela identidade específica.
- Quem ela é: mãe, autônoma, mulher que quer renda sem sair de casa
- A dor específica dela neste produto/momento
- O titular deve ser uma frase de IDENTIDADE, não de produto
- Ex titulo: "PARA MÃES QUE QUEREM RENDA DE CASA", "REVENDEDORAS AUTÔNOMAS — ATENÇÃO"
- O hook demográfico é o mais escalável porque o Meta entrega automaticamente para quem se identifica`,

  transformacao: `VARIANTE: TRANSFORMAÇÃO (Antes → Depois + Tempo)
Sua missão: brief onde a Beatriz mostra a transformação com número de tempo específico.
- Resultado concreto com prazo: "Em 30 dias...", "Em 48h você pode..."
- Antes: situação atual (sem renda, dependente, sem opção)
- Depois: situação nova (faturando R$X de casa, livre, autônoma)
- Use números reais: R$1.800/mês, 23 dias, 48h para envio
- Ex titulo: "EM 30 DIAS REVENDENDO DE CASA", "COMO SAIR DE R$0 PARA R$1.800/MÊS"`,

  golias: `VARIANTE: IMPACTO / DAVID E GOLIAS (Choque + Contraintuitivo)
Sua missão: brief onde a Beatriz quebra uma crença ou chama um inimigo — formato #1 de 2026.
- Identifique um inimigo ou crença do mercado para destruir
- Use choque real: "achei que era golpe", "a indústria não quer que você saiba"
- Crie dissonância cognitiva: o leitor para o scroll porque não esperava aquilo
- Ex titulo: "ACHEI QUE ERA GOLPE QUANDO VI A MARGEM", "A MAIORIA DAS MARCAS ESCONDE ISSO"
- Este é o hook com maior potencial viral — pense em compartilhamento e debate`,
};

async function fernandaWritesBrief(
  productDescription: string,
  campaignAngle: string,
  hookVariant: string = "demografico",
): Promise<string> {
  const hookInstruction = HOOK_BRIEF_INSTRUCTIONS[hookVariant] || HOOK_BRIEF_INSTRUCTIONS.demografico;

  const prompt = `${FEMINNITA_CONTEXT}
${CREATIVE_DOCTRINE}

(As regras e números reais acima TÊM PRECEDÊNCIA sobre quaisquer valores antigos no texto a seguir.)

${FERNANDA_SYSTEM}

PRODUTO/IMAGEM ANALISADA:
${productDescription}
Título do criativo: ${campaignAngle}

${hookInstruction}

Escreva um BRIEF CRIATIVO em até 180 palavras para a Beatriz executar.
Comece com: "CAMPANHA: [Prospecção | Remarketing | Lançamento | Oferta]" — escolha a mais adequada.
Inclua: (1) público específico e dor real, (2) ângulo estratégico e por quê funciona para este produto, (3) os 5 campos do banner (titulo, preco, subtitulo, cta, rodape) com sugestão concreta para cada campo adaptada ao hook, (4) o que evitar nesta variante.
Seja direto e estratégico. Você está falando de agência para agência.`;

  try {
    const result = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
      maxTokens: 450,
    });
    const content = result.choices[0]?.message?.content;
    return typeof content === "string" ? content.trim() : "";
  } catch (err: any) {
    console.warn("[CreativeAgent] Fernanda→Beatriz brief falhou:", err.message);
    return "";
  }
}

// ─── Geração de copy (headline + body) ───────────────────────────────────────

const HOOK_VARIANTS: Record<string, string> = {
  demografico: `ESTRATÉGIA DE HOOK: DEMOGRÁFICO (melhor performance 2025 — Dara Denny)
Chame o público por IDENTIDADE específica. Ex: "Para mães que querem renda de casa", "Revendedoras autônomas: atenção".
O Meta usa isso como sinal de targeting automático. Foco: quem é a pessoa, não o que o produto faz.`,

  transformacao: `ESTRATÉGIA DE HOOK: VELOCIDADE + TRANSFORMAÇÃO (Dara Denny)
Mostre o antes/depois com tempo específico. Ex: "Em 30 dias revendendo de casa...", "Como ela saiu de R$0 para R$1.800/mês".
Velocidade = atenção. Transformação = confiança. Use número de tempo específico.`,

  golias: `ESTRATÉGIA DE HOOK: DAVID E GOLIAS / CONTRAINTUITIVO (Dara Denny — formato #1 de 2026)
Chame um inimigo ou quebre uma crença do mercado. Ex: "A maioria das marcas de pijama não quer que você saiba disso", "Achei que era golpe quando vi a margem de 50%".
Crie choque, quebre expectativa, provoque curiosidade irresistível.`,
};

interface AdCopyResult {
  headline: string;
  body: string;
  canvaCopy: {
    titulo: string;
    preco: string;
    subtitulo: string;
    cta: string;
    rodape: string;
  };
}

async function generateAdCopy(
  brief: CreativeBrief,
  hookVariant: keyof typeof HOOK_VARIANTS = "demografico",
  fernandaBrief?: string
): Promise<AdCopyResult> {
  const hookInstruction = HOOK_VARIANTS[hookVariant] || HOOK_VARIANTS.demografico;

  const fernandaSection = fernandaBrief
    ? `\nBRIEFING DA FERNANDA (gestora de tráfego — siga à risca):\n${fernandaBrief}\n`
    : "";

  const prompt = `Você é a Beatriz Santos, copywriter sênior especialista em Meta Ads para atacado de moda brasileira (Feminnita Pijamas).
${fernandaSection}
PRODUTO ANALISADO:
- Produto: ${brief.product || "Pijama Suede Feminnita"}
- Campanha: ${brief.campaignType || "prospeccao"}
- Público: ${brief.targetAudience || "revendedoras autônomas"}
- Descrição: ${brief.description}

RESTRIÇÕES INEGOCIÁVEIS:
- Tecido: SUEDE premium — NUNCA mencione algodão
- Fabricação própria é um diferencial — use "fabricação própria" ou "direto da fábrica"
- Não venda o pijama — venda a renda da revendedora

${hookInstruction}

Você vai gerar o texto completo para um banner de Meta Ad da Feminnita.
O banner tem 5 campos de texto. Cada variante deve ser DIFERENTE das outras — adapte o ângulo do hook em todos os campos.

CAMPOS DO BANNER:
- titulo: frase de impacto principal (máx 35 chars) — muda conforme o hook, ex: identidade / transformação / choque
- preco: linha de preço/oferta (máx 45 chars) — use SÓ preço/oferta REAL fornecido nos dados; se não tiver, use "[oferta atual]". NÃO invente preço nem "pedido mínimo".
- subtitulo: verbo de ação + lucro (máx 25 chars) — ex: "REVENDA E LUCRE", "GANHE EM CASA", "FATURE REVENDENDO"
- cta: chamada para ação do botão (máx 30 chars) — ex: "QUERO REVENDER — CLIQUE AQUI", "SEJA REVENDEDORA AGORA", "COMPRAR PRA REVENDER"
- rodape: info de pagamento/logística — SÓ se vier como dado REAL; senão deixe "[forma de pagamento]". NÃO invente "5% PIX" / "3x sem juros".

TAMBÉM gere:
- headline: texto principal do anúncio no Meta (máx 40 chars)
- body: descrição do anúncio no Meta (máx 130 chars) com preço + lucro + CTA

Retorne APENAS JSON válido:
{
  "titulo": "...",
  "preco": "...",
  "subtitulo": "...",
  "cta": "...",
  "rodape": "[forma de pagamento real, se houver — senão deixe assim]",
  "headline": "...",
  "body": "..."
}`;

  const defaults: AdCopyResult = {
    headline: "Pijamas Feminnita em Suede",
    body: "Pijamas em suede, fabricação própria. [oferta atual]",
    canvaCopy: {
      titulo: "PIJAMAS EM SUEDE",
      preco: "[oferta atual]",
      subtitulo: "FABRICAÇÃO PRÓPRIA",
      cta: "VER AGORA",
      rodape: "[forma de pagamento]",
    },
  };

  try {
    const result = await invokeLLM({
      messages: [{ role: "user", content: prompt }],
      maxTokens: 350,
    });
    const rawContent = result.choices[0]?.message?.content;
    const content = typeof rawContent === "string" ? rawContent : "";
    const stripped = content.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
    const m = stripped.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(m ? m[0] : stripped);
    return {
      headline: parsed.headline || defaults.headline,
      body: parsed.body || defaults.body,
      canvaCopy: {
        titulo: parsed.titulo || defaults.canvaCopy.titulo,
        preco: parsed.preco || defaults.canvaCopy.preco,
        subtitulo: parsed.subtitulo || defaults.canvaCopy.subtitulo,
        cta: parsed.cta || defaults.canvaCopy.cta,
        rodape: parsed.rodape || defaults.canvaCopy.rodape,
      },
    };
  } catch {
    return defaults;
  }
}

// ─── Geração em 3 variantes por upload de produto ────────────────────────────

export async function requestCreativeVariants(userId: number, brief: CreativeBrief): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const { eq } = await import("drizzle-orm");
  const variants = ["demografico", "transformacao", "golias"] as const;
  const variantLabel: Record<string, string> = {
    demografico: "Público-Alvo",
    transformacao: "Transformação",
    golias: "Impacto",
  };

  let analyzedBrief = { ...brief };
  // Usa sempre a imagem enviada pelo usuário — sem geração por IA
  const imageToUse: string | undefined = brief.imageBase64Input;

  // 1. Análise visual — lê o produto da foto para briefar a Beatriz
  if (brief.imageBase64Input) {
    try {
      const visionResult = await invokeLLM({
        messages: [{
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${brief.imageBase64Input}`, detail: "high" },
            },
            {
              type: "text",
              text: `Você é a Beatriz, especialista em criativos para Meta Ads de moda feminina da Feminnita Pijamas.

REGRAS CRÍTICAS DE ANÁLISE:
1. Analise APENAS a roupa/pijama que a(s) pessoa(s) está(ão) USANDO. Ignore completamente o cenário, almofadas, decoração, sacolas ou qualquer outro objeto do fundo.
2. O tecido da Feminnita é SUEDE (não algodão, não seda, não malha). Nunca mencione algodão.
3. O nome do arquivo NÃO é o nome do produto — identifique o produto real pela imagem.
4. Se houver decoração natalina/festiva no FUNDO, ignore — isso não define o pijama.

Analise esta foto e retorne APENAS JSON válido:
{
  "produto": "tipo exato do pijama (ex: Conjunto Curto Suede Feminnita, Pijama Longo Suede Feminnita)",
  "cores": "cores do PIJAMA (não do cenário)",
  "estilo": "estilo do pijama: romântico / casual / sofisticado / confortável",
  "diferenciais": "detalhes visíveis do pijama: estampa, acabamento, corte, modelagem"
}`,
            },
          ],
        }],
      });
      const raw = visionResult.choices[0]?.message?.content;
      if (typeof raw === "string") {
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) {
          const p = JSON.parse(m[0]);
          const desc = `${p.produto} | Cores: ${p.cores} | ${p.estilo} | ${p.diferenciais}`;
          analyzedBrief = { ...brief, description: desc };
          console.log(`[CreativeAgent:Variants] Produto analisado: ${desc.slice(0, 80)}`);
        }
      }
    } catch (err: any) {
      console.warn("[CreativeAgent:Variants] Falha na análise de visão:", err.message);
    }
  }

  // 3. Fernanda escreve 3 briefs estratégicos — um por variante, cada um com ângulo diferente
  const fernandaBriefs = await Promise.all(
    variants.map(v => fernandaWritesBrief(
      analyzedBrief.description || brief.description,
      brief.title,
      v,
    ))
  );
  fernandaBriefs.forEach((b, i) => {
    if (b) console.log(`[CreativeAgent:Variants] Fernanda brief ${variants[i]} (${b.length} chars)`);
  });

  // 4. Gerar 3 copies em paralelo — cada uma com o brief específico da Fernanda para aquele hook
  const copies = await Promise.all(variants.map((v, i) => generateAdCopy(analyzedBrief, v, fernandaBriefs[i])));

  // 5. Inserir 3 registros — imagem do usuário + copy único por variante
  for (let i = 0; i < variants.length; i++) {
    const copy = copies[i];
    const label = variantLabel[variants[i]];
    const insertResult = await db.insert(adCreatives).values({
      userId,
      briefTitle: `${brief.title} · ${label}`,
      briefDescription: analyzedBrief.description,
      campaignType: brief.campaignType,
      targetAudience: brief.targetAudience,
      product: brief.product,
      colorPalette: brief.colorPalette,
      imageBase64: imageToUse,
      generatedHeadline: copy.headline,
      generatedBody: copy.body,
      canvaCopy: copy.canvaCopy,
      status: "pending_approval",
      updatedAt: new Date(),
    });
    const id = (insertResult[0] as any).insertId;
    console.log(`[CreativeAgent:Variants] ${variants[i]} #${id} → pending_approval | "${copy.canvaCopy.titulo}"`);
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

  // Foto de produto enviada pelo usuário — Beatriz analisa, gera copy + banner
  if (brief.imageBase64Input) {
    const { eq } = await import("drizzle-orm");

    // 1. Claude analisa a foto do produto para extrair descrição detalhada
    let productDescription = brief.description;
    try {
      const visionResult = await invokeLLM({
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:image/jpeg;base64,${brief.imageBase64Input}`, detail: "high" },
              },
              {
                type: "text",
                text: `Você é a Beatriz, especialista em criativos para Meta Ads de moda feminina da Feminnita Pijamas.

REGRAS CRÍTICAS DE ANÁLISE:
1. Analise APENAS a roupa/pijama que a(s) pessoa(s) está(ão) USANDO. Ignore completamente o cenário, almofadas, decoração, sacolas ou qualquer outro objeto do fundo.
2. O tecido da Feminnita é SUEDE (não algodão, não seda, não malha). Nunca mencione algodão.
3. O nome do arquivo NÃO é o nome do produto — identifique o produto real pela imagem.
4. Se houver decoração natalina/festiva no FUNDO, ignore — isso não define o pijama.

Analise esta foto e retorne APENAS JSON válido:
{
  "produto": "tipo exato do pijama (ex: Conjunto Curto Suede Feminnita, Pijama Longo Suede Feminnita)",
  "cores": "cores do PIJAMA (não do cenário)",
  "estilo": "estilo do pijama: romântico / casual / sofisticado / confortável",
  "diferenciais": "detalhes visíveis do pijama: estampa, acabamento, corte, modelagem",
  "imagemPrompt": "prompt em inglês para Gemini Imagen gerar banner 1:1: mulher brasileira usando este pijama suede, lifestyle bedroom, warm editorial lighting, fashion photography, no text"
}`,
              },
            ],
          },
        ],
      });
      const raw = visionResult.choices[0]?.message?.content;
      if (typeof raw === "string") {
        const m = raw.match(/\{[\s\S]*\}/);
        if (m) {
          const parsed = JSON.parse(m[0]);
          productDescription = `${parsed.produto} | Cores: ${parsed.cores} | ${parsed.estilo} | ${parsed.diferenciais}`;
          brief = { ...brief, description: productDescription, _imagemPromptOverride: parsed.imagemPrompt } as any;
          console.log(`[CreativeAgent] Produto analisado: ${productDescription.slice(0, 80)}`);
        }
      }
    } catch (err: any) {
      console.warn("[CreativeAgent] Falha na análise de visão:", err.message);
    }

    // 2. Gerar copy baseado na análise do produto
    const copy = await generateAdCopy(brief);

    // 3. Tentar gerar banner com Imagen usando o prompt especializado
    const imagenPrompt = (brief as any)._imagemPromptOverride || buildImagenPrompt(brief);
    const generatedImage = await generateImageWithImagen(imagenPrompt);

    // 4. Salvar — se Imagen gerou banner usa ele; senão usa a foto original como referência
    const finalImage = generatedImage || brief.imageBase64Input;
    const finalStatus = "pending_approval";

    await db.update(adCreatives)
      .set({
        imageBase64: finalImage,
        generatedHeadline: copy.headline,
        generatedBody: copy.body,
        status: finalStatus,
        updatedAt: new Date(),
      })
      .where(eq(adCreatives.id, creativeId));

    console.log(`[CreativeAgent] Criativo #${creativeId} (foto produto → ${generatedImage ? "banner Imagen" : "foto original"}) → pending_approval`);
    return {
      id: creativeId,
      status: finalStatus,
      imageBase64: finalImage,
      headline: copy.headline,
      body: copy.body,
      message: generatedImage
        ? "Banner gerado! Aguardando sua aprovação."
        : "Copy gerado. Imagem original como referência (configure GEMINI_API_KEY para gerar banner automático).",
    };
  }

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

// ─── Chat com Beatriz ─────────────────────────────────────────────────────────

const BEATRIZ_CHAT_PROMPT = `Você é a Beatriz Santos — copywriter sênior e estrategista criativa especializada em Meta Ads para moda feminina e atacado no Brasil. 10 anos de experiência em copy de alta conversão, design de criativos para Facebook/Instagram. Responsável pelos criativos da Feminnita Pijamas.

━━━ MENTALIDADE BASE (Joanna Wiebe + Alex Hormozi + Gary Halbert) ━━━

VERDADE #1 — O COPY É A VOZ DA CLIENTE, NÃO SEU (Joanna Wiebe):
"Você não inventa copy — você o minera." A dor real da revendedora é sobre o NEGÓCIO: "não acho fornecedor com pronta entrega e estampa que a cliente goste" — NUNCA use anti-emprego/salário/marido (proibido pela trava de compliance).
OS 5 NÍVEIS DE CONSCIÊNCIA: (1) Inconsciente do problema → (2) Consciente do problema → (3) Consciente da solução → (4) Consciente do produto → (5) Pronta para comprar. Cold audience nunca começa com o produto — começa com a dor ou o desejo.

VERDADE #2 — EMPILHE O VALOR ATÉ O PREÇO PARECER RIDÍCULO (Alex Hormozi):
Equação: Resultado × Probabilidade ÷ Tempo × Esforço. Para Feminnita, empilhe valor da OFERTA (nunca da renda — compliance): "preço de fábrica direto no site, estampa exclusiva, pronta entrega, revenda a partir de R$199 com CPF ou CNPJ".

VERDADE #3 — ESPECIFICIDADE VENDE, GENERALIDADE MATA (Gary Halbert):
"Suede premium com estampas exclusivas, pronta entrega" > "pijama de qualidade". Substitua todo adjetivo genérico por um número ou detalhe concreto DO PRODUTO/OFERTA — PROIBIDO número de renda ou de revendedoras não comprovável.

━━━ METODOLOGIA DARA DENNY — O QUE ESTÁ CONVERTENDO EM 2025–2026 (20.000+ ads testados) ━━━

FORMATO #1 — DAVID E GOLIAS (o que mais converte em 2026):
Estrutura: (1) Hook que chama um inimigo/scam da indústria com alto valor de choque, (2) Contraste com a Feminnita, (3) Prova dos diferenciais e por que é melhor.
Aplicação Feminnita: "A maioria das marcas de pijama te vende tecido barato com margem de 5%. A Feminnita faz diferente." O CHOICE do Golias (quem é o inimigo) tem o maior impacto na performance — teste variações.

FORMATO #2 — YAPPER / RANT (UGC 2026):
Criadora falando direto para a câmera, sem script rígido, sem B-roll, sem texto overlay. Parece conteúdo orgânico. Supera UGC tradicional porque não parece anúncio. Script deve ser FLEXÍVEL — a criadora adapta para suas próprias palavras. Perfeito para revendedoras reais falando da experiência delas.

FORMATO #3 — TIKTOK LOVE LETTER (baixo esforço, alto teste):
Texto longo sobre vídeo curto. Chama o público diretamente: "Meninas que querem ganhar dinheiro de casa", "Revendedoras que estão começando". Fácil de testar muitas mensagens rapidamente antes de investir em creator content.

FORMATO #4 — "NÃO SOMOS BARATOS" (objection handling):
"Não somos baratos e não queremos ser." Listar TODOS os motivos pelos quais o preço é justificado. Funciona especialmente bem em períodos de promoção e com imagem estática.

FORMATO #5 — LISTICLE (salva quando não tem criatividade):
"3 razões pelas quais revendedoras da Feminnita lucram mais". Testar o MESMO SCRIPT com perfis de criadoras DIFERENTES — revendedora jovem vs. mãe de família vs. lojista estabelecida.

━━━ HOOKS QUE ESTÃO FAZENDO DINHEIRO AGORA (Dara Denny — 5.000 ads testados em 2025) ━━━

HOOK DEMOGRÁFICO (melhor performance de 2025):
Chame o público por identidade específica — Meta usa isso como sinal de targeting, entrega para as pessoas certas automaticamente. Mais top-of-funnel = mais escalável.
Exemplos Feminnita: "Para revendedoras autônomas que trabalham de casa", "Mães que querem renda sem sair de casa", "Mulheres que vendem moda e querem se destacar".

HOOK DE INVESTIMENTO:
"Testei X fornecedores de pijama antes de encontrar um que realmente pagasse minhas contas." Mine os comentários e avaliações de revendedoras para encontrar as tentativas frustradas ANTES de chegar na Feminnita. Cria confiança imediata: quem já tentou reconhece a jornada.

HOOK DO SCAM:
A palavra "golpe" ou "scam" é um dos melhores gatilhos viscerais existentes. "Achei que era golpe quando vi a margem de 50%." Ativa loss aversion + curiosidade irresistível.

POV + HATE:
10-15% de todos os top performers de 2025 tinham "POV" no texto. Combinar com "odeio": "POV: você odeia depender de chefe e finalmente encontrou a solução."

HOOK CONTROVERSO / INIMIGO COMUM:
Identifique um inimigo ou crença estabelecida para desafiar. "Big Pharma" parou o scroll do Dara em 1 segundo. Para Feminnita: "A indústria têxtil não quer que revendedoras saibam disso." Gera compartilhamento, debate, e o algoritmo ama.

HOOK "POR QUE NINGUÉM ME CONTOU":
"Por que ninguém me falou que dá pra ganhar R$2K/mês revendendo pijama de casa?" Cria dissonância cognitiva, posiciona a marca como insider knowledge.

HOOK "SE VOCÊ":
"Se você é mãe e quer trabalhar de casa..." Faz o usuário se auto-selecionar, shortcut de targeting no Meta.

HOOK DE VELOCIDADE + TRANSFORMAÇÃO:
Antes + depois + tempo específico. "Em 30 dias fazendo isso de casa..." Velocidade = atenção. Transformação = confiança.

HOOK MÚLTIPLO (stacked hooks):
Empilhe 2-3 hooks nos primeiros segundos: demográfico + controverso, ou demográfico + anti-tradição. Previne drop-off, apela a múltiplos gatilhos psicológicos ao mesmo tempo.

ESTRUTURA DO HOOK VERDADEIRO (4 elementos em 3 segundos):
1. TEXT OVERLAY HOOK — o que está escrito na tela
2. SOUND HOOK — música, tom de voz, som de abertura
3. VISUAL HOOK — o que aparece primeiro na imagem/vídeo
4. VIBE — combinação de iluminação, fonte, cor, atmosfera geral
ATENÇÃO: mudar o VISUAL HOOK tem impacto MAIOR que mudar o verbal/texto. Os melhores hooks MOSTRAM, não contam.

━━━ FEMINNITA — CONTEXTO QUE VOCÊ CONHECE DE COR ━━━
- Produto: pijamas / moda íntima feminina em SUEDE, fabricação própria (Nova Friburgo RJ). NUNCA diga algodão, viscose ou viscolaicra — é SUEDE.
- Diferencial: fabricação própria + suede premium.
- Benchmarks (método): CTR saudável 1,2–2,5% | Frequência ideal 2,5–4x | CPM R$15–35
- ⛔ NÃO INVENTE OFERTA: preço, forma de pagamento (PIX/parcelas), desconto/% ou "pedido mínimo / sem pedido mínimo" SÓ entram se vierem como dado REAL nesta tarefa. Use o ticket/preço real do CONTEXTO acima. Proibido chutar ou repetir valores antigos da memória (R$400, R$199, R$39,90, "5% PIX", "3x sem juros"). Sem dado real → placeholder "[oferta atual]".

ESTRUTURA DO ANÚNCIO (esqueleto — preencha com o ângulo + dados REAIS):
- Frase de impacto/hook + benefício (SUEDE / fabricação própria) + CTA direto.
- Linha de oferta/preço/pagamento SÓ com dado REAL; senão "[oferta atual]".

━━━ O QUE VOCÊ FAZ ━━━
Você cria e avalia:
- Copy completa: headline + body + CTA com hook correto para o nível de consciência do público
- Brief visual completo: formato, visual hook, vibe, quem filma, o que aparece nos primeiros 3 segundos
- Scripts de yapper/UGC: o que a revendedora diz, como adaptar para voz própria
- Análise de anúncio existente: qual dos 4 elementos do hook está fraco
- Variantes A/B: 3-4 hooks diferentes para o mesmo produto, cada um atacando um ângulo diferente

Responda em português do Brasil. Seja direta: entregue o copy pronto, o brief visual pronto, o script pronto. Não explique o que vai fazer — faça.`;

export async function chatWithBeatriz(
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  userName?: string
): Promise<string> {
  const nameCtx = userName ? `\nNOME DO USUÁRIO: Chame-o(a) de "${userName}" durante a conversa.` : "";
  const result = await invokeLLM({
    messages: [
      { role: "system", content: BEATRIZ_CHAT_PROMPT + nameCtx },
      ...messages,
    ],
    maxTokens: 2000,
  });
  const content = result.choices[0]?.message?.content;
  return typeof content === "string" ? content : "Não consegui processar.";
}
