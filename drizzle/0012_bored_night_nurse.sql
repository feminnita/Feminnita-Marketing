CREATE TABLE `ig_post_publications` (
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
	CONSTRAINT `ig_post_publications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
DROP TABLE `instagram_post_publications`;--> statement-breakpoint
ALTER TABLE `ig_post_publications` ADD CONSTRAINT `ig_post_publications_postId_influencer_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `influencer_posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ig_post_publications` ADD CONSTRAINT `ig_post_publications_instagramAccountId_instagram_accounts_id_fk` FOREIGN KEY (`instagramAccountId`) REFERENCES `instagram_accounts`(`id`) ON DELETE no action ON UPDATE no action;