ALTER TABLE `network_user_reports` ADD `category` enum('banshare','advisory','hacked') NOT NULL;--> statement-breakpoint
ALTER TABLE `network_user_reports` DROP COLUMN `severity`;