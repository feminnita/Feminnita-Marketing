-- Migration 0041: Adiciona coluna payload em agent_actions para dados estruturados do agente Playwright
ALTER TABLE `agent_actions`
  ADD COLUMN `payload` json NULL AFTER `actionType`,
  ADD COLUMN `executionLog` text NULL AFTER `userNote`,
  ADD COLUMN `executedAt` timestamp NULL AFTER `executionLog`;
