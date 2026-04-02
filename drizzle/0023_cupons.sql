CREATE TABLE `cupons` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `desconto` varchar(50) NOT NULL,
  `tipo` enum('percentual','valor_fixo','frete_gratis') NOT NULL DEFAULT 'percentual',
  `persona` varchar(100),
  `campanha` varchar(200),
  `usos` int NOT NULL DEFAULT 0,
  `maxUsos` int,
  `ativo` boolean NOT NULL DEFAULT true,
  `dataExpiracao` varchar(20),
  `observacoes` text,
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW()
);
