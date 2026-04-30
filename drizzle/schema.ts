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
  /** Email address — unique user identifier for email/password auth. */
  email: varchar("email", { length: 320 }).notNull().unique(),
  /** bcrypt/scrypt password hash. Null for OAuth-only accounts (future). */
  passwordHash: varchar("passwordHash", { length: 255 }),
  name: text("name"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
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
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
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
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
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
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});

export type OAuthToken = typeof oauthTokens.$inferSelect;
export type InsertOAuthToken = typeof oauthTokens.$inferInsert;


// ============ Influencers Management ============
import { date, datetime, decimal, json, longtext } from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

export const influencers = mysqlTable("influencers", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
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
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdateFn(()=>new Date()),
});

export const influencerKnowledgeBase = mysqlTable("influencer_knowledge_base", {
  id: int("id").primaryKey().autoincrement(),
  influencerId: int("influencer_id").notNull(),
  category: varchar("category", { length: 255 }), // "products", "policies", "faqs", "trends"
  content: longtext("content"),
  embedding: varchar("embedding", { length: 2048 }), // Vector embedding for RAG
  source: varchar("source", { length: 255 }), // "catalog", "manual", "feedback"
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdateFn(()=>new Date()),
});

export const influencerPosts = mysqlTable("influencer_posts", {
  id: int("id").primaryKey().autoincrement(),
  influencerId: int("influencer_id").notNull(),
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
  updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).$onUpdateFn(()=>new Date()),
});

export const influencerTrends = mysqlTable("influencer_trends", {
  id: int("id").primaryKey().autoincrement(),
  influencerId: int("influencer_id").notNull(),
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
  influencerId: int("influencer_id").notNull(),
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
  influencerId: int("influencer_id").notNull(),
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
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
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
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});

export type OAuthCredential = typeof oauthCredentials.$inferSelect;
export type InsertOAuthCredential = typeof oauthCredentials.$inferInsert;


// Tabelas para CMS de Gerenciamento de Conteúdo
export const contentItems = mysqlTable("content_items", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  section: varchar("section", { length: 100 }).notNull(), // "personas", "planejamento", "roteiros", etc
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  content: text("content"), // Conteúdo principal (texto rico)
  hashtags: text("hashtags"), // JSON array de hashtags
  status: mysqlEnum("status", ["draft", "scheduled", "published", "archived"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});

export type ContentItem = typeof contentItems.$inferSelect;
export type InsertContentItem = typeof contentItems.$inferInsert;

// Tabela para armazenar arquivos de mídia (vídeos, imagens)
export const mediaFiles = mysqlTable("media_files", {
  id: int("id").autoincrement().primaryKey(),
  contentId: int("contentId").notNull(),
  userId: int("userId").notNull(),
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
  contentId: int("contentId").notNull(),
  userId: int("userId").notNull(),
  platforms: varchar("platforms", { length: 500 }).notNull(), // JSON array: ["instagram", "facebook", "tiktok", "whatsapp"]
  scheduledAt: timestamp("scheduledAt").notNull(),
  status: mysqlEnum("status", ["pending", "processing", "published", "failed", "cancelled"]).default("pending").notNull(),
  failureReason: text("failureReason"), // Motivo da falha, se houver
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});

export type ScheduledPost = typeof scheduledPosts.$inferSelect;
export type InsertScheduledPost = typeof scheduledPosts.$inferInsert;

// Tabela para histórico de publicações
export const postHistory = mysqlTable("post_history", {
  id: int("id").autoincrement().primaryKey(),
  scheduledPostId: int("scheduledPostId").notNull(),
  contentId: int("contentId").notNull(),
  userId: int("userId").notNull(),
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
  influencerId: int("influencerId").notNull(),
  email: varchar("email", { length: 320 }),
  instagram: varchar("instagram", { length: 255 }),
  tiktok: varchar("tiktok", { length: 255 }),
  facebook: varchar("facebook", { length: 255 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  youtube: varchar("youtube", { length: 255 }),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
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
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});

export type MetaCampaignAlert = typeof metaCampaignAlerts.$inferSelect;
export type InsertMetaCampaignAlert = typeof metaCampaignAlerts.$inferInsert;


// ============ Instagram Accounts Management ============

/**
 * Tabela para armazenar contas Instagram (Feminnita + Influencers)
 * Cada influencer pode ter múltiplas contas, assim como a Feminnita
 */
export const instagramAccounts = mysqlTable("instagram_accounts", {
  id: int("id").autoincrement().primaryKey(),
  
  // Identificação
  accountType: mysqlEnum("accountType", ["feminnita", "influencer"]).notNull(),
  influencerId: int("influencerId"), // NULL para Feminnita
  
  // Dados da conta Instagram
  instagramId: varchar("instagramId", { length: 255 }).notNull().unique(), // ID numérico do Instagram
  username: varchar("username", { length: 255 }).notNull(), // @username
  displayName: varchar("displayName", { length: 255 }).notNull(),
  profilePictureUrl: text("profilePictureUrl"),
  biography: text("biography"),
  
  // Tokens de acesso
  accessToken: text("accessToken").notNull(), // Token de acesso do Instagram Graph API
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshToken: text("refreshToken"), // Para renovar token
  
  // Informações da conta
  followers: int("followers").default(0),
  following: int("following").default(0),
  postsCount: int("postsCount").default(0),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  isVerified: boolean("isVerified").default(false).notNull(),
  lastTokenRefresh: timestamp("lastTokenRefresh"),
  lastMetricsSync: timestamp("lastMetricsSync"),
  
  // Auditoria
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});

export type InstagramAccount = typeof instagramAccounts.$inferSelect;
export type InsertInstagramAccount = typeof instagramAccounts.$inferInsert;

/**
 * Tabela para rastrear publicações feitas em cada conta Instagram
 */
export const igPostPublications = mysqlTable("ig_post_publications", {
  id: int("id").autoincrement().primaryKey(),
  
  // Relações
  postId: int("postId").notNull(),
  instagramAccountId: int("instagramAccountId").notNull(),
  
  // Dados da publicação
  instagramPostId: varchar("instagramPostId", { length: 255 }), // ID retornado pelo Instagram
  caption: text("caption"),
  mediaUrls: text("mediaUrls"), // JSON array de URLs
  
  // Status
  status: mysqlEnum("status", ["pending", "published", "failed", "scheduled"]).notNull().default("pending"),
  publishedAt: timestamp("publishedAt"),
  scheduledFor: timestamp("scheduledFor"),
  
  // Métricas
  likes: int("likes").default(0),
  comments: int("comments").default(0),
  shares: int("shares").default(0),
  saves: int("saves").default(0),
  impressions: int("impressions").default(0),
  reach: int("reach").default(0),
  
  // Erro (se houver)
  errorMessage: text("errorMessage"),
  errorCode: varchar("errorCode", { length: 255 }),
  
  // Auditoria
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});

export type IgPostPublication = typeof igPostPublications.$inferSelect;
export type InsertIgPostPublication = typeof igPostPublications.$inferInsert;

/**
 * Tabela para armazenar credenciais de aplicação Instagram (para renovação de tokens)
 */
export const instagramAppCredentials = mysqlTable("instagram_app_credentials", {
  id: int("id").autoincrement().primaryKey(),
  
  appId: varchar("appId", { length: 255 }).notNull(),
  appSecret: text("appSecret").notNull(),
  businessAccountId: varchar("businessAccountId", { length: 255 }).notNull(),
  
  // Credenciais do usuário que autorizou
  userId: int("userId").notNull(),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});

export type InstagramAppCredentials = typeof instagramAppCredentials.$inferSelect;
export type InsertInstagramAppCredentials = typeof instagramAppCredentials.$inferInsert;


// ============================================
// TABELAS PARA IA DE ATENDIMENTO WHATSAPP
// ============================================

// Base de conhecimento com informações de produtos
export const knowledgeBase = mysqlTable("knowledge_base", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  
  // Tipo de conteúdo
  contentType: mysqlEnum("contentType", [
    "product",
    "faq",
    "policy",
    "promotion",
    "general_info"
  ]).notNull(),
  
  // Título e descrição
  title: varchar("title", { length: 255 }).notNull(),
  description: longtext("description"),
  
  // Link do produto/página
  url: text("url"),
  
  // Categoria
  category: varchar("category", { length: 100 }),
  
  // Tags para busca
  tags: json("tags").$type<string[]>(),
  
  // Conteúdo embedido para busca semântica
  embedding: longtext("embedding"), // JSON com vetor de embedding
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updatedAt").default(sql`CURRENT_TIMESTAMP`).$onUpdateFn(()=>new Date()),
});

export type KnowledgeBase = typeof knowledgeBase.$inferSelect;
export type InsertKnowledgeBase = typeof knowledgeBase.$inferInsert;

// Dados de treinamento para a IA
export const aiTrainingData = mysqlTable("ai_training_data", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  
  // Exemplos de entrada e saída esperada
  userMessage: longtext("userMessage").notNull(),
  expectedResponse: longtext("expectedResponse").notNull(),
  
  // Categoria da pergunta
  category: varchar("category", { length: 100 }),
  
  // Se deve encaminhar para humano
  shouldEscalate: boolean("shouldEscalate").default(false).notNull(),
  
  // Motivo da escalação
  escalationReason: varchar("escalationReason", { length: 255 }),
  
  // Produtos relacionados
  relatedProductIds: json("relatedProductIds").$type<number[]>(),
  
  // Feedback sobre qualidade
  quality: mysqlEnum("quality", ["excellent", "good", "poor"]),
  
  // Status
  isActive: boolean("isActive").default(true).notNull(),
  
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updatedAt").default(sql`CURRENT_TIMESTAMP`).$onUpdateFn(()=>new Date()),
});

export type AITrainingData = typeof aiTrainingData.$inferSelect;
export type InsertAITrainingData = typeof aiTrainingData.$inferInsert;

// Histórico de conversas
export const conversationHistory = mysqlTable("conversation_history", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  
  // Identificador do cliente no WhatsApp
  whatsappPhoneNumber: varchar("whatsappPhoneNumber", { length: 20 }).notNull(),
  whatsappContactName: varchar("whatsappContactName", { length: 255 }),
  
  // Mensagem do usuário
  userMessage: longtext("userMessage").notNull(),
  
  // Resposta da IA
  aiResponse: longtext("aiResponse"),
  
  // Confiança da resposta (0-1)
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  
  // Produtos mencionados
  mentionedProducts: json("mentionedProducts").$type<{
    id: number;
    name: string;
    url: string;
  }[]>(),
  
  // Se foi escalado para humano
  escalated: boolean("escalated").default(false).notNull(),
  escalatedAt: datetime("escalatedAt"),
  escalatedReason: varchar("escalatedReason", { length: 255 }),
  
  // Feedback do usuário
  userFeedback: mysqlEnum("userFeedback", ["helpful", "not_helpful", "escalated"]),
  
  // Status da conversa
  status: mysqlEnum("status", [
    "open",
    "closed",
    "escalated",
    "resolved"
  ]).default("open").notNull(),
  
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updatedAt").default(sql`CURRENT_TIMESTAMP`).$onUpdateFn(()=>new Date()),
});

export type ConversationHistory = typeof conversationHistory.$inferSelect;
export type InsertConversationHistory = typeof conversationHistory.$inferInsert;

// Fila de escalação para atendimento humano
export const escalationQueue = mysqlTable("escalation_queue", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  
  // Referência à conversa
  conversationHistoryId: int("conversationHistoryId").notNull(),
  
  // Cliente
  whatsappPhoneNumber: varchar("whatsappPhoneNumber", { length: 20 }).notNull(),
  whatsappContactName: varchar("whatsappContactName", { length: 255 }),
  
  // Motivo da escalação
  reason: varchar("reason", { length: 255 }).notNull(),
  priority: mysqlEnum("priority", ["low", "medium", "high", "urgent"]).default("medium").notNull(),
  
  // Atendente atribuído
  assignedToAgent: varchar("assignedToAgent", { length: 255 }),
  
  // Status
  status: mysqlEnum("status", [
    "waiting",
    "in_progress",
    "resolved",
    "closed"
  ]).default("waiting").notNull(),
  
  // Timestamps
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
  startedAt: datetime("startedAt"),
  resolvedAt: datetime("resolvedAt"),
  updatedAt: datetime("updatedAt").default(sql`CURRENT_TIMESTAMP`).$onUpdateFn(()=>new Date()),
});

export type EscalationQueue = typeof escalationQueue.$inferSelect;
export type InsertEscalationQueue = typeof escalationQueue.$inferInsert;

// Configurações de IA por usuário
export const aiSettings = mysqlTable("ai_settings", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull().unique(),
  
  // Comportamento da IA
  systemPrompt: longtext("systemPrompt"),
  temperature: decimal("temperature", { precision: 2, scale: 2 }).default("0.7"),
  maxTokens: int("maxTokens").default(500),
  
  // Configurações de escalação
  escalationKeywords: json("escalationKeywords").$type<string[]>(),
  autoEscalateAfterMessages: int("autoEscalateAfterMessages").default(5),
  
  // Configurações de busca de produtos
  searchResultsLimit: int("searchResultsLimit").default(3),
  minConfidenceScore: decimal("minConfidenceScore", { precision: 3, scale: 2 }).default("0.6"),
  
  // Status
  isEnabled: boolean("isEnabled").default(true).notNull(),
  
  createdAt: datetime("createdAt").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: datetime("updatedAt").default(sql`CURRENT_TIMESTAMP`).$onUpdateFn(()=>new Date()),
});

export type AISettings = typeof aiSettings.$inferSelect;
export type InsertAISettings = typeof aiSettings.$inferInsert;


// ============ Campanhas de Marketing ============

export const campaigns = mysqlTable("campaigns", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  plataforma: mysqlEnum("plataforma", ["instagram", "facebook", "tiktok", "whatsapp", "email"]).notNull(),
  orcamento: decimal("orcamento", { precision: 10, scale: 2 }).notNull(),
  publicoAlvo: text("publico_alvo"),
  descricao: text("descricao"),
  dataInicio: varchar("data_inicio", { length: 20 }),
  dataFim: varchar("data_fim", { length: 20 }),
  status: mysqlEnum("status", ["rascunho", "planejamento", "ativa", "pausada", "finalizada"]).default("rascunho").notNull(),
  impressoes: int("impressoes").default(0),
  cliques: int("cliques").default(0),
  conversoes: int("conversoes").default(0),
  roi: decimal("roi", { precision: 6, scale: 2 }).default("0"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});

export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;


// ============ Automações ============

export const automations = mysqlTable("automations", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", ["post", "mensagem", "email", "whatsapp"]).notNull(),
  plataforma: mysqlEnum("plataforma", ["instagram", "facebook", "tiktok", "whatsapp", "email"]).notNull(),
  conteudo: text("conteudo"),
  agendamento: varchar("agendamento", { length: 255 }),
  status: mysqlEnum("status", ["ativo", "pausado", "agendado"]).default("agendado").notNull(),
  proximaExecucao: timestamp("proxima_execucao"),
  ultimaExecucao: timestamp("ultima_execucao"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});

export type Automation = typeof automations.$inferSelect;
export type InsertAutomation = typeof automations.$inferInsert;


// ============ Fila de Publicação Persistente ============

export const publicationQueueJobs = mysqlTable("publication_queue_jobs", {
  id: int("id").primaryKey().autoincrement(),
  postId: int("postId").notNull(),
  accountId: int("accountId").notNull(),
  retryCount: int("retryCount").default(0).notNull(),
  maxRetries: int("maxRetries").default(5).notNull(),
  lastError: text("lastError"),
  nextRetryTime: timestamp("nextRetryTime"),
  status: mysqlEnum("status", ["ready", "waiting", "processing", "failed", "done"]).default("ready").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});

export type PublicationQueueJob = typeof publicationQueueJobs.$inferSelect;
export type InsertPublicationQueueJob = typeof publicationQueueJobs.$inferInsert;


// ============ Equipe de Marketing com IA ============

export const marketingResearchReports = mysqlTable("marketing_research_reports", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  reportDate: date("report_date").notNull(),
  competitorInsights: json("competitor_insights").$type<{
    competitors: Array<{ name: string; strategy: string; topContent: string; strengths: string }>;
    gaps: string[];
    opportunities: string[];
  }>(),
  trendingHashtags: json("trending_hashtags").$type<string[]>(),
  contentOpportunities: json("content_opportunities").$type<string[]>(),
  audienceInsights: text("audience_insights"),
  weeklyStrategy: text("weekly_strategy"),
  recommendations: json("recommendations").$type<Array<{ priority: "alta" | "media" | "baixa"; action: string; rationale: string }>>(),
  rawAnalysis: text("raw_analysis"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MarketingResearchReport = typeof marketingResearchReports.$inferSelect;
export type InsertMarketingResearchReport = typeof marketingResearchReports.$inferInsert;

export const contentBriefs = mysqlTable("content_briefs", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  influencerId: int("influencer_id"),
  briefType: mysqlEnum("brief_type", ["carousel", "reel", "story", "post", "feed"]).notNull(),
  topic: varchar("topic", { length: 500 }).notNull(),
  targetAudience: text("target_audience"),
  keyMessages: json("key_messages").$type<string[]>(),
  hashtags: json("hashtags").$type<string[]>(),
  callToAction: varchar("call_to_action", { length: 255 }),
  generatedContent: json("generated_content").$type<Record<string, unknown>>(),
  copywriterNotes: text("copywriter_notes"),
  status: mysqlEnum("status", ["pending", "generated", "approved", "published"]).default("pending").notNull(),
  researchReportId: int("research_report_id"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});

export type ContentBrief = typeof contentBriefs.$inferSelect;
export type InsertContentBrief = typeof contentBriefs.$inferInsert;

export const competitorData = mysqlTable("competitor_data", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  competitorName: varchar("competitor_name", { length: 255 }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(),
  contentType: varchar("content_type", { length: 50 }),
  estimatedEngagement: int("estimated_engagement"),
  captionAnalysis: text("caption_analysis"),
  hashtagsUsed: json("hashtags_used").$type<string[]>(),
  postingFrequency: varchar("posting_frequency", { length: 100 }),
  keyStrategies: json("key_strategies").$type<string[]>(),
  detectedAt: timestamp("detected_at").defaultNow().notNull(),
});

export type CompetitorData = typeof competitorData.$inferSelect;
export type InsertCompetitorData = typeof competitorData.$inferInsert;

// ============ Banco de Imagens e Lançamentos ============

export const assetLibrary = mysqlTable("asset_library", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: mysqlEnum("category", ["produto", "lifestyle", "modelo", "colecao", "background", "logo", "outro"]).notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  mimeType: varchar("mime_type", { length: 100 }),
  fileSize: int("file_size"),
  tags: json("tags").$type<string[]>(),
  platform: mysqlEnum("platform", ["instagram", "tiktok", "todos"]).default("todos").notNull(),
  aiAnalysis: text("ai_analysis"),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});

export type AssetLibraryItem = typeof assetLibrary.$inferSelect;
export type InsertAssetLibraryItem = typeof assetLibrary.$inferInsert;

export const productCollections = mysqlTable("product_collections", {
  id: int("id").primaryKey().autoincrement(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  collectionType: mysqlEnum("collection_type", ["produto", "colecao", "campanha", "temporada"]).notNull(),
  season: varchar("season", { length: 100 }),
  launchDate: timestamp("launch_date"),
  status: mysqlEnum("status", ["rascunho", "ativo", "arquivado"]).default("rascunho").notNull(),
  assetIds: json("asset_ids").$type<number[]>(),
  briefsGenerated: boolean("briefs_generated").default(false).notNull(),
  contentPlan: json("content_plan").$type<Record<string, unknown>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});

export type ProductCollection = typeof productCollections.$inferSelect;
export type InsertProductCollection = typeof productCollections.$inferInsert;

// Re-exportar tabelas Bling
export * from "./schema-bling";

// === MÓDULO AFILIADAS ===
export const afiliadas = mysqlTable("afiliadas", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  cidade: varchar("cidade", { length: 100 }),
  estado: varchar("estado", { length: 2 }),
  linkCode: varchar("linkCode", { length: 32 }).notNull().unique(),
  comissaoPercent: varchar("comissaoPercent", { length: 10 }).default("10"),
  totalVendas: int("totalVendas").default(0),
  totalReceita: varchar("totalReceita", { length: 20 }).default("0"),
  status: mysqlEnum("status", ["ativa", "inativa", "pendente"]).default("pendente").notNull(),
  nivel: mysqlEnum("nivel", ["bronze", "prata", "ouro", "diamante"]).default("bronze").notNull(),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});
export type Afiliada = typeof afiliadas.$inferSelect;
export type InsertAfiliada = typeof afiliadas.$inferInsert;

export const afiliadaCliques = mysqlTable("afiliada_cliques", {
  id: int("id").autoincrement().primaryKey(),
  afiliadaId: int("afiliadaId").notNull(),
  origem: varchar("origem", { length: 100 }),
  ip: varchar("ip", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const afiliadaVendas = mysqlTable("afiliada_vendas", {
  id: int("id").autoincrement().primaryKey(),
  afiliadaId: int("afiliadaId").notNull(),
  userId: int("userId").notNull(),
  pedidoId: varchar("pedidoId", { length: 100 }),
  produto: varchar("produto", { length: 255 }),
  valor: varchar("valor", { length: 20 }).notNull(),
  comissaoValor: varchar("comissaoValor", { length: 20 }).notNull(),
  status: mysqlEnum("status", ["pendente", "pago", "cancelado"]).default("pendente").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AfiliadaVenda = typeof afiliadaVendas.$inferSelect;

// === MÓDULO RECUPERAÇÃO DE ABANDONO ===
export const abandonamentoSequencias = mysqlTable("abandonamento_sequencias", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  ativo: boolean("ativo").default(true).notNull(),
  etapa1Horas: int("etapa1Horas").default(1),
  etapa1Mensagem: text("etapa1Mensagem"),
  etapa2Horas: int("etapa2Horas").default(24),
  etapa2Mensagem: text("etapa2Mensagem"),
  etapa3Horas: int("etapa3Horas").default(72),
  etapa3Mensagem: text("etapa3Mensagem"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});
export type AbandonamentoSequencia = typeof abandonamentoSequencias.$inferSelect;

export const abandonamentoLogs = mysqlTable("abandonamento_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sequenciaId: int("sequenciaId").notNull(),
  pedidoId: varchar("pedidoId", { length: 100 }),
  clienteNome: varchar("clienteNome", { length: 255 }),
  clienteWhatsapp: varchar("clienteWhatsapp", { length: 20 }).notNull(),
  etapaAtual: int("etapaAtual").default(0),
  status: mysqlEnum("status", ["ativo", "convertido", "cancelado", "concluido"]).default("ativo").notNull(),
  convertidoEm: timestamp("convertidoEm"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});
export type AbandonamentoLog = typeof abandonamentoLogs.$inferSelect;

// === BRAND BOOK ===
export const brandBook = mysqlTable("brand_book", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  // Identidade Visual
  corPrimaria: varchar("corPrimaria", { length: 7 }).default("#D97706"),
  corSecundaria: varchar("corSecundaria", { length: 7 }).default("#F59E0B"),
  corAcento: varchar("corAcento", { length: 7 }).default("#FDE68A"),
  corTexto: varchar("corTexto", { length: 7 }).default("#1E293B"),
  fontePrimaria: varchar("fontePrimaria", { length: 100 }).default("Inter"),
  fonteSecundaria: varchar("fonteSecundaria", { length: 100 }).default("Playfair Display"),
  // Tom de Voz
  tomInstagram: text("tomInstagram"),
  tomTikTok: text("tomTikTok"),
  tomWhatsApp: text("tomWhatsApp"),
  tomEmail: text("tomEmail"),
  // Hashtags
  hashtagsOficiais: text("hashtagsOficiais"),
  hashtagsProibidas: text("hashtagsProibidas"),
  // Valores
  palavrasChave: text("palavrasChave"),
  palavrasProibidas: text("palavrasProibidas"),
  // Proposta de valor
  propostaValor: text("propostaValor"),
  diferenciais: text("diferenciais"),
  publicoAlvo: text("publicoAlvo"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});
export type BrandBook = typeof brandBook.$inferSelect;
export type InsertBrandBook = typeof brandBook.$inferInsert;

// === DROPS SAZONAIS ===
export const drops = mysqlTable("drops", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  descricao: text("descricao"),
  dataLancamento: timestamp("dataLancamento").notNull(),
  status: mysqlEnum("status", ["rascunho", "agendado", "ativo", "encerrado"]).default("rascunho").notNull(),
  categoria: mysqlEnum("categoria", ["inverno", "verao", "natal", "dia_das_maes", "dia_dos_namorados", "black_friday", "lancamento", "outro"]).default("lancamento").notNull(),
  metaVendas: int("metaVendas"),
  vendasRealizadas: int("vendasRealizadas").default(0),
  preListaWhatsapp: int("preListaWhatsapp").default(0),
  imagemUrl: text("imagemUrl"),
  precoMinimo: varchar("precoMinimo", { length: 20 }),
  precoMaximo: varchar("precoMaximo", { length: 20 }),
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});
export type Drop = typeof drops.$inferSelect;
export type InsertDrop = typeof drops.$inferInsert;

// === UGC COLLECTOR ===
export const ugcSubmissions = mysqlTable("ugc_submissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  plataforma: mysqlEnum("plataforma", ["instagram", "tiktok", "whatsapp", "twitter", "outro"]).notNull(),
  autorHandle: varchar("autorHandle", { length: 255 }),
  autorNome: varchar("autorNome", { length: 255 }),
  conteudoUrl: text("conteudoUrl"),
  conteudoTexto: text("conteudoTexto"),
  thumbnail: text("thumbnail"),
  tipo: mysqlEnum("tipo", ["foto", "video", "story", "reels", "depoimento"]).default("foto").notNull(),
  status: mysqlEnum("status", ["pendente", "aprovado", "rejeitado", "republicado"]).default("pendente").notNull(),
  autorizacaoObtida: boolean("autorizacaoObtida").default(false).notNull(),
  tags: text("tags"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});
export type UGCSubmission = typeof ugcSubmissions.$inferSelect;
export type InsertUGCSubmission = typeof ugcSubmissions.$inferInsert;

// === TIKTOK LIVE COMMERCE ===
export const tiktokLives = mysqlTable("tiktok_lives", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  dataAgendada: timestamp("dataAgendada"),
  duracao: int("duracao").default(120), // minutos
  status: mysqlEnum("status", ["rascunho", "agendada", "ao_vivo", "encerrada"]).default("rascunho").notNull(),
  roteiro: text("roteiro"),
  produtosDestaque: text("produtosDestaque"),
  metaViewers: int("metaViewers"),
  metaVendas: int("metaVendas"),
  viewersReais: int("viewersReais").default(0),
  vendasReais: int("vendasReais").default(0),
  receitaGerada: varchar("receitaGerada", { length: 20 }).default("0"),
  tiktokLiveUrl: text("tiktokLiveUrl"),
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});
export type TiktokLive = typeof tiktokLives.$inferSelect;
export type InsertTiktokLive = typeof tiktokLives.$inferInsert;

// === SISTEMA DE CUPONS E PROMOÇÕES ===
export const cupons = mysqlTable("cupons", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  codigo: varchar("codigo", { length: 50 }).notNull(),
  desconto: varchar("desconto", { length: 50 }).notNull(), // ex: "20%", "R$ 40", "Frete Grátis"
  tipo: mysqlEnum("tipo", ["percentual", "valor_fixo", "frete_gratis"]).notNull().default("percentual"),
  persona: varchar("persona", { length: 100 }), // Carol, Renata, etc
  campanha: varchar("campanha", { length: 200 }),
  usos: int("usos").notNull().default(0),
  maxUsos: int("maxUsos"),
  ativo: boolean("ativo").notNull().default(true),
  dataExpiracao: varchar("dataExpiracao", { length: 20 }), // ISO date string
  observacoes: text("observacoes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});
export type Cupom = typeof cupons.$inferSelect;
export type InsertCupom = typeof cupons.$inferInsert;

// === TEMPLATES REUTILIZÁVEIS ===
export const contentTemplates = mysqlTable("content_templates", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: mysqlEnum("tipo", ["story", "reels", "tiktok", "ads", "email", "whatsapp"]).notNull(),
  descricao: varchar("descricao", { length: 500 }),
  conteudo: text("conteudo").notNull(),
  favorito: boolean("favorito").notNull().default(false),
  usos: int("usos").notNull().default(0),
  tags: varchar("tags", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});
export type ContentTemplate = typeof contentTemplates.$inferSelect;
export type InsertContentTemplate = typeof contentTemplates.$inferInsert;

// === HISTÓRICO DE DESIGNS CANVA ===
export const designHistory = mysqlTable("design_history", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  designId: varchar("designId", { length: 255 }).notNull(),
  designName: varchar("designName", { length: 500 }).notNull(),
  designType: varchar("designType", { length: 100 }),
  thumbnailUrl: text("thumbnailUrl"),
  editUrl: text("editUrl"),
  exportUrl: text("exportUrl"),
  status: mysqlEnum("status", ["draft", "exported", "published"]).notNull().default("draft"),
  influencerId: int("influencerId"),
  campaignId: int("campaignId"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(()=>new Date()).notNull(),
});
export type DesignHistory = typeof designHistory.$inferSelect;
export type InsertDesignHistory = typeof designHistory.$inferInsert;

// === GESTOR DE TRÁFEGO — AVALIAÇÕES META ADS ===
export const adsEvaluations = mysqlTable("ads_evaluations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  adAccountId: varchar("adAccountId", { length: 100 }),
  status: mysqlEnum("status", ["pending", "running", "done", "error"]).notNull().default("pending"),
  rawMetrics: text("rawMetrics"),        // JSON string — dados brutos da Meta API
  analysis: text("analysis"),            // Texto de análise do LLM
  recommendations: text("recommendations"), // JSON string — recomendações estruturadas
  creativeBriefs: text("creativeBriefs"),   // JSON string — briefs de criativo para arte
  summary: varchar("summary", { length: 500 }),
  errorMessage: varchar("errorMessage", { length: 500 }),
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AdsEvaluation = typeof adsEvaluations.$inferSelect;
export type InsertAdsEvaluation = typeof adsEvaluations.$inferInsert;

export const adsEvaluationMessages = mysqlTable("ads_evaluation_messages", {
  id: int("id").autoincrement().primaryKey(),
  evaluationId: int("evaluationId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AdsEvaluationMessage = typeof adsEvaluationMessages.$inferSelect;

// === ML ADS — AVALIAÇÕES MERCADO LIVRE ===
export const mlAdsEvaluations = mysqlTable("ml_ads_evaluations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  account: mysqlEnum("account", ["feminnita", "fnt"]).notNull().default("feminnita"),
  status: mysqlEnum("status", ["pending", "running", "done", "error"]).notNull().default("pending"),
  rawMetrics: text("rawMetrics"),
  analysis: text("analysis"),
  recommendations: text("recommendations"),
  summary: varchar("summary", { length: 500 }),
  errorMessage: varchar("errorMessage", { length: 500 }),
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MlAdsEvaluation = typeof mlAdsEvaluations.$inferSelect;
export type InsertMlAdsEvaluation = typeof mlAdsEvaluations.$inferInsert;

export const mlAdsEvaluationMessages = mysqlTable("ml_ads_evaluation_messages", {
  id: int("id").autoincrement().primaryKey(),
  evaluationId: int("evaluationId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type MlAdsEvaluationMessage = typeof mlAdsEvaluationMessages.$inferSelect;

// ─── Blog Feminnita ──────────────────────────────────────────────────────────

export const blogPosts = mysqlTable("blog_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  category: varchar("category", { length: 100 }),
  tags: text("tags"),              // JSON array
  status: mysqlEnum("status", ["draft", "review", "published", "scheduled"]).default("draft").notNull(),
  seoTitle: varchar("seoTitle", { length: 255 }),
  seoDescription: text("seoDescription"),
  coverImageUrl: text("coverImageUrl"),
  publishedAt: timestamp("publishedAt"),
  scheduledFor: timestamp("scheduledFor"),
  generatedByAI: boolean("generatedByAI").default(false).notNull(),
  aiPrompt: text("aiPrompt"),
  wordpressPostId: varchar("wordpressPostId", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;

// ─── Especialista em Tráfego — Conversas, Mensagens, Ações, Briefings ────────

export const trafficConversations = mysqlTable("traffic_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});
export type TrafficConversation = typeof trafficConversations.$inferSelect;
export type InsertTrafficConversation = typeof trafficConversations.$inferInsert;

export const trafficMessages = mysqlTable("traffic_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TrafficMessage = typeof trafficMessages.$inferSelect;
export type InsertTrafficMessage = typeof trafficMessages.$inferInsert;

export const trafficActions = mysqlTable("traffic_actions", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  actionType: varchar("actionType", { length: 100 }).notNull(),
  payload: text("payload"),   // JSON com os detalhes completos da ação
  status: mysqlEnum("status", ["pending", "approved", "rejected", "executed"]).notNull().default("pending"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});
export type TrafficAction = typeof trafficActions.$inferSelect;
export type InsertTrafficAction = typeof trafficActions.$inferInsert;

export const trafficDailyBriefings = mysqlTable("traffic_daily_briefings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: timestamp("date").notNull(),           // meia-noite do dia
  data: text("data").notNull(),                // JSON completo do briefing
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});
export type TrafficDailyBriefing = typeof trafficDailyBriefings.$inferSelect;
export type InsertTrafficDailyBriefing = typeof trafficDailyBriefings.$inferInsert;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// ─── Chat com Especialistas IA (Sofia, Beatriz, Clara, Mariana) ──────────────

export const specialistConversations = mysqlTable("specialist_conversations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agentName: varchar("agentName", { length: 50 }).notNull(), // "sofia","beatriz","clara","mariana"
  title: varchar("title", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});
export type SpecialistConversation = typeof specialistConversations.$inferSelect;

export const specialistMessages = mysqlTable("specialist_messages", {
  id: int("id").autoincrement().primaryKey(),
  conversationId: int("conversationId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type SpecialistMessage = typeof specialistMessages.$inferSelect;

// ─── Ações Propostas pelos Agentes (fluxo de confirmação) ────────────────────

export const agentActions = mysqlTable("agent_actions", {
  id: int("id").autoincrement().primaryKey(),
  agentName: varchar("agentName", { length: 50 }).notNull(), // "fernanda", "sofia", etc
  date: varchar("date", { length: 10 }).notNull(),           // "2026-04-12"
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description").notNull(),
  actionType: varchar("actionType", { length: 50 }).notNull(), // "post", "campaign", "reativacao", etc
  priority: mysqlEnum("priority", ["alta", "media", "baixa"]).notNull().default("media"),
  estimatedImpact: text("estimatedImpact"),
  status: mysqlEnum("status", ["pending", "approved", "rejected", "executing", "done"]).notNull().default("pending"),
  userNote: text("userNote"),                                // nota do usuário ao aprovar/rejeitar
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});
export type AgentAction = typeof agentActions.$inferSelect;
export type InsertAgentAction = typeof agentActions.$inferInsert;

// ─── Memória dos Agentes ──────────────────────────────────────────────────────

export const agentMemory = mysqlTable("agent_memory", {
  id: int("id").autoincrement().primaryKey(),
  agentName: varchar("agentName", { length: 50 }).notNull(), // "fernanda", "market_research", etc
  memoryType: mysqlEnum("memoryType", ["daily_analysis", "weekly_summary", "monthly_report", "business_goals", "learning", "daily_content"]).notNull(),
  period: varchar("period", { length: 20 }).notNull(), // "2026-04-12", "2026-W15", "2026-04"
  content: text("content").notNull(), // JSON stringified
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AgentMemory = typeof agentMemory.$inferSelect;

// ─── Disparo em Massa WhatsApp ────────────────────────────────────────────────

export const whatsappBlasts = mysqlTable("whatsapp_blasts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  delaySeconds: int("delaySeconds").notNull().default(8),
  status: mysqlEnum("status", ["draft", "running", "done", "cancelled", "error"]).notNull().default("draft"),
  totalContacts: int("totalContacts").notNull().default(0),
  sentCount: int("sentCount").notNull().default(0),
  failedCount: int("failedCount").notNull().default(0),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});
export type WhatsappBlast = typeof whatsappBlasts.$inferSelect;
export type InsertWhatsappBlast = typeof whatsappBlasts.$inferInsert;

export const whatsappBlastContacts = mysqlTable("whatsapp_blast_contacts", {
  id: int("id").autoincrement().primaryKey(),
  blastId: int("blastId").notNull(),
  phoneNumber: varchar("phoneNumber", { length: 30 }).notNull(),
  name: varchar("name", { length: 100 }),
  status: mysqlEnum("status", ["pending", "sent", "failed"]).notNull().default("pending"),
  sentAt: timestamp("sentAt"),
  error: varchar("error", { length: 255 }),
});
export type WhatsappBlastContact = typeof whatsappBlastContacts.$inferSelect;

// === SHOPEE ADS — AVALIAÇÕES ===
export const shopeeAdsEvaluations = mysqlTable("shopee_ads_evaluations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  account: mysqlEnum("account", ["feminnita", "fnt"]).notNull().default("feminnita"),
  shopId: varchar("shopId", { length: 50 }),
  status: mysqlEnum("status", ["pending", "running", "done", "error"]).notNull().default("pending"),
  rawMetrics: text("rawMetrics"),
  analysis: text("analysis"),
  recommendations: text("recommendations"),
  summary: varchar("summary", { length: 500 }),
  errorMessage: varchar("errorMessage", { length: 500 }),
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ShopeeAdsEvaluation = typeof shopeeAdsEvaluations.$inferSelect;
export type InsertShopeeAdsEvaluation = typeof shopeeAdsEvaluations.$inferInsert;

export const shopeeAdsEvaluationMessages = mysqlTable("shopee_ads_evaluation_messages", {
  id: int("id").autoincrement().primaryKey(),
  evaluationId: int("evaluationId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type ShopeeAdsEvaluationMessage = typeof shopeeAdsEvaluationMessages.$inferSelect;
export type InsertWhatsappBlastContact = typeof whatsappBlastContacts.$inferInsert;

// === TIKTOK SHOP — AVALIAÇÕES ===
export const tiktokShopEvaluations = mysqlTable("tiktok_shop_evaluations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  shopId: varchar("shopId", { length: 255 }),
  status: mysqlEnum("status", ["pending", "running", "done", "error"]).notNull().default("pending"),
  rawMetrics: text("rawMetrics"),
  analysis: text("analysis"),
  recommendations: text("recommendations"),
  summary: varchar("summary", { length: 500 }),
  errorMessage: varchar("errorMessage", { length: 500 }),
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TiktokShopEvaluation = typeof tiktokShopEvaluations.$inferSelect;
export type InsertTiktokShopEvaluation = typeof tiktokShopEvaluations.$inferInsert;

export const tiktokShopEvaluationMessages = mysqlTable("tiktok_shop_evaluation_messages", {
  id: int("id").autoincrement().primaryKey(),
  evaluationId: int("evaluationId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TiktokShopEvaluationMessage = typeof tiktokShopEvaluationMessages.$inferSelect;

// === AMAZON — AVALIAÇÕES ===
export const amazonEvaluations = mysqlTable("amazon_evaluations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  account: mysqlEnum("account", ["feminnita", "fnt"]).notNull().default("feminnita"),
  sellerId: varchar("sellerId", { length: 50 }),
  status: mysqlEnum("status", ["pending", "running", "done", "error"]).notNull().default("pending"),
  rawMetrics: text("rawMetrics"),
  analysis: text("analysis"),
  recommendations: text("recommendations"),
  summary: varchar("summary", { length: 500 }),
  errorMessage: varchar("errorMessage", { length: 500 }),
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AmazonEvaluation = typeof amazonEvaluations.$inferSelect;

export const amazonEvaluationMessages = mysqlTable("amazon_evaluation_messages", {
  id: int("id").autoincrement().primaryKey(),
  evaluationId: int("evaluationId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type AmazonEvaluationMessage = typeof amazonEvaluationMessages.$inferSelect;

// ─── Comentários Instagram + Respostas Automáticas ───────────────────────────

export const instagramCommentReplies = mysqlTable("instagram_comment_replies", {
  id: int("id").autoincrement().primaryKey(),
  commentId: varchar("commentId", { length: 100 }).notNull().unique(),
  postId: varchar("postId", { length: 100 }),
  authorName: varchar("authorName", { length: 200 }),
  authorId: varchar("authorId", { length: 100 }),
  commentText: text("commentText").notNull(),
  category: varchar("category", { length: 50 }), // question|compliment|complaint|spam|other
  replyText: text("replyText"),
  status: mysqlEnum("status", ["pending", "auto_replied", "queued_review", "ignored", "rejected"]).notNull().default("pending"),
  errorMessage: varchar("errorMessage", { length: 500 }),
  repliedAt: timestamp("repliedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});
export type InstagramCommentReply = typeof instagramCommentReplies.$inferSelect;

// === AD CREATIVES — PIPELINE FERNANDA: BRIEF → GERAÇÃO → APROVAÇÃO → META ===

export const adCreatives = mysqlTable("ad_creatives", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  briefTitle: varchar("briefTitle", { length: 200 }).notNull(),
  briefDescription: text("briefDescription").notNull(),
  campaignType: varchar("campaignType", { length: 100 }),
  targetAudience: varchar("targetAudience", { length: 200 }),
  product: varchar("product", { length: 200 }),
  colorPalette: varchar("colorPalette", { length: 200 }),
  textOverlay: varchar("textOverlay", { length: 300 }),
  driveReferenceFolder: varchar("driveReferenceFolder", { length: 100 }),
  driveReferenceFileId: varchar("driveReferenceFileId", { length: 100 }),
  imageBase64: longtext("imageBase64"),
  imageUrl: text("imageUrl"),
  imageHash: varchar("imageHash", { length: 100 }),
  generatedHeadline: varchar("generatedHeadline", { length: 200 }),
  generatedBody: text("generatedBody"),
  canvaCopy: json("canva_copy").$type<{
    titulo: string;
    preco: string;
    subtitulo: string;
    cta: string;
    rodape: string;
  }>(),
  status: mysqlEnum("status", ["pending_generation","generated","pending_approval","approved","rejected","uploading","executed","failed"]).notNull().default("pending_generation"),
  rejectionReason: text("rejectionReason"),
  metaAdId: varchar("metaAdId", { length: 100 }),
  campaignId: varchar("campaignId", { length: 100 }),
  adSetId: varchar("adSetId", { length: 100 }),
  errorMessage: varchar("errorMessage", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});
export type AdCreative = typeof adCreatives.$inferSelect;

// === TIKTOK TEAM — AGENTES ESPECIALIZADOS ===
export const tiktokTeamEvaluations = mysqlTable("tiktok_team_evaluations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  account: mysqlEnum("account", ["feminnita", "fnt"]).notNull().default("feminnita"),
  agentType: mysqlEnum("agentType", ["luna", "maya", "zara", "nina", "marcela"]).notNull(),
  status: mysqlEnum("status", ["pending", "running", "done", "error"]).notNull().default("pending"),
  analysis: text("analysis"),
  recommendations: text("recommendations"),
  creativeBriefs: text("creativeBriefs"),
  summary: varchar("summary", { length: 500 }),
  errorMessage: varchar("errorMessage", { length: 500 }),
  triggeredAt: timestamp("triggeredAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TiktokTeamEvaluation = typeof tiktokTeamEvaluations.$inferSelect;
export type InsertTiktokTeamEvaluation = typeof tiktokTeamEvaluations.$inferInsert;

export const tiktokTeamMessages = mysqlTable("tiktok_team_messages", {
  id: int("id").autoincrement().primaryKey(),
  evaluationId: int("evaluationId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type TiktokTeamMessage = typeof tiktokTeamMessages.$inferSelect;

// === TIKTOK VÍDEOS — BIBLIOTECA ===
export const tiktokVideos = mysqlTable("tiktok_videos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 300 }).notNull(),
  description: text("description"),
  source: mysqlEnum("source", ["uploaded", "generated"]).notNull().default("uploaded"),
  filePath: varchar("filePath", { length: 500 }),
  thumbnailPath: varchar("thumbnailPath", { length: 500 }),
  fileSize: int("fileSize"),
  durationSeconds: int("durationSeconds"),
  status: mysqlEnum("status", ["draft", "ready", "scheduled", "published", "error"]).notNull().default("draft"),
  tags: varchar("tags", { length: 500 }),
  scheduledAt: timestamp("scheduledAt"),
  publishedAt: timestamp("publishedAt"),
  tiktokPostId: varchar("tiktokPostId", { length: 200 }),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});
export type TiktokVideo = typeof tiktokVideos.$inferSelect;
export type InsertTiktokVideo = typeof tiktokVideos.$inferInsert;
export type InsertAdCreative = typeof adCreatives.$inferInsert;

// === TIKTOK CONNECTED ACCOUNTS — OAuth Login Kit ===
export const tiktokConnectedAccounts = mysqlTable("tiktok_connected_accounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  tiktokOpenId: varchar("tiktokOpenId", { length: 100 }).notNull(),
  displayName: varchar("displayName", { length: 200 }),
  avatarUrl: varchar("avatarUrl", { length: 500 }),
  accountType: mysqlEnum("accountType", ["brand", "influencer"]).notNull().default("brand"),
  label: varchar("label", { length: 100 }),
  accessToken: text("accessToken").notNull(),
  refreshToken: text("refreshToken"),
  expiresAt: timestamp("expiresAt"),
  scope: varchar("scope", { length: 500 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().$onUpdateFn(() => new Date()).notNull(),
});
export type TiktokConnectedAccount = typeof tiktokConnectedAccounts.$inferSelect;
export type InsertTiktokConnectedAccount = typeof tiktokConnectedAccounts.$inferInsert;

// ─── Especialistas por plataforma ─────────────────────────────────────────────

export const specialistPlatformEvaluations = mysqlTable("specialist_platform_evaluations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  specialistType: mysqlEnum("specialistType", [
    "shopee_eds",
    "shopee_promo",
    "ml_eds",
    "shopee_live",
    "instagram_live",
    "tiktok_live",
  ]).notNull(),
  account: mysqlEnum("account", ["feminnita", "fnt"]).notNull().default("feminnita"),
  status: mysqlEnum("status", ["pending", "running", "done", "error"]).notNull().default("pending"),
  rawMetrics: text("rawMetrics"),
  analysis: text("analysis"),
  recommendations: text("recommendations"),
  summary: text("summary"),
  errorMessage: varchar("errorMessage", { length: 500 }),
  creativeBriefs: text("creativeBriefs"),
  triggeredAt: timestamp("triggeredAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const specialistPlatformMessages = mysqlTable("specialist_platform_messages", {
  id: int("id").autoincrement().primaryKey(),
  evaluationId: int("evaluationId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const pushSubscriptions = mysqlTable("push_subscriptions", {
  id:        int("id").autoincrement().primaryKey(),
  userId:    int("userId").notNull(),
  endpoint:  text("endpoint").notNull(),
  p256dh:    text("p256dh").notNull(),
  auth:      varchar("auth", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
});

export const agentTasks = mysqlTable("agent_tasks", {
  id:          int("id").autoincrement().primaryKey(),
  userId:      int("userId").notNull(),
  agentName:   varchar("agentName", { length: 50 }).notNull(),
  message:     text("message").notNull(),
  status:      mysqlEnum("status", ["pending", "processing", "done", "error"]).notNull().default("pending"),
  result:      text("result"),
  startedAt:   timestamp("startedAt"),
  finishedAt:  timestamp("finishedAt"),
  createdAt:   timestamp("createdAt").defaultNow(),
});

// ─── Mensagens Diretas (DMs) entre membros da equipe ─────────────────────────

export const directMessages = mysqlTable("direct_messages", {
  id:         int("id").autoincrement().primaryKey(),
  fromUserId: int("fromUserId").notNull(),
  toUserId:   int("toUserId").notNull(),
  fromName:   varchar("fromName", { length: 100 }).notNull(),
  text:       text("text").notNull(),
  createdAt:  timestamp("createdAt").defaultNow(),
});

export type DirectMessage = typeof directMessages.$inferSelect;
