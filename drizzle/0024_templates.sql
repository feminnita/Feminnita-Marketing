CREATE TABLE `content_templates` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `nome` varchar(255) NOT NULL,
  `tipo` enum('story','reels','tiktok','ads','email','whatsapp') NOT NULL,
  `descricao` varchar(500),
  `conteudo` text NOT NULL,
  `favorito` boolean NOT NULL DEFAULT false,
  `usos` int NOT NULL DEFAULT 0,
  `tags` varchar(500),
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW()
);
