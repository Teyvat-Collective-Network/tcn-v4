DROP INDEX `idx_key_area` ON `speed_metrics`;--> statement-breakpoint
DROP INDEX `idx_area` ON `speed_metrics`;--> statement-breakpoint
CREATE INDEX `idx_duration` ON `speed_metrics` (`duration`);--> statement-breakpoint
CREATE INDEX `idx_key_area` ON `speed_metrics` (`key`,`area`,`duration`);--> statement-breakpoint
CREATE INDEX `idx_area` ON `speed_metrics` (`area`,`duration`);