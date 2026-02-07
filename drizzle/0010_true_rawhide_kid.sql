CREATE TABLE `meta_campaign_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`campaignId` varchar(255) NOT NULL,
	`campaignName` varchar(255) NOT NULL,
	`alertType` enum('low_roi','high_spend','budget_limit','performance_drop','high_cpc','low_ctr') NOT NULL,
	`severity` enum('info','warning','critical') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`currentValue` varchar(255),
	`threshold` varchar(255),
	`recommendation` text,
	`isRead` boolean NOT NULL DEFAULT false,
	`isResolved` boolean NOT NULL DEFAULT false,
	`resolvedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meta_campaign_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meta_sync_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`syncType` enum('campaigns','metrics','ads','audiences','full') NOT NULL,
	`totalCampaigns` int DEFAULT 0,
	`updatedCampaigns` int DEFAULT 0,
	`failedCampaigns` int DEFAULT 0,
	`status` enum('success','partial','failed') NOT NULL,
	`errorMessage` text,
	`syncDuration` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meta_sync_history_id` PRIMARY KEY(`id`)
);
