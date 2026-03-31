-- Migration 0015: Equipe de Marketing com IA

CREATE TABLE `marketing_research_reports` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `report_date` date NOT NULL,
  `competitor_insights` json,
  `trending_hashtags` json,
  `content_opportunities` json,
  `audience_insights` text,
  `weekly_strategy` text,
  `recommendations` json,
  `raw_analysis` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `mrr_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
);

CREATE TABLE `content_briefs` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `influencer_id` int,
  `brief_type` enum('carousel','reel','story','post','feed') NOT NULL,
  `topic` varchar(500) NOT NULL,
  `target_audience` text,
  `key_messages` json,
  `hashtags` json,
  `call_to_action` varchar(255),
  `generated_content` json,
  `copywriter_notes` text,
  `status` enum('pending','generated','approved','published') NOT NULL DEFAULT 'pending',
  `research_report_id` int,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `cb_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`),
  CONSTRAINT `cb_influencer_fk` FOREIGN KEY (`influencer_id`) REFERENCES `influencers`(`id`)
);

CREATE TABLE `competitor_data` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `competitor_name` varchar(255) NOT NULL,
  `platform` varchar(50) NOT NULL,
  `content_type` varchar(50),
  `estimated_engagement` int,
  `caption_analysis` text,
  `hashtags_used` json,
  `posting_frequency` varchar(100),
  `key_strategies` json,
  `detected_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX `cd_userId_idx` (`userId`),
  INDEX `cd_competitor_idx` (`competitor_name`)
);
