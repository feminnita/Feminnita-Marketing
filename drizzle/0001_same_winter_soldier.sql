CREATE TABLE `integrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`plataforma` enum('tray','google_drive','meta','email_marketing','instagram','tiktok','facebook','whatsapp','bling') NOT NULL,
	`token` text NOT NULL,
	`isConnected` boolean NOT NULL DEFAULT false,
	`lastValidated` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `integrations_id` PRIMARY KEY(`id`)
);
