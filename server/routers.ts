import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { blingOAuthRouter } from "./routers/bling-oauth";
import { blingRouter } from "./routers/bling";
import { blingSyncRouter } from "./routers/bling-sync";
import { metaAdsRouter } from "./routers/meta-ads";
import { googleAdsRouter } from "./routers/google-ads";
import { whatsappRouter } from "./routers/whatsapp";
import { automationsRouter } from "./routers/automations";
import { campaignsRouter } from "./routers/campaigns";
import { integrationsRouter } from "./routers/integrations";
import { webhooksRouter } from "./routers/webhooks";
import { oauthIntegrationsRouter } from "./routers/oauth-integrations";
import { oauthCallbacksRouter } from "./routers/oauth-callbacks";
import { whatsappBusinessRouter } from "./routers/whatsapp-business";
import { autonomousInfluencersRouter } from "./routers/autonomous-influencers";
import { melhorEnvioRouter } from "./routers/melhor-envio";
import { influencerAccountsRouter } from "./routers/influencer-accounts";
import { postSchedulerRouter } from "./routers/post-scheduler";
import { metaAdsCampaignsRouter } from "./routers/meta-ads-campaigns";
import { campaignMetricsSyncRouter } from "./routers/campaign-metrics-sync";
import { smartAlertsRouter } from "./routers/smart-alerts";
import { collaboratorsRouter } from "./routers/collaborators";
import { oauthCredentialsRouter } from "./routers/oauth-credentials";
import { canvaIntegrationRouter } from "./routers/canva-integration";
import { metaIntegrationRouter } from "./routers/meta-integration";
import { blingRealRouter } from "./routers/bling-real";
import { canvaRealRouter } from "./routers/canva-real";
import { metaRealRouter } from "./routers/meta-real";
import { canvaOAuthRouter } from "./routers/canva-oauth";
import { metaCapiRouter } from "./routers/meta-capi";
import { postsRouter } from "./routers/posts";
import { instagramApiRouter } from "./routers/instagram-api";
import { metaGraphRouter } from "./routers/meta-graph-api";
import { instagramRouter } from "./routers/instagram";
import { influencerBlogRouter } from "./routers/influencer-blog";
import { mediaUploadRouter } from "./routers/media-upload";
import { instagramAccountsRouter } from "./routers/instagram-accounts";
import { instagramPublisherRouter } from "./routers/instagram-publisher";
import { metaGraphIntegrationRouter } from "./routers/meta-graph-integration";
import { publicBlogsRouter } from "./routers/public-blogs";
import { getDb } from "./db";
import { influencers } from "../drizzle/schema";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Bling integrations
  blingOAuth: blingOAuthRouter,
  bling: blingRouter,
  blingSync: blingSyncRouter,

  // Meta Ads integration
  metaAds: metaAdsRouter,

  // Google Ads integration
  googleAds: googleAdsRouter,

  // WhatsApp integration
  whatsapp: whatsappRouter,

  // Automations
  automations: automationsRouter,

  // Campaigns
  campaigns: campaignsRouter,

  // Integrations
  integrations: integrationsRouter,
  webhooks: webhooksRouter,
  oauthIntegrations: oauthIntegrationsRouter,
  oauthCallbacks: oauthCallbacksRouter,
  whatsappBusiness: whatsappBusinessRouter,
  autonomousInfluencers: autonomousInfluencersRouter,
  melhorEnvio: melhorEnvioRouter,
  influencerAccounts: influencerAccountsRouter,
  postScheduler: postSchedulerRouter,
  metaAdsCampaigns: metaAdsCampaignsRouter,
  campaignMetricsSync: campaignMetricsSyncRouter,
  smartAlerts: smartAlertsRouter,
  collaborators: collaboratorsRouter,
  oauthCredentials: oauthCredentialsRouter,
  canva: router(canvaIntegrationRouter),
  meta: router(metaIntegrationRouter),
  
  // Real integrations with actual APIs
  blingReal: router(blingRealRouter),
  canvaReal: router(canvaRealRouter),
  metaReal: router(metaRealRouter),
  canvaOAuth: canvaOAuthRouter,
  metaCapi: metaCapiRouter,
  posts: postsRouter,
  instagram: instagramApiRouter,
  metaGraph: metaGraphRouter,
  instagramPublish: instagramRouter,
  influencerBlog: influencerBlogRouter,
  mediaUpload: mediaUploadRouter,
  instagramAccounts: instagramAccountsRouter,
  instagramPublisher: instagramPublisherRouter,
  metaGraphIntegration: metaGraphIntegrationRouter,
  publicBlogs: publicBlogsRouter,
  influencers: router({
    list: publicProcedure.query(async () => {
      try {
        const db = await getDb();
        if (!db) return [];
        const allInfluencers = await db.select().from(influencers);
        return allInfluencers;
      } catch (error) {
        console.error('[Influencers] Erro ao listar:', error);
        return [];
      }
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
