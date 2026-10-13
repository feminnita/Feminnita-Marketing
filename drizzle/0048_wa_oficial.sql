CREATE TABLE IF NOT EXISTS `wa_oficial_config` (
  `userId` int NOT NULL PRIMARY KEY,
  `phone_number_id` varchar(64) NULL,
  `access_token` text NULL,
  `app_secret` varchar(128) NULL,
  `verify_token` varchar(128) NULL,
  `waba_id` varchar(64) NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 0,
  `last_inbound_at` datetime NULL
);
CREATE TABLE IF NOT EXISTS `wa_pausas` (
  `telefone` varchar(20) NOT NULL PRIMARY KEY,
  `pausado_ate` datetime NOT NULL,
  `motivo` varchar(30) NOT NULL,
  `atualizado_em` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
