CREATE TABLE `design_history` (
  `id` int AUTO_INCREMENT PRIMARY KEY NOT NULL,
  `userId` int NOT NULL,
  `designId` varchar(255) NOT NULL,
  `designName` varchar(500) NOT NULL,
  `designType` varchar(100),
  `thumbnailUrl` text,
  `editUrl` text,
  `exportUrl` text,
  `status` enum('draft','exported','published') NOT NULL DEFAULT 'draft',
  `influencerId` int,
  `campaignId` int,
  `notes` text,
  `createdAt` timestamp NOT NULL DEFAULT (now()),
  `updatedAt` timestamp NOT NULL DEFAULT (now())
);
