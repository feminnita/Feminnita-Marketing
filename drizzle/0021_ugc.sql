CREATE TABLE `ugc_submissions` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `plataforma` enum('instagram','tiktok','whatsapp','twitter','outro') NOT NULL,
  `autorHandle` varchar(255),
  `autorNome` varchar(255),
  `conteudoUrl` text,
  `conteudoTexto` text,
  `thumbnail` text,
  `tipo` enum('foto','video','story','reels','depoimento') NOT NULL DEFAULT 'foto',
  `status` enum('pendente','aprovado','rejeitado','republicado') NOT NULL DEFAULT 'pendente',
  `autorizacaoObtida` boolean NOT NULL DEFAULT false,
  `tags` text,
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW()
);
