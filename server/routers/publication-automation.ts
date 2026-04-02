import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { scheduledPosts, postHistory, instagramAccounts, oauthTokens, contentItems, influencerPosts, influencers } from "../../drizzle/schema";
import { eq, and, lte, desc } from "drizzle-orm";

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
  checkPendingPosts: protectedProcedure.query(async ({ ctx }: any) => {
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
            eq(scheduledPosts.userId, ctx.user.id),
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

        // Obter post verificando ownership
        const post = await db
          .select()
          .from(scheduledPosts)
          .where(and(eq(scheduledPosts.id, input.postId), eq(scheduledPosts.userId, ctx.user.id)));

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
  console.log(`Publicando no Instagram: ${post.id}`);
  try {
    const db = await getDb();
    if (!db) return false;

    // 1. Buscar o contentItem via DB
    const contentItemRows = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, post.contentId))
      .limit(1);

    const contentItem = contentItemRows[0] ?? null;

    // 2. Buscar conta Instagram ativa
    const accountRows = await db
      .select()
      .from(instagramAccounts)
      .where(eq(instagramAccounts.isActive, true))
      .limit(1);

    const account = accountRows[0] ?? null;

    if (!account) {
      console.warn(`[Instagram] Nenhuma conta Instagram ativa configurada para post ${post.id}`);
      return false;
    }

    const instagramId = account.instagramId;
    const accessToken = account.accessToken;
    const caption = contentItem?.content ?? contentItem?.title ?? "";

    // 3. Criar container de mídia
    const mediaPayload: Record<string, string> = {
      caption,
      access_token: accessToken,
    };

    // Se disponível, incluir image_url
    if (contentItem?.content) {
      // Tentar extrair URL de imagem do conteúdo se houver
    }

    const createMediaRes = await fetch(
      `https://graph.facebook.com/v18.0/${instagramId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(mediaPayload),
      }
    );

    if (!createMediaRes.ok) {
      const errText = await createMediaRes.text();
      console.error(`[Instagram] Erro ao criar container de mídia: ${errText}`);
      await db.insert(postHistory).values({
        scheduledPostId: post.id,
        contentId: post.contentId,
        userId: post.userId,
        platform: "instagram",
        status: "failed",
        errorMessage: errText,
        postedAt: new Date(),
      });
      return false;
    }

    const createMediaData = await createMediaRes.json() as { id?: string };
    const containerId = createMediaData.id;

    if (!containerId) {
      console.error(`[Instagram] Container ID não retornado para post ${post.id}`);
      return false;
    }

    // 4. Publicar o container
    const publishRes = await fetch(
      `https://graph.facebook.com/v18.0/${instagramId}/media_publish`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerId,
          access_token: accessToken,
        }),
      }
    );

    if (!publishRes.ok) {
      const errText = await publishRes.text();
      console.error(`[Instagram] Erro ao publicar mídia: ${errText}`);
      await db.insert(postHistory).values({
        scheduledPostId: post.id,
        contentId: post.contentId,
        userId: post.userId,
        platform: "instagram",
        status: "failed",
        errorMessage: errText,
        postedAt: new Date(),
      });
      return false;
    }

    const publishData = await publishRes.json() as { id?: string };

    // 5. Registrar resultado em postHistory
    await db.insert(postHistory).values({
      scheduledPostId: post.id,
      contentId: post.contentId,
      userId: post.userId,
      platform: "instagram",
      postId: publishData.id ?? null,
      status: "success",
      postedAt: new Date(),
    });

    console.log(`[Instagram] Post ${post.id} publicado com sucesso: ${publishData.id}`);
    return true;
  } catch (error) {
    console.error(`[Instagram] Erro ao publicar post ${post.id}:`, error);
    return false;
  }
}

async function publishToTikTok(
  post: (typeof scheduledPosts.$inferSelect)
): Promise<boolean> {
  console.log(`Publicando no TikTok: ${post.id}`);
  try {
    const db = await getDb();
    if (!db) return false;

    // 1. Buscar o contentItem via DB
    const contentItemRows = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, post.contentId))
      .limit(1);

    const contentItem = contentItemRows[0] ?? null;

    // 2. Buscar oauthToken da plataforma 'tiktok' com isActive=true
    const tokenRows = await db
      .select()
      .from(oauthTokens)
      .where(
        and(
          eq(oauthTokens.plataforma, "tiktok"),
          eq(oauthTokens.isActive, true)
        )
      )
      .orderBy(desc(oauthTokens.updatedAt))
      .limit(1);

    const token = tokenRows[0] ?? null;

    if (!token) {
      console.warn(`[TikTok] Nenhum token TikTok ativo configurado para post ${post.id}`);
      return false;
    }

    const caption = contentItem?.content ?? contentItem?.title ?? "";

    // 3. Publicar vídeo no TikTok
    const tiktokRes = await fetch(
      "https://open.tiktokapis.com/v2/post/publish/video/init/",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token.accessToken}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({
          post_info: {
            title: caption.slice(0, 150),
            privacy_level: "PUBLIC_TO_EVERYONE",
          },
          source_info: {
            source: "PULL_FROM_URL",
            video_url: "", // URL do vídeo deve ser preenchida quando disponível
          },
        }),
      }
    );

    if (!tiktokRes.ok) {
      const errText = await tiktokRes.text();
      console.error(`[TikTok] Erro ao publicar: ${errText}`);
      return false;
    }

    const tiktokData = await tiktokRes.json() as { data?: { publish_id?: string }; error?: { code?: string } };

    if (tiktokData.error?.code && tiktokData.error.code !== "ok") {
      console.error(`[TikTok] API retornou erro: ${JSON.stringify(tiktokData.error)}`);
      return false;
    }

    console.log(`[TikTok] Post ${post.id} publicado com sucesso: ${tiktokData.data?.publish_id}`);
    return true;
  } catch (error) {
    console.error(`[TikTok] Erro ao publicar post ${post.id}:`, error);
    return false;
  }
}

async function publishToBlog(
  post: (typeof scheduledPosts.$inferSelect)
): Promise<boolean> {
  console.log(`Publicando no Blog: ${post.id}`);
  try {
    const db = await getDb();
    if (!db) return false;

    // 1. Buscar o contentItem via DB
    const contentItemRows = await db
      .select()
      .from(contentItems)
      .where(eq(contentItems.id, post.contentId))
      .limit(1);

    const contentItem = contentItemRows[0] ?? null;
    const blogContent = contentItem?.content ?? contentItem?.title ?? "";

    // 2. Buscar influencer do owner do post (userId → primeiro influencer ativo)
    const [blogInfluencer] = await db
      .select()
      .from(influencers)
      .where(and(eq(influencers.userId, post.userId), eq(influencers.isActive, true)))
      .limit(1);
    if (!blogInfluencer) { console.error(`[Blog] Nenhum influencer ativo para userId=${post.userId}`); return false; }

    await db.insert(influencerPosts).values({
      influencerId: blogInfluencer.id,
      platform: "blog",
      caption: blogContent,
      content: blogContent,
      status: "published",
      publishedAt: new Date(),
    });

    console.log(`[Blog] Post ${post.id} publicado com sucesso`);
    return true;
  } catch (error) {
    console.error(`[Blog] Erro ao publicar post ${post.id}:`, error);
    return false;
  }
}
