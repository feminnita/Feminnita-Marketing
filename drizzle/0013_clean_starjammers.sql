CREATE TABLE `ai_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`systemPrompt` longtext,
	`temperature` decimal(2,2) DEFAULT '0.7',
	`maxTokens` int DEFAULT 500,
	`escalationKeywords` json,
	`autoEscalateAfterMessages` int DEFAULT 5,
	`searchResultsLimit` int DEFAULT 3,
	`minConfidenceScore` decimal(3,2) DEFAULT '0.6',
	`isEnabled` boolean NOT NULL DEFAULT true,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `ai_settings_id` PRIMARY KEY(`id`),
	CONSTRAINT `ai_settings_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `ai_training_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userMessage` longtext NOT NULL,
	`expectedResponse` longtext NOT NULL,
	`category` varchar(100),
	`shouldEscalate` boolean NOT NULL DEFAULT false,
	`escalationReason` varchar(255),
	`relatedProductIds` json,
	`quality` enum('excellent','good','poor'),
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `ai_training_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`whatsappPhoneNumber` varchar(20) NOT NULL,
	`whatsappContactName` varchar(255),
	`userMessage` longtext NOT NULL,
	`aiResponse` longtext,
	`confidence` decimal(3,2),
	`mentionedProducts` json,
	`escalated` boolean NOT NULL DEFAULT false,
	`escalatedAt` datetime,
	`escalatedReason` varchar(255),
	`userFeedback` enum('helpful','not_helpful','escalated'),
	`status` enum('open','closed','escalated','resolved') NOT NULL DEFAULT 'open',
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `conversation_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `escalation_queue` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`conversationHistoryId` int NOT NULL,
	`whatsappPhoneNumber` varchar(20) NOT NULL,
	`whatsappContactName` varchar(255),
	`reason` varchar(255) NOT NULL,
	`priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
	`assignedToAgent` varchar(255),
	`status` enum('waiting','in_progress','resolved','closed') NOT NULL DEFAULT 'waiting',
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
	`startedAt` datetime,
	`resolvedAt` datetime,
	`updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `escalation_queue_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_base` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`contentType` enum('product','faq','policy','promotion','general_info') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` longtext,
	`url` text,
	`category` varchar(100),
	`tags` json,
	`embedding` longtext,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` datetime DEFAULT CURRENT_TIMESTAMP,
	`updatedAt` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `knowledge_base_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ai_settings` ADD CONSTRAINT `ai_settings_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `ai_training_data` ADD CONSTRAINT `ai_training_data_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `conversation_history` ADD CONSTRAINT `conversation_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `escalation_queue` ADD CONSTRAINT `escalation_queue_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `escalation_queue` ADD CONSTRAINT `escalation_queue_convHistoryId_conv_history_id_fk` FOREIGN KEY (`conversationHistoryId`) REFERENCES `conversation_history`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `knowledge_base` ADD CONSTRAINT `knowledge_base_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;