import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq, and, lte } from "drizzle-orm";
import { getDb } from "../db";
import { influencerPosts, instagramAccounts, publicationQueueJobs } from "../../drizzle/schema";

/**
 * Calcula o delay para retry exponencial (em ms)
 * 1º retry: 5 min | 2º: 15 min | 3º: 45 min | 4º: 2h | 5º: 6h
 */
function getRetryDelay(retryCount: number): number {
  const delays = [5, 15, 45, 120, 360];
  return (delays[Math.min(retryCount, delays.length - 1)] || 360) * 60 * 1000;
}

export const publicationQueueRouter = router({
  /**
   * Adicionar post à fila de publicação (persiste no banco)
   */
  enqueuePost: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        accountId: z.number(),
        maxRetries: z.number().default(5),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const existing = await db
        .select()
        .from(publicationQueueJobs)
        .where(
          and(
            eq(publicationQueueJobs.postId, input.postId),
            eq(publicationQueueJobs.status, "ready")
          )
        )
        .limit(1);

      if (existing.length > 0) {
        return { success: true, jobId: existing[0].id, message: "Post já está na fila" };
      }

      await db.insert(publicationQueueJobs).values({
        postId: input.postId,
        accountId: input.accountId,
        retryCount: 0,
        maxRetries: input.maxRetries,
        nextRetryTime: new Date(),
        status: "ready",
      });

      const inserted = await db
        .select()
        .from(publicationQueueJobs)
        .where(eq(publicationQueueJobs.postId, input.postId))
        .limit(1);

      return {
        success: true,
        jobId: inserted[0]?.id,
        message: "Post adicionado à fila de publicação",
      };
    }),

  /**
   * Obter status da fila (do banco de dados)
   */
  getQueueStatus: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { totalJobs: 0, readyToPublish: 0, waiting: 0, failed: 0, jobs: [] };

    const jobs = await db
      .select()
      .from(publicationQueueJobs)
      .where(
        and(
          eq(publicationQueueJobs.status, "ready"),
          eq(publicationQueueJobs.status, "waiting")
        )
      )
      .limit(100);

    const allActive = await db
      .select()
      .from(publicationQueueJobs);

    const now = new Date();
    const mapped = allActive.map((j) => ({
      jobId: j.id,
      postId: j.postId,
      accountId: j.accountId,
      retryCount: j.retryCount,
      maxRetries: j.maxRetries,
      status: j.status,
      nextRetryTime: j.nextRetryTime,
      lastError: j.lastError,
    }));

    return {
      totalJobs: mapped.length,
      readyToPublish: mapped.filter((j) => j.status === "ready").length,
      waiting: mapped.filter((j) => j.status === "waiting").length,
      failed: mapped.filter((j) => j.status === "failed").length,
      jobs: mapped,
    };
  }),

  /**
   * Processar fila — publicar posts prontos
   */
  processQueue: protectedProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const now = new Date();
    const processedJobs: number[] = [];
    const failedJobs: number[] = [];

    const readyJobs = await db
      .select()
      .from(publicationQueueJobs)
      .where(
        and(
          eq(publicationQueueJobs.status, "ready"),
          lte(publicationQueueJobs.nextRetryTime, now)
        )
      )
      .limit(10);

    for (const job of readyJobs) {
      if (job.retryCount >= job.maxRetries) {
        await db
          .update(publicationQueueJobs)
          .set({ status: "failed" })
          .where(eq(publicationQueueJobs.id, job.id));

        await db
          .update(influencerPosts)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(influencerPosts.id, job.postId));

        failedJobs.push(job.postId);
        continue;
      }

      try {
        const post = await db
          .select()
          .from(influencerPosts)
          .where(eq(influencerPosts.id, job.postId))
          .limit(1);

        if (!post.length) {
          await db
            .update(publicationQueueJobs)
            .set({ status: "done" })
            .where(eq(publicationQueueJobs.id, job.id));
          continue;
        }

        const account = await db
          .select()
          .from(instagramAccounts)
          .where(eq(instagramAccounts.id, job.accountId))
          .limit(1);

        if (!account.length) {
          throw new Error("Conta Instagram não encontrada");
        }

        // Publicar via Meta Graph API usando o access token da conta
        const accessToken = account[0].accessToken;
        const igAccountId = account[0].instagramId;
        const caption = post[0].caption || "";

        let publishSuccess = false;
        let publishError = "";

        try {
          // Criar container de mídia
          const mediaRes = await fetch(
            `https://graph.facebook.com/v18.0/${igAccountId}/media`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                caption,
                access_token: accessToken,
                media_type: "IMAGE",
                image_url: (post[0].mediaUrls as string[] | null)?.[0] || "",
              }),
            }
          );

          if (mediaRes.ok) {
            const mediaData = await mediaRes.json();
            // Publicar container
            const publishRes = await fetch(
              `https://graph.facebook.com/v18.0/${igAccountId}/media_publish`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  creation_id: mediaData.id,
                  access_token: accessToken,
                }),
              }
            );
            publishSuccess = publishRes.ok;
            if (!publishRes.ok) {
              const errData = await publishRes.json();
              publishError = errData.error?.message || "Erro ao publicar";
            }
          } else {
            const errData = await mediaRes.json();
            publishError = errData.error?.message || "Erro ao criar container";
          }
        } catch (apiError) {
          publishError = String(apiError);
        }

        if (publishSuccess) {
          await db
            .update(influencerPosts)
            .set({ status: "published", publishedAt: new Date(), updatedAt: new Date() })
            .where(eq(influencerPosts.id, job.postId));

          await db
            .update(publicationQueueJobs)
            .set({ status: "done" })
            .where(eq(publicationQueueJobs.id, job.id));

          processedJobs.push(job.postId);
        } else {
          const newRetryCount = job.retryCount + 1;
          const nextRetry = new Date(now.getTime() + getRetryDelay(newRetryCount));

          await db
            .update(publicationQueueJobs)
            .set({
              retryCount: newRetryCount,
              lastError: publishError,
              nextRetryTime: nextRetry,
              status: newRetryCount >= job.maxRetries ? "failed" : "waiting",
            })
            .where(eq(publicationQueueJobs.id, job.id));

          await db
            .update(influencerPosts)
            .set({ status: "scheduled", updatedAt: new Date() })
            .where(eq(influencerPosts.id, job.postId));
        }
      } catch (error) {
        const newRetryCount = job.retryCount + 1;
        const nextRetry = new Date(now.getTime() + getRetryDelay(newRetryCount));

        await db
          .update(publicationQueueJobs)
          .set({
            retryCount: newRetryCount,
            lastError: String(error),
            nextRetryTime: nextRetry,
            status: "waiting",
          })
          .where(eq(publicationQueueJobs.id, job.id));
      }
    }

    const remaining = await db
      .select()
      .from(publicationQueueJobs)
      .where(eq(publicationQueueJobs.status, "ready"));

    return {
      success: true,
      processed: processedJobs.length,
      failed: failedJobs.length,
      remaining: remaining.length,
      processedJobs,
      failedJobs,
    };
  }),

  /**
   * Remover post da fila
   */
  removeFromQueue: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(publicationQueueJobs)
        .set({ status: "done" })
        .where(eq(publicationQueueJobs.postId, input.postId));

      return { success: true, message: "Post removido da fila" };
    }),

  /**
   * Retentar post imediatamente
   */
  retryNow: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(publicationQueueJobs)
        .set({ nextRetryTime: new Date(), status: "ready" })
        .where(eq(publicationQueueJobs.postId, input.postId));

      return { success: true, message: "Post agendado para retry imediato" };
    }),

  /**
   * Obter detalhes de um job
   */
  getJobDetails: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) return null;

      const rows = await db
        .select()
        .from(publicationQueueJobs)
        .where(eq(publicationQueueJobs.postId, input.postId))
        .limit(1);

      if (!rows.length) return null;
      const job = rows[0];

      return {
        jobId: job.id,
        postId: job.postId,
        accountId: job.accountId,
        retryCount: job.retryCount,
        maxRetries: job.maxRetries,
        lastError: job.lastError,
        nextRetryTime: job.nextRetryTime,
        status: job.status,
      };
    }),
});
