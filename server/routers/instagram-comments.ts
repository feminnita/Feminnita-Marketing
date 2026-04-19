/**
 * Instagram Comments Router — Gerenciar respostas a comentários
 * Inclui webhook Meta + endpoints tRPC para fila de revisão
 */

import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { getDb } from "../db";
import { instagramCommentReplies } from "../../drizzle/schema";
import { eq, desc, or } from "drizzle-orm";
import { processInstagramComment, postCommentReply } from "../agents/sofia-comments-agent";
import type { Express } from "express";

// ─── Webhook Meta (fora do tRPC) ──────────────────────────────────────────────

const WEBHOOK_VERIFY_TOKEN = process.env.INSTAGRAM_WEBHOOK_VERIFY_TOKEN || "feminnita_webhook_2026";

export function registerInstagramWebhook(app: Express) {
  // Helper de verificação — reutilizado para Instagram e Facebook
  const verifyWebhook = (req: any, res: any) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];
    if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
      console.log("[Webhook] Verificado com sucesso");
      return res.status(200).send(challenge);
    }
    return res.status(403).send("Forbidden");
  };

  /**
   * GET /api/instagram/webhook — verificação do webhook pela Meta
   */
  app.get("/api/instagram/webhook", (req, res) => {
    const mode = req.query["hub.mode"];
    const token = req.query["hub.verify_token"];
    const challenge = req.query["hub.challenge"];

    return verifyWebhook(req, res);
  });

  // GET /api/facebook/webhook — verificação Facebook Page webhook
  app.get("/api/facebook/webhook", verifyWebhook);

  /**
   * POST /api/instagram/webhook — recebe eventos de comentário
   */
  app.post("/api/instagram/webhook", async (req, res) => {
    // Responde 200 imediatamente (Meta exige resposta rápida)
    res.status(200).send("EVENT_RECEIVED");

    try {
      const body = req.body;

      // ── Instagram comments ───────────────────────────────────────────────
      if (body.object === "instagram") {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field !== "comments") continue;
            const val = change.value;
            if (!val?.id || !val?.text) continue;
            const igAccountId = process.env.META_IG_ACCOUNT_ID || "";
            if (igAccountId && val.from?.id === igAccountId) continue;
            console.log(`[InstagramWebhook] Comentário de ${val.from?.name}: "${val.text?.slice(0, 80)}"`);
            await processInstagramComment({
              commentId: val.id,
              postId: val.media?.id || "",
              authorName: val.from?.name || "",
              authorId: val.from?.id || "",
              commentText: val.text || "",
            });
          }
        }
        return;
      }

      // ── Facebook Page comments ───────────────────────────────────────────
      if (body.object === "page") {
        for (const entry of body.entry || []) {
          for (const change of entry.changes || []) {
            if (change.field !== "feed") continue;
            const val = change.value;
            // Só comentários novos em posts (ignora likes, shares, etc.)
            if (val?.item !== "comment" || val?.verb !== "add") continue;
            if (!val?.comment_id || !val?.message) continue;
            // Ignora comentários da própria página
            const pageId = process.env.META_PAGE_ID || "";
            if (pageId && val.from?.id === pageId) continue;
            console.log(`[FacebookWebhook] Comentário de ${val.from?.name}: "${val.message?.slice(0, 80)}"`);
            await processInstagramComment({
              commentId: val.comment_id,
              postId: val.post_id || "",
              authorName: val.from?.name || "",
              authorId: val.from?.id || "",
              commentText: val.message || "",
            });
          }
        }
        return;
      }

    } catch (err: any) {
      console.error("[InstagramWebhook] Erro:", err.message);
    }
  });

  // POST /api/facebook/webhook — eventos de comentários da Página do Facebook
  app.post("/api/facebook/webhook", async (req, res) => {
    res.status(200).send("EVENT_RECEIVED");
    try {
      const body = req.body;
      if (body.object !== "page") return;
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field !== "feed") continue;
          const val = change.value;
          if (val?.item !== "comment" || val?.verb !== "add") continue;
          if (!val?.comment_id || !val?.message) continue;
          const pageId = process.env.META_PAGE_ID || "";
          if (pageId && val.from?.id === pageId) continue;
          console.log(`[FacebookWebhook] Comentário de ${val.from?.name}: "${val.message?.slice(0, 80)}"`);
          await processInstagramComment({
            commentId: val.comment_id,
            postId: val.post_id || "",
            authorName: val.from?.name || "",
            authorId: val.from?.id || "",
            commentText: val.message || "",
          });
        }
      }
    } catch (err: any) {
      console.error("[FacebookWebhook] Erro:", err.message);
    }
  });
}

// ─── tRPC Router ──────────────────────────────────────────────────────────────

export const instagramCommentsRouter = router({
  /**
   * Lista comentários na fila de revisão (reclamações e dúvidas complexas)
   */
  listPending: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db.select().from(instagramCommentReplies)
      .where(eq(instagramCommentReplies.status, "queued_review"))
      .orderBy(desc(instagramCommentReplies.createdAt))
      .limit(50);
  }),

  /**
   * Lista todos os comentários recentes
   */
  listAll: protectedProcedure
    .input(z.object({ limit: z.number().default(50) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(instagramCommentReplies)
        .orderBy(desc(instagramCommentReplies.createdAt))
        .limit(input.limit);
    }),

  /**
   * Aprovar e enviar uma resposta da fila de revisão
   */
  approveReply: protectedProcedure
    .input(z.object({
      id: z.number(),
      replyText: z.string().min(1).max(500),
    }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");

      const [comment] = await db.select().from(instagramCommentReplies)
        .where(eq(instagramCommentReplies.id, input.id)).limit(1);

      if (!comment) throw new Error("Comentário não encontrado");

      await postCommentReply(comment.commentId, input.replyText);

      await db.update(instagramCommentReplies)
        .set({
          status: "auto_replied",
          replyText: input.replyText,
          repliedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(instagramCommentReplies.id, input.id));

      return { ok: true };
    }),

  /**
   * Rejeitar/ignorar um comentário da fila
   */
  rejectReply: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco indisponível");
      await db.update(instagramCommentReplies)
        .set({ status: "rejected", updatedAt: new Date() })
        .where(eq(instagramCommentReplies.id, input.id));
      return { ok: true };
    }),

  /**
   * Stats resumidas
   */
  stats: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { pending: 0, autoReplied: 0, ignored: 0 };
    const all = await db.select({
      status: instagramCommentReplies.status,
    }).from(instagramCommentReplies);
    return {
      pending: all.filter(r => r.status === "queued_review").length,
      autoReplied: all.filter(r => r.status === "auto_replied").length,
      ignored: all.filter(r => r.status === "ignored").length,
    };
  }),
});
