import { router, protectedProcedure } from "../_core/trpc";
import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { getDb } from "../db";
import { instagramAccounts, igPostPublications, influencers } from "../../drizzle/schema";
import { assertRateLimit } from "../_core/rateLimiter";

const META_GRAPH_API_BASE = "https://graph.facebook.com/v19.0";

/**
 * Helper para fazer requisições à Meta Graph API (Instagram Business)
 */
async function makeMetaGraphRequest(
  endpoint: string,
  method: "GET" | "POST" = "GET",
  accessToken: string,
  body?: Record<string, any>,
  extraParams?: Record<string, string>
) {
  const params = new URLSearchParams({ access_token: accessToken });
  if (extraParams) Object.entries(extraParams).forEach(([k, v]) => params.set(k, v));
  const url = `${META_GRAPH_API_BASE}${endpoint}?${params.toString()}`;

  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body && method === "POST") {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, options);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Meta API Error: ${data.error?.message || "Unknown error"}`);
    }

    return data;
  } catch (error) {
    console.error(`[Meta Graph API] Error: ${error}`);
    throw error;
  }
}

export const metaGraphIntegrationRouter = router({
  /**
   * Publicar imagem/carrossel no Instagram
   */
  publishImage: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
        imageUrl: z.string(),
        caption: z.string(),
        hashtags: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      assertRateLimit(`meta-graph:${ctx.user.id}`, 20); // 20 publicações/min
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

        // Verify ownership
        if (igAccount.accountType === "influencer" && igAccount.influencerId) {
          const [owned] = await db.select({ id: influencers.id }).from(influencers)
            .where(and(eq(influencers.id, igAccount.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
          if (!owned) throw new Error("Acesso negado");
        }

        // Preparar caption com hashtags
        let fullCaption = input.caption;
        if (input.hashtags && input.hashtags.length > 0) {
          fullCaption += "\n\n" + input.hashtags.map((tag) => `#${tag}`).join(" ");
        }

        // Criar container de mídia
        const containerResponse = await makeMetaGraphRequest(
          `/${igAccount.instagramId}/media`,
          "POST",
          igAccount.accessToken,
          {
            image_url: input.imageUrl,
            caption: fullCaption,
          }
        );

        if (!containerResponse.id) {
          throw new Error("Falha ao criar container de mídia");
        }

        // Publicar container
        const publishResponse = await makeMetaGraphRequest(
          `/${igAccount.instagramId}/media_publish`,
          "POST",
          igAccount.accessToken,
          {
            creation_id: containerResponse.id,
          }
        );

        const instagramPostId = publishResponse.id;

        // Registrar publicação no banco
        await db.insert(igPostPublications).values({
          postId: 0, // Será atualizado depois
          instagramAccountId: input.accountId,
          instagramPostId: instagramPostId,
          caption: fullCaption,
          mediaUrls: JSON.stringify([input.imageUrl]),
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

        return {
          success: true,
          instagramPostId,
          message: `Imagem publicada com sucesso em @${igAccount.username}!`,
        };
      } catch (error) {
        console.error("[Meta Graph Integration] Erro ao publicar imagem:", error);
        throw error;
      }
    }),

  /**
   * Obter insights de um post (métricas)
   */
  getPostInsights: protectedProcedure
    .input(
      z.object({
        instagramPostId: z.string(),
        accessToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const metrics = await makeMetaGraphRequest(
          `/${input.instagramPostId}/insights?metric=engagement,impressions,reach,saved`,
          "GET",
          input.accessToken
        );

        return metrics.data || [];
      } catch (error) {
        console.error("[Meta Graph Integration] Erro ao obter insights:", error);
        throw error;
      }
    }),

  /**
   * Obter métricas da conta (followers, posts, etc)
   */
  getAccountInsights: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
      })
    )
    .query(async ({ input, ctx }) => {
      assertRateLimit(`meta-graph:${ctx.user.id}`, 30); // 30 queries/min
      try {
        const db = await getDb();
        if (!db) return null;

        const account = await db
          .select()
          .from(instagramAccounts)
          .where(eq(instagramAccounts.id, input.accountId))
          .limit(1);

        if (!account || account.length === 0) {
          throw new Error("Conta Instagram não encontrada");
        }

        const igAccount = account[0];

        // Verify ownership
        if (igAccount.accountType === "influencer" && igAccount.influencerId) {
          const [owned] = await db.select({ id: influencers.id }).from(influencers)
            .where(and(eq(influencers.id, igAccount.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
          if (!owned) throw new Error("Acesso negado");
        }

        // 1. Buscar dados básicos do perfil (followers, posts)
        // Tenta acesso direto pelo ID; se falhar com permissão, tenta via Página do Facebook
        let profile: any = null;
        let igIdToUse = igAccount.instagramId;

        try {
          profile = await makeMetaGraphRequest(
            `/${igAccount.instagramId}`,
            "GET",
            igAccount.accessToken,
            undefined,
            { fields: "followers_count,media_count,name,username,profile_picture_url" }
          );
          if (profile.error) profile = null;
        } catch (_) { profile = null; }

        // Fallback A: Page Token — /me aponta para a própria Página, buscar IG vinculado
        if (!profile) {
          try {
            const meRes = await makeMetaGraphRequest(
              "/me",
              "GET",
              igAccount.accessToken,
              undefined,
              { fields: "id,name,instagram_business_account{id,username,followers_count,media_count,profile_picture_url},connected_instagram_account{id,username,followers_count,media_count,profile_picture_url}" }
            );
            console.log("[Instagram] /me (Page Token):", JSON.stringify(meRes).slice(0, 400));
            const igViaMe = meRes.instagram_business_account || meRes.connected_instagram_account;
            if (igViaMe?.id) {
              igIdToUse = igViaMe.id;
              profile = igViaMe;
              if (igViaMe.id !== igAccount.instagramId) {
                await db.update(instagramAccounts).set({ instagramId: igViaMe.id, updatedAt: new Date() }).where(eq(instagramAccounts.id, igAccount.id));
              }
            }
          } catch (eA: any) {
            console.error("[Instagram] Fallback A falhou:", eA.message);
          }
        }

        // Fallback B: User Token — /me/accounts para buscar Page Token e acessar IG
        if (!profile) {
          try {
            const accountsRes = await makeMetaGraphRequest(
              "/me/accounts",
              "GET",
              igAccount.accessToken,
              undefined,
              { fields: "id,name,access_token,instagram_business_account{id,username,followers_count,media_count,profile_picture_url},connected_instagram_account{id,username,followers_count,media_count,profile_picture_url}" }
            );
            console.log("[Instagram] /me/accounts (User Token):", JSON.stringify(accountsRes).slice(0, 400));
            for (const page of (accountsRes.data || [])) {
              const igViaPage = page.instagram_business_account || page.connected_instagram_account;
              if (igViaPage?.id) {
                igIdToUse = igViaPage.id;
                profile = igViaPage;
                const pageToken = page.access_token || igAccount.accessToken;
                if (igViaPage.id !== igAccount.instagramId) {
                  await db.update(instagramAccounts).set({ instagramId: igViaPage.id, accessToken: pageToken, updatedAt: new Date() }).where(eq(instagramAccounts.id, igAccount.id));
                }
                break;
              }
            }
          } catch (eB: any) {
            console.error("[Instagram] Fallback B falhou:", eB.message);
          }
        }

        if (!profile) throw new Error("Não foi possível acessar a conta Instagram. Verifique o token em Reconectar Instagram.");

        // 2. Buscar insights de alcance/impressões (últimos 7 dias)
        let impressions = 0, reach = 0, profileViews = 0;
        try {
          const insights = await makeMetaGraphRequest(
            `/${igAccount.instagramId}/insights`,
            "GET",
            igAccount.accessToken,
            undefined,
            { metric: "impressions,reach,profile_views", period: "day", since: String(Math.floor(Date.now()/1000) - 7*86400), until: String(Math.floor(Date.now()/1000)) }
          );
          if (insights.data) {
            insights.data.forEach((metric: any) => {
              const total = (metric.values || []).reduce((s: number, v: any) => s + (v.value || 0), 0);
              if (metric.name === "impressions") impressions = total;
              if (metric.name === "reach") reach = total;
              if (metric.name === "profile_views") profileViews = total;
            });
          }
        } catch (_) {
          // insights pode falhar se permissão instagram_manage_insights não estiver aprovada
        }

        const followers = profile.followers_count || 0;

        // Atualizar banco de dados
        await db
          .update(instagramAccounts)
          .set({
            followers,
            postsCount: profile.media_count || igAccount.postsCount,
            username: profile.username || igAccount.username,
            profilePictureUrl: profile.profile_picture_url || igAccount.profilePictureUrl,
            lastMetricsSync: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(instagramAccounts.id, input.accountId));

        return {
          followers,
          impressions,
          reach,
          profileViews,
        };
      } catch (error) {
        console.error("[Meta Graph Integration] Erro ao obter insights da conta:", error);
        throw error;
      }
    }),

  /**
   * Sincronizar métricas de todos os posts publicados
   */
  syncAllPostMetrics: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      assertRateLimit(`meta-graph:${ctx.user.id}`, 20); // 20 publicações/min
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        // Obter conta
        const account = await db
          .select()
          .from(instagramAccounts)
          .where(eq(instagramAccounts.id, input.accountId))
          .limit(1);

        if (!account || account.length === 0) {
          throw new Error("Conta Instagram não encontrada");
        }

        const igAccount = account[0];

        // Verify ownership
        if (igAccount.accountType === "influencer" && igAccount.influencerId) {
          const [owned] = await db.select({ id: influencers.id }).from(influencers)
            .where(and(eq(influencers.id, igAccount.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
          if (!owned) throw new Error("Acesso negado");
        }

        // Obter publicações da conta
        const publications = await db
          .select()
          .from(igPostPublications)
          .where(eq(igPostPublications.instagramAccountId, input.accountId));

        let syncedCount = 0;

        // Sincronizar cada publicação
        for (const pub of publications) {
          if (!pub.instagramPostId) continue;

          try {
            const insights = await makeMetaGraphRequest(
              `/${pub.instagramPostId}/insights?metric=engagement,impressions,reach,saved`,
              "GET",
              igAccount.accessToken
            );

            const metricsMap: Record<string, number> = {};
            if (insights.data) {
              insights.data.forEach((metric: any) => {
                metricsMap[metric.name] = metric.values?.[0]?.value || 0;
              });
            }

            // Atualizar publicação
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
          } catch (error) {
            console.error(`[Meta Graph Integration] Erro ao sincronizar post ${pub.id}:`, error);
          }
        }

        return {
          success: true,
          totalPosts: publications.length,
          syncedCount,
          message: `${syncedCount} posts sincronizados com sucesso`,
        };
      } catch (error) {
        console.error("[Meta Graph Integration] Erro ao sincronizar métricas:", error);
        throw error;
      }
    }),

  /**
   * Validar token de acesso
   */
  validateAccessToken: protectedProcedure
    .input(
      z.object({
        accessToken: z.string(),
      })
    )
    .query(async ({ input }) => {
      try {
        const response = await makeMetaGraphRequest(
          "/me",
          "GET",
          input.accessToken
        );

        return {
          valid: true,
          userId: response.id,
          username: response.username,
        };
      } catch (error) {
        return {
          valid: false,
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Buscar campanhas ativas do Meta Ads
   */
  getCampaigns: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
      })
    )
    .query(async ({ input }) => {
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

        // Buscar campanhas do Meta Ads
        // Usar o AD_ACCOUNT_ID do ambiente
        const adAccountId = process.env.META_AD_ACCOUNT_ID;
        if (!adAccountId) {
          throw new Error("META_AD_ACCOUNT_ID não configurado");
        }

        const campaignsResponse = await makeMetaGraphRequest(
          `/${adAccountId}/campaigns?fields=id,name,status,objective,created_time,updated_time,spend,impressions,clicks,actions`,
          "GET",
          igAccount.accessToken
        );

        if (!campaignsResponse.data) {
          return {
            success: true,
            campaigns: [],
            message: "Nenhuma campanha encontrada",
          };
        }

        // Filtrar apenas campanhas ativas
        const activeCampaigns = campaignsResponse.data
          .filter((campaign: any) => campaign.status === "ACTIVE")
          .map((campaign: any) => ({
            id: campaign.id,
            name: campaign.name,
            status: campaign.status,
            objective: campaign.objective,
            createdTime: campaign.created_time,
            updatedTime: campaign.updated_time,
            spend: campaign.spend || 0,
            impressions: campaign.impressions || 0,
            clicks: campaign.clicks || 0,
            actions: campaign.actions || [],
          }));

        return {
          success: true,
          campaigns: activeCampaigns,
          totalCampaigns: activeCampaigns.length,
          message: `${activeCampaigns.length} campanhas ativas encontradas`,
        };
      } catch (error) {
        console.error("[Meta Graph Integration] Erro ao buscar campanhas:", error);
        return {
          success: false,
          campaigns: [],
          error: (error as Error).message,
        };
      }
    }),

  /**
   * Renovar token de acesso (se tiver refresh token)
   */
  refreshAccessToken: protectedProcedure
    .input(
      z.object({
        accountId: z.number(),
        refreshToken: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const db = await getDb();
        if (!db) throw new Error("Database not available");

        const appId = process.env.META_APP_ID;
        const appSecret = process.env.META_APP_SECRET;

        if (!appId || !appSecret) {
          throw new Error(
            "META_APP_ID e META_APP_SECRET precisam estar configurados nas variáveis de ambiente"
          );
        }

        // Buscar a conta Instagram no banco
        const account = await db
          .select()
          .from(instagramAccounts)
          .where(eq(instagramAccounts.id, input.accountId))
          .limit(1);

        if (!account || account.length === 0) {
          throw new Error("Conta Instagram não encontrada");
        }

        const igAccount = account[0];

        // Trocar por long-lived token via Meta Graph API
        const tokenUrl =
          `https://graph.facebook.com/v18.0/oauth/access_token` +
          `?grant_type=fb_exchange_token` +
          `&client_id=${appId}` +
          `&client_secret=${appSecret}` +
          `&fb_exchange_token=${igAccount.accessToken}`;

        const tokenRes = await fetch(tokenUrl, { method: "GET" });
        if (!tokenRes.ok) {
          throw new Error(`Erro ao renovar token: ${await tokenRes.text()}`);
        }

        const tokenData = await tokenRes.json() as {
          access_token: string;
          token_type: string;
          expires_in?: number;
        };

        const newAccessToken = tokenData.access_token;
        const expiresIn = tokenData.expires_in; // em segundos
        const expiresAt = expiresIn
          ? new Date(Date.now() + expiresIn * 1000)
          : null;

        // Atualizar o token na tabela instagramAccounts
        await db
          .update(instagramAccounts)
          .set({
            accessToken: newAccessToken,
            ...(expiresAt ? { tokenExpiresAt: expiresAt } : {}),
            updatedAt: new Date(),
          })
          .where(eq(instagramAccounts.id, input.accountId));

        return {
          success: true,
          accessToken: newAccessToken,
          expiresAt,
          message: "Token renovado com sucesso",
        };
      } catch (error) {
        console.error("[Meta Graph Integration] Erro ao renovar token:", error);
        throw error;
      }
    }),

  // ── Buscar posts reais do Instagram (sem precisar publicar pelo sistema) ──
  getInstagramPosts: protectedProcedure
    .input(z.object({ accountId: z.number(), limit: z.number().default(20) }))
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) return { posts: [], error: null };

      const account = await db
        .select()
        .from(instagramAccounts)
        .where(eq(instagramAccounts.id, input.accountId))
        .limit(1);

      if (!account || account.length === 0) throw new Error("Conta não encontrada");

      const igAccount = account[0];

      try {
        // Tentar acesso direto; se falhar, tentar via Página do Facebook
        let igIdToUse = igAccount.instagramId;

        // Verificar se o ID direto funciona (teste rápido)
        const testRes = await makeMetaGraphRequest(
          `/${igAccount.instagramId}`,
          "GET",
          igAccount.accessToken,
          undefined,
          { fields: "id" }
        );

        if (testRes.error && process.env.META_PAGE_ID) {
          // Fallback: descobrir ID via Página
          const pageRes = await makeMetaGraphRequest(
            `/${process.env.META_PAGE_ID}`,
            "GET",
            igAccount.accessToken,
            undefined,
            { fields: "instagram_business_account{id},connected_instagram_account{id}" }
          );
          const igViaPage = pageRes.instagram_business_account || pageRes.connected_instagram_account;
          if (igViaPage?.id) igIdToUse = igViaPage.id;
        }

        // Buscar mídia da conta
        const mediaRes = await makeMetaGraphRequest(
          `/${igIdToUse}/media`,
          "GET",
          igAccount.accessToken,
          undefined,
          {
            fields: "id,caption,media_type,media_url,thumbnail_url,timestamp,like_count,comments_count,permalink",
            limit: String(input.limit),
          }
        );

        if (mediaRes.error) {
          return { posts: [], error: mediaRes.error.message };
        }

        const posts = (mediaRes.data || []).map((p: any) => ({
          id: p.id,
          caption: p.caption?.slice(0, 100) || "",
          mediaType: p.media_type,
          mediaUrl: p.media_url || p.thumbnail_url,
          publishedAt: p.timestamp,
          likes: p.like_count || 0,
          comments: p.comments_count || 0,
          permalink: p.permalink,
        }));

        return { posts, error: null };
      } catch (err: any) {
        return { posts: [], error: err.message };
      }
    }),
});
