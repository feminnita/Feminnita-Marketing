-- Migration 0026: Remove Manus OAuth, add email/password auth
-- Replace openId (Manus OAuth identifier) with email as primary unique key
-- Add passwordHash for bcrypt/scrypt hashed passwords

-- Step 1: Make email NOT NULL and unique (if not already)
ALTER TABLE `users`
  MODIFY COLUMN `email` varchar(320) NOT NULL;

-- Add unique constraint on email (may already exist, so ignore error)
ALTER TABLE `users`
  ADD CONSTRAINT `users_email_unique` UNIQUE (`email`);

-- Step 2: Add passwordHash column
ALTER TABLE `users`
  ADD COLUMN `passwordHash` varchar(255) NULL AFTER `email`;

-- Step 3: Drop openId and loginMethod columns
ALTER TABLE `users`
  DROP COLUMN `openId`,
  DROP COLUMN `loginMethod`;
