CREATE TABLE `audit_entry_targets` (
	`target` varchar(20) NOT NULL,
	`ref` int NOT NULL
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actor` varchar(20),
	`type` varchar(32) NOT NULL,
	`guild` varchar(20),
	`data` json NOT NULL,
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `ban_tasks` ADD `autoban` boolean NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_target` ON `audit_entry_targets` (`target`);--> statement-breakpoint
CREATE INDEX `idx_actor_guild_type` ON `audit_logs` (`actor`,`guild`,`type`);--> statement-breakpoint
CREATE INDEX `idx_guild_type` ON `audit_logs` (`guild`,`type`);--> statement-breakpoint
CREATE INDEX `idx_type` ON `audit_logs` (`type`);--> statement-breakpoint
ALTER TABLE `audit_entry_targets` ADD CONSTRAINT `audit_entry_targets_ref_audit_logs_id_fk` FOREIGN KEY (`ref`) REFERENCES `audit_logs`(`id`) ON DELETE cascade ON UPDATE cascade;