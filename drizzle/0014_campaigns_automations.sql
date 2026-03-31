-- Migration 0014: Adicionar tabelas campaigns, automations, publication_queue_jobs e tabelas Bling

CREATE TABLE `campaigns` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `nome` varchar(255) NOT NULL,
  `plataforma` enum('instagram','facebook','tiktok','whatsapp','email') NOT NULL,
  `orcamento` decimal(10,2) NOT NULL,
  `publico_alvo` text,
  `descricao` text,
  `data_inicio` varchar(20),
  `data_fim` varchar(20),
  `status` enum('rascunho','planejamento','ativa','pausada','finalizada') NOT NULL DEFAULT 'rascunho',
  `impressoes` int DEFAULT 0,
  `cliques` int DEFAULT 0,
  `conversoes` int DEFAULT 0,
  `roi` decimal(6,2) DEFAULT 0,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `campaigns_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
);

CREATE TABLE `automations` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `userId` int NOT NULL,
  `nome` varchar(255) NOT NULL,
  `tipo` enum('post','mensagem','email','whatsapp') NOT NULL,
  `plataforma` enum('instagram','facebook','tiktok','whatsapp','email') NOT NULL,
  `conteudo` text,
  `agendamento` varchar(255),
  `status` enum('ativo','pausado','agendado') NOT NULL DEFAULT 'agendado',
  `proxima_execucao` timestamp,
  `ultima_execucao` timestamp,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `automations_userId_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`)
);

CREATE TABLE `publication_queue_jobs` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `postId` int NOT NULL,
  `accountId` int NOT NULL,
  `retryCount` int NOT NULL DEFAULT 0,
  `maxRetries` int NOT NULL DEFAULT 5,
  `lastError` text,
  `nextRetryTime` timestamp,
  `status` enum('ready','waiting','processing','failed','done') NOT NULL DEFAULT 'ready',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `pub_queue_postId_fk` FOREIGN KEY (`postId`) REFERENCES `influencer_posts`(`id`)
);

-- Tabelas Bling (schema-bling.ts)
CREATE TABLE IF NOT EXISTS `bling_credentials` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `user_id` varchar(255) NOT NULL UNIQUE,
  `access_token` text NOT NULL,
  `refresh_token` text,
  `expires_at` datetime NOT NULL,
  `scope` varchar(255),
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `bling_credentials_user_id_idx` (`user_id`)
);

CREATE TABLE IF NOT EXISTS `bling_produtos` (
  `id` int PRIMARY KEY,
  `user_id` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text,
  `sku` varchar(100) NOT NULL,
  `preco` decimal(10,2) NOT NULL,
  `preco_custo` decimal(10,2),
  `estoque` int NOT NULL DEFAULT 0,
  `ativo` boolean NOT NULL DEFAULT true,
  `categoria` varchar(255),
  `peso` decimal(8,3),
  `dimensoes` json,
  `imagens` json,
  `data_atualizacao` datetime,
  `sincronizado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  INDEX `bling_produtos_user_id_idx` (`user_id`),
  INDEX `bling_produtos_sku_idx` (`sku`)
);

CREATE TABLE IF NOT EXISTS `bling_pedidos` (
  `id` int PRIMARY KEY,
  `user_id` varchar(255) NOT NULL,
  `numero` varchar(100) NOT NULL,
  `numero_loja` varchar(100),
  `data_emissao` datetime NOT NULL,
  `data_entrega` datetime,
  `cliente_id` int,
  `cliente_nome` varchar(255),
  `cliente_email` varchar(255),
  `cliente_telefone` varchar(20),
  `total` decimal(12,2) NOT NULL,
  `desconto` decimal(10,2),
  `frete` decimal(10,2),
  `status` varchar(50) NOT NULL,
  `observacoes` text,
  `rastreamento` varchar(255),
  `itens` json,
  `data_atualizacao` datetime,
  `sincronizado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  INDEX `bling_pedidos_user_id_idx` (`user_id`),
  INDEX `bling_pedidos_numero_idx` (`numero`),
  INDEX `bling_pedidos_status_idx` (`status`)
);

CREATE TABLE IF NOT EXISTS `bling_contatos` (
  `id` int PRIMARY KEY,
  `user_id` varchar(255) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255),
  `telefone` varchar(20),
  `celular` varchar(20),
  `cpf_cnpj` varchar(20),
  `tipo` varchar(50) NOT NULL,
  `endereco` json,
  `data_atualizacao` datetime,
  `sincronizado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  INDEX `bling_contatos_user_id_idx` (`user_id`),
  INDEX `bling_contatos_email_idx` (`email`)
);

CREATE TABLE IF NOT EXISTS `bling_estoque` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `user_id` varchar(255) NOT NULL,
  `produto_id` int NOT NULL,
  `produto_sku` varchar(100) NOT NULL,
  `quantidade` int NOT NULL DEFAULT 0,
  `quantidade_reservada` int NOT NULL DEFAULT 0,
  `quantidade_disponivel` int NOT NULL DEFAULT 0,
  `data_atualizacao` datetime,
  `sincronizado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  INDEX `bling_estoque_user_id_idx` (`user_id`),
  INDEX `bling_estoque_produto_id_idx` (`produto_id`)
);

CREATE TABLE IF NOT EXISTS `bling_status_sincronizacao` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `user_id` varchar(255) NOT NULL UNIQUE,
  `ultima_sincronizacao` datetime,
  `proxima_sincronizacao` datetime,
  `status_produtos` varchar(50) DEFAULT 'pendente',
  `status_pedidos` varchar(50) DEFAULT 'pendente',
  `status_estoque` varchar(50) DEFAULT 'pendente',
  `status_contatos` varchar(50) DEFAULT 'pendente',
  `erros` json,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `bling_status_user_id_idx` (`user_id`)
);
