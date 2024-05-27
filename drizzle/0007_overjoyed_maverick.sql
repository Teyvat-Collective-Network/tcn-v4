CREATE TABLE `speed_metrics` (
	`key` varchar(256) NOT NULL,
	`area` varchar(256) NOT NULL,
	`time` bigint NOT NULL,
	`duration` int NOT NULL,
	`errored` boolean NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_key_area` ON `speed_metrics` (`key`,`area`);--> statement-breakpoint
CREATE INDEX `idx_area` ON `speed_metrics` (`area`);