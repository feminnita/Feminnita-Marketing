CREATE TABLE `ad_creatives` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`briefTitle` varchar(200) NOT NULL,
	`briefDescription` text NOT NULL,
	`campaignType` varchar(100),
	`targetAudience` varchar(200),
	`product` varchar(200),
	`colorPalette` varchar(200),
	`textOverlay` varchar(300),
	`driveReferenceFolder` varchar(100),
	`driveReferenceFileId` varchar(100),
	`imageBase64` longtext,
	`imageUrl` text,
	`imageHash` varchar(100),
	`generatedHeadline` varchar(200),
	`generatedBody` text,
	`canva_copy` json,
	`status` enum('pending_generation','generated','pending_approval','approved','rejected','uploading','executed','failed') NOT NULL DEFAULT 'pending_generation',
	`rejectionReason` text,
	`metaAdId` varchar(100),
	`campaignId` varchar(100),
	`adSetId` varchar(100),
	`errorMessage` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ad_creatives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentName` varchar(50) NOT NULL,
	`date` varchar(10) NOT NULL,
	`title` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`actionType` varchar(50) NOT NULL,
	`priority` enum('alta','media','baixa') NOT NULL DEFAULT 'media',
	`estimatedImpact` text,
	`status` enum('pending','approved','rejected','executing','done') NOT NULL DEFAULT 'pending',
	`userNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `agent_memory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentName` varchar(50) NOT NULL,
	`memoryType` enum('daily_analysis','weekly_summary','monthly_report','business_goals','learning','daily_content') NOT NULL,
	`period` varchar(20) NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `agent_memory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `amazon_evaluation_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`evaluationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `amazon_evaluation_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `amazon_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`account` enum('feminnita','fnt') NOT NULL DEFAULT 'feminnita',
	`sellerId` varchar(50),
	`status` enum('pending','running','done','error') NOT NULL DEFAULT 'pending',
	`rawMetrics` text,
	`analysis` text,
	`recommendations` text,
	`summary` varchar(500),
	`errorMessage` varchar(500),
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `amazon_evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `instagram_comment_replies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commentId` varchar(100) NOT NULL,
	`postId` varchar(100),
	`authorName` varchar(200),
	`authorId` varchar(100),
	`commentText` text NOT NULL,
	`category` varchar(50),
	`replyText` text,
	`status` enum('pending','auto_replied','queued_review','ignored','rejected') NOT NULL DEFAULT 'pending',
	`errorMessage` varchar(500),
	`repliedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `instagram_comment_replies_id` PRIMARY KEY(`id`),
	CONSTRAINT `instagram_comment_replies_commentId_unique` UNIQUE(`commentId`)
);
--> statement-breakpoint
CREATE TABLE `ml_ads_evaluation_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`evaluationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ml_ads_evaluation_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ml_ads_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`account` enum('feminnita','fnt') NOT NULL DEFAULT 'feminnita',
	`status` enum('pending','running','done','error') NOT NULL DEFAULT 'pending',
	`rawMetrics` text,
	`analysis` text,
	`recommendations` text,
	`summary` varchar(500),
	`errorMessage` varchar(500),
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ml_ads_evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shopee_ads_evaluation_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`evaluationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shopee_ads_evaluation_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shopee_ads_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`account` enum('feminnita','fnt') NOT NULL DEFAULT 'feminnita',
	`shopId` varchar(50),
	`status` enum('pending','running','done','error') NOT NULL DEFAULT 'pending',
	`rawMetrics` text,
	`analysis` text,
	`recommendations` text,
	`summary` varchar(500),
	`errorMessage` varchar(500),
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shopee_ads_evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `specialist_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentName` varchar(50) NOT NULL,
	`title` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `specialist_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `specialist_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `specialist_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `specialist_platform_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`specialistType` enum('shopee_eds','shopee_promo','ml_eds','shopee_live','instagram_live','tiktok_live') NOT NULL,
	`account` enum('feminnita','fnt') NOT NULL DEFAULT 'feminnita',
	`status` enum('pending','running','done','error') NOT NULL DEFAULT 'pending',
	`rawMetrics` text,
	`analysis` text,
	`recommendations` text,
	`summary` text,
	`errorMessage` varchar(500),
	`creativeBriefs` text,
	`triggeredAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `specialist_platform_evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `specialist_platform_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`evaluationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `specialist_platform_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tiktok_shop_evaluation_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`evaluationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tiktok_shop_evaluation_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tiktok_shop_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`shopId` varchar(255),
	`status` enum('pending','running','done','error') NOT NULL DEFAULT 'pending',
	`rawMetrics` text,
	`analysis` text,
	`recommendations` text,
	`summary` varchar(500),
	`errorMessage` varchar(500),
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tiktok_shop_evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tiktok_team_evaluations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`account` enum('feminnita','fnt') NOT NULL DEFAULT 'feminnita',
	`agentType` enum('luna','maya','zara','nina','marcela') NOT NULL,
	`status` enum('pending','running','done','error') NOT NULL DEFAULT 'pending',
	`analysis` text,
	`recommendations` text,
	`creativeBriefs` text,
	`summary` varchar(500),
	`errorMessage` varchar(500),
	`triggeredAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tiktok_team_evaluations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tiktok_team_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`evaluationId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tiktok_team_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tiktok_videos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`description` text,
	`source` enum('uploaded','generated') NOT NULL DEFAULT 'uploaded',
	`filePath` varchar(500),
	`thumbnailPath` varchar(500),
	`fileSize` int,
	`durationSeconds` int,
	`status` enum('draft','ready','scheduled','published','error') NOT NULL DEFAULT 'draft',
	`tags` varchar(500),
	`scheduledAt` timestamp,
	`publishedAt` timestamp,
	`tiktokPostId` varchar(200),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tiktok_videos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `traffic_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`actionType` varchar(100) NOT NULL,
	`payload` text,
	`status` enum('pending','approved','rejected','executed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `traffic_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `traffic_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `traffic_conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `traffic_daily_briefings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`data` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `traffic_daily_briefings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `traffic_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `traffic_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_blast_contacts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`blastId` int NOT NULL,
	`phoneNumber` varchar(30) NOT NULL,
	`name` varchar(100),
	`status` enum('pending','sent','failed') NOT NULL DEFAULT 'pending',
	`sentAt` timestamp,
	`error` varchar(255),
	CONSTRAINT `whatsapp_blast_contacts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsapp_blasts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`delaySeconds` int NOT NULL DEFAULT 8,
	`status` enum('draft','running','done','cancelled','error') NOT NULL DEFAULT 'draft',
	`totalContacts` int NOT NULL DEFAULT 0,
	`sentCount` int NOT NULL DEFAULT 0,
	`failedCount` int NOT NULL DEFAULT 0,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsapp_blasts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ads_evaluations` ADD `creativeBriefs` text;