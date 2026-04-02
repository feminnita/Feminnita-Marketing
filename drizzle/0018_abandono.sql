CREATE TABLE `abandonamento_sequencias` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `nome` varchar(255) NOT NULL,
  `ativo` boolean NOT NULL DEFAULT true,
  `etapa1Horas` int DEFAULT 1,
  `etapa1Mensagem` text,
  `etapa2Horas` int DEFAULT 24,
  `etapa2Mensagem` text,
  `etapa3Horas` int DEFAULT 72,
  `etapa3Mensagem` text,
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE `abandonamento_logs` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `sequenciaId` int NOT NULL,
  `pedidoId` varchar(100),
  `clienteNome` varchar(255),
  `clienteWhatsapp` varchar(20) NOT NULL,
  `etapaAtual` int DEFAULT 0,
  `status` enum('ativo','convertido','cancelado','concluido') NOT NULL DEFAULT 'ativo',
  `convertidoEm` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW()
);
