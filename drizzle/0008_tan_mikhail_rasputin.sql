CREATE TABLE `content_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`section` varchar(100) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`content` text,
	`hashtags` text,
	`status` enum('draft','scheduled','published','archived') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_files` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int NOT NULL,
	`userId` int NOT NULL,
	`fileName` varchar(255) NOT NULL,
	`fileType` varchar(50) NOT NULL,
	`mimeType` varchar(100) NOT NULL,
	`fileSize` int NOT NULL,
	`s3Key` varchar(500) NOT NULL,
	`s3Url` text NOT NULL,
	`thumbnailUrl` text,
	`duration` int,
	`width` int,
	`height` int,
	`uploadedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_files_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `post_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scheduledPostId` int NOT NULL,
	`contentId` int NOT NULL,
	`userId` int NOT NULL,
	`platform` varchar(50) NOT NULL,
	`postId` varchar(255),
	`postUrl` text,
	`status` enum('success','failed','pending') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`postedAt` timestamp,
	`engagement` int,
	`reach` int,
	`impressions` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `post_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scheduled_posts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`contentId` int NOT NULL,
	`userId` int NOT NULL,
	`platforms` varchar(500) NOT NULL,
	`scheduledAt` timestamp NOT NULL,
	`status` enum('pending','processing','published','failed','cancelled') NOT NULL DEFAULT 'pending',
	`failureReason` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scheduled_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `content_items` ADD CONSTRAINT `content_items_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_files` ADD CONSTRAINT `media_files_contentId_content_items_id_fk` FOREIGN KEY (`contentId`) REFERENCES `content_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `media_files` ADD CONSTRAINT `media_files_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_history` ADD CONSTRAINT `post_history_scheduledPostId_scheduled_posts_id_fk` FOREIGN KEY (`scheduledPostId`) REFERENCES `scheduled_posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_history` ADD CONSTRAINT `post_history_contentId_content_items_id_fk` FOREIGN KEY (`contentId`) REFERENCES `content_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `post_history` ADD CONSTRAINT `post_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scheduled_posts` ADD CONSTRAINT `scheduled_posts_contentId_content_items_id_fk` FOREIGN KEY (`contentId`) REFERENCES `content_items`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scheduled_posts` ADD CONSTRAINT `scheduled_posts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;