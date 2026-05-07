-- Add google_analytics to oauth_tokens plataforma enum
ALTER TABLE `oauth_tokens`
  MODIFY COLUMN `plataforma` ENUM('bling','meta','tiktok','google_drive','google_analytics') NOT NULL;
