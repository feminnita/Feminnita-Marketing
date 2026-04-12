-- Migration: Traffic Manager tables
-- Especialista em Tráfego — conversas, mensagens, ações propostas e briefings diários

CREATE TABLE `traffic_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `traffic_conversations_id` PRIMARY KEY(`id`)
);

CREATE TABLE `traffic_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `traffic_messages_id` PRIMARY KEY(`id`)
);

CREATE TABLE `traffic_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`actionType` varchar(100) NOT NULL,
	`payload` text,
	`status` enum('pending','approved','rejected','executed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `traffic_actions_id` PRIMARY KEY(`id`)
);

CREATE TABLE `traffic_daily_briefings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`data` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `traffic_daily_briefings_id` PRIMARY KEY(`id`)
);

-- Índices para performance
CREATE INDEX `traffic_conversations_userId_idx` ON `traffic_conversations` (`userId`);
CREATE INDEX `traffic_messages_conversationId_idx` ON `traffic_messages` (`conversationId`);
CREATE INDEX `traffic_actions_conversationId_idx` ON `traffic_actions` (`conversationId`);
CREATE INDEX `traffic_actions_status_idx` ON `traffic_actions` (`status`);
CREATE INDEX `traffic_daily_briefings_userId_date_idx` ON `traffic_daily_briefings` (`userId`, `date`);
