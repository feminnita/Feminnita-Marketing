CREATE TABLE `portal_users` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `email` varchar(320) NOT NULL UNIQUE,
  `passwordHash` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `profileType` enum('revendedora','influencer') NOT NULL,
  `status` enum('pending','approved','blocked') NOT NULL DEFAULT 'pending',
  `instagramHandle` varchar(100),
  `phone` varchar(20),
  `notes` text,
  `approvedBy` int,
  `approvedAt` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE `portal_materials` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `title` varchar(255) NOT NULL,
  `description` text,
  `category` enum('fotos','videos','banners','copy','lookbook','calculadora','links') NOT NULL,
  `filename` varchar(500),
  `url` varchar(1000) NOT NULL,
  `availableTo` enum('revendedora','influencer','ambos') NOT NULL DEFAULT 'ambos',
  `isActive` boolean NOT NULL DEFAULT true,
  `uploadedBy` int NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);
