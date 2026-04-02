CREATE TABLE `drops` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text,
  `dataLancamento` timestamp NOT NULL,
  `status` enum('rascunho','agendado','ativo','encerrado') NOT NULL DEFAULT 'rascunho',
  `categoria` enum('inverno','verao','natal','dia_das_maes','dia_dos_namorados','black_friday','lancamento','outro') NOT NULL DEFAULT 'lancamento',
  `metaVendas` int,
  `vendasRealizadas` int DEFAULT 0,
  `preListaWhatsapp` int DEFAULT 0,
  `imagemUrl` text,
  `precoMinimo` varchar(20),
  `precoMaximo` varchar(20),
  `ativo` boolean NOT NULL DEFAULT true,
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW()
);
