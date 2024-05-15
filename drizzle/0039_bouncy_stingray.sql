CREATE TABLE `files` (
	`uuid` varchar(36) NOT NULL,
	`channel` varchar(20) NOT NULL,
	`message` varchar(20) NOT NULL,
	CONSTRAINT `files_uuid` PRIMARY KEY(`uuid`)
);
--> statement-breakpoint
CREATE TABLE `global_connections` (
	`channel` int NOT NULL,
	`guild` varchar(20) NOT NULL,
	`location` varchar(20) NOT NULL,
	`suspended` boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE `global_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`channel` int NOT NULL,
	`time` bigint NOT NULL,
	`action` enum('block','delete','edit','ban','unban') NOT NULL,
	`actor` varchar(20),
	`target` varchar(20),
	`content` text,
	`after` text,
	`removed_files` json,
	CONSTRAINT `global_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `global_message_instances` ADD `purged` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `global_messages` ADD `deleted` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `global_messages` ADD `time` bigint NOT NULL;--> statement-breakpoint
CREATE INDEX `idx_channel_time` ON `global_logs` (`channel`,`time`);--> statement-breakpoint
CREATE INDEX `idx_filter` ON `global_filter_terms` (`filter`);--> statement-breakpoint
CREATE INDEX `idx_message` ON `global_message_instances` (`message`);--> statement-breakpoint
CREATE INDEX `idx_author` ON `global_messages` (`author`);--> statement-breakpoint
ALTER TABLE `global_channels` DROP COLUMN `logs`;--> statement-breakpoint
ALTER TABLE `global_message_instances` DROP COLUMN `log`;--> statement-breakpoint
ALTER TABLE `global_connections` ADD CONSTRAINT `global_connections_channel_global_channels_id_fk` FOREIGN KEY (`channel`) REFERENCES `global_channels`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `global_logs` ADD CONSTRAINT `global_logs_channel_global_channels_id_fk` FOREIGN KEY (`channel`) REFERENCES `global_channels`(`id`) ON DELETE cascade ON UPDATE cascade;