CREATE TABLE `network_user_reports` (
	`id` int AUTO_INCREMENT NOT NULL,
	`message` varchar(20) NOT NULL,
	`author` varchar(20) NOT NULL,
	`display` varchar(1024) NOT NULL,
	`usernames` varchar(1024) NOT NULL,
	`reason` varchar(498) NOT NULL,
	`evidence` varchar(1000) NOT NULL,
	`server` varchar(20) NOT NULL,
	`severity` varchar(8) NOT NULL,
	`urgent` boolean NOT NULL,
	`reminded` bigint NOT NULL,
	`status` enum('pending','locked','rejected','published','rescinded') NOT NULL,
	CONSTRAINT `network_user_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `report_crossposts` (
	`ref` int NOT NULL,
	`guild` varchar(20) NOT NULL,
	`channel` varchar(20) NOT NULL,
	`message` varchar(20) NOT NULL,
	`executor` varchar(20),
	CONSTRAINT `report_crossposts_ref_guild_pk` PRIMARY KEY(`ref`,`guild`)
);
--> statement-breakpoint
CREATE TABLE `report_hub_posts` (
	`ref` int NOT NULL,
	`channel` varchar(20) NOT NULL,
	`message` varchar(20) NOT NULL,
	CONSTRAINT `report_hub_posts_ref` PRIMARY KEY(`ref`)
);
--> statement-breakpoint
CREATE TABLE `report_ids` (
	`ref` int NOT NULL,
	`user` varchar(20) NOT NULL,
	CONSTRAINT `report_ids_ref_user_pk` PRIMARY KEY(`ref`,`user`)
);
--> statement-breakpoint
CREATE TABLE `report_settings` (
	`guild` varchar(20) NOT NULL,
	`channel` varchar(20),
	`logs` varchar(20),
	`autoban` boolean NOT NULL DEFAULT false,
	`autokick` boolean NOT NULL DEFAULT false,
	`autoban_member_threshold` bigint NOT NULL DEFAULT 0,
	`receive_banshare` boolean NOT NULL DEFAULT true,
	`receive_advisory` boolean NOT NULL DEFAULT true,
	`receive_hacked` boolean NOT NULL DEFAULT true,
	CONSTRAINT `report_settings_guild` PRIMARY KEY(`guild`)
);
--> statement-breakpoint
CREATE TABLE `report_tasks` (
	`id` int AUTO_INCREMENT NOT NULL,
	`ref` int NOT NULL,
	`guild` varchar(20) NOT NULL,
	`user` varchar(20) NOT NULL,
	`status` enum('pending','skipped','banned','failed','hold') NOT NULL,
	`auto` boolean NOT NULL,
	CONSTRAINT `report_tasks_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_ref_guild_user` UNIQUE(`ref`,`guild`,`user`)
);
--> statement-breakpoint
CREATE TABLE `txts` (
	`uuid` varchar(36) NOT NULL,
	`content` text NOT NULL,
	CONSTRAINT `txts_uuid` PRIMARY KEY(`uuid`)
);
--> statement-breakpoint
CREATE INDEX `idx_message` ON `network_user_reports` (`message`);--> statement-breakpoint
ALTER TABLE `report_crossposts` ADD CONSTRAINT `report_crossposts_ref_network_user_reports_id_fk` FOREIGN KEY (`ref`) REFERENCES `network_user_reports`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `report_crossposts` ADD CONSTRAINT `report_crossposts_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `report_hub_posts` ADD CONSTRAINT `report_hub_posts_ref_network_user_reports_id_fk` FOREIGN KEY (`ref`) REFERENCES `network_user_reports`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `report_ids` ADD CONSTRAINT `report_ids_ref_network_user_reports_id_fk` FOREIGN KEY (`ref`) REFERENCES `network_user_reports`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `report_settings` ADD CONSTRAINT `report_settings_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `report_tasks` ADD CONSTRAINT `report_tasks_ref_network_user_reports_id_fk` FOREIGN KEY (`ref`) REFERENCES `network_user_reports`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `report_tasks` ADD CONSTRAINT `report_tasks_guild_guilds_id_fk` FOREIGN KEY (`guild`) REFERENCES `guilds`(`id`) ON DELETE cascade ON UPDATE cascade;