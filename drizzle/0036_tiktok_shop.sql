CREATE TABLE IF NOT EXISTS `tiktok_shop_evaluations` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `shopId` varchar(50),
  `status` enum('pending','running','done','error') NOT NULL DEFAULT 'pending',
  `rawMetrics` text,
  `analysis` text,
  `recommendations` text,
  `summary` varchar(500),
  `errorMessage` varchar(500),
  `triggeredAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completedAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `tiktok_shop_evaluation_messages` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `evaluationId` int NOT NULL,
  `userId` int NOT NULL,
  `role` enum('user','assistant') NOT NULL,
  `content` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
