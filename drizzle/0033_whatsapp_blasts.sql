-- Campanhas de Disparo em Massa WhatsApp
CREATE TABLE IF NOT EXISTS `whatsapp_blasts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `userId` INT NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `delaySeconds` INT NOT NULL DEFAULT 8,
  `status` ENUM('draft','running','done','cancelled','error') NOT NULL DEFAULT 'draft',
  `totalContacts` INT NOT NULL DEFAULT 0,
  `sentCount` INT NOT NULL DEFAULT 0,
  `failedCount` INT NOT NULL DEFAULT 0,
  `startedAt` TIMESTAMP NULL,
  `completedAt` TIMESTAMP NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Contatos de cada campanha
CREATE TABLE IF NOT EXISTS `whatsapp_blast_contacts` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `blastId` INT NOT NULL,
  `phoneNumber` VARCHAR(30) NOT NULL,
  `name` VARCHAR(100),
  `status` ENUM('pending','sent','failed') NOT NULL DEFAULT 'pending',
  `sentAt` TIMESTAMP NULL,
  `error` VARCHAR(255),
  INDEX `idx_blast_contacts_blastId` (`blastId`),
  INDEX `idx_blast_contacts_status` (`status`)
);
