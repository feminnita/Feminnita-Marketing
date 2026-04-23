import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { tiktokShopEvaluations, tiktokShopEvaluationMessages } from "../../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  runTiktokShopEvaluation,
  chatWithTiktokShopAgent,
  collectTiktokShopData,
} from "../agents/tiktok-shop-agent";

export const tiktokShopManagerRouter = router({
  triggerEvaluation: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new Error("Banco indisponível");

    const shopId = process.env.TIKTOK_SHOP_ID || null;

    const result = await db.insert(tiktokShopEvaluations).values({
      userId: ctx.user.id,
      shopId: shopId ?? undefined,
      status: "pending",
      triggeredAt: new Date(),
      createdAt: new Date(),
    });

    const evaluationId = Array.isArray(result) ? result[0].insertId : (result as any).insertId;

    runTiktokShopEvaluation(evaluationId).catch((err) =>
      console.error("[TikTokShopManager] Erro:", err)
    );

    return { evaluationId, status: "pending" };
  }),

  getEvaluation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const rows = await db
        .select()
        .from(tiktokShopEvaluations)
        .where(and(eq(tiktokShopEvaluations.id, input.id), eq(tiktokShopEvaluations.userId, ctx.user.id)));

      if (!rows.length) throw new Error("Avaliação não encontrada");

      const ev = rows[0];
      return {
        ...ev,
        rawMetrics: ev.rawMetrics ? JSON.parse(ev.rawMetrics) : null,
        recommendations: ev.recommendations ? JSON.parse(ev.recommendations) : [],
      };
    }),

  listEvaluations: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    return db
      .select({
        id: tiktokShopEvaluations.id,
        status: tiktokShopEvaluations.status,
        summary: tiktokShopEvaluations.summary,
        errorMessage: tiktokShopEvaluations.errorMessage,
        triggeredAt: tiktokShopEvaluations.triggeredAt,
        completedAt: tiktokShopEvaluations.completedAt,
      })
      .from(tiktokShopEvaluations)
      .where(eq(tiktokShopEvaluations.userId, ctx.user.id))
      .orderBy(desc(tiktokShopEvaluations.triggeredAt))
      .limit(20);
  }),

  listProducts: protectedProcedure.query(async () => {
    return collectTiktokShopData();
  }),

  sendMessage: protectedProcedure
    .input(z.object({
      evaluationId: z.number(),
      message: z.string().min(1).max(2000),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const ev = await db
        .select()
        .from(tiktokShopEvaluations)
        .where(and(eq(tiktokShopEvaluations.id, input.evaluationId), eq(tiktokShopEvaluations.userId, ctx.user.id)));

      if (!ev.length || ev[0].status !== "done") {
        throw new Error("Avaliação não encontrada ou ainda não concluída");
      }

      await db.insert(tiktokShopEvaluationMessages).values({
        evaluationId: input.evaluationId,
        userId: ctx.user.id,
        role: "user",
        content: input.message,
        createdAt: new Date(),
      });

      const history = await db
        .select()
        .from(tiktokShopEvaluationMessages)
        .where(eq(tiktokShopEvaluationMessages.evaluationId, input.evaluationId))
        .orderBy(tiktokShopEvaluationMessages.createdAt);

      const reply = await chatWithTiktokShopAgent(
        history.map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content })),
        ev[0].rawMetrics || "[]"
      );

      await db.insert(tiktokShopEvaluationMessages).values({
        evaluationId: input.evaluationId,
        userId: ctx.user.id,
        role: "assistant",
        content: reply,
        createdAt: new Date(),
      });

      return { reply };
    }),

  getMessages: protectedProcedure
    .input(z.object({ evaluationId: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];

      const ev = await db
        .select({ id: tiktokShopEvaluations.id })
        .from(tiktokShopEvaluations)
        .where(and(eq(tiktokShopEvaluations.id, input.evaluationId), eq(tiktokShopEvaluations.userId, ctx.user.id)));

      if (!ev.length) return [];

      return db
        .select()
        .from(tiktokShopEvaluationMessages)
        .where(eq(tiktokShopEvaluationMessages.evaluationId, input.evaluationId))
        .orderBy(tiktokShopEvaluationMessages.createdAt);
    }),

  refreshShopCipher: protectedProcedure.mutation(async () => {
    const { fetchAndStoreShopCipher } = await import("../services/tiktokShopApi");
    const cipher = await fetchAndStoreShopCipher();
    if (!cipher) throw new Error("Não foi possível renovar o shop_cipher. Verifique o token de acesso.");
    return { ok: true, cipher: cipher.slice(0, 8) + "..." };
  }),

  getAuthStatus: protectedProcedure.query(() => {
    const shopId = process.env.TIKTOK_SHOP_ID;
    const accessToken = process.env.TIKTOK_SHOP_ACCESS_TOKEN;
    const connected = !!(accessToken);
    return { connected, shopId: shopId || undefined };
  }),

  checkProductPermissions: protectedProcedure.mutation(async () => {
    const { tiktokShopPost } = await import("../services/tiktokShopApi");

    const results: Record<string, string> = {};

    // Test 1: product.read — POST /product/202309/products/search é o método correto
    try {
      const res = await tiktokShopPost("/product/202309/products/search", { page_size: 1 }) as any;
      if (res?.code === 0 || res?.data) {
        results.product_read = "✅ OK — product.read concedido";
      } else if (res?.code === 105000 || res?.code === 40100) {
        results.product_read = "❌ Sem permissão product.read";
      } else {
        results.product_read = `⚠️ Código ${res?.code}: ${res?.message || "ver logs"}`;
      }
    } catch (e: any) {
      results.product_read = `❌ Erro: ${e.message}`;
    }

    // Test 2: product.write — POST para criar produto com dados mínimos (vai falhar por dados inválidos, mas não por permissão)
    try {
      const res = await tiktokShopPost("/product/202309/products", { title: "PERMISSION_TEST" }) as any;
      if (res?.code === 105000 || res?.code === 40100) {
        results.product_write = "❌ Sem permissão product.write — precisa renovar token com escopo PRODUCT_WRITE";
      } else if (res?.code === 0) {
        results.product_write = "✅ OK — product.write concedido";
      } else {
        // Qualquer outro erro (validação, dados incompletos) = permissão existe, dados que faltam
        results.product_write = `✅ OK — product.write concedido (erro de validação esperado: ${res?.code})`;
      }
    } catch (e: any) {
      results.product_write = `⚠️ Erro ao testar: ${e.message}`;
    }

    return results;
  }),
});
