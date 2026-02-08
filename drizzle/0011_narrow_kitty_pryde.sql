CREATE TABLE `instagram_accounts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`accountType` enum('feminnita','influencer') NOT NULL,
	`influencerId` int,
	`instagramId` varchar(255) NOT NULL,
	`username` varchar(255) NOT NULL,
	`displayName` varchar(255) NOT NULL,
	`profilePictureUrl` text,
	`biography` text,
	`accessToken` text NOT NULL,
	`accessTokenExpiresAt` timestamp,
	`refreshToken` text,
	`followers` int DEFAULT 0,
	`following` int DEFAULT 0,
	`postsCount` int DEFAULT 0,
	`isActive` boolean NOT NULL DEFAULT true,
	`isVerified` boolean NOT NULL DEFAULT false,
	`lastTokenRefresh` timestamp,
	`lastMetricsSync` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `instagram_accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `instagram_accounts_instagramId_unique` UNIQUE(`instagramId`)
);
--> statement-breakpoint
CREATE TABLE `instagram_app_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`appId` varchar(255) NOT NULL,
	`appSecret` text NOT NULL,
	`businessAccountId` varchar(255) NOT NULL,
	`userId` int NOT NULL,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `instagram_app_credentials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `instagram_post_publications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`instagramAccountId` int NOT NULL,
	`instagramPostId` varchar(255),
	`caption` text,
	`mediaUrls` text,
	`status` enum('pending','published','failed','scheduled') NOT NULL DEFAULT 'pending',
	`publishedAt` timestamp,
	`scheduledFor` timestamp,
	`likes` int DEFAULT 0,
	`comments` int DEFAULT 0,
	`shares` int DEFAULT 0,
	`saves` int DEFAULT 0,
	`impressions` int DEFAULT 0,
	`reach` int DEFAULT 0,
	`errorMessage` text,
	`errorCode` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `instagram_post_publications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `instagram_accounts` ADD CONSTRAINT `instagram_accounts_influencerId_influencers_id_fk` FOREIGN KEY (`influencerId`) REFERENCES `influencers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instagram_app_credentials` ADD CONSTRAINT `instagram_app_credentials_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instagram_post_publications` ADD CONSTRAINT `instagram_post_publications_postId_influencer_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `influencer_posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `instagram_post_publications` ADD CONSTRAINT `instagram_post_publications_instagramAccountId_instagram_accounts_id_fk` FOREIGN KEY (`instagramAccountId`) REFERENCES `instagram_accounts`(`id`) ON DELETE no action ON UPDATE no action;