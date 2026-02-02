CREATE TABLE `oauth_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`platform` enum('bling','canva','meta','tiktok','google_drive','whatsapp','email_marketing','tray') NOT NULL,
	`clientId` text,
	`clientSecret` text,
	`accessToken` text,
	`refreshToken` text,
	`expiresAt` timestamp,
	`isConnected` boolean NOT NULL DEFAULT false,
	`lastValidated` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `oauth_credentials_id` PRIMARY KEY(`id`)
);
