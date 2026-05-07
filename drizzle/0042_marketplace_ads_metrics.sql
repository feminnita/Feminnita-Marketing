CREATE TABLE `marketplace_ads_metrics` (
  `id` int NOT NULL AUTO_INCREMENT,
  `platform` varchar(20) NOT NULL,
  `account` varchar(20) NOT NULL,
  `campaignId` varchar(100) NOT NULL,
  `campaignName` text,
  `impressions` int DEFAULT 0,
  `clicks` int DEFAULT 0,
  `ctr` decimal(6,3) DEFAULT 0,
  `spend` decimal(10,2) DEFAULT 0,
  `conversions` int DEFAULT 0,
  `roas` decimal(8,2) DEFAULT 0,
  `acos` decimal(6,2) DEFAULT 0,
  `revenue` decimal(10,2) DEFAULT 0,
  `scrapedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_platform_account` (`platform`, `account`),
  KEY `idx_scraped_at` (`scrapedAt`)
);
