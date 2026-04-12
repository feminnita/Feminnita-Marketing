-- Migration 0031: Tabela de ações propostas pelos agentes IA (fluxo de confirmação)
CREATE TABLE IF NOT EXISTS `agent_actions` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `agentName` varchar(50) NOT NULL,
  `date` varchar(10) NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `actionType` varchar(50) NOT NULL,
  `priority` enum('alta','media','baixa') NOT NULL DEFAULT 'media',
  `estimatedImpact` text,
  `status` enum('pending','approved','rejected','executing','done') NOT NULL DEFAULT 'pending',
  `userNote` text,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Índices para queries frequentes
CREATE INDEX `idx_agent_actions_status` ON `agent_actions` (`status`);
CREATE INDEX `idx_agent_actions_date` ON `agent_actions` (`date`);
CREATE INDEX `idx_agent_actions_agent` ON `agent_actions` (`agentName`);
