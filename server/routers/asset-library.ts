import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { assetLibrary, productCollections, contentBriefs } from "../../drizzle/schema";
import { eq, and, desc, inArray } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

export const assetLibraryRouter = router({
  // ── Gerenciamento de Assets ───────────────────────────────────────────────

  uploadAsset: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        category: z.enum(["produto", "lifestyle", "modelo", "colecao", "background", "logo", "outro"]),
        url: z.string().url(),
        thumbnailUrl: z.string().url().optional(),
        mimeType: z.string().max(100).optional(),
        fileSize: z.number().int().optional(),
        tags: z.array(z.string()).optional(),
        platform: z.enum(["instagram", "tiktok", "todos"]).default("todos"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");

      const { url } = input;
      let aiAnalysis: string | undefined;

      const isImage = url.match(/\.(jpg|jpeg|png|webp|gif)/i);
      if (isImage) {
        try {
          const llmResult = await invokeLLM({
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "text",
                    text: "Descreva este produto/imagem para uso em marketing de moda feminina. Inclua: tipo de produto, cores principais, estilo, ocasião de uso, pontos de venda. Seja conciso (máx 3 frases).",
                  },
                  { type: "image_url", image_url: { url } },
                ],
              },
            ],
          });
          aiAnalysis =
            typeof llmResult.choices[0].message.content === "string"
              ? llmResult.choices[0].message.content
              : "";
        } catch (err) {
          console.error("[AssetLibrary] Erro ao analisar imagem com LLM:", err);
        }
      }

      const [inserted] = await db
        .insert(assetLibrary)
        .values({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          category: input.category,
          url: input.url,
          thumbnailUrl: input.thumbnailUrl,
          mimeType: input.mimeType,
          fileSize: input.fileSize,
          tags: input.tags ?? [],
          platform: input.platform,
          aiAnalysis,
          isActive: true,
        })
        .$returningId();

      // Fernanda briefing Beatriz internamente — só para imagens de produto (3 variantes)
      if (input.category === "produto") {
        (async () => {
          try {
            const res = await fetch(input.url.startsWith("http") ? input.url : `http://localhost:${process.env.PORT || 3000}${input.url}`);
            const buf = await res.arrayBuffer();
            const imageBase64 = Buffer.from(buf).toString("base64");
            const { requestCreativeVariants } = await import("../agents/creative-agent");
            await requestCreativeVariants(ctx.user.id, {
              title: `Criativo — ${input.name}`,
              description: [
                "MARCA: Feminnita Pijamas | TECIDO: Suede premium (NUNCA algodão)",
                "PÚBLICO: Revendedoras autônomas que querem renda extra de casa",
                "ÂNGULO DA CAMPANHA: " + input.name,
                aiAnalysis ? "ANÁLISE DA IMAGEM: " + aiAnalysis : "",
                input.description ? "DESCRIÇÃO ADICIONAL: " + input.description : "",
              ].filter(Boolean).join(" | "),
              imageBase64Input: imageBase64,
              campaignType: "prospeccao",
              targetAudience: "revendedoras autônomas — mulheres que querem renda extra de casa, sem estoque",
              product: "Pijama Suede Feminnita",
            });
            console.log(`[AssetLibrary] Fernanda→Beatriz: 3 variantes iniciadas para "${input.name}"`);
          } catch (err: any) {
            console.error(`[AssetLibrary] Fernanda→Beatriz falhou para "${input.name}":`, err.message);
          }
        })();
      }

      return { id: inserted.id, aiAnalysis };
    }),

  uploadAssetFile: protectedProcedure
    .input(z.object({
      fileName: z.string().min(1).max(255),
      fileData: z.string(), // base64
      contentType: z.string(),
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      category: z.enum(["produto", "lifestyle", "modelo", "colecao", "background", "logo", "outro"]),
      platform: z.enum(["instagram", "tiktok", "todos"]).default("todos"),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");

      const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
      if (!allowed.includes(input.contentType)) throw new Error("Tipo não permitido. Use JPEG, PNG, WebP ou GIF.");

      const buffer = Buffer.from(input.fileData, "base64");
      if (buffer.length > 15 * 1024 * 1024) throw new Error("Arquivo muito grande. Máximo 15MB.");

      const fs = await import("fs/promises");
      const path = await import("path");
      const crypto = await import("crypto");
      const ext = input.contentType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
      const filename = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${ext}`;
      const uploadsDir = path.resolve(process.cwd(), "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      await fs.writeFile(path.join(uploadsDir, filename), buffer);
      const url = `/uploads/${filename}`;

      let aiAnalysis: string | undefined;
      try {
        const { invokeLLM } = await import("../_core/llm");
        const llmResult = await invokeLLM({
          messages: [{ role: "user", content: [
            { type: "text", text: "Descreva este produto para uso em marketing de moda feminina. Inclua: tipo, cores, estilo, pontos de venda. Máx 3 frases." },
            { type: "image_url", image_url: { url } },
          ]}],
        });
        const c = llmResult.choices[0]?.message?.content;
        aiAnalysis = typeof c === "string" ? c : "";
      } catch { /* análise opcional */ }

      const [inserted] = await db.insert(assetLibrary).values({
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
        category: input.category,
        url,
        mimeType: input.contentType,
        fileSize: buffer.length,
        tags: [],
        platform: input.platform,
        aiAnalysis,
        isActive: true,
      }).$returningId();

      // Fernanda briefing Beatriz internamente — só para imagens de produto (3 variantes)
      if (input.category === "produto") {
        const assetBase64 = input.fileData;
        const assetName = input.name;
        const assetAnalysis = aiAnalysis;
        const assetDesc = input.description;
        const assetUserId = ctx.user.id;
        (async () => {
          try {
            const { requestCreativeVariants } = await import("../agents/creative-agent");
            await requestCreativeVariants(assetUserId, {
              title: `Criativo — ${assetName}`,
              description: [
                "MARCA: Feminnita Pijamas | TECIDO: Suede premium (NUNCA algodão)",
                "PÚBLICO: Revendedoras autônomas que querem renda extra de casa",
                "ÂNGULO DA CAMPANHA: " + assetName,
                assetAnalysis ? "ANÁLISE DA IMAGEM: " + assetAnalysis : "",
                assetDesc ? "DESCRIÇÃO ADICIONAL: " + assetDesc : "",
              ].filter(Boolean).join(" | "),
              imageBase64Input: assetBase64,
              campaignType: "prospeccao",
              targetAudience: "revendedoras autônomas — mulheres que querem renda extra de casa, sem estoque",
              product: "Pijama Suede Feminnita",
            });
            console.log(`[AssetLibrary] Fernanda→Beatriz: 3 variantes iniciadas para "${assetName}"`);
          } catch (err: any) {
            console.error(`[AssetLibrary] Fernanda→Beatriz falhou para "${assetName}":`, err.message);
          }
        })();
      }

      return { id: inserted.id, url, aiAnalysis };
    }),

  listAssets: protectedProcedure
    .input(
      z.object({
        category: z
          .enum(["produto", "lifestyle", "modelo", "colecao", "background", "logo", "outro"])
          .optional(),
        platform: z.enum(["instagram", "tiktok", "todos"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");

      const conditions = [
        eq(assetLibrary.userId, ctx.user.id),
        eq(assetLibrary.isActive, true),
      ];

      if (input.category) {
        conditions.push(eq(assetLibrary.category, input.category));
      }

      if (input.platform) {
        conditions.push(eq(assetLibrary.platform, input.platform));
      }

      return db
        .select()
        .from(assetLibrary)
        .where(and(...conditions))
        .orderBy(desc(assetLibrary.createdAt));
    }),

  deleteAsset: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");

      await db
        .update(assetLibrary)
        .set({ isActive: false })
        .where(
          and(eq(assetLibrary.id, input.id), eq(assetLibrary.userId, ctx.user.id))
        );

      return { success: true };
    }),

  updateAsset: protectedProcedure
    .input(
      z.object({
        id: z.number().int(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        tags: z.array(z.string()).optional(),
        category: z
          .enum(["produto", "lifestyle", "modelo", "colecao", "background", "logo", "outro"])
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");

      const { id, ...fields } = input;

      // Only update fields that were provided
      const updateData: Record<string, unknown> = {};
      if (fields.name !== undefined) updateData.name = fields.name;
      if (fields.description !== undefined) updateData.description = fields.description;
      if (fields.tags !== undefined) updateData.tags = fields.tags;
      if (fields.category !== undefined) updateData.category = fields.category;

      if (Object.keys(updateData).length === 0) {
        return { success: true };
      }

      await db
        .update(assetLibrary)
        .set(updateData)
        .where(and(eq(assetLibrary.id, id), eq(assetLibrary.userId, ctx.user.id)));

      return { success: true };
    }),

  // ── Gerenciamento de Coleções ─────────────────────────────────────────────

  createCollection: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        collectionType: z.enum(["produto", "colecao", "campanha", "temporada"]),
        season: z.string().max(100).optional(),
        launchDate: z.string().datetime().optional(),
        assetIds: z.array(z.number().int()),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");

      const [inserted] = await db
        .insert(productCollections)
        .values({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          collectionType: input.collectionType,
          season: input.season,
          launchDate: input.launchDate ? new Date(input.launchDate) : undefined,
          assetIds: input.assetIds,
          status: "rascunho",
          briefsGenerated: false,
        })
        .$returningId();

      return { id: inserted.id };
    }),

  activateCollection: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");

      // Fetch the collection
      const rows = await db
        .select()
        .from(productCollections)
        .where(
          and(
            eq(productCollections.id, input.id),
            eq(productCollections.userId, ctx.user.id)
          )
        )
        .limit(1);

      const collection = rows[0];
      if (!collection) throw new Error("Coleção não encontrada");

      // Activate
      await db
        .update(productCollections)
        .set({ status: "ativo" })
        .where(eq(productCollections.id, input.id));

      // Auto-generate content briefs for each asset in the collection
      const assetIds = (collection.assetIds as number[]) ?? [];
      let assets: typeof assetLibrary.$inferSelect[] = [];

      if (assetIds.length > 0) {
        assets = await db
          .select()
          .from(assetLibrary)
          .where(inArray(assetLibrary.id, assetIds));
      }

      const briefTemplates: Array<{
        briefType: "carousel" | "reel" | "story" | "post" | "feed";
        topic: string;
      }> = [
        {
          briefType: "carousel",
          topic: `Conheça nossa nova ${collection.collectionType}: ${collection.name}`,
        },
        {
          briefType: "reel",
          topic: `Lançamento: ${collection.name} - ${collection.season ?? "Nova Temporada"}`,
        },
        {
          briefType: "story",
          topic: `Novidade! ${collection.name}`,
        },
        {
          briefType: "story",
          topic: `Novidade! ${collection.name}`,
        },
        {
          briefType: "feed",
          topic: `${collection.name} — confira os destaques da coleção`,
        },
        {
          briefType: "feed",
          topic: `${collection.name} — estilo e conforto juntos`,
        },
      ];

      const assetReference =
        assets.length > 0
          ? `Imagens disponíveis: ${assets.map((a) => a.name).join(", ")}.`
          : "";

      for (const template of briefTemplates) {
        await db.insert(contentBriefs).values({
          userId: ctx.user.id,
          briefType: template.briefType,
          topic: `${template.topic}. ${assetReference}`.trim(),
          status: "pending",
        });
      }

      // Mark briefs as generated
      await db
        .update(productCollections)
        .set({ briefsGenerated: true })
        .where(eq(productCollections.id, input.id));

      return { success: true, briefsCreated: briefTemplates.length };
    }),

  listCollections: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("DB indisponível");

    return db
      .select()
      .from(productCollections)
      .where(eq(productCollections.userId, ctx.user.id))
      .orderBy(desc(productCollections.createdAt));
  }),

  getCollection: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");

      const rows = await db
        .select()
        .from(productCollections)
        .where(
          and(
            eq(productCollections.id, input.id),
            eq(productCollections.userId, ctx.user.id)
          )
        )
        .limit(1);

      const collection = rows[0];
      if (!collection) return null;

      const assetIds = (collection.assetIds as number[]) ?? [];
      let assets: typeof assetLibrary.$inferSelect[] = [];

      if (assetIds.length > 0) {
        assets = await db
          .select()
          .from(assetLibrary)
          .where(inArray(assetLibrary.id, assetIds));
      }

      return { ...collection, assets };
    }),

  archiveCollection: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB indisponível");

      await db
        .update(productCollections)
        .set({ status: "arquivado" })
        .where(
          and(
            eq(productCollections.id, input.id),
            eq(productCollections.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),
});
