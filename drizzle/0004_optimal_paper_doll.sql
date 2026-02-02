CREATE TABLE `influencer_interactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`influencer_id` int NOT NULL,
	`platform` varchar(50),
	`interaction_type` varchar(50),
	`follower_username` varchar(255),
	`content` text,
	`sentiment` varchar(20),
	`response_generated` text,
	`response_sent` boolean DEFAULT false,
	`sent_at` datetime,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `influencer_interactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `influencer_knowledge_base` (
	`id` int AUTO_INCREMENT NOT NULL,
	`influencer_id` int NOT NULL,
	`category` varchar(255),
	`content` longtext,
	`embedding` varchar(2048),
	`source` varchar(255),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `influencer_knowledge_base_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `influencer_performance` (
	`id` int AUTO_INCREMENT NOT NULL,
	`influencer_id` int NOT NULL,
	`date` date NOT NULL,
	`platform` varchar(50),
	`total_followers` int,
	`followers_growth` int,
	`total_engagement` int,
	`engagement_rate` decimal(5,2),
	`total_reach` int,
	`total_impressions` int,
	`top_post` varchar(255),
	`top_post_engagement` int,
	`average_posts_per_day` decimal(4,2),
	`sentiment_score` decimal(3,2),
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `influencer_performance_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `influencer_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`influencer_id` int NOT NULL,
	`platform` varchar(50),
	`post_id` varchar(255),
	`content` longtext,
	`media_urls` json,
	`caption` text,
	`hashtags` json,
	`scheduled_at` datetime,
	`published_at` datetime,
	`status` varchar(50),
	`engagement_metrics` json,
	`ai_generated` boolean DEFAULT true,
	`approved_by` varchar(255),
	`approved_at` datetime,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `influencer_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `influencer_trends` (
	`id` int AUTO_INCREMENT NOT NULL,
	`influencer_id` int NOT NULL,
	`platform` varchar(50),
	`trend_name` varchar(255) NOT NULL,
	`trend_category` varchar(100),
	`relevance_score` decimal(3,2),
	`momentum` varchar(50),
	`estimated_reach` int,
	`recommended_post_type` varchar(50),
	`detected_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`expires_at` datetime,
	CONSTRAINT `influencer_trends_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `influencers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`bio` text,
	`personality` varchar(255),
	`avatar` varchar(512),
	`instagram_handle` varchar(255),
	`tiktok_handle` varchar(255),
	`youtube_handle` varchar(255),
	`blog_url` varchar(512),
	`instagram_access_token` varchar(512),
	`tiktok_access_token` varchar(512),
	`youtube_access_token` varchar(512),
	`is_active` boolean DEFAULT true,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	`updated_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `influencers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `influencer_interactions` ADD CONSTRAINT `influencer_interactions_influencer_id_influencers_id_fk` FOREIGN KEY (`influencer_id`) REFERENCES `influencers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `influencer_knowledge_base` ADD CONSTRAINT `influencer_knowledge_base_influencer_id_influencers_id_fk` FOREIGN KEY (`influencer_id`) REFERENCES `influencers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `influencer_performance` ADD CONSTRAINT `influencer_performance_influencer_id_influencers_id_fk` FOREIGN KEY (`influencer_id`) REFERENCES `influencers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `influencer_posts` ADD CONSTRAINT `influencer_posts_influencer_id_influencers_id_fk` FOREIGN KEY (`influencer_id`) REFERENCES `influencers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `influencer_trends` ADD CONSTRAINT `influencer_trends_influencer_id_influencers_id_fk` FOREIGN KEY (`influencer_id`) REFERENCES `influencers`(`id`) ON DELETE no action ON UPDATE no action;