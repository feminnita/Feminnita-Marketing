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
import { instagramCommentsRouter } from "./routers/instagram-comments";
import { abandonoRecoveryRouter } from "./routers/abandono-recovery";
import { brandBookRouter } from "./routers/brand-book";
import { dropsRouter } from "./routers/drops";
import { ugcRouter } from "./routers/ugc";
import { tiktokLiveRouter } from "./routers/tiktok-live";
import { cuponsRouter } from "./routers/cupons";
import { contentTemplatesRouter } from "./routers/content-templates";
import { adsManagerRouter } from "./routers/ads-manager";
import { mlAdsManagerRouter } from "./routers/ml-ads-manager";
import { shopeeAdsManagerRouter } from "./routers/shopee-ads-manager";
import { tiktokShopManagerRouter } from "./routers/tiktok-shop-manager";
import { tiktokTeamRouter } from "./routers/tiktok-team";
import { amazonManagerRouter } from "./routers/amazon-manager";
import { blogRouter } from "./routers/blog";
import { trafficManagerRouter } from "./routers/traffic-manager";
import { agentMemoryRouter } from "./routers/agent-memory";
import { agentActionsRouter } from "./routers/agent-actions";
import { morningBriefingRouter } from "./routers/morning-briefing";
import { marketKnowledgeRouter } from "./routers/market-knowledge";
import { specialistChatRouter } from "./routers/specialist-chat";
import { pushSubscriptionsRouter } from "./routers/push-subscriptions";
import { whatsappBlastsRouter } from "./routers/whatsapp-blasts";
import { creativeAdsRouter } from "./routers/creative-ads";
import { specialistsRouter } from "./routers/specialists";
import { trayDudaRouter } from "./routers/tray-duda";
import { trayAnyRouter } from "./routers/tray-any";
import { mlGabiRouter } from "./routers/ml-gabi";
import { shopeeLuizaRouter } from "./routers/shopee-luiza";
import { amazonAliceRouter } from "./routers/amazon-alice";
import { sheinIsabelaRouter } from "./routers/shein-isabela";
import { agentTasksRouter } from "./routers/agent-tasks";
import { chatUploadRouter } from "./routers/chat-upload";
import { hailuoImageRouter } from "./routers/hailuo-image";
import { runpodVideoRouter } from "./routers/runpod-video";
import { ga4Router } from "./routers/ga4";
import { portalRouter } from "./routers/portal";
import { getDb } from "./db";
import { influencers, influencerPosts } from "../drizzle/schema";

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

    updateProfile: protectedProcedure
      .input(z.object({ name: z.string().min(1).max(100) }))
      .mutation(async ({ ctx, input }) => {
        const dbConn = await getDb();
        if (!dbConn) throw new Error("DB indisponível");
        const { users } = await import("../drizzle/schema");
        const { eq } = await import("drizzle-orm");
        await dbConn.update(users).set({ name: input.name }).where(eq(users.id, ctx.user!.id));
        return { success: true };
      }),
  }),

  // Bling integrations
  blingOAuth: blingOAuthRouter,
  bling: blingRouter,
  blingSync: blingSyncRouter,

  // Google Ads integration
  googleAds: googleAdsRouter,
  // Google Analytics 4
  ga4: ga4Router,

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
  instagramComments: instagramCommentsRouter,
  abandonoRecovery: abandonoRecoveryRouter,
  brandBook: brandBookRouter,
  drops: dropsRouter,
  ugc: ugcRouter,
  tiktokLive: tiktokLiveRouter,
  cupons: cuponsRouter,
  contentTemplates: contentTemplatesRouter,
  adsManager: adsManagerRouter,
  mlAdsManager: mlAdsManagerRouter,
  shopeeAdsManager: shopeeAdsManagerRouter,
  tiktokShopManager: tiktokShopManagerRouter,
  tiktokTeam: tiktokTeamRouter,
  amazonManager: amazonManagerRouter,
  blog: blogRouter,
  trafficManager: trafficManagerRouter,
  agentMemory: agentMemoryRouter,
  agentActions: agentActionsRouter,
  morningBriefing: morningBriefingRouter,
  marketKnowledge: marketKnowledgeRouter,
  specialistChat: specialistChatRouter,
  pushSubscriptions: pushSubscriptionsRouter,
  whatsappBlasts: whatsappBlastsRouter,
  creativeAds: creativeAdsRouter,
  specialists: specialistsRouter,
  trayDuda: trayDudaRouter,
  trayAny: trayAnyRouter,
  mlGabi: mlGabiRouter,
  shopeeLuiza: shopeeLuizaRouter,
  amazonAlice: amazonAliceRouter,
  sheinIsabela: sheinIsabelaRouter,
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

    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        bio: z.string().optional(),
        personality: z.string().optional(),
        avatar: z.string().optional(),
        instagramHandle: z.string().optional(),
        tiktokHandle: z.string().optional(),
        contentStyle: z.string().optional(),
        targetAudience: z.string().optional(),
        keywords: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { eq } = await import("drizzle-orm");
        const result = await db.insert(influencers).values({
          userId: ctx.user.id,
          name: input.name,
          bio: input.bio,
          personality: input.personality,
          avatar: input.avatar,
          instagramHandle: input.instagramHandle,
          tiktokHandle: input.tiktokHandle,
          isActive: true,
        });
        const created = await db.select().from(influencers)
          .where(eq(influencers.id, (result[0] as any).insertId)).limit(1);
        return created[0];
      }),

    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        bio: z.string().optional(),
        personality: z.string().optional(),
        avatar: z.string().optional(),
        instagramHandle: z.string().optional(),
        tiktokHandle: z.string().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { eq, and } = await import("drizzle-orm");
        const owned = await db.select({ id: influencers.id }).from(influencers)
          .where(and(eq(influencers.id, input.id), eq(influencers.userId, ctx.user.id))).limit(1);
        if (owned.length === 0) throw new Error("Influencer não encontrado");
        const { id, ...updates } = input;
        await db.update(influencers).set(updates).where(eq(influencers.id, id));
        const updated = await db.select().from(influencers).where(eq(influencers.id, id)).limit(1);
        return updated[0];
      }),

    upsertDefaults: protectedProcedure.mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const { eq } = await import("drizzle-orm");

      const defaults = [
        {
          name: "Carol",
          bio: "Carol é a influenciadora jovem e animada da Feminnita. Ama mostrar looks de pijama no dia a dia, reels divertidos e stories de rotina noturna. Seu tom é descontraído, próximo e cheio de energia.",
          personality: "Jovem, animada, divertida, usa gírias, faz trends do TikTok, conecta com a geração Z e millennials jovens",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carol&backgroundColor=ffdfbf",
          instagramHandle: "@carol.feminnita",
          tiktokHandle: "@carolfeminnita",
        },
        {
          name: "Renata",
          bio: "Renata é a influenciadora sofisticada da Feminnita. Foco em bem-estar, autocuidado e rotinas noturnas premium. Fala com mulheres que investem em qualidade de vida.",
          personality: "Elegante, sofisticada, fala sobre autocuidado e bem-estar, tom calmo e inspirador, conecta com mulheres 30-45 anos",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Renata&backgroundColor=ffd5dc",
          instagramHandle: "@renata.feminnita",
          tiktokHandle: "@renatafeminnita",
        },
        {
          name: "Vanessa",
          bio: "Vanessa é a influenciadora prática da Feminnita. Foco em custo-benefício, kits família, pijamas infantis. Fala com mães que buscam qualidade a bom preço.",
          personality: "Prática, objetiva, fala de custo-benefício e família, dicas de como montar kit, tom acolhedor e direto",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Vanessa&backgroundColor=c0e8d5",
          instagramHandle: "@vanessa.feminnita",
          tiktokHandle: "@vanessafeminnita",
        },
        {
          name: "Luiza",
          bio: "Luiza é a influenciadora fashionista da Feminnita. Foco em tendências, lançamentos e looks estilosos de pijama. Conecta com o público que quer estar na moda mesmo em casa.",
          personality: "Fashionista, antenada em tendências, fala sobre lançamentos e drops, tom animado e visual, conecta com público 20-35 anos",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Luiza&backgroundColor=ffe4b5",
          instagramHandle: "@luiza.feminnita",
          tiktokHandle: "@luizafeminnita",
        },
      ];

      const existing = await db.select({ name: influencers.name })
        .from(influencers).where(eq(influencers.userId, ctx.user.id));
      const existingNames = existing.map((i: { name: string }) => i.name);

      let created = 0;
      for (const inf of defaults) {
        if (!existingNames.includes(inf.name)) {
          await db.insert(influencers).values({ ...inf, userId: ctx.user.id, isActive: true });
          created++;
        }
      }
      return { created, message: `${created} influencers criadas` };
    }),

    getPosts: protectedProcedure
      .input(z.object({
        influencerId: z.number(),
        status: z.enum(["draft", "scheduled", "published", "failed"]).optional(),
        limit: z.number().default(20),
      }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return [];
        const { eq, and, desc } = await import("drizzle-orm");
        const owned = await db.select({ id: influencers.id }).from(influencers)
          .where(and(eq(influencers.id, input.influencerId), eq(influencers.userId, ctx.user.id))).limit(1);
        if (owned.length === 0) return [];
        const conditions = [eq(influencerPosts.influencerId, input.influencerId)];
        if (input.status) {
          conditions.push(eq(influencerPosts.status, input.status));
        }
        return db.select().from(influencerPosts)
          .where(and(...conditions))
          .orderBy(desc(influencerPosts.createdAt))
          .limit(input.limit);
      }),

    deletePost: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        const { eq, and } = await import("drizzle-orm");
        const post = await db.select({ influencerId: influencerPosts.influencerId })
          .from(influencerPosts).where(eq(influencerPosts.id, input.postId)).limit(1);
        if (post.length === 0) throw new Error("Post não encontrado");
        const owned = await db.select({ id: influencers.id }).from(influencers)
          .where(and(eq(influencers.id, post[0].influencerId ?? 0), eq(influencers.userId, ctx.user.id))).limit(1);
        if (owned.length === 0) throw new Error("Acesso negado");
        await db.delete(influencerPosts).where(eq(influencerPosts.id, input.postId));
        return { success: true };
      }),

    getAllPosts: protectedProcedure
      .input(z.object({ limit: z.number().default(200) }))
      .query(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) return [];
        const { eq, desc, inArray } = await import("drizzle-orm");
        const myInfluencers = await db.select({ id: influencers.id, name: influencers.name })
          .from(influencers).where(eq(influencers.userId, ctx.user.id));
        if (myInfluencers.length === 0) return [];
        const ids = myInfluencers.map((i: { id: number; name: string }) => i.id);
        const posts = await db.select().from(influencerPosts)
          .where(inArray(influencerPosts.influencerId, ids))
          .orderBy(desc(influencerPosts.createdAt))
          .limit(input.limit);
        return posts.map((post: typeof influencerPosts.$inferSelect) => ({
          ...post,
          influencerName: myInfluencers.find((i: { id: number; name: string }) => i.id === post.influencerId)?.name ?? '',
        }));
      }),
  }),

  portal: portalRouter,
  agentTasks: agentTasksRouter,
  chatUpload: chatUploadRouter,
  hailuoImage: hailuoImageRouter,
  runpodVideo: runpodVideoRouter,

  users: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      const dbConn = await getDb();
      if (!dbConn) return [];
      const { ne } = await import("drizzle-orm");
      const { users: usersTable } = await import("../drizzle/schema");
      return dbConn.select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
        .from(usersTable)
        .where(ne(usersTable.id, ctx.user.id));
    }),
  }),

  dm: router({
    history: protectedProcedure
      .input(z.object({ withUserId: z.number() }))
      .query(async ({ ctx, input }) => {
        try {
          const dbConn = await getDb();
          if (!dbConn) return [];
          const { or, and, eq, desc } = await import("drizzle-orm");
          const { directMessages } = await import("../drizzle/schema");
          const msgs = await dbConn
            .select()
            .from(directMessages)
            .where(
              or(
                and(eq(directMessages.fromUserId, ctx.user.id), eq(directMessages.toUserId, input.withUserId)),
                and(eq(directMessages.fromUserId, input.withUserId), eq(directMessages.toUserId, ctx.user.id)),
              )
            )
            .orderBy(desc(directMessages.createdAt))
            .limit(50);
          return msgs.reverse();
        } catch (err) {
          console.error("[dm.history] Erro ao buscar mensagens:", err);
          return [];
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
