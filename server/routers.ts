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

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
