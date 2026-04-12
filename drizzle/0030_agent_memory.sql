CREATE TABLE `agent_memory` (
  `id` int AUTO_INCREMENT PRIMARY KEY,
  `agentName` varchar(50) NOT NULL,
  `memoryType` enum('daily_analysis','weekly_summary','monthly_report','business_goals','learning') NOT NULL,
  `period` varchar(20) NOT NULL,
  `content` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT NOW()
);
