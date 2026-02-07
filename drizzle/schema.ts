import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabela para armazenar integrações de plataformas
export const integrations = mysqlTable("integrations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plataforma: mysqlEnum("plataforma", [
    "tray",
    "google_drive",
    "meta",
    "email_marketing",
    "instagram",
    "tiktok",
    "facebook",
    "whatsapp",
    "bling",
  ]).notNull(),
  token: text("token").notNull(), // Armazenado criptografado
  isConnected: boolean("isConnected").default(false).notNull(),
  lastValidated: timestamp("lastValidated"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type Integration = typeof integrations.$inferSelect;
export type InsertIntegration = typeof integrations.$inferInsert;

// Tabela para armazenar webhooks registrados
export const webhooks = mysqlTable("webhooks", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plataforma: mysqlEnum("plataforma", [
    "tray",
    "google_drive",
    "meta",
    "email_marketing",
    "instagram",
    "tiktok",
    "facebook",
    "whatsapp",
    "bling",
  ]).notNull(),
  webhookUrl: text("webhookUrl").notNull(),
  webhookSecret: varchar("webhookSecret", { length: 255 }).notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  lastTriggered: timestamp("lastTriggered"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type Webhook = typeof webhooks.$inferSelect;
export type InsertWebhook = typeof webhooks.$inferInsert;

// Tabela para armazenar eventos de webhooks
export const webhookEvents = mysqlTable("webhook_events", {
  id: int("id").autoincrement().primaryKey(),
  webhookId: int("webhookId").notNull(),
  userId: int("userId").notNull(),
  plataforma: varchar("plataforma", { length: 50 }).notNull(),
  eventType: varchar("eventType", { length: 100 }).notNull(), // campaign_created, campaign_updated, etc
  eventData: text("eventData").notNull(), // JSON com dados do evento
  status: mysqlEnum("status", ["pending", "processed", "failed"]).default("pending").notNull(),
  retries: int("retries").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  processedAt: timestamp("processedAt"),
});

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type InsertWebhookEvent = typeof webhookEvents.$inferInsert;

// Tabela para armazenar notificações
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plataforma: varchar("plataforma", { length: 50 }).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  tipo: mysqlEnum("tipo", ["campaign_created", "campaign_updated", "campaign_paused", "campaign_resumed", "error", "success"]).notNull(),
  isRead: boolean("isRead").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// Tabela para armazenar tokens OAuth com refresh tokens
export const oauthTokens = mysqlTable("oauth_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plataforma: mysqlEnum("plataforma", [
    "bling",
    "meta",
    "tiktok",
    "google_drive",
  ]).notNull(),
  accessToken: text("accessToken").notNull(), // Armazenado criptografado
  refreshToken: text("refreshToken"), // Armazenado criptografado
  expiresAt: timestamp("expiresAt"), // Quando o token expira
  scope: text("scope"), // Escopos autorizados
  accountInfo: text("accountInfo"), // JSON com informações da conta (email, nome, etc)
  isActive: boolean("isActive").default(true).notNull(),
  lastUsed: timestamp("lastUsed"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type OAuthToken = typeof oauthTokens.$inferSelect;
export type InsertOAuthToken = typeof oauthTokens.$inferInsert;


// ============ Influencers Management ============
import { date, datetime, decimal, json, longtext } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const influencers = mysqlTable("influencers", {
  id: int("id").primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(), // Carol, Renata, Vanessa, Luiza
  bio: text("bio"),
  personality: varchar("personality", { length: 255 }), // Unique personality traits
  avatar: varchar("avatar", { length: 512 }), // Avatar URL
  instagramHandle: varchar("instagram_handle", { length: 255 }),
  tiktokHandle: varchar("tiktok_handle", { length: 255 }),
  youtubeHandle: varchar("youtube_handle", { length: 255 }),
  blogUrl: varchar("blog_url", { length: 512 }),
  instagramAccessToken: varchar("instagram_access_token", { length: 512 }),
  tiktokAccessToken: varchar("tiktok_access_token", { length: 512 }),
  youtubeAccessToken: varchar("youtube_access_token", { length: 512 }),
  isActive: boolean("is_active").default(true),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdateFn(() => new Date()),
});

export const influencerKnowledgeBase = mysqlTable("influencer_knowledge_base", {
  id: int("id").primaryKey().autoincrement(),
  influencerId: int("influencer_id").notNull().references(() => influencers.id),
  category: varchar("category", { length: 255 }), // "products", "policies", "faqs", "trends"
  content: longtext("content"),
  embedding: varchar("embedding", { length: 2048 }), // Vector embedding for RAG
  source: varchar("source", { length: 255 }), // "catalog", "manual", "feedback"
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdateFn(() => new Date()),
});

export const influencerPosts = mysqlTable("influencer_posts", {
  id: int("id").primaryKey().autoincrement(),
  influencerId: int("influencer_id").notNull().references(() => influencers.id),
  platform: varchar("platform", { length: 50 }), // "instagram", "tiktok", "youtube", "blog"
  postId: varchar("post_id", { length: 255 }), // Platform-specific post ID
  content: longtext("content"),
  mediaUrls: json("media_urls").$type<string[]>(),
  caption: text("caption"),
  hashtags: json("hashtags").$type<string[]>(),
  scheduledAt: datetime("scheduled_at"),
  publishedAt: datetime("published_at"),
  status: varchar("status", { length: 50 }), // "draft", "scheduled", "published", "failed"
  engagementMetrics: json("engagement_metrics").$type<{
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
    saves?: number;
  }>(),
  aiGenerated: boolean("ai_generated").default(true),
  approvedBy: varchar("approved_by", { length: 255 }),
  approvedAt: datetime("approved_at"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdateFn(() => new Date()),
});

export const influencerTrends = mysqlTable("influencer_trends", {
  id: int("id").primaryKey().autoincrement(),
  influencerId: int("influencer_id").notNull().references(() => influencers.id),
  platform: varchar("platform", { length: 50 }),
  trendName: varchar("trend_name", { length: 255 }).notNull(),
  trendCategory: varchar("trend_category", { length: 100 }), // "hashtag", "sound", "challenge", "topic"
  relevanceScore: decimal("relevance_score", { precision: 3, scale: 2 }), // 0-1
  momentum: varchar("momentum", { length: 50 }), // "rising", "peak", "declining"
  estimatedReach: int("estimated_reach"),
  recommendedPostType: varchar("recommended_post_type", { length: 50 }),
  detectedAt: datetime("detected_at").default(sql`CURRENT_TIMESTAMP`),
  expiresAt: datetime("expires_at"),
});

export const influencerPerformance = mysqlTable("influencer_performance", {
  id: int("id").primaryKey().autoincrement(),
  influencerId: int("influencer_id").notNull().references(() => influencers.id),
  date: date("date").notNull(),
  platform: varchar("platform", { length: 50 }),
  totalFollowers: int("total_followers"),
  followersGrowth: int("followers_growth"),
  totalEngagement: int("total_engagement"),
  engagementRate: decimal("engagement_rate", { precision: 5, scale: 2 }),
  totalReach: int("total_reach"),
  totalImpressions: int("total_impressions"),
  topPost: varchar("top_post", { length: 255 }),
  topPostEngagement: int("top_post_engagement"),
  averagePostsPerDay: decimal("average_posts_per_day", { precision: 4, scale: 2 }),
  sentimentScore: decimal("sentiment_score", { precision: 3, scale: 2 }), // 0-1
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const influencerInteractions = mysqlTable("influencer_interactions", {
  id: int("id").primaryKey().autoincrement(),
  influencerId: int("influencer_id").notNull().references(() => influencers.id),
  platform: varchar("platform", { length: 50 }),
  interactionType: varchar("interaction_type", { length: 50 }), // "comment", "dm", "mention"
  followerUsername: varchar("follower_username", { length: 255 }),
  content: text("content"),
  sentiment: varchar("sentiment", { length: 20 }), // "positive", "neutral", "negative"
  responseGenerated: text("response_generated"),
  responseSent: boolean("response_sent").default(false),
  sentAt: datetime("sent_at"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export type Influencer = typeof influencers.$inferSelect;
export type InsertInfluencer = typeof influencers.$inferInsert;
export type InfluencerKnowledgeBase = typeof influencerKnowledgeBase.$inferSelect;
export type InsertInfluencerKnowledgeBase = typeof influencerKnowledgeBase.$inferInsert;
export type InfluencerPost = typeof influencerPosts.$inferSelect;
export type InsertInfluencerPost = typeof influencerPosts.$inferInsert;
export type InfluencerTrend = typeof influencerTrends.$inferSelect;
export type InsertInfluencerTrend = typeof influencerTrends.$inferInsert;
export type InfluencerPerformance = typeof influencerPerformance.$inferSelect;
export type InsertInfluencerPerformance = typeof influencerPerformance.$inferInsert;
export type InfluencerInteraction = typeof influencerInteractions.$inferSelect;
export type InsertInfluencerInteraction = typeof influencerInteractions.$inferInsert;


// Tabela para armazenar colaboradores
export const collaborators = mysqlTable("collaborators", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("passwordHash").notNull(), // Hash bcrypt
  role: mysqlEnum("role", ["admin", "editor", "viewer"]).default("viewer").notNull(),
  githubId: varchar("githubId", { length: 255 }),
  githubUsername: varchar("githubUsername", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  lastLogin: timestamp("lastLogin"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type Collaborator = typeof collaborators.$inferSelect;
export type InsertCollaborator = typeof collaborators.$inferInsert;

// Tabela para armazenar credenciais OAuth de integrações
export const oauthCredentials = mysqlTable("oauth_credentials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  platform: mysqlEnum("platform", [
    "bling",
    "canva",
    "meta",
    "tiktok",
    "google_drive",
    "whatsapp",
    "email_marketing",
    "tray",
  ]).notNull(),
  clientId: text("clientId"),
  clientSecret: text("clientSecret"),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  isConnected: boolean("isConnected").default(false).notNull(),
  lastValidated: timestamp("lastValidated"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type OAuthCredential = typeof oauthCredentials.$inferSelect;
export type InsertOAuthCredential = typeof oauthCredentials.$inferInsert;


// Tabelas para CMS de Gerenciamento de Conteúdo
export const contentItems = mysqlTable("content_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  section: varchar("section", { length: 100 }).notNull(), // "personas", "planejamento", "roteiros", etc
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content"), // Conteúdo principal (texto rico)
  hashtags: text("hashtags"), // JSON array de hashtags
  status: mysqlEnum("status", ["draft", "scheduled", "published", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = typeof contentItems.$inferInsert;

// Tabela para armazenar arquivos de mídia (vídeos, imagens)
export const mediaFiles = mysqlTable("media_files", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("contentId").notNull().references(() => contentItems.id),
  userId: int("userId").notNull().references(() => users.id),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileType: varchar("fileType", { length: 50 }).notNull(), // "video", "image"
  mimeType: varchar("mimeType", { length: 100 }).notNull(), // "video/mp4", "image/jpeg"
  fileSize: int("fileSize").notNull(), // em bytes
  s3Key: varchar("s3Key", { length: 500 }).notNull(), // chave no S3
  s3Url: text("s3Url").notNull(), // URL pública do S3
  thumbnailUrl: text("thumbnailUrl"), // URL do thumbnail (para vídeos)
  duration: int("duration"), // duração em segundos (para vídeos)
  width: int("width"), // largura em pixels
  height: int("height"), // altura em pixels
  uploadedAt: timestamp("uploadedAt").defaultNow().notNull(),
});

export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = typeof mediaFiles.$inferInsert;

// Tabela para agendamento de publicações
export const scheduledPosts = mysqlTable("scheduled_posts", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("contentId").notNull().references(() => contentItems.id),
  userId: int("userId").notNull().references(() => users.id),
  platforms: varchar("platforms", { length: 500 }).notNull(), // JSON array: ["instagram", "facebook", "tiktok", "whatsapp"]
  scheduledAt: timestamp("scheduledAt").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "published", "failed", "cancelled"]).default("pending").notNull(),
  failureReason: text("failureReason"), // Motivo da falha, se houver
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = typeof scheduledPosts.$inferInsert;

// Tabela para histórico de publicações
export const postHistory = mysqlTable("post_history", {
  id: int("id").autoincrement().primaryKey(),
  scheduledPostId: int("scheduledPostId").notNull().references(() => scheduledPosts.id),
  contentId: int("contentId").notNull().references(() => contentItems.id),
  userId: int("userId").notNull().references(() => users.id),
  platform: varchar("platform", { length: 50 }).notNull(), // "instagram", "facebook", "tiktok", "whatsapp"
  postId: varchar("postId", { length: 255 }), // ID da publicação na plataforma
  postUrl: text("postUrl"), // URL da publicação
  status: mysqlEnum("status", ["success", "failed", "pending"]).default("pending").notNull(),
  errorMessage: text("errorMessage"),
  postedAt: timestamp("postedAt"),
  engagement: int("engagement"), // likes, comments, shares combinados
  reach: int("reach"), // alcance da publicação
  impressions: int("impressions"), // impressões da publicação
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PostHistory = typeof postHistory.$inferSelect;
export type InsertPostHistory = typeof postHistory.$inferInsert;


// Tabela para armazenar contas das influenciadoras (email, Instagram, TikTok, Facebook, WhatsApp)
export const influencerAccounts = mysqlTable("influencer_accounts", {
  id: int("id").autoincrement().primaryKey(),
  influencerId: int("influencerId").notNull().references(() => influencers.id),
  email: varchar("email", { length: 320 }),
  instagram: varchar("instagram", { length: 255 }),
  tiktok: varchar("tiktok", { length: 255 }),
  facebook: varchar("facebook", { length: 255 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  youtube: varchar("youtube", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type InfluencerAccount = typeof influencerAccounts.$inferSelect;
export type InsertInfluencerAccount = typeof influencerAccounts.$inferInsert;




// ============ Meta Ads Campaign Management ============

// Tabela para armazenar histórico de sincronizações
export const metaSyncHistory = mysqlTable("meta_sync_history", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  syncType: mysqlEnum("syncType", ["campaigns", "metrics", "ads", "audiences", "full"]).notNull(),
  totalCampaigns: int("totalCampaigns").default(0),
  updatedCampaigns: int("updatedCampaigns").default(0),
  failedCampaigns: int("failedCampaigns").default(0),
  status: mysqlEnum("status", ["success", "partial", "failed"]).notNull(),
  errorMessage: text("errorMessage"),
  syncDuration: int("syncDuration"), // em milissegundos
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MetaSyncHistory = typeof metaSyncHistory.$inferSelect;
export type InsertMetaSyncHistory = typeof metaSyncHistory.$inferInsert;

// Tabela para armazenar alertas inteligentes
export const metaCampaignAlerts = mysqlTable("meta_campaign_alerts", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  campaignId: varchar("campaignId", { length: 255 }).notNull(),
  campaignName: varchar("campaignName", { length: 255 }).notNull(),
  alertType: mysqlEnum("alertType", [
    "low_roi",
    "high_spend",
    "budget_limit",
    "performance_drop",
    "high_cpc",
    "low_ctr",
  ]).notNull(),
  severity: mysqlEnum("severity", ["info", "warning", "critical"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  currentValue: varchar("currentValue", { length: 255 }),
  threshold: varchar("threshold", { length: 255 }),
  recommendation: text("recommendation"),
  isRead: boolean("isRead").default(false).notNull(),
  isResolved: boolean("isResolved").default(false).notNull(),
  resolvedAt: timestamp("resolvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type MetaCampaignAlert = typeof metaCampaignAlerts.$inferSelect;
export type InsertMetaCampaignAlert = typeof metaCampaignAlerts.$inferInsert;
