import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import { igPostPublications, instagramAccounts, influencerPosts } from "../../drizzle/schema";

export const instagramPublisherRouter = router({
  /**
   * Publicar post no Instagram (Feminnita ou Influencer)
   * Integra com Meta Graph API
   */
  publishPost: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        accountId: z.number(), // ID da conta Instagram
        caption: z.string(),
        mediaUrls: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Obter conta Instagram
        const account = await db
          .select()
          .from(instagramAccounts)
          .where(eq(instagramAccounts.id, input.accountId))
          .limit(1);

        if (!account || account.length === 0) {
          throw new Error("Conta Instagram não encontrada");
        }

        const igAccount = account[0];

        // Montar caption completa
        const caption = input.caption;
        const mediaUrl = input.mediaUrls && input.mediaUrls.length > 0 ? input.mediaUrls[0] : undefined;

        // Criar container de mídia na Meta Graph API
        const containerBody: Record<string, string> = {
          caption,
          access_token: igAccount.accessToken,
        };
        if (mediaUrl) {
          containerBody.image_url = mediaUrl;
        } else {
          containerBody.media_type = "IMAGE";
        }

        const containerRes = await fetch(
          `https://graph.facebook.com/v18.0/${igAccount.instagramId}/media`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(containerBody),
          }
        );
        if (!containerRes.ok) throw new Error(`Media container error: ${await containerRes.text()}`);
        const { id: containerId } = await containerRes.json() as { id: string };

        // Publicar container
        const publishRes = await fetch(
          `https://graph.facebook.com/v18.0/${igAccount.instagramId}/media_publish`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ creation_id: containerId, access_token: igAccount.accessToken }),
          }
        );
        if (!publishRes.ok) throw new Error(`Media publish error: ${await publishRes.text()}`);
        const { id: instagramPostId } = await publishRes.json() as { id: string };

        // Registrar publicação no banco de dados
        await db.insert(igPostPublications).values({
          postId: input.postId,
          instagramAccountId: input.accountId,
          instagramPostId: instagramPostId,
          caption: input.caption,
          mediaUrls: JSON.stringify(input.mediaUrls || []),
          status: "published",
          publishedAt: new Date(),
          likes: 0,
          comments: 0,
          shares: 0,
          saves: 0,
          impressions: 0,
          reach: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Atualizar status do post para "published"
        await db
          .update(influencerPosts)
          .set({
            status: "published",
            publishedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(influencerPosts.id, input.postId));

        return {
          success: true,
          instagramPostId,
          message: `Post publicado com sucesso em @${igAccount.username}!`,
        };
      } catch (error) {
        console.error('[Instagram Publisher] Erro ao publicar:', error);
        
        // Registrar erro no banco de dados
        const db = await getDb();
        if (db) {
          await db.insert(igPostPublications).values({
            postId: input.postId,
            instagramAccountId: input.accountId,
            caption: input.caption,
            mediaUrls: JSON.stringify(input.mediaUrls || []),
            status: "failed",
            errorMessage: (error as Error).message,
            errorCode: "PUBLISH_ERROR",
            createdAt: new Date(),
            updatedAt: new Date(),
          });

          // Atualizar status do post para "failed"
          await db
            .update(influencerPosts)
            .set({
              status: "failed",
              updatedAt: new Date(),
            })
            .where(eq(influencerPosts.id, input.postId));
        }

        throw error;
      }
    }),

  /**
   * Publicar em múltiplas contas (Feminnita + Influencer)
   */
  publishToMultipleAccounts: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        accountIds: z.array(z.number()), // IDs das contas Instagram
        caption: z.string(),
        mediaUrls: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const results = [];

        for (const accountId of input.accountIds) {
          try {
            const result = await publishPost({
              postId: input.postId,
              accountId,
              caption: input.caption,
              mediaUrls: input.mediaUrls,
            });
            results.push({ accountId, success: true, result });
          } catch (error) {
            results.push({ accountId, success: false, error: (error as Error).message });
          }
        }

        const successCount = results.filter((r) => r.success).length;
        const failureCount = results.filter((r) => !r.success).length;

        return {
          success: failureCount === 0,
          totalAccounts: input.accountIds.length,
          successCount,
          failureCount,
          results,
        };
      } catch (error) {
        console.error('[Instagram Publisher] Erro ao publicar em múltiplas contas:', error);
        throw error;
      }
    }),

  /**
   * Agendar publicação para mais tarde
   */
  schedulePost: protectedProcedure
    .input(
      z.object({
        postId: z.number(),
        accountId: z.number(),
        caption: z.string(),
        mediaUrls: z.array(z.string()).optional(),
        scheduledFor: z.date(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Registrar publicação agendada
        await db.insert(igPostPublications).values({
          postId: input.postId,
          instagramAccountId: input.accountId,
          caption: input.caption,
          mediaUrls: JSON.stringify(input.mediaUrls || []),
          status: "scheduled",
          scheduledFor: input.scheduledFor,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Atualizar status do post para "scheduled"
        await db
          .update(influencerPosts)
          .set({
            status: "scheduled",
            scheduledAt: input.scheduledFor,
            updatedAt: new Date(),
          })
          .where(eq(influencerPosts.id, input.postId));

        return {
          success: true,
          message: `Post agendado para ${input.scheduledFor.toLocaleString("pt-BR")}`,
        };
      } catch (error) {
        console.error('[Instagram Publisher] Erro ao agendar post:', error);
        throw error;
      }
    }),

  /**
   * Obter métricas de um post publicado
   */
  getPostMetrics: protectedProcedure
    .input(
      z.object({
        publicationId: z.number(),
      })
    )
    .query(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) return null;

        const publication = await db
          .select()
          .from(igPostPublications)
          .where(eq(igPostPublications.id, input.publicationId))
          .limit(1);

        return publication[0] || null;
      } catch (error) {
        console.error('[Instagram Publisher] Erro ao obter métricas:', error);
        return null;
      }
    }),

  /**
   * Sincronizar métricas de posts publicados (chamado periodicamente)
   */
  syncPostMetrics: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Buscar a conta Instagram para obter o accessToken
        const account = await db
          .select()
          .from(instagramAccounts)
          .where(eq(instagramAccounts.id, input.accountId))
          .limit(1);

        if (!account || account.length === 0) {
          throw new Error("Conta Instagram não encontrada");
        }

        const igAccount = account[0];

        // Buscar últimas 50 publicações da conta com instagramPostId definido
        const publications = await db
          .select()
          .from(igPostPublications)
          .where(eq(igPostPublications.instagramAccountId, input.accountId))
          .limit(50);

        let syncedCount = 0;

        for (const pub of publications) {
          if (!pub.instagramPostId) continue;

          try {
            const insightsRes = await fetch(
              `https://graph.facebook.com/v18.0/${pub.instagramPostId}/insights?metric=engagement,impressions,reach,saved&access_token=${igAccount.accessToken}`
            );
            if (!insightsRes.ok) continue;
            const insights = await insightsRes.json() as { data?: Array<{ name: string; values?: Array<{ value: number }> }> };

            const metricsMap: Record<string, number> = {};
            if (insights.data) {
              insights.data.forEach((metric) => {
                metricsMap[metric.name] = metric.values?.[0]?.value || 0;
              });
            }

            await db
              .update(igPostPublications)
              .set({
                likes: metricsMap.engagement || 0,
                impressions: metricsMap.impressions || 0,
                reach: metricsMap.reach || 0,
                saves: metricsMap.saved || 0,
                updatedAt: new Date(),
              })
              .where(eq(igPostPublications.id, pub.id));

            syncedCount++;
          } catch (syncError) {
            console.error(`[Instagram Publisher] Erro ao sincronizar post ${pub.id}:`, syncError);
          }
        }

        return {
          success: true,
          syncedCount,
          message: `${syncedCount} posts sincronizados com sucesso`,
        };
      } catch (error) {
        console.error('[Instagram Publisher] Erro ao sincronizar métricas:', error);
        throw error;
      }
    }),
});

async function publishPost(input: {
  postId: number;
  accountId: number;
  caption: string;
  mediaUrls?: string[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const account = await db
    .select()
    .from(instagramAccounts)
    .where(eq(instagramAccounts.id, input.accountId))
    .limit(1);

  if (!account || account.length === 0) {
    throw new Error("Conta Instagram não encontrada");
  }

  const igAccount = account[0];
  const mediaUrl = input.mediaUrls?.[0];

  const containerBody: Record<string, string> = {
    caption: input.caption,
    access_token: igAccount.accessToken,
  };
  if (mediaUrl) {
    containerBody.image_url = mediaUrl;
  } else {
    containerBody.media_type = "IMAGE";
  }

  const containerRes = await fetch(
    `https://graph.facebook.com/v18.0/${igAccount.instagramId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(containerBody),
    }
  );
  if (!containerRes.ok) throw new Error(`Media container error: ${await containerRes.text()}`);
  const { id: creationId } = await containerRes.json() as { id: string };

  const publishRes = await fetch(
    `https://graph.facebook.com/v18.0/${igAccount.instagramId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ creation_id: creationId, access_token: igAccount.accessToken }),
    }
  );
  if (!publishRes.ok) throw new Error(`Media publish error: ${await publishRes.text()}`);
  const { id: instagramPostId } = await publishRes.json() as { id: string };

  return { success: true, instagramPostId };
}
