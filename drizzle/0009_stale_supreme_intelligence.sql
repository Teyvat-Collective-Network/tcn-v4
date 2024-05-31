CREATE INDEX `idx_status_reminded` ON `network_user_reports` (`status`,`reminded`);--> statement-breakpoint
CREATE INDEX `idx_reminder` ON `polls` (`reminder`);--> statement-breakpoint
CREATE INDEX `idx_deadline` ON `polls` (`deadline`);