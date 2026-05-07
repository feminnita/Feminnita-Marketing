CREATE TABLE `agent_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentName` varchar(50) NOT NULL,
	`message` text NOT NULL,
	`status` enum('pending','processing','done','error') NOT NULL DEFAULT 'pending',
	`result` text,
	`startedAt` timestamp,
	`finishedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `agent_tasks_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `direct_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fromUserId` int NOT NULL,
	`toUserId` int NOT NULL,
	`fromName` varchar(100) NOT NULL,
	`text` text NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `direct_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketplace_ads_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`platform` varchar(20) NOT NULL,
	`account` varchar(20) NOT NULL,
	`campaignId` varchar(100) NOT NULL,
	`campaignName` text,
	`impressions` int DEFAULT 0,
	`clicks` int DEFAULT 0,
	`ctr` decimal(6,3) DEFAULT '0',
	`spend` decimal(10,2) DEFAULT '0',
	`conversions` int DEFAULT 0,
	`roas` decimal(8,2) DEFAULT '0',
	`acos` decimal(6,2) DEFAULT '0',
	`revenue` decimal(10,2) DEFAULT '0',
	`scrapedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketplace_ads_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` varchar(255) NOT NULL,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tiktok_connected_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`tiktokOpenId` varchar(100) NOT NULL,
	`displayName` varchar(200),
	`avatarUrl` varchar(500),
	`accountType` enum('brand','influencer') NOT NULL DEFAULT 'brand',
	`label` varchar(100),
	`accessToken` text NOT NULL,
	`refreshToken` text,
	`expiresAt` timestamp,
	`scope` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tiktok_connected_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `oauth_tokens` MODIFY COLUMN `plataforma` enum('bling','meta','tiktok','google_drive','google_analytics') NOT NULL;--> statement-breakpoint
ALTER TABLE `agent_actions` ADD `payload` json;--> statement-breakpoint
ALTER TABLE `agent_actions` ADD `executionLog` text;--> statement-breakpoint
ALTER TABLE `agent_actions` ADD `executedAt` timestamp;