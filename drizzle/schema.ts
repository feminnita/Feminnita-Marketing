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
