import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import { influencerPosts, instagramAccounts } from "../../drizzle/schema";

/**
 * Sistema de fila de publicação com retry automático
 * Implementa retry exponencial para posts que falham
 */

interface PublicationJob {
  postId: number;
  accountId: number;
  retryCount: number;
  maxRetries: number;
  lastError?: string;
  nextRetryTime?: Date;
}

// Fila em memória (em produção, usar Redis ou banco de dados)
const publicationQueue: Map<number, PublicationJob> = new Map();

/**
 * Calcular tempo de espera para retry exponencial
 * 1º retry: 5 minutos
 * 2º retry: 15 minutos
 * 3º retry: 45 minutos
 * 4º retry: 2 horas
 * 5º retry: 6 horas
 */
function getRetryDelay(retryCount: number): number {
  const delays = [5, 15, 45, 120, 360]; // em minutos
  return (delays[Math.min(retryCount, delays.length - 1)] || 360) * 60 * 1000;
}

export const publicationQueueRouter = router({
  /**
   * Adicionar post à fila de publicação
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
      try {
        const job: PublicationJob = {
          postId: input.postId,
          accountId: input.accountId,
          retryCount: 0,
          maxRetries: input.maxRetries,
          nextRetryTime: new Date(),
        };

        publicationQueue.set(input.postId, job);

        console.log(
          `[Publication Queue] Post ${input.postId} adicionado à fila para conta ${input.accountId}`
        );

        return {
          success: true,
          jobId: input.postId,
          message: "Post adicionado à fila de publicação",
        };
      } catch (error) {
        console.error("[Publication Queue] Erro ao enfileirar post:", error);
        throw error;
      }
    }),

  /**
   * Obter status da fila
   */
  getQueueStatus: protectedProcedure.query(async () => {
    try {
      const jobs = Array.from(publicationQueue.values()).map((job) => ({
        postId: job.postId,
        accountId: job.accountId,
        retryCount: job.retryCount,
        maxRetries: job.maxRetries,
        status:
          job.retryCount >= job.maxRetries
            ? "failed"
            : new Date() >= (job.nextRetryTime || new Date())
            ? "ready"
            : "waiting",
        nextRetryTime: job.nextRetryTime,
        lastError: job.lastError,
      }));

      return {
        totalJobs: jobs.length,
        readyToPublish: jobs.filter((j) => j.status === "ready").length,
        waiting: jobs.filter((j) => j.status === "waiting").length,
        failed: jobs.filter((j) => j.status === "failed").length,
        jobs,
      };
    } catch (error) {
      console.error("[Publication Queue] Erro ao obter status:", error);
      throw error;
    }
  }),

  /**
   * Processar fila (executar publicações prontas)
   * Deve ser chamado periodicamente (ex: a cada 1 minuto)
   */
  processQueue: protectedProcedure.mutation(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const now = new Date();
      const processedJobs: number[] = [];
      const failedJobs: number[] = [];

      const entries = Array.from(publicationQueue.entries());
      for (let i = 0; i < entries.length; i++) {
        const [postId, job] = entries[i];
        // Verificar se atingiu número máximo de retries
        if (job.retryCount >= job.maxRetries) {
          console.warn(
            `[Publication Queue] Post ${postId} falhou após ${job.maxRetries} tentativas`
          );
          failedJobs.push(postId);

          // Atualizar status no banco
          await db
            .update(influencerPosts)
            .set({
              status: "failed",
              updatedAt: new Date(),
            })
            .where(eq(influencerPosts.id, postId));

          publicationQueue.delete(postId);
          continue;
        }

        // Verificar se é hora de tentar novamente
        if (!job.nextRetryTime || now >= job.nextRetryTime) {
          try {
            // Obter dados do post
            const post = await db
              .select()
              .from(influencerPosts)
              .where(eq(influencerPosts.id, postId))
              .limit(1);

            if (!post || post.length === 0) {
              publicationQueue.delete(postId);
              continue;
            }

            // Obter conta Instagram
            const account = await db
              .select()
              .from(instagramAccounts)
              .where(eq(instagramAccounts.id, job.accountId))
              .limit(1);

            if (!account || account.length === 0) {
              throw new Error("Conta Instagram não encontrada");
            }

            // Simular tentativa de publicação
            // Em produção, aqui seria chamada a Meta Graph API
            const publishSuccess = Math.random() > 0.3; // 70% de sucesso simulado

            if (publishSuccess) {
              // Sucesso!
              console.log(
                `[Publication Queue] Post ${postId} publicado com sucesso na tentativa ${job.retryCount + 1}`
              );

              await db
                .update(influencerPosts)
                .set({
                  status: "published",
                  publishedAt: new Date(),
                  updatedAt: new Date(),
                })
                .where(eq(influencerPosts.id, postId));

              publicationQueue.delete(postId);
              processedJobs.push(postId);
            } else {
              // Falha - agendar próxima tentativa
              job.retryCount++;
              job.lastError = "Erro ao publicar no Instagram";
              job.nextRetryTime = new Date(now.getTime() + getRetryDelay(job.retryCount));

              console.warn(
                `[Publication Queue] Post ${postId} falhou. Próxima tentativa em ${job.nextRetryTime.toISOString()}`
              );

              // Atualizar status como "scheduled"
              await db
                .update(influencerPosts)
                .set({
                  status: "scheduled",
                  updatedAt: new Date(),
                })
                .where(eq(influencerPosts.id, postId));
            }
          } catch (error) {
            console.error(
              `[Publication Queue] Erro ao processar post ${postId}:`,
              error
            );

            job.retryCount++;
            job.lastError = String(error);
            job.nextRetryTime = new Date(now.getTime() + getRetryDelay(job.retryCount));
          }
        }
      }

      return {
        success: true,
        processed: processedJobs.length,
        failed: failedJobs.length,
        remaining: publicationQueue.size,
        processedJobs,
        failedJobs,
      };
    } catch (error) {
      console.error("[Publication Queue] Erro ao processar fila:", error);
      throw error;
    }
  }),

  /**
   * Remover post da fila
   */
  removeFromQueue: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        publicationQueue.delete(input.postId);

        console.log(
          `[Publication Queue] Post ${input.postId} removido da fila`
        );

        return {
          success: true,
          message: "Post removido da fila",
        };
      } catch (error) {
        console.error("[Publication Queue] Erro ao remover post:", error);
        throw error;
      }
    }),

  /**
   * Retentar post imediatamente
   */
  retryNow: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input }) => {
      try {
        const job = publicationQueue.get(input.postId);

        if (!job) {
          throw new Error("Post não encontrado na fila");
        }

        // Resetar tempo de espera para tentar imediatamente
        job.nextRetryTime = new Date();

        console.log(
          `[Publication Queue] Post ${input.postId} agendado para retry imediato`
        );

        return {
          success: true,
          message: "Post agendado para retry imediato",
        };
      } catch (error) {
        console.error("[Publication Queue] Erro ao retentar post:", error);
        throw error;
      }
    }),

  /**
   * Obter detalhes de um job
   */
  getJobDetails: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .query(async ({ input }) => {
      try {
        const job = publicationQueue.get(input.postId);

        if (!job) {
          return null;
        }

        return {
          postId: job.postId,
          accountId: job.accountId,
          retryCount: job.retryCount,
          maxRetries: job.maxRetries,
          lastError: job.lastError,
          nextRetryTime: job.nextRetryTime,
          status:
            job.retryCount >= job.maxRetries
              ? "failed"
              : new Date() >= (job.nextRetryTime || new Date())
              ? "ready"
              : "waiting",
        };
      } catch (error) {
        console.error("[Publication Queue] Erro ao obter detalhes do job:", error);
        throw error;
      }
    }),
});
