import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import * as db from "./db";
import { z } from "zod";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hash] = stored.split(":");
  const hashBuf = Buffer.from(hash, "hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return timingSafeEqual(hashBuf, derived);
}
import { blingOAuthRouter } from "./routers/bling-oauth";
import { blingRouter } from "./routers/bling";
import { blingSyncRouter } from "./routers/bling-sync";
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
import { campaignMetricsSyncRouter } from "./routers/campaign-metrics-sync";
import { smartAlertsRouter } from "./routers/smart-alerts";
import { collaboratorsRouter } from "./routers/collaborators";
import { oauthCredentialsRouter } from "./routers/oauth-credentials";
import { canvaIntegrationRouter } from "./routers/canva-integration";
import { blingRealRouter } from "./routers/bling-real";
import { canvaOAuthRouter } from "./routers/canva-oauth";
import { metaCapiRouter } from "./routers/meta-capi";
import { postsRouter } from "./routers/posts";
import { instagramApiRouter } from "./routers/instagram-api";
import { instagramRouter } from "./routers/instagram";
import { influencerBlogRouter } from "./routers/influencer-blog";
import { scheduledPostsRouter } from "./routers/scheduled-posts";
import { aiContentGeneratorRouter } from "./routers/ai-content-generator";
import { publicationAutomationRouter } from "./routers/publication-automation";
import { autoContentGeneratorRouter } from "./routers/auto-content-generator";
import { postApprovalRouter } from "./routers/post-approval";
import { postApprovalEnhancedRouter } from "./routers/post-approval-enhanced";
import { aiCustomerSupportRouter } from "./routers/ai-customer-support";
import { whatsappAIIntegrationRouter } from "./routers/whatsapp-ai-integration";
import { whatsappFaqRouter } from "./routers/whatsapp-faq";

import { whatsappBaileysRouter } from "./routers/whatsapp-baileys";
import { baileysAIIntegrationRouter } from "./routers/baileys-ai-integration";
import { mediaUploadRouter } from "./routers/media-upload";
import { instagramAccountsRouter } from "./routers/instagram-accounts";
import { metaGraphIntegrationRouter } from "./routers/meta-graph-integration";
import { publicBlogsRouter } from "./routers/public-blogs";
import { publicationQueueRouter } from "./routers/publication-queue";
import { metaAdsCampaignsRouter } from "./routers/meta-ads-campaigns";
import { marketResearchRouter } from "./routers/market-research";
import { assetLibraryRouter } from "./routers/asset-library";
import { afiliadasRouter } from "./routers/afiliadas";
import { abandonoRecoveryRouter } from "./routers/abandono-recovery";
import { brandBookRouter } from "./routers/brand-book";
import { dropsRouter } from "./routers/drops";
import { ugcRouter } from "./routers/ugc";
import { tiktokLiveRouter } from "./routers/tiktok-live";
import { cuponsRouter } from "./routers/cupons";
import { contentTemplatesRouter } from "./routers/content-templates";
import { getDb } from "./db";
import { influencers } from "../drizzle/schema";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),

    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const existing = await db.getUserByEmail(input.email);
        if (existing) throw new Error("Email já cadastrado");
        const passwordHash = await hashPassword(input.password);
        const user = await db.createUser({ email: input.email, passwordHash, name: input.name });
        const token = await sdk.signSession({ userId: user.id, email: user.email });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true as const, user };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.passwordHash) throw new Error("Email ou senha inválidos");
        const valid = await verifyPassword(input.password, user.passwordHash);
        if (!valid) throw new Error("Email ou senha inválidos");
        const token = await sdk.signSession({ userId: user.id, email: user.email });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true as const, user };
      }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // Bling integrations
  blingOAuth: blingOAuthRouter,
  bling: blingRouter,
  blingSync: blingSyncRouter,

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
  campaignMetricsSync: campaignMetricsSyncRouter,
  smartAlerts: smartAlertsRouter,
  collaborators: collaboratorsRouter,
  oauthCredentials: oauthCredentialsRouter,
  canva: router(canvaIntegrationRouter),

  // Real integrations with actual APIs
  blingReal: router(blingRealRouter),
  canvaOAuth: canvaOAuthRouter,
  metaCapi: metaCapiRouter,
  posts: postsRouter,
  instagram: instagramApiRouter,
  instagramPublish: instagramRouter,
  influencerBlog: influencerBlogRouter,
  scheduledPosts: scheduledPostsRouter,
  aiContentGenerator: aiContentGeneratorRouter,
  publicationAutomation: publicationAutomationRouter,
  autoContentGenerator: autoContentGeneratorRouter,
  postApproval: postApprovalRouter,
  postApprovalEnhanced: postApprovalEnhancedRouter,
  aiCustomerSupport: aiCustomerSupportRouter,
  whatsappAIIntegration: whatsappAIIntegrationRouter,
  whatsappFaq: whatsappFaqRouter,

  whatsappBaileys: whatsappBaileysRouter,
  baileysAIIntegration: baileysAIIntegrationRouter,
  mediaUpload: mediaUploadRouter,
  instagramAccounts: instagramAccountsRouter,
  metaGraphIntegration: metaGraphIntegrationRouter,
  publicBlogs: publicBlogsRouter,
  publicationQueue: publicationQueueRouter,
  metaAdsCampaigns: metaAdsCampaignsRouter,
  marketResearch: marketResearchRouter,
  assetLibrary: assetLibraryRouter,
  afiliadas: afiliadasRouter,
  abandonoRecovery: abandonoRecoveryRouter,
  brandBook: brandBookRouter,
  drops: dropsRouter,
  ugc: ugcRouter,
  tiktokLive: tiktokLiveRouter,
  cupons: cuponsRouter,
  contentTemplates: contentTemplatesRouter,
  influencers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      try {
        const db = await getDb();
        if (!db) return [];
        const { eq } = await import("drizzle-orm");
        const allInfluencers = await db.select().from(influencers).where(eq(influencers.userId, ctx.user.id));
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
