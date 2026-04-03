CREATE TABLE `abandonamento_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sequenciaId` int NOT NULL,
	`pedidoId` varchar(100),
	`clienteNome` varchar(255),
	`clienteWhatsapp` varchar(20) NOT NULL,
	`etapaAtual` int DEFAULT 0,
	`status` enum('ativo','convertido','cancelado','concluido') NOT NULL DEFAULT 'ativo',
	`convertidoEm` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `abandonamento_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `abandonamento_sequencias` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`ativo` boolean NOT NULL DEFAULT true,
	`etapa1Horas` int DEFAULT 1,
	`etapa1Mensagem` text,
	`etapa2Horas` int DEFAULT 24,
	`etapa2Mensagem` text,
	`etapa3Horas` int DEFAULT 72,
	`etapa3Mensagem` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `abandonamento_sequencias_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `afiliada_cliques` (
	`id` int AUTO_INCREMENT NOT NULL,
	`afiliadaId` int NOT NULL,
	`origem` varchar(100),
	`ip` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `afiliada_cliques_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `afiliada_vendas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`afiliadaId` int NOT NULL,
	`userId` int NOT NULL,
	`pedidoId` varchar(100),
	`produto` varchar(255),
	`valor` varchar(20) NOT NULL,
	`comissaoValor` varchar(20) NOT NULL,
	`status` enum('pendente','pago','cancelado') NOT NULL DEFAULT 'pendente',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `afiliada_vendas_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `afiliadas` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(320),
	`whatsapp` varchar(20),
	`cidade` varchar(100),
	`estado` varchar(2),
	`linkCode` varchar(32) NOT NULL,
	`comissaoPercent` varchar(10) DEFAULT '10',
	`totalVendas` int DEFAULT 0,
	`totalReceita` varchar(20) DEFAULT '0',
	`status` enum('ativa','inativa','pendente') NOT NULL DEFAULT 'pendente',
	`nivel` enum('bronze','prata','ouro','diamante') NOT NULL DEFAULT 'bronze',
	`observacoes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `afiliadas_id` PRIMARY KEY(`id`),
	CONSTRAINT `afiliadas_linkCode_unique` UNIQUE(`linkCode`)
);
--> statement-breakpoint
CREATE TABLE `asset_library` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`category` enum('produto','lifestyle','modelo','colecao','background','logo','outro') NOT NULL,
	`url` text NOT NULL,
	`thumbnail_url` text,
	`mime_type` varchar(100),
	`file_size` int,
	`tags` json,
	`platform` enum('instagram','tiktok','todos') NOT NULL DEFAULT 'todos',
	`ai_analysis` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `asset_library_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `automations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`tipo` enum('post','mensagem','email','whatsapp') NOT NULL,
	`plataforma` enum('instagram','facebook','tiktok','whatsapp','email') NOT NULL,
	`conteudo` text,
	`agendamento` varchar(255),
	`status` enum('ativo','pausado','agendado') NOT NULL DEFAULT 'agendado',
	`proxima_execucao` timestamp,
	`ultima_execucao` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `automations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `brand_book` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`corPrimaria` varchar(7) DEFAULT '#D97706',
	`corSecundaria` varchar(7) DEFAULT '#F59E0B',
	`corAcento` varchar(7) DEFAULT '#FDE68A',
	`corTexto` varchar(7) DEFAULT '#1E293B',
	`fontePrimaria` varchar(100) DEFAULT 'Inter',
	`fonteSecundaria` varchar(100) DEFAULT 'Playfair Display',
	`tomInstagram` text,
	`tomTikTok` text,
	`tomWhatsApp` text,
	`tomEmail` text,
	`hashtagsOficiais` text,
	`hashtagsProibidas` text,
	`palavrasChave` text,
	`palavrasProibidas` text,
	`propostaValor` text,
	`diferenciais` text,
	`publicoAlvo` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `brand_book_id` PRIMARY KEY(`id`),
	CONSTRAINT `brand_book_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `campaigns` (
	`id` int AUTO_INCREMENT NOT NULL,
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
	`roi` decimal(6,2) DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `campaigns_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `competitor_data` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`competitor_name` varchar(255) NOT NULL,
	`platform` varchar(50) NOT NULL,
	`content_type` varchar(50),
	`estimated_engagement` int,
	`caption_analysis` text,
	`hashtags_used` json,
	`posting_frequency` varchar(100),
	`key_strategies` json,
	`detected_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `competitor_data_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_briefs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`influencer_id` int,
	`brief_type` enum('carousel','reel','story','post','feed') NOT NULL,
	`topic` varchar(500) NOT NULL,
	`target_audience` text,
	`key_messages` json,
	`hashtags` json,
	`call_to_action` varchar(255),
	`generated_content` json,
	`copywriter_notes` text,
	`status` enum('pending','generated','approved','published') NOT NULL DEFAULT 'pending',
	`research_report_id` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_briefs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `content_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`nome` varchar(255) NOT NULL,
	`tipo` enum('story','reels','tiktok','ads','email','whatsapp') NOT NULL,
	`descricao` varchar(500),
	`conteudo` text NOT NULL,
	`favorito` boolean NOT NULL DEFAULT false,
	`usos` int NOT NULL DEFAULT 0,
	`tags` varchar(500),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `content_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cupons` (
	`id` int AUTO_INCREMENT NOT NULL,
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
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cupons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `design_history` (
	`id` int AUTO_INCREMENT NOT NULL,
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
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `design_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `drops` (
	`id` int AUTO_INCREMENT NOT NULL,
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
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `drops_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `marketing_research_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`report_date` date NOT NULL,
	`competitor_insights` json,
	`trending_hashtags` json,
	`content_opportunities` json,
	`audience_insights` text,
	`weekly_strategy` text,
	`recommendations` json,
	`raw_analysis` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `marketing_research_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `product_collections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`collection_type` enum('produto','colecao','campanha','temporada') NOT NULL,
	`season` varchar(100),
	`launch_date` timestamp,
	`status` enum('rascunho','ativo','arquivado') NOT NULL DEFAULT 'rascunho',
	`asset_ids` json,
	`briefs_generated` boolean NOT NULL DEFAULT false,
	`content_plan` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `product_collections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `publication_queue_jobs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`accountId` int NOT NULL,
	`retryCount` int NOT NULL DEFAULT 0,
	`maxRetries` int NOT NULL DEFAULT 5,
	`lastError` text,
	`nextRetryTime` timestamp,
	`status` enum('ready','waiting','processing','failed','done') NOT NULL DEFAULT 'ready',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `publication_queue_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tiktok_lives` (
	`id` int AUTO_INCREMENT NOT NULL,
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
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `tiktok_lives_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `ugc_submissions` (
	`id` int AUTO_INCREMENT NOT NULL,
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
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `ugc_submissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bling_contatos` (
	`id` int NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`nome` varchar(255) NOT NULL,
	`email` varchar(255),
	`telefone` varchar(20),
	`celular` varchar(20),
	`cpf_cnpj` varchar(20),
	`tipo` varchar(50) NOT NULL,
	`endereco` json,
	`data_atualizacao` datetime,
	`sincronizado_em` datetime,
	CONSTRAINT `bling_contatos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bling_credentials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`access_token` text NOT NULL,
	`refresh_token` text,
	`expires_at` datetime NOT NULL,
	`scope` varchar(255),
	`created_at` datetime,
	`updated_at` datetime,
	CONSTRAINT `bling_credentials_id` PRIMARY KEY(`id`),
	CONSTRAINT `bling_credentials_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
CREATE TABLE `bling_estoque` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`produto_id` int NOT NULL,
	`produto_sku` varchar(100) NOT NULL,
	`quantidade` int NOT NULL DEFAULT 0,
	`quantidade_reservada` int NOT NULL DEFAULT 0,
	`quantidade_disponivel` int NOT NULL DEFAULT 0,
	`data_atualizacao` datetime,
	`sincronizado_em` datetime,
	CONSTRAINT `bling_estoque_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bling_pedidos` (
	`id` int NOT NULL,
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
	`sincronizado_em` datetime,
	CONSTRAINT `bling_pedidos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bling_produtos` (
	`id` int NOT NULL,
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
	`sincronizado_em` datetime,
	CONSTRAINT `bling_produtos_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bling_status_sincronizacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` varchar(255) NOT NULL,
	`ultima_sincronizacao` datetime,
	`proxima_sincronizacao` datetime,
	`status_produtos` varchar(50) DEFAULT 'pendente',
	`status_pedidos` varchar(50) DEFAULT 'pendente',
	`status_estoque` varchar(50) DEFAULT 'pendente',
	`status_contatos` varchar(50) DEFAULT 'pendente',
	`erros` json,
	`created_at` datetime,
	`updated_at` datetime,
	CONSTRAINT `bling_status_sincronizacao_id` PRIMARY KEY(`id`),
	CONSTRAINT `bling_status_sincronizacao_user_id_unique` UNIQUE(`user_id`)
);
--> statement-breakpoint
ALTER TABLE `users` RENAME COLUMN `loginMethod` TO `passwordHash`;--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `email` varchar(320) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `passwordHash` varchar(255);--> statement-breakpoint
ALTER TABLE `influencers` ADD `userId` int NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);--> statement-breakpoint
ALTER TABLE `asset_library` ADD CONSTRAINT `asset_library_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `automations` ADD CONSTRAINT `automations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `campaigns` ADD CONSTRAINT `campaigns_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_briefs` ADD CONSTRAINT `content_briefs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `content_briefs` ADD CONSTRAINT `content_briefs_influencer_id_influencers_id_fk` FOREIGN KEY (`influencer_id`) REFERENCES `influencers`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `marketing_research_reports` ADD CONSTRAINT `marketing_research_reports_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `product_collections` ADD CONSTRAINT `product_collections_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `publication_queue_jobs` ADD CONSTRAINT `publication_queue_jobs_postId_influencer_posts_id_fk` FOREIGN KEY (`postId`) REFERENCES `influencer_posts`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `bling_contatos_user_id_idx` ON `bling_contatos` (`user_id`);--> statement-breakpoint
CREATE INDEX `bling_contatos_email_idx` ON `bling_contatos` (`email`);--> statement-breakpoint
CREATE INDEX `bling_credentials_user_id_idx` ON `bling_credentials` (`user_id`);--> statement-breakpoint
CREATE INDEX `bling_estoque_user_id_idx` ON `bling_estoque` (`user_id`);--> statement-breakpoint
CREATE INDEX `bling_estoque_produto_id_idx` ON `bling_estoque` (`produto_id`);--> statement-breakpoint
CREATE INDEX `bling_pedidos_user_id_idx` ON `bling_pedidos` (`user_id`);--> statement-breakpoint
CREATE INDEX `bling_pedidos_numero_idx` ON `bling_pedidos` (`numero`);--> statement-breakpoint
CREATE INDEX `bling_pedidos_status_idx` ON `bling_pedidos` (`status`);--> statement-breakpoint
CREATE INDEX `bling_produtos_user_id_idx` ON `bling_produtos` (`user_id`);--> statement-breakpoint
CREATE INDEX `bling_produtos_sku_idx` ON `bling_produtos` (`sku`);--> statement-breakpoint
CREATE INDEX `bling_status_user_id_idx` ON `bling_status_sincronizacao` (`user_id`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `openId`;