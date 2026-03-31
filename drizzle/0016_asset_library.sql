-- Migration 0016: Banco de Imagens e Lançamentos de Produtos

CREATE TABLE `asset_library` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `category` enum('produto','lifestyle','modelo','colecao','background','logo','outro') NOT NULL,
  `url` text NOT NULL,
  `thumbnail_url` text,
  `mime_type` varchar(100),
  `file_size` int,
  `tags` json,
  `platform` enum('instagram','tiktok','todos') NOT NULL DEFAULT 'todos',
  `ai_analysis` text,
  `isActive` boolean NOT NULL DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `al_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
  INDEX `al_category_idx` (`category`),
  INDEX `al_platform_idx` (`platform`)
);

CREATE TABLE `product_collections` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text,
  `collection_type` enum('produto','colecao','campanha','temporada') NOT NULL,
  `season` varchar(100),
  `launch_date` timestamp,
  `status` enum('rascunho','ativo','arquivado') NOT NULL DEFAULT 'rascunho',
  `asset_ids` json,
  `briefs_generated` boolean NOT NULL DEFAULT false,
  `content_plan` json,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `pc_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
  INDEX `pc_status_idx` (`status`),
  INDEX `pc_launch_idx` (`launch_date`)
);
