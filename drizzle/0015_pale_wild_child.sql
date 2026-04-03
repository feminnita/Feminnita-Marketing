ALTER TABLE `ai_settings` DROP FOREIGN KEY `ai_settings_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `ai_training_data` DROP FOREIGN KEY `ai_training_data_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `asset_library` DROP FOREIGN KEY `asset_library_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `automations` DROP FOREIGN KEY `automations_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `campaigns` DROP FOREIGN KEY `campaigns_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `content_briefs` DROP FOREIGN KEY `content_briefs_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `content_briefs` DROP FOREIGN KEY `content_briefs_influencer_id_influencers_id_fk`;
--> statement-breakpoint
ALTER TABLE `content_items` DROP FOREIGN KEY `content_items_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `conversation_history` DROP FOREIGN KEY `conversation_history_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `escalation_queue` DROP FOREIGN KEY `escalation_queue_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `escalation_queue` DROP FOREIGN KEY `escalation_queue_conversationHistoryId_conversation_history_id_fk`;
--> statement-breakpoint
ALTER TABLE `ig_post_publications` DROP FOREIGN KEY `ig_post_publications_postId_influencer_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `ig_post_publications` DROP FOREIGN KEY `ig_post_publications_instagramAccountId_instagram_accounts_id_fk`;
--> statement-breakpoint
ALTER TABLE `influencer_accounts` DROP FOREIGN KEY `influencer_accounts_influencerId_influencers_id_fk`;
--> statement-breakpoint
ALTER TABLE `influencer_interactions` DROP FOREIGN KEY `influencer_interactions_influencer_id_influencers_id_fk`;
--> statement-breakpoint
ALTER TABLE `influencer_knowledge_base` DROP FOREIGN KEY `influencer_knowledge_base_influencer_id_influencers_id_fk`;
--> statement-breakpoint
ALTER TABLE `influencer_performance` DROP FOREIGN KEY `influencer_performance_influencer_id_influencers_id_fk`;
--> statement-breakpoint
ALTER TABLE `influencer_posts` DROP FOREIGN KEY `influencer_posts_influencer_id_influencers_id_fk`;
--> statement-breakpoint
ALTER TABLE `influencer_trends` DROP FOREIGN KEY `influencer_trends_influencer_id_influencers_id_fk`;
--> statement-breakpoint
ALTER TABLE `instagram_accounts` DROP FOREIGN KEY `instagram_accounts_influencerId_influencers_id_fk`;
--> statement-breakpoint
ALTER TABLE `instagram_app_credentials` DROP FOREIGN KEY `instagram_app_credentials_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `knowledge_base` DROP FOREIGN KEY `knowledge_base_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `marketing_research_reports` DROP FOREIGN KEY `marketing_research_reports_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `media_files` DROP FOREIGN KEY `media_files_contentId_content_items_id_fk`;
--> statement-breakpoint
ALTER TABLE `media_files` DROP FOREIGN KEY `media_files_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `post_history` DROP FOREIGN KEY `post_history_scheduledPostId_scheduled_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `post_history` DROP FOREIGN KEY `post_history_contentId_content_items_id_fk`;
--> statement-breakpoint
ALTER TABLE `post_history` DROP FOREIGN KEY `post_history_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `product_collections` DROP FOREIGN KEY `product_collections_userId_users_id_fk`;
--> statement-breakpoint
ALTER TABLE `publication_queue_jobs` DROP FOREIGN KEY `publication_queue_jobs_postId_influencer_posts_id_fk`;
--> statement-breakpoint
ALTER TABLE `scheduled_posts` DROP FOREIGN KEY `scheduled_posts_contentId_content_items_id_fk`;
--> statement-breakpoint
ALTER TABLE `scheduled_posts` DROP FOREIGN KEY `scheduled_posts_userId_users_id_fk`;
