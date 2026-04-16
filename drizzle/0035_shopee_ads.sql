CREATE TABLE `shopee_ads_evaluations` (
  `id` int AUTO_INCREMENT NOT NULL,
  `userId` int NOT NULL,
  `shopId` varchar(50),
  `status` enum('pending','running','done','error') NOT NULL DEFAULT 'pending',
  `rawMetrics` text,
  `analysis` text,
  `recommendations` text,
  `summary` varchar(500),
  `errorMessage` varchar(500),
  `triggeredAt` timestamp NOT NULL DEFAULT NOW(),
  `completedAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  CONSTRAINT `shopee_ads_evaluations_id` PRIMARY KEY(`id`)
);

CREATE TABLE `shopee_ads_evaluation_messages` (
  `id` int AUTO_INCREMENT NOT NULL,
  `evaluationId` int NOT NULL,
  `userId` int NOT NULL,
  `role` enum('user','assistant') NOT NULL,
  `content` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  CONSTRAINT `shopee_ads_evaluation_messages_id` PRIMARY KEY(`id`)
);
