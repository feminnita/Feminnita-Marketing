CREATE TABLE `afiliadas` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `nome` varchar(255) NOT NULL,
  `email` varchar(320),
  `whatsapp` varchar(20),
  `cidade` varchar(100),
  `estado` varchar(2),
  `linkCode` varchar(32) NOT NULL UNIQUE,
  `comissaoPercent` varchar(10) DEFAULT '10',
  `totalVendas` int DEFAULT 0,
  `totalReceita` varchar(20) DEFAULT '0',
  `status` enum('ativa','inativa','pendente') NOT NULL DEFAULT 'pendente',
  `nivel` enum('bronze','prata','ouro','diamante') NOT NULL DEFAULT 'bronze',
  `observacoes` text,
  `createdAt` timestamp NOT NULL DEFAULT NOW(),
  `updatedAt` timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE `afiliada_cliques` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `afiliadaId` int NOT NULL,
  `origem` varchar(100),
  `ip` varchar(45),
  `createdAt` timestamp NOT NULL DEFAULT NOW()
);

CREATE TABLE `afiliada_vendas` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `afiliadaId` int NOT NULL,
  `userId` int NOT NULL,
  `pedidoId` varchar(100),
  `produto` varchar(255),
  `valor` varchar(20) NOT NULL,
  `comissaoValor` varchar(20) NOT NULL,
  `status` enum('pendente','pago','cancelado') NOT NULL DEFAULT 'pendente',
  `createdAt` timestamp NOT NULL DEFAULT NOW()
);
