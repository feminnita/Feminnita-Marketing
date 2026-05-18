-- Adicionar coluna de saldo de créditos em video_plans
ALTER TABLE video_plans
  ADD COLUMN IF NOT EXISTS videoCreditsBalance INT NOT NULL DEFAULT 0;

-- Zerar limites mensais (modelo agora é pré-pago)
UPDATE video_plans SET livreMonthlyLimit = 0, runningUpMonthlyLimit = 0
  WHERE livreMonthlyLimit > 0 OR runningUpMonthlyLimit > 0;

-- Criar tabela de pedidos de crédito
CREATE TABLE IF NOT EXISTS video_credit_orders (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  userId           INT NOT NULL,
  packageId        VARCHAR(50) NOT NULL,
  credits          INT NOT NULL,
  amountBrl        VARCHAR(20) NOT NULL,
  asaasPaymentId   VARCHAR(100),
  asaasPaymentUrl  VARCHAR(500),
  status           ENUM('pending','paid','failed') NOT NULL DEFAULT 'pending',
  createdAt        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  paidAt           TIMESTAMP NULL,
  INDEX idx_userId (userId),
  INDEX idx_asaasPaymentId (asaasPaymentId)
);
