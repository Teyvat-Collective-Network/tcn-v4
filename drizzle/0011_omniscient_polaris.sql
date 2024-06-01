DROP INDEX `idx_key_time` ON `speed_metrics`;--> statement-breakpoint
CREATE INDEX `idx_time` ON `speed_metrics` (`time`);