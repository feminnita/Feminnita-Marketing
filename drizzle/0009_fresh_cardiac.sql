CREATE TABLE `influencer_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`influencerId` int NOT NULL,
	`email` varchar(320),
	`instagram` varchar(255),
	`tiktok` varchar(255),
	`facebook` varchar(255),
	`whatsapp` varchar(20),
	`youtube` varchar(255),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `influencer_accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `influencer_accounts` ADD CONSTRAINT `influencer_accounts_influencerId_influencers_id_fk` FOREIGN KEY (`influencerId`) REFERENCES `influencers`(`id`) ON DELETE no action ON UPDATE no action;