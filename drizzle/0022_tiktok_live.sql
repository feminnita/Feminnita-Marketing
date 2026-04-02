CREATE TABLE `tiktok_lives` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `dataAgendada` timestamp,
  `duracao` int DEFAULT 120,
  `status` enum('rascunho','agendada','ao_vivo','encerrada') NOT NULL DEFAULT 'rascunho',
  `roteiro` text,
  `produtosDestaque` text,
  `metaViewers` int,
  `metaVendas` int,
  `viewersReais` int DEFAULT 0,
  `vendasReais` int DEFAULT 0,
  `receitaGerada` varchar(20) DEFAULT '0',
  `tiktokLiveUrl` text,
  `observacoes` text,
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW()
);
