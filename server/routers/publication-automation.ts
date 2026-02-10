import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { scheduledPosts } from "../../drizzle/schema";
import { eq, and, lte } from "drizzle-orm";

// Mapa de jobs em execução
const activeJobs = new Map<string, NodeJS.Timeout>();

export const publicationAutomationRouter = router({
  // Iniciar automação de publicação
  startAutomation: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      const jobId = `automation-${ctx.user.id}-${Date.now()}`;

      // Se já existe um job, cancelar
      if (activeJobs.has(jobId)) {
        clearInterval(activeJobs.get(jobId));
      }

      // Criar novo job que verifica a cada minuto
      const job = setInterval(async () => {
        await checkAndPublishScheduledPosts();
      }, 60000); // Verificar a cada minuto

      activeJobs.set(jobId, job);

      return {
        success: true,
        message: "Automação iniciada",
        jobId,
      };
    } catch (error) {
      console.error("Erro ao iniciar automação:", error);
      throw new Error(`Falha ao iniciar automação: ${error}`);
    }
  }),

  // Parar automação de publicação
  stopAutomation: protectedProcedure
    .input(z.object({ jobId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      try {
        if (activeJobs.has(input.jobId)) {
          clearInterval(activeJobs.get(input.jobId));
          activeJobs.delete(input.jobId);
        }

        return {
          success: true,
          message: "Automação parada",
        };
      } catch (error) {
        console.error("Erro ao parar automação:", error);
        throw new Error(`Falha ao parar automação: ${error}`);
      }
    }),

  // Verificar posts pendentes
  checkPendingPosts: publicProcedure.query(async () => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const now = new Date();

      const pendingPosts = await db
        .select()
        .from(scheduledPosts)
        .where(
          and(
            eq(scheduledPosts.status, "pending"),
            lte(scheduledPosts.scheduledAt, now)
          )
        );

      return {
        success: true,
        data: {
          count: pendingPosts.length,
          posts: pendingPosts.map((post) => ({
            id: post.id,
            contentId: post.contentId,
            scheduledAt: post.scheduledAt,
            platforms: post.platforms,
          })),
        },
      };
    } catch (error) {
      console.error("Erro ao verificar posts pendentes:", error);
      throw new Error(`Falha ao verificar posts: ${error}`);
    }
  }),

  // Publicar post agora
  publishNow: protectedProcedure
    .input(z.object({ postId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Obter post
        const post = await db
          .select()
          .from(scheduledPosts)
          .where(eq(scheduledPosts.id, input.postId));

        if (!post || post.length === 0) {
          throw new Error("Post not found");
        }

        const scheduledPost = post[0];

        // Atualizar status para processing
        await db
          .update(scheduledPosts)
          .set({ status: "processing", updatedAt: new Date() })
          .where(eq(scheduledPosts.id, input.postId));

        // Publicar em cada plataforma
        const platforms = JSON.parse(
          typeof scheduledPost.platforms === "string"
            ? scheduledPost.platforms
            : JSON.stringify(scheduledPost.platforms)
        );

        const results: Record<string, boolean> = {};

        for (const platform of platforms) {
          try {
            results[platform] = await publishToPlatform(
              platform,
              scheduledPost
            );
          } catch (error) {
            console.error(`Erro ao publicar em ${platform}:`, error);
            results[platform] = false;
          }
        }

        // Atualizar status para published
        const allSuccess = Object.values(results).every((r) => r);
        const newStatus = allSuccess ? "published" : "failed";

        await db
          .update(scheduledPosts)
          .set({ status: newStatus, updatedAt: new Date() })
          .where(eq(scheduledPosts.id, input.postId));

        return {
          success: allSuccess,
          data: {
            postId: input.postId,
            platforms: results,
            status: newStatus,
          },
        };
      } catch (error) {
        console.error("Erro ao publicar:", error);
        throw new Error(`Falha ao publicar: ${error}`);
      }
    }),

  // Obter histórico de publicações
  getPublicationHistory: protectedProcedure
    .input(
      z.object({
        status: z.enum(["published", "failed", "cancelled"]).optional(),
        limit: z.number().default(50),
      })
    )
    .query(async ({ input, ctx }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const conditions = [eq(scheduledPosts.userId, ctx.user.id)];

        if (input.status) {
          conditions.push(eq(scheduledPosts.status, input.status));
        }

        const history = await db
          .select()
          .from(scheduledPosts)
          .where(and(...conditions))
          .orderBy(scheduledPosts.updatedAt)
          .limit(input.limit);

        return {
          success: true,
          data: history.map((post) => ({
            id: post.id,
            contentId: post.contentId,
            status: post.status,
            scheduledAt: post.scheduledAt,
            publishedAt: post.updatedAt,
            platforms: post.platforms,
          })),
        };
      } catch (error) {
        console.error("Erro ao obter histórico:", error);
        throw new Error(`Falha ao obter histórico: ${error}`);
      }
    }),

  // Obter estatísticas de publicação
  getPublicationStats: protectedProcedure.query(async ({ ctx }) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      const conditions = [eq(scheduledPosts.userId, ctx.user.id)];

      const allPosts = await db
        .select()
        .from(scheduledPosts)
        .where(and(...conditions));

      const stats = {
        total: allPosts.length,
        published: allPosts.filter((p) => p.status === "published").length,
        failed: allPosts.filter((p) => p.status === "failed").length,
        pending: allPosts.filter((p) => p.status === "pending").length,
        cancelled: allPosts.filter((p) => p.status === "cancelled").length,
      };

      return {
        success: true,
        data: stats,
      };
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      throw new Error(`Falha ao obter estatísticas: ${error}`);
    }
  }),
});

// Funções auxiliares
async function checkAndPublishScheduledPosts(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) return;

    const now = new Date();

    const pendingPosts = await db
      .select()
      .from(scheduledPosts)
      .where(
        and(
          eq(scheduledPosts.status, "pending"),
          lte(scheduledPosts.scheduledAt, now)
        )
      );

    for (const post of pendingPosts) {
      try {
        // Atualizar status para processing
        await db
          .update(scheduledPosts)
          .set({ status: "processing", updatedAt: new Date() })
          .where(eq(scheduledPosts.id, post.id));

        // Publicar em cada plataforma
        const platforms = JSON.parse(
          typeof post.platforms === "string"
            ? post.platforms
            : JSON.stringify(post.platforms)
        );

        let successCount = 0;

        for (const platform of platforms) {
          try {
            const result = await publishToPlatform(platform, post);
            if (result) successCount++;
          } catch (error) {
            console.error(`Erro ao publicar em ${platform}:`, error);
          }
        }

        // Atualizar status baseado no resultado
        const newStatus =
          successCount === platforms.length ? "published" : "failed";

        await db
          .update(scheduledPosts)
          .set({ status: newStatus, updatedAt: new Date() })
          .where(eq(scheduledPosts.id, post.id));

        console.log(
          `Post ${post.id} publicado com status: ${newStatus}`
        );
      } catch (error) {
        console.error(`Erro ao processar post ${post.id}:`, error);

        // Atualizar status para failed
        await db
          .update(scheduledPosts)
          .set({ status: "failed", updatedAt: new Date() })
          .where(eq(scheduledPosts.id, post.id));
      }
    }
  } catch (error) {
    console.error("Erro ao verificar e publicar posts agendados:", error);
  }
}

async function publishToPlatform(
  platform: string,
  post: (typeof scheduledPosts.$inferSelect)
): Promise<boolean> {
  try {
    switch (platform) {
      case "instagram":
        return await publishToInstagram(post);
      case "tiktok":
        return await publishToTikTok(post);
      case "blog":
        return await publishToBlog(post);
      default:
        console.warn(`Plataforma desconhecida: ${platform}`);
        return false;
    }
  } catch (error) {
    console.error(`Erro ao publicar em ${platform}:`, error);
    return false;
  }
}

async function publishToInstagram(
  post: (typeof scheduledPosts.$inferSelect)
): Promise<boolean> {
  // Implementar integração com Meta API
  console.log(`Publicando no Instagram: ${post.id}`);
  // TODO: Chamar Meta API
  return true;
}

async function publishToTikTok(
  post: (typeof scheduledPosts.$inferSelect)
): Promise<boolean> {
  // Implementar integração com TikTok API
  console.log(`Publicando no TikTok: ${post.id}`);
  // TODO: Chamar TikTok API
  return true;
}

async function publishToBlog(
  post: (typeof scheduledPosts.$inferSelect)
): Promise<boolean> {
  // Implementar publicação no blog
  console.log(`Publicando no Blog: ${post.id}`);
  // TODO: Publicar no blog
  return true;
}
