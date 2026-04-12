-- Migration 0032: Tabelas de chat com especialistas IA (Sofia, Beatriz, Clara, Mariana)
CREATE TABLE IF NOT EXISTS `specialist_conversations` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `agentName` varchar(50) NOT NULL,
  `title` varchar(255) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS `specialist_messages` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `conversationId` int NOT NULL,
  `role` enum('user','assistant') NOT NULL,
  `content` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX `idx_spec_conv_user_agent` ON `specialist_conversations` (`userId`, `agentName`);
CREATE INDEX `idx_spec_msg_conv` ON `specialist_messages` (`conversationId`);
